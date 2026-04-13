import "dotenv/config";
import express from "express";
import { cyan, yellow, red, green } from "colorette";
import { GoogleGenAI } from "@google/genai";
import nodemailer from "nodemailer";
import { RSS_FEEDS } from "./src/config/feeds";
import { collecterArticles } from "./src/services/rssService.js";
import { aiAnalysis } from "./src/services/aiService.js";

const app = express();
const port = process.env.APP_PORT || 3000;
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// --- UTILITAIRE : LOADER ---
function createLoader(text) {
  const chars = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
  let i = 0;
  return setInterval(() => {
    process.stdout.write(`\r${cyan(chars[i++ % chars.length])} ${text}`);
  }, 100);
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
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="fr">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Lighthouse Finance</title>
  <style type="text/css">
    /* Quelques resets pour les clients mails modernes */
    body { margin: 0; padding: 0; min-width: 100%; width: 100% !important; }
    img { line-height: 100%; outline: none; text-decoration: none; border: 0; }
    table { border-collapse: collapse !important; }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #ffffff; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%;">
  
  <table border="0" cellpadding="0" cellspacing="0" width="100%" bgcolor="#ffffff" role="presentation">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        
        <table border="0" cellpadding="0" cellspacing="0" width="600" style="max-width: 600px; width: 100%;" role="presentation">
          
          <tr>
            <td align="center" style="padding-bottom: 50px;">
              <h1 style="font-family: Georgia, serif; font-size: 26px; font-weight: normal; letter-spacing: 5px; text-transform: uppercase; color: #000000; margin: 0;">
                Lighthouse Finance
              </h1>
              <p style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 11px; color: #999999; text-transform: uppercase; letter-spacing: 3px; margin: 10px 0 0 0;">
                Les actus de la semaine
              </p>
            </td>
          </tr>

          <tr>
            <td align="left" style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 15px; color: #333333; line-height: 1.7; padding-bottom: 40px;">
              ${corpsEmail}
            </td>
          </tr>

          <tr>
            <td align="center" style="border-top: 1px solid #f2f2f2; padding-top: 40px;">
              <p style="font-family: Arial, sans-serif; margin: 0; color: #999999; font-size: 12px; letter-spacing: 0.5px;">
                Généré par <strong style="color: #666666;">Lighthouse Finance AI</strong>
              </p>
              <p style="font-family: Arial, sans-serif; margin: 8px 0 0; color: #bbbbbb; font-size: 10px; text-transform: uppercase; letter-spacing: 1.2px;">
                © ${new Date().getFullYear()} • Créé avec passion par SlowFocus
              </p>
            </td>
          </tr>

        </table>
        </td>
    </tr>
  </table>

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
  try {
    // 1. On collecte
    const articles = await collecterArticles(RSS_FEEDS);
    // 2. On analyse si on a des résultats
    if (articles.length > 0) {
      const synthese = await aiAnalysis(articles, process.env.GEMINI_API_KEY);
      // 3. On envoie le mail
      if (synthese && synthese !== "Erreur d'analyse IA.") {
        await envoyerEmail(synthese);
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
// async function runVeille() {
//   console.log(cyan(" Lancement automatique de la veille..."));

//   // 1. On collecte
//   const articles = await collecterArticles();

//   // 2. On analyse si on a des résultats
//   if (articles.length > 0) {
//     const synthese = await mainAI(articles);
//     // 3. On envoie le mail
//     if (synthese && synthese !== "Erreur d'analyse IA.") {
//       await envoyerEmail(synthese);
//     }
//   } else {
//     console.log(yellow("📭 Aucun nouvel article trouvé aujourd'hui."));
//   }
// }

// --- INITIALISATION DU SERVEUR ---
app.listen(port, async () => {
  console.log(cyan("=================================================="));
  console.log(green(`🚀 Lighthouse Server actif sur le port ${port}`));
  console.log(cyan("=================================================="));

  // --- DÉCLENCHEMENT AUTOMATIQUE ---
  // On lance la veille dès que le serveur est prêt
  await runVeille();
});
