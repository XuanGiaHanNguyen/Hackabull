import React, { useState } from "react";
import bg from "../../assets/bg/bg-4.png"
import { SeedGreenIcon } from "../../assets/icon";
import { Link } from "react-router-dom";

const Login = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [rememberMe, setRememberMe] = useState(false);

    const isFilled = username && password;

    const handleSubmit = (e) => {
        e.preventDefault();
        // Add your login logic here
        console.log({ username, password, rememberMe });
    };

    return (
        <div
            className="min-h-screen flex flex-row items-center justify-center relative overflow-hidden"
            style={{
                backgroundImage: `url(${bg})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
            }}
        >
            {/* left side: Login */}
            <div className="flex-1 bg-[#4d6b5a] h-screen flex flex-col justify-center items-center">
                <div className="h-full w-full p-10">
                    <div className="h-full w-full flex flex-col p-8">
                        <Link to="/" className="flex flex-row items-center mb-6">
                            <div className="flex flex-row px-4 py-2 rounded-xl bg-[#eae9e3]">
                                {SeedGreenIcon}
                                <h1 className="font-bold text-2xl text-[#4d6b5a] ml-2">GreenCart</h1>
                            </div>
                        </Link>

                        <h1 className="text-white font-bold text-3xl mb-6">
                            Log In
                        </h1>

                        <form onSubmit={handleSubmit} className="flex flex-col space-y-3 w-full max-w-md">
                            <div className="flex flex-col space-y-2">
                                <label htmlFor="username" className="text-white font-medium">
                                    Username
                                </label>
                                <input
                                    type="text"
                                    id="username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="border-2 border-white/30 bg-white/10 text-white p-3 rounded-md focus:border-white focus:outline-none placeholder-white/60"
                                    placeholder="Enter your username"
                                    required
                                />
                            </div>

                            <div className="flex flex-col space-y-2">
                                <label htmlFor="password" className="text-gray-100 font-medium">
                                    Password
                                </label>
                                <input
                                    type="password"
                                    id="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="border-2 border-white/30 bg-white/10 text-white p-3 rounded-md focus:border-white focus:outline-none placeholder-white/60"
                                    placeholder="Enter your password"
                                    required
                                />
                            </div>

                            <div className="flex justify-between items-center mt-2">
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        id="rememberMe"
                                        checked={rememberMe}
                                        onChange={(e) => setRememberMe(e.target.checked)}
                                        className="w-4 h-4 accent-white"
                                    />
                                    <label htmlFor="rememberMe" className="text-white text-sm">
                                        Remember me
                                    </label>
                                </div>
                                <Link to="/forgot-password" className="text-white text-sm font-medium hover:underline">
                                    Forgot password?
                                </Link>
                            </div>

                            <button
                                type="submit"
                                disabled={!isFilled}
                                className={`py-3 px-6 rounded-md font-medium mt-4 ${
                                    isFilled ? "bg-white text-[#4d6b5a] hover:bg-gray-100" : "bg-gray-400 text-gray-700 cursor-not-allowed"
                                }`}
                            >
                                Log In
                            </button>

                            <div className="mt-6 text-center">
                                <span className="text-white/80">Don't have an account?</span>{" "}
                                <Link to="/signup" className="text-white font-medium hover:underline">
                                    Sign up
                                </Link>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            {/* right side bg photo (already have it done) */}
            <div className="flex-1 h-screen">
            </div>
        </div>
    );
};

export default Login;