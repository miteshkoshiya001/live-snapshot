// Import necessary Node.js modules and libraries.
const puppeteer = require('puppeteer'); // For headless browser automation
const express = require('express');     // For creating the web server API
const app = express();
const port = process.env.PORT || 3000;  // Port to listen on, defaults to 3000
const cors = require('cors');           // Import the cors middleware

// Middleware to parse JSON bodies from incoming HTTP requests.
app.use(express.json());
// Enable CORS for all origins.
// This allows requests from any domain or IP address.
app.use(cors());

// --- Placeholder Image URL for Errors ---
// This URL will be returned as the 'image' value in the JSON response when an error occurs.
const errorPlaceholderImageUrl = 'https://placehold.co/600x400';

/**
 * Takes a screenshot of a given URL using Puppeteer.
 * @param {string} url - The URL of the webpage to screenshot.
 * @param {boolean} fullPage - Whether to take a full-page screenshot (true) or just the visible viewport (false).
 * @param {boolean} thumbnail - If true, generate a smaller, lower-quality thumbnail image (overrides quality).
 * @param {number | undefined} quality - JPEG quality (0-100) if not a thumbnail and requesting JPEG.
 * @returns {Promise<{status: string, image: string | null, message?: string, type: string}>}
 * An object containing:
 * - `status`: 'success' or 'error'.
 * - `image`: The Base64 encoded image string (PNG/JPEG) WITH DATA URI PREFIX on success, or the placeholder URL on error.
 * - `message`: An optional error message.
 * - `type`: The image format ('png' or 'jpeg').
 */
async function takeScreenshot(url, fullPage = true, thumbnail = false, quality = undefined) {
  let browser;
  let imageBuffer;
  let base64Image = null;
  let imageType = 'png'; // Default image type
  let imageQuality = undefined; // Default image quality (undefined for PNG)

  try {
    browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();

    // Set viewport and image settings based on 'thumbnail' and 'quality' parameters
    if (thumbnail) {
      await page.setViewport({ width: 320, height: 240 }); // Fixed thumbnail size
      imageType = 'jpeg'; // Thumbnail type is JPEG
      imageQuality = 70; // Fixed thumbnail quality
      fullPage = false; // Thumbnails are usually viewport captures
      console.log('Generating thumbnail-sized screenshot.');
    } else {
      await page.setViewport({ width: 1280, height: 720 }); // Desktop size
      if (typeof quality === 'number' && quality >= 0 && quality <= 100) {
        imageType = 'jpeg'; // Use JPEG if specific quality is requested for desktop
        imageQuality = Math.round(quality); // Use provided quality, clamped
        console.log(`Generating desktop screenshot with JPEG quality: ${imageQuality}.`);
      } else {
        imageType = 'png'; // Default desktop to high-quality PNG
        imageQuality = undefined; // No quality setting for PNG
        console.log('Generating high-quality desktop screenshot (PNG).');
      }
    }

    console.log(`Navigating to ${url}...`);
    // The existing timeout already handles navigation timeouts (e.g., 30000 ms exceeded).
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });

    imageBuffer = await page.screenshot({
      fullPage: fullPage,
      type: imageType,
      quality: imageQuality
    });

    const reliableImageBuffer = Buffer.from(imageBuffer);
    // Add the data URI prefix here for successful images
    base64Image = `data:image/${imageType};base64,${reliableImageBuffer.toString('base64')}`;
    console.log('Screenshot captured and converted to Base64 with data URI prefix.');

    return { status: 'success', image: base64Image, message: 'Screenshot captured successfully.', type: imageType };

  } catch (error) {
    console.error(`An error occurred during screenshot capture for ${url}: ${error.message}`);
    console.error(error.stack);
    // On error, use the placeholder image URL directly
    return {
      status: 'error',
      image: errorPlaceholderImageUrl, // Use the URL for the placeholder
      message: error.message, // This will include "Navigation timeout of 30000 ms exceeded"
      type: 'url' // Indicate that the 'image' field contains a URL, not Base64
    };
  } finally {
    if (browser) {
      await browser.close();
      console.log('Browser closed.');
    }
  }
}

// --- API Endpoint ---
// In your Express app, typically above your /screenshot route
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

app.post('/screenshot', async (req, res) => {
  const { url, fullPage, thumbnail, quality } = req.body;

  let processedUrl = url;
  // Prepend https:// if the URL doesn't have a protocol
  if (processedUrl && !processedUrl.match(/^[a-zA-Z]+:\/\//)) {
    processedUrl = `https://${processedUrl}`;
  }

  if (!processedUrl) {
    console.error('Validation Error: URL is required.');
    res.status(400).json({
      status: 'error',
      message: 'URL is required in the request body.',
      image: errorPlaceholderImageUrl, // Use the URL for the placeholder
      type: 'url'
    });
    return;
  }

  try {
    new URL(processedUrl);
  } catch (e) {
    console.error(`Validation Error: Invalid URL provided: ${url}. Details: ${e.message}`);
    res.status(400).json({
      status: 'error',
      message: `Invalid URL provided: ${e.message}`,
      image: errorPlaceholderImageUrl, // Use the URL for the placeholder
      type: 'url'
    });
    return;
  }

  console.log(`Processing request for URL: ${processedUrl} (thumbnail: ${!!thumbnail}, quality: ${quality})`);

  const result = await takeScreenshot(processedUrl, fullPage, thumbnail, quality);

  if (result.status === 'success') {
    res.status(200).json(result);
    console.log(`Successfully sent screenshot (Base64 Data URI in JSON) for ${processedUrl}`);
  } else {
    // If an error occurred during screenshot capture, the result.image already contains the placeholder URL.
    res.status(500).json({
      status: 'error',
      message: result.message || 'Failed to capture screenshot.',
      image: result.image, // This will be the placeholder URL from takeScreenshot
      type: result.type // This will be 'url' for placeholder errors
    });
    console.error(`Failed to capture screenshot for ${processedUrl}. Sent placeholder URL.`);
  }
});

// --- Start the Express Server ---
app.listen(port, () => {
  console.log(`Screenshot API listening at http://localhost:${port}`);
  console.log(`To use this service, send a POST request to: http://localhost:${port}/screenshot`);
  console.log('The request body should be JSON, like:');
  console.log(JSON.stringify({ url: "https://www.google.com", fullPage: true, thumbnail: false, quality: 80 }, null, 2));
  console.log('Or without protocol (defaults to https://):');
  console.log(JSON.stringify({ url: "upwork.com", fullPage: true, quality: 25 }, null, 2));
  console.log('You can also explicitly specify http://:');
  console.log(JSON.stringify({ url: "http://example.com", fullPage: true, quality: 50 }, null, 2));
  console.log('Set "thumbnail": true for a smaller, JPEG preview.');
  console.log('Set "quality" (0-100) for custom JPEG quality in desktop view (ignored if "thumbnail" is true).');
  console.log('\nExpected Response: JSON object with "status", "message", "image" (Base64 string WITH DATA URI PREFIX on success, or placeholder URL on error), and "type" ("png", "jpeg", or "url").');
});
