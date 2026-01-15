import { useState } from "react";
import { NavLink } from "react-router-dom";
import { Menu, X } from "lucide-react";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { name: "소개", to: "/about" },
    { name: "입양", to: "/adoption" },
    { name: "후원", to: "/donation" },
    { name: "문의", to: "/faq" },
    // 소식 페이지가 아직 없으면 일단 주석 처리하거나 "/"로 연결하세요.
    // { name: "소식", to: "/news" },
  ];

  const baseLinkClass =
    "text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--primary))] transition-colors";

  const activeLinkClass = "text-[hsl(var(--primary))] font-semibold";

  return (
    <header className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm z-50 border-b border-[hsl(var(--border))]">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex items-center">
            <NavLink to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-[hsl(var(--primary))] rounded-full flex items-center justify-center">
                <span className="text-white text-xl">🐾</span>
              </div>
              <span className="text-xl font-bold text-[hsl(var(--secondary))]">
                포에버홈
              </span>
            </NavLink>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.to}
                className={({ isActive }) =>
                  `${baseLinkClass} ${isActive ? activeLinkClass : ""}`
                }
              >
                {item.name}
              </NavLink>
            ))}
            <NavLink
              to="/login"
              className={({ isActive }) =>
                `${baseLinkClass} ${isActive ? activeLinkClass : ""}`
              }
            >
              로그인
            </NavLink>
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen((v) => !v)}
            aria-label="Open menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="md:hidden py-4 border-t border-[hsl(var(--border))]">
            {navItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.to}
                className={({ isActive }) =>
                  `block py-3 ${baseLinkClass} ${isActive ? activeLinkClass : ""}`
                }
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.name}
              </NavLink>
            ))}
            <NavLink
              to="/login"
              className={({ isActive }) =>
                `block py-3 ${baseLinkClass} ${isActive ? activeLinkClass : ""}`
              }
              onClick={() => setMobileMenuOpen(false)}
            >
              로그인
            </NavLink>
          </nav>
        )}
      </div>
    </header>
  );
}
