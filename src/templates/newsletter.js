function formatContent(text) {
  return (
    text
      // Titres ###
      .replace(
        /### (.*)/g,
        '<h2 style="font-family: Georgia, serif; font-size: 19px; color: #D97706; margin-top: 30px; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 1px;">$1</h2>',
      )
      // Gras **
      .replace(
        /\*\*(.*?)\*\*/g,
        '<strong style="color: #111111; font-weight: 700;">$1</strong>',
      )
      // Conclusion globale
      .replace(
        /Conclusion globale : (.*)/g,
        '<div style="margin-top: 40px; padding-top: 20px; border-top: 1px double #eeeeee; font-style: italic; color: #555;"><strong>Conclusion :</strong> $1</div>',
      )
      // Séparateurs ---
      .replace(
        /---/g,
        '<hr style="border: 0; border-top: 1px solid #f0f0f0; margin: 30px 0;">',
      )
      // Sauts de ligne
      .replace(/\n/g, "<br/>")
  );
}

export function generateNewsletterTemplate(syntheseIA) {
  const finalHtml = formatContent(syntheseIA);

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
          © ${new Date().getFullYear()} • Créé avec passion par <span style="color: #D97706; font-weight: bold;">SlowFocus</span>
        </mj-text>
      </mj-column>
    </mj-section>

  </mj-body>
</mjml>
  `;
}
