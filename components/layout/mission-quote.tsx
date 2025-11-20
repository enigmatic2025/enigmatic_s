"use client";

import { motion } from "framer-motion";

export function MissionQuote() {
  return (
    <section className="relative w-full min-h-screen flex items-center justify-center px-4 md:px-6 py-12">
      <div className="w-full max-w-[95%]">
        <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-border shadow-2xl">
          {/* Self-hosted Video Background */}
          <video
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            className="absolute inset-0 w-full h-full object-cover"
          >
            <source src="/videos/truck_video.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>

          {/* Dark gradient overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

          {/* Text Overlay - Bottom Left */}
          <div className="absolute bottom-0 left-0 p-8 md:p-12 lg:p-16 max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="text-xl md:text-2xl lg:text-3xl font-normal leading-relaxed text-white">
                At Enigmatic, we’re modernizing logistics technology to put
                people back in control of the tools that run their day-to-day
                operations.
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
