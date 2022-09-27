# typebox-express-middleware
Middleware for [express](https://www.npmjs.com/package/express) that uses [typebox](https://www.npmjs.com/package/@sinclair/typebox) to make requests type-safe.

<a href="https://www.npmjs.com/package/typebox-express-middleware" rel="nofollow"><img alt="npm" src="https://img.shields.io/npm/v/typebox-express-middleware"></a>
<a href="https://www.npmjs.com/package/typebox-express-middleware" rel="nofollow"><img alt="npm" src="https://img.shields.io/npm/dw/typebox-express-middleware"></a>
<a href="https://github.com/mmamedel/typebox-express-middleware/actions/workflows/node.js.yml" rel="nofollow"><img alt="npm" src="https://github.com/mmamedel/typebox-express-middleware/actions/workflows/node.js.yml/badge.svg"></a>
<a href="https://codecov.io/gh/mmamedel/typebox-express-middleware"><img src="https://codecov.io/gh/mmamedel/typebox-express-middleware/branch/main/graph/badge.svg?token=QUZBCJJ289"/></a>

## Installation

This package relies on [typebox](https://www.npmjs.com/package/@sinclair/typebox), [express](https://www.npmjs.com/package/express) and [@types/express](https://www.npmjs.com/package/@types/express). These have been added as peer dependencies so they can be upgraded independently of this package.

[typebox-express-middleware](https://www.npmjs.com/package/typebox-express-middleware) can be installed using:

`npm install typebox-express-middleware`

## Usage
This package provides the `validateRequest` function, which can be used to validate the `.body`, `.query` and `.params` properties of an Express `Request`. Separate functions for each of these are also provided (`validateRequestBody`, `validateRequestQuery` and `validateRequestParams`). 

**Basic example:**
```typescript
import { validateRequest } from 'typebox-express-middleware';
import { Type } from '@sinclair/typebox';

// app is an express app
app.get("/", validateRequest({
    body: Type.Object({
      bodyKey: Type.Number(),
    }),
  }), (req, res) => {
    // req.body is now strictly-typed and confirms to the typebox schema above.
    // req.body has type { bodyKey: number };
    return res.json({message: "Validation for body passed"});  
  }
);
```

A full example of using `validateRequest` in a tiny Express app:

**Full example:**
```typescript
import express from 'express';
import { validateRequest } from 'typebox-express-middleware';
import { Type } from '@sinclair/typebox';

// Create an express app
const app = express();

// Define an endpoint using express, typebox and typebox-express-middleware
app.get("/:urlParameter/", validateRequest({
    params: Type.Object({
      urlParameter: Type.String(),
    }),
    body: Type.Object({
      bodyKey: Type.Number(),
    }),
    query: Type.Object({
      queryKey: Type.String({ minLength: 64 }),
    }),
  }), (req, res) => {
    // req.params, req.body and req.query are now strictly-typed and confirm to the typebox schema above.
    // req.params has type { urlParameter: string };
    // req.body has type { bodyKey: number };
    // req.query has type { queryKey: string };
    return res.json({message: "Validation for params, body and query passed"});  
  }
);

// Start the express app on port 8080
const PORT = 8080;
app.listen(PORT, () => {
  console.log(`Server running `);
});
```
The `validate*` functions do not modify the query, params or body of the Request object, they only check whether they are valid according to the provided schemas.

### validateRequest

This functions accepts an object containing three optional properties:
```typescript
schemas: {
  params? : TSchema,
  query? : TSchema,
  body? : TSchema
}
```
 
Each is a `TSchema`, from typebox library. The `validateRequest` function checks whether each of these is present and if so, it will use it validate the corresponding property on the Express `Request` object. 

If validation passes, `next` will be called and your request body, query and params properties will be type-safe within the endpoint. 

If validation fails, a `TypeboxError` is thrown and you can pick it up in any express error middleware that you may have set up. A simple example is:
```typescript
app.use((error, req, res, next) => {
  if (error instanceof TypeboxError) {
    return res.status(400).json(error)
  }
  // Treat other errors
};
```

### validateRequestBody, validateRequestQuery and validateRequestParams

These three functions work exactly the same as `validateRequest`, except they only validate a single property within the Express `Request`.
The other, non-validated properties will have type `any`, as if they were not modified at all. Only an example is provided for `validateRequestBody`, but `validateRequestQuery` and `validateRequestParams` work in the same manner.

**Example:**
```typescript
import { validateRequestBody } from 'typebox-express-middleware';
import { Type } from '@sinclair/typebox';

// app is an express app
app.get("/", validateRequestBody(
    Type.Object({
      bodyKey: Type.Number(),
    })
  ), (req, res) => {
    // req.body is now strictly-typed and confirms to the typebox schema above.
    // req.body: { bodyKey: number };
    return res.json({ message: "Validation for body passed" });
  }
);
```

### TypedRequest
Besides exporting the above middleware functions, typebox-express-middleware also provided several typings for usage with Express requests. Typescript is able to automatically infer the types of your request body, query and params if your endpoint definition is placed in the same file as the validation middleware, as shown above. However, if the code for your endpoint is in a separate file, typings will not be automatically available. This is where the `TypedRequest`, `TypedRequestBody` etc. types come in: the `typeof` a `Tchema` can be passed into the `TypedRequest`, providing your function with typings. An example:

```typescript
import { Response } from 'express';
import { TypedRequestBody } from 'typebox-express-middleware';

// bodySchema is a TSchema, imported from another file.
import { bodySchema } from '../validation/requestSchemas';

// This is the endpoint code: it is not placed in the same file as the route definition and the validation middleware.
export async function endpointCode(req: TypedRequestBody<typeof bodySchema>, res: Response) {
  // req.body is now typed: use TypedRequestParams, TypedRequestQuery for params and query, or TypedRequest for multiple together.
  const typedBody = req.body;
  return res.json(typedBody);
}

```