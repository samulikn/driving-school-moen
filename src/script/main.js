const langToggle = document.getElementById("langToggle");
const thumb = document.getElementById("toggleThumb");
const langNL = document.getElementById("langNL");
const langEN = document.getElementById("langEN");
const sections = document.querySelectorAll("section");
const navButtons = document.querySelectorAll(".nav-btn");
const defaultdLang = "nl";
const secondaryLang = "en";

let currentLang = localStorage.getItem("lang") || defaultdLang;

let translation = {};
let prices = {};
let lesPrice;
let pracExamPrice;
let ttExamPrice;

const setLang = (lang) => {
  localStorage.setItem("lang", lang);
  document.documentElement.lang = lang;
};

function setThumb(lang) {
  if (lang === "nl") {
    thumb.classList.remove("translate-x-9");
    langNL.classList.add("text-cyan");
    langEN.classList.remove("text-cyan");
  } else {
    thumb.classList.add("translate-x-9");
    langEN.classList.add("text-cyan");
    langNL.classList.remove("text-cyan");
  }
}

async function loadLanguage(lang) {
  try {
    const response = await fetch(`src/i18n/${lang}.json`);
    translation = await response.json();

    await applyTranslation();
    updateDiscount();
  } catch (err) {
    console.err(`Couldn't load language ${err}`);
  }
}

async function getPrice() {
  try {
    const response = await fetch("src/data/price.json");
    prices = await response.json();

    lesPrice = prices.oneLess;

    Object.entries(prices).forEach(([key, value]) => {
      const price = new Intl.NumberFormat("nl-NL", {
        style: "currency",
        currency: "EUR",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(value);

      updateElement(key, price);
    });
  } catch (err) {
    console.error(`Couldn't get prices ${err}`);
  }
}

async function loadContacts() {
  try {
    const response = await fetch("src/data/contact.json");
    const contacts = await response.json();

    Object.entries(contacts).forEach(([key, value]) => {
      updateElement(key, value);
    });

    const phoneLink = `tel:${contacts.tel}`;
    const watsappLink = `https://wa.me/${contacts.tel.replace("+", "")}`;
    const mailLink = `mailto:${contacts.email}`;

    updateLink("phoneLink", phoneLink);
    updateLink("whatsappLink", watsappLink);
    updateLink("mailLink", mailLink);
  } catch (err) {
    console.err(`Couldn't load contacts info ${err}`);
  }
}

function updateTranslationText(key, param = {}) {
  const value = key.split(".").reduce((obj, i) => obj?.[i], translation);

  if (!value) return key;

  return Object.entries(param).reduce(
    (text, [k, v]) => text.replace(`{${k}}`, v),
    value,
  );
}

function applyTranslation() {
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.dataset.i18n;
    el.textContent = updateTranslationText(key);
  });
}

function updateElement(elementId, text) {
  const element = document.getElementById(elementId);
  if (!element) {
    // console.log(`Element with id ${elementId} not found.`);
    return;
  }
  element.textContent = "";
  element.append(text);
}

function updateLink(elementId, text) {
  const link = document.getElementById(elementId);
  if (!link) {
    // console.log(`Link with id ${elementId} not found.`);
    return;
  }
  link.href = text;
}

const CalcDiscount = (
  nLes,
  packagePrice,
  pracExamPrice = 0,
  ttExamPrice = 0,
) => {
  const discountCount =
    nLes * lesPrice + pracExamPrice + ttExamPrice - packagePrice;

  return new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(discountCount);
};

function updateDiscount() {
  //update discount fields
  const discount5less = CalcDiscount(5, prices.fiveLess);
  const discount30less = CalcDiscount(
    30,
    prices.thirtyLess,
    prices.practicalExam,
  );
  const discount40less = CalcDiscount(
    40,
    prices.fortyLess,
    prices.practicalExam,
  );
  const discount45Less = CalcDiscount(
    45,
    prices.fortyFiveLess,
    prices.practicalExam,
    prices.ttExam,
  );

  document.getElementById("5-lesson-discount").textContent =
    updateTranslationText("lesson.five_lesson.discount", {
      amount: discount5less,
    });
  document.getElementById("30-lesson-discount").textContent =
    updateTranslationText("lesson.thirty_lesson.discount", {
      amount: discount30less,
    });
  document.getElementById("40-lesson-discount").textContent =
    updateTranslationText("lesson.forty_lesson.discount", {
      amount: discount40less,
    });
  document.getElementById("45-lesson-discount").textContent =
    updateTranslationText("lesson.fortyFive_lesson.discount", {
      amount: discount45Less,
    });
}

async function init() {
  if (!localStorage.getItem("lang")) setLang(currentLang);

  setThumb(currentLang);
  await loadLanguage(currentLang);
  await getPrice();
  updateDiscount();
  loadContacts();
}

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const elemId = entry.target.id;

        navButtons.forEach((btn) => {
          btn.classList.toggle("nav-btn-active", btn.dataset.target === elemId);
        });
      }
    });
  },
  {
    threshold: 0.3,
  },
);

sections.forEach(section => observer.observe(section));

langToggle.addEventListener("click", () => {
  currentLang = currentLang === defaultdLang ? secondaryLang : defaultdLang;
  setLang(currentLang);
  setThumb(currentLang);
  loadLanguage(currentLang);
});

init();
