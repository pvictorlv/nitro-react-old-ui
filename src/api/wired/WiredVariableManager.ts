export class WiredVariableManager
{
    private static _variables: Map<string, any> = new Map();
    private static _availability: Map<string, boolean> = new Map();

    public static setVariable(key: string, value: any): void
    {
        this._variables.set(key, value);
        this._availability.set(key, true);
    }

    public static getVariable(key: string): any
    {
        return this._variables.get(key);
    }

    public static hasVariable(key: string): boolean
    {
        return this._variables.has(key);
    }

    public static isVariableAvailable(key: string): boolean
    {
        return this._availability.get(key) || false;
    }

    public static setVariableAvailability(key: string, available: boolean): void
    {
        this._availability.set(key, available);
    }

    public static getAllVariables(): Map<string, any>
    {
        return new Map(this._variables);
    }

    public static getAvailableVariables(): Map<string, any>
    {
        const available = new Map<string, any>();
        
        for (const [key, value] of this._variables.entries())
        {
            if (this.isVariableAvailable(key))
            {
                available.set(key, value);
            }
        }
        
        return available;
    }

    public static removeVariable(key: string): void
    {
        this._variables.delete(key);
        this._availability.delete(key);
    }

    public static clearVariables(): void
    {
        this._variables.clear();
        this._availability.clear();
    }

    public static getVariableKeys(): string[]
    {
        return Array.from(this._variables.keys());
    }

    public static getAvailableVariableKeys(): string[]
    {
        return Array.from(this._variables.keys()).filter(key => this.isVariableAvailable(key));
    }
}