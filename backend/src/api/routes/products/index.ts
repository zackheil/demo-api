import { 
  productsGetHandler,
  productsOptionsHandler,
  productsHeadHandler,
} from './queries.js';
import { 
  productsPostHandler,
  productsDeleteHandler,
  productsPatchHandler,
} from './mutations.js';

export const productsHandler = {
  options: productsOptionsHandler,
  get: productsGetHandler,
  head: productsHeadHandler,
  post: productsPostHandler,
  delete: productsDeleteHandler,
  patch: productsPatchHandler,
} as const;