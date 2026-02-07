import kimMungshall from "@/assets/images/김멍쉘.png";
import Mungshall from "@/assets/images/mungshall.png";

/* =======================
   SIZE CONTROL
======================= */
const SIZES = {
  titleLeft: "text-[44px] md:text-[56px] font-extrabold leading-[1.1]",
  titleRight: "text-[44px] md:text-[56px] font-extrabold leading-[1.1]",
  itemTitle: "text-[18px] font-semibold",
  itemDesc: "text-[15px] md:text-[16px] text-gray-500",

  characterMain: "w-[260px] md:w-[500px]",
  characterSub: "w-[200px] md:w-[600px]",
};

/* =======================
   POSITION CONTROL
======================= */
const POSITIONS = {
  leftBlock: "left-[0%] top-[48%]",
  rightBlock: "left-[58%] top-[48%]",

  characterMain: "left-2/3 top-[65%] -translate-x-1/2 -translate-y-1/2",
  characterSub: "left-1/3 top-[58%] -translate-x-1/2",
};

/* =======================
   COLOR TOKENS
======================= */
const COLORS = {
  leftTitle: "text-[#111827]",
  rightTitle: "text-[#2563EB]",
};

export default function IntroSection1() {
  return (
    <section className="snap-start snap-always min-h-screen w-full bg-white">
      <div className="relative mx-auto max-w-[1200px] px-6 min-h-screen flex items-center">
        {/* =======================
            LEFT TEXT
        ======================= */}
        <div className="absolute inset-0 z-30">
          <div
            className={`absolute ${POSITIONS.leftBlock} -translate-y-1/2`}
          >
            <div className="w-[520px] max-w-[92vw] space-y-8">
              {/* Title */}
              <h2 className={`${SIZES.titleLeft} ${COLORS.leftTitle}`}>
                입양 과정
                <br />
                한 화면에서 끝까지
              </h2>

              {/* Text items */}
              <div className="space-y-10">
                <div>
                  <div className={SIZES.itemTitle}>단계별 체크리스트</div>
                  <div className={SIZES.itemDesc}>
                    지금 단계와 다음 할 일을 바로 확인
                  </div>
                </div>

                <div>
                  <div className={SIZES.itemTitle}>문서 누락 최소화</div>
                  <div className={SIZES.itemDesc}>
                    필요 서류를 한 곳에서 업로드 조회
                  </div>
                </div>

                <div>
                  <div className={SIZES.itemTitle}>입양 후에도 케어</div>
                  <div className={SIZES.itemDesc}>
                    적응 단계에 맞춘 안내로 정착 지원
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* =======================
            CHARACTERS
        ======================= */}
        {/* Sub character */}
        <div
          className={`absolute z-10 ${POSITIONS.characterSub} select-none pointer-events-none`}
        >
          <img
            src={Mungshall}
            alt="멍쉘 캐릭터"
            className={`${SIZES.characterSub} object-contain opacity-80`}
            draggable={false}
          />
        </div>

        {/* Main character */}
        <div
          className={`absolute z-20 ${POSITIONS.characterMain} select-none`}
        >
          <img
            src={kimMungshall}
            alt="김멍쉘"
            className={`${SIZES.characterMain} object-contain pointer-events-none`}
            draggable={false}
          />
        </div>

        {/* =======================
            RIGHT TEXT
        ======================= */}
        <div className="absolute inset-0 z-30">
          <div
            className={`absolute ${POSITIONS.rightBlock} -translate-y-1/2 text-right`}
          >
            <div className="w-[520px] max-w-[92vw] ml-auto space-y-8">
              {/* Title */}
              <h2 className={`${SIZES.titleRight} ${COLORS.rightTitle}`}>
                함께할 준비
                <br />
                멍쉘이 돕습니다
              </h2>

              {/* Text items */}
              <div className="space-y-10">
                <div>
                  <div className={SIZES.itemTitle}>불확실성 줄이기</div>
                  <div className={SIZES.itemDesc}>
                    상태 일정과 준비물을 명확하게
                  </div>
                </div>

                <div>
                  <div className={SIZES.itemTitle}>신뢰를 쌓는 기록</div>
                  <div className={SIZES.itemDesc}>
                    간편한 진행 이력과 문서 관리
                  </div>
                </div>

                <div>
                  <div className={SIZES.itemTitle}>입양을 책임감 있게</div>
                  <div className={SIZES.itemDesc}>
                     재파양을 방지하는 사후관리
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
