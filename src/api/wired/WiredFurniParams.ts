import { WiredVariableManager } from './WiredVariableManager';

export interface WiredFurniParamVariable
{
    key: string;
    value: any;
    type: 'string' | 'number' | 'boolean' | 'object';
    availability: boolean;
    description?: string;
}

export class WiredFurniParams
{
    public static readonly PARAM_TYPES = {
        STRING: 'string',
        NUMBER: 'number',
        BOOLEAN: 'boolean',
        OBJECT: 'object'
    } as const;

    private static _paramVariables: Map<string, WiredFurniParamVariable> = new Map();

    public static setParamVariable(key: string, value: any, type: string = 'string', availability: boolean = true, description?: string): void
    {
        const variable: WiredFurniParamVariable = {
            key,
            value,
            type: type as any,
            availability,
            description
        };

        this._paramVariables.set(key, variable);
        WiredVariableManager.setVariable(key, value);
        WiredVariableManager.setVariableAvailability(key, availability);
    }

    public static getParamVariable(key: string): WiredFurniParamVariable | undefined
    {
        return this._paramVariables.get(key);
    }

    public static getAllParamVariables(): Map<string, WiredFurniParamVariable>
    {
        return new Map(this._paramVariables);
    }

    public static getAvailableParamVariables(): Map<string, WiredFurniParamVariable>
    {
        const available = new Map<string, WiredFurniParamVariable>();
        
        for (const [key, variable] of this._paramVariables.entries())
        {
            if (variable.availability)
            {
                available.set(key, variable);
            }
        }
        
        return available;
    }

    public static updateParamVariableAvailability(key: string, availability: boolean): void
    {
        const variable = this._paramVariables.get(key);
        if (variable)
        {
            variable.availability = availability;
            WiredVariableManager.setVariableAvailability(key, availability);
        }
    }

    public static removeParamVariable(key: string): boolean
    {
        const removed = this._paramVariables.delete(key);
        if (removed)
        {
            WiredVariableManager.removeVariable(key);
        }
        return removed;
    }

    public static clearParamVariables(): void
    {
        this._paramVariables.clear();
        WiredVariableManager.clearVariables();
    }

    public static validateParamVariable(key: string, value: any, type: string): { valid: boolean; error?: string }
    {
        switch (type)
        {
            case this.PARAM_TYPES.STRING:
                if (typeof value !== 'string')
                {
                    return { valid: false, error: `Variable ${key} must be a string` };
                }
                break;

            case this.PARAM_TYPES.NUMBER:
                if (typeof value !== 'number' || isNaN(value))
                {
                    return { valid: false, error: `Variable ${key} must be a valid number` };
                }
                break;

            case this.PARAM_TYPES.BOOLEAN:
                if (typeof value !== 'boolean')
                {
                    return { valid: false, error: `Variable ${key} must be a boolean` };
                }
                break;

            case this.PARAM_TYPES.OBJECT:
                if (typeof value !== 'object' || value === null)
                {
                    return { valid: false, error: `Variable ${key} must be an object` };
                }
                break;

            default:
                return { valid: false, error: `Unknown variable type: ${type}` };
        }

        return { valid: true };
    }

    public static convertValueToType(value: any, type: string): any
    {
        switch (type)
        {
            case this.PARAM_TYPES.STRING:
                return String(value);

            case this.PARAM_TYPES.NUMBER:
                const num = Number(value);
                return isNaN(num) ? 0 : num;

            case this.PARAM_TYPES.BOOLEAN:
                if (typeof value === 'boolean') return value;
                if (typeof value === 'string') return value.toLowerCase() === 'true';
                return Boolean(value);

            case this.PARAM_TYPES.OBJECT:
                if (typeof value === 'object') return value;
                try
                {
                    return JSON.parse(String(value));
                }
                catch
                {
                    return {};
                }

            default:
                return value;
        }
    }

    public static exportParamVariables(): string
    {
        const exportData = {
            variables: Object.fromEntries(this._paramVariables),
            timestamp: Date.now()
        };

        return JSON.stringify(exportData, null, 2);
    }

    public static importParamVariables(data: string): boolean
    {
        try
        {
            const importData = JSON.parse(data);
            
            if (importData.variables)
            {
                this.clearParamVariables();
                
                for (const [key, variable] of Object.entries(importData.variables as Record<string, WiredFurniParamVariable>))
                {
                    this.setParamVariable(
                        variable.key,
                        variable.value,
                        variable.type,
                        variable.availability,
                        variable.description
                    );
                }
            }

            return true;
        }
        catch (error)
        {
            console.error('Failed to import param variables:', error);
            return false;
        }
    }

    public static getVariablesByType(type: string): Map<string, WiredFurniParamVariable>
    {
        const filtered = new Map<string, WiredFurniParamVariable>();
        
        for (const [key, variable] of this._paramVariables.entries())
        {
            if (variable.type === type)
            {
                filtered.set(key, variable);
            }
        }
        
        return filtered;
    }

    public static searchVariables(query: string): Map<string, WiredFurniParamVariable>
    {
        const results = new Map<string, WiredFurniParamVariable>();
        const lowerQuery = query.toLowerCase();
        
        for (const [key, variable] of this._paramVariables.entries())
        {
            if (key.toLowerCase().includes(lowerQuery) || 
                (variable.description && variable.description.toLowerCase().includes(lowerQuery)))
            {
                results.set(key, variable);
            }
        }
        
        return results;
    }
}