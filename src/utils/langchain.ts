import { logger } from "@/utils/logger";
import { ChatVectorDBQAChain } from "langchain/chains";
import { SupabaseVectorStore } from "langchain/vectorstores";
import {
  CallbackManager,
  LangChainTracer,
  ConsoleCallbackHandler,
} from "langchain/callbacks";
import { LLMResult } from "langchain/dist/schema";

// disabling for now until support for token usage is added
const callbackManager = CallbackManager.fromHandlers({
  async handleLLMEnd(output: LLMResult) {
    logger.verbose({
      _source: ["callbackManager", "fromHandlers", "handleLLMEnd", "response"],
      payload: output,
      usage: output.llmOutput?.tokenUsage,
    });
  },
  async handleLLMStart({ name }, prompts) {
    logger.verbose({
      _source: ["callbackManager", "fromHandlers", "handleLLMStart", "prompt"],
      payload: { prompts },
    });
  },
});

const callbackManagerStream = (onTokenStream) =>
  CallbackManager.fromHandlers({
    async handleLLMEnd(output: LLMResult) {
      console.log("handleLLMEnd", output);
      logger.verbose({
        _source: [
          "callbackManager",
          "fromHandlers",
          "handleLLMEnd",
          "response",
        ],
        payload: output,
        usage: output.llmOutput?.tokenUsage,
      });
    },
    async handleLLMStart({ name }, prompts) {
      logger.verbose({
        _source: [
          "callbackManager",
          "fromHandlers",
          "handleLLMStart",
          "prompt",
        ],
        payload: { prompts },
      });
    },
    async handleLLMNewToken(token: string) {
      onTokenStream(token, false); // the 2nd argument controls if the stream is logged
    },
  });

const makeChain = (
  vectorstore: SupabaseVectorStore,
  docChain,
  questionGenerator
) =>
  new ChatVectorDBQAChain({
    vectorstore,
    combineDocumentsChain: docChain,
    questionGeneratorChain: questionGenerator,
  });

export { callbackManager, makeChain, callbackManagerStream };
