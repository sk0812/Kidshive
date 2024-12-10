"use client";

import Image from "next/image";

const masonryImages = [
  {
    src: "/image-1.jpeg",
    alt: "Child drawing",
    className: "row-span-2 col-span-2",
  },
  {
    src: "/image-2.jpeg",
    alt: "Children playing with blocks",
    className: "col-span-2",
  },
  {
    src: "/image-3.jpeg",
    alt: "Outdoor activities",
    className: "row-span-2",
  },
  {
    src: "/image-4.jpeg",
    alt: "Reading time",
  },
  {
    src: "/image-5.jpeg",
    alt: "Arts and crafts",
    className: "row-span-2",
  },
  {
    src: "/image-6.jpeg",
    alt: "Learning together",
    className: "col-span-2",
  },
  {
    src: "/image-7.jpeg",
    alt: "Music and movement",
  },
];

export function MasonryGallery() {
  return (
    <div className="grid grid-cols-4 gap-4 mt-16">
      {masonryImages.map((image, index) => (
        <div
          key={index}
          className={`relative group overflow-hidden rounded-lg ${
            image.className || ""
          }`}
        >
          <div className="aspect-square w-full h-full relative">
            <Image
              src={image.src}
              alt={image.alt}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-110"
              sizes="(max-width: 768px) 50vw, 25vw"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
              <p className="text-white text-lg font-medium px-4 text-center">
                {image.alt}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
