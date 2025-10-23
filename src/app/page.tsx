"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowRight, Sparkles } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function LandingPage() {
  const [isVisible, setIsVisible] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleLogin = () => {
    router.push("/auth/sign-in");
  };

  if (!isVisible) return null;

  return (
    <div className="h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white overflow-hidden">
      {/* Background Glow Orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-600 rounded-full blur-3xl opacity-20"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-600 rounded-full blur-3xl opacity-20"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600 rounded-full blur-3xl opacity-10"></div>
      </div>

      <header className="relative z-10 container mx-auto px-6 py-4 flex justify-between items-center">
        <div className="text-2xl font-bold text-cyan-400 tracking-tight">
          VConnect
        </div>
      </header>

      <main className="relative z-10 flex flex-col-reverse md:flex-row items-center justify-around  md:justify-around h-[calc(100vh-100px)] px-6 md:px-20">
        {/* Image Section */}
        <div className="flex justify-end md:justify-end mb-10 md:mb-0">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-rose-400 to-indigo-400 rounded-full blur-2xl opacity-40 animate-pulse"></div>
            <div className="relative rounded-full overflow-hidden shadow-2xl border-4 border-cyan-400/60 p-8">
              <Image
                src="/Vconnect.png"
                alt="App Logo"
                width={400}
                height={400}
                className="rounded-full"
                priority
              />
            </div>
          </div>
        </div>

        {/* Text Section */}
        <section
          className={`transition-all duration-1000 flex flex-col gap-y-6 max-w-xl text-center md:text-left ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          <h1 className="text-4xl md:text-6xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 to-indigo-200 leading-tight">
            Let's Collaborate
            <span className="block">with the World</span>
          </h1>

          <p className="text-lg text-gray-300 leading-relaxed">
            VConnect is a next-gen platform for communities, friends, and teams
            to connect, share, and hang out in a seamless, secure environment.
          </p>

          {/* Feature List */}
          <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm text-gray-400">
            {[
              "Rich Messaging",
              "Video Calls",
              "Voice Channels",
              "Community Servers",
            ].map((item) => (
              <div key={item} className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span>{item}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-center md:justify-start mt-6">
            <Button
              className=" cursor-pointer bg-gradient-to-r from-[#3ac1cf] to-[#2d9da8] hover:from-[#2da8b5] hover:to-[#238892] text-white px-8 sm:px-10 py-4 rounded-full font-semibold text-lg transition-all duration-300"
              onClick={handleLogin}
            >
              <span className="relative flex items-center gap-2">
                <Sparkles className="w-5 h-5 animate-pulse" />
                Start Your Journey
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </Button>
          </div>
        </section>
      </main>
    </div>
  );
}
