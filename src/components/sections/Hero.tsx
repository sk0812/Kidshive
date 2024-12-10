"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

export default function Hero() {
  return (
    <section id="home" className="relative h-[calc(100vh-4rem)] min-h-[600px]">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src="/hero-image.jpeg"
          alt="Nursery hero image"
          fill
          className="object-cover"
          priority
          quality={100}
        />
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/60" />
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex items-center justify-center">
        <div className="text-center text-white space-y-8 max-w-4xl px-4">
          <h1 className="text-5xl md:text-7xl font-bold leading-tight">
            Where Little <span className="text-primary">Dreams</span> Take{" "}
            <span className="text-primary">Flight</span>
          </h1>
          <p className="text-xl md:text-2xl text-white/90 max-w-2xl mx-auto">
            Creating a nurturing environment where every child's potential
            blooms
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
            <Button
              size="lg"
              className="text-lg h-12 px-8 bg-primary hover:bg-primary/90"
              asChild
            >
              <Link href="#contact">Start Their Journey</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-lg h-12 px-8 bg-white/10 backdrop-blur-sm border-white text-white hover:bg-white/20 hover:text-white/80"
              asChild
            >
              <Link href="#about">Discover More</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
