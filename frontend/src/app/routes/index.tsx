import { BrowserRouter, Route, Routes } from "react-router-dom";
import AppLayout from "@/app/AppLayout";
import HomePage from "@/pages/home";
import AdoptionPage from "@/pages/adoption";
import AdoptionDetailPage from "@/pages/adoption-detail";
import AdoptionRecommendPage from "@/pages/adoption-recommend";
import LoginPage from "@/pages/auth/login";
import SignupPage from "@/pages/auth/signup";
import MyPage from "@/pages/mypage";
import ManagePage from "@/pages/manage";
import CenterPage from "@/pages/center";
import NotFoundPage from "@/pages/not-found";
import OAuthCallbackPage from "@/pages/oauth-callback";
import BoardListPage from "@/features/board/pages/BoardListPage";
import BoardDetailPage from "@/features/board/pages/BoardDetailPage";
import BoardCreatePage from "@/features/board/pages/BoardCreatePage";
import BoardEditPage from "@/features/board/pages/BoardEditPage";
import FAQPage from "@/pages/faq";
import UiTestPage from "@/pages/uitest";
import MotionPage from "@/pages/motion";
import MatchingSurveyPage from "@/pages/matching-survey";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<HomePage />} />
          <Route path="/adoption" element={<AdoptionPage />} />
          <Route path="/adoption/:id" element={<AdoptionDetailPage />} />
          <Route path="/adoption-recommend" element={<AdoptionRecommendPage />} />
          <Route path="/adoptions/:adoptionId" element={<ManagePage />} />
          <Route path="/boards" element={<BoardListPage />} />
          <Route path="/boards/new" element={<BoardCreatePage />} />
          <Route path="/boards/:id" element={<BoardDetailPage />} />
          <Route path="/boards/:id/edit" element={<BoardEditPage />} />
          <Route path="/auth/login" element={<LoginPage />} />
          <Route path="/auth/signup" element={<SignupPage />} />
          <Route path="/oauth/callback" element={<OAuthCallbackPage />} />
          <Route path="/mypage" element={<MyPage />} />
          <Route path="/manage" element={<ManagePage />} />
          <Route path="/center" element={<CenterPage />} />
          <Route path="/faq" element={<FAQPage />} />
          <Route path="/uitest" element={<UiTestPage />} />
          <Route path="/motion" element={<MotionPage />} />
          <Route path="/matching-survey" element={<MatchingSurveyPage />} />
          <Route path="*" element={<NotFoundPage />} />
          
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
