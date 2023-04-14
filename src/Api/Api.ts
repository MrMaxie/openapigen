import Converter from 'swagger2openapi';
import { OpenApiSpec, parseOpenApiSpec, ReferenceObject } from '../inputSchema';
import { Path } from './Path';

export class Api {
    paths: Path[] = [];

    constructor(
        public readonly json: OpenApiSpec,
    ) {
        this.paths = Object.entries(json.paths ?? {})
            .map(([path, pathItem]) => new Path(this, path, pathItem));
    }

    getPathsByLevel = (level: number) => {
        return this.paths
            .filter(path => path.staticSegmentsAsText.length === level);
    };

    getRootSegments = () => {
        const segments = new Set<string>();

        this.paths.forEach(path => {
            if (path.segments.length > 0) {
                segments.add(path.segments[0].text);
            }
        });

        return Array.from(segments);
    };

    getPathsStartingWith = (segments: string[]) => {
        return this.paths
            .filter(path => path.startsWithSegments(segments));
    };

    getSegmentsAtNextLevel = (segments: string[]) => {
        const nextSegments = new Set<string>();

        this.paths
            .filter(path => path.startsWithSegments(segments))
            .forEach(path => {
                const nextSegment = path.segments[segments.length];

                if (nextSegment) {
                    nextSegments.add(nextSegment.text);
                }
            });

        return Array.from(nextSegments);
    };

    getPathBySegments = (segments: string[]) => {
        return this.paths.find(path => path.equalStaticSegments(segments));
    };

    getStaticSegmentsAtNextLevel = (segments: string[]) => {
        const nextSegments = new Set<string>();

        this.paths
            .filter(path => path.startsWithSegments(segments))
            .forEach(path => {
                const nextSegment = path.segments[segments.length];

                if (nextSegment && !nextSegment.isParameter) {
                    nextSegments.add(nextSegment.text);
                }
            });

        return Array.from(nextSegments);
    };

    resolveRef = <T extends Record<string, unknown>>(ref: T | ReferenceObject): T => {
        const stack: unknown[] = [];

        const innerResolveRef = (ref: T | ReferenceObject): T => {
            const $ref = ref?.$ref as string;

            if (!$ref) {
                return ref as T;
            }

            const refPath = $ref.split('/').slice(1);

            if (stack.includes(refPath)) {
                throw new Error('Cyclic reference detected');
            }

            stack.push(refPath);

            let refObj = this.json;

            refPath.forEach(path => {
                refObj = refObj[path];
            });

            return innerResolveRef(refObj as T | ReferenceObject);
        }

        return innerResolveRef(ref);
    };

    static load = async (json: unknown) => {
        if (typeof json !== 'object' || json === null) {
            throw new TypeError('"json" have to be valid object type');
        }

        let safeInput = {
            openapi: json as unknown,
        };

        try {
            safeInput = await Converter.convertObj(json as any, {
                anchors: false,
                patch: true,
                targetVersion: '3.0.0',
            });
        } catch (e) {
            throw new TypeError('"json" have to be valid Swagger 2.0 or OpenAPI 3.x');
        }

        const parsedInput = await parseOpenApiSpec(safeInput.openapi);

        return new Api(parsedInput);
    };
}
