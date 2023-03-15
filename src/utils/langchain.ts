import { logger } from "@/utils/logger";
import { ChatVectorDBQAChain } from "langchain/chains";
import { SupabaseVectorStore } from "langchain/vectorstores";
import {
  CallbackManager,
  LangChainTracer,
  ConsoleCallbackHandler,
} from "langchain/callbacks";

const callbackManager = new CallbackManager();
callbackManager.handleLLMStart = async (..._args) => {
  logger.verbose({
    _source: ["callbackManager", "handleLLMStart", "request"],
    payload: _args,
  });
};
callbackManager.handleLLMEnd = async (..._args) => {
  logger.verbose({
    _source: ["callbackManager", "handleLLMEnd", "response"],
    payload: _args,
  });
};

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
