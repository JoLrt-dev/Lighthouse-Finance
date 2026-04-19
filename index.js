import "dotenv/config";
import express from "express";
import { cyan, yellow, green } from "colorette";
import { createLoader } from "./src/utils/display.js";
import { RSS_FEEDS } from "./src/config/feeds.js";
import { collecterArticles } from "./src/services/rssService.js";
import { aiAnalysis } from "./src/services/aiService.js";
import { sendEmail } from "./src/services/emailService.js";

const app = express();
const port = process.env.APP_PORT || 3000;

/**
 * Cœur du script : Scan, Analyse et Envoi
 */
export async function runVeille() {
  console.log(cyan("ÉTAPE 1 : Scan des flux RSS..."));
  try {
    const articles = await collecterArticles(RSS_FEEDS);
    console.log(green(`✅ ${articles.length} articles trouvés.`));

    if (articles.length > 0) {
      // Filtrage par category
      const financeArticles = articles
        .filter((a) => a.category === "FINANCE")
        .slice(0, 15);

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
        cyan(
          `ÉTAPE 2 : Analyse par Gemini (${selectedArticles.length} articles sélectionnés)...`,
        ),
      );

      // Gestion du loader (uniquement en local/TTY pour éviter les crashs sur AWS)
      let loaderIA;
      if (process.stdout.isTTY) {
        loaderIA = createLoader("L'IA synthétise les actualités...");
      }

      console.time("⏱️ Temps de réponse IA");
      // ON REPASSE BIEN LA CLÉ API ICI
      const synthese = await aiAnalysis(
        selectedArticles,
        process.env.GEMINI_API_KEY,
      );
      console.timeEnd("⏱️ Temps de réponse IA");

      if (loaderIA) clearInterval(loaderIA);

      // 3. Envoi de l'email
      if (synthese && synthese !== "Erreur d'analyse IA.") {
        console.log(
          cyan("\n📧 ÉTAPE 3 : Création et envoi de la newsletter..."),
        );

        let loaderEmail;
        if (process.stdout.isTTY) {
          loaderEmail = createLoader("Génération du MJML et envoi...");
        }

        await sendEmail(synthese);

        if (loaderEmail) clearInterval(loaderEmail);
        console.log(
          green(
            `✅ Newsletter envoyée avec succès à ${process.env.EMAIL_TO} !`,
          ),
        );
        return synthese;
      }
    } else {
      console.log(yellow("📭 Aucun nouvel article trouvé aujourd'hui."));
      return "Aucun article";
    }
  } catch (error) {
    console.error(`❌ Erreur lors de l'exécution : ${error.message}`);
    throw error; // Crucial pour qu'AWS détecte un échec et t'alerte
  }
}

/**
 * HANDLER AWS LAMBDA
 * Point d'entrée pour EventBridge le lundi matin
 */
export const handler = async (event) => {
  console.log("⏰ Déclencheur AWS activé");
  try {
    const result = await runVeille();
    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Veille terminée avec succès" }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};

/**
 * LANCEMENT LOCAL (Express)
 * Ne s'exécute que sur ton PC (pas sur Lambda)
 */
if (!process.env.LAMBDA_TASK_ROOT) {
  app.listen(port, async () => {
    console.log(cyan("=================================================="));
    console.log(
      green(`🚀 Lighthouse Server actif en local sur le port ${port}`),
    );
    console.log(cyan("=================================================="));

    // Déclenchement automatique au lancement local
    await runVeille();
  });
}
