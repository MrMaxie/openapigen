import { Method, OperationObject } from '../inputSchema';
import { Param } from './Param';
import { Response } from './Response';
import { Path } from './Path';

export class Operation {
    params: Param[] = [];

    responses: Response[] = [];

    constructor(
        public readonly path: Path,
        public readonly method: Method,
        input: OperationObject,
    ) {
        for (const param of input.parameters) {
            this.params.push(new Param(this, param));
        }

        for (const [status, response] of Object.entries(input.responses)) {
            const safeInput = this.path.api.resolveRef(response);

            for (const mimeType of Object.keys(safeInput?.content ?? {})) {
                this.responses.push(new Response(
                    this,
                    status === 'default' ? 0 : parseInt(status, 10),
                    status === 'default',
                    mimeType,
                    safeInput,
                ));
            }
        }
    }

    getResponseByStatus = (status: number) => {
        const found = this.responses.find(response => response.status === status);

        if (found) {
            return found;
        }

        return this.responses.find(response => response.isDefault);
    };
}