import { Link } from 'react-router-dom';
import svgPaths from "@/features/home/assets/svgPaths";
import imgPhoto from "@/assets/images/7d7c0c4fb5f5ec351d4a2c2c80e08bf92b1c3de5.png";
import imgLogo from "@/assets/images/Logo.png";

function Header() {
  return (
    <div className="absolute h-[102px] left-0 top-0 w-[1440px]" data-name="Header">
      <div className="absolute h-[46px] left-[135px] top-[29px] w-[69.645px]" data-name="logo">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgLogo} />
      </div>
      <p className="absolute css-ew64yg font-['Roboto:Regular',sans-serif] font-normal inset-[45.1%_43.33%_43.14%_51.39%] leading-[12px] text-[#3182f6] text-[12px] tracking-[2.4px] uppercase" style={{ fontVariationSettings: "'wdth' 100" }}>
        Adoption
      </p>
      <p className="absolute css-ew64yg font-['Roboto:Regular',sans-serif] font-normal inset-[45.1%_56.18%_43.14%_41.18%] leading-[12px] text-[#333] text-[12px] tracking-[2.4px] uppercase" style={{ fontVariationSettings: "'wdth' 100" }}>
        main
      </p>
      <p className="absolute css-ew64yg font-['Roboto:Regular',sans-serif] font-normal inset-[45.1%_10.28%_43.14%_86.67%] leading-[12px] text-[#333] text-[12px] tracking-[2.4px] uppercase" style={{ fontVariationSettings: "'wdth' 100" }}>
        login
      </p>
      <p className="absolute css-ew64yg font-['Roboto:Regular',sans-serif] font-normal inset-[45.1%_33.89%_43.14%_64.24%] leading-[12px] text-[#333] text-[12px] tracking-[2.4px] uppercase" style={{ fontVariationSettings: "'wdth' 100" }}>
        faq
      </p>
      <p className="absolute css-ew64yg font-['Roboto:Regular',sans-serif] font-normal inset-[45.1%_20.9%_43.14%_73.68%] leading-[12px] text-[#333] text-[12px] tracking-[2.4px] uppercase" style={{ fontVariationSettings: "'wdth' 100" }}>
        contacts
      </p>
    </div>
  );
}

interface CardProps {
  id: number;
  status: 'available' | 'adopted';
  top: number;
  left: number;
}

function Card({ id, status, top, left }: CardProps) {
  const bgColor = status === 'available' ? 'rgba(109,204,85,0.9)' : 'rgba(188,186,205,0.9)';
  const statusText = status === 'available' ? '보호중' : '입양완료';
  
  return (
    <Link to={`/adoption/${id}`} className="absolute contents" style={{ left, top }} data-name="card">
      <div className="absolute contents" style={{ left, top: top + 5 }} data-name="badge_1">
        <div className="absolute h-[25px] opacity-90 rounded-[5px] w-[56px]" style={{ backgroundColor: bgColor, left, top: top + 5 }} data-name="badge_1" />
        <p className="absolute css-4hzbpn font-['Montserrat:Regular','Noto_Sans_KR:Regular',sans-serif] font-normal leading-[normal] opacity-90 text-[12px] text-white w-[45.818px]" style={{ left: left + 6.11, top: top + 10 }}>{statusText}</p>
      </div>
      <p className="absolute css-ew64yg font-['Roboto:Regular','Noto_Sans_KR:Regular',sans-serif] font-normal leading-[normal] text-[#2c2c2c] text-[18px]" style={{ left: left + 3, top: top + 270 }}>
        믹스견
      </p>
      <p className="absolute css-ew64yg font-['Roboto:Regular','Noto_Sans_KR:Regular',sans-serif] font-normal leading-[normal] text-[12px] text-[rgba(44,44,44,0.7)]" style={{ left: left + 3, top: top + 301, fontVariationSettings: "'wdth' 100" }}>
        대전동물보호센터 · 1kg
      </p>
      <p className="absolute css-ew64yg font-['Roboto:Regular','Noto_Sans_KR:Regular',sans-serif] font-normal leading-[normal] text-[12px] text-[rgba(69,152,255,0.7)]" style={{ left: left + 3, top: top + 325, fontVariationSettings: "'wdth' 100" }}>#사회화  #건강검진  #입양비지원</p>
      <p className="absolute css-ew64yg font-['Roboto:Regular','Noto_Sans_KR:Regular',sans-serif] font-normal leading-[normal] text-[12px] text-[rgba(44,44,44,0.7)]" style={{ left: left + 58, top: top + 276, fontVariationSettings: "'wdth' 100" }}>
        60일 미만
      </p>
      <div className="absolute h-[260px] rounded-[5px] w-[210px]" style={{ left, top }} data-name="photo">
        <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-[5px]">
          <img alt="" className="absolute h-[162.31%] left-[-72.3%] max-w-none top-[-18.7%] w-[267.94%]" src={imgPhoto} />
        </div>
      </div>
    </Link>
  );
}

export default function AdoptionList() {
  // Mock data for 10 pets
  const pets = [
    { id: 1, status: 'available' as const, left: 135, top: 468 },
    { id: 2, status: 'available' as const, left: 375, top: 468 },
    { id: 3, status: 'available' as const, left: 615, top: 468 },
    { id: 4, status: 'available' as const, left: 855, top: 468 },
    { id: 5, status: 'available' as const, left: 1095, top: 468 },
    { id: 6, status: 'available' as const, left: 135, top: 848 },
    { id: 7, status: 'adopted' as const, left: 375, top: 848 },
    { id: 8, status: 'adopted' as const, left: 615, top: 848 },
    { id: 9, status: 'adopted' as const, left: 855, top: 848 },
    { id: 10, status: 'adopted' as const, left: 1095, top: 848 },
  ];

  return (
    <div className="bg-white relative size-full min-h-[1400px] pb-[200px]" data-name="02_Adoption">
      
      <p className="absolute css-ew64yg font-['Roboto:Bold','Noto_Sans_KR:Bold',sans-serif] font-bold leading-[64px] left-[135px] text-[#333] text-[64px] top-[165px]" style={{ fontVariationSettings: "'wdth' 100" }}>
        입양하기
      </p>
      
      <div className="absolute bg-[#f2f2f2] h-px left-[140px] top-[292px] w-[1170px]" />
      
      <div className="absolute left-[135px] top-[330px]">
        <p className="css-ew64yg font-['Montserrat:Medium',sans-serif] font-medium leading-[normal] text-[#333] text-[16px]">보호 동물</p>
      </div>
      
      <div className="absolute left-[700px] top-[330px]">
        <p className="css-ew64yg font-['Montserrat:Medium',sans-serif] font-medium leading-[normal] text-[#333] text-[16px]">추천 입양 동물</p>
      </div>

      {pets.map(pet => (
        <Card key={pet.id} id={pet.id} status={pet.status} left={pet.left} top={pet.top} />
      ))}
    </div>
  );
}
