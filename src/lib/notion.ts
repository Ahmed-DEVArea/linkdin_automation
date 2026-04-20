// ============================================
// Notion Service — Save posts to Notion database
// Auto-detects database schema & adapts properties
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

// Cache database schema to avoid repeated lookups
let cachedSchema: Record<string, string> | null = null;

/**
 * Fetch the database schema and return a map of property names → types
 */
async function getDatabaseSchema(notion: Client, databaseId: string): Promise<Record<string, string>> {
  if (cachedSchema) return cachedSchema;

  const db = await notion.databases.retrieve({ database_id: databaseId });
  const props = (db as unknown as { properties: Record<string, { type: string }> }).properties;
  
  const schema: Record<string, string> = {};
  for (const [name, prop] of Object.entries(props)) {
    schema[name] = prop.type;
  }
  cachedSchema = schema;
  return schema;
}

/**
 * Find the title property name in the database (could be "Name", "Topic", etc.)
 */
function findTitleProperty(schema: Record<string, string>): string {
  for (const [name, type] of Object.entries(schema)) {
    if (type === 'title') return name;
  }
  return 'Name'; // Notion default
}

export async function saveToNotion(post: LinkedInPost): Promise<{ pageId: string; url: string }> {
  const notion = getNotionClient();
  const databaseId = getDatabaseId();

  // Discover the actual database schema
  const schema = await getDatabaseSchema(notion, databaseId);
  const titleProp = findTitleProperty(schema);

  // Calculate metadata
  const wordCount = post.content.split(/\s+/).filter(Boolean).length;
  const hasCarousel = !!post.carousel;
  const hasImage = !!post.imageUrl;
  const contentType = hasCarousel ? 'Post + Carousel' : 'Post';

  // Build properties — only include properties that exist in the database
  const properties: Record<string, unknown> = {
    // Title property (required — use whatever the DB calls it)
    [titleProp]: {
      title: [{ text: { content: post.topic } }],
    },
  };

  // Conditionally add optional properties if they exist in the schema
  if (schema['Date'] === 'date') {
    properties['Date'] = { date: { start: post.createdAt.split('T')[0] } };
  }
  if (schema['Status'] === 'select') {
    properties['Status'] = { select: { name: post.status === 'saved' ? 'Published' : 'Draft' } };
  }
  if (schema['Type'] === 'select') {
    properties['Type'] = { select: { name: contentType } };
  }
  if (schema['Word Count'] === 'number') {
    properties['Word Count'] = { number: wordCount };
  }
  if (schema['Has Carousel'] === 'checkbox') {
    properties['Has Carousel'] = { checkbox: hasCarousel };
  }
  if (schema['Has Image'] === 'checkbox') {
    properties['Has Image'] = { checkbox: hasImage };
  }
  if (schema['Image URL'] === 'url' && post.imageUrl) {
    properties['Image URL'] = { url: post.imageUrl };
  }

  // Build children blocks (post content — always works regardless of schema)
  const children: unknown[] = [
    {
      object: 'block',
      type: 'heading_2',
      heading_2: {
        rich_text: [{ type: 'text', text: { content: 'LinkedIn Post' } }],
      },
    },
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

  // Continuation block for long content
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

  // Divider
  children.push({
    object: 'block',
    type: 'divider',
    divider: {},
  });

  // Carousel HTML if present
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

  // Image if present
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
