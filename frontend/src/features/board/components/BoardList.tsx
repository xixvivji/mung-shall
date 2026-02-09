import BoardCard from "./BoardCard";
import type { BoardSummary } from "../types";

type BoardListProps = {
  items: BoardSummary[];
  loading?: boolean;
  error?: string | null;
};

export default function BoardList({ items, loading = false, error }: BoardListProps) {
  if (loading) {
    return <div className="text-sm text-[#6B7280]">Loading...</div>;
  }

  if (error) {
    return <div className="text-sm text-[#d14343]">{error}</div>;
  }

  if (items.length === 0) {
    return <div className="text-sm text-[#6B7280]">게시글이 없습니다.</div>;
  }

  return (
    <div className="grid gap-4">
      {items.map((board) => (
        <BoardCard key={board.id} board={board} />
      ))}
    </div>
  );
}
