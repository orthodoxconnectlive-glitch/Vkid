import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy GoogleGenAI initialization
function getAiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
}

// API Health Check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "VKid Server" });
});

// AI Learning Insights Generator for Parents
app.post("/api/ai/insights", async (req, res) => {
  try {
    const { childName, age, gameStats, timeSpentMinutes } = req.body;
    const ai = getAiClient();

    if (!ai) {
      return res.json({
        success: true,
        insight: `${childName} (Age ${age}) has spent ${timeSpentMinutes} minutes learning today! Excellent progress in Math and Memory games. Recommended next focus: Phonics and Word Building.`
      });
    }

    const prompt = `You are a child development expert and educational psychologist. 
Analyze the following learning stats for a child on the VKid app:
- Child Name: ${childName}
- Age: ${age}
- Time Spent Today: ${timeSpentMinutes} minutes
- Recent Activity: ${JSON.stringify(gameStats)}

Provide 3 brief, encouraging, actionable pedagogical insights and 2 recommended activity suggestions for parents to do together at home. Keep tone warm, clear, and structured.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    res.json({
      success: true,
      insight: response.text || "Insight generated successfully."
    });
  } catch (err: any) {
    console.error("AI Insights Error:", err);
    res.status(500).json({
      success: false,
      error: err.message || "Failed to generate AI insights."
    });
  }
});

// Custom Bedtime Story / Math Quest Generator for Kids
app.post("/api/ai/generate-story", async (req, res) => {
  try {
    const { childName, theme, ageGroup } = req.body;
    const ai = getAiClient();

    if (!ai) {
      return res.json({
        success: true,
        title: `The Great ${theme} Adventure`,
        story: `Once upon a time, ${childName} embarked on an exciting ${theme} journey. Along the way, friendly animals shared fun puzzles to solve!`,
        puzzle: {
          question: `If ${childName} finds 3 shiny stars and 2 moon gems, how many magical items are there in total?`,
          options: ["4", "5", "6"],
          answer: "5"
        }
      });
    }

    const prompt = `Create a short, engaging, child-friendly 3-paragraph story for a child named ${childName} (Age group ${ageGroup}) themed around "${theme}".
Return a JSON object with:
- title: story title
- story: text of the story (kid friendly)
- puzzle: a fun mini math or word question embedded in the story with options (array of 3 strings) and answer (string matching options).`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const parsed = JSON.parse(response.text || "{}");
    res.json({
      success: true,
      ...parsed
    });
  } catch (err: any) {
    console.error("AI Story Error:", err);
    res.status(500).json({
      success: false,
      error: err.message || "Failed to generate story."
    });
  }
});

// Icon alias fallback for legacy manifest icons
app.get(["/icon-192.png", "/icon-512.png"], (req, res) => {
  const publicIcon = path.join(process.cwd(), "public", "icon.svg");
  const distIcon = path.join(process.cwd(), "dist", "icon.svg");
  const fs = require("fs");
  if (fs.existsSync(publicIcon)) {
    return res.sendFile(publicIcon);
  }
  if (fs.existsSync(distIcon)) {
    return res.sendFile(distIcon);
  }
  res.status(404).send("Icon not found");
});

// Start Server with Vite Middleware
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      // Return 404 for missing static assets to prevent MIME type script load errors
      const isStaticAsset = /\.(js|css|json|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot|map)$/i.test(req.path) || req.path.startsWith("/assets/");
      if (isStaticAsset) {
        return res.status(404).type("text/plain").send("Asset not found");
      }
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`VKid App server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
