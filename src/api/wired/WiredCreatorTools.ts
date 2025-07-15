import { WiredVariableManager } from './WiredVariableManager';

export interface WiredCreatorToolsConfig
{
    enableAdvancedMode: boolean;
    showVariables: boolean;
    showDebugInfo: boolean;
    autoSave: boolean;
    gridSnap: boolean;
    gridSize: number;
}

export class WiredCreatorTools
{
    private static _config: WiredCreatorToolsConfig = {
        enableAdvancedMode: false,
        showVariables: true,
        showDebugInfo: false,
        autoSave: true,
        gridSnap: false,
        gridSize: 32
    };

    private static _templates: Map<string, any> = new Map();
    private static _history: any[] = [];
    private static _historyIndex: number = -1;
    private static _maxHistorySize: number = 50;

    public static getConfig(): WiredCreatorToolsConfig
    {
        return { ...this._config };
    }

    public static updateConfig(config: Partial<WiredCreatorToolsConfig>): void
    {
        this._config = { ...this._config, ...config };
        this.saveConfigToStorage();
    }

    public static loadConfigFromStorage(): void
    {
        try
        {
            const stored = localStorage.getItem('wired-creator-tools-config');
            if (stored)
            {
                const config = JSON.parse(stored);
                this._config = { ...this._config, ...config };
            }
        }
        catch (error)
        {
            console.warn('Failed to load wired creator tools config:', error);
        }
    }

    private static saveConfigToStorage(): void
    {
        try
        {
            localStorage.setItem('wired-creator-tools-config', JSON.stringify(this._config));
        }
        catch (error)
        {
            console.warn('Failed to save wired creator tools config:', error);
        }
    }

    public static saveTemplate(name: string, template: any): void
    {
        this._templates.set(name, template);
        this.saveTemplatesToStorage();
    }

    public static getTemplate(name: string): any
    {
        return this._templates.get(name);
    }

    public static getAllTemplates(): Map<string, any>
    {
        return new Map(this._templates);
    }

    public static deleteTemplate(name: string): boolean
    {
        const deleted = this._templates.delete(name);
        if (deleted)
        {
            this.saveTemplatesToStorage();
        }
        return deleted;
    }

    private static saveTemplatesToStorage(): void
    {
        try
        {
            const templates = Object.fromEntries(this._templates);
            localStorage.setItem('wired-creator-tools-templates', JSON.stringify(templates));
        }
        catch (error)
        {
            console.warn('Failed to save wired creator tools templates:', error);
        }
    }

    public static loadTemplatesFromStorage(): void
    {
        try
        {
            const stored = localStorage.getItem('wired-creator-tools-templates');
            if (stored)
            {
                const templates = JSON.parse(stored);
                this._templates = new Map(Object.entries(templates));
            }
        }
        catch (error)
        {
            console.warn('Failed to load wired creator tools templates:', error);
        }
    }

    public static addToHistory(action: any): void
    {
        // Remove any actions after current index (when undoing and then doing new action)
        this._history = this._history.slice(0, this._historyIndex + 1);
        
        // Add new action
        this._history.push({
            ...action,
            timestamp: Date.now()
        });

        // Limit history size
        if (this._history.length > this._maxHistorySize)
        {
            this._history.shift();
        }
        else
        {
            this._historyIndex++;
        }
    }

    public static canUndo(): boolean
    {
        return this._historyIndex >= 0;
    }

    public static canRedo(): boolean
    {
        return this._historyIndex < this._history.length - 1;
    }

    public static undo(): any | null
    {
        if (this.canUndo())
        {
            const action = this._history[this._historyIndex];
            this._historyIndex--;
            return action;
        }
        return null;
    }

    public static redo(): any | null
    {
        if (this.canRedo())
        {
            this._historyIndex++;
            const action = this._history[this._historyIndex];
            return action;
        }
        return null;
    }

    public static clearHistory(): void
    {
        this._history = [];
        this._historyIndex = -1;
    }

    public static getHistory(): any[]
    {
        return [...this._history];
    }

    public static exportConfiguration(): string
    {
        const exportData = {
            config: this._config,
            templates: Object.fromEntries(this._templates),
            variables: Object.fromEntries(WiredVariableManager.getAllVariables()),
            timestamp: Date.now()
        };

        return JSON.stringify(exportData, null, 2);
    }

    public static importConfiguration(data: string): boolean
    {
        try
        {
            const importData = JSON.parse(data);
            
            if (importData.config)
            {
                this._config = { ...this._config, ...importData.config };
                this.saveConfigToStorage();
            }

            if (importData.templates)
            {
                this._templates = new Map(Object.entries(importData.templates));
                this.saveTemplatesToStorage();
            }

            if (importData.variables)
            {
                WiredVariableManager.clearVariables();
                for (const [key, value] of Object.entries(importData.variables))
                {
                    WiredVariableManager.setVariable(key, value);
                }
            }

            return true;
        }
        catch (error)
        {
            console.error('Failed to import configuration:', error);
            return false;
        }
    }

    public static initialize(): void
    {
        this.loadConfigFromStorage();
        this.loadTemplatesFromStorage();
    }

    public static validateWiredConfiguration(config: any): { valid: boolean; errors: string[] }
    {
        const errors: string[] = [];

        if (!config)
        {
            errors.push('Configuration is required');
            return { valid: false, errors };
        }

        // Add validation logic here based on your wired system requirements
        if (config.intParams && !Array.isArray(config.intParams))
        {
            errors.push('intParams must be an array');
        }

        if (config.stringParam && typeof config.stringParam !== 'string')
        {
            errors.push('stringParam must be a string');
        }

        if (config.furniIds && !Array.isArray(config.furniIds))
        {
            errors.push('furniIds must be an array');
        }

        if (config.actionDelay && (typeof config.actionDelay !== 'number' || config.actionDelay < 0))
        {
            errors.push('actionDelay must be a non-negative number');
        }

        return { valid: errors.length === 0, errors };
    }
}