import { expect, it } from "vitest";
import { Stage, Status } from "allure-js-commons";
import { runVitestInlineTest } from "../../utils.js";

it("handles single lambda step", async () => {
  const { tests } = await runVitestInlineTest(`
    import { test } from "vitest";
    import { step } from "allure-vitest";

    test("steps", async (t) => {
      await step(t, "step", () => {});
    });
  `);

  expect(tests).toHaveLength(1);
  expect(tests[0].steps).toHaveLength(1);
  expect(tests[0].steps).toContainEqual(
    expect.objectContaining({
      name: "step",
    }),
  );
});

it("handles single lambda step with attachment", async () => {
  const { tests, attachments } = await runVitestInlineTest(`
    import { test } from "vitest";
    import { step, attachment } from "allure-vitest";

    test("steps", async (t) => {
      await step(t, "step", async () => {
        await attachment(t, "foo.txt", Buffer.from("bar"), "text/plain");
      });
    });
  `);

  expect(tests).toHaveLength(1);
  expect(tests[0].steps).toHaveLength(1);
  expect(tests[0].steps[0].attachments).toHaveLength(1);

  const [attachment] = tests[0].steps[0].attachments;

  expect(attachment.name).toBe("foo.txt");
  expect(attachment.type).toBe("text/plain");
  expect(Buffer.from(attachments[attachment.source] as string, "base64").toString("utf8")).toBe("bar");
});

it("handles nested lambda steps", async () => {
  const { tests } = await runVitestInlineTest(`
    import { test } from "vitest";
    import { step } from "allure-vitest";

    test("steps", async (t) => {
      await step(t, "step 1", async () => {
        await step(t, "step 2", async () => {
          await step(t, "step 3", () => {
          });
        });
      });
    });
  `);

  expect(tests).toHaveLength(1);
  expect(tests[0].steps).toHaveLength(1);
  expect(tests[0].steps[0]).toMatchObject({
    name: "step 1",
    status: Status.PASSED,
    stage: Stage.FINISHED,
  });
  expect(tests[0].steps[0].steps).toHaveLength(1);
  expect(tests[0].steps[0].steps[0]).toMatchObject({
    name: "step 2",
    status: Status.PASSED,
    stage: Stage.FINISHED,
  });
  expect(tests[0].steps[0].steps[0].steps).toHaveLength(1);
  expect(tests[0].steps[0].steps[0].steps[0]).toMatchObject({
    name: "step 3",
    status: Status.PASSED,
    stage: Stage.FINISHED,
  });
});
