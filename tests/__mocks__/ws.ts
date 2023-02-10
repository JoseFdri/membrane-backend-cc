import EventEmitter from "events";
import { orderBookMock } from "./orderBook";

class Websocket extends EventEmitter { 
    constructor() {
        super();
    }

    public send = (_payload) => {
        const payload = JSON.parse(_payload);
        const { symbol } = payload;
        
        if (payload.event === 'subscribe') {    
            this.emit('message', JSON.stringify({
                event: 'subscribed',
                symbol: symbol,
                chanId: orderBookMock[0]
            }));
            this.emit('message', JSON.stringify(orderBookMock));
        } else if (payload.event === 'unsubscribe') {   
            this.emit('message', JSON.stringify({
                event: 'unsubscribed',
                chanId: orderBookMock[0]
            }));
        }
    }
};

export default Websocket;