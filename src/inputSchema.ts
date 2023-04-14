import { z } from 'zod';

const Type = z.union([
    z.literal('null'),
    z.literal('array'),
    z.literal('object'),
    z.literal('string'),
    z.literal('number'),
    z.literal('boolean'),
    z.literal('integer'),
]);

const RegexPattern = z
    .string()
    .refine(value => {
        try {
            new RegExp(value);
            return true;
        } catch (e) {
            return false;
        }
    }, 'RegexPattern')
    .transform(value => new RegExp(value));

const ServerVariableObject = z.object({
    default: z.string(),
    enum: z.string().array().optional(),
    description: z.string().optional(),
});

const ServerObject = z.object({
    url: z.string(),
    description: z.string().optional(),
    variables: z.record(ServerVariableObject).optional(),
});

const InfoObject = z.object({
    title: z.string(),
    version: z.string(),
    description: z.string().optional(),
});

const ExternalDocumentationObject = z.object({
    description: z.string().optional(),
    url: z.string(),
});

const DiscriminationObject = z.object({
    propertyName: z.string(),
    mapping: z.record(z.string()).optional(),
});

const SchemaObject = z.lazy(() => ReferenceObject).or(z.lazy(() => RawSchemaObject));

export type SchemaObject = z.infer<typeof SchemaObject>;

const XmlObject = z.object({
    name: z.string().optional(),
    namespace: z.string().optional(),
    prefix: z.string().optional(),
    attribute: z.boolean().default(false),
    wrapped: z.boolean().default(false),
});

const ExampleObject = z.object({
    summary: z.string().optional(),
    description: z.string().optional(),
    value: z.any().optional(),
    externalValue: z.string().optional(),
});

const HeaderObject = z.object({
    description: z.string().optional(),
    required: z.boolean().default(false),
    deprecated: z.boolean().default(false),
    allowEmptyValue: z.boolean().default(false),
});

const EncodingObject = z.object({
    contentType: z.string().optional(),
    headers: z.record(z.lazy(() => z.union([HeaderObject, ReferenceObject]))).optional(),
    style: z.string().optional(),
    explode: z.boolean().default(false),
    allowReserved: z.boolean().default(false),
});

const RawSchemaObject = z.object({
    title: z.string().optional(),
    multipleOf: z.number().gt(0).optional(),
    maximum: z.number().optional(),
    exclusiveMaximum: z.number().optional(),
    minimum: z.number().optional(),
    exclusiveMinimum: z.number().optional(),
    maxLength: z.number().gte(0).optional(),
    minLength: z.number().gte(0).default(0).optional(),
    pattern: z.lazy(() => RegexPattern).optional(),
    maxItems: z.number().gte(0).optional(),
    minItems: z.number().gte(0).default(0).optional(),
    uniqueItems: z.boolean().default(false).optional(),
    maxProperties: z.number().gte(0).optional(),
    minProperties: z.number().gte(0).default(0).optional(),
    required: z.string().array().default([]).optional(),
    enum: z.any().array().min(1).optional(),
    // openapi 3 specific:
    type: z.lazy(() => Type).optional(),
    allOf: z.lazy(() => SchemaObject).array().optional(),
    oneOf: z.lazy(() => SchemaObject).array().optional(),
    anyOf: z.lazy(() => SchemaObject).array().optional(),
    not: z.lazy(() => SchemaObject).optional(),
    items: z.lazy(() => SchemaObject).optional(),
    properties: z.record(z.lazy(() => SchemaObject)).optional(),
    additionalProperties : z.union([
        z.lazy(() => SchemaObject),
        z.boolean(),
    ]).optional(),
    description: z.string().optional(),
    format: z.string().optional(),
    default: z.any().optional(),
    // openapi 3 additional:
    nullable: z.boolean().default(false).optional(),
    discriminator: z.lazy(() => DiscriminationObject).optional(),
    readOnly: z.boolean().default(false).optional(),
    writeOnly: z.boolean().default(false).optional(),
    xml: z.lazy(() => XmlObject).optional(),
    externalDocs: z.lazy(() => ExternalDocumentationObject).optional(),
    example: z.any().optional(),
    deprecated: z.boolean().default(false).optional(),
});

const MediaTypeObject = z.object({
    schema: z.lazy(() => SchemaObject).optional(),
    example: z.any().optional(),
    examples: z.record(z.lazy(() => z.union([ExampleObject, ReferenceObject]))).optional(),
    encoding: z.record(z.lazy(() => EncodingObject)).optional(),
});

const RequestBodyObject = z.object({
    description: z.string().optional(),
    content: z.lazy(() => z.record(MediaTypeObject)),
    required: z.boolean().default(false),
});

const ParameterObject = z.object({
    name: z.string(),
    in: z.union([
        z.literal('query'),
        z.literal('header'),
        z.literal('path'),
        z.literal('cookie'),
    ]),
    description: z.string().optional(),
    required: z.boolean().default(false),
    deprecated: z.boolean().default(false),
    allowEmptyValue: z.boolean().default(false),
    style: z.string().optional(),
    explode: z.boolean().default(false),
    allowReserved: z.boolean().default(false),
    schema: z.lazy(() => SchemaObject).optional(),
    example: z.any().optional(),
    examples: z.record(z.lazy(() => z.union([ExampleObject, ReferenceObject]))).optional(),
});

export type ParameterObject = z.infer<typeof ParameterObject>;

const LinkObject = z.object({
    operationRef: z.string().optional(),
    operationId: z.string().optional(),
    parameters: z.record(z.any()).optional(),
    requestBody: z.any().optional(),
    description: z.string().optional(),
    server: z.lazy(() => ServerObject).optional(),
});

const ResponseObject = z.object({
    description: z.string(),
    headers: z.record(z.lazy(() => z.union([HeaderObject, ReferenceObject]))).optional(),
    content: z.record(z.lazy(() => MediaTypeObject)).optional(),
    links: z.record(z.lazy(() => z.union([LinkObject, ReferenceObject]))).optional(),
});

export type ResponseObject = z.infer<typeof ResponseObject>;

const ResponsesObject = z.union([
    z.record(z.lazy(() => ResponseObject)),
    z.object({
        default: z.lazy(() => z.union([ResponseObject, ReferenceObject])),
    }),
]);

const CallbackObject = z.record(z.lazy(() => PathItemObject));

const SecurityRequirementObject = z.record(z.string().array());

const OperationObject = z.object({
    tags: z.string().array().optional(),
    summary: z.string().optional(),
    description: z.string().optional(),
    externalDocs: z.lazy(() => ExternalDocumentationObject).optional(),
    operationId: z.string().optional(),
    parameters: z.lazy(() => z.union([ParameterObject, ReferenceObject])).array().optional(),
    requestBody: z.lazy(() => z.union([RequestBodyObject, ReferenceObject])).optional(),
    responses: z.lazy(() => ResponsesObject),
    callbacks: z.record(z.lazy(() => z.union([CallbackObject, ReferenceObject]))).optional(),
    deprecated: z.boolean().default(false),
    security: z.lazy(() => SecurityRequirementObject).array().optional(),
    servers: z.lazy(() => ServerObject).array().optional(),
});

export type OperationObject = {
    tags?: string[];
    summary?: string;
    description?: string;
    externalDocs?: z.infer<typeof ExternalDocumentationObject>;
    operationId?: string;
    parameters?: (z.infer<typeof ParameterObject> | z.infer<typeof ReferenceObject>)[];
    requestBody?: z.infer<typeof RequestBodyObject> | z.infer<typeof ReferenceObject>;
    responses: z.infer<typeof ResponsesObject>;
    callbacks?: Record<string, z.infer<typeof CallbackObject> | z.infer<typeof ReferenceObject>>;
    deprecated?: boolean;
    security?: z.infer<typeof SecurityRequirementObject>[];
    servers?: z.infer<typeof ServerObject>[];
};

const RefString = z.string().regex(/^(#|\/)/);

const ReferenceObject = z.object({
    $ref: z.lazy(() => RefString),
});

export type ReferenceObject = z.infer<typeof ReferenceObject>;

const PathItemObject = z.object({
    $ref: z.lazy(() => RefString).optional(),
    summary: z.string().optional(),
    description: z.string().optional(),
    get: z.lazy(() => OperationObject).optional(),
    put: z.lazy(() => OperationObject).optional(),
    post: z.lazy(() => OperationObject).optional(),
    delete: z.lazy(() => OperationObject).optional(),
    options: z.lazy(() => OperationObject).optional(),
    head: z.lazy(() => OperationObject).optional(),
    patch: z.lazy(() => OperationObject).optional(),
    trace: z.lazy(() => OperationObject).optional(),
    servers: z.lazy(() => ServerObject).array().optional(),
    parameters: z.lazy(() => z.union([ParameterObject, ReferenceObject])).array().optional(),
});

export const methods = [
    'get',
    'put',
    'post',
    'delete',
    'options',
    'head',
    'patch',
    'trace',
] as const;

export type Method = typeof methods[number];

export type PathItemObject = z.infer<typeof PathItemObject>;

const OAuthFlowObject = z.object({
    authorizationUrl: z.string().optional(),
    tokenUrl: z.string().optional(),
    refreshUrl: z.string().optional(),
    scopes: z.record(z.string()),
});

const OAuthFlowsObject = z.object({
    implicit: z.lazy(() => OAuthFlowObject).optional(),
    password: z.lazy(() => OAuthFlowObject).optional(),
    clientCredentials: z.lazy(() => OAuthFlowObject).optional(),
    authorizationCode: z.lazy(() => OAuthFlowObject).optional(),
});

const SecuritySchemeObject = z.object({
    type: z.union([
        z.literal('apiKey'),
        z.literal('http'),
        z.literal('oauth2'),
        z.literal('openIdConnect'),
    ]),
    description: z.string().optional(),
    name: z.string(),
    in: z.union([
        z.literal('query'),
        z.literal('header'),
        z.literal('cookie'),
    ]),
    scheme: z.string().optional(),
    bearerFormat: z.string().optional(),
    flows: z.lazy(() => OAuthFlowsObject).optional(),
    openIdConnectUrl: z.string().optional(),
});

const ComponentsObject = z.object({
    schemas: z.record(z.lazy(() => SchemaObject)).optional(),
    responses: z.record(z.lazy(() => z.union([ResponseObject, ReferenceObject]))).optional(),
    parameters: z.record(z.lazy(() => z.union([ParameterObject, ReferenceObject]))).optional(),
    examples: z.record(z.lazy(() => z.union([ExampleObject, ReferenceObject]))).optional(),
    requestBodies: z.record(z.lazy(() => z.union([RequestBodyObject, ReferenceObject]))).optional(),
    headers: z.record(z.lazy(() => z.union([HeaderObject, ReferenceObject]))).optional(),
    securitySchemes: z.record(z.lazy(() => z.union([SecuritySchemeObject, ReferenceObject]))).optional(),
    links: z.record(z.lazy(() => z.union([LinkObject, ReferenceObject]))).optional(),
    callbacks: z.record(z.lazy(() => z.union([CallbackObject, ReferenceObject]))).optional(),
});

const TagObject = z.object({
    name: z.string(),
    description: z.string().optional(),
    externalDocs: z.lazy(() => ExternalDocumentationObject).optional(),
});

const OpenApiSpec = z.object({
    openapi: z.string().startsWith('3.'),
    info: InfoObject,
    servers: ServerObject.array().optional(),
    paths: z.record(PathItemObject),
    components: z.lazy(() => ComponentsObject).optional(),
    security: z.lazy(() => SecurityRequirementObject).array().optional(),
    tags: z.lazy(() => TagObject).array().optional(),
    externalDocs: z.lazy(() => ExternalDocumentationObject).optional(),
});

export const parseOpenApiSpec = async (spec: unknown) => {
    return await OpenApiSpec.parseAsync(spec);
};

export type OpenApiSpec = z.infer<typeof OpenApiSpec>;
