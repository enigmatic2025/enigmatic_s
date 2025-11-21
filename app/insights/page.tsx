"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Calendar, User } from "lucide-react";
import { CTASection } from "@/components/layout/cta-section";
import { insightPosts } from "@/lib/insights-data";

export default function InsightsPage() {
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
            <span className="text-foreground">Insights. </span>
            <span className="text-muted-foreground">
              Thoughts on logistics, technology, and the future of supply chain
              management.
            </span>
          </motion.h1>
        </div>
      </section>

      {/* Featured Articles */}
      <section className="container mx-auto px-4 md:px-6 py-12">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-2xl md:text-4xl font-normal tracking-tight mb-8 md:mb-12"
        >
          Featured Articles
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {insightPosts.map((post, index) => (
            <motion.div
              key={post.slug}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group flex flex-col h-full bg-muted/30 border border-border rounded-3xl overflow-hidden transition-colors"
            >
              {/* Image or Placeholder */}
              <div className="h-48 w-full relative overflow-hidden">
                {post.image ? (
                  <Image
                    src={post.image}
                    alt={post.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="h-full w-full bg-linear-to-br from-muted to-muted/50 group-hover:from-primary/5 group-hover:to-primary/10 transition-colors relative">
                    <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/20 font-bold text-6xl select-none">
                      Enigmatic
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-col grow p-6 md:p-8">
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                  <span className="px-3 py-1 rounded-full bg-primary/10 text-primary font-medium text-xs">
                    {post.category}
                  </span>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {post.date}
                  </div>
                </div>

                <h2 className="text-2xl font-medium mb-3 group-hover:text-primary transition-colors">
                  {post.title}
                </h2>

                <p className="text-base text-secondary-foreground leading-relaxed mb-6 grow">
                  {post.excerpt}
                </p>

                <div className="flex items-center justify-between mt-auto pt-6 border-t border-border/50">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <User className="w-4 h-4" />
                    {post.author}
                  </div>
                  <Link
                    href={`/insights/articles/${post.slug}`}
                    className="flex items-center gap-2 text-sm font-medium text-primary hover:translate-x-1 transition-transform"
                  >
                    Read Article
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* All Content */}
      <section className="container mx-auto px-4 md:px-6 pt-12 pb-20">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-2xl font-normal mb-8"
        >
          All Content
        </motion.h2>
        <div className="flex flex-col">
          {insightPosts.map((post, index) => (
            <motion.div
              key={`${post.slug}-row`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Link
                href={`/insights/articles/${post.slug}`}
                className="group flex flex-col md:flex-row md:items-center justify-between gap-4 py-6 border-b border-border transition-colors"
              >
                <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-8 grow">
                  <div className="text-sm text-muted-foreground w-32 shrink-0">
                    {post.date}
                  </div>
                  <div className="font-medium text-lg group-hover:text-primary transition-colors">
                    {post.title}
                  </div>
                </div>

                <div className="flex items-center gap-4 md:gap-8 shrink-0">
                  <span className="px-3 py-1 rounded-full bg-primary/10 text-primary font-medium text-xs whitespace-nowrap">
                    {post.category}
                  </span>
                  <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>
    </main>
  );
}
