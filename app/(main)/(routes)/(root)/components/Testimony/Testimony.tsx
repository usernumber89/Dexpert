import Image from "next/image";
import { Quote } from "lucide-react";

const testimonies = [
  { name: "Fernando Pérez", role: "Dexpert User", img: "/hombre 1.jpg", quote: "I had never worked on a real project before. Dexpert helped me believe in what I can do and now I feel ready to apply for my first job." },
  { name: "Tatiana Salazar", role: "Entrepreneur", img: "/joven2.webp", quote: "My small business got real support from talented young people. It wasn't just help, it was collaboration with future professionals." },
  { name: "Sara Mejía", role: "Dexpert User", img: "/joven3.jpeg", quote: "As a person with a disability, it's hard to be taken seriously. On Dexpert, I was heard, included, and valued. I felt part of something." },
];

export function Testimony() {
  return (
    <section className="py-20 px-6">
      <div className="text-center mb-16">
        <h2 className="text-3xl font-bold text-[#0a2342] mb-3">What our users say</h2>
        <p className="text-gray-500 max-w-2xl mx-auto text-sm leading-relaxed">
          Many young people in El Salvador just need one opportunity. At Dexpert, they found it.
        </p>
      </div>
      <div className="flex flex-col md:flex-row justify-center gap-6 max-w-5xl mx-auto">
        {testimonies.map((t) => (
          <div
            key={t.name}
            className="relative bg-white border border-gray-100 rounded-2xl p-6 pt-14 w-full max-w-sm mx-auto shadow-sm hover:shadow-md transition-shadow duration-300"
          >
            <div className="absolute -top-8 left-1/2 -translate-x-1/2">
              <Image
                width={64}
                height={64}
                src={t.img}
                alt={t.name}
                className="w-16 h-16 rounded-full border-4 border-white shadow-sm object-cover"
              />
            </div>
            <Quote className="text-[#2196f3] mb-3" size={16} />
            <p className="text-sm text-gray-500 mb-5 leading-relaxed">{t.quote}</p>
            <div>
              <p className="font-semibold text-sm text-[#0a2342]">{t.name}</p>
              <p className="text-xs text-gray-400">{t.role}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}