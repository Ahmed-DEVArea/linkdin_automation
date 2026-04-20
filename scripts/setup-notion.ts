// ============================================
// Notion Database Setup Script
// Run: npx tsx scripts/setup-notion.ts
// Creates the LinkedIn Content database with all required columns
// ============================================

const NOTION_API_KEY = process.env.NOTION_API_KEY;

if (!NOTION_API_KEY) {
  console.error('❌ NOTION_API_KEY environment variable is required. Set it in .env.local');
  process.exit(1);
}

async function main() {
  console.log('🔧 Setting up Notion database for LinkedIn Content Engine...\n');

  // Step 1: Find a page to create the database in
  // Search for pages the integration has access to
  const searchRes = await fetch('https://api.notion.com/v1/search', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${NOTION_API_KEY}`,
      'Notion-Version': '2022-06-28',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      filter: { property: 'object', value: 'page' },
      page_size: 10,
    }),
  });

  if (!searchRes.ok) {
    const err = await searchRes.text();
    console.error('❌ Failed to search Notion. Make sure the integration is connected to a page.');
    console.error(`   Error: ${err}`);
    console.log('\n📋 To fix this:');
    console.log('   1. Go to any Notion page');
    console.log('   2. Click ••• (three dots) → Connections → Connect to → linkdin_automation');
    console.log('   3. Run this script again');
    process.exit(1);
  }

  const searchData = await searchRes.json();
  
  // Check if database already exists
  const dbSearch = await fetch('https://api.notion.com/v1/search', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${NOTION_API_KEY}`,
      'Notion-Version': '2022-06-28',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: 'LinkedIn Content',
      filter: { property: 'object', value: 'database' },
    }),
  });

  const dbSearchData = await dbSearch.json();

  if (dbSearchData.results && dbSearchData.results.length > 0) {
    const existingDb = dbSearchData.results[0];
    console.log('✅ Database already exists!');
    console.log(`   Database ID: ${existingDb.id}`);
    console.log(`\n📋 Add this to your .env.local:`);
    console.log(`   NOTION_DATABASE_ID=${existingDb.id}`);
    return;
  }

  let parentPageId: string | null = null;

  if (searchData.results && searchData.results.length > 0) {
    parentPageId = searchData.results[0].id;
    console.log(`📄 Found parent page: ${searchData.results[0].id}`);
  } else {
    console.error('❌ No pages found. The integration needs access to at least one page.');
    console.log('\n📋 To fix this:');
    console.log('   1. Go to any Notion page');
    console.log('   2. Click ••• (three dots) → Connections → Connect to → linkdin_automation');
    console.log('   3. Run this script again');
    process.exit(1);
  }

  // Step 2: Create the database
  console.log('📊 Creating "LinkedIn Content" database...\n');

  const createRes = await fetch('https://api.notion.com/v1/databases', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${NOTION_API_KEY}`,
      'Notion-Version': '2022-06-28',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      parent: { type: 'page_id', page_id: parentPageId },
      icon: { type: 'emoji', emoji: '📝' },
      title: [
        {
          type: 'text',
          text: { content: 'LinkedIn Content' },
        },
      ],
      properties: {
        // Title column (required, this is the topic)
        'Topic': {
          title: {},
        },
        // Date the post was created
        'Date': {
          date: {},
        },
        // Post status
        'Status': {
          select: {
            options: [
              { name: 'Draft', color: 'yellow' },
              { name: 'Review', color: 'orange' },
              { name: 'Published', color: 'green' },
              { name: 'Archived', color: 'gray' },
            ],
          },
        },
        // Content type
        'Type': {
          select: {
            options: [
              { name: 'Post', color: 'blue' },
              { name: 'Carousel', color: 'purple' },
              { name: 'Post + Carousel', color: 'pink' },
            ],
          },
        },
        // Which LLM was used
        'AI Model': {
          select: {
            options: [
              { name: 'Claude', color: 'orange' },
              { name: 'GPT-4o', color: 'green' },
              { name: 'Gemini', color: 'blue' },
            ],
          },
        },
        // Word count of the post
        'Word Count': {
          number: {
            format: 'number',
          },
        },
        // Has carousel
        'Has Carousel': {
          checkbox: {},
        },
        // Has image
        'Has Image': {
          checkbox: {},
        },
        // Image URL (external)
        'Image URL': {
          url: {},
        },
      },
    }),
  });

  if (!createRes.ok) {
    const err = await createRes.text();
    console.error(`❌ Failed to create database: ${err}`);
    process.exit(1);
  }

  const db = await createRes.json();

  console.log('✅ Database created successfully!\n');
  console.log('   Database columns:');
  console.log('   ├── Topic (Title)');
  console.log('   ├── Date (Date)');
  console.log('   ├── Status (Select: Draft/Review/Published/Archived)');
  console.log('   ├── Type (Select: Post/Carousel/Post + Carousel)');
  console.log('   ├── AI Model (Select: Claude/GPT-4o/Gemini)');
  console.log('   ├── Word Count (Number)');
  console.log('   ├── Has Carousel (Checkbox)');
  console.log('   ├── Has Image (Checkbox)');
  console.log('   └── Image URL (URL)');
  console.log(`\n   Database ID: ${db.id}`);
  console.log(`\n📋 Add this to your .env.local:`);
  console.log(`   NOTION_DATABASE_ID=${db.id}`);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
