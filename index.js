import "dotenv/config";
import express from "express";
import Parser from "rss-parser"; // 1. L'outil
import { cyan, yellow, red, green } from "colorette";
import { GoogleGenerativeAI } from "@google/generative-ai";

const app = express();
const port = process.env.APP_PORT || 3000;

// 2. Configuration du Parser avec un User-Agent pour la politesse logicielle
const parser = new Parser({
  headers: {
    "User-Agent": "Lighthouse-Finance-Bot/1.0",
  },
});

// 3. Les sources de données
const RSS_FEEDS = [
  "https://www.impots.gouv.fr/rss.xml",
  "https://www.service-public.gouv.fr/abonnements/rss/actu-actualites-particuliers.rss",
  "https://www.lafinancepourtous.com/rss",
];

// --- LOGIQUE DE L'ÉTAPE 2 ---
async function collecterArticles() {
  console.log(cyan("🔍 Scan des flux RSS..."));
  let articlesTrouves = [];

  // Calcul de la fenêtre de tir (7 jours)
  const dateLimite = new Date();
  dateLimite.setDate(dateLimite.getDate() - 7);

  for (const url of RSS_FEEDS) {
    try {
      // On télécharge et on parse le flux
      const feed = await parser.parseURL(url);
      console.log(yellow(`📖 Lecture de : ${feed.title}`));

      feed.items.forEach((item) => {
        const dateArticle = new Date(item.pubDate || item.isoDate);

        // Comparaison des dates
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
      // Si un flux échoue, on log l'erreur mais on continue la boucle
      console.log(red(`❌ Erreur sur le flux ${url}: ${err.message}`));
    }
  }

  return articlesTrouves;
}

// --- ROUTE DE TEST ÉTAPE 2 ---
app.get("/test-collecte", async (req, res) => {
  const resultats = await collecterArticles();
  console.log(
    green(`✅ Collecte terminée : ${resultats.length} articles trouvés.`),
  );
  res.json(resultats); // On renvoie le tableau brut pour vérifier dans le navigateur
});

app.listen(port, () => {
  console.log(
    cyan(`Lighthouse Étape 2 prête sur http://localhost:${port}/test-collecte`),
  );
});
