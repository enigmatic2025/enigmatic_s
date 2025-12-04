export function generateSchema(json: any): any {
    if (json === null) {
        return { type: 'null' };
    }

    if (Array.isArray(json)) {
        const itemsSchema = json.length > 0 ? generateSchema(json[0]) : {};
        return {
            type: 'array',
            items: itemsSchema,
        };
    }

    if (typeof json === 'object') {
        const properties: Record<string, any> = {};
        const required: string[] = [];

        for (const key in json) {
            if (Object.prototype.hasOwnProperty.call(json, key)) {
                properties[key] = generateSchema(json[key]);
                required.push(key);
            }
        }

        return {
            type: 'object',
            properties,
            // required, // Optional: decide if we want to enforce all fields as required
        };
    }

    if (typeof json === 'string') {
        return { type: 'string' };
    }

    if (typeof json === 'number') {
        return { type: 'number' };
    }

    if (typeof json === 'boolean') {
        return { type: 'boolean' };
    }

    return { type: 'string' }; // Fallback
}
