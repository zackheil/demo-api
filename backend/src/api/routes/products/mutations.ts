import { ProductDeleteSchema, ProductPatchSchema, ProductPostSchema } from "@project/core/objects";
import { HttpError, makeStandardJsonResponse, validate } from "@rapidstack/lambda";
import { productTable } from "../../../common/io.js";
import { DatabaseEntryLockedError, DatabaseEntryNotFoundError } from "../../../services/product-db.js";


export const productsPostHandler = validate(ProductPostSchema, async ({ validated }) => {
  const result = await productTable.createProduct(validated.body);

  return makeStandardJsonResponse({
    statusCode: 201,
    body: { product: result },
    headers: { 'location': `/products/${result.id}` }
  })
});

export const productsPatchHandler = validate(ProductPatchSchema, async ({ validated, logger }) => {
  const [id] = validated.pathParams || [];
  let result;
  
  try {
    result = await productTable.updateProduct({ ...validated.body, id });
  } catch (error) {
    if (error instanceof DatabaseEntryLockedError) throw new HttpError(409);
    if (error instanceof DatabaseEntryNotFoundError) throw new HttpError(404);

    logger.fatal({ msg: 'An error occurred while deleting the product', error });
  }

  return makeStandardJsonResponse({
    statusCode: 200,
    body: { product: result },
  })
});


export const productsDeleteHandler = validate(ProductDeleteSchema, async ({ validated, logger }) => {
  const [id] = validated.pathParams || [];
  let result;

  try {
    result = await productTable.deleteProduct(id);
  } catch (error) {
    if (error instanceof DatabaseEntryLockedError) throw new HttpError(409);
    if (error instanceof DatabaseEntryNotFoundError) throw new HttpError(404);

    logger.fatal({ msg: 'An error occurred while deleting the product', error });
  }

  return makeStandardJsonResponse({
    statusCode: 200,
    body: { product: result },
  })
});