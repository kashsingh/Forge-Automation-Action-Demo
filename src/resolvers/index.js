import Resolver from "@forge/resolver";
import api from "@forge/api";

const resolver = new Resolver();

resolver.define("getHelloFromResolver", async () => {
  return "Hello World!"
});

export const handler = resolver.getDefinitions();
