type InfoTableProps = {
  rows: { label: string; value: string }[];
};

export default function InfoTable({ rows }: InfoTableProps) {
  return (
    <div className="grid gap-2 text-sm">
      {rows.map((row) => (
        <div key={row.label} className="flex justify-between border-b border-[#eee] py-2">
          <span className="text-[#666]">{row.label}</span>
          <span className="text-[#333]">{row.value}</span>
        </div>
      ))}
    </div>
  );
}
