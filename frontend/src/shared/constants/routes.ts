export const ROUTES = {
  home: "/",
  adoption: "/adoption",
  adoptionDetail: (id: string | number) => `/adoption/${id}`,
  adoptionRecommend: "/adoption-recommend",
  boards: "/boards",
  boardDetail: (id: string | number) => `/boards/${id}`,
  boardCreate: "/boards/new",
  boardEdit: (id: string | number) => `/boards/${id}/edit`,
  login: "/auth/login",
  signup: "/auth/signup",
  mypage: "/mypage",
  center: "/center",
  faq: "/faq"
};
