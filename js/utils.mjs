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