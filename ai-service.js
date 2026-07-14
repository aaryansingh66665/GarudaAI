import { CreateWebWorkerMLCEngine } from "@mlc-ai/web-llm";
import Tesseract from 'tesseract.js';

let engine = null;
let aiLoadCallback = null;

export function setAILoadCallback(cb) {
  aiLoadCallback = cb;
}

export async function initAI() {
  if (engine) return engine;
  
  const initProgressCallback = (progress) => {
    if (aiLoadCallback) aiLoadCallback(progress);
    console.log(progress.text);
  };
  
  const selectedModel = "Qwen2.5-0.5B-Instruct-q4f16_1-MLC";
  
  engine = await CreateWebWorkerMLCEngine(
    new Worker(new URL('./ai-worker.js', import.meta.url), { type: "module" }),
    selectedModel,
    { initProgressCallback }
  );
  
  return engine;
}

const SYSTEM_PROMPT = `You are a strict, privacy-first cybersecurity expert and phishing detection engine. 
Analyze the user's input and output ONLY a valid JSON object describing the phishing risk. Do not output any markdown formatting like \`\`\`json, just the raw JSON object. 
The JSON must have exactly the following keys:
- "riskScore": an integer from 0 to 100.
- "riskLevel": a string, exactly one of "Safe", "Low", "Medium", "High", "Critical".
- "confidence": a string percentage like "95.5%".
- "category": a string like "Safe", "Credential Theft", "Lottery Scam", "Banking Scam", "Fake Delivery", "URL Spoof", "Crypto Scam".
- "foundKeywords": an array of strings containing suspicious words found.
- "evidence": an array of strings explaining the technical reasons for the score.
- "recommendation": a string with actionable advice for the user.`;

export async function analyzeTextWithAI(text) {
  if (!engine) await initAI();
  
  const messages = [
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user", content: `Analyze this text for phishing:\n\n${text}` }
  ];

  const reply = await engine.chat.completions.create({ messages });
  try {
    const rawContent = reply.choices[0].message.content.trim();
    const jsonStr = rawContent.replace(/^```json\n?/, '').replace(/\n?```$/, '');
    const result = JSON.parse(jsonStr);
    result.text = text;
    return result;
  } catch (e) {
    console.error("AI Output Parsing Failed", reply.choices[0].message.content, e);
    return {
      text,
      riskScore: 50,
      riskLevel: "Medium",
      confidence: "50%",
      category: "Unknown",
      foundKeywords: [],
      evidence: ["Failed to parse AI output. Model detected anomalous pattern but couldn't format properly."],
      recommendation: "Exercise caution. The AI model output was malformed."
    };
  }
}

export async function analyzeUrlWithAI(url, heuristics) {
  if (!engine) await initAI();
  
  const messages = [
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user", content: `Analyze this URL for phishing.\nURL: ${url}\n\nPre-computed heuristic signals:\n${JSON.stringify(heuristics, null, 2)}` }
  ];

  const reply = await engine.chat.completions.create({ messages });
  try {
    const rawContent = reply.choices[0].message.content.trim();
    const jsonStr = rawContent.replace(/^```json\n?/, '').replace(/\n?```$/, '');
    const aiResult = JSON.parse(jsonStr);
    
    return {
      ...heuristics,
      ...aiResult,
      category: aiResult.category
    };
  } catch (e) {
    console.error("AI Output Parsing Failed", reply.choices[0].message.content, e);
    return {
      ...heuristics,
      riskScore: heuristics.riskScore,
      riskLevel: heuristics.riskLevel,
      confidence: "50%",
      category: "URL Spoof",
      foundKeywords: [],
      evidence: ["Failed to parse AI output. Defaulting to heuristic score."],
      recommendation: "Be careful. Link markers detected."
    };
  }
}

export async function extractTextFromImage(fileOrDataUrl) {
  const worker = await Tesseract.createWorker('eng');
  const ret = await worker.recognize(fileOrDataUrl);
  await worker.terminate();
  return ret.data.text;
}
