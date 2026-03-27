import express from "express";
import { MongoClient } from "mongodb";

const app = express();
app.use(express.json());

const uri = "mongodb+srv://hajjamiselma_db_user:hPqC7Kks6lIMhoRL@labvert-cloud.fyg0v3g.mongodb.net/?appName=LabVert-cloud"; 
const client = new MongoClient(uri);

app.post("/data", async (req, res) => {
  try {
    const { temperature, humidity } = req.body;

    await client.connect();
    const db = client.db("LabVert");
    const collection = db.collection("mesures");

    await collection.insertOne({
      temperature,
      humidity,
      date: new Date()
    });

    res.json({ message: "Données enregistrées" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

app.listen(3000, () => {
  console.log("API LabVert en marche sur le port 3000");
});