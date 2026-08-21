import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import analyzeRoute from "./routes/analyzeRoute.js";
import { MongoClient } from "mongodb";

dotenv.config();

const app = express();

app.use(cors());

app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ limit: "20mb", extended: true }));

app.use("/analyze", analyzeRoute);

/* ---------- MongoDB Connection ---------- */

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

let db;

async function connectDB() {
  try {
    await client.connect();
    db = client.db("smartbuy");
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection error:", error);
  }
}

/* ---------- Test Route ---------- */

app.get("/", (req, res) => {
  res.json({ message: "SmartBuy Backend Running" });
});

/* ---------- Save Result API ---------- */

app.post("/api/save-result", async (req, res) => {
  try {
    // ✅ Safety check
    if (!db) {
      return res.status(500).json({ error: "Database not connected" });
    }

    const { userId, result, formInputs, imagePreview, createdAt } = req.body;

    const savedResult = {
      userId,
      result,
      formInputs,
      imagePreview,
      createdAt
    };

    const collection = db.collection("saved_results");

    const response = await collection.insertOne(savedResult);

    res.json({
      success: true,
      message: "Result saved successfully",
      id: response.insertedId
    });

  } catch (error) {
    console.error("Save result error:", error);
    res.status(500).json({ success: false });
  }
});

/* ---------- Get Saved Results ---------- */

app.get("/api/saved-results/:userId", async (req, res) => {
  try {
    if (!db) {
      return res.status(500).json({ error: "Database not connected" });
    }

    const userId = req.params.userId;

    const results = await db
      .collection("saved_results")
      .find({ userId })
      .sort({ createdAt: -1 })
      .toArray();

    res.json(results);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch results" });
  }
});

/* ---------- Server ---------- */

const PORT = process.env.PORT || 5001;

// ✅ IMPORTANT FIX: Wait for DB before starting server
(async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
})();