import { Path } from './Path';

export class PathSegment {
    constructor(
        public readonly parent: Path,
        public readonly text: string,
    ) {}

    get path() {
        return this.path;
    }

    get api() {
        return this.parent.api;
    }

    get isParameter() {
        return this.text.startsWith('{') && this.text.endsWith('}');
    }

    get parameterName() {
        return this.text.slice(1, -1);
    }

    get isLast() {
        return this.parent.segments[this.parent.segments.length - 1] === this;
    }
}
