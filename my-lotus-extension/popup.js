/* document.addEventListener("DOMContentLoaded", async () => {
  const flower = document.getElementById("flower");
  const preview = document.getElementById("preview-box");
  const tabs = await chrome.tabs.query({ currentWindow: true });

  const maxPetals = 12;
  const petalMap = [
    "big-petal1",
    "big-petal2",
    "big-petal3",
    "big-petal4",
    "small-petal1",
    "small-petal2",
    "small-petal3",
    "small-petal4",
    "small-petal5",
    "small-petal6",
    "small-petal7",
    "small-petal8",
  ];

  // Screenshot function
  async function takeBrowserlessScreenshot(targetUrl) {
    const fallbackImage = "https://placehold.co/600x400";
    // const apiEndpoint = 'https://live-snapshot.onrender.com/screenshot';
    const apiEndpoint = "http://localhost:3000/screenshot";
    try {
      const response = await fetch(
        `${apiEndpoint}?url=${encodeURIComponent(targetUrl)}`,
        {
          method: "GET",
          headers: {
            "Cache-Control": "no-cache",
          },
        }
      );
      if (!response.ok) throw new Error("Non-200 response");
      const buffer = await response.arrayBuffer();
      const base64 = btoa(String.fromCharCode(...new Uint8Array(buffer)));
      return `data:image/webp;base64,${base64}`;
    } catch (err) {
      console.error("Screenshot error:", err.message);
      return fallbackImage;
    }
  }

  for (let i = 0; i < Math.min(tabs.length, maxPetals); i++) {
    const tab = tabs[i];
    const className = petalMap[i];
    const isBig = className.startsWith("big") ? "big-petal" : "small-petal";

    const div = document.createElement("div");
    div.className = `${isBig} ${className}`;

    // Favicon
    if (tab.favIconUrl) {
      const img = document.createElement("img");
      img.src = tab.favIconUrl;
      img.alt = "";
      img.className = "petal-favicon";
      div.appendChild(img);
    }

    div.addEventListener("mouseenter", async () => {
      preview.innerHTML = `
    <strong>${tab.title}</strong><br>
    <div class="loader"></div><br>
    <span>${tab.url}</span>
  `;
      preview.style.opacity = "1";

      let previewImage = "https://placehold.co/600x400";
      if (!tab.preview) {
        await takeBrowserlessScreenshot(tab.url).then((imgUrl) => {
          tab.preview = imgUrl;
          previewImage = imgUrl;
        });
      } else {
        previewImage = tab.preview;
      }

      preview.innerHTML = `
    <strong>${tab.title}</strong><br>
    <img src="${previewImage}" style="max-width: 200px; border-radius: 8px;" /><br>
    <span>${tab.url}</span>
  `;
    });

    div.addEventListener("mouseleave", () => {
      preview.style.opacity = "0";
    });

    div.addEventListener("click", () => {
      chrome.tabs.update(tab.id, { active: true });
    });

    flower.appendChild(div);
  }
});
 */

document.addEventListener("DOMContentLoaded", async () => {
  const flower = document.getElementById("flower");
  const preview = document.getElementById("preview-box");
  const tabs = await chrome.tabs.query({ currentWindow: true });

  const maxPetals = 12;
  const fallbackImage = "https://placehold.co/600x400";
  const apiEndpoint = "http://localhost:3002/screenshot";

  const petalMap = [
    "big-petal1",
    "big-petal2",
    "big-petal3",
    "big-petal4",
    "small-petal1",
    "small-petal2",
    "small-petal3",
    "small-petal4",
    "small-petal5",
    "small-petal6",
    "small-petal7",
    "small-petal8",
  ];

  // Begin fetching all previews in background
  tabs.slice(0, maxPetals).forEach(async (tab) => {
    const key = `preview-${tab.id}`;
    if (!localStorage.getItem(key)) {
      try {
        const response = await fetch(
          `${apiEndpoint}?url=${encodeURIComponent(tab.url)}`
        );
        if (!response.ok) throw new Error("Failed screenshot");
        const buffer = await response.arrayBuffer();
        const base64 = btoa(String.fromCharCode(...new Uint8Array(buffer)));
        const imageUrl = `data:image/webp;base64,${base64}`;
        localStorage.setItem(key, imageUrl);
      } catch (err) {
        localStorage.setItem(key, fallbackImage);
      }
    }
  });

  // Now render all petals immediately
  for (let i = 0; i < Math.min(tabs.length, maxPetals); i++) {
    const tab = tabs[i];
    const className = petalMap[i];
    const isBig = className.startsWith("big") ? "big-petal" : "small-petal";

    const div = document.createElement("div");
    div.className = `${isBig} ${className}`;

    // Add favicon
    if (tab.favIconUrl) {
      const img = document.createElement("img");
      img.src = tab.favIconUrl;
      img.alt = "";
      img.className = "petal-favicon";
      div.appendChild(img);
    }

    // Hover preview box
    div.addEventListener("mouseenter", (e) => {
      const key = `preview-${tab.id}`;
      const previewImage = localStorage.getItem(key) || fallbackImage;
      const randomMB = Math.floor(150 + Math.random() * 80);

      // Set content
      preview.innerHTML = `
    <div class="preview-title">${tab.title}</div>
    <div class="preview-url">${tab.url}</div>
    <img src="${previewImage}" />
    <div class="preview-memory">🧠 Memory usage: ${randomMB} MB</div>
  `;

      // Position smartly (above + right of petal, avoid overlap)
      const rect = div.getBoundingClientRect();
      preview.style.left = `${rect.right + 10}px`;
      preview.style.top = `${rect.top - 10}px`;
      preview.style.opacity = "1";
    });

    div.addEventListener("mouseleave", () => {
      preview.style.opacity = "0";
    });

    div.addEventListener("click", () => {
      chrome.tabs.update(tab.id, { active: true });
    });

    flower.appendChild(div);
  }
});
