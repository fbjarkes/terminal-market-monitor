import Alpaca from '@alpacahq/alpaca-trade-api';
import fs from 'fs/promises';
import { random } from 'lodash';

export type SnapshotMapping = {
    [key: string]: any;
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

const transformSnapshot = (s: any) => {
    const bar = s.DailyBar;
    return {
        symbol: s.symbol,
        data: {
            DateTime: bar.Timestamp,
            Open: bar.OpenPrice,
            High: bar.HighPrice,
            Low: bar.LowPrice,
            Close: bar.ClosePrice,
            Volume: bar.Volume,
        },
    };
};

export const downloadSnapshot = async (symbols: string[], alpaca: Alpaca): Promise<SnapshotMapping> => {
    //const snapshots = await alpaca.getSnapshots(symbols);
    const snapshots = [
        {
            symbol: 'AAPL',
            DailyBar: {
                Timestamp: '2020-01-01T00:00:00.000Z',
                OpenPrice: '100.00',
                HighPrice: '100.00',
                LowPrice: '100.00',
                ClosePrice: '100.00',
                Volume: '100',
            },
        },
        {
            symbol: 'TSLA',
            DailyBar: {
                Timestamp: '2020-01-01T00:00:00.000Z',
                OpenPrice: '100.00',
                HighPrice: '100.00',
                LowPrice: '100.00',
                ClosePrice: '100.00',
                Volume: '100',
            },
        },
    ];
    const res: SnapshotMapping = {};
    //return snapshots.map(transformSnapshot);
    snapshots.map(transformSnapshot).forEach((s) => {
        res[s.symbol] = s.data;
    });
    return res;
};

// eslint-disable-next-line no-undef
export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const getNewHighs = async () => {
    return random(-2, 2);
};

export const getNewLows = async () => {
    return random(-2, 2);
};
