import { ChemicalServer } from "chemicaljs";
import { fileURLToPath } from "url";
import { dirname } from "path";
import express from "express";
import compression from "compression";
import cheerio from "cheerio";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const chemical = new ChemicalServer();
const port = process.env.PORT || 8080;
const version = process.env.npm_package_version;
const publicPath = fileURLToPath(new URL("./public/", import.meta.url));

chemical.use(compression());

chemical.app.use(
  express.static(publicPath, {
    extensions: ["html"],
    maxAge: 604800000,
  })
);

chemical.app.get("/version", (req, res) => {
  if (req.query.v && req.query.v !== version) {
    res.status(400).send(version);
    return;
  }
  res.status(200).send(version);
});

chemical.app.get("/get-title", async (req, res) => {
  const { url } = req.query;
  try {
    const response = await fetch(url);
    const html = await response.text();
    const title = html.match(/<title>(.*?)<\/title>/i)?.[1] || "Title not found";
    res.send({ title });
  } catch {
    res.status(500).send("Error fetching the URL");
  }
});

chemical.use("/privacy", express.static(`${publicPath}/privacy.html`));

chemical.app.get("/search-api", async (req, res) => {
  const response = await fetch(`http://api.duckduckgo.com/ac?q=${req.query.term}&format=json`).then((i) => i.json());
  res.send(response);
});

chemical.app.get("/user-agents", async (req, res) => {
  let text = await fetch("https://useragents.me/");
  text = await text.text();
  const $ = cheerio.load(text);
  res.send($("#most-common-desktop-useragents-json-csv > div:eq(0) > textarea").val());
});

chemical.error((req, res) => {
  res.status(404);
  res.sendFile(`${__dirname}/public/404.html`);
});

chemical.listen(port, () => {
  console.log(`Fluid listening on port ${port}`);
});
