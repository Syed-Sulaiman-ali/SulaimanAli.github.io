/* =========================================================
   SULAIMAN ALI PORTFOLIO — INTERACTIONS & ANIMATIONS
   Plain JavaScript (no frameworks, no build tools)
   ========================================================= */

// Check if the user prefers reduced motion in their OS/browser settings
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* =========================================================
   1. MOBILE NAVIGATION TOGGLE
   ========================================================= */
const navToggle = document.querySelector(".nav-toggle");
const siteNav = document.querySelector("#primary-nav");

if (navToggle && siteNav) {
  navToggle.addEventListener("click", () => {
    const isOpen = siteNav.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });

  // Close the mobile menu automatically when a link is clicked
  siteNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      siteNav.classList.remove("is-open");
      navToggle.setAttribute("aria-expanded", "false");
    });
  });

  // Close the mobile menu if the user presses Escape
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && siteNav.classList.contains("is-open")) {
      siteNav.classList.remove("is-open");
      navToggle.setAttribute("aria-expanded", "false");
      navToggle.focus();
    }
  });
}

/* =========================================================
   2. HERO CURSOR GLOW EFFECT
   ========================================================= */
const heroSection = document.querySelector("#home");

if (heroSection && !prefersReducedMotion) {
  heroSection.addEventListener("mousemove", (event) => {
    const rect = heroSection.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Pass pointer coordinates to CSS custom properties
    heroSection.style.setProperty("--glow-x", `${x}px`);
    heroSection.style.setProperty("--glow-y", `${y}px`);
  });
}

/* =========================================================
   3. ROTATING HEADLINE WORDS
   ========================================================= */
const rotatingWordEl = document.querySelector("#rotating-word");
const headlineWords = ["SAP ABAP", "Open SQL", "ALV Report", "S/4HANA"];
let wordIndex = 0;

if (rotatingWordEl && !prefersReducedMotion) {
  setInterval(() => {
    rotatingWordEl.classList.add("is-fading");

    setTimeout(() => {
      wordIndex = (wordIndex + 1) % headlineWords.length;
      rotatingWordEl.textContent = headlineWords[wordIndex];
      rotatingWordEl.classList.remove("is-fading");
    }, 240);
  }, 2600);
}

/* =========================================================
   4. HERO ANIMATED ABAP MODIFY SYNC DEMO + "RUN AGAIN"
   ========================================================= */
const codeOutputEl = document.querySelector("#abap-code-output");
const resultOutputEl = document.querySelector("#abap-result-output");
const typingCursorEl = document.querySelector("#typing-cursor");
const runAgainBtn = document.querySelector("#run-again-btn");

// Lines of ABAP code typed out in the hero panel
const abapLines = [
  "REPORT z_student_sync.",
  "SELECT * FROM zstudent123 INTO TABLE @DATA(lt_db).",
  "LOOP AT lt_file INTO DATA(ls_file).",
  "  READ TABLE lt_db INTO DATA(ls_db)",
  "    WITH KEY student_id = ls_file-student_id.",
  "  IF sy-subrc <> 0.",
  "    MODIFY zstudent123 FROM ls_file. \" -> NEW",
  "  ELSEIF ls_db <> ls_file.",
  "    MODIFY zstudent123 FROM ls_file. \" -> CHANGED",
  "  ENDIF.",
  "ENDLOOP."
];

// Classification results printed after the program finishes typing
const syncResults = [
  { id: "STU101 - STU105 (5 rows)", status: "NEW", className: "is-new", badge: "status-new" },
  { id: "STU106 - STU110 (5 rows)", status: "CHANGED", className: "is-changed", badge: "status-changed" },
  { id: "STU111 - STU115 (5 rows)", status: "NO CHANGE", className: "is-unchanged", badge: "status-unchanged" }
];

// Store active timer IDs so clicking "Run again" cleanly resets the animation
let activeTimers = [];

function clearDemoTimers() {
  activeTimers.forEach((id) => clearTimeout(id));
  activeTimers = [];
}

function appendResultRow(item) {
  const row = document.createElement("div");
  row.className = `result-line ${item.className}`;
  row.innerHTML = `
    <span>${item.id}</span>
    <span class="status-pill ${item.badge}">${item.status}</span>
  `;
  resultOutputEl.appendChild(row);
}

function runAbapDemo() {
  if (!codeOutputEl || !resultOutputEl) return;

  clearDemoTimers();
  codeOutputEl.textContent = "";
  resultOutputEl.innerHTML = "";

  // If reduced motion is enabled, render the full code and results immediately
  if (prefersReducedMotion) {
    codeOutputEl.textContent = abapLines.join("\n");
    syncResults.forEach(appendResultRow);
    if (typingCursorEl) typingCursorEl.style.display = "none";
    return;
  }

  if (typingCursorEl) typingCursorEl.style.display = "inline-block";

  let delay = 140;

  // Print the ABAP program line by line
  abapLines.forEach((line, index) => {
    const timerId = setTimeout(() => {
      codeOutputEl.textContent += (index === 0 ? "" : "\n") + line;
    }, delay);
    activeTimers.push(timerId);
    delay += 170;
  });

  // Print the NEW / CHANGED / NO CHANGE classification results
  syncResults.forEach((item) => {
    delay += 260;
    const timerId = setTimeout(() => {
      appendResultRow(item);
    }, delay);
    activeTimers.push(timerId);
  });
}

runAbapDemo();

if (runAgainBtn) {
  runAgainBtn.addEventListener("click", runAbapDemo);
}

/* =========================================================
   5. PROFILE PHOTO GRACEFUL FALLBACK
   ========================================================= */
const profilePhoto = document.querySelector("#profile-photo");
const profileFrame = document.querySelector(".profile-frame");

function showProfileFallback() {
  if (profileFrame) {
    profileFrame.classList.add("is-missing");
  }
}

if (profilePhoto) {
  profilePhoto.addEventListener("error", showProfileFallback);

  // Handles the case where the image already failed to load before JS ran
  if (profilePhoto.complete && profilePhoto.naturalWidth === 0) {
    showProfileFallback();
  }
}

/* =========================================================
   6. GENTLE SCROLL-IN REVEAL (INTERSECTION OBSERVER)
   ========================================================= */
const revealElements = document.querySelectorAll(".reveal");

if (!prefersReducedMotion && "IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          obs.unobserve(entry.target); // Animate only once
        }
      });
    },
    { threshold: 0.12 }
  );

  revealElements.forEach((el) => observer.observe(el));
} else {
  // Fallback: show everything immediately if reduced motion or older browser
  revealElements.forEach((el) => el.classList.add("is-visible"));
}

/* =========================================================
   7. AUTO-UPDATE FOOTER YEAR
   ========================================================= */
const yearEl = document.querySelector("#current-year");
if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}