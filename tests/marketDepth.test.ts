import { getEffectivePrice, buildBidAsk, calculateDepthPrice } from '../src/repositories';
import { orderBookMock } from './__mocks__';

describe('Test market depth logic', () => {
    it('Should return the market depth for bids', () => {
        const amount = 20;
        const priceLimit = 0;
        const snapshot = orderBookMock[1] as number[][];
        const { bids } = buildBidAsk(snapshot);
        const { nextPrice } = getEffectivePrice(bids, amount, priceLimit);
        const depth = calculateDepthPrice(bids, nextPrice).toFixed(2);
        
        expect(depth).toBe('0.05');
    });

    it('Should return the market depth for bids with price limit', () => {
        const amount = 20;
        const priceLimit = 434515;

        const snapshot = orderBookMock[1] as number[][];
        const { bids } = buildBidAsk(snapshot);
        const { nextPrice, totalPrice, totalCount } = getEffectivePrice(bids, amount, priceLimit);
        const depth = calculateDepthPrice(bids, nextPrice).toFixed(2);

        expect(totalCount).toBe(19);
        expect(totalPrice).toBe(priceLimit);
        expect(nextPrice).toBe(22866);
        expect(depth).toBe('0.04');
    });

    it('Should return the market depth for asks', () => {
        const amount = 19;
        const priceLimit = 0;
        const snapshot = orderBookMock[1] as number[][];
        const { asks } = buildBidAsk(snapshot);
        const { nextPrice } = getEffectivePrice(asks, amount, priceLimit);
        const depth = calculateDepthPrice(asks, nextPrice).toFixed(2);
        
        expect(depth).toBe('0.02');
    });

    it('Should return the market depth for asks with price limit', () => {
        const amount = 20;
        const priceLimit =  366051;

        const snapshot = orderBookMock[1] as number[][];
        const { asks } = buildBidAsk(snapshot);
        const { nextPrice, totalPrice, totalCount } = getEffectivePrice(asks, amount, priceLimit);
        const depth = calculateDepthPrice(asks, nextPrice).toFixed(2);

        expect(totalCount).toBe(16);
        expect(totalPrice).toBe(priceLimit);
        expect(nextPrice).toBe(22880);
        expect(depth).toBe('0.01');
    });
});