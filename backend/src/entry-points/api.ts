import { toolkit } from '../common/toolkit.js';
import { routes } from '../api/index.js';
import { TypeSafeApiHandler } from '@rapidstack/lambda';

const router = toolkit.create(TypeSafeApiHandler, { devMode: true });
export const handler = router(routes);
