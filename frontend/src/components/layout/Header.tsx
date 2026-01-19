import { NavLink, Link } from "react-router-dom";
import { Container } from "./Container";

export function Header() {
  const base = "text-sm text-slate-600 hover:text-ink transition-colors";
  const active = "text-sm text-ink font-semibold";

  const navClass = ({ isActive }: { isActive: boolean }) =>
    isActive ? active : base;

  return (
    <header className="fixed inset-x-0 top-0 z-50 bg-white">
      <Container className="flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-2xl bg-ink" />
          <span className="text-sm font-semibold tracking-tight">MUNG SHALL</span>
        </Link>

        <nav className="hidden items-center gap-10 md:flex">
          <NavLink to="/introduction" className={navClass}>소개</NavLink>
          <NavLink to="/adoption" className={navClass}>입양</NavLink>
          <NavLink to="/donation" className={navClass}>후원</NavLink>
          <NavLink to="/faq" className={navClass}>FAQ</NavLink>
          <NavLink to="/board" className={navClass}>게시판</NavLink>

          {/* 로그인 페이지가 아직 없으면 임시로 /faq 또는 / 로 두세요 */}
          <NavLink to="/login" className={navClass}>로그인</NavLink>
        </nav>
      </Container>
    </header>
  );
}
