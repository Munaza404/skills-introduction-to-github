# Password Strength Analyzer & Generator

A client-side single-page web app built with plain HTML, CSS, and vanilla JavaScript.

## Features

- Live password strength analysis with ratings:
  - Very Weak, Weak, Fair, Strong, Very Strong
- Colored strength meter (red → yellow → green)
- Actionable tips to improve password quality
- Crack-time estimate from an entropy-based heuristic
- Cryptographically strong password generation using `crypto.getRandomValues()`
- Generator options:
  - Length slider (8–64)
  - Uppercase, lowercase, number, and symbol toggles
- Copy-to-clipboard with confirmation toast
- Responsive UI with accessible labels/controls and ARIA live regions
- Dark mode toggle with `localStorage` persistence

## Usage

1. Open `/home/runner/work/skills-introduction-to-github/skills-introduction-to-github/index.html` directly in a browser.
2. Type a password in the analyzer panel to see live feedback.
3. Use generator options and click **Generate Password**.
4. Click **Copy** to copy the generated password.

## How strength is calculated

The app combines these signals:

- Length thresholds: 8+, 12+, and 16+
- Character diversity: uppercase, lowercase, numbers, symbols
- Common-password blocklist (embedded list of common weak passwords)

A score is mapped to five levels:

- 0–1: Very Weak
- 2–3: Weak
- 4–5: Fair
- 6: Strong
- 7–8: Very Strong

Crack time is estimated from entropy using:

- Character-pool size based on selected/observed character classes
- Entropy approximation: `length × log2(poolSize)`
- A simple offline-attack guess rate heuristic to convert entropy to human-readable time

## Security and privacy

- No external dependencies or CDNs
- No passwords are sent over the network
- All logic runs locally in the browser
