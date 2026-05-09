function toggleMobileMenu() {
  const nav = document.getElementById("navLinks");
  const ham = document.getElementById("hamburger");
  if (!nav) return;
  const isOpen = nav.classList.toggle("open");
  if (ham) {
    ham.style.transform = isOpen ? "rotate(90deg)" : "";
  }
}

function animateCounter(el) {
  const targetStr = el.dataset.target || "0";
  const target = parseFloat(targetStr);
  const isFloat = targetStr.includes('.');
  if (isNaN(target) || el.dataset.animated === "true") return;

  const duration = 1500;
  const start = performance.now();
  const suffix = el.dataset.suffix || "";

  function update(now) {
    const progress = Math.min((now - start) / duration, 1);
    const currentValue = target * progress;

    if (isFloat) {
      el.textContent = currentValue.toFixed(1) + suffix;
    } else {
      el.textContent = Math.floor(currentValue).toLocaleString("en-IN") + suffix;
    }

    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      // Set exact final value
      el.textContent = (isFloat ? target.toFixed(1) : target.toLocaleString("en-IN")) + suffix;
      el.dataset.animated = "true";
    }
  }

  requestAnimationFrame(update);
}

function setupNavScrollBehavior() {
  const navbar = document.getElementById("navbar");
  const sections = Array.from(document.querySelectorAll("section[id], div[id]"));
  const sectionLinks = Array.from(document.querySelectorAll(".nav-link[href^='#']"));

  let ticking = false;

  function updateOnScroll() {
    const y = window.scrollY;

    if (navbar) {
      navbar.classList.toggle("scrolled", y > 40);
    }

    if (sectionLinks.length && sections.length) {
      let current = "";
      for (let i = 0; i < sections.length; i += 1) {
        if (y >= sections[i].offsetTop - 120) {
          current = sections[i].id;
        }
      }

      sectionLinks.forEach((link) => {
        link.classList.toggle("active", link.getAttribute("href") === `#${current}`);
      });
    }

    ticking = false;
  }

  window.addEventListener(
    "scroll",
    () => {
      if (!ticking) {
        requestAnimationFrame(updateOnScroll);
        ticking = true;
      }
    },
    { passive: true }
  );

  updateOnScroll();
}

function setupRevealAnimations() {
  const revealTargets = document.querySelectorAll(
    ".reveal, .cat-card, .course-card, .achiever-card, .update-card, .why-feat, .ci-card, .t-node, .wow-card, .tm-node, .asym-card, .flow-step, .program-row, .edge-card"
  );

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        entry.target.classList.add("visible");

        if (entry.target.classList.contains("stats-banner")) {
          document.querySelectorAll(".stat-num").forEach(animateCounter);
        }

        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.15 }
  );

  revealTargets.forEach((el, index) => {
    el.classList.add("reveal");
    if (el.classList.contains("cat-card")) {
      el.style.transitionDelay = `${index * 80}ms`;
    }
    observer.observe(el);
  });

  const statsBanner = document.querySelector(".stats-banner");
  if (statsBanner) {
    observer.observe(statsBanner);
  }
}

function setupSmoothAnchors() {
  document.querySelectorAll("a[href^='#']").forEach((anchor) => {
    anchor.addEventListener("click", (event) => {
      const href = anchor.getAttribute("href");
      const id = href ? href.slice(1) : "";
      if (!id) return;

      const target = document.getElementById(id);
      if (!target) return;

      event.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      document.getElementById("navLinks")?.classList.remove("open");
    });
  });
}

function setupTickerPause() {
  const ticker = document.querySelector(".ticker-track");
  if (!ticker) return;

  ticker.addEventListener("mouseenter", () => {
    ticker.style.animationPlayState = "paused";
  });
  ticker.addEventListener("mouseleave", () => {
    ticker.style.animationPlayState = "running";
  });
}

function setupCategoryRipple() {
  if (!document.getElementById("rippleAnimStyle")) {
    const style = document.createElement("style");
    style.id = "rippleAnimStyle";
    style.textContent = "@keyframes rippleAnim { to { transform: scale(4); opacity: 0; } }";
    document.head.appendChild(style);
  }

  document.querySelectorAll(".cat-btn").forEach((btn) => {
    btn.addEventListener("click", (event) => {
      const ripple = document.createElement("span");
      ripple.style.cssText = `position:absolute;border-radius:50%;background:rgba(255,255,255,0.4);width:80px;height:80px;left:${event.offsetX - 40}px;top:${event.offsetY - 40}px;animation:rippleAnim 0.5s ease-out forwards;pointer-events:none;`;
      btn.style.position = "relative";
      btn.style.overflow = "hidden";
      btn.appendChild(ripple);
      window.setTimeout(() => ripple.remove(), 500);
    });
  });
}


window.toggleMobileMenu = toggleMobileMenu;

async function loadDynamicTicker() {
  const tickerTracks = document.querySelectorAll(".ticker-track");
  if (!tickerTracks.length) return;

  try {
    const res = await fetch("data/ticker.json");
    if (!res.ok) return;
    const data = await res.json();

    if (data && data.length) {
      // Duplicate array for seamless CSS marquee scrolling
      const items = [...data, ...data];

      tickerTracks.forEach(track => {
        track.innerHTML = "";
        items.forEach(text => {
          const span = document.createElement("span");
          span.textContent = text;
          track.appendChild(span);
        });
      });
    }
  } catch (err) {
    console.error("Failed to load ticker data:", err);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  setupNavScrollBehavior();
  setupRevealAnimations();
  setupSmoothAnchors();
  setupTickerPause();
  setupCategoryRipple();
  loadDynamicTicker();
  setupLeadPopup();
  injectFloatingButtons();
});

// ══════════════ FLOATING BUTTONS (WhatsApp FAB + Back to Top) ══════════════
function injectFloatingButtons() {
  // WhatsApp FAB
  if (!document.getElementById("whatsappFab")) {
    const fab = document.createElement("a");
    fab.id = "whatsappFab";
    fab.href = "https://wa.me/918369826220";
    fab.target = "_blank";
    fab.rel = "noopener noreferrer";
    fab.className = "whatsapp-fab";
    fab.setAttribute("aria-label", "Chat on WhatsApp");
    fab.innerHTML = `
      <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
      </svg>
      <span class="whatsapp-fab-tooltip">Chat on WhatsApp</span>
    `;
    document.body.appendChild(fab);
  }

  // Back to Top
  if (!document.getElementById("backToTop")) {
    const btt = document.createElement("a");
    btt.id = "backToTop";
    btt.href = "#";
    btt.className = "back-to-top";
    btt.setAttribute("aria-label", "Back to top");
    btt.innerHTML = "↑";
    btt.addEventListener("click", (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
    document.body.appendChild(btt);

    window.addEventListener("scroll", () => {
      if (window.scrollY > 400) {
        btt.classList.add("show");
      } else {
        btt.classList.remove("show");
      }
    }, { passive: true });
  }
}


// ══════════════ POPUP LOGIC ══════════════
function setupLeadPopup() {
  // Dynamically inject the popup HTML if it doesn't exist (always inject it so buttons can trigger it)
  if (!document.getElementById("leadPopup")) {
    const popupHTML = `
      <div id="leadPopup" class="lead-popup-overlay">
        <div class="lead-popup-content">
          <button class="popup-close" onclick="closePopup()">&times;</button>
          <div class="popup-header">
            <h3>Book Your Free Trial</h3>
            <p>Enter your details below and we will get back to you shortly.</p>
          </div>
          <form id="popupForm" class="popup-form">
            <input type="text" id="popupName" name="Name" placeholder="Enter your name" required />
            <input type="text" id="popupClass" name="Class" placeholder="Enter your class (e.g., 10th, 12th)" required />
            <select id="popupBoard" name="Board" required style="padding: 12px 16px; border: 1px solid var(--border); border-radius: var(--radius-sm); font-family: inherit; font-size: 14px; outline: none; background: white; color: var(--text-muted);">
              <option value="" disabled selected>Select your board</option>
              <option value="SSC">SSC (State Board)</option>
              <option value="CBSE">CBSE</option>
              <option value="ICSE">ICSE</option>
              <option value="HSC">HSC (State Board)</option>
              <option value="Other">Other</option>
            </select>
            <input type="tel" id="popupPhone" name="Phone" placeholder="Enter your phone number" pattern="[0-9]{10}" maxlength="10" minlength="10" oninput="this.value = this.value.replace(/[^0-9]/g, '')" required />
            <button type="submit" class="btn-primary w-100 popup-submit">Submit</button>
          </form>
          <div id="popupMessage" class="popup-message"></div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', popupHTML);
  }

  const popup = document.getElementById("leadPopup");
  if (!popup) return;

  // Show automatically after 30 seconds only if they haven't seen/closed it this session
  if (!sessionStorage.getItem("popupClosed")) {
    setTimeout(() => {
      if (!sessionStorage.getItem("popupClosed")) {
        popup.classList.add("show");
      }
    }, 30000);
  }

  window.closePopup = function () {
    popup.classList.remove("show");
    sessionStorage.setItem("popupClosed", "true");
  };

  window.openLeadPopup = function (e) {
    if (e) e.preventDefault();
    popup.classList.add("show");
  };

  setupFormSubmission("popupForm", "popupName", "popupClass", "popupBoard", "popupPhone", "popupMessage");
  setupFormSubmission("ctaForm", "ctaName", "ctaClass", "ctaBoard", "ctaPhone", "ctaMessage");
}

function setupFormSubmission(formId, nameId, classId, boardId, phoneId, msgId) {
  const form = document.getElementById(formId);
  if (!form) return;

  const msgEl = document.getElementById(msgId);

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById(nameId).value;
    const studentClass = document.getElementById(classId).value;
    const board = document.getElementById(boardId).value;
    const phone = document.getElementById(phoneId).value;

    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = "Submitting...";
    submitBtn.disabled = true;
    if (msgEl) msgEl.textContent = "";

    try {
      const scriptURL = 'https://script.google.com/macros/s/AKfycby7OzczRQfAeTkEbQQmozu9hMAsx-BPCeZNAZ2-5WnFNfuT4dzRUB0d-BEMbHW3l8an/exec';

      const formData = new URLSearchParams();
      formData.append("Name", name);
      formData.append("Class", studentClass);
      formData.append("Board", board);
      formData.append("Phone", phone);

      const response = await fetch(scriptURL, { method: 'POST', body: formData, mode: 'no-cors' });

      // With mode: 'no-cors', response is opaque and response.ok is always false, 
      // but reaching here means the request was successfully sent.
      if (msgEl) {
        msgEl.textContent = "Thank you! We will get back to you soon.";
        msgEl.className = "popup-message success";
      }
      form.reset();

      if (formId === "popupForm") {
        sessionStorage.setItem("popupClosed", "true"); // Prevent it from showing again
        setTimeout(() => { if (window.closePopup) window.closePopup(); }, 3000);
      } else {
        setTimeout(() => { if (msgEl) msgEl.textContent = ""; }, 5000);
      }
    } catch (error) {
      if (msgEl) {
        msgEl.textContent = "Something went wrong. Please try again.";
        msgEl.className = "popup-message error";
      }
    } finally {
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
    }
  });
}
