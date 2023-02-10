import { Request } from 'express'

export type Handler = (req: Request) => Promise<HttpResponse>

export interface HttpResponse {
  statusCode: number
  body: any
}

export interface MarketDepthParams {
  name: string
  operation: string
  amount: number
  priceLimit?: number
}

export interface TipType {
  price: number
  count: number
  amount: number
}
