import type { WebLlmSettings } from "@citolab/qti-convert-local-ai";
import type { ChatCompletionRequestNonStreaming } from "@mlc-ai/web-llm";

/**
 * Overrides DEFAULT_WEB_LLM_MODEL from @citolab/qti-convert-local-ai
 * (Qwen2.5-7B-Instruct-q4f16_1-MLC, 5.1 GB VRAM). Qwen3.5-4B is a newer base
 * and needs 3.9 GB, so it loads on more machines. It is a hybrid-reasoning
 * model, so it only pays off together with createLocalAiEngine below.
 */
export const DEFAULT_LOCAL_AI_MODEL = "Qwen3.5-4B-q4f16_1-MLC";

/**
 * enable_thinking: false makes WebLLM prepend a literal "<think>\n\n</think>"
 * block to the reply, which only makes sense for models that would otherwise
 * emit one. Anything else in the Settings dialog is left untouched.
 */
const isHybridReasoningModel = (model: string) => /^Qwen3(\.\d+)?-/.test(model);

/**
 * Qwen3 and Qwen3.5 emit <think> blocks unless a request opts out via
 * extra_body.enable_thinking, and every prebuilt WebLLM model is capped at a
 * 4096 token context window. The converter only ever sends `messages`,
 * `temperature` and `response_format`, so we build the engine ourselves and
 * turn thinking off on every completion — otherwise reasoning tokens eat the
 * window the JSON answer needs.
 */
export const createLocalAiEngine: NonNullable<
  WebLlmSettings["createEngine"]
> = async (settings) => {
  const model = settings.model || DEFAULT_LOCAL_AI_MODEL;
  const { CreateMLCEngine } = await import("@mlc-ai/web-llm");
  const engine = await CreateMLCEngine(model, {
    initProgressCallback: (progress) =>
      settings.initProgressCallback?.(progress),
  });

  if (!isHybridReasoningModel(model)) {
    return engine;
  }

  return {
    chat: {
      completions: {
        create: (request: ChatCompletionRequestNonStreaming) =>
          engine.chat.completions.create({
            ...request,
            stream: false,
            extra_body: { ...request.extra_body, enable_thinking: false },
          }),
      },
    },
  };
};
