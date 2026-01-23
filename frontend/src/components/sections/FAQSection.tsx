import { Card } from "../ui/Card";
import { Container } from "../layout/Container";

export function FAQSection() {
  return (
    <section id="faq" className="border-t border-line bg-white">
      <Container className="py-16">
        <h2 className="text-xl font-semibold tracking-tight md:text-2xl">FAQ</h2>
        <p className="mt-2 text-slate-600">강아지 고르기</p>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {[
            { title: "1번 강아지", desc: "멍멍멍" },
            { title: "2번 강아지", desc: "멍멍멍" },
            { title: "3번 강아지", desc: "멍멍멍" },
          ].map((x) => (
            <Card key={x.title} className="p-6">
              <p className="text-sm font-semibold">{x.title}</p>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{x.desc}</p>
            </Card>
          ))}
        </div>
      </Container>
    </section>
  );
}
