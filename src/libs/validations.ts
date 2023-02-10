import { MarketDepthParams } from '../types';
import { isAlpha, isNumeric } from 'validator';

export const validateOrderParams = (params: MarketDepthParams): Error | void => {
    const requiredFields = ['name', 'operation', 'amount'];
    const errors = [];
    for (const key in requiredFields) {
        if (!Object.prototype.hasOwnProperty.call(params, requiredFields[key])) {
            errors.push(Error(`missing parameter ${requiredFields[key]}`));
        }
    }
    if(params.name && !isAlpha(params.name)) {
        errors.push(new Error(`invalid value ${params.name}`));
    }
    if(params.amount && !isNumeric(`${params.amount}`)) {
        errors.push(new Error(`invalid value ${params.amount}`));
    }
    if(params.operation && !['sell', 'buy'].includes(params.operation)) {
        errors.push(new Error(`invalid value ${params.operation}`));
    }
    if(params.priceLimit && !isNumeric(`${params.priceLimit}`)) {
        errors.push(new Error(`invalid value ${params.priceLimit}`));
    }

    if(errors && errors.length > 0) {
        const errMsg = errors.reduce((a, b, i) => {
            a += b.message;
            if(errors.length > 1 && i === errors.length -2) {
                a += ', ';
            }
            return  a;
        }, '');
        return new Error(errMsg);
    }
}
