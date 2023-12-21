import {
  number,
  string,
  maxValue,
  minValue,
  notValue,
  coerce,
  optional,
  uuid,
  tuple,
  integer,
  url,
} from 'valibot';

export const IdPathParamSchema = tuple([string([uuid()])]);

export const PerPageQspSchema = coerce(
  number([
    notValue(Infinity, 'The per-page value was not a valid number'),
    notValue(-Infinity, 'The per-page value was not a valid number'),
    notValue(NaN, 'The per-page value was not a valid number'),
    minValue(1, 'The minimum per-page value is 1'), 
    maxValue(10, 'The maximum per-page value is 10')
  ]), 
  (val) => Number(val)
);

export const MaxPriceQspSchema = coerce(
  number([
    notValue(Infinity, 'The max-price value was not a valid number'),
    notValue(-Infinity, 'The max-price value was not a valid number'),
    notValue(NaN, 'The max-price value was not a valid number'),
    minValue(0, 'The minimum max-price must be greater than 0'), 
    notValue(0, 'The max-price value cannot be 0'),
  ]), 
  (val) => Number(val)
);

export const MinPriceQspSchema = coerce(
  number([
    notValue(Infinity, 'The min-price value was not a valid number'),
    notValue(-Infinity, 'The min-price value was not a valid number'),
    notValue(NaN, 'The min-price value was not a valid number'),
    minValue(0, 'The minimum min-price value is 0'), 
  ]), 
  (val) => Number(val)
);

export const PaginationQspSchema = coerce(
  number([
    integer('The page must be an integer'),
    notValue(Infinity, 'The page value was not a valid number'),
    notValue(-Infinity, 'The page value was not a valid number'),
    notValue(NaN, 'The page value was not a valid number'),
    notValue(0, 'The page must be greater than 0'), 
    minValue(0, 'The page must be greater than 0') 
  ]), 
  (val) => Number(val)
);

export const SearchQspSchema = coerce(
  string(), 
  (value) => (value as string).trim().toLowerCase()
);

export const FullSchema = {
  id: string([uuid('Product id must be a valid uuid')]),
  name: string('Product name is required'),
  description: string('Product description is required'),
  price: number('Product price is required'),
  image: string([url('Product image url is required')]),
};

export const PostBodySchema = {
  name: string('Product name is required'),
  description: string('Product description is required'),
  price: number('Product price is required'),
  image: string([url('Product image url is required')]),
};

export const PatchBodySchema = {
  name: optional(string('Product name must be a string')),
  description: optional(string('Product description must be a string')),
  price: optional(number('Product price must be a number')),
  image: optional(string([url('Product image must be a valid url')])),
};