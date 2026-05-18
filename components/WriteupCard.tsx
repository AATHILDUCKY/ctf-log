'use client';

import { Calendar, ChevronRight, Clock3, Eye, User } from 'lucide-react';
import { motion } from 'motion/react';
import Link from 'next/link';
import { WriteupListItem } from '@/types';
import { writeupHref } from '@/lib/writeupRoutes';

interface WriteupCardProps {
  writeup: WriteupListItem;
}

export default function WriteupCard({ writeup }: WriteupCardProps) {
  return (
    <motion.div
      whileHover={{ x: 4 }}
      className="bg-dracula-bg border border-dracula-line rounded-xl overflow-hidden hover:border-dracula-purple hover:bg-dracula-selection/10 transition-all duration-300 group"
    >
      <Link href={writeupHref(writeup)} className="block flex flex-col md:flex-row md:items-center gap-4 p-4 md:p-5">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1">
            <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-dracula-selection text-dracula-cyan border border-dracula-line/50">
              {writeup.category}
            </span>
            {writeup.difficulty && (
              <span
                className={`text-[10px] font-bold uppercase tracking-wider ${
                  writeup.difficulty === 'Very Easy'
                    ? 'text-dracula-cyan'
                    : writeup.difficulty === 'Easy'
                      ? 'text-dracula-green'
                      : writeup.difficulty === 'Medium'
                        ? 'text-dracula-yellow'
                        : writeup.difficulty === 'Hard'
                          ? 'text-dracula-orange'
                          : 'text-dracula-red'
                }`}
              >
                {writeup.difficulty}
              </span>
            )}
          </div>

          <h3 className="text-lg font-bold text-dracula-fg group-hover:text-dracula-purple transition-colors truncate">{writeup.title}</h3>

          <p className="text-dracula-comment text-sm line-clamp-1 mt-1">{writeup.summary}</p>
        </div>

        <div className="flex items-center justify-between md:flex-col md:items-end gap-3 shrink-0">
          <div className="flex flex-wrap gap-1.5 md:justify-end">
            {writeup.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="text-[10px] uppercase font-bold text-dracula-line">
                #{tag}
              </span>
            ))}
          </div>

          <div className="flex items-center gap-3 text-[11px] text-dracula-comment whitespace-nowrap">
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {writeup.date}
            </div>
            <div className="flex items-center gap-1">
              <User className="w-3 h-3" />
              {writeup.author}
            </div>
            <div className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              {writeup.views ?? 0}
            </div>
            <div className="flex items-center gap-1">
              <Clock3 className="w-3 h-3" />
              {writeup.readingTimeMinutes ?? 1}m
            </div>
            <ChevronRight className="hidden md:block w-4 h-4 text-dracula-line group-hover:text-dracula-purple transition-all" />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
