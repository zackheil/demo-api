import { ProductDatabase } from "./services";
import { RateLimitDatabase } from "./services/rate-limit-db";
import { toolkit } from "./toolkit";

export const db = toolkit.create(ProductDatabase, { latency: 50 })
export const rate = toolkit.create(RateLimitDatabase, { latency: 10 })