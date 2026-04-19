function formatContent(text) {
  const styleTitreSection =
    "font-family: Georgia, serif; font-size: 20px; color: #D97706; margin-top: 35px; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 1px; display: block;";
  const styleLibelle =
    "font-family: Helvetica, Arial, sans-serif; font-size: 16px; color: #111111; font-weight: bold; display: block; margin-top: 22px; margin-bottom: 4px;";

  return (
    text
      // 1. Nettoyage Maureen + Guillemets
      .replace(/Maureen, /g, "")
      .replace(/^["'«](.*)["'»]$/gm, "$1")

      // 2. SÉPARATEURS
      .replace(
        /---/g,
        '<div style="padding: 10px 0;"><hr style="border: 0; border-top: 1px solid #d9d7d7;"></div>',
      )

      // 3. TITRES DE SUJETS (###)
      .replace(/### (.*)/g, `<span style="${styleTitreSection}">$1</span>`)

      // 4. LOGIQUE SLIDES (Prioritaire sur le gras générique)
      .replace(
        /^-?\s?\*?\*?(Slide \d+.*?):?\*?\*?\s?:\s?\n?\*?\*?(.*)/gm,
        '<div style="margin-bottom: 4px; font-size: 15px; color: #333333;">- <strong style="color: #111111;">$1 :</strong> $2</div>',
      )

      // 5. LIBELLÉS NUMÉROTÉS (Seulement en début de ligne pour éviter de casser les chiffres dans le texte)
      .replace(/^(\d\. .*? :)/gm, `<span style="${styleLibelle}">$1</span>`)

      // 6. ACTION CONCRÈTE (On cible spécifiquement ce libellé pour le style)
      .replace(
        /(Conseil pratique|Action concrète) ?:/gi,
        '<strong style="color: #111111; text-decoration: underline;">$1 :</strong>',
      )

      // 7. GRAS GÉNÉRIQUE (On nettoie les ** restantes)
      .replace(/\*\*(.*?)\*\*/g, '<strong style="color: #111111;">$1</strong>')
      .replace(/\*\*/g, "")

      // 8. CONCLUSION
      .replace(
        /Conclusion globale : (.*)/g,
        `<div style="margin-top: 40px; padding-top: 20px; border-top: 1px double #eeeeee; font-style: italic; color: #555; font-size: 15px;"><strong>Conclusion :</strong> $1</div>`,
      )

      // 9. FINALISATION
      .replace(/\n/g, "<br/>")
      // Nettoyage des doubles sauts de ligne après les blocs structurés
      .replace(/<\/span><br\/>/g, "</span>")
      .replace(/<\/div><br\/>/g, "</div>")
      .replace(/<br\/><br\/><br\/>/g, "<br/><br/>")
  );
}
export function generateNewsletterTemplate(syntheseIA) {
  const finalHtml = formatContent(syntheseIA);
  const formattedDate = new Date().toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return `
<mjml>
  <mj-head>
    <mj-title>Lighthouse Finance</mj-title>
    <mj-attributes>
      <mj-all font-family="'Helvetica Neue', Helvetica, Arial, sans-serif" />
    </mj-attributes>
  </mj-head>
  <mj-body background-color="#f4f4f4">
    
    <mj-section background-color="#ffffff" padding-top="40px">
      <mj-column>
        <mj-text align="center" font-family="Georgia, serif" font-size="28px" letter-spacing="4px" color="#111111">
          LIGHTHOUSE FINANCE
        </mj-text>
        <mj-text align="center" font-size="13px" color="#999999" text-transform="uppercase" letter-spacing="2px" padding-top="0px">
          L'actu de la semaine du ${formattedDate}
        </mj-text>
        <mj-divider border-width="1px" border-color="#f2f2f2" width="50px" />
      </mj-column>
    </mj-section>

    <mj-section background-color="#ffffff" padding-bottom="40px">
      <mj-column width="100%">
        <mj-text font-size="15px" color="#333333" line-height="1.7">
          ${finalHtml}
        </mj-text>
      </mj-column>
    </mj-section>

    <mj-section padding-top="40px" padding-bottom="40px">
      <mj-column width="100%">
        <mj-divider border-width="1px" border-color="#e0e0e0" width="100%" />
        
        <mj-text align="center" color="#999999" font-size="12px" letter-spacing="0.5px" padding-top="30px" padding-bottom="0px">
          Généré par <span style="color: #666666; font-weight: bold;">Lighthouse Finance AI</span>
        </mj-text>
        
        <mj-text align="center" color="#bbbbbb" font-size="10px" text-transform="uppercase" letter-spacing="1.2px" padding-top="8px">
          © ${new Date().getFullYear()} • Création caféinée par <span style="color: #D97706; font-weight: bold;">SlowFocus</span>
        </mj-text>
      </mj-column>
    </mj-section>

  </mj-body>
</mjml>
  `;
}
