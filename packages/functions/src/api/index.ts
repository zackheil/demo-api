import { toolkit } from "../toolkit";

import { TypeSafeApiHandler, validate } from "@rapidstack/lambda";
import { TypeSafeApiHandlerHooks, TypedApiRouteConfig } from "@rapidstack/lambda/dist/handlers/type-safe-api/types";
import { array, object, string, uuid } from "valibot";
import { ProductsVerbHandlers, LoginVerbHandlers, LogoutVerbHandlers } from "./routes";
import { rateLimitGuard } from "./handler-hooks/rate-limiter";
import { authGuard } from "./handler-hooks";


const buildApi = toolkit.create(TypeSafeApiHandler, {
    devMode: true
});

const routes = {
    products: ProductsVerbHandlers,
    login: LoginVerbHandlers,
    logout: LogoutVerbHandlers,
    demo: {
        get: validate({ qsp: object({
            foo: string([uuid()])
        })}, async ({ validated }) => {
            return { body: { foo: validated.qsp.foo } }
        }),
        error: {
            get: validate({ qsp: array(object({
                foo: string([uuid()])
            }))}, async ({ validated }) => {
                return { body: { foo: validated.qsp[0].foo } }
            }),
        }
    } 
} satisfies TypedApiRouteConfig;

const hooks: TypeSafeApiHandlerHooks = {
    onRequestStart: async (props) => {
        // ignore the !... it's a type bug I'm working out

        await Promise.all([ 
            rateLimitGuard!(props),
            authGuard!(props),
            // analyticsProvider(props)
            // ... etc
        ]);

        return undefined;
    }
};

export const handler = buildApi(routes, hooks);