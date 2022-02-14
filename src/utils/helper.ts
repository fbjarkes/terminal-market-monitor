import { random } from 'lodash';

export const sleep = (milliseconds: number) => {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
};

export const getNewHighs = async () => {
    return random(-2, 2);
};

export const getNewLows = async () => {
    return random(-2, 2);
};
