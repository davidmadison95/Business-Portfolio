// THEME MANAGEMENT
const ThemeManager = {
    init() {
        this.themeToggle = document.getElementById("theme-toggle");
        if (!this.themeToggle) return;

        this.setInitialTheme();
        this.bindEvents();
    },

    setInitialTheme() {
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        const savedTheme = localStorage.getItem("theme");

        const useDark = savedTheme === "dark" || (!savedTheme && prefersDark);
        const newTheme = useDark ? "dark" : "light";

        document.body.setAttribute("data-theme", newTheme);
        this.themeToggle.innerHTML =
            newTheme === "dark"
                ? '<i class="fas fa-sun"></i>'
                : '<i class="fas fa-moon"></i>';
    },

    bindEvents() {
        this.themeToggle.addEventListener("click", () => {
            const isDark = document.body.getAttribute("data-theme") === "dark";
            const newTheme = isDark ? "light" : "dark";

            document.body.setAttribute("data-theme", newTheme);
            localStorage.setItem("theme", newTheme);
            this.themeToggle.innerHTML =
                newTheme === "dark"
                    ? '<i class="fas fa-sun"></i>'
                    : '<i class="fas fa-moon"></i>';
        });
    },
};

// PAGE TRANSITIONS (purple slide screen)
const PageTransitions = {
    init() {
        this.transitionElement = document.querySelector(".page-transition");
        if (!this.transitionElement) return;

        this.bindEvents();
    },

    bindEvents() {
        document.querySelectorAll("a").forEach((link) => {
            // Same host, no target="_blank"
            if (link.hostname === window.location.hostname) {
                link.addEventListener("click", (e) => {
                    if (link.hasAttribute("target")) return;

                    const href = link.getAttribute("href");
                    if (!href || href.startsWith("#")) return;

                    e.preventDefault();
                    this.transitionTo(link.href);
                });
            }
        });
    },

    transitionTo(target) {
        this.transitionElement.style.transform = "translateY(0)";
        setTimeout(() => {
            window.location.href = target;
        }, 500);
    },
};

// Stubbed Resume Modal (safe even if not used)
const ResumeModal = {
    init() {
        this.modal = document.getElementById("resumeModal");
        this.openBtn = document.getElementById("resumeBtn");
        this.closeBtn = document.querySelector(".close-modal");
        this.downloadBtns = document.querySelectorAll(".btn-download");

        if (!this.modal) return;

        this.bindEvents();
        this.loadStats();
    },

    bindEvents() {
        if (this.openBtn) {
            this.openBtn.addEventListener("click", () => this.open());
        }

        if (this.closeBtn) {
            this.closeBtn.addEventListener("click", () => this.close());
        }

        this.downloadBtns.forEach((btn) => {
            btn.addEventListener("click", () => {
                const format = btn.dataset.format;
                this.handleDownload(btn, format);
            });
        });

        this.modal.addEventListener("click", (e) => {
            if (e.target === this.modal) this.close();
        });

        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape" && this.modal.classList.contains("active")) {
                this.close();
            }
        });
    },

    open() {
        this.modal.classList.add("active");
        document.body.style.overflow = "hidden";
    },

    close() {
        this.modal.classList.remove("active");
        document.body.style.overflow = "";
    },

    handleDownload(btn, format) {
        btn.classList.add("downloading");

        const stats = this.getStats();
        stats.total++;
        stats[format] = (stats[format] || 0) + 1;
        stats.lastDownload = new Date().toISOString();
        localStorage.setItem("resume_stats", JSON.stringify(stats));

        this.updateStats();

        setTimeout(() => {
            btn.classList.remove("downloading");
        }, 1000);
    },

    getStats() {
        const stats = localStorage.getItem("resume_stats");
        if (stats) return JSON.parse(stats);

        return {
            total: 0,
            pdf: 0,
            docx: 0,
            lastDownload: null,
        };
    },

    loadStats() {
        this.updateStats();
    },

    updateStats() {
        const stats = this.getStats();
        const totalElement = document.getElementById("resumeDownloadCount");
        const lastDownloadElement = document.getElementById("resumeLastDownload");

        if (totalElement) {
            this.animateNumber(
                totalElement,
                parseInt(totalElement.textContent || "0", 10),
                stats.total
            );
        }

        if (lastDownloadElement && stats.lastDownload) {
            const date = new Date(stats.lastDownload);
            lastDownloadElement.textContent = date.toLocaleDateString();
        }
    },

    animateNumber(element, start, end) {
        const duration = 1000;
        const step = Math.ceil((end - start) / (duration / 50)) || 1;
        let current = start;

        const timer = setInterval(() => {
            current += step;
            if (current >= end) {
                current = end;
                clearInterval(timer);
            }
            element.textContent = current;
        }, 50);
    },
};

// Skill Animations (only if you add .skill-progress later)
const SkillAnimations = {
    init() {
        this.skillBars = document.querySelectorAll(".skill-progress");
        if (!this.skillBars.length) return;

        this.observeSkills();
    },

    observeSkills() {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const bar = entry.target;
                        const value = bar.dataset.value;
                        bar.style.width = value + "%";
                        observer.unobserve(bar);
                    }
                });
            },
            { threshold: 0.3 }
        );

        this.skillBars.forEach((bar) => observer.observe(bar));
    },
};

document.addEventListener("DOMContentLoaded", () => {
    ThemeManager.init();
    PageTransitions.init();
    ResumeModal.init();
    SkillAnimations.init();

    // Optional typewriter support if you ever add .typewriter somewhere
    const typewriterElement = document.querySelector(".typewriter");
    if (typewriterElement) {
        const text = typewriterElement.dataset.text;
        let i = 0;
        (function type() {
            if (i < text.length) {
                typewriterElement.textContent += text.charAt(i);
                i++;
                setTimeout(type, 100);
            }
        })();
    }
});
