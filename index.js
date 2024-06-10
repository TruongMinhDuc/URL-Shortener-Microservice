require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const { MongoClient } = require("mongodb");
const dns = require("dns");
const urlP = require("url");

// Basic Configuration
const port = process.env.PORT || 3000;

const client = new MongoClient(process.env.MONGO_URL);
const dataBase = client.db("URLShortener");
const urls = dataBase.collection("urls");

app.use(cors());
app.use(express.urlencoded());

app.use("/public", express.static(`${process.cwd()}/public`));

app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

// Your first API endpoint
app.post("/api/shorturl", function (req, res) {
  const url = req.body.url;
  const dnsLookup = dns.lookup(
    urlP.parse(url).hostname,
    async (err, address) => {
      if (!address) {
        res.json({ error: "invalid url" });
      } else {
        const urlC = await urls.countDocuments({});
        const urlD = {
          url,
          short_url: urlC,
        };
        const ans = await urls.insertOne(urlD);
        console.log(err);
        res.json({ original_url: url, short_url: urlC });
      }
    }
  );
  //res.json(req.body);
});
app.get("/api/shorturl/:short_url", async (req, res) => {
  const shorturl = req.params.short_url;
  const urlD = await urls.findOne({ short_url: +shorturl });
  res.redirect(urlD.url);
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
