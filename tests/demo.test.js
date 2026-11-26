import assert from "node:assert/strict";
import test from "node:test";
import { makePlan, opening, seoulClock } from "../web/planner.js";
import { keywordKey, parseTrends } from "../web/trends.js";
import { liveSnapshot, parseCrowd, parseRail, parseWeather } from "../worker/live.mjs";

const date = "2026-11-26";
const now = Date.parse(date + "T06:10:00Z");
const weather = { current: { time: date + "T15:00", weather_code: 61, temperature_2m: 12, precipitation: 0 } };
const train = { statnNm: "서울", recptnDt: date + " 15:09:50", barvlDt: "95", trainLineNm: "청량리행 - 시청방면", subwayId: "1001", arvlCd: "5" };
const crowd = `<row><AREA_NM>광화문·덕수궁</AREA_NM><PPLTN_TIME>${date} 15:00:00</PPLTN_TIME><AREA_CONGEST_LVL>약간 붐빔</AREA_CONGEST_LVL></row>`;

test("the departure windows and interests produce different viable plans", () => {
  const inputs = { date, start: "15:10", end: "17:00" };
  assert.equal(seoulClock(new Date(now)).time, "15:10");
  assert.equal(makePlan({ ...inputs, start: "04:30" }).state, "dawn");
  assert.equal(makePlan({ ...inputs, start: "08:30", end: "10:30" }).best.place.id, "seoullo");
  assert.equal(makePlan(inputs).best.place.id, "station");
  assert.equal(makePlan({ ...inputs, interest: "food" }).best.place.id, "market");
  assert.equal(makePlan({ ...inputs, end: "15:30" }).state, "return");
  assert.equal(makePlan({ ...inputs, end: "14:30" }).state, "invalid");
  assert.equal(opening("station", "2026-12-12").status, "unknown");
});

test("weather, verified direction and regional crowd signals affect ranking", () => {
  const inputs = { date, start: "15:10", end: "17:00" };
  const rail = parseRail({ realtimeArrivalList: [train] }, now);
  assert.equal(rail.cityHall.wait, 2);
  assert.equal(parseRail({ realtimeArrivalList: [{ ...train, arvlCd: "2" }] }, now), null);
  assert.equal(parseWeather(weather, now).wet, true);
  assert.equal(parseWeather(weather, now + 3_600_000), null);
  assert.equal(parseCrowd(crowd, now).level, 2);
  assert.equal(parseCrowd(crowd.replace("광화문·덕수궁", "강남"), now), null);
  const busy = makePlan({ ...inputs, interest: "busy", live: { rail, crowd: { level: 2 } } });
  assert.equal(busy.best.place.id, "palace");
  assert.equal(busy.best.transit, true);
  assert.equal(makePlan({ ...inputs, live: { weather: { wet: true } } }).options.find((item) => item.place.id === "palace").reason, "rain");
});

test("the normalized API retains partial data under upstream failure", async () => {
  const fakeFetch = async (url) => {
    if (url.includes("open-meteo")) return Response.json(weather);
    if (url.includes("realtimeStationArrival")) return Response.json({ realtimeArrivalList: [train] });
    throw new Error("upstream offline");
  };
  const result = await liveSnapshot(fakeFetch, now);
  assert.deepEqual(Object.keys(result), ["fetchedAt", "rail", "weather", "crowd"]);
  assert.equal(result.fetchedAt, new Date(now).toISOString());
  assert.equal(result.crowd, null);
  assert.equal(result.weather.wet, true);
  assert.equal(result.rail.cityHall.line, "1001");
});

test("Google Trends exports preserve scale and match Korean keyword spelling", () => {
  const report = parseTrends("\uFEFF카테고리: 모든 카테고리\r\n\r\n일,화랑대철도공원: (서울),\"불암산 힐링타운: (서울)\"\r\n2026-11-10,12,<1\r\n2026-11-11,18,100");
  assert.deepEqual(report.range, ["2026-11-10", "2026-11-11"]);
  assert.equal(report.scores.get(keywordKey("불암산힐링타운")), 50.3);
  assert.equal(report.scores.get(keywordKey("화랑대철도공원")), 15);
  assert.throws(() => parseTrends("name,value\nhello,3"));
});
