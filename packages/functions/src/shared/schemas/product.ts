import { 
    object, 
    number, 
    string, 
    maxValue, 
    minValue, 
    notValue, 
    coerce, 
    optional, 
    uuid, 
    enum_, 
    boolean,
    Output
} from "valibot";
import { SortOptions } from "./db";

export const ProductSchema = object({
    id: string([uuid()]),
    name: string(),
    description: string(),
    price: number(),
    image: string(),
    active: boolean()
});

export type Product = Output<typeof ProductSchema>;

export const ProductGetSchema = {
    qsp: optional(
        object({
            'limit': optional(
                coerce(
                    number([
                        minValue(1, 'the minimum limit is 1'), 
                        maxValue(5, 'the maximum limit is 10')
                    ]), 
                    (val) => Number(val)
                )
            ),
            'max-price': optional(coerce(number([notValue(0), minValue(0)]), (val) => Number(val))),
            'min-price': optional(coerce(number([notValue(0), minValue(0)]), (val) => Number(val))),
            'name': optional(coerce(string(), (value) => (value as string).toLowerCase())),
            'page': optional(coerce(number([minValue(1)]), (value) => Math.floor(value as number))),
            'sort': optional(enum_(SortOptions)),
        })
    )
}

export const ProductPostSchema = {
    body: object({
        name: string(),
        description: string(),
        price: number(),
        image: string(),
    })
}

export const ProductDeleteSchema = {
    body: object({
        id: string([uuid()])
    })
}
