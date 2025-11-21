"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { CTASection } from "@/components/layout/cta-section";

const team = [
  {
    name: "Sam Tran",
    role: "Founding Partner | Vision",
    image: "/images/company/team/sam.jpg",
    description:
      "Sam shapes the strategic vision for Enigmatic’s identity, products, and services, uniting top-tier talent to fundamentally reimagine the logistics technology ecosystem.",
    linkedin: "https://www.linkedin.com/in/htsam22/",
  },
  {
    name: "Chris Schmitt",
    role: "Founding Partner | Sales",
    image: "/images/company/team/chris.jpg",
    description:
      "Chris spearheads operations and strategic partnerships, focusing on scaling Enigmatic's market presence and delivering value to key industry stakeholders.",
    linkedin: "https://www.linkedin.com/in/chris-schmitt-92086442/",
  },
  {
    name: "Phi Tran",
    role: "Founding Partner | Technology",
    image: "/images/company/team/phi.jpg",
    description:
      "Phi architects Enigmatic's technical foundation, leading research and development to deliver cutting-edge, robust solutions that push the boundaries of logistics tech.",
    linkedin: "https://www.linkedin.com/in/phi-tran-m-s/",
  },
];

export default function AboutUsPage() {
  return (
    <main className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <section className="relative flex w-full flex-col justify-center overflow-hidden px-4 md:px-6 pt-32 pb-12 md:pt-40 md:pb-20">
        <div className="container mx-auto relative z-10 flex flex-col items-center text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-2xl md:text-4xl font-normal tracking-tight max-w-3xl leading-[1.15] text-left"
          >
            <span className="text-foreground">About Us. </span>
            <span className="text-muted-foreground">
              Building the future of logistics with intelligence and precision.
            </span>
          </motion.h1>
        </div>
      </section>

      {/* Team Section */}
      <section className="container mx-auto px-4 md:px-6 py-20">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-2xl md:text-4xl font-normal tracking-tight mb-8 md:mb-12"
        >
          Our Team
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          {team.map((member, index) => (
            <div key={index} className="flex flex-col space-y-4 group">
              <div className="relative w-full aspect-3/4 rounded-2xl overflow-hidden bg-muted">
                <Image
                  src={member.image}
                  alt={member.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xl font-medium text-foreground">
                      {member.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {member.role}
                    </p>
                  </div>
                  <a
                    href={member.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#0077b5] hover:text-[#0077b5]/80 transition-colors"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="w-5 h-5"
                    >
                      <path d="M20.5 2h-17A1.5 1.5 0 002 3.5v17A1.5 1.5 0 003.5 22h17a1.5 1.5 0 001.5-1.5v-17A1.5 1.5 0 0020.5 2zM8 19H5v-9h3zM6.5 8.25A1.75 1.75 0 118.3 6.5a1.78 1.78 0 01-1.8 1.75zM19 19h-3v-4.74c0-1.21-.43-2-1.52-2A1.6 1.6 0 0012.92 13.62a2.6 2.6 0 00-.1 1.13V19h-3s.04-6.9 0-8h3v1.23a3.2 3.2 0 012.8-1.5c2.1 0 3.6 1.3 3.6 4.2z" />
                    </svg>
                    <span className="sr-only">LinkedIn</span>
                  </a>
                </div>
                <p className="text-base text-secondary-foreground leading-relaxed">
                  {member.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Story Section */}
      <section className="w-full flex items-center justify-center py-20 px-4 md:px-6">
        <div className="w-full max-w-[95%] text-foreground rounded-3xl overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 w-full">
            <div className="mb-8 md:mb-10">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="text-2xl md:text-4xl font-normal tracking-tight max-w-5xl text-left leading-[1.15] mb-6"
              >
                Founded by Logistics Enthusiasts.
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-xl md:text-2xl text-muted-foreground max-w-3xl text-left font-light"
              >
                We are a team of logistics industry veterans with decades of
                hands-on experience optimizing supply chains. We combine this
                operational depth with serious engineering expertise to deliver
                strategic consulting and Nodal, our platform for standardizing
                and orchestrating business processes.
              </motion.p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <CTASection
        title="Join our journey"
        description="Interested in working with us or learning more about our platform?"
      />
    </main>
  );
}
