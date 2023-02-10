import { Request } from 'express'
import { HttpResponse } from '../types'
import { ok, serverError, badRequest } from '../helpers'
import { getSymbolSnapshot, buildBidAsk, getDepthStats } from '../repositories'
import { isAlpha } from 'validator'
import { validateOrderParams } from '../libs'

export const getOrderBooks = async (req: Request): Promise<HttpResponse> => {
  try {
    const pairName = req.params.pairName
    // using validator due the simplicity of the endpoint
    if (!isAlpha(pairName)) {
      return badRequest(new Error('Invalid pair name'))
    }
    const snapshot = await getSymbolSnapshot(pairName)
    if(snapshot instanceof Error) {
      return badRequest(snapshot);
    }
    const bidAsks = buildBidAsk(snapshot)

    return ok(bidAsks)
  } catch (err) {
    return serverError(err)
  }
}

export const postOrder = async (req: Request): Promise<HttpResponse> => {
  const { name, operation, amount, priceLimit } = req.body
  const error = validateOrderParams(req.body)
  if (error) {
    return badRequest(error)
  }
  try {
    const response = await getDepthStats({ name, operation, amount, priceLimit })
    if(response instanceof Error) {
      return badRequest(response)
    }
    if (response.totalCount < amount && !priceLimit) {
      return badRequest(new Error('There is not enough orders'))
    }
    return ok(response)
  } catch (err) {
    return serverError(err)
  }
}
