import { HttpError } from "@rapidstack/lambda";
import { TypeSafeApiHandlerHooks } from "@rapidstack/lambda/dist/handlers/type-safe-api/types";
import { rate } from "src/io";
import { hashedAgent } from "src/utils";

export const rateLimitGuard: TypeSafeApiHandlerHooks['onRequestStart'] = async (props) => {
    const { event, logger } = props;

    const ip = event.requestContext.http.sourceIp;
    const agentHash = hashedAgent(event);

    const remainingTokens = await rate.getRemainingTokens(agentHash ?? ip);
    logger.debug({ msg: 'remaining tokens', remainingTokens, ip, agentHash });

    if (remainingTokens === undefined) {
        logger.debug({ msg: 'adding user to rate limit db', ip, agentHash });
        await rate.addUser({ ip, hash: agentHash });
    }

    if(remainingTokens) await rate.subtractToken(agentHash ?? ip);
    if(remainingTokens === 0) throw new HttpError(429);

    return undefined;
}