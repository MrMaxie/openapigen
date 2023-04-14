const getSegments = (target: unknown, segments: string[]) => {
    let result = target;
    for (const segment of segments) {
        if (result === undefined) {
            return undefined;
        }
        result = (result as any)[segment];
    }
    return result;
};

const get = (target: unknown, path: string) =>
    getSegments(target, path.split('.'));

const setSegments = (target: unknown, segments: string[], value: unknown) => {
    let pointer = target;

    for (const [i, segment] of segments.map((x, i) => [i, x])) {
        if (i === segments.length - 1) {
            pointer[segment] = value;
            return;
        }

        if (pointer[segment] === undefined) {
            pointer[segment] = {};
        }

        pointer = pointer[segment];
    }
};

const set = (target: unknown, path: string, value: unknown) =>
    setSegments(target, path.split('.'), value);

export const dotUtils = {
    get,
    set,
    getSegments,
    setSegments,
};
