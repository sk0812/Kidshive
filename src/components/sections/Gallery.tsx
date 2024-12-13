"use client";

import { GalleryCarousel } from "@/components/ui/GalleryCarousel";
import { MasonryGallery } from "@/components/ui/MasonryGallery";
import Image from "next/image";

export default function Gallery() {
  return (
    <section className="py-24 bg-white overflow-hidden">
      <div className="container px-4 md:px-6">
        <div className="text-center space-y-3 mb-16">
          <h2 className="text-3xl font-bold">Our Gallery</h2>
          <p className="text-muted-foreground text-lg">
            Capturing moments of joy and learning
          </p>
        </div>

        <GalleryCarousel />
        <MasonryGallery />
      </div>
    </section>
  );
}
