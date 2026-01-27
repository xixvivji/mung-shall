export const ROUTES = {
  home: "/",
  adoption: "/adoption",
  adoptionDetail: (id: string | number) => `/adoption/${id}`,
  adoptionRecommend: "/adoption-recommend",
  login: "/auth/login",
  signup: "/auth/signup",
  mypage: "/mypage",
  center: "/center",
};
