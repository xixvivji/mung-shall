import { Link } from "react-router-dom";
import type { BoardSummary } from "../types";

type BoardCardProps = {
  board: BoardSummary;
};

export default function BoardCard({ board }: BoardCardProps) {
  return (
    <Link
      to={`/boards/${board.id}`}
      className="group block rounded-[16px] border border-[#E5E7EB] bg-white p-6 shadow-sm transition hover:-translate-y-[2px] hover:border-[#5B7CFA]/40 hover:bg-[#F7F8FA]"
    >
      <div className="flex items-start justify-between gap-4">
        <h3 className="text-lg font-semibold text-[#1F2937]">{board.title}</h3>
        <span className="text-xs text-[#6B7280]">{board.createdAt}</span>
      </div>
      {board.preview ? (
        <p className="mt-3 text-sm text-[#6B7280]">{board.preview}</p>
      ) : null}
      <div className="mt-4 text-sm text-[#6B7280]">{board.authorName}</div>
    </Link>
  );
}
