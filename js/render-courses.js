document.addEventListener("DOMContentLoaded", async () => {
  const uruliContainer = document.querySelector("#uruli-programs .container");
  const shewalewadiContainer = document.querySelector("#Shewalewadi-programs .container");

  if (!uruliContainer || !shewalewadiContainer) return;

  try {
    const res = await fetch(`data/courses.json?t=${Date.now()}`);
    if (!res.ok) throw new Error("Could not load courses.json");
    const courses = await res.json();

    // Clear existing hardcoded cards but keep the headers
    const uruliHeader = uruliContainer.querySelector("div[style*='text-align: center']");
    const shewalewadiHeader = shewalewadiContainer.querySelector("div[style*='text-align: center']");

    uruliContainer.innerHTML = "";
    if (uruliHeader) uruliContainer.appendChild(uruliHeader);

    shewalewadiContainer.innerHTML = "";
    if (shewalewadiHeader) shewalewadiContainer.appendChild(shewalewadiHeader);

    courses.forEach(course => {
      const cardHTML = `
        <div class="program-card ${course.class} ${course.reverse ? 'card-reverse' : ''}" ${course.id ? `id="${course.id}"` : ''}>
          ${course.popular ? '<div class="popular-ribbon">⭐ Most Popular</div>' : ''}
          <div class="portrait-panel">
            <img src="${course.image}" alt="${course.badge} Program Student" />
            <span class="portrait-badge">${course.badge}</span>
          </div>
          <div class="content-panel">
            <span class="prog-tag">${course.tag}</span>
            <h2 class="prog-title">${course.title}</h2>
            <div class="prog-script">${course.script}</div>
            <p class="prog-desc">${course.description}</p>
            <div class="prog-subjects">
              ${course.subjects.map(sub => `<div class="prog-subject">${sub}</div>`).join('')}
            </div>
            <div class="prog-actions">
              <a href="#" onclick="openLeadPopup(event)" class="prog-btn-primary">Book Free Demo →</a>
              <a href="contact.html" class="prog-btn-secondary">Enquire Now</a>
            </div>
          </div>
        </div>
      `;

      if (course.branch.toLowerCase() === "uruli") {
        uruliContainer.insertAdjacentHTML("beforeend", cardHTML);
      } else if (course.branch.toLowerCase() === "shewalewadi") {
        shewalewadiContainer.insertAdjacentHTML("beforeend", cardHTML);
      }
    });

  } catch (err) {
    console.error("[render-courses] Error:", err);
  }
});
