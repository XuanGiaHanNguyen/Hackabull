import React, { useState, useEffect } from "react";
import bg1 from "../assets/bg/bg-1.png";
import bg2 from "../assets/bg/bg-2.jpg";
import bg3 from "../assets/bg/bg-3.png";
import bg4 from "../assets/bg/bg-4.png";
import bg5 from "../assets/bg/bg-5.png";

const Landing = () => {
  // Array of background images
  const backgroundImages = [
    bg1, bg2, bg3, bg4, bg5
  ];
  
  // State to track the current image index
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // Effect to change the background image every 5 seconds
  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentImageIndex((prevIndex) =>
        (prevIndex + 1) % backgroundImages.length
      );
    }, 5000);
    
    // Clean up the interval when component unmounts
    return () => clearInterval(intervalId);
  }, []);

  // Function to handle manual image changes when clicking on indicator dots
  const goToSlide = (index) => {
    setCurrentImageIndex(index);
  };
  
  return (
    <div
      className="min-h-screen flex items-center justify-center transition-all duration-1000 ease-in-out relative"
      style={{
        backgroundImage: `url(${backgroundImages[currentImageIndex]})`,
        backgroundSize: "cover",
        backgroundPosition: "center"
      }}
    >
      <div className="relative z-10 text-center w-full h-screen border-2 ">
        <h1 className="text-5xl font-bold text-white mb-6">Welcome to Our Website</h1>
        <p className="text-xl text-white mb-8">This is a landing page with swapping background images</p>
        <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg text-lg transition-colors duration-300">
          Get Started
        </button>
      </div>
      
      {/* Indicator dots container */}
      <div className="absolute bottom-8 left-0 right-0 flex justify-center items-center space-x-2 z-20">
        {backgroundImages.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              currentImageIndex === index 
                ? "bg-white scale-125" 
                : "bg-gray-400 bg-opacity-60 hover:bg-opacity-100"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default Landing;
