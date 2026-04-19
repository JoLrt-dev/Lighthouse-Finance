import { GoogleGenAI } from "@google/genai";

export async function aiAnalysis(articles) {
  const genAI = new GoogleGenAI(process.env.GEMINI_API_KEY);
  const financeList = articles
    .filter((a) => a.category === "FINANCE")
    .map(
      (a) => `- [FINANCE] ${a.titre} | SOURCE: ${a.source} | LIEN: ${a.lien}`,
    )
    .join("\n");

  const immoList = articles
    .filter((a) => a.category === "IMMO")
    .map((a) => `- [IMMO] ${a.titre} | SOURCE: ${a.source} | LIEN: ${a.lien}`)
    .join("\n");

  const techList = articles
    .filter((a) => a.category === "TECH")
    .map((a) => `- [TECH] ${a.titre} | SOURCE: ${a.source} | LIEN: ${a.lien}`)
    .join("\n");

  const prompt = `
En tant que "Lighthouse AI", analyse ces articles classés par catégorie:
FINANCE:
${financeList}

IMMOBILIER:
${immoList}

TECH:
${techList}
CONSIGNES DE FORMATAGE STRICTES :
1. Utilise "### " au début de chaque titre de sujet (ex: ### Titre).
2. Utilise "**" pour mettre en gras les libellés (ex: **1. Synthèse Expert :**).
3. Le lien doit être inséré SANS AUCUNE étoile autour, directement sous le titre.
    Si plusieurs sources traitent du même sujet, croise les informations et mentionne les différentes sources dans la synthèse, mais n'insère qu'un seul lien (celui de la source la plus pertinente ou récente).
4. Format du lien : <a href="LIEN_REEL" style="color: #D97706; text-decoration: none; font-weight: bold;">Lire sur SOURCE_REELLE</a>
5. NE JAMAIS utiliser de guillemets "" pour encadrer les paragraphes de synthèse ou de vulgarisation.
6. Pour la partie "Script Slides Instagram", le texte doit en gras uniquement les titres des slides (ex: **Slide 1:**). Le contenu de chaque slide doit être en texte normal, sans mise en forme supplémentaire. Ecris TOUTE la slide sur UNE SEULE LIGNE sans aucun retour à la ligne. 
   Format : Slide X : Contenu de la slide
7. NE JAMAIS mentionner le prénom "Maureen" dans les paragraphes de synthèse ou de vulgarisation. Parle-lui directement sans l'appeler par son nom à chaque sujet.
8. En début de mail, soit poli et dit bonjour, mais ensuite, adopte un ton direct et dynamique pour le reste de la newsletter. Evite les formules de politesse répétitives.


Ton objectif est de rédiger une newsletter de veille financière, aussi avec un petit point immo et crypto pour Maureen. Tutoies là. Evite l'utilisation d'emoji.

Pour la section finance, sélectionne les 3 sujets les plus pertinents de la catégorie [FINANCE], et respecte strictement la structure suivante :

---
### [TITRE DU SUJET]
** [URL_DE_L'ARTICLE] ** 

**1. Synthèse :**
Rédige un résumé technique mais concis. Croise les informations si plusieurs sources traitent du même sujet. Explique l'impact fiscal ou patrimonial (ex: modification du barème, nouvelle aide, évolution des taux).

**2. Angle de Vulgarisation :**
Donne l'idée directrice pour expliquer cela simplement à ses clients. Ton rassurant et dynamique.
**Conseil pratique**: Propose une action concrète (conseil pratique) qui peut être faite dès aujourd'hui pour anticiper ou profiter de cette actualité (ex: revoir les contrats d'assurance-vie, ajuster les prévisions de trésorerie, conseiller un produit spécifique).

**3. Script Slides Instagram :**
Propose un plan en 4 slides pour un carrousel :
- Slide 1 : Un titre "Hook" qui interpelle.
- Slide 2 : Ce qui change concrètement.
- Slide 3 : Ce qu'il faut faire maintenant.
- Slide 4: Une question pour engager l'audience.


### Le Point Immo
Identifie la news [IMMO] la plus marquante. 
** [URL_DE_L'ARTICLE] **  Résume l'enjeu en 3-4 lignes et donne un conseil pro pour Maureen. ** 
.

###  Le Point Tech/Crypto
Identifie la news [TECH] la plus pertinente. 
** [URL_DE_L'ARTICLE] ** 
 Résume l'impact sur le marché ou la régulation en 3-4 lignes. ** 
].

### Conclusion globale :
2-3 phrases maximum sur la tendance de fond de la semaine.
`;

  try {
    const result = await genAI.models.generateContent({
      model: "gemini-2.5-flash", // gemini-2.0-flash, gemini-3-flash-preview, gemini-3.1-pro-preview, gemini-pro-latest, gemini-2.5-flash-lite
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        topP: 0.8,
      },
    });

    if (result && result.candidates && result.candidates[0].content) {
      const texteGenere = result.candidates[0].content.parts[0].text;
      console.log("✅ Texte extrait avec succès");
      return texteGenere;
    } else {
      console.log("Structure reçue :", JSON.stringify(result, null, 2));
      throw new Error("La structure de réponse Gemini est inattendue.");
    }
  } catch (error) {
    console.log("⚠️ Erreur lors de l'extraction :", error.message);
    throw error;
  }
}
