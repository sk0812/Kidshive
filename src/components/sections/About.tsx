"use client";

import { Container } from "@/components/ui/container";
import Image from "next/image";

export default function About() {
  return (
    <section id="about" className="py-16 bg-background">
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center">
          {/* Left Column - Text Content */}
          <div className="space-y-4 md:space-y-6 px-4 md:px-0">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              About Our Nursery
            </h2>
            <div className="space-y-3 md:space-y-4 text-muted-foreground text-sm md:text-base">
              <p>
                Welcome to our nurturing environment where every child's journey
                is valued and celebrated. With over 15 years of experience in
                early childhood education, we've created a space where learning
                meets play, and where every child can thrive.
              </p>
              <p>
                Our dedicated team of qualified educators is passionate about
                providing the highest quality care and education. We believe in
                creating an inclusive environment that supports each child's
                individual development while fostering creativity, curiosity,
                and confidence.
              </p>
              <p>
                Through our carefully crafted programs and activities, we ensure
                that every child receives the attention and support they need to
                grow and develop at their own pace. Our approach combines
                structured learning with free play, helping children develop
                essential life skills while having fun.
              </p>
            </div>
          </div>

          {/* Right Column - Image */}
          <div className="relative aspect-square w-full max-w-[500px] mx-auto lg:mx-0">
            <Image
              src="https://images.pexels.com/photos/8613070/pexels-photo-8613070.jpeg"
              alt="Children playing and learning"
              fill
              className="object-cover rounded-lg"
              sizes="(max-width: 768px) 90vw, (max-width: 1200px) 45vw, 500px"
              priority
            />
          </div>
        </div>
      </Container>
    </section>
  );
}
