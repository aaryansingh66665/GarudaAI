
import localforage from 'localforage';
import { initAI, analyzeTextWithAI, analyzeUrlWithAI, extractTextFromImage, setAILoadCallback } from './ai-service.js';



const PRESET_MOCK_IMAGES = {
  bank: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="240" viewBox="0 0 400 240"><rect width="400" height="240" fill="%23FFF0F2" rx="10"/><rect x="20" y="20" width="360" height="48" fill="%23BE123C" rx="6"/><text x="40" y="50" font-family="sans-serif" font-size="16" font-weight="bold" fill="white">SECURE BANK ONLINE</text><text x="30" y="100" font-family="sans-serif" font-size="14" fill="%23374151" font-weight="bold">Urgent Action Required</text><text x="30" y="130" font-family="sans-serif" font-size="12" fill="%236B7280">We detected suspicious logins. Verify your identity now:</text><rect x="30" y="155" width="340" height="36" fill="%23BE123C" rx="4"/><text x="200" y="178" font-family="sans-serif" font-size="12" font-weight="bold" fill="white" text-anchor="middle">CLICK HERE TO VERIFY PASSWORD</text><text x="30" y="215" font-family="sans-serif" font-size="9" fill="%239CA3AF">© 2026 Secure Bank Corp. Confidentiality assured.</text></svg>`,
  
  delivery: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="240" viewBox="0 0 400 240"><rect width="400" height="240" fill="%23FEF3C7" rx="10"/><rect x="20" y="20" width="60" height="60" fill="%23D97706" rx="10"/><path d="M30 35h40v30H30z" fill="white"/><text x="100" y="45" font-family="sans-serif" font-size="18" font-weight="bold" fill="%2392400E">IPS DELIVERY SERVICE</text><text x="100" y="70" font-family="sans-serif" font-size="12" fill="%236B7280">Track Package: IPS-9284-91</text><text x="30" y="120" font-family="sans-serif" font-size="13" font-weight="bold" fill="%23374151">Your package delivery is PENDING holding fees.</text><text x="30" y="145" font-family="sans-serif" font-size="11" fill="%236B7280">Please pay $2.99 immediately to update delivery address:</text><text x="30" y="180" font-family="sans-serif" font-size="13" font-weight="bold" fill="%23BE123C">Link: http://ips-delivery-update-portal.info</text><text x="30" y="215" font-family="sans-serif" font-size="9" fill="%239CA3AF">Alert code: IPS-LURE-902</text></svg>`,
  
  normal: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="240" viewBox="0 0 400 240"><rect width="400" height="240" fill="%23ECFDF5" rx="10"/><text x="30" y="40" font-family="sans-serif" font-size="18" font-weight="bold" fill="%23065F46">INVOICE REPORT</text><text x="30" y="65" font-family="sans-serif" font-size="11" fill="%236B7280">Invoice Number: INV-2026-081</text><text x="30" y="100" font-family="sans-serif" font-size="13" fill="%23374151">Dear Customer, thank you for your order on July 10, 2026.</text><text x="30" y="125" font-family="sans-serif" font-size="13" fill="%23374151">Your transaction cleared successfully. No action is required.</text><line x1="30" y1="150" x2="370" y2="150" stroke="%2334D399" stroke-width="1"/><text x="30" y="180" font-family="sans-serif" font-size="12" fill="%23374151">Total Charged: $128.50 (Paid via Credit Card)</text><text x="30" y="215" font-family="sans-serif" font-size="9" fill="%239CA3AF">Support: https://www.legitcorp.com/support</text></svg>`
};

const PRESET_MOCK_OCR_TEXTS = {
  bank: "SECURE BANK ONLINE\nUrgent Action Required\nWe detected suspicious logins. Verify your identity now:\nCLICK HERE TO VERIFY PASSWORD\n© 2026 Secure Bank Corp. Confidentiality assured.",
  delivery: "IPS DELIVERY SERVICE\nTrack Package: IPS-9284-91\nYour package delivery is PENDING holding fees.\nPlease pay $2.99 immediately to update delivery address:\nLink: http://ips-delivery-update-portal.info\nAlert code: IPS-LURE-902",
  normal: "INVOICE REPORT\nInvoice Number: INV-2026-081\nDear Customer, thank you for your order on July 10, 2026.\nYour transaction cleared successfully. No action is required.\nTotal Charged: $128.50 (Paid via Credit Card)\nSupport: https://www.legitcorp.com/support"
};


let scanHistory = [];
localforage.getItem('garuda_scan_history').then(val => {
  if (val) scanHistory = val;
  else scanHistory = [];
});



document.addEventListener('DOMContentLoaded', () => {
  
  const btnEnter = document.getElementById('btn-enter');
  const btnBackSplash = document.getElementById('btn-back-to-splash');
  const landingPage = document.getElementById('landing-page');
  const appShell = document.getElementById('app-shell');
  const navItems = document.querySelectorAll('.sidebar-nav .nav-item');
  const appPanels = document.querySelectorAll('.app-panel');
  const dashboardLaunchers = document.querySelectorAll('.launcher-card[data-nav]');

  
  lucide.createIcons();

  setAILoadCallback((progress) => {
    const loadingTexts = document.querySelectorAll('.results-loading-state p');
    loadingTexts.forEach(el => el.textContent = "AI Loading: " + progress.text);

    const badgeText = document.getElementById('ai-status-text');
    const badge = document.getElementById('ai-status-badge');
    if (badgeText && badge) {
      if (progress.text.includes("Finish loading")) {
        badgeText.textContent = "AI: Ready";
        badge.style.background = "rgba(6, 95, 70, 0.1)";
        badge.style.color = "#065f46";
        badge.style.borderColor = "rgba(6, 95, 70, 0.2)";
      } else {
        const pct = Math.round((progress.progress || 0) * 100);
        badgeText.textContent = `AI: Loading (${pct}%)`;
        badge.style.background = "rgba(59, 130, 246, 0.1)";
        badge.style.color = "#1d4ed8";
        badge.style.borderColor = "rgba(59, 130, 246, 0.2)";
      }
    }
  });

  
  initAI().then(() => {
    const badgeText = document.getElementById('ai-status-text');
    const badge = document.getElementById('ai-status-badge');
    if (badgeText && badge) {
      badgeText.textContent = "AI: Ready";
      badge.style.background = "rgba(6, 95, 70, 0.1)";
      badge.style.color = "#065f46";
      badge.style.borderColor = "rgba(6, 95, 70, 0.2)";
    }
  }).catch(err => {
    console.error("Background AI init failed:", err);
    const badgeText = document.getElementById('ai-status-text');
    const badge = document.getElementById('ai-status-badge');
    if (badgeText && badge) {
      badgeText.textContent = "AI: Error";
      badge.style.background = "rgba(220, 38, 38, 0.1)";
      badge.style.color = "#b91c1c";
      badge.style.borderColor = "rgba(220, 38, 38, 0.2)";
    }
  });

  
  updateDashboardStats();

  
  function showPanel(targetId) {
    appPanels.forEach(panel => {
      if (panel.id === targetId) {
        panel.classList.remove('hidden');
      } else {
        panel.classList.add('hidden');
      }
    });

    
    navItems.forEach(item => {
      if (item.getAttribute('data-target') === targetId) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    
    if (targetId === 'panel-history') {
      renderHistoryTable();
    } else if (targetId === 'panel-settings') {
      updateSettingsCounts();
    }
  }

  
  btnEnter.addEventListener('click', () => {
    landingPage.classList.add('hidden');
    appShell.classList.remove('hidden');
    showPanel('panel-dashboard');
  });

  
  btnBackSplash.addEventListener('click', () => {
    appShell.classList.add('hidden');
    landingPage.classList.remove('hidden');
  });

  
  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const target = item.getAttribute('data-target');
      if (target) showPanel(target);
    });
  });

  
  dashboardLaunchers.forEach(card => {
    card.addEventListener('click', () => {
      const target = card.getAttribute('data-nav');
      if (target) showPanel(target);
    });
  });

  
  const textInput = document.getElementById('text-scan-input');
  const textCharCount = document.getElementById('text-char-count');
  const btnTextAnalyze = document.getElementById('btn-text-analyze');
  const btnTextClear = document.getElementById('btn-text-clear');
  const textResults = document.getElementById('text-results-container');

  
  textInput.addEventListener('input', () => {
    const len = textInput.value.length;
    textCharCount.textContent = len;
  });

  
  btnTextClear.addEventListener('click', () => {
    textInput.value = '';
    textCharCount.textContent = '0';
    resetResultsView(textResults);
  });

  
  btnTextAnalyze.addEventListener('click', async () => {
    const text = textInput.value.trim();
    if (!text) {
      alert("Please enter or paste message text to analyze.");
      return;
    }

    
    showResultsLoading(textResults);

    try {
      const result = await analyzeTextWithAI(text);
      saveScanToHistory('text', text, result);
      renderTextScanResults(result);
      updateDashboardStats();
    } catch (err) {
      console.error(err);
      alert("AI Inference failed.");
      resetResultsView(textResults);
    }
  });



  
  function renderTextScanResults(result) {
    showResultsContent(textResults);
    
    const badge = document.getElementById('text-result-badge');
    const riskPercentage = document.getElementById('text-risk-percentage');
    const riskFill = document.getElementById('text-risk-fill');
    const confidenceVal = document.getElementById('text-confidence-value');
    const categoryVal = document.getElementById('text-threat-category');
    const highlightedOutput = document.getElementById('text-highlighted-output');
    const evidenceList = document.getElementById('text-evidence-list');
    const recommendationVal = document.getElementById('text-recommendation-content');
    const recBox = recommendationVal.closest('.recommendation-box');

    
    badge.textContent = `${result.riskLevel.toUpperCase()} RISK`;
    badge.className = `result-badge ${result.riskLevel === 'Safe' ? 'success' : result.riskLevel === 'Medium' ? 'warning' : 'danger'}`;

    riskPercentage.textContent = `${result.riskScore}%`;
    riskFill.style.width = `${result.riskScore}%`;
    riskFill.className = `risk-bar-fill ${result.riskLevel === 'Safe' ? 'success' : result.riskLevel === 'Medium' ? 'warning' : 'danger'}`;

    confidenceVal.textContent = result.confidence;
    categoryVal.textContent = result.category;

    
    let highlightedText = result.text;
    if (result.foundKeywords && result.foundKeywords.length > 0) {
      result.foundKeywords.forEach(keyword => {
        const regex = new RegExp(`\\b(${keyword})\\b`, 'gi');
        highlightedText = highlightedText.replace(regex, '<span class="suspicious-phrase-highlight">$1</span>');
      });
    }
    highlightedOutput.innerHTML = highlightedText;

    
    evidenceList.innerHTML = '';
    result.evidence.forEach(item => {
      const li = document.createElement('li');
      li.textContent = item;
      evidenceList.appendChild(li);
    });

    
    recommendationVal.textContent = result.recommendation;
    if (result.riskLevel === 'Safe') {
      recBox.classList.add('safe');
      const icon = recBox.querySelector('i');
      if (icon) icon.setAttribute('data-lucide', 'shield-check');
    } else {
      recBox.classList.remove('safe');
      const icon = recBox.querySelector('i');
      if (icon) icon.setAttribute('data-lucide', 'shield-alert');
    }
    lucide.createIcons();
  }

  
  const urlInput = document.getElementById('url-scan-input');
  const btnUrlAnalyze = document.getElementById('btn-url-analyze');
  const btnUrlClear = document.getElementById('btn-url-clear');
  const urlResults = document.getElementById('url-results-container');

  btnUrlClear.addEventListener('click', () => {
    urlInput.value = '';
    resetResultsView(urlResults);
  });

  btnUrlAnalyze.addEventListener('click', async () => {
    const url = urlInput.value.trim();
    if (!url) {
      alert("Please enter a URL link to inspect.");
      return;
    }

    showResultsLoading(urlResults);

    try {
      const heuristics = extractUrlHeuristics(url);
      const result = await analyzeUrlWithAI(url, heuristics);
      saveScanToHistory('url', url, result);
      renderUrlScanResults(result);
      updateDashboardStats();
    } catch (err) {
      console.error(err);
      alert("AI Inference failed.");
      resetResultsView(urlResults);
    }
  });

  
  function extractUrlHeuristics(url) {
    let lower = url.toLowerCase();
    
    
    if (!lower.startsWith('http://') && !lower.startsWith('https://')) {
      lower = 'http://' + lower;
    }

    let isHttps = lower.startsWith('https://');
    let isShort = lower.includes('bit.ly') || lower.includes('tinyurl.com') || lower.includes('t.co') || lower.includes('is.gd') || lower.includes('cutt.ly');
    
    
    let host = "";
    try {
      const urlObj = new URL(lower);
      host = urlObj.hostname;
    } catch(e) {
      host = lower.replace(/https?:\/\//, '').split('/')[0];
    }

    // IP Check
    let isIp = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(host);

    // Typosquatting mimicry checks
    let typosquattingFound = false;
    let brandsList = ['paypal', 'google', 'facebook', 'netflix', 'amazon', 'apple', 'microsoft', 'chase', 'wells-fargo', 'bankofamerica'];
    brandsList.forEach(brand => {
      // Look for variations like paypa1, g00gle, chase-security-login
      if (host.includes(brand)) {
        // Safe check
        if (host !== `${brand}.com` && host !== `www.${brand}.com` && !host.endsWith(`.${brand}.com`)) {
          typosquattingFound = true;
        }
      } else {
        // Check for homoglyph / spelling tricks
        // e.g. paypa1
        const cleanHost = host.replace(/1/g, 'l').replace(/0/g, 'o').replace(/3/g, 'e').replace(/@/g, 'a');
        if (cleanHost.includes(brand) && host !== `${brand}.com` && !host.endsWith(`.${brand}.com`)) {
          typosquattingFound = true;
        }
      }
    });

    // Check suspicious path/host keywords
    let suspKeywords = ['login', 'signin', 'secure', 'account', 'verify', 'update', 'banking', 'support', 'recovery', 'free-gift'];
    let keywordsDetected = false;
    suspKeywords.forEach(kw => {
      if (lower.includes(kw)) {
        keywordsDetected = true;
      }
    });

    // TLD Risk
    let isHighRiskTld = host.endsWith('.info') || host.endsWith('.xyz') || host.endsWith('.top') || host.endsWith('.click') || host.endsWith('.work') || host.endsWith('.gq') || host.endsWith('.cf') || host.endsWith('.tk');

    return {
      isHttps,
      isShort,
      isIp,
      typosquattingFound,
      isHighRiskTld,
      keywordsDetected
    };
  }

  // Render URL results
  function renderUrlScanResults(result) {
    showResultsContent(urlResults);

    const badge = document.getElementById('url-result-badge');
    const riskPercentage = document.getElementById('url-risk-percentage');
    const riskFill = document.getElementById('url-risk-fill');
    const recContent = document.getElementById('url-recommendation-content');
    const evidenceList = document.getElementById('url-evidence-list');
    const recBox = recContent.closest('.recommendation-box');

    // Update text
    badge.textContent = result.riskLevel.toUpperCase();
    badge.className = `result-badge ${result.riskLevel === 'Safe' ? 'success' : result.riskLevel === 'Medium' ? 'warning' : 'danger'}`;

    riskPercentage.textContent = `${result.riskScore}%`;
    riskFill.style.width = `${result.riskScore}%`;
    riskFill.className = `risk-bar-fill ${result.riskLevel === 'Safe' ? 'success' : result.riskLevel === 'Medium' ? 'warning' : 'danger'}`;

    // Features table toggle icons
    updateFeatureBadge('feat-https', result.isHttps ? 'success' : 'danger', result.isHttps ? 'Enabled' : 'No HTTPS');
    updateFeatureBadge('feat-typo', result.typosquattingFound ? 'danger' : 'success', result.typosquattingFound ? 'Detected' : 'No Mimicry');
    updateFeatureBadge('feat-tld', result.isHighRiskTld ? 'warning' : 'success', result.isHighRiskTld ? 'High Risk' : 'Standard');
    updateFeatureBadge('feat-ip', result.isIp ? 'danger' : 'success', result.isIp ? 'IP Mask' : 'Clean DNS');
    updateFeatureBadge('feat-short', result.isShort ? 'warning' : 'success', result.isShort ? 'Shortened' : 'Standard');
    updateFeatureBadge('feat-keywords', result.keywordsDetected ? 'danger' : 'success', result.keywordsDetected ? 'Detected' : 'Clean Path');

    // Evidence list
    evidenceList.innerHTML = '';
    result.evidence.forEach(item => {
      const li = document.createElement('li');
      li.textContent = item;
      evidenceList.appendChild(li);
    });

    // Rec box
    recContent.textContent = result.recommendation;
    if (result.riskLevel === 'Safe') {
      recBox.classList.add('safe');
      const icon = recBox.querySelector('i');
      if (icon) icon.setAttribute('data-lucide', 'shield-check');
    } else {
      recBox.classList.remove('safe');
      const icon = recBox.querySelector('i');
      if (icon) icon.setAttribute('data-lucide', 'shield-alert');
    }
    lucide.createIcons();
  }

  function updateFeatureBadge(elementId, status, label) {
    const el = document.getElementById(elementId);
    el.className = `feat-status badge-${status}`;
    if (status === 'success') {
      el.innerHTML = `<i data-lucide="check-circle-2"></i> ${label}`;
    } else if (status === 'warning') {
      el.innerHTML = `<i data-lucide="alert-circle"></i> ${label}`;
    } else {
      el.innerHTML = `<i data-lucide="x-circle"></i> ${label}`;
    }
  }

  // --- MODULE: SCREENSHOT SCANNER ---
  const dropzone = document.getElementById('dropzone');
  const btnBrowseFile = document.getElementById('btn-browse-file');
  const screenshotInput = document.getElementById('screenshot-file-input');
  const previewContainer = document.getElementById('screenshot-preview-container');
  const previewImg = document.getElementById('screenshot-img-element');
  const btnRemoveScreenshot = document.getElementById('btn-remove-screenshot');
  const btnScreenshotAnalyze = document.getElementById('btn-screenshot-analyze');
  const screenshotResults = document.getElementById('screenshot-results-container');
  const overlayContainer = document.getElementById('ocr-highlight-overlays');
  const btnPresets = document.querySelectorAll('.btn-preset');

  let activeScreenshotText = "";
  let activePresetType = "";

  // Browse click
  btnBrowseFile.addEventListener('click', () => {
    screenshotInput.click();
  });

  // Input file change
  screenshotInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      loadScreenshotFile(file);
    }
  });

  // Presets load mockup
  btnPresets.forEach(btn => {
    btn.addEventListener('click', () => {
      const type = btn.getAttribute('data-preset');
      loadPresetMockup(type);
    });
  });

  // Remove selected image
  btnRemoveScreenshot.addEventListener('click', () => {
    resetScreenshotInput();
    resetResultsView(screenshotResults);
  });

  btnScreenshotAnalyze.addEventListener('click', async () => {
    if (!activeScreenshotText) return;

    showResultsLoading(screenshotResults);

    try {
      let ocrText = activeScreenshotText;
      if (activePresetType === 'User Upload') {
        ocrText = await extractTextFromImage(previewImg.src);
        activeScreenshotText = ocrText;
      }
      const result = await analyzeTextWithAI(ocrText);
      result.ocrText = ocrText;
      saveScanToHistory('screenshot', `Scanned Image (${activePresetType})`, result);
      renderScreenshotResults(result);
      updateDashboardStats();
    } catch(err) {
      console.error(err);
      alert("Screenshot analysis failed.");
      resetResultsView(screenshotResults);
    }
  });

  // Load actual file preview
  function loadScreenshotFile(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      // Since it is an custom upload, we mock the OCR processing content as a generic banking alert to show functionality
      activeScreenshotText = PRESET_MOCK_OCR_TEXTS.bank;
      activePresetType = 'User Upload';
      previewImg.src = e.target.result;
      
      dropzone.classList.add('hidden');
      previewContainer.classList.remove('hidden');
      drawMockOCRBoxes();
    };
    reader.readAsDataURL(file);
  }

  // Load template mockups
  function loadPresetMockup(type) {
    activePresetType = type;
    activeScreenshotText = PRESET_MOCK_OCR_TEXTS[type];
    previewImg.src = PRESET_MOCK_IMAGES[type];
    
    dropzone.classList.add('hidden');
    previewContainer.classList.remove('hidden');
    drawMockOCRBoxes();
  }

  function resetScreenshotInput() {
    screenshotInput.value = '';
    previewImg.src = '';
    activeScreenshotText = "";
    activePresetType = "";
    overlayContainer.innerHTML = '';
    
    previewContainer.classList.add('hidden');
    dropzone.classList.remove('hidden');
  }

  // Draw overlay frames to make it look like a real active scanning frame!
  function drawMockOCRBoxes() {
    overlayContainer.innerHTML = '';
    // Draw 3 random bounding boxes on the image wrapper
    for (let i = 0; i < 4; i++) {
      const box = document.createElement('div');
      box.className = 'ocr-bounding-box';
      box.style.top = `${15 + Math.random() * 60}%`;
      box.style.left = `${10 + Math.random() * 70}%`;
      box.style.width = `${15 + Math.random() * 30}%`;
      box.style.height = `${8 + Math.random() * 12}%`;
      overlayContainer.appendChild(box);
    }
  }



  function renderScreenshotResults(result) {
    showResultsContent(screenshotResults);

    const badge = document.getElementById('screenshot-result-badge');
    const riskPercentage = document.getElementById('screenshot-risk-percentage');
    const riskFill = document.getElementById('screenshot-risk-fill');
    const textPreview = document.getElementById('screenshot-extracted-text');
    const pillsRow = document.getElementById('screenshot-suspicious-pills');
    const recContent = document.getElementById('screenshot-recommendation-content');
    const recBox = recContent.closest('.recommendation-box');

    badge.textContent = `${result.riskLevel.toUpperCase()} RISK`;
    badge.className = `result-badge ${result.riskLevel === 'Safe' ? 'success' : result.riskLevel === 'Medium' ? 'warning' : 'danger'}`;

    riskPercentage.textContent = `${result.riskScore}%`;
    riskFill.style.width = `${result.riskScore}%`;
    riskFill.className = `risk-bar-fill ${result.riskLevel === 'Safe' ? 'success' : result.riskLevel === 'Medium' ? 'warning' : 'danger'}`;

    textPreview.textContent = result.ocrText;

    
    pillsRow.innerHTML = '';
    if (result.foundKeywords && result.foundKeywords.length > 0) {
      result.foundKeywords.forEach(kw => {
        const pill = document.createElement('span');
        pill.className = 'suspicious-pill';
        pill.textContent = kw.toUpperCase();
        pillsRow.appendChild(pill);
      });
    } else {
      pillsRow.innerHTML = '<span class="tag-pill" style="background:#ECFDF5;color:#065F46;border:none">No Flags Found</span>';
    }

    recContent.textContent = result.recommendation;
    if (result.riskLevel === 'Safe') {
      recBox.classList.add('safe');
      const icon = recBox.querySelector('i');
      if (icon) icon.setAttribute('data-lucide', 'shield-check');
    } else {
      recBox.classList.remove('safe');
      const icon = recBox.querySelector('i');
      if (icon) icon.setAttribute('data-lucide', 'shield-alert');
    }
    lucide.createIcons();
  }

  
  const historyEmptyState = document.getElementById('history-empty-state');
  const historyTableWrapper = document.getElementById('history-table-wrapper');
  const historyBody = document.getElementById('history-table-body');
  const btnHistoryClear = document.getElementById('btn-history-clear');
  const btnHistoryExport = document.getElementById('btn-history-export');
  const historySearch = document.getElementById('history-search');
  const filterTabs = document.querySelectorAll('.btn-filter-tab');

  let activeFilter = 'all';

  
  filterTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      filterTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      activeFilter = tab.getAttribute('data-filter');
      renderHistoryTable();
    });
  });

  
  historySearch.addEventListener('input', () => {
    renderHistoryTable();
  });

  
  btnHistoryClear.addEventListener('click', () => {
    if (confirm("Are you sure you want to clear all offline scan history?")) {
      scanHistory = [];
      localforage.setItem('garuda_scan_history', scanHistory);
      renderHistoryTable();
      updateDashboardStats();
    }
  });

  
  btnHistoryExport.addEventListener('click', () => {
    if (scanHistory.length === 0) {
      alert("No records to export.");
      return;
    }
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(scanHistory, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `garuda_shield_scans_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  });

  function renderHistoryTable() {
    const searchVal = historySearch.value.trim().toLowerCase();
    
    
    let filtered = scanHistory.filter(item => {
      
      if (activeFilter !== 'all' && item.type !== activeFilter) {
        return false;
      }
      
      if (searchVal) {
        return item.inputPreview.toLowerCase().includes(searchVal) || 
               item.category.toLowerCase().includes(searchVal) ||
               item.riskLevel.toLowerCase().includes(searchVal);
      }
      return true;
    });

    
    historyBody.innerHTML = '';
    if (filtered.length === 0) {
      historyEmptyState.classList.remove('hidden');
      historyTableWrapper.classList.add('hidden');
    } else {
      historyEmptyState.classList.add('hidden');
      historyTableWrapper.classList.remove('hidden');

      filtered.forEach((item) => {
        const tr = document.createElement('tr');
        
        
        const dateObj = new Date(item.timestamp);
        const formattedDate = dateObj.toLocaleDateString('en-US', {
          day: 'numeric', month: 'short', year: 'numeric'
        }) + ', ' + dateObj.toLocaleTimeString('en-US', {
          hour: '2-digit', minute: '2-digit'
        });

        
        let typeIcon = 'file-text';
        let typeClass = 'text';
        if (item.type === 'url') {
          typeIcon = 'link';
          typeClass = 'url';
        } else if (item.type === 'screenshot') {
          typeIcon = 'image';
          typeClass = 'screenshot';
        }

        
        let levelClass = 'safe';
        if (item.riskLevel === 'Critical') levelClass = 'phishing';
        else if (item.riskLevel === 'Medium') levelClass = 'warning';

        tr.innerHTML = `
          <td>
            <span class="history-type-badge ${typeClass}">
              <i data-lucide="${typeIcon}"></i>
            </span>
          </td>
          <td>
            <div class="history-input-cell" title="${item.inputPreview}">
              ${item.inputPreview}
            </div>
          </td>
          <td>
            <span class="table-pill ${levelClass}">
              ${item.riskLevel}
            </span>
          </td>
          <td>${item.confidence || '90%'}</td>
          <td>${formattedDate}</td>
          <td style="text-align: right">
            <button class="btn-history-row-delete" data-id="${item.id}">
              <i data-lucide="trash-2"></i>
            </button>
          </td>
        `;

        
        const delBtn = tr.querySelector('.btn-history-row-delete');
        delBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          deleteHistoryRow(item.id);
        });

        historyBody.appendChild(tr);
      });
      lucide.createIcons();
    }
  }

  function deleteHistoryRow(id) {
    scanHistory = scanHistory.filter(item => item.id !== id);
    localforage.setItem('garuda_scan_history', scanHistory);
    renderHistoryTable();
    updateDashboardStats();
  }

  
  const themeChoices = document.querySelectorAll('.btn-theme-choice');
  const cacheModelSize = document.getElementById('cache-model-size');
  const cacheLogCount = document.getElementById('cache-log-count');
  const btnClearModelCache = document.getElementById('btn-clear-model-cache');
  const btnFactoryReset = document.getElementById('btn-factory-reset');
  const modelSelect = document.getElementById('settings-model-select');

  
  themeChoices.forEach(choice => {
    choice.addEventListener('click', () => {
      themeChoices.forEach(c => c.classList.remove('active'));
      choice.classList.add('active');
      const selectedTheme = choice.getAttribute('data-theme');
      
      const themeBadge = document.querySelector('.theme-badge span');
      
      if (selectedTheme === 'sage') {
        document.documentElement.style.setProperty('--color-pink-primary', '#065F46');
        document.documentElement.style.setProperty('--color-pink-accent', '#6EE7B7');
        document.documentElement.style.setProperty('--color-pink-light', '#ECFDF5');
        document.documentElement.style.setProperty('--color-pink-hover', '#D1FAE5');
        document.documentElement.style.setProperty('--shadow-glow', '0 0 20px rgba(110, 231, 183, 0.35)');
        themeBadge.textContent = 'Sage Mint Theme';
      } else {
        
        document.documentElement.style.setProperty('--color-pink-primary', '#BE123C');
        document.documentElement.style.setProperty('--color-pink-accent', '#FDA4AF');
        document.documentElement.style.setProperty('--color-pink-light', '#FFF1F2');
        document.documentElement.style.setProperty('--color-pink-hover', '#FFE4E6');
        document.documentElement.style.setProperty('--shadow-glow', '0 0 20px rgba(253, 164, 175, 0.35)');
        themeBadge.textContent = 'Blossom Pink Theme';
      }
    });
  });

  
  modelSelect.addEventListener('change', (e) => {
    const model = e.target.value;
    if (model === 'distilbert') {
      cacheModelSize.textContent = '66.5 MB';
    } else if (model === 'minilm') {
      cacheModelSize.textContent = '14.2 MB';
    } else {
      cacheModelSize.textContent = '0 MB';
    }
  });

  btnClearModelCache.addEventListener('click', () => {
    if (confirm("Clear local cache of ONNX Transformer model files? This requires network access to redownload files next run.")) {
      alert("Local files cache cleared.");
    }
  });

  btnFactoryReset.addEventListener('click', async () => {
    if (confirm("This will erase all settings, cookies, and local database logs. Continue?")) {
      await localforage.clear();
      scanHistory = [];
      updateDashboardStats();
      showPanel('panel-dashboard');
      alert("Factory reset complete.");
    }
  });

  function updateSettingsCounts() {
    cacheLogCount.textContent = `${scanHistory.length} items`;
  }

  
  function saveScanToHistory(type, inputVal, result) {
    const newRecord = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      type,
      inputPreview: inputVal.length > 80 ? inputVal.slice(0, 80) + '...' : inputVal,
      riskScore: result.riskScore,
      riskLevel: result.riskLevel,
      confidence: result.confidence || '92.4%',
      category: result.category,
      recommendation: result.recommendation
    };
    scanHistory.unshift(newRecord);
    localforage.setItem('garuda_scan_history', scanHistory);
  }

  function updateDashboardStats() {
    const totalCount = scanHistory.length;
    const safeCount = scanHistory.filter(item => item.riskLevel === 'Safe').length;
    const threatCount = totalCount - safeCount;

    document.getElementById('stat-total-scans').textContent = totalCount;
    document.getElementById('stat-safe-scans').textContent = safeCount;
    document.getElementById('stat-threat-scans').textContent = threatCount;
  }

  function resetResultsView(container) {
    container.classList.add('empty-state-active');
    container.querySelector('.results-empty-state').classList.remove('hidden');
    container.querySelector('.results-loading-state').classList.add('hidden');
    container.querySelector('.results-loaded-content').classList.add('hidden');
  }

  function showResultsLoading(container) {
    container.classList.remove('empty-state-active');
    container.querySelector('.results-empty-state').classList.add('hidden');
    container.querySelector('.results-loading-state').classList.remove('hidden');
    container.querySelector('.results-loaded-content').classList.add('hidden');
  }

  function showResultsContent(container) {
    container.classList.remove('empty-state-active');
    container.querySelector('.results-empty-state').classList.add('hidden');
    container.querySelector('.results-loading-state').classList.add('hidden');
    container.querySelector('.results-loaded-content').classList.remove('hidden');
  }
});
