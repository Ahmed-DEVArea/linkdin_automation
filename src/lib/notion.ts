// ============================================
// Notion Service — Save posts to Notion database
// ============================================

import { Client } from '@notionhq/client';
import type { LinkedInPost } from '@/types';

let notionClient: Client | null = null;

function getNotionClient(): Client {
  if (!notionClient) {
    const auth = process.env.NOTION_API_KEY;
    if (!auth) throw new Error('NOTION_API_KEY is not set');
    notionClient = new Client({ auth });
  }
  return notionClient;
}

function getDatabaseId(): string {
  const id = process.env.NOTION_DATABASE_ID;
  if (!id) throw new Error('NOTION_DATABASE_ID is not set');
  return id;
}

export async function saveToNotion(post: LinkedInPost): Promise<{ pageId: string; url: string }> {
  const notion = getNotionClient();
  const databaseId = getDatabaseId();

  // Build properties for the Notion page
  // Calculate word count
  const wordCount = post.content.split(/\s+/).filter(Boolean).length;
  const hasCarousel = !!post.carousel;
  const hasImage = !!post.imageUrl;
  const contentType = hasCarousel ? (hasImage ? 'Post + Carousel' : 'Post + Carousel') : 'Post';

  const properties: Record<string, unknown> = {
    // Title property (required)
    'Topic': {
      title: [
        {
          text: {
            content: post.topic,
          },
        },
      ],
    },
    // Date property
    'Date': {
      date: {
        start: post.createdAt.split('T')[0],
      },
    },
    // Status property
    'Status': {
      select: {
        name: post.status === 'saved' ? 'Published' : 'Draft',
      },
    },
    // Type property
    'Type': {
      select: {
        name: contentType,
      },
    },
    // Word Count
    'Word Count': {
      number: wordCount,
    },
    // Has Carousel
    'Has Carousel': {
      checkbox: hasCarousel,
    },
    // Has Image
    'Has Image': {
      checkbox: hasImage,
    },
  };

  // Add image URL if present
  if (post.imageUrl) {
    properties['Image URL'] = {
      url: post.imageUrl,
    };
  }

  // Build children blocks (post content)
  const children: unknown[] = [
    // Post heading
    {
      object: 'block',
      type: 'heading_2',
      heading_2: {
        rich_text: [{ type: 'text', text: { content: 'LinkedIn Post' } }],
      },
    },
    // Post content
    {
      object: 'block',
      type: 'paragraph',
      paragraph: {
        rich_text: [
          {
            type: 'text',
            text: { content: post.content.substring(0, 2000) },
          },
        ],
      },
    },
  ];

  // If there's remaining content (Notion has 2000 char limit per text block)
  if (post.content.length > 2000) {
    children.push({
      object: 'block',
      type: 'paragraph',
      paragraph: {
        rich_text: [
          {
            type: 'text',
            text: { content: post.content.substring(2000) },
          },
        ],
      },
    });
  }

  // Add divider
  children.push({
    object: 'block',
    type: 'divider',
    divider: {},
  });

  // Add carousel HTML if present
  if (post.carousel?.htmlContent) {
    children.push(
      {
        object: 'block',
        type: 'heading_2',
        heading_2: {
          rich_text: [{ type: 'text', text: { content: 'Carousel Content' } }],
        },
      },
      {
        object: 'block',
        type: 'code',
        code: {
          rich_text: [
            {
              type: 'text',
              text: {
                content: post.carousel.htmlContent.substring(0, 2000),
              },
            },
          ],
          language: 'html',
        },
      }
    );
  }

  // Add image if present
  if (post.imageUrl) {
    children.push(
      {
        object: 'block',
        type: 'heading_2',
        heading_2: {
          rich_text: [{ type: 'text', text: { content: 'Generated Image' } }],
        },
      },
      {
        object: 'block',
        type: 'image',
        image: {
          type: 'external',
          external: {
            url: post.imageUrl,
          },
        },
      }
    );
  }

  const response = await notion.pages.create({
    parent: { database_id: databaseId },
    properties: properties as Record<string, never>,
    children: children as never[],
  });

  return {
    pageId: response.id,
    url: (response as unknown as { url: string }).url || `https://notion.so/${response.id.replace(/-/g, '')}`,
  };
}

// Verify Notion connection and database access
export async function verifyNotionConnection(): Promise<{
  connected: boolean;
  databaseName?: string;
  error?: string;
}> {
  try {
    const notion = getNotionClient();
    const databaseId = getDatabaseId();

    const db = await notion.databases.retrieve({ database_id: databaseId });
    const title = (db as unknown as { title: Array<{ plain_text: string }> }).title;

    return {
      connected: true,
      databaseName: title?.[0]?.plain_text || 'Untitled',
    };
  } catch (error) {
    return {
      connected: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
