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

<<<<<<< HEAD
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
=======
/* ---------- Gemini call with retry logic ---------- */
async function callGemini(prompt, maxTokens = 800, retries = 3) {
  if (!GEMINI_KEY) throw new Error('GEMINI_API_KEY not configured');
  
  // Clean prompt - remove any problematic characters
  const cleanPrompt = typeof prompt === 'string' ? prompt.trim() : String(prompt).trim();
  
  if (!cleanPrompt || cleanPrompt.length === 0) {
    throw new Error('Prompt cannot be empty');
  }
  
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`;
  const body = {
    contents: [
      {
        role: 'user',
        parts: [{ text: cleanPrompt }]
      }
    ],
    generationConfig: {
      temperature: 0.2,
      maxOutputTokens: maxTokens,
      topP: 0.95,
      topK: 40
    }
  };
  
  // Retry logic for transient errors (503, 429, etc.)
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await axios.post(url, body, { 
        headers: { 'Content-Type': 'application/json' },
        timeout: 60000 // 60 seconds timeout
      });
      
      // Check for errors in response
      if (res.data.error) {
        throw new Error(`Gemini API Error: ${res.data.error.message || JSON.stringify(res.data.error)}`);
      }
      
      const raw = res.data?.candidates?.[0]?.content?.parts?.[0]?.text || 
                  res.data?.candidates?.[0]?.content?.[0]?.text || 
                  '';
      
      if (!raw && res.data.candidates && res.data.candidates.length > 0) {
        console.warn('⚠️  No text in response, full response:', JSON.stringify(res.data, null, 2));
      }
      
      return raw;
      
    } catch (error) {
      // Check if it's a retryable error
      const isRetryable = error.response && (
        error.response.status === 503 || // Service Unavailable
        error.response.status === 429 || // Too Many Requests
        error.response.status === 500 || // Internal Server Error
        error.response.status === 502 || // Bad Gateway
        (error.response.status === 404 && error.response.data?.error?.message?.includes('overloaded'))
      );
      
      if (isRetryable && attempt < retries) {
        // Exponential backoff: wait 2^attempt seconds
        const waitTime = Math.pow(2, attempt) * 1000; // milliseconds
        console.warn(`⚠️  Gemini API temporarily unavailable (attempt ${attempt}/${retries}). Retrying in ${waitTime/1000}s...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        continue; // Retry
      }
      
      // Enhanced error logging for final attempt or non-retryable errors
      if (error.response) {
        const errorData = error.response.data;
        const errorMessage = errorData?.error?.message || errorData?.message || JSON.stringify(errorData);
        const status = error.response.status;
        
        if (isRetryable) {
          console.error(`❌ Gemini API Error after ${retries} attempts: ${errorMessage}`);
        } else {
          console.error('❌ Gemini API Error Response:', errorMessage);
        }
        console.error('❌ Status:', status);
        console.error('❌ Full Error Data:', JSON.stringify(errorData, null, 2));
        
        // Provide helpful error messages
        if (status === 503) {
          throw new Error(`Gemini API is currently overloaded. Please try again in a few moments. (Status: ${status})`);
        } else if (status === 429) {
          throw new Error(`Gemini API rate limit exceeded. Please wait before making more requests. (Status: ${status})`);
        } else {
          throw new Error(`Gemini API Error (${status}): ${errorMessage}`);
        }
      }
      
      // Non-HTTP errors (network, timeout, etc.)
      throw error;
    }
  }
>>>>>>> da49c8f915f6bd44603b322218d2d5fc2ee554f8
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
<<<<<<< HEAD
  const prompt = `
You are an expert IELTS/TOEIC English learning planner. Your primary task is to identify the user's weaknesses and recommend the **minimum CEFR/IELTS Band level** of the study materials they need to use **right now** to achieve their target score.

Return ONLY valid JSON, no explanation, no markdown.

The JSON MUST follow exactly this structure:
=======
  const prompt = `You are an expert IELTS/TOEIC teacher. Your task is to create a personalized learning plan based on the user's information.
>>>>>>> da49c8f915f6bd44603b322218d2d5fc2ee554f8

IMPORTANT: You MUST return ONLY valid JSON. Do NOT include any markdown formatting, code blocks, or explanations before or after the JSON. Start directly with { and end with }.

Required JSON structure (all fields are required):
{
<<<<<<< HEAD
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
=======
  "summary": "A brief 2-3 sentence analysis of the user's learning situation and goals",
  "duration_weeks": 8,
  "weekly_plan": [
    {
      "week": 1,
      "goals": ["Goal 1", "Goal 2", "Goal 3"],
      "skills_focus": ["Writing", "Reading"],
      "resources": [
        { "type": "video", "title": "Resource Title", "url": "https://example.com or null" }
      ],
      "assignments": ["Assignment description 1", "Assignment description 2"]
    }
  ],
  "recommended_materials": [
    { "type": "book", "title": "Material Title", "url": "https://example.com or null" }
  ]
}

User Information:
- Learning goal: ${userData.learningGoal || userData.goal || 'Not specified'}
- Current band: ${userData.currentBand || 'Not specified'}
- Target band: ${userData.targetBand || userData.band_target || 'Not specified'}
- Daily study hours: ${userData.dailyStudyHours || userData.study_hours_per_day || 'Not specified'}
- Learning purpose: ${userData.learningPurpose || userData.reason || 'Not specified'}

Instructions:
1. Create a realistic learning plan based on the gap between current and target band
2. Calculate duration_weeks based on the band gap (approximately 7-8 weeks per 0.5 band improvement)
3. Generate at least 4-8 weeks of weekly_plan
4. Focus on skills that need improvement
5. Provide specific, actionable goals and assignments
6. Recommend relevant learning materials

Return ONLY the JSON object. No other text.`;

  let raw;
  if (GEMINI_KEY) raw = await callGemini(prompt, 1200);
  else if (HF_TOKEN) raw = await callHuggingFaceText('google/flan-t5-large', prompt);
  else throw new Error('No AI provider configured');

  const parsed = tryParseJSONFromText(raw);
  return parsed;
>>>>>>> da49c8f915f6bd44603b322218d2d5fc2ee554f8
}

/* ---------- Grade writing: returns JSON ---------- */
async function gradeWriting(essay) {
<<<<<<< HEAD
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
=======
  if (!essay || typeof essay !== 'string' || essay.trim().length === 0) {
    throw new Error('Essay content is required and cannot be empty');
  }

  const prompt = `You are an experienced IELTS Writing examiner. Evaluate this essay according to official IELTS Writing Task 2 criteria.

IMPORTANT: You MUST return ONLY valid JSON. Do NOT include any markdown formatting, code blocks, or explanations. Start directly with { and end with }.

Required JSON structure (all fields are required):
{
  "task_response": 6.0,
  "coherence_cohesion": 6.5,
  "lexical_resource": 6.0,
  "grammar": 6.5,
  "overall": 6.25,
  "feedback": "A clear and detailed feedback paragraph (3-4 sentences) explaining the overall performance",
  "suggestions": ["Specific improvement tip 1", "Specific improvement tip 2", "Specific improvement tip 3"]
}

Scoring Guidelines:
- Task Response (0-9): How well the essay addresses the task, presents a clear position, and develops ideas
- Coherence & Cohesion (0-9): Organization, paragraphing, and use of cohesive devices
- Lexical Resource (0-9): Range and accuracy of vocabulary
- Grammar (0-9): Range and accuracy of grammatical structures
- Overall: Average of the four criteria, rounded to nearest 0.25

Essay to evaluate:
${essay}

Instructions:
1. Score each criterion accurately based on IELTS standards
2. Provide constructive feedback that helps the student improve
3. Give 3 specific, actionable suggestions
4. Calculate overall score as the average of four criteria

Return ONLY the JSON object. No other text.`;

  let raw;
  if (GEMINI_KEY) raw = await callGemini(prompt, 800);
  else if (HF_TOKEN) raw = await callHuggingFaceText('google/flan-t5-large', prompt);
  else throw new Error('No AI provider configured for gradeWriting');

  const parsed = tryParseJSONFromText(raw);
  return parsed;
>>>>>>> da49c8f915f6bd44603b322218d2d5fc2ee554f8
}

/* ---------- Grade speaking: returns JSON ---------- */
async function gradeSpeaking(transcript) {
<<<<<<< HEAD
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
=======
  if (!transcript || typeof transcript !== 'string' || transcript.trim().length === 0) {
    throw new Error('Transcript content is required and cannot be empty');
  }

  const prompt = `You are an experienced IELTS Speaking examiner. Evaluate this speaking transcript according to official IELTS Speaking criteria.

IMPORTANT: You MUST return ONLY valid JSON. Do NOT include any markdown formatting, code blocks, or explanations. Start directly with { and end with }.

Required JSON structure (all fields are required):
{
  "fluency_and_coherence": 6.0,
  "pronunciation": 6.5,
  "lexical_resource": 6.0,
  "grammar": 6.5,
  "overall": 6.25,
  "feedback": "A clear and detailed feedback paragraph (3-4 sentences) explaining the overall speaking performance",
  "suggestions": ["Specific improvement tip 1", "Specific improvement tip 2"]
}

Scoring Guidelines:
- Fluency & Coherence (0-9): Flow, naturalness, ability to speak without hesitation, logical organization
- Pronunciation (0-9): Clarity, intonation, stress patterns, intelligibility
- Lexical Resource (0-9): Range and accuracy of vocabulary, appropriate word choice
- Grammar (0-9): Range and accuracy of grammatical structures
- Overall: Average of the four criteria, rounded to nearest 0.25

Speaking transcript to evaluate:
${transcript}

Instructions:
1. Score each criterion accurately based on IELTS Speaking standards
2. Provide constructive feedback that helps the student improve
3. Give 2 specific, actionable suggestions for improvement
4. Calculate overall score as the average of four criteria

Return ONLY the JSON object. No other text.`;

  let raw;
  if (GEMINI_KEY) raw = await callGemini(prompt, 800);
  else if (HF_TOKEN) raw = await callHuggingFaceText('google/flan-t5-large', prompt);
  else throw new Error('No AI provider configured for gradeSpeaking');

  const parsed = tryParseJSONFromText(raw);
  return parsed;
>>>>>>> da49c8f915f6bd44603b322218d2d5fc2ee554f8
}

/* ---------- Chat assistant (free text) ---------- */
async function chatAssistant(message) {
<<<<<<< HEAD
  const prompt = `You are a friendly English study assistant. Respond helpfully and concisely.\nUser: ${message}\n`;
  let raw;
  if (GEMINI_KEY) raw = await callGemini(prompt, 400);
  else if (HF_TOKEN) raw = await callHuggingFaceText('google/flan-t5-large', prompt);
  else throw new Error('No AI provider configured for chatAssistant');

  // for chat we return raw text (not necessarily JSON)
  return raw;
=======
  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    throw new Error('Message content is required and cannot be empty');
  }

  const prompt = `You are a friendly and knowledgeable English study assistant specializing in IELTS and TOEIC preparation. Your role is to help students improve their English skills.

Guidelines:
- Be helpful, encouraging, and supportive
- Provide clear, concise, and practical advice
- Focus on actionable tips and strategies
- If asked about grammar, vocabulary, or test strategies, provide specific examples
- Keep responses conversational but informative
- If you don't know something, admit it rather than making up information

User's question or message:
${message}

Respond naturally and helpfully:`;

  let raw;
  if (GEMINI_KEY) raw = await callGemini(prompt, 500);
  else if (HF_TOKEN) raw = await callHuggingFaceText('google/flan-t5-large', prompt);
  else throw new Error('No AI provider configured for chatAssistant');

  // for chat we return raw text (not necessarily JSON)
  return raw.trim();
>>>>>>> da49c8f915f6bd44603b322218d2d5fc2ee554f8
}

module.exports = {
  generateLearningPlan,
  gradeWriting,
  gradeSpeaking,
  chatAssistant,
  transcribeAudioHF,
  callGemini // Export để dùng trong placementTest.service.js
};