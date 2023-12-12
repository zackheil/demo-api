import { StackContext, Api, Function } from "sst/constructs";

export function main({ stack }: StackContext) {
  const fn = new Function(stack, "MyFunction", {
    handler: "packages/functions/src/api/index.handler",
    url: true
  });

  const api = new Api(stack, "MyApi", { routes: { $default: fn } });

  stack.addOutputs({
    "ApiUrl": api.url,
    "FnUrl": fn.url,
  });

  /* 
   ApiUrl: https://16hy5yumx2.execute-api.us-east-1.amazonaws.com
   FnUrl: https://nowaimgv76jxglftuaoilxmuli0vlxjp.lambda-url.us-east-1.on.aws/
  */
}
