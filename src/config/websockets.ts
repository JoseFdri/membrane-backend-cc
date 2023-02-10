import ws from 'ws';
import { env } from './';

export let websocket = null;

export let ORDER_BOOKS = {};
export let CHANNELS_MAP = {};

export const wsConnect = () => {
  return new Promise((resolve) => {
    websocket = new ws(env.apiUrl);
    websocket.on('open', () => resolve(websocket));
  });
}

export const wsClose = () => {
  new Promise((resolve) => {
    websocket.on('close', () => {
      websocket = null;
      ORDER_BOOKS = {};
      CHANNELS_MAP = {};
      resolve(true);
    });
  });
};

export const handleMessages = () => {
  websocket.on('message', (buffer) => {
    const msg = JSON.parse(buffer);
    if (msg.event === 'subscribed') {
        ORDER_BOOKS[msg.chanId] = {
          snapshot: [],
          symbol: msg.symbol,
        };
        CHANNELS_MAP[msg.symbol] = msg.chanId;
    }

    if (msg.event === 'unsubscribed') {
      const symbol = ORDER_BOOKS[msg.chanId].symbol;
      delete CHANNELS_MAP[symbol];
      delete ORDER_BOOKS[msg.chanId];
    }
    // I'm only going to work with the snapshot data
    if (msg[0] && ORDER_BOOKS[msg[0]]) {
      const [chanId, data] = msg;
      if (data.length > 3) {
        ORDER_BOOKS[chanId].snapshot = data;
      }
    }
  });
}
