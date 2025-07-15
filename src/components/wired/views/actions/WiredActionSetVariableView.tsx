import { FC, useEffect, useState } from 'react';
import { LocalizeText, WiredFurniParams, WiredFurniType } from '../../../../api';
import { Column, Flex, FormGroup, Text } from '../../../../common';
import { useWired } from '../../../../hooks';
import { WiredActionBaseView } from './WiredActionBaseView';

export const WiredActionSetVariableView: FC<{}> = props =>
{
    const { trigger = null, intParams = [], setIntParams = null, stringParam = '', setStringParam = null } = useWired();
    const [ variableKey, setVariableKey ] = useState<string>('');
    const [ variableValue, setVariableValue ] = useState<string>('');
    const [ variableType, setVariableType ] = useState<string>('string');
    const [ operation, setOperation ] = useState<number>(0); // 0 = set, 1 = add, 2 = subtract, 3 = multiply, 4 = divide

    const save = () =>
    {
        const params = [operation];
        setIntParams(params);
        
        const stringData = `${variableKey}|${variableValue}|${variableType}`;
        setStringParam(stringData);
    };

    const validate = () =>
    {
        if (!variableKey.trim())
        {
            alert(LocalizeText('wiredfurni.params.variables.key.required', 'Variable key is required'));
            return false;
        }

        if (!variableValue.trim())
        {
            alert(LocalizeText('wiredfurni.params.variables.value.required', 'Variable value is required'));
            return false;
        }

        const validation = WiredFurniParams.validateParamVariable(variableKey, variableValue, variableType);
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
            setOperation(intParams[0] || 0);
        }

        if (stringParam)
        {
            const parts = stringParam.split('|');
            if (parts.length >= 3)
            {
                setVariableKey(parts[0] || '');
                setVariableValue(parts[1] || '');
                setVariableType(parts[2] || 'string');
            }
        }
    }, [trigger, intParams, stringParam]);

    const getOperationText = (op: number) =>
    {
        switch (op)
        {
            case 0: return LocalizeText('wiredfurni.params.variables.operation.set', 'Set');
            case 1: return LocalizeText('wiredfurni.params.variables.operation.add', 'Add');
            case 2: return LocalizeText('wiredfurni.params.variables.operation.subtract', 'Subtract');
            case 3: return LocalizeText('wiredfurni.params.variables.operation.multiply', 'Multiply');
            case 4: return LocalizeText('wiredfurni.params.variables.operation.divide', 'Divide');
            default: return 'Set';
        }
    };

    return (
        <WiredActionBaseView requiresFurni={WiredFurniType.STUFF_SELECTION_OPTION_NONE} hasSpecialInput={true} save={save} validate={validate}>
            <Column gap={1}>
                <Text variant="white" bold>
                    {LocalizeText('wiredfurni.params.variables.action.title', 'Set Variable')}
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
                        {LocalizeText('wiredfurni.params.variables.operation', 'Operation')}:
                    </Text>
                    <select
                        className="form-control form-control-sm"
                        value={operation}
                        onChange={(e) => setOperation(parseInt(e.target.value))}
                    >
                        <option value={0}>{getOperationText(0)}</option>
                        {variableType === 'number' && (
                            <>
                                <option value={1}>{getOperationText(1)}</option>
                                <option value={2}>{getOperationText(2)}</option>
                                <option value={3}>{getOperationText(3)}</option>
                                <option value={4}>{getOperationText(4)}</option>
                            </>
                        )}
                    </select>
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
                        {LocalizeText('wiredfurni.params.variables.value', 'Value')}:
                    </Text>
                    {variableType === 'boolean' ? (
                        <select
                            className="form-control form-control-sm"
                            value={variableValue}
                            onChange={(e) => setVariableValue(e.target.value)}
                        >
                            <option value="true">True</option>
                            <option value="false">False</option>
                        </select>
                    ) : (
                        <input
                            type={variableType === 'number' ? 'number' : 'text'}
                            className="form-control form-control-sm"
                            value={variableValue}
                            onChange={(e) => setVariableValue(e.target.value)}
                            placeholder={LocalizeText('wiredfurni.params.variables.value.placeholder', 'Enter value')}
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
                    {LocalizeText('wiredfurni.params.variables.action.description', 
                        'This action will modify the specified variable when triggered.')}
                </Text>
            </Column>
        </WiredActionBaseView>
    );
};