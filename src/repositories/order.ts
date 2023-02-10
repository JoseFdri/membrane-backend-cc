import _ from 'lodash'
import { websocket, ORDER_BOOKS, CHANNELS_MAP } from '../config'
import { MarketDepthParams, TipType } from '../types'
import { ERROR_SYMBOL_INVALID } from '../constants'

const subscribeToEvent = ({
  channel, symbol
}): void => {
  const msg = JSON.stringify({
    event: 'subscribe',
    channel,
    symbol
  })

  websocket?.send(msg)
}

const unsubscribeToEvent = ({
  chanId
}): void => {
  const msg = JSON.stringify({
    event: 'unsubscribe',
    chanId
  })

  websocket?.send(msg)
}

export const getSymbolSnapshot = async (pairName: string): Promise<number[][] | Error> => {
  subscribeToEvent({ channel: 'book', symbol: pairName })
  const timeOut = 3000

  return await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      clearInterval(interval)
      reject(new Error('timeout'))
    }, timeOut);

    const interval = setInterval(() => {
      const channelId = CHANNELS_MAP[pairName]?.chanId
      const snapshot = ORDER_BOOKS[channelId]?.snapshot
      const error = CHANNELS_MAP[pairName]?.error;
      if(error && error === ERROR_SYMBOL_INVALID) {
        clearInterval(interval)
        clearTimeout(timeout)
        resolve(Error(error));
      } else if(error){
        clearInterval(interval)
        clearTimeout(timeout)
        reject(new Error(error))
      }

      if (channelId && snapshot) {
        unsubscribeToEvent({ chanId: channelId })
        clearInterval(interval)
        clearTimeout(timeout)
        resolve(snapshot)
      }
    }, 100)

    
  })
}

export const buildBidAsk = (snapshot: number[][]): { bids: TipType[], asks: TipType[] } => {
  const bids: TipType[] = []
  const asks: TipType[] = []

  snapshot.forEach((element) => {
    const [price, count, amount] = element
    const item = {
      price,
      count,
      amount
    }
    if (amount > 0) {
      bids.push(item)
    } else {
      asks.push(item)
    }
  })

  return {
    bids: _.orderBy(bids, ['price'], ['desc']),
    asks: _.sortBy(asks, ['price'])
  }
}

export const getEffectivePrice = (list: Array<{
  price: number
  count: number
}>, maxAmount: number, priceLimit?: number): { totalPrice: number, totalCount: number, nextPrice: number } => {
  let totalPrice = 0
  let totalCount = 0
  let nextPrice = 0

  for (let i = 0; i < list.length; i++) {
    const { price, count } = list[i]
    let _count = 0
    if (totalCount < maxAmount) {
      const rest = maxAmount - totalCount
      _count = rest < count ? rest : count
      let _break = false
      for (let a = 1; a <= _count; a++) {
        if (priceLimit && (price + totalPrice) > priceLimit) {
          _break = true
          break
        } else {
          totalPrice += price
        }
        totalCount++
      }
      if (_break) {
        break
      }
    }
    if (_count === count && i < list.length - 1) {
      nextPrice = list[i + 1].price
    } else {
      nextPrice = price
    }
    if (totalCount === maxAmount) {
      break
    }
  }

  return {
    totalPrice,
    totalCount,
    nextPrice
  }
}

export const calculateDepthPrice = (list: TipType[], nextPrice: number): number => {
  const bestPrice = _.head(list).price
  const depth = bestPrice > 0 ? (Math.abs((bestPrice - nextPrice)) / bestPrice) : 0
  return depth * 100
}

export const getDepthStats = async ({ name, amount, operation, priceLimit }: MarketDepthParams): Promise< {
  depth: string
  totalPrice: string
  totalCount: number
} | Error> => {
  const snapshot = await getSymbolSnapshot(name)
  if(snapshot instanceof Error) {
    return snapshot;
  }
  const { bids, asks } = buildBidAsk(snapshot)
  const listMap = {
    sell: bids,
    buy: asks
  }
  const list = listMap[operation]
  const { totalPrice, nextPrice, totalCount } = getEffectivePrice(list, amount, priceLimit)
  const depth = calculateDepthPrice(list, nextPrice)

  return {
    depth: `${depth.toFixed(2)}%`,
    totalPrice: totalPrice.toFixed(2),
    totalCount
  }
}
