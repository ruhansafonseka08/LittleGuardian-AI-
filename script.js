// LittleGuardian AI landing page scripts: menu, room alert demo, waitlist form.
(function () {
  "use strict";

  // 1. Mobile menu
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("site-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(open));
    });
    nav.addEventListener("click", function (e) {
      if (e.target.closest("a")) {
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("is-open")) {
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.focus();
      }
    });
  }

  // 2. Footer year
  var year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());

  // 3. Room alert demo
  var slider = document.getElementById("room-temp");
  var limitInput = document.getElementById("limit");
  var out = document.getElementById("temp-out");
  var status = document.getElementById("temp-status");
  var detail = document.getElementById("temp-detail");
  var hubMini = document.getElementById("hub-mini");
  var meterFill = document.getElementById("meter-fill");
  var meterLimit = document.getElementById("meter-limit");

  function pct(value) {
    return Math.max(0, Math.min(100, (value - 16) / (36 - 16) * 100));
  }

  function updateDemo() {
    if (!slider || !limitInput) return;
    var temp = parseFloat(slider.value);
    var limit = parseFloat(limitInput.value);
    if (isNaN(limit)) limit = 24;
    var alert = temp > limit;
    out.textContent = temp.toFixed(1) + " \u00B0C";
    meterFill.style.width = pct(temp) + "%";
    meterLimit.style.left = "calc(" + pct(limit) + "% - 1px)";
    meterFill.classList.toggle("is-alert", alert);
    hubMini.classList.toggle("is-alert", alert);
    if (alert) {
      status.className = "status status--alert";
      status.textContent = "Above your limit";
      detail.textContent = "The hub shows a visual alert and sounds its buzzer, and the app sends you a notification.";
    } else {
      status.className = "status status--ok";
      status.textContent = "Within your limit";
      detail.textContent = "The hub light stays calm and no alert is sent.";
    }
  }
  if (slider && limitInput) {
    slider.addEventListener("input", updateDemo);
    limitInput.addEventListener("input", updateDemo);
    updateDemo();
  }

  // 4. Waitlist form
  // To collect real sign-ups, paste the URL of a form service here (for example a Formspree endpoint).
  // While this is empty the form runs in demo mode and keeps entries only in this browser.
  var FORM_ENDPOINT = "";

  var form = document.getElementById("waitlist-form");
  var msg = document.getElementById("form-msg");

  function setError(id, text) {
    var el = document.getElementById(id);
    if (el) el.textContent = text;
  }

  function showMessage(text) {
    msg.textContent = text;
    msg.hidden = false;
  }

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = form.elements.name.value.trim();
      var email = form.elements.email.value.trim();
      var consent = form.elements.consent.checked;
      var ok = true;

      setError("name-err", "");
      setError("email-err", "");
      setError("consent-err", "");
      msg.hidden = true;

      if (!name) { setError("name-err", "Enter your name."); ok = false; }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError("email-err", "Enter an email address like name@example.com."); ok = false; }
      if (!consent) { setError("consent-err", "Tick the box to agree before joining."); ok = false; }
      if (!ok) {
        var firstBad = form.querySelector(".error:not(:empty)");
        if (firstBad) {
          var field = firstBad.parentElement.querySelector("input");
          if (field) field.focus();
        }
        return;
      }

      var entry = {
        name: name,
        email: email,
        role: form.elements.role.value,
        language: form.elements.language.value,
        joined: new Date().toISOString()
      };

      if (FORM_ENDPOINT) {
        fetch(FORM_ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json", "Accept": "application/json" },
          body: JSON.stringify(entry)
        }).then(function (res) {
          if (!res.ok) throw new Error("Request failed");
          form.reset();
          showMessage("Thank you, " + name + ". You are on the waitlist.");
        }).catch(function () {
          showMessage("Something went wrong and your details were not sent. Please try again in a moment.");
        });
      } else {
        try {
          var list = JSON.parse(localStorage.getItem("lg-waitlist") || "[]");
          list.push(entry);
          localStorage.setItem("lg-waitlist", JSON.stringify(list));
        } catch (err) { /* storage may be unavailable */ }
        form.reset();
        showMessage("Demo mode: your sign-up was saved only on this device. The team has not received it yet.");
      }
    });
  }
})();
