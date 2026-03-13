import express from "express";
import cors from "cors";
import { MongoClient } from "mongodb";

const app = express();
app.use(cors());
app.use(express.json());

const uri = "mongodb://hajjamiselma_db_user:hPqC7Kks6lIMhoRL@ac-xh8jbhi-shard-00-00.fyg0v3g.mongodb.net:27017,ac-xh8jbhi-shard-00-01.fyg0v3g.mongodb.net:27017,ac-xh8jbhi-shard-00-02.fyg0v3g.mongodb.net:27017/?ssl=true&replicaSet=atlas-j6agm8-shard-0&authSource=admin&appName=LabVert-cloud";

const client = new MongoClient(uri);

await client.connect();
console.log("Connecté à MongoDB !");

// Réception des données envoyées par l'ESP32
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

// Récupération des 10 dernières mesures
app.get("/mesures", async (req, res) => {
  try {
    const db = client.db("LabVert");
    const data = await db.collection("mesures").find().sort({ date: -1 }).limit(10).toArray();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});
// Dernière mesure
app.get("/latest/", async (req, res) => {
  const db = client.db("LabVert");
  const data = await db.collection("mesures").find().sort({ date: -1 }).limit(1).toArray();
  if (!data.length) return res.json({ erreur: "Aucune donnée" });
  res.json({ temperature: data[0].temperature, humidity: data[0].humidity });
});

// Statistiques
app.get("/stats/", async (req, res) => {
  const db = client.db("LabVert");
  const data = await db.collection("mesures").find().sort({ date: -1 }).limit(50).toArray();
  if (!data.length) return res.json({ erreur: "Aucune donnée" });

  const temps = data.map(d => d.temperature).sort((a,b) => a-b);
  const hums  = data.map(d => d.humidity).sort((a,b) => a-b);
  const moy   = arr => arr.reduce((s,v) => s+v, 0) / arr.length;
  const med   = arr => arr[Math.floor(arr.length/2)];

  res.json({
    labels: data.map(d => new Date(d.date).toLocaleTimeString('fr-CA')).reverse(),
    temperature: { historique: data.map(d => d.temperature).reverse(), moyenne: +moy(temps).toFixed(1), mediane: +med(temps).toFixed(1), minimum: temps[0], maximum: temps[temps.length-1] },
    humidite:    { historique: data.map(d => d.humidity).reverse(),    moyenne: +moy(hums).toFixed(1),  mediane: +med(hums).toFixed(1),  minimum: hums[0],  maximum: hums[hums.length-1] }
  });
});
app.listen(3000, () => {
  console.log("API LabVert en marche sur le port 3000");
});