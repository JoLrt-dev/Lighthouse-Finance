import Parser from "rss-parser";
import { cyan, yellow, red, green, gray } from "colorette";
import { RSS_FEEDS } from "../config/feeds.js";

// --- CONFIGURATION DU PARSER ---
const parser = new Parser({
  headers: {
    "User-Agent": "Lighthouse-Finance-Bot/1.0",
  },
});

export async function collecterArticles(feeds) {
  console.log(cyan("\n🔍 Scan des flux RSS..."));
  console.time("⏱️ Temps de scan RSS");
  let articlesFound = [];
  const limitDate = new Date();
  limitDate.setDate(limitDate.getDate() - 7);

  for (const feedConfig of RSS_FEEDS) {
    try {
      const feed = await parser.parseURL(feedConfig.url);
      feed.items.forEach((item) => {
        const articleDate = new Date(item.pubDate || item.isoDate);
        if (articleDate > limitDate) {
          articlesFound.push({
            titre: item.title,
            lien: item.link,
            source: feed.title || "Source officielle",
            date: articleDate.toLocaleDateString("fr-FR"),
            category: feedConfig.category,
          });
        }
      });
    } catch (err) {
      console.error(`❌ Erreur sur le flux ${feedConfig.url}: ${err.message}`);
    }
  }
  console.timeEnd("⏱️ Temps de scan RSS");
  return articlesFound;
}
