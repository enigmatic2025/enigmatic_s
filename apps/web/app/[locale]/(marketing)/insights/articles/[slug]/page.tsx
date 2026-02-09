"use client";

import { motion } from "framer-motion";
import { Link } from "@/navigation";
import Image from "next/image";
import { ArrowLeft, Calendar, Clock, User } from "lucide-react";
import { notFound, useParams } from "next/navigation";
import { insightPosts } from "@/lib/insights-data";
import { CTASection } from "@/components/layout/cta-section";

export default function InsightPostPage() {
  const params = useParams();
  const slug = params.slug as string;
  const post = insightPosts.find((p) => p.slug === slug);

  if (!post) {
    return notFound();
  }

  return (
    <main className="flex min-h-screen flex-col">
      {/* Banner Section */}
      <section className="relative w-full h-[60vh] min-h-[500px] flex flex-col justify-end">
        {/* Background Image */}
        {post.image ? (
          <>
            <Image
              src={post.image}
              alt={post.title}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-black/60" />
          </>
        ) : (
          <div className="absolute inset-0 bg-slate-900" />
        )}

        {/* Back Button */}
        <div className="absolute top-8 left-0 w-full z-20">
          <div className="container mx-auto px-4 md:px-6">
            <Link
              href="/insights"
              className="inline-flex items-center gap-2 text-sm text-white/80 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Insights
            </Link>
          </div>
        </div>

        {/* Content Overlay */}
        <div className="container mx-auto px-4 md:px-6 relative z-10 pb-12 md:pb-20">
          <div className="max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex items-center gap-4 text-sm text-white/80 mb-6"
            >
              <span className="px-3 py-1 rounded-full bg-white/20 text-white backdrop-blur-sm font-medium text-xs">
                {post.category}
              </span>
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {post.date}
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {post.readTime}
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-3xl md:text-5xl lg:text-6xl font-light tracking-tight mb-8 text-left text-white"
            >
              {post.title}
            </motion.h1>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col text-white">
                <span className="text-sm font-medium">{post.author}</span>
                <span className="text-xs text-white/80">Author</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="container mx-auto px-4 md:px-6 py-12 md:py-20">
        <motion.article
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="max-w-3xl mx-auto prose prose-lg dark:prose-invert prose-headings:font-light prose-headings:tracking-tight prose-p:text-muted-foreground prose-p:leading-relaxed"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </section>
    </main>
  );
}
