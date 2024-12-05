"use client";

import { ContactForm } from "@/components/ui/ContactForm";
import { ContactInfo } from "@/components/ui/ContactInfo";
import { Map } from "@/components/ui/Map";

export default function Contact() {
  return (
    <section id="contact" className="py-24 bg-slate-50">
      <div className="container px-4 md:px-6">
        <div className="text-center space-y-3 mb-16">
          <h2 className="text-3xl font-bold">Get in Touch</h2>
          <p className="text-muted-foreground text-lg">
            We'd love to hear from you
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          <ContactForm />
          <div className="space-y-8">
            <Map />
            <ContactInfo />
          </div>
        </div>
      </div>
    </section>
  );
}
