import { TypedApiRouteConfig } from '@rapidstack/lambda';
import { productsHandler } from './routes/products/index.js';
import { errorsHandler } from './routes/errors/index.js';

export const routes = {
  v1: {
    products: productsHandler,
    errors: errorsHandler
  },
} as const satisfies TypedApiRouteConfig;
