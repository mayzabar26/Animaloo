import { loadHeaderFooter, getJSON } from './utils.mjs';


//Keys and Endpoints
const UNSPLASH_ACCESS_KEY = '5BJ3aV2CiUHxA3Ghe8YlP_5LtnLd6XTw0NlwWe6nv2k';
const API_NINJAS_FACTS_KEY = 'cu+unGV5q5kwfJS+N+RoCw==nG81P4zlgMyeLqZI';

const UNSPLASH_API_URL = 'https://api.unsplash.com/search/photos';
const API_NINJAS_URL = 'https://api.api-ninjas.com/v1/animals';


//Selectors
const mainContent = document.querySelector(".main-content");
let discoverRandomBtn;
let searchForm;
let searchInput;


//Image search on unsplash
async function getImageUrl(query) {
    let imageUrl = "https://via.placeholder.com/250?text=Animaloo+Image"; 
    try {
        const unsplashQuery = `${UNSPLASH_API_URL}?query=${query}&client_id=${UNSPLASH_ACCESS_KEY}&per_page=1`;
        const unsplashData = await getJSON(unsplashQuery);

        if (unsplashData && unsplashData.results && unsplashData.results.length > 0) {
            imageUrl = unsplashData.results[0].urls.regular;
        }
    } catch (e) {
    }
    return imageUrl;
}


//Function to display modal
function createAndShowModal(animalData) {
    //Removes any existing modal
    const existingModal = document.getElementById("animalModal");
    if (existingModal) existingModal.remove();

    //Variables related to info that will be displayed
    const name = animalData.name;
    const funFact = animalData.funFact;
    const imageUrl = animalData.imageUrl || "https://via.placeholder.com/600x400?text=Animaloo+Details";

    //HTML structure
    const modalHTML = `
        <div class="modal-overlay" id="animalModal">
            <div class="modal-content">
                <button class="close-btn">&times;</button>
                <h2>${name}</h2>
                <div class="modal-image-container">
                    <img src="${imageUrl}" alt="${name}" loading="lazy">
                </div>
                
                <h3>Fun Fact:</h3>
                <p>${funFact}</p>
            </div>
        </div>
    `;
    
    //Insert modal in the body of the page
    document.body.insertAdjacentHTML("beforeend", modalHTML);

    //Adding event listener to close modal
    const modal = document.getElementById("animalModal");
    modal.querySelector(".close-btn").addEventListener('click', () => modal.remove());
    
    //Closes when clicking outside the modal
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
}


//Function to discover random animal on Ninjas API.
async function getAnimalFacts() {
    const searchTerms = [
        "cat", "dog", "bird", "fish", "snake", "frog", "lion", "bear", 
        "elephant", "monkey", "wolf", "fox", "deer", "shark", "whale"
    ];
    
    const randomTermIndex = Math.floor(Math.random() * searchTerms.length);
    const searchTerm = searchTerms[randomTermIndex];

    const url = `${API_NINJAS_URL}?name=${searchTerm}`; 
    
    const options = {
        method: 'GET',
        headers: {
            'X-Api-Key': API_NINJAS_FACTS_KEY
        }
    };

    const data = await getJSON(url, options);
    if (data.error || !data || data.length === 0) {
        return { error: true, message: `No data or API error for '${searchTerm}'. (Check key or daily limit.)` };
    }

    const randomIndex = Math.floor(Math.random() * data.length);
    return data[randomIndex];
}


//Main function to process animal data
async function discoverRandomAnimal() {
    const animalData = await getAnimalFacts();

    if (animalData.error) {
        alert(`Unable to load animal information. Please try again. ${animalData.message}`);
        return;
    }

    //Basic fun Fact info
    const animalName = animalData.name;
    const characteristics = animalData.characteristics;
    const funFact = `Habitat: ${characteristics.location || 'Not informed'} | Diet: ${characteristics.diet || 'Not informed'} | Life expectancy: ${characteristics.slogan || 'Not informed'}`;

    //Search image from UNSPLASH
    let imageUrl = "";
    try {
        const unsplashQuery = `${UNSPLASH_API_URL}?query=${animalName}&client_id=${UNSPLASH_ACCESS_KEY}&per_page=1`;
        const unsplashData = await getJSON(unsplashQuery);

        if (unsplashData.results && unsplashData.results.length > 0) {
            imageUrl = unsplashData.results[0].urls.regular;
        }
    } catch (e) {
        console.warn("Failed to load image from Unsplash. Using placeholder.");
    }

    //Display modal
    createAndShowModal({
        name: animalName,
        funFact: funFact,
        imageUrl: imageUrl,
    });
}


//Search results from user
async function searchAnimals(query) {
    if(!query) return { data: [], error: null };

    const url = `${API_NINJAS_URL}?name=${encodeURIComponent(query)}`;

    const options = {
        method: 'GET',
        headers: {
            'X-Api-Key': API_NINJAS_FACTS_KEY
        }
    };

    const data = await getJSON(url, options);
    if (data.error || !data || data.length === 0) {
        return { data: [], error: data.error ? data.message : `No animals found for "${query}".`};
    }
    return { data: data, error: null };
}

//Display list with results
async function displaySearchResults(animals, query, errorMessage) {
    //Cleans main content
    mainContent.innerHTML = '';

    let htmlContent = '';

    //Display search
    if(errorMessage) {
        htmlContent = `<h2 class="search-status-error">Search Error: ${errorMessage}</h2>`; 
        mainContent.innerHTML = htmlContent;
        return;
    } 
    
    if (animals.length > 0) {
        const imagePromises = animals.map(animal => getImageUrl(animal.name));
        const imageUrls = await Promise.all(imagePromises);

        const mainTitle = query.charAt(0).toUpperCase() + query.slice(1);

        htmlContent += `<h2 class="search-status-success">${mainTitle}</h2>`;
        htmlContent += `<p class="search-count-text">${animals.length} results found for "${query}"</p>`;

        //Looping through animals and creating cards
        htmlContent += '<div class="animal-catalog-results">';

        animals.forEach((animal, index) => {
            const cardImageUrl = imageUrls[index]; 
            htmlContent += `
                <div class="animal-card">
                    <div class="animal-image-preview" data-animal-name="${animal.name}">
                        <img src="${cardImageUrl}" alt="${animal.name} - Click to see details" loading="lazy">
                    </div>
                    
                    <h3>${animal.name}</h3>
                </div>
            `;
        });

        htmlContent += '</div>';
    } else {
        htmlContent = `<h2 class="search-status-error">No results found for your search.</h2>`;
    }

    //Add content and listeners
    mainContent.innerHTML = htmlContent;

    //Add listener to cards to open modal
    document.querySelectorAll('.animal-image-preview').forEach(div => {
        div.addEventListener('click', (e) => {
            const targetDiv = e.currentTarget;
            const specificAnimalName = targetDiv.getAttribute('data-animal-name');

            displaySpecificAnimalDetails(specificAnimalName);
        });
    });
}


//Search specific details from animails
async function displaySpecificAnimalDetails(animalName) {
    //Specific search and returns animal
    const { data: animals, error } = await searchAnimals(animalName);
    if (error || animals.length === 0) {
        alert(`Unable to load details of ${animalName}.`);
        return;
    }

    //Using the first specific search result
    const animalData = animals[0];

    const animalNameDisplay = animalData.name;
    const characteristics = animalData.characteristics;
    const funFact = `Habitat: ${characteristics.location || 'Not informed'} | Diet: ${characteristics.diet || 'Not informed'} | Life expectancy: ${characteristics.slogan || 'Not informed'}`;

    //Search image
    let imageUrl = "";
    try {
        const unsplashQuery = `${UNSPLASH_API_URL}?query=${animalNameDisplay}&client_id=${UNSPLASH_ACCESS_KEY}&per_page=1`;
        const unsplashData = await getJSON(unsplashQuery);

        if (unsplashData.results && unsplashData.results.length > 0) {
            imageUrl = unsplashData.results[0].urls.regular;
        }
    } catch (e) {
        console.warn("Failed to load image from Unsplash. Using placeholder.");
    }

    //Display modal
    createAndShowModal({
        name: animalNameDisplay,
        funFact: funFact,
        imageUrl: imageUrl,
    });
}

//New handler to deal with search form submission 
async function handleSearch(event) {
    event.preventDefault(); //Will prevent page reload
    
    const query = searchInput.value.trim();
    if (!query) return;

    //API Search 
    const { data: animals, error } = await searchAnimals(query);
    displaySearchResults(animals, query, error);
}


//Starting listeners
document.addEventListener('DOMContentLoaded', async () => {
    try {
        await loadHeaderFooter('./partials');
    } catch (e) {
        console.error("Failed to load header/footer partials. Check paths in utils.mjs:", e);
    }

    //Connecting listeners
    searchForm = document.getElementById("search-form");
    searchInput = document.getElementById("search-input");

    discoverRandomBtn = document.getElementById("discoverRandomBtn");

    if (searchForm) {
        searchForm.addEventListener('submit', handleSearch);
    } else {
        console.error("Search form (ID: search-form) not found. Check header.html.");
    }

    if (discoverRandomBtn) {
        discoverRandomBtn.addEventListener('click', discoverRandomAnimal);
    } else {
         console.warn("Random button (ID: discoverRandomBtn) not found in the Home section.");
    }
});












