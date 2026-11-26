const base = "/assets/";

export const templates = {
  paper: {
    name: ["한지 여행기", "Hanji travel journal"], cover: "palace.webp", inside: "museum.webp",
    sample: ["궁궐의 나무 그늘 아래에서 잠시 쉬었습니다.", "A pause under the trees at the palace."],
  },
  ticket: {
    name: ["서울행 승차권", "Ticket to Seoul"], cover: "station.webp", inside: "seoullo.webp",
    sample: ["기차 시간이 되기 전 서울로를 걸었습니다.", "A walk along Seoullo before the train."],
  },
  river: {
    name: ["한강의 저녁", "An evening by the Han River"], cover: "banpo.webp", inside: "banpo.webp",
    sample: ["해가 진 뒤, 반포대교 아래에서 한강을 바라봤습니다.", "Looking out over the Han River after sunset."],
  },
  city: {
    name: ["서울 풍경", "Seoul cityscape"], cover: "hero-small.webp", inside: "seoullo.webp",
    sample: ["서울역 앞에서 마지막 도시 풍경을 담았습니다.", "One last city view in front of Seoul Station."],
  },
  market: {
    name: ["먹자골목 수첩", "Food alley notebook"], cover: "market.webp", inside: "market.webp",
    sample: ["남대문시장 골목을 걸으며 먹을 곳을 골랐습니다.", "Choosing where to eat in Namdaemun Market."],
  },
  museum: {
    name: ["박물관 산책", "A museum afternoon"], cover: "museum.webp", inside: "palace.webp",
    sample: ["전시를 보고 궁궐 쪽으로 천천히 걸었습니다.", "After the exhibition, we walked toward the palace."],
  },
};

export function templateKey(key) {
  return Object.hasOwn(templates, key) ? key : "paper";
}

function node(tag, className, content) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (content) element.textContent = content;
  return element;
}

export function buildFolio(entry, page, language, mediaUrl, options = {}) {
  const theme = templateKey(entry.cover);
  const template = templates[theme];
  const sample = options.sample ?? !entry.files.length;
  const file = page ? entry.files[page - 1] : entry.files.find((item) => item.type.startsWith("image/"));
  const folio = node("div", "folio");
  folio.dataset.theme = theme;
  folio.dataset.side = page ? "inside" : "cover";
  const picture = node("div", "folio-media");
  const title = entry.title || template.name[language];
  const video = file?.type.startsWith("video/");
  if (video && options.thumbnail) {
    picture.append(node("span", "folio-video-label", language ? "Video" : "동영상"));
  } else if (video) {
    const player = node("video");
    player.controls = true;
    player.preload = "metadata";
    player.playsInline = true;
    player.src = mediaUrl(file);
    player.setAttribute("aria-label", language ? `${title} video` : `${title} 동영상`);
    picture.append(player);
  } else {
    const photo = node("img");
    photo.alt = options.thumbnail ? "" : title;
    photo.src = file ? mediaUrl(file) : base + (page === 1 ? template.inside : template.cover);
    picture.append(photo);
  }
  const copy = node("div", "folio-copy");
  if (entry.date && !options.thumbnail) {
    const date = node("time", "folio-date", entry.date);
    date.dateTime = entry.date;
    copy.append(date);
  }
  copy.append(node(options.thumbnail ? "span" : "h3", "folio-title", title));
  const detail = entry.pageNotes?.[page - 1] || entry.note || (sample && page ? template.sample[language] : "");
  if (page && detail && !options.thumbnail) copy.append(node("p", "folio-note", detail));
  folio.append(copy, picture);
  return folio;
}
