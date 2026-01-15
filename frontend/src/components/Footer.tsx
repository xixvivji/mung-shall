import { Facebook, Instagram, Youtube, Mail, Phone, MapPin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-[hsl(var(--secondary))] text-white py-16">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* About */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-[hsl(var(--primary))] rounded-full flex items-center justify-center">
                <span className="text-xl">🐾</span>
              </div>
              <span className="text-xl font-bold">포에버홈</span>
            </div>
            <p className="text-white/70 text-sm leading-relaxed">
              유기견에게 따뜻한 가정을,<br />
              사람에게 평생의 친구를 선물합니다.
            </p>
            <div className="flex gap-3 mt-6">
              <a href="#" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-[hsl(var(--primary))] transition-colors">
                <Facebook size={18} />
              </a>
              <a href="#" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-[hsl(var(--primary))] transition-colors">
                <Instagram size={18} />
              </a>
              <a href="#" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-[hsl(var(--primary))] transition-colors">
                <Youtube size={18} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">바로가기</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#about" className="text-white/70 hover:text-[hsl(var(--primary))] transition-colors">
                  포에버홈 소개
                </a>
              </li>
              <li>
                <a href="#adoption" className="text-white/70 hover:text-[hsl(var(--primary))] transition-colors">
                  입양 안내
                </a>
              </li>
              <li>
                <a href="#donation" className="text-white/70 hover:text-[hsl(var(--primary))] transition-colors">
                  후원하기
                </a>
              </li>
              <li>
                <a href="#faq" className="text-white/70 hover:text-[hsl(var(--primary))] transition-colors">
                  자주 묻는 질문
                </a>
              </li>
              <li>
                <a href="#" className="text-white/70 hover:text-[hsl(var(--primary))] transition-colors">
                  봉사활동 신청
                </a>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold mb-4">후원 안내</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="text-white/70 hover:text-[hsl(var(--primary))] transition-colors">
                  정기후원
                </a>
              </li>
              <li>
                <a href="#" className="text-white/70 hover:text-[hsl(var(--primary))] transition-colors">
                  일시후원
                </a>
              </li>
              <li>
                <a href="#" className="text-white/70 hover:text-[hsl(var(--primary))] transition-colors">
                  물품후원
                </a>
              </li>
              <li>
                <a href="#" className="text-white/70 hover:text-[hsl(var(--primary))] transition-colors">
                  후원 사용 내역
                </a>
              </li>
              <li>
                <a href="#" className="text-white/70 hover:text-[hsl(var(--primary))] transition-colors">
                  기부금 영수증
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4">연락처</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2 text-white/70">
                <MapPin size={18} className="flex-shrink-0 mt-0.5" />
                <span>서울특별시 강남구 테헤란로 123<br />포에버홈빌딩 2층</span>
              </li>
              <li className="flex items-center gap-2 text-white/70">
                <Phone size={18} className="flex-shrink-0" />
                <span>02-1234-5678</span>
              </li>
              <li className="flex items-center gap-2 text-white/70">
                <Mail size={18} className="flex-shrink-0" />
                <span>support@foreverhome.org</span>
              </li>
            </ul>
            <p className="text-xs text-white/50 mt-4">
              평일 10:00 - 18:00<br />
              주말 및 공휴일 휴무
            </p>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-white/10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-white/50">
            <div>
              <p>© 2024 포에버홈. All rights reserved.</p>
              <p className="text-xs mt-1">비영리법인 등록번호 123-45-67890</p>
            </div>
            <div className="flex gap-6">
              <a href="#" className="hover:text-white transition-colors">개인정보처리방침</a>
              <a href="#" className="hover:text-white transition-colors">이용약관</a>
              <a href="#" className="hover:text-white transition-colors">이메일무단수집거부</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
