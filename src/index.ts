import { init } from "app";
import "dotenv/config";

import { logger } from "./utils/logger";

(async () => {
  console.log(`Env: FOO=${process.env.FOO}`);
  const res = await init();
  console.log(`Result: ${res}`);
})();
