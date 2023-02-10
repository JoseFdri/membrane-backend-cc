import { Request, Response } from 'express';
import { Handler } from '../types';
import { logger } from './';

export const adaptRoute = (handler: Handler ) => {
  return async (req: Request, res: Response) => {
    const httpResponse = await handler(req);

    if (httpResponse.statusCode >= 200 && httpResponse.statusCode <= 299) {
      return res.status(httpResponse.statusCode).json(httpResponse.body)
    }
    logger.error(httpResponse.body.stack);
    return res.status(httpResponse.statusCode).json({
      error: httpResponse.body.message
    });
  }
}
