let clickCount = 0;

const countryInput = document.getElementById('country');
const countryCodeSelect = document.getElementById('countryCode');
const myForm = document.getElementById('form');
const modal = document.getElementById('form-feedback-modal');
const clicksInfo = document.getElementById('click-count');
const vatUECheckbox = document.getElementById('vatUE');
const vatNumberInput = document.getElementById('vatNumber');

function handleClick() {
    clickCount++;
    clicksInfo.innerText = clickCount;
}

async function fetchAndFillCountries() {
    try {
        const response = await fetch('https://restcountries.com/v3.1/all');
        if (!response.ok) {
            throw new Error('Błąd pobierania danych');
        }
        const data = await response.json();
        const countries = data.map(country => country.name.common);
        countryInput.innerHTML = countries.map(country => `<option value="${country}">${country}</option>`).join('');
        countryInput.addEventListener('input', filterCountries.bind(null, countries));
    } catch (error) {
        console.error('Wystąpił błąd:', error);
    }
}

function filterCountries(countries, event) {
    const value = event.target.value.toLowerCase();
    const filteredCountries = countries.filter(country => country.toLowerCase().startsWith(value));
    countryInput.innerHTML = filteredCountries.map(country => `<option value="${country}">${country}</option>`).join('');
}

async function setCountryByIP() {
    try {
        const response = await fetch('https://get.geojs.io/v1/ip/geo.json');
        const data = await response.json();
        const country = data.country;
        countryInput.value = country;
        await fetchAndFillCountryCodes(country); // This will also select the country code
    } catch (error) {
        console.error('Błąd pobierania danych z serwera GeoJS:', error);
    }
}

async function fetchAndFillCountryCodes(selectedCountry) {
    const response = await fetch('https://restcountries.com/v3.1/name/' + encodeURIComponent(selectedCountry));
    const data = await response.json();
    const countryData = data.find(country => country.name.common === selectedCountry);
    if (countryData) {
        countryCodeSelect.value = countryData.idd.root + countryData.idd.suffixes[0];
    }
}

countryInput.addEventListener('change', async (event) => {
    const selectedCountry = event.target.value;
    await fetchAndFillCountryCodes(selectedCountry);
});

vatUECheckbox.addEventListener('change', (event) => {
    if (event.target.checked) {
        // Assuming the prefix for EU VAT numbers is "EU-", this can be adjusted as needed
        vatNumberInput.value = 'EU-' + vatNumberInput.value;
    }
});

vatUECheckbox.addEventListener('change', (event) => {
    const vatNumberGroup = document.getElementById('vatNumberGroup');
    const invoiceDataGroup = document.getElementById('invoiceDataGroup');
    if (event.target.checked) {
        vatNumberGroup.classList.remove('d-none');
        invoiceDataGroup.classList.remove('d-none');
        // Tu możemy dodać logikę dodawania odpowiedniego przedrostka do VAT.
    } else {
        vatNumberGroup.classList.add('d-none');
        invoiceDataGroup.classList.add('d-none');
        vatNumberInput.value = ''; // Clear the input when unchecked
    }
});


(() => {
    // nasłuchiwania na zdarzenie kliknięcia myszką
    document.addEventListener('click', handleClick);

    fetchAndFillCountries();
    setCountryByIP();
})();
