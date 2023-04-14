import { dotUtils } from '../dotUtils';
import { ResponseObject } from '../inputSchema';
import { Operation } from './Operation';
import { Schema } from './Schema';

export class Response {
    schema?: Schema;

    constructor(
        public readonly operation: Operation,
        public readonly status: number,
        public readonly isDefault: boolean,
        public readonly mimeType: string,
        public readonly input: ResponseObject,
    ) {
        const unsafeInput = dotUtils.getSegments(input, ['content', mimeType, 'schema']);

        if (unsafeInput) {
            const safeInput = this.operation.path.api.resolveRef(unsafeInput);


            if (safeInput && Object.keys(safeInput).length > 0) {
                this.schema = new Schema(operation.path.api, safeInput);
            }
        }
    }
}