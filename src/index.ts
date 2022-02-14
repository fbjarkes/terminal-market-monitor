import 'dotenv/config';
import yargs from 'yargs/yargs';
import { lightgreen, red, plot, PlotConfig } from 'asciichart';
import Alpaca from '@alpacahq/alpaca-trade-api';

import { logger } from './utils/logger';
import { getNewHighs, getNewLows, sleep, getSymbols, downloadSnapshot } from './utils/helper';

const MAX_LEN = 100; // TODO: if terminal width is less than 100, use that instead
const MAX_SYMBOL_PARAMS = 500; // URL query parameter max length is 2048

const argParser = yargs(process.argv.slice(2)).options({
    symbols: { type: 'string', alias: 's' },
    symbolsFile: { type: 'string', alias: 'f' },
});

(async () => {
    const args = await argParser.argv;
    const symbols = await getSymbols(args.symbols, args.symbolsFile);

    const alpaca = new Alpaca({
        keyId: process.env.KEY_ID,
        secretKey: process.env.API_KEY,
        paper: true,
        usePolygon: false,
    });

    while (1) {
        console.log('==========================================================');
        logger.info(`Downloading snapshot for ${symbols.length} symbols`);
        // 1. download snapshots
        const snapshots = await downloadSnapshot(symbols, alpaca);
        console.log('AAPL High:', snapshots['AAPL'].High);
        console.log('TSLA High:', snapshots['TSLA'].High);
        // 2. if prevSnapshots is not empty, then compare with new snapshots
        // 3. Count number of new highs and lows
        // 4. prevSnapshots = currSnapshots
        // 5. push new highs/lows percentage to h/l array
        // 7. plot h/l arrays
        // 8. sleep
        await sleep(1000);
    }
})();
