# GarudaAI — Offline Phishing Guardian

[![Deployment](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://garuda-ai-psi.vercel.app/)
[![License](https://img.shields.io/badge/License-Apache_2.0-blue?style=for-the-badge)](LICENSE)
[![Category](https://img.shields.io/badge/Category-Browser--based%20AI-orange?style=for-the-badge)](https://github.com/aaryansingh66665/GarudaAI)
[![Track](https://img.shields.io/badge/Track-Security%20%26%20Privacy-green?style=for-the-badge)](https://github.com/aaryansingh66665/GarudaAI)

**GarudaAI** is a privacy-first, offline-first anti-phishing Progressive Web App (PWA) designed to detect text, URL, and screenshot phishing attempts entirely on-device. By running local heuristics and sandboxed machine learning models inside the browser, GarudaAI ensures user data is 100% private and never leaves their machine.

*   **Live Web Deployment:** [https://garuda-ai-psi.vercel.app/](https://garuda-ai-psi.vercel.app/)
*   **Demo video:**
*   **Aesthetic Theme:** *Blossom & Sage* pastel theme (soft warm cream `#FCFAF7` background with rose pink accents and sage green success indicators).

---

## 🎯 Track & Category Alignment

### 🌐 1. Primary Tech Stack Category: Web App Stack
*   **Browser-Based AI & Offline-First:** GarudaAI is a client-side Progressive Web App (PWA) built using a Vite-bundler with Vanilla HTML5, CSS3, and Javascript (ES6).
*   **Web Workers and WebGPU/WASM:** To prevent main-thread freezing and ensure a responsive UI, all local LLM operations run inside an isolated Web Worker (`ai-worker.js`) using `@mlc-ai/web-llm` with WebGPU hardware acceleration (and WASM fallback).

### 🛡️ 2. Use-Case Category: Defensive Cybersecurity & Privacy-Focused AI Tool
*   **OSDHack Section 6.3 Compliance:** Under the *Responsible Project Guidelines*, security-focused tools are encouraged for defensive, educational, and safety purposes. GarudaAI serves as a client-side defensive tool protecting users against social engineering, credential harvesting, and suspicious billing lures.

---

## ⚠️ The Problem & Our Solution

### The Problem
Traditional anti-phishing tools (such as email scanners, browser plugins, and online threat analyzers) require users to paste text or upload screenshots/links to cloud servers. This design creates several problems:
1.  **Data Leaks:** Private messages, OTP alerts, company invoices, and personal URLs are exposed to third-party APIs.
2.  **Network Dependence:** Scanners cannot run in offline environments or on highly secure, air-gapped networks.
3.  **High Latency & Costs:** Relies on expensive, server-side GPU cloud architectures with high network round-trip delays.

### The Solution
**GarudaAI** moves the entire processing pipeline directly onto the user's browser:
1.  **Zero Telemetry:** 100% local analysis. Scanned inputs and historical records are saved locally using IndexedDB client storage.
2.  **Zero External Requests:** Once loaded, the page can be fully disconnected from the internet. All inference, text matching, and OCR are calculated on the CPU/GPU of the local client.
3.  **No Sign-ups or API Keys:** Completely free, open-source, and accessible to anyone without sign-ups or subscription locks.

---

## 📂 Project Directory Structure

```filepath
GarudaAI/
├── LICENSE                  # OSI-compliant ISC License details
├── README.md                # Comprehensive documentation
├── package.json             # NPM dependencies & script targets
├── package-lock.json        # Locked dependency tree
├── vite.config.js           # Vite config with VitePWA & Web Worker plugins
├── index.html               # Main application entry layout
├── dist/                    # Static production output build directory
├── dev-dist/                # Development PWA distribution directory
└── src/                     # Application source directory
    ├── style.css            # Custom UI styling (Blossom & Sage variables)
    ├── app.js               # Application controller & DOM coordinator
    ├── ai-service.js        # Interface wrapper for WebLLM and Tesseract.js
    └── ai-worker.js         # Web Worker script handling MLCEngine threads
```

---

## 🛠️ What We Are Using (Tech Stack & Libraries)

*   **Vite**: Next-generation frontend tooling providing lightning-fast hot module replacement.
*   **Vite-Plugin-PWA**: Bundles assets into a Progressive Web App (PWA) with a custom offline service worker.
*   **@mlc-ai/web-llm**: High-performance local LLM execution framework enabling hardware-accelerated WebGPU/WASM model loading in browsers.
*   **Tesseract.js**: A pure Javascript port of the famous Tesseract OCR engine, compiled to WebAssembly for local image text extraction.
*   **LocalForage**: A fast, asynchronous storage library wrapping IndexedDB for offline log history persistence.
*   **Lucide-Icons**: A clean, lightweight vector icon set loaded dynamically.

---

## 🧠 How the AI and OCR Works

### 1. In-Browser Local LLM Engine (`@mlc-ai/web-llm`)
When a user launches GarudaAI, the app loads `Qwen2.5-0.5B-Instruct-q4f16_1-MLC` (a highly compressed 4-bit quantized model of 500M parameters) directly into the browser's Cache Storage.
*   **Web Worker Isolation:** The model operates inside [ai-worker.js](src/ai-worker.js), preventing UI lag or freeze during token generation.
*   **System Prompt Sandboxing:** The AI is strictly instructed via a system prompt to inspect inputs for phishing indicators (lures, urgency, credential harvesting, fake alerts) and return structured analysis in raw JSON format.
*   **WebGPU Acceleration:** WebLLM talks directly to the local GPU via the WebGPU API, allowing fast tokens-per-second generation directly on the client machine.

### 2. Client-Side OCR Engine (`Tesseract.js`)
For screenshot phishing detection:
*   The uploaded image is read as a base64 Data URL and passed to the local WebAssembly build of Tesseract.js.
*   Tesseract.js performs local OCR (character layout recognition) and extracts raw text.
*   This text is then passed to our local WebLLM pipeline for threat assessment and categorization.

### 3. Dual-Layer Hybrid Scanner
GarudaAI uses a dual-layer approach for URL and text scanning:
*   **Layer 1 (Local Heuristics):** Instant matching against key high-risk patterns (checking typosquatting brand names, lack of HTTPS, high-risk TLDs like `.xyz`/`.info`, IP mask usage, and link shorteners).
*   **Layer 2 (Local LLM Inference):** Deep contextual evaluation by the model to catch sophisticated semantic lures that static lists miss.

### 4. Client-Side AI Model Selection & Settings
To optimize for various device capacities (low-memory mobiles vs. high-end desktop GPUs), GarudaAI includes an **Application Settings** panel enabling runtime configuration:
*   **Active ONNX Transformer Model Selection:**
    *   **TinyBERT-Phish-L4 (14.2 MB - Recommended, Fast):** A lightweight transformer model for quick, on-device text classification.
    *   **DistilBERT-Phishing-V3 (66.5 MB - High Accuracy, Slower):** A larger model tailored for high-accuracy detection of complex semantic phishing lures.
    *   **Offline Heuristics Engine Only (0 MB - Instantaneous):** Runs without any neural network loading, relying purely on local regex-based and brand typosquatting heuristics.
*   **WebGPU Hardware Acceleration:** When enabled, GarudaAI leverages the browser's WebGPU API to run neural network layers directly on the device's GPU shader cores. On unsupported browsers, the pipeline automatically falls back to WASM/WebAssembly CPU processing.
*   **Theme Customization:** Seamlessly switch between the **Blossom Pink** and **Sage Mint** visual palettes to customize the user interface style.
*   **Local Storage & Cache Management:**
    *   **Cached Model Files Size Tracker:** Monitors the footprint of cached neural weights in browser Cache storage.
    *   **IndexedDB Scan Log Count Tracker:** Keeps tabs on the total scan history persisted locally inside the browser's IndexedDB.
    *   **Clear Model Cache:** Deletes stored model binaries to free local disk space.
    *   **Wipe App Data:** Triggers a complete factory reset, purging all local IndexedDB logs, settings, and cached assets.
*   **Install PWA Client:**
    *   **Standalone Offline App Installer (*Upcoming Feature*):** Designed to integrate with the browser's install prompts to save GarudaAI as a standalone desktop/mobile PWA. *(Note: The "Install GarudaAI" button in the settings panel is currently non-functional and this feature will be fully introduced in a future update).*

---

## 🚀 How to Set Up and Run Locally

### Prerequisites
*   [Node.js](https://nodejs.org/) (Version 18.x or above recommended)
*   A browser supporting WebGPU (Chrome, Edge, or Opera) for hardware-accelerated local AI.

### 1. Clone & Navigate
```bash
git clone https://github.com/aaryansingh66665/GarudaAI.git
cd GarudaAI
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser. The console will display WebGPU initialization logs.

### 4. Build for Production
To bundle the project for production static hosting (e.g., Vercel, Netlify, or GitHub Pages):
```bash
npm run build
```
This creates the optimized distribution bundle in the `dist/` directory.

---

## 👥 Team Members & Contributions

*   **Aryan (Team Lead):** Implemented the client-side **AI Inference Engine (Local LLM)** executing inside Web Workers, and the **WebAssembly OCR Scanner** for image text extraction.
*   **Archita:** Designed and created the **UI/UX Design System** featuring the custom *Blossom & Sage* aesthetic, palettes, layout variables, and responsive components.
*   **Umang:** Developed the **Local Heuristic URL Inspector** detecting domain typosquatting, SSL protocols, and high-risk TLD anomalies.
*   **Prajwal:** Built the **Offline-First Storage & Service Worker (PWA)** caching structures and the local IndexedDB logs database using LocalForage.

---

## 📄 License
This project is open-source and licensed under the **Apache License 2.0**. See the [LICENSE](LICENSE) file for details.


