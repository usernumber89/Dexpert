"use client";
import { InstagramIcon, MailIcon } from "lucide-react";

const links = [
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms and conditions" },
  { href: "/faq", label: "FAQ" },
];

export function Footer() {
  return (
    <footer id="contact-section" className="bg-[#0a2243] text-white px-6 py-12">
      <div className="max-w-4xl mx-auto flex flex-col items-center gap-8">
        <nav className="flex flex-wrap justify-center gap-6">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="text-sm text-white/70 hover:text-white transition">
              {l.label}
            </a>
          ))}
        </nav>

        <div className="w-16 border-t border-white/10" />

        <div className="text-center">
          <p className="text-sm font-medium text-white/60 uppercase tracking-widest mb-4">
            Follow us
          </p>
          <div className="flex gap-6 justify-center">
            
              href="mailto:dexpertwork@gmail.com"
              className="flex items-center gap-2 text-sm text-white/70 hover:text-white transition"
            >
              <MailIcon size={16} />
              dexpertwork@gmail.com
            </a>
            
              href="https://www.instagram.com/dexpert.sv"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-white/70 hover:text-white transition"
            >
              <InstagramIcon size={16} />
              Instagram
            </a>
          </div>
        </div>

        <p className="text-xs text-white/30">© 2025 Dexpert</p>
      </div>
    </footer>
  );
}