import { ParameterObject, ReferenceObject } from '../inputSchema';
import { Operation } from './Operation';
import { Schema } from './Schema';

export class Param {
    name = 'ref';

    schema?: Schema;

    in = '';

    constructor(
        public readonly operation: Operation,
        input: ParameterObject | ReferenceObject,
    ) {
        const realInput = this.operation.path.api.resolveRef(input);

        this.name = realInput.name;
        this.in = realInput.in;

        if (realInput.schema) {
            this.schema = new Schema(this.operation.path.api, realInput.schema);
        }
    }
}