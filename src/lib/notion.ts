// ============================================
// Notion Service - Save posts to Notion database
// Auto-detects database schema and adapts properties
// ============================================

import { Client } from '@notionhq/client';
import type { LinkedInPost, NotionConfig } from '@/types';

let envNotionClient: Client | null = null;

function getNotionClient(apiKey?: string): Client {
  const auth = apiKey || process.env.NOTION_API_KEY;
  if (!auth) throw new Error('NOTION_API_KEY is not set');

  if (apiKey) return new Client({ auth });

  if (!envNotionClient) {
    envNotionClient = new Client({ auth });
  }
  return envNotionClient;
}

function getDatabaseId(databaseId?: string): string {
  const id = databaseId || process.env.NOTION_DATABASE_ID;
  if (!id) throw new Error('NOTION_DATABASE_ID is not set');
  return id;
}

const cachedSchemas = new Map<string, Record<string, string>>();

async function getDatabaseSchema(
  notion: Client,
  databaseId: string
): Promise<Record<string, string>> {
  const cachedSchema = cachedSchemas.get(databaseId);
  if (cachedSchema) return cachedSchema;

  try {
    const db = await notion.databases.retrieve({ database_id: databaseId });
    const props = (db as unknown as {
      properties?: Record<string, { type: string }> | null;
    }).properties;

    if (!props || typeof props !== 'object') {
      const fallback = { Name: 'title' };
      cachedSchemas.set(databaseId, fallback);
      return fallback;
    }

    const schema: Record<string, string> = {};
    for (const [name, prop] of Object.entries(props)) {
      if (prop?.type) {
        schema[name] = prop.type;
      }
    }

    if (!Object.values(schema).includes('title')) {
      schema.Name = 'title';
    }

    cachedSchemas.set(databaseId, schema);
    return schema;
  } catch (error) {
    console.error('Failed to retrieve database schema:', error);
    const fallback = { Name: 'title' };
    cachedSchemas.set(databaseId, fallback);
    return fallback;
  }
}

function findTitleProperty(schema: Record<string, string>): string {
  for (const [name, type] of Object.entries(schema)) {
    if (type === 'title') return name;
  }
  return 'Name';
}

export async function saveToNotion(
  post: LinkedInPost,
  config?: NotionConfig
): Promise<{ pageId: string; url: string }> {
  const notion = getNotionClient(config?.apiKey);
  const databaseId = getDatabaseId(config?.databaseId);

  const schema = await getDatabaseSchema(notion, databaseId);
  const titleProp = findTitleProperty(schema);

  const wordCount = post.content.split(/\s+/).filter(Boolean).length;
  const hasCarousel = !!post.carousel;
  const hasImage = !!post.imageUrl;
  const contentType = hasCarousel ? 'Post + Carousel' : 'Post';

  const properties: Record<string, unknown> = {
    [titleProp]: {
      title: [{ text: { content: post.topic } }],
    },
  };

  if (schema.Date === 'date') {
    properties.Date = { date: { start: post.createdAt.split('T')[0] } };
  }
  if (schema.Status === 'select') {
    properties.Status = {
      select: { name: post.status === 'saved' ? 'Published' : 'Draft' },
    };
  }
  if (schema.Type === 'select') {
    properties.Type = { select: { name: contentType } };
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

  children.push({
    object: 'block',
    type: 'divider',
    divider: {},
  });

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
    url:
      (response as unknown as { url: string }).url ||
      `https://notion.so/${response.id.replace(/-/g, '')}`,
  };
}

export async function verifyNotionConnection(config?: NotionConfig): Promise<{
  connected: boolean;
  databaseName?: string;
  error?: string;
}> {
  try {
    const notion = getNotionClient(config?.apiKey);
    const databaseId = getDatabaseId(config?.databaseId);

    const db = await notion.databases.retrieve({ database_id: databaseId });
    const title = (db as unknown as { title: Array<{ plain_text: string }> })
      .title;

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
