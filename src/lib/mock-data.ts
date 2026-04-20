// ============================================
// Mock Data — Demo mode for UI testing
// Returns realistic data without needing API keys
// ============================================

import type { ContentIdea, LinkedInPost, CarouselData } from '@/types';

export function getMockIdeas(topic: string): ContentIdea[] {
  return [
    {
      id: '1',
      title: `The uncomfortable truth about ${topic}`,
      description: `A raw, personal take on how ${topic} is changing the game — and why most people are thinking about it wrong.`,
      angle: 'contrarian',
      hook: `Everyone's talking about ${topic}.\n\nBut nobody's saying what actually needs to be said.`,
    },
    {
      id: '2',
      title: `I spent 6 months studying ${topic}. Here's what I learned.`,
      description: `Deep-dive insights from real experience — practical lessons most content skips over.`,
      angle: 'personal experience',
      hook: `6 months ago, I thought I understood ${topic}.\n\nI was wrong. Here's what changed.`,
    },
    {
      id: '3',
      title: `${topic}: The 5 things nobody tells you`,
      description: `Cutting through the noise with actionable truths about ${topic} that most "gurus" won't share.`,
      angle: 'listicle / myth-busting',
      hook: `Everyone has opinions about ${topic}.\n\nBut here are the 5 things that actually matter:`,
    },
    {
      id: '4',
      title: `Why ${topic} will look completely different in 2 years`,
      description: `A forward-looking analysis of where ${topic} is headed — based on patterns most people miss.`,
      angle: 'future prediction',
      hook: `Mark my words.\n\nIn 2 years, ${topic} won't look anything like it does today.\n\nHere's why:`,
    },
    {
      id: '5',
      title: `My biggest mistake with ${topic} (and what it taught me)`,
      description: `A vulnerable story about failing, learning, and coming back stronger — relatable and authentic.`,
      angle: 'vulnerability / story',
      hook: `I need to tell you about my biggest failure.\n\nIt involves ${topic}.\nAnd it changed everything.`,
    },
  ];
}

export function getMockPost(idea: ContentIdea): LinkedInPost {
  const posts: Record<string, string> = {
    contrarian: `Everyone's talking about ${idea.title.replace('The uncomfortable truth about ', '')}.\n\nBut nobody's saying what actually needs to be said.\n\nHere's the thing:\n\nThe people who are loudest about this topic?\nThey've never actually done the work.\n\nI've been in the trenches.\nI've seen what happens behind the scenes.\n\nAnd I can tell you —\nThe real story is very different from the narrative.\n\n3 things I've learned:\n\n1. It's not about having all the answers.\nIt's about asking better questions.\n\n2. The "overnight success" stories?\nYears of invisible work.\n\n3. The biggest breakthroughs come from\nthe moments that feel like failures.\n\nStop consuming content about this.\nStart doing the work.\n\nThe gap between knowing and doing\nis where everything happens.\n\n—\n\nAgree? Disagree?\nI'd love to hear your take. 👇`,

    'personal experience': `6 months ago, I thought I understood this topic.\n\nI was dead wrong.\n\nHere's what 6 months of deep work taught me:\n\nMonth 1: Excitement.\nEverything felt possible.\nI was reading, studying, consuming.\n\nMonth 2: Confusion.\nThe more I learned, the less I knew.\nContradictions everywhere.\n\nMonth 3: Frustration.\nNothing was working the way "they" said it would.\nI almost quit.\n\nMonth 4: Breakthrough.\nOne conversation changed everything.\nA mentor said: "Stop trying to be right. Start trying to be useful."\n\nMonth 5: Clarity.\nI stripped away everything that didn't matter.\nFocused on the 20% that drove 80% of results.\n\nMonth 6: Results.\nNot overnight. Not viral.\nBut real, compounding, sustainable progress.\n\nThe lesson?\n\nEveryone wants the Month 6 results.\nNobody wants the Month 3 frustration.\n\nBut you don't get one without the other.\n\n—\n\nWhat's your Month 3 moment? Share below. 👇`,

    'listicle / myth-busting': `Here are 5 things nobody tells you:\n\n1. It's harder than it looks.\n\nThe people making it look easy?\nThey're not showing you the 100 failed attempts.\nThe late nights. The self-doubt.\n\n2. There is no "right time."\n\nYou'll never feel ready.\nThe best time to start was yesterday.\nThe second best time is now.\n\n3. Consistency beats talent.\n\nEvery. Single. Time.\n\nI've watched talented people quit\nwhile consistent people won.\n\n4. Your network matters more than your knowledge.\n\nYou are the average of the 5 people\nyou spend the most time with.\nChoose wisely.\n\n5. Failure is the curriculum.\n\nNot the obstacle.\nNot the enemy.\nThe actual path.\n\nEvery successful person I know\nhas a graveyard of failed attempts.\n\nThe difference?\nThey treated each one as a lesson,\nnot a verdict.\n\n—\n\nWhich one hit hardest? Let me know. 👇`,

    'future prediction': `Mark my words.\n\nIn 2 years, this landscape won't look anything like it does today.\n\nHere's why:\n\nThe current approach is broken.\n\nWe're optimizing for metrics that don't matter.\nWe're building systems that don't scale.\nWe're following playbooks that are already outdated.\n\nWhat's coming next:\n\n→ Personalization will replace mass approaches\n→ Quality will beat quantity (finally)\n→ Human connection will become the ultimate differentiator\n→ The "experts" who can't adapt will become irrelevant\n\nThe companies that survive?\n\nThey'll be the ones that:\n• Started adapting 6 months ago\n• Built real relationships, not just transactions\n• Invested in people, not just technology\n\nThe question isn't IF things will change.\n\nIt's whether you'll be ready when they do.\n\n—\n\nAre you preparing for what's next?\nOr still playing yesterday's game? 👇`,

    'vulnerability / story': `I need to tell you about my biggest failure.\n\nIt's not something I talk about often.\n\nBut I think it's important.\n\n3 years ago, I had everything figured out.\nOr so I thought.\n\nI had the plan.\nThe strategy.\nThe confidence.\n\nAnd then it all fell apart.\n\nNot slowly. Not gradually.\nOvernight.\n\nI remember sitting in my car,\nstaring at the dashboard,\nwondering what went wrong.\n\nThe answer?\nEverything.\n\nI was so focused on the destination\nthat I forgot to check the map.\n\nI was so busy being "right"\nthat I stopped listening.\n\nI was so afraid of looking weak\nthat I never asked for help.\n\nThat failure taught me 3 things:\n\n1. Vulnerability is not weakness.\nIt's the ultimate strength.\n\n2. Asking for help is not failure.\nIt's intelligence.\n\n3. The worst thing that can happen\nis rarely as bad as you imagine.\n\nToday, I'm grateful for that moment.\n\nBecause without it,\nI wouldn't be here writing this.\n\n—\n\nWhat failure shaped who you are today? 👇`,
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
