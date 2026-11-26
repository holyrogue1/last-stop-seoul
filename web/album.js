import { places, seoulClock } from "./planner.js";
import { discover } from "./discover.js";
import { readAlbum, removeEntry, saveEntry } from "./album-store.js";
import { buildFolio, templateKey, templates } from "./album-templates.js";

const copy = {
  skip: ["포토북 편집으로 건너뛰기", "Skip to editor"], brand: ["여행의 종점은 서울", "Last Stop Seoul"],
  home: ["홈으로", "Home"], heading: ["나의 서울 포토북", "My Seoul Photobook"],
  privacy: ["사진과 동영상은 이 기기의 브라우저에 저장됩니다.", "Photos and videos are stored in this browser."],
  coverSelect: ["템플릿", "Templates"], newMemory: ["포토북 편집", "Photobook editor"],
  preview: ["책으로 미리보기", "Preview book"], apply: ["이 템플릿으로 만들기", "Use this template"],
  pages: ["페이지", "Pages"], cover: ["표지", "Cover"], samplePages: ["샘플 페이지", "Sample pages"],
  ownPages: ["내 사진과 동영상", "Your photos and videos"],
  entryTitle: ["제목", "Title"], entryDate: ["방문 날짜", "Visit date"],
  entryNote: ["기억하고 싶은 순간 (선택)", "A moment to remember (optional)"],
  pageNote: ["선택한 페이지 설명 (선택)", "Caption for the selected page (optional)"],
  addMedia: ["사진·동영상 추가", "Add photos and videos"], removePage: ["선택 페이지 삭제", "Remove selected page"],
  fileDetails: ["사진당 20 MB, 영상당 150 MB, 포토북당 160 MB까지 담을 수 있습니다.",
    "Limits: 20 MB per photo, 150 MB per video and 160 MB per book."],
  save: ["포토북 저장", "Save photobook"], saving: ["저장 중", "Saving"],
  entries: ["내 포토북", "My photobooks"], empty: ["사진이나 영상을 추가해 첫 포토북을 만들어보세요.", "Add a photo or video to make your first book."],
  saved: ["포토북을 저장했습니다.", "Your photobook is saved."],
  added: ["페이지에 파일을 추가했습니다.", "Files added to the book."],
  edit: ["편집", "Edit"], cancelEdit: ["편집 종료", "Close editor"],
  remove: ["삭제", "Delete"],
  removePrompt: ["이 포토북의 사진과 동영상을 함께 삭제할까요?", "Delete this book and its photos and videos?"],
  removed: ["포토북을 삭제했습니다.", "Photobook deleted."],
  missing: ["제목과 사진 또는 동영상을 입력해 주세요.", "Enter a title and add photos or videos."],
  typeError: ["사진은 JPG·PNG·WebP·GIF·AVIF, 동영상은 MP4·WebM을 선택해 주세요.",
    "Choose JPG, PNG, WebP, GIF or AVIF photos, or MP4 or WebM videos."],
  emptyFile: ["내용이 없는 파일을 다시 선택해 주세요.", "Please replace the empty file."],
  sizeError: ["파일 용량을 확인해 주세요. 사진 20 MB, 영상 150 MB, 포토북 전체 160 MB까지 저장할 수 있습니다.",
    "Check the file sizes. Limits are 20 MB per photo, 150 MB per video and 160 MB per book."],
  storageError: ["브라우저에서 앨범을 열 수 없습니다. 저장소 설정을 확인해 주세요.", "Could not open the album. Check your browser storage settings."],
  writeError: ["변경을 저장하지 못했습니다. 잠시 후 다시 시도해 주세요.", "Could not save the change. Please try again."],
  quota: ["저장 공간이 부족합니다. 파일 크기를 줄여 다시 시도해 주세요.", "Storage is full. Try smaller files."],
  open: ["포토북 열기", "Open photobook"], close: ["포토북 닫기", "Close photobook"],
  previous: ["이전 페이지", "Previous page"], next: ["다음 페이지", "Next page"],
  credit: ["템플릿 사진 출처", "Template photo credits"],
};

const byId = (id) => document.getElementById(id);
const form = byId("album-form");
const files = byId("entry-files");
const title = byId("entry-title");
const visitDate = byId("entry-date");
const note = byId("entry-note");
const pageNote = byId("page-note");
const book = byId("book-dialog");
const stage = byId("book-stage");
const prev = byId("book-prev");
const next = byId("book-next");
const save = byId("save-entry");
const books = byId("album-list");
const pageList = byId("draft-pages");
const draftStage = byId("draft-stage");
const megabyte = 1_000_000;
const photoTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"]);
const videoTypes = new Set(["video/mp4", "video/webm"]);
const draft = { cover: "paper", files: [], pageNotes: [], page: 0, original: null };
let language = 0;
let entries = [];
let bookView = null;
let stageUrls = [];
let pageUrls = [];
let bookUrls = [];
let libraryUrls = [];
let swipeStart = null;
let pending = false;
let storageReady = false;

const text = (key) => copy[key][language];
const draftEntry = () => ({
  cover: draft.cover, files: draft.files, title: title.value.trim(), date: visitDate.value,
  note: note.value.trim(), pageNotes: draft.pageNotes,
});
const pagesIn = (entry) => entry.files.length || 2;
const pageLabel = (index) => index ? (language ? `Page ${index}` : `${index}페이지`) : text("cover");

function message(id, key, tone = "info") {
  byId(id).textContent = key ? text(key) : "";
  byId(id).dataset.tone = tone;
}

function folio(entry, page, urls, options) {
  return buildFolio(entry, page, language, (file) => {
    const url = URL.createObjectURL(file);
    urls.push(url);
    return url;
  }, options);
}

function clear(container, urls) {
  container.replaceChildren();
  for (const url of urls) URL.revokeObjectURL(url);
  return [];
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

function renderTemplates() {
  const options = Object.entries(templates).map(([key, template]) => {
    const button = document.createElement("button");
    button.type = "button";
    button.dataset.template = key;
    button.setAttribute("aria-pressed", String(draft.cover === key));
    button.setAttribute("aria-label", template.name[language]);
    const cover = folio({ cover: key, files: [] }, 0, [], { thumbnail: true });
    const label = document.createElement("span");
    label.className = "template-choice-label";
    label.textContent = template.name[language];
    button.append(cover, label);
    return button;
  });
  byId("template-options").replaceChildren(...options);
}

function renderDraftStage() {
  stageUrls = clear(draftStage, stageUrls);
  draftStage.append(folio(draftEntry(), draft.page, stageUrls));
}

function renderDraftPages() {
  const entry = draftEntry();
  pageUrls = clear(pageList, pageUrls);
  for (let index = 0; index <= pagesIn(entry); index++) {
    const button = document.createElement("button");
    button.type = "button";
    button.dataset.page = String(index);
    button.setAttribute("aria-label", pageLabel(index));
    button.setAttribute("aria-current", draft.page === index ? "page" : "false");
    const label = document.createElement("span");
    label.textContent = pageLabel(index);
    button.append(folio(entry, index, pageUrls, { thumbnail: true }), label);
    pageList.append(button);
  }
  byId("draft-mode").textContent = text(entry.files.length ? "ownPages" : "samplePages");
  renderPageActions();
}

function renderPageActions() {
  const hasMediaPage = draft.files.length > 0 && draft.page > 0;
  byId("remove-page").hidden = !hasMediaPage;
  byId("page-note-field").hidden = !hasMediaPage;
  pageNote.value = hasMediaPage ? draft.pageNotes[draft.page - 1] ?? "" : "";
}

function refreshDraft() {
  byId("editor-template").textContent = templates[draft.cover].name[language];
  byId("cancel-edit").hidden = !draft.original;
  for (const button of byId("template-options").children) button.setAttribute("aria-pressed", String(button.dataset.template === draft.cover));
  renderDraftStage();
  renderDraftPages();
}

function paintBook(direction = 0) {
  bookUrls = clear(stage, bookUrls);
  stage.append(folio(bookView.entry, bookView.page, bookUrls));
  const last = pagesIn(bookView.entry);
  prev.disabled = bookView.page === 0;
  next.disabled = bookView.page === last;
  byId("book-progress").textContent = `${bookView.page + 1} / ${last + 1}`;
  if (direction && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
    stage.firstElementChild.animate([
      { transform: `translateX(${direction * 12}px)`, opacity: 0.75 },
      { transform: "translateX(0)", opacity: 1 },
    ], { duration: 160, easing: "ease-out" });
  }
}

function showBook(entry, page, editable) {
  bookView = { entry, page, editable };
  byId("book-title").textContent = entry.title || templates[templateKey(entry.cover)].name[language];
  byId("apply-template").hidden = !editable;
  paintBook();
  book.showModal();
}

function turnPage(direction) {
  if (!bookView) return;
  const page = bookView.page + direction;
  if (page < 0 || page > pagesIn(bookView.entry)) return;
  bookView.page = page;
  paintBook(direction);
}

function renderAlbum() {
  libraryUrls = clear(books, libraryUrls);
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
    for (const action of ["open", "edit", "remove"]) {
      const button = card.querySelector(`[data-${action}]`);
      button.dataset[action] = entry.id;
      button.setAttribute("aria-label", `${entry.title} ${text(action)}`);
      if (action === "open") button.append(folio(entry, 0, libraryUrls, { thumbnail: true }));
      else button.textContent = text(action);
    }
    books.append(card);
  }
}

function setPending(value) {
  pending = value;
  save.disabled = value || !storageReady;
  save.textContent = text(value ? "saving" : "save");
}

async function readSavedBooks() {
  entries = await readAlbum();
  entries.sort((a, b) => b.date.localeCompare(a.date) || b.createdAt - a.createdAt);
  storageReady = true;
  renderAlbum();
}

function translate() {
  document.documentElement.lang = language ? "en" : "ko";
  document.title = `${text("heading")} | ${text("brand")}`;
  document.querySelectorAll("[data-copy]").forEach((element) => { element.textContent = text(element.dataset.copy); });
  byId("language").textContent = language ? "한국어" : "EN";
  byId("language").setAttribute("aria-label", language ? "한국어로 전환" : "Switch to English");
  byId("close-book").setAttribute("aria-label", text("close"));
  setPending(pending);
  renderTemplates();
  refreshDraft();
  renderAlbum();
}

function loadDraft(entry) {
  draft.original = entry ?? null;
  draft.cover = templateKey(entry?.cover ?? draft.cover);
  draft.files = entry ? [...entry.files] : [];
  draft.pageNotes = Array.isArray(entry?.pageNotes) ? [...entry.pageNotes] : [];
  draft.page = 0;
  title.value = entry?.title ?? "";
  visitDate.value = entry?.date ?? seoulClock().date;
  note.value = entry?.note ?? "";
  message("upload-status", "");
  refreshDraft();
}

const placeId = new URLSearchParams(location.search).get("place");
const place = [...places, ...discover].find(({ id }) => id === placeId);
visitDate.value = seoulClock().date;
try {
  language = Number(localStorage.getItem("one-more-language") === "en");
  const recorded = place && JSON.parse(localStorage.getItem("last-stop-visited") ?? "{}")[place.id];
  if (recorded && /^\d{4}-\d{2}-\d{2}$/.test(recorded)) visitDate.value = recorded;
} catch { /* Local preferences are optional. */ }
if (place) title.value = place.title[language];
translate();
readSavedBooks().catch(() => message("album-status", "storageError", "error")).finally(() => setPending(false));

byId("language").addEventListener("click", () => {
  language = 1 - language;
  try { localStorage.setItem("one-more-language", language ? "en" : "ko"); } catch { /* Optional. */ }
  translate();
});

byId("template-options").addEventListener("click", (event) => {
  const choice = event.target.closest("[data-template]");
  if (!choice) return;
  draft.cover = templateKey(choice.dataset.template);
  draft.page = 0;
  refreshDraft();
});
for (const input of [title, visitDate, note]) input.addEventListener("input", renderDraftStage);
pageNote.addEventListener("input", () => {
  if (!draft.files.length || draft.page === 0) return;
  draft.pageNotes[draft.page - 1] = pageNote.value.trim();
  renderDraftStage();
});
pageList.addEventListener("click", (event) => {
  const button = event.target.closest("[data-page]");
  if (!button) return;
  draft.page = Number(button.dataset.page);
  for (const page of pageList.children) page.setAttribute("aria-current", page === button ? "page" : "false");
  renderPageActions();
  renderDraftStage();
});
files.addEventListener("change", () => {
  const added = [...files.files];
  files.value = "";
  if (!added.length) return;
  const combined = [...draft.files, ...added];
  const issue = fileIssue(combined);
  if (issue) {
    message("upload-status", issue, "error");
    return;
  }
  draft.page = draft.files.length + 1;
  draft.pageNotes = draft.files.map((_, index) => draft.pageNotes[index] ?? "");
  draft.files = combined;
  message("upload-status", "added");
  refreshDraft();
});
byId("remove-page").addEventListener("click", () => {
  if (!draft.files.length || draft.page === 0) return;
  draft.files.splice(draft.page - 1, 1);
  draft.pageNotes.splice(draft.page - 1, 1);
  draft.page = Math.min(draft.page, draft.files.length);
  message("upload-status", "");
  refreshDraft();
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (pending || !storageReady) return;
  const entry = draftEntry();
  const issue = !entry.title || !entry.files.length ? "missing" : fileIssue(entry.files);
  if (issue) {
    message("album-status", issue, "error");
    return;
  }
  setPending(true);
  try {
    await saveEntry({ ...entry, id: draft.original?.id ?? crypto.randomUUID(), createdAt: draft.original?.createdAt ?? Date.now() });
    loadDraft(null);
    await readSavedBooks();
    message("album-status", "saved");
  } catch (error) {
    message("album-status", error?.name === "QuotaExceededError" ? "quota" : "writeError", "error");
  } finally {
    setPending(false);
  }
});
byId("cancel-edit").addEventListener("click", () => loadDraft(null));
books.addEventListener("click", async (event) => {
  const trigger = event.target.closest("button");
  if (!trigger || pending) return;
  const entry = entries.find(({ id }) => id === (trigger.dataset.open ?? trigger.dataset.edit ?? trigger.dataset.remove));
  if (!entry) return;
  if (trigger.hasAttribute("data-open")) {
    showBook(entry, 0, false);
  } else if (trigger.hasAttribute("data-edit")) {
    loadDraft(entry);
    title.focus();
  } else if (window.confirm(text("removePrompt"))) {
    setPending(true);
    try {
      await removeEntry(entry.id);
      if (draft.original?.id === entry.id) loadDraft(null);
      await readSavedBooks();
      message("album-status", "removed");
      title.focus();
    } catch {
      message("album-status", "writeError", "error");
    } finally {
      setPending(false);
    }
  }
});

byId("preview-book").addEventListener("click", () => showBook(draftEntry(), draft.page, true));
byId("apply-template").addEventListener("click", () => {
  book.close();
  title.focus();
});
byId("close-book").addEventListener("click", () => book.close());
prev.addEventListener("click", () => turnPage(-1));
next.addEventListener("click", () => turnPage(1));
book.addEventListener("close", () => {
  bookUrls = clear(stage, bookUrls);
  bookView = null;
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
