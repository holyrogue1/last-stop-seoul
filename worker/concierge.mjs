const conciergeInterests = ["all", "food", "food-alley", "shop", "quiet", "busy", "romantic", "scenery", "night", "trekking"];
const conciergeModes = ["now", "dawn", "morning", "afternoon", "planned"];
const conciergeGoals = ["plan", "browse", "route", "video", "album"];
const conciergeTime = /^([01]\d|2[0-3]):[0-5]\d$/;
const conciergeVideoId = /^[A-Za-z0-9_-]{11}$/;
const conciergeRouteLimit = 3;
const conciergeBodyLimit = 8192;
const conciergeReserve = 20;

const conciergeObject = (value) => Boolean(value && typeof value === "object" && !Array.isArray(value));
const conciergeAllowed = (value, fields) => conciergeObject(value) && Object.keys(value).every((key) => fields.includes(key));
const conciergeInteger = (value, min, max) => Number.isInteger(value) && value >= min && value <= max;
const conciergeText = (value, max) => typeof value === "string" && value.length <= max;
const conciergeIsTime = (value) => typeof value === "string" && conciergeTime.test(value);
const conciergeSay = (lang, ko, en) => lang === "en" ? en : ko;

const conciergeConditions = {
  start: conciergeIsTime,
  end: conciergeIsTime,
  duration: (value) => conciergeInteger(value, 10, 720),
  mode: (value) => conciergeModes.includes(value),
  interest: (value) => conciergeInterests.includes(value),
  goal: (value) => conciergeGoals.includes(value),
  indoors: (value) => typeof value === "boolean",
  maxWalk: (value) => conciergeInteger(value, 1, 120),
};

function conciergeSlots(value) {
  if (!conciergeObject(value)) return {};
  return Object.fromEntries(Object.entries(conciergeConditions).flatMap(
    ([key, valid]) => valid(value[key]) ? [[key, value[key]]] : [],
  ));
}

export function parseConciergeRequest(value, places) {
  const lang = value?.lang ?? "ko";
  if (!["ko", "en"].includes(lang)) return null;
  switch (value?.kind) {
    case "message":
      if (!conciergeAllowed(value, ["kind", "lang", "query", "context"]) ||
          !conciergeText(value.query, 600) || !value.query.trim() ||
          (value.context !== undefined && !conciergeObject(value.context))) return null;
      return { kind: "message", lang, query: value.query.trim(), context: conciergeSlots(value.context) };
    case "route": {
      const validStop = (stop) => conciergeAllowed(stop, ["id", "dwell"]) &&
        places.some((place) => place.id === stop.id) &&
        (stop.dwell === undefined || conciergeInteger(stop.dwell, 10, 120));
      if (!conciergeAllowed(value, ["kind", "lang", "start", "end", "mode", "stops"]) ||
          !conciergeIsTime(value.start) || !conciergeIsTime(value.end) || (value.mode !== "now" && value.start >= value.end) ||
          (value.mode !== undefined && !conciergeModes.includes(value.mode)) ||
          !Array.isArray(value.stops) || !conciergeInteger(value.stops.length, 1, conciergeRouteLimit) ||
          !value.stops.every(validStop) || new Set(value.stops.map(({ id }) => id)).size !== value.stops.length) return null;
      return { ...value, lang };
    }
    case "video": {
      if (!conciergeAllowed(value, ["kind", "lang", "url", "text"]) || !conciergeText(value.url, 400) ||
          (value.text !== undefined && !conciergeText(value.text, 1800))) return null;
      const id = youtubeId(value.url);
      return id ? { kind: "video", lang, id, text: value.text?.trim() ?? "" } : null;
    }
    default:
      return null;
  }
}

export function youtubeId(text) {
  const clean = text.trim();
  if (conciergeVideoId.test(clean)) return clean;
  try {
    const url = new URL(/^https?:\/\//i.test(clean) ? clean : "https://" + clean);
    if (!["http:", "https:"].includes(url.protocol) || url.username || url.password || url.port) return null;
    let id;
    if (url.hostname === "youtu.be") id = url.pathname.slice(1);
    else if (["youtube.com", "www.youtube.com", "m.youtube.com"].includes(url.hostname)) {
      id = url.pathname === "/watch" ? url.searchParams.get("v") : url.pathname.match(/^\/(?:shorts|live|embed)\/([^/]+)\/?$/)?.[1];
    }
    return typeof id === "string" && conciergeVideoId.test(id) ? id : null;
  } catch {
    return null;
  }
}

const conciergeThemes = [
  ["food-alley", /먹자골목|먹자\s*거리|food alley/i],
  ["food", /맛집|먹거리|먹고|식당|식사|점심|저녁\s*(?:먹|식사)|food|eat\b|meal|lunch|dinner|restaurant/i],
  ["shop", /쇼핑|백화점|shopping|department store/i],
  ["quiet", /조용|한적|박물관|미술관|전시|quiet|peaceful|museum|gallery/i],
  ["busy", /북적|번화|사람\s*많|busy|lively|crowded|bustling/i],
  ["romantic", /낭만|데이트|romantic|date spot/i],
  ["night", /야경|night view/i],
  ["trekking", /트레킹|등산|둘레길|trekking|hike|hiking/i],
  ["scenery", /풍경|산책|경치|사진|scenery|scenic|stroll|viewpoint/i],
];
const conciergeDistricts = [
  ["nowon", /노원|nowon/i], ["gangnam", /강남|gangnam/i], ["songpa", /송파|잠실|songpa|jamsil/i],
  ["gangseo", /강서|마곡|gangseo|magok/i], ["seocho", /서초|반포|seocho|banpo/i],
  ["mapo", /마포|홍대|mapo|hongdae/i], ["gwangjin", /광진|건대|gwangjin|kondae/i],
  ["jung", /명동|중구|myeongdong|jung-gu/i], ["jongno", /종로|북악|jongno|bugak/i],
  ["yongsan", /용산|yongsan/i],
];

export function interpretConciergeQuery(query, context = {}) {
  const parsed = {};
  const times = [];
  const timePattern = /(?<![\d:])(오전|오후|새벽|아침|저녁)?\s*(\d{1,2})(?:(?::(\d{2})(?!\d))|(?:\s*시(?!간)(?:\s*(\d{1,2})\s*분|\s*(반))?)|(?=\s*(?:a\.?m\.?|p\.?m\.?)\b))\s*((?:a\.?m\.?|p\.?m\.?)\b)?/gi;
  for (const match of query.matchAll(timePattern)) {
    const [phrase, korean, hours, digital, handwritten, half, english] = match;
    const suffix = (english ?? "").toLowerCase();
    let hour = Number(hours);
    const minute = Number(digital ?? handwritten ?? (half ? 30 : 0));
    if (minute > 59 || hour > 23) continue;
    if (["오후", "저녁"].includes(korean) || suffix.startsWith("p")) hour = hour % 12 + 12;
    if (["오전", "새벽", "아침"].includes(korean) || suffix.startsWith("a")) hour %= 12;
    const before = query.slice(Math.max(0, match.index - 20), match.index);
    const after = query.slice(match.index + phrase.length, match.index + phrase.length + 14);
    const isEnd = /(?:까지|에?\s*(?:복귀|돌아|돌아와|도착)|return|back)\b/i.test(after) ||
      /^(?:까지|에?\s*(?:복귀|돌아|도착))/.test(after) ||
      /(?:until|by|return(?:\s+by)?|be back(?:\s+by)?)\s*$/i.test(before);
    const isStart = /^(?:부터|에?\s*출발)/.test(after) || /(?:start(?:ing)?|leave|from)\s*$/i.test(before);
    const ambiguous = !korean && !suffix && !digital && hour > 0 && hour < 12;
    times.push({ value: String(hour).padStart(2, "0") + ":" + String(minute).padStart(2, "0"), isEnd, isStart, ambiguous });
  }
  const start = times.find((time) => time.isStart) ?? (times.length > 1 && !times[0].isEnd ? times[0] : null);
  const end = [...times].reverse().find((time) => time.isEnd) ?? (times.at(-1)?.isStart ? null : times.at(-1));
  if (start) parsed.start = start.value;
  if (end) {
    const afternoon = String(Number(end.value.slice(0, 2)) + 12) + end.value.slice(2);
    const anchor = start?.value ?? context.start;
    parsed.end = end.ambiguous && anchor && end.value <= anchor && afternoon > anchor ? afternoon : end.value;
  }
  const duration = query.match(/(\d{1,2})\s*(?:시간|hours?|hrs?\b)(?:\s*(\d{1,2})\s*(?:분|minutes?|mins?\b))?/i);
  if (!end && duration) parsed.duration = Number(duration[1]) * 60 + Number(duration[2] ?? 0);
  if (!end && !duration) {
    const available = query.match(/(\d{1,3})\s*(?:분\s*(?:남|동안|여유)|(?:minutes?|mins?)\s*(?:left|free|available))/i);
    if (available) parsed.duration = Number(available[1]);
  }

  const mode = /지금|바로\s*출발|\bnow\b/i.test(query) ? "now"
    : /새벽|\bdawn\b/i.test(query) && !/새벽\s*\d/.test(query) ? "dawn"
    : /아침|\bmorning\b/i.test(query) ? "morning"
    : /오후|afternoon/i.test(query) && times.length === 0 ? "afternoon"
    : start ? "planned" : undefined;
  if (mode) parsed.mode = mode;
  const theme = conciergeThemes.find(([, pattern]) => pattern.test(query))?.[0];
  if (theme) parsed.interest = theme;
  if (/실내|비를?\s*피|비\s*안\s*맞|indoor|avoid (?:the )?rain/i.test(query)) parsed.indoors = true;
  if (/실외도|야외도|밖도|outdoors? (?:is|are) (?:okay|fine)/i.test(query)) parsed.indoors = false;
  const walk = query.match(/(?:도보|걷기|걸어서|walk(?:ing)?)\s*(?:편도\s*|up to\s*|under\s*|within\s*|less than\s*)?(\d{1,3})\s*(?:분|minutes?|mins?)/i);
  if (walk) parsed.maxWalk = Number(walk[1]);
  if (/앨범.*(?:어떻게|열|열어|가[고줘]|만들|사용)|포토북.*(?:열|어떻게|만들)|open .*album|how.*photo ?book/i.test(query)) parsed.goal = "album";
  else if (/(?:(?:유튜브|영상|youtube|video).*(?:분석|등록|링크|후보)|(?:analy[sz]e|add|submit).*(?:youtube|video))/i.test(query)) parsed.goal = "video";
  else if (/(?:내\s*경로|경유지|순서).*(?:열어|추가|삭제|편집|바꿔)|(?:edit|open|manage).*(?:route|stop)/i.test(query)) parsed.goal = "route";
  else if (parsed.start || parsed.end || parsed.duration || parsed.mode || context.end || /서울역.*(?:갈|추천)|돌아올|복귀/i.test(query)) parsed.goal = "plan";
  else if (theme || conciergeDistricts.some(([, pattern]) => pattern.test(query))) parsed.goal = "browse";
  return conciergeSlots(parsed);
}

function conciergeMap(destination, stops = []) {
  const params = new URLSearchParams({ api: "1", origin: "서울역", destination, travelmode: "walking" });
  if (stops.length) params.set("waypoints", stops.join("|"));
  return "https://www.google.com/maps/dir/?" + params;
}

function conciergeMapSearch(query) {
  return "https://www.google.com/maps/search/?" + new URLSearchParams({ api: "1", query });
}

function conciergeCard(place, lang, timed) {
  return {
    id: place.id,
    title: conciergeSay(lang, ...place.title),
    description: conciergeSay(lang, ...place.description),
    video: place.video,
    mapUrl: timed ? conciergeMap(place.title[0]) : conciergeMapSearch(place.direction ?? place.term ?? place.title[0]),
    sourceUrl: place.link,
    canAdd: Boolean(timed),
  };
}

const conciergeActions = {
  album: ["다녀온 장소를 포토북에 담을 수 있어요. 앨범을 열어 보세요.", "Open your album to add places you visited to a photo book."],
  route: ["‘내 경로’에서 저장한 목적지 순서를 바꾸고 복귀 가능 시각을 확인할 수 있어요.", "Open My route to reorder your stops and check whether you can get back in time."],
  video: ["‘맛집 영상’에 유튜브 주소를 붙여넣어 장소 후보를 찾아보세요.", "Paste a YouTube link in Food videos to find possible places."],
};

const conciergeReading = (live) => ({ weather: Boolean(live?.weather), rail: Boolean(live?.rail) });
let conciergeInferenceWindow = 0;
let conciergeInferenceCount = 0;
let conciergeInferenceActive = 0;

async function conciergeInfer(query, context, env, deps) {
  if (!deps.sageConfigured(env)) return {};
  const now = Date.now();
  if (now - conciergeInferenceWindow >= 60_000) {
    conciergeInferenceWindow = now;
    conciergeInferenceCount = 0;
  }
  if (conciergeInferenceCount >= 12 || conciergeInferenceActive >= 3) return {};
  conciergeInferenceCount += 1;
  conciergeInferenceActive += 1;
  try {
    return conciergeSlots(await deps.infer(query, context, env, deps.fetcher));
  } catch {
    return {};
  } finally {
    conciergeInferenceActive -= 1;
  }
}

async function conciergeMessage(input, env, deps) {
  const { query, lang } = input;
  const previous = input.context;
  const rules = interpretConciergeQuery(query, previous);
  const extracted = await conciergeInfer(query, previous, env, deps);
  const updates = { ...rules, ...extracted };
  const mode = updates.mode ?? previous.mode ?? (updates.start ? "planned" : "now");
  const clock = deps.clock();
  const preset = deps.presets[mode];
  const changedPreset = updates.mode && mode !== previous.mode;
  const start = updates.start ?? (mode === "now" ? clock.time : (changedPreset ? preset?.start : previous.start) ?? preset?.start ?? clock.time);
  const target = updates.duration === undefined ? null : deps.minutes(start) + updates.duration;
  const defaultEnd = changedPreset && preset ? preset.end : previous.end ?? preset?.end;
  const end = updates.end ?? (target === null ? defaultEnd : target < 1440 ? deps.hhmm(target) : undefined);
  const goal = updates.goal ?? (end ? "plan" : "browse");
  const context = conciergeSlots({ ...previous, ...updates, mode, start, end, goal });
  delete context.duration;
  const base = { kind: "message", engine: Object.keys(extracted).length ? "sagemaker" : "rules", context, options: [], live: conciergeReading(null) };
  if (conciergeActions[goal]) return { ...base, state: "action", action: goal, response: conciergeSay(lang, ...conciergeActions[goal]) };
  if (!end || goal === "browse") {
    const interest = context.interest;
    const district = conciergeDistricts.find(([, pattern]) => pattern.test(query))?.[0];
    const options = deps.discover.filter((place) => {
      const matches = !interest || interest === "all" || place.tags.includes(interest) ||
        (interest === "trekking" && place.tags.includes("trail"));
      return matches && (!district || place.district === district);
    }).slice(0, 3).map((place) => conciergeCard(place, lang, false));
    const response = options.length && (interest || district)
      ? conciergeSay(lang, "테마에 맞는 영상이에요. 서울역으로 돌아올 시각을 알려주시면 복귀 가능한 장소를 계산할게요.", "Here are videos for your interests. Tell me when you need to return to Seoul Station to check which stops fit.")
      : conciergeSay(lang, "서울역에 몇 시까지 돌아오셔야 하나요? ‘오후 5시까지 복귀하고 싶어요’처럼 알려주세요.", "When do you need to be back at Seoul Station? Try “I need to be back by 5 pm.”");
    return { ...base, state: options.length && (interest || district) ? "browse" : "needs-time", response, options: interest || district ? options : [] };
  }
  if (deps.minutes(end) <= deps.minutes(start)) return {
    ...base, state: "invalid",
    response: conciergeSay(lang, "복귀 시각은 출발 시각보다 늦어야 해요. 현재는 서울 기준으로 같은 날의 일정만 계산해요.", "Enter a return time after departure. This demo calculates same-day plans in Seoul time."),
  };

  const live = mode === "now" ? await deps.live() : null;
  const interest = context.interest === "food-alley" ? "food" : context.interest;
  const plan = deps.makePlan({ start, end, date: clock.date, interest, live, indoors: context.indoors });
  const viable = plan.options.filter((option) => !option.reason &&
    (!context.maxWalk || Math.max(option.outward, option.place.walk) <= context.maxWalk));
  const fitsInterest = (option) => {
    if (!interest || interest === "all") return true;
    if (interest === "quiet") return option.place.id === "museum" || option.place.id === "station";
    if (interest === "busy") return option.crowd?.level >= 2;
    if (interest === "romantic" || interest === "trekking") return false;
    return option.place.tags.includes(interest);
  };
  const matched = viable.filter(fitsInterest);
  const options = (matched.length ? matched : viable).slice(0, 3).map((item) => ({
    ...conciergeCard(item.place, lang, true),
    arrival: deps.hhmm(item.arrive), leave: deps.hhmm(item.leave),
    returnBy: end, minutes: item.outward,
    mode: item.transit ? "transit" : "walk",
  }));
  let response;
  if (options.length) {
    response = matched.length
      ? conciergeSay(lang, "서울역 " + end + " 복귀를 기준으로, 운영시간과 왕복 이동에 20분 여유를 반영했어요.", "These stops allow enough time to visit and be back at Seoul Station by " + end + ", including a 20-minute buffer.")
      : conciergeSay(lang, "조건에 맞는 테마 명소를 확정하기 어려워요. 복귀 시간 안에 들를 수 있는 다른 장소를 살펴보세요.", "I couldn’t confirm a match for that interest. These nearby alternatives fit your return time.");
  } else if (plan.state === "dawn") {
    response = conciergeSay(lang, "오전 6시 이전에는 확인된 방문 추천을 제공하기 어려워요. 오전 6시 이후 출발로 다시 확인해 보세요.", "This demo cannot confirm visits before 06:00. Try a departure after 06:00.");
  } else {
    response = conciergeSay(lang, "운영시간, 이동 조건, 복귀 전 20분을 모두 만족하는 장소를 찾지 못했어요. 복귀 시간을 늦추거나 도보 조건을 조정해 보세요.", "I couldn’t find a stop that meets the opening hours, walking limit, and 20-minute return buffer. Try a later return or a longer walk.");
  }
  return { ...base, state: options.length ? "visit" : plan.state === "dawn" ? "dawn" : "return", options, response, live: conciergeReading(live) };
}

const conciergeCoords = {
  anchor: "126.9707,37.5547", seoullo: "126.9728,37.55612", station: "126.971,37.55618",
  market: "126.97734,37.55929", museum: "126.97071,37.57043", palace: "126.97647,37.56576",
};
const conciergeFootCache = new Map();
let conciergeLastFootRequest = 0;

async function conciergeTravel(stops, env, fetcher) {
  const key = stops.map((place) => place.id).join(",");
  const cached = conciergeFootCache.get(key);
  if (cached && Date.now() - cached.time < 60 * 60_000) return { segments: cached.segments, routing: "mapped" };
  // The public routing service limits usage. Enable it for controlled demos only.
  if (env.CONCIERGE_OSRM === "on" && Date.now() - conciergeLastFootRequest >= 1000) {
    conciergeLastFootRequest = Date.now();
    const coordinates = [conciergeCoords.anchor, ...stops.map((place) => conciergeCoords[place.id]), conciergeCoords.anchor];
    try {
      const result = await fetcher("https://routing.openstreetmap.de/routed-foot/route/v1/driving/" +
        coordinates.join(";") + "?overview=false&steps=false", {
        signal: AbortSignal.timeout(3500),
        redirect: "error",
        headers: { "user-agent": "Seoul Last Stop tourism demo", referer: "https://seoul-one-more.dlwkgjs11.chatgpt.site/" },
      });
      const legs = result.ok ? (await result.json()).routes?.[0]?.legs : null;
      if (Array.isArray(legs) && legs.length === stops.length + 1 &&
          legs.every(({ duration }) => Number.isFinite(duration) && duration > 0 && duration <= 10_800)) {
        const segments = legs.map(({ duration }) => Math.ceil(duration / 60));
        conciergeFootCache.set(key, { time: Date.now(), segments });
        return { segments, routing: "mapped" };
      }
    } catch {
      // An unavailable routing provider must not be represented as a real-time estimate.
    }
  }
  const viaStation = [0, ...stops.map((place) => place.walk), 0];
  return { segments: viaStation.slice(1).map((walk, index) => viaStation[index] + walk), routing: "estimate" };
}

async function conciergeRoute(input, env, deps) {
  const { end, lang } = input;
  const clock = deps.clock();
  const start = input.mode === "now" ? clock.time : input.start;
  if (start >= end) return null;
  const places = input.stops.map(({ id }) => deps.places.find((place) => place.id === id));
  const [timing, live] = await Promise.all([
    conciergeTravel(places, env, deps.fetcher),
    input.mode === "now" ? deps.live() : null,
  ]);
  let current = deps.minutes(start);
  const clockLabel = (value) => value < 1440 ? deps.hhmm(value) : null;
  const stops = places.map((place, index) => {
    const hours = deps.opening(place.id, clock.date);
    const arrival = current + timing.segments[index];
    const entry = Math.max(arrival, hours.open ?? arrival);
    current = entry + (input.stops[index].dwell ?? place.visit);
    let reason = hours.status === "known" ? null : hours.status;
    if (deps.minutes(start) < 360) reason = "dawn";
    else if (place.kind === "outdoor" && live?.weather?.wet) reason = "rain";
    else if (hours.status === "known" && (entry >= hours.last || current > hours.close)) reason = "last-entry";
    return {
      id: place.id, title: conciergeSay(lang, ...place.title), arrival: clockLabel(arrival),
      departure: clockLabel(current), entry: clockLabel(entry), reason, sourceUrl: place.link,
    };
  });
  const arrival = current + timing.segments.at(-1);
  const fitsTime = arrival + conciergeReserve <= deps.minutes(end);
  const feasible = fitsTime && stops.every((stop) => !stop.reason);
  const note = timing.routing === "mapped"
    ? conciergeSay(lang, "OpenStreetMap 도보 경로 기준.", "Walking times are from OpenStreetMap routing.")
    : conciergeSay(lang, "이동 시간은 서울역 경유 기준의 도보 추정치입니다.", "Walking times are estimated conservatively via Seoul Station.");
  const status = feasible
    ? conciergeSay(lang, "복귀 전 20분의 여유가 있는 경로예요.", "This route leaves a 20-minute return buffer.")
    : conciergeSay(lang, "현재 순서로는 운영시간 또는 복귀 조건을 충족하지 못해요. 경유지나 체류 시간을 조정해 보세요.", "This order does not meet opening hours or return constraints. Try adjusting the stops or visit durations.");
  return {
    kind: "route", response: status + " " + note, stops, reserve: conciergeReserve,
    arrival: clockLabel(arrival), deadline: end, feasible,
    mapUrl: conciergeMap("서울역", places.map((place) => place.title[0])),
    routing: timing.routing, live: conciergeReading({ weather: live?.weather }),
  };
}

const conciergeMenus = [
  "갈치조림", "갈치구이", "칼국수", "설렁탕", "곰탕", "만두", "국밥", "냉면", "족발", "보쌈",
  "떡볶이", "쌀국수", "곱창", "치킨", "삼겹살", "감자탕", "해장국", "닭갈비", "비빔밥", "김밥", "분식",
];
const conciergeVideoPlaces = [
  { id: "market", pattern: /희락갈치|남대문(?:시장)?\s*(?:갈치|희락)|갈치조림\s*골목|namdaemun hairtail/i },
  { id: "kondae-food", pattern: /건대(?:입구)?\s*(?:먹자|맛의거리)|화양제일시장|kondae food alley/i },
  { id: "hongdae", pattern: /홍대\s*(?:먹자|걷고싶은거리)|hongdae food alley/i },
];

async function conciergeVideo(input, deps) {
  const { id, lang } = input;
  const url = "https://www.youtube.com/watch?v=" + id;
  let metadata = {};
  try {
    const result = await deps.fetcher("https://www.youtube.com/oembed?" + new URLSearchParams({ url, format: "json" }), {
      signal: AbortSignal.timeout(4500), redirect: "error",
    });
    if (result.ok) metadata = (await result.json()) ?? {};
  } catch {
    // Visitor-supplied notes can still be used if metadata is unavailable.
  }
  const title = typeof metadata.title === "string" ? metadata.title.slice(0, 300) : "";
  const author = typeof metadata.author_name === "string" ? metadata.author_name.slice(0, 160) : "";
  const material = title + "\n" + input.text;
  const menu = conciergeMenus.filter((dish) => material.includes(dish)).slice(0, 4);
  const catalog = [...deps.places, ...deps.discover];
  const candidates = conciergeVideoPlaces.flatMap((record) => {
    const place = catalog.find((item) => record.id === item.id);
    if (!place || (place.video !== id && !record.pattern.test(material))) return [];
    const name = conciergeSay(lang, ...place.title);
    return [{
      name, menu, mapUrl: conciergeMapSearch(place.direction ?? place.term ?? place.title[0]),
      placeId: deps.places.some((item) => item.id === place.id) ? place.id : null,
    }];
  });
  const notedNames = [...input.text.matchAll(/(?:^|\n)\s*(?:가게|식당|장소|상호|restaurant|place)\s*[:：]\s*([^\n]{2,64})/gi)]
    .slice(0, 3).map((match) => match[1].trim()).filter((name) => name.length > 1);
  for (const name of new Set(notedNames)) {
    if (candidates.some((candidate) => candidate.name === name)) continue;
    candidates.push({ name, menu, mapUrl: conciergeMapSearch("서울 " + name), placeId: null });
  }
  const response = candidates.length
    ? conciergeSay(lang, "영상 제목과 입력한 메모에서 찾은 후보예요. 지도로 위치와 영업 여부를 먼저 확인해 주세요.", "These candidates came from the video title and your notes. Verify their location and hours on the map before visiting.")
    : conciergeSay(lang, "영상 제목에서 장소를 특정하기 어려워요. 메모에 ‘가게: 이름’을 적으면 지도에서 확인할 후보를 만들 수 있어요.", "The title didn’t identify a place. Add “Restaurant: name” in your notes to create a candidate you can check on the map.");
  return { kind: "video", id, url, title, author, metadata: title ? "youtube" : "unavailable", candidates, response };
}

function conciergeJson(value, status = 200, extraHeaders = {}) {
  return Response.json(value, { status, headers: { "cache-control": "no-store", ...extraHeaders } });
}

async function readConciergeBody(request) {
  if (!request.body || Number(request.headers.get("content-length")) > conciergeBodyLimit) return null;
  const reader = request.body.getReader();
  const decoder = new TextDecoder("utf-8", { fatal: true });
  let size = 0;
  let value = "";
  try {
    while (true) {
      const chunk = await reader.read();
      if (chunk.done) break;
      size += chunk.value.byteLength;
      if (size > conciergeBodyLimit) {
        await reader.cancel();
        return null;
      }
      value += decoder.decode(chunk.value, { stream: true });
    }
    return JSON.parse(value + decoder.decode());
  } catch {
    return null;
  } finally {
    reader.releaseLock();
  }
}

export async function serveConcierge(request, env, deps) {
  if (request.method !== "POST") return conciergeJson({ error: "Method not allowed" }, 405, { allow: "POST" });
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) return conciergeJson({ error: "Origin not allowed" }, 403);
  if (request.headers.get("content-type")?.split(";")[0].trim().toLowerCase() !== "application/json") {
    return conciergeJson({ error: "JSON required" }, 415);
  }
  const value = await readConciergeBody(request);
  const input = parseConciergeRequest(value, deps.places);
  if (!input) return conciergeJson({ error: conciergeSay(value?.lang, "입력 형식을 확인해 주세요.", "Check your input.") }, 400);
  try {
    switch (input.kind) {
      case "message": return conciergeJson(await conciergeMessage(input, env, deps));
      case "route": {
        const route = await conciergeRoute(input, env, deps);
        if (route) return conciergeJson(route);
        return conciergeJson({
          error: conciergeSay(input.lang, "복귀 시각이 지났어요. 현재 시각보다 늦게 설정해 주세요.", "That return time has passed. Set a time after the current time in Seoul."),
        }, 400);
      }
      case "video": return conciergeJson(await conciergeVideo(input, deps));
    }
  } catch {
    return conciergeJson({ error: conciergeSay(input.lang, "일시적으로 요청을 처리할 수 없어요.", "This request is temporarily unavailable.") }, 503);
  }
}
