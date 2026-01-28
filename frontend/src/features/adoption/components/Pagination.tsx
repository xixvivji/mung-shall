import svgPaths from "../../home/assets/svgPaths";

type ArrowButtonProps = {
  direction?: "left" | "right";
  tone?: "light" | "muted";
};

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

function ArrowButton({ direction = "right", tone = "light" }: ArrowButtonProps) {
  const isLeft = direction === "left";
  const backgroundClass = tone === "muted" ? "bg-[#f9f9f9]" : "bg-white";

  return (
    <button
      className={`relative size-[53px] cursor-pointer border border-[#f2f2f2] ${backgroundClass}`}
      type="button"
      aria-label={isLeft ? "Previous page" : "Next page"}
    >
      {isLeft ? (
        <div className="absolute flex items-center justify-center left-[15px] size-[24px] top-[15px]">
          <div className="flex-none rotate-[180deg] scale-y-[-100%]">
            <div className="relative size-[24px]" data-name="arrow-2-right-long">
              <IcoShape />
            </div>
          </div>
        </div>
      ) : (
        <div className="absolute left-[15px] size-[24px] top-[15px]" data-name="arrow-2-right-long">
          <IcoShape />
        </div>
      )}
    </button>
  );
}

function SlideNumbers() {
  return (
    <div className="flex items-center gap-[32px] text-[24px] text-[#bdbdbd]">
      <span className="font-['Roboto:Regular',sans-serif] font-normal">01</span>
      <div className="flex h-[31px] items-center justify-center">
        <div className="flex-none rotate-[134.98deg] skew-x-[-0.05deg]">
          <svg className="block h-[2px] w-[44px]" fill="none" preserveAspectRatio="none" viewBox="0 0 43.8219 2">
            <line id="Line 3" stroke="var(--stroke-0, #E0E0E0)" strokeWidth="2" x2="43.8219" y1="1" y2="1" />
          </svg>
        </div>
      </div>
      <span className="font-['Roboto:Regular',sans-serif] font-normal">02</span>
    </div>
  );
}

export default function Pagination() {
  return (
    <div className="flex flex-col items-center gap-6">
      <SlideNumbers />
      <div className="flex items-center gap-5">
        <ArrowButton direction="left" tone="light" />
        <ArrowButton direction="right" tone="muted" />
      </div>
    </div>
  );
}
