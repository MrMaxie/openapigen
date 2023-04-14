import { PathItemObject, methods } from '../inputSchema';
import type { Api } from './Api';
import { Operation } from './Operation';
import { PathSegment } from './PathSegment';

export class Path {
    segments: PathSegment[] = [];

    staticPath = '';

    operations: Operation[] = [];

    constructor(
        public readonly api: Api,
        public readonly path: string,
        input: PathItemObject,
    ) {
        this.segments = path.split('/')
            .filter(segment => segment.length > 0)
            .map(segment => new PathSegment(this, segment));

        this.staticPath = this.segments
            .filter(segment => !segment.isParameter)
            .map(segment => segment.text)
            .join('/');

        for (const method of methods) {
            if (input[method]) {
                this.operations.push(new Operation(this, method, input[method]));
            }
        }
    }

    get segmentsAsText() {
        return this.segments.map(segment => segment.text);
    }

    get staticSegmentsAsText() {
        return this.segments.filter(segment => !segment.isParameter).map(segment => segment.text);
    }

    equalStatic = (path: Path) => {
        if (this.staticSegmentsAsText.length !== path.staticSegmentsAsText.length) {
            return false;
        }

        for (let i = 0; i < this.staticSegmentsAsText.length; i++) {
            if (this.staticSegmentsAsText[i] !== path.staticSegmentsAsText[i]) {
                return false;
            }
        }

        return true;
    };

    startsWith = (path: Path) => {
        if (this.segments.length < path.segments.length) {
            return false;
        }

        for (let i = 0; i < path.segments.length; i++) {
            if (this.segments[i].text !== path.segments[i].text) {
                return false;
            }
        }

        return true;
    };

    equalStaticSegments = (segments: string[]) => {
        if (this.staticSegmentsAsText.length !== segments.length) {
            return false;
        }

        for (let i = 0; i < this.staticSegmentsAsText.length; i++) {
            if (this.staticSegmentsAsText[i] !== segments[i]) {
                return false;
            }
        }

        return true;
    };

    startsWithSegments = (segments: string[]) => {
        if (this.segments.length < segments.length) {
            return false;
        }

        for (let i = 0; i < segments.length; i++) {
            if (this.segments[i].text !== segments[i]) {
                return false;
            }
        }

        return true;
    };

    findNested = () => {
        for (const path of this.api.paths) {
            if (path.startsWith(this)) {
                return path;
            }
        }

        return null;
    };
}