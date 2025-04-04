const Footer = () => {
    return (
      <footer className="w-full px-6 py-10 text-sm text-white bg-[#080609]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between gap-6">
          {/* Left Section */}
          <div>
            <h4 className="font-semibold text-lg mb-1">AeroML</h4>
            <p className="text-gray-400">© 2025 AEROML</p>
          </div>
  
          {/* Right Section */}
          <div className="flex flex-col items-start sm:items-end gap-2 text-gray-200">
            <a href="#" className="hover:text-pink-300 transition">Contact Us</a>
            <a href="#" className="hover:text-pink-300 transition">Terms and Privacy</a>
            <a href="#" className="hover:text-pink-300 transition">About Us</a>
          </div>
        </div>
      </footer>
    );
  };
  
  export default Footer;
  