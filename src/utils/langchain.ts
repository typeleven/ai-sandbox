import { logger } from "@/utils/logger";
import { ChatVectorDBQAChain } from "langchain/chains";
import { SupabaseVectorStore } from "langchain/vectorstores";

const callbackManager = {
  handleStart: (..._args) => {
    logger.verbose({ args: _args, source: "callbackManager.handleStart" });
  },
  handleEnd: (..._args) => {
    logger.verbose({ args: _args, source: "callbackManager.handleEnd" });
  },
  handleError: (..._args) => {
    logger.verbose({ args: _args, source: "callbackManager.handleError" });
  },
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
