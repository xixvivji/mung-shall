import { Container } from "./Container";

export function Footer() {
  return (
    <footer className="border-t border-line bg-white">
      <Container className="flex flex-col gap-2 py-10 text-sm text-slate-500 md:flex-row md:items-center md:justify-between">
        <p>© {new Date().getFullYear()} MUNG-SHALL</p>
        <p className="text-slate-400">UI reproduction practice.</p>
      </Container>
    </footer>
  );
}
