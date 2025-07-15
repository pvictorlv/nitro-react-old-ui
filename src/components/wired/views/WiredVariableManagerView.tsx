import { FC, useState, useEffect } from 'react';
import { LocalizeText, WiredFurniParams, WiredVariableManager } from '../../../api';
import { Button, Column, Flex, Text, FormGroup } from '../../../common';

interface WiredVariableManagerViewProps
{
    onClose: () => void;
}

export const WiredVariableManagerView: FC<WiredVariableManagerViewProps> = props =>
{
    const { onClose } = props;
    const [variables, setVariables] = useState(new Map());
    const [newVarKey, setNewVarKey] = useState('');
    const [newVarValue, setNewVarValue] = useState('');
    const [newVarType, setNewVarType] = useState('string');
    const [newVarDescription, setNewVarDescription] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedType, setSelectedType] = useState('all');

    useEffect(() =>
    {
        loadVariables();
    }, []);

    const loadVariables = () =>
    {
        setVariables(WiredFurniParams.getAllParamVariables());
    };

    const handleAddVariable = () =>
    {
        if (!newVarKey.trim()) return;

        const validation = WiredFurniParams.validateParamVariable(newVarKey, newVarValue, newVarType);
        if (!validation.valid)
        {
            alert(validation.error);
            return;
        }

        const convertedValue = WiredFurniParams.convertValueToType(newVarValue, newVarType);
        WiredFurniParams.setParamVariable(newVarKey, convertedValue, newVarType, true, newVarDescription);
        
        setNewVarKey('');
        setNewVarValue('');
        setNewVarDescription('');
        loadVariables();
    };

    const handleRemoveVariable = (key: string) =>
    {
        WiredFurniParams.removeParamVariable(key);
        loadVariables();
    };

    const handleToggleAvailability = (key: string) =>
    {
        const variable = WiredFurniParams.getParamVariable(key);
        if (variable)
        {
            WiredFurniParams.updateParamVariableAvailability(key, !variable.availability);
            loadVariables();
        }
    };

    const handleExport = () =>
    {
        const exportData = WiredFurniParams.exportParamVariables();
        const blob = new Blob([exportData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'wired-variables.json';
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleImport = (event: React.ChangeEvent<HTMLInputElement>) =>
    {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) =>
        {
            try
            {
                const data = e.target?.result as string;
                if (WiredFurniParams.importParamVariables(data))
                {
                    loadVariables();
                    alert('Variables imported successfully!');
                }
                else
                {
                    alert('Failed to import variables!');
                }
            }
            catch (error)
            {
                alert('Invalid file format!');
            }
        };
        reader.readAsText(file);
    };

    const getFilteredVariables = () =>
    {
        let filtered = new Map(variables);

        if (searchQuery)
        {
            filtered = WiredFurniParams.searchVariables(searchQuery);
        }

        if (selectedType !== 'all')
        {
            const typeFiltered = new Map();
            for (const [key, variable] of filtered.entries())
            {
                if ((variable as any).type === selectedType)
                {
                    typeFiltered.set(key, variable);
                }
            }
            filtered = typeFiltered;
        }

        return filtered;
    };

    const filteredVariables = getFilteredVariables();

    return (
        <Column gap={2}>
            <Flex alignItems="center" justifyContent="between">
                <Text variant="white" bold>
                    {LocalizeText('wiredfurni.params.variables.title', 'Variable Manager')}
                </Text>
                <Button variant="dark" onClick={onClose}>
                    {LocalizeText('close', 'Close')}
                </Button>
            </Flex>

            <hr className="m-0 bg-dark" />

            {/* Add New Variable */}
            <Column gap={1}>
                <Text variant="white" bold>
                    {LocalizeText('wiredfurni.params.variables.add', 'Add Variable')}
                </Text>
                
                <FormGroup>
                    <Flex gap={1}>
                        <input
                            type="text"
                            className="form-control form-control-sm"
                            placeholder={LocalizeText('wiredfurni.params.variables.key', 'Variable Key')}
                            value={newVarKey}
                            onChange={(e) => setNewVarKey(e.target.value)}
                        />
                        <select
                            className="form-control form-control-sm"
                            value={newVarType}
                            onChange={(e) => setNewVarType(e.target.value)}
                        >
                            <option value="string">String</option>
                            <option value="number">Number</option>
                            <option value="boolean">Boolean</option>
                            <option value="object">Object</option>
                        </select>
                    </Flex>
                </FormGroup>

                <FormGroup>
                    <input
                        type="text"
                        className="form-control form-control-sm"
                        placeholder={LocalizeText('wiredfurni.params.variables.value', 'Value')}
                        value={newVarValue}
                        onChange={(e) => setNewVarValue(e.target.value)}
                    />
                </FormGroup>

                <FormGroup>
                    <input
                        type="text"
                        className="form-control form-control-sm"
                        placeholder={LocalizeText('wiredfurni.params.variables.description', 'Description (optional)')}
                        value={newVarDescription}
                        onChange={(e) => setNewVarDescription(e.target.value)}
                    />
                </FormGroup>

                <Button variant="success" onClick={handleAddVariable}>
                    {LocalizeText('wiredfurni.params.variables.add.button', 'Add Variable')}
                </Button>
            </Column>

            <hr className="m-0 bg-dark" />

            {/* Search and Filter */}
            <Flex gap={1}>
                <input
                    type="text"
                    className="form-control form-control-sm"
                    placeholder={LocalizeText('wiredfurni.params.variables.search', 'Search variables...')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                <select
                    className="form-control form-control-sm"
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                >
                    <option value="all">All Types</option>
                    <option value="string">String</option>
                    <option value="number">Number</option>
                    <option value="boolean">Boolean</option>
                    <option value="object">Object</option>
                </select>
            </Flex>

            {/* Import/Export */}
            <Flex gap={1}>
                <Button variant="secondary" onClick={handleExport}>
                    {LocalizeText('wiredfurni.params.variables.export', 'Export')}
                </Button>
                <label className="btn btn-secondary btn-sm">
                    {LocalizeText('wiredfurni.params.variables.import', 'Import')}
                    <input
                        type="file"
                        accept=".json"
                        style={{ display: 'none' }}
                        onChange={handleImport}
                    />
                </label>
                <Button variant="danger" onClick={() => {
                    if (confirm(LocalizeText('wiredfurni.params.variables.clear.confirm', 'Are you sure you want to clear all variables?')))
                    {
                        WiredFurniParams.clearParamVariables();
                        loadVariables();
                    }
                }}>
                    {LocalizeText('wiredfurni.params.variables.clear', 'Clear All')}
                </Button>
            </Flex>

            <hr className="m-0 bg-dark" />

            {/* Variables List */}
            <Column gap={1} style={{ maxHeight: '300px', overflowY: 'auto' }}>
                <Text variant="white" bold>
                    {LocalizeText('wiredfurni.params.variables.list', 'Variables')} ({filteredVariables.size})
                </Text>
                
                {filteredVariables.size === 0 ? (
                    <Text variant="muted">
                        {LocalizeText('wiredfurni.params.variables.empty', 'No variables found')}
                    </Text>
                ) : (
                    Array.from(filteredVariables.entries()).map(([key, variable]) => (
                        <div key={key} className="p-2 border rounded">
                            <Flex alignItems="center" justifyContent="between">
                                <Column gap={0}>
                                    <Flex alignItems="center" gap={1}>
                                        <Text variant="white" bold>{key}</Text>
                                        <span className={`badge badge-${(variable as any).type === 'string' ? 'primary' : 
                                            (variable as any).type === 'number' ? 'success' : 
                                            (variable as any).type === 'boolean' ? 'warning' : 'info'}`}>
                                            {(variable as any).type}
                                        </span>
                                        <span className={`badge badge-${(variable as any).availability ? 'success' : 'secondary'}`}>
                                            {(variable as any).availability ? 'Available' : 'Unavailable'}
                                        </span>
                                    </Flex>
                                    <Text variant="muted" fontSize={6}>
                                        Value: {String((variable as any).value)}
                                    </Text>
                                    {(variable as any).description && (
                                        <Text variant="muted" fontSize={6}>
                                            {(variable as any).description}
                                        </Text>
                                    )}
                                </Column>
                                <Flex gap={1}>
                                    <Button
                                        variant={(variable as any).availability ? 'warning' : 'success'}
                                        size="sm"
                                        onClick={() => handleToggleAvailability(key)}
                                    >
                                        {(variable as any).availability ? 'Disable' : 'Enable'}
                                    </Button>
                                    <Button
                                        variant="danger"
                                        size="sm"
                                        onClick={() => handleRemoveVariable(key)}
                                    >
                                        Remove
                                    </Button>
                                </Flex>
                            </Flex>
                        </div>
                    ))
                )}
            </Column>
        </Column>
    );
};