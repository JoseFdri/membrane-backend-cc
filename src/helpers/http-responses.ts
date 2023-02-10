import { HttpResponse } from '../types';
import { ServerError } from '../libs';

export const ok = <T>(data: T): HttpResponse => ({
    statusCode: 200,
    body: data
});

export const serverError = (error: Error): HttpResponse => ({
    statusCode: 500,
    body: new ServerError(error.stack)
});

export const badRequest = (error: Error): HttpResponse => ({
    statusCode: 400,
    body: error
  })