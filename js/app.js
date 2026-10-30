/**
 * AL MOTTAHEDA — PREMIUM E-COMMERCE & SHOWCASE APPLICATION
 * Handles navigation, discovery, inquiry cart, motion design, and responsive interactions.
 */

(function () {
  "use strict";

  const QUOTE_KEY = "mottaheda_quote_items";
  const page = document.body.dataset.page || "home";
  const params = new URLSearchParams(window.location.search);
  const assetPrefix = document.body.dataset.base || "";

  function path(file) {
    return assetPrefix + file;
  }

  const company = Mottaheda.company || {
    name: "المتحدة للأدوات الكهربائية والتوريدات",
    shortName: "المتحدة",
    tagline: "موزع معتمد وتوريدات المشروعات والتجهيزات الكهربائية والأسلاك المعتمدة",
    facebookUrl: "https://www.facebook.com/profile.php?id=61573876948763",
    storefrontImage: "No_photo_description_available (43).jpg"
  };

  /* ==========================================================================
     INQUIRY & QUOTATION SYSTEM (NO PRICES)
     ========================================================================= */

  function getQuote() {
    try {
      return JSON.parse(localStorage.getItem(QUOTE_KEY) || "[]");
    } catch (e) {
      return [];
    }
  }

  function setQuote(items) {
    localStorage.setItem(QUOTE_KEY, JSON.stringify(items));
    updateQuoteBadges();
  }

  function quoteCount() {
    return getQuote().reduce((sum, item) => sum + (item.qty || 1), 0);
  }

  function addToQuote(id, qty = 1) {
    const items = getQuote();
    const existing = items.find((i) => i.id === id);
    if (existing) {
      existing.qty += qty;
    } else {
      items.push({ id, qty });
    }
    setQuote(items);
    const prod = productById(id);
    const name = prod ? prod.name : "المنتج";
    showToast(`تمت إضافة "${name}" إلى قائمة الاستفسار.`);
  }

  function removeFromQuote(id) {
    const items = getQuote().filter((i) => i.id !== id);
    setQuote(items);
    renderQuoteDrawer();
    showToast("تم حذف المنتج من قائمة الاستفسار.");
  }

  function updateQuoteQty(id, delta) {
    const items = getQuote();
    const item = items.find((i) => i.id === id);
    if (item) {
      item.qty = Math.max(1, item.qty + delta);
      setQuote(items);
      renderQuoteDrawer();
    }
  }

  function clearQuote() {
    setQuote([]);
    renderQuoteDrawer();
    showToast("تم تفريغ قائمة الاستفسار.");
  }

  function updateQuoteBadges() {
    const count = quoteCount();
    document.querySelectorAll("[data-quote-count]").forEach((el) => {
      el.textContent = count;
      el.style.display = count > 0 ? "inline-block" : "none";
    });
    document.querySelectorAll("[data-quote-label]").forEach((el) => {
      el.textContent = count > 0 ? `${count} منتجات مختارة` : "لا توجد عناصر";
    });
  }

  function getQuoteSummaryText() {
    const items = getQuote();
    if (!items.length) return "";
    let text = `مرحباً، أود الاستفسار عن توفر وعرض أسعار للمنتجات التالية من ${company.name}:\n\n`;
    items.forEach((item, index) => {
      const p = productById(item.id);
      if (p) {
        text += `${index + 1}. ${p.name} (كود: ${p.sku}) — الكمية: ${item.qty}\n`;
      }
    });
    text += `\nيرجى إفادتي بالتفاصيل وطرق التوريد المتاحة. شكراً لكم.`;
    return text;
  }

  function copyQuoteToClipboard() {
    const text = getQuoteSummaryText();
    if (!text) {
      showToast("قائمة الاستفسار فارغة.");
      return;
    }
    navigator.clipboard.writeText(text).then(
      () => {
        showToast("تم نسخ قائمة الاستفسار! يمكنك لصقها وإرسالها عبر فيسبوك.");
      },
      () => {
        showToast("تعذر النسخ التلقائي.");
      }
    );
  }

  function sendQuoteViaFacebook() {
    const text = getQuoteSummaryText();
    if (text) {
      navigator.clipboard.writeText(text).catch(() => {});
    }
    window.open(company.facebookUrl, "_blank", "noopener,noreferrer");
    showToast("جاري فتح صفحة فيسبوك... تم نسخ تفاصيل استفسارك!");
  }

  /* ==========================================================================
     HELPERS & DATA LOOKUPS
     ========================================================================== */

  function productById(id) {
    return Mottaheda.products.find((p) => p.id === id);
  }

  function catById(id) {
    return Mottaheda.categories.find((c) => c.id === id);
  }

  function catName(id) {
    const c = catById(id);
    return c ? c.name : id;
  }

  function countByCategory(id) {
    return Mottaheda.products.filter((p) => p.category === id).length;
  }

  function showToast(text) {
    const el = document.getElementById("toast");
    if (!el) return;
    el.innerHTML = `<span>⚡</span> <span>${text}</span>`;
    el.classList.add("show");
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => {
      el.classList.remove("show");
    }, 3200);
  }

  /* ==========================================================================
     DRAWER CONTROLS (BULLETPROOF TOGGLE & CLOSE)
     ========================================================================== */

  function openQuoteDrawer() {
    closeMobileNav();
    renderQuoteDrawer();
    const drawer = document.getElementById("quote-drawer");
    const backdrop = document.getElementById("quote-drawer-backdrop");
    if (drawer) drawer.classList.add("show");
    if (backdrop) backdrop.classList.add("show");
    document.body.style.overflow = "hidden";
  }

  function closeQuoteDrawer() {
    const drawer = document.getElementById("quote-drawer");
    const backdrop = document.getElementById("quote-drawer-backdrop");
    if (drawer) drawer.classList.remove("show");
    if (backdrop) backdrop.classList.remove("show");
    document.body.style.overflow = "";
  }

  function openMobileNav() {
    closeQuoteDrawer();
    const nav = document.getElementById("mobile-nav");
    const backdrop = document.getElementById("mobile-nav-backdrop");
    if (nav) nav.classList.add("show");
    if (backdrop) backdrop.classList.add("show");
    document.querySelector("[data-menu-toggle]")?.setAttribute("aria-expanded", "true");
    document.body.style.overflow = "hidden";
  }

  function closeMobileNav() {
    const nav = document.getElementById("mobile-nav");
    const backdrop = document.getElementById("mobile-nav-backdrop");
    if (nav) nav.classList.remove("show");
    if (backdrop) backdrop.classList.remove("show");
    document.querySelector("[data-menu-toggle]")?.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
  }

  function openContactModal(type = "whatsapp", options = {}) {
    closeMobileNav();
    closeQuoteDrawer();

    const modal = document.getElementById("contact-modal");
    const backdrop = document.getElementById("contact-modal-backdrop");
    const titleEl = document.getElementById("contact-modal-title");
    const subtitleEl = document.getElementById("contact-modal-subtitle");
    const iconEl = document.getElementById("contact-modal-icon");
    const bodyEl = document.getElementById("contact-modal-body");

    if (!modal || !backdrop) return;

    const phones = (Mottaheda.company && Mottaheda.company.phones) || [
      { number: "01005678954", display: "0100 567 8954", role: "مبيعات المشروعات والتوريدات", note: "لطلبيات الكابلات ولوحات التوزيع والمقاولات" },
      { number: "01113565640", display: "0111 356 5640", role: "خدمة العملاء والاستفسارات", note: "لمتابعة الطلبات وتوفر البضائع والمواصفات" },
      { number: "01150430601", display: "0115 043 0601", role: "المبيعات الفنية والطلبات", note: "لمقايسات التأسيس والإنارة ووحدات الديكور" }
    ];

    const defaultMsg = "السلام عليكم، أود الاستفسار بخصوص منتجات وتوريدات المتحدة للأدوات الكهربائية والتجهيزات المعتمدة.";
    const textMsg = options.customMessage || defaultMsg;

    if (type === "whatsapp") {
      if (iconEl) {
        iconEl.className = "contact-modal-icon icon-wa";
        iconEl.innerHTML = `<svg viewBox="0 0 24 24"><path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2zm5.78 14.15c-.24.67-1.39 1.25-1.93 1.32-.51.07-1.17.1-3.41-.83-2.86-1.18-4.7-4.1-4.84-4.29-.14-.19-1.16-1.54-1.16-2.94 0-1.4.73-2.09 1-2.37.24-.28.53-.35.7-.35.18 0 .35 0 .5.01.16.01.38-.06.59.45.22.53.75 1.83.82 1.97.07.14.12.31.02.5-.1.19-.15.31-.3.48-.15.17-.32.38-.45.51-.15.15-.31.31-.13.62.18.31.79 1.3 1.7 2.11 1.17 1.04 2.15 1.36 2.46 1.51.31.15.49.13.67-.08.18-.21.78-.91.99-1.22.21-.31.42-.26.7-.16.28.1 1.77.83 2.07.98.3.15.5.23.57.35.07.12.07.7-.17 1.37z"/></svg>`;
      }
      if (titleEl) titleEl.textContent = "تواصل فوري عبر واتساب";
      if (subtitleEl) subtitleEl.textContent = "اختر الرقم المناسب لبدء محادثة واتساب فورية مباشرة:";

      if (bodyEl) {
        bodyEl.innerHTML = phones.map((p) => {
          const cleanNum = p.number.replace(/^0+/, "");
          const waUrl = `https://wa.me/20${cleanNum}?text=${encodeURIComponent(textMsg)}`;
          return `
            <div class="contact-option-card">
              <div class="contact-option-head">
                <span class="contact-option-role">${p.role}</span>
                <span class="contact-option-badge">متصل الآن</span>
              </div>
              <div class="contact-option-num">${p.display}</div>
              <div class="contact-option-note">${p.note}</div>
              <div class="contact-option-actions">
                <a class="btn-contact-action btn-contact-wa" href="${waUrl}" target="_blank" rel="noopener">
                  <svg viewBox="0 0 24 24"><path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2zm5.78 14.15c-.24.67-1.39 1.25-1.93 1.32-.51.07-1.17.1-3.41-.83-2.86-1.18-4.7-4.1-4.84-4.29-.14-.19-1.16-1.54-1.16-2.94 0-1.4.73-2.09 1-2.37.24-.28.53-.35.7-.35.18 0 .35 0 .5.01.16.01.38-.06.59.45.22.53.75 1.83.82 1.97.07.14.12.31.02.5-.1.19-.15.31-.3.48-.15.17-.32.38-.45.51-.15.15-.31.31-.13.62.18.31.79 1.3 1.7 2.11 1.17 1.04 2.15 1.36 2.46 1.51.31.15.49.13.67-.08.18-.21.78-.91.99-1.22.21-.31.42-.26.7-.16.28.1 1.77.83 2.07.98.3.15.5.23.57.35.07.12.07.7-.17 1.37z"/></svg>
                  <span>فتح محادثة واتساب</span>
                </a>
                <button type="button" class="btn-contact-copy" data-copy-phone="${p.number}" title="نسخ الرقم">
                  <svg viewBox="0 0 24 24"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>
                  <span>نسخ</span>
                </button>
              </div>
            </div>
          `;
        }).join("");
      }
    } else {
      if (iconEl) {
        iconEl.className = "contact-modal-icon icon-call";
        iconEl.innerHTML = `<svg viewBox="0 0 24 24"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>`;
      }
      if (titleEl) titleEl.textContent = "اتصال هاتفي مباشر";
      if (subtitleEl) subtitleEl.textContent = "اختر أحد أرقام الهاتف التالية للاتصال المباشر بإدارة المعرض والمبيعات:";

      if (bodyEl) {
        bodyEl.innerHTML = phones.map((p) => {
          return `
            <div class="contact-option-card">
              <div class="contact-option-head">
                <span class="contact-option-role">${p.role}</span>
                <span class="contact-option-badge">متاح للاتصال</span>
              </div>
              <div class="contact-option-num">${p.display}</div>
              <div class="contact-option-note">${p.note}</div>
              <div class="contact-option-actions">
                <a class="btn-contact-action btn-contact-call" href="tel:${p.number}">
                  <svg viewBox="0 0 24 24"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>
                  <span>اتصال هاتفي الآن</span>
                </a>
                <button type="button" class="btn-contact-copy" data-copy-phone="${p.number}" title="نسخ الرقم">
                  <svg viewBox="0 0 24 24"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>
                  <span>نسخ</span>
                </button>
              </div>
            </div>
          `;
        }).join("");
      }
    }

    modal.classList.add("show");
    backdrop.classList.add("show");
    document.body.style.overflow = "hidden";
  }

  function closeContactModal() {
    const modal = document.getElementById("contact-modal");
    const backdrop = document.getElementById("contact-modal-backdrop");
    if (modal) modal.classList.remove("show");
    if (backdrop) backdrop.classList.remove("show");
    document.body.style.overflow = "";
  }

  /* ==========================================================================
     GLOBAL HEADER & FOOTER CHROME
     ========================================================================== */

  function headerHTML() {
    const isHome = page === "home";
    const isProducts = page === "products" && !params.get("cat");
    const isCables = page === "cables";
    const isLighting = page === "products" && params.get("cat") === "lighting";

    return `
      <div id="scroll-progress" aria-hidden="true"></div>
      <a class="skip-link" href="#main">تخطي إلى المحتوى الرئيسي</a>

      <div class="topbar">
        <div class="wrap">
          <div class="topbar-msg">
            <span class="dot"></span>
            <span>${company.tagline}</span>
          </div>
          <div class="topbar-actions">
            <a href="tel:01005678954" class="topbar-phone">
              <span>📞 طلبات التوريد: 01005678954</span>
            </a>
            <span style="color:#cbd5e1">|</span>
            <button type="button" data-open-contact-modal="whatsapp" style="background:none;border:none;cursor:pointer;color:inherit;font:inherit;display:inline-flex;align-items:center;gap:4px">
              <span style="color:#25d366">💬</span>
              <span>واتساب</span>
            </button>
            <span style="color:#cbd5e1">|</span>
            <a href="${company.facebookUrl}" target="_blank" rel="noopener" class="topbar-fb">
              <svg viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              <span>فيسبوك</span>
            </a>
          </div>
        </div>
      </div>

      <header class="site-header" id="site-header">
        <div class="wrap">
          <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="mobile-nav" data-menu-toggle aria-label="فتح القائمة">
            ☰
          </button>

          <a class="brand" href="${path("index.html")}">
            <img src="${path("assets/logo.jpg")}" alt="شعار ${company.shortName}">
            <span class="brand-text">
              <strong>${company.shortName}</strong>
              <span>للأدوات الكهربائية والتوريدات</span>
            </span>
          </a>

          <nav class="main-nav" aria-label="التنقل الرئيسي">
            <a href="${path("index.html")}" class="${isHome ? "active" : ""}">الرئيسية</a>
            <a href="${path("products.html")}" class="${isProducts ? "active" : ""}">جميع المنتجات</a>
            <a href="${path("cables.html")}" class="${isCables ? "active" : ""}">
              الأسلاك والكابلات
              <span class="nav-badge">القسم الأوسع</span>
            </a>
            <a href="${path("products.html?cat=lighting")}" class="${isLighting ? "active" : ""}">الإضاءة واللمبات</a>
            <a href="#footer">تواصل معنا</a>
          </nav>

          <form class="search-form" role="search" data-search-form>
            <input type="search" name="q" placeholder="ابحث عن سلك، كابل، أو أداة..." aria-label="بحث في المنتجات" value="${params.get("q") || ""}">
            <button type="submit" aria-label="تنفيذ البحث">
              <svg viewBox="0 0 24 24"><path d="M21.71 20.29l-5.01-5.01C17.54 13.68 18 11.91 18 10c0-4.41-3.59-8-8-8S2 5.59 2 10s3.59 8 8 8c1.91 0 3.68-.46 5.28-1.3l5.01 5.01c.39.39 1.02.39 1.41 0 .39-.39.39-1.01.01-1.42zM4 10c0-3.31 2.69-6 6-6s6 2.69 6 6-2.69 6-6 6-6-2.69-6-6z"/></svg>
            </button>
          </form>

          <button class="header-quote-btn" type="button" data-open-quote aria-label="فتح قائمة الاستفسارات">
            <div class="quote-icon-box">
              <span>📋</span>
              <span class="quote-count-badge" data-quote-count style="display:none">0</span>
            </div>
            <div class="quote-label-box">
              <small>طلب تسعير</small>
              <strong data-quote-label>قائمة الاستفسار</strong>
            </div>
          </button>
        </div>
      </header>

      <!-- Mobile Navigation Drawer -->
      <div class="mobile-nav-backdrop" id="mobile-nav-backdrop"></div>
      <aside class="mobile-nav-drawer" id="mobile-nav" aria-label="قائمة الهاتف">
        <div class="mobile-nav-header">
          <div class="brand">
            <img src="${path("assets/logo.jpg")}" alt="" style="width:40px;height:40px">
            <span class="brand-text">
              <strong style="font-size:18px">${company.shortName}</strong>
            </span>
          </div>
          <button class="drawer-close" type="button" data-menu-close aria-label="إغلاق القائمة">✕</button>
        </div>

        <form class="search-form mobile-nav-search" role="search" data-search-form>
          <input type="search" name="q" placeholder="ابحث في المنتجات..." aria-label="بحث في المنتجات">
          <button type="submit" aria-label="تنفيذ البحث">
            <svg viewBox="0 0 24 24"><path d="M21.71 20.29l-5.01-5.01C17.54 13.68 18 11.91 18 10c0-4.41-3.59-8-8-8S2 5.59 2 10s3.59 8 8 8c1.91 0 3.68-.46 5.28-1.3l5.01 5.01c.39.39 1.02.39 1.41 0 .39-.39.39-1.01.01-1.42zM4 10c0-3.31 2.69-6 6-6s6 2.69 6 6-2.69 6-6 6-6-2.69-6-6z"/></svg>
          </button>
        </form>

        <nav class="mobile-nav-links">
          <a href="${path("index.html")}" class="${isHome ? "active" : ""}">
            <span>الرئيسية</span>
            <span>‹</span>
          </a>
          <a href="${path("products.html")}" class="${isProducts ? "active" : ""}">
            <span>جميع المنتجات (${Mottaheda.products.length})</span>
            <span>‹</span>
          </a>
          <a href="${path("cables.html")}" class="${isCables ? "active" : ""}">
            <span>الأسلاك والكابلات</span>
            <span class="nav-badge">مميز</span>
          </a>
          <a href="${path("products.html?cat=building")}">
            <span>أسلاك المباني</span>
            <span>‹</span>
          </a>
          <a href="${path("products.html?cat=armored")}">
            <span>كابلات مسلحة وبكرات</span>
            <span>‹</span>
          </a>
          <a href="${path("products.html?cat=lighting")}">
            <span>الإضاءة واللمبات</span>
            <span>‹</span>
          </a>
          <a href="${path("products.html?cat=chandeliers")}">
            <span>النجف والوحدات الديكورية</span>
            <span>‹</span>
          </a>
          <a href="${path("products.html?cat=switches")}">
            <span>المفاتيح والأفياش والشواحن</span>
            <span>‹</span>
          </a>
          <a href="${path("products.html?cat=breakers")}">
            <span>القواطع ولوحات التوزيع</span>
            <span>‹</span>
          </a>
          <a href="${path("products.html?cat=conduits")}">
            <span>خراطيم ومواسير التأسيس</span>
            <span>‹</span>
          </a>
          <a href="#footer">
            <span>تواصل معنا</span>
            <span>‹</span>
          </a>
        </nav>

        <div class="mobile-nav-contact-card">
          <div class="contact-card-title">أرقام التواصل والواتساب المباشر:</div>
          ${(company.phones || []).map(p => `
            <div class="mobile-contact-row">
              <div class="mobile-contact-info">
                <strong>${p.display}</strong>
                <small>${p.role}</small>
              </div>
              <div class="mobile-contact-btns">
                <a href="tel:${p.number}" class="btn-micro btn-micro-call" aria-label="اتصال بـ ${p.display}" title="اتصال">
                  📞
                </a>
                <a href="https://wa.me/20${p.number.replace(/^0+/, '')}?text=${encodeURIComponent('السلام عليكم، أود الاستفسار عن منتجات وتوريدات متحدة للأدوات الكهربائية')}" target="_blank" rel="noopener" class="btn-micro btn-micro-wa" aria-label="واتساب ${p.display}" title="واتساب">
                  💬
                </a>
              </div>
            </div>
          `).join('')}
        </div>

        <div class="mobile-nav-cta">
          <a href="${company.facebookUrl}" target="_blank" rel="noopener" class="btn btn-facebook btn-full">
            تواصل عبر صفحة فيسبوك الرسمية
          </a>
        </div>
      </aside>
    `;
  }

  function footerHTML() {
    return `
      <footer class="site-footer" id="footer">
        <div class="wrap">
          <div class="footer-trust-strip reveal">
            <div class="trust-item">
              <div class="trust-icon">✓</div>
              <div class="trust-info">
                <strong>كابلات معتمدة ومطابقة</strong>
                <span>موصلات نحاسية وعزل حراري فائق</span>
              </div>
            </div>
            <div class="trust-item">
              <div class="trust-icon">📦</div>
              <div class="trust-info">
                <strong>توريدات مشروعات شاملة</strong>
                <span>تلبية مقايسات المقاولات والمصانع</span>
              </div>
            </div>
            <div class="trust-item">
              <div class="trust-icon">⚡</div>
              <div class="trust-info">
                <strong>استشارات فنية متخصصة</strong>
                <span>مساعدتكم في اختيار المقاطع المناسبة</span>
              </div>
            </div>
            <div class="trust-item">
              <div class="trust-icon">💬</div>
              <div class="trust-info">
                <strong>تواصل فوري ومباشر</strong>
                <span>تأكيد عروض الأسعار عبر فيسبوك</span>
              </div>
            </div>
          </div>

          <div class="footer-grid">
            <div class="footer-brand-box">
              <strong>${company.name}</strong>
              <p>مؤسستكم الموثوقة لتوريد كافة متطلبات المشروعات السكنية والصناعية والتجارية من الأسلاك المعتمدة، الكابلات المتخصصة، التجهيزات، وأدوات التأسيس الكهربائي.</p>
            </div>

            <div>
              <h3>الأقسام الرئيسية</h3>
              <ul>
                <li><a href="${path("cables.html")}">الأسلاك والكابلات</a></li>
                <li><a href="${path("products.html?cat=building")}">أسلاك المباني والتأسيس</a></li>
                <li><a href="${path("products.html?cat=armored")}">الكابلات المدرعة والمسلحة</a></li>
                <li><a href="${path("products.html?cat=flexible")}">الكابلات المرنة</a></li>
                <li><a href="${path("products.html")}">كتالوج المنتجات الكامل</a></li>
              </ul>
            </div>

            <div>
              <h3>التجهيزات والملحقات</h3>
              <ul>
                <li><a href="${path("products.html?cat=lighting")}">لمبات ووحدات إضاءة</a></li>
                <li><a href="${path("products.html?cat=chandeliers")}">نجف ووحدات ديكورية</a></li>
                <li><a href="${path("products.html?cat=switches")}">مفاتيح وأفياش وشواحن</a></li>
                <li><a href="${path("products.html?cat=breakers")}">قواطع ولوحات توزيع</a></li>
                <li><a href="${path("products.html?cat=conduits")}">خراطيم وبواطات تأسيس</a></li>
              </ul>
            </div>

            <div>
              <h3>خدمات التوريد</h3>
              <ul>
                <li>توريدات المشروعات والشركات</li>
                <li>تجهيز مقايسات الأعمال الكهربائية</li>
                <li>مواصفات قياسية للتمديدات</li>
                <li>تسليم وشحن حسب الاتفاق</li>
              </ul>
            </div>

            <div>
              <div class="footer-contact-card">
                <strong>أرقام التواصل والطلبات</strong>
                <p>يسعدنا تلقي اتصالاتكم وطلبياتكم عبر الأرقام المعتمدة أو واتساب:</p>
                <div class="footer-phones-list">
                  ${(company.phones || []).map(p => `
                    <div class="footer-phone-item">
                      <div class="footer-phone-info">
                        <strong>${p.role}</strong>
                        <small dir="ltr">${p.display}</small>
                      </div>
                      <div class="footer-phone-actions">
                        <a href="tel:${p.number}" class="btn-footer-action" title="اتصال هاتفي بـ ${p.display}">📞</a>
                        <a href="https://wa.me/20${p.number.replace(/^0+/, '')}?text=${encodeURIComponent('السلام عليكم، أود الاستفسار بخصوص منتجات وتوريدات متحدة للأدوات الكهربائية')}" target="_blank" rel="noopener" class="btn-footer-action btn-footer-wa" title="واتساب ${p.display}">💬</a>
                      </div>
                    </div>
                  `).join('')}
                </div>
                <a href="${company.facebookUrl}" target="_blank" rel="noopener" class="btn btn-facebook btn-full" style="margin-top:6px">
                  صفحتنا الرسمية على فيسبوك
                </a>
              </div>
            </div>
          </div>

          <div class="copy-strip">
            <span>جميع الحقوق محفوظة © ${new Date().getFullYear()} ${company.name}</span>
            <span>تخضع مواصفات وأسعار التوريد للمقايسات المعتمدة وتؤكد مباشرة مع المبيعات.</span>
          </div>
        </div>
      </footer>

      <!-- Floating Contact Action Hub (WhatsApp + Call) -->
      <div class="floating-contact-hub" id="contact-hub" aria-label="أدوات التواصل السريع">
        <!-- Call Button -->
        <button class="contact-fab fab-call" type="button" data-open-contact-modal="call" aria-label="اتصال هاتفي مباشر" title="اتصال هاتفي مباشر">
          <svg viewBox="0 0 24 24" class="fab-icon" aria-hidden="true">
            <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
          </svg>
          <span class="fab-label">اتصال هاتفي مباشر</span>
        </button>

        <!-- WhatsApp Button -->
        <button class="contact-fab fab-whatsapp" type="button" data-open-contact-modal="whatsapp" aria-label="محادثة واتساب فورية" title="محادثة واتساب فورية">
          <svg viewBox="0 0 24 24" class="fab-icon" aria-hidden="true">
            <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2zm5.78 14.15c-.24.67-1.39 1.25-1.93 1.32-.51.07-1.17.1-3.41-.83-2.86-1.18-4.7-4.1-4.84-4.29-.14-.19-1.16-1.54-1.16-2.94 0-1.4.73-2.09 1-2.37.24-.28.53-.35.7-.35.18 0 .35 0 .5.01.16.01.38-.06.59.45.22.53.75 1.83.82 1.97.07.14.12.31.02.5-.1.19-.15.31-.3.48-.15.17-.32.38-.45.51-.15.15-.31.31-.13.62.18.31.79 1.3 1.7 2.11 1.17 1.04 2.15 1.36 2.46 1.51.31.15.49.13.67-.08.18-.21.78-.91.99-1.22.21-.31.42-.26.7-.16.28.1 1.77.83 2.07.98.3.15.5.23.57.35.07.12.07.7-.17 1.37z"/>
          </svg>
          <span class="fab-label">محادثة واتساب فورية</span>
        </button>
      </div>

      <!-- Contact Number Selector Dialog / Bottom Sheet -->
      <div class="contact-modal-backdrop" id="contact-modal-backdrop"></div>
      <div class="contact-modal" id="contact-modal" role="dialog" aria-modal="true" aria-labelledby="contact-modal-title">
        <div class="contact-modal-handle" aria-hidden="true"></div>
        <div class="contact-modal-header">
          <div class="contact-modal-icon" id="contact-modal-icon"></div>
          <div class="contact-modal-header-text">
            <h3 id="contact-modal-title">تواصل معنا</h3>
            <p id="contact-modal-subtitle">اختر أحد الأرقام التالية للتواصل المباشر:</p>
          </div>
          <button class="drawer-close" type="button" data-close-contact-modal aria-label="إغلاق النافذة">✕</button>
        </div>
        <div class="contact-modal-body" id="contact-modal-body"></div>
        <div class="contact-modal-footer">
          <span>⚡ متاحون طوال أيام الأسبوع لتلبية كافة طلبات التوريد والمقايسات الفنية</span>
        </div>
      </div>

      <!-- Floating Controls & Modals -->
      <button id="back-to-top" type="button" aria-label="العودة لأعلى الصفحة">↑</button>
      <div id="toast" class="toast" role="status" aria-live="polite"></div>

      <!-- Inquiry / Quotation Drawer -->
      <div class="drawer-backdrop" id="quote-drawer-backdrop"></div>
      <div class="drawer-panel" id="quote-drawer" role="dialog" aria-modal="true" aria-labelledby="quote-drawer-title">
        <div class="drawer-header">
          <h2 id="quote-drawer-title">قائمة طلب الاستفسار والتسعير</h2>
          <button class="drawer-close" type="button" data-close-quote aria-label="إغلاق الدرج">✕</button>
        </div>
        <div class="drawer-body" id="quote-drawer-body"></div>
        <div class="drawer-footer">
          <button class="btn btn-whatsapp btn-full" type="button" data-send-quote-wa style="margin-bottom:8px">
            إرسال الاستفسار عبر واتساب
          </button>
          <button class="btn btn-facebook btn-full" type="button" data-send-quote style="margin-bottom:8px">
            إرسال الاستفسار عبر فيسبوك
          </button>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
            <button class="btn btn-outline" type="button" data-copy-quote>
              نسخ القائمة
            </button>
            <button class="btn btn-outline" type="button" data-call-quote>
              اتصال هاتفي
            </button>
          </div>
          <button class="btn btn-text" type="button" data-clear-quote style="color:var(--muted);margin-top:6px;width:100%">
            تفريغ القائمة
          </button>
          <p class="note">سيتم إرسال قائمة الأصناف المحددة مباشرة إلى مندوب المبيعات المعتمد لتسعيرها.</p>
        </div>
      </div>

      <!-- Lightbox Modal for PDP images -->
      <div class="lightbox-modal" id="lightbox-modal" role="dialog" aria-modal="true" aria-label="عرض مكبر للصورة">
        <div class="lightbox-content">
          <button class="lightbox-close" type="button" data-close-lightbox aria-label="إغلاق">✕</button>
          <img id="lightbox-img" src="" alt="">
        </div>
      </div>
    `;
  }

  /* ==========================================================================
     PRODUCT CARD TEMPLATE (NO PRICES!)
     ========================================================================== */

  function cardHTML(p, index = 0) {
    const cat = catName(p.category);
    return `
      <article class="product-card stagger-item" style="--index:${index % 8}">
        <span class="product-card-badge">${cat}</span>
        <a class="thumb" href="${path("product.html?id=" + p.id)}" aria-label="عرض تفاصيل ${p.name}">
          <img src="${path(p.image)}" alt="${p.name}" loading="lazy">
        </a>
        <div class="product-card-body">
          <div class="product-card-meta">
            <span class="product-card-cat">${cat}</span>
            <span class="product-card-sku">${p.sku}</span>
          </div>
          <h3>
            <a href="${path("product.html?id=" + p.id)}">${p.name}</a>
          </h3>
          <p class="product-card-desc">${p.short}</p>
          <div class="product-card-actions">
            <a class="btn-card-detail" href="${path("product.html?id=" + p.id)}">عرض التفاصيل</a>
            <button class="btn-card-quote" type="button" data-add-quote="${p.id}" aria-label="إضافة ${p.name} إلى قائمة الاستفسار" title="أضف إلى قائمة الاستفسار">
              +
            </button>
          </div>
        </div>
      </article>
    `;
  }

  /* ==========================================================================
     PAGE 1: HOMEPAGE
     ========================================================================== */

  function renderHome() {
    const cableCats = Mottaheda.categories.filter((c) => c.group === "cables");
    const featured = Mottaheda.products.filter((p) => p.featured);

    const catsHTML = cableCats
      .map((c) => {
        const count = countByCategory(c.id);
        return `
          <li>
            <a href="${path("products.html?cat=" + c.id)}">
              <span>${c.name}</span>
              <span style="font-size:11.5px;color:var(--muted)">(${count}) ‹</span>
            </a>
          </li>
        `;
      })
      .join("");

    document.getElementById("main").innerHTML = `
      <div class="wrap">
        <section class="hero-layout">
          <!-- Category Sidebar -->
          <aside class="panel reveal">
            <div class="cat-head">
              <span>أقسام الأسلاك والكابلات</span>
              <span>⚡</span>
            </div>
            <ul class="cat-list">
              ${catsHTML}
              <li>
                <a class="all-link" href="${path("cables.html")}">
                  <span>تصفح كل الأسلاك والكابلات</span>
                  <span>‹</span>
                </a>
              </li>
            </ul>
          </aside>

          <!-- Main Hero Banner -->
          <div class="hero-banner reveal">
            <img src="${path("assets/products/hero-cables.jpg")}" alt="تشكيلة كابلات وأسلاك المتحدة">
            <div class="hero-copy">
              <span class="hero-tag">توريدات معتمدة للمشروعات</span>
              <h1>حلول متكاملة في الأسلاك والكابلات والتوريدات الكهربائية</h1>
              <p>نوفر كافة متطلبات البناء والتأسيس للمشروعات السكنية والتجارية والصناعية بأعلى معايير الأمان والجودة المعتمدة.</p>
              <div class="hero-actions">
                <a class="btn btn-primary" href="${path("cables.html")}">استكشف الأسلاك والكابلات</a>
                <a class="btn btn-outline" href="${path("products.html")}">كتالوج المنتجات (${Mottaheda.products.length})</a>
              </div>
            </div>
          </div>

          <!-- Promo Side Stack -->
          <div class="promo-stack reveal">
            <a class="promo-card" href="${path("product.html?id=p-bld-rolls")}">
              <img src="${path("No_photo_description_available (28).jpg")}" alt="لفات أسلاك مباني">
              <div>
                <strong>أسلاك مباني وتأسيس</strong>
                <span>عرض التفاصيل ←</span>
              </div>
            </a>
            <a class="promo-card" href="${path("product.html?id=p-chn-crys01")}">
              <img src="${path("No_photo_description_available (10).jpg")}" alt="نجف كريستال فاخر">
              <div>
                <strong>نجف ووحدات ديكورية</strong>
                <span>استكشف المجموعة ←</span>
              </div>
            </a>
          </div>
        </section>

        <!-- Value Pillars Strip -->
        <section class="value-strip reveal">
          <div class="value-card">
            <div class="value-icon">🏗️</div>
            <div class="value-content">
              <h3>تمديدات المباني والإنشاءات</h3>
              <p>أسلاك نحاسية معتمدة ومطابقة للأكواد الإنشائية للتأسيس السكني والتجاري.</p>
            </div>
          </div>
          <div class="value-card">
            <div class="value-icon">🔌</div>
            <div class="value-content">
              <h3>كابلات مسلحة وقوى</h3>
              <p>كابلات نحاس وألومنيوم مسلحة لتغذية اللوحات الرئيسية ودفن مباشر.</p>
            </div>
          </div>
          <div class="value-card">
            <div class="value-icon">🛡️</div>
            <div class="value-content">
              <h3>لوحات وقواطع شنايدر الأصلية</h3>
              <p>حماية فائقة لشبكات الكهرباء ضد الأحمال الزائدة وتأمين المنشآت.</p>
            </div>
          </div>
        </section>
      </div>

      <!-- Real Showroom & Physical Storefront Showcase -->
      <section class="section reveal" style="padding-top:10px">
        <div class="wrap">
          <div class="cables-feature-strip" style="background: linear-gradient(135deg, #1f2937, #111827); border-radius: var(--r-lg); overflow: hidden; display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 28px; align-items: center; padding: 32px; box-shadow: var(--shadow-md);">
            <div>
              <span class="hero-tag" style="background: rgba(157,27,27,0.25); color: var(--gold);">مقرنا ومعرضنا الميداني</span>
              <h2 style="font-size: 26px; font-weight: 800; color: #fff; margin: 10px 0 14px;">معرض ومقر شركة المتحدة للأدوات الكهربائية والتوريدات</h2>
              <p style="font-size: 14.5px; color: #cbd5e1; line-height: 1.7; margin-bottom: 20px;">
                موزع معتمد لكبرى الشركات الصناعية. نسعد باستقبال عملائنا في مقرنا لمعاينة عينات الكابلات، الشاسيهات، القواطع، واللمبات، وتجهيز المقايسات الهندسية الفورية.
              </p>
              <div style="display:flex;gap:12px;flex-wrap:wrap">
                <a class="btn btn-facebook" href="${company.facebookUrl}" target="_blank" rel="noopener">مقر المعرض والتواصل عبر فيسبوك</a>
                <a class="btn btn-gold" href="${path("products.html")}">استعراض المنتجات المتاحة (${Mottaheda.products.length})</a>
              </div>
            </div>
            <div style="border-radius: var(--r-md); overflow: hidden; box-shadow: var(--shadow-lg); border: 2px solid rgba(255,255,255,0.15);">
              <img src="${path("No_photo_description_available (43).jpg")}" alt="واجهة معرض شركة المتحدة للأدوات الكهربائية والتوريدات" style="width:100%;height:320px;object-fit:cover;">
            </div>
          </div>
        </div>
      </section>

      <!-- Featured Products Section -->
      <section class="section" style="background:#ffffff;border-top:1px solid var(--line);border-bottom:1px solid var(--line)">
        <div class="wrap">
          <div class="section-head reveal">
            <div class="section-title">
              <h2>منتجات وتوريدات مختارة (${featured.length})</h2>
              <p>تشكيلة من أفضل المنتجات والأجهزة الأكثر طلباً في السوق</p>
            </div>
            <a class="section-action" href="${path("products.html")}">
              عرض جميع المنتجات (${Mottaheda.products.length}) ←
            </a>
          </div>

          <div class="tabs reveal" role="tablist" data-home-tabs>
            <button type="button" class="active" data-tab-cat="all">الكل (${featured.length})</button>
            <button type="button" data-tab-cat="cables">الأسلاك والكابلات</button>
            <button type="button" data-tab-cat="lighting">الإضاءة والنجف</button>
            <button type="button" data-tab-cat="accessories">القواطع والمفاتيح</button>
          </div>

          <div class="product-grid" id="home-product-grid">
            ${featured.map((p, i) => cardHTML(p, i)).join("")}
          </div>
        </div>
      </section>

      <!-- Interactive Cables Showcase Banner -->
      <div class="wrap">
        <section class="cables-feature-strip reveal">
          <div class="cables-feature-copy">
            <span class="hero-tag" style="background:rgba(227,155,18,0.2);color:var(--gold)">تخصصنا الرئيسي</span>
            <h2>تشكيلة متكاملة من الأسلاك والكابلات المعتمدة</h2>
            <p>سواء كنت بحاجة لأسلاك تأسيس للمنازل، كابلات مرنة للأجهزة والمعدات، أو بكرات صناعية للمشروعات الكبرى، توفر المتحدة حلول توريد مباشرة تلبي مقايستكم بدقة.</p>
            <div class="cables-pills">
              <a class="cables-pill" href="${path("products.html?cat=building")}">أسلاك مباني</a>
              <a class="cables-pill" href="${path("products.html?cat=armored")}">كابلات مسلحة وبكرات</a>
              <a class="cables-pill" href="${path("products.html?cat=flexible")}">كابلات مرنة</a>
              <a class="cables-pill" href="${path("products.html?cat=coaxial")}">كابلات محورية</a>
              <a class="cables-pill" href="${path("products.html?cat=hardline")}">كابل صلب</a>
              <a class="cables-pill" href="${path("products.html?cat=extension")}">أسلاك تمديد</a>
            </div>
            <a class="btn btn-gold" href="${path("cables.html")}">
              الدخول لصفحة الأسلاك والكابلات المخصصة
            </a>
          </div>
          <div class="cables-feature-visual">
            <img src="${path("assets/products/wires-close.jpg")}" alt="كابلات كهربائية ملونة" loading="lazy">
          </div>
        </section>

        <!-- Gallery Section -->
        <section class="section" style="padding-top:16px">
          <div class="section-head reveal">
            <div class="section-title">
              <h2>معرض التوريدات والموقع</h2>
              <p>لقطات واقعية من المنتجات، الورش، ومستلزمات التأسيس الميدانية</p>
            </div>
          </div>
          <div class="insta-grid reveal">
            <div class="gallery-item">
              <img src="${path("assets/products/gallery1.jpg")}" alt="أعمال كهربائية وتأسيس" loading="lazy">
              <div class="gallery-overlay">أعمال التأسيس الإنشائي</div>
            </div>
            <div class="gallery-item">
              <img src="${path("assets/products/gallery2.jpg")}" alt="أسلاك وتوصيلات" loading="lazy">
              <div class="gallery-overlay">كابلات وتوصيلات دقيقة</div>
            </div>
            <div class="gallery-item">
              <img src="${path("assets/products/gallery3.jpg")}" alt="تمديدات كهربائية" loading="lazy">
              <div class="gallery-overlay">تمديدات داخلية موثوقة</div>
            </div>
            <div class="gallery-item">
              <img src="${path("assets/products/gallery4.jpg")}" alt="كابل صلب ومعدات" loading="lazy">
              <div class="gallery-overlay">كابلات صلبة وخطوط رئيسية</div>
            </div>
            <div class="gallery-item">
              <img src="${path("assets/products/gallery5.jpg")}" alt="ورشة ومستلزمات" loading="lazy">
              <div class="gallery-overlay">تجهيز ومستلزمات الورش</div>
            </div>
          </div>
        </section>

        <!-- Commercial Project Supply Callout -->
        <section class="commercial-banner reveal">
          <div class="commercial-copy">
            <h3>هل لديك مقايسة كهربائية أو مشروع قيد التنفيذ؟</h3>
            <p>أرسل قائمة الكميات والمواصفات عبر صفحتنا على فيسبوك للحصول على عرض أسعار فوري وتوريد معتمد للموقع.</p>
          </div>
          <div style="display:flex;gap:12px;flex-shrink:0">
            <a class="btn btn-facebook" href="${company.facebookUrl}" target="_blank" rel="noopener">
              تواصل مع المبيعات على فيسبوك
            </a>
            <button class="btn btn-outline" type="button" data-open-quote>
              عرض قائمة الاستفسار
            </button>
          </div>
        </section>
      </div>
    `;

    // Tab filter interaction on home
    const tabButtons = document.querySelectorAll("[data-tab-cat]");
    const grid = document.getElementById("home-product-grid");
    tabButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        tabButtons.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        const catGroup = btn.dataset.tabCat;

        let filtered = Mottaheda.products.filter((p) => p.featured);
        if (catGroup === "cables") {
          filtered = filtered.filter((p) => p.cable);
        } else if (catGroup === "lighting") {
          filtered = filtered.filter((p) => p.category === "lighting" || p.category === "chandeliers");
        } else if (catGroup === "accessories") {
          filtered = filtered.filter((p) => !p.cable && p.category !== "lighting" && p.category !== "chandeliers");
        }

        grid.innerHTML = filtered.map((p, i) => cardHTML(p, i)).join("");
        initScrollObserver();
      });
    });
  }

  /* ==========================================================================
     PAGE 2: PRODUCTS CATALOG (LISTING)
     ========================================================================== */

  function renderListing() {
    let currentCat = params.get("cat") || "all";
    let searchQuery = (params.get("q") || "").trim();
    let currentSort = "featured";

    function getFilteredProducts() {
      let items = Mottaheda.products.slice();

      if (currentCat && currentCat !== "all") {
        items = items.filter((p) => p.category === currentCat);
      }

      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        items = items.filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            p.short.toLowerCase().includes(q) ||
            p.sku.toLowerCase().includes(q) ||
            p.description.toLowerCase().includes(q)
        );
      }

      // Sort without prices!
      if (currentSort === "name-asc") {
        items.sort((a, b) => a.name.localeCompare(b.name, "ar"));
      } else if (currentSort === "name-desc") {
        items.sort((a, b) => b.name.localeCompare(a.name, "ar"));
      } else {
        items.sort((a, b) => Number(b.featured) - Number(a.featured));
      }

      return items;
    }

    const cableCategories = Mottaheda.categories.filter((c) => c.group === "cables");
    const lightingCategories = Mottaheda.categories.filter((c) => c.id === "lighting" || c.id === "chandeliers");
    const gearCategories = Mottaheda.categories.filter((c) => c.group === "accessories" && c.id !== "lighting" && c.id !== "chandeliers");

    function renderFilterSidebar() {
      const allCount = Mottaheda.products.length;

      const renderCatItem = (c) => {
        const count = countByCategory(c.id);
        const isActive = currentCat === c.id;
        return `
          <label class="filter-item ${isActive ? "active" : ""}" data-category-filter="${c.id}">
            <input type="radio" name="cat" value="${c.id}" ${isActive ? "checked" : ""}>
            <span>${c.name}</span>
            <span class="count">${count}</span>
          </label>
        `;
      };

      return `
        <aside class="filters-sidebar reveal">
          <div class="filters-header">
            <h2>تصنيفات المنتجات</h2>
            ${
              currentCat !== "all" || searchQuery
                ? `<button class="btn-reset-filters" type="button" data-reset-filters>إلغاء التصفية</button>`
                : ""
            }
          </div>

          <div class="filter-list">
            <label class="filter-item ${currentCat === "all" ? "active" : ""}" data-category-filter="all">
              <input type="radio" name="cat" value="all" ${currentCat === "all" ? "checked" : ""}>
              <span>جميع المنتجات</span>
              <span class="count">${allCount}</span>
            </label>
          </div>

          <div class="filter-group-title">الأسلاك والكابلات</div>
          <div class="filter-list">
            ${cableCategories.map(renderCatItem).join("")}
          </div>

          <div class="filter-group-title">الإضاءة والنجف</div>
          <div class="filter-list">
            ${lightingCategories.map(renderCatItem).join("")}
          </div>

          <div class="filter-group-title">التجهيزات والقواطع</div>
          <div class="filter-list">
            ${gearCategories.map(renderCatItem).join("")}
          </div>
        </aside>
      `;
    }

    function updateGridAndUI() {
      const items = getFilteredProducts();
      const listEl = document.getElementById("product-grid-container");
      const countEl = document.getElementById("results-count");
      const titleEl = document.getElementById("listing-title");

      let title = "جميع المنتجات والتوريدات";
      if (currentCat !== "all") {
        title = catName(currentCat);
      }
      if (searchQuery) {
        title = `نتائج البحث عن "${searchQuery}"`;
      }
      if (titleEl) titleEl.textContent = title;

      if (countEl) {
        countEl.textContent = `عرض ${items.length} من إجمالي ${Mottaheda.products.length} منتجاً`;
      }

      if (!items.length) {
        listEl.innerHTML = `
          <div class="empty-state" style="grid-column: 1 / -1">
            <div class="empty-icon">🔍</div>
            <h3>لم يتم العثور على منتجات مطابقة</h3>
            <p>لم نجد نتائج تطابق خيارات البحث الحالية. يمكنك تجربة كلمات بحث أخرى أو تصفح كل المنتجات.</p>
            <button class="btn btn-primary" type="button" data-reset-filters>
              عرض جميع المنتجات (${Mottaheda.products.length})
            </button>
          </div>
        `;
      } else {
        listEl.innerHTML = items.map((p, i) => cardHTML(p, i)).join("");
      }

      initScrollObserver();
    }

    const initialItems = getFilteredProducts();

    document.getElementById("main").innerHTML = `
      <div class="page-head">
        <div class="wrap">
          <nav class="crumbs" aria-label="مسار التصفح">
            <a href="${path("index.html")}">الرئيسية</a>
            <span class="sep">/</span>
            <span>كتالوج المنتجات</span>
            ${currentCat !== "all" ? `<span class="sep">/</span> <span>${catName(currentCat)}</span>` : ""}
          </nav>
          <h1 id="listing-title">
            ${searchQuery ? `نتائج البحث عن "${searchQuery}"` : currentCat !== "all" ? catName(currentCat) : "جميع المنتجات والتوريدات"}
          </h1>
        </div>
      </div>

      <div class="wrap listing-layout">
        <div id="sidebar-slot">${renderFilterSidebar()}</div>

        <div>
          <div class="toolbar reveal">
            <span class="toolbar-results" id="results-count">
              عرض ${initialItems.length} من إجمالي ${Mottaheda.products.length} منتجاً
            </span>
            <div class="toolbar-controls">
              <label for="sort-select" style="font-size:13px;font-weight:700">الترتيب:</label>
              <select id="sort-select" data-sort-select>
                <option value="featured">المميز أولاً</option>
                <option value="name-asc">الاسم: أ إلى ي</option>
                <option value="name-desc">الاسم: ي إلى أ</option>
              </select>
            </div>
          </div>

          <div class="product-grid" id="product-grid-container">
            ${
              initialItems.length
                ? initialItems.map((p, i) => cardHTML(p, i)).join("")
                : `<div class="empty-state" style="grid-column: 1 / -1">
                    <div class="empty-icon">🔍</div>
                    <h3>لم يتم العثور على منتجات مطابقة</h3>
                    <p>يمكنك تجربة خيارات أخرى أو استعراض الكتالوج كاملاً.</p>
                    <button class="btn btn-primary" type="button" data-reset-filters>عرض كل المنتجات</button>
                  </div>`
            }
          </div>
          <p class="note">جميع المنتجات متوفرة للتوريد المباشر. للاستفسار عن المقايسات والأسعار يرجى التواصل معنا.</p>
        </div>
      </div>
    `;

    // Dynamic Filter Events without full reload
    document.addEventListener("click", (e) => {
      const filterItem = e.target.closest("[data-category-filter]");
      if (filterItem) {
        currentCat = filterItem.dataset.categoryFilter;
        const url = new URL(window.location);
        if (currentCat === "all") url.searchParams.delete("cat");
        else url.searchParams.set("cat", currentCat);
        window.history.replaceState({}, "", url);

        document.querySelectorAll("[data-category-filter]").forEach((el) => {
          el.classList.toggle("active", el.dataset.categoryFilter === currentCat);
        });

        updateGridAndUI();
      }

      if (e.target.closest("[data-reset-filters]")) {
        currentCat = "all";
        searchQuery = "";
        const url = new URL(window.location);
        url.searchParams.delete("cat");
        url.searchParams.delete("q");
        window.history.replaceState({}, "", url);

        const searchInputs = document.querySelectorAll("[data-search-form] input");
        searchInputs.forEach((i) => (i.value = ""));

        const sidebarSlot = document.getElementById("sidebar-slot");
        if (sidebarSlot) sidebarSlot.innerHTML = renderFilterSidebar();

        updateGridAndUI();
      }
    });

    const sortSelect = document.querySelector("[data-sort-select]");
    if (sortSelect) {
      sortSelect.addEventListener("change", (e) => {
        currentSort = e.target.value;
        updateGridAndUI();
      });
    }
  }

  /* ==========================================================================
     PAGE 3: INDIVIDUAL PRODUCT DETAILS (PDP) — NO PRICES!
     ========================================================================== */

  function renderProduct() {
    const id = params.get("id");
    const p = productById(id) || Mottaheda.products[0];
    const cat = catById(p.category);

    const related = Mottaheda.products
      .filter((x) => x.id !== p.id && (x.category === p.category || (p.cable && x.cable)))
      .slice(0, 4);

    const fillRelated =
      related.length < 4
        ? related.concat(
            Mottaheda.products.filter((x) => x.id !== p.id && !related.includes(x)).slice(0, 4 - related.length)
          )
        : related;

    document.getElementById("main").innerHTML = `
      <div class="wrap pdp-wrap">
        <nav class="crumbs reveal" aria-label="مسار التصفح">
          <a href="${path("index.html")}">الرئيسية</a>
          <span class="sep">/</span>
          <a href="${path("products.html")}">المنتجات</a>
          <span class="sep">/</span>
          <a href="${path("products.html?cat=" + p.category)}">${cat ? cat.name : "القسم"}</a>
          <span class="sep">/</span>
          <span>${p.name}</span>
        </nav>

        <article class="pdp">
          <!-- Column 1: Image Gallery & Lightbox -->
          <div class="pdp-visual reveal">
            <div class="pdp-main-image-box" data-open-lightbox aria-label="انقر لتكبير الصورة">
              <img class="main-img" data-main-img src="${path(p.thumbs[0] || p.image)}" alt="${p.name}">
              <span class="zoom-hint">🔍 انقر للتكبير</span>
            </div>
            <div class="thumbs" role="tablist" aria-label="معرض صور المنتج">
              ${p.thumbs
                .map(
                  (src, i) => `
                <button type="button" class="${i === 0 ? "active" : ""}" data-thumb="${path(src)}" aria-label="عرض الصورة ${i + 1}">
                  <img src="${path(src)}" alt="${p.name}">
                </button>
              `
                )
                .join("")}
            </div>
          </div>

          <!-- Column 2: Product Info & Scannable Specs -->
          <div class="pdp-info reveal">
            <div class="pdp-meta-top">
              <span class="pdp-cat-tag">${cat ? cat.name : "توريدات"}</span>
              <span class="pdp-sku-tag">كود التوريد: ${p.sku}</span>
            </div>

            <h1>${p.name}</h1>
            <p class="pdp-description">${p.description}</p>

            ${
              p.features && p.features.length
                ? `
              <div class="pdp-features">
                <h3>أبرز المميزات والمواصفات:</h3>
                <ul>
                  ${p.features.map((f) => `<li>${f}</li>`).join("")}
                </ul>
              </div>
            `
                : ""
            }

            <dl class="spec-mini">
              ${p.specs.map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join("")}
            </dl>
          </div>

          <!-- Column 3: Commercial Inquiry Card (REPLACES PRICE & CHECKOUT) -->
          <aside class="pdp-inquiry-panel reveal">
            <div class="inquiry-status">
              <span class="status-dot"></span>
              <span>متوفر للطلب والتوريد الفوري</span>
            </div>

            <div class="inquiry-title">طلب استفسار وعرض أسعار</div>
            <p class="inquiry-desc">
              نظراً لتغير أسعار المواد الخام ومقايسات المشروعات، يتم تقديم عروض الأسعار والتخفيضات للكميات مباشرة عبر فريق المبيعات.
            </p>

            <div class="qty-control">
              <label for="detail-qty">الكمية المطلوبة للاستفسار:</label>
              <div class="qty-stepper">
                <button type="button" data-qty-step="-1" aria-label="إنقاص الكمية">−</button>
                <input id="detail-qty" type="number" min="1" value="1" aria-label="الكمية">
                <button type="button" data-qty-step="1" aria-label="زيادة الكمية">+</button>
              </div>
            </div>

            <div class="inquiry-actions">
              <button class="btn btn-whatsapp btn-full" type="button" data-direct-whatsapp="${p.id}">
                استفسار وتوافر المنتج عبر واتساب
              </button>
              <button class="btn btn-facebook btn-full" type="button" data-direct-facebook="${p.id}">
                استفسار عن هذا المنتج عبر فيسبوك
              </button>
              <button class="btn btn-primary btn-full" type="button" data-add-detail="${p.id}">
                أضف إلى قائمة الاستفسار والتسعير
              </button>
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
                <button class="btn btn-outline" type="button" data-direct-call="${p.id}">
                  اتصال هاتفي
                </button>
                <button class="btn btn-outline" type="button" data-copy-single="${p.id}">
                  نسخ المواصفات
                </button>
              </div>
            </div>

            <ul class="inquiry-benefits">
              <li>✓ توريد معتمد للمنازل، الورش، والشركات الإنشائية</li>
              <li>✓ تأكيد المواصفات الفنية والمقاطع حسب الطلب</li>
              <li>✓ إمكانية الاستلام أو الشحن الميداني حسب الاتفاق</li>
            </ul>
          </aside>
        </article>

        <!-- Full Technical Specifications Table -->
        <section class="pdp-specs-section reveal">
          <h2>المواصفات الفنية والتفاصيل المعتمدة</h2>
          <table class="specs-table">
            <tbody>
              <tr>
                <th>اسم المنتج</th>
                <td>${p.name}</td>
              </tr>
              <tr>
                <th>كود المنتج (SKU)</th>
                <td>${p.sku}</td>
              </tr>
              <tr>
                <th>التصنيف الفني</th>
                <td>${cat ? cat.name : "توريدات عامة"}</td>
              </tr>
              ${p.specs
                .map(
                  ([k, v]) => `
                <tr>
                  <th>${k}</th>
                  <td>${v}</td>
                </tr>
              `
                )
                .join("")}
              <tr>
                <th>جاهزية التوريد</th>
                <td>متوفر لتجهيز الطلبيات ومقايسات المشروعات الكبرى</td>
              </tr>
            </tbody>
          </table>
        </section>

        <!-- Related Products Section -->
        <section class="related-section reveal">
          <h2>منتجات وتوريدات ذات صلة</h2>
          <div class="product-grid">
            ${fillRelated.map((r, i) => cardHTML(r, i)).join("")}
          </div>
        </section>
      </div>
    `;

    // Direct single product Facebook action
    const fbBtn = document.querySelector(`[data-direct-facebook="${p.id}"]`);
    if (fbBtn) {
      fbBtn.addEventListener("click", () => {
        const qty = Number(document.getElementById("detail-qty")?.value || 1);
        const text = `مرحباً، أود الاستفسار عن توفر وسعر منتج: "${p.name}" (كود: ${p.sku}) بكمية: ${qty}.\nرابط المنتج: ${window.location.href}`;
        navigator.clipboard.writeText(text).catch(() => {});
        window.open(company.facebookUrl, "_blank", "noopener,noreferrer");
        showToast("جاري فتح صفحة فيسبوك... تم نسخ تفاصيل استفسارك!");
      });
    }

    // Copy single product info
    const copyBtn = document.querySelector(`[data-copy-single="${p.id}"]`);
    if (copyBtn) {
      copyBtn.addEventListener("click", () => {
        const text = `منتج: ${p.name}\nكود: ${p.sku}\nالتصنيف: ${cat ? cat.name : ""}\nالوصف: ${p.description}\nالمواصفات:\n${p.specs.map(([k, v]) => `- ${k}: ${v}`).join("\n")}`;
        navigator.clipboard.writeText(text).then(() => {
          showToast("تم نسخ بيانات المنتج ومواصفاته بنجاح!");
        });
      });
    }
  }

  /* ==========================================================================
     PAGE 4: ELECTRICAL WIRES & CABLES DEDICATED PAGE
     ========================================================================== */

  function renderCables() {
    let currentCableFilter = "all";
    const cableProducts = Mottaheda.products.filter((p) => p.cable);
    const cableCategories = Mottaheda.categories.filter((c) => c.group === "cables");

    function getFilteredCables() {
      if (currentCableFilter === "all") return cableProducts;
      return cableProducts.filter((p) => p.category === currentCableFilter);
    }

    const typesCardsHTML = cableCategories
      .map((c) => {
        const count = countByCategory(c.id);
        return `
          <div class="cable-type-card">
            <h3>
              <span>${c.name}</span>
              <span style="font-size:12px;color:var(--muted)">(${count})</span>
            </h3>
            <p>حلول متخصصة ومقاطع معتمدة تلائم متطلبات التأسيس والتوصيل.</p>
            <button class="link-text" type="button" data-cable-pill="${c.id}">
              تصفح منتجات هذا القسم ←
            </button>
          </div>
        `;
      })
      .join("");

    document.getElementById("main").innerHTML = `
      <div class="wrap">
        <section class="cable-intro reveal">
          <div class="copy-block">
            <nav class="crumbs" aria-label="مسار التصفح">
              <a href="${path("index.html")}">الرئيسية</a>
              <span class="sep">/</span>
              <span>الأسلاك والكابلات</span>
            </nav>
            <h1>الأسلاك والكابلات الكهربائية المعتمدة</h1>
            <p>
              الصفحة المتخصصة لكافة أنواع الأسلاك والكابلات لدى المتحدة. نوفر تشكيلة واسعة تلبي اشتراطات الأمان والسلامة وكود البناء للإنشاءات السكنية، التجارية، والمصانع.
            </p>
            <div style="display:flex;gap:12px;flex-wrap:wrap">
              <a class="btn btn-primary" href="#cables-grid-section">استعراض المنتجات (${cableProducts.length})</a>
              <button class="btn btn-whatsapp" type="button" data-open-contact-modal="whatsapp">
                طلب تسعير كابلات عبر واتساب
              </button>
              <button class="btn btn-outline" type="button" data-open-contact-modal="call">
                اتصال هاتفي بالمبيعات
              </button>
            </div>
          </div>
          <div class="cable-intro-banner">
            <img src="${path("assets/products/wires-close.jpg")}" alt="كابلات وأسلاك متطورة">
          </div>
        </section>

        <!-- Value strip -->
        <section class="value-strip reveal">
          <div class="value-card">
            <div class="value-icon">⚡</div>
            <div class="value-content">
              <h3>نحاس نقي عالي التوصيل</h3>
              <p>موصلات شعرية وصلبة تضمن كفاءة تدفق التيار وتقليل الفقد الحراري.</p>
            </div>
          </div>
          <div class="value-card">
            <div class="value-icon">🔥</div>
            <div class="value-content">
              <h3>عوازل PVC مقاومة للحرارة</h3>
              <p>حماية فائقة ضد اشتعال الحرائق وتآكل الرطوبة داخل الجدران.</p>
            </div>
          </div>
          <div class="value-card">
            <div class="value-icon">📐</div>
            <div class="value-content">
              <h3>مقايسات المشروعات الكبرى</h3>
              <p>تجهيز طلبيات البكرات والأطوال الخاصة للمقاولين والشركات.</p>
            </div>
          </div>
        </section>

        <!-- Cable Types Overview Cards -->
        <section class="section" style="padding-top:10px">
          <div class="section-head reveal">
            <div class="section-title">
              <h2>تصنيفات فئات الكابلات المتاحة</h2>
              <p>اختر الفئة المطلوبة للاطلاع على المنتجات المتاحة للتوريد</p>
            </div>
          </div>
          <div class="cable-types reveal">
            ${typesCardsHTML}
          </div>
        </section>

        <!-- Products Section with Filter Pills -->
        <section class="section" id="cables-grid-section" style="padding-top:0">
          <div class="section-head reveal">
            <div class="section-title">
              <h2>كتالوج الأسلاك والكابلات (${cableProducts.length})</h2>
              <p>تصفية سريعة حسب نوع السلك أو الكابل</p>
            </div>
          </div>

          <div class="cable-filter-bar reveal">
            <button class="btn-cable-filter active" type="button" data-cable-pill="all">
              جميع الكابلات والأسلاك (${cableProducts.length})
            </button>
            ${cableCategories
              .map(
                (c) => `
              <button class="btn-cable-filter" type="button" data-cable-pill="${c.id}">
                ${c.name} (${countByCategory(c.id)})
              </button>
            `
              )
              .join("")}
          </div>

          <div class="product-grid" id="cables-product-grid">
            ${cableProducts.map((p, i) => cardHTML(p, i)).join("")}
          </div>
          <p class="note">المقاطع العرضية والأطوال تُحدد حسب متطلبات المقايسة عند طلب التسعير.</p>
        </section>

        <!-- Contractor Quote Banner -->
        <section class="commercial-banner reveal">
          <div class="commercial-copy">
            <h3>قسم توريدات المشروعات والمقاولات</h3>
            <p>نوفر جداول كميات مخصصة للإنشاءات وورش الكهرباء بأسعار تنافسية للتوريدات الكبيرة.</p>
          </div>
          <div style="display:flex;gap:10px;flex-wrap:wrap">
            <button class="btn btn-whatsapp" type="button" data-open-contact-modal="whatsapp">
              طلب مقايسة عبر واتساب
            </button>
            <button class="btn btn-outline" type="button" data-open-contact-modal="call" style="background:#fff">
              اتصال هاتفي مباشر
            </button>
            <a class="btn btn-facebook" href="${company.facebookUrl}" target="_blank" rel="noopener">
              مراسلة عبر فيسبوك
            </a>
          </div>
        </section>
      </div>
    `;

    // Filter pills event delegation
    const pills = document.querySelectorAll("[data-cable-pill]");
    const grid = document.getElementById("cables-product-grid");

    pills.forEach((pill) => {
      pill.addEventListener("click", () => {
        const catId = pill.dataset.cablePill;
        currentCableFilter = catId;

        pills.forEach((p) => p.classList.toggle("active", p.dataset.cablePill === catId));

        const filtered = getFilteredCables();
        grid.innerHTML = filtered.map((p, i) => cardHTML(p, i)).join("");
        initScrollObserver();

        const gridSection = document.getElementById("cables-grid-section");
        if (gridSection && window.scrollY > gridSection.offsetTop) {
          gridSection.scrollIntoView({ behavior: "smooth" });
        }
      });
    });
  }

  /* ==========================================================================
     INQUIRY DRAWER RENDERING
     ========================================================================== */

  function renderQuoteDrawer() {
    const box = document.getElementById("quote-drawer-body");
    if (!box) return;

    const items = getQuote();
    if (!items.length) {
      box.innerHTML = `
        <div class="empty-state" style="border:0;padding:48px 12px">
          <div class="empty-icon">📋</div>
          <h3>قائمة الاستفسار فارغة</h3>
          <p>تصفح كتالوج المنتجات وأضف ما ترغب في الاستفسار عنه لطلب عرض أسعار مجمع.</p>
          <a class="btn btn-primary" href="${path("products.html")}">تصفح المنتجات (${Mottaheda.products.length})</a>
        </div>
      `;
      return;
    }

    box.innerHTML = items
      .map((item) => {
        const p = productById(item.id);
        if (!p) return "";
        return `
          <div class="drawer-item">
            <img src="${path(p.image)}" alt="${p.name}">
            <div class="drawer-item-info">
              <strong>${p.name}</strong>
              <span class="drawer-item-sku">كود: ${p.sku}</span>
              <div class="drawer-item-qty">
                <button type="button" data-drawer-qty="-1" data-id="${item.id}" aria-label="إنقاص">−</button>
                <span>${item.qty}</span>
                <button type="button" data-drawer-qty="1" data-id="${item.id}" aria-label="زيادة">+</button>
              </div>
            </div>
            <button class="drawer-item-remove" type="button" data-drawer-remove="${item.id}" aria-label="حذف المنتج">
              ✕
            </button>
          </div>
        `;
      })
      .join("");
  }

  /* ==========================================================================
     SCROLL-DRIVEN MOTION & INTERSECTION OBSERVER
     ========================================================================== */

  let scrollObserver;

  function initScrollObserver() {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const targets = document.querySelectorAll(
      ".reveal:not(.revealed), .stagger-item:not(.revealed), .reveal-fade:not(.revealed)"
    );

    if (prefersReducedMotion || !("IntersectionObserver" in window)) {
      targets.forEach((el) => el.classList.add("revealed"));
      return;
    }

    if (scrollObserver) {
      scrollObserver.disconnect();
    }

    scrollObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        root: null,
        rootMargin: "0px 0px -40px 0px",
        threshold: 0.08
      }
    );

    targets.forEach((el) => scrollObserver.observe(el));
  }

  function initScrollProgressAndHeader() {
    const progressBar = document.getElementById("scroll-progress");
    const header = document.getElementById("site-header");
    const backToTop = document.getElementById("back-to-top");

    let ticking = false;

    function onScroll() {
      const scrollY = window.scrollY || window.pageYOffset;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;

      // 1. Reading progress bar
      if (progressBar && docHeight > 0) {
        const progress = Math.min(1, Math.max(0, scrollY / docHeight));
        progressBar.style.transform = `scaleX(${progress})`;
      }

      // 2. Header elevation and shrink
      if (header) {
        if (scrollY > 40) {
          header.classList.add("scrolled");
        } else {
          header.classList.remove("scrolled");
        }
      }

      // 3. Back to top button
      if (backToTop) {
        if (scrollY > 350) {
          backToTop.classList.add("show");
        } else {
          backToTop.classList.remove("show");
        }
      }

      ticking = false;
    }

    window.addEventListener(
      "scroll",
      () => {
        if (!ticking) {
          window.requestAnimationFrame(onScroll);
          ticking = true;
        }
      },
      { passive: true }
    );

    onScroll();

    if (backToTop) {
      backToTop.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    }
  }

  /* ==========================================================================
     GLOBAL EVENT DELEGATION
     ========================================================================== */

  function bindEvents() {
    // Explicit direct close listeners
    document.querySelectorAll("[data-close-quote]").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        closeQuoteDrawer();
      });
    });

    document.querySelectorAll("[data-menu-close]").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        closeMobileNav();
      });
    });

    document.querySelectorAll("[data-close-contact-modal]").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        closeContactModal();
      });
    });

    const quoteBackdrop = document.getElementById("quote-drawer-backdrop");
    if (quoteBackdrop) {
      quoteBackdrop.addEventListener("click", (e) => {
        e.preventDefault();
        closeQuoteDrawer();
      });
    }

    const menuBackdrop = document.getElementById("mobile-nav-backdrop");
    if (menuBackdrop) {
      menuBackdrop.addEventListener("click", (e) => {
        e.preventDefault();
        closeMobileNav();
      });
    }

    const contactBackdrop = document.getElementById("contact-modal-backdrop");
    if (contactBackdrop) {
      contactBackdrop.addEventListener("click", (e) => {
        e.preventDefault();
        closeContactModal();
      });
    }

    // Body delegated listener
    document.body.addEventListener("click", (e) => {
      // Open contact modal
      const openContactBtn = e.target.closest("[data-open-contact-modal]");
      if (openContactBtn) {
        e.preventDefault();
        const actionType = openContactBtn.dataset.openContactModal || "whatsapp";
        openContactModal(actionType);
        return;
      }

      // Close contact modal
      if (e.target.closest("[data-close-contact-modal]") || e.target.id === "contact-modal-backdrop") {
        e.preventDefault();
        closeContactModal();
        return;
      }

      // Copy phone number
      const copyPhoneBtn = e.target.closest("[data-copy-phone]");
      if (copyPhoneBtn) {
        e.preventDefault();
        const phone = copyPhoneBtn.dataset.copyPhone;
        navigator.clipboard.writeText(phone).then(() => {
          showToast(`تم نسخ الرقم بنجاح: ${phone}`);
        }).catch(() => {
          showToast(`الرقم: ${phone}`);
        });
        return;
      }

      // Send Quote via WhatsApp
      if (e.target.closest("[data-send-quote-wa]")) {
        e.preventDefault();
        const quote = getQuote();
        if (!quote.length) {
          showToast("قائمة الاستفسار فارغة، أضف منتجات أولاً");
          return;
        }
        let msg = "السلام عليكم، أود طلب تسعير وتوافر للتوريدات التالية من شركة المتحدة للأدوات الكهربائية:\n\n";
        quote.forEach((item, idx) => {
          const p = productById(item.id);
          const name = p ? p.name : item.id;
          const sku = p ? ` (${p.sku})` : "";
          msg += `${idx + 1}. ${name}${sku} — الكمية: ${item.qty}\n`;
        });
        msg += "\nيرجى الإفادة بالتوافر وأفضل أسعار التوريد. شكراً جزيلاً.";
        openContactModal("whatsapp", { customMessage: msg });
        return;
      }

      // Quote call request
      if (e.target.closest("[data-call-quote]")) {
        e.preventDefault();
        openContactModal("call");
        return;
      }

      // PDP direct whatsapp
      const pdpWaBtn = e.target.closest("[data-direct-whatsapp]");
      if (pdpWaBtn) {
        e.preventDefault();
        const id = pdpWaBtn.dataset.directWhatsapp;
        const p = productById(id);
        const qty = Number(document.getElementById("detail-qty")?.value || 1);
        const msg = p
          ? `السلام عليكم، أود الاستفسار عن توفر وسعر توريد منتج "${p.name}" (كود التوريد: ${p.sku}) — الكمية التقريبية المطلوبة: ${qty} قطعة.`
          : "السلام عليكم، أود الاستفسار عن منتجات وتوريدات متحدة للأدوات الكهربائية.";
        openContactModal("whatsapp", { customMessage: msg });
        return;
      }

      // PDP direct call
      if (e.target.closest("[data-direct-call]")) {
        e.preventDefault();
        openContactModal("call");
        return;
      }

      // Add to quote from card
      const addQuoteBtn = e.target.closest("[data-add-quote]");
      if (addQuoteBtn) {
        const id = addQuoteBtn.dataset.addQuote;
        addToQuote(id, 1);
        return;
      }

      // Add to quote from product detail
      const addDetailBtn = e.target.closest("[data-add-detail]");
      if (addDetailBtn) {
        const id = addDetailBtn.dataset.addDetail;
        const qty = Number(document.getElementById("detail-qty")?.value || 1);
        addToQuote(id, Math.max(1, qty));
        return;
      }

      // Detail quantity step buttons
      const qtyStepBtn = e.target.closest("[data-qty-step]");
      if (qtyStepBtn) {
        const input = document.getElementById("detail-qty");
        if (input) {
          const delta = Number(qtyStepBtn.dataset.qtyStep);
          input.value = Math.max(1, Number(input.value) + delta);
        }
        return;
      }

      // Drawer quantity steps
      const drawerQtyBtn = e.target.closest("[data-drawer-qty]");
      if (drawerQtyBtn) {
        const id = drawerQtyBtn.dataset.id;
        const delta = Number(drawerQtyBtn.dataset.drawerQty);
        updateQuoteQty(id, delta);
        return;
      }

      // Drawer item remove
      const drawerRemoveBtn = e.target.closest("[data-drawer-remove]");
      if (drawerRemoveBtn) {
        const id = drawerRemoveBtn.dataset.drawerRemove;
        removeFromQuote(id);
        return;
      }

      // Open / Close quote drawer
      if (e.target.closest("[data-open-quote]")) {
        e.preventDefault();
        openQuoteDrawer();
        return;
      }
      if (e.target.closest("[data-close-quote]") || e.target.id === "quote-drawer-backdrop") {
        e.preventDefault();
        closeQuoteDrawer();
        return;
      }

      // Drawer action buttons
      if (e.target.closest("[data-send-quote]")) {
        sendQuoteViaFacebook();
        return;
      }
      if (e.target.closest("[data-copy-quote]")) {
        copyQuoteToClipboard();
        return;
      }
      if (e.target.closest("[data-clear-quote]")) {
        clearQuote();
        return;
      }

      // Lightbox open / close
      const openLightbox = e.target.closest("[data-open-lightbox]");
      if (openLightbox) {
        const mainImg = document.querySelector("[data-main-img]");
        if (mainImg) {
          const lbImg = document.getElementById("lightbox-img");
          if (lbImg) lbImg.src = mainImg.src;
          document.getElementById("lightbox-modal")?.classList.add("show");
        }
        return;
      }
      if (e.target.closest("[data-close-lightbox]") || e.target.id === "lightbox-modal") {
        document.getElementById("lightbox-modal")?.classList.remove("show");
        return;
      }

      // PDP thumbnail switch
      const thumbBtn = e.target.closest("[data-thumb]");
      if (thumbBtn) {
        const mainImg = document.querySelector("[data-main-img]");
        if (mainImg) {
          mainImg.src = thumbBtn.dataset.thumb;
          document.querySelectorAll("[data-thumb]").forEach((b) => b.classList.remove("active"));
          thumbBtn.classList.add("active");
        }
        return;
      }

      // Mobile Menu
      const menuToggle = e.target.closest("[data-menu-toggle]");
      if (menuToggle) {
        e.preventDefault();
        const isOpen = document.getElementById("mobile-nav")?.classList.contains("show");
        if (isOpen) {
          closeMobileNav();
        } else {
          openMobileNav();
        }
        return;
      }

      if (e.target.closest("[data-menu-close]") || e.target.id === "mobile-nav-backdrop") {
        e.preventDefault();
        closeMobileNav();
        return;
      }

      // Close mobile menu on clicking any navigation link
      if (e.target.closest(".mobile-nav-links a")) {
        closeMobileNav();
      }
    });

    // Keyboard support: Escape key closes drawers and modals
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        closeQuoteDrawer();
        closeMobileNav();
        closeContactModal();
        document.getElementById("lightbox-modal")?.classList.remove("show");
      }
    });

    // Search form submission
    document.body.addEventListener("submit", (e) => {
      const searchForm = e.target.closest("[data-search-form]");
      if (searchForm) {
        e.preventDefault();
        const q = new FormData(searchForm).get("q");
        window.location.href = path("products.html?q=" + encodeURIComponent(q || ""));
      }
    });
  }

  /* ==========================================================================
     INIT & BOOTSTRAP
     ========================================================================== */

  document.getElementById("site-chrome-start").innerHTML = headerHTML();
  document.getElementById("site-chrome-end").innerHTML = footerHTML();

  if (page === "home") renderHome();
  else if (page === "products") renderListing();
  else if (page === "product") renderProduct();
  else if (page === "cables") renderCables();

  bindEvents();
  updateQuoteBadges();
  initScrollProgressAndHeader();
  initScrollObserver();
})();
