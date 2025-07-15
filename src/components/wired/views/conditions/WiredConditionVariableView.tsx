import { FC, useEffect, useState } from 'react';
import { LocalizeText, WiredFurniParams, WiredFurniType } from '../../../../api';
import { Column, Flex, FormGroup, Text } from '../../../../common';
import { useWired } from '../../../../hooks';
import { WiredConditionBaseView } from './WiredConditionBaseView';

export const WiredConditionVariableView: FC<{}> = props =>
{
    const { trigger = null, intParams = [], setIntParams = null, stringParam = '', setStringParam = null } = useWired();
    const [ variableKey, setVariableKey ] = useState<string>('');
    const [ compareValue, setCompareValue ] = useState<string>('');
    const [ variableType, setVariableType ] = useState<string>('string');
    const [ comparison, setComparison ] = useState<number>(0); // 0 = equals, 1 = not equals, 2 = greater, 3 = less, 4 = greater or equal, 5 = less or equal, 6 = contains

    const save = () =>
    {
        const params = [comparison];
        setIntParams(params);
        
        const stringData = `${variableKey}|${compareValue}|${variableType}`;
        setStringParam(stringData);
    };

    const validate = () =>
    {
        if (!variableKey.trim())
        {
            alert(LocalizeText('wiredfurni.params.variables.key.required', 'Variable key is required'));
            return false;
        }

        if (!compareValue.trim())
        {
            alert(LocalizeText('wiredfurni.params.variables.value.required', 'Compare value is required'));
            return false;
        }

        const validation = WiredFurniParams.validateParamVariable(variableKey, compareValue, variableType);
        if (!validation.valid)
        {
            alert(validation.error);
            return false;
        }

        return true;
    };

    useEffect(() =>
    {
        if (!trigger) return;

        if (intParams.length > 0)
        {
            setComparison(intParams[0] || 0);
        }

        if (stringParam)
        {
            const parts = stringParam.split('|');
            if (parts.length >= 3)
            {
                setVariableKey(parts[0] || '');
                setCompareValue(parts[1] || '');
                setVariableType(parts[2] || 'string');
            }
        }
    }, [trigger, intParams, stringParam]);

    const getComparisonText = (comp: number) =>
    {
        switch (comp)
        {
            case 0: return LocalizeText('wiredfurni.params.variables.comparison.equals', 'Equals');
            case 1: return LocalizeText('wiredfurni.params.variables.comparison.not_equals', 'Not Equals');
            case 2: return LocalizeText('wiredfurni.params.variables.comparison.greater', 'Greater Than');
            case 3: return LocalizeText('wiredfurni.params.variables.comparison.less', 'Less Than');
            case 4: return LocalizeText('wiredfurni.params.variables.comparison.greater_equal', 'Greater or Equal');
            case 5: return LocalizeText('wiredfurni.params.variables.comparison.less_equal', 'Less or Equal');
            case 6: return LocalizeText('wiredfurni.params.variables.comparison.contains', 'Contains');
            default: return 'Equals';
        }
    };

    const getAvailableComparisons = () =>
    {
        const base = [
            { value: 0, text: getComparisonText(0) },
            { value: 1, text: getComparisonText(1) }
        ];

        if (variableType === 'number')
        {
            base.push(
                { value: 2, text: getComparisonText(2) },
                { value: 3, text: getComparisonText(3) },
                { value: 4, text: getComparisonText(4) },
                { value: 5, text: getComparisonText(5) }
            );
        }

        if (variableType === 'string')
        {
            base.push({ value: 6, text: getComparisonText(6) });
        }

        return base;
    };

    return (
        <WiredConditionBaseView requiresFurni={WiredFurniType.STUFF_SELECTION_OPTION_NONE} hasSpecialInput={true} save={save} validate={validate}>
            <Column gap={1}>
                <Text variant="white" bold>
                    {LocalizeText('wiredfurni.params.variables.condition.title', 'Variable Condition')}
                </Text>
                
                <FormGroup>
                    <Text variant="white">
                        {LocalizeText('wiredfurni.params.variables.key', 'Variable Key')}:
                    </Text>
                    <input
                        type="text"
                        className="form-control form-control-sm"
                        value={variableKey}
                        onChange={(e) => setVariableKey(e.target.value)}
                        placeholder={LocalizeText('wiredfurni.params.variables.key.placeholder', 'Enter variable key')}
                    />
                </FormGroup>

                <FormGroup>
                    <Text variant="white">
                        {LocalizeText('wiredfurni.params.variables.type', 'Variable Type')}:
                    </Text>
                    <select
                        className="form-control form-control-sm"
                        value={variableType}
                        onChange={(e) => setVariableType(e.target.value)}
                    >
                        <option value="string">String</option>
                        <option value="number">Number</option>
                        <option value="boolean">Boolean</option>
                    </select>
                </FormGroup>

                <FormGroup>
                    <Text variant="white">
                        {LocalizeText('wiredfurni.params.variables.comparison', 'Comparison')}:
                    </Text>
                    <select
                        className="form-control form-control-sm"
                        value={comparison}
                        onChange={(e) => setComparison(parseInt(e.target.value))}
                    >
                        {getAvailableComparisons().map(comp => (
                            <option key={comp.value} value={comp.value}>{comp.text}</option>
                        ))}
                    </select>
                </FormGroup>

                <FormGroup>
                    <Text variant="white">
                        {LocalizeText('wiredfurni.params.variables.compare_value', 'Compare Value')}:
                    </Text>
                    {variableType === 'boolean' ? (
                        <select
                            className="form-control form-control-sm"
                            value={compareValue}
                            onChange={(e) => setCompareValue(e.target.value)}
                        >
                            <option value="true">True</option>
                            <option value="false">False</option>
                        </select>
                    ) : (
                        <input
                            type={variableType === 'number' ? 'number' : 'text'}
                            className="form-control form-control-sm"
                            value={compareValue}
                            onChange={(e) => setCompareValue(e.target.value)}
                            placeholder={LocalizeText('wiredfurni.params.variables.compare_value.placeholder', 'Enter compare value')}
                        />
                    )}
                </FormGroup>

                {/* Show existing variable info if it exists */}
                {variableKey && WiredFurniParams.hasVariable && WiredFurniParams.hasVariable(variableKey) && (
                    <div className="p-2 border rounded">
                        <Text variant="muted" fontSize={6}>
                            {LocalizeText('wiredfurni.params.variables.existing', 'Existing variable')}:
                        </Text>
                        <Text variant="white" fontSize={6}>
                            {variableKey}: {String(WiredFurniParams.getParamVariable(variableKey)?.value)}
                        </Text>
                    </div>
                )}

                <Text variant="muted" fontSize={6}>
                    {LocalizeText('wiredfurni.params.variables.condition.description', 
                        'This condition will check if the variable meets the specified criteria.')}
                </Text>
            </Column>
        </WiredConditionBaseView>
    );
};