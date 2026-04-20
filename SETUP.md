# Content Engine — LinkedIn Post Automation

A minimal, production-ready web app that generates authentic LinkedIn posts, carousels, and images for personal branding.

Built for **Adit** (Bloom Dots).

---

## Features

| Feature | Description |
|---------|-------------|
| **Idea Generation** | Input a topic → get 5 content ideas with hooks & angles |
| **Post Generation** | Select an idea → get a raw, human-sounding LinkedIn post |
| **Carousel Generation** | Turn any post into a styled HTML carousel (ready for PDF) |
| **Image Generation** | Generate character-consistent images via Higgsfield Soul 2.0 |
| **Notion Storage** | Auto-save posts, carousels, and images to a Notion database |
| **Multi-LLM Support** | Switch between Claude (default) and GPT-4o |

---

## Tech Stack

- **Frontend**: Next.js 16, React 19, Tailwind CSS 4
- **State**: Zustand
- **AI**: Anthropic Claude API, OpenAI API
- **Images**: Higgsfield Soul 2.0 API
- **Storage**: Notion API
- **PDF**: HTML carousel export (print-to-PDF ready)

---

## Quick Start

### 1. Install dependencies

```bash
cd linkedin-automation
npm install
```

### 2. Configure environment

Copy `.env.example` to `.env.local` and add your API keys:

```bash
cp .env.example .env.local
```

**Required keys:**
- `ANTHROPIC_API_KEY` — Get from [console.anthropic.com](https://console.anthropic.com)
- `NOTION_API_KEY` — Create an integration at [notion.so/my-integrations](https://www.notion.so/my-integrations)
- `NOTION_DATABASE_ID` — The ID of your Notion database (from the URL)

**Optional keys:**
- `OPENAI_API_KEY` — For GPT-4o support
- `HIGGSFIELD_API_KEY` — For image generation
- `HIGGSFIELD_CHARACTER_ID` — Your pre-configured character

### 3. Set up Notion Database

Create a Notion database with these properties:

| Property | Type |
|----------|------|
| Topic | Title |
| Date | Date |
| Status | Select (options: Draft, Published) |

Then:
1. Share the database with your Notion integration
2. Copy the database ID from the URL
3. Add it to `.env.local` as `NOTION_DATABASE_ID`

### 4. Run the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## How It Works

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  Enter Topic │────→│ Select Idea  │────→│ Edit & Save  │
│              │     │  (5 ideas)   │     │              │
└──────────────┘     └──────────────┘     └──────┬───────┘
                                                  │
                                    ┌─────────────┼─────────────┐
                                    │             │             │
                               ┌────▼──┐    ┌────▼──┐    ┌────▼──┐
                               │Carousel│    │ Image │    │Notion │
                               │  HTML  │    │Higgs. │    │ Save  │
                               └────────┘    └───────┘    └───────┘
```

### Workflow

1. **Input** — Enter a topic (e.g., "AI replacing developers")
2. **Ideas** — AI generates 5 unique post ideas with hooks and angles
3. **Editor** — AI writes a full post in Adit's voice. You can:
   - Edit the post directly
   - Regenerate / refine it
   - Generate a carousel (HTML slides)
   - Generate an image (Higgsfield)
   - Save everything to Notion

---

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── ideas/route.ts      # POST — Generate content ideas
│   │   ├── post/route.ts       # POST — Generate post, PATCH — Refine
│   │   ├── carousel/route.ts   # POST — Generate carousel
│   │   ├── image/route.ts      # POST — Generate image
│   │   └── notion/route.ts     # POST — Save to Notion, GET — Check connection
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx                # Main app (step-based routing)
├── components/
│   ├── TopicInput.tsx          # Step 1: Topic input screen
│   ├── IdeasList.tsx           # Step 2: Ideas selection
│   ├── PostEditor.tsx          # Step 3: Post editor + actions
│   ├── CarouselPreview.tsx     # Carousel slide preview
│   └── ProviderSwitch.tsx      # LLM provider toggle
├── lib/
│   ├── llm.ts                  # Multi-provider LLM abstraction
│   ├── prompts.ts              # All prompt templates
│   ├── content.ts              # Content generation service
│   ├── carousel.ts             # Carousel generation + HTML rendering
│   ├── notion.ts               # Notion API integration
│   └── higgsfield.ts           # Higgsfield image generation
├── store/
│   └── useAppStore.ts          # Zustand state management
└── types/
    └── index.ts                # TypeScript types
```

---

## API Routes

### `POST /api/ideas`
Generate content ideas for a topic.

```json
{
  "topic": "AI replacing developers",
  "count": 5,
  "provider": "claude"
}
```

### `POST /api/post`
Generate a full LinkedIn post from an idea.

```json
{
  "idea": {
    "id": "1",
    "title": "...",
    "description": "...",
    "angle": "...",
    "hook": "..."
  },
  "provider": "claude"
}
```

### `PATCH /api/post`
Refine/regenerate an existing post.

```json
{
  "content": "existing post content...",
  "instructions": "make the hook stronger",
  "provider": "claude"
}
```

### `POST /api/carousel`
Generate carousel slides from a post.

```json
{
  "post": { "topic": "...", "content": "..." },
  "slideCount": 8,
  "provider": "claude"
}
```

### `POST /api/image`
Generate an image using Higgsfield.

```json
{
  "postContent": "post text...",
  "sceneDescription": "optional custom scene"
}
```

### `POST /api/notion`
Save post + carousel + image to Notion.

```json
{
  "post": { /* full post object */ }
}
```

---

## Writing Style (Built-in)

The AI enforces these rules automatically:

- **Raw and human** — not polished corporate language
- **Short lines** — 1-2 sentences per paragraph
- **Hook first** — pattern interrupt opening
- **No hashtags, no emojis** (or max 1-2)
- **No corporate buzzwords**
- **Ends with question or soft CTA**
- **150-250 words**

---

## Carousel Format

Carousels are generated as structured HTML:
- **1080×1080px** slides (LinkedIn optimal)
- Dark theme with gradient backgrounds
- Ready for print-to-PDF conversion
- Download as HTML file from the UI

To convert to PDF:
1. Download the HTML file
2. Open in Chrome
3. Print → Save as PDF (or use any HTML-to-PDF tool)

---

## Adding a New LLM Provider

1. Add provider ID to `LLMProvider` type in `src/types/index.ts`
2. Add client initialization in `src/lib/llm.ts`
3. Add provider option in `src/components/ProviderSwitch.tsx`
4. Add API key to `.env.local`

---

## Deployment

### Vercel (Recommended)

```bash
npm run build
vercel deploy
```

Add all environment variables in Vercel dashboard → Settings → Environment Variables.

### Docker

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

---

## License

Private — Built for Adit / Bloom Dots.
