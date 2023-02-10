import _ from 'lodash';
import { websocket, ORDER_BOOKS, CHANNELS_MAP } from '../config';
import { MarketDepthParams } from '../types';

const subscribeToEvent = ({
    channel, symbol
}) => {
    const msg = JSON.stringify({
        event: 'subscribe', 
        channel, 
        symbol 
    });

    websocket.send(msg)
}

const unsubscribeToEvent = ({
    chanId
}) => {
    const msg = JSON.stringify({
        event: 'unsubscribe', 
        chanId,
    });

    websocket.send(msg)
}

export const getSymbolSnapshot = (pairName: string): Promise<number[][]> => {
    subscribeToEvent({channel: 'book', symbol: pairName});
    const timeOut = 3000;
    return new Promise((resolve, reject) => {
        const interval = setInterval(() => {
            const channelId = CHANNELS_MAP[pairName];
            const snapshot = ORDER_BOOKS[channelId]?.snapshot;
            if(channelId && snapshot) {
                resolve(snapshot);
                unsubscribeToEvent({chanId: channelId});
                clearInterval(interval);
            }
        }, 100);

        setTimeout(() => {
            clearInterval(interval);
            reject(new Error('timeout'));
        }, timeOut);
    });
}

export const buildBidAsk = (snapshot: number[][]) => {
    const bids = [];
    const asks = [];

    snapshot.forEach((element) => {
        const [price, count, amount] = element;
        const item = {
            price,
            count,
            amount,
        };
        if(amount > 0) {
            bids.push(item);
        } else {
            asks.push(item);
        }
    });

    return {
        bids: _.orderBy(bids, ['price'], ['desc']),
        asks: _.sortBy(asks, ['price']),
    };
}

export const getEffectivePrice = (list: {
    price: number;
    count: number;
}[], maxAmount: number, priceLimit: number) => {
    let totalPrice = 0;
    let totalCount = 0;
    let nextPrice = 0;

    for (let i = 0; i < list.length; i++) {
        const {price, count} = list[i];
        let _count = 0;
        if (totalCount < maxAmount) {
            const rest = maxAmount - totalCount;
            _count = rest < count ? rest : count;
            let _break = false;
            for(let a = 1; a <= _count; a++) {
                if(priceLimit && (price + totalPrice) >  priceLimit) {
                    _break = true;
                    break;
                } else {
                    totalPrice += price;
                }
                totalCount++;
            }
            if(_break) {
                break;
            }
        }
        if (_count == count && i < list.length - 1) {
            nextPrice = list[i+1].price;
        } else {
            nextPrice = price;
        }
        if(totalCount == maxAmount) {
            break;
        }
    }

    return {
        totalPrice,
        totalCount,
        nextPrice,
    };
}

export const calculateDepthPrice = (list, nextPrice, ) => {
    const bestPrice = _.head(list).price;
    const depth = bestPrice > 0 ? (Math.abs((bestPrice - nextPrice)) / bestPrice) : 0;
    return depth * 100;
}

export const getDepthStats = async ({ name, amount, operation, priceLimit }: MarketDepthParams) => {
    const snapshot = await getSymbolSnapshot(name);
    const { bids, asks } = buildBidAsk(snapshot);
    const listMap = {
        sell: bids,
        buy: asks,
    };
    const list = listMap[operation];
    const { totalPrice, nextPrice, totalCount } = getEffectivePrice(list, amount, priceLimit);
    const depth = calculateDepthPrice(list, nextPrice);

    return {
        depth: `${depth.toFixed(2)}%`,
        totalPrice: totalPrice.toFixed(2),
        totalCount,
    }
}
