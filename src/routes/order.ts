import { Router } from 'express'
import { adaptRoute } from '../libs/adapters';
import { getOrderBooks, postOrder } from '../controllers';

export const orderRoute = (router: Router): void => {
    router.get('/order/:pairName', adaptRoute(getOrderBooks));
    router.post('/order', adaptRoute(postOrder));
}
