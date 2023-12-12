import { validate, makeStandardJsonResponse, HttpError } from "@rapidstack/lambda";
import { db } from "src/io";
import { ProductDeleteSchema, ProductGetSchema, ProductPostSchema, SortOptions } from "src/shared";
import { v4 } from "src/utils";


export const ProductsVerbHandlers = {
    get: validate(ProductGetSchema, async ({ validated }) => {
        const limit = validated.qsp?.['limit'] || 3;
        const maxPrice = validated.qsp?.['max-price'] || Infinity;
        const minPrice = validated.qsp?.['min-price'] || 0;
        const name = validated.qsp?.['name'] || '';
        const page = validated.qsp?.['page'] || 1;
        const sort = validated.qsp?.['sort'] || SortOptions.NAME_ASC;

        const products = await db.getProducts();

        const sortedProducts = products.sort((a, b) => {
            switch (sort) {
                case SortOptions.NAME_ASC:
                    return a.name.localeCompare(b.name);
                case SortOptions.NAME_DESC:
                    return b.name.localeCompare(a.name);
                case SortOptions.PRICE_ASC:
                    return a.price - b.price;
                case SortOptions.PRICE_DESC:
                    return b.price - a.price;
                default:
                    return 0;
            }
        });

        let filteredProducts = [];
        for (let i = 0; i < sortedProducts.length; i++) {
            let product = sortedProducts[i];
            if (product.price >= minPrice && 
                product.price <= maxPrice && 
                product.name.toLowerCase().includes(name) && 
                product.active) {
                const  { active, ...rest } = product;
                filteredProducts.push(rest);
            }
        }

        const totalPages = Math.ceil(filteredProducts.length / limit);
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        const pageProducts = filteredProducts.slice(startIndex, endIndex);

        return makeStandardJsonResponse({
            body: {
                products: pageProducts,
                totalPages,
                total: filteredProducts.length,
            }
        });
    }),
    post: validate(ProductPostSchema, async ({ validated }) => {
        const product = {
            id: v4(),
            active: true,
            ...validated.body,
        };

        await db.addProduct(product);

        return makeStandardJsonResponse({
            body: {
                product,
            }
        });
    }),
    delete: validate(ProductDeleteSchema, async ({ validated }) => {
        const product = await db.getProduct(validated.body.id);

        if (!product) throw new HttpError(404);
        if (!product.active) throw new HttpError(410);

        await db.deleteProduct(validated.body.id);

        return makeStandardJsonResponse({
            body: {
                product: product,
                deleteCount: 1,
            }
        });
    }),
} as const;