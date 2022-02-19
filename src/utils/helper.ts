import Alpaca from '@alpacahq/alpaca-trade-api';
import fs from 'fs/promises';
import { random } from 'lodash';
import { DataPoint, DataPoints } from 'src/types';

import { logger } from '../utils/logger';

export type Snapshot = {
    Open: number;
    High: number;
    Low: number;
    Close: number;
    prevOpen: number;
    prevHigh: number;
    prevLow: number;
    prevClose: number;
};

export type SnapshotMapping = {
    [key: string]: Snapshot;
};

export const getSymbols = async (
    symbolsList: string | undefined,
    symbolsFile: string | undefined,
): Promise<string[]> => {
    const _validSymbol = (sym: string) => !(sym === '' || sym.includes('/') || sym.startsWith('#'));
    if (symbolsList) {
        const symbols = symbolsList.split(',');
        return symbols;
    } else if (symbolsFile) {
        const data = await fs.readFile(symbolsFile);
        return data.toString().split('\n').filter(_validSymbol);
    }
    return [];
};

export const downloadSnapshot = async (symbols: string[], alpaca: Alpaca): Promise<SnapshotMapping> => {
    logger.info(`Downloading snapshot for ${symbols.length} symbols`);
    const snapshots = await alpaca.getSnapshots(symbols);
    logger.debug(`Got ${snapshots.length} snapshots`);
    // const snapshots = [
    //     {
    //         symbol: 'AAPL',
    //         MinuteBar: {
    //             Timestamp: '2020-01-01T00:00:00.000Z',
    //             OpenPrice: 100.0,
    //             HighPrice: 100.0 + (Math.random() * 10 < 5 ? 0 : 10),
    //             LowPrice: 100.0 + (Math.random() * 10 < 5 ? 0 : 10),
    //             ClosePrice: 100.0,
    //             Volume: 100,
    //         },
    //     },
    //     {
    //         symbol: 'TSLA',
    //         MinuteBar: {
    //             Timestamp: '2020-01-01T00:00:00.000Z',
    //             OpenPrice: 100.0,
    //             HighPrice: 100.0 + (Math.random() * 10 < 5 ? 0 : 10),
    //             LowPrice: 100.0 + (Math.random() * 10 < 5 ? 0 : 10),
    //             ClosePrice: 100.0,
    //             Volume: 100,
    //         },
    //     },
    // ];
    const res: SnapshotMapping = {};
    snapshots.forEach((s) => {
        const symbol = (s as any).symbol;
        if (s.DailyBar && s.PrevDailyBar) {
            res[symbol] = {
                Open: s.DailyBar.OpenPrice,
                High: s.DailyBar.HighPrice,
                Low: s.DailyBar.LowPrice,
                Close: s.DailyBar.ClosePrice,
                prevOpen: s.PrevDailyBar.OpenPrice,
                prevHigh: s.PrevDailyBar.HighPrice,
                prevLow: s.PrevDailyBar.LowPrice,
                prevClose: s.PrevDailyBar.ClosePrice,
            };
        }
    });
    return res;
};

export const countNewLows = (prev: SnapshotMapping, curr: SnapshotMapping): number => {
    let count = 0;
    for (const symbol in curr) {
        if (prev[symbol] && prev[symbol].Low > curr[symbol].Low) {
            count++;
        }
    }
    return count as number;
};

export const countNewHighs = (prev: SnapshotMapping, curr: SnapshotMapping): number => {
    let count = 0;
    for (const symbol in curr) {
        if (prev[symbol] && prev[symbol].High < curr[symbol].High) {
            count++;
        }
    }
    return count as number;
};

// eslint-disable-next-line no-undef
export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const countMetrics = (prev: SnapshotMapping, curr: SnapshotMapping): DataPoint => {
    const dp: DataPoint = {
        newHighs: 0,
        newLows: 0,
        aboveOpen: 0,
        belowOpen: 0,
        abovePrevHigh: 0,
        belowPrevLow: 0,
        abovePrevClose: 0,
        belowPrevClose: 0,
    };

    for (const symbol in curr) {
        if (prev[symbol]) {
            if (prev[symbol].High < curr[symbol].High) {
                dp.newHighs++;
            }
            if (prev[symbol].Low > curr[symbol].Low) {
                dp.newLows++;
            }
            if (prev[symbol].Open < curr[symbol].Close) {
                dp.aboveOpen++;
            }
            if (prev[symbol].Open > curr[symbol].Close) {
                dp.belowOpen++;
            }
            if (prev[symbol].prevClose < curr[symbol].Close) {
                dp.abovePrevClose++;
            }
            if (prev[symbol].prevClose > curr[symbol].Close) {
                dp.belowPrevClose++;
            }
            if (prev[symbol].prevHigh < curr[symbol].Close) {
                dp.abovePrevHigh++;
            }
            if (prev[symbol].prevLow > curr[symbol].Close) {
                dp.belowPrevLow++;
            }
        }
    }

    return dp;
};

export const toPercentage = (dp: DataPoint, totalCounts: number): DataPoint => {
    return {
        newHighs: (dp.newHighs / totalCounts) * 100,
        newLows: (dp.newLows / totalCounts) * 100,
        aboveOpen: (dp.aboveOpen / totalCounts) * 100,
        belowOpen: (dp.belowOpen / totalCounts) * 100,
        abovePrevClose: (dp.abovePrevClose / totalCounts) * 100,
        belowPrevClose: (dp.belowPrevClose / totalCounts) * 100,
        abovePrevHigh: (dp.abovePrevHigh / totalCounts) * 100,
        belowPrevLow: (dp.belowPrevLow / totalCounts) * 100,
    };
};

export const mergeDataPoints = (plotData: DataPoints, dpPercentage: DataPoint, plotLength: number): void => {
    // TODO: Shift the data points to the left, in order to keep the plot length constant
    // Object.keys(plotData).forEach((key: string) => {
    //     const arr = plotData[key];
    //     // if (plotData[key] === plotLength) {
    //     //     plotData[key].shift();
    //     // }
    // });

    plotData.newHighs.push(dpPercentage.newHighs);
    plotData.newLows.push(dpPercentage.newLows);
    plotData.aboveOpen.push(dpPercentage.aboveOpen);
    plotData.belowOpen.push(dpPercentage.belowOpen);
    plotData.abovePrevHigh.push(dpPercentage.abovePrevHigh);
    plotData.belowPrevLow.push(dpPercentage.belowPrevLow);
    plotData.abovePrevClose.push(dpPercentage.abovePrevClose);
    plotData.belowPrevClose.push(dpPercentage.belowPrevClose);
};
