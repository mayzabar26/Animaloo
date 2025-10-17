import { 
    loadHeaderFooter, 
    getImageUrl,
    getAnimalFacts,
    searchAnimals
} from './utils.mjs';


//Selectors
const mainContent = document.querySelector(".main-content");
let discoverRandomBtn;
let searchForm;
let searchInput;


//-----Function to display modal-----//
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


//-----Main function to process animal data-----//
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
    let imageUrl = await getImageUrl(animalName);
    //Display modal
    createAndShowModal({
        name: animalName,
        funFact: funFact,
        imageUrl: imageUrl,
    });
}


//-----Display list with results-----//
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


//-----Search specific details from animails-----//
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
    let imageUrl = await getImageUrl(animalNameDisplay);

    //Display modal
    createAndShowModal({
        name: animalNameDisplay,
        funFact: funFact,
        imageUrl: imageUrl,
    });
}


//-----New handler to deal with search form submission-----//
async function handleSearch(event) {
    event.preventDefault(); //Will prevent page reload
    
    const query = searchInput.value.trim();
    if (!query) return;

    //API Search 
    const { data: animals, error } = await searchAnimals(query);
    displaySearchResults(animals, query, error);
}


//-----Function to display the visit message and the time between visits-----//
function displayVisitMessage() {
    const lastVisit = localStorage.getItem('lastVisit');
    const currentVisit = Date.now(); // Get the current timestamp

    //If it's the user's first visit
    if (!lastVisit) {
        document.querySelector('#message-content p').textContent = 'Welcome! Let us know if you have any questions.';
    } else {
        //Calculate the time difference in milliseconds
        const timeDiff = currentVisit - lastVisit;
        const oneDay = 24 * 60 * 60 * 1000; //One day in milliseconds
        const daysAgo = Math.floor(timeDiff / oneDay);

        //Display appropriate message based on the time since the last visit
        if (daysAgo < 1) {
            document.querySelector('#message-content p').textContent = 'Back so soon! Awesome!';
        } else {
            const dayText = daysAgo === 1 ? 'day' : 'days';
            document.querySelector('#message-content p').textContent = `You last visited ${daysAgo} ${dayText} ago.`;
        }
    }

    //Store the current visit timestamp in localStorage
    localStorage.setItem('lastVisit', currentVisit);
}


//-----Function to get and update the visitor count-----//
function updateVisitorCount() {
    let visitorCount = localStorage.getItem('visitorCount');

    //If no visitor count is stored, initialize it
    if (!visitorCount) {
        visitorCount = 0;
    }

    //Increment the visitor count
    visitorCount = parseInt(visitorCount) + 1;

    //Store the updated visitor count
    localStorage.setItem('visitorCount', visitorCount);

    //Display the visitor count
    const visitorCountElement = document.getElementById('visitor-count');
    visitorCountElement.textContent = `Visitors: ${visitorCount}`;
}


//-----Starting listeners-----//
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

    //Implementing LocalStorage
    displayVisitMessage();
    updateVisitorCount();

    window.addEventListener('scroll', handleScrollVisibility);
    handleScrollVisibility();
});


//-----Visitor message on the screen-----//
let messageShow = false;

function handleScrollVisibility() {
    //Caculate scroll position
    const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrolled = window.scrollY;

    //Define margin
    const margin = 500;

    //Message element
    const messageContent = document.getElementById('message-content');

    if(scrolled > scrollableHeight - margin && !messageShow) {
        messageContent.style.display = 'block';
        displayVisitMessage();

        messageShow = true;

        setTimeout(() => {
            messageContent.style.display = 'none';
        }, 4000);
    }
}