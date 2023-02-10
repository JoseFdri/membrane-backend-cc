import request from 'supertest'
import { setupApp, wsConnect, handleMessages, websocket, wsClose } from '../src/config'

let app = null

const emitServerEvent = (event: string) => new Promise((resolve) => {
    const interval  = setInterval(() => {
        if(websocket) {
            clearInterval(interval);
            resolve(websocket.emit(event));
        }
    }, 100);
});

const closeConnection = () => {
    return Promise.all([wsClose(), emitServerEvent('close'), ]);
}

const openConnection = () => {
    return Promise.all([wsConnect(), emitServerEvent('open')]);
}
beforeEach(async () => {
    app = await setupApp();
    await openConnection();
})

afterEach(async () => {
    await closeConnection();
});

/* afterAll(async () => {
    await new Promise((resolve) => setTimeout(() => resolve(true), 500));
}); */

describe('Test order controller', () => {
    
    describe('Test get orderbook endpoint', () => {
        it('Should return bid-ask list', async () => {
            const pairName = 'tBTCUSD';
            handleMessages();
            
            await request(app)
            .get(`/api/order/${pairName}`)
            .expect(200);
        });

        it('Should return bad request error', async () => {
            const pairName = 'tBTCUSD1';
            handleMessages();
            
            await request(app)
            .get(`/api/order/${pairName}`)
            .expect(400);
        });

        it('Should return server error due timeout', async () => {
            const pairName = 'tBTCUSD';
            //handleMessages();
            await request(app)
            .get(`/api/order/${pairName}`)
            .expect(500);
        });
    });

    describe('Test post order endpoint', () => {
        it('Should return the effective price and depth for a sell operation', async () => {
            handleMessages();

            const result = await request(app)
            .post(`/api/order/`)
            .send({
                name: 'tBTCUSD',
                operation: "sell",
                amount: 5,
                priceLimit: 0,
            });
            expect(result.statusCode).toBe(200);
            expect(result._body).toMatchObject({
                totalPrice: '114367.00',
                depth: '0.03%',
            });
        });
    
        it('Should return the effective price and depth for a buy operation', async () => {
            handleMessages();
            
            const result = await request(app)
            .post(`/api/order/`)
            .send({
                name: 'tBTCUSD',
                operation: "buy",
                amount: 9,
                priceLimit: 0,
            });
            expect(result.statusCode).toBe(200);
            expect(result._body).toMatchObject({
                totalPrice: '205894.00',
                depth: '0.00%',
            });
        });

        it('Should return bad request error', async () => {
            handleMessages();
            
            const result = await request(app)
            .post(`/api/order/`)
            .send({
                name: 'tBTCUSD',
                operation: "buy",
                amount: 9999,
                priceLimit: 0,
            });
            expect(result.statusCode).toBe(400);
        });

        it('Should return timeout server error', async () => {
            const result = await request(app)
            .post(`/api/order/`)
            .send({
                name: 'tBTCUSD',
                operation: "buy",
                amount: 9,
                priceLimit: 0,
            });
            expect(result.statusCode).toBe(500);
        });

        it('Should return http 400 error', async () => {
            const result = await request(app)
            .post(`/api/order/`)
            .send({
                name: 'tBTCUSD1',
                operation: "buy1",
                amount: '10s',
                priceLimit: '10s',
            });
            expect(result.statusCode).toBe(400);
        });

        it('Should return http 400 error due missing parameter', async () => {
            const result = await request(app)
            .post(`/api/order/`)
            .send({
                name: 'tBTCUSD',
                operation: "buy",
                priceLimit: '10',
            });
            expect(result.statusCode).toBe(400);
            expect(result._body).toMatchObject({
                error: 'missing parameter amount'
            });
        });
    });
});