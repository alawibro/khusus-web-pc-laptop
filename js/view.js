/* =====================================================================
   VIEW — everything that draws to the screen. No app logic lives here;
   the Controller tells the View what to show.
   ===================================================================== */

const View = {

  reducedMotion: matchMedia("(prefers-reduced-motion: reduce)").matches,

  els: {
    screens:       {},   // filled in init()
    menuItems:     [],
    wipe:          document.getElementById("wipe"),
    projectGrid:   document.getElementById("project-grid"),
    projectStatus: document.getElementById("project-status"),
    skillsBody:    document.getElementById("skills-body"),
    sfx:           document.getElementById("sfx-select"),
    cursor:        document.getElementById("cursor"),
    clock:         document.getElementById("clock"),
  },

  init() {
    document.querySelectorAll(".screen").forEach(s => {
      this.els.screens[s.id.replace("screen-", "")] = s;
    });
    this.els.menuItems = [...document.querySelectorAll(".menu-item")];
    document.querySelectorAll("[data-ransom]").forEach(el => this.ransomize(el));
    this.els.sfx.volume = 0.45;
    this.startClock();
    this.startParallax();
    this.startCursor();
    document.body.classList.add("loaded");
  },

  /* ---------- Helpers ---------- */

  // Deterministic pseudo-random hash (so letters look the same every visit)
  hash(str) {
    let h = 9;
    for (let i = 0; i < str.length; i++) h = Math.imul(h ^ str.charCodeAt(i), 387420489);
    return (h ^ h >>> 9) >>> 0;
  },

  // Membangun elemen lewat textContent, bukan innerHTML,
  // supaya teks dari data selalu diperlakukan sebagai teks biasa.
  el(tag, className = "", text = "") {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  },

  /* ---------- Ransom-note lettering ---------- */
  ransomize(el) {
    const text = el.dataset.ransom || el.textContent;
    el.textContent = "";
    [...text].forEach((c, i) => {
      const span = document.createElement("span");
      span.className = "ch display";
      span.textContent = c;
      const h = this.hash(text + i);
      const rot = (h % 17) - 8;                 // -8..8 degrees
      const scale = 0.86 + ((h >> 3) % 30) / 100; // 0.86..1.15
      const dy = ((h >> 5) % 9) - 4;            // -4..4 px
      const t = `rotate(${rot}deg) scale(${scale}) translateY(${dy}px)`;
      span.style.setProperty("--t", t);
      span.style.transform = t;
      const variant = (h >> 7) % 10;
      if (variant === 0) span.classList.add("box");
      else if (variant === 1) span.classList.add("boxw");
      else if (variant === 2) span.classList.add("red");
      el.appendChild(span);
    });
  },

  /* ---------- Screens & menu ---------- */
  showScreen(name) {
    const s = this.els.screens;
    Object.values(s).forEach(sc => sc.classList.remove("active"));
    s[name].classList.add("active");
    s[name].scrollTop = 0;
    document.body.dataset.screen = name;
  },

  setMenuSelection(index) {
    this.els.menuItems.forEach((m, j) => m.classList.toggle("sel", j === index));
  },

  // Diagonal wipe; calls swap() mid-way while the screen is covered
  wipe(swap, done) {
    if (this.reducedMotion) { swap(); done(); return; }
    const w = this.els.wipe;
    w.classList.remove("go"); void w.offsetWidth;  // restart animation
    w.classList.add("go");
    setTimeout(swap, 340);
    setTimeout(done, 720);
  },

  /* ---------- Sound ---------- */
  playSelect() {
    try {
      this.els.sfx.currentTime = 0;
      const p = this.els.sfx.play();
      if (p && p.catch) p.catch(() => {});  // blocked before first user gesture — fine
    } catch {}
  },

  setStatus(text) {
    this.els.projectStatus.textContent = text;
  },

  /* ---------- Projects ---------- */

  // groups: [{ category: { key, label, note }, items: [project, ...] }, ...]
  renderProjects(groups, status) {
    const { projectGrid } = this.els;
    projectGrid.replaceChildren();
    this.setStatus(status);

    let number = 0;
    groups.forEach(({ category, items }) => {
      const section = this.el("section", `project-group project-group--${category.key}`);
      section.appendChild(this.buildGroupHead(category));

      const row = this.el("div", `project-row project-row--${category.key}`);
      items.forEach(project => {
        number += 1;
        row.appendChild(this.buildProjectCard(project, category, number));
      });

      section.appendChild(row);
      projectGrid.appendChild(section);
    });
  },

  buildGroupHead(category) {
    const head = this.el("header", "project-group-head");
    head.append(
      this.el("span", "bar"),
      this.el("h2", "", category.label),
      this.el("span", "project-group-note", category.note),
    );
    return head;
  },

  // Satu kartu = satu tautan <a>. Klik ditangani Controller (event delegation).
  buildProjectCard(project, category, number) {
    const isPc = category.key === "pc";
    const card = this.el("a", `project-card project-card--${category.key}`);
    card.href = project.url;
    card.target = "_blank";
    card.rel = "noopener noreferrer";
    card.dataset.id = project.id;

    // Kartu HP sedikit miring seperti stiker; kartu PC lurus seperti layar
    const tilt = isPc ? 0 : ((this.hash(project.id) % 5) - 2) * 0.8;
    card.style.setProperty("--tilt", `${tilt}deg`);
    card.style.setProperty("--d", `${(number - 1) * 90}ms`);

    const body = this.el("div", "project-body");
    body.append(
      this.buildTitle(project.title),
      this.el("p", "project-desc", project.description),
      this.buildTags(project.tags),
      this.buildMeta(project),
    );

    card.append(
      this.buildThumb(category, number),
      this.el("span", "project-badge", category.badge),
      body,
    );
    return card;
  },

  // Ilustrasi bingkai perangkat dari CSS murni (tanpa file gambar, jadi tidak ada 404)
  buildThumb(category, number) {
    const thumb = this.el("div", `project-thumb project-thumb--${category.key}`);
    thumb.setAttribute("aria-hidden", "true");
    thumb.append(
      this.el("span", "device"),
      this.el("span", "thumb-num", String(number).padStart(2, "0")),
    );
    return thumb;
  },

  // Kata pertama judul tampil merah, gaya judul Persona
  buildTitle(title) {
    const h3 = this.el("h3");
    const [first, ...rest] = title.split(" ");
    h3.appendChild(this.el("em", "", first));
    if (rest.length) h3.append(` ${rest.join(" ")}`);
    return h3;
  },

  buildTags(tags) {
    const list = this.el("ul", "project-tags");
    tags.forEach(tag => list.appendChild(this.el("li", "", tag)));
    return list;
  },

  // Kiri: domain demo (sudah tervalidasi https oleh Model). Kanan: ajakan klik.
  buildMeta(project) {
    const meta = this.el("div", "project-meta");
    meta.append(
      this.el("span", "", new URL(project.url).hostname),
      this.el("span", "go", "Buka demo →"),
    );
    return meta;
  },

  /* ---------- Skills ---------- */
  renderSkills(groups) {
    groups.forEach(g => {
      const div = document.createElement("div");
      div.className = "skill-group";
      div.innerHTML = `<h3>${g.group}</h3>`;
      g.items.forEach(([name, value]) => {
        const row = document.createElement("div");
        row.className = "skill-row";
        row.innerHTML = `
          <span class="name">${name}</span>
          <div class="skill-bar"><div class="fill" data-v="${value}"></div></div>
          <span class="lv">${value}</span>`;
        div.appendChild(row);
      });
      this.els.skillsBody.appendChild(div);
    });
  },

  animateSkillBars() {
    const fills = this.els.skillsBody.querySelectorAll(".fill");
    fills.forEach(f => { f.style.width = "0"; });
    requestAnimationFrame(() => requestAnimationFrame(() => {
      fills.forEach((f, i) => setTimeout(() => { f.style.width = f.dataset.v + "%"; }, i * 60));
    }));
  },

  /* ---------- Ambient: clock, parallax, animated cursor ---------- */
  startClock() {
    setInterval(() => {
      this.els.clock.textContent =
        new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Jakarta" }) + " · IDN";
    }, 1000);
  },

  startParallax() {
    if (this.reducedMotion) return;
    const stripes = document.getElementById("bg-stripes");
    const halftone = document.getElementById("bg-halftone");
    const arts = [...document.querySelectorAll(".menu-art")];
    let tx = 0, ty = 0, cx = 0, cy = 0;
    addEventListener("mousemove", e => {
      tx = e.clientX / innerWidth - 0.5;
      ty = e.clientY / innerHeight - 0.5;
    }, { passive: true });
    const loop = () => {
      cx += (tx - cx) * 0.06; cy += (ty - cy) * 0.06;
      stripes.style.transform = `translate(${cx * 22}px, ${cy * 14}px)`;
      halftone.style.transform = `translate(${cx * -34}px, ${cy * -22}px)`;
      arts.forEach(a => {
        if (a.isConnected)
          a.style.transform = `translate(${cx * 14}px, ${cy * 9}px) scale(1.04)`;
      });
      requestAnimationFrame(loop);
    };
    loop();
  },

  // 30-frame sprite-strip cursor extracted from the original .ani files
  startCursor() {
    if (!matchMedia("(pointer:fine)").matches || this.reducedMotion) return;
    const cur = this.els.cursor;
    document.body.classList.add("cursor-on");
    let x = -100, y = -100, frame = 0, last = 0, visible = false;

    addEventListener("mousemove", e => {
      x = e.clientX; y = e.clientY;
      if (!visible) { cur.style.display = "block"; visible = true; }
      const t = e.target;
      const overLink = t.closest &&
        t.closest("a,button,.menu-item,.back-hint,.contact-chip,#big-name");
      cur.classList.toggle("link", !!overLink);
    }, { passive: true });

    document.documentElement.addEventListener("mouseleave", () => {
      cur.style.display = "none"; visible = false;
    });

    const tick = ts => {
      if (ts - last >= 50) {                       // 50ms = original .ani frame rate
        frame = (frame + 1) % 30; last = ts;
        cur.style.backgroundPosition = -frame * 48 + "px 0";
      }
      cur.style.transform = `translate(${x}px, ${y}px)`;
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  },
};
