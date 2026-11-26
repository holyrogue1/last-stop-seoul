import test from "node:test";
import assert from "node:assert/strict";
import { places, opening, makePlan, presets, minutes, hhmm } from "../web/planner.js";
import { discover } from "../web/discover.js";
import { interpretConciergeQuery, parseConciergeRequest, serveConcierge, youtubeId } from "../worker/concierge.mjs";
import { parseWithSageMaker, sageConfigured } from "../worker/sagemaker.mjs";

function fixture(overrides = {}) {
  return {
    places, opening, makePlan, presets, discover, minutes, hhmm, sageConfigured,
    clock: () => ({ date: "2026-11-27", time: "13:00" }),
    fetcher: async () => Response.json({}, { status: 503 }),
    live: async () => ({ weather: null, rail: null }),
    infer: parseWithSageMaker,
    ...overrides,
  };
}

const endpoint = "https://travel.example/api/concierge";
function post(value, options = {}) {
  return new Request(endpoint, {
    method: "POST",
    headers: { "content-type": "application/json", origin: "https://travel.example" },
    body: JSON.stringify(value),
    ...options,
  });
}

test("extracts explicit Korean and English times, duration, and travel preferences", () => {
  const conditions = interpretConciergeQuery("오후 1시에 출발하고 오후 5시까지 복귀해요. 도보 15분, 맛집이요.");
  assert.deepEqual(conditions, {
    start: "13:00", end: "17:00", mode: "planned", goal: "plan", interest: "food", maxWalk: 15,
  });
  assert.deepEqual(interpretConciergeQuery("Leave now. I have 2 hours 30 minutes. Quiet indoor gallery."), {
    duration: 150, mode: "now", interest: "quiet", goal: "plan", indoors: true,
  });
  assert.equal(interpretConciergeQuery("I need to be back by 5:30 pm.").end, "17:30");
  assert.equal(interpretConciergeQuery("오전 10시 반까지 복귀").end, "10:30");
  assert.equal(interpretConciergeQuery("오전 7시 출발").end, undefined);
  assert.equal(interpretConciergeQuery("오후 1시에 출발해서 5시까지, 맛집 추천해줘").end, "17:00");
  assert.equal(interpretConciergeQuery("아침 8시 반에 출발해서 2시간 동안 구경하고 싶어요").start, "08:30");
  assert.equal(interpretConciergeQuery("지금 서울역에서 2시간 안에 갈 만한 곳").duration, 120);
});

test("API rejects cross-origin, methods, unsupported types, oversized bodies and invalid duplicate stops", async () => {
  const deps = fixture();
  assert.equal((await serveConcierge(new Request(endpoint), {}, deps)).status, 405);
  assert.equal((await serveConcierge(post({}, { headers: { origin: "https://elsewhere.example", "content-type": "application/json" } }), {}, deps)).status, 403);
  assert.equal((await serveConcierge(post({}, { headers: { "content-type": "text/plain" } }), {}, deps)).status, 415);
  assert.equal((await serveConcierge(post({ kind: "message", query: "놓".repeat(3000) }), {}, deps)).status, 400);
  const route = { kind: "route", start: "13:00", end: "17:00", stops: [{ id: "market" }, { id: "market" }] };
  assert.equal((await serveConcierge(post(route), {}, deps)).status, 400);
  assert.equal(parseConciergeRequest({ ...route, stops: [{ id: "hongdae" }] }, places), null);
});

test("message recommends the correct Seoul Station stop and narrows ranking after a follow-up", async () => {
  const deps = fixture();
  const first = await (await serveConcierge(post({
    kind: "message", query: "오후 1시에 출발하고 오후 5시까지 복귀해요. 맛집이요.",
  }), {}, deps)).json();
  assert.equal(first.engine, "rules");
  assert.equal(first.state, "visit");
  assert.equal(first.options[0].id, "market");
  assert.equal(first.options[0].arrival, "13:14");
  assert.equal(first.options[0].leave, "16:26");
  const followup = await (await serveConcierge(post({
    kind: "message", query: "조용한 곳으로 바꿔줘", context: first.context,
  }), {}, deps)).json();
  assert.equal(followup.context.end, "17:00");
  assert.equal(followup.options[0].id, "station");
  assert.equal(followup.context.interest, "quiet");
});

test("now applies weather and trusted train readings; themes can browse without a deadline", async () => {
  const deps = fixture({ live: async () => ({ weather: { wet: true }, rail: { cityHall: { wait: 1 } } }) });
  const current = await (await serveConcierge(post({
    kind: "message", lang: "en", query: "Leaving now and back by 5 pm. Quiet place, please.",
  }), {}, deps)).json();
  assert.deepEqual(current.live, { weather: true, rail: true });
  assert.equal(current.options.find((option) => option.id === "museum").mode, "transit");
  assert.ok(!current.options.some((option) => option.id === "palace"));
  const browse = await (await serveConcierge(post({
    kind: "message", query: "노원 트레킹",
  }), {}, deps)).json();
  assert.equal(browse.state, "browse");
  assert.equal(browse.context.end, undefined);
  assert.ok(browse.options.some((option) => option.id === "buramsan-trail"));
  assert.ok(browse.options.every((option) => !option.canAdd));
});

test("route has ordered waypoints, dwell time, required buffer, and explicit estimates", async () => {
  const deps = fixture();
  const input = {
    kind: "route", start: "13:00", end: "17:00", stops: [{ id: "market", dwell: 35 }, { id: "seoullo", dwell: 20 }],
  };
  const path = await (await serveConcierge(post(input), {}, deps)).json();
  assert.equal(path.feasible, true);
  assert.equal(path.reserve, 20);
  assert.equal(path.routing, "estimate");
  assert.equal(path.arrival, "14:37");
  assert.equal(path.stops[1].arrival, "14:10");
  const waypoints = new URL(path.mapUrl).searchParams.get("waypoints");
  assert.equal(waypoints, "남대문시장 갈치조림|서울로 7017");
  const tooLate = await (await serveConcierge(post({ ...input, end: "14:56" }), {}, deps)).json();
  assert.equal(tooLate.feasible, false);
});

test("route checks closing, last entry, and rain, and mapped routing uses only fixed catalog coordinates", async () => {
  const deps = fixture({
    clock: () => ({ date: "2026-11-27", time: "20:15" }),
    live: async () => ({ weather: { wet: true }, rail: null }),
    fetcher: async (url) => {
      assert.match(url, /^https:\/\/routing\.openstreetmap\.de\/routed-foot\/route\//);
      assert.match(url, /126\.97\d+,37\.55\d+/);
      return Response.json({ routes: [{ legs: [{ duration: 780 }, { duration: 610 }, { duration: 361 }] }] });
    },
  });
  const mapped = await (await serveConcierge(post({
    kind: "route", start: "13:00", end: "22:00", mode: "now", stops: [{ id: "market" }, { id: "seoullo" }],
  }), { CONCIERGE_OSRM: "on" }, deps)).json();
  assert.equal(mapped.routing, "mapped");
  assert.equal(mapped.stops[0].arrival, "20:28");
  assert.equal(mapped.stops[0].reason, "last-entry");
  assert.equal(mapped.stops[1].reason, "rain");
  assert.equal(mapped.feasible, false);
  const passed = await serveConcierge(post({
    kind: "route", start: "13:00", end: "19:00", mode: "now", stops: [{ id: "market" }],
  }), {}, deps);
  assert.equal(passed.status, 400);
});

test("accepts official YouTube URLs while fetching only canonical oEmbed and flagging unverified names", async () => {
  const id = "Sra6Gp-wL_E";
  assert.equal(youtubeId("https://youtu.be/" + id + "?si=test"), id);
  assert.equal(youtubeId("https://www.youtube.com/shorts/" + id), id);
  assert.equal(youtubeId("https://www.youtube.com.example.net/watch?v=" + id), null);
  assert.equal(youtubeId("https://youtu.be@example.net/" + id), null);
  assert.equal(youtubeId("file:///etc/passwd"), null);
  const calls = [];
  const deps = fixture({ fetcher: async (url) => {
    calls.push(new URL(url));
    return Response.json({ title: "남대문 갈치조림 골목", author_name: "Food channel" });
  } });
  const data = await (await serveConcierge(post({
    kind: "video", url: "https://youtu.be/" + id, text: "가게: 직접 적은 식당\n칼국수",
  }), {}, deps)).json();
  assert.equal(data.metadata, "youtube");
  assert.equal(data.author, "Food channel");
  assert.equal(data.candidates[0].placeId, "market");
  assert.deepEqual(data.candidates[0].menu, ["갈치조림", "칼국수"]);
  assert.equal(data.candidates[1].placeId, null);
  assert.equal(calls.length, 1);
  assert.equal(calls[0].origin + calls[0].pathname, "https://www.youtube.com/oembed");
  assert.equal(calls[0].searchParams.get("url"), data.url);
});

test("SageMaker SigV4 invocation uses configured endpoint and model JSON is constrained by travel facts", async () => {
  const env = {
    AWS_REGION: "ap-southeast-2",
    SAGEMAKER_ENDPOINT_NAME: "seoul-demo",
    AWS_ACCESS_KEY_ID: "unit-test-access",
    AWS_SECRET_ACCESS_KEY: "unit-test-value",
    AWS_SESSION_TOKEN: "unit-test-token",
  };
  let calls = 0;
  const deps = fixture({ fetcher: async (url, request) => {
    assert.equal(url, "https://runtime.sagemaker.ap-southeast-2.amazonaws.com/endpoints/seoul-demo/invocations");
    assert.match(request.headers.authorization, /^AWS4-HMAC-SHA256 Credential=unit-test-access\/\d{8}\/ap-southeast-2\/sagemaker\/aws4_request, SignedHeaders=content-type;host;x-amz-date;x-amz-security-token, Signature=[a-f0-9]{64}$/);
    assert.equal(request.headers["x-amz-security-token"], "unit-test-token");
    assert.ok(!request.body.includes(env.AWS_SECRET_ACCESS_KEY));
    calls++;
    return Response.json({ choices: [{ message: { content: JSON.stringify({
      goal: "plan", interest: "food", start: "13:00", end: "17:00", fakeHours: 24, secret: "untrusted string",
    }) } }] });
  } });
  const data = await (await serveConcierge(post({ kind: "message", query: "추천해줘" }), env, deps)).json();
  assert.equal(calls, 1);
  assert.equal(data.engine, "sagemaker");
  assert.equal(data.options[0].id, "market");
  assert.equal(data.options[0].leave, "16:26");
  assert.equal(data.context.fakeHours, undefined);
  assert.equal(data.context.secret, undefined);
});
