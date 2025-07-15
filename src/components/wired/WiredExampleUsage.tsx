import { FC, useEffect } from 'react';
import { WiredCreatorTools, WiredFurniParams, WiredVariableManager } from '../../api';

/**
 * This is an example component showing how to use the new Wired functionality.
 * This component demonstrates the usage of:
 * - WiredVariableManager for managing variables
 * - WiredFurniParams for parameter variables with availability
 * - WiredCreatorTools for advanced creator tools
 */
export const WiredExampleUsage: FC = () =>
{
    useEffect(() =>
    {
        // Initialize the creator tools
        WiredCreatorTools.initialize();

        // Example: Setting up some variables
        setupExampleVariables();

        // Example: Configuring creator tools
        setupCreatorTools();

        // Example: Working with templates
        setupExampleTemplates();

    }, []);

    const setupExampleVariables = () =>
    {
        // Set up some example variables with different types
        WiredFurniParams.setParamVariable('player_score', 100, 'number', true, 'Current player score');
        WiredFurniParams.setParamVariable('game_active', true, 'boolean', true, 'Whether the game is currently active');
        WiredFurniParams.setParamVariable('player_name', 'Guest', 'string', true, 'Current player name');
        WiredFurniParams.setParamVariable('game_settings', { difficulty: 'normal', time_limit: 300 }, 'object', true, 'Game configuration settings');

        // Set some variables as unavailable
        WiredFurniParams.setParamVariable('admin_mode', false, 'boolean', false, 'Admin mode (restricted)');

        // Example of using WiredVariableManager directly
        WiredVariableManager.setVariable('temp_value', 'temporary');
        WiredVariableManager.setVariableAvailability('temp_value', false);

        console.log('Available variables:', WiredFurniParams.getAvailableParamVariables());
    };

    const setupCreatorTools = () =>
    {
        // Configure creator tools
        WiredCreatorTools.updateConfig({
            enableAdvancedMode: true,
            showVariables: true,
            showDebugInfo: false,
            autoSave: true,
            gridSnap: true,
            gridSize: 32
        });

        // Add some actions to history
        WiredCreatorTools.addToHistory({
            type: 'variable_set',
            variable: 'player_score',
            oldValue: 0,
            newValue: 100
        });

        WiredCreatorTools.addToHistory({
            type: 'furni_moved',
            furniId: 12345,
            oldPosition: { x: 10, y: 10 },
            newPosition: { x: 15, y: 15 }
        });
    };

    const setupExampleTemplates = () =>
    {
        // Save some example templates
        const scoreSystemTemplate = {
            name: 'Score System',
            description: 'Basic score tracking system',
            variables: [
                { key: 'player_score', value: 0, type: 'number' },
                { key: 'high_score', value: 0, type: 'number' }
            ],
            actions: [
                { type: 'set_variable', variable: 'player_score', operation: 'add', value: 10 }
            ],
            conditions: [
                { type: 'variable_condition', variable: 'player_score', comparison: 'greater', value: 100 }
            ]
        };

        WiredCreatorTools.saveTemplate('score_system', scoreSystemTemplate);

        const gameStateTemplate = {
            name: 'Game State Manager',
            description: 'Manages game state transitions',
            variables: [
                { key: 'game_active', value: false, type: 'boolean' },
                { key: 'game_phase', value: 'waiting', type: 'string' }
            ]
        };

        WiredCreatorTools.saveTemplate('game_state', gameStateTemplate);
    };

    // Example functions that would be called by wired actions/conditions
    const handleVariableChange = (key: string, newValue: any) =>
    {
        const variable = WiredFurniParams.getParamVariable(key);
        if (variable && variable.availability)
        {
            const validation = WiredFurniParams.validateParamVariable(key, newValue, variable.type);
            if (validation.valid)
            {
                WiredFurniParams.setParamVariable(key, newValue, variable.type, true, variable.description);
                
                // Add to history
                WiredCreatorTools.addToHistory({
                    type: 'variable_changed',
                    variable: key,
                    oldValue: variable.value,
                    newValue: newValue
                });

                console.log(`Variable ${key} changed from ${variable.value} to ${newValue}`);
            }
            else
            {
                console.error(`Invalid value for variable ${key}:`, validation.error);
            }
        }
    };

    const handleVariableConditionCheck = (key: string, comparison: number, compareValue: any): boolean =>
    {
        const variable = WiredFurniParams.getParamVariable(key);
        if (!variable || !variable.availability)
        {
            return false;
        }

        const currentValue = variable.value;
        const convertedCompareValue = WiredFurniParams.convertValueToType(compareValue, variable.type);

        switch (comparison)
        {
            case 0: // equals
                return currentValue === convertedCompareValue;
            case 1: // not equals
                return currentValue !== convertedCompareValue;
            case 2: // greater than
                return variable.type === 'number' && currentValue > convertedCompareValue;
            case 3: // less than
                return variable.type === 'number' && currentValue < convertedCompareValue;
            case 4: // greater or equal
                return variable.type === 'number' && currentValue >= convertedCompareValue;
            case 5: // less or equal
                return variable.type === 'number' && currentValue <= convertedCompareValue;
            case 6: // contains
                return variable.type === 'string' && String(currentValue).includes(String(convertedCompareValue));
            default:
                return false;
        }
    };

    // Example of exporting/importing configuration
    const exportConfiguration = () =>
    {
        const config = WiredCreatorTools.exportConfiguration();
        console.log('Exported configuration:', config);
        
        // In a real application, you might save this to a file or send to server
        localStorage.setItem('wired_backup', config);
    };

    const importConfiguration = () =>
    {
        const config = localStorage.getItem('wired_backup');
        if (config)
        {
            const success = WiredCreatorTools.importConfiguration(config);
            console.log('Import result:', success);
        }
    };

    // This component doesn't render anything - it's just for demonstration
    return null;
};

// Example of how to integrate with existing wired system
export const WiredIntegrationExample = {
    // This would be called when a wired action is triggered
    executeSetVariableAction: (params: number[], stringParam: string) =>
    {
        const [operation] = params;
        const [variableKey, variableValue, variableType] = stringParam.split('|');

        const currentVariable = WiredFurniParams.getParamVariable(variableKey);
        let newValue = WiredFurniParams.convertValueToType(variableValue, variableType);

        if (currentVariable && variableType === 'number' && operation > 0)
        {
            const currentValue = Number(currentVariable.value);
            switch (operation)
            {
                case 1: // add
                    newValue = currentValue + Number(newValue);
                    break;
                case 2: // subtract
                    newValue = currentValue - Number(newValue);
                    break;
                case 3: // multiply
                    newValue = currentValue * Number(newValue);
                    break;
                case 4: // divide
                    newValue = Number(newValue) !== 0 ? currentValue / Number(newValue) : currentValue;
                    break;
            }
        }

        WiredFurniParams.setParamVariable(variableKey, newValue, variableType, true);
        console.log(`Set variable ${variableKey} to ${newValue}`);
    },

    // This would be called when a wired condition is checked
    checkVariableCondition: (params: number[], stringParam: string): boolean =>
    {
        const [comparison] = params;
        const [variableKey, compareValue, variableType] = stringParam.split('|');

        const variable = WiredFurniParams.getParamVariable(variableKey);
        if (!variable || !variable.availability)
        {
            return false;
        }

        const currentValue = variable.value;
        const convertedCompareValue = WiredFurniParams.convertValueToType(compareValue, variableType);

        switch (comparison)
        {
            case 0: return currentValue === convertedCompareValue;
            case 1: return currentValue !== convertedCompareValue;
            case 2: return variableType === 'number' && currentValue > convertedCompareValue;
            case 3: return variableType === 'number' && currentValue < convertedCompareValue;
            case 4: return variableType === 'number' && currentValue >= convertedCompareValue;
            case 5: return variableType === 'number' && currentValue <= convertedCompareValue;
            case 6: return variableType === 'string' && String(currentValue).includes(String(convertedCompareValue));
            default: return false;
        }
    }
};