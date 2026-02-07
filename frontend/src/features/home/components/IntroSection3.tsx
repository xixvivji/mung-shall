import videoCallImg from "@/assets/images/화상통화.png";
import documentImg from "@/assets/images/서류조회.png";

export default function IntroSection3() {
  return (
    <section className="snap-start snap-always min-h-screen w-full bg-white py-32">
      <div className="mx-auto max-w-[1200px] px-6 space-y-32">
        
        {/* Row 1: 화상통화 */}
        <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-16">
          {/* 이미지 */}
          <div className="w-full">
            <img
              src={videoCallImg}
              alt="화상 통화 화면"
              className="w-full rounded-2xl object-cover"
            />
          </div>

          {/* 텍스트 */}
          <div>
            <h3 className="text-2xl font-semibold text-[#111]">
              WebRTC 기반 화상 통화 사후 관리
            </h3>
            <p className="mt-4 text-base leading-7 text-[#6B7280]">
              입양 이후에도 화상 상담을 통해 반려견의 상태를
              <br/>
              지속적으로 확인하고 소통할 수 있습니다.
            </p>

          </div>
        </div>

        {/* Row 2: 서류 조회 */}
        <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-16">
          {/* 텍스트 */}
          <div>
            <h3 className="text-2xl font-semibold text-[#111]">
              문서 제출도, 조회도 한눈에
            </h3>
            <p className="mt-4 text-base leading-7 text-[#6B7280]">
              입양에 필요한 각종 서류를 한 곳에서
              <br/>
              제출하고 진행 상태를 바로 확인할 수 있습니다.
            </p>
          </div>

          {/* 이미지 */}
          <div className="w-full">
            <img
              src={documentImg}
              alt="입양 서류 조회 화면"
              className="w-full rounded-2xl object-cover"
            />
          </div>
        </div>

      </div>
    </section>
  );
}
