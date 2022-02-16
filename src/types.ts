export type DataPoint = {
    newHighs: number;
    newLows: number;
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
    aboveOpen: number[];
    belowOpen: number[];
    abovePrevHigh: number[];
    belowPrevLow: number[];
    abovePrevClose: number[];
    belowPrevClose: number[];
};
