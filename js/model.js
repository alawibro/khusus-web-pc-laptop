/* =====================================================================
   MODEL — the data and state of the app. Never touches the DOM.
   Edit your content here: featured projects, skills, image overrides.
   ===================================================================== */

const Model = {

  githubUser: "alawibro",

  // Where the contact form delivers (via formsubmit.co relay)
  contactEmail: "em.be.alawi@gmail.com",

  // App state (read/written by the Controller, displayed by the View)
  state: {
    screen: "home",        // which screen is showing
    menuIndex: 0,          // selected item on the home menu
    reposLoaded: false,
    skillsBuilt: false,
  },

  // ---- Featured projects (hand-written, shown above the GitHub feed) ----
  // Isi dengan proyek Anda sendiri. Kosong = tidak ada kartu.
  featured: [],

  // Repo yang ada di "featured" disembunyikan dari daftar GitHub
  featuredRepoNames: [],

  // Ditampilkan kalau API GitHub tidak bisa diakses
  fallbackRepos: [],

  // Optional thumbnail overrides: repo name → image path.
  // Anything not listed is looked up at assets/projects/<RepoName>.png
  projectImages: {
    // "DownloadGuard": "assets/projects/downloadguard.png",
  },

  langColors: {
    JavaScript: "#f1e05a", TypeScript: "#3178c6", Python: "#3572A5",
    PHP: "#4F5D95", CSS: "#663399", HTML: "#e34c26",
    "Jupyter Notebook": "#DA5B0B", MATLAB: "#e16737", Java: "#b07219", C: "#555", "C++": "#f34b7d",
  },

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

  // ---- Data fetching ----
  async fetchRepos() {
    const skip = new Set(this.featuredRepoNames);
    try {
      const res = await fetch(
        `https://api.github.com/users/${this.githubUser}/repos?per_page=100&sort=updated`
      );
      if (!res.ok) throw new Error(res.status);
      const repos = (await res.json()).filter(r => !r.fork && !skip.has(r.name));
      return { repos, live: true };
    } catch {
      return { repos: this.fallbackRepos.filter(r => !skip.has(r.name)), live: false };
    }
  },
};
