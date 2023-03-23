import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";
import nc from "next-connect";
import { PDFLoader } from "langchain/document_loaders";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { SupabaseVectorStore } from "langchain/vectorstores";
import { OpenAIEmbeddings } from "langchain/embeddings";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import multer from "multer";
import fs from "fs";
import { logger } from "@/utils/logger";

const tableName = "documents_emp_hbk";
console.log(tableName);

const fileSchema = z.object({
  filename: z.string(),
});

const upload = multer({
  storage: multer.diskStorage({
    destination: "./pdfs/uploads",
    filename: (req, file, cb) => cb(null, file.originalname),
  }),
});

interface CustomNextApiRequest extends NextApiRequest {
  file: {
    filename: string;
  };
}

const handler: NextApiHandler = nc<CustomNextApiRequest, NextApiResponse>({
  onError: (err, req, res, next) => {
    console.error(err.stack);
    return res.status(500).json(err);
  },
  onNoMatch: (req, res) => {
    res.status(404).end("Method not allowed");
  },
})
  //.use(upload.single("file"))
  .post(async (req, res) => {
    fileSchema.parse(req.file);

    const supabaseClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "",
      process.env.SERVICE_ROLE_KEY || ""
    );

    const loader = new PDFLoader(
      ("./pdfs/uploads/" + req.file.filename) as string
    );
    const docs = await loader.load();

    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1500,
      chunkOverlap: 20,
    });

    const output = await splitter.splitDocuments(docs);

    await output.forEach((doc) => {
      doc.metadata = {
        filename: req.file.filename,
      };
    });
    //***************************************************//
    // Can't figure out how to use the supabase client
    const query = "insurance";
    const embeddings = new OpenAIEmbeddings();
    const vectorStore = new SupabaseVectorStore( embeddings,{
        supabaseClient,
        tableName,
        query,
      }
    );

    //**************************************************//
    //******************SIMILARITY SEARCH****************//
    // logs out top 10 Search Results from above 0.9 
    const queryVector = [0.9, 1.0];
    const k = 10;
    const count = await vectorStore.similaritySearchWithScore(query, queryVector, k);
    console.log(count);
    
    //**************************************************//



    await vectorStore.addDocuments(output);

    fs.unlinkSync("./pdfs/uploads/" + req.file.filename);

    logger.info({
      message: `${output.length} segments uploaded`,
      filename: req.file.filename,
      tableName,
    });


    return res.json({ message: `${output.length} segments uploaded` });
  });

export default handler;

export const config = {
  api: {
    bodyParser: false,
  },
};
