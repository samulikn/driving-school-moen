const language = document.getElementById("langToggle");
let isNL = true;
let currentLang = isNL ? "nl" : "en"; //change on local storage

let translation = {};
let prices = {};
let lessPrice;
let pracExamPrice;
let ttExamPrice;

language.addEventListener("click", () => {
  isNL = !isNL;

  const thumb = document.getElementById("toggleThumb");
  const langNL = document.getElementById("langNL");
  const langEN = document.getElementById("langEN");

  if (isNL) {
    thumb.classList.remove("translate-x-9");
    langNL.classList.add("text-cayan");
    langEN.classList.remove("text-cayan");
  } else {
    thumb.classList.add("translate-x-9");
    langEN.classList.add("text-cayan");
    langNL.classList.remove("text-cayan");
  }

  currentLang = isNL ? "nl" : "en";
  loadLanguage(currentLang);
//   updateDiscount();
});

async function loadLanguage(lang) {
  try {
    const response = await fetch(`src/i18n/${lang}.json`);
    translation = await response.json();

    await applyTranslation();
    updateDiscount();

  } catch (err) {
    console.log(err);
  }
}

async function getPrice() {
  try {
    const response = await fetch("src/data/price.json");
    prices = await response.json();

    lessPrice = prices.oneLess;

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

function updateTranslationText(key, param = {}) {
    const value = key.split(".").reduce((obj, i) => obj?.[i], translation);

    if (!value) return key;

    return Object.entries(param).reduce((text, [k, v]) => 
        text.replace(`{${k}}`,v)
    , value);
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

const CalcDiscount = (
  nLess,
  packagePrice,
  pracExamPrice = 0,
  ttExamPrice = 0,
) => {
  const discountCount =
    nLess * lessPrice + pracExamPrice + ttExamPrice - packagePrice;

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
    const discount30less = CalcDiscount(30, prices.thirtyLess, prices.practicalExam);
    const discount40less = CalcDiscount(40, prices.thirtyLess, prices.practicalExam);
    const discount45Less = CalcDiscount(45, prices.fortyFiveLess, prices.practicalExam, prices.ttExam);

    document.getElementById("5-lesson-discount")
    .textContent = updateTranslationText("lesson.five_lesson.discount", { amount: discount5less });
    document.getElementById("30-lesson-discount")
    .textContent = updateTranslationText("lesson.thirty_lesson.discount", { amount: discount30less });
    document.getElementById("40-lesson-discount")
    .textContent = updateTranslationText("lesson.forty_lesson.discount", { amount: discount40less });
    document.getElementById("45-lesson-discount")
    .textContent = updateTranslationText("lesson.fortyFive_lesson.discount", { amount: discount45Less });
}  

async function init () {
    await loadLanguage(currentLang);
    await getPrice();
    updateDiscount();
}

init();
