
"use strict";

const DATA = window.ZW_DATA;
const APP_VERSION = "5.0.0-anon";
const SENSORY_LIST_VERSION = "cata-pilot-2026-11-v3-group-recommended"; // Változatlan, régi eredményekkel összehasonlítható
const DB_NAME = "zerowaste-entry-public-anon-v4";
const DB_VERSION = 1;
const STORE_SUBMISSIONS = "submissions";
const STORE_INSTITUTIONS = "institutions";
const STORE_DISHES = "userDishes";

const ATTRS = [
  ["appearance", "Külső megjelenés"],
  ["smell", "Illat"],
  ["taste", "Íz"],
  ["texture", "Állomány"],
  ["overall", "Összkedveltség"]
];

const stepTitles = [
  "1. Alapadatok",
  "2. Leves – mérés",
  "3. Leves – érzékszervi",
  "4. Második fogás – mérés",
  "5. Második fogás – érzékszervi",
  "6. Ellenőrzés"
];

let db;
let currentStep = 0;
let deferredInstallPrompt = null;

const sensoryState = {
  soup: {},
  main: {}
};

const photoState = {
  soup: null,
  main: null
};

const $ = (id) => document.getElementById(id);
const qs = (sel, root = document) => root.querySelector(sel);
const qsa = (sel, root = document) => [...root.querySelectorAll(sel)];

function bindById(id, eventName, handler) {
  const el = $(id);
  if (!el) {
    console.warn(`[Adatrögzítő modul] Hiányzó UI-elem: #${id}; esemény: ${eventName}`);
    return false;
  }
  el.addEventListener(eventName, handler);
  return true;
}

function bindElement(el, eventName, handler, label = "dinamikus elem") {
  if (!el) {
    console.warn(`[Adatrögzítő modul] Hiányzó ${label}; esemény: ${eventName}`);
    return false;
  }
  el.addEventListener(eventName, handler);
  return true;
}

function todayISO() {
  const d = new Date();
  const offset = d.getTimezoneOffset();
  const local = new Date(d.getTime() - offset * 60 * 1000);
  return local.toISOString().slice(0, 10);
}

function localIsoWithOffset(date = new Date()) {
  const pad = (n) => String(Math.abs(Math.trunc(n))).padStart(2, "0");
  const y = date.getFullYear();
  const m = pad(date.getMonth() + 1);
  const d = pad(date.getDate());
  const hh = pad(date.getHours());
  const mm = pad(date.getMinutes());
  const ss = pad(date.getSeconds());
  const offMin = -date.getTimezoneOffset();
  const sign = offMin >= 0 ? "+" : "-";
  const oh = pad(Math.floor(Math.abs(offMin) / 60));
  const om = pad(Math.abs(offMin) % 60);
  return `${y}-${m}-${d}T${hh}:${mm}:${ss}${sign}${oh}:${om}`;
}

function fmtNumber(x, digits = 2) {
  if (x === null || x === undefined || Number.isNaN(Number(x))) return "–";
  return Number(x).toLocaleString("hu-HU", { maximumFractionDigits: digits });
}

function safeText(x) {
  return String(x ?? "").trim();
}

function parseDecimal(value) {
  const raw = String(value ?? "").trim().replace(/\s+/g, "").replace(",", ".");
  if (!raw) return NaN;
  const x = Number(raw);
  return Number.isFinite(x) ? x : NaN;
}

function numberValue(id) {
  const el = $(id);
  if (!el) return NaN;
  return parseDecimal(el.value);
}

function selectedAge() {
  return DATA.ageGroups.find(x => x.label === $("ageGroup").value) || null;
}

function getMasterDishes(course) {
  return DATA.dishes.filter(x => x.course === course).map(x => x.dish_name);
}

async function getUserDishes(course) {
  const rows = await idbGetAll(STORE_DISHES);
  return rows.filter(x => x.course === course).map(x => x.dishName);
}

function descriptorOptions(prefix, attribute, score = null) {
  const course = prefix === "soup" ? "Leves" : "Második fogás";
  return DATA.sensoryDescriptors
    .filter(x => x.course === course && x.attribute === attribute)
    .filter(x => x.descriptor !== "Megfelelő" || Number(score) === 5)
    .map(x => x.descriptor);
}

function findDishPortion(course, dish, regAge) {
  return DATA.dishPortions.find(
    x => x.course === course && x.dish_name === dish && x.reg_age_group === regAge
  ) || null;
}

function findPortionGuide(portionKey, regAge) {
  return DATA.portionGuide.find(
    x => x.portion_key === portionKey && x.reg_age_group === regAge
  ) || null;
}

function dishComponentsFor(dish) {
  return DATA.dishComponents.filter(
    x => x.course === "Második fogás" && x.dish === dish
  );
}

function showToast(message, ms = 2800) {
  const el = $("toast");
  el.textContent = message;
  el.classList.remove("hidden");
  clearTimeout(showToast._timer);
  showToast._timer = setTimeout(() => el.classList.add("hidden"), ms);
}

/* IndexedDB-adattárolás */
function openDatabase() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (event) => {
      const database = event.target.result;
      if (!database.objectStoreNames.contains(STORE_SUBMISSIONS)) {
        const store = database.createObjectStore(STORE_SUBMISSIONS, { keyPath: "submissionId" });
        store.createIndex("mealDate", "mealDate", { unique: false });
        store.createIndex("institutionName", "institutionName", { unique: false });
      }
      if (!database.objectStoreNames.contains(STORE_INSTITUTIONS)) {
        database.createObjectStore(STORE_INSTITUTIONS, { keyPath: "institutionName" });
      }
      if (!database.objectStoreNames.contains(STORE_DISHES)) {
        database.createObjectStore(STORE_DISHES, { keyPath: "key" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function idbPut(storeName, value) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, "readwrite");
    tx.objectStore(storeName).put(value);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

function idbGetAll(storeName) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, "readonly");
    const req = tx.objectStore(storeName).getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
}

function idbDelete(storeName, key) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, "readwrite");
    tx.objectStore(storeName).delete(key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function seedReferenceInstitutions() {
  const current = await idbGetAll(STORE_INSTITUTIONS);
  const referenceNames = new Set(DATA.institutions.map(x => x.institution_name));

  // A korábbi verzióban tévesen bekerült referencia-intézményeket
  // eltávolítjuk, de a felhasználó által kézzel felvett intézményeket megtartjuk.
  for (const row of current) {
    if ((row.source === "reference" || row.source === "jelenlegi kutatási adatállomány") &&
        !referenceNames.has(row.institutionName)) {
      await idbDelete(STORE_INSTITUTIONS, row.institutionName);
    }
  }

  const refreshed = await idbGetAll(STORE_INSTITUTIONS);
  const names = new Set(refreshed.map(x => x.institutionName));

  for (const row of DATA.institutions) {
    if (!names.has(row.institution_name)) {
      await idbPut(STORE_INSTITUTIONS, {
        institutionName: row.institution_name,
        sheetName: row.sheet_name || makeSheetName(row.institution_name),
        source: "reference",
        active: true,
        createdAt: localIsoWithOffset()
      });
    } else {
      const existing = refreshed.find(x => x.institutionName === row.institution_name);
      if (existing && existing.source === "reference" && existing.sheetName !== row.sheet_name) {
        await idbPut(STORE_INSTITUTIONS, {
          ...existing,
          sheetName: row.sheet_name || makeSheetName(row.institution_name)
        });
      }
    }
  }
}

/* A felhasználói felület előkészítése */
async function populateAgeGroups() {
  const sel = $("ageGroup");
  DATA.ageGroups.forEach(x => {
    const o = document.createElement("option");
    o.value = x.label;
    o.textContent = x.label;
    sel.appendChild(o);
  });
}

function populateRecorders() {
  // Az adatrögzítő neve szabad szöveges mező: nincs előre rögzített névlista.
}

async function refreshInstitutionSelectors() {
  const rows = (await idbGetAll(STORE_INSTITUTIONS))
    .filter(x => x.active !== false)
    .sort((a, b) => a.institutionName.localeCompare(b.institutionName, "hu"));

  for (const id of ["institution", "exportInstitution"]) {
    const sel = $(id);
    const first = id === "institution"
      ? `<option value="">Válasszon intézményt…</option>`
      : `<option value="">Minden intézmény</option>`;
    sel.innerHTML = first;
    rows.forEach(x => {
      const o = document.createElement("option");
      o.value = x.institutionName;
      o.textContent = x.institutionName;
      sel.appendChild(o);
    });
  }
  renderInstitutionList(rows);
}

async function refreshDishLists() {
  const soup = [...new Set([
    ...getMasterDishes("Leves"),
    ...(await getUserDishes("Leves"))
  ])].sort((a, b) => a.localeCompare(b, "hu"));

  const main = [...new Set([
    ...getMasterDishes("Második fogás"),
    ...(await getUserDishes("Második fogás"))
  ])].sort((a, b) => a.localeCompare(b, "hu"));

  $("soupDishList").innerHTML = soup.map(x => `<option value="${escapeHtml(x)}"></option>`).join("");
  $("mainDishList").innerHTML = main.map(x => `<option value="${escapeHtml(x)}"></option>`).join("");
}

function escapeHtml(text) {
  return String(text ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

// CATA 4.3: az ajánlások ételcsoporthoz igazodnak, a teljes lista változatlanul kereshető.
const CATA = window.ZW_CATA_PROFILES;
const cataContext = {
  soup: { dish: "", groups: [], manuallyEdited: false },
  main: { dish: "", groups: [], manuallyEdited: false }
};

function courseForPrefix(prefix) {
  return prefix === "soup" ? "Leves" : "Második fogás";
}

function cataDishName(prefix) {
  return safeText($(prefix === "soup" ? "soupDish" : "mainDish").value);
}

function setCataDish(prefix, { silent = false } = {}) {
  const name = cataDishName(prefix);
  const ctx = cataContext[prefix];
  if (ctx.dish === name) return;
  const hadRating = Object.values(sensoryState[prefix]).some(x => x && (x.score !== null || x.descriptors.length)) || v5HasComponentData(prefix) || Object.keys(v5State[prefix]?.meal?.jar || {}).length > 0 || Object.keys(v5State[prefix]?.meal?.intensities || {}).length > 0;
  const course = courseForPrefix(prefix);
  const table = CATA.dishGroups[course] || {};
  const knownName = Object.keys(table).find(x => x.localeCompare(name, "hu", { sensitivity: "base" }) === 0);
  ctx.dish = name;
  ctx.groups = knownName ? [...table[knownName]] : [];
  ctx.manuallyEdited = false;
  // Az előző ételre rögzített pontszámok és hibák nem vihetők át az új fogásra.
  renderSensory(prefix, prefix === "soup" ? "soupSensory" : "mainSensory");
  if (hadRating && !silent) showToast("Az étel neve megváltozott: a korábbi érzékszervi pontszámokat és jellemzőket töröltük.", 5200);
}

function cataRecommended(prefix, attr, score) {
  const course = courseForPrefix(prefix);
  const valid = new Set(descriptorOptions(prefix, attr, score));
  const base = CATA.baseDescriptors[attr] || [];
  const extras = cataContext[prefix].groups.flatMap(group => (CATA.groupDescriptors[group] || {})[attr] || []);
  const dish = cataFold(cataContext[prefix].dish);
  const featureDescriptors = (CATA.featureDescriptors || [])
    .filter(rule => rule.course === course && rule.matchAny.some(token => dish.includes(cataFold(token))))
    .flatMap(rule => (rule.byAttr || {})[attr] || []);
  return [...new Set([...base, ...extras, ...featureDescriptors])].filter(value => valid.has(value));
}

function cataFold(x) {
  return String(x || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("hu");
}

function renderSensory(prefix, containerId) {
  const container = $(containerId);
  container.innerHTML = "";
  const ctx = cataContext[prefix];
  const course = courseForPrefix(prefix);
  const groups = CATA.courseGroups[course] || [];
  const needsReview = (CATA.reviewDishNames[course] || []).includes(ctx.dish);
  const knownDish = !!CATA.dishGroups[course]?.[ctx.dish];

  const controls = document.createElement("div");
  controls.className = "cata-context";
  controls.innerHTML = `
    <div class="cata-context-title">CATA – ételcsoport-specifikus ajánlások</div>
    <div class="cata-selected-dish"><strong>Étel:</strong> ${escapeHtml(ctx.dish || "Még nincs kiválasztva")}</div>
    <div class="cata-group-summary" aria-live="polite"></div>
    <details class="cata-group-details" ${(!knownDish || needsReview) ? "open" : ""}>
      <summary>Ételcsoportok ellenőrzése / módosítása</summary>
      <p class="cata-explainer">Több csoportot is megjelölhet (például rántott hús és burgonyaköret). A besorolás csak az ajánlott jellemzőket módosítja; a teljes lista minden esetben kereshető.</p>
      <div class="cata-group-choices"></div>
    </details>
  `;
  container.appendChild(controls);
  const groupChoices = qs(".cata-group-choices", controls);
  groupChoices.innerHTML = groups.map(g => `
    <label class="cata-group-choice">
      <input type="checkbox" value="${escapeHtml(g.id)}" ${ctx.groups.includes(g.id) ? "checked" : ""}>
      <span>${escapeHtml(g.label)}</span>
    </label>
  `).join("");

  function refreshGroupSummary() {
    const label = ctx.groups.map(k => groups.find(g => g.id === k)?.label || k).join(" · ");
    const note = !ctx.dish ? "Először adja meg az étel nevét." : !ctx.groups.length ?
      "Nincs kiválasztott csoport: általános jellemzők jelennek meg. Kérjük, ellenőrizze a besorolást." :
      (needsReview && !ctx.manuallyEdited ? "Előzetes besorolás – receptúra alapján ellenőrizendő. " : "") +
      (ctx.manuallyEdited ? "Kézzel módosított: " : "Ajánlott csoportok: ") + label;
    qs(".cata-group-summary", controls).textContent = note;
  }
  refreshGroupSummary();
  qsa(".cata-group-choice input", controls).forEach(input => {
    input.addEventListener("change", () => {
      ctx.groups = qsa(".cata-group-choice input:checked", controls).map(x => x.value);
      ctx.manuallyEdited = true;
      refreshGroupSummary();
      qsa(".sensory-card", container).forEach(card => card.refreshCata?.());
      v5AfterGroupChange(prefix);
    });
  });

  for (const [key, label] of ATTRS) {
    sensoryState[prefix][key] = { score: null, descriptors: [] };
    const card = document.createElement("div");
    card.className = "sensory-card";
    card.dataset.prefix = prefix;
    card.dataset.attr = key;

    if (key === "overall") {
      card.innerHTML = `
        <h3>${label} <b class="required-star">*</b></h3>
        <div class="score-row" aria-label="${label} pontszám">
          ${[1,2,3,4,5].map(n => `<button class="score-btn" data-score="${n}" type="button">${n}</button>`).join("")}
        </div>
        <div class="sensory-rule-note">Összkedveltség: 1 = egyáltalán nem kedvelt; 5 = nagyon kedvelt. Ennél a kérdésnél nem szükséges CATA-tulajdonság.</div>
      `;
      container.appendChild(card);
      qsa(".score-btn", card).forEach(btn => btn.addEventListener("click", () => {
        qsa(".score-btn", card).forEach(b => b.classList.remove("selected"));
        btn.classList.add("selected");
        sensoryState[prefix][key].score = Number(btn.dataset.score);
        updateFinalState();
      }));
      continue;
    }

    card.innerHTML = `
      <h3>${label} <b class="required-star">*</b></h3>
      <div class="score-row" aria-label="${label} pontszám">
        ${[1,2,3,4,5].map(n => `<button class="score-btn" data-score="${n}" type="button">${n}</button>`).join("")}
      </div>
      <div class="sensory-rule-note">Először adjon pontszámot. Az ajánlott jellemzők az ételcsoport szerint változnak. 5 pontnál a „Megfelelő” válasz is használható.</div>
      <div class="descriptor-required-label">CATA-tulajdonság(ok) <b>*</b> <span>– jelölje az összes jellemzőt</span></div>
      <div class="cata-recommended">
        <div class="cata-options-label">Ételhez ajánlott jellemzők <span class="cata-reco-count"></span></div>
        <div class="cata-reco-buttons" aria-label="Ajánlott ${label} tulajdonságok"></div>
      </div>
      <details class="cata-full-list">
        <summary>Teljes tulajdonságlista keresése</summary>
        <label class="cata-search-label" for="${prefix}-${key}-search">Keresés az összes ${escapeHtml(label.toLocaleLowerCase("hu"))} jellemzőben</label>
        <input id="${prefix}-${key}-search" class="descriptor-input" type="search" placeholder="Kezdje el begépelni a jellemzőt…" autocomplete="off">
        <div class="cata-search-count" aria-live="polite"></div>
        <div class="cata-all-options" aria-label="Teljes CATA-lista találatai"></div>
      </details>
      <div class="chips" aria-live="polite"></div>
      <button class="secondary-btn small add-other-btn" type="button">Egyéb tulajdonság</button>
      <div class="descriptor-row other-row hidden">
        <input class="other-descriptor" type="text" placeholder="Csak akkor adja meg, ha nincs a listában">
        <button class="secondary-btn add-other-confirm-btn" type="button">Hozzáad</button>
      </div>
    `;
    container.appendChild(card);
    const st = sensoryState[prefix][key];
    const recommended = qs(".cata-reco-buttons", card);
    const fullList = qs(".cata-all-options", card);
    const searchInput = qs(".descriptor-input", card);
    const selectedChips = qs(".chips", card);
    const otherRow = qs(".other-row", card);
    const otherInput = qs(".other-descriptor", card);

    function chooseDescriptor(value) {
      if (st.score === null) {
        showToast("Először válassza ki az érzékszervi pontszámot.", 3500);
        return;
      }
      if (value === "Megfelelő") {
        if (st.score !== 5) return showToast("A „Megfelelő” csak 5 pontnál választható.");
        st.descriptors = ["Megfelelő"];
      } else {
        st.descriptors = st.descriptors.filter(x => x !== "Megfelelő");
        if (!st.descriptors.includes(value)) st.descriptors.push(value);
      }
      refreshCata();
      updateFinalState();
    }

    function renderChips() {
      selectedChips.innerHTML = st.descriptors.map((d, i) =>
        `<span class="chip">${escapeHtml(d)}<button type="button" data-i="${i}" aria-label="${escapeHtml(d)} törlése">×</button></span>`
      ).join("");
      qsa(".chip button", selectedChips).forEach(btn => btn.addEventListener("click", () => {
        st.descriptors.splice(Number(btn.dataset.i), 1);
        refreshCata();
        updateFinalState();
      }));
    }

    function renderRecommendations() {
      const options = cataRecommended(prefix, label, st.score).filter(d => !st.descriptors.includes(d));
      recommended.innerHTML = options.length
        ? options.map(d => `<button type="button" class="cata-choice" data-descriptor="${escapeHtml(d)}">${escapeHtml(d)}</button>`).join("")
        : `<span class="small-muted">Nincs további ajánlott jellemző. A teljes lista továbbra is kereshető.</span>`;
      qs(".cata-reco-count", card).textContent = `(${options.length})`;
      qsa(".cata-choice", recommended).forEach(btn => btn.addEventListener("click", () => chooseDescriptor(btn.dataset.descriptor)));
    }

    function renderFullSearch() {
      const term = cataFold(searchInput.value);
      const all = descriptorOptions(prefix, label, st.score);
      const matches = all.filter(d => !st.descriptors.includes(d) && cataFold(d).includes(term));
      qs(".cata-search-count", card).textContent = `${matches.length} találat a ${all.length} elérhető jellemzőből`;
      fullList.innerHTML = matches.length
        ? matches.map(d => `<button type="button" class="cata-choice cata-choice-secondary" data-descriptor="${escapeHtml(d)}">${escapeHtml(d)}</button>`).join("")
        : `<span class="small-muted">Nincs találat. Próbálja más kifejezéssel, vagy adjon meg egyéb tulajdonságot.</span>`;
      qsa(".cata-choice", fullList).forEach(btn => btn.addEventListener("click", () => chooseDescriptor(btn.dataset.descriptor)));
    }

    function refreshCata() {
      renderRecommendations();
      renderFullSearch();
      renderChips();
    }
    card.refreshCata = refreshCata;

    qsa(".score-btn", card).forEach(btn => btn.addEventListener("click", () => {
      qsa(".score-btn", card).forEach(b => b.classList.remove("selected"));
      btn.classList.add("selected");
      st.score = Number(btn.dataset.score);
      if (st.score !== 5 && st.descriptors.includes("Megfelelő")) {
        st.descriptors = st.descriptors.filter(x => x !== "Megfelelő");
        showToast("A „Megfelelő” csak 5 pontos értékelésnél választható.");
      }
      refreshCata();
      updateFinalState();
    }));

    bindElement(searchInput, "input", renderFullSearch);
    bindElement(qs(".add-other-btn", card), "click", () => {
      otherRow.classList.toggle("hidden");
      if (!otherRow.classList.contains("hidden")) otherInput.focus();
    });
    bindElement(qs(".add-other-confirm-btn", card), "click", () => {
      const value = safeText(otherInput.value);
      if (!value) return;
      if (st.score === null) return showToast("Először adja meg az érzékszervi pontszámot.");
      // Elkerüljük az azonos jelentésű, eltérő kis-/nagybetűs duplikációkat.
      const match = descriptorOptions(prefix, label, st.score).find(d => cataFold(d) === cataFold(value));
      const candidate = match || value;
      if (cataFold(candidate) === cataFold("Megfelelő") && st.score !== 5) {
        return showToast("A „Megfelelő” csak 5 pontnál választható.");
      }
      chooseDescriptor(candidate);
      otherInput.value = "";
      otherRow.classList.add("hidden");
    });
    bindElement(otherInput, "keydown", e => {
      if (e.key === "Enter") {e.preventDefault();qs(".add-other-confirm-btn", card).click();}
    });
    refreshCata();
  }
  // Új, egységes részletes értékelés: opcionális skálák és komponensek.
  v5RenderExtendedSensory(prefix, container);
}

function sensoryComplete(prefix) {
  const dishComplete = ATTRS.every(([key]) => {
    const s = sensoryState[prefix][key];
    return s.score !== null && (key === "overall" || s.descriptors.length > 0);
  });
  return dishComplete && v5ComponentsComplete(prefix) && v5ScalesComplete(prefix);
}

function sensoryFlat(prefix) {
  const out = {};
  for (const [key] of ATTRS) {
    const s = sensoryState[prefix][key];
    out[key] = s.score;
    out[`${key}Desc`] = [...s.descriptors].join(" | ");
  }
  return out;
}

/* ZeroWaste Entry 5.0 – egyetlen részletes érzékszervi folyamat.
 * Visszamenőleg kompatibilis: a korábbi ételszintű pontok és CATA-mezők változatlanok.
 * A komponensek, választható JAR és 4 alapíz-intenzitás külön exporttáblákba kerülnek.
 */
const SENSORY_V5 = window.ZW_SENSORY_V5;
const v5State = { soup:null, main:null };
let v5ComponentSerial = 0;
const v5Attributes = ATTRS.filter(([key]) => key !== "overall");

function v5BlankRatings() {
  return Object.fromEntries(ATTRS.map(([key]) => [key,{score:null,descriptors:[]}]));
}
function v5BlankScales() { return {jar:{},intensities:{}}; }
function v5NewComponent(name, kind, source = "suggested") {
  return {componentId:`c${++v5ComponentSerial}`,name,kind,source,ratings:v5BlankRatings(),...v5BlankScales()};
}
function v5Kind(id) {
  return SENSORY_V5.componentTypes.find(x => x.id === id) || SENSORY_V5.componentTypes.find(x => x.id === "main");
}
function v5DishIncludes(name, tokens) {
  const normalized = cataFold(name);
  return tokens.some(x => normalized.includes(cataFold(x)));
}
function v5SuggestedComponents(prefix) {
  const ctx = cataContext[prefix];
  const name = ctx.dish || "";
  const gs = new Set(ctx.groups);
  const result = [];
  const add = (label, kind) => { if (!result.some(x => x.kind === kind && x.name === label)) result.push({name:label,kind}); };
  const has = tokens => v5DishIncludes(name,tokens);
  if (prefix === "soup") {
    if (gs.has("CREAM_SOUP")) add("Krémleves", "cream_soup");
    else if (gs.has("FRUIT_SOUP")) { add("Gyümölcsleves leve", "fruit_liquid"); add("Gyümölcsdarabok", "vegetables"); }
    else add("Leveslé", "soup_liquid");
    if (has(["cérnamet", "galuska", "gombóc", "csipetke", "tészta", "lebbenc", "betét", "tarhonya", "kocka"])) add("Levesbetét", "soup_insert");
    if (gs.has("HEARTY_SOUP") || has(["zöldség", "gulyás", "bab", "lencse"])) add("Zöldség / hüvelyes / betét", "vegetables");
    if (has(["hús", "csirke", "marha", "sertés", "ragu", "pulyka"])) add("Húsdarabok", "meat");
    if (has(["pirított kenyér", "kruton"])) add("Levesbetét", "soup_insert");
  } else if (gs.has("VEGETABLE_STEW") || gs.has("LEGUME_DISH") || has(["főzelék"])) {
    add("Főzelék", "stew");
    if (has(["vagdalt", "fasírt", "virsli", "pörkölt", "feltét", "sertés", "hús", "csirke", "tojás"])) add("Feltét", "meat");
  } else if (gs.has("SWEET_MAIN") || gs.has("DAIRY_CEREAL") || cataFold(name) === "nudli" || has(["gőzgombóc", "tejberizs", "mákos guba", "grízes metélt"])) {
    add("Édes főétel", "sweet");
    if (has(["sodó", "öntet", "szórat", "mák", "dió", "cukor", "lekvár"])) add("Öntet / szórat", "topping");
  } else if (gs.has("MIXED_SAVORY") || has(["rakott"])) {
    add("Egytálétel / rakott étel", "main");
    if (gs.has("SAUCE") || has(["mártás", "szaft"])) add("Mártás / szaft", "sauce");
  } else {
    if (gs.has("FISH")) add("Hal", "fish");
    else if (gs.has("FRIED_MEAT") || gs.has("ROAST_MEAT") || gs.has("MEAT_STEW") || has(["csirke", "hús", "sertés", "pulyka", "vagdalt", "fasírt"])) add("Hús / főkomponens", "meat");
    else add("Főkomponens", "main");
    if (gs.has("FRIED_MEAT")) add("Panír / bunda", "coating");
    if (gs.has("POTATO_SIDE") || has(["burgonya", "krumpli", "püré"])) add("Burgonyaköret", "potato");
    else if (gs.has("GRAIN_SIDE") || has(["rizs", "bulgur", "tarhonya"])) add("Rizs / gabonaköret", "rice");
    else if (gs.has("PASTA_SAVORY") || has(["galuska", "tészta", "spagetti", "metélt"])) add("Tészta / galuska", "pasta");
    if (gs.has("SAUCE") || has(["mártás", "szaft", "paprikás", "pörkölt", "tokány"])) add("Mártás / szaft", "sauce");
  }
  return (result.length ? result : [{name:"Főkomponens",kind:"main"}]).slice(0,5).map(x => v5NewComponent(x.name,x.kind));
}
function v5Init(prefix) {
  v5State[prefix] = { meal:v5BlankScales(), components:v5SuggestedComponents(prefix), componentsEdited:false };
}
function v5HasComponentData(prefix) {
  return (v5State[prefix]?.components || []).some(comp =>
    Object.values(comp.ratings).some(s => s.score !== null || s.descriptors.length) ||
    Object.values(comp.jar).length || Object.values(comp.intensities).length
  );
}
function v5AfterGroupChange(prefix) {
  if (!v5State[prefix]) return;
  if (!v5State[prefix].componentsEdited && !v5HasComponentData(prefix)) {
    v5State[prefix].components = v5SuggestedComponents(prefix);
    v5RenderComponents(prefix);
  }
}
function v5ComponentRecommendation(prefix, component, attribute, score) {
  const valid = new Set(descriptorOptions(prefix, attribute, score));
  const kind = v5Kind(component.kind);
  const recommended = [...(CATA.baseDescriptors[attribute] || []),...(kind.descriptors[attribute] || [])];
  return [...new Set(recommended)].filter(x => valid.has(x));
}
function v5JarOptions(kind = null) {
  const preferred = kind ? v5Kind(kind).jar : [];
  const selected = SENSORY_V5.jarProperties.filter(x => preferred.includes(x.id));
  return [...selected,...SENSORY_V5.jarProperties.filter(x => !preferred.includes(x.id))];
}
function v5ScaleRows(prefix, parent, scope, label, kind = null) {
  const container = document.createElement("section");
  container.className = "v5-scales";
  parent.appendChild(container);
  function redraw() {
    const jarOptions = v5JarOptions(kind).filter(x => !Object.hasOwn(scope.jar,x.id));
    container.innerHTML = `
      <h4>JAR – Ön által kiválasztott jellemzők</h4>
      <p class="v5-help">Csak olyan tulajdonságot adjon hozzá, amelynél az optimális szintet vizsgálni szeretné. 3 = éppen megfelelő.</p>
      <div class="v5-add-jar"><select class="v5-jar-select" aria-label="JAR-jellemző választása"><option value="">Válasszon JAR-jellemzőt…</option>${jarOptions.map(x=>`<option value="${x.id}">${escapeHtml(x.label)}</option>`).join("")}</select><button type="button" class="secondary-btn v5-jar-add">Hozzáad</button></div>
      <div class="v5-jar-list">${Object.entries(scope.jar).map(([key,score]) => {
        const p=SENSORY_V5.jarProperties.find(x=>x.id===key);
        if(!p) return "";
        return `<div class="v5-jar-item"><div class="v5-jar-heading"><strong>${escapeHtml(p.label)}</strong><button class="v5-remove" type="button" data-jar-remove="${key}">Eltávolítás</button></div><div class="v5-rating-row v5-jar-buttons" role="group" aria-label="${escapeHtml(p.label)} JAR">${[1,2,3,4,5].map((n)=>`<button type="button" class="v5-rate ${score===n?'selected':''}" data-jar-key="${key}" data-jar-value="${n}" title="${n===1?p.low:n===3?'Éppen megfelelő':n===5?p.high:n===2?'Kissé alacsony':'Kissé magas'}">${n}</button>`).join("")}</div><div class="v5-jar-ends"><span>${escapeHtml(p.low)}</span><strong>Éppen megfelelő</strong><span>${escapeHtml(p.high)}</span></div></div>`;
      }).join("")}</div>
      <h4>Alapízek intenzitása (0–5)</h4>
      <p class="v5-help">Csak a négy alapíz: édes, sós, savanyú és keserű. Az üres érték = nem vizsgált; a 0 = megvizsgált, de nem érzékelhető. Umami nincs.</p>
      <div class="v5-intensities">${SENSORY_V5.basicTastes.map(t=>`<div class="v5-taste-row"><div class="v5-taste-name"><strong>${t.label}</strong><button type="button" class="v5-clear" data-taste-clear="${t.id}">Törlés</button></div><div class="v5-rating-row" role="group" aria-label="${escapeHtml(t.label)} ízintenzitás">${[0,1,2,3,4,5].map(n=>`<button type="button" class="v5-rate ${scope.intensities[t.id]===n?'selected':''}" data-taste-key="${t.id}" data-taste-value="${n}">${n}</button>`).join("")}</div></div>`).join("")}</div>
    `;
    qs(".v5-jar-add",container).addEventListener("click",()=>{
      const key=qs(".v5-jar-select",container).value;
      if(!key) return showToast("Válasszon JAR-jellemzőt.");
      scope.jar[key]=null;redraw();updateFinalState();
    });
    qsa("[data-jar-remove]",container).forEach(b=>b.addEventListener("click",()=>{delete scope.jar[b.dataset.jarRemove];redraw();updateFinalState();}));
    qsa("[data-jar-key]",container).forEach(b=>b.addEventListener("click",()=>{scope.jar[b.dataset.jarKey]=Number(b.dataset.jarValue);redraw();updateFinalState();}));
    qsa("[data-taste-key]",container).forEach(b=>b.addEventListener("click",()=>{scope.intensities[b.dataset.tasteKey]=Number(b.dataset.tasteValue);redraw();updateFinalState();}));
    qsa("[data-taste-clear]",container).forEach(b=>b.addEventListener("click",()=>{delete scope.intensities[b.dataset.tasteClear];redraw();updateFinalState();}));
  }
  redraw();
}
function v5ScalesComplete(prefix) {
  const st=v5State[prefix];
  if(!st) return false;
  const test=scope=>Object.values(scope.jar).every(x=>Number.isInteger(x) && x>=1 && x<=5);
  return test(st.meal) && st.components.every(test);
}
function v5ComponentsComplete(prefix) {
  const components=v5State[prefix]?.components || [];
  return components.length>0 && components.every(x=>safeText(x.name) && x.ratings.overall.score!==null);
}
function v5CaptureComponentRatings(component, prefix, container) {
  const course=courseForPrefix(prefix);
  const attrs=ATTRS.map(([key,label])=>{
    const st=component.ratings[key];
    const choices=v5ComponentRecommendation(prefix,component,label,st.score);
    return `<section class="v5-component-dim" data-dimension="${key}"><div class="v5-dim-heading"><strong>${escapeHtml(key==='overall'?'Komponens összminősége':label)}</strong><small>${key==='overall'?'Kötelező':'Opcionális'}</small></div><div class="v5-rating-row" role="group" aria-label="${escapeHtml(label)} pontszám">${[1,2,3,4,5].map(n=>`<button type="button" class="v5-rate ${st.score===n?'selected':''}" data-score-attr="${key}" data-score="${n}">${n}</button>`).join("")}</div>${key==='overall'?'':`<details class="v5-component-cata" data-open-key="${component.componentId}-${key}"><summary>CATA – ajánlott és teljes lista <span>(${st.descriptors.length} kiválasztva)</span></summary><div class="v5-component-cata-content"><strong>Ajánlott jellemzők</strong><div class="v5-cata-options">${choices.filter(x=>!st.descriptors.includes(x)).map(x=>`<button type="button" class="cata-choice" data-cata-add="${escapeHtml(x)}" data-attr="${key}">${escapeHtml(x)}</button>`).join("") || '<span class="small-muted">Nincs további ajánlott jellemző.</span>'}</div><label class="v5-search-label">Keresés a teljes listában<input class="v5-cata-search" type="search" data-attr="${key}" placeholder="Kezdje el begépelni…"></label><div class="v5-cata-search-results"></div><div class="v5-selected-chips">${st.descriptors.map((x,i)=>`<span class="chip">${escapeHtml(x)}<button type="button" data-cata-remove="${i}" data-attr="${key}" aria-label="${escapeHtml(x)} törlése">×</button></span>`).join("")}</div></div></details>`}</section>`;
  }).join("");
  container.innerHTML=`<div class="v5-component-top"><label>Komponens neve<input class="v5-component-name" type="text" value="${escapeHtml(component.name)}" aria-label="Komponens neve"></label><label>Komponens típusa<select class="v5-component-kind">${SENSORY_V5.componentTypes.map(k=>`<option value="${k.id}" ${k.id===component.kind?'selected':''}>${escapeHtml(k.label)}</option>`).join("")}</select></label><button class="secondary-btn v5-remove-component" type="button">Komponens eltávolítása</button></div><p class="v5-help">A komponens összminősítése kötelező; a négy dimenzió és a CATA célzottan kitölthető. A részletes pontok nem módosítják az ételszintű pontszámokat.</p>${attrs}<details class="v5-component-scale-details" data-open-key="${component.componentId}-scales"><summary>JAR és alapízek intenzitása (választható)</summary><div class="v5-component-scales"></div></details>`;
  qs(".v5-component-name",container).addEventListener("change",e=>{component.name=safeText(e.target.value);v5State[prefix].componentsEdited=true;v5RenderComponents(prefix);updateFinalState();});
  qs(".v5-component-kind",container).addEventListener("change",e=>{component.kind=e.target.value;v5State[prefix].componentsEdited=true;v5RenderComponents(prefix);updateFinalState();});
  qs(".v5-remove-component",container).addEventListener("click",()=>{
    const hasValues=Object.values(component.ratings).some(r=>r.score!==null||r.descriptors.length)||Object.keys(component.jar).length||Object.keys(component.intensities).length;
    if(hasValues && !confirm("A komponenshez már értékelések tartoznak. Biztosan törli a komponenst és ezeket az adatokat?"))return;
    v5State[prefix].components=v5State[prefix].components.filter(c=>c!==component);
    v5State[prefix].componentsEdited=true;v5RenderComponents(prefix);updateFinalState();
  });
  qsa("[data-score-attr]",container).forEach(b=>b.addEventListener("click",()=>{
    const item=component.ratings[b.dataset.scoreAttr];item.score=Number(b.dataset.score);
    if(item.score!==5) item.descriptors=item.descriptors.filter(x=>x!=="Megfelelő");
    v5RenderComponents(prefix);updateFinalState();
  }));
  const choose=(key,value)=>{
    const item=component.ratings[key];
    if(item.score===null) return showToast("Először adja meg az adott komponens pontszámát.");
    if(value==="Megfelelő") {if(item.score!==5)return showToast("A „Megfelelő” csak 5 pontnál jelölhető.");item.descriptors=["Megfelelő"];}
    else {item.descriptors=item.descriptors.filter(x=>x!=="Megfelelő");if(!item.descriptors.includes(value))item.descriptors.push(value);}
    v5RenderComponents(prefix);updateFinalState();
  };
  qsa("[data-cata-add]",container).forEach(b=>b.addEventListener("click",()=>choose(b.dataset.attr,b.dataset.cataAdd)));
  qsa("[data-cata-remove]",container).forEach(b=>b.addEventListener("click",()=>{component.ratings[b.dataset.attr].descriptors.splice(Number(b.dataset.cataRemove),1);v5RenderComponents(prefix);updateFinalState();}));
  qsa(".v5-cata-search",container).forEach(input=>{
    const results=input.closest(".v5-component-cata-content").querySelector(".v5-cata-search-results");
    const key=input.dataset.attr;const label=ATTRS.find(([k])=>k===key)?.[1];
    const showResults=()=>{
      const term=cataFold(input.value);const available=descriptorOptions(prefix,label,component.ratings[key].score);
      const matches=available.filter(x=>!component.ratings[key].descriptors.includes(x) && (!term||cataFold(x).includes(term)));
      results.innerHTML=matches.map(x=>`<button type="button" class="cata-choice cata-choice-secondary" data-result="${escapeHtml(x)}">${escapeHtml(x)}</button>`).join("")||"<span class='small-muted'>Nincs találat.</span>";
      qsa("[data-result]",results).forEach(b=>b.addEventListener("click",()=>choose(key,b.dataset.result)));
    };
    input.addEventListener("input",showResults);
    input.addEventListener("focus",showResults);
  });
  v5ScaleRows(prefix,qs(".v5-component-scales",container),component,component.name,component.kind);
}
function v5RenderComponents(prefix) {
  const root=qs(".v5-component-root",$(prefix==="soup"?"soupSensory":"mainSensory"));
  if(!root || !v5State[prefix]) return;
  const openKeys=new Set(qsa("details[open][data-open-key]",root).map(x=>x.dataset.openKey));
  const st=v5State[prefix];
  root.innerHTML=`<div class="v5-section-header"><h3>Komponensszintű érzékszervi értékelés</h3><p class="v5-help">Az ajánlások az ételcsoportból származnak; kérjük, ellenőrizze őket. Minden megtartott komponenshez adjon összminősítést (1–5). A további vizsgálatok szabadon választhatók.</p></div><div class="v5-component-list"></div><div class="v5-component-operations"><select class="v5-new-kind" aria-label="Új komponens típusa">${SENSORY_V5.componentTypes.map(k=>`<option value="${k.id}">${escapeHtml(k.label)}</option>`).join("")}</select><input class="v5-new-name" type="text" placeholder="Új komponens neve" aria-label="Új komponens neve"><button type="button" class="secondary-btn v5-add-component">Komponens hozzáadása</button><button type="button" class="secondary-btn v5-recommend-again">Automatikus ajánlás visszaállítása</button></div>`;
  const list=qs(".v5-component-list",root);
  st.components.forEach((component,i)=>{
    const details=document.createElement("details");details.className="v5-component";details.dataset.openKey=component.componentId;
    const completed=component.ratings.overall.score!==null;
    details.innerHTML=`<summary><span>${i+1}. ${escapeHtml(component.name)}</span><span class="v5-status ${completed?'complete':''}">${completed?`Pont: ${component.ratings.overall.score}/5`:'Értékelendő'}</span></summary><div class="v5-component-body"></div>`;
    list.appendChild(details);
    v5CaptureComponentRatings(component,prefix,qs(".v5-component-body",details));
    details.open=openKeys.size?openKeys.has(component.componentId):i===0;
    qsa("details[data-open-key]",details).forEach(sub=>{sub.open=openKeys.has(sub.dataset.openKey);});
  });
  qs(".v5-add-component",root).addEventListener("click",()=>{
    const kind=qs(".v5-new-kind",root).value;
    const name=safeText(qs(".v5-new-name",root).value)||v5Kind(kind).label;
    st.components.push(v5NewComponent(name,kind,"manual"));st.componentsEdited=true;v5RenderComponents(prefix);updateFinalState();
  });
  qs(".v5-recommend-again",root).addEventListener("click",()=>{
    if(v5HasComponentData(prefix) && !confirm("Az aktuális komponensértékelések elvesznek. Visszaállítja az ajánlott komponenseket?"))return;
    st.components=v5SuggestedComponents(prefix);st.componentsEdited=false;v5RenderComponents(prefix);updateFinalState();
  });
}
function v5RenderExtendedSensory(prefix,container) {
  v5Init(prefix);
  const heading=document.createElement("div");
  heading.className="v5-scope-heading";
  heading.innerHTML=`<h3>Teljes étel – kiegészítő érzékszervi vizsgálatok</h3><p class="v5-help">Az alap ételszintű CATA és az 1–5 pontos minősítés fentebb szerepel. Itt választható JAR és négy alapíz intenzitása rögzíthető.</p>`;
  container.appendChild(heading);
  v5ScaleRows(prefix,container,v5State[prefix].meal,"Teljes étel");
  const cmp=document.createElement("div");cmp.className="v5-component-root";container.appendChild(cmp);
  v5RenderComponents(prefix);
}
function v5ComponentExportRows(rows) {
  const result=[];
  for(const row of rows) for(const prefix of ["soup","main"]) {
    for(const comp of (row.sensoryV5?.[prefix]?.components || [])) {
      const r={entry_event_id:row.submissionId,course:courseForPrefix(prefix),dish_name:row[prefix+"Dish"],component_id:comp.componentId,component_name:comp.name,component_type:comp.kind,component_source:comp.source,method_version:row.sensoryV5Version || "",};
      for(const [attr] of ATTRS){r[attr+"_score"]=comp.ratings[attr]?.score??"";r[attr+"_cata"]=(comp.ratings[attr]?.descriptors||[]).join(" | ");}
      result.push(r);
    }
  }
  return result;
}
function v5ScaleExportRows(rows) {
  const out=[];
  for(const row of rows) for(const prefix of ["soup","main"]) {
    const data=row.sensoryV5?.[prefix];if(!data)continue;
    const scopes=[{name:"full_dish",componentId:"",componentName:"",scope:data.meal},...
      (data.components||[]).map(c=>({name:"component",componentId:c.componentId,componentName:c.name,scope:c}))];
    for(const target of scopes){
      for(const [p,score] of Object.entries(target.scope.jar||{})) if(score!==null&&score!==undefined)out.push({entry_event_id:row.submissionId,course:courseForPrefix(prefix),dish_name:row[prefix+"Dish"],scope:target.name,component_id:target.componentId,component_name:target.componentName,scale_type:"JAR",property:p,value:score,min_value:1,max_value:5,method_version:row.sensoryV5Version||""});
      for(const [p,score] of Object.entries(target.scope.intensities||{})) if(score!==null&&score!==undefined)out.push({entry_event_id:row.submissionId,course:courseForPrefix(prefix),dish_name:row[prefix+"Dish"],scope:target.name,component_id:target.componentId,component_name:target.componentName,scale_type:"BASIC_TASTE_INTENSITY",property:p,value:score,min_value:0,max_value:5,method_version:row.sensoryV5Version||""});
    }
  }
  return out;
}
const V5_COMPONENT_HEADERS=["entry_event_id","course","dish_name","component_id","component_name","component_type","component_source","method_version",...ATTRS.flatMap(([key])=>[key+"_score",key+"_cata"])];
const V5_SCALE_HEADERS=["entry_event_id","course","dish_name","scope","component_id","component_name","scale_type","property","value","min_value","max_value","method_version"];
function v5Csv(rows,headers) {
  const ordered=rows.length?rows.map(row=>Object.fromEntries(headers.map(h=>[h,row[h]??""]))):[Object.fromEntries(headers.map(h=>[h,""]))];
  if(!rows.length) return "\ufeff"+headers.map(csvEscape).join(";")+"\r\n";
  return rowsToSemicolonCsv(ordered);
}

/* Fényképek kezelése – helyi tömörítés az IndexedDB-be történő mentés előtt */
function compressPhoto(file, maxSide = 1280, quality = 0.78) {
  return new Promise((resolve, reject) => {
    if (!file) return resolve(null);
    if (!file.type.startsWith("image/")) return reject(new Error("Csak képfájl tölthető fel."));

    const reader = new FileReader();
    reader.onerror = () => reject(new Error("A fotó nem olvasható."));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("A fotó nem dolgozható fel."));
      img.onload = () => {
        const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
        const width = Math.max(1, Math.round(img.width * scale));
        const height = Math.max(1, Math.round(img.height * scale));
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

async function handlePhoto(prefix, file) {
  const preview = $(`${prefix}PhotoPreview`);
  if (!file) {
    photoState[prefix] = null;
    preview.textContent = "Nincs fotó kiválasztva.";
    return;
  }

  try {
    preview.textContent = "Fotó feldolgozása…";
    const dataUrl = await compressPhoto(file);
    photoState[prefix] = dataUrl;
    preview.innerHTML = `<img src="${dataUrl}" alt="Kitálalt étel fotója">`;
  } catch (err) {
    photoState[prefix] = null;
    preview.textContent = "A fotó nem tölthető be.";
    showToast(err.message || "Fotófeldolgozási hiba.", 4200);
  }
}

/* Az étel adatainak állapota */
async function updateDishStatus(kind) {
  const course = kind === "soup" ? "Leves" : "Második fogás";
  const inputId = kind === "soup" ? "soupDish" : "mainDish";
  const statusId = kind === "soup" ? "soupDishStatus" : "mainDishStatus";
  const value = safeText($(inputId).value);
  if (!value) {
    $(statusId).textContent = "";
    return;
  }
  const master = new Set(getMasterDishes(course));
  const user = new Set(await getUserDishes(course));
  $(statusId).textContent = master.has(value) || user.has(value) ? "Törzsben szereplő étel" : "Új étel – beküldéskor a helyi törzsbe kerül";
}

/* Mértékegységek átváltása */
function renderExtraField(containerId, type, id, label, defaultValue = "") {
  const box = $(containerId);
  if (!type) {
    box.innerHTML = "";
    return;
  }
  box.innerHTML = `
    <label class="field">
      <span>${label} <b>*</b></span>
      <input id="${id}" type="text" inputmode="decimal" autocomplete="off" placeholder="pl. 1,0" value="${String(defaultValue).replace(".", ",")}">
    </label>
  `;
  bindById(id, "input", updateConversions);
}

function updateConversionExtras() {
  const age = selectedAge();
  const mainDish = safeText($("mainDish").value);

  // A leves kitálalt mennyisége
  const su = $("soupServedUnit").value;
  if (su === "kg") renderExtraField("soupServedExtra", "density", "soupServedDensity", "Leves sűrűsége (kg/L)", "1");
  else if (su === "darab") renderExtraField("soupServedExtra", "piece", "soupServedMlPiece", "Egy darab átlagos térfogata (ml/darab)");
  else $("soupServedExtra").innerHTML = "";

  // A második fogás kitálalt mennyisége
  const mu = $("mainServedUnit").value;
  if (mu === "liter") renderExtraField("mainServedExtra", "density", "mainServedDensity", "Sűrűség (kg/L)", "1");
  else if (mu === "darab") renderExtraField("mainServedExtra", "piece", "mainServedGPiece", "Egy darab átlagos tömege (g/darab)");
  else if (mu === "adag") {
    const guide = age ? findDishPortion("Második fogás", mainDish, age.reg_age_group) : null;
    if (guide) {
      $("mainServedExtra").innerHTML = `<div class="info-box">Automatikus adagméret: <strong>${fmtNumber(guide.mid_g,1)} g/adag</strong> (útmutató-tartomány: ${fmtNumber(guide.min_g,1)}–${fmtNumber(guide.max_g,1)} g).</div>`;
    } else {
      renderExtraField("mainServedExtra", "portion", "mainServedManualGPortion", "Egy adag tényleges tömege (g/adag)");
    }
  } else $("mainServedExtra").innerHTML = "";

  // A leves visszamért hulladéka
  const swu = $("soupWasteUnit").value;
  if (swu === "liter") renderExtraField("soupWasteExtra", "density", "soupWasteDensity", "Hulladék sűrűsége (kg/L)", "1");
  else if (swu === "darab") renderExtraField("soupWasteExtra", "piece", "soupWasteGPiece", "Egy darab átlagos tömege (g/darab)");
  else if (swu === "adag") {
    const g = age ? findPortionGuide("SOUP", age.reg_age_group) : null;
    if (g) {
      $("soupWasteExtra").innerHTML = `<div class="info-box">Automatikus adagméret: <strong>${fmtNumber(g.mid_g,1)} g/adag</strong>.</div>`;
    } else renderExtraField("soupWasteExtra", "portion", "soupWasteGPortion", "Egy adag becsült tömege (g/adag)");
  } else $("soupWasteExtra").innerHTML = "";

  // A második fogás visszamért hulladéka
  const mwu = $("mainWasteUnit").value;
  if (mwu === "liter") renderExtraField("mainWasteExtra", "density", "mainWasteDensity", "Hulladék sűrűsége (kg/L)", "1");
  else if (mwu === "darab") renderExtraField("mainWasteExtra", "piece", "mainWasteGPiece", "Egy darab átlagos tömege (g/darab)");
  else if (mwu === "adag") {
    const g = age ? findDishPortion("Második fogás", mainDish, age.reg_age_group) : null;
    if (g) {
      $("mainWasteExtra").innerHTML = `<div class="info-box">Automatikus adagméret: <strong>${fmtNumber(g.mid_g,1)} g/adag</strong>.</div>`;
    } else renderExtraField("mainWasteExtra", "portion", "mainWasteGPortion", "Egy adag becsült tömege (g/adag)");
  } else $("mainWasteExtra").innerHTML = "";
}

function inputNumIfExists(id) {
  const el = $(id);
  if (!el || el.value === "") return NaN;
  return parseDecimal(el.value);
}

function convertSoupServed() {
  const value = numberValue("soupServed");
  const unit = $("soupServedUnit").value;
  const age = selectedAge();
  if (!(value > 0)) return { ok: false, value: NaN, basis: "Adjon meg 0-nál nagyobb mennyiséget." };
  if (unit === "liter") return { ok: true, value, basis: "Közvetlen liter" };
  if (unit === "kg") {
    const density = inputNumIfExists("soupServedDensity");
    if (!(density > 0)) return { ok: false, value: NaN, basis: "kg → L konverzióhoz sűrűség szükséges." };
    return { ok: true, value: value / density, basis: `kg → L; sűrűség = ${density} kg/L` };
  }
  if (unit === "darab") {
    const ml = inputNumIfExists("soupServedMlPiece");
    if (!(ml > 0)) return { ok: false, value: NaN, basis: "darab → L konverzióhoz ml/darab szükséges." };
    return { ok: true, value: value * ml / 1000, basis: `${ml} ml/darab` };
  }
  if (unit === "adag") {
    if (!age) return { ok: false, value: NaN, basis: "Válasszon korosztályt." };
    const g = findPortionGuide("SOUP", age.reg_age_group);
    if (!g) return { ok: false, value: NaN, basis: "Nincs leves adagolási adat ehhez a korcsoporthoz." };
    // Az adagolási útmutató `mid_value` értéke deciliterben van megadva.
    const literPerPortion = Number(g.mid_value) / 10;
    return { ok: true, value: value * literPerPortion, basis: `${fmtNumber(literPerPortion,3)} L/adag; ${age.reg_age_group}` };
  }
  return { ok: false, value: NaN, basis: "Ismeretlen egység." };
}

function convertMainServed() {
  const value = numberValue("mainServed");
  const unit = $("mainServedUnit").value;
  const age = selectedAge();
  const dish = safeText($("mainDish").value);
  if (!(value > 0)) return { ok: false, value: NaN, basis: "Adjon meg 0-nál nagyobb mennyiséget." };
  if (unit === "kg") return { ok: true, value, basis: "Közvetlen kg" };
  if (unit === "liter") {
    const density = inputNumIfExists("mainServedDensity");
    if (!(density > 0)) return { ok: false, value: NaN, basis: "L → kg konverzióhoz sűrűség szükséges." };
    return { ok: true, value: value * density, basis: `L → kg; sűrűség = ${density} kg/L` };
  }
  if (unit === "darab") {
    const g = inputNumIfExists("mainServedGPiece");
    if (!(g > 0)) return { ok: false, value: NaN, basis: "darab → kg konverzióhoz g/darab szükséges." };
    return { ok: true, value: value * g / 1000, basis: `${g} g/darab` };
  }
  if (unit === "adag") {
    if (!age) return { ok: false, value: NaN, basis: "Válasszon korosztályt." };
    const guide = findDishPortion("Második fogás", dish, age.reg_age_group);
    const g = guide ? Number(guide.mid_g) : inputNumIfExists("mainServedManualGPortion");
    if (!(g > 0)) return { ok: false, value: NaN, basis: "adag → kg konverzióhoz g/adag szükséges." };
    return { ok: true, value: value * g / 1000, basis: `${fmtNumber(g,1)} g/adag; ${age.reg_age_group}` };
  }
  return { ok: false, value: NaN, basis: "Ismeretlen egység." };
}

function wasteFactor(unit, prefix, course) {
  const age = selectedAge();
  const dish = course === "main" ? safeText($("mainDish").value) : safeText($("soupDish").value);

  if (unit === "kg") return { ok: true, factor: 1, basis: "Közvetlen kg" };
  if (unit === "liter") {
    const density = inputNumIfExists(`${prefix}Density`);
    if (!(density > 0)) return { ok: false, factor: NaN, basis: "L → kg konverzióhoz sűrűség szükséges." };
    return { ok: true, factor: density, basis: `${density} kg/L` };
  }
  if (unit === "darab") {
    const g = inputNumIfExists(`${prefix}GPiece`);
    if (!(g > 0)) return { ok: false, factor: NaN, basis: "darab → kg konverzióhoz g/darab szükséges." };
    return { ok: true, factor: g / 1000, basis: `${g} g/darab` };
  }
  if (unit === "adag") {
    if (!age) return { ok: false, factor: NaN, basis: "Válasszon korosztályt." };
    let g;
    if (course === "soup") {
      const guide = findPortionGuide("SOUP", age.reg_age_group);
      g = guide ? Number(guide.mid_g) : inputNumIfExists(`${prefix}GPortion`);
    } else {
      const guide = findDishPortion("Második fogás", dish, age.reg_age_group);
      g = guide ? Number(guide.mid_g) : inputNumIfExists(`${prefix}GPortion`);
    }
    if (!(g > 0)) return { ok: false, factor: NaN, basis: "adag → kg konverzióhoz g/adag szükséges." };
    return { ok: true, factor: g / 1000, basis: `${fmtNumber(g,1)} g/adag` };
  }
  return { ok: false, factor: NaN, basis: "Ismeretlen egység." };
}

function convertSoupWaste() {
  const value = numberValue("soupWaste");
  const f = wasteFactor($("soupWasteUnit").value, "soupWaste", "soup");
  if (!(value >= 0) || !f.ok) return { ok: false, value: NaN, basis: f.basis };
  return { ok: true, value: value * f.factor, basis: f.basis };
}

function convertMainWaste() {
  const values = {
    total: numberValue("mainWaste"),
    primary: numberValue("mainWastePrimary"),
    side: numberValue("mainWasteSide"),
    other: numberValue("mainWasteOther")
  };
  const f = wasteFactor($("mainWasteUnit").value, "mainWaste", "main");
  if (!Object.values(values).every(v => v >= 0) || !f.ok) {
    return { ok: false, values: {}, basis: f.basis, componentValid: false };
  }
  const kg = Object.fromEntries(Object.entries(values).map(([k, v]) => [k, v * f.factor]));
  const componentSum = kg.primary + kg.side + kg.other;
  return {
    ok: true,
    values: kg,
    basis: f.basis,
    componentValid: componentSum <= kg.total + 1e-9,
    componentSum
  };
}

function updateConversions() {
  const sc = convertSoupServed();
  $("soupServedPreview").innerHTML = `<strong>Egységesített mennyiség:</strong> ${sc.ok ? `${fmtNumber(sc.value,3)} L` : "nem számítható"}<br><small>${escapeHtml(sc.basis)}</small>`;

  const mc = convertMainServed();
  $("mainServedPreview").innerHTML = `<strong>Egységesített mennyiség:</strong> ${mc.ok ? `${fmtNumber(mc.value,3)} kg` : "nem számítható"}<br><small>${escapeHtml(mc.basis)}</small>`;

  const sw = convertSoupWaste();
  $("soupWastePreview").innerHTML = `<strong>Egységesített mennyiség:</strong> ${sw.ok ? `${fmtNumber(sw.value,3)} kg` : "nem számítható"}<br><small>${escapeHtml(sw.basis)}</small>`;

  const mw = convertMainWaste();
  $("mainWastePreview").innerHTML = `<strong>Egységesített összes hulladék:</strong> ${mw.ok ? `${fmtNumber(mw.values.total,3)} kg` : "nem számítható"}<br><small>${escapeHtml(mw.basis || "")}</small>${mw.ok && !mw.componentValid ? `<div class="validation-box bad">A komponenshulladékok összege (${fmtNumber(mw.componentSum,3)} kg) meghaladja az összes hulladékot (${fmtNumber(mw.values.total,3)} kg).</div>` : ""}`;

  updateFinalState();
}

function updateTemp(prefix) {
  const val = Number($(`${prefix}Temp`).value);
  $(`${prefix}TempValue`).textContent = `${val} °C`;
  const status = $(`${prefix}TempStatus`);

  if (val < 63) {
    status.className = "temp-status bad";
    status.textContent = "Újramelegíteni!";
  } else if (val <= 68) {
    status.className = "temp-status warn";
    status.textContent = "Hamarosan újramelegítendő";
  } else if (val <= 80) {
    status.className = "temp-status good";
    status.textContent = "Megfelelő!";
  } else {
    status.className = "temp-status hot";
    status.textContent = "Túlságosan forró – érzékszervi?";
  }
}

/* Adatellenőrzés */
function stepErrors(stepIndex) {
  const errors = [];
  const requireText = (id, label) => { if (!safeText($(id).value)) errors.push(label); };
  const requireNonNeg = (id, label, positive = false) => {
    const v = numberValue(id);
    if (Number.isNaN(v) || (positive ? v <= 0 : v < 0)) errors.push(label);
  };

  if (stepIndex === 0) {
    requireText("recorderName", "Adatrögzítő neve");
    requireText("mealDate", "Nap");
    requireText("ageGroup", "Korosztály");
    requireText("institution", "Intézmény");
  }

  if (stepIndex === 1) {
    requireText("soupDish", "Leves neve");
    requireNonNeg("soupServed", "Leves kitálalt mennyiség", true);
    if (!convertSoupServed().ok) errors.push("Leves kitálalt mennyiség konverziója");
    requireNonNeg("soupWaste", "Leves összes hulladék");
    if (!convertSoupWaste().ok) errors.push("Leves hulladék konverziója");
  }

  if (stepIndex === 2) {
    if (!sensoryComplete("soup")) errors.push("Leves: teljes étel, komponensek és kiválasztott JAR-értékek");
    requireText("soupImprovement", "Leves javítási javaslat");
    requireText("soupNote", "Leves megjegyzés");
  }

  if (stepIndex === 3) {
    requireText("mainDish", "Második fogás neve");
    requireNonNeg("mainServed", "Második kitálalt mennyiség", true);
    if (!convertMainServed().ok) errors.push("Második kitálalt mennyiség konverziója");
    ["mainWaste","mainWastePrimary","mainWasteSide","mainWasteOther"].forEach((id, i) =>
      requireNonNeg(id, ["Összes hulladék","Főkomponens-hulladék","Körethulladék","Egyéb hulladék"][i])
    );
    const mw = convertMainWaste();
    if (!mw.ok) errors.push("Második hulladék konverziója");
    if (mw.ok && !mw.componentValid) errors.push("A komponenshulladékok összege nem lehet nagyobb az összes hulladéknál");
  }

  if (stepIndex === 4) {
    if (!sensoryComplete("main")) errors.push("Második fogás: teljes étel, komponensek és kiválasztott JAR-értékek");
    requireText("mainImprovement", "Második javítási javaslat");
    requireText("mainNote", "Második megjegyzés");
  }

  return [...new Set(errors)];
}

function allErrors() {
  return [0,1,2,3,4].flatMap(stepErrors);
}

function setFieldInvalid(id, invalid = true) {
  const el = $(id);
  if (!el) return;
  el.classList.toggle("is-invalid", !!invalid);
  const field = el.closest(".field");
  if (field) field.classList.toggle("field-invalid", !!invalid);
}

function setBoxInvalid(id, invalid = true) {
  const el = $(id);
  if (!el) return;
  el.classList.toggle("box-invalid", !!invalid);
}

function markSensoryCard(prefix, key, invalid = true) {
  const card = document.querySelector(`.sensory-card[data-prefix="${prefix}"][data-attr="${key}"]`);
  if (card) card.classList.toggle("card-invalid", !!invalid);
}

function clearValidationHighlights() {
  qsa(".is-invalid").forEach(el => el.classList.remove("is-invalid"));
  qsa(".field-invalid").forEach(el => el.classList.remove("field-invalid"));
  qsa(".box-invalid").forEach(el => el.classList.remove("box-invalid"));
  qsa(".card-invalid").forEach(el => el.classList.remove("card-invalid"));
}

function applyValidationHighlights() {
  clearValidationHighlights();

  const activeSteps = currentStep === 5 ? [0,1,2,3,4] : [currentStep];
  const requireTextField = (id) => setFieldInvalid(id, !safeText($(id)?.value));
  const requireNumberField = (id, positive = false) => {
    const v = numberValue(id);
    setFieldInvalid(id, Number.isNaN(v) || (positive ? v <= 0 : v < 0));
  };

  if (activeSteps.includes(0)) {
    ["recorderName","mealDate","ageGroup","institution"].forEach(requireTextField);
  }

  if (activeSteps.includes(1)) {
    requireTextField("soupDish");
    requireNumberField("soupServed", true);
    setFieldInvalid("soupServedUnit", !safeText($("soupServedUnit")?.value));
    const sc = convertSoupServed();
    if (!sc.ok) {
      setFieldInvalid("soupServed", true);
      ["soupServedDensity","soupServedMlPiece"].forEach(id => { if ($(id)) setFieldInvalid(id, true); });
      setBoxInvalid("soupServedPreview", true);
    }
    requireNumberField("soupWaste", false);
    setFieldInvalid("soupWasteUnit", !safeText($("soupWasteUnit")?.value));
    const sw = convertSoupWaste();
    if (!sw.ok) {
      setFieldInvalid("soupWaste", true);
      ["soupWasteDensity","soupWasteGPiece","soupWasteGPortion"].forEach(id => { if ($(id)) setFieldInvalid(id, true); });
      setBoxInvalid("soupWastePreview", true);
    }
  }

  if (activeSteps.includes(2)) {
    ATTRS.forEach(([key]) => {
      const s = sensoryState.soup[key];
      markSensoryCard("soup", key, !(s && s.score !== null && (key === "overall" || s.descriptors.length > 0)));
    });
    requireTextField("soupImprovement");
    requireTextField("soupNote");
  }

  if (activeSteps.includes(3)) {
    requireTextField("mainDish");
    requireNumberField("mainServed", true);
    setFieldInvalid("mainServedUnit", !safeText($("mainServedUnit")?.value));
    const mc = convertMainServed();
    if (!mc.ok) {
      setFieldInvalid("mainServed", true);
      ["mainServedDensity","mainServedGPiece","mainServedManualGPortion"].forEach(id => { if ($(id)) setFieldInvalid(id, true); });
      setBoxInvalid("mainServedPreview", true);
    }
    ["mainWaste","mainWastePrimary","mainWasteSide","mainWasteOther"].forEach(id => requireNumberField(id, false));
    setFieldInvalid("mainWasteUnit", !safeText($("mainWasteUnit")?.value));
    const mw = convertMainWaste();
    if (!mw.ok) {
      ["mainWaste","mainWastePrimary","mainWasteSide","mainWasteOther"].forEach(id => setFieldInvalid(id, true));
      ["mainWasteDensity","mainWasteGPiece","mainWasteGPortion"].forEach(id => { if ($(id)) setFieldInvalid(id, true); });
      setBoxInvalid("mainWastePreview", true);
    }
    if (mw.ok && !mw.componentValid) {
      ["mainWaste","mainWastePrimary","mainWasteSide","mainWasteOther"].forEach(id => setFieldInvalid(id, true));
      setBoxInvalid("mainWastePreview", true);
    }
  }

  if (activeSteps.includes(4)) {
    ATTRS.forEach(([key]) => {
      const s = sensoryState.main[key];
      markSensoryCard("main", key, !(s && s.score !== null && (key === "overall" || s.descriptors.length > 0)));
    });
    requireTextField("mainImprovement");
    requireTextField("mainNote");
  }
}

function updateStepValidationBox() {
  const box = $("stepValidation");
  if (!box) return;
  const errors = currentStep === 5 ? allErrors() : stepErrors(currentStep);
  if (errors.length === 0) {
    box.className = "validation-strip ok";
    box.innerHTML = currentStep === 5
      ? "<strong>Beküldésre kész.</strong> Minden kötelező mező ki van töltve."
      : "<strong>Rendben.</strong> Ezen az oldalon minden kötelező adat megvan.";
  } else {
    box.className = "validation-strip bad";
    box.innerHTML = `<strong>Hiányos mezők ezen az oldalon:</strong><ul>${errors.map(e => `<li>${escapeHtml(e)}</li>`).join("")}</ul>`;
  }
}

function updateFinalState() {
  if (currentStep === 5) renderReview();
  const errors = allErrors();
  const submitBtn = $("submitBtn");
  if (submitBtn) submitBtn.disabled = errors.length > 0;
  const box = $("finalValidation");
  if (box) {
    if (errors.length === 0) {
      box.className = "validation-box ok";
      box.textContent = "Minden kötelező mező megfelelően ki van töltve.";
    } else {
      box.className = "validation-box bad";
      box.innerHTML = `<strong>A beküldéshez még szükséges:</strong><ul>${errors.map(e => `<li>${escapeHtml(e)}</li>`).join("")}</ul>`;
    }
  }
  applyValidationHighlights();
  updateStepValidationBox();
}

function goToStep(next) {
  next = Math.max(0, Math.min(5, next));
  if (next > currentStep) {
    const errors = stepErrors(currentStep);
    if (errors.length) {
      applyValidationHighlights();
      updateStepValidationBox();
      showToast(`Hiányos: ${errors.join(", ")}`, 4200);
      return;
    }
  }
  currentStep = next;
  qsa(".step").forEach((el, i) => el.classList.toggle("active", i === currentStep));
  const observationIntro = $("observationIntro");
  if (observationIntro) observationIntro.classList.toggle("hidden", currentStep !== 0);
  $("stepTitle").textContent = stepTitles[currentStep];
  $("stepCounter").textContent = `${currentStep + 1} / 6`;
  $("progressBar").style.width = `${((currentStep + 1) / 6) * 100}%`;
  $("prevBtn").style.visibility = currentStep === 0 ? "hidden" : "visible";
  $("nextBtn").classList.toggle("hidden", currentStep === 5);
  if (currentStep === 5) renderReview();
  updateFinalState();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

/* Áttekintés és mentés */
function currentInstitutionRow() {
  return idbGetAll(STORE_INSTITUTIONS).then(rows =>
    rows.find(x => x.institutionName === $("institution").value) || null
  );
}

function reviewLine(label, value) {
  return `<div class="review-line"><span>${escapeHtml(label)}</span><span>${escapeHtml(value)}</span></div>`;
}

function renderReview() {
  const sc = convertSoupServed();
  const sw = convertSoupWaste();
  const mc = convertMainServed();
  const mw = convertMainWaste();

  $("reviewContent").innerHTML = `
    <div class="review-block">
      <h3>Alapadatok</h3>
      ${reviewLine("Adatrögzítő", $("recorderName").value)}
      ${reviewLine("Nap", $("mealDate").value)}
      ${reviewLine("Korosztály", $("ageGroup").value)}
      ${reviewLine("Intézmény", $("institution").value)}
    </div>
    <div class="review-block">
      <h3>Leves</h3>
      ${reviewLine("Étel", $("soupDish").value)}
      ${reviewLine("Kitálalt", `${$("soupServed").value || "–"} ${$("soupServedUnit").value}`)}
      ${reviewLine("Standard", sc.ok ? `${fmtNumber(sc.value,3)} L` : "nem számítható")}
      ${reviewLine("Hőmérséklet", `${$("soupTemp").value} °C`)}
      ${reviewLine("Hulladék", sw.ok ? `${fmtNumber(sw.value,3)} kg` : "nem számítható")}
      ${reviewLine("Fotó", photoState.soup ? "rögzítve" : "nincs")}
      ${reviewLine("Érzékszervi", sensoryComplete("soup") ? "teljes" : "hiányos")}
    </div>
    <div class="review-block">
      <h3>Második fogás</h3>
      ${reviewLine("Étel", $("mainDish").value)}
      ${reviewLine("Kitálalt", `${$("mainServed").value || "–"} ${$("mainServedUnit").value}`)}
      ${reviewLine("Standard", mc.ok ? `${fmtNumber(mc.value,3)} kg` : "nem számítható")}
      ${reviewLine("Főétel / főkomponens hőmérséklete", `${$("mainTemp").value} °C`)}
      ${reviewLine("Köret hőmérséklete", `${$("mainSideTemp").value} °C`)}
      ${reviewLine("Hulladék", mw.ok ? `${fmtNumber(mw.values.total,3)} kg` : "nem számítható")}
      ${reviewLine("Fotó", photoState.main ? "rögzítve" : "nincs")}
      ${reviewLine("Érzékszervi", sensoryComplete("main") ? "teljes" : "hiányos")}
    </div>
  `;
  updateFinalState._busy = true;
  const errors = allErrors();
  $("submitBtn").disabled = errors.length > 0;
  const box = $("finalValidation");
  if (!errors.length) {
    box.className = "validation-box ok";
    box.textContent = "Minden kötelező mező megfelelően ki van töltve.";
  } else {
    box.className = "validation-box bad";
    box.innerHTML = `<strong>A beküldéshez még szükséges:</strong><ul>${errors.map(e => `<li>${escapeHtml(e)}</li>`).join("")}</ul>`;
  }
  updateFinalState._busy = false;
}

async function addUserDishIfNew(course, dish) {
  if (!dish) return;
  const master = new Set(getMasterDishes(course));
  if (master.has(dish)) return;
  await idbPut(STORE_DISHES, {
    key: `${course}::${dish.toLocaleLowerCase("hu")}`,
    course,
    dishName: dish,
    createdAt: localIsoWithOffset()
  });
}

function makeSubmissionId() {
  const d = new Date();
  const stamp = localIsoWithOffset(d).replaceAll(/[-:T+]/g, "").slice(0, 14);
  const rand = Math.floor(Math.random() * 9000 + 1000);
  return `ZWE-${stamp}-${rand}`;
}

async function submitCurrent() {
  const errors = allErrors();
  if (errors.length) {
    showToast("A beküldés nem indítható: hiányzó vagy hibás mezők.", 4200);
    return;
  }

  const age = selectedAge();
  const inst = await currentInstitutionRow();
  const sc = convertSoupServed();
  const sw = convertSoupWaste();
  const mc = convertMainServed();
  const mw = convertMainWaste();
  const soupSens = sensoryFlat("soup");
  const mainSens = sensoryFlat("main");

  const row = {
    submissionId: makeSubmissionId(),
    recorderName: $("recorderName").value,
    mealDate: $("mealDate").value,
    submittedAt: localIsoWithOffset(),
    appVersion: APP_VERSION,
    sensoryListVersion: SENSORY_LIST_VERSION,
    cataRecommendationVersion: CATA.version,
    sensoryV5Version: SENSORY_V5.version,
    sensoryV5: structuredClone(v5State),
    soupCataGroups: cataContext.soup.groups.join(" | "),
    mainCataGroups: cataContext.main.groups.join(" | "),
    soupCataGroupsManual: cataContext.soup.manuallyEdited,
    mainCataGroupsManual: cataContext.main.manuallyEdited,
    ageGroupLabel: age.label,
    ageGroupCode: Number(age.raw_code),
    regAgeGroup: age.reg_age_group,
    institutionName: inst.institutionName,
    institutionSheet: inst.sheetName,

    soupDish: safeText($("soupDish").value),
    soupServedOriginal: numberValue("soupServed"),
    soupServedUnit: $("soupServedUnit").value,
    soupServedStandardL: sc.value,
    soupServedConversionBasis: sc.basis,
    soupTempC: Number($("soupTemp").value),
    soupWasteOriginal: numberValue("soupWaste"),
    soupWasteUnit: $("soupWasteUnit").value,
    soupWasteKg: sw.value,
    soupWasteConversionBasis: sw.basis,
    soupAppearance: soupSens.appearance,
    soupAppearanceDesc: soupSens.appearanceDesc,
    soupSmell: soupSens.smell,
    soupSmellDesc: soupSens.smellDesc,
    soupTaste: soupSens.taste,
    soupTasteDesc: soupSens.tasteDesc,
    soupTexture: soupSens.texture,
    soupTextureDesc: soupSens.textureDesc,
    soupOverall: soupSens.overall,
    soupOverallDesc: soupSens.overallDesc,
    soupImprovement: safeText($("soupImprovement").value),
    soupNote: safeText($("soupNote").value),
    soupPhotoDataUrl: photoState.soup,

    mainDish: safeText($("mainDish").value),
    mainServedOriginal: numberValue("mainServed"),
    mainServedUnit: $("mainServedUnit").value,
    mainServedStandardKg: mc.value,
    mainServedConversionBasis: mc.basis,
    mainTempC: Number($("mainTemp").value),
    mainSideTempC: Number($("mainSideTemp").value),
    mainWasteOriginal: numberValue("mainWaste"),
    mainWastePrimaryOriginal: numberValue("mainWastePrimary"),
    mainWasteSideOriginal: numberValue("mainWasteSide"),
    mainWasteOtherOriginal: numberValue("mainWasteOther"),
    mainWasteUnit: $("mainWasteUnit").value,
    mainWasteKg: mw.values.total,
    mainWastePrimaryKg: mw.values.primary,
    mainWasteSideKg: mw.values.side,
    mainWasteOtherKg: mw.values.other,
    mainWasteConversionBasis: mw.basis,
    mainAppearance: mainSens.appearance,
    mainAppearanceDesc: mainSens.appearanceDesc,
    mainSmell: mainSens.smell,
    mainSmellDesc: mainSens.smellDesc,
    mainTaste: mainSens.taste,
    mainTasteDesc: mainSens.tasteDesc,
    mainTexture: mainSens.texture,
    mainTextureDesc: mainSens.textureDesc,
    mainOverall: mainSens.overall,
    mainOverallDesc: mainSens.overallDesc,
    mainImprovement: safeText($("mainImprovement").value),
    mainNote: safeText($("mainNote").value),
    mainPhotoDataUrl: photoState.main
  };

  await idbPut(STORE_SUBMISSIONS, row);
  await addUserDishIfNew("Leves", row.soupDish);
  await addUserDishIfNew("Második fogás", row.mainDish);
  await refreshDishLists();
  showToast(`Sikeres beküldés: ${row.submissionId}`, 4200);
  await renderSaved();
  await updateExportCount();
  resetEntry();
}

function resetSensory(prefix, containerId) {
  renderSensory(prefix, containerId);
}

function resetEntry() {
  $("entryForm").reset();
  $("mealDate").value = todayISO();
  $("soupServedUnit").value = "liter";
  $("mainServedUnit").value = "kg";
  $("soupWasteUnit").value = "kg";
  $("mainWasteUnit").value = "kg";
  $("soupTemp").value = 65;
  $("mainTemp").value = 65;
  $("mainSideTemp").value = 65;
  for (const prefix of ["soup", "main"]) {
    cataContext[prefix] = { dish: "", groups: [], manuallyEdited: false };
  }
  resetSensory("soup", "soupSensory");
  resetSensory("main", "mainSensory");
  photoState.soup = null;
  photoState.main = null;
  $("soupPhotoPreview").textContent = "Nincs fotó kiválasztva.";
  $("mainPhotoPreview").textContent = "Nincs fotó kiválasztva.";
  updateTemp("soup");
  updateTemp("main");
  updateTemp("mainSide");
  updateAgeGuide();
  updateConversionExtras();
  updateConversions();
  currentStep = 0;
  goToStep(0);
}

/* Mentett rekordok */
async function renderSaved() {
  const rows = (await idbGetAll(STORE_SUBMISSIONS))
    .sort((a, b) => (b.submittedAt || "").localeCompare(a.submittedAt || ""));
  $("savedCount").textContent = rows.length;
  const list = $("savedList");
  if (!rows.length) {
    list.innerHTML = `<div class="info-box muted">Még nincs mentett adat.</div>`;
    return;
  }
  list.innerHTML = rows.map(r => `
    <div class="record-item">
      <div class="record-title">${escapeHtml(r.mealDate)} – ${escapeHtml(r.institutionName)}</div>
      <div class="record-meta">${escapeHtml(r.ageGroupLabel)} • ${escapeHtml(r.soupDish)} / ${escapeHtml(r.mainDish)}</div>
      <div class="record-meta">Adatrögzítő: ${escapeHtml(r.recorderName || "–")} • Fotó: ${(r.soupPhotoDataUrl || r.mainPhotoDataUrl) ? "igen" : "nem"}</div>
      <div class="record-meta">Beküldve: ${escapeHtml(r.submittedAt)}</div>
      <div class="record-actions">
        <button class="secondary-btn small delete-record" data-id="${escapeHtml(r.submissionId)}" type="button">Törlés</button>
      </div>
    </div>
  `).join("");

  qsa(".delete-record", list).forEach(btn => {
    btn.addEventListener("click", async () => {
      if (!confirm("Biztosan törli ezt a mérési eseményt?")) return;
      await idbDelete(STORE_SUBMISSIONS, btn.dataset.id);
      await renderSaved();
      await updateExportCount();
      showToast("Rekord törölve.");
    });
  });
}

async function deleteLatestSavedRecord() {
  const rows = (await idbGetAll(STORE_SUBMISSIONS))
    .sort((a, b) => (b.submittedAt || "").localeCompare(a.submittedAt || ""));

  if (!rows.length) {
    showToast("Nincs törölhető mentett rekord.");
    return;
  }

  const r = rows[0];
  const summary = [
    r.mealDate || "dátum nélkül",
    r.institutionName || "ismeretlen intézmény",
    `${r.soupDish || "–"} / ${r.mainDish || "–"}`
  ].join(" – ");

  if (!confirm(`Biztosan törli a legutóbb mentett mérési eseményt?\n\n${summary}\n\nA törlés után ez a rekord a következő exportba már nem kerül bele.`)) return;

  await idbDelete(STORE_SUBMISSIONS, r.submissionId);
  await renderSaved();
  await updateExportCount();
  showToast("A legutóbbi rekord törölve.");
}

/* Adatkivitel */
async function filteredExportRows() {
  const rows = await idbGetAll(STORE_SUBMISSIONS);
  const from = $("exportFrom").value;
  const to = $("exportTo").value;
  const inst = $("exportInstitution").value;
  return rows.filter(r =>
    (!from || r.mealDate >= from) &&
    (!to || r.mealDate <= to) &&
    (!inst || r.institutionName === inst)
  ).sort((a, b) => a.mealDate.localeCompare(b.mealDate));
}

function rawRow(r) {
  return {
    source_sheet: r.institutionSheet,
    entry_event_id: r.submissionId,
    sorszam: r.submissionId,
    adatrögzítő_neve: r.recorderName || "",
    intezmeny_neve: r.institutionName,
    kitoltes_datuma: r.mealDate,
    bekuldes_idopontja: r.submittedAt,
    korosztaly: r.ageGroupCode,
    korosztaly_megj: r.ageGroupCode === 0 ? r.ageGroupLabel : "",
    leves_nev: r.soupDish,
    leves_adag: r.soupServedStandardL,
    leves_adag_eredeti: r.soupServedOriginal,
    leves_adag_egyseg_eredeti: r.soupServedUnit,
    leves_adag_konverzio: r.soupServedConversionBasis,
    leves_hom: r.soupTempC,
    leves_moslek: r.soupWasteKg,
    leves_moslek_eredeti: r.soupWasteOriginal,
    leves_moslek_egyseg_eredeti: r.soupWasteUnit,
    leves_kulso: r.soupAppearance,
    leves_kulso_megj: r.soupAppearanceDesc,
    leves_illat: r.soupSmell,
    leves_illat_megj: r.soupSmellDesc,
    leves_iz: r.soupTaste,
    leves_iz_megj: r.soupTasteDesc,
    leves_allomany: r.soupTexture,
    leves_allomany_megj: r.soupTextureDesc,
    leves_osszkedv: r.soupOverall,
    leves_osszkedv_megj: r.soupOverallDesc,
    leves_javitas: r.soupImprovement,
    leves_megjegyzes: r.soupNote,
    leves_foto_rogzitve: r.soupPhotoDataUrl ? "igen" : "nem",
    leves_fogy_megj: "",
    leves_repeta: "",
    masodik_nev: r.mainDish,
    masodik_adag: r.mainServedStandardKg,
    masodik_adag_eredeti: r.mainServedOriginal,
    masodik_adag_egyseg_eredeti: r.mainServedUnit,
    masodik_adag_konverzio: r.mainServedConversionBasis,
    masodik_homerseklet1: r.mainTempC,
    masodik_homerseklet2: r.mainSideTempC ?? "",
    masodik_moslek: r.mainWasteKg,
    masodik_moslek_foetel: r.mainWastePrimaryKg,
    masodik_moslek_koret: r.mainWasteSideKg,
    masodik_moslek_egyeb: r.mainWasteOtherKg,
    masodik_moslek_eredeti: r.mainWasteOriginal,
    masodik_moslek_egyseg_eredeti: r.mainWasteUnit,
    masodik_kulso: r.mainAppearance,
    masodik_kulso_megj: r.mainAppearanceDesc,
    masodik_illat: r.mainSmell,
    masodik_illat_megj: r.mainSmellDesc,
    masodik_iz: r.mainTaste,
    masodik_iz_megj: r.mainTasteDesc,
    masodik_allomany: r.mainTexture,
    masodik_allomany_megj: r.mainTextureDesc,
    masodik_osszkedv: r.mainOverall,
    masodik_osszkedv_megj: r.mainOverallDesc,
    masodik_javitas: r.mainImprovement,
    masodik_megjegyzes: r.mainNote,
    masodik_foto_rogzitve: r.mainPhotoDataUrl ? "igen" : "nem",
    masodik_fogy_megj: "",
    masodik_repeta: "",
    sensory_list_version: r.sensoryListVersion || "legacy-v4",
    cata_recommendation_version: r.cataRecommendationVersion || "",
    leves_cata_csoportok: r.soupCataGroups || "",
    masodik_cata_csoportok: r.mainCataGroups || "",
    leves_cata_csoport_kezi: r.soupCataGroupsManual ? "igen" : "nem",
    masodik_cata_csoport_kezi: r.mainCataGroupsManual ? "igen" : "nem"
  };
}

async function updateExportCount() {
  const rows = await filteredExportRows();
  $("exportCount").textContent = `${rows.length} exportálható rekord`;
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function csvEscape(v) {
  let s = v === null || v === undefined ? "" : String(v);
  if (typeof v === "number" && Number.isFinite(v)) s = s.replace(".", ",");
  if (/[;"\n\r]/.test(s)) return `"${s.replaceAll('"', '""')}"`;
  return s;
}

async function exportCsv() {
  const rows = (await filteredExportRows()).map(rawRow);
  if (!rows.length) return showToast("Nincs exportálható adat.");
  const headers = Object.keys(rows[0]);
  const csv = "\ufeff" + [
    headers.map(csvEscape).join(";"),
    ...rows.map(r => headers.map(h => csvEscape(r[h])).join(";"))
  ].join("\r\n");
  downloadBlob(new Blob([csv], { type: "text/csv;charset=utf-8" }),
    `raw_élelmiszerhulladék_${$("exportFrom").value}_${$("exportTo").value}.csv`);
}


/* ------------------------------------------------------------------
 * Adatrögzítő modul exportcsomag (ZIP)
 *
 * A ZIP tárolási (store) móddal készül, külső JavaScript-könyvtár nélkül.
 * A JPEG-képek eleve tömörítettek, ezért a ZIP-deflate itt nem adna
 * számottevő előnyt. Az entry_event_id stabilan összeköti az adatot és
 * a hozzá tartozó médiát.
 * ------------------------------------------------------------------ */

function utf8Bytes(text) {
  return new TextEncoder().encode(String(text ?? ""));
}

function dataUrlToBytes(dataUrl) {
  const raw = String(dataUrl || "");
  const comma = raw.indexOf(",");
  if (comma < 0) throw new Error("Érvénytelen fotó-adatformátum.");
  const meta = raw.slice(0, comma);
  const payload = raw.slice(comma + 1);
  if (/;base64/i.test(meta)) {
    const binary = atob(payload);
    const out = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) out[i] = binary.charCodeAt(i);
    return out;
  }
  return utf8Bytes(decodeURIComponent(payload));
}

const CRC32_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n += 1) {
    let c = n;
    for (let k = 0; k < 8; k += 1) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(bytes) {
  let c = 0xFFFFFFFF;
  for (let i = 0; i < bytes.length; i += 1) c = CRC32_TABLE[(c ^ bytes[i]) & 0xFF] ^ (c >>> 8);
  return (c ^ 0xFFFFFFFF) >>> 0;
}

function dosDateTime(date = new Date()) {
  const year = Math.max(1980, date.getFullYear());
  const time = ((date.getHours() & 0x1F) << 11) |
    ((date.getMinutes() & 0x3F) << 5) |
    ((Math.floor(date.getSeconds() / 2)) & 0x1F);
  const day = ((year - 1980) << 9) |
    (((date.getMonth() + 1) & 0x0F) << 5) |
    (date.getDate() & 0x1F);
  return { time, day };
}

function concatBytes(parts) {
  const size = parts.reduce((sum, x) => sum + x.length, 0);
  const out = new Uint8Array(size);
  let offset = 0;
  for (const part of parts) {
    out.set(part, offset);
    offset += part.length;
  }
  return out;
}

function u16(n) {
  const b = new Uint8Array(2);
  new DataView(b.buffer).setUint16(0, n & 0xFFFF, true);
  return b;
}

function u32(n) {
  const b = new Uint8Array(4);
  new DataView(b.buffer).setUint32(0, n >>> 0, true);
  return b;
}

function makeStoreZip(entries) {
  const localParts = [];
  const centralParts = [];
  let offset = 0;
  const dt = dosDateTime(new Date());

  for (const entry of entries) {
    const nameBytes = utf8Bytes(entry.name.replaceAll("\\", "/"));
    const dataBytes = entry.bytes instanceof Uint8Array ? entry.bytes : utf8Bytes(entry.bytes);
    const crc = crc32(dataBytes);
    const flags = 0x0800; // UTF-8 fájlnév

    const localHeader = concatBytes([
      u32(0x04034b50), u16(20), u16(flags), u16(0), u16(dt.time), u16(dt.day),
      u32(crc), u32(dataBytes.length), u32(dataBytes.length),
      u16(nameBytes.length), u16(0), nameBytes
    ]);

    localParts.push(localHeader, dataBytes);

    const centralHeader = concatBytes([
      u32(0x02014b50), u16(20), u16(20), u16(flags), u16(0), u16(dt.time), u16(dt.day),
      u32(crc), u32(dataBytes.length), u32(dataBytes.length),
      u16(nameBytes.length), u16(0), u16(0), u16(0), u16(0), u32(0), u32(offset), nameBytes
    ]);
    centralParts.push(centralHeader);
    offset += localHeader.length + dataBytes.length;
  }

  const central = concatBytes(centralParts);
  const end = concatBytes([
    u32(0x06054b50), u16(0), u16(0), u16(entries.length), u16(entries.length),
    u32(central.length), u32(offset), u16(0)
  ]);
  return new Blob([concatBytes([...localParts, central, end])], { type: "application/zip" });
}

function rowsToSemicolonCsv(rows) {
  if (!rows.length) return "\ufeff";
  const headers = Object.keys(rows[0]);
  return "\ufeff" + [
    headers.map(csvEscape).join(";"),
    ...rows.map(r => headers.map(h => csvEscape(r[h])).join(";"))
  ].join("\r\n");
}

function safePathSegment(x, fallback = "event") {
  return String(x ?? "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[\\/:*?"<>|]+/g, "_")
    .replace(/\s+/g, "_")
    .replace(/[^A-Za-z0-9_.-]+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "") || fallback;
}


function safeDownloadFilenamePart(x, fallback = "adat") {
  return String(x ?? "")
    .normalize("NFC")
    .replace(/[\\/:*?"<>|]+/g, "_")
    .replace(/\s+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^[_. ]+|[_. ]+$/g, "") || fallback;
}

function semanticPhotoFilename(row, courseKey, dishName) {
  const datePart = safePathSegment(row.mealDate, "datum_nelkul");
  const dishPart = safePathSegment(dishName, courseKey === "soup" ? "leves" : "masodik_fogas");
  const institutionPart = safePathSegment(row.institutionName, "ismeretlen_intezmeny");
  return `${datePart}_${dishPart}_${institutionPart}_${courseKey}.jpg`;
}

async function exportEntryPackage() {
  const sourceRows = await filteredExportRows();
  if (!sourceRows.length) return showToast("Nincs exportálható adat.");

  const eventRows = sourceRows.map(rawRow);
  const componentRows = v5ComponentExportRows(sourceRows);
  const scaleRows = v5ScaleExportRows(sourceRows);
  const mediaRows = [];
  const zipEntries = [];

  for (const r of sourceRows) {
    const eventId = r.submissionId;
    const eventFolder = safePathSegment(eventId);

    const addPhoto = (courseKey, courseLabel, dishName, dataUrl) => {
      if (!dataUrl) return;
      const baseFilename = semanticPhotoFilename(r, courseKey, dishName);
      const filename = `photos/${eventFolder}/${baseFilename}`;
      const photoId = `${eventId}__${courseKey}__served`;
      mediaRows.push({
        photo_id: photoId,
        entry_event_id: eventId,
        course: courseLabel,
        photo_role: "served",
        meal_date: r.mealDate || "",
        dish_name: dishName || "",
        institution_name: r.institutionName || "",
        filename,
        stored_at: r.submittedAt || "",
        app_version: r.appVersion || APP_VERSION
      });
      zipEntries.push({ name: filename, bytes: dataUrlToBytes(dataUrl) });
    };

    addPhoto("soup", "Leves", r.soupDish, r.soupPhotoDataUrl);
    addPhoto("main", "Második fogás", r.mainDish, r.mainPhotoDataUrl);
  }

  const from = $("exportFrom").value || "all";
  const to = $("exportTo").value || "all";
  const manifest = {
    package_type: "zerowaste-entry-package",
    schema_version: 2,
    extensions: { sensory_components: SENSORY_V5.version, legacy_event_schema_preserved: true },
    entry_app: "Adatrögzítő modul közétkeztetőknek",
    entry_app_version: APP_VERSION,
    sensory_descriptor_list_version: SENSORY_LIST_VERSION,
    exported_at: localIsoWithOffset(),
    filters: {
      from_date: $("exportFrom").value || null,
      to_date: $("exportTo").value || null,
      institution: $("exportInstitution").value || null
    },
    event_count: eventRows.length,
    media_count: mediaRows.length,
    component_count: componentRows.length,
    scale_count: scaleRows.length,
    files: ["entry_events.csv", "entry_media.csv", "entry_sensory_components.csv", "entry_sensory_scales.csv", "manifest.json", "photos/"]
  };

  const mediaCsv = mediaRows.length
    ? rowsToSemicolonCsv(mediaRows)
    : "\ufeffphoto_id;entry_event_id;course;photo_role;meal_date;dish_name;institution_name;filename;stored_at;app_version\r\n";

  zipEntries.unshift(
    { name: "manifest.json", bytes: utf8Bytes(JSON.stringify(manifest, null, 2)) },
    { name: "entry_media.csv", bytes: utf8Bytes(mediaCsv) },
    { name: "entry_events.csv", bytes: utf8Bytes(rowsToSemicolonCsv(eventRows)) },
    { name: "entry_sensory_components.csv", bytes: utf8Bytes(v5Csv(componentRows, V5_COMPONENT_HEADERS)) },
    { name: "entry_sensory_scales.csv", bytes: utf8Bytes(v5Csv(scaleRows, V5_SCALE_HEADERS)) }
  );

  showToast("Exportcsomag készítése…", 1800);
  const blob = makeStoreZip(zipEntries);

  const datePart = from === to ? from : `${from}_${to}`;
  const selectedInstitution = $("exportInstitution").value;
  const rowInstitutions = [...new Set(sourceRows.map(r => r.institutionName).filter(Boolean))];
  const institutionPart = safeDownloadFilenamePart(
    selectedInstitution || (rowInstitutions.length === 1 ? rowInstitutions[0] : "minden_intezmeny"),
    "ismeretlen_intezmeny"
  );
  const packageFilename = `${datePart}_élelmiszerhulladék_${institutionPart}.zip`;

  downloadBlob(blob, packageFilename);

  const shareFile = new File([blob], packageFilename, { type: "application/zip" });
  if (navigator.share && navigator.canShare && navigator.canShare({ files: [shareFile] })) {
    try {
      await navigator.share({
        files: [shareFile],
        title: "Élelmiszerhulladék-megfigyelési adatok",
        text: "Adatrögzítő modulból származó export az élelmezésvezető részére."
      });
      showToast(`ZIP letöltve és megosztásra előkészítve: ${eventRows.length} esemény, ${mediaRows.length} fotó.`, 4600);
      return;
    } catch (err) {
      if (err && err.name !== "AbortError") console.warn("Megosztási hiba:", err);
    }
  }
  showToast(`ZIP letöltve: ${eventRows.length} esemény, ${mediaRows.length} fotó. Küldje tovább az élelmezésvezetőnek.`, 4600);
}

function makeSheetName(name) {
  return safeText(name).replace(/[:\\/?*\[\]]/g, " ").replace(/\s+/g, " ").slice(0, 31) || "Adatok";
}

async function exportXlsx() {
  const sourceRows = await filteredExportRows();
  if (!sourceRows.length) return showToast("Nincs exportálható adat.");
  if (!window.XLSX) {
    showToast("Az XLSX könyvtár még nem töltődött be. Ellenőrizze az internetkapcsolatot, vagy használja a CSV exportot.", 5000);
    return;
  }
  const rows = sourceRows.map(rawRow);
  const wb = XLSX.utils.book_new();
  const groups = new Map();
  for (const r of rows) {
    const key = r.source_sheet || "Adatok";
    if (!groups.has(key)) groups.set(key, []);
    const copy = { ...r };
    delete copy.source_sheet;
    groups.get(key).push(copy);
  }

  const used = new Set();
  for (const [name, group] of groups.entries()) {
    let sheet = makeSheetName(name);
    let base = sheet;
    let n = 2;
    while (used.has(sheet)) {
      const suffix = `_${n++}`;
      sheet = `${base.slice(0, 31 - suffix.length)}${suffix}`;
    }
    used.add(sheet);
    const ws = XLSX.utils.json_to_sheet(group);
    XLSX.utils.book_append_sheet(wb, ws, sheet);
  }
  XLSX.writeFile(wb, `raw_élelmiszerhulladék_${$("exportFrom").value}_${$("exportTo").value}.xlsx`);
}

async function backupJson() {
  const submissions = await idbGetAll(STORE_SUBMISSIONS);
  const institutions = await idbGetAll(STORE_INSTITUTIONS);
  const userDishes = await idbGetAll(STORE_DISHES);
  const obj = {
    app: "Adatrögzítő modul közétkeztetőknek",
    version: APP_VERSION,
    exportedAt: localIsoWithOffset(),
    submissions,
    institutions,
    userDishes
  };
  downloadBlob(new Blob([JSON.stringify(obj, null, 2)], { type: "application/json" }),
    `adatrögzítő_modul_biztonsági_mentés_${todayISO()}.json`);
}

/* Törzsadatok */
function renderInstitutionList(rows) {
  $("institutionList").innerHTML = rows.length
    ? rows.map(x => `<div class="simple-item"><strong>${escapeHtml(x.institutionName)}</strong></div>`).join("")
    : `<div class="info-box muted">Nincs intézmény.</div>`;
}

async function addInstitution() {
  const name = safeText($("newInstitution").value);
  if (!name) return showToast("Adja meg az intézmény nevét.");
  const sheet = makeSheetName(name);
  await idbPut(STORE_INSTITUTIONS, {
    institutionName: name,
    sheetName: sheet,
    source: "user",
    active: true,
    createdAt: localIsoWithOffset()
  });
  $("newInstitution").value = "";
  await refreshInstitutionSelectors();
  showToast("Intézmény hozzáadva.");
}

function renderGuide() {
  const q = safeText($("guideSearch").value).toLocaleLowerCase("hu");
  const rows = DATA.portionGuide.filter(x =>
    !q ||
    `${x.food_element} ${x.reg_age_group} ${x.portion_key}`.toLocaleLowerCase("hu").includes(q)
  ).slice(0, 100);
  $("guideList").innerHTML = rows.map(x =>
    `<div class="simple-item"><strong>${escapeHtml(x.food_element)}</strong><div class="record-meta">${escapeHtml(x.reg_age_group)} • ${escapeHtml(x.min_value)}–${escapeHtml(x.max_value)} ${escapeHtml(x.guide_unit)} • középérték: ${escapeHtml(x.mid_value)}</div></div>`
  ).join("") || `<div class="info-box muted">Nincs találat.</div>`;
}

/* Navigáció és egyéb funkciók */
function switchView(name) {
  qsa(".view").forEach(v => v.classList.toggle("active", v.id === `view-${name}`));
  qsa(".nav-btn").forEach(b => b.classList.toggle("active", b.dataset.view === name));
  if (name === "saved") renderSaved();
  if (name === "export") updateExportCount();
}

function updateAgeGuide() {
  const age = selectedAge();
  $("ageGuideBox").innerHTML = age
    ? `<strong>${escapeHtml(age.label)}</strong><br>Adagolási útmutató korcsoport: <strong>${escapeHtml(age.reg_age_group)}</strong>.`
    : "A korosztály kiválasztása után megjelenik az adagolási korcsoport.";
  updateConversionExtras();
  updateConversions();
}

function updateNetworkBadge() {
  const online = navigator.onLine;
  const b = $("networkBadge");
  b.className = `badge ${online ? "online" : "offline"}`;
  b.textContent = online ? "Online" : "Offline";
}

function bindEvents() {
  bindById("prevBtn", "click", () => goToStep(currentStep - 1));
  bindById("nextBtn", "click", () => goToStep(currentStep + 1));
  bindById("submitBtn", "click", submitCurrent);

  qsa(".nav-btn").forEach(btn => bindElement(btn, "click", () => switchView(btn.dataset.view), ".nav-btn"));

  bindById("ageGroup", "change", updateAgeGuide);
  bindById("soupDish", "input", async () => {
    await updateDishStatus("soup");
    setCataDish("soup");
    updateConversionExtras();
    updateConversions();
  });
  bindById("mainDish", "input", async () => {
    await updateDishStatus("main");
    setCataDish("main");
    updateConversionExtras();
    updateConversions();
  });

  bindById("soupNewDishBtn", "click", () => {
    $("soupDish").value = "";
    $("soupDish").focus();
    $("soupDishStatus").textContent = "Írja be az új leves nevét.";
    setCataDish("soup");
  });
  bindById("mainNewDishBtn", "click", () => {
    $("mainDish").value = "";
    $("mainDish").focus();
    $("mainDishStatus").textContent = "Írja be az új étel nevét.";
    setCataDish("main");
  });

  ["soupServedUnit","mainServedUnit","soupWasteUnit","mainWasteUnit"].forEach(id =>
    bindById(id, "change", () => {
      updateConversionExtras();
      updateConversions();
    })
  );

  [
    "soupServed","soupWaste","mainServed","mainWaste",
    "mainWastePrimary","mainWasteSide","mainWasteOther",
    "soupImprovement","soupNote","mainImprovement","mainNote",
    "recorderName","mealDate","institution","ageGroup","soupDish","mainDish"
  ].forEach(id => { bindById(id, "input", updateFinalState); bindById(id, "change", updateFinalState); });

  bindById("soupPhoto", "change", async (e) => {
    await handlePhoto("soup", e.target.files?.[0] || null);
  });
  bindById("mainPhoto", "change", async (e) => {
    await handlePhoto("main", e.target.files?.[0] || null);
  });

  bindById("soupTemp", "input", () => { updateTemp("soup"); updateFinalState(); });
  bindById("mainTemp", "input", () => { updateTemp("main"); updateFinalState(); });
  bindById("mainSideTemp", "input", () => { updateTemp("mainSide"); updateFinalState(); });

  ["exportFrom","exportTo","exportInstitution"].forEach(id => bindById(id, "change", updateExportCount));
  bindById("deleteLatestSavedBtn", "click", deleteLatestSavedRecord);
  bindById("exportCsvBtn", "click", exportCsv);
  bindById("exportXlsxBtn", "click", exportXlsx);
  bindById("exportZipBtn", "click", exportEntryPackage);
  bindById("backupJsonBtn", "click", backupJson);
  bindById("addInstitutionBtn", "click", addInstitution);
  bindById("guideSearch", "input", renderGuide);

  window.addEventListener("online", updateNetworkBadge);
  window.addEventListener("offline", updateNetworkBadge);

  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredInstallPrompt = e;
    const installBtn = $("installBtn");
    if (installBtn) installBtn.classList.remove("hidden");
  });

  bindById("installBtn", "click", async () => {
    if (!deferredInstallPrompt) return;
    deferredInstallPrompt.prompt();
    await deferredInstallPrompt.userChoice;
    deferredInstallPrompt = null;
    const installBtn = $("installBtn");
    if (installBtn) installBtn.classList.add("hidden");
  });
}

async function init() {
  db = await openDatabase();
  await seedReferenceInstitutions();
  await populateAgeGroups();
  populateRecorders();
  await refreshInstitutionSelectors();
  await refreshDishLists();

  $("mealDate").value = todayISO();
  const d = new Date();
  const to = todayISO();
  const fromD = new Date(d.getTime() - 30 * 86400000);
  const fromOffset = fromD.getTimezoneOffset();
  $("exportFrom").value = new Date(fromD.getTime() - fromOffset * 60000).toISOString().slice(0,10);
  $("exportTo").value = to;

  renderSensory("soup", "soupSensory");
  renderSensory("main", "mainSensory");
  renderGuide();
  bindEvents();
  updateTemp("soup");
  updateTemp("main");
  updateTemp("mainSide");
  updateAgeGuide();
  updateConversionExtras();
  updateConversions();
  updateNetworkBadge();
  await renderSaved();
  await updateExportCount();
  goToStep(0);
  updateFinalState();

  if ("serviceWorker" in navigator) {
    try {
      const registration = await navigator.serviceWorker.register("./sw-public-anon-v4.js?v=4.3.0");
      await registration.update();
    } catch (err) {
      console.warn("Service worker registration failed:", err);
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  init().catch(err => {
    console.error(err);
    alert(`Adatrögzítő modul indítási hiba: ${err.message}`);
  });
});
