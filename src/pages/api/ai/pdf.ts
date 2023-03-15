import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";
import nc from "next-connect";

const handler: NextApiHandler = nc<NextApiRequest, NextApiResponse>({
  onError: (err, req, res, next) => {
    console.error(err.stack);
    res.status(500).end("Something broke!");
  },
  onNoMatch: (req, res) => {
    res.status(404).end("Page is not found");
  },
})
  .get((req, res) => {
    res.send("Hello world");
  })
  .post((req, res) => {
    res.json({ method: "post" });
  });

export default handler;
