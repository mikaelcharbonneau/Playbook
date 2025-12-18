import { drizzle } from 'drizzle-orm/mysql2';
import { games } from './drizzle/schema.js';
import { eq } from 'drizzle-orm';

async function check() {
  const db = drizzle(process.env.DATABASE_URL);
  
  // First, get all games to see which have content
  const allGames = await db.select({ 
    id: games.id, 
    title: games.title, 
    hasContent: games.gameContent 
  }).from(games);
  
  console.log('All games:');
  for (const g of allGames) {
    console.log(`  - ${g.title}: ${g.hasContent ? 'HAS CONTENT' : 'NO CONTENT'}`);
  }
  
  // Find one with content
  const withContent = allGames.find(g => g.hasContent);
  if (withContent) {
    const result = await db.select({ gameContent: games.gameContent }).from(games).where(eq(games.id, withContent.id));
    const content = JSON.parse(result[0].gameContent);
    console.log('\nGame with content:', withContent.title);
    console.log('Has version:', !!content.version);
    console.log('Has theme:', !!content.theme);
    console.log('Theme background:', JSON.stringify(content.theme?.background));
    console.log('Keys:', Object.keys(content));
    console.log('\nFull content sample:');
    console.log(JSON.stringify(content, null, 2).substring(0, 2000));
  }
  
  process.exit(0);
}
check();
