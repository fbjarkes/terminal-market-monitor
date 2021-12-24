import 'dotenv/config';
import { runApp } from './app';

import { logger } from './utils/logger';

(async () => {
	logger.info(`Env: FOO=${process.env.FOO}`);
	const res = await runApp();
	console.log(`Result: ${res}`);
})();
