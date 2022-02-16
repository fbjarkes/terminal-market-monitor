import 'dotenv/config';
import yargs from 'yargs/yargs';
import { lightgreen, red, plot, PlotConfig } from 'asciichart';
import Alpaca from '@alpacahq/alpaca-trade-api';

import { logger } from './utils/logger';
import {
    getNewHighs,
    getNewLows,
    sleep,
    getSymbols,
    downloadSnapshot,
    SnapshotMapping,
    countNewLows,
    countNewHighs,
} from './utils/helper';

const MAX_LEN = 100; // TODO: if terminal width is less than 100, use that instead
const MAX_SYMBOL_PARAMS = 500; // URL query parameter max length is 2048

const argParser = yargs(process.argv.slice(2)).options({
    symbols: { type: 'string', alias: 's' },
    symbolsFile: { type: 'string', alias: 'f' },
});

(async () => {
    const args = await argParser.argv;
    let symbols = await getSymbols(args.symbols, args.symbolsFile);

    const alpaca = new Alpaca({
        keyId: process.env.KEY_ID,
        secretKey: process.env.SECRET_KEY,
        paper: true,
        usePolygon: false,
    });
    logger.info('Alpaca API keys: ', process.env.KEY_ID, process.env.SECRET_KEY); // TOOD: logger should print a string parameter!
    const config: PlotConfig = { offset: 2, colors: [lightgreen, red] };

    let prevSnapshots;
    const highs: number[] = [];
    const lows: number[] = [];
    //symbols = ['AAPL', 'TSLA', 'SPY', 'QQQ', 'MSFT', 'AMZN', 'FB'];

    while (1) {
        console.log('==========================================================');
        try {
            const snapshots = await downloadSnapshot(symbols, alpaca);
            // 2. if prevSnapshots is not empty, then compare with new snapshots
            if (prevSnapshots) {
                // 3. Count number of new highs and lows
                const nbrActiveSymbols = Object.keys(prevSnapshots).length;
                //console.log('active symbols: ', nbrActiveSymbols);
                const lowPercent = (countNewLows(prevSnapshots, snapshots) / nbrActiveSymbols) * 100;
                const highPercent = (countNewHighs(prevSnapshots, snapshots) / nbrActiveSymbols) * 100;

                // 4. prevSnapshots = currSnapshots
                prevSnapshots = snapshots;

                // 5. push new highs/lows percentage to h/l array
                if (highs.length === MAX_LEN) {
                    highs.shift();
                    lows.shift();
                }
                highs.push(highPercent);
                lows.push(lowPercent);

                // 7. plot h/l arrays                ;
                //console.log('highs:', highs);
                //console.log('lows:', lows);
                console.clear();
                console.log(plot([highs, lows], config));
            } else {
                prevSnapshots = snapshots;
            }
        } catch (e) {
            logger.error(e);
        }
        await sleep(60000);
    }
})();
