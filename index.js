import "dotenv/config";
import express from "express";
import { cyan, yellow, red, green } from "colorette";
import { createLoader } from "./src/utils/display.js";
import { RSS_FEEDS } from "./src/config/feeds.js";
import { collecterArticles } from "./src/services/rssService.js";
import { aiAnalysis } from "./src/services/aiService.js";
import { sendEmail } from "./src/services/emailService.js";

const app = express();
const port = process.env.APP_PORT || 3000;

async function runVeille() {
  console.log(cyan("ÉTAPE 1 : Scan des flux RSS..."));
  try {
    const articles = await collecterArticles(RSS_FEEDS);
    console.log(green(`✅ ${articles.length} articles trouvés.`));
    // 2. On analyse si on a des résultats
    if (articles.length > 0) {
      const financeArticles = articles
        .filter((a) => a.category === "FINANCE")
        .slice(0, 15); // Top 15 récents
      const immoArticles = articles
        .filter((a) => a.category === "IMMO")
        .slice(0, 10);
      const techArticles = articles
        .filter((a) => a.category === "TECH")
        .slice(0, 10);
      const selectedArticles = [
        ...financeArticles,
        ...immoArticles,
        ...techArticles,
      ];
      console.log(
        cyan(`ÉTAPE 2 : Analyse par Gemini (${articles.length} articles)...`),
      );
      // --- DÉBUT LOADER IA ---
      const loaderIA = createLoader("L'IA synthétise les actualités...");
      console.time("⏱️ Temps de réponse IA");
      const synthese = await aiAnalysis(
        selectedArticles,
        process.env.GEMINI_API_KEY,
      );
      clearInterval(loaderIA);
      process.stdout.write("\r\x1b[K"); // Nettoie la ligne
      console.timeEnd("⏱️ Temps de réponse IA");
      console.log(green("✅ Synthèse rédigée avec succès."));
      // --- FIN LOADER IA ---

      // 3. On envoie le mail
      if (synthese && synthese !== "Erreur d'analyse IA.") {
        // --- DÉBUT LOADER EMAIL ---
        console.log(
          cyan("\n📧 ÉTAPE 3 : Création et envoi de la newsletter..."),
        );
        const loaderEmail = createLoader("Génération du MJML et envoi...");
        await sendEmail(synthese);
        clearInterval(loaderEmail);
        process.stdout.write("\r\x1b[K");
        console.log(
          green(
            `✅ Newsletter envoyée avec succès à ${process.env.EMAIL_TO} !`,
          ),
        );
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
  await runVeille();
});
