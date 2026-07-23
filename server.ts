import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import { 
  loadDatabaseState, 
  saveDatabaseState, 
  resetDatabaseState,
  getFirestoreDB
} from "./dbManager";

dotenv.config();

let aiClient: GoogleGenAI | null = null;

// Lazy initialization to prevent app crash if key is not yet configured
function getGenAI(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is not set. Please configure it in your Secrets / Settings.");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

async function startServer() {
  // Check if Firebase connection is active and log it
  const db = getFirestoreDB();
  if (db) {
    console.log("[SERVER] Database Provider: Cloud Firestore is active!");
  } else {
    console.log("[SERVER] Database Provider: Local file (db.json) is active!");
  }

  // Pre-fetch/initialize database
  await loadDatabaseState();

  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "20mb" }));

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ 
      status: "ok", 
      database: db ? "Firestore" : "Local JSON", 
      timestamp: new Date().toISOString() 
    });
  });

  // Get full database state
  app.get("/api/data", async (req, res) => {
    try {
      const data = await loadDatabaseState();
      res.json(data);
    } catch (error: any) {
      console.error("[DB ERROR] Failed to read database:", error);
      res.status(500).json({ error: "Failed to read database state", details: error.message });
    }
  });

  // Save full database state
  app.post("/api/data", async (req, res) => {
    try {
      const { rotations, rooms, tickets, appraisals, soKhambenhData, phatthuocData, baocaotonData } = req.body;
      if (!rotations || !rooms || !tickets || !appraisals) {
        res.status(400).json({ error: "Invalid database payload. Core collections must be present." });
        return;
      }
      const data = { 
        rotations, 
        rooms, 
        tickets, 
        appraisals,
        soKhambenhData: soKhambenhData || [],
        phatthuocData: phatthuocData || [],
        baocaotonData: baocaotonData || []
      };
      await saveDatabaseState(data);
      res.json({ success: true, timestamp: new Date().toISOString() });
    } catch (error: any) {
      console.error("[DB ERROR] Failed to save database:", error);
      res.status(500).json({ error: "Failed to save database state", details: error.message });
    }
  });

  // Reset database state to mock defaults
  app.post("/api/data/reset", async (req, res) => {
    try {
      const defaultData = await resetDatabaseState();
      res.json({ success: true, message: "Database reset to factory defaults", data: defaultData });
    } catch (error: any) {
      console.error("[DB ERROR] Failed to reset database:", error);
      res.status(500).json({ error: "Failed to reset database state", details: error.message });
    }
  });


  // Gemini AI Assistant proxy endpoint
  app.post("/api/gemini/assist", async (req, res) => {
    const { prompt, context } = req.body;

    if (!prompt) {
      res.status(400).json({ error: "Prompt is required" });
      return;
    }

    try {
      const ai = getGenAI();
      const systemInstruction = `You are the intelligent School Health AI Assistant (Trợ lý Y tế Học đường AI) for "PTDTBT HEALTH PRO" (Cổng Quản lý Y tế & Nội trú Học đường).
Your goal is to assist the School Medical Officer (Cán bộ Y tế trường học), homeroom teachers, and boarding students with tasks like:
1. Reviewing school clinic visit logs or medical event forms and offering first aid guidelines, dietary or rest suggestions, and preventative health recommendations.
2. Answering pediatric and general health questions based on standard clinical guidelines (Vietnam Ministry of Health and international pediatric standards).
3. Drafting boarding school announcements, sanitation schedules, vector control notifications (e.g. dengue prevention), and hygiene rules for dorm rooms.
4. Guiding on nutritional menus, physical development goals (BMI, height tracking), and basic school emergency protocols (e.g. choking, fever, food poisoning, heatstroke).

Strict guidelines:
- Answer in the same language as the user's prompt (primarily Vietnamese or English).
- Be professional, evidence-based, supportive, clear, and reassuring.
- When giving medical suggestions, remind them that this is an AI tool for educational and school health management reference, and critical situations or severe symptoms require direct professional medical evaluation or hospital transfer.`;

      const contents = context ? `Context: ${JSON.stringify(context)}\n\nPrompt: ${prompt}` : prompt;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      res.json({ result: response.text });
    } catch (error: any) {
      console.error("Gemini API Error:", error);
      res.status(500).json({
        error: error.message || "An error occurred during AI processing",
        details: "Please verify that the GEMINI_API_KEY is properly set in your Secrets panel in Google AI Studio."
      });
    }
  });

  // Vite middleware for development vs static serve for production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[PTDTBT PRO 3.0] Server running on http://localhost:${PORT}`);
  });
}

startServer();
