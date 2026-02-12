require("dotenv").config(); // Charge les variables du fichier .env
const port = process.env.APP_PORT || 3000; // Utilise le port du .env, ou 3000 par défaut
