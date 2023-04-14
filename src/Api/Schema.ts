import { Api } from './Api';
import { SchemaObject } from '../inputSchema';

export class Schema {
    type = 'void';

    format?: string;

    description?: string;

    title?: string;

    default?: unknown;

    example?: unknown;

    nullable?: boolean;

    deprecated?: boolean;

    multipleOf?: number;

    maximum?: number;

    minimum?: number;

    maxLength?: number;

    minLength?: number;

    pattern?: string;

    maxItems?: number;

    minItems?: number;

    uniqueItems?: boolean;

    maxProperties?: number;

    minProperties?: number;

    required: string[] = [];

    enum: unknown[] = [];

    allOf?: Schema;

    oneOf?: Schema;

    anyOf?: Schema;

    not?: Schema;

    items?: Schema;

    properties?: Record<string, Schema>;

    constructor(
        api: Api,
        input: SchemaObject,
        stack: SchemaObject[] = [],
    ) {
        const safeInput = api.resolveRef(input);

        if (!safeInput) {
            throw new Error('Schema input is not defined');
        }

        if (stack.includes(safeInput)) {
            throw new Error('Cyclic reference detected');
        }

        const newStack = [...stack, safeInput];

        this.type = safeInput.type;
        this.format = safeInput.format;
        this.description = safeInput.description;
        this.title = safeInput.title;
        this.default = safeInput.default;
        this.example = safeInput.example;
        this.nullable = safeInput.nullable;
        this.deprecated = safeInput.deprecated;
        this.example = safeInput.example;
        this.allOf = safeInput.allOf ? new Schema(
            api,
            safeInput.allOf,
            newStack,
        ) : undefined;
        this.oneOf = safeInput.oneOf ? new Schema(
            api,
            safeInput.oneOf,
            newStack,
        ) : undefined;
        this.anyOf = safeInput.anyOf ? new Schema(
            api,
            safeInput.anyOf,
            newStack,
        ) : undefined;
        this.not = safeInput.not ? new Schema(
            api,
            safeInput.not,
            newStack,
        ) : undefined;
        this.items = safeInput.items ? new Schema(
            api,
            safeInput.items,
            newStack,
        ) : undefined;
        this.properties = safeInput.properties ? Object.fromEntries(
            Object.entries(safeInput.properties).map(([key, value]) => [
                key,
                new Schema(api, value, newStack),
            ]),
        ) : undefined;
        this.multipleOf = safeInput.multipleOf;
        this.maximum = safeInput.maximum;
        this.minimum = safeInput.minimum;
        this.maxLength = safeInput.maxLength;
        this.minLength = safeInput.minLength;
        this.pattern = safeInput.pattern;
        this.maxItems = safeInput.maxItems;
        this.minItems = safeInput.minItems;
        this.uniqueItems = safeInput.uniqueItems;
        this.maxProperties = safeInput.maxProperties;
        this.minProperties = safeInput.minProperties;
        this.required = safeInput.required ?? [];
        this.enum = safeInput.enum ?? [];
    }
}