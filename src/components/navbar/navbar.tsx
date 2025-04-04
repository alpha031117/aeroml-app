import Image from "next/image";
import Link from "next/link";

const NavBar = () => {
  return (
    <header className="w-full flex justify-between items-center px-6 py-4 bg-[#080609] shadow-md">
      {/* Logo + Title */}
      <div className="flex items-center gap-3">
        <Image src="/images/aeroml-icon.png" alt="AeroML Logo" width={32} height={32} />
        <span className="text-white font-bold text-lg">AEROML</span>
      </div>

      {/* Call to Action */}
      <Link
        href="/get-started"
        className="bg-white text-black px-4 py-2 rounded-md font-medium hover:bg-gray-200 transition"
      >
        Get Started
      </Link>
    </header>
  );
};

export default NavBar;
