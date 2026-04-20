// ============================================
// Mock Data — Demo mode for UI testing
// Returns realistic data without needing API keys
// Matches Adit's voice: raw, human, anti-AI, practical
// Structure: Hook → Story/Problem → Solution → CTA
// ============================================

import type { ContentIdea, LinkedInPost, CarouselData } from '@/types';

export function getMockIdeas(topic: string): ContentIdea[] {
  return [
    {
      id: '1',
      title: `The uncomfortable truth about ${topic}`,
      description: `A raw, personal take on how ${topic} is changing the game — and why most people are thinking about it wrong.`,
      angle: 'contrarian',
      hook: `97% of people get ${topic} wrong.\n\nI was one of them until 8 months ago.`,
    },
    {
      id: '2',
      title: `I spent 6 months studying ${topic}. Here's what nobody told me.`,
      description: `Deep-dive insights from real experience — practical lessons most content skips over.`,
      angle: 'personal experience',
      hook: `6 months. 47 conversations. 1 painful truth about ${topic}.\n\nNobody warned me about this.`,
    },
    {
      id: '3',
      title: `${topic} is broken. Here's what actually works.`,
      description: `Cutting through the noise with actionable truths about ${topic} that most "gurus" won't share.`,
      angle: 'problem-solution',
      hook: `I watched 3 businesses fail at ${topic} this year.\n\nAll 3 made the same mistake.`,
    },
    {
      id: '4',
      title: `Why ${topic} will look completely different in 2 years`,
      description: `A forward-looking analysis of where ${topic} is headed — based on patterns most people miss.`,
      angle: 'future prediction',
      hook: `In 18 months, half the people doing ${topic} will be irrelevant.\n\nNot because they're bad at it.`,
    },
    {
      id: '5',
      title: `My $12,000 mistake with ${topic}`,
      description: `A vulnerable story about a real financial loss, what went wrong, and the lesson that made it worth it.`,
      angle: 'vulnerability / story',
      hook: `I lost $12,000 on a single ${topic} decision.\n\nWorst part? I saw it coming.`,
    },
  ];
}

export function getMockPost(idea: ContentIdea): LinkedInPost {
  const posts: Record<string, string> = {
    contrarian: `97% of people get ${idea.title.replace('The uncomfortable truth about ', '')} wrong.\n\nI was one of them until 8 months ago.\n\nI was doing everything the "experts" told me to.\nFollowing the playbook.\nCopying what worked for others.\n\nResults? Nothing.\n\nThen I talked to someone who actually built a business around this.\nNot a guru. Not a course seller.\nA person doing the work, quietly, profitably.\n\nThey told me one thing:\n\n"Stop optimizing. Start listening."\n\nSo I did.\n\nI stopped posting what I thought people wanted.\nStarted sharing what was actually on my mind.\n\nEngagement tripled in 6 weeks.\nNot because I found a hack.\nBecause I stopped pretending.\n\nThe gap between what people teach\nand what actually works is massive.\n\nDrop a "real" if you've felt this too.`,

    'personal experience': `6 months. 47 conversations. 1 painful truth.\n\nNobody warned me about this.\n\nWhen I started digging into this topic,\nI expected to find clear answers.\n\nI found confusion instead.\n\nMonth 1, I was reading everything.\nMonth 2, nothing made sense together.\nMonth 3, I almost dropped it.\n\nThen during a call with a client in Parramatta,\nthey said something that rewired my thinking.\n\n"We don't need more information.\nWe need someone who's done it to just show us."\n\nThat hit different.\n\nI stopped researching.\nStarted documenting what I was actually doing.\nShared it raw, unpolished, week by week.\n\nThe response was wild.\nPeople didn't want perfect.\nThey wanted proof it was happening in real time.\n\nSometimes the best content strategy\nis just telling the truth about the process.\n\nWhat's something you learned the hard way this year?`,

    'problem-solution': `I watched 3 businesses fail at this in the last year.\n\nAll 3 made the same mistake.\n\nThey spent thousands on strategy.\nHired the right people.\nHad the budget.\n\nBut they skipped the one thing that matters.\n\nActually talking to their audience.\n\nNot surveys. Not analytics dashboards.\nReal conversations with real people.\n\nOne of them was a mortgage broker in Sydney.\nSpent $8K on ads, got zero leads.\n\nWe sat down, called 15 past clients.\nAsked one question: "Why did you choose us?"\n\nThe answer? It wasn't the rates.\nIt was a Google review from 2023.\n\nChanged the entire strategy in one afternoon.\n\nStop guessing what your audience wants.\nGo ask them.\n\nTag someone who needs to hear this.`,

    'future prediction': `In 18 months, half the people doing this will be irrelevant.\n\nNot because they're bad at it.\n\nBecause they won't adapt.\n\nI've worked with 50+ businesses over the last 3 years.\nThe pattern is always the same.\n\nWhen things are working, nobody wants to change.\nWhen things stop working, it's already too late.\n\nWhat's shifting right now:\n\nGeneric content is dying.\nPersonal brands are replacing company pages.\nAI is making average content free — which means\nonly specific, experience-based content survives.\n\nThe businesses I see winning in 2028:\n\nThey're building trust now.\nSharing real numbers.\nShowing process, not just results.\n\nThe ones who treat content as an afterthought?\nThey'll wonder what happened.\n\nAre you building for now or for what's coming?`,

    'vulnerability / story': `I lost $12,000 on a single bad decision.\n\nWorst part? I saw it coming.\n\nBack in 2023, a brand offered me a deal.\nGood money. Easy work. Quick turnaround.\n\nEverything about it felt off.\nThe brief was vague.\nThe owner kept changing scope.\n\nBut I needed the cash.\nI was juggling uni fees — $110K total —\nworking weekends, driving trucks between shoots.\n\nSo I said yes.\n\nThree weeks in, they ghosted.\nNo payment. No response. Nothing.\n\n$12K in production costs. Out of my pocket.\n\nI sat in my car outside the office for 20 minutes.\nJust staring at the steering wheel.\n\nBut that moment taught me something\nI couldn't learn from any course.\n\nNever trade your instinct for quick money.\n\nIf it feels wrong, it is wrong.\nEvery time.\n\nHave you ever ignored your gut and regretted it?`,
  };

  const content = posts[idea.angle] || posts['contrarian'];

  return {
    id: crypto.randomUUID(),
    topic: idea.title,
    content: content!,
    hook: content!.split('\n')[0] || idea.hook,
    status: 'generated',
    createdAt: new Date().toISOString(),
  };
}

export function getMockCarousel(topic: string, content: string): CarouselData {
  const keyPoints = content
    .split('\n')
    .filter((line) => line.trim().length > 15 && !line.startsWith('—'))
    .slice(0, 6);

  const slides: CarouselData['slides'] = [
    {
      slideNumber: 1,
      headline: topic.length > 60 ? topic.substring(0, 60) + '...' : topic,
      body: 'Swipe to learn what nobody talks about →',
      footer: 'ADIT',
    },
    {
      slideNumber: 2,
      headline: 'The Real Problem',
      body:
        keyPoints[0] ||
        "Most people approach this the wrong way. They focus on tactics instead of understanding the fundamentals.",
    },
    {
      slideNumber: 3,
      headline: 'What I Discovered',
      body:
        keyPoints[1] ||
        "After months of research and hands-on experience, the pattern became clear. It's simpler than we think.",
    },
    {
      slideNumber: 4,
      headline: 'The Shift',
      body:
        keyPoints[2] ||
        "The moment you stop chasing shortcuts and start building real foundations — everything changes.",
    },
    {
      slideNumber: 5,
      headline: 'The Framework',
      body:
        keyPoints[3] ||
        "Step 1: Question your assumptions. Step 2: Do the work nobody sees. Step 3: Stay consistent when it's hard.",
    },
    {
      slideNumber: 6,
      headline: 'Why This Matters',
      body:
        keyPoints[4] ||
        "In a world of noise, the people who win are the ones who go deep instead of wide.",
    },
    {
      slideNumber: 7,
      headline: 'The 1 Thing to Remember',
      body:
        keyPoints[5] ||
        "Progress isn't linear. It's messy, uncomfortable, and completely worth it.",
    },
    {
      slideNumber: 8,
      headline: 'Follow for more →',
      body: "If this resonated, follow me for more insights on what actually works. No fluff. Just real talk.",
      footer: '@ADIT | Bloom Dots',
    },
  ];

  return {
    title: topic,
    slides,
    htmlContent: generateMockCarouselHTML(topic, slides),
  };
}

function generateMockCarouselHTML(
  title: string,
  slides: CarouselData['slides']
): string {
  const slideHTML = slides
    .map(
      (slide, i) => `
    <div class="slide" style="
      width: 1080px; height: 1080px;
      display: flex; flex-direction: column;
      align-items: center; justify-content: center;
      background: ${i === 0 ? 'linear-gradient(135deg, #0a0a0a, #1a1a2e)' : i === slides.length - 1 ? 'linear-gradient(135deg, #1a1a2e, #0a0a0a)' : '#0f0f0f'};
      color: white; font-family: 'Inter', sans-serif;
      padding: 80px; text-align: center;
      page-break-after: always; position: relative;
    ">
      ${i === 0 ? '<span style="position:absolute;top:40px;left:60px;font-size:14px;color:#666;letter-spacing:4px;">ADIT</span>' : ''}
      <h2 style="font-size: ${i === 0 ? '48px' : '40px'}; font-weight: 700; margin-bottom: 24px; line-height: 1.2;">
        ${slide.headline}
      </h2>
      <p style="font-size: 20px; color: #888; line-height: 1.6; max-width: 800px;">
        ${slide.body}
      </p>
      ${slide.footer ? `<span style="position:absolute;bottom:40px;font-size:14px;color:#555;">${slide.footer}</span>` : ''}
      ${i > 0 && i < slides.length - 1 ? `<span style="position:absolute;bottom:40px;right:60px;font-size:14px;color:#444;">${slide.slideNumber} / ${slides.length}</span>` : ''}
    </div>`
    )
    .join('\n');

  return `<!DOCTYPE html>
<html><head>
<meta charset="utf-8">
<title>${title} — Carousel</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
</head><body style="margin:0;padding:0;background:#000;">
${slideHTML}
</body></html>`;
}
