import { it } from "mocha";
import { issue } from "allure-js-commons/new";

it("a test with a url only issue link", async () => {
  await issue("https://foo.bar");
});
