import { NavLink, Link, useNavigate } from "react-router-dom";
import logo from "@/assets/images/Logo.png";
import { ROUTES } from "@/shared/constants/routes";
import useAuth from "@/features/auth/hooks/useAuth";

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
  // 사용자의 활성 입양 ID를 가져옵니다 (user 객체에 포함되어 있다고 가정).
  const activeAdoptionId = (user as { activeAdoptionId?: number })?.activeAdoptionId;
  
  const handleLogout = async () => {
    await logout();
    navigate(ROUTES.home);
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white" data-name="Header">
      <div className="border-b border-[#e5e5e5]">
        <div className="mx-auto flex h-[75px] w-full max-w-[1440px] items-center justify-between px-6">
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
                <span data-active={isActive ? "true" : "false"}>main</span>
              )}
            </NavLink>

            <NavLink
              to={ROUTES.adoption}
              className={() => `${linkBase} ${linkState}`}
              style={{ fontVariationSettings: "'wdth' 100" }}
            >
              {({ isActive }) => (
                <span data-active={isActive ? "true" : "false"}>adoption</span>
              )}
            </NavLink>

            <NavLink
              to={ROUTES.faq}
              className={() => `${linkBase} ${linkState}`}
              style={{ fontVariationSettings: "'wdth' 100" }}
            >
              {({ isActive }) => (
                <span data-active={isActive ? "true" : "false"}>faq</span>
              )}
            </NavLink>

            {/* 입양자일 경우에만 'manage' 메뉴 노출 */}
            {/* 활성 입양 절차가 있는 입양자에게만 'manage' 링크를 보여줍니다. */}
            {isAdopter && activeAdoptionId && (
              <NavLink
                to={`/manage/${activeAdoptionId}`}
                className={() => `${linkBase} ${linkState}`}
                style={{ fontVariationSettings: "'wdth' 100" }}
              >
                {({ isActive }) => (
                  <span data-active={isActive ? "true" : "false"}>manage</span>
                )}
              </NavLink>
            )}

            <NavLink
              to={ROUTES.boards}
              className={() => `${linkBase} ${linkState}`}
              style={{ fontVariationSettings: "'wdth' 100" }}
            >
              {({ isActive }) => (
                <span data-active={isActive ? "true" : "false"}>board</span>
              )}
            </NavLink>

            {displayName ? (
              <div className="flex flex-col items-end gap-1">
                <Link
                  to={myPageRoute}
                  className="text-[14px] font-medium text-[#333] hover:text-black font-['Noto_Sans_KR','Noto Sans KR',sans-serif]"
                >
                  {displayName}님
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="text-[12px] font-medium text-[#737373] hover:text-black"
                >
                  로그아웃
                </button>
              </div>
            ) : (
              <NavLink
                to={ROUTES.login}
                className={() => `${linkBase} ${linkState}`}
                style={{ fontVariationSettings: "'wdth' 100" }}
              >
                {({ isActive }) => (
                  <span data-active={isActive ? "true" : "false"}>login</span>
                )}
              </NavLink>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
