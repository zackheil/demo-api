import { validate } from '@rapidstack/lambda';
import {
  object,
  optional,
  enum_,
  Output,
} from 'valibot';
import { 
  FullSchema,
  IdPathParamSchema, 
  MaxPriceQspSchema, 
  MinPriceQspSchema, 
  PaginationQspSchema, 
  PatchBodySchema, 
  PerPageQspSchema, 
  PostBodySchema, 
  SearchQspSchema 
} from './raw.js';

type ValidatorSchema = Parameters<typeof validate>[0];

export const ProductSortOptions = {
  PRICE_ASC: 'price-asc',
  PRICE_DESC: 'price-desc',
  NAME_ASC: 'name-asc',
  NAME_DESC: 'name-desc',
} as const;

export const ProductSchema = object(FullSchema);
export type Product = Output<typeof ProductSchema>;
export type ProductNoId = Output<typeof ProductPostSchema['body']>;

export const ProductGetSchema = {
  qsp: optional(
    object({
      'per-page': optional(PerPageQspSchema),
      'max-price': optional(MaxPriceQspSchema),
      'min-price': optional(MinPriceQspSchema),
      'search': optional(SearchQspSchema),
      'page': optional(PaginationQspSchema),
      'sort': optional(enum_(ProductSortOptions)),
    })
  ),
  pathParams: optional(IdPathParamSchema),
} satisfies ValidatorSchema;
export type ProductGetFilterCriteria = Output<typeof ProductGetSchema["qsp"]>;

export const ProductPostSchema = {
  body: object(PostBodySchema),
} satisfies ValidatorSchema;

export const ProductPatchSchema = {
  body: object(PatchBodySchema),
  pathParams: IdPathParamSchema,
} satisfies ValidatorSchema;

export const ProductDeleteSchema = {
  pathParams: IdPathParamSchema,
} satisfies ValidatorSchema;
