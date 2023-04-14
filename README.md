# OApiCodeGen

This package provides an easy and efficient way to generate code for various programming languages from OpenAPI specifications (both OpenAPI 2 and OpenAPI 3 are supported).

## Features

- Language-agnostic code generation for various programming languages, including TypeScript, JavaScript, Python, and more
- Generate client libraries for RESTful APIs
- Type-safe code generation
- Supports both OpenAPI 2 (Swagger) and OpenAPI 3

## Installation

```sh
npm install --save-dev oapicodegen
```

## Usage

First, import the package in one of your files:

```ts
import { Api } from 'oapicodegen';
```

First of all create context object for future needs:

```ts
/* Example data loading:
const openapiJson = await fs.readFile('openapi3.json', 'utf8');
const openapi = JSON.parse(openapiJson);
*/

const api = await Api.load(openapi);
```

You can get different result depending on the next steps.

## Useful examples

### Search for all operations with `get` method

```ts
const operations = api
    .paths
    .flatMap((path) => path.operations)
    .filter((operation) => operation.method === 'get');
```

### Find elements by segments of path

```ts
const operations = api
    .getPathBySegments(['pets', 'findByStatus'])
    .operations; // operations of /pets/findByStatus path
```

### Find all child elements of a given element

```ts
const operations = api
    .getStaticSegmentsAtNextLevel(['pets', 'findByStatus'])
    .operations; // operations of /pets/findByStatus/* paths
```

### Find response by status code

```ts
const response = api
    .getPathBySegments(['pets', 'findByStatus'])
    .operations[0]
    .getResponseByStatus(200); // response with status code 200
```

### It's useful to use `prettier` to format the generated code

```ts
import { format } from 'prettier';

const code = format('const a = 1;', { parser: 'typescript' });
```

### Creating `zod` types from schema

```ts
const schema = api
    .getPathBySegments(['pets', 'findByStatus'])
    .operations[0]
    .responses[0]
    .content['application/json']
    .schema;

`const PetResponse = z[${schema?.type}]();`
```

## Project goal

The mission of this project is simple - to help convert an existing OpenAPI 2 or 3 schema in variable form to text.

What this project does NOT do:

- Downloading files
- Importing files
- Exporting files
- Operating on dependencies other than local
- Authentication
- Using with the CLI
