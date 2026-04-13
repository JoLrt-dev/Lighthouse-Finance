export function generateNewsletterTemplate(syntheseIA) {
  // On prépare le contenu : conversion des retours à la ligne en balises HTML
  const formattedContent = syntheseIA.replace(/\n/g, "<br/>");

  return `
<mjml>
  <mj-head>
    <mj-title>Lighthouse Finance</mj-title>
    <mj-attributes>
      <mj-all font-family="'Helvetica Neue', Helvetica, Arial, sans-serif" />
      <mj-text font-size="15px" color="#333333" line-height="1.7" />
    </mj-attributes>
    <mj-style inline="inline">
      .header-title { letter-spacing: 5px; text-transform: uppercase; }
    </mj-style>
  </mj-head>
  <mj-body background-color="#ffffff">
    
    <mj-section padding-top="40px" padding-bottom="50px">
      <mj-column>
        <mj-text align="center" font-family="Georgia, serif" font-size="26px" css-class="header-title">
          Lighthouse Finance
        </mj-text>
        <mj-text align="center" font-size="11px" color="#999999" text-transform="uppercase" letter-spacing="3px" padding-top="10px">
          Les actus de la semaine
        </mj-text>
      </mj-column>
    </mj-section>

    <mj-section padding-bottom="40px">
      <mj-column width="100%">
        <mj-text>
          ${formattedContent}
        </mj-text>
      </mj-column>
    </mj-section>

    <mj-section padding-top="40px">
      <mj-column width="100%" border-top="1px solid #f2f2f2" padding-top="20px">
        <mj-text align="center" color="#999999" font-size="12px" letter-spacing="0.5px" padding-bottom="0px">
          Généré par <span style="color: #666666; font-weight: bold;">Lighthouse Finance AI</span>
        </mj-text>
        <mj-text align="center" color="#bbbbbb" font-size="10px" text-transform="uppercase" letter-spacing="1.2px" padding-top="8px">
          © ${new Date().getFullYear()} • Créé avec passion par SlowFocus
        </mj-text>
      </mj-column>
    </mj-section>

  </mj-body>
</mjml>
  `;
}