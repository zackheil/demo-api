import { ProductDatabase } from '../services/product-db.js';
import { toolkit } from './toolkit.js';

export const productTable = toolkit.create(ProductDatabase, { latency: 10 });
