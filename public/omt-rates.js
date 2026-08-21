(function () {
  "use strict";

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function money(value, currency) {
    try {
      return new Intl.NumberFormat("en-GB", {
        style: "currency",
        currency: currency,
        maximumFractionDigits: ["INR", "NGN", "PKR", "PHP"].indexOf(currency) >= 0 ? 0 : 2,
      }).format(Number(value));
    } catch {
      return Number(value).toFixed(2) + " " + currency;
    }
  }

  function checkedAt(value) {
    if (!value) return "No completed check";
    try {
      return new Intl.DateTimeFormat("en-GB", {
        dateStyle: "medium",
        timeStyle: "short",
        timeZone: "UTC",
      }).format(new Date(value)) + " UTC";
    } catch {
      return value;
    }
  }

  function styles() {
    return "<style>" +
      ":host{--ink:#132920;--green:#0f6048;--paper:#fff;--soft:#f1f6f3;--line:#dce4de;--muted:#62716a;display:block;color:var(--ink);font-family:Arial,Helvetica,sans-serif}" +
      ":host([data-omt-theme=dark]){--ink:#eef8f2;--green:#78dbb5;--paper:#14221d;--soft:#1d3028;--line:#365046;--muted:#a9bab2}" +
      "*{box-sizing:border-box}.card{overflow:hidden;border:1px solid var(--line);border-radius:16px;background:var(--paper);box-shadow:0 12px 35px rgba(19,41,32,.08)}" +
      "header{display:flex;justify-content:space-between;gap:20px;padding:20px 22px;background:var(--soft);border-bottom:1px solid var(--line)}.brand{display:block;margin-bottom:6px;color:var(--green);font-size:10px;font-weight:800;letter-spacing:.12em;text-transform:uppercase}.route{font-family:Georgia,serif;font-size:22px}.stamp{text-align:right;color:var(--muted);font-size:11px;line-height:1.5}.stamp b{display:block;color:var(--ink)}" +
      ".head,.row{display:grid;grid-template-columns:1.15fr .85fr 1fr .55fr;gap:14px;align-items:center;padding:13px 22px}.head{color:var(--muted);font-size:9px;font-weight:800;letter-spacing:.08em;text-transform:uppercase}.row{border-top:1px solid var(--line);font-size:12px}.row.xe{background:color-mix(in srgb,var(--green) 8%,var(--paper))}.provider{display:flex;align-items:center;gap:9px;font-weight:800}.mark{display:grid;place-items:center;width:32px;height:32px;border-radius:9px;background:var(--ink);color:var(--paper);font-size:8px}.tag{padding:4px 6px;border:1px solid var(--green);border-radius:999px;color:var(--green);font-size:7px;text-transform:uppercase}.number strong{display:block;font-size:14px}.number small,.provider small{display:block;margin-top:4px;color:var(--muted);font-size:9px;font-weight:400}.receipt{color:var(--green);font-size:10px;font-weight:800;text-decoration:underline;text-underline-offset:3px}.stale{opacity:.62}" +
      "footer{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:15px 22px;border-top:1px solid var(--line);background:var(--soft)}.nav{display:flex;gap:7px}.nav button{border:1px solid var(--line);border-radius:8px;background:var(--paper);color:var(--ink);padding:8px 10px;font:700 10px Arial;cursor:pointer}.nav button:disabled{cursor:default;opacity:.35}.source{color:var(--green);font-size:10px;font-weight:800;text-align:right;text-decoration:underline;text-underline-offset:3px}.empty,.error{padding:30px 22px;color:var(--muted);font-size:12px;line-height:1.6}.error a{color:var(--green);font-weight:800}" +
      "@media(max-width:620px){header{align-items:flex-start;flex-direction:column}.stamp{text-align:left}.head{display:none}.row{grid-template-columns:1fr 1fr}.row>a{grid-column:1/-1}.tag{display:none}footer{align-items:flex-start;flex-direction:column}.source{text-align:left}}@media(prefers-color-scheme:dark){:host([data-omt-theme=auto]){--ink:#eef8f2;--green:#78dbb5;--paper:#14221d;--soft:#1d3028;--line:#365046;--muted:#a9bab2}}" +
      "</style>";
  }

  function mark(provider) {
    return String(provider || "?").split(/\s+/).map(function (word) {
      return word.charAt(0);
    }).join("").slice(0, 3).toUpperCase();
  }

  function targetElement(target) {
    return typeof target === "string" ? document.querySelector(target) : target;
  }

  function mount(options) {
    options = options || {};
    var target = targetElement(options.target);
    var route = String(options.route || "").trim();
    if (!target) return Promise.reject(new Error("OMT Rates: target element not found"));
    if (!/^[a-z0-9-]+$/.test(route)) return Promise.reject(new Error("OMT Rates: invalid corridor route"));

    var apiBase = String(options.apiBase || "https://onlinemoneytransfer.co.uk").replace(/\/+$/, "");
    var history = Math.max(1, Math.min(30, Number(options.history) || 14));
    var limit = Math.max(1, Math.min(40, Number(options.limit) || 10));
    var theme = ["light", "dark", "auto"].indexOf(options.theme) >= 0 ? options.theme : "light";
    target.setAttribute("data-omt-theme", theme);
    var root = target.shadowRoot || target.attachShadow({ mode: "open" });
    root.innerHTML = styles() + '<div class="card"><div class="empty">Loading receipt-backed rates…</div></div>';

    return fetch(apiBase + "/api/v1/rates/" + encodeURIComponent(route) + "?history=" + history, {
      headers: { Accept: "application/json" },
    }).then(function (response) {
      if (!response.ok) throw new Error("Rates request returned " + response.status);
      return response.json();
    }).then(function (payload) {
      var snapshots = [payload.current].concat(payload.history || []);
      var index = 0;

      function render() {
        var view = snapshots[index] || { rates: [], capturedAt: null };
        var rows = (view.rates || []).slice(0, limit).map(function (rate) {
          var state = rate.status === "verified"
            ? "Verified bank-transfer quote"
            : rate.status === "stale"
              ? "Due another check"
              : "Calculator evidence only";
          var transferCase = money(rate.sourceAmount, rate.sourceCurrency) + " · " + rate.fundingMethod + " to " + rate.payoutMethod + (rate.promotion ? " · promotion, not ranked" : "");
          return '<div class="row ' + (rate.providerSlug === "xe" ? "xe " : "") + (rate.status === "stale" ? "stale" : "") + '">' +
            '<div class="provider"><span class="mark">' + escapeHtml(mark(rate.provider)) + '</span><span>' + escapeHtml(rate.provider) + "<small>" + escapeHtml(state + " · " + transferCase) + "</small></span>" + (rate.providerSlug === "xe" ? '<span class="tag">Best Rated</span>' : "") + "</div>" +
            '<div class="number"><strong>' + escapeHtml(Number(rate.exchangeRate).toLocaleString("en-GB", { maximumFractionDigits: 6 })) + '</strong><small>Fee ' + escapeHtml(money(rate.feeAmount, rate.feeCurrency)) + "</small></div>" +
            '<div class="number"><strong>' + escapeHtml(money(rate.recipientAmount, rate.recipientCurrency)) + '</strong><small>Recipient gets</small></div>' +
            '<a class="receipt" href="' + escapeHtml(rate.receiptUrl) + '" target="_blank" rel="noopener">Receipt ↗</a></div>';
        }).join("");
        var label = view.kind === "current" ? "Latest available per company" : "Stored comparison check";
        root.innerHTML = styles() + '<section class="card" aria-live="polite"><header><div><span class="brand">Online Money Transfer rates</span><strong class="route">' +
          escapeHtml(payload.corridor.fromCountry) + " → " + escapeHtml(payload.corridor.toCountry) + " · standard test " + escapeHtml(money(payload.corridor.standardTestAmount, payload.corridor.fromCurrency)) +
          '</strong></div><div class="stamp"><b>' + escapeHtml(label) + "</b>" + escapeHtml(checkedAt(view.capturedAt)) + "</div></header>" +
          (rows ? '<div class="head"><span>Company</span><span>Rate and fee</span><span>What arrives</span><span>Evidence</span></div>' + rows : '<div class="empty">No completed rates are stored for this check yet.</div>') +
          '<footer><div class="nav"><button type="button" data-newer' + (index === 0 ? " disabled" : "") + '>← Newer</button><button type="button" data-older' + (index >= snapshots.length - 1 ? " disabled" : "") + '>Older →</button></div>' +
          '<a class="source" href="' + escapeHtml(payload.corridor.url) + '" target="_blank" rel="noopener">Rates supplied by Online Money Transfer ↗</a></footer></section>';
        var newer = root.querySelector("[data-newer]");
        var older = root.querySelector("[data-older]");
        if (newer) newer.addEventListener("click", function () { if (index > 0) { index -= 1; render(); } });
        if (older) older.addEventListener("click", function () { if (index < snapshots.length - 1) { index += 1; render(); } });
      }

      render();
      return { element: target, data: payload };
    }).catch(function (error) {
      root.innerHTML = styles() + '<div class="card"><div class="error">The rate feed is temporarily unavailable. <a href="https://onlinemoneytransfer.co.uk/' + encodeURIComponent(route) + '/" target="_blank" rel="noopener">Open this corridor on OMT ↗</a></div></div>';
      throw error;
    });
  }

  window.OMTRates = { mount: mount, version: "1.0.0" };

  var script = document.currentScript;
  if (script && script.getAttribute("data-route")) {
    var target = document.getElementById(script.getAttribute("data-target"));
    if (!target) {
      target = document.createElement("div");
      script.parentNode.insertBefore(target, script);
    }
    mount({
      target: target,
      route: script.getAttribute("data-route"),
      apiBase: script.getAttribute("data-api-base") || new URL(script.src, document.baseURI).origin,
      history: script.getAttribute("data-history"),
      limit: script.getAttribute("data-limit"),
      theme: script.getAttribute("data-theme") || "light",
    }).catch(function () {});
  }
})();
