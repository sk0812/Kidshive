"use client";

import Image from "next/image";

const masonryImages = [
  {
    src: "https://images.pexels.com/photos/207891/pexels-photo-207891.jpeg",
    alt: "Child drawing",
    className: "row-span-2 col-span-2",
  },
  {
    src: "https://images.pexels.com/photos/1001914/pexels-photo-1001914.jpeg",
    alt: "Children playing with blocks",
    className: "col-span-2",
  },
  {
    src: "https://images.pexels.com/photos/296301/pexels-photo-296301.jpeg",
    alt: "Outdoor activities",
    className: "row-span-2",
  },
  {
    src: "https://images.pexels.com/photos/1148998/pexels-photo-1148998.jpeg",
    alt: "Reading time",
  },
  {
    src: "https://images.pexels.com/photos/8612930/pexels-photo-8612930.jpeg",
    alt: "Arts and crafts",
    className: "row-span-2",
  },
  {
    src: "https://images.pexels.com/photos/8613167/pexels-photo-8613167.jpeg",
    alt: "Learning together",
    className: "col-span-2",
  },
  {
    src: "https://images.pexels.com/photos/8613167/pexels-photo-8613167.jpeg",
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