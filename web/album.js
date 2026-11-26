import { places, seoulClock } from "./planner.js";
import { discover } from "./discover.js";
import { readAlbum, removeEntry, saveEntry } from "./album-store.js";

const copy = {
  skip: ["새 기록으로 건너뛰기", "Skip to new entry"],
  brand: ["여행의 종점은 서울", "Last Stop Seoul"],
  home: ["홈으로", "Home"],
  heading: ["나의 서울 포토북", "My Seoul Photobook"],
  privacy: ["사진과 동영상은 이 기기의 브라우저에 저장됩니다.", "Photos and videos are stored in this browser."],
  newMemory: ["새 포토북", "New photobook"],
  coverSelect: ["표지 고르기", "Choose a cover"],
  paper: ["한지 일기", "Hanji journal"],
  ticket: ["서울행 승차권", "Ticket to Seoul"],
  city: ["서울 풍경", "Seoul cityscape"],
  entryTitle: ["제목", "Title"],
  entryDate: ["방문 날짜", "Visit date"],
  entryNote: ["기억하고 싶은 순간 (선택)", "A moment to remember (optional)"],
  addMedia: ["사진·동영상 선택", "Choose photos and videos"],
  noFile: ["선택한 파일 없음", "No files selected"],
  fileDetails: [
    "사진은 20메가바이트, 영상은 150메가바이트까지 선택할 수 있습니다. 한 기록은 160메가바이트까지 저장됩니다.",
    "Up to 20 MB per photo, 150 MB per video and 160 MB per entry.",
  ],
  save: ["앨범에 저장", "Save to album"],
  saving: ["저장 중", "Saving"],
  entries: ["내 포토북", "My photobooks"],
  empty: ["여행에서 찍은 첫 사진이나 영상을 남겨보세요.", "Add your first photo or video from Seoul."],
  saved: ["앨범에 기록을 저장했습니다.", "Saved to your album."],
  remove: ["삭제", "Delete"],
  removePrompt: ["이 기록의 사진과 동영상을 함께 삭제할까요?", "Delete this entry and its photos and videos?"],
  removed: ["기록을 삭제했습니다.", "Entry deleted."],
  missing: ["제목과 사진 또는 동영상을 입력해 주세요.", "Enter a title and choose photos or videos."],
  typeError: ["사진은 JPG·PNG·WebP·GIF·AVIF, 동영상은 MP4·WebM을 선택해 주세요.", "Choose JPG, PNG, WebP, GIF or AVIF photos, or MP4 or WebM videos."],
  emptyFile: ["내용이 없는 파일을 다시 선택해 주세요.", "Please replace the empty file."],
  sizeError: ["파일 용량을 확인해 주세요. 사진 20MB, 영상 150MB, 기록 합계 160MB까지 저장할 수 있습니다.", "Please check the file sizes. Limits are 20 MB per photo, 150 MB per video and 160 MB per entry."],
  storageError: ["브라우저에서 앨범을 열 수 없습니다. 저장소 사용이 허용된 브라우저에서 다시 열어 주세요.", "This browser could not open the album. Try a browser with storage enabled."],
  writeError: ["변경을 저장하지 못했습니다. 잠시 후 다시 시도해 주세요.", "Could not save the change. Please try again."],
  quota: ["저장 공간이 부족합니다. 파일 크기를 줄여 다시 시도해 주세요.", "Storage is full. Try smaller files."],
  photo: ["사진", "Photo"],
  video: ["동영상", "Video"],
  open: ["포토북 열기", "Open photobook"],
  close: ["포토북 닫기", "Close photobook"],
  previous: ["이전 페이지", "Previous page"],
  next: ["다음 페이지", "Next page"],
  credit: ["표지 사진 출처", "Cover photo credits"],
};

const byId = (id) => document.getElementById(id);
const form = byId("album-form");
const files = byId("entry-files");
const title = byId("entry-title");
const visitDate = byId("entry-date");
const note = byId("entry-note");
const saveButton = byId("save-entry");
const status = byId("album-status");
const megabyte = 1_000_000;
const photoTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"]);
const videoTypes = new Set(["video/mp4", "video/webm"]);
const coverImages = { paper: "/assets/palace.webp", ticket: "/assets/station.webp", city: "/assets/hero-small.webp" };
const book = byId("book-dialog");
const stage = byId("book-stage");
const prev = byId("book-prev");
const next = byId("book-next");
let language = 0;
let entries = [];
let objectUrls = [];
let bookUrls = [];
let activeEntry = null;
let bookPage = 0;
let swipeStart = null;
let pending = false;
let storageReady = false;

const text = (key) => copy[key][language];

function notice(key, tone = "info") {
  status.textContent = text(key);
  status.dataset.tone = tone;
}

function indicateSelection() {
  const length = files.files.length;
  byId("file-summary").textContent = length
    ? (language ? `${length} ${length === 1 ? "file" : "files"} selected` : `파일 ${length}개 선택`)
    : text("noFile");
}

function setPending(value) {
  pending = value;
  saveButton.disabled = value || !storageReady;
  saveButton.textContent = text(value ? "saving" : "save");
}

function fileIssue(selected) {
  let total = 0;
  for (const file of selected) {
    const video = videoTypes.has(file.type);
    if (!video && !photoTypes.has(file.type)) return "typeError";
    if (!file.size) return "emptyFile";
    if (file.size > (video ? 150 : 20) * megabyte) return "sizeError";
    total += file.size;
  }
  return total > 160 * megabyte ? "sizeError" : "";
}

function mediaElement(file, entryTitle, index) {
  const address = URL.createObjectURL(file);
  bookUrls.push(address);
  if (videoTypes.has(file.type)) {
    const video = document.createElement("video");
    video.controls = true;
    video.playsInline = true;
    video.preload = "metadata";
    video.setAttribute("aria-label", `${entryTitle} (${text("video")} ${index + 1})`);
    video.src = address;
    return video;
  }
  const photo = document.createElement("img");
  photo.alt = `${entryTitle} (${text("photo")} ${index + 1})`;
  photo.loading = "lazy";
  photo.src = address;
  const link = document.createElement("a");
  link.href = address;
  link.target = "_blank";
  link.rel = "noopener";
  link.append(photo);
  return link;
}

function bookCover(entry, cover, image, name, urls) {
  const theme = Object.hasOwn(coverImages, entry.cover) ? entry.cover : "paper";
  const photo = entry.files.find((file) => photoTypes.has(file.type));
  cover.dataset.cover = theme;
  if (photo) {
    image.src = URL.createObjectURL(photo);
    urls.push(image.src);
  } else {
    image.src = coverImages[theme];
  }
  name.textContent = entry.title;
}

function clearBook() {
  stage.replaceChildren();
  for (const url of bookUrls) URL.revokeObjectURL(url);
  bookUrls = [];
}

function drawBook(direction) {
  clearBook();
  const entry = activeEntry;
  const media = document.createElement("div");
  if (bookPage === 0) {
    media.className = "book-cover";
    const photo = document.createElement("img");
    photo.alt = "";
    const name = document.createElement("span");
    bookCover(entry, media, photo, name, bookUrls);
    media.append(photo, name);
    stage.append(media);
  } else {
    const spread = document.createElement("div");
    spread.className = "book-spread";
    const caption = document.createElement("div");
    caption.className = "book-caption";
    const date = document.createElement("time");
    date.dateTime = entry.date;
    date.textContent = entry.date;
    const heading = document.createElement("h3");
    heading.textContent = entry.title;
    caption.append(date, heading);
    if (entry.note) {
      const detail = document.createElement("p");
      detail.textContent = entry.note;
      caption.append(detail);
    }
    media.className = "book-media";
    media.append(mediaElement(entry.files[bookPage - 1], entry.title, bookPage - 1));
    spread.append(caption, media);
    stage.append(spread);
  }
  prev.disabled = bookPage === 0;
  next.disabled = bookPage === entry.files.length;
  byId("book-progress").textContent = `${bookPage + 1} / ${entry.files.length + 1}`;
  if (direction && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
    stage.firstElementChild.animate([
      { transform: `translateX(${direction * 12}px)`, opacity: 0.75 },
      { transform: "translateX(0)", opacity: 1 },
    ], { duration: 160, easing: "ease-out" });
  }
}

function turnPage(direction) {
  if (!activeEntry) return;
  const destination = bookPage + direction;
  if (destination < 0 || destination > activeEntry.files.length) return;
  bookPage = destination;
  drawBook(direction);
}

function renderAlbum() {
  const list = byId("album-list");
  list.replaceChildren();
  for (const url of objectUrls) URL.revokeObjectURL(url);
  objectUrls = [];
  byId("empty-album").hidden = !storageReady || entries.length > 0;
  byId("entry-count").textContent = language ? `${entries.length} ${entries.length === 1 ? "book" : "books"}` : `${entries.length}권`;
  for (const entry of entries) {
    const card = byId("album-entry").content.cloneNode(true);
    const date = card.querySelector("time");
    date.dateTime = entry.date;
    date.textContent = entry.date;
    card.querySelector("h3").textContent = entry.title;
    const caption = card.querySelector(".album-note");
    caption.textContent = entry.note;
    caption.hidden = !entry.note;
    const remove = card.querySelector("button[data-remove]");
    remove.textContent = text("remove");
    remove.setAttribute("aria-label", `${entry.title} ${text("remove")}`);
    remove.dataset.remove = entry.id;
    const open = card.querySelector("[data-open]");
    open.dataset.open = entry.id;
    open.setAttribute("aria-label", `${entry.title} ${text("open")}`);
    bookCover(entry, open.querySelector(".book-cover"), open.querySelector("img"), open.querySelector(".book-cover span"), objectUrls);
    list.append(card);
  }
}

function translate() {
  document.documentElement.lang = language ? "en" : "ko";
  document.title = `${text("heading")} | ${text("brand")}`;
  document.querySelectorAll("[data-copy]").forEach((element) => { element.textContent = text(element.dataset.copy); });
  byId("language").textContent = language ? "한국어" : "EN";
  byId("language").setAttribute("aria-label", language ? "한국어로 전환" : "Switch to English");
  byId("close-book").setAttribute("aria-label", text("close"));
  indicateSelection();
  setPending(pending);
  status.textContent = "";
  renderAlbum();
  if (!storageReady && initialized) notice("storageError", "error");
}

async function refreshAlbum() {
  entries = await readAlbum();
  entries.sort((a, b) => b.date.localeCompare(a.date) || b.createdAt - a.createdAt);
  storageReady = true;
  renderAlbum();
}

const placeId = new URLSearchParams(location.search).get("place");
const place = [...places, ...discover].find(({ id }) => id === placeId);
visitDate.value = seoulClock().date;
let initialized = false;
try {
  language = Number(localStorage.getItem("one-more-language") === "en");
  const recorded = place && JSON.parse(localStorage.getItem("last-stop-visited") ?? "{}")[place.id];
  if (recorded && /^\d{4}-\d{2}-\d{2}$/.test(recorded)) visitDate.value = recorded;
} catch { /* The album can still open with the default date. */ }
if (place) title.value = place.title[language];
translate();
refreshAlbum().catch(() => notice("storageError", "error")).finally(() => {
  initialized = true;
  setPending(false);
});

byId("language").addEventListener("click", () => {
  language = 1 - language;
  try { localStorage.setItem("one-more-language", language ? "en" : "ko"); } catch { /* Optional. */ }
  translate();
});
files.addEventListener("change", indicateSelection);
form.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (pending || !storageReady) return;
  const selected = [...files.files];
  const issue = !title.value.trim() || !selected.length ? "missing" : fileIssue(selected);
  if (issue) {
    notice(issue, "error");
    return;
  }
  setPending(true);
  try {
    await saveEntry({
      id: crypto.randomUUID(),
      title: title.value.trim(),
      date: visitDate.value,
      note: note.value.trim(),
      cover: new FormData(form).get("book-cover"),
      files: selected,
      createdAt: Date.now(),
    });
    form.reset();
    visitDate.value = seoulClock().date;
    indicateSelection();
    await refreshAlbum();
    notice("saved");
  } catch (error) {
    notice(error?.name === "QuotaExceededError" ? "quota" : "writeError", "error");
  } finally {
    setPending(false);
  }
});

byId("album-list").addEventListener("click", async (event) => {
  const open = event.target.closest("button[data-open]");
  if (open) {
    activeEntry = entries.find(({ id }) => id === open.dataset.open);
    if (!activeEntry) return;
    bookPage = 0;
    byId("book-title").textContent = activeEntry.title;
    drawBook(0);
    book.showModal();
    return;
  }
  const button = event.target.closest("button[data-remove]");
  if (!button || pending || !window.confirm(text("removePrompt"))) return;
  setPending(true);
  try {
    await removeEntry(button.dataset.remove);
    await refreshAlbum();
    notice("removed");
    title.focus();
  } catch {
    notice("writeError", "error");
  } finally {
    setPending(false);
  }
});

byId("close-book").addEventListener("click", () => book.close());
prev.addEventListener("click", () => turnPage(-1));
next.addEventListener("click", () => turnPage(1));
book.addEventListener("close", () => {
  clearBook();
  activeEntry = null;
  swipeStart = null;
});
book.addEventListener("keydown", (event) => {
  if (event.target.closest("video") || !["ArrowLeft", "ArrowRight"].includes(event.key)) return;
  event.preventDefault();
  turnPage(event.key === "ArrowLeft" ? -1 : 1);
});
stage.addEventListener("touchstart", (event) => {
  swipeStart = event.target.closest("video") || event.touches.length !== 1 ? null : event.touches[0];
}, { passive: true });
stage.addEventListener("touchend", (event) => {
  if (!swipeStart) return;
  const point = event.changedTouches[0];
  const x = point.clientX - swipeStart.clientX;
  const y = point.clientY - swipeStart.clientY;
  swipeStart = null;
  if (Math.abs(x) > 56 && Math.abs(x) > Math.abs(y) * 1.5) turnPage(x > 0 ? -1 : 1);
}, { passive: true });
