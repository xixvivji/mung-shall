import "@/shared/styles/uiverse/ContinueApplicationButton.css";

type StepStatus =
  | "NOT_STARTED"
  | "PENDING"
  | "SUBMITTED"
  | "APPROVED"
  | "REJECTED";

type Props = {
  status?: StepStatus | null;
  label?: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
  className?: string;
};

export function ContinueApplicationButton({
  status,
  label = "입양설문지 작성하기",
  onClick,
  disabled,
  className,
}: Props) {
  const isApproved = status === "APPROVED";
  const buttonClassName = [
    "continue-application",
    isApproved ? "is-approved" : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");
  const ariaLabel = isApproved ? `${label} (완료)` : label;

  return (
    <button
      className={buttonClassName}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
    >
      <div>
        {isApproved ? (
          <svg
            viewBox="0 0 16 16"
            className="bi bi-check-lg"
            fill="currentColor"
            height="16"
            width="16"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path d="M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.217 8.384a.757.757 0 0 1 0-1.06.733.733 0 0 1 1.047 0l3.052 3.093 5.4-6.425z" />
          </svg>
        ) : (
          <>
            <div className="pencil"></div>
            <div className="folder">
              <div className="top">
                <svg viewBox="0 0 24 27">
                  <path d="M1,0 L23,0 C23.5522847,-1.01453063e-16 24,0.44771525 24,1 L24,8.17157288 C24,8.70200585 23.7892863,9.21071368 23.4142136,9.58578644 L20.5857864,12.4142136 C20.2107137,12.7892863 20,13.2979941 20,13.8284271 L20,26 C20,26.5522847 19.5522847,27 19,27 L1,27 C0.44771525,27 6.76353751e-17,26.5522847 0,26 L0,1 C-6.76353751e-17,0.44771525 0.44771525,1.01453063e-16 1,0 Z"></path>
                </svg>
              </div>
              <div className="paper"></div>
            </div>
          </>
        )}
      </div>
      {label}
    </button>
  );
}
