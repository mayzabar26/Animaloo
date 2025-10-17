//-----Template function-----//
export async function loadTemplate(path) {
  const response = await fetch(path);
  const template = await response.text();
  return template;
} 


export function renderWithTemplate(template, parentElement, data, callback) {
  parentElement.innerHTML = template;
  if(callback) {
    callback(data);
  }
}


//-----Loading header and footer from partials-----//
export async function loadHeaderFooter(path) {
  return new Promise(async (resolve, reject) => {
    try {
      const headerTemplate = await loadTemplate(`${path}/header.html`);
      const footerTemplate = await loadTemplate(`${path}/footer.html`);

      //Getting main-header and main-footer from the header.html and footer.html
      const headerElement = document.getElementById('main-header');
      const footerElement = document.getElementById('main-footer');

      renderWithTemplate(headerTemplate, headerElement);
      renderWithTemplate(footerTemplate, footerElement);

      resolve();
    } catch (e) {
      reject(e);
    }
  });
}


//-----Search data from APIs-----//
export async function getJSON(url, options = {}) {
  try {
    const response = await fetch(url, options);

    if (!response.ok) {
      throw new Error(`HTTP Error! Status: ${response.status}. Verify if Ninjas API key is correct.`);
    }

    return await response.json();
  } catch (e) {
    console.error("Failed to fetch data from API:", e);
    return { error: true, message: e.message };
  }
}


//-----Keys and Endpoints for external APIs-----//
const UNSPLASH_ACCESS_KEY = '5BJ3aV2CiUHxA3Ghe8YlP_5LtnLd6XTw0NlwWe6nv2k'; 
const API_NINJAS_FACTS_KEY = 'cu+unGV5q5kwfJS+N+RoCw==nG81P4zlgMyeLqZI'; 

const UNSPLASH_API_URL = 'https://api.unsplash.com/search/photos';
const API_NINJAS_URL = 'https://api.api-ninjas.com/v1/animals';


//-----Image search on unsplash-----//
export async function getImageUrl(query) {
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

//-----Function to discover random animal on Ninjas API-----//
export async function getAnimalFacts() {
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


//-----Search results from user-----//
export async function searchAnimals(query) {
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