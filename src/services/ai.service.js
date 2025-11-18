require('dotenv').config();
const axios = require('axios');

const GEMINI_KEY = process.env.GEMINI_API_KEY || '';
const HF_TOKEN = process.env.HF_TOKEN || '';

/**
 * Helper: clean and try to parse JSON within AI text
 */
function tryParseJSONFromText(text) {
  if (!text || typeof text !== 'string') return text;
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start !== -1 && end !== -1) {
    const candidate = text.slice(start, end + 1);
    try {
      return JSON.parse(candidate);
    } catch (e) {
      // return raw text fallback
      return text;
    }
  }
  return text;
}

/* ---------- Gemini call ---------- */
async function callGemini(prompt, maxTokens = 800) {
  if (!GEMINI_KEY) throw new Error('GEMINI_API_KEY not configured');
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`;
  const body = {
    contents: [
      {
        role: 'user',
        parts: [{ text: prompt }]
      }
    ],
    temperature: 0.2,
    candidate_count: 1,
    max_output_tokens: maxTokens
  };
  const res = await axios.post(url, body, { headers: { 'Content-Type': 'application/json' } });
  const raw = res.data?.candidates?.[0]?.content?.parts?.[0]?.text || res.data?.candidates?.[0]?.content?.[0]?.text || '';
  return raw;
}

/* ---------- HuggingFace text call (fallback) ---------- */
async function callHuggingFaceText(model, prompt, timeout = 60000) {
  if (!HF_TOKEN) throw new Error('HF_TOKEN not configured');
  const url = `https://api-inference.huggingface.co/models/${model}`;
  const res = await axios.post(url, { inputs: prompt }, {
    headers: { Authorization: `Bearer ${HF_TOKEN}` },
    timeout
  });
  const data = res.data;
  if (Array.isArray(data) && data[0]?.generated_text) return data[0].generated_text;
  if (typeof data === 'string') return data;
  if (data.generated_text) return data.generated_text;
  return JSON.stringify(data);
}

/* ---------- Transcription via HF Whisper (optional) ---------- */
async function transcribeAudioHF(audioBuffer, contentType = 'audio/webm') {
  if (!HF_TOKEN) throw new Error('HF_TOKEN not configured');
  const url = 'https://api-inference.huggingface.co/models/openai/whisper-small';
  const res = await axios.post(url, audioBuffer, {
    headers: { Authorization: `Bearer ${HF_TOKEN}`, 'Content-Type': contentType },
    timeout: 120000
  });
  // HF response may vary
  return res.data?.text || res.data?.transcription?.text || JSON.stringify(res.data);
}

/* ---------- Generate Learning Plan (structured JSON) ---------- */
async function generateLearningPlan(userData) {
  const prompt = `
You are an expert IELTS/TOEIC English learning planner. Your primary task is to identify the user's weaknesses and recommend the **minimum CEFR/IELTS Band level** of the study materials they need to use **right now** to achieve their target score.

Return ONLY valid JSON, no explanation, no markdown.

The JSON MUST follow exactly this structure:

{
  "summary": "short summary for UI display",
  "level_bucket": "A2 / B1 / B2 / C1 OR IELTS 4.0-5.0 / 5.0-6.0 / 6.0-7.0",
  "recommended_band_value": 0-9,
  "duration_weeks": ${userData.targetWeeks},
  "weekly_plan": [
    {
      "week": 1,
      "focus": ["Reading", "Vocabulary"],
      "goals": ["Master skimming and scanning B1 materials."],
      "assignments": [
        { "title": "Self-assessment Test", "type": "test", "id": "initial_test" }
      ],
      "resources": [
        // The 'level' field here is CRITICAL for the backend to filter the database.
        { "title": "DB Filter Tag: Listening Materials", "type": "tag", "level": "B1" },
        { "title": "DB Filter Tag: Writing Materials", "type": "tag", "level": "B2" }
      ]
    }
    // ... Continue for all ${userData.targetWeeks} weeks
  ],
  "recommended_materials": [
    // This array is for the general list of resource levels needed for the entire plan, for immediate DB look-up.
    { "title": "Required Listening Level", "type": "tag", "level": "B1" },
    { "title": "Required Writing Level", "type": "tag", "level": "B2" }
  ]
}

User profile:
- Target score: ${userData.targetScore}
- Current proficiency: ${JSON.stringify(userData.skills)}
- Target weeks: ${userData.targetWeeks}
- Hours per week: ${userData.hoursPerWeek}
- Test type: ${userData.testType}

VERY IMPORTANT rules:
- The output JSON MUST include ${userData.targetWeeks} objects inside the "weekly_plan" array.
- For the "level" field in both "resources" (inside weekly_plan) and "recommended_materials" arrays, ONLY use one specific string: **"A1"**, **"A2"**, **"B1"**, **"B2"**, **"C1"**, **"Band 5.0"**, **"Band 6.0"**, **"Band 7.0"**. This value is the **minimum required material level** for DB filtering.
- DO NOT invent real material titles, URLs, or IDs. Use the title **"DB Filter Tag: [Skill/Topic] Materials"** and set the **"type"** to **"tag"**.
- No intros, no markdown, no explanation.
- The "level_bucket" MUST be a short category used for general filtering of DB resources.

  `;

  let raw;
  if (GEMINI_KEY) raw = await callGemini(prompt, 900);
  else if (HF_TOKEN) raw = await callHuggingFaceText('google/flan-t5-large', prompt);
  else throw new Error('No AI provider configured');

  return tryParseJSONFromText(raw);
}

/* ---------- Grade writing: returns JSON ---------- */
async function gradeWriting(essay) {
  const prompt = `
You are an IELTS examiner. Return JSON only:
{
  "task_response": 0-9,
  "coherence_cohesion": 0-9,
  "lexical_resource": 0-9,
  "grammar": 0-9,
  "overall": 0-9,
  "feedback": "short actionable feedback",
  "suggestions": ["tip1","tip2","tip3"]
}
Essay:
"""${essay}"""
  `;
  let raw;
  if (GEMINI_KEY) raw = await callGemini(prompt, 600);
  else if (HF_TOKEN) raw = await callHuggingFaceText('google/flan-t5-large', prompt);
  else throw new Error('No AI provider configured for gradeWriting');

  return tryParseJSONFromText(raw);
}

/* ---------- Grade speaking: returns JSON ---------- */
async function gradeSpeaking(transcript) {
  const prompt = `
You are an IELTS speaking examiner. Return JSON only:
{
  "fluency_and_coherence": 0-9,
  "pronunciation": 0-9,
  "lexical_resource": 0-9,
  "grammar": 0-9,
  "overall": 0-9,
  "feedback": "short summary",
  "suggestions": ["tip1","tip2"]
}
Transcript:
"""${transcript}"""
  `;
  let raw;
  if (GEMINI_KEY) raw = await callGemini(prompt, 600);
  else if (HF_TOKEN) raw = await callHuggingFaceText('google/flan-t5-large', prompt);
  else throw new Error('No AI provider configured for gradeSpeaking');

  return tryParseJSONFromText(raw);
}

/* ---------- Chat assistant (free text) ---------- */
async function chatAssistant(message) {
  const prompt = `You are a friendly English study assistant. Respond helpfully and concisely.\nUser: ${message}\n`;
  let raw;
  if (GEMINI_KEY) raw = await callGemini(prompt, 400);
  else if (HF_TOKEN) raw = await callHuggingFaceText('google/flan-t5-large', prompt);
  else throw new Error('No AI provider configured for chatAssistant');

  // for chat we return raw text (not necessarily JSON)
  return raw;
}

module.exports = {
  generateLearningPlan,
  gradeWriting,
  gradeSpeaking,
  chatAssistant,
  transcribeAudioHF,
  callGemini // Export để dùng trong placementTest.service.js
};