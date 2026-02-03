import type { CSSProperties } from "react";
import svgPaths from "../assets/svgPaths";
import img2026010610018321 from "@/assets/images/7d7c0c4fb5f5ec351d4a2c2c80e08bf92b1c3de5.png";
import imgRectangle8 from "@/assets/images/44d3e9bea5b877e20a158303104219fd3a53f9c2.png";
import imgRectangle9 from "@/assets/images/10069f785bc9dfbe2bcfa1948bee8f5324f62b98.png";
import imgRectangle10 from "@/assets/images/3cd9c99af3198d2940494a44b342281d246c9108.png";
import imgMungshall1 from "@/assets/images/mung.png";

import { useEffect, useState } from "react";
import { getTodayStatusCounts } from "../api/todayApi";

type TodayStats = {
  보호중: number;
  입양: number;
  안락사: number;
};

const INITIAL_TODAY_STATS: TodayStats = {
  보호중: 0,
  입양: 0,
  안락사: 0,
};

function IcoShape() {
  return (
    <div className="absolute inset-[31.25%_15.8%_35.42%_12.5%]" data-name="ico-shape">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 17.2071 8">
        <g id="ico-shape">
          <path clipRule="evenodd" d={svgPaths.p2ef7180} fill="var(--fill-0, white)" fillRule="evenodd" id="Vector (Stroke)" />
          <path clipRule="evenodd" d={svgPaths.p33998100} fill="var(--fill-0, white)" fillRule="evenodd" id="Vector 2 (Stroke)" />
        </g>
      </svg>
    </div>
  );
}

function Arrow2RightLong() {
  return (
    <div className="absolute left-[158px] size-[24px] top-[24px]" data-name="arrow-2-right-long">
      <IcoShape />
    </div>
  );
}

function Group6() {
  return (
    <div className="absolute contents left-[54px] top-[24px]">
      <p
        className="absolute css-ew64yg font-['Roboto:Regular','Noto_Sans_KR:Regular',sans-serif] font-normal leading-[12px] left-[54px] text-[12px] text-white top-[30px] tracking-[2.4px] uppercase"
        style={{ fontVariationSettings: "'wdth' 100" }}
      >
        추천 받기
      </p>
      <Arrow2RightLong />
    </div>
  );
}

function Frame2() {
  return (
    <div className="absolute h-[71px] left-[1083px] top-[3538px] w-[221.811px]">
      <div className="absolute bg-[#333] h-[71px] left-0 top-0 w-[222px]" />
      <Group6 />
    </div>
  );
}

function Frame3() {
  return (
    <div className="absolute content-stretch flex flex-col items-start leading-[64px] left-[185px] overflow-clip text-[64px] top-[2862px]">
      <p className="css-4hzbpn font-['Roboto:Light','Noto_Sans_KR:Light',sans-serif] font-light relative shrink-0 text-[#bdbdbd] w-[450px]" style={{ fontVariationSettings: "'wdth' 100" }}>
        나만을 위한
      </p>
      <p className="css-ew64yg font-['Roboto:Bold','Noto_Sans_KR:Bold',sans-serif] font-bold relative shrink-0 text-white" style={{ fontVariationSettings: "'wdth' 100" }}>
        추천 입양 동물
      </p>
    </div>
  );
}

function Group8() {
  return (
    <div className="absolute contents left-[185px] top-[2862px]">
      <Frame3 />
    </div>
  );
}

function Group5() {
  return (
    <div className="absolute contents left-[135px] top-[2805px]">
      <div className="absolute bg-[#333] h-[422px] left-[135px] opacity-80 top-[2805px] w-[570px]" />
      <Group8 />
    </div>
  );
}

function Grid() {
  return (
    <div className="absolute contents left-[135px] top-[2805px]" data-name="grid">
      <Frame2 />
      <Group5 />
      <div className="absolute h-[422px] left-[742px] top-[2805px] w-[563px]" data-name="202601061001832 1">
        <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
          <img alt="" className="absolute max-w-none object-cover size-full" src={img2026010610018321} />
          <img alt="" className="absolute max-w-none object-cover size-full" src={img2026010610018321} />
          <img alt="" className="absolute max-w-none object-cover size-full" src={img2026010610018321} />
        </div>
      </div>
      <div className="absolute h-[255px] left-[135px] top-[3253px] w-[270px]" data-name="202601061001832 2">
        <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
          <img alt="" className="absolute max-w-none object-cover size-full" src={img2026010610018321} />
          <img alt="" className="absolute max-w-none object-cover size-full" src={img2026010610018321} />
          <div className="absolute inset-0 overflow-hidden">
            <img alt="" className="absolute h-full left-[-10.22%] max-w-none top-[0.16%] w-[125.93%]" src={img2026010610018321} />
          </div>
        </div>
      </div>
      <div className="absolute h-[255px] left-[435px] top-[3253px] w-[470px]" data-name="202601061001832 3">
        <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
          <img alt="" className="absolute max-w-none object-cover size-full" src={img2026010610018321} />
          <img alt="" className="absolute max-w-none object-cover size-full" src={img2026010610018321} />
          <div className="absolute inset-0 overflow-hidden">
            <img alt="" className="absolute h-[138.04%] left-[0.1%] max-w-none top-[-14.5%] w-full" src={img2026010610018321} />
          </div>
        </div>
      </div>
      <div className="absolute h-[255px] left-[935px] top-[3253px] w-[370px]" data-name="202601061001832 4">
        <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
          <img alt="" className="absolute max-w-none object-cover size-full" src={img2026010610018321} />
          <img alt="" className="absolute max-w-none object-cover size-full" src={img2026010610018321} />
          <div className="absolute inset-0 overflow-hidden">
            <img alt="" className="absolute h-[138.04%] left-[-11.51%] max-w-none top-[-13.1%] w-[127.03%]" src={img2026010610018321} />
          </div>
        </div>
      </div>
    </div>
  );
}

function Recommend() {
  return (
    <div className="absolute contents left-[135px] top-[2681px]" data-name="Recommend">
      <Grid />
      <p className="absolute css-ew64yg font-['Roboto:Light',sans-serif] font-light leading-[64px] left-[135px] text-[#bdbdbd] text-[64px] top-[2681px]" style={{ fontVariationSettings: "'wdth' 100" }}>
        Recommend
      </p>
    </div>
  );
}

function Group4() {
  return (
    <div className="absolute contents left-[136px] top-[2363px]">
      <div className="absolute flex flex-col font-['Roboto:Black',sans-serif] font-black h-[140px] justify-center leading-[0] left-[136px] text-[200px] text-[rgba(49,130,246,0.3)] top-[2435px] translate-y-[-50%] w-[104px]" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="css-4hzbpn leading-[normal]">1</p>
      </div>
      <div className="absolute font-['Roboto:Regular','Noto_Sans_KR:Regular',sans-serif] font-normal leading-[36px] left-[270px] text-[#333] text-[20px] top-[2363px] w-[370px]" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="css-4hzbpn mb-0">{`멍쉘은 유기견 입양 과정을 `}</p>
        <p className="css-4hzbpn mb-0">{`단계별로 안내하고, `}</p>
        <p className="css-4hzbpn">누구나 신뢰할 수 있게 돕는 서비스입니다.</p>
      </div>
    </div>
  );
}

function Group3() {
  return (
    <div className="absolute contents left-[736px] top-[2363px]">
      <div className="absolute flex flex-col font-['Roboto:Black',sans-serif] font-black h-[140px] justify-center leading-[0] left-[736px] text-[200px] text-[rgba(49,130,246,0.3)] top-[2435px] translate-y-[-50%] w-[120px]" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="css-4hzbpn leading-[normal]">2</p>
      </div>
      <div className="absolute font-['Roboto:Regular','Noto_Sans_KR:Regular',sans-serif] font-normal leading-[36px] left-[886px] text-[#333] text-[20px] top-[2363px] w-[420px]" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="css-4hzbpn mb-0">{`멍쉘의 미션은 사람과 강아지가 `}</p>
        <p className="css-4hzbpn mb-0">{`서로에게 무리 없는 선택을 할 수 있도록, `}</p>
        <p className="css-4hzbpn">책임 있는 입양을 연결하는 것입니다.</p>
      </div>
    </div>
  );
}

function Main() {
  return (
    <div className="absolute contents left-[136px] top-[2239px]" data-name="Main">
      <p className="absolute css-ew64yg font-['Roboto:Light',sans-serif] font-light leading-[64px] left-[136px] text-[#bdbdbd] text-[64px] top-[2239px]" style={{ fontVariationSettings: "'wdth' 100" }}>
        Main Focus/Mission Statement
      </p>
      <Group4 />
      <Group3 />
    </div>
  );
}

function IcoShape1() {
  return (
    <div className="absolute inset-[31.25%_15.8%_35.42%_12.5%]" data-name="ico-shape">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 17.2071 8">
        <g id="ico-shape">
          <path clipRule="evenodd" d={svgPaths.p2ef7180} fill="var(--fill-0, #3182F6)" fillRule="evenodd" id="Vector (Stroke)" />
          <path clipRule="evenodd" d={svgPaths.p33998100} fill="var(--fill-0, #3182F6)" fillRule="evenodd" id="Vector 2 (Stroke)" />
        </g>
      </svg>
    </div>
  );
}

function Arrow2RightLong1() {
  return (
    <div className="absolute left-[134px] size-[24px] top-[24px]" data-name="arrow-2-right-long">
      <IcoShape1 />
    </div>
  );
}

function Group2() {
  return (
    <div className="absolute contents left-[35px] top-[24px]">
      <p className="absolute css-ew64yg font-['Roboto:Regular',sans-serif] font-normal leading-[12px] left-[35px] text-[#3182f6] text-[12px] top-[30px] tracking-[2.4px] uppercase" style={{ fontVariationSettings: "'wdth' 100" }}>
        Read More
      </p>
      <Arrow2RightLong1 />
    </div>
  );
}

function Frame4() {
  return (
    <div className="absolute h-[71px] left-[836px] top-[1859px] w-[222px]">
      <div className="absolute bg-white h-[71px] left-0 top-0 w-[222px]" />
      <Group2 />
    </div>
  );
}

function About() {
  return (
    <div className="absolute contents left-[136px] top-[1525px]" data-name="About">
      <div className="absolute bg-[#fbfbfb] h-[435px] left-[136px] top-[1525px] w-[1170px]" />
      <p className="absolute css-ew64yg font-['Roboto:Light',sans-serif] font-light leading-[64px] left-[836px] text-[#bdbdbd] text-[64px] top-[1555px]" style={{ fontVariationSettings: "'wdth' 100" }}>
        About
      </p>
      <div className="absolute h-[265px] left-[236px] top-[1555px] w-[270px]">
        <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
          <div className="absolute bg-[#c4c4c4] inset-0" />
          <img alt="" className="absolute max-w-none object-cover size-full" src={imgRectangle8} />
        </div>
      </div>
      <div className="absolute h-[345px] left-[536px] top-[1585px] w-[270px]">
        <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
          <div className="absolute bg-[#c4c4c4] inset-0" />
          <img alt="" className="absolute max-w-none object-cover size-full" src={imgRectangle9} />
        </div>
      </div>
      <div className="absolute h-[140px] left-[236px] top-[1850px] w-[270px]">
        <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
          <div className="absolute bg-[#c4c4c4] inset-0" />
          <img alt="" className="absolute max-w-none object-cover size-full" src={imgRectangle10} />
        </div>
      </div>
      <Frame4 />
      <div className="absolute font-['Roboto:Thin','Noto_Sans_KR:Light',sans-serif] font-thin h-[200px] leading-[25px] left-[836px] text-[12px] text-black top-[1639px] w-[440px]" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="css-4hzbpn mb-0">
          유기견 입양은 마음만으로 시작하기 어렵습니다.
          <br aria-hidden="true" />
          정보는 흩어져 있고, 절차는 복잡하며, 처음이라 무엇부터 해야 할지 막막하기도 합니다.
        </p>
        <p className="css-4hzbpn mb-0">
          멍쉘은 입양을 “감정”이 아니라 “준비된 선택”으로 바꿉니다.
          <br aria-hidden="true" />
          입양 희망자가 자신의 생활환경과 성향을 정리하고, 강아지에게 필요한 조건을 점검하며,
          <br aria-hidden="true" />
          서로에게 무리가 없는 매칭이 이루어지도록 돕는 과정을 제공합니다.
        </p>
        <p className="css-4hzbpn">
          우리는 단순히 강아지를 보여주는 서비스가 아니라,
          <br aria-hidden="true" />
          입양 이후까지 책임질 수 있는 연결을 목표로 합니다.
        </p>
      </div>
    </div>
  );
}

function StatInfo({ count }: { count: number }) {
  return (
    <div className="absolute contents left-[183.5px] text-center top-[1234.5px]" data-name="Stat Info.">
      <p className="absolute css-ew64yg font-['DM_Sans:Medium',sans-serif] font-medium leading-[50px] left-[253.5px] text-[#4598ff] text-[44px] top-[1234.5px] translate-x-[-50%]" style={{ fontVariationSettings: "'opsz' 14" }}>
        {count.toLocaleString()}
      </p>
      <p className="absolute css-ew64yg font-['DM_Sans:Bold','Noto_Sans_KR:Bold',sans-serif] font-bold leading-[34px] left-[254px] text-[24px] text-[rgba(69,152,255,0.5)] top-[1288.5px] translate-x-[-50%]" style={{ fontVariationSettings: "'opsz' 14" }}>
        보호중
      </p>
    </div>
  );
}

function StatInfo1({ count }: { count: number }) {
  return (
    <div className="absolute contents left-[542px] text-center top-[1234.5px]" data-name="Stat Info.">
      <p className="absolute css-ew64yg font-['DM_Sans:Medium',sans-serif] font-medium leading-[50px] left-[599.5px] text-[#4598ff] text-[44px] top-[1234.5px] translate-x-[-50%]" style={{ fontVariationSettings: "'opsz' 14" }}>
        {count.toLocaleString()}
      </p>
      <p className="absolute css-ew64yg font-['DM_Sans:Bold','Noto_Sans_KR:Bold',sans-serif] font-bold leading-[34px] left-[600px] text-[24px] text-[rgba(69,152,255,0.5)] top-[1288.5px] translate-x-[-50%]" style={{ fontVariationSettings: "'opsz' 14" }}>
        입양
      </p>
    </div>
  );
}

function StatInfo3({ count }: { count: number }) {
  return (
    <div className="absolute contents left-[1206px] text-center top-[1234.5px]" data-name="Stat Info.">
      <p className="absolute css-ew64yg font-['DM_Sans:Medium',sans-serif] font-medium leading-[50px] left-[1239px] text-[#bcbacd] text-[44px] top-[1234.5px] translate-x-[-50%]" style={{ fontVariationSettings: "'opsz' 14" }}>
        {count.toLocaleString()}
      </p>
      <p className="absolute css-ew64yg font-['DM_Sans:Bold','Noto_Sans_KR:Bold',sans-serif] font-bold leading-[34px] left-[1240px] text-[24px] text-[rgba(188,186,205,0.5)] top-[1288.5px] translate-x-[-50%]" style={{ fontVariationSettings: "'opsz' 14" }}>
        안락사
      </p>
    </div>
  );
}

function Today() {
  const [stats, setStats] = useState<TodayStats>(INITIAL_TODAY_STATS);

  useEffect(() => {
    const fetchTodayStats = async () => {
      try {
        const res = await getTodayStatusCounts();

        const next = { ...INITIAL_TODAY_STATS };

        res.forEach(({ status, count }) => {
          if (status === "보호중") next.보호중 = count;
          if (status === "종료(입양)") next.입양 = count;
          if (status === "종료(안락사)") next.안락사 = count;
        });

        setStats(next);
      } catch (error) {
        console.error("Today stats fetch failed", error);
      }
    };

    fetchTodayStats();
  }, []);

  return (
    <div className="absolute contents left-[12px] top-[1052px]" data-name="Today">
      <div className="absolute bg-white h-[355px] left-[12px] top-[1052px] w-[1440px]" data-name="Container" />
      <StatInfo count={stats.보호중} />
      <StatInfo1 count={stats.입양} />
      <StatInfo3 count={stats.안락사} />
      <p className="absolute css-ew64yg font-['Roboto:Light',sans-serif] font-light leading-[64px] left-[648px] text-[#bdbdbd] text-[64px] top-[1092px]" style={{ fontVariationSettings: "'wdth' 100" }}>
        Today
      </p>
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

function Group7() {
  return (
    <div className="absolute contents left-[20.34px] top-[24px]">
      <p className="absolute css-ew64yg font-['Roboto:Regular','Noto_Sans_KR:Regular',sans-serif] font-normal leading-[12px] left-[20.34px] text-[#333] text-[12px] top-[30px] tracking-[2.4px] uppercase" style={{ fontVariationSettings: "'wdth' 100" }}>
        입양하러 가기
      </p>
      <div className="absolute left-[148.34px] size-[24px] top-[24px]" data-name="arrow-2-right-long">
        <IcoShape2 />
      </div>
    </div>
  );
}

function SlideNumbers() {
  return (
    <div className="absolute contents left-[135px] top-[799px]" data-name="slide-numbers">
      <p className="absolute css-4hzbpn font-['Roboto:Regular',sans-serif] font-normal leading-[24px] left-[135px] text-[#bdbdbd] text-[24px] top-[803px] w-[23.98px]" style={{ fontVariationSettings: "'wdth' 100" }}>
        01
      </p>
      <p className="absolute css-4hzbpn font-['Roboto:Regular',sans-serif] font-normal leading-[24px] left-[247.9px] text-[#bdbdbd] text-[24px] top-[803px] w-[28.975px]" style={{ fontVariationSettings: "'wdth' 100" }}>
        02
      </p>
      <div className="absolute flex h-[31px] items-center justify-center left-[184.95px] top-[799px] w-[30.974px]" style={{ "--transform-inner-width": "0", "--transform-inner-height": "0" } as CSSProperties}>
        <div className="flex-none rotate-[134.98deg] skew-x-[-0.05deg]">
          <div className="h-0 relative w-[43.822px]">
            <div className="absolute inset-[-2px_0_0_0]">
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 43.8219 2">
                <line id="Line 3" stroke="var(--stroke-0, #E0E0E0)" strokeWidth="2" x2="43.8219" y1="1" y2="1" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function IcoShape3() {
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
      <IcoShape3 />
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
    <div className="absolute h-[53px] left-[210.94px] top-[656px] w-[52.955px]">
      <Group1 />
    </div>
  );
}

function IcoShape4() {
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

function Arrow2RightLong3() {
  return (
    <div className="relative size-[24px]" data-name="arrow-2-right-long">
      <IcoShape4 />
    </div>
  );
}

function Group() {
  return (
    <div className="absolute contents left-0 top-0">
      <div className="absolute bg-white border border-[#f2f2f2] border-solid left-0 size-[53px] top-0" />
      <div className="absolute flex items-center justify-center left-[15px] size-[24px] top-[15px]">
        <div className="flex-none rotate-[180deg] scale-y-[-100%]">
          <Arrow2RightLong3 />
        </div>
      </div>
    </div>
  );
}

function Frame1() {
  return (
    <div className="absolute h-[53px] left-[135px] top-[656px] w-[52.955px]">
      <Group />
    </div>
  );
}

function Hero() {
  return (
    <div className="absolute contents left-[135px] top-[162px]" data-name="Hero">
      <p className="absolute css-4hzbpn font-['Roboto:Light',sans-serif] font-light leading-[64px] left-[135px] text-[#bdbdbd] text-[64px] top-[438px] w-[277.763px]" style={{ fontVariationSettings: "'wdth' 100" }}>
        MUNG!
      </p>
      <p className="absolute css-ew64yg font-['Roboto:Bold',sans-serif] font-bold leading-[64px] left-[135px] text-[#3182f6] text-[64px] top-[502px]" style={{ fontVariationSettings: "'wdth' 100" }}>
        SHALL?
      </p>
      <div className="absolute h-[71px] left-[534.66px] top-[863px] w-[221.811px]">
        <div className="absolute bg-white h-[71px] left-0 top-0 w-[222px]" />
        <Group7 />
      </div>
      <div className="absolute flex h-0 items-center justify-center left-[264px] top-[682px] w-[271px]">
        <div className="flex-none rotate-[180deg]">
          <div className="h-0 relative w-[271px]">
            <div className="absolute inset-[-1px_0_0_0]">
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 271 1">
                <line id="Line 3" stroke="var(--stroke-0, #F2F2F2)" x2="271" y1="0.5" y2="0.5" />
              </svg>
            </div>
          </div>
        </div>
      </div>
      <SlideNumbers />
      <Frame />
      <Frame1 />
      <div className="absolute h-[661px] left-[435px] top-[162px] w-[545px]" data-name="mungshall 1">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <img alt="" className="absolute h-[145.23%] left-[-79.82%] max-w-none top-[-24.51%] w-[264.22%]" src={imgMungshall1} />
        </div>
      </div>
    </div>
  );
}

export default function HomeScreen() {
  return (
    <div className="bg-white relative mx-auto min-h-[4000px] w-[1440px]" data-name="01_Home">
      <Recommend />
      <Main />
      <About />
      <Today />
      <Hero />
    </div>
  );
}
