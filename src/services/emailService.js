import mjml2html from "mjml";
import nodemailer from "nodemailer";
import { generateNewsletterTemplate } from "../templates/newsletter.js";

export async function sendEmail(syntheseIA) {
  // 1. Génération du code MJML à partir de la synthèse
  const mjmlCode = generateNewsletterTemplate(syntheseIA);

  // 2. Conversion du MJML en HTML pur (compréhensible par Gmail, Outlook, etc.)
  const { html, errors } = mjml2html(mjmlCode);

  if (errors.length > 0) {
    throw new Error(
      `Erreur MJML : ${errors.map((e) => e.formattedMessage).join(", ")}`,
    );
  }

  // 3. Configuration du transporteur SMTP
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT || 465,
    secure: true, // true pour le port 465
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // 4. Définition des options du mail
  const mailOptions = {
    from: `"Lighthouse Finance" <${process.env.EMAIL_USER}>`,
    to: process.env.EMAIL_TO.split(","),
    subject: `Lighthouse Finance : Les actualités de la semaine`,
    html: html, // On injecte ici le résultat du rendu MJML
  };

  // 5. Envoi
  try {
    const info = await transporter.sendMail(mailOptions);
    return info;
  } catch (error) {
    throw new Error(`Erreur lors de l'envoi de l'email : ${error.message}`);
  }
}
