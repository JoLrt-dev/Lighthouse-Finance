import "dotenv/config";
import express from "express";
import { cyan, yellow, red, green } from "colorette";
import { RSS_FEEDS } from "./src/config/feeds.js";
import { collecterArticles } from "./src/services/rssService.js";
import { aiAnalysis } from "./src/services/aiService.js";
import { sendEmail } from "./src/services/emailService.js";

const app = express();
const port = process.env.APP_PORT || 3000;

// --- FONCTION PRINCIPALE (AUTO-EXÉCUTANTE) ---
async function runVeille() {
  try {
    // 1. On collecte
    const articles = await collecterArticles(RSS_FEEDS);
    // 2. On analyse si on a des résultats
    if (articles.length > 0) {
      const synthese = await aiAnalysis(articles, process.env.GEMINI_API_KEY);
      // 3. On envoie le mail
      if (synthese && synthese !== "Erreur d'analyse IA.") {
        await sendEmail(synthese);
        console.log("✅ Processus terminé !");
      }
    } else {
      console.log(yellow("📭 Aucun nouvel article trouvé aujourd'hui."));
    }
  } catch (error) {
    console.error(
      `❌ Erreur lors de l'exécution de la veille : ${error.message}`,
    );
  }
}
// --- INITIALISATION DU SERVEUR ---
app.listen(port, async () => {
  console.log(cyan("=================================================="));
  console.log(green(`🚀 Lighthouse Server actif sur le port ${port}`));
  console.log(cyan("=================================================="));

  // --- DÉCLENCHEMENT AUTOMATIQUE ---
  // On lance la veille dès que le serveur est prêt
  await runVeille();
});
