import "dotenv/config";
import express from "express";
import Parser from "rss-parser";
import { cyan, yellow, red, green, gray } from "colorette";
import { GoogleGenAI } from "@google/genai";
import nodemailer from "nodemailer";

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
  "https://www.economie.gouv.fr/rss/toutesactualites",
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
    const prompt = `
En tant que "Lighthouse AI", analyse ces articles :
${articles.map((a) => `- TITRE: ${a.titre} | SOURCE: ${a.source} | LIEN: ${a.lien}`).join("\n")}
CONSIGNES DE FORMATAGE STRICTES :
1. Utilise "### " au début de chaque titre de sujet (ex: ### Titre).
2. Utilise "**" pour mettre en gras les libellés (ex: **1. Synthèse Expert :**).
3. Pour le lien, utilise cette forme : [LIEN_HTML]
4. Remplace [LIEN_HTML] par : <a href="LIEN_REEL" style="color: #D97706; text-decoration: none; font-weight: bold;">Lire sur SOURCE_REELLE</a>

Ton objectif est de rédiger une newsletter de veille financière pour Maureen. Tutoies là. Pour les 3 sujets les plus pertinents, respecte strictement la structure suivante :

---
### [TITRE DU SUJET]
**Score de criticité :** [Note de 1 à 5] /5 
** [URL_DE_L'ARTICLE] ** 

**1. Synthèse :**
Rédige un résumé technique mais concis. Croise les informations si plusieurs sources traitent du même sujet. Explique l'impact fiscal ou patrimonial (ex: modification du barème, nouvelle aide, évolution des taux).

**2. Angle de Vulgarisation :**
Donne au CGP l'idée directrice pour expliquer cela simplement à ses clients. Ton : Pédagogique, rassurant, et dynamique.

**3. Script Slides Instagram :**
Propose un plan en 4 slides pour un carrousel :
- Slide 1 (Accroche) : Un titre "Hook" qui interpelle.
- Slide 2 (Le Problème/Le Changement) : Ce qui change concrètement.
- Slide 3 (La Solution/L'Action) : Ce qu'il faut faire maintenant.
- Slide 4 (Appel à l'action) : Une question pour engager l'audience.

**Conclusion globale :** Une phrase sur la tendance de fond de la semaine.
`;
    // Utilisation stricte de ta configuration demandée
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7, // Équilibre entre précision et créativité pour les scripts Insta
        topP: 0.8, // Permet une certaine diversité dans les angles de vulgarisation
      },
    });

    clearInterval(loader);
    process.stdout.write("\r\x1b[K"); // Nettoie la ligne du loader

    const texteFinal = response.text;
    console.log(green("✅ Synthèse reçue :"));

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

// --- ÉTAPE 3 : ENVOI DU MAIL ---
async function envoyerEmail(syntheseIA) {
  console.log(cyan("\n📧 Création de la veille Lighthouse..."));

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT || 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // --- FORMATAGE DU CORPS ---
  const corpsEmail = syntheseIA
    .replace(
      /### (.*)/g,
      '<h2 style="font-family: Georgia, serif; font-size: 19px; color: #D97706; margin-top: 40px; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 1px;">$1</h2>',
    )
    .replace(
      /^\*\*(\d\..*?)\*\*/gm,
      '<strong style="color: #111111; font-weight: 700;">$1</strong>',
    )
    .replace(
      /^\*\*(Score de criticité :)\*\*/gm,
      '<strong style="color: #111111; font-weight: 700;">$1</strong>',
    )
    .replace(
      /^\*\*(Conclusion globale :)\*\*/gm,
      '<strong style="color: #111111; font-weight: 700;">$1</strong>',
    )
    .replace(/\*\*/g, "")
    // On ajoute une marge basse très importante (120px) à la conclusion pour "pousser" le footer
    .replace(
      /Conclusion globale : (.*)/g,
      '<div style="margin-top: 50px; padding-top: 25px; border-top: 1px double #eee; font-style: italic; color: #555; margin-bottom: 120px;"><strong>Conclusion :</strong> $1</div>',
    )
    .replace(/\n/g, "<br>")
    .replace(
      /---/g,
      '<hr style="border: 0; border-top: 1px solid #f0f0f0; margin: 40px 0;">',
    );

  const htmlFinal = `
    <!DOCTYPE html>
    <html>
      <body style="background-color: #ffffff; margin: 0; padding: 40px 20px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333333; line-height: 1.7; -webkit-font-smoothing: antialiased;">
        <div style="max-width: 600px; margin: auto;">
          
          <header style="text-align: center; margin-bottom: 50px;">
            <h1 style="font-family: Georgia, serif; font-size: 26px; font-weight: normal; letter-spacing: 5px; text-transform: uppercase; color: #000; margin: 0 0 10px 0;">Lighthouse Finance</h1>
            <p style="font-size: 11px; color: #999999; text-transform: uppercase; letter-spacing: 3px; margin: 0;">Les actus de la semaine</p>
          </header>

          <main style="font-size: 15px;">
            ${corpsEmail}
          </main>

          <footer style="margin-top: 50px; padding-top: 40px; border-top: 1px solid #f2f2f2; text-align: center;">
            <p style="margin: 0; color: #999999; font-size: 12px; letter-spacing: 0.5px;">
              Généré par <strong>Lighthouse Finance AI</strong>
            </p>
            <p style="margin: 6px 0 0; color: #bbbbbb; font-size: 10px; text-transform: uppercase; letter-spacing: 1.2px;">
              © ${new Date().getFullYear()} • Créé avec passion par SlowFocus
            </p>
          </footer>
        </div>
      </body>
    </html>
  `;

  const mailOptions = {
    from: `"Lighthouse Finance" <${process.env.EMAIL_USER}>`,
    to: process.env.EMAIL_TO,
    subject: `Lighthouse Finance : ${new Date().toLocaleDateString("fr-FR")}`,
    html: htmlFinal,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(
      green(`✅ Newsletter envoyée avec succès à ${process.env.EMAIL_TO} !`),
    );
  } catch (error) {
    console.log(red("❌ Erreur :"), error.message);
  }
}
// --- FONCTION PRINCIPALE (AUTO-EXÉCUTANTE) ---
async function runVeille() {
  console.log(cyan(" Lancement automatique de la veille..."));

  // 1. On collecte
  const articles = await collecterArticles();

  // 2. On analyse si on a des résultats
  if (articles.length > 0) {
    const synthese = await mainAI(articles);
    // 3. On envoie le mail
    if (synthese && synthese !== "Erreur d'analyse IA.") {
      await envoyerEmail(synthese);
    }
  } else {
    console.log(yellow("📭 Aucun nouvel article trouvé aujourd'hui."));
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
