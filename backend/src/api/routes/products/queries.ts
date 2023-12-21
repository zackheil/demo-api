import { ApiHandlerReturn, BaseApiHandlerReturn, HttpError, makeStandardJsonResponse, validate } from "@rapidstack/lambda";
import { Product, ProductGetSchema } from "@project/core/objects";
import { Output } from "@project/core";
import { productTable } from "../../../common/io.js";

const ONE_WEEK = 3600 * 24 * 7;
type QueryCriteria = Output<typeof ProductGetSchema["qsp"]>;

export const productsOptionsHandler = async () => {
  return {
    headers: {
      'allow': 'DELETE, GET, HEAD, OPTIONS, PATCH, POST',
      'cache-control': `public, max-age=${ONE_WEEK}`,
    }
  } satisfies BaseApiHandlerReturn;
}

export const productsGetHandler = validate(ProductGetSchema, async ({ validated, event }) => {
  const [id] = validated.pathParams || [];
  const criteria = validated.qsp;
  const method = event.requestContext.http.method.toLowerCase();
  let result;
  
  if (id) result = await getById(id);
  else result = await getMany(criteria); 

  if (method === 'head') delete result.body;
  return result;
});

export const productsHeadHandler = productsGetHandler;

async function getMany(criteria?: QueryCriteria): Promise<ApiHandlerReturn> {
  const results = await productTable.getProducts(criteria);

  return makeStandardJsonResponse({
    statusCode: 200,
    body: {
      products: results,
    },
  });
}

async function getById(id: string): Promise<ApiHandlerReturn> {
  const result = await productTable.getProduct(id);

  if (!result) throw new HttpError(404, 'Product not found');

  return makeStandardJsonResponse({
    statusCode: 200,
    body: {
      product: result,
    },
  });
}