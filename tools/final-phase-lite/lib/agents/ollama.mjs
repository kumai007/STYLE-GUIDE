// Ollama: models that run on your own computer, free and private. They're used through OpenCode (Ollama has no
// editing tools of its own). If OpenCode isn't set up for Ollama yet, the window hands it the connection for each
// run (OPENCODE_CONFIG_CONTENT), so nothing in your settings is changed.

const base = () => {
  const h = process.env.OLLAMA_HOST?.trim();
  if (!h) return "http://127.0.0.1:11434";
  const url = /^https?:\/\//.test(h) ? h : `http://${h}`;
  return url.replace(/\/+$/, "").replace("0.0.0.0", "127.0.0.1");
};

async function get(path) {
  try {
    const r = await fetch(`${base()}${path}`, { signal: AbortSignal.timeout(1500) });
    return r.ok ? await r.json() : null;
  } catch {
    return null;
  }
}

/** The models pulled into Ollama, or null when Ollama isn't running. */
export async function listModels() {
  const tags = await get("/api/tags");
  if (!tags) return null;
  return (tags.models ?? []).map((m) => m.name).filter((n) => n && !/embed/i.test(n));
}

/** OpenCode settings that connect it to this Ollama, for one run. */
export function openCodeConfig(models) {
  return JSON.stringify({
    provider: {
      ollama: {
        npm: "@ai-sdk/openai-compatible",
        name: "Ollama (on this computer)",
        options: { baseURL: `${base()}/v1` },
        models: Object.fromEntries(models.map((m) => [m, { name: `${m} (Ollama)`, tool_call: true }])),
      },
    },
  });
}

/**
 * How much the loaded model can hold at once (its context), once it's loaded. Ollama starts at 4,096 on computers with
 * less than 24 GB of graphics memory, which is too small for a coding agent's instructions.
 */
export async function loadedContext(model) {
  const ps = await get("/api/ps");
  const name = String(model).replace(/^ollama\//, "");
  const m = ps?.models?.find((x) => x.name === name || x.model === name);
  return m?.context_length ?? null;
}

export const MIN_CONTEXT = 16384;
