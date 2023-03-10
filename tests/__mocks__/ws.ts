import EventEmitter from 'events'
import { orderBookMock } from './orderBook'

class Websocket extends EventEmitter {
  public send = (_payload): void => {
    const payload = JSON.parse(_payload)
    const { symbol } = payload

    if (payload.event === 'subscribe') {
      this.emit('message', JSON.stringify({
        event: 'subscribed',
        symbol,
        chanId: orderBookMock[0]
      }))
      this.emit('message', JSON.stringify(orderBookMock))
    } else if (payload.event === 'unsubscribe') {
      this.emit('message', JSON.stringify({
        event: 'unsubscribed',
        chanId: orderBookMock[0]
      }))
    }
    if(payload.event === 'subscribe' && symbol === 'tETHUSDINVALIDA') {
      this.emit('message', JSON.stringify({
        event: 'error',
        msg: 'symbol: invalid',
        symbol,
      }))
    }
    if(payload.event === 'subscribe' && symbol === 'tETHUSDINVALIDB') {
      this.emit('message', JSON.stringify({
        event: 'error',
        msg: 'secret error',
        symbol,
      }))
    }
  }
};

export default Websocket
