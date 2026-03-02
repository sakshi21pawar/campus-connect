const express = require("express");
const router = express.Router();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const protect = require("../middleware/authMiddleware");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const SYSTEM_PROMPT = `
You are CampusBot, a helpful AI assistant for college students.
You specialize in:
1. Placement preparation — resume tips, interview questions, DSA, aptitude
2. Study tips & resources — how to study, recommended books, YouTube channels
3. College/Campus FAQs — how semester exams work, attendance rules, backlogs, etc.

Keep responses friendly, concise, and student-focused.
If someone asks something outside these topics, politely redirect them.
`;

router.post("/chat", protect, async (req, res) => {
  console.log("1. Route hit");
  console.log("2. Message:", req.body.message);
  console.log("KEY LOADED:", process.env.GEMINI_API_KEY);

  try {
    const { message, history } = req.body;

const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });


    const chat = model.startChat({
      history: [
        {
          role: "user",
          parts: [{ text: SYSTEM_PROMPT }],
        },
        {
          role: "model",
          parts: [{ text: "Got it! I'm CampusBot, ready to help with placements, study tips, and campus FAQs." }],
        },
        ...history,
      ],
    });

    const result = await chat.sendMessage(message);
    const response = result.response.text();

    console.log("3. Reply received from Gemini ✅");
    res.json({ reply: response });

  } catch (err) {
    console.error("Gemini Error:", err.message);
    res.status(500).json({ message: "AI service failed. Try again." });
  }
});

module.exports = router;