import { Static, TSchema } from '@sinclair/typebox';
import { TypeCompiler } from '@sinclair/typebox/compiler';
import type { ValueError } from '@sinclair/typebox/errors';
import type { RequestHandler, Request } from 'express';
import type { ParamsDictionary } from 'express-serve-static-core';

export type TypedRequest<TParams extends TSchema, TQuery extends TSchema, TBody extends TSchema> = Request<
  Static<TParams>,
  any,
  Static<TBody>,
  Static<TQuery>
>;

export type TypedRequestBody<TBody extends TSchema> = Request<ParamsDictionary, any, Static<TBody>, any>;

export type TypedRequestParams<TParams extends TSchema> = Request<Static<TParams>, any, any, any>;

export type TypedRequestQuery<TQuery extends TSchema> = Request<ParamsDictionary, any, any, Static<TQuery>>;

type RequestValidation<TParams extends TSchema, TQuery extends TSchema, TBody extends TSchema, THeaders extends TSchema> = {
  params?: TParams;
  query?: TQuery;
  body?: TBody;
  headers?: THeaders;
};

type ErrorListItem = { type: 'Body' | 'Query' | 'Params' | 'Headers'; errors: ValueError[] };

export class TypeboxError extends Error {
  protected errors: unknown[];

  constructor(errors: unknown[]) {
    super('Typebox error');
    this.errors = errors;
    this.name = 'TypeboxError';
  }
}

export const validateRequest: <TParams extends TSchema, TQuery extends TSchema, TBody extends TSchema, THeaders extends TSchema>(
  schemas: RequestValidation<TParams, TQuery, TBody, THeaders>,
) => RequestHandler<Static<TParams>, any, Static<TBody>, Static<TQuery>> = (schemas) => {
  const paramsValidation = schemas.params && TypeCompiler.Compile(schemas.params);
  const queryValidation = schemas.query && TypeCompiler.Compile(schemas.query);
  const bodyValidation = schemas.body && TypeCompiler.Compile(schemas.body);
  const headersValidation = schemas.headers && TypeCompiler.Compile(schemas.headers);
  return (req, _res, next) => {
    const errors: Array<ErrorListItem> = [];
    if (paramsValidation && !paramsValidation.Check(req.params)) {
      errors.push({ type: 'Params', errors: Array.from(paramsValidation.Errors(req.params)) });
    }
    if (queryValidation && !queryValidation.Check(req.query)) {
      errors.push({ type: 'Query', errors: Array.from(queryValidation.Errors(req.query)) });
    }
    if (bodyValidation && !bodyValidation.Check(req.body)) {
      errors.push({ type: 'Body', errors: Array.from(bodyValidation.Errors(req.body)) });
    }
    if (headersValidation && !headersValidation.Check(req.headers)) {
      errors.push({ type: 'Headers', errors: Array.from(headersValidation.Errors(req.headers)) });
    }
    if (errors.length > 0) {
      return next(new TypeboxError(errors));
    }
    return next();
  };
};

export const validateParams = <TParams extends TSchema>(validate: TParams) => validateRequest({ params: validate });
export const validateQuery = <TQuery extends TSchema>(validate: TQuery) => validateRequest({ query: validate });
export const validateBody = <TBody extends TSchema>(validate: TBody) => validateRequest({ body: validate });
export const validateHeaders = <THeaders extends TSchema>(validate: THeaders) => validateRequest({ headers: validate });
