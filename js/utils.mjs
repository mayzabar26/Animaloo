//Template function
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

//Loading header and footer from partials
export async function loadHeaderFooter(path) {
  const headerTemplate = await loadTemplate(`${path}/header.html`);
  const footerTemplate = await loadTemplate(`${path}/footer.html`);

  //Getting main-header and main-footer from the header.html and footer.html
  const headerElement = document.getElementById('main-header');
  const footerElement = document.getElementById('main-footer');

  renderWithTemplate(headerTemplate, headerElement);
  renderWithTemplate(footerTemplate, footerElement);
}

//Search data from APIs
export async function getJSON(url, options = {}) {
  try {
    const response = await fetch(url, options);

    if (!response.ok) {
      throw new error(`HTTP Error! Status: ${response.status}. Verify if Ninjas API key is correct.`);
    }

    return await response.json();
  } catch (e) {
    console.error("Failed to fetch data from API:", e);
    return { error: true, message: e.message };
  }
}