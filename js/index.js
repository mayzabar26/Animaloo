//Load header and footer from partils
import { loadHeaderFooter, getJSON } from './utils.mjs';

document.addEventListener('DOMContentLoaded', () => {
    loadHeaderFooter('./partials');
});


//Event listener from 'DISCOVER RANDOM ANIMAL' button
const UNSPLASH_ACCESS_KEY = '5BJ3aV2CiUHxA3Ghe8YlP_5LtnLd6XTw0NlwWe6nv2k';
const API_NINJAS_FACTS_KEY = 'cu+unGV5q5kwfJS+N+RoCw==nG81P4zlgMyeLqZI';

const UNSPLASH_API_URL = 'https://api.unsplash.com/search/photos';
const API_NINJAS_URL = 'https://api.api-ninjas.com/v1/animals';

//Selectors
const discoverRandomBtn = document.getElementById("discoverRandomBtn");
const mainContent = document.querySelector(".main-content");

//Function to display modal
function createAndShowModal(animalData) {

    //Variables related to info that will be displayed
    const name = animalData.name;
    const funFact = animalData.funFact;
    const imageUrl = animalData.imageUrl || "images/placeholder-animal.png";

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
    
    //Insert modal 
    mainContent.insertAdjacentHTML("afterbegin", modalHTML);

    //Adding event listener
    const modal = document.getElementById("animalModal");
    modal.querySelector(".close-btn").addEventListener('click', () => modal.remove());
    
    //Closes when clicking outside the modal
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

//Function to search random animal on Ninjas API.
async function getAnimalFacts() {
    const searchTerms = [
        "cat", "dog", "bird", "fish", "snake", "frog", "lion", "bear", 
        "elephant", "monkey", "wolf", "fox", "deer", "shark", "whale"
    ];
    
    const randomTermIndex = Math.floor(Math.random() *searchTerms.length);
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
        return { error: true, message: "No data or API error. (Check key or daily limit.)" };
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

//Add listener to the button
if (discoverRandomBtn) {
    discoverRandomBtn.addEventListener('click', discoverRandomAnimal);
};