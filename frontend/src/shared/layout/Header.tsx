import { NavLink, Link, useNavigate } from "react-router-dom";
import logo from "@/assets/images/Logo.png";
import { ROUTES } from "@/shared/constants/routes";
import useAuth from "@/features/auth/hooks/useAuth";
import Logout from "@/shared/ui/uiverse/Logout";

const linkBase =
  "text-[12px] tracking-[2.4px] uppercase leading-[12px] font-['Roboto:Regular',sans-serif] font-normal";
const linkState =
  "text-[#333] hover:text-black data-[active=true]:text-[#3182f6]";

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const displayName = user?.name?.trim() || user?.username?.trim();
  const userType = user?.userType?.toLowerCase();
  const myPageRoute =
    userType === "shelter" || userType === "center"
      ? ROUTES.center
      : ROUTES.mypage;
  const isAdopter = user && userType !== "shelter" && userType !== "center";

  const handleLogout = async () => {
    await logout();
    navigate(ROUTES.home);
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white" data-name="Header">
      <div>
        <div className="mx-auto flex h-[60px] w-full max-w-[1440px] items-center justify-between px-6">
          {/* Logo */}
          <Link to={ROUTES.home} className="flex items-center">
            <img
              alt="Mungshall logo"
              className="h-[46px] w-auto object-contain"
              src={logo}
            />
          </Link>

          {/* Nav */}
          <nav aria-label="Primary" className="flex items-center gap-10">
            <NavLink
              to={ROUTES.home}
              className={() => `${linkBase} ${linkState}`}
              style={{ fontVariationSettings: "'wdth' 100" }}
            >
              {({ isActive }) => (
                <span data-active={isActive ? "true" : "false"}>메인</span>
              )}
            </NavLink>

            <NavLink
              to={ROUTES.adoption}
              className={() => `${linkBase} ${linkState}`}
              style={{ fontVariationSettings: "'wdth' 100" }}
            >
              {({ isActive }) => (
                <span data-active={isActive ? "true" : "false"}>입양하기</span>
              )}
            </NavLink>

            {isAdopter && (
              <NavLink
                to={ROUTES.manage}
                className={() => `${linkBase} ${linkState}`}
                style={{ fontVariationSettings: "'wdth' 100" }}
              >
                {({ isActive }) => (
                  <span data-active={isActive ? "true" : "false"}>입양관리</span>
                )}
              </NavLink>
            )}

            <NavLink
              to={ROUTES.faq}
              className={() => `${linkBase} ${linkState}`}
              style={{ fontVariationSettings: "'wdth' 100" }}
            >
              {({ isActive }) => (
                <span data-active={isActive ? "true" : "false"}>FAQ</span>
              )}
            </NavLink>

            <NavLink
              to={ROUTES.boards}
              className={() => `${linkBase} ${linkState}`}
              style={{ fontVariationSettings: "'wdth' 100" }}
            >
              {({ isActive }) => (
                <span data-active={isActive ? "true" : "false"}>게시판</span>
              )}
            </NavLink>

            {displayName ? (
              <div className="flex items-center gap-3">
                <Link
                  to={myPageRoute}
                  className="text-[14px] font-medium text-[#333] hover:text-black font-['Noto_Sans_KR','Noto Sans KR',sans-serif]"
                >
                  {displayName}님
                </Link>
                <Logout onLogout={handleLogout} />
              </div>
            ) : (
              <NavLink
                to={ROUTES.login}
                className={() => `${linkBase} ${linkState}`}
                style={{ fontVariationSettings: "'wdth' 100" }}
              >
                {({ isActive }) => (
                  <span data-active={isActive ? "true" : "false"}>로그인</span>
                )}
              </NavLink>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
