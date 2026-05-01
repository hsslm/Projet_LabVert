import express from "express";
import cors from "cors";
import { MongoClient } from "mongodb";

const app = express();
app.use(cors());
app.use(express.json());

// Connexion MongoDB
const uri = process.env.MONGODB_URI || "mongodb+srv://hajjamiselma_db_user:hPqC7Kks6lIMhoRL@labvert-cloud.fyg0v3g.mongodb.net/LabVert?retryWrites=true&w=majority&appName=LabVert-cloud";

let client;

async function connectMongoDB() {
  try {
    client = new MongoClient(uri);
    await client.connect();
    console.log("Connecté à MongoDB !");
    return true;
  } catch (err) {
    console.error("Erreur de connexion MongoDB:", err.message);
    return false;
  }
}

// Démarrage du serveur après connexion MongoDB
const PORT = process.env.API_PORT || 3000;

connectMongoDB().then(success => {
  if (success) {
    app.listen(PORT, () => {
      console.log(`API LabVert en marche sur le port ${PORT}`);
    });
  } else {
    console.error("Impossible de démarrer le serveur sans MongoDB");
    process.exit(1);
  }
});

// Reçoit les données du capteur ESP32 et les sauvegarde en DB
app.post("/data", async (req, res) => {
  try {
    const { temperature, humidity } = req.body;
    const db = client.db("LabVert");
    const collection = db.collection("mesures");
    await collection.insertOne({ temperature, humidity, date: new Date() });
    res.json({ message: "Données enregistrées" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// Retourne la dernière mesure (utilisée par le dashboard)
app.get("/latest/", async (req, res) => {
  const db = client.db("LabVert");
  const data = await db.collection("mesures").find().sort({ date: -1 }).limit(1).toArray();
  if (!data.length) return res.json({ erreur: "Aucune donnée" });
  res.json({ temperature: data[0].temperature, humidity: data[0].humidity });
});

// Retourne les statistiques des 50 dernières mesures (min, max, moyenne, médiane)
app.get("/stats/", async (req, res) => {
  const db = client.db("LabVert");
  const data = await db.collection("mesures").find().sort({ date: -1 }).limit(50).toArray();
  if (!data.length) return res.json({ erreur: "Aucune donnée" });

  const temps = data.map(d => d.temperature).sort((a, b) => a - b);
  const hums  = data.map(d => d.humidity).sort((a, b) => a - b);
  const moy   = arr => arr.reduce((s, v) => s + v, 0) / arr.length;
  const med   = arr => arr[Math.floor(arr.length / 2)];

  res.json({
    labels: data.map(d => new Date(d.date).toLocaleTimeString('fr-CA')).reverse(),
    temperature: { historique: data.map(d => d.temperature).reverse(), moyenne: +moy(temps).toFixed(1), mediane: +med(temps).toFixed(1), minimum: temps[0], maximum: temps[temps.length - 1] },
    humidite:    { historique: data.map(d => d.humidity).reverse(),    moyenne: +moy(hums).toFixed(1),  mediane: +med(hums).toFixed(1),  minimum: hums[0],  maximum: hums[hums.length - 1] }
  });
});

// Liste des plantes disponibles pour le sélecteur du dashboard
app.get("/plantes", (req, res) => {
  res.json([
    "Aloe Vera","Basilic","Lavande","Menthe","Pothos","Monstera","Ficus","Cactus","Orchidée",
    "Palmier Areca","Sansevieria","Philodendron","Romarin","Thym","Jasmin","Hibiscus","Geranium",
    "Yucca","Dracaena","Chlorophytum","Begonia","Fougère","Calathea","Zamioculcas","Tradescantia",
    "Anthurium","Rosier","Tulipe","Marguerite","Bambou"
  ]);
});

