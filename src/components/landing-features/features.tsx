import { useScrollReveal } from "@/hooks/useScrollReveal";

const features = [
    {
      title: "Smart Dataset Creation",
      description: "Tell us what you're building, and our AI Agent will generate the perfect dataset for your model.",
      icon: "📊",
    },
    {
      title: "Model Intelligence",
      description: "Get matched with the ideal model architecture through natural conversation.",
      icon: "🧠",
    },
    {
      title: "End To End Experience",
      description: "Build complete AI solutions using natural conversation, from data to deployment.",
      icon: "⭐",
    },
    {
      title: "Automate ML Phase",
      description: "Simplify and accelerate the machine learning lifecycle with minimal manual effort.",
      icon: "🔄",
    },
    {
      title: "Enable Download Model",
      description: "Instantly generate and prepare downloadable models for locally deployment.",
      icon: "☁️",
    },
    {
      title: "Collaboration AI Agents",
      description: "Enhance productivity and efficiency by enabling multiple AI agents to work together.",
      icon: "🤖",
    },
  ];
  
  const Features = () => {
    const { ref, show } = useScrollReveal();
    return (
        <div
            ref={ref}
            className={`float-in ${show ? "show" : ""}`}
        >
            <section className="py-20 px-6 max-w-6xl mx-auto text-white mb-20">
                <div className="text-left mb-12">
                <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-[#E6AFAE] to-[#CCA4A4] bg-clip-text text-transparent">
                    Save time and get smarter solutions faster.
                </h2>
                <p className="mt-4 text-gray-300 mx-auto">
                    Empower your decisions with easy, automated machine learning and deploy — all through Natural Language.
                </p>
                </div>
        
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {features.map((feature, index) => (
                    <div
                    key={index}
                    className="border border-white/10 bg-white/5 backdrop-blur-sm p-6 rounded-xl hover:border-pink-200 transition"
                    >
                    <h3 className="flex items-center gap-2 font-semibold text-lg text-pink-100 mb-2">
                        <span className="text-2xl">{feature.icon}</span>
                        {feature.title}
                    </h3>
                    <p className="text-sm text-gray-300">{feature.description}</p>
                    </div>
                ))}
                </div>
            </section>
        </div>
    );
  };
  
  export default Features;
  