import { BrowserRouter, Route, Routes } from "react-router-dom";
import AppLayout from "@/app/AppLayout";
import HomePage from "@/pages/home";
import AdoptionPage from "@/pages/adoption";
import AdoptionDetailPage from "@/pages/adoption-detail";
import AdoptionRecommendPage from "@/pages/adoption-recommend";
import LoginPage from "@/pages/auth/login";
import SignupPage from "@/pages/auth/signup";
import MyPage from "@/pages/mypage";
import NotFoundPage from "@/pages/not-found";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<HomePage />} />
          <Route path="/adoption" element={<AdoptionPage />} />
          <Route path="/adoption/:id" element={<AdoptionDetailPage />} />
          <Route path="/adoption-recommend" element={<AdoptionRecommendPage />} />
          <Route path="/auth/login" element={<LoginPage />} />
          <Route path="/auth/signup" element={<SignupPage />} />
          <Route path="/mypage" element={<MyPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
