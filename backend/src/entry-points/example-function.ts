import { GenericHandler } from '@rapidstack/lambda';

import { toolkit } from '../common/toolkit.js';

const wrapper = toolkit.create(GenericHandler);

export const handler = wrapper(async ({logger}) => {
  logger.info('This is a log message!');
  
  return 'Hello, world!';
});
