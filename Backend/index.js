import express from 'express';
import fileUpload from 'express-fileupload';
import dotenv from 'dotenv';
import axios from 'axios';
import { createRequire } from 'module';
import cors from 'cors';

const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');

dotenv.config();

const app = express();
app.use(fileUpload());
app.use(cors());

app.post('/upload', async (req, res) => {
  if (!req.files || !req.files.resume) {
    return res.status(400).send('No file uploaded');
  }

  const resumePDF = req.files.resume;
  const API_KEY = process.env.API_KEY;

  try {
    // Extract text from PDF
    const data = await pdfParse(resumePDF.data);
    const resumeText = data.text;

    // Prompt to send to AI
    const prompt = `
You are a professional resume reviewer. Analyze the following resume and return your feedback in **valid JSON format only**, using the following structure:

{
  "clarity_of_presentation": "",
  "strengths": "",
  "gaps_or_weak_areas": "",
  "suggestions_for_improvement": ""
}

Only return the JSON. Do not add any explanation or formatting.

Resume Text:
${resumeText}
`;

    // API call to OpenRouter
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "deepseek/deepseek-r1-0528-qwen3-8b:free",
        messages: [{ role: "user", content: prompt }],
      },
      {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
          "X-Title": "ResumeAnalyzer",
        },
      }
    );
    // Fix: axios response data access
    const aiResponse = response.data;
    // Extract JSON from AI response (removes code fences and extra text)
    let aiContent = aiResponse.choices[0].message.content;
    aiContent = aiContent.replace(/```json|```/g, '').trim();
    const firstBrace = aiContent.indexOf('{');
    const lastBrace = aiContent.lastIndexOf('}');
    let parsedJSON = {};
    
    if (firstBrace !== -1 && lastBrace !== -1) {
      const jsonString = aiContent.substring(firstBrace, lastBrace + 1);
      try {
        parsedJSON = JSON.parse(jsonString);
      } catch (jsonErr) {
        console.error("Raw AI response:", aiContent);
        console.error("JSON parsing error:", jsonErr.message);
        return res.status(500).json({
          error: "AI returned invalid JSON.",
          raw: aiContent
        });
      }
    } else {
      console.error("Raw AI response:", aiContent);
      return res.status(500).json({
        error: "No valid JSON found in AI response.",
        raw: aiContent
      });
    }

    // Return the AI response as-is
    res.json({
      resumeText,
      feedback: parsedJSON,
    });
  } catch (err) {
    console.error("Error:", err.message);
    res.status(500).send("Error processing resume or calling AI API.");
  }
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
