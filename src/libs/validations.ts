import { MarketDepthParams } from '../types'
import { isAlpha, isNumeric } from 'validator'

export const validateOrderParams = (params: MarketDepthParams): Error | undefined => {
  const requiredFields = ['name', 'operation', 'amount']
  const errors: Error[] = []
  requiredFields.forEach((requiredField) => {
    if (!Object.prototype.hasOwnProperty.call(params, requiredField)) {
      errors.push(Error(`missing parameter ${requiredField}`))
    }
  })
  if (params.name && !isAlpha(params.name)) {
    errors.push(new Error(`invalid value ${params.name}`))
  }
  if (params.amount && !isNumeric(`${params.amount}`)) {
    errors.push(new Error(`invalid value ${params.amount}`))
  }
  if (params.operation && !['sell', 'buy'].includes(params.operation)) {
    errors.push(new Error(`invalid value ${params.operation}`))
  }
  if (params.priceLimit && !isNumeric(`${params.priceLimit}`)) {
    errors.push(new Error(`invalid value ${params.priceLimit}`))
  }

  if (errors && errors.length > 0) {
    const errMsg = errors.reduce((a, b, i) => {
      a += b.message
      if (errors.length > 1 && i < errors.length - 1) {
        a += ', '
      }
      return a
    }, '')
    return new Error(errMsg)
  }
}
