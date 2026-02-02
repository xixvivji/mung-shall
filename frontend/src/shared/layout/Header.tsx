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
            {/* 메인 */}
            <NavLink
              to={ROUTES.home}
              className={() => `${linkBase} ${linkState}`}
              style={{ fontVariationSettings: "'wdth' 100" }}
            >
              {({ isActive }) => (
                <span data-active={isActive ? "true" : "false"}>메인</span>
              )}
            </NavLink>

            {/* 입양 */}
            <NavLink
              to={ROUTES.adoption}
              className={() => `${linkBase} ${linkState}`}
              style={{ fontVariationSettings: "'wdth' 100" }}
            >
              {({ isActive }) => (
                <span data-active={isActive ? "true" : "false"}>입양하기</span>
              )}
            </NavLink>

            {/* 게시판 */}
            <NavLink
              to={ROUTES.boards}
              className={() => `${linkBase} ${linkState}`}
              style={{ fontVariationSettings: "'wdth' 100" }}
            >
              {({ isActive }) => (
                <span data-active={isActive ? "true" : "false"}>게시판</span>
              )}
            </NavLink>

            {/* FAQ */}
            <NavLink
              to={ROUTES.faq}
              className={() => `${linkBase} ${linkState}`}
              style={{ fontVariationSettings: "'wdth' 100" }}
            >
              {({ isActive }) => (
                <span data-active={isActive ? "true" : "false"}>FAQ</span>
              )}
            </NavLink>

            {/* 관리 (로그인 시에만 노출) */}
            {user && (
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

            {/* 로그인 / 유저 영역 */}
            {displayName ? (
              <div className="flex items-center gap-3">
                {/* 마이페이지 */}
                <Link
                  to={myPageRoute}
                  className="text-[14px] font-medium text-[#333] hover:text-black
                            font-['Noto_Sans_KR','Noto Sans KR',sans-serif]"
                >
                  {displayName}님
                </Link>

                {/* 로그아웃 아이콘 버튼 */}
                <button
                  type="button"
                  onClick={handleLogout}
                  aria-label="로그아웃"
                  className="
                    group flex h-8 w-8 items-center justify-center
                    rounded-full transition
                    hover:bg-gray-100
                  "
                >
                  <svg
                    viewBox="0 0 512 512"
                    className="h-4 w-4 fill-[#737373] transition group-hover:fill-black"
                  >
                    <path d="M377.9 105.9L500.7 228.7c7.2 7.2 11.3 17.1 11.3 27.3s-4.1 20.1-11.3 27.3L377.9 406.1c-6.4 6.4-15 9.9-24 9.9c-18.7 0-33.9-15.2-33.9-33.9l0-62.1-128 0c-17.7 0-32-14.3-32-32l0-64c0-17.7 14.3-32 32-32l128 0 0-62.1c0-18.7 15.2-33.9 33.9-33.9c9 0 17.6 3.6 24 9.9zM160 96L96 96c-17.7 0-32 14.3-32 32l0 256c0 17.7 14.3 32 32 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-64 0c-53 0-96-43-96-96L0 128C0 75 43 32 96 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32z" />
                  </svg>
                </button>
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
