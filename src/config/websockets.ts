import Ws, { WebSocket } from 'ws'
import { env } from './'
import { logger } from '../libs'

export let websocket: WebSocket | null

export let ORDER_BOOKS = {}
export let CHANNELS_MAP = {}

export const wsConnect = async (): Promise<boolean> => {
  return await new Promise((resolve) => {
    websocket = new Ws(env.apiUrl)
    websocket.on('open', () => resolve(true))
  })
}

export const wsClose = async (): Promise<boolean> => {
  return await new Promise((resolve) => {
    websocket?.on('close', () => {
      websocket = null
      ORDER_BOOKS = {}
      CHANNELS_MAP = {}
      resolve(true)
    })
  })
}

export const handleMessages = (): void => {
  websocket?.on('message', (buffer: string) => {
    const msg = JSON.parse(buffer.toString())

    if (msg.event === 'error') {
      CHANNELS_MAP[msg.symbol] = {
        error: msg.msg
      }
    }

    if (msg.event === 'subscribed') {
      ORDER_BOOKS[msg.chanId] = {
        snapshot: [],
        symbol: msg.symbol
      }
      CHANNELS_MAP[msg.symbol] = {
        chanId: msg.chanId,
        error: null,
      }
    }

    if (msg.event === 'subscribed') {
      ORDER_BOOKS[msg.chanId] = {
        snapshot: [],
        symbol: msg.symbol
      }
      CHANNELS_MAP[msg.symbol] = {
        chanId:  msg.chanId
      }
    }

    if (msg.event === 'unsubscribed') {
      const symbol = ORDER_BOOKS[msg.chanId].symbol
      CHANNELS_MAP[symbol] = {}
      ORDER_BOOKS[msg.chanId] = {}
    }
    // I'm only going to work with the snapshot data
    if (msg[0] && ORDER_BOOKS[msg[0]]) {
      const [chanId, data] = msg
      if (data.length > 3) {
        ORDER_BOOKS[chanId].snapshot = data
      }
    }
  })
}
