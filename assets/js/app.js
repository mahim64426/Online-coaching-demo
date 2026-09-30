
(() => {
  "use strict";
  const STORE = "sbcc_demo_state_v2";
  const DEFAULTS = {
    settings: {phone:"01720811644",address:"জঙ্গল বাধাল মাধ্যমিক বিদ্যালয়ের দক্ষিণ পাশে, ভূমি অফিস সংলগ্ন",facebook:"https://www.facebook.com/share/1HqGay2GQ9/",map:"https://www.google.com/maps/search/?api=1&query=Basundia%20Union%20Bhumi%20Office%2C%2048FX%2B645"},
    notices: [{id:1,title:"নতুন ব্যাচ ও ক্লাস সংক্রান্ত তথ্য",date:"2026-09-29",text:"সর্বশেষ ব্যাচ, রুটিন ও গুরুত্বপূর্ণ নির্দেশনা ওয়েবসাইটে প্রকাশিত হবে।",published:true}],
    courses: [{id:1,title:"Class 6–10",cat:"Academic",desc:"শ্রেণিভিত্তিক পরিকল্পিত পাঠদান ও নিয়মিত অনুশীলন।",fee:""},{id:2,title:"ICT & Computer",cat:"Special",desc:"ICT, Computer, Web Design, Programming Basics ও পরীক্ষাভিত্তিক প্রস্তুতি।",fee:""},{id:3,title:"Accounting",cat:"Special",desc:"Journal, Ledger, Trial Balance, Final Account ও Board Question Practice।",fee:""},{id:4,title:"Mathematics",cat:"Special",desc:"General Mathematics ও BBA-এর বিভিন্ন Mathematics-related subject।",fee:""}],
    routine: [{batch:"Class 6",day:"Saturday",subject:"Mathematics",time:"—"},{batch:"Class 7",day:"Sunday",subject:"Science",time:"—"},{batch:"Class 8",day:"Monday",subject:"Mathematics",time:"—"},{batch:"Class 9",day:"Tuesday",subject:"Accounting",time:"—"},{batch:"Class 10",day:"Wednesday",subject:"ICT",time:"—"},{batch:"ICT",day:"Thursday",subject:"Computer / ICT",time:"—"},{batch:"Accounting",day:"Friday",subject:"Accounting Practice",time:"—"}],
    gallery: []
  };
  const clone = o => JSON.parse(JSON.stringify(o));
  // Always escape anything that goes through innerHTML (fixes stored-XSS in demo data)
  const esc = v => String(v ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const safeUrl = (u, ok) => { try { const x = new URL(u, location.href); return ok.includes(x.protocol) ? x.href : "#"; } catch (e) { return "#"; } };
  const safePhone = v => String(v || "").replace(/[^\d+]/g, "");
  function state() {
    const d = clone(DEFAULTS);
    try {
      const s = JSON.parse(localStorage.getItem(STORE) || "{}");
      if (s && typeof s === "object") {
        d.settings = {...d.settings, ...(s.settings || {})};
        ["notices","courses","routine","gallery"].forEach(k => { if (Array.isArray(s[k])) d[k] = s[k]; });
      }
    } catch (e) {}
    return d;
  }
  function save(s) { try { localStorage.setItem(STORE, JSON.stringify(s)); return true; } catch (e) { toast("Browser storage is unavailable"); return false; } }
  function toast(msg) {
    let t = document.querySelector(".toast");
    if (!t) { t = document.createElement("div"); t.className = "toast"; t.setAttribute("role", "status"); document.body.appendChild(t); }
    t.textContent = msg; t.classList.add("show"); clearTimeout(toast._t); toast._t = setTimeout(() => t.classList.remove("show"), 2200);
  }
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];

  $$("[data-year]").forEach(e => e.textContent = new Date().getFullYear());
  // Mobile menu: toggle, close on link click / outside click / Escape
  const menu = $(".menu-toggle"), nav = $(".nav");
  if (menu && nav) {
    const setOpen = o => { nav.classList.toggle("open", o); menu.setAttribute("aria-expanded", String(o)); menu.textContent = o ? "✕" : "☰"; menu.setAttribute("aria-label", o ? "Close menu" : "Open menu"); };
    menu.addEventListener("click", () => setOpen(!nav.classList.contains("open")));
    nav.addEventListener("click", e => { if (e.target.closest("a")) setOpen(false); });
    document.addEventListener("click", e => { if (!e.target.closest(".site-header")) setOpen(false); });
    document.addEventListener("keydown", e => { if (e.key === "Escape") setOpen(false); });
  }

  // Search + filter (combined so they no longer override each other)
  const q = $("[data-search]");
  let activeType = "all";
  function applyFilters() {
    const term = q ? q.value.trim().toLowerCase() : "";
    $$("[data-search-item]").forEach(x => {
      const okT = activeType === "all" || x.dataset.type === activeType;
      const okQ = !term || x.textContent.toLowerCase().includes(term);
      x.hidden = !(okT && okQ);
    });
    const empty = $("[data-empty]");
    if (empty) empty.hidden = $$("[data-search-item]").some(x => !x.hidden);
  }
  if (q) q.addEventListener("input", applyFilters);
  $$("[data-filter]").forEach(btn => btn.addEventListener("click", () => {
    $$("[data-filter]").forEach(b => { b.classList.remove("active"); b.setAttribute("aria-pressed", "false"); });
    btn.classList.add("active"); btn.setAttribute("aria-pressed", "true"); activeType = btn.dataset.filter; applyFilters();
  }));

  document.addEventListener("click", e => { const b = e.target.closest("[data-demo-toast]"); if (b) toast(b.dataset.demoToast); });
  const s = state();
  // Public data (uses data-attributes, not URL names, so it also works on clean URLs)
  $$("[data-phone]").forEach(e => { const p = safePhone(s.settings.phone); e.textContent = s.settings.phone; e.href = "tel:" + p; });
  $$("[data-facebook]").forEach(e => e.href = safeUrl(s.settings.facebook, ["https:", "http:"]));
  $$("[data-map]").forEach(e => e.href = safeUrl(s.settings.map, ["https:", "http:"]));
  $$("[data-address]").forEach(e => e.textContent = s.settings.address);
  const fmtDate = v => { const d = new Date((v || "") + "T00:00:00"); return isNaN(d) ? {day: "—", mon: ""} : {day: d.getDate(), mon: d.toLocaleString("en", {month: "short"})}; };
  const noticeBox = $("[data-live-notices]");
  if (noticeBox) noticeBox.innerHTML = s.notices.filter(n => n.published).map(n => { const d = fmtDate(n.date); return `<article class="card notice"><div class="date"><strong>${esc(d.day)}</strong><span>${esc(d.mon)}</span></div><div><h3>${esc(n.title)}</h3><p>${esc(n.text)}</p></div><span class="status ok">Published</span></article>`; }).join("") || '<div class="empty">এখনও কোনো প্রকাশিত নোটিশ নেই।</div>';
  const courseBox = $("[data-live-courses]");
  if (courseBox) { courseBox.innerHTML = s.courses.map(c => `<article class="card filter-item" data-type="${esc(c.cat)}" data-search-item><span class="icon">${c.cat === "Special" ? "★" : "01"}</span><h3>${esc(c.title)}</h3><p>${esc(c.desc)}</p><p style="margin-top:12px;color:#65f7c4">Course Fee: ${esc(c.fee || "To be updated")}</p></article>`).join(""); applyFilters(); }
  const routineBody = $("[data-live-routine]");
  if (routineBody) routineBody.innerHTML = s.routine.map(r => `<tr data-routine-row data-day="${esc(r.day)}" data-batch="${esc(r.batch)}"><td>${esc(r.day)}</td><td>${esc(r.batch)}</td><td>${esc(r.subject)}</td><td>${esc(r.time)}</td></tr>`).join("");
  const galleryBox = $("[data-live-gallery]");
  if (galleryBox && s.gallery.length) galleryBox.insertAdjacentHTML("beforeend", s.gallery.map(g => `<article class="card"><div class="map-card"><div><span class="icon">★</span><h3>${esc(g.title)}</h3><p>${esc(g.category)}</p></div></div></article>`).join(""));
  // Routine filters
  const routineDay = $("[data-routine-day]"), routineBatch = $("[data-routine-batch]");
  function filterRoutine() {
    let shown = 0;
    $$("[data-routine-row]").forEach(r => { const ok = (!routineDay || routineDay.value === "all" || routineDay.value === r.dataset.day) && (!routineBatch || routineBatch.value === "all" || routineBatch.value === r.dataset.batch); r.hidden = !ok; if (ok) shown++; });
    const e = $("[data-routine-empty]"); if (e) e.hidden = shown > 0;
  }
  if (routineDay) routineDay.addEventListener("change", filterRoutine);
  if (routineBatch) routineBatch.addEventListener("change", filterRoutine);
  filterRoutine();

  // ---------- Admin demo (front-end only) ----------
  const loginForm = $("[data-admin-login]");
  const hex = buf => [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, "0")).join("");
  const sha = async t => hex(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(t)));
  if (loginForm) {
    const msg = $("[data-login-msg]"), A = window.DEMO_AUTH || {};
    const configured = !!(A.emailHash && A.passHash && A.salt);
    if (msg && !configured) msg.textContent = "Demo credentials are not configured yet.";
    loginForm.addEventListener("submit", async e => {
      e.preventDefault();
      if (!configured) { msg.textContent = "Demo credentials are not configured yet."; return; }
      if (!(window.crypto && crypto.subtle)) { msg.textContent = "Please open the site over HTTPS to use the demo login."; return; }
      const email = loginForm.email.value.trim().toLowerCase(), pass = loginForm.password.value;
      const ok = (await sha(A.salt + email)) === A.emailHash && (await sha(A.salt + pass)) === A.passHash;
      if (ok) { sessionStorage.setItem("sbcc_admin_demo", "1"); location.href = "dashboard.html"; }
      else msg.textContent = "Email or password did not match the demo credentials.";
    });
  }
  if (document.body.dataset.admin === "dashboard") {
    if (sessionStorage.getItem("sbcc_admin_demo") !== "1") { location.replace("index.html"); return; }
    document.documentElement.classList.add("admin-ok");
    const logout = $("[data-logout]"); if (logout) logout.onclick = () => { sessionStorage.removeItem("sbcc_admin_demo"); location.href = "index.html"; };
    const panel = $("[data-workspace]");
    const mkForms = () => { const s = state(); return {
      settings:`<h2>Site Settings</h2><p class="section-note">Public contact and identity information for the demo.</p><div class="form-grid"><div class="field"><label>Phone</label><input id="set-phone" value="${esc(s.settings.phone)}"></div><div class="field"><label>Facebook</label><input id="set-facebook" value="${esc(s.settings.facebook)}"></div><div class="field full"><label>Address</label><input id="set-address" value="${esc(s.settings.address)}"></div><div class="field full"><label>Google Maps link</label><input id="set-map" value="${esc(s.settings.map)}"></div></div><div class="form-actions"><button class="btn primary" data-save-settings>Save Demo Settings</button></div>`,
      teacher:`<h2>Teacher Profile</h2><div class="form-grid"><div class="field"><label>Name</label><input value="Md Sumon Hossain" disabled></div><div class="field"><label>Bangla Name</label><input value="মোঃ সুমন হোসেন" disabled></div><div class="field full"><label>Qualification</label><input value="Honours BBA & Masters MBA" disabled></div><div class="field full"><label>Teacher Slogan</label><textarea>শিক্ষাদানই আমার পেশা, আপনাদের উজ্জ্বল ভবিষ্যৎই আমার লক্ষ্য</textarea></div></div><div class="form-actions"><button class="btn primary" data-demo-save>Save Preview</button></div>`,
      courses:`<h2>Courses</h2><div class="form-grid"><div class="field"><label>Course / Class</label><input id="course-title" placeholder="e.g. Class 8"></div><div class="field"><label>Category</label><select id="course-cat"><option>Academic</option><option>Special</option></select></div><div class="field full"><label>Description</label><textarea id="course-desc"></textarea></div><div class="field"><label>Course Fee</label><input id="course-fee" placeholder="Leave blank for later"></div></div><div class="form-actions"><button class="btn primary" data-add-course>Add Course</button></div><div class="mini-list" id="course-list"></div>`,
      batches:`<h2>Classes & Batches</h2><p class="section-note">Demo selector with separate Class 6, 7, 8, 9, 10 and special-course entries.</p><div class="cards three"><a class="card" href="../batches/class-6.html"><h3>Class 6</h3><p>View batch details →</p></a><a class="card" href="../batches/class-7.html"><h3>Class 7</h3><p>View batch details →</p></a><a class="card" href="../batches/class-8.html"><h3>Class 8</h3><p>View batch details →</p></a><a class="card" href="../batches/class-9.html"><h3>Class 9</h3><p>View batch details →</p></a><a class="card" href="../batches/class-10.html"><h3>Class 10</h3><p>View batch details →</p></a><a class="card" href="../batches/ict.html"><h3>ICT</h3><p>View special course →</p></a></div>`,
      routine:`<h2>Routine</h2><div class="form-grid"><div class="field"><label>Batch</label><select id="rt-batch"><option>Class 6</option><option>Class 7</option><option>Class 8</option><option>Class 9</option><option>Class 10</option><option>ICT</option><option>Accounting</option><option>Mathematics</option></select></div><div class="field"><label>Day</label><select id="rt-day"><option>Saturday</option><option>Sunday</option><option>Monday</option><option>Tuesday</option><option>Wednesday</option><option>Thursday</option><option>Friday</option></select></div><div class="field"><label>Subject</label><input id="rt-subject"></div><div class="field"><label>Time</label><input id="rt-time" placeholder="e.g. 6:30 PM"></div></div><div class="form-actions"><button class="btn primary" data-add-routine>Add Routine Row</button></div><div class="mini-list" id="routine-list"></div>`,
      notices:`<h2>Notices</h2><div class="form-grid"><div class="field"><label>Title</label><input id="notice-title"></div><div class="field"><label>Date</label><input id="notice-date" type="date" value="${new Date().toISOString().slice(0,10)}"></div><div class="field full"><label>Notice text</label><textarea id="notice-text"></textarea></div></div><div class="form-actions"><button class="btn primary" data-add-notice>Add Notice</button></div><div class="mini-list" id="notice-list"></div>`,
      gallery:`<h2>Gallery</h2><p class="section-note">Demo gallery metadata. Actual file uploads will later route through the Google Drive storage layer.</p><div class="form-grid"><div class="field"><label>Title</label><input id="gal-title" placeholder="Classroom Activity"></div><div class="field"><label>Category</label><input id="gal-cat" placeholder="Class / Exam / ICT"></div></div><div class="form-actions"><button class="btn primary" data-add-gallery>Add Gallery Item</button></div><div class="mini-list" id="gallery-list"></div>`,
      exams:`<h2>Exams & Results</h2><div class="cards three"><div class="card"><h3>Weekly Test</h3><p>Question, marks, date and batch can be configured here.</p></div><div class="card"><h3>Chapter Test</h3><p>Chapter-wise test setup for demo.</p></div><div class="card"><h3>Model Test</h3><p>Model test and result publication workflow.</p></div></div><div class="form-actions"><button class="btn primary" data-demo-save>Save Preview</button></div>`,
      resources:`<h2>Resources</h2><div class="cards three"><div class="card"><h3>Notes</h3><p>PDF / image resource metadata.</p></div><div class="card"><h3>CQ & MCQ</h3><p>Question-bank categories.</p></div><div class="card"><h3>Board Questions</h3><p>Board-question resources.</p></div></div><div class="form-actions"><button class="btn primary" data-demo-save>Save Preview</button></div>`,
      storage:`<h2>Files / Storage</h2><div class="cards three"><div class="card"><h3>Google Drive A</h3><p><span class="status ok">Ready</span></p></div><div class="card"><h3>Google Drive B</h3><p><span class="status pending">Future slot</span></p></div><div class="card"><h3>Google Drive C</h3><p><span class="status pending">Future slot</span></p></div></div><p style="color:var(--muted);line-height:1.8;margin-top:16px">Demo architecture treats Drive accounts as a unified application-level storage pool. OAuth tokens and private credentials will stay server-side when the real backend is connected.</p>`,
      backup:`<h2>Backup & Export</h2><p style="color:var(--muted);line-height:1.8">Export the current front-end demo state as JSON, then restore it later. This is a browser-only preview of the future backup workflow.</p><div class="form-actions"><button class="btn primary" data-export>Export Demo JSON</button><button class="btn ghost" data-reset>Reset Demo State</button></div>`
    }; };
    const tabs = $$("[data-tool]");
    function renderLists() {
      const st = state();
      const c = $("#course-list"); if (c) c.innerHTML = st.courses.map(x => `<div class="mini-row"><span><strong>${esc(x.title)}</strong><br><small>${esc(x.desc)}</small></span><button class="chip" type="button" data-del-course="${esc(x.id)}">Delete</button></div>`).join("");
      const r = $("#routine-list"); if (r) r.innerHTML = st.routine.map((x, i) => `<div class="mini-row"><span><strong>${esc(x.batch)} • ${esc(x.day)}</strong><br><small>${esc(x.subject)} • ${esc(x.time)}</small></span><button class="chip" type="button" data-del-routine="${i}">Delete</button></div>`).join("");
      const n = $("#notice-list"); if (n) n.innerHTML = st.notices.map(x => `<div class="mini-row"><span><strong>${esc(x.title)}</strong><br><small>${esc(x.date)} • ${x.published ? "Published" : "Draft"}</small></span><button class="chip" type="button" data-del-notice="${esc(x.id)}">Delete</button></div>`).join("");
      const g = $("#gallery-list"); if (g) g.innerHTML = st.gallery.map((x, i) => `<div class="mini-row"><span><strong>${esc(x.title)}</strong><br><small>${esc(x.category)}</small></span><button class="chip" type="button" data-del-gallery="${i}">Delete</button></div>`).join("") || '<div class="empty">No demo gallery metadata yet.</div>';
    }
    // One delegated listener: fixes duplicate handlers and delete buttons that never worked on newly added rows
    panel.addEventListener("click", e => {
      const t = e.target.closest("button"); if (!t) return;
      const z = state(), v = id => ($("#" + id) || {}).value || "";
      if (t.matches("[data-save-settings]")) { z.settings.phone = v("set-phone").trim() || z.settings.phone; z.settings.address = v("set-address"); z.settings.facebook = safeUrl(v("set-facebook"), ["https:", "http:"]); z.settings.map = safeUrl(v("set-map"), ["https:", "http:"]); if (save(z)) toast("Demo settings saved"); }
      else if (t.matches("[data-add-course]")) { z.courses.push({id: Date.now(), title: v("course-title").trim() || "New Course", cat: v("course-cat"), desc: v("course-desc").trim() || "Description will be updated.", fee: v("course-fee").trim()}); if (save(z)) { renderLists(); toast("Course added to demo"); } }
      else if (t.matches("[data-add-routine]")) { z.routine.push({batch: v("rt-batch"), day: v("rt-day"), subject: v("rt-subject").trim() || "Subject", time: v("rt-time").trim() || "—"}); if (save(z)) { renderLists(); toast("Routine row added"); } }
      else if (t.matches("[data-add-notice]")) { z.notices.unshift({id: Date.now(), title: v("notice-title").trim() || "New Notice", date: v("notice-date") || new Date().toISOString().slice(0, 10), text: v("notice-text").trim() || "Notice details will be updated.", published: true}); if (save(z)) { renderLists(); toast("Notice published in demo"); } }
      else if (t.matches("[data-add-gallery]")) { z.gallery.push({title: v("gal-title").trim() || "Gallery Item", category: v("gal-cat").trim() || "General"}); if (save(z)) { renderLists(); toast("Gallery item added"); } }
      else if (t.matches("[data-export]")) { const blob = new Blob([JSON.stringify(z, null, 2)], {type: "application/json"}), a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "sbcc-demo-backup.json"; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 1000); toast("Backup JSON exported"); }
      else if (t.matches("[data-reset]")) { if (confirm("Reset all demo changes?")) { localStorage.removeItem(STORE); location.reload(); } }
      else if (t.matches("[data-demo-save]")) toast("Preview saved locally in this browser");
      else if (t.dataset.delCourse) { z.courses = z.courses.filter(x => String(x.id) !== t.dataset.delCourse); save(z); renderLists(); }
      else if (t.dataset.delNotice) { z.notices = z.notices.filter(x => String(x.id) !== t.dataset.delNotice); save(z); renderLists(); }
      else if (t.dataset.delRoutine) { z.routine.splice(Number(t.dataset.delRoutine), 1); save(z); renderLists(); }
      else if (t.dataset.delGallery) { z.gallery.splice(Number(t.dataset.delGallery), 1); save(z); renderLists(); }
    });
    function openTool(name) { panel.innerHTML = `<div class="panel">${mkForms()[name] || "<h2>Coming in backend phase</h2>"}</div>`; tabs.forEach(t => { const on = t.dataset.tool === name; t.classList.toggle("active", on); t.setAttribute("aria-pressed", String(on)); }); renderLists(); }
    tabs.forEach(t => t.addEventListener("click", () => openTool(t.dataset.tool)));
    openTool("settings");
  }
})();
