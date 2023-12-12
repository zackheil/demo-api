import { SSTConfig } from "sst";
import { main } from "./stacks/MyStack";

export default {
  config(_input) {
    return {
      name: "oss-tb",
      region: "us-east-1",
    };
  },
  stacks(app) {
    app.stack(main);
  }
} satisfies SSTConfig;
