(() => {
  "use strict";

  /* ---------- header shadow + mobile action bar ---------- */
  const header = document.querySelector("[data-header]");
  const actionbar = document.querySelector(".actionbar");
  const hero = document.querySelector(".hero");
  const onScroll = () => {
    const y = window.scrollY;
    header && header.classList.toggle("is-scrolled", y > 8);
    if (actionbar && hero) actionbar.classList.toggle("is-visible", y > hero.offsetHeight * 0.6);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- mobile menu ---------- */
  const burger = document.querySelector("[data-burger]");
  const nav = document.getElementById("nav");
  const setMenu = (open) => {
    if (!burger || !nav) return;
    burger.setAttribute("aria-expanded", String(open));
    burger.setAttribute("aria-label", open ? "Закрити меню" : "Відкрити меню");
    nav.classList.toggle("is-open", open);
    document.body.classList.toggle("nav-open", open);
  };
  burger && burger.addEventListener("click", () => setMenu(burger.getAttribute("aria-expanded") !== "true"));
  nav && nav.addEventListener("click", (e) => { if (e.target.closest("a")) setMenu(false); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") setMenu(false); });

  /* ---------- forms (demo: validation + success state; connect to CRM/e-mail on launch) ---------- */
  document.querySelectorAll("[data-form]").forEach((form) => {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      let ok = true;
      form.querySelectorAll("[required]").forEach((el) => {
        const valid = el.value.trim().length > 1;
        el.closest(".field")?.classList.toggle("is-invalid", !valid);
        if (!valid && ok) { el.focus(); ok = false; }
      });
      if (!ok) return;
      const msg = form.querySelector(".form-success");
      if (msg) msg.hidden = false;
      form.querySelectorAll("input, textarea").forEach((el) => (el.value = ""));
    });
  });

  /* ---------- service network map ---------- */
  // Stations come from the list markup (data/site.yaml → data-* attributes).
  const list = document.querySelector("[data-stations]");
  const cities = {};
  if (list) {
    list.querySelectorAll(".station").forEach((s) => {
      cities[s.dataset.city] = {
        name: s.dataset.name,
        lat: parseFloat(s.dataset.lat),
        lon: parseFloat(s.dataset.lon),
        hq: s.hasAttribute("data-hq"),
      };
    });
  }
  const project = ({ lat, lon }) => ({
    x: 50 + ((lon - 25.6) / (37 - 25.6)) * 470,
    y: 40 + ((51 - lat) / (51 - 46.2)) * 320,
  });
  const svg = document.querySelector("[data-netmap]");
  const hqEntry = Object.values(cities).find((c) => c.hq);
  if (svg && hqEntry) {
    const NS = "http://www.w3.org/2000/svg";
    const links = svg.querySelector(".netmap__links");
    const nodes = svg.querySelector(".netmap__nodes");
    const hq = project(hqEntry);
    Object.entries(cities).forEach(([id, c]) => {
      const p = project(c);
      if (!c.hq) {
        const path = document.createElementNS(NS, "path");
        const mx = (hq.x + p.x) / 2, my = (hq.y + p.y) / 2 - 30;
        path.setAttribute("d", `M${hq.x},${hq.y} Q${mx},${my} ${p.x},${p.y}`);
        links.appendChild(path);
      }
      const g = document.createElementNS(NS, "g");
      g.setAttribute("class", "netmap__node" + (c.hq ? " is-hq" : ""));
      g.dataset.city = id;
      const labelLeft = p.x > 470;
      g.innerHTML =
        `<circle class="halo" cx="${p.x}" cy="${p.y}" r="${c.hq ? 18 : 13}"/>` +
        `<circle class="core" cx="${p.x}" cy="${p.y}" r="${c.hq ? 7 : 5.5}"/>` +
        `<text x="${labelLeft ? p.x - 14 : p.x + 14}" y="${p.y + 5}" text-anchor="${labelLeft ? "end" : "start"}">${c.name}</text>`;
      nodes.appendChild(g);
    });

    const activate = (id) => {
      svg.querySelectorAll(".netmap__node").forEach((n) => n.classList.toggle("is-active", n.dataset.city === id));
      list && list.querySelectorAll(".station").forEach((s) => s.classList.toggle("is-active", s.dataset.city === id));
    };
    list && list.querySelectorAll(".station").forEach((s) => {
      s.addEventListener("mouseenter", () => activate(s.dataset.city));
      s.addEventListener("focusin", () => activate(s.dataset.city));
    });
    svg.querySelectorAll(".netmap__node").forEach((n) => n.addEventListener("mouseenter", () => activate(n.dataset.city)));
    activate(Object.keys(cities).find((id) => cities[id].hq));
  }

  /* ---------- reveal on scroll ---------- */
  const revealTargets = document.querySelectorAll(
    ".section__head, .router__item, .equip__card, .feature-band, .service, .process, .netmap, .station-list, .parts__copy, .parts__search, .why__item, .quote, .faq__list, .cta__copy"
  );
  if ("IntersectionObserver" in window && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) { en.target.classList.add("is-visible"); io.unobserve(en.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px" });
    revealTargets.forEach((el, i) => {
      el.classList.add("reveal");
      el.style.transitionDelay = `${(i % 4) * 60}ms`;
      io.observe(el);
    });
  }

  /* ---------- year ---------- */
  const year = document.querySelector("[data-year]");
  if (year) year.textContent = new Date().getFullYear();
})();
