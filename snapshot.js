const express = require("express");
const cors = require("cors");
const puppeteer = require("puppeteer");

const app = express();
app.use(cors()); // Allow all origins

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", message: "Service is running" });
});

// Chrome test endpoint
app.get("/test-chrome", async (req, res) => {
  try {
    const browser = await puppeteer.launch({
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
      headless: true,
    });

    const version = await browser.version();
    await browser.close();

    res.status(200).json({ status: "success", version });
  } catch (error) {
    console.error("Chrome launch failed:", error);
    res
      .status(500)
      .json({
        status: "error",
        message: "Failed to launch Chrome",
        error: error.message,
      });
  }
});

// Screenshot endpoint
app.get("/screenshot", async (req, res) => {
  const { url, quality } = req.query;
  if (!url) return res.status(400).json({ error: "Missing URL" });

  try {
    const browser = await puppeteer.launch({
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
      headless: true,
    });

    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "networkidle2", timeout: 0 });

    const screenshot = await page.screenshot({ type: "webp", fullPage: false, quality: quality ? parseInt(quality) : 25 });
    await browser.close();

    res.set("Content-Type", "image/webp");
    res.send(screenshot);
  } catch (err) {
    console.error("Screenshot error:", err);
    res
      .status(500)
      .json({ error: "Failed to capture screenshot", details: err.message });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`📸 Screenshot server running at http://localhost:${port}`);
});
