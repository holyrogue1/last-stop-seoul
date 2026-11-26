export const districts = {
  all: ["서울 전체", "All Seoul"],
  nowon: ["노원구", "Nowon"],
  gangnam: ["강남구", "Gangnam"],
  songpa: ["송파구", "Songpa"],
  gangseo: ["강서구", "Gangseo"],
  seocho: ["서초구", "Seocho"],
  jongno: ["종로구", "Jongno"],
  mapo: ["마포구", "Mapo"],
  seoul: ["서울 전역 둘레길", "Seoul Trail"],
};

export const discover = [
  {
    id: "hwarangdae", district: "nowon", tags: ["scenery", "night", "trail"], term: "화랑대철도공원",
    title: ["화랑대철도공원", "Hwarangdae Railway Park"],
    description: ["옛 철길과 열차를 따라 걷고, 노원불빛정원의 야간 운영일을 확인하세요.", "Walk along the old tracks and check the Nowon Light Garden’s evening schedule."],
    video: "Rt-zOU4FHPc", link: "https://culture.seoul.go.kr/night/sub/viewSpot/view.do?viewId=63",
  },
  {
    id: "buramsan", district: "nowon", tags: ["scenery", "trail"], term: "불암산 힐링타운",
    title: ["불암산 힐링타운", "Buramsan Healing Town"],
    description: ["나비정원, 전망대, 무장애 데크길을 한 번에 둘러볼 수 있습니다.", "Visit the butterfly garden, lookout and accessible boardwalk."],
    video: "eqd9fte3o5I", link: "https://www.nowon.kr/www/culture/culture3/info1_11_01/culture3_01_01.jsp",
  },
  {
    id: "buramsan-trail", district: "nowon", tags: ["scenery", "trail"], term: "불암산 둘레길", trek: true,
    title: ["서울둘레길 3코스 불암산", "Seoul Trail 3 · Buramsan"],
    description: ["6.9km · 약 2시간 30분 · 중급. 상계동 나들이 철쭉동산에서 화랑대역까지 걷습니다.", "6.9 km · about 2 h 30 min · intermediate. Walk from the Sanggye-dong Azalea Garden to Hwarangdae Station."],
    direction: "상계동 나들이 철쭉동산", video: "01w4pPvm5qw", link: "https://gil.seoul.go.kr/gil/view.do?key=2407100001&sc_gilNo=3",
  },
  {
    id: "starfield", district: "gangnam", tags: ["shop", "scenery"], term: "별마당도서관",
    title: ["코엑스 별마당도서관", "Starfield Library at COEX"],
    description: ["삼성동 실내 명소. 높은 책장과 코엑스몰 쇼핑을 함께 볼 수 있습니다.", "See the towering bookshelves and explore the nearby COEX Mall shops."],
    video: "EYD1Y_GFAnc", link: "https://visitgangnam.net/places/starfield-library",
  },
  {
    id: "royal-tombs", district: "gangnam", tags: ["scenery", "trail"], term: "선정릉",
    title: ["선정릉", "Seonjeongneung Royal Tombs"],
    description: ["삼성동 빌딩 사이에서 조선 왕릉과 숲길을 만나는 도보 코스입니다.", "Walk through woodland and Joseon royal tombs among the towers of Gangnam."],
    video: "CuSjjlRa7N8", link: "https://korean.visitseoul.net/gangnam/도보관광-선정릉/KON000626",
  },
  {
    id: "tancheon-trail", district: "gangnam", tags: ["scenery", "trail"], term: "장지 탄천 둘레길", trek: true,
    title: ["서울둘레길 8코스 장지·탄천", "Seoul Trail 8 · Jangji–Tancheon"],
    description: ["8.6km · 약 2시간 35분 · 초급. 송파구 오금1교에서 강남구 수서역으로 이어집니다.", "8.6 km · about 2 h 35 min · beginner. Follow the stream from Ogeum 1 Bridge to Suseo Station."],
    direction: "오금1교", video: "spwZcF231i8", link: "https://gil.seoul.go.kr/gil/view.do?key=2407100001&sc_gilNo=8",
  },
  {
    id: "seokchon", district: "songpa", tags: ["scenery", "night", "trail"], term: "석촌호수",
    title: ["석촌호수", "Seokchon Lake"],
    description: ["호수 산책과 잠실의 야경을 즐긴 뒤, 송리단길까지 이어서 둘러보세요.", "Walk around the lake for views of Jamsil’s skyline, then explore Songridan-gil."],
    video: "oYq6b4QJa0U", link: "https://korean.visitseoul.net/attractions/석촌호수공원/KOP001136",
  },
  {
    id: "botanic", district: "gangseo", tags: ["scenery", "trail"], term: "서울식물원",
    title: ["서울식물원", "Seoul Botanic Park"],
    description: ["마곡의 온실과 호수원. 온실 이용시간은 방문 전에 확인하세요.", "Visit Magok’s greenhouse and lake paths. Check greenhouse hours before leaving."],
    video: "d3tLEGeTdAY", link: "https://botanicpark.seoul.go.kr/",
  },
  {
    id: "banpo", district: "seocho", tags: ["scenery", "night", "trail"], term: "반포한강공원",
    title: ["반포한강공원", "Banpo Hangang Park"],
    description: ["세빛섬과 잠수교 주변에서 한강 야경을 볼 수 있습니다. 분수는 계절별 운영 일정을 확인하세요.", "See the river at night around Sebitseom and Jamsu Bridge. Check the seasonal fountain schedule."],
    video: "vueZxpFxZO4", link: "https://hangang.seoul.go.kr/www/contents/663.do?mid=425",
  },
  {
    id: "bukak", district: "jongno", tags: ["scenery", "night"], term: "북악스카이웨이",
    title: ["북악스카이웨이", "Bugak Skyway"],
    description: ["북악팔각정에서 서울 도심을 내려다보는 전망 코스. 출발 전에 이동편을 확인하세요.", "See the city from Bugak Pavilion. Check your transport before departure."],
    video: "UY_s8yMxzag", link: "https://access.visitkorea.or.kr/ms/detail.do?cotId=2bc73180-b465-496f-8370-6e038b41129a",
  },
  {
    id: "hongdae", district: "mapo", tags: ["night", "shop", "food", "bars"], term: "홍대 걷고싶은거리",
    title: ["홍대 걷고싶은거리", "Hongdae Walking Street"],
    description: ["상점, 식당과 술집을 둘러보는 저녁 코스. 매장별 이용시간은 현장에서 확인하세요.", "Explore shops, restaurants and bars in the evening. Check individual opening hours."],
    video: "MMzStzhq7Pg", link: "https://english.seoul.go.kr/wp-content/uploads/2023/03/Seoul_Tourist_Guide_EN.pdf",
  },
  {
    id: "seoul-trail", district: "seoul", tags: ["scenery", "trail"], term: "서울둘레길",
    title: ["서울둘레길", "Seoul Trail"],
    description: ["구간별 거리와 난이도를 비교해서 시간에 맞는 코스를 고르세요.", "Compare trail distances and difficulty to find the right segment."],
    video: "a7IPsfFX3gk", link: "https://gil.seoul.go.kr/index.do",
  },
].map((place) => ({
  ...place,
  image: `https://i.ytimg.com/vi/${place.video}/hqdefault.jpg`,
  posterAlt: ["", ""],
  broadcaster: ["YouTube 원본 영상", "YouTube original"],
}));

export const trendGroups = {
  all: ["화랑대철도공원", "별마당도서관", "석촌호수", "반포한강공원", "서울식물원"],
  nowon: ["화랑대철도공원", "불암산 힐링타운", "불암산 둘레길"],
  gangnam: ["별마당도서관", "선정릉", "장지 탄천 둘레길"],
};
