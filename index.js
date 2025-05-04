const express = require('express');
const cors = require('cors');

const Groq = require("groq-sdk");
const dotenv = require('dotenv');
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
    prompt += `\nProvide a list of just song titles and artists. do not give desciptions or any other information. makle sure to include the artist name in the format "Song Title - Artist Name".\n`;
    prompt += `\n\nPlease provide a list of 5 songs that are not well known, but are good for an Instagram post.\n`;
     prompt += `\nmake sure the content is about songs and msuics only and no sort of aduilt content or non musical content is presaent in the reply.\n`;


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

app.get('/', (req, res) => {
  res.send('Running');
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});

