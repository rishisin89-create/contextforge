import {
  loadModel,
  completion,
  unloadModel,
  QWEN3_600M_INST_Q4,
} from "@qvac/sdk";

import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "1mb" }));
app.use(express.static(path.join(__dirname, "public")));

let modelId = null;
let loadingPromise = null;

async function ensureModelLoaded() {
  if (modelId) return modelId;

  if (loadingPromise) {
    return loadingPromise;
  }

  loadingPromise = (async () => {
    console.log("Loading Qwen3 600M locally through QVAC...");

    const result = await loadModel({
      modelSrc: QWEN3_600M_INST_Q4,
      modelConfig: {
        ctx_size: 4096,
      },
      onProgress: (progress) => {
        if (progress?.percent !== undefined) {
          console.log(`Model loading: ${progress.percent}%`);
        }
      },
    });

    modelId = result;

    console.log(`QVAC model loaded: ${modelId}`);

    return modelId;
  })();

  try {
    return await loadingPromise;
  } finally {
    loadingPromise = null;
  }
}

function parseModelResponse(text) {
  let cleaned = String(text || "").trim();

  cleaned = cleaned
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");

  if (firstBrace === -1 || lastBrace === -1) {
    throw new Error("Model did not return valid JSON.");
  }

  const jsonText = cleaned.slice(firstBrace, lastBrace + 1);
  const parsed = JSON.parse(jsonText);

  return {
    goal: String(parsed.goal || ""),
    requirements: Array.isArray(parsed.requirements)
      ? parsed.requirements.map(String)
      : [],
    architecture: Array.isArray(parsed.architecture)
      ? parsed.architecture.map(String)
      : [],
    buildPlan: Array.isArray(parsed.buildPlan)
      ? parsed.buildPlan.map(String)
      : [],
    ambiguities: Array.isArray(parsed.ambiguities)
      ? parsed.ambiguities.map(String)
      : [],
  };
}

async function analyzeRequirements(requirementsText) {
  const id = await ensureModelLoaded();

  const prompt = `
You are ContextForge, a local project requirements analyst.

Analyze the user's project requirements and turn them into a practical implementation plan.

Return ONLY valid JSON with exactly these fields:

{
  "goal": "one concise sentence describing the main project goal",
  "requirements": ["clear requirement 1", "clear requirement 2"],
  "architecture": ["component 1", "component 2"],
  "buildPlan": ["step 1", "step 2"],
  "ambiguities": ["missing detail 1", "missing detail 2"]
}

Rules:
- Extract requirements rather than inventing major features.
- Architecture should contain useful technical components.
- Build plan should be ordered from foundation to completion.
- Mention ambiguities only when information is genuinely missing.
- If there are no meaningful ambiguities, return an empty array.
- Keep the response concise.
- Do not use markdown.
- Do not include any text outside the JSON object.

USER REQUIREMENTS:

${requirementsText}
`;

  const result = completion({
    modelId: id,
    history: [
      {
        role: "system",
        content:
          "You are ContextForge, a private on-device requirements planning assistant.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    stream: true,
  });

  const final = await result.final;

  return parseModelResponse(final?.contentText || final?.raw?.fullText || "");
}

app.get("/health", async (_req, res) => {
  res.json({
    status: "ok",
    qvac: true,
    local: true,
    modelLoaded: Boolean(modelId),
    app: "ContextForge",
    version: "1.0.0",
    model: "Qwen3 600M",
    sdk: "@qvac/sdk 0.19.1",
  });
});

app.post("/api/analyze", async (req, res) => {
  try {
    const requirements = String(req.body?.requirements || "").trim();

    if (!requirements) {
      return res.status(400).json({
        error: "Please provide project requirements.",
      });
    }

    if (requirements.length > 12000) {
      return res.status(400).json({
        error: "Requirements are limited to 12,000 characters.",
      });
    }

    console.log("Analyzing requirements locally...");

    const analysis = await analyzeRequirements(requirements);

    res.json({
      ...analysis,
      local: true,
      model: "Qwen3 600M",
    });
  } catch (error) {
    console.error("Analysis error:", error);

    res.status(500).json({
      error: error?.message || "Local analysis failed.",
    });
  }
});

app.listen(PORT, () => {
  console.log(`ContextForge running at http://localhost:${PORT}`);
});

async function shutdown() {
  if (modelId) {
    try {
      await unloadModel({
        modelId,
        clearStorage: false,
      });
      console.log("QVAC model unloaded.");
    } catch (error) {
      console.error("Model unload error:", error);
    }
  }

  process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
