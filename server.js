const express = require("express");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs");
const pdfParse = require("pdf-parse");
require("dotenv").config();

const OpenAI = require("openai");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// 📁 Upload setup
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  }
});
const upload = multer({ storage });

// 🧠 Fake DB
let users = [];

// 🔐 Signup
app.post("/auth/signup", async (req, res) => {
  const { email, password } = req.body;
  const hashed = await bcrypt.hash(password, 10);
  users.push({ email, password: hashed });
  res.json({ message: "User created" });
});

// 🔐 Login
app.post("/auth/login", async (req, res) => {
  const { email, password } = req.body;

  const user = users.find(u => u.email === email);
  if (!user) return res.status(400).json({ error: "User not found" });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(400).json({ error: "Wrong password" });

  const token = jwt.sign({ email }, "secret123");
  res.json({ token });
});

// 📤 Upload PDF
app.post("/upload", upload.single("pdf"), (req, res) => {
  res.json({ filePath: req.file.path });
});

// 📄 Extract text
async function extractText(filePath) {
  const dataBuffer = fs.readFileSync(filePath);
  const data = await pdfParse(dataBuffer);
  return data.text;
}

// 🤖 Summarize
app.post("/ai/summarize", async (req, res) => {
  const { filePath } = req.body;
  const text = await extractText(filePath);

  const response = await openai.chat.completions.create({
    model: "gpt-4.1-mini",
    messages: [
      { role: "system", content: "Summarize in bullet points" },
      { role: "user", content: text }
    ]
  });

  res.json({ summary: response.choices[0].message.content });
});

// 🧠 Quiz
app.post("/ai/quiz", async (req, res) => {
  const { text, difficulty } = req.body;

  const response = await openai.chat.completions.create({
    model: "gpt-4.1-mini",
    messages: [
      {
        role: "user",
        content: `Generate ${difficulty} MCQs with answers:\n${text}`
      }
    ]
  });

  res.json({ quiz: response.choices[0].message.content });
});

// 💬 AI Chat
app.post("/ai/ask", async (req, res) => {
  const { question } = req.body;

  const response = await openai.chat.completions.create({
    model: "gpt-4.1-mini",
    messages: [{ role: "user", content: question }]
  });

  res.json({ answer: response.choices[0].message.content });
});

app.get("/", (req, res) => {
  res.send("Backend running 🚀");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log("Server running"));
