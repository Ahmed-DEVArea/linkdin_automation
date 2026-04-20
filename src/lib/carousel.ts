// ============================================
// Carousel Service — Generate & Render Carousels
// ============================================

import { callLLM, extractJSON } from './llm';
import { CAROUSEL_GENERATION_PROMPT } from './prompts';
import type { CarouselData, CarouselSlide, LLMProvider } from '@/types';

export async function generateCarousel(
  topic: string,
  content: string,
  slideCount: number = 8,
  provider: LLMProvider = 'claude',
  apiKey?: string
): Promise<CarouselData> {
  const prompt = CAROUSEL_GENERATION_PROMPT
    .replace('{topic}', topic)
    .replace('{content}', content)
    .replace(/\{slideCount\}/g, String(slideCount));

  const response = await callLLM({
    provider,
    prompt,
    systemPrompt:
      'You are a carousel content designer. Return ONLY valid JSON.',
    temperature: 0.6,
    apiKey,
  });

  const data = extractJSON<{ title: string; slides: CarouselSlide[] }>(response);

  const htmlContent = generateCarouselHTML(data.title, data.slides);

  return {
    title: data.title,
    slides: data.slides,
    htmlContent,
  };
}

export function generateCarouselHTML(
  title: string,
  slides: CarouselSlide[]
): string {
  const slideHTML = slides
    .map((slide, index) => {
      const isFirst = index === 0;
      const isLast = index === slides.length - 1;

      return `
      <div class="slide" style="
        width: 1080px;
        height: 1080px;
        background: ${isFirst ? 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%)' : isLast ? 'linear-gradient(135deg, #1a1a2e 0%, #0a0a0a 100%)' : '#0f0f0f'};
        color: white;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        padding: 80px;
        box-sizing: border-box;
        font-family: 'Inter', 'Segoe UI', -apple-system, sans-serif;
        page-break-after: always;
        position: relative;
      ">
        ${isFirst ? `
          <div style="
            position: absolute;
            top: 60px;
            left: 80px;
            font-size: 16px;
            color: #666;
            letter-spacing: 3px;
            text-transform: uppercase;
          ">ADIT</div>
        ` : ''}
        
        <h2 style="
          font-size: ${isFirst ? '56px' : isLast ? '48px' : '44px'};
          font-weight: 700;
          line-height: 1.2;
          margin-bottom: ${isFirst ? '32px' : '40px'};
          text-align: center;
          max-width: 900px;
          ${isFirst ? 'background: linear-gradient(135deg, #fff 0%, #a0a0ff 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent;' : ''}
        ">${slide.headline}</h2>
        
        <p style="
          font-size: ${isFirst ? '24px' : '22px'};
          line-height: 1.6;
          color: #b0b0b0;
          text-align: center;
          max-width: 800px;
          margin: 0;
        ">${slide.body}</p>
        
        ${slide.footer ? `
          <p style="
            position: absolute;
            bottom: 60px;
            font-size: 16px;
            color: #555;
            text-align: center;
          ">${slide.footer}</p>
        ` : ''}
        
        ${!isFirst && !isLast ? `
          <div style="
            position: absolute;
            bottom: 60px;
            right: 80px;
            font-size: 18px;
            color: #444;
          ">${slide.slideNumber} / ${slides.length}</div>
        ` : ''}
      </div>`;
    })
    .join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
    
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: #000; }
    
    @media print {
      .slide {
        page-break-after: always;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
    }
  </style>
</head>
<body>
  ${slideHTML}
</body>
</html>`;
}
