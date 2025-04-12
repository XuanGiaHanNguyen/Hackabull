import React, { useState } from "react";
import bg1 from "../assets/bg/bg-1.png";

const Signup = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const isFilled = username && password;

  return (
    <div
      className="min-h-screen flex items-center justify-center relative"
      style={{
        backgroundImage: `url(${bg1})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Overlay with blur effect */}
      <div className="absolute inset-0 bg-white/50 backdrop-blur-md" />
  
      {/* Foreground rectangle with content inside */}
      <div className="relative z-10 w-full max-w-md bg-white rounded-2xl shadow-xl p-8 flex flex-col items-center space-y-6">
        
        {/* Top space for image insert */}
        <div className="w-full h-32 mb-4 bg-gray-100 rounded-lg flex items-center justify-center">
          <p className="text-gray-400">Insert image here</p>
        </div>
  
        {/* Username input */}
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
        />
  
        {/* Password input */}
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
        />
  
        {/* Button */}
        <button
          disabled={!isFilled}
          className={`w-full py-2 rounded-lg font-semibold transition-colors duration-300 
            ${isFilled ? "bg-green-400 text-white hover:bg-green-500" : "bg-gray-300 text-gray-500 cursor-not-allowed"}`}
        >
          Get Started
        </button>
      </div>
    </div>
  );
}  

export default Signup;