import { makeStandardJsonResponse, validate } from "@rapidstack/lambda";
import { object, string } from "valibot";

const LoginPostValidator = object({
    username: string(),
    password: string(),
});


export const LoginVerbHandlers = {
    post: validate({ body: LoginPostValidator }, async ({ validated, rawEvent }) => {
        return makeStandardJsonResponse({ 
            body: { user: validated.body.username },
            cookies: {
                'session': {
                    value: uuidv4(),
                    options: {
                        domain: rawEvent.requestContext.domainName,
                        path: '/',
                        maxAge: 60 * 2, // 2 minutes
                        httpOnly: true,
                        secure: true,
                        sameSite: 'strict',
                    }
                }
            }
        });
    })
} as const;

function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
        return v.toString(16);
    });
}

export const LogoutVerbHandlers = {
    post: validate({}, async ({ rawEvent }) => {
        return makeStandardJsonResponse({ 
            body: { message: 'Logged out' },
            cookies: {
                'session': {
                    value: '',
                    options: {
                        domain: rawEvent.requestContext.domainName,
                        path: '/',
                        expiresUnix: new Date().getTime(),
                        httpOnly: true,
                        secure: true,
                        sameSite: 'strict',
                    }
                }
            }
        });
    })
} as const;