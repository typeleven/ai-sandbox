import nc from "next-connect";
import zod from "zod";

import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";
import { OpenAI, LLMChain } from "langchain";
import { createClient } from "@supabase/supabase-js";
import { SupabaseVectorStore } from "langchain/vectorstores";
import { OpenAIEmbeddings } from "langchain/embeddings";
import { loadQAChain } from "langchain/chains";

import { CONDENSE_PROMPT, QA_PROMPT } from "@/utils/prompts";
import {
  callbackManager,
  callbackManagerStream,
  makeChain,
} from "@/utils/langchain";
import { logger } from "@/utils/logger";
import { CallbackManager } from "langchain/callbacks";
import { LLMResult } from "langchain/dist/schema";

const tableName = "documents_emp_hbk";
const queryName = "match_documents_emp_hbk";
const openAIApiKey = process.env.OPENAI_API_KEY;
const embeddings = new OpenAIEmbeddings();
const questionSchema = zod.object({
  question: zod.string(),
});
const supabaseClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SERVICE_ROLE_KEY || ""
);
// for later when we want to add history
const historySchema = zod.array(
  zod.object({
    role: zod.string(),
    message: zod.string(),
  })
);
const vectorStore = await SupabaseVectorStore.fromExistingIndex(embeddings, {
  client: supabaseClient,
  tableName,
  queryName,
});

// Endpoints Start Here

const handler: NextApiHandler = nc<NextApiRequest, NextApiResponse>({
  onError: (err, req, res, next) => {
    console.error(err.stack);
    return res.status(500).json(err);
  },
  onNoMatch: (req, res) => {
    res.status(404).end("Method not allowed");
  },
}).post(async (req, res) => {
  // POST
  questionSchema.parse(req.body);
  const { question, history } = req.body;
  const sanitizedQuestion = question.trim().replaceAll("\n", " ");
  const callbackManager = CallbackManager.fromHandlers({
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
    async handleLLMNewToken(token: string) {
      console.log({ token });
    },
  });
  // open stream
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
  });
  // function to write data to the stream
  const sendData = (data: string, log: boolean = false): void => {
    if (log) {
      logger.verbose({
        _source: ["api", "ai", "emp-hbk-stream", "sendData"],
        payload: data,
      });
    }
    res.write(`data: ${data}\n\n`);
  };

  // initial stream
  sendData("[START STREAM]");

  try {
    //Ask a question and stream the response
    const model = new OpenAI({
      openAIApiKey,
      temperature: 0,
      callbackManager: callbackManagerStream(sendData),
      streaming: true,
      modelName: "gpt-3.5-turbo",
    });

    const questionGenerator = new LLMChain({
      llm: model,
      prompt: CONDENSE_PROMPT,
    });
    const docChain = loadQAChain(model, { prompt: QA_PROMPT });
    const chain = makeChain(vectorStore, docChain, questionGenerator);
    const response = await chain.call({
      question: sanitizedQuestion,
      chat_history: history || [],
    });
    logger.verbose({
      _source: ["api", "ai", "emp-hbk-stream", "response"],
      payload: response,
    });
  } catch (error) {
    logger.error({
      _source: ["api", "ai", "emp-hbk-stream", "error"],
      payload: error,
    });
  } finally {
    sendData("[END STREAM]");
    res.end();
  }
});

export default handler;
