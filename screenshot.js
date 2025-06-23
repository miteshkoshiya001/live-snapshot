// Import necessary Node.js modules and libraries.
// 'browserless' client will handle the underlying Puppeteer connection to a remote browserless service.

require("dotenv").config();
const browserlessFactory = require("@browserless/screenshot");
const express = require("express"); // For creating the web server API
const app = express();
const port = process.env.PORT || 3000; // Port to listen on, defaults to 3000
const cors = require("cors"); // Import the cors middleware

// Middleware to parse JSON bodies from incoming HTTP requests.
app.use(express.json());
// Enable CORS for all origins.
// This allows requests from any domain or IP address.
app.use(cors());

// --- Placeholder Image URL for Errors ---
// This URL will be returned as the 'image' value in the JSON response when an error occurs.
const errorPlaceholderImageUrl = "https://placehold.co/600x400";

// Global browserless instance (initialized once at app start).
// This ensures that we reuse the connection to the Browserless service
// across multiple API requests, which is much more efficient than
// creating a new connection for each request.
let globalBrowserlessInstance;

/**
 * Takes a screenshot of a given URL using Browserless.
 * @param {string} url - The URL of the webpage to screenshot.
 * @param {boolean} fullPage - Whether to take a full-page screenshot (true) or just the visible viewport (false).
 * @param {boolean} thumbnail - If true, generate a smaller, lower-quality thumbnail image (overrides quality).
 * @param {number | undefined} quality - JPEG quality (0-100) if not a thumbnail and requesting JPEG.
 * @returns {Promise<{status: string, image: string | null, message?: string, type: string}>}
 * An object containing:
 * - `status`: 'success' or 'error'.
 * - `image`: The Base64 encoded image string (PNG/JPEG) WITH DATA URI PREFIX on success, or the placeholder URL on error.
 * - `message`: An optional error message.
 * - `type`: The image format ('png', 'jpeg', or 'url' for placeholder).
 */
async function takeScreenshot(
  url,
  fullPage = false,
  thumbnail = false,
  quality = undefined
) {
  let base64Image = null;
  let imageType = "png"; // Default image type
  let imageQuality = undefined; // Default image quality (undefined for PNG)

  try {
    if (!globalBrowserlessInstance) {
      throw new Error(
        "Browserless client not initialized. Cannot take screenshot. Check server logs."
      );
    }

    // Acquire a new page from the global browserless instance.
    // This is equivalent to `browser.newPage()` in Puppeteer, but managed by browserless.

    // Set viewport and image settings based on 'thumbnail' and 'quality' parameters
    if (thumbnail) {
      imageType = "jpeg"; // Thumbnail type is JPEG
      imageQuality = 70; // Fixed thumbnail quality
      fullPage = false; // Thumbnails are usually viewport captures
      console.log("Generating thumbnail-sized screenshot.");
    } else {
      if (typeof quality === "number" && quality >= 0 && quality <= 100) {
        imageType = "jpeg"; // Use JPEG if specific quality is requested for desktop
        imageQuality = Math.round(quality); // Use provided quality, clamped
        console.log(
          `Generating desktop screenshot with JPEG quality: ${imageQuality}.`
        );
      } else {
        imageType = "png"; // Default desktop to high-quality PNG
        imageQuality = undefined; // No quality setting for PNG
        console.log("Generating high-quality desktop screenshot (PNG).");
      }
    }

    console.log(`Navigating to ${url}...`);
    // The existing timeout already handles navigation timeouts (e.g., 30000 ms exceeded).
    const imageBuffer = await globalBrowserlessInstance({
      url,
      options: {
        fullPage,
        type: imageType,
        quality: imageType === "jpeg" ? imageQuality : undefined,
      },
    });

    // We no longer need `Buffer.from(imageBuffer)` as browserless guarantees a proper Buffer
    base64Image = `data:image/${imageType};base64,${imageBuffer.toString(
      "base64"
    )}`;
    console.log(
      "Screenshot captured and converted to Base64 with data URI prefix."
    );

    return {
      status: "success",
      image: base64Image,
      message: "Screenshot captured successfully.",
      type: imageType,
    };
  } catch (error) {
    console.error(
      `An error occurred during screenshot capture for ${url}: ${error.message}`
    );
    console.error(error.stack);
    // On error, use the placeholder image URL directly
    return {
      status: "error",
      image: errorPlaceholderImageUrl,
      message: error.message,
      type: "url",
    };
  } finally {
  }
}

// --- API Endpoint ---

app.post("/screenshot", async (req, res) => {
  const { url, fullPage, thumbnail, quality } = req.body;

  let processedUrl = url;
  // Prepend https:// if the URL doesn't have a protocol
  if (processedUrl && !processedUrl.match(/^[a-zA-Z]+:\/\//)) {
    processedUrl = `https://${processedUrl}`;
  }

  if (!processedUrl) {
    console.error("Validation Error: URL is required.");
    res.status(400).json({
      status: "error",
      message: "URL is required in the request body.",
      image: errorPlaceholderImageUrl,
      type: "url",
    });
    return;
  }

  try {
    new URL(processedUrl);
  } catch (e) {
    console.error(
      `Validation Error: Invalid URL provided: ${url}. Details: ${e.message}`
    );
    res.status(400).json({
      status: "error",
      message: `Invalid URL provided: ${e.message}`,
      image: errorPlaceholderImageUrl,
      type: "url",
    });
    return;
  }

  console.log(
    `Processing request for URL: ${processedUrl} (thumbnail: ${!!thumbnail}, quality: ${quality})`
  );

  const result = await takeScreenshot(
    processedUrl,
    fullPage,
    thumbnail,
    quality
  );

  if (result.status === "success") {
    res.status(200).json(result);
    console.log(
      `Successfully sent screenshot (Base64 Data URI in JSON) for ${processedUrl}`
    );
  } else {
    // If an error occurred during screenshot capture, the result.image already contains the placeholder URL.
    res.status(500).json({
      status: "error",
      message: result.message || "Failed to capture screenshot.",
      image: result.image,
      type: result.type,
    });
    console.error(
      `Failed to capture screenshot for ${processedUrl}. Sent placeholder URL.`
    );
  }
});

// --- Start the Express Server ---
// Initialize the global browserless instance once when the server starts.
app.listen(port, async () => {
  console.log(`Screenshot API listening at http://localhost:${port}`);
  console.log(
    `To use this service, send a POST request to: http://localhost:${port}/screenshot`
  );
  console.log("The request body should be JSON, like:");
  console.log(
    JSON.stringify(
      {
        url: "https://www.google.com",
        fullPage: true,
        thumbnail: false,
        quality: 80,
      },
      null,
      2
    )
  );
  console.log("Or without protocol (defaults to https://):");
  console.log(
    JSON.stringify({ url: "upwork.com", fullPage: true, quality: 25 }, null, 2)
  );
  console.log("You can also explicitly specify http://:");
  console.log(
    JSON.stringify(
      { url: "http://example.com", fullPage: true, quality: 50 },
      null,
      2
    )
  );
  console.log('Set "thumbnail": true for a smaller, JPEG preview.');
  console.log(
    'Set "quality" (0-100) for custom JPEG quality in desktop view (ignored if "thumbnail" is true).'
  );
  console.log(
    '\nExpected Response: JSON object with "status", "message", "image" (Base64 string WITH DATA URI PREFIX on success, or placeholder URL on error), and "type" ("png", "jpeg", or "url").'
  );

  try {
    // Connect to Browserless. The `BROWSERLESS_URL` environment variable
    // is where you point to your Browserless service (e.g., 'wss://chrome.browserless.io').
    // If BROWSERLESS_URL is not set, browserless might try to run a local Chromium,
    // which is not desired for Render.com deployments.
    const browserlessWsEndpoint = process.env.BROWSERLESS_URL;
    if (!browserlessWsEndpoint) {
      console.error(
        "CRITICAL ERROR: BROWSERLESS_URL environment variable is not set. The API will not function correctly without a Browserless endpoint."
      );
      process.exit(1); // Exit if the critical environment variable is missing
    }

    // Pass the endpoint to the browserless client to ensure it connects remotely.
    const browserless = browserlessFactory({
      browserlessUrl: process.env.BROWSERLESS_URL,
    });
    globalBrowserlessInstance = browserless;
    console.log("Successfully initialized Browserless client.");
    
    const browserless11 = require('@browserless/screenshot')({ browserlessUrl: process.env.BROWSERLESS_URL });
    const er = await browserless11({ url: 'https://example.com', options: { fullPage: false } });
    console.log(er);

  } catch (err) {
    console.error("Failed to initialize Browserless client connection:", err);
    console.error(
      "Ensure BROWSERLESS_URL is correctly set and the Browserless service is running."
    );
    process.exit(1); // Exit the application if browserless connection fails
  }
});

// Implement graceful shutdown to close the browserless connection
process.on("SIGTERM", async () => {
  console.log("SIGTERM signal received: closing Browserless connection.");
  if (globalBrowserlessInstance) {
    await globalBrowserlessInstance.close();
  }
  process.exit(0);
});

process.on("SIGINT", async () => {
  console.log("SIGINT signal received: closing Browserless connection.");
  if (globalBrowserlessInstance) {
    await globalBrowserlessInstance.close();
  }
  process.exit(0);
});
