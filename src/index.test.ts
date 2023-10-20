import { Type } from '@sinclair/typebox';
import { TypeboxError, validateBody, validateHeaders, validateParams, validateQuery } from './index';
import { Response, NextFunction } from 'express';

const resMock = {} as Response;
const nextMock = jest.fn() as NextFunction;
const emptyRequest = {} as any;

afterEach(() => {
  jest.clearAllMocks();
});

describe('Body', () => {
  const bodySchema = Type.Object({
    bodyKey: Type.Number(),
  });
  const validation = validateBody(bodySchema);

  it('passes validation', () => {
    const reqMock = { body: { bodyKey: 10 } } as any;
    expect(() => validation(reqMock, resMock, nextMock)).not.toThrow();
    expect(nextMock).toBeCalledWith();
  });

  it('fails validation', () => {
    expect(() => validation(emptyRequest, resMock, nextMock)).not.toThrow();
    expect(nextMock).toHaveBeenCalledWith(new TypeboxError([]));
  });
});

describe('Params', () => {
  const paramsSchema = Type.Object({
    urlParameter: Type.String(),
  });
  const validation = validateParams(paramsSchema);

  it('passes validation', () => {
    const reqMock = { params: { urlParameter: 'param' } } as any;
    expect(() => validation(reqMock, resMock, nextMock)).not.toThrow();
    expect(nextMock).toBeCalledWith();
  });

  it('fails validation', () => {
    expect(() => validation(emptyRequest, resMock, nextMock)).not.toThrow();
    expect(nextMock).toHaveBeenCalledWith(new TypeboxError([]));
  });
});

describe('Query', () => {
  const querySchema = Type.Object({
    queryKey: Type.String({ minLength: 8 }),
  })
  const validation = validateQuery(querySchema);

  it('passes validation', () => {
    const reqMock = { query: { queryKey: '123456789' } } as any;
    expect(() => validation(reqMock, resMock, nextMock)).not.toThrow();
    expect(nextMock).toBeCalledWith();
  });

  it('fails validation', () => {
    expect(() => validation(emptyRequest, resMock, nextMock)).not.toThrow();
    expect(nextMock).toHaveBeenCalledWith(new TypeboxError([]));
  });
});

describe('Headers', () => {
  const headerSchema = Type.Object({
    'Authorization': Type.String({ minLength: 8 }),
  })
  const validation = validateHeaders(headerSchema);

  it('passes validation', () => {
    const reqMock = { headers: { Authorization: '12345678' } } as any;
    expect(() => validation(reqMock, resMock, nextMock)).not.toThrow();
    expect(nextMock).toBeCalledWith();
  });

  it('fails validation', () => {
    expect(() => validation(emptyRequest, resMock, nextMock)).not.toThrow();
    expect(nextMock).toHaveBeenCalledWith(new TypeboxError([]));
  });
});
