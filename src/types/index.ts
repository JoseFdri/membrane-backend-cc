import { Request } from 'express';

export type Handler = (req: Request) => Promise<HttpResponse>;

export type HttpResponse = {
    statusCode: number
    body: any
};

export type MarketDepthParams = {
    name: string;
    operation: string;
    amount: number;
    priceLimit: number;
}
