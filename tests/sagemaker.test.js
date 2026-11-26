import assert from "node:assert/strict";
import { createHash, createHmac } from "node:crypto";
import test from "node:test";
import { parseWithSageMaker } from "../worker/sagemaker.mjs";

const env = {
  AWS_REGION: "ap-southeast-2",
  SAGEMAKER_ENDPOINT_NAME: "seoul-test",
  AWS_ACCESS_KEY_ID: "fixture-access",
  AWS_SECRET_ACCESS_KEY: "fixture-signing-material",
  AWS_SESSION_TOKEN: "fixture-session",
};
const time = new Date("2026-11-26T04:00:00Z");
const hash = (value) => createHash("sha256").update(value).digest("hex");
const mac = (key, value) => createHmac("sha256", key).update(value).digest();

test("SageMaker invokes the fixed endpoint with a valid SigV4 request", async () => {
  const expected = { goal: "plan", end: "17:00", interest: "food" };
  const fetcher = async (url, request) => {
    assert.equal(url, "https://runtime.sagemaker.ap-southeast-2.amazonaws.com/endpoints/seoul-test/invocations");
    assert.equal(request.method, "POST");
    assert.equal(request.headers["x-amz-date"], "20261126T040000Z");
    assert.equal(request.headers["x-amz-security-token"], env.AWS_SESSION_TOKEN);
    const headers = "content-type;host;x-amz-date;x-amz-security-token";
    const canonical = "POST\n/endpoints/seoul-test/invocations\n\n" +
      "content-type:application/json\nhost:runtime.sagemaker.ap-southeast-2.amazonaws.com\n" +
      "x-amz-date:20261126T040000Z\nx-amz-security-token:fixture-session\n\n" +
      headers + "\n" + hash(request.body);
    const scope = "20261126/ap-southeast-2/sagemaker/aws4_request";
    const key = mac(mac(mac(mac("AWS4" + env.AWS_SECRET_ACCESS_KEY, "20261126"), "ap-southeast-2"), "sagemaker"), "aws4_request");
    const signature = mac(key, `AWS4-HMAC-SHA256\n20261126T040000Z\n${scope}\n${hash(canonical)}`).toString("hex");
    assert.equal(request.headers.authorization, `AWS4-HMAC-SHA256 Credential=fixture-access/${scope}, SignedHeaders=${headers}, Signature=${signature}`);
    const body = JSON.parse(request.body);
    assert.equal(body.messages[0].role, "system");
    assert.deepEqual(JSON.parse(body.messages[1].content), { query: "5시까지 먹자골목", context: { start: "13:00" } });
    assert.equal(request.body.includes(env.AWS_SECRET_ACCESS_KEY), false);
    return Response.json({ choices: [{ message: { content: JSON.stringify(expected) } }] });
  };
  assert.deepEqual(await parseWithSageMaker("5시까지 먹자골목", { start: "13:00" }, env, fetcher, time), expected);
});

test("TGI response is supported, and missing or rejected model data falls back", async () => {
  const configured = { ...env, SAGEMAKER_FORMAT: "tgi" };
  const fetcher = async (_, request) => {
    const body = JSON.parse(request.body);
    assert.equal(body.parameters.return_full_text, false);
    assert.match(body.inputs, /rainy day/);
    return Response.json([{ generated_text: "{\"indoors\":true}" }]);
  };
  assert.deepEqual(await parseWithSageMaker("rainy day", {}, configured, fetcher), { indoors: true });
  const noNetwork = () => assert.fail("unconfigured invocation attempted");
  assert.equal(await parseWithSageMaker("hi", {}, {}, noNetwork), null);
  assert.equal(await parseWithSageMaker("hi", {}, { ...env, SAGEMAKER_ENDPOINT_NAME: "x/../oops" }, noNetwork), null);
  assert.equal(await parseWithSageMaker("hi", {}, env, async () => new Response(null, { status: 403 })), null);
  assert.equal(await parseWithSageMaker("hi", {}, env,
    async () => Response.json({ choices: [{ message: { content: "unexpected prose" } }] })), null);
});
