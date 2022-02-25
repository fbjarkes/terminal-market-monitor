export type DataPoint = {
    newHigh: number;
    newLow: number;
    aboveOpen: number;
    belowOpen: number;
    abovePrevHigh: number;
    belowPrevLow: number;
    abovePrevClose: number;
    belowPrevClose: number;
};

export type DataPoints = {
    newHighs: number[];
    newLows: number[];
    aboveOpens: number[];
    belowOpens: number[];
    abovePrevHighs: number[];
    belowPrevLows: number[];
    abovePrevCloses: number[];
    belowPrevCloses: number[];
};
