import { NavLink, Link } from "react-router-dom";
import logo from "@/assets/images/Logo.png";
import { ROUTES } from "@/shared/constants/routes";

const linkBase =
  "text-[12px] tracking-[2.4px] uppercase leading-[12px] font-['Roboto:Regular',sans-serif] font-normal";
const linkState =
  "text-[#333] hover:text-black data-[active=true]:text-[#3182f6]";

export default function Header() {
  return (
    <header
      className="sticky top-0 z-50 w-full bg-white"
      data-name="Header"
    >
      {/* bottom border (optional) */}
      <div className="border-b border-[#e5e5e5]">
        {/* responsive container */}
        <div className="mx-auto flex h-[102px] w-full max-w-[1440px] items-center justify-between px-6">
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
              className={({ isActive }) =>
                `${linkBase} ${linkState}`
              }
              style={{ fontVariationSettings: "'wdth' 100" }}
              data-active={undefined}
            >
              {({ isActive }) => (
                <span data-active={isActive ? "true" : "false"}>main</span>
              )}
            </NavLink>

            <NavLink
              to={ROUTES.adoption}
              className={({ isActive }) => `${linkBase} ${linkState}`}
              style={{ fontVariationSettings: "'wdth' 100" }}
            >
              {({ isActive }) => (
                <span data-active={isActive ? "true" : "false"}>Adoption</span>
              )}
            </NavLink>

            {/* TODO: 라우트가 있으면 ROUTES.faq / ROUTES.contacts 로 바꿔줘 */}
            <NavLink
              to={ROUTES.home}
              className={({ isActive }) => `${linkBase} ${linkState}`}
              style={{ fontVariationSettings: "'wdth' 100" }}
            >
              {({ isActive }) => (
                <span data-active={isActive ? "true" : "false"}>faq</span>
              )}
            </NavLink>

            <NavLink
              to={ROUTES.home}
              className={({ isActive }) => `${linkBase} ${linkState}`}
              style={{ fontVariationSettings: "'wdth' 100" }}
            >
              {({ isActive }) => (
                <span data-active={isActive ? "true" : "false"}>contacts</span>
              )}
            </NavLink>

            <NavLink
              to={ROUTES.login}
              className={({ isActive }) => `${linkBase} ${linkState}`}
              style={{ fontVariationSettings: "'wdth' 100" }}
            >
              {({ isActive }) => (
                <span data-active={isActive ? "true" : "false"}>login</span>
              )}
            </NavLink>
          </nav>
        </div>
      </div>
    </header>
  );
}
