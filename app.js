const moviesRef = firebase.database().ref("peliculas");
const apiKey = '😉😉TU TOKEN'

//CRUD
function addMovie (data){
    return moviesRef.push(data)
}

function deleteMovie (id){
    return moviesRef.child(id).remove()
}

function updateMovie (id, data){
    return moviesRef.child(id).set(data)
}

/**
 * getMovieDetails - retrieves the movie details from the data base by ID
 * @param {String} id - the movie ID
 * @return {Object} The movie deatils if ID exists in DB, an empty object if it
 * does not
 */
async function getMovieDetails (id) {
  const movieDetails = await moviesRef.child(id).once("value");
  return movieDetails && movieDetails.val() || {};
}


// AJAX
function getMovieData (title) {
    const url = `http://www.omdbapi.com/?t=${title}&apikey=${apiKey}`
    return fetch(url).then(res => res.json())
}


// Selectores & Polyfill
const filmSlctr = document.getElementById("peliculas");
const titleSlctr = document.getElementById("title");
const detailsSlctr = document.getElementById("details");
const dialogSlctr = document.getElementById("dialog");
const dialogAccepted = document.getElementById("dialog-ok");
const dialogTitle = document.getElementById("dialog-title");
const dialogQuestion = document.getElementById("dialog-question");
const dialogInput = document.getElementById("dialog-input");

dialogPolyfill.registerDialog(dialogSlctr);

//Eventos
moviesRef.on("value", data => {
  const peliculasData = data.val() || {};
  filmSlctr.innerHTML = Object.keys(peliculasData)
    .map(key => movieTpl(key, peliculasData[key]))
    .join('');
});

filmSlctr.addEventListener("click", event => {
    event.preventDefault();
    const target = event.target;
    if(target.nodeName === "BUTTON") {
        //@TODO: Deberíamos mejorar el acceso al dataset, el doble parentNode no es bonito.
        const id = target.parentNode.parentNode.dataset.id;
        const action = target.dataset.action;
        if(action === "details") {
          showDetails(id)
        } else if (action === "edit") {
            editMovieModal(id)
        } else if (action === "delete") {
            deleteMovieModal(id)
        } else if (action === "close") {
            hideDetails(target.parentNode)
        }
    }
})

titleSlctr.addEventListener("keyup", event => {
    const titleContent = titleSlctr.value.trim();

    if(event.keyCode === 13 && titleContent){
        getMovieData(titleContent)
        .then(addMovie)
    }
})

dialogAccepted.addEventListener("click", event => {
  const action = dialogSlctr.dataset.action;
  const id = dialogSlctr.dataset.id;

  if(action === "delete") {
    deleteMovie(id)
  } else if (action === "edit") {
    const newTitle =  dialogInput.value.trim();
    if(newTitle){
      getMovieData(newTitle).then(data => updateMovie(id, data))
    }
  }

  dialogSlctr.removeAttribute("data-id")
  dialogSlctr.removeAttribute("data-action")
})


// UI

function movieTpl (key, film) {
  if(film){
    return `<li class="movie" data-id="${key}">
        <p>${film.Title}</p>
        <div class="btns-container">
            <button data-action="details" class="nes-btn">Detalles</button>
            <button data-action="edit" class="nes-btn is-warning">Editar</button>
            <button data-action="delete" class="nes-btn is-error">Borrar</button>
        </div>

        <div class="movie-details nes-container with-title is-rounded is-dark" id="details-${key}">
            <p class="title">Detalles</p>
            <button id="btn-${key}" data-action="close" class="nes-btn is-error detail-close-btn">X</button>
            <ul>
            ${movieDetailsTpl(film)}
            </ul>

        </div>
    </li>`;
  }
}

function movieDetailsTpl (data) {
  console.log("data:", data)
  let html = "";
  Object.keys(data).forEach(element => {
     if(typeof(data[element])!=='object'
        && data[element] !== 'null'
        && data[element] !== 'N/A'
      ){
          html += `<li><p class="detail">${element}: ${data[element]}</p></li>`
     }
  });
  return html;
}

function showDetails (id, data){
    let detailsContainer = document.getElementById(`details-${id}`)
    detailsContainer.style.display = "block";
}

function hideDetails(element) {
  element.style.display = "none";
}


function deleteMovieModal(id) {
  dialogTitle.innerText = "Atención!";
  dialogQuestion.innerText = "Estás segurx que quieres eliminar la película?";
  dialogInput.style.display = "none";
  dialogSlctr.dataset.id = id;
  dialogSlctr.dataset.action = "delete";
  dialog.showModal();
}

function editMovieModal(id){
  dialogTitle.innerText = "Editar Película";
  dialogQuestion.innerText = "Introduce el nuevo nombre de la película:";
  dialogInput.style.display = "block";
  dialogSlctr.dataset.id = id;
  dialogSlctr.dataset.action = "edit";
  dialog.showModal();
}
