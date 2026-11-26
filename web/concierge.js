import { places, seoulClock, minutes, hhmm } from "./planner.js";

const copy = {
  title: ["서울 여행 까치", "Seoul Travel Magpie"],
  launcher: ["여행 챗봇", "Travel chat"],
  subtitle: ["서울역에서 출발하는 여행 도우미", "Your Seoul Station travel assistant"],
  close: ["채팅 닫기", "Close chat"],
  tabs: ["여행 도우미 기능", "Travel assistant tools"],
  chat: ["대화", "Chat"],
  route: ["내 경로", "My route"],
  video: ["맛집 영상", "Food videos"],
  greet: ["안녕하세요! 서울역에서 몇 시까지 돌아와야 하나요? 남는 시간과 취향을 알려주시면 들를 곳을 찾아드릴게요.", "Hi! What time do you need to be back at Seoul Station? Tell me how much time you have and what you like."],
  ideas: ["이렇게 물어보세요", "Try asking"],
  prompt1: ["오후 1시에 출발해서 오후 5시까지, 맛집 추천해줘", "Leave at 1 pm and return by 5 pm. Find me somewhere to eat."],
  prompt2: ["아침 8시 반에 출발해서 2시간 동안 조용한 곳", "Start at 8:30 am. Find a quiet place to visit in two hours."],
  prompt3: ["지금 출발, 2시간 안에 돌아오는 실내 장소", "Leaving now. An indoor place that fits in two hours."],
  query: ["예: 오후 5시까지, 조용한 곳", "e.g. A quiet place, back by 5 pm"],
  queryLabel: ["여행 조건", "Travel conditions"],
  privacy: ["여행 조건만 입력해 주세요. 이름·연락처·예약번호는 빼주세요.", "Share travel conditions only. Leave out names, contact details and booking numbers."],
  send: ["보내기", "Send"],
  waiting: ["여행 조건을 확인하고 있어요", "Checking your travel conditions"],
  unavailable: ["지금은 챗봇에 연결할 수 없어요. 잠시 후 다시 시도해 주세요.", "Chat is unavailable. Try again shortly."],
  sage: ["Amazon SageMaker로 조건 해석", "Conditions interpreted by Amazon SageMaker"],
  rules: ["기본 규칙으로 조건 해석", "Conditions interpreted by basic rules"],
  play: ["영상 보기", "Watch video"],
  map: ["길찾기", "Directions"],
  source: ["운영 정보", "Venue information"],
  add: ["경로에 추가", "Add to route"],
  goRoute: ["내 경로 열기", "Open my route"],
  goVideo: ["맛집 영상 열기", "Open food videos"],
  goAlbum: ["여행 앨범 열기", "Open travel album"],
  dateContext: ["서울 현지 날짜 기준", "Uses the current date in Seoul"],
  start: ["출발 시각", "Departure"],
  end: ["서울역 복귀 마감", "Back at Seoul Station by"],
  now: ["지금 출발", "Leave now"],
  stop: ["추가할 장소", "Place to add"],
  empty: ["장소를 담으면 방문 순서와 복귀 가능 시간을 계산할 수 있어요.", "Add a place to check the visit order and when you can return."],
  max: ["한 경로에 장소를 3곳까지 담을 수 있어요.", "A route can include up to three stops."],
  up: ["순서 위로", "Move up"],
  down: ["순서 아래로", "Move down"],
  remove: ["삭제", "Remove"],
  dwell: ["머무는 시간(분)", "Visit duration (min)"],
  station: ["서울역", "Seoul Station"],
  calculate: ["복귀 가능 시간 계산", "Check return time"],
  routeWait: ["이동 시간과 입장 가능 여부를 확인 중이에요", "Checking walking times and venue hours"],
  routeResult: ["경로 계산 결과", "Route calculation result"],
  routeChanged: ["경로가 바뀌었어요. 시간을 다시 계산해 주세요.", "The route changed. Calculate again to update the times."],
  added: ["내 경로에 추가했어요.", "Added to my route."],
  duplicate: ["이미 내 경로에 있는 장소예요.", "This place is already on your route."],
  buffer: ["복귀 여유", "Return buffer"],
  reserveUnit: ["분", " min"],
  arrival: ["도착", "Arrive"],
  leave: ["출발", "Leave"],
  returnBy: ["복귀 마감", "Return deadline"],
  hoursUnknown: ["운영시간 미확인", "Hours unverified"],
  closed: ["운영시간에 맞지 않음", "Outside operating hours"],
  lastEntry: ["입장 마감", "Last entry passed"],
  rain: ["강수 중인 실외 장소", "Outdoor stop in rain"],
  dawn: ["새벽 첫차 이전", "Before the first morning train"],
  short: ["머무는 시간 부족", "Insufficient visit time"],
  mapped: ["도보 경로 산정 · OpenStreetMap", "Walking route · OpenStreetMap"],
  estimate: ["서울역 경유 기준 도보 추정", "Estimated walking via Seoul Station"],
  editMap: ["지도 수정", "Edit map"],
  routeMap: ["지도에서 전체 경로 열기", "Open full route in maps"],
  invalidTime: ["출발 시각보다 늦은 시각을 복귀 마감으로 입력해 주세요.", "Enter a return deadline after departure."],
  weather: ["현재 날씨 반영", "Current weather applied"],
  rail: ["실시간 열차 도착 반영", "Live train arrivals applied"],
  walkOnly: ["도보 기준", "Walking route"],
  videoInstructions: ["유튜브 링크에서 영상 정보를 가져오고, 적어주신 가게명과 메뉴를 함께 확인합니다.", "Look up a YouTube video and check the restaurant names and menu items you provide."],
  videoUrl: ["유튜브 영상 링크", "YouTube video link"],
  videoNotes: ["가게명·메뉴 메모 (선택)", "Restaurant and menu notes (optional)"],
  videoHint: ["직접 작성한 메모나 사용 권한이 있는 텍스트를 입력하세요.", "Use your own notes or text you have permission to share."],
  videoPlaceholder: ["가게: 희락갈치\n메뉴: 갈치조림", "Restaurant: Huirak Galchi\nMenu: braised hairtail"],
  scan: ["가게 후보 찾기", "Find candidates"],
  checkingVideo: ["영상 정보를 확인 중이에요", "Checking video information"],
  videoResult: ["맛집 영상 확인 결과", "Video lookup result"],
  savedTitle: ["저장한 맛집 후보", "Saved candidates"],
  save: ["후보 저장", "Save candidate"],
  saved: ["저장됨", "Saved"],
  savedHere: ["이 브라우저에 저장했어요.", "Saved in this browser."],
  storageError: ["브라우저에 저장할 수 없어요.", "Unable to save in this browser."],
  original: ["YouTube에서 원본 보기", "Watch on YouTube"],
  checkPlace: ["지도에서 가게 확인", "Check restaurant on maps"],
  closeVideo: ["영상 닫기", "Close video"],
};

let language = document.documentElement.lang === "en" ? 1 : 0;
const text = (key) => copy[key][language];
const avatar = "/assets/travel-magpie.webp";
const root = document.createElement("div");
root.className = "concierge";
root.innerHTML = [
  '<button class="concierge-launch" type="button" data-open aria-controls="concierge-panel" aria-expanded="false">',
  '<img src="' + avatar + '" width="48" height="48" alt=""><span data-concierge-copy="launcher"></span></button>',
  '<section id="concierge-panel" class="concierge-panel" role="dialog" aria-labelledby="concierge-title" hidden>',
  '<header class="concierge-header"><div class="concierge-avatar"><img src="' + avatar + '" width="56" height="56" alt=""></div>',
  '<div><h2 id="concierge-title" data-concierge-copy="title"></h2><p data-concierge-copy="subtitle"></p></div>',
  '<button class="concierge-close" type="button" data-close><span aria-hidden="true">×</span></button></header>',
  '<nav class="concierge-tabs" data-tabs>',
  '<button type="button" data-tab="chat" data-concierge-copy="chat" aria-controls="concierge-chat"></button>',
  '<button type="button" data-tab="route" data-concierge-copy="route" aria-controls="concierge-route"></button>',
  '<button type="button" data-tab="video" data-concierge-copy="video" aria-controls="concierge-video"></button>',
  '</nav>',
  '<div id="concierge-chat" class="concierge-view concierge-chat" data-view="chat">',
  '<div class="concierge-scroll" data-scroll><div class="concierge-thread" role="log" aria-live="polite" aria-relevant="additions" data-thread></div>',
  '<div class="concierge-prompts" data-prompts><p data-concierge-copy="ideas"></p>',
  '<button type="button" data-prompt="prompt1" data-concierge-copy="prompt1"></button>',
  '<button type="button" data-prompt="prompt2" data-concierge-copy="prompt2"></button>',
  '<button type="button" data-prompt="prompt3" data-concierge-copy="prompt3"></button></div></div>',
  '<form class="concierge-compose" data-chat-form><label class="sr-only" for="concierge-query" data-concierge-copy="queryLabel"></label>',
  '<textarea id="concierge-query" name="query" rows="1" maxlength="600" aria-describedby="concierge-privacy" required></textarea>',
  '<button type="submit" class="concierge-primary" data-concierge-copy="send"></button>',
  '<p id="concierge-privacy" class="concierge-note" data-concierge-copy="privacy"></p></form></div>',
  '<div id="concierge-route" class="concierge-view concierge-scroll" data-view="route" hidden>',
  '<form class="concierge-route-form" data-route-form>',
  '<div class="concierge-fields"><label><span data-concierge-copy="start"></span><input type="time" name="start" required></label>',
  '<label><span data-concierge-copy="end"></span><input type="time" name="end" required></label></div>',
  '<div class="concierge-inline"><label class="concierge-check"><input type="checkbox" name="now"><span data-concierge-copy="now"></span></label>',
  '<span class="concierge-note" data-concierge-copy="dateContext"></span></div>',
  '<ol class="concierge-stops" aria-label="서울역 왕복" data-stops></ol>',
  '<div class="concierge-picker"><label for="concierge-stop" data-concierge-copy="stop"></label><div>',
  '<select id="concierge-stop" name="stop"></select><button type="button" data-add-selected data-concierge-copy="add"></button></div></div>',
  '<p class="concierge-note" data-route-status role="status"></p>',
  '<button class="concierge-primary" type="submit" data-concierge-copy="calculate"></button>',
  '</form><section class="concierge-results" data-route-result aria-live="polite" tabindex="-1"></section></div>',
  '<div id="concierge-video" class="concierge-view concierge-scroll" data-view="video" hidden>',
  '<form class="concierge-video-form" data-video-form><p class="concierge-note" data-concierge-copy="videoInstructions"></p>',
  '<label><span data-concierge-copy="videoUrl"></span><input name="url" type="url" inputmode="url" maxlength="400" placeholder="https://youtu.be/…" required></label>',
  '<label><span data-concierge-copy="videoNotes"></span><textarea name="notes" rows="3" maxlength="1800" aria-describedby="concierge-video-hint"></textarea></label>',
  '<p class="concierge-note" id="concierge-video-hint" data-concierge-copy="videoHint"></p>',
  '<button type="submit" class="concierge-primary" data-concierge-copy="scan"></button></form>',
  '<section class="concierge-results" data-video-result aria-live="polite" tabindex="-1"></section><section class="concierge-saved" data-video-saved hidden></section></div>',
  '</section>',
  '<dialog class="concierge-player" aria-labelledby="concierge-player-title"><div class="concierge-player-heading">',
  '<h2 id="concierge-player-title"></h2><form method="dialog"><button type="submit" data-concierge-copy="closeVideo"></button></form></div>',
  '<div class="concierge-player-frame"></div><a data-original target="_blank" rel="noopener noreferrer" data-concierge-copy="original"></a></dialog>',
].join("");
document.body.append(root);

const find = (selector) => root.querySelector(selector);
const launch = find("[data-open]");
const panel = find("#concierge-panel");
const chatForm = find("[data-chat-form]");
const query = chatForm.elements.namedItem("query");
const thread = find("[data-thread]");
const routeForm = find("[data-route-form]");
const routeStart = routeForm.elements.namedItem("start");
const routeEnd = routeForm.elements.namedItem("end");
const routeNow = routeForm.elements.namedItem("now");
const stopSelect = routeForm.elements.namedItem("stop");
const routeStatus = find("[data-route-status]");
const routeResult = find("[data-route-result]");
const videoForm = find("[data-video-form]");
const videoResult = find("[data-video-result]");
const savedElement = find("[data-video-saved]");
const player = find(".concierge-player");
const playerFrame = find(".concierge-player-frame");
const savedKey = "one-more-food-candidates";
const stopLimit = 3;
let tab = "chat";
let context = {};
let stops = [];
let routeDirty = false;
let routeRevision = 0;
let routeReply;
let videoReply;
let lastVideoTrigger;
let saved = [];

try {
  const entries = JSON.parse(localStorage.getItem(savedKey) ?? "[]");
  if (Array.isArray(entries)) {
    saved = entries.filter((entry) => /^[\w-]{11}$/.test(entry?.id ?? "") && typeof entry.name === "string").slice(0, 30);
  }
} catch { /* Browser storage can be disabled. */ }

const messages = [{ key: "greet" }];
const lang = () => language ? "en" : "ko";

function element(tag, className, content) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (content != null) node.textContent = content;
  return node;
}

function button(label, action, className) {
  const node = element("button", className, label);
  node.type = "button";
  node.addEventListener("click", action);
  return node;
}

function link(label, href) {
  if (!href) return null;
  let url;
  try { url = new URL(href, location.origin); } catch { return null; }
  if (url.protocol !== "https:" && url.origin !== location.origin) return null;
  const node = element("a", "concierge-link", label);
  node.href = url.href;
  if (url.origin !== location.origin) {
    node.target = "_blank";
    node.rel = "noopener noreferrer";
  }
  return node;
}

function actions(list) {
  const node = element("div", "concierge-actions");
  node.append(...list.filter(Boolean));
  return node;
}

function selectTab(next) {
  tab = next;
  for (const node of root.querySelectorAll("[data-tab]")) {
    node.setAttribute("aria-pressed", String(node.dataset.tab === next));
  }
  for (const node of root.querySelectorAll("[data-view]")) node.hidden = node.dataset.view !== next;
  if (next === "route") renderStops();
}

function openTab(next) {
  selectTab(next);
  find('[data-tab="' + next + '"]').focus({ preventScroll: true });
}

function toggle(open) {
  panel.hidden = !open;
  launch.setAttribute("aria-expanded", String(open));
  if (open) {
    find('[data-tab="' + tab + '"]').focus({ preventScroll: true });
    fitViewport();
  } else {
    launch.focus({ preventScroll: true });
  }
}

function fitViewport() {
  if (!window.visualViewport || panel.hidden) return;
  const viewport = window.visualViewport;
  root.style.setProperty("--concierge-visual-height", Math.floor(viewport.height) + "px");
  root.style.setProperty("--concierge-keyboard", Math.max(0, Math.round(window.innerHeight - viewport.height - viewport.offsetTop)) + "px");
}

window.visualViewport?.addEventListener("resize", fitViewport);
window.visualViewport?.addEventListener("scroll", fitViewport);

function preview(id, title, trigger) {
  if (!/^[\w-]{11}$/.test(id ?? "")) return;
  lastVideoTrigger = trigger;
  find("#concierge-player-title").textContent = title;
  const iframe = element("iframe");
  iframe.src = "https://www.youtube-nocookie.com/embed/" + id + "?autoplay=1&playsinline=1&rel=0";
  iframe.title = title;
  iframe.allow = "autoplay; encrypted-media; picture-in-picture; fullscreen";
  iframe.referrerPolicy = "strict-origin-when-cross-origin";
  iframe.allowFullscreen = true;
  playerFrame.replaceChildren(iframe);
  find("[data-original]").href = "https://www.youtube.com/watch?v=" + id;
  player.showModal();
}
player.addEventListener("close", () => {
  playerFrame.replaceChildren();
  lastVideoTrigger?.focus({ preventScroll: true });
});

async function request(payload) {
  const response = await fetch("/api/concierge", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ ...payload, lang: lang() }),
    signal: AbortSignal.timeout(20_000),
  });
  const data = await response.json();
  if (!response.ok) {
    const error = new Error(typeof data.error === "string" ? data.error : text("unavailable"));
    error.fromServer = true;
    throw error;
  }
  return data;
}

function errorText(error) {
  return error.fromServer ? error.message : text("unavailable");
}

function liveSources(live) {
  return [live?.weather ? text("weather") : "", live?.rail ? text("rail") : ""].filter(Boolean).join(" / ");
}

function revealResult(result, view) {
  if (panel.hidden || tab !== view) return;
  result.focus({ preventScroll: true });
  const scroller = result.closest(".concierge-scroll");
  scroller.scrollTop += result.getBoundingClientRect().top - scroller.getBoundingClientRect().top;
}

function optionCard(option) {
  const card = element("article", "concierge-option");
  card.append(element("h3", "", option.title), element("p", "concierge-note", option.description));
  if (option.arrival && option.leave) {
    card.append(element("p", "concierge-times",
      text("arrival") + " " + option.arrival + "  /  " + text("leave") + " " + option.leave));
  }
  const add = option.canAdd ? button(text("add"), () => addAndOpenRoute(option.id)) : null;
  card.append(actions([
    add,
    option.video ? button(text("play"), (event) => preview(option.video, option.title, event.currentTarget)) : null,
    link(text("map"), option.mapUrl),
    link(text("source"), option.sourceUrl),
  ]));
  return card;
}

function messageItem(entry) {
  const bubble = element("div", "concierge-message");
  if (entry.user) bubble.classList.add("concierge-user");
  if (entry.error) bubble.classList.add("concierge-error");
  const data = entry.data;
  bubble.append(element("p", "", data?.response ?? (entry.key ? text(entry.key) : entry.message)));
  if (!data) return bubble;
  const sources = [text(data.engine === "sagemaker" ? "sage" : "rules"), liveSources(data.live)].filter(Boolean);
  bubble.append(element("p", "concierge-note concierge-engine", sources.join(" / ")));
  if (data.action === "route") bubble.append(button(text("goRoute"), () => openTab("route")));
  if (data.action === "video") bubble.append(button(text("goVideo"), () => openTab("video")));
  if (data.action === "album") bubble.append(link(text("goAlbum"), "/album"));
  for (const option of data.options ?? []) bubble.append(optionCard(option));
  return bubble;
}

function appendMessage(message) {
  messages.push(message);
  const item = messageItem(message);
  thread.append(item);
  return item;
}

function scrollChat() {
  const scroller = find("[data-scroll]");
  scroller.scrollTop = scroller.scrollHeight;
}

async function send(queryText) {
  const submit = chatForm.querySelector('[type="submit"]');
  if (!queryText || submit.disabled) return;
  submit.disabled = true;
  find("[data-prompts]").hidden = true;
  appendMessage({ user: true, message: queryText });
  query.value = "";
  const waiting = element("p", "concierge-message concierge-note", text("waiting"));
  waiting.setAttribute("role", "status");
  thread.append(waiting);
  scrollChat();
  try {
    const data = await request({ kind: "message", query: queryText, context });
    context = data.context ?? context;
    if (context.start) routeStart.value = context.start;
    if (context.end) routeEnd.value = context.end;
    if (context.mode) updateNow(context.mode === "now");
    invalidateRoute(false);
    appendMessage({ data });
  } catch (error) {
    appendMessage({ error: true, message: errorText(error) });
  } finally {
    waiting.remove();
    submit.disabled = false;
    if (!panel.hidden && tab === "chat") scrollChat();
  }
}

function updateNow(now) {
  routeNow.checked = now;
  routeStart.disabled = now;
}

function invalidateRoute(showNotice = true) {
  routeRevision += 1;
  if (showNotice && routeReply) routeDirty = true;
  routeReply = null;
  routeResult.replaceChildren();
  if (routeDirty) routeStatus.textContent = text("routeChanged");
}

function addStop(id) {
  const place = places.find((item) => item.id === id);
  if (!place || stops.some((stop) => stop.id === id) || stops.length >= stopLimit) return false;
  stops.push({ id, dwell: place.visit });
  invalidateRoute();
  routeStatus.textContent = text("added");
  renderStops();
  return true;
}

function addAndOpenRoute(id) {
  if (!addStop(id)) routeStatus.textContent = text(stops.some((stop) => stop.id === id) ? "duplicate" : "max");
  openTab("route");
}

function moveStop(index, amount) {
  const next = index + amount;
  if (next < 0 || next >= stops.length) return;
  [stops[index], stops[next]] = [stops[next], stops[index]];
  invalidateRoute();
  renderStops();
  const row = find('[data-stop-index="' + next + '"]');
  const moved = row.querySelector(amount < 0 ? "[data-stop-up]" : "[data-stop-down]");
  (moved.disabled ? row.querySelector("button:not(:disabled)") : moved)?.focus({ preventScroll: true });
}

function renderStops() {
  const list = find("[data-stops]");
  const nodeForStation = (key) => element("li", "concierge-station", text("station") + " / " + text(key));
  list.replaceChildren(nodeForStation("start"));
  if (!stops.length) list.append(element("li", "concierge-empty", text("empty")));
  stops.forEach((stop, index) => {
    const place = places.find((item) => item.id === stop.id);
    const item = element("li", "concierge-stop");
    item.dataset.stopIndex = index;
    item.append(element("strong", "", place.title[language]));
    const controls = element("div", "concierge-stop-controls");
    const dwell = element("label", "concierge-dwell", text("dwell"));
    const input = element("input");
    input.type = "number";
    input.min = "10";
    input.max = "120";
    input.step = "1";
    input.required = true;
    input.value = stop.dwell;
    input.addEventListener("change", () => {
      if (!input.checkValidity()) return;
      stop.dwell = input.valueAsNumber;
      invalidateRoute();
    });
    dwell.append(input);
    const up = button("↑", () => moveStop(index, -1));
    up.dataset.stopUp = "";
    up.setAttribute("aria-label", place.title[language] + " " + text("up"));
    up.title = text("up");
    up.disabled = index === 0;
    const down = button("↓", () => moveStop(index, 1));
    down.dataset.stopDown = "";
    down.setAttribute("aria-label", place.title[language] + " " + text("down"));
    down.title = text("down");
    down.disabled = index === stops.length - 1;
    const remove = button(text("remove"), () => {
      stops.splice(index, 1);
      invalidateRoute();
      renderStops();
      stopSelect.focus({ preventScroll: true });
    });
    remove.setAttribute("aria-label", place.title[language] + " " + text("remove"));
    controls.append(dwell, up, down, remove);
    item.append(controls);
    list.append(item);
  });
  list.append(nodeForStation("returnBy"));
  const options = places.filter((place) => !stops.some((stop) => stop.id === place.id));
  const selected = stopSelect.value;
  stopSelect.replaceChildren(...options.map((place) => new Option(place.title[language], place.id)));
  if (options.some((place) => place.id === selected)) stopSelect.value = selected;
  const full = stops.length >= stopLimit;
  stopSelect.disabled = full;
  find("[data-add-selected]").disabled = full;
  routeForm.querySelector('[type="submit"]').disabled = !stops.length || routeForm.dataset.waiting === "true";
  if (full && !routeStatus.textContent) routeStatus.textContent = text("max");
}

const reasons = { unknown: "hoursUnknown", closed: "closed", "last-entry": "lastEntry", rain: "rain", short: "short", dawn: "dawn" };

function renderRoute() {
  routeResult.replaceChildren();
  if (!routeReply) return;
  const data = routeReply;
  const intro = element("p", data.feasible ? "" : "concierge-error", data.response);
  const times = element("p", "concierge-times",
    (data.arrival ? text("station") + " " + text("arrival") + " " + data.arrival + "  /  " : "") +
    text("buffer") + " " + data.reserve + text("reserveUnit"));
  routeResult.append(intro, times);
  const list = element("ol", "concierge-result-stops");
  for (const stop of data.stops) {
    const row = element("li", "", stop.title);
    if (stop.arrival && stop.departure) {
      row.append(element("span", "concierge-times", stop.arrival + " ~ " + stop.departure));
    }
    if (stop.reason && reasons[stop.reason]) row.append(element("span", "concierge-error", text(reasons[stop.reason])));
    list.append(row);
  }
  routeResult.append(list);
  const meta = [text(data.routing === "mapped" ? "mapped" : "estimate"), data.live?.weather ? text("weather") : ""].filter(Boolean);
  routeResult.append(element("p", "concierge-note", meta.join(" / ")));
  const links = [link(text("routeMap"), data.mapUrl)];
  if (data.routing === "mapped") {
    links.push(
      link("© OpenStreetMap contributors", "https://www.openstreetmap.org/copyright"),
      link(text("editMap"), "https://www.openstreetmap.org/edit"),
    );
  }
  routeResult.append(actions(links));
}

async function calculateRoute(event) {
  event.preventDefault();
  if (!stops.length || routeForm.dataset.waiting === "true") return;
  const start = routeNow.checked ? seoulClock().time : routeStart.value;
  const end = routeEnd.value;
  if (minutes(end) <= minutes(start)) {
    routeStatus.textContent = text("invalidTime");
    return;
  }
  const revision = routeRevision;
  routeForm.dataset.waiting = "true";
  routeDirty = false;
  routeStatus.textContent = text("routeWait");
  routeResult.replaceChildren();
  renderStops();
  try {
    const data = await request({ kind: "route", start, end, mode: routeNow.checked ? "now" : "planned", stops });
    if (routeRevision !== revision) {
      routeStatus.textContent = text("routeChanged");
      return;
    }
    routeStatus.textContent = "";
    routeReply = data;
    renderRoute();
    revealResult(routeResult, "route");
  } catch (error) {
    routeStatus.textContent = errorText(error);
  } finally {
    delete routeForm.dataset.waiting;
    renderStops();
  }
}

function saveCandidate(candidate, video, status) {
  if (saved.some((item) => item.name === candidate.name && item.id === video.id)) return;
  const next = [{
    id: video.id, title: video.title, name: candidate.name, menu: candidate.menu,
    mapUrl: candidate.mapUrl, placeId: candidate.placeId,
  }, ...saved].slice(0, 30);
  try {
    localStorage.setItem(savedKey, JSON.stringify(next));
    saved = next;
    renderSaved();
    status.textContent = text("savedHere");
  } catch {
    status.textContent = text("storageError");
  }
}

function menuLabel(menu) {
  return Array.isArray(menu) ? menu.filter((dish) => typeof dish === "string").join(", ") : "";
}

function addCandidate(candidate) {
  if (!places.some((place) => place.id === candidate.placeId)) return null;
  return button(text("add"), () => addAndOpenRoute(candidate.placeId));
}

function candidateCard(candidate, video) {
  const row = element("article", "concierge-option");
  row.append(element("h3", "", candidate.name));
  if (menuLabel(candidate.menu)) row.append(element("p", "concierge-note", menuLabel(candidate.menu)));
  const status = element("p", "concierge-note");
  status.setAttribute("role", "status");
  const save = button(text("save"), () => {
    saveCandidate(candidate, video, status);
    if (saved.some((item) => item.name === candidate.name && item.id === video.id)) {
      save.textContent = text("saved");
      save.disabled = true;
    }
  });
  if (saved.some((item) => item.name === candidate.name && item.id === video.id)) {
    save.textContent = text("saved");
    save.disabled = true;
  }
  row.append(actions([save, link(text("checkPlace"), candidate.mapUrl), addCandidate(candidate)]), status);
  return row;
}

function renderVideo() {
  videoResult.replaceChildren();
  if (!videoReply) return;
  const data = videoReply;
  videoResult.append(element("p", "", data.response));
  if (data.title) videoResult.append(element("h3", "", data.title));
  if (data.author) videoResult.append(element("p", "concierge-note", data.author));
  videoResult.append(actions([
    button(text("play"), (event) => preview(data.id, data.title || text("video"), event.currentTarget)),
    link(text("original"), data.url),
  ]));
  for (const candidate of data.candidates ?? []) videoResult.append(candidateCard(candidate, data));
}

function renderSaved() {
  savedElement.hidden = !saved.length;
  savedElement.replaceChildren(element("h3", "", text("savedTitle")));
  for (const candidate of saved) {
    const row = element("article", "concierge-option");
    row.append(element("strong", "", candidate.name));
    if (menuLabel(candidate.menu)) row.append(element("p", "concierge-note", menuLabel(candidate.menu)));
    row.append(actions([
      button(text("play"), (event) => preview(candidate.id, candidate.title || text("video"), event.currentTarget)),
      link(text("checkPlace"), candidate.mapUrl),
      addCandidate(candidate),
      button(text("remove"), () => {
        const next = saved.filter((item) => item !== candidate);
        try {
          localStorage.setItem(savedKey, JSON.stringify(next));
          saved = next;
          renderSaved();
          videoForm.elements.namedItem("url").focus({ preventScroll: true });
          renderVideo();
        } catch {
          videoResult.append(element("p", "concierge-error", text("storageError")));
        }
      }),
    ]));
    savedElement.append(row);
  }
}

async function scanVideo(event) {
  event.preventDefault();
  const submit = videoForm.querySelector('[type="submit"]');
  if (submit.disabled) return;
  submit.disabled = true;
  videoReply = null;
  videoResult.replaceChildren(element("p", "concierge-note", text("checkingVideo")));
  try {
    videoReply = await request({
      kind: "video",
      url: videoForm.elements.namedItem("url").value.trim(),
      text: videoForm.elements.namedItem("notes").value.trim(),
    });
    renderVideo();
    revealResult(videoResult, "video");
  } catch (error) {
    videoResult.replaceChildren(element("p", "concierge-error", errorText(error)));
    revealResult(videoResult, "video");
  } finally {
    submit.disabled = false;
  }
}

function translate() {
  language = document.documentElement.lang === "en" ? 1 : 0;
  for (const node of root.querySelectorAll("[data-concierge-copy]")) node.textContent = text(node.dataset.conciergeCopy);
  find("[data-close]").setAttribute("aria-label", text("close"));
  find("[data-tabs]").setAttribute("aria-label", text("tabs"));
  find("[data-stops]").setAttribute("aria-label", text("station") + " " + text("route"));
  routeResult.setAttribute("aria-label", text("routeResult"));
  videoResult.setAttribute("aria-label", text("videoResult"));
  query.placeholder = text("query");
  videoForm.elements.namedItem("notes").placeholder = text("videoPlaceholder");
  const scroller = find("[data-scroll]");
  const offset = scroller.scrollTop;
  thread.replaceChildren(...messages.map(messageItem));
  scroller.scrollTop = offset;
  if (tab === "route") renderStops();
  if (routeDirty) routeStatus.textContent = text("routeChanged");
  if (routeReply) renderRoute();
  if (videoReply) renderVideo();
  renderSaved();
}

launch.addEventListener("click", () => toggle(panel.hidden));
find("[data-close]").addEventListener("click", () => toggle(false));
panel.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    event.preventDefault();
    toggle(false);
  }
});
for (const node of root.querySelectorAll("[data-tab]")) {
  node.addEventListener("click", () => selectTab(node.dataset.tab));
}
for (const node of root.querySelectorAll("[data-prompt]")) {
  node.addEventListener("click", () => {
    find("[data-tab=chat]").focus({ preventScroll: true });
    send(text(node.dataset.prompt));
  });
}
chatForm.addEventListener("submit", (event) => {
  event.preventDefault();
  send(query.value.trim());
});
query.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !event.shiftKey && !event.isComposing && event.keyCode !== 229) {
    event.preventDefault();
    chatForm.requestSubmit();
  }
});
routeStart.value = hhmm(Math.min(1335, minutes(seoulClock().time)));
routeEnd.value = hhmm(Math.min(1439, minutes(routeStart.value) + 120));
routeForm.addEventListener("submit", calculateRoute);
routeStart.addEventListener("change", () => invalidateRoute());
routeEnd.addEventListener("change", () => invalidateRoute());
routeNow.addEventListener("change", () => {
  updateNow(routeNow.checked);
  invalidateRoute();
});
find("[data-add-selected]").addEventListener("click", () => addStop(stopSelect.value));
videoForm.addEventListener("submit", scanVideo);
new MutationObserver(translate).observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });
selectTab(tab);
translate();

