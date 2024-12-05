"use client";

import {
  Brain,
  HeartHandshake,
  Palette,
  ShieldCheck,
  Users,
  Apple,
} from "lucide-react";
import { Card } from "@/components/ui/Card";

const services = [
  {
    title: "Early Learning Programs",
    description:
      "Age-appropriate educational activities fostering cognitive development and curiosity",
    icon: Brain,
  },
  {
    title: "Creative Arts & Play",
    description:
      "Engaging artistic activities and structured playtime for emotional expression",
    icon: Palette,
  },
  {
    title: "Social Development",
    description:
      "Group activities and shared experiences to build social skills and friendships",
    icon: Users,
  },
  {
    title: "Emotional Support",
    description:
      "Nurturing environment with dedicated staff supporting emotional well-being",
    icon: HeartHandshake,
  },
  {
    title: "Safe Environment",
    description:
      "Secure, monitored facilities with strict health and safety protocols",
    icon: ShieldCheck,
  },
  {
    title: "Healthy Nutrition",
    description:
      "Balanced, nutritious meals and snacks promoting healthy eating habits",
    icon: Apple,
  },
];

export default function Services() {
  return (
    <section id="about" className="py-24 bg-slate-50">
      <div className="container px-4 md:px-6">
        <div className="text-center space-y-3 mb-16">
          <h2 className="text-3xl font-bold">Our Services</h2>
          <p className="text-muted-foreground text-lg">
            Comprehensive care for your child's development
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service) => (
            <Card
              key={service.title}
              title={service.title}
              description={service.description}
              icon={service.icon}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
