'use client';

// ============================================
// CarouselPreview — Preview generated carousel slides
// ============================================

import { useState } from 'react';
import { ChevronLeft, ChevronRight, Download } from 'lucide-react';
import type { CarouselData } from '@/types';

interface CarouselPreviewProps {
  carousel: CarouselData;
}

export function CarouselPreview({ carousel }: CarouselPreviewProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slide = carousel.slides[currentSlide];
  if (!slide) return null;

  const isFirst = currentSlide === 0;
  const isLast = currentSlide === carousel.slides.length - 1;

  const handleDownloadHTML = () => {
    if (!carousel.htmlContent) return;
    const blob = new Blob([carousel.htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${carousel.title.replace(/\s+/g, '_')}_carousel.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
        <span className="text-xs text-zinc-600 uppercase tracking-wider">
          Carousel — {currentSlide + 1} / {carousel.slides.length}
        </span>
        <button
          onClick={handleDownloadHTML}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-zinc-400 hover:text-white rounded-md hover:bg-zinc-800 transition-all"
        >
          <Download className="w-3.5 h-3.5" />
          HTML
        </button>
      </div>

      {/* Slide Preview */}
      <div className="relative">
        <div
          className={`aspect-square max-w-md mx-auto flex flex-col items-center justify-center p-10 text-center ${
            isFirst
              ? 'bg-gradient-to-br from-zinc-950 to-zinc-900'
              : isLast
              ? 'bg-gradient-to-br from-zinc-900 to-zinc-950'
              : 'bg-zinc-950'
          }`}
        >
          {isFirst && (
            <span className="absolute top-6 left-8 text-xs text-zinc-600 uppercase tracking-widest">
              ADIT
            </span>
          )}

          <h3
            className={`font-bold leading-tight mb-4 ${
              isFirst ? 'text-2xl text-white' : 'text-xl text-zinc-100'
            }`}
          >
            {slide.headline}
          </h3>
          <p className="text-sm text-zinc-500 leading-relaxed max-w-xs">
            {slide.body}
          </p>

          {slide.footer && (
            <p className="absolute bottom-6 text-xs text-zinc-700">
              {slide.footer}
            </p>
          )}

          {!isFirst && !isLast && (
            <span className="absolute bottom-6 right-8 text-xs text-zinc-700">
              {slide.slideNumber} / {carousel.slides.length}
            </span>
          )}
        </div>

        {/* Navigation */}
        <div className="absolute inset-y-0 left-0 flex items-center">
          <button
            onClick={() => setCurrentSlide(Math.max(0, currentSlide - 1))}
            disabled={currentSlide === 0}
            className="p-2 text-zinc-600 hover:text-white disabled:opacity-20 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        </div>
        <div className="absolute inset-y-0 right-0 flex items-center">
          <button
            onClick={() =>
              setCurrentSlide(
                Math.min(carousel.slides.length - 1, currentSlide + 1)
              )
            }
            disabled={currentSlide === carousel.slides.length - 1}
            className="p-2 text-zinc-600 hover:text-white disabled:opacity-20 transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Slide dots */}
      <div className="flex items-center justify-center gap-1.5 py-3 border-t border-zinc-800">
        {carousel.slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentSlide(i)}
            className={`w-2 h-2 rounded-full transition-all ${
              i === currentSlide ? 'bg-white' : 'bg-zinc-700'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
