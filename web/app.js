import { hhmm, makePlan, minutes, places, presets, seoulClock } from "./planner.js";
import { discover, districts, trendGroups } from "./discover.js";
import { keywordKey, parseTrends } from "./trends.js";

const copy = {
  skip: ["여정으로 건너뛰기", "Skip to the planner"], brand: ["여행의 종점은 서울", "Last Stop Seoul"],
  navPlan: ["지금의 여정", "Plan"], navVideo: ["명소 영상", "Watch"],
  titleFirst: ["여행의 종점은", "Last stop,"], titleLast: ["서울.", "Seoul."],
  intro: ["서울역에 돌아올 시간만 정하세요. 지금 들를 만한 곳과 돌아올 시각을 찾아드려요.", "Set your return time. See what fits before you head back to Seoul Station."],
  cta: ["지금 출발", "Leave now"], browse: ["명소 둘러보기", "Explore Seoul"],
  photo: ["서울로 7017에서 바라본 서울역", "Seoul Station from Seoullo 7017"],
  photoCredit: ["사진 출처", "Photo credit"], heroAlt: ["서울로 7017에서 내려다본 서울역 일대", "The Seoul Station neighbourhood from Seoullo 7017"],
  planTitle: ["서울역에서 출발", "Start at Seoul Station"], modeLegend: ["출발 시간 모드", "Departure modes"],
  now: ["지금", "Now"], dawn: ["새벽", "Early"], morning: ["아침", "Morning"], afternoon: ["오후", "Afternoon"],
  start: ["출발 시각", "Departure"], end: ["서울역 복귀 마감", "Return by"], date: ["날짜", "Date"],
  indoors: ["실내만 보기", "Indoor only"], refresh: ["새로 조회", "Refresh"],
  ready: ["시연 시간을 바꿔 서울역으로 돌아오기 전 들를 수 있는 곳을 확인하세요.", "Choose a departure to see what fits before your return."],
  videoTitle: ["영상으로 먼저 보기", "Watch before you go"], saved: ["저장한 곳", "Saved"],
  save: ["저장", "Save"], savedOne: ["저장됨", "Saved"], play: ["영상 재생", "Play video"],
  noSaved: ["저장한 곳이 없어요. 영상 카드의 저장 버튼을 눌러보세요.", "Save a place from its video card to see it here."],
  visited: ["다녀온 곳", "Memories"], markVisit: ["다녀왔어요", "Mark as visited"], markedVisit: ["방문 기록 ✓", "Visited ✓"],
  removeVisit: ["방문 기록 지우기", "Remove visit"], visitDate: ["기록한 날짜", "Recorded on"],
  noVisited: ["여행을 마친 곳에 ‘다녀왔어요’를 눌러보세요. 여기서 그날의 영상과 명소를 다시 볼 수 있어요.", "Mark a place as visited to watch its video again and see when you added it."],
  sources: ["데이터 및 사진 출처", "Data and photo credits"],
  sourceNote: ["운영시간과 이동 예상치는 출처 및 실제 이용 조건을 확인해 주세요.", "Check official sources for opening hours and travel conditions."],
  youtube: ["YouTube 원본", "Open on YouTube"], source: ["공식 안내", "Official guide"],
  live: ["실시간", "Live"], planned: ["공식 운영시간 기준", "Scheduled hours"],
  timeError: ["같은 날 출발 시각보다 늦은 복귀 시간을 입력해 주세요.", "Enter a return time later on the same day."],
  dawnTitle: ["새벽에는 공항 교통부터 확인하세요", "Check early airport transport first"],
  dawnBody: ["공항철도 첫차와 심야버스 운행표를 확인하세요. 탑승할 터미널과 수하물 회수 시간도 여유에 포함하세요.", "Check the first airport train and the night bus timetable. Allow time for luggage and confirm your terminal."],
  trainSchedule: ["공항철도 공식 시간표", "AREX official timetable"],
  nightBus: ["심야버스 N6701 운행 안내", "N6701 night bus"],
  returnTitle: ["지금은 서울역으로 돌아갈 시간이에요", "Head back to Seoul Station"],
  returnBody: ["복귀 여유 20분과 왕복 이동을 확보하면 현재 조건에 맞는 명소가 없어요. 아래 영상으로 명소를 둘러볼 수 있습니다.", "No listed attraction fits after round-trip travel and a 20-minute buffer. The videos below are still available."],
  nowShort: ["오늘 남은 시간을 기준으로 계산합니다.", "The remaining time today is used."],
  visit: ["관람 가능", "Time to explore"], leave: ["명소에서 출발", "Leave the attraction"],
  readyAt: ["서울역 복귀 마감", "Back by"], reserve: ["복귀 여유", "Return buffer"],
  routeWalk: ["도보 이동 추정", "Estimated walk"], routeRail: ["시청 방면 1호선과 도보", "Line 1 toward City Hall plus walking"],
  routeNote: ["복귀는 도보 기준이며 20분 여유를 포함했습니다.", "Return is estimated on foot, with a 20-minute buffer."],
  scheduleOnly: ["시간을 지정한 시연은 공식 운영시간과 예상 도보를 사용합니다.", "Scheduled demos use published hours and estimated walks."],
  open: ["이 시간에 가능", "Fits this time"], early: ["도착 시 개장 전", "Not open on arrival"], closed: ["운영 종료 또는 휴관", "Closed at this time"],
  unknown: ["공식 일정 확인 필요", "Check current programme"], short: ["복귀까지 시간 부족", "Too little time"], rain: ["강수로 실내 우선", "Rain: indoor first"],
  indoor: ["실외 명소", "Outdoor"], indoorTag: ["실내", "Indoors"], outdoorTag: ["야외", "Outdoors"],
  dawnCard: ["새벽에는 교통 안내 우선", "Transport first"], weather: ["서울역 날씨", "Seoul Station weather"],
  rail: ["서울역 도착 열차", "Trains at Seoul Station"], loading: ["조회 중", "Loading"],
  unavailable: ["현재 확인 어려움", "Currently unavailable"], minute: ["분", "min"],
  raining: ["강수", "Wet"], dry: ["강수 없음", "Dry"], expected: ["예정", "expected"],
  etaNow: ["도착 임박", "Due"], lastChecked: ["자료 시각", "Data time"], stale: ["시간표·도보 기준", "Timetable and walking estimates"],
  showArea: ["탐색 범위", "Explore"], near: ["서울역 근처", "Near Seoul Station"], city: ["서울 전체", "All Seoul"],
  keyword: ["테마", "Themes"], all: ["전체", "All"], scenery: ["풍경", "Scenery"], night: ["야경", "Night views"],
  quickThemes: ["테마 영상 바로가기", "Jump to theme videos"],
  quickFood: ["건대·홍대", "Kondae & Hongdae"], quickShop: ["잠실·반포", "Jamsil & Banpo"],
  quickQuiet: ["박물관·미술관", "Museums & art"], quickRomantic: ["북악·낙산", "Bugak & Naksan"],
  food: ["맛집", "Food"], busy: ["사람 많은 곳", "Lively places"], quiet: ["조용한 장소", "Quiet places"],
  romantic: ["낭만 있는 장소", "Romantic spots"],
  shop: ["쇼핑", "Shopping"], foodAlley: ["먹자골목", "Food alleys"], trail: ["트레킹·둘레길", "Hiking & walking"], district: ["지역", "District"],
  trendTools: ["검색 트렌드", "Search trends"], trekTitle: ["검색에서 뜬 트레킹", "Trending searches · Trekking"],
  trekSnapshot: ["Google Trends 제공 화면 · 11.26 15:11 · 1만+ 검색, 1,000% 증가", "Google Trends snapshot · Nov 26, 15:11 · 10K+ searches, up 1,000%"],
  trekAction: ["트레킹 코스 보기", "Explore hiking routes"],
  trends: ["Google Trends에서 비교", "Compare in Google Trends"], trendImport: ["Trends CSV 적용", "Apply Trends CSV"],
  trendTip: ["Google Trends에서 서울 최근 1개월 검색어를 비교하고, 관심도 그래프의 CSV를 적용하면 일치하는 명소를 정렬합니다.", "Compare search terms for Seoul over the past month. Import the interest chart CSV to rank matching places."],
  trendScore: ["검색 관심도 평균", "Average search interest"],
  trendError: ["Google Trends의 ‘시간 흐름에 따른 관심도’ 그래프에서 받은 CSV를 선택해 주세요.", "Choose a CSV from the Interest over time chart in Google Trends."],
  trendNoMatch: ["이 화면의 명소와 일치하는 검색어가 없습니다.", "This CSV has no matching places in this view."],
  cityTip: ["지도에서 서울역과의 이동 시간을 확인하세요.", "Use the map to check travel time from Seoul Station."],
  nearTip: ["위에서 정한 출발 시간과 복귀 마감으로 관람 가능 여부를 계산합니다.", "Departure and return times above determine which visits fit."],
  cityCrowdTip: ["강남역 거리와 명동의 거리 영상을 보고, 출발 전에 혼잡도를 확인하세요.", "Watch street videos of Gangnam and Myeongdong, then check current crowd levels before you go."],
  cityCrowdLink: ["서울시 실시간 혼잡도 지도", "Seoul’s live crowd map"],
  foodAlleyTip: ["건대와 홍대의 골목을 영상으로 둘러보세요. 운영시간은 식당마다 다릅니다.", "Explore the Kondae and Hongdae food alleys on video. Each restaurant has its own hours."],
  quietTip: ["전시를 천천히 둘러보기 좋은 장소입니다. 관람객 수는 시간대와 전시에 따라 달라집니다.", "Take your time with the exhibitions. Crowds vary by time of day and exhibition."],
  romanticTip: ["서울을 내려다보는 전망과 성곽길 야경을 영상으로 먼저 보세요.", "Preview Seoul’s skyline and the city wall after dark."],
  crowdArea: ["광화문·덕수궁 혼잡도", "Gwanghwamun–Deoksugung crowd level"],
  crowdedLevels: [["여유", "보통", "약간 붐빔", "붐빔"], ["Quiet", "Moderate", "Somewhat busy", "Busy"]],
  noMatches: ["이 조건에 맞는 명소가 없어요. 관심 키워드나 지역을 바꿔 보세요.", "Try another interest or district to see more places."],
  map: ["길찾기", "Directions"],
};

const byId = (id) => document.getElementById(id);
const feed = byId("feed");
const controls = {
  start: byId("start"), end: byId("end"), date: byId("date"), indoors: byId("indoors"),
};
let language = 0;
let mode = "afternoon";
let liveData = null;
let phase = "idle";
let activeRequest = null;
let collection = "";
let activeVideo = null;
let videoTrigger = null;
let plan = null;
let scope = "near";
let district = "all";
let interest = "all";
let trendData = null;
let badTrendFile = false;
const allPlaces = [...places, ...discover];
const cityInterests = new Set(["busy", "quiet", "romantic", "shop", "food-alley"]);
const interestTips = { busy: "cityCrowdTip", quiet: "quietTip", romantic: "romanticTip", "food-alley": "foodAlleyTip" };
const saved = new Set();
const visited = new Map();
try {
  for (const id of JSON.parse(localStorage.getItem("one-more-saved") ?? "[]")) {
    if (allPlaces.some((place) => place.id === id)) saved.add(id);
  }
  if (localStorage.getItem("one-more-language") === "en") language = 1;
} catch { /* Storage is optional. */ }
try {
  for (const [id, date] of Object.entries(JSON.parse(localStorage.getItem("last-stop-visited") ?? "{}"))) {
    if (allPlaces.some((place) => place.id === id) && /^\d{4}-\d{2}-\d{2}$/.test(date)) visited.set(id, date);
  }
} catch { /* Storage is optional. */ }

const text = (key) => copy[key][language];
const savePreference = (key, value) => { try { localStorage.setItem(key, value); } catch { /* Optional. */ } };
const timeView = (minute) => `${minute} ${text("minute")}`;
const kst = (timestamp) => seoulClock(new Date(timestamp)).time;

function placeTag(item) {
  if (!item?.reason) return text("open");
  return text(item.reason === "dawn" ? "dawnCard" : item.reason);
}

function renderPlan() {
  const clock = seoulClock();
  byId("seoul-clock").textContent = `${clock.time} KST`;
  byId("seoul-clock").dateTime = new Date().toISOString();
  const now = mode === "now";
  byId("start-control").hidden = now;
  byId("date-control").hidden = now;
  byId("live-panel").hidden = !now;
  const start = now ? clock.time : controls.start.value;
  const date = now ? clock.date : controls.date.value;
  plan = makePlan({ start, end: controls.end.value, date, live: now ? liveData : null,
    indoors: controls.indoors.checked, interest: scope === "near" ? interest : "all" });
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) plan = { state: "invalid", options: [] };
  const invalid = plan.state === "invalid";
  const error = byId("time-error");
  error.hidden = !invalid;
  error.textContent = invalid ? text("timeError") : "";
  controls.end.setAttribute("aria-invalid", String(invalid));
  const result = byId("plan-result");
  const schedule = `<div class="links"><a href="https://www.airportrailroad.com/train/express/info">${text("trainSchedule")}</a><a href="https://www.klimousine.com/bus/limousine.php?bus_no=N6701">${text("nightBus")}</a></div>`;
  if (invalid) {
    result.hidden = true;
  } else {
    result.hidden = false;
    if (plan.state === "dawn") {
      result.innerHTML = `<h3>${text("dawnTitle")}</h3><p>${text("dawnBody")}</p>${schedule}`;
    } else if (plan.state === "return") {
      result.innerHTML = `<h3>${text("returnTitle")}</h3><p>${text("returnBody")}</p>${schedule}`;
    } else {
      const best = plan.best;
      const source = best.place.event ?? best.place.link;
      result.innerHTML = `<h3>${best.place.title[language]}</h3>
        <dl class="timeline">
          <div><dt>${text("visit")}</dt><dd>${timeView(best.view)}</dd></div>
          <div><dt>${text("leave")}</dt><dd>${hhmm(best.leave)}</dd></div>
          <div><dt>${text("readyAt")}</dt><dd>${controls.end.value}</dd></div>
        </dl>
        <p>${text(best.transit ? "routeRail" : "routeWalk")} ${timeView(best.outward)}. ${text("routeNote")}</p>
        <a href="${source}">${text("source")}</a>`;
    }
  }
  renderStatus();
}

function renderStatus() {
  if (mode !== "now") return;
  const weather = liveData?.weather;
  const rail = liveData?.rail;
  const crowd = liveData?.crowd;
  const weatherStatus = byId("weather-status");
  const railStatus = byId("rail-status");
  const pendingText = phase === "loading" ? text("loading") : text("unavailable");
  weatherStatus.textContent = `${text("weather")} · ${weather
    ? `${text("live")} ${weather.temp.toFixed(1)}°C, ${text(weather.wet ? "raining" : "dry")} · ${kst(weather.time)}` : pendingText}`;
  const train = rail?.cityHall ?? rail?.airport ?? rail?.rows[0];
  if (train) {
    const match = train.line === "1001" ? (language ? "Line 1" : "1호선") :
      train.line === "1065" ? "AREX" : train.line === "1004" ? (language ? "Line 4" : "4호선") :
      train.line === "1063" ? (language ? "Gyeongui–Jungang" : "경의중앙선") : text("rail");
    railStatus.textContent = `${text("live")} ${match} ${train.wait > 0 ? timeView(train.wait) + " " + text("expected") : text("etaNow")} · ${kst(train.time)}`;
    if (language === 0) railStatus.textContent += ` · ${train.direction}`;
  } else {
    railStatus.textContent = `${text("rail")} · ${pendingText} · ${text("stale")}`;
  }
  byId("crowd-status").textContent = `${text("crowdArea")} · ${crowd
    ? `${text("crowdedLevels")[crowd.level]} · ${kst(crowd.time)}` : pendingText}`;
  byId("refresh").disabled = phase === "loading";
}

function mapRoute(place) {
  const url = new URL("https://www.google.com/maps/dir/");
  url.search = new URLSearchParams({ api: "1", origin: "서울역", destination: `서울 ${place.direction ?? place.title[0]}`, travelmode: "transit" });
  return url.href;
}

function discoveryOptions() {
  if (collection === "saved") return allPlaces.filter(({ id }) => saved.has(id)).map((place) => ({ place }));
  if (collection === "visited") return [...visited.entries()]
    .sort((a, b) => b[1].localeCompare(a[1]))
    .map(([id, date]) => ({ place: allPlaces.find((place) => place.id === id), date }));
  if (scope === "near") {
    return plan?.options?.length ? plan.options : places.map((place) => ({ place, reason: "unknown" }));
  }
  const candidates = discover.filter((place) => district === "all" || place.district === district);
  const filtered = candidates.filter((place) => interest === "all" || place.tags.includes(interest));
  const options = filtered.map((place) => ({ place, score: trendData?.scores.get(keywordKey(place.term)) }));
  return options.sort((a, b) => (b.score ?? -1) - (a.score ?? -1) ||
    (interest === "trail" ? Number(Boolean(b.place.trek)) - Number(Boolean(a.place.trek)) : 0));
}

function renderDiscovery(options) {
  byId("explorer").classList.toggle("collection-view", Boolean(collection));
  byId("discovery-controls").hidden = Boolean(collection);
  byId("feed-notes").hidden = Boolean(collection);
  const heading = collection ? text(collection)
    : interest !== "all" ? text(document.querySelector("[name=interest]:checked + span").dataset.copy)
    : scope === "city" ? districts[district][language] : text("near");
  byId("feed-heading").textContent = heading;
  const count = options.length;
  const countLabel = language ? `${count} ${count === 1 ? "place" : "places"}` : `${count}곳`;
  const counter = byId("feed-count");
  if (counter.textContent !== countLabel) counter.textContent = countLabel;
  if (collection) return;
  byId("district-row").hidden = scope !== "city";
  byId("trend-import").hidden = scope !== "city";
  byId("crowd-guide").hidden = interest !== "busy";
  byId("discovery-note").textContent = text(interestTips[interest] ?? (scope === "city" ? "cityTip" : "nearTip"));
  if (scope !== "city") return;
  const terms = interest === "all" || !options.length
    ? trendGroups[district] ?? discover.filter((place) => place.district === district).map((place) => place.term)
    : options.map(({ place }) => place.term);
  const comparison = new URL("https://trends.google.com/trends/explore");
  comparison.search = new URLSearchParams({ date: "today 1-m", geo: "KR-11", q: terms.slice(0, 5).join(",") });
  byId("trends-link").href = comparison.href;
  const matching = options.filter(({ score }) => Number.isFinite(score)).length;
  byId("trend-status").textContent = badTrendFile ? text("trendError") : trendData
    ? `${trendData.range.join(" ~ ")} · ${matching
      ? (language ? `${matching} places ranked by search interest` : `명소 ${matching}곳 검색 관심도 반영`) : text("trendNoMatch")}`
    : text("trendTip");
}

function renderFeed() {
  const oldScroll = feed.scrollLeft;
  const visible = discoveryOptions();
  renderDiscovery(visible);
  feed.dataset.count = String(Math.min(2, visible.length));
  feed.innerHTML = visible.length ? visible.map((item) => {
    const { place } = item;
    const pinned = saved.has(place.id);
    const tag = place.district ? districts[place.district][language] : collection ? text("near") : placeTag(item);
    const score = Number.isFinite(item.score) ? `<p class="trend-score">${text("trendScore")} ${item.score} / 100</p>` : "";
    const memory = item.date ? `<p>${text("visitDate")} <time datetime="${item.date}">${item.date}</time></p>` : "";
    const wasVisited = visited.has(place.id);
    return `<article class="reel" data-id="${place.id}" data-status="${item.reason ?? "ok"}">
      <div class="reel-media${place.district ? " video-cover" : ""}">
        <img src="${place.image}" width="540" height="660" loading="lazy" alt="${place.posterAlt[language]}">
        <button class="bookmark" type="button" data-save="${place.id}" aria-pressed="${pinned}" aria-label="${text("save")} ${place.title[language]}">${text(pinned ? "savedOne" : "save")}</button>
        <button class="play" type="button" data-video="${place.id}" aria-label="${text("play")} ${place.title[language]}"><span aria-hidden="true">▶</span></button>
      </div>
      <div class="reel-text">
        <div class="reel-info"><p>${tag}</p><h3>${place.title[language]}</h3></div>
        <p>${place.description[language]}</p>${score}${memory}
        <div class="reel-actions">
          <div class="reel-links">
            <a href="${mapRoute(place)}" target="_blank" rel="noopener">${text("map")} <span aria-hidden="true">↗</span></a>
            <a href="${place.link}" target="_blank" rel="noopener">${text("source")}</a>
          </div>
          <button class="small-button mark-visit" type="button" data-visit="${place.id}" aria-pressed="${wasVisited}" title="${text(wasVisited ? "removeVisit" : "markVisit")}">${text(wasVisited ? "markedVisit" : "markVisit")}</button>
        </div>
      </div>
    </article>`;
  }).join("") : `<p class="empty">${text(collection === "visited" ? "noVisited" : collection === "saved" ? "noSaved" : "noMatches")}</p>`;
  for (const id of ["saved", "visited"]) byId(id).setAttribute("aria-pressed", String(collection === id));
  feed.scrollLeft = oldScroll;
  syncFeedControls();
}

function syncFeedControls() {
  const remaining = feed.scrollWidth - feed.clientWidth;
  byId("feed-navigation").hidden = remaining <= 2;
  byId("back").disabled = feed.scrollLeft <= 2;
  byId("next").disabled = feed.scrollLeft >= remaining - 2;
}

function update() { renderPlan(); renderFeed(); }

function translate() {
  document.documentElement.lang = language ? "en" : "ko";
  document.querySelectorAll("[data-copy]").forEach((node) => { node.textContent = text(node.dataset.copy); });
  document.querySelectorAll("[data-alt]").forEach((node) => { node.alt = text(node.dataset.alt); });
  byId("language").textContent = language ? "한국어" : "EN";
  byId("language").setAttribute("aria-label", language ? "한국어로 전환" : "Switch to English");
  byId("back").setAttribute("aria-label", language ? "Previous video" : "이전 영상");
  byId("next").setAttribute("aria-label", language ? "Next video" : "다음 영상");
  byId("close-player").setAttribute("aria-label", language ? "Close video" : "영상 닫기");
  byId("district").replaceChildren(...Object.entries(districts).map(([id, names]) => new Option(names[language], id)));
  byId("district").value = district;
}

async function refresh() {
  if (activeRequest || mode !== "now") return;
  const request = new AbortController();
  activeRequest = request;
  phase = "loading";
  renderStatus();
  const timeout = setTimeout(() => request.abort(), 8000);
  try {
    const response = await fetch("/api/live", { signal: request.signal });
    if (!response.ok) throw new Error("live data unavailable");
    liveData = await response.json();
    phase = "ready";
  } catch {
    liveData = null;
    phase = "unavailable";
  } finally {
    clearTimeout(timeout);
    activeRequest = null;
    if (mode === "now") update();
  }
}

function selectMode(value) {
  mode = value;
  document.querySelector(`[name="mode"][value="${value}"]`).checked = true;
  if (value === "now") {
    const local = seoulClock();
    controls.end.value = hhmm(Math.min(minutes(local.time) + 110, 1439));
    refresh();
  } else {
    controls.start.value = presets[value].start;
    controls.end.value = presets[value].end;
  }
  update();
}

function selectCityTheme(value) {
  scope = "city";
  district = "all";
  interest = value;
  byId("district").value = district;
  document.querySelector("[name=scope][value=city]").checked = true;
  document.querySelector(`[name=interest][value="${value}"]`).checked = true;
}

function showCityVideos(value) {
  selectCityTheme(value);
  collection = "";
  feed.scrollLeft = 0;
  update();
  const results = byId("video-results");
  results.focus({ preventScroll: true });
  results.scrollIntoView({ block: "start" });
}

function openVideo(place, trigger) {
  activeVideo = place;
  videoTrigger = trigger;
  byId("player-title").textContent = place.title[language];
  byId("player-credit").textContent = place.broadcaster[language];
  byId("video-source").href = "https://www.youtube.com/watch?v=" + place.video;
  const iframe = document.createElement("iframe");
  iframe.src = `https://www.youtube-nocookie.com/embed/${place.video}?autoplay=1&playsinline=1&rel=0`;
  iframe.title = place.title[language] + " (" + text("play") + ")";
  iframe.allow = "accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; web-share";
  iframe.referrerPolicy = "strict-origin-when-cross-origin";
  iframe.allowFullscreen = true;
  byId("player-frame").replaceChildren(iframe);
  byId("player").showModal();
}

document.querySelectorAll("[name=mode]").forEach((input) => {
  input.addEventListener("change", () => selectMode(input.value));
});
Object.values(controls).forEach((control) => control.addEventListener("input", update));
for (const input of document.querySelectorAll("[name=scope], [name=interest]")) {
  input.addEventListener("change", () => {
    if (input.name === "scope") {
      scope = input.value;
      if (scope === "near" && cityInterests.has(interest)) {
        interest = "all";
        document.querySelector("[name=interest][value=all]").checked = true;
      }
    } else {
      interest = input.value;
      if (cityInterests.has(interest)) selectCityTheme(interest);
    }
    collection = "";
    byId("feed").scrollLeft = 0;
    update();
  });
}
byId("district").addEventListener("change", (event) => {
  district = event.target.value;
  collection = "";
  byId("feed").scrollLeft = 0;
  renderFeed();
});
byId("trends-file").addEventListener("change", async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  try {
    if (file.size > 200_000) throw new Error("CSV exceeds maximum size");
    const contents = await file.text();
    if (event.target.files[0] !== file) return;
    trendData = parseTrends(contents);
    badTrendFile = false;
  } catch {
    if (event.target.files[0] !== file) return;
    trendData = null;
    badTrendFile = true;
  }
  byId("feed").scrollLeft = 0;
  renderFeed();
});
byId("find-now").addEventListener("click", () => selectMode("now"));
byId("explore-trek").addEventListener("click", () => showCityVideos("trail"));
for (const link of document.querySelectorAll("[data-quick-theme]")) {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    showCityVideos(link.dataset.quickTheme);
  });
}
byId("refresh").addEventListener("click", refresh);
byId("language").addEventListener("click", () => {
  language = 1 - language;
  savePreference("one-more-language", language ? "en" : "ko");
  translate();
  update();
});
for (const id of ["saved", "visited"]) {
  byId(id).addEventListener("click", () => {
    collection = collection === id ? "" : id;
    byId("feed").scrollLeft = 0;
    renderFeed();
  });
}
byId("feed").addEventListener("click", (event) => {
  const video = event.target.closest("[data-video]");
  if (video) openVideo(allPlaces.find(({ id }) => id === video.dataset.video), video);
  const bookmark = event.target.closest("[data-save]");
  if (bookmark) {
    const id = bookmark.dataset.save;
    if (saved.has(id)) saved.delete(id);
    else saved.add(id);
    savePreference("one-more-saved", JSON.stringify([...saved]));
    renderFeed();
    (byId("feed").querySelector(`[data-save="${id}"]`) ?? byId("saved")).focus();
  }
  const visit = event.target.closest("[data-visit]");
  if (visit) {
    const id = visit.dataset.visit;
    if (visited.has(id)) visited.delete(id);
    else visited.set(id, seoulClock().date);
    savePreference("last-stop-visited", JSON.stringify(Object.fromEntries(visited)));
    renderFeed();
    (byId("feed").querySelector(`[data-visit="${id}"]`) ?? byId("visited")).focus();
  }
});
for (const [id, step] of [["back", -1], ["next", 1]]) {
  byId(id).addEventListener("click", () => {
    const [first, second] = feed.children;
    if (!first || !second) return;
    const distance = second.offsetLeft - first.offsetLeft;
    feed.scrollBy({ left: distance * step, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  });
}
feed.addEventListener("scroll", syncFeedControls, { passive: true });
new ResizeObserver(syncFeedControls).observe(feed);
byId("close-player").addEventListener("click", () => byId("player").close());
byId("player").addEventListener("close", () => {
  byId("player-frame").replaceChildren();
  if (activeVideo) (videoTrigger?.isConnected ? videoTrigger :
    byId("feed").querySelector(`[data-video="${activeVideo.id}"]`) ?? byId("saved")).focus();
  activeVideo = null;
});
controls.date.value = seoulClock().date;
translate();
update();
setInterval(() => {
  if (mode === "now" && !document.hidden) refresh();
  else renderPlan();
}, 60_000);
