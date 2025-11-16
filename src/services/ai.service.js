// src/services/ai.service.js
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
You are an expert IELTS/TOEIC teacher. Return ONLY valid JSON using this structure:

{
  "summary": "short analysis",
  "duration_weeks": 8,
  "weekly_plan": [
    {
      "week": 1,
      "goals": ["..."],
      "skills_focus": ["Writing","Reading"],
      "resources": [
        { "type": "video/pdf/book/website", "title": "string", "url": "string or null" }
      ],
      "assignments": ["string"]
    }
  ],
  "recommended_materials": [
    { "type": "book/website", "title": "string", "url": "string or null" }
  ]
}

User info:
- Learning goal: ${userData.learningGoal || 'N/A'}
- Current band: ${userData.currentBand || 'N/A'}
- Target band: ${userData.targetBand || 'N/A'}
- Daily hours: ${userData.dailyStudyHours || 'N/A'}
- Purpose: ${userData.learningPurpose || 'N/A'}

Return JSON only. No explanation, no markdown.
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
  transcribeAudioHF
};
