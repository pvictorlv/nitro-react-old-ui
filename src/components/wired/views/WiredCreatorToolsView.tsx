import { FC, useState, useEffect } from 'react';
import { LocalizeText, WiredCreatorTools, WiredCreatorToolsConfig } from '../../../api';
import { Button, Column, Flex, Text, FormGroup } from '../../../common';

interface WiredCreatorToolsViewProps
{
    onClose: () => void;
}

export const WiredCreatorToolsView: FC<WiredCreatorToolsViewProps> = props =>
{
    const { onClose } = props;
    const [config, setConfig] = useState<WiredCreatorToolsConfig>(WiredCreatorTools.getConfig());
    const [templates, setTemplates] = useState(new Map());
    const [newTemplateName, setNewTemplateName] = useState('');
    const [selectedTemplate, setSelectedTemplate] = useState('');
    const [history, setHistory] = useState<any[]>([]);

    useEffect(() =>
    {
        loadData();
        WiredCreatorTools.initialize();
    }, []);

    const loadData = () =>
    {
        setConfig(WiredCreatorTools.getConfig());
        setTemplates(WiredCreatorTools.getAllTemplates());
        setHistory(WiredCreatorTools.getHistory());
    };

    const handleConfigChange = (key: keyof WiredCreatorToolsConfig, value: any) =>
    {
        const newConfig = { ...config, [key]: value };
        setConfig(newConfig);
        WiredCreatorTools.updateConfig({ [key]: value });
    };

    const handleSaveTemplate = () =>
    {
        if (!newTemplateName.trim()) return;

        // This would typically save the current wired configuration as a template
        const templateData = {
            name: newTemplateName,
            config: config,
            timestamp: Date.now()
        };

        WiredCreatorTools.saveTemplate(newTemplateName, templateData);
        setNewTemplateName('');
        loadData();
    };

    const handleLoadTemplate = () =>
    {
        if (!selectedTemplate) return;

        const template = WiredCreatorTools.getTemplate(selectedTemplate);
        if (template && template.config)
        {
            setConfig(template.config);
            WiredCreatorTools.updateConfig(template.config);
        }
    };

    const handleDeleteTemplate = () =>
    {
        if (!selectedTemplate) return;

        if (confirm(LocalizeText('wiredcreatortools.template.delete.confirm', 'Are you sure you want to delete this template?')))
        {
            WiredCreatorTools.deleteTemplate(selectedTemplate);
            setSelectedTemplate('');
            loadData();
        }
    };

    const handleExportConfig = () =>
    {
        const exportData = WiredCreatorTools.exportConfiguration();
        const blob = new Blob([exportData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'wired-creator-tools-config.json';
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleImportConfig = (event: React.ChangeEvent<HTMLInputElement>) =>
    {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) =>
        {
            try
            {
                const data = e.target?.result as string;
                if (WiredCreatorTools.importConfiguration(data))
                {
                    loadData();
                    alert('Configuration imported successfully!');
                }
                else
                {
                    alert('Failed to import configuration!');
                }
            }
            catch (error)
            {
                alert('Invalid file format!');
            }
        };
        reader.readAsText(file);
    };

    const handleUndo = () =>
    {
        const action = WiredCreatorTools.undo();
        if (action)
        {
            // Handle undo action
            console.log('Undo action:', action);
            loadData();
        }
    };

    const handleRedo = () =>
    {
        const action = WiredCreatorTools.redo();
        if (action)
        {
            // Handle redo action
            console.log('Redo action:', action);
            loadData();
        }
    };

    return (
        <Column gap={2}>
            <Flex alignItems="center" justifyContent="between">
                <Text variant="white" bold>
                    {LocalizeText('wiredcreatortools.title', 'Wired Creator Tools')}
                </Text>
                <Button variant="dark" onClick={onClose}>
                    {LocalizeText('close', 'Close')}
                </Button>
            </Flex>

            <hr className="m-0 bg-dark" />

            {/* Configuration Settings */}
            <Column gap={1}>
                <Text variant="white" bold>
                    {LocalizeText('wiredcreatortools.settings', 'Settings')}
                </Text>

                <FormGroup>
                    <label className="form-check">
                        <input
                            type="checkbox"
                            className="form-check-input"
                            checked={config.enableAdvancedMode}
                            onChange={(e) => handleConfigChange('enableAdvancedMode', e.target.checked)}
                        />
                        <span className="form-check-label text-white">
                            {LocalizeText('wiredcreatortools.advanced_mode', 'Enable Advanced Mode')}
                        </span>
                    </label>
                </FormGroup>

                <FormGroup>
                    <label className="form-check">
                        <input
                            type="checkbox"
                            className="form-check-input"
                            checked={config.showVariables}
                            onChange={(e) => handleConfigChange('showVariables', e.target.checked)}
                        />
                        <span className="form-check-label text-white">
                            {LocalizeText('wiredcreatortools.show_variables', 'Show Variables')}
                        </span>
                    </label>
                </FormGroup>

                <FormGroup>
                    <label className="form-check">
                        <input
                            type="checkbox"
                            className="form-check-input"
                            checked={config.showDebugInfo}
                            onChange={(e) => handleConfigChange('showDebugInfo', e.target.checked)}
                        />
                        <span className="form-check-label text-white">
                            {LocalizeText('wiredcreatortools.show_debug', 'Show Debug Info')}
                        </span>
                    </label>
                </FormGroup>

                <FormGroup>
                    <label className="form-check">
                        <input
                            type="checkbox"
                            className="form-check-input"
                            checked={config.autoSave}
                            onChange={(e) => handleConfigChange('autoSave', e.target.checked)}
                        />
                        <span className="form-check-label text-white">
                            {LocalizeText('wiredcreatortools.auto_save', 'Auto Save')}
                        </span>
                    </label>
                </FormGroup>

                <FormGroup>
                    <label className="form-check">
                        <input
                            type="checkbox"
                            className="form-check-input"
                            checked={config.gridSnap}
                            onChange={(e) => handleConfigChange('gridSnap', e.target.checked)}
                        />
                        <span className="form-check-label text-white">
                            {LocalizeText('wiredcreatortools.grid_snap', 'Grid Snap')}
                        </span>
                    </label>
                </FormGroup>

                {config.gridSnap && (
                    <FormGroup>
                        <Text variant="white">
                            {LocalizeText('wiredcreatortools.grid_size', 'Grid Size')}: {config.gridSize}px
                        </Text>
                        <input
                            type="range"
                            className="form-range"
                            min="16"
                            max="64"
                            step="8"
                            value={config.gridSize}
                            onChange={(e) => handleConfigChange('gridSize', parseInt(e.target.value))}
                        />
                    </FormGroup>
                )}
            </Column>

            <hr className="m-0 bg-dark" />

            {/* Templates */}
            <Column gap={1}>
                <Text variant="white" bold>
                    {LocalizeText('wiredcreatortools.templates', 'Templates')}
                </Text>

                <Flex gap={1}>
                    <input
                        type="text"
                        className="form-control form-control-sm"
                        placeholder={LocalizeText('wiredcreatortools.template.name', 'Template name')}
                        value={newTemplateName}
                        onChange={(e) => setNewTemplateName(e.target.value)}
                    />
                    <Button variant="success" size="sm" onClick={handleSaveTemplate}>
                        {LocalizeText('wiredcreatortools.template.save', 'Save')}
                    </Button>
                </Flex>

                {templates.size > 0 && (
                    <Flex gap={1}>
                        <select
                            className="form-control form-control-sm"
                            value={selectedTemplate}
                            onChange={(e) => setSelectedTemplate(e.target.value)}
                        >
                            <option value="">
                                {LocalizeText('wiredcreatortools.template.select', 'Select template')}
                            </option>
                            {Array.from(templates.keys()).map(name => (
                                <option key={name} value={name}>{name}</option>
                            ))}
                        </select>
                        <Button variant="primary" size="sm" onClick={handleLoadTemplate} disabled={!selectedTemplate}>
                            {LocalizeText('wiredcreatortools.template.load', 'Load')}
                        </Button>
                        <Button variant="danger" size="sm" onClick={handleDeleteTemplate} disabled={!selectedTemplate}>
                            {LocalizeText('wiredcreatortools.template.delete', 'Delete')}
                        </Button>
                    </Flex>
                )}
            </Column>

            <hr className="m-0 bg-dark" />

            {/* History/Undo-Redo */}
            <Column gap={1}>
                <Text variant="white" bold>
                    {LocalizeText('wiredcreatortools.history', 'History')}
                </Text>

                <Flex gap={1}>
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={handleUndo}
                        disabled={!WiredCreatorTools.canUndo()}
                    >
                        {LocalizeText('wiredcreatortools.undo', 'Undo')}
                    </Button>
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={handleRedo}
                        disabled={!WiredCreatorTools.canRedo()}
                    >
                        {LocalizeText('wiredcreatortools.redo', 'Redo')}
                    </Button>
                    <Button
                        variant="warning"
                        size="sm"
                        onClick={() => {
                            if (confirm(LocalizeText('wiredcreatortools.history.clear.confirm', 'Clear history?')))
                            {
                                WiredCreatorTools.clearHistory();
                                loadData();
                            }
                        }}
                    >
                        {LocalizeText('wiredcreatortools.history.clear', 'Clear History')}
                    </Button>
                </Flex>

                {history.length > 0 && (
                    <div style={{ maxHeight: '150px', overflowY: 'auto' }}>
                        {history.slice(-10).map((action, index) => (
                            <div key={index} className="p-1 border-bottom">
                                <Text variant="muted" fontSize={6}>
                                    {new Date(action.timestamp).toLocaleTimeString()}: {action.type || 'Action'}
                                </Text>
                            </div>
                        ))}
                    </div>
                )}
            </Column>

            <hr className="m-0 bg-dark" />

            {/* Import/Export */}
            <Flex gap={1}>
                <Button variant="secondary" onClick={handleExportConfig}>
                    {LocalizeText('wiredcreatortools.export', 'Export Config')}
                </Button>
                <label className="btn btn-secondary btn-sm">
                    {LocalizeText('wiredcreatortools.import', 'Import Config')}
                    <input
                        type="file"
                        accept=".json"
                        style={{ display: 'none' }}
                        onChange={handleImportConfig}
                    />
                </label>
            </Flex>
        </Column>
    );
};