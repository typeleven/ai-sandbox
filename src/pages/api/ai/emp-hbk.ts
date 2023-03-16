import nc from "next-connect";
import zod from "zod";

import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";
import { OpenAI, LLMChain } from "langchain";
import { createClient } from "@supabase/supabase-js";
import { SupabaseVectorStore } from "langchain/vectorstores";
import { OpenAIEmbeddings } from "langchain/embeddings";
import {
  ChatVectorDBQAChain,
  loadQAChain,
  VectorDBQAChain,
} from "langchain/chains";

import { CONDENSE_PROMPT, QA_PROMPT } from "@/utils/prompts";
import { callbackManager, makeChain } from "@/utils/langchain";

const tableName = "documents_emp_hbk";
const queryName = "match_documents_emp_hbk";

const questionSchema = zod.object({
  question: zod.string(),
});

// for later when we want to add history
const historySchema = zod.array(
  zod.object({
    role: zod.string(),
    message: zod.string(),
  })
);

const openAIApiKey = process.env.OPENAI_API_KEY;

const model = new OpenAI({
  openAIApiKey,
  temperature: 0,
  callbackManager,
  modelName: "gpt-3.5-turbo",
});

const supabaseClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SERVICE_ROLE_KEY || ""
);

const embeddings = new OpenAIEmbeddings();

const vectorStore = await SupabaseVectorStore.fromExistingIndex(embeddings, {
  client: supabaseClient,
  tableName,
  queryName,
});

const questionGenerator = new LLMChain({
  llm: model,
  prompt: CONDENSE_PROMPT,
});
const docChain = loadQAChain(model, { prompt: QA_PROMPT });

// const chain = new ChatVectorDBQAChain({
//   vectorStore,
//   combineDocumentsChain: docChain,
//   questionGeneratorChain: questionGenerator,
// })
// ??? pulling in makeChain (example above) into this file doesn't work for some reason.
const chain = makeChain(vectorStore, docChain, questionGenerator);

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

  const response = await chain.call({
    question: sanitizedQuestion,
    chat_history: history || [],
  });

  res.status(200).json({ response });
});

export default handler;
