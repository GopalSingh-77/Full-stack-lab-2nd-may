// url shortner using mongoDb
const express = require("express");
const mongoose = require("mongoose");
const shortid = require("shortid");

const app = express();
app.use(express.json());

// MongoDB Connection
mongoose.connect("mongodb://127.0.0.1:27017/urlshortener", {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("MongoDB connected"))
.catch(err => console.log(err));

// Schema
const urlSchema = new mongoose.Schema({
  originalUrl: {
    type: String,
    required: true
  },
  shortCode: {
    type: String,
    required: true,
    unique: true
  }
});

const Url = mongoose.model("Url", urlSchema);

// Create Short URL
app.post("/shorten", async (req, res) => {
  try {
    const { originalUrl } = req.body;

    if (!originalUrl) {
      return res.status(400).json({ message: "URL is required" });
    }

    let existing = await Url.findOne({ originalUrl });

    if (existing) {
      return res.json({
        originalUrl: existing.originalUrl,
        shortUrl: `http://localhost:5000/${existing.shortCode}`
      });
    }

    const shortCode = shortid.generate();

    const newUrl = new Url({
      originalUrl,
      shortCode
    });

    await newUrl.save();

    res.json({
      originalUrl,
      shortUrl: `http://localhost:5000/${shortCode}`
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Redirect to original URL
app.get("/:code", async (req, res) => {
  try {
    const url = await Url.findOne({ shortCode: req.params.code });

    if (!url) {
      return res.status(404).json({ message: "URL not found" });
    }

    res.redirect(url.originalUrl);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Start Server
app.listen(5000, () => {
  console.log("Server running on port 5000");
});

