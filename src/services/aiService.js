import { GoogleGenAI } from "@google/genai";

export async function aiAnalysis(articles) {
  const genAI = new GoogleGenAI(process.env.GEMINI_API_KEY);
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

  try {
    const result = await genAI.models.generateContent({
      model: "gemini-3-flash-preview", // ou gemini-2.0-flash selon tes tests
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
