/* ════════════════════════════════════════
   RESULTS PAGE SCRIPT
════════════════════════════════════════ */

document.addEventListener("DOMContentLoaded", async () => {
  // Mobile Nav Toggle
  const navbar = document.getElementById("navbar");
  if (navbar) {
    window.addEventListener("scroll", () => {
      if (window.scrollY > 40) {
        navbar.classList.add("scrolled");
      } else {
        navbar.classList.remove("scrolled");
      }
    });
  }

  // Optional: Auto-scroll carousel slightly to show it's scrollable
  const carousel = document.getElementById("testiCarousel");
  if (carousel) {
    setTimeout(() => {
      carousel.scrollBy({ left: 40, behavior: 'smooth' });
      setTimeout(() => {
        carousel.scrollBy({ left: -40, behavior: 'smooth' });
      }, 400);
    }, 1500);
  }

  /* --- DYNAMIC DATA LOADING --- */
  const resultsGrid = document.getElementById("resultsGrid");
  const viewMoreContainer = document.getElementById("viewMoreContainer");
  const viewMoreBtn = document.getElementById("viewMoreBtn");
  
  let allResults = [];
  let currentVisibleCount = 9;

  function renderResultsGrid(resultsToRender) {
    if (!resultsGrid) return;
    resultsGrid.innerHTML = "";
    
    let currentYear = null;

    resultsToRender.forEach(res => {
      // Format date if needed, or just display
      const dateObj = new Date(res.date);
      const year = dateObj.getFullYear();
      const options = { year: 'numeric', month: 'short', day: 'numeric' };
      const formattedDate = dateObj.toLocaleDateString('en-US', options) !== 'Invalid Date' ? dateObj.toLocaleDateString('en-US', options) : res.date;

      // Check if the year has changed
      if (!isNaN(year) && year !== currentYear) {
        currentYear = year;
        // Inject a header that spans all columns
        resultsGrid.innerHTML += `
          <div style="grid-column: 1 / -1; margin-top: 24px; margin-bottom: 8px; border-bottom: 2px solid #FF7A00;">
            <h3 style="font-size: 28px; font-weight: 800; color: #0B1F3A; margin: 0; padding-bottom: 8px;">${currentYear} Results</h3>
          </div>
        `;
      }

      resultsGrid.innerHTML += `
        <div class="res-card-9x16 animate-fade-up">
          <img src="${res.imageUrl}" alt="Result Image" loading="lazy" />
        </div>
      `;
    });
  }

  function updateViewMoreVisibility() {
    if (currentVisibleCount >= allResults.length) {
      viewMoreContainer.style.display = "none";
    } else {
      viewMoreContainer.style.display = "block";
    }
  }

  try {
    const res = await fetch("data/results.json");
    if (!res.ok) throw new Error("Failed to load results.");
    const data = await res.json();
    
    if (data.results && data.results.length > 0) {
      // Sort by date descending
      allResults = data.results.sort((a, b) => new Date(b.date) - new Date(a.date));
      
      // Initial render (first 9)
      renderResultsGrid(allResults.slice(0, currentVisibleCount));
      updateViewMoreVisibility();
    }
  } catch (error) {
    console.error(error);
  }

  if (viewMoreBtn) {
    viewMoreBtn.addEventListener("click", () => {
      // Show all remaining results
      currentVisibleCount = allResults.length;
      renderResultsGrid(allResults.slice(0, currentVisibleCount));
      updateViewMoreVisibility();
    });
  }

  /* --- COUNT UP ANIMATION FOR STATS --- */
  const statCounters = document.querySelectorAll(".gradient-text-blue");
  
  const animateCounter = (counter) => {
    const target = +counter.getAttribute("data-target");
    const suffix = counter.innerText.includes("+") ? "+" : (counter.innerText.includes("%") ? "%" : "");
    const duration = 2000; // 2 seconds
    const startTime = performance.now();

    const update = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const value = Math.floor(progress * target);
      
      counter.innerText = value + suffix;

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        counter.innerText = target + suffix;
      }
    };

    requestAnimationFrame(update);
  };

  const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        statsObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  statCounters.forEach(c => statsObserver.observe(c));
});
