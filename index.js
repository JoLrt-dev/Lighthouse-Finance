import "dotenv/config";
import express from "express";
import Parser from "rss-parser";
import { cyan, yellow, red, green, gray } from "colorette";
import { GoogleGenAI } from "@google/genai";

const app = express();
const port = process.env.APP_PORT || 3000;
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// --- CONFIGURATION DU PARSER ---
const parser = new Parser({
  headers: {
    "User-Agent": "Lighthouse-Finance-Bot/1.0",
  },
});

const RSS_FEEDS = [
  "https://www.economie.gouv.fr/rss", // URL plus stable que le XML direct des impôts
  "https://www.service-public.gouv.fr/abonnements/rss/actu-actualites-particuliers.rss",
  "https://www.lafinancepourtous.com/rss",
];

// --- UTILITAIRE : LOADER ---
function createLoader(text) {
  const chars = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
  let i = 0;
  return setInterval(() => {
    process.stdout.write(`\r${cyan(chars[i++ % chars.length])} ${text}`);
  }, 100);
}

// --- ÉTAPE 1 : COLLECTE ---
async function collecterArticles() {
  console.log(cyan("\n🔍 Scan des flux RSS..."));
  console.time("⏱️ Temps de scan RSS");

  let articlesTrouves = [];
  const dateLimite = new Date();
  dateLimite.setDate(dateLimite.getDate() - 7);

  for (const url of RSS_FEEDS) {
    try {
      const feed = await parser.parseURL(url);
      console.log(yellow(`📖 Lecture de : ${feed.title}`));

      feed.items.forEach((item) => {
        const dateArticle = new Date(item.pubDate || item.isoDate);
        if (dateArticle > dateLimite) {
          articlesTrouves.push({
            titre: item.title,
            lien: item.link,
            source: feed.title || "Source officielle",
            date: dateArticle.toLocaleDateString("fr-FR"),
          });
        }
      });
    } catch (err) {
      console.log(red(`❌ Erreur sur le flux ${url}: ${err.message}`));
    }
  }
  console.timeEnd("⏱️ Temps de scan RSS");
  return articlesTrouves;
}

// --- ÉTAPE 2 : ANALYSE IA ---
async function mainAI(articles) {
  if (articles.length === 0) {
    console.log(yellow("\n⚠️ Aucun article à analyser."));
    return "Pas d'actualités récentes.";
  }

  console.log(
    cyan(
      `\n🤖 Appel à Gemini (gemini-3-flash-preview) pour ${articles.length} articles...`,
    ),
  );
  const loader = createLoader("L'IA analyse les titres...");
  console.time("⏱️ Temps de réponse IA");

  try {
    const prompt = `Voici les titres de ma veille financière : 
    ${articles.map((a) => a.titre).join("\n")}
    Résume les 3 tendances principales en quelques mots.`;

    // Utilisation stricte de ta configuration demandée
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    clearInterval(loader);
    process.stdout.write("\r\x1b[K"); // Nettoie la ligne du loader

    const texteFinal = response.text;
    console.log(green("✅ Synthèse reçue :"));
    console.log(gray("--------------------------------------------------"));
    console.log(texteFinal);
    console.log(gray("--------------------------------------------------"));

    return texteFinal;
  } catch (error) {
    clearInterval(loader);
    process.stdout.write("\r\x1b[K");
    console.log(red("\n❌ Erreur IA :"), error.message);
    return "Erreur d'analyse IA.";
  } finally {
    console.timeEnd("⏱️ Temps de réponse IA");
  }
}

// --- ROUTE DE TEST ---
app.get("/test-collecte", async (req, res) => {
  // On attend d'abord les articles
  const articles = await collecterArticles();

  // On attend ensuite l'IA (en lui passant les articles)
  const synthese = await mainAI(articles);

  res.json({
    nb_articles: articles.length,
    synthese_ia: synthese,
    details: articles,
  });
});

app.listen(port, () => {
  console.log(cyan("=================================================="));
  console.log(
    green(`🚀 Lighthouse prêt sur http://localhost:${port}/test-collecte`),
  );
  console.log(cyan("=================================================="));
});
