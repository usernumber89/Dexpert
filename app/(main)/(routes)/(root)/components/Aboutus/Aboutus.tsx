import Image from 'next/image';
import Link from 'next/link';

export function Aboutus() {
  return (
    <div className="flex flex-col md:flex-row items-center justify-center min-h-screen px-6 md:px-10 py-10 gap-10">
      <div className="w-full md:w-1/2 text-black">
        <p className="text-xs uppercase font-semibold tracking-widest text-[#2196F3] mb-3">About Us</p>
        <h2 className="text-4xl font-bold leading-tight mb-4 text-[#0A2243]">
          We believe in what <br /> you can be
        </h2>
        <p className="text-base text-gray-600 mb-6 leading-relaxed">
          Dexpert is an inclusive platform that connects young people with no work experience to micro and small businesses, allowing them to participate in real projects, gain practice, develop skills, and strengthen their professional profile.
        </p>
        <Link href="#contact-section">
          <button className="px-6 py-2 bg-[#0A2243] text-white rounded-full hover:bg-[#2196F3] transition">
            Contact Us
          </button>
        </Link>
      </div>
      <div>
        <Image
          src="/auimage2.png"
          alt="Editor at Work"
          height={400}
          width={400}
          className="relative -top-8 h-auto"
        />
      </div>
    </div>
  );
}