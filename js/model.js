/* =====================================================================
   MODEL — data and state. Never touches the DOM.
   Daftar proyek ada di `projects`. Tambah / ubah objek di sana saja.
   ===================================================================== */

const Model = {

  // Where the contact form delivers (via formsubmit.co relay)
  contactEmail: "em.be.alawi@gmail.com",

  // App state (read/written by the Controller, displayed by the View)
  state: {
    screen: "home",        // which screen is showing
    menuIndex: 0,          // selected item on the home menu
    projectsRendered: false,
    skillsBuilt: false,
  },

  // ---- Kategori proyek: label dan tata letak kartu ----
  // key   : harus sama dengan nilai `category` pada proyek
  // label : judul grup
  // note  : keterangan singkat di samping judul grup
  // badge : label kecil di pojok kartu
  categories: {
    mobile: { key: "mobile", label: "Mobile View", note: "Responsive · layar HP", badge: "Mobile" },
    pc:     { key: "pc",     label: "Khusus PC",   note: "Desktop · layar laptop / PC", badge: "PC" },
  },

  // ---- Proyek (menu PROJECTS) ----
  // id          : unik, dipakai sebagai data-id di DOM
  // category    : "mobile" | "pc"
  // tags        : tech stack, ditampilkan sebagai chip
  // url         : tautan demo (wajib https, lihat isSafeUrl)
  projects: [
    {
      id: "hp-web-coba",
      title: "Persona 3 Reload Pause Menu",
      category: "mobile",
      description: "Portfolio yang meniru menu pause Persona 3 Reload dengan detail mirip aslinya, lengkap dengan layar loading dan kontrol bergaya keyboard.",
      tags: ["HTML", "CSS", "JavaScript"],
      url: "https://alawibro.github.io/hp-web-coba/",
    },
    {
      id: "coba-hp-web",
      title: "Biodata Pribadi",
      category: "mobile",
      description: "Halaman biodata dengan gaya santai: hobi, keluarga, dan fakta-fakta unik, dilengkapi beberapa easter egg tersembunyi.",
      tags: ["HTML", "CSS", "JavaScript"],
      url: "https://alawibro.github.io/coba-hp-web/",
    },
    {
      id: "hp-mykisah-wkwkwk",
      title: "My Kisah · Mahiru Shiina",
      category: "mobile",
      description: "Hub personal yang dibuka lewat gerbang \"Masuki kuil\", dengan suara dan video yang aktif setelah pengunjung masuk.",
      tags: ["HTML", "CSS", "JavaScript", "Audio & Video"],
      url: "https://alawibro.github.io/hp-mykisah-wkwkwk/",
    },
    {
      id: "khusus-pc-web",
      title: "Portfolio Desktop Edition",
      category: "pc",
      description: "Versi portfolio bergaya menu Persona yang dirancang khusus untuk layar PC dan laptop, dengan menu Projects, Skills, About, dan Contact.",
      tags: ["HTML", "CSS", "JavaScript"],
      url: "https://alawibro.github.io/khusus-pc-web/index.html",
    },
  ],

  // ---- Skills screen ----
  skills: [
    { group: "AI · ML · Data Science", items: [
      ["Python · pandas · NumPy", 92], ["TensorFlow / Keras · PyTorch", 88],
      ["scikit-learn · XGBoost", 86], ["CNNs & Transfer Learning", 85],
      ["NLP & Transformers", 82], ["Computer Vision · MediaPipe", 86],
    ]},
    { group: "Web & Full-Stack", items: [
      ["JavaScript / TypeScript", 86], ["React · React Native · Next.js", 84],
      ["Node.js · REST APIs", 80], ["TensorFlow.js (in-browser ML)", 84],
      ["PHP · SQL · PostgreSQL", 74], ["UX Design · Figma · Adobe XD", 82],
    ]},
    { group: "Cloud & Engineering", items: [
      ["Git & GitHub", 88], ["AWS · Azure · GCP", 74],
      ["Docker · Firebase", 76], ["Agile · PRINCE2 Agile", 80],
      ["Tableau · Power BI", 72], ["Bash · PowerShell", 75],
    ]},
    { group: "Spoken Languages", items: [
      ["English · Bengali · Hindi · Urdu", 100], ["Japanese (JLPT N4)", 62], ["Mandarin", 30],
    ]},
  ],

  /* ---------- Queries (pure functions over the data above) ---------- */

  // Hanya https yang boleh dibuka, supaya tidak ada javascript: atau data: URL yang lolos
  isSafeUrl(url) {
    try {
      return new URL(url).protocol === "https:";
    } catch {
      return false;
    }
  },

  // Proyek dikelompokkan per kategori, urutan kategori mengikuti `categories`.
  // Proyek dengan URL tidak valid dibuang di sini, sebelum sampai ke View.
  getProjectsByCategory() {
    return Object.values(this.categories)
      .map(category => ({
        category,
        items: this.projects.filter(
          p => p.category === category.key && this.isSafeUrl(p.url)
        ),
      }))
      .filter(group => group.items.length > 0);
  },

  findProject(id) {
    return this.projects.find(p => p.id === id) ?? null;
  },
};
