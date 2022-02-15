import Alpaca from '@alpacahq/alpaca-trade-api';
import fs from 'fs/promises';
import { random } from 'lodash';

export type Snapshot = {
    High: number;
    Low: number;
    Close: number;
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
    //const snapshots = await alpaca.getSnapshots(symbols);
    const snapshots = [
        {
            symbol: 'AAPL',
            DailyBar: {
                Timestamp: '2020-01-01T00:00:00.000Z',
                OpenPrice: 100.0,
                HighPrice: 100.0 + (Math.random() * 10 < 5 ? 0 : 10),
                LowPrice: 100.0 + (Math.random() * 10 < 5 ? 0 : 10),
                ClosePrice: 100.0,
                Volume: 100,
            },
        },
        {
            symbol: 'TSLA',
            DailyBar: {
                Timestamp: '2020-01-01T00:00:00.000Z',
                OpenPrice: 100.0,
                HighPrice: 100.0 + (Math.random() * 10 < 5 ? 0 : 10),
                LowPrice: 100.0 + (Math.random() * 10 < 5 ? 0 : 10),
                ClosePrice: 100.0,
                Volume: 100,
            },
        },
    ];
    const res: SnapshotMapping = {};
    snapshots.forEach((s) => {
        res[s.symbol] = {
            High: s.DailyBar.HighPrice,
            Low: s.DailyBar.LowPrice,
            Close: s.DailyBar.ClosePrice,
        };
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

export const getNewHighs = async () => {
    return random(-2, 2);
};

export const getNewLows = async () => {
    return random(-2, 2);
};
