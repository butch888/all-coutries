const app = document.getElementById('app');
const inputSearch = document.getElementById('input-search');
const alphabetContainer = document.getElementById('alphabet-container');
const allCountriesBtn = document.getElementById('all-countries-btn');
const countryModal = document.getElementById('country-modal');
const countryDetails = document.getElementById('country-details');
const closeBtn = document.querySelector('.close-btn');
const counter = document.getElementById('counter');

let countriesData = [];
let activeLetter = null;
let alphabetLetters = {};

// Функция для создания алфавита
function createAlphabet() {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  
  alphabet.forEach(letter => {
    const letterElement = document.createElement('span');
    letterElement.textContent = letter;
    letterElement.classList.add('alphabet-letter');
    letterElement.dataset.letter = letter;
    
    alphabetLetters[letter] = letterElement;
    
    letterElement.addEventListener('click', () => {
      setActiveLetter(letter);
      inputSearch.value = letter;
      filterByLetter(letter);
    });
    alphabetContainer.appendChild(letterElement);
  });
}

// Функция для установки активной буквы
function setActiveLetter(letter) {
  // Сбрасываем предыдущую активную букву
  if (activeLetter) {
    activeLetter.classList.remove('active');
  }
  
  // Устанавливаем новую активную букву
  if (letter && alphabetLetters[letter]) {
    alphabetLetters[letter].classList.add('active');
    activeLetter = alphabetLetters[letter];
  } else {
    activeLetter = null;
  }
}

// Функция для сброса активной буквы
function resetActiveLetter() {
  if (activeLetter) {
    activeLetter.classList.remove('active');
    activeLetter = null;
  }
}

// Функция для обновления активной буквы на основе ввода
function updateActiveLetterFromInput(searchTerm) {
  if (searchTerm.trim() === '') {
    resetActiveLetter();
    return;
  }
  
  const firstLetter = searchTerm.charAt(0).toUpperCase();
  
  if (alphabetLetters[firstLetter]) {
    setActiveLetter(firstLetter);
  } else {
    resetActiveLetter();
  }
}

// Функция для фильтрации по букве
function filterByLetter(letter) {
  const filteredCountries = countriesData.filter(country => 
    country.name.charAt(0).toUpperCase() === letter
  );
  displayCountries(filteredCountries);
}

// Функция для отображения стран
function displayCountries(countries) {
  app.innerHTML = '';

  if (countries.length === 0) {
    app.innerHTML = '<div class="error">No countries found</div>';
    counter.textContent = `All countries: 0`;
    // Сбрасываем активную букву когда нет стран
    resetActiveLetter();
    return;
  }

  countries.forEach((country) => {
    counter.textContent = `All countries: ${countries.length}`;
    const countryElement = document.createElement('div');
    countryElement.classList.add('country-card');
    countryElement.innerHTML = `
      <h2>${country.name}</h2>
      <p><strong>Capital:</strong> ${country.capital || 'No data'}</p>
      <p><strong>Region:</strong> ${country.region || 'No data'}</p>
      <p><strong>Population:</strong> ${country.population ? country.population.toLocaleString() : 'No data'}</p>
      <img src="${country.flag}" alt="${country.name}" class="country-flag">
    `;
    
    countryElement.addEventListener('click', () => {
      showCountryDetails(country);
    });
    
    app.appendChild(countryElement);
  });
}

// Функция для показа деталей страны
function showCountryDetails(country) {
  countryDetails.innerHTML = `
    <div class="country-detail-item">
      <h2>${country.name}</h2>
      <img src="${country.flag}" alt="${country.name}" class="detail-flag">
    </div>
    <div class="country-detail-item">
      <h3>Basic Information</h3>
      <p><strong>Capital:</strong> ${country.capital || 'No data'}</p>
      <p><strong>Region:</strong> ${country.region || 'No data'}</p>
      <p><strong>Subregion:</strong> ${country.subregion || 'No data'}</p>
      <p><strong>Population:</strong> ${country.population ? country.population.toLocaleString() : 'No data'}</p>
      <p><strong>Area:</strong> ${country.area ? `${country.area.toLocaleString()} km²` : 'No data'}</p>
    </div>
    <div class="country-detail-item">
      <h3>Languages</h3>
      <p>${country.languages ? country.languages.map(language => language.name).join(', ') : 'No data'}</p>
    </div>
    <div class="country-detail-item">
      <h3>Currencies</h3>
      <p>${country.currencies ? country.currencies.map(currency => `${currency.name} (${currency.code})`).join(', ') : 'No data'}</p>
    </div>
    <div class="country-detail-item">
      <h3>Timezones</h3>
      <p>${country.timezones ? country.timezones.join(', ') : 'No data'}</p>
    </div>
  `;
  
  countryModal.style.display = 'block';
  document.body.style.overflow = 'hidden';
}

// Функция для закрытия модального окна
function closeModal() {
  countryModal.style.display = 'none';
  document.body.style.overflow = 'auto';
}

// Функция для фильтрации стран
function filterCountries(searchTerm) {
  // Обновляем активную букву на основе ввода
  updateActiveLetterFromInput(searchTerm);
  
  const filteredCountries = countriesData.filter(country => 
    country.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  displayCountries(filteredCountries);
}

// Обработчики событий
inputSearch.addEventListener('input', (e) => {
  filterCountries(e.target.value);
});

allCountriesBtn.addEventListener('click', () => {
  resetActiveLetter();
  displayCountries(countriesData);
  inputSearch.value = '';
});

closeBtn.addEventListener('click', closeModal);

countryModal.addEventListener('click', (e) => {
  if (e.target === countryModal) {
    closeModal();
  }
});

// Закрытие модального окна по ESC
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && countryModal.style.display === 'block') {
    closeModal();
  }
});

async function fetchCountries() {
  try {
    app.innerHTML = '<div class="loading">Loading countries...</div>';
    
    const proxyUrl = 'https://corsproxy.io/';
    const targetUrl = 'https://www.apicountries.com/countries';
    const response = await fetch(proxyUrl + targetUrl);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Countries data:', data);
    
    countriesData = data;
    createAlphabet();
    displayCountries(countriesData);
    
  } catch (error) {
    console.error('Error fetching the country data:', error);
    app.innerHTML = '<div class="error">Error loading countries data. Please try again later.</div>';
  }
}

fetchCountries();