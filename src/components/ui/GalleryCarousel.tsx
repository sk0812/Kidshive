"use client";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import Image from "next/image";
import Autoplay from "embla-carousel-autoplay";
import { useRef } from "react";

const images = [
  {
    src: "https://images.pexels.com/photos/8613089/pexels-photo-8613089.jpeg",
    alt: "Children playing with building blocks",
    title: "Early Learning",
  },
  {
    src: "https://images.pexels.com/photos/8612921/pexels-photo-8612921.jpeg",
    alt: "Kids in art class",
    title: "Creative Arts",
  },
  {
    src: "https://images.pexels.com/photos/8613335/pexels-photo-8613335.jpeg",
    alt: "Children reading together",
    title: "Reading Time",
  },
  {
    src: "https://images.pexels.com/photos/8612927/pexels-photo-8612927.jpeg",
    alt: "Outdoor playtime",
    title: "Outdoor Play",
  },
  {
    src: "https://images.pexels.com/photos/8612965/pexels-photo-8612965.jpeg",
    alt: "Learning activities",
    title: "Active Learning",
  },
  {
    src: "https://images.pexels.com/photos/8613165/pexels-photo-8613165.jpeg",
    alt: "Creative play time",
    title: "Creative Play",
  },
];

export function GalleryCarousel() {
  const plugin = useRef(
    Autoplay({
      delay: 1200,
      stopOnInteraction: false,
      stopOnMouseEnter: true,
      stopOnLastSnap: false,
    })
  );

  return (
    <Carousel
      opts={{
        align: "start",
        loop: true,
      }}
      plugins={[plugin.current]}
      className="w-full"
    >
      <CarouselContent className="-ml-4">
        {images.map((image, index) => (
          <CarouselItem key={index} className="pl-4 basis-1/4">
            <div className="relative group aspect-square overflow-hidden rounded-lg">
              <Image
                src={image.src}
                alt={image.alt}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-110"
                sizes="(max-width: 768px) 50vw, 25vw"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center space-y-2">
                <h3 className="text-white text-xl font-bold px-4 text-center">
                  {image.title}
                </h3>
                <p className="text-white/80 text-sm px-4 text-center">
                  {image.alt}
                </p>
              </div>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  );
}
