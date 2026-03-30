"use client";
import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  { question: "What is Dexpert?", answer: "Dexpert is a web platform that connects young people without work experience to small businesses that need help with real projects. It offers a simple and inclusive way to gain hands-on experience and build a professional portfolio." },
  { question: "Who can use Dexpert?", answer: "Dexpert is designed for young people, including those with disabilities, who want to gain experience and improve their job readiness. Small and medium-sized businesses can also use Dexpert to get affordable support for their projects." },
  { question: "Do I need experience to join?", answer: "No experience is required. Dexpert is made for beginners. Our AI assistant helps guide you through each step so you can learn and grow with real feedback." },
  { question: "How does Dexpert help small businesses?", answer: "Small businesses can post their project ideas with help from our AI assistant, even if they're not tech-savvy. They get support from motivated young people and can choose service plans that fit their budget." },
  { question: "Is Dexpert accessible to people with disabilities?", answer: "Yes. Dexpert is fully inclusive. Users can describe their ideas by voice, and the platform is built to ensure equal access, respect, and participation for all users." },
  { question: "What do students get from the experience?", answer: "Students gain practical experience, mentorship through AI, and a certificate that proves their contribution to real-world projects. This helps them build a portfolio and confidence for future jobs." },
  { question: "How much does it cost for businesses?", answer: "We offer three plans: $4.99 for posting a project, $14.99 for AI-assisted setup and recommendations, and $24.99 for full support and featured listing." },
  { question: "Where is Dexpert available?", answer: "Dexpert is currently focused on El Salvador but aims to expand across Latin America to unlock talent and opportunity everywhere." },
];

export function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <h2 className="text-3xl font-bold mb-10 text-center text-[#0a2243]">
        Frequently Asked Questions
      </h2>
      <div className="divide-y divide-gray-100">
        {faqs.map((faq, index) => {
          const isOpen = openIndex === index;
          return (
            <div
              key={index}
              className="py-4 cursor-pointer"
              onClick={() => setOpenIndex(isOpen ? null : index)}
            >
              <div className="flex justify-between items-center gap-4">
                <span className={`font-medium text-base transition-colors ${isOpen ? "text-[#2196f3]" : "text-[#0a2243]"}`}>
                  {faq.question}
                </span>
                <ChevronDown
                  size={18}
                  className={`flex-shrink-0 transition-transform duration-300 ${isOpen ? "rotate-180 text-[#2196f3]" : "text-gray-400"}`}
                />
              </div>
              {isOpen && (
                <p className="mt-3 text-sm text-gray-500 leading-relaxed">
                  {faq.answer}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}