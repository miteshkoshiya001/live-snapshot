require('dotenv').config();
const express = require('express');
const cors = require('cors');
const browserlessFactory = require('@browserless/screenshot');

const app = express();
app.use(express.json());
app.use(cors());

const errorPlaceholderImageUrl = 'https://placehold.co/600x400';
const port = process.env.PORT || 3000;

const browserless = browserlessFactory({
  browserlessUrl: process.env.BROWSERLESS_URL
});
let globalBrowserlessInstance = browserless;

app.post('/screenshot', async (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({
      status: 'error',
      message: 'URL is required.',
      image: errorPlaceholderImageUrl,
      type: 'url'
    });
  }

  try {
    const buffer = await globalBrowserlessInstance.screenshot({
      url,
      options: {
        fullPage: false,
        type: 'png'
      }
    });

    return res.status(200).json({
      status: 'success',
      image: `data:image/png;base64,${buffer.toString('base64')}`,
      type: 'png'
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: error.message,
      image: errorPlaceholderImageUrl,
      type: 'url'
    });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
