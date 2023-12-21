import type { SSTConfig } from 'sst';
import { ConfigManager as config, StackManager as stacks } from './aws/index.js';

export default { config, stacks } satisfies SSTConfig;
