
interface FooterProps {
  isLandingPage?: boolean;
}

const Footer = ({ isLandingPage = false }: FooterProps) => {
    return (
      <footer className={`w-full px-6 py-10 text-sm text-white mt-auto ${isLandingPage ? 'bg-[#080609]' : 'bg-black'}`}>
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between gap-6">
          {/* Left Section */}
          <div>
            <h4 className="font-semibold text-lg mb-1">AeroML</h4>
            <p className="text-gray-400">© 2025 AEROML</p>
          </div>
  
          {/* Right Section */}
          <div className="flex flex-col items-start sm:items-end gap-2 text-gray-200">
            <a href="/terms-of-service" className="hover:text-gray-400 transition">Terms of Service</a>
            <a href="/policy" className="hover:text-gray-400 transition">Privacy Policy</a>
          </div>
        </div>
      </footer>
    );
  };
  
  export default Footer;
  