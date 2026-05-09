/**
 * render-updates.js
 * Reads data/updates.json and renders:
 *  [0]   → Featured Card  (full-bleed image background)
 *  [1…N] → Standard Grid Cards (thumbnail + pinned footer)
 *
 * Admin-friendly: edit data/updates.json to add / remove news items.
 * Supported tagType values: result | event | admission | announcement | achievement | tips
 */

document.addEventListener("DOMContentLoaded", async () => {
  const featuredContainer  = document.getElementById("featured-news-container");
  const gridContainer      = document.getElementById("news-grid-container");
  const loadMoreBtn        = document.getElementById("load-more-btn");
  const loadMoreContainer  = document.getElementById("load-more-container");

  if (!featuredContainer || !gridContainer) return;

  let allUpdates    = [];
  let displayedCount = 0;           // count of grid cards shown (excludes featured)
  const ITEMS_PER_PAGE = 6;

  /* ── Helpers ─────────────────────────────────── */

  function formatDate(isoString) {
    const d = new Date(isoString);
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  }

  /**
   * Returns the CSS class for a tag pill.
   * @param {string} tagType
   * @param {'dark'|'light'} variant  'dark' for featured card, 'light' for grid cards
   */
  function tagClass(tagType, variant = "light") {
    const map = {
      result:       variant === "dark" ? "tag-result"       : "tag-result-light",
      event:        variant === "dark" ? "tag-event"        : "tag-event-light",
      admission:    variant === "dark" ? "tag-admission"    : "tag-admission-light",
      announcement: variant === "dark" ? "tag-announcement" : "tag-announcement-light",
      achievement:  variant === "dark" ? "tag-achievement"  : "tag-achievement-light",
      tips:         variant === "dark" ? "tag-tips"         : "tag-tips-light",
    };
    return map[tagType] || (variant === "dark" ? "tag-announcement" : "tag-announcement-light");
  }

  const FALLBACK_IMG = "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80";

  /* ── Featured Card ────────────────────────────── */

  function renderFeatured(item) {
    const img  = item.imageUrl || FALLBACK_IMG;
    const date = formatDate(item.date);
    const tc   = tagClass(item.tagType, "dark");
    const link = item.link || "#";

    featuredContainer.innerHTML = `
      <a href="${link}" class="featured-card" id="featured-card-link" aria-label="${item.title}">
        <div class="featured-card-bg" style="background-image: url('${img}');"></div>
        <div class="featured-card-overlay"></div>
        <div class="featured-card-body">
          <div class="featured-pills">
            <span class="pill-featured">⭐ Featured</span>
            <span class="tag-pill ${tc}">${item.tag}</span>
          </div>
          <h2>${item.title}</h2>
          <p>${item.description}</p>
          <span class="featured-date">📅 ${date}</span>
        </div>
      </a>
    `;
  }

  /* ── Standard Grid Card ───────────────────────── */

  function cardHTML(item) {
    const img  = item.imageUrl || FALLBACK_IMG;
    const date = formatDate(item.date);
    const tc   = tagClass(item.tagType, "light");
    const link = item.link || "#";

    return `
      <article class="news-card">
        <div class="news-card-thumb">
          <img src="${img}" alt="${item.title}" loading="lazy" />
        </div>
        <div class="news-card-body">
          <span class="news-card-tag ${tc}">${item.tag}</span>
          <h3 class="news-card-title">${item.title}</h3>
          <p class="news-card-desc">${item.description}</p>
          <div class="news-card-footer">
            <span class="news-card-date">📅 ${date}</span>
            <a href="${link}" class="news-card-read">Read →</a>
          </div>
        </div>
      </article>
    `;
  }

  /* ── Load batch into grid ─────────────────────── */

  function loadMore() {
    // items[0] is featured, grid starts at index 1
    const slice = allUpdates.slice(1 + displayedCount, 1 + displayedCount + ITEMS_PER_PAGE);
    if (!slice.length) return;

    slice.forEach(item => {
      gridContainer.insertAdjacentHTML("beforeend", cardHTML(item));
    });

    displayedCount += slice.length;

    // Hide button when all items are shown
    if (1 + displayedCount >= allUpdates.length) {
      loadMoreContainer.style.display = "none";
    }
  }

  /* ── Fetch & initialise ───────────────────────── */

  try {
    const res = await fetch("data/updates.json");
    if (!res.ok) throw new Error("Could not fetch updates.json");

    const raw = await res.json();

    // Sort newest → oldest
    allUpdates = raw.sort((a, b) => new Date(b.date) - new Date(a.date));

    if (allUpdates.length === 0) {
      featuredContainer.innerHTML = `<p style="color:var(--text-muted);padding:40px 0;">No updates available at the moment.</p>`;
      return;
    }

    // 1. Featured card (index 0)
    renderFeatured(allUpdates[0]);

    // 2. First batch of grid cards (indices 1–6)
    loadMore();

    // 3. Show "Load More" if there are more items beyond the first batch
    if (1 + displayedCount < allUpdates.length) {
      loadMoreContainer.style.display = "block";
      loadMoreBtn.addEventListener("click", loadMore);
    }

  } catch (err) {
    console.error("[render-updates]", err);
    featuredContainer.innerHTML = `<p style="color:var(--text-muted);padding:40px 0;">Couldn't load updates. Please try again later.</p>`;
  }
});
