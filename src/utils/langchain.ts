import { logger } from "@/utils/logger";
import { ChatVectorDBQAChain } from "langchain/chains";
import { SupabaseVectorStore } from "langchain/vectorstores";
import {
  CallbackManager,
  LangChainTracer,
  ConsoleCallbackHandler,
} from "langchain/callbacks";
import { LLMResult } from "langchain/dist/schema";

const callbackManager = CallbackManager.fromHandlers({
  async handleLLMEnd(output: LLMResult) {
    console.log("handleLLMEnd", output);
    logger.verbose({
      _source: ["callbackManager", "fromHandlers", "handleLLMEnd", "response"],
      payload: output,
      usage: output.llmOutput?.tokenUsage,
    });
  },
});

// disabled until we can figure out how to get the token usage working

// callbackManager.handleLLMStart = async (..._args) => {
//   logger.verbose({
//     _source: ["callbackManager", "handleLLMStart", "request"],
//     payload: _args,
//   });
// };
// callbackManager.handleLLMEnd = async (..._args) => {
//   logger.verbose({
//     _source: ["callbackManager", "handleLLMEnd", "response"],
//     payload: _args,
//   });
// };

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

export { callbackManager, makeChain };
