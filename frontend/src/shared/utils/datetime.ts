export function formatDateTime(input?: string | null): string {
    if (!input) return "";

    const normalized = input.replace(
        /(\.\d{3})\d+$/,
        "$1"
    );

    const d = new Date(normalized);
    if (Number.isNaN(d.getTime())) {
        return input;
    }

    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    const HH = String(d.getHours()).padStart(2, "0");
    const MM = String(d.getMinutes()).padStart(2, "0");

    return `${yyyy}.${mm}.${dd} ${HH}:${MM}`;
}
