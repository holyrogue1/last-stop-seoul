// Both upstreams expose public data. The Seoul sample is limited to Seoul Station.
export const RAIL_URL = "http://swopenapi.seoul.go.kr/api/subway/sample/json/realtimeStationArrival/0/5/%EC%84%9C%EC%9A%B8";
const WEATHER_URL = "https://api.open-meteo.com/v1/forecast?latitude=37.5547&longitude=126.9707&current=temperature_2m,precipitation,weather_code&timezone=Asia%2FSeoul";
const CROWD_URL = "http://openapi.seoul.go.kr:8088/sample/xml/citydata_ppltn/1/5/%EA%B4%91%ED%99%94%EB%AC%B8%C2%B7%EB%8D%95%EC%88%98%EA%B6%81";

function localTimestamp(value) {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}(:\d{2})?$/.test(value)
    ? Date.parse(value.replace(" ", "T") + "+09:00") : NaN;
}

export function parseWeather(data, now) {
  const value = data?.current;
  const time = localTimestamp(value?.time);
  if (!Number.isFinite(time) || Math.abs(now - time) > 30 * 60_000 ||
      !Number.isFinite(value.temperature_2m) || !Number.isFinite(value.weather_code) ||
      !Number.isFinite(value.precipitation)) return null;
  return {
    time: new Date(time).toISOString(),
    temp: value.temperature_2m,
    code: value.weather_code,
    rain: value.precipitation,
    wet: value.precipitation > 0 || [51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 71, 73, 75, 77, 80, 81, 82, 85, 86, 95, 96, 99].includes(value.weather_code),
  };
}

export function parseRail(data, now) {
  const payload = data?.realtimeArrivalList;
  if (!Array.isArray(payload)) return null;
  const rows = [];
  for (const row of payload) {
    const time = localTimestamp(row.recptnDt);
    const seconds = Number(row.barvlDt);
    if (row.stationName && row.stationName !== "서울") continue;
    if (row.statnNm !== "서울" || !Number.isFinite(time) || time > now + 60_000 ||
        now - time > 120_000 || row.barvlDt === "" || row.barvlDt == null ||
        !Number.isFinite(seconds) || seconds < 0 || seconds > 7200 ||
        typeof row.trainLineNm !== "string" || typeof row.subwayId !== "string") continue;
    const code = String(row.arvlCd ?? "");
    // Past estimates, departed trains and non-boarding rows aren't future waits.
    if (code === "2" || code === "99" || seconds * 1000 < now - time - 15_000) continue;
    rows.push({
      line: row.subwayId, direction: row.trainLineNm.slice(0, 80),
      wait: Math.max(0, Math.ceil((seconds - Math.max(0, now - time) / 1000) / 60)),
      time: new Date(time).toISOString(),
    });
  }
  rows.sort((a, b) => a.wait - b.wait);
  if (!rows.length) return null;
  return {
    time: rows.map((row) => row.time).sort().at(-1), rows,
    cityHall: rows.find((row) => row.line === "1001" && row.direction.includes("시청방면")) ?? null,
    airport: rows.find((row) => row.line === "1065" && /인천공항/.test(row.direction)) ?? null,
  };
}

async function readJson(url, fetcher) {
  const response = await fetcher(url, { signal: AbortSignal.timeout(5500), headers: { accept: "application/json" } });
  if (!response.ok) throw new Error("Upstream data unavailable");
  return response.json();
}

export function parseCrowd(xml, now) {
  const field = (name) => xml.match(new RegExp(`<${name}>([^<]+)</${name}>`))?.[1];
  const time = localTimestamp(field("PPLTN_TIME"));
  const level = ["여유", "보통", "약간 붐빔", "붐빔"].indexOf(field("AREA_CONGEST_LVL"));
  if (field("AREA_NM") !== "광화문·덕수궁" || level < 0 ||
      !Number.isFinite(time) || Math.abs(now - time) > 45 * 60_000) return null;
  return { level, time: new Date(time).toISOString() };
}

async function readCrowd(fetcher, now) {
  const result = await fetcher(CROWD_URL, { signal: AbortSignal.timeout(5500) });
  return result.ok ? parseCrowd(await result.text(), now) : null;
}

let recent = null;
let pending = null;

export async function liveSnapshot(fetcher = fetch, now = Date.now()) {
  const items = await Promise.allSettled([readJson(RAIL_URL, fetcher), readJson(WEATHER_URL, fetcher), readCrowd(fetcher, now)]);
  return {
    fetchedAt: new Date(now).toISOString(),
    rail: items[0].status === "fulfilled" ? parseRail(items[0].value, now) : null,
    weather: items[1].status === "fulfilled" ? parseWeather(items[1].value, now) : null,
    crowd: items[2].status === "fulfilled" ? items[2].value : null,
  };
}

export async function serveLive() {
  if (!recent || Date.now() - Date.parse(recent.fetchedAt) > 25_000) {
    pending ??= liveSnapshot().then((value) => { recent = value; return value; })
      .finally(() => { pending = null; });
    await pending;
  }
  return Response.json(recent, { headers: { "cache-control": "private, max-age=20" } });
}
