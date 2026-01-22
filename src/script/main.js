const language = document.getElementById("langToggle");
let isNL = true;
let currentLang = isNL ? "nl" : "en"; //change on local storage

language.addEventListener("click", () => {
    isNL = !isNL;

    const thumb = document.getElementById("toggleThumb");
    const langNL = document.getElementById("langNL");
    const langEN = document.getElementById("langEN");

    if (isNL) {
      thumb.classList.remove("translate-x-9");
      langNL.classList.add("text-cayan");
      langEN.classList.remove("text-cayan")
    } else {
      thumb.classList.add("translate-x-9");
      langEN.classList.add("text-cayan");
      langNL.classList.remove("text-cayan");
    }

    currentLang = isNL ? "nl" : "en"
    loadLanguage(currentLang);
})

async function loadLanguage(lang) {
    try {
        const response = await fetch(`src/i18n/${lang}.json`);
        const data = await response.json();

        if (data) {
            const elements = document.querySelectorAll("[data-i18n]").forEach(el => {
                const key = el.dataset.i18n;
                const value = key.split('.').reduce((obj, k) => obj?.[k], data);

                if (value) el.textContent = value;
            })
        }
    } catch (err) {
        console.log(err);
    }

}

loadLanguage(currentLang);