import { APIGatewayProxyEventV2 } from "aws-lambda";
import crypto from "node:crypto";

export const hashedAgent = (event: APIGatewayProxyEventV2) => {
    const userAgent = event.headers["user-agent"];
    if(!userAgent) return undefined;
    const hash = crypto.createHash("sha1");
    hash.update(userAgent);
    return hash.digest("hex");
}
