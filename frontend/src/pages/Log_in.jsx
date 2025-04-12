import React, { useState } from "react";
import bg from "../assets/bg/loginBG.png";
import icon from "../../public/icon.png";

const Login = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const isFilled = username && password;

    return (
        <div
            className="min-h-screen flex flex-col items-center justify-center relative space-y-6 overflow-hidden"
            style={{
                backgroundImage: `url(${bg})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
        }}
        >
        
        {/* Blur Overlay */}
        <div className="absolute inset-0 backdrop-blur-lg bg-white/40 z-0" />

        {/* Icon and Hackabull */}
        <div className="relative z-10 flex items-center space-x-4">
            <img src={icon} alt="Hackabull Icon" className="w-12 h-12" />
            <span className="text-green-300 text-3xl font-semibold">Hackabull</span>
        </div>

        {/* Greeting Text */}
        <div className="relative z-10 text-5xl text-green-300 font-bold text-center">
            Good to see you again
        </div>

        {/* Login Box */}
        <div className="relative z-10 w-full max-w-md bg-white rounded-2xl shadow-xl p-8 flex flex-col items-center space-y-6">
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
                ${isFilled ? "bg-green-300 text-white hover:bg-green-400" : "bg-gray-300 text-gray-500 cursor-not-allowed"}`}
            >
            Enter
            </button>

            {/* Links */}
            <div className="w-full flex justify-between text-sm text-blue-500 underline mt-2 px-1">
                <div className="cursor-pointer">Create an account</div>
                <div className="cursor-pointer">Forget password?</div>
            </div>
        </div>
        </div>
    );
};

export default Login;