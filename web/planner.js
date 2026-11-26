const dateFormat = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Seoul", year: "numeric", month: "2-digit", day: "2-digit",
  hour: "2-digit", minute: "2-digit", hourCycle: "h23",
});

export const presets = {
  dawn: { start: "04:30", end: "05:35" },
  morning: { start: "08:30", end: "10:30" },
  afternoon: { start: "15:10", end: "17:00" },
};

export function seoulClock(now = new Date()) {
  const parts = Object.fromEntries(dateFormat.formatToParts(now).map(({ type, value }) => [type, value]));
  return {
    date: `${parts.year}-${parts.month}-${parts.day}`,
    time: `${parts.hour}:${parts.minute}`,
  };
}

export function minutes(time) {
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) return NaN;
  const [hour, minute] = time.split(":").map(Number);
  return hour * 60 + minute;
}

export function hhmm(minutesOfDay) {
  const wrapped = ((minutesOfDay % 1440) + 1440) % 1440;
  return [Math.floor(wrapped / 60), wrapped % 60].map((part) => String(part).padStart(2, "0")).join(":");
}

export const places = [
  {
    id: "seoullo", kind: "outdoor", tags: ["scenery", "night"], walk: 7, visit: 18, image: "/assets/seoullo.webp",
    video: "eFmXUtirgXM", broadcaster: ["Visit Seoul TV", "Visit Seoul TV"],
    title: ["서울로 7017", "Seoullo 7017"],
    description: ["옛 고가도로 위에서 내려다보는 서울역과 도심 풍경.", "A former overpass with a view of Seoul Station and the city."],
    posterAlt: ["서울로 7017에서 본 서울역 주변 거리", "Seoul Station district seen from Seoullo 7017"],
    link: "https://korean.visitseoul.net/walking-tour/서울로7017/KOP023496",
  },
  {
    id: "station", kind: "indoor", tags: ["scenery"], walk: 5, visit: 24, image: "/assets/station.webp",
    video: "V5PFgOHosTA", broadcaster: ["문화역서울284", "Culture Station Seoul 284"],
    title: ["문화역서울284", "Culture Station Seoul 284"],
    description: ["백 년 된 옛 서울역사의 건축과 전시를 만나는 곳.", "Exhibitions and a century of architecture inside the former railway station."],
    posterAlt: ["옛 서울역사의 벽돌 외관과 초록색 돔", "Brick facade and green dome of the former Seoul Station"],
    link: "https://www.seoul284.org/program/list/category/319/state/5/menu/328",
    event: "https://www.seoul284.org/program/view/category/319/state/5/menu/328?idx=379",
  },
  {
    id: "museum", kind: "indoor", tags: [], viaCityHall: true, walk: 26, visit: 35, image: "/assets/museum.webp",
    video: "xVR0Gd9LJrs", broadcaster: ["서울역사박물관", "Seoul Museum of History"],
    title: ["서울역사박물관", "Seoul Museum of History"],
    description: ["조선시대 한양에서 오늘의 서울까지 이어지는 상설전시.", "A permanent exhibition from historic Hanyang to modern Seoul."],
    posterAlt: ["서울역사박물관 정문과 건물 외관", "Main entrance of the Seoul Museum of History"],
    link: "https://museum.seoul.go.kr/www/guide/vis/infomation.jsp",
  },
  {
    id: "market", kind: "indoor", tags: ["food"], walk: 14, visit: 35, image: "/assets/market.webp",
    video: "Sra6Gp-wL_E", broadcaster: ["EBS", "EBS"],
    title: ["남대문시장 갈치조림", "Namdaemun Hairtail Alley"],
    description: ["희락갈치의 공개 운영시간을 기준으로 식사 시간을 계산합니다.", "Meal timing follows the hours published for Huirak Galchi."],
    posterAlt: ["남대문시장 골목 자료 사진", "Archive photo of an alley in Namdaemun Market"],
    link: "https://korean.visitseoul.net/area/희락/KOP013055",
  },
  {
    id: "palace", kind: "outdoor", tags: ["scenery", "night"], viaCityHall: true, crowdZone: true,
    walk: 22, visit: 30, image: "/assets/palace.webp",
    video: "M7M_U8mrmBU", broadcaster: ["국가유산청", "Korea Heritage Service"],
    title: ["덕수궁", "Deoksugung Palace"],
    description: ["대한문 안의 궁궐 풍경. 혼잡도는 광화문·덕수궁 권역 기준입니다.", "Historic palace grounds. Crowd readings cover the Gwanghwamun–Deoksugung area."],
    posterAlt: ["덕수궁의 전각과 궁궐 경내", "A hall inside Deoksugung Palace"],
    link: "https://royal.khs.go.kr/ROYAL/contents/R702000000.do",
  },
];

export function opening(id, date) {
  if (id === "seoullo") return { status: "known", open: 0, close: 1440, last: 1439 };
  if (id === "station") {
    if (date < "2026-11-26" || date > "2026-12-09") return { status: "unknown" };
    return { status: "known", open: date === "2026-11-26" ? 900 : 660, close: 1140, last: 1110 };
  }
  const day = new Date(date + "T00:00:00Z").getUTCDay();
  if (id === "market") return day === 0 ? { status: "closed" } : { status: "known", open: 420, close: 1260, last: 1225 };
  if (id === "palace") return day === 1 ? { status: "closed" } : { status: "known", open: 540, close: 1260, last: 1200 };
  if (date.endsWith("-01-01") || day === 1) return { status: "closed" };
  // After the published late-opening pilot, do not promise access after 18:00.
  const lateOpening = date >= "2026-09-15" && date <= "2026-11-30" && day !== 4;
  const close = lateOpening ? 1260 : 1080;
  return { status: "known", open: 540, close, last: close - 30 };
}

export function makePlan({ start, end, date, live = null, indoors = false, interest = "all" }) {
  const from = minutes(start);
  const until = minutes(end);
  if (!Number.isFinite(from) || !Number.isFinite(until) || until <= from) {
    return { state: "invalid", options: [], reserve: 20, window: 0 };
  }
  const window = until - from;
  const reserve = 20;
  const rail = live?.rail?.cityHall;
  const rainy = live?.weather?.wet === true;
  const options = places.map((place) => {
    const hours = opening(place.id, date);
    const trainWalk = rail ? (place.id === "palace" ? 14 : 19) + rail.wait : Infinity;
    const transit = place.viaCityHall && trainWalk < place.walk;
    const outward = transit ? trainWalk : place.walk;
    const arrive = from + outward;
    const leave = until - place.walk - reserve;
    const view = Math.min(hours.close ?? 0, leave) - arrive;
    let reason = null;
    if (from < 360) reason = "dawn";
    else if (hours.status !== "known") reason = hours.status;
    else if (arrive < hours.open) reason = "early";
    else if (arrive >= hours.last) reason = "closed";
    else if (place.kind === "outdoor" && indoors) reason = "indoor";
    else if (place.kind === "outdoor" && rainy) reason = "rain";
    else if (view < place.visit) reason = "short";
    const crowd = place.crowdZone ? live?.crowd ?? null : null;
    const match = interest === "busy" ? (crowd?.level >= 2 ? 1 : 0)
      : interest === "quiet" ? (crowd?.level === 0 ? 1 : 0) : Number(place.tags.includes(interest));
    return { place, hours, arrive, leave: Math.min(hours.close ?? leave, leave), outward,
      transit, reason, free: Math.max(0, view - place.visit), view, crowd, match };
  });
  options.sort((a, b) => Number(Boolean(a.reason)) - Number(Boolean(b.reason)) ||
    b.match - a.match || a.outward - b.outward);
  const best = options.find((item) => !item.reason);
  return { state: from < 360 ? "dawn" : best ? "visit" : "return", options, best, reserve, window };
}
