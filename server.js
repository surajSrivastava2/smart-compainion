const express = require("express");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs");
const pdfParse = require("pdf-parse");
require("dotenv").config();

const OpenAI = require("openai");

const app = express();
app.use(cors());
app.use(express.json());

// 🔥 OpenAI setup
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// 📁 Multer setup (PDF upload)
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  }
});
const upload = multer({ storage });

// 📌 Home route
app.get("/", (req, res) => {
  res.send("Smart Companion Backend Running 🚀");
});

// 📤 Upload PDF
app.post("/upload", upload.single("pdf"), (req, res) => {
  res.json({
    message: "File uploaded successfully",
    filePath: req.file.path
  });
});

// 📄 Extract text from PDF
async function extractText(filePath) {
  const dataBuffer = fs.readFileSync(filePath);
  const data = await pdfParse(dataBuffer);
  return data.text;
}

// 🤖 1. Summarize PDF
app.post("/ai/summarize", async (req, res) => {
  try {
    const { filePath } = req.body;

    const text = await extractText(filePath);

    const response = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        { role: "system", content: "Summarize the following text in bullet points" },
        { role: "user", content: text }
      ]
    });

    res.json({ summary: response.choices[0].message.content });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🧠 2. Quiz Generator
app.post("/ai/quiz", async (req, res) => {
  try {
    const { text, difficulty } = req.body;

    const prompt = `Generate a ${difficulty} level quiz (MCQs with answers) from this:\n${text}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [{ role: "user", content: prompt }]
    });

    res.json({ quiz: response.choices[0].message.content });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 💬 3. AI Tutor
app.post("/ai/ask", async (req, res) => {
  try {
    const { question } = req.body;

    const response = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [{ role: "user", content: question }]
    });

    res.json({ answer: response.choices[0].message.content });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🚀 Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
