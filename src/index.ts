import 'dotenv/config';
import yargs from 'yargs/yargs';
import { lightgreen, lightcyan, red, lightgray, yellow, plot, PlotConfig } from 'asciichart';
import Alpaca from '@alpacahq/alpaca-trade-api';

import { logger } from './utils/logger';
import { sleep, getSymbols, downloadSnapshot, countMetrics, toPercentage, mergeDataPoints } from './utils/helper';
import { DataPoints } from './types';

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
    const config: PlotConfig = { offset: 2, colors: [lightgreen, red, lightgray, lightcyan, yellow], height: 20 };

    let prevSnapshots;

    //const highs: number[] = [];
    //const lows: number[] = [];
    //symbols = ['AAPL', 'TSLA', 'SPY', 'QQQ', 'MSFT', 'AMZN', 'FB'];
    const plotData: DataPoints = {
        newHighs: [],
        newLows: [],
        aboveOpens: [],
        belowOpens: [],
        abovePrevHighs: [],
        belowPrevLows: [],
        abovePrevCloses: [],
        belowPrevCloses: [],
    };

    while (1) {
        try {
            const snapshots = await downloadSnapshot(symbols, alpaca);
            if (prevSnapshots) {
                // R.pipe(countMetrics, ToPercentage, mergeDataPoints)
                const dp = countMetrics(prevSnapshots, snapshots);
                const dpPercent = toPercentage(dp, Object.keys(prevSnapshots).length);
                mergeDataPoints(plotData, dpPercent, MAX_LEN);
                prevSnapshots = snapshots;

                console.clear();
                console.log(
                    plot(
                        [
                            plotData.newHighs,
                            plotData.newLows,
                            plotData.aboveOpens,
                            plotData.abovePrevHighs,
                            plotData.belowPrevLows,
                        ],
                        config,
                    ),
                );
            } else {
                prevSnapshots = snapshots;
            }
        } catch (e) {
            logger.error(e);
        }
        await sleep(60000);
    }
})();
