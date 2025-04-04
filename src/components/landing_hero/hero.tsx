import { PaperPlaneIcon } from "@radix-ui/react-icons";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import Image from "next/image";

const Hero = () => {
    const { ref, show } = useScrollReveal();
    return (
        <div ref={ref} className={`float-in ${show ? "show" : ""}`}>
            <section className="text-center text-white py-20 px-3 max-w-6xl mx-auto mt-20">
                <h1 className="text-4xl sm:text-5xl font-extrabold mb-4 bg-gradient-to-r from-[#E6AFAE] to-[#CCA4A4] bg-clip-text text-transparent">
                Build Your Own AI Models with AEROML
                </h1>
                <p className="text-gray-400 mb-10 mt-5 text-lg">
                    AeroML is where automation meets innovation, 
                    making machine learning accessible to all.
                </p>

                <div className="flex flex-col sm:flex-row items-center gap-4 mb-12 mt-16">
                    <input
                    type="text"
                    placeholder="Tell us about the ideal output of your model..."
                    className="w-full px-4 py-3 rounded-md bg-transparent border border-gray-600 text-white focus:outline-none"
                    readOnly
                    />
                    <button className="whitespace-nowrap px-5 py-3 rounded-md bg-white text-black font-medium flex items-center gap-2" disabled>
                        Run Now <PaperPlaneIcon />
                    </button>
                </div>

                <div className="text-sm text-gray-400 flex flex-col items-center justify-center gap-2 mt-8">
                    <span>Powered By</span>
                    <div className="flex items-center justify-center gap-6">
                        <img src="/images/H20-icon.png" alt="H2O.ai" className="h-15" />
                        <img src="/images/openai-icon.png" alt="OpenAI" className="h-7" />
                        <img src="/images/groq-icon.png" alt="Groq AI" className="h-7" />
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Hero;
