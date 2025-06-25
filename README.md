# Live Preview Snap

This is a simple Node.js script that uses [Puppeteer](https://github.com/puppeteer/puppeteer) and [Express](https://expressjs.com/) to generate live snapshots of web pages. Ideal for previewing websites or automating screenshots.

## 🚀 Features

- Live preview via headless Chromium
- Snapshot functionality using Puppeteer
- Lightweight Express server

---

## 🧰 Prerequisites

Before you begin, ensure you have the following installed:

### 🔗 Basic Tools

**1. [Node.js](https://nodejs.org/) (v16 or higher)**
   - **Mac**: Install via [Homebrew](https://brew.sh/):
     ```bash
     brew install node
     ```
   - **Windows**: Download and install from [Node.js Official Site](https://nodejs.org/en/download)
   - **Linux**: Use your distro’s package manager or install via [nvm](https://github.com/nvm-sh/nvm)

**2. [Git](https://git-scm.com/)**
   - **Mac**:
     ```bash
     brew install git
     ```
   - **Windows**: Install [Git Bash](https://gitforwindows.org/)
   - **Linux (Debian/Ubuntu)**:
     ```bash
     sudo apt install git
     ```

**3. [Visual Studio Code](https://code.visualstudio.com/)** (optional but recommended)
   - Helps with editing and running the script easily

---

## 📦 Getting Started

Follow these steps to set up and run the project:

### 1. Clone the Repository

If hosted on GitHub:
```bash
git clone https://github.com/miteshkoshiya001/live-snapshot.git
cd live-preview-snap
``` 

---

### 2. Install Dependencies

Inside the project folder, run:

```bash
npm install
```

This installs:

* `express`: Lightweight HTTP server
* `puppeteer`: Headless Chromium
* `cors`: Enable cross-origin requests

---

### 3. Run the Project

```bash
npm start
```

This starts the local server and executes `snapshot.js`.

If needed, edit `snapshot.js` to customize what URLs to capture, output format, etc.

---

## 📁 Project Structure

```
live-preview-snap/
├── snapshot.js        # Main script
├── package.json       # Project config and dependencies
└── README.md          # You're here!
```

## 🛠️ Troubleshooting

### Puppeteer Download Issues

If Chromium fails to download during `npm install`, try:

```bash
PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true npm install
```

Then configure Puppeteer to use your system-installed Chrome in `snapshot.js`.

---

## 🧑‍💻 Contributing

Feel free to fork the repo and submit PRs for improvements or fixes.

---

## 📃 License

This project is licensed under the [MIT License](https://opensource.org/licenses/MIT)

---

## ❤️ Author

Built with Node.js by \[Mitesh Koshiya]

---

## 🌍 Useful Links

* [Node.js](https://nodejs.org/)
* [Puppeteer Docs](https://pptr.dev/)
* [Express Docs](https://expressjs.com/)
* [VS Code](https://code.visualstudio.com/)
* [Git for Windows](https://gitforwindows.org/)
