import express from 'express';
import cors from 'cors';
import Groq from "groq-sdk";
import dotenv from 'dotenv';
dotenv.config();


const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

app.post('/music-suggestions', async (req, res) => {
  try {
    const { description, mood, genre, language } = req.body;
    console.log("Received request:", req.body);

    // Basic validation
    if (!description && !mood && !genre && !language) {
      return res.status(400).json({ error: "Please provide at least one input." });
    }

    // Build the prompt
    let prompt = `underated 5 songs for instagram post with the following characteristics:\n`;
    if (description) prompt += `- Description: ${description}\n`;
    if (mood) prompt += `- Mood: ${mood}\n`;
    if (genre) prompt += `- Genre: ${genre}\n`;
    if (language) prompt += `- Language: ${language}\n`;
    prompt += `\nProvide a list of just song titles and artists. do not give desciptions or any other information.`;

    console.log("Constructed prompt:", prompt);

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile", // Consider switching to this known stable model
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const resultText = completion.choices[0]?.message?.content || "No suggestions returned.";
    console.log("Received response:", resultText);
    const suggestions = resultText.split('\n').filter(line => line.trim() !== '');

    res.json({ suggestions });
  } catch (error) {
    console.error("Google GenAI API Error:", error);
    res.status(500).json({ error: "Failed to generate suggestions" });
  }
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});

