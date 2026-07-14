# GarudaAI — Offline Phishing Guardian

### 📋 GitHub Repository Description (Copy & Paste this!)
> A privacy-first, offline-first anti-phishing Progressive Web App (PWA) that detects text, URL, and screenshot phishing attempts entirely on-device using local heuristics and client-side models. Styled with a clean, calming "Blossom & Sage" pastel aesthetic on a warm cream background, ensuring user data is 100% private and never leaves the browser.

---

## 🌟 Overview
**GarudaAI** is a Progressive Web App (PWA) that runs security diagnostics **entirely inside the browser**. Traditional anti-phishing tools upload text and links to cloud servers, leaking private data. GarudaAI breaks this pattern by running all analysis locally. It targets security-conscious users, general users, and hackathon projects seeking high-performance local AI.

---

## 🎨 UI/UX Theme: Blossom & Sage
This redesign replaces the typical dark, neon "hacker" styles (common in cybersecurity prototypes) with an organic, clean, and calming light-mode design:
*   **Background (Warm Cream / Pearl)**: `#FCFAF7` provides a soft, paper-like surface that reduces reading fatigue.
*   **Surfaces (Pure White)**: `#FFFFFF` panels with soft, diffuse pink shadows (`shadow-sm` with a hint of red-rose tint).
*   **Primary Accent (Baby Pink / Sakura)**: Used as the active interactive element, highlight markers, and focus states.
*   **Safe/Success Indicators (Muted Sage Green)**: Safe files, links, and logs render in clean green tones to indicate compliance.
*   **Danger/Critical Indicators (Soft Rose/Crimson)**: High-risk indicators stand out without looking aggressive.
*   **Responsive Sidebar Layout**: Collapses gracefully on mobile viewports for compact browsing.

---

## 🚀 Key Modules
1.  **Dashboard**: Quick access to scanners, overall safety logs totals, and client-side pipeline indicators.
2.  **Text Phishing Scanner**: Live paste area. Processes text against local keyword arrays and transformer weights, offering live highlights of target words (like *OTP*, *verify*, *suspended*) and category classifications.
3.  **URL Heuristic Scanner**: Parses links on-device, checking typosquatting indicators, unsecured HTTP connections, high-risk TLDs, and URL shortener redirects.
4.  **Screenshot OCR Scanner**: Drag-and-drop file uploader with simulated OCR bounding box overlays. Testable via three built-in high-fidelity presets (OTP alert, Fake courier fee, Valid invoice).
5.  **Scan Logs (History)**: Keeps records stored in browser client storage (IndexedDB/LocalStorage wrappers) with search filters, JSON download/exports, and clear log actions.
6.  **Settings**: Toggle accents, select Active ONNX Transformer models sizes, clear browser memory cache, and install the PWA standalone app.

---

## 💻 Tech Stack
*   **Core**: HTML5, Vanilla CSS3, Javascript (ES6)
*   **Assets & Icons**: Google Fonts (Outfit, Playfair Display), Lucide Icons CDN
*   **Libraries Integration (Ready for local compilation)**: Tesseract.js WASM Core, Transformers.js (ONNX Runtime Web client-side)

---

## 🛠️ How to Run Locally
Since this is a client-side static web application, it requires no server setup:
1.  Navigate into the `garuda-shield` directory.
2.  Double-click `index.html` to open it in any web browser, or use the **VS Code Live Server** extension.
3.  Everything works 100% offline.

---

## 🐙 Step-by-Step GitHub Setup & Push Guide
If you want to create a new GitHub repository and push this project, run these commands in your terminal:

### 1. Initialize Git Repo
Make sure your terminal is inside the project folder (`C:\Users\Abhay\.gemini\antigravity\scratch\garuda-shield`):
```bash
git init
```

### 2. Stage and Commit Files
Add all files and create your first local commit:
```bash
git add .
git commit -m "feat: initial commit of GarudaAI UI/UX prototype with Blossom & Sage theme"
```

### 3. Create a Remote Repository on GitHub
1. Go to your [GitHub account](https://github.com/) and click **New Repository**.
2. Name it `garuda-shield`.
3. Keep it Public (or Private) and **do not** check "Add a README", "Add .gitignore", or "Choose a license" (since we already created them).
4. Click **Create repository**.

### 4. Link Remote & Push
Copy the commands from your GitHub page (replace `<username>` with your GitHub username):
```bash
git branch -M main
git remote add origin https://github.com/<username>/garuda-shield.git
git push -u origin main
```

### 5. Enable GitHub Pages (Free Hosting!)
To make your project interactive on the web for reviewers and teachers:
1. In your GitHub repository page, go to **Settings** > **Pages** (on the left menu).
2. Under **Build and deployment**, select **Deploy from a branch**.
3. Under **Branch**, select `main` and `/ (root)` folder.
4. Click **Save**.
5. Within 1-2 minutes, GitHub will give you a live link (e.g. `https://<username>.github.io/garuda-shield/`) to run your app anywhere!
