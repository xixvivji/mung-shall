import { useParams, useNavigate } from 'react-router-dom';
import svgPaths from "@/features/home/assets/svgPaths";
import imgImage38 from "@/assets/images/7d7c0c4fb5f5ec351d4a2c2c80e08bf92b1c3de5.png";
import imgImage39 from "@/assets/images/10069f785bc9dfbe2bcfa1948bee8f5324f62b98.png";
import imgStatus from "@/assets/images/44d3e9bea5b877e20a158303104219fd3a53f9c2.png";
import imgContents from "@/assets/images/3cd9c99af3198d2940494a44b342281d246c9108.png";
import imgLogo from "@/assets/images/Logo.png";
import imgImage44 from "@/assets/images/mung.png";
import imgImage45 from "@/assets/images/mung.png";

function IcoShape() {
  return (
    <div className="absolute inset-[31.25%_15.8%_35.42%_12.5%]" data-name="ico-shape">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 17.2071 8">
        <g id="ico-shape">
          <path clipRule="evenodd" d={svgPaths.p2ef7180} fill="var(--fill-0, #333333)" fillRule="evenodd" id="Vector (Stroke)" />
          <path clipRule="evenodd" d={svgPaths.p33998100} fill="var(--fill-0, #333333)" fillRule="evenodd" id="Vector 2 (Stroke)" />
        </g>
      </svg>
    </div>
  );
}

function Arrow2RightLong() {
  return (
    <div className="absolute left-[146px] size-[24px] top-[24px]" data-name="arrow-2-right-long">
      <IcoShape />
    </div>
  );
}

function Group2() {
  return (
    <div className="absolute contents left-[59px] top-[24px]">
      <p className="absolute css-ew64yg font-['Roboto:Regular','Noto_Sans_KR:Regular',sans-serif] font-normal leading-[12px] left-[59px] text-[#333] text-[12px] top-[30px] tracking-[2.4px] uppercase" style={{ fontVariationSettings: "'wdth' 100" }}>
        입양하기
      </p>
      <Arrow2RightLong />
    </div>
  );
}

function Button() {
  return (
    <div className="absolute h-[71px] left-[1042px] top-[929px] w-[222px] cursor-pointer hover:bg-[#f9f9f9] transition-colors" data-name="button">
      <div className="absolute bg-white h-[71px] left-0 top-0 w-[222px]" />
      <div className="absolute bg-white h-[71px] left-0 top-0 w-[222px]" />
      <Group2 />
    </div>
  );
}

function IcoShape1() {
  return (
    <div className="absolute inset-[31.25%_15.8%_35.42%_12.5%]" data-name="ico-shape">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 17.2071 8">
        <g id="ico-shape">
          <path clipRule="evenodd" d={svgPaths.p2ef7180} fill="var(--fill-0, #333333)" fillRule="evenodd" id="Vector (Stroke)" />
          <path clipRule="evenodd" d={svgPaths.p33998100} fill="var(--fill-0, #333333)" fillRule="evenodd" id="Vector 2 (Stroke)" />
        </g>
      </svg>
    </div>
  );
}

function Arrow2RightLong1() {
  return (
    <div className="relative size-[24px]" data-name="arrow-2-right-long">
      <IcoShape1 />
    </div>
  );
}

function Group() {
  return (
    <div className="absolute contents left-0 top-0">
      <div className="absolute bg-white border border-[#f2f2f2] border-solid left-0 size-[53px] top-0" />
      <div className="absolute flex items-center justify-center left-[15px] size-[24px] top-[15px]">
        <div className="flex-none rotate-[180deg] scale-y-[-100%]">
          <Arrow2RightLong1 />
        </div>
      </div>
    </div>
  );
}

function Frame1() {
  return (
    <div className="absolute h-[53px] left-[160px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] top-[608px] w-[52.955px] cursor-pointer hover:bg-[#f9f9f9] transition-colors">
      <Group />
    </div>
  );
}

function IcoShape2() {
  return (
    <div className="absolute inset-[31.25%_15.8%_35.42%_12.5%]" data-name="ico-shape">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 17.2071 8">
        <g id="ico-shape">
          <path clipRule="evenodd" d={svgPaths.p2ef7180} fill="var(--fill-0, #333333)" fillRule="evenodd" id="Vector (Stroke)" />
          <path clipRule="evenodd" d={svgPaths.p33998100} fill="var(--fill-0, #333333)" fillRule="evenodd" id="Vector 2 (Stroke)" />
        </g>
      </svg>
    </div>
  );
}

function Arrow2RightLong2() {
  return (
    <div className="absolute left-[15px] size-[24px] top-[15px]" data-name="arrow-2-right-long">
      <IcoShape2 />
    </div>
  );
}

function Group1() {
  return (
    <div className="absolute contents left-0 top-0">
      <div className="absolute bg-[#f9f9f9] border border-[#f2f2f2] border-solid left-0 size-[53px] top-0" />
      <Arrow2RightLong2 />
    </div>
  );
}

function Frame() {
  return (
    <div className="absolute h-[53px] left-[617px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] top-[608px] w-[52.955px] cursor-pointer hover:bg-[#f0f0f0] transition-colors">
      <Group1 />
    </div>
  );
}

function Badge() {
  return (
    <div className="absolute contents left-[198px] top-[416px]" data-name="badge_1">
      <div className="absolute bg-[rgba(109,204,85,0.9)] h-[33.333px] left-[198px] opacity-90 rounded-[5px] top-[416px] w-[60px]" data-name="badge_1" />
      <p className="absolute css-4hzbpn font-['Montserrat:Regular','Noto_Sans_KR:Regular',sans-serif] font-normal h-[20px] leading-[normal] left-[206px] opacity-90 text-[16px] text-white top-[422.67px] w-[45.333px]">보호중</p>
    </div>
  );
}

function Photo() {
  return (
    <div className="absolute contents left-[160px] top-[406px]" data-name="photo">
      <div className="absolute left-[160px] rounded-[5px] size-[114px] top-[886px]" data-name="image 38">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none rounded-[5px] size-full" src={imgImage38} />
      </div>
      <div className="absolute left-[419.06px] rounded-[5px] size-[114px] top-[886px]" data-name="image 40">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none rounded-[5px] size-full" src={imgImage38} />
      </div>
      <div className="absolute left-[290.64px] rounded-[5px] size-[114px] top-[886px]" data-name="image 39">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none rounded-[5px] size-full" src={imgImage39} />
      </div>
      <div className="absolute left-[554px] rounded-[5px] size-[114px] top-[886px]" data-name="image 41">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none rounded-[5px] size-full" src={imgImage39} />
      </div>
      <div className="absolute left-[186px] rounded-[5px] size-[457px] top-[406px]" data-name="image 37">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none rounded-[5px] size-full" src={imgImage39} />
      </div>
      <Frame1 />
      <Frame />
      <Badge />
    </div>
  );
}

function Profile() {
  return (
    <div className="absolute contents left-[140px] top-[356px]" data-name="profile">
      <div className="absolute bg-[#fbfbfb] h-[704px] left-[140px] rounded-[5px] top-[356px] w-[1170px]" />
      <Button />
      <div className="absolute h-[122px] left-[696px] top-[742px] w-[568px]" data-name="status">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgStatus} />
      </div>
      <div className="absolute h-[340px] left-[696px] top-[406px] w-[568px]" data-name="contents">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <img alt="" className="absolute h-[100.08%] left-0 max-w-none top-[-0.04%] w-[117.67%]" src={imgContents} />
        </div>
      </div>
      <Photo />
    </div>
  );
}

function Header() {
  const navigate = useNavigate();
  
  return (
    <div className="absolute h-[102px] left-0 top-0 w-[1440px]" data-name="Header">
      <div className="absolute h-[46px] left-[135px] top-[29px] w-[69.645px] cursor-pointer" data-name="logo" onClick={() => navigate('/')}>
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgLogo} />
      </div>
      <p className="absolute css-ew64yg font-['Roboto:Regular',sans-serif] font-normal inset-[45.1%_43.33%_43.14%_51.39%] leading-[12px] text-[#3182f6] text-[12px] tracking-[2.4px] uppercase cursor-pointer" style={{ fontVariationSettings: "'wdth' 100" }} onClick={() => navigate('/')}>
        Adoption
      </p>
      <p className="absolute css-ew64yg font-['Roboto:Regular',sans-serif] font-normal inset-[45.1%_56.18%_43.14%_41.18%] leading-[12px] text-[#333] text-[12px] tracking-[2.4px] uppercase cursor-pointer" style={{ fontVariationSettings: "'wdth' 100" }}>
        main
      </p>
      <p className="absolute css-ew64yg font-['Roboto:Regular',sans-serif] font-normal inset-[45.1%_10.28%_43.14%_86.67%] leading-[12px] text-[#333] text-[12px] tracking-[2.4px] uppercase cursor-pointer" style={{ fontVariationSettings: "'wdth' 100" }}>
        login
      </p>
      <p className="absolute css-ew64yg font-['Roboto:Regular',sans-serif] font-normal inset-[45.1%_33.89%_43.14%_64.24%] leading-[12px] text-[#333] text-[12px] tracking-[2.4px] uppercase cursor-pointer" style={{ fontVariationSettings: "'wdth' 100" }}>
        faq
      </p>
      <p className="absolute css-ew64yg font-['Roboto:Regular',sans-serif] font-normal inset-[45.1%_20.9%_43.14%_73.68%] leading-[12px] text-[#333] text-[12px] tracking-[2.4px] uppercase cursor-pointer" style={{ fontVariationSettings: "'wdth' 100" }}>
        contacts
      </p>
    </div>
  );
}

export default function AdoptionDetail() {
  const { id } = useParams<{ id: string }>();
  
  return (
    <div className="bg-white relative size-full min-h-screen" data-name="04_Adoption/:id">
      <div className="absolute h-[178px] left-[140px] top-[1060px] w-[565px]" data-name="image 44">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgImage44} />
      </div>
      <div className="absolute h-[357px] left-[742px] top-[1075px] w-[552px]" data-name="image 45">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgImage45} />
      </div>
      <Profile />
      <div className="absolute bg-[#f2f2f2] h-px left-[140px] top-[292px] w-[1170px]" />
      <p className="absolute css-ew64yg font-['Roboto:Bold','Noto_Sans_KR:Bold',sans-serif] font-bold leading-[64px] left-[135px] text-[#333] text-[64px] top-[165px]" style={{ fontVariationSettings: "'wdth' 100" }}>
        입양 동물 정보 #{id}
      </p>
      <Header />
    </div>
  );
}
