import 'dotenv/config';
import { lightgreen, red, plot, PlotConfig } from 'asciichart';

import { logger } from './utils/logger';
import { getNewHighs, getNewLows, sleep } from './utils/helper';

const MAX_LEN = 100; // TODO: if terminal width is less than 100, use that instead

(async () => {
    logger.info(`Env: APY_KEY=${process.env.API_KEY}`);
    const h: number[] = [];
    const l: number[] = [];

    const config: PlotConfig = { offset: 2, colors: [lightgreen, red] };

    h.push(0);
    l.push(0);
    while (1) {
        await Promise.all([getNewHighs(), getNewLows()]).then(([high, low]) => {
            if (h.length === MAX_LEN) {
                h.shift();
                l.shift();
            }
            //h.push((high / NBR_STOCKS) * 100);
            //l.push((low / NBR_STOCKS) * 100);
            h.push(high + h[h.length - 1]);
            l.push(low + l[l.length - 1]);
        });
        //console.log(h);

        console.clear();
        console.log(plot([h, l], config));
        await sleep(500);
    }
})();
