const COMMON_PASSWORDS = new Set([
  "123456", "123456789", "12345678", "12345", "111111", "123123", "abc123", "qwerty",
  "password", "password1", "1234567", "1234", "iloveyou", "admin", "welcome", "monkey",
  "login", "princess", "qwerty123", "letmein", "solo", "passw0rd", "starwars", "dragon",
  "master", "hello", "freedom", "whatever", "zaq1zaq1", "trustno1", "654321", "superman",
  "1q2w3e4r", "000000", "batman", "sunshine", "charlie", "donald", "football", "secret",
  "michael", "mustang", "shadow", "baseball", "access", "flower", "hottie", "loveme",
  "cheese", "jordan", "ashley", "bailey", "pokemon", "qazwsx"
]);

const SYMBOLS = "!@#$%^&*()-_=+[]{};:,.<>/?|~";

const elements = {
  passwordInput: document.getElementById("password-input"),
  strengthBar: document.getElementById("strength-bar"),
  strengthText: document.getElementById("strength-text"),
  crackTime: document.getElementById("crack-time"),
  tips: document.getElementById("tips"),
  generatedPassword: document.getElementById("generated-password"),
  copyBtn: document.getElementById("copy-btn"),
  lengthRange: document.getElementById("length-range"),
  lengthValue: document.getElementById("length-value"),
  optUpper: document.getElementById("opt-upper"),
  optLower: document.getElementById("opt-lower"),
  optNumber: document.getElementById("opt-number"),
  optSymbol: document.getElementById("opt-symbol"),
  generateBtn: document.getElementById("generate-btn"),
  toast: document.getElementById("toast"),
  themeToggle: document.getElementById("theme-toggle")
};

function analyzePassword(password) {
  const normalized = password.toLowerCase();
  const length = password.length;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSymbol = /[^A-Za-z0-9]/.test(password);
  const isCommon = COMMON_PASSWORDS.has(normalized);

  let score = 0;
  if (length >= 8) score += 1;
  if (length >= 12) score += 1;
  if (length >= 16) score += 1;
  if (hasUpper) score += 1;
  if (hasLower) score += 1;
  if (hasNumber) score += 1;
  if (hasSymbol) score += 1;

  if (isCommon) score = 0;
  score = Math.max(0, Math.min(8, score));

  const tips = [];
  if (!password) {
    tips.push("Start with a password at least 12 characters long.");
  } else {
    if (isCommon) tips.push("This is a common password. Use something unique.");
    if (length < 12) tips.push("Increase length to 12+ characters.");
    if (!hasUpper) tips.push("Add an uppercase letter.");
    if (!hasLower) tips.push("Add a lowercase letter.");
    if (!hasNumber) tips.push("Add a number.");
    if (!hasSymbol) tips.push("Add a symbol.");
  }

  const entropyBits = isCommon ? 0 : estimateEntropyBits(length, { hasUpper, hasLower, hasNumber, hasSymbol });
  return {
    score,
    level: strengthLabel(score, password.length === 0),
    entropyBits,
    crackTime: estimateCrackTime(entropyBits, isCommon),
    tips
  };
}

function estimateEntropyBits(length, sets) {
  let pool = 0;
  if (sets.hasLower) pool += 26;
  if (sets.hasUpper) pool += 26;
  if (sets.hasNumber) pool += 10;
  if (sets.hasSymbol) pool += SYMBOLS.length;
  if (pool === 0 || length === 0) return 0;
  return Math.log2(pool) * length;
}

function estimateCrackTime(entropyBits, isCommon) {
  if (isCommon || entropyBits < 10) return "instant";
  const guessesPerSecond = 1e10;
  const seconds = Math.pow(2, entropyBits) / guessesPerSecond;
  if (seconds < 60) return "seconds";
  if (seconds < 3600) return `${Math.round(seconds / 60)} minutes`;
  if (seconds < 86400) return `${Math.round(seconds / 3600)} hours`;
  if (seconds < 31536000) return `${Math.round(seconds / 86400)} days`;
  if (seconds < 3153600000) return `${Math.round(seconds / 31536000)} years`;
  return "centuries";
}

function strengthLabel(score, isEmpty) {
  if (isEmpty || score <= 1) return "Very Weak";
  if (score <= 3) return "Weak";
  if (score <= 5) return "Fair";
  if (score <= 6) return "Strong";
  return "Very Strong";
}

function strengthVisual(score) {
  const ratio = Math.max(0, Math.min(1, score / 8));
  const width = `${Math.round(ratio * 100)}%`;
  let color = "var(--weak)";
  if (ratio >= 0.8) color = "var(--strong)";
  else if (ratio >= 0.45) color = "var(--fair)";
  return { width, color };
}

function renderAnalysis(password) {
  const result = analyzePassword(password);
  const visual = strengthVisual(result.score);

  elements.strengthBar.style.width = visual.width;
  elements.strengthBar.style.backgroundColor = visual.color;
  elements.strengthText.textContent = `Strength: ${result.level}`;
  elements.crackTime.textContent = `Estimated crack time: ${result.crackTime}`;

  elements.tips.innerHTML = "";
  result.tips.forEach((tip) => {
    const item = document.createElement("li");
    item.textContent = tip;
    elements.tips.appendChild(item);
  });
}

function secureRandomIndex(maxExclusive) {
  if (maxExclusive <= 0) throw new Error("maxExclusive must be greater than zero");
  const maxUint = 0xffffffff;
  const cutoff = Math.floor((maxUint + 1) / maxExclusive) * maxExclusive;
  const buffer = new Uint32Array(1);

  let value;
  do {
    crypto.getRandomValues(buffer);
    value = buffer[0];
  } while (value >= cutoff);

  return value % maxExclusive;
}

function pickRandom(charset) {
  return charset[secureRandomIndex(charset.length)];
}

function shuffleChars(chars) {
  for (let i = chars.length - 1; i > 0; i -= 1) {
    const j = secureRandomIndex(i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
}

function generatePassword() {
  const length = Number(elements.lengthRange.value);
  const groups = [];
  if (elements.optUpper.checked) groups.push("ABCDEFGHIJKLMNOPQRSTUVWXYZ");
  if (elements.optLower.checked) groups.push("abcdefghijklmnopqrstuvwxyz");
  if (elements.optNumber.checked) groups.push("0123456789");
  if (elements.optSymbol.checked) groups.push(SYMBOLS);

  if (groups.length === 0) {
    showToast("Select at least one character type.");
    return;
  }

  const allChars = groups.join("");
  const passwordChars = groups.map((group) => pickRandom(group));

  while (passwordChars.length < length) {
    passwordChars.push(pickRandom(allChars));
  }

  shuffleChars(passwordChars);
  const password = passwordChars.join("");
  elements.generatedPassword.value = password;
  elements.passwordInput.value = password;
  renderAnalysis(password);
}

async function copyGeneratedPassword() {
  const value = elements.generatedPassword.value;
  if (!value) {
    showToast("Generate a password first.");
    return;
  }

  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(value);
    } else {
      elements.generatedPassword.focus();
      elements.generatedPassword.select();
      document.execCommand("copy");
      elements.generatedPassword.setSelectionRange(value.length, value.length);
    }
    showToast("Copied to clipboard!");
  } catch {
    showToast("Copy failed. Press Ctrl/Cmd+C.");
  }
}

let toastTimeout;
function showToast(message) {
  elements.toast.textContent = message;
  elements.toast.classList.add("show");
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => elements.toast.classList.remove("show"), 1800);
}

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  const isDark = theme === "dark";
  elements.themeToggle.setAttribute("aria-pressed", String(isDark));
  elements.themeToggle.textContent = isDark ? "☀️ Light mode" : "🌙 Dark mode";
}

function initTheme() {
  const stored = localStorage.getItem("theme");
  const preferred = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  applyTheme(stored || preferred);
}

elements.passwordInput.addEventListener("input", (event) => renderAnalysis(event.target.value));
elements.lengthRange.addEventListener("input", () => {
  elements.lengthValue.textContent = elements.lengthRange.value;
});
elements.generateBtn.addEventListener("click", generatePassword);
elements.copyBtn.addEventListener("click", copyGeneratedPassword);
elements.themeToggle.addEventListener("click", () => {
  const nextTheme = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
  localStorage.setItem("theme", nextTheme);
  applyTheme(nextTheme);
});

initTheme();
renderAnalysis("");
generatePassword();
