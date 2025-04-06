'use client';

import { useState } from 'react';
import Footer from "@/components/footer/footer";
import NavBar from "@/components/navbar/navbar";
import { PaperPlaneIcon } from "@radix-ui/react-icons";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import axios from 'axios'; // Import axios for making HTTP requests
import { useRouter } from 'next/navigation'; // Import useRouter for navigation

// Placeholder suggestions
const suggestions = [
    "A user can describe a graph and let Python Matplotlib code as the output, prioritizing code generation.",
    "A user can describe a graph and let Python Matplotlib code as the output.",
];

export default function ModelPrompt() {
  const [inputValue, setInputValue] = useState("");

  // Update input value when suggestion is clicked
  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
  };

  const { ref, show } = useScrollReveal();
  const router = useRouter(); // Initialize the router

  const handleContinue = async () => {
    try {
        // Sending the POST request with the model input
        const response = await axios.post('http://127.0.0.1:80/suggest-sources', {
            modelInput: inputValue
        });

        console.log('Response from backend:', response.data);

        // Passing the response (model input result) to the next page via state
        router.push(`/dataset-selection?sourcesData=${encodeURIComponent(JSON.stringify(response.data.sources))}`);

    } catch (error) {
        console.error('Error sending input to backend:', error);
    }
  };

  return (
    <div className="flex flex-col min-h-screen overflow-y-hidden">
        {/* Nav Bar */}
        <NavBar />
        <div
            ref={ref}
            className={`float-in ${show ? "show" : ""}`}
        >
          <section className="w-full max-w-5xl mt-12 mx-auto px-4 py-16 text-white flex-grow">
              {/* Section Title */}
              <div className="mb-6">
                  <h4 className="text-xl text-gray-400 mb-2">Model Selection</h4>
                  <h2 className="text-xl sm:text-2xl font-medium text-center sm:text-left">
                  Tell us about your ideal model. What do you want your model to work for?
                  </h2>
              </div>

              {/* Input + Button */}
              <div className="flex flex-col sm:flex-row items-center gap-4 mb-10">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}  // Allow text input
                    placeholder="Tell us about the ideal output of your model..."
                    className="w-full px-4 py-3 rounded-md bg-transparent border border-gray-600 text-white placeholder:text-gray-400 focus:outline-none"
                    required
                  />
                  <button 
                  className="flex items-center gap-2 px-5 py-3 rounded-md bg-white text-black font-medium hover:bg-gray-200 transition whitespace-nowrap cursor-pointer"
                  onClick={handleContinue}
                  >
                  Continue <PaperPlaneIcon />
                  </button>
              </div>

              {/* Suggestions */}
              <div className="space-y-4">
                  <h5 className="text-sm text-gray-400">Suggestions</h5>
                  {suggestions.map((sugg, index) => (
                      <div
                        key={index}
                        className="border-b border-gray-700 pb-2 text-sm text-gray-300 cursor-pointer hover:text-pink-300"
                        onClick={() => handleSuggestionClick(sugg)} // Handle suggestion click
                      >
                          {sugg}
                      </div>
                  ))}
              </div>
          </section>
        </div>

        {/* Footer */}
        <Footer />
    </div>
  );
}
