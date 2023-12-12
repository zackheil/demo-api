import { HttpError } from "@rapidstack/lambda";
import { TypeSafeApiHandlerHooks } from "@rapidstack/lambda/dist/handlers/type-safe-api/types";
import { hashedAgent } from "src/utils";

export const authGuard: TypeSafeApiHandlerHooks['onRequestStart'] = async (props) => {
    const { event } = props;

    const isAdminVerb = event.requestContext.http.method !== 'GET';
    const isLoggedIn = event.cookies?.some(cookie => cookie.startsWith('session='));
    const route = event.requestContext.http.path;
    if(isAdminVerb && !isLoggedIn && route.includes('/products')) {
        throw new HttpError(401);
    }

    return undefined
}


