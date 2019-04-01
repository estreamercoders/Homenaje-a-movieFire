const moviesRef = firebase.database().ref('peliculas');
const apiKey = '😉😉TU TOKEN';

function addMovie(data) {
  return moviesRef.push(data);
}

function deleteMovie(id) {
  return moviesRef.child(id).remove();
}

function updateMovie(id, data) {
  return moviesRef.child(id).set(data);
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

function getMovieData(title) {
  const url = `http://www.omdbapi.com/?t=${title}&apikey=BANMEPLZ`;
  return fetch(url).then(res => res.json());
}

function showDetails(data) {
  detailsSlctr.style.display = 'block';
  detailsSlctr.innerHTML = `<pre><code>${JSON.stringify(
    data,
    null,
    4
  )}</code></pre>`;
}

const filmSlctr = document.getElementById('peliculas');
const titleSlctr = document.getElementById('title');
const detailsSlctr = document.getElementById('details');

//Eventos
moviesRef.on("value", data => {
  const peliculasData = data.val();
  console.log("data:", peliculasData);

  let htmlFinal = Object.keys(peliculasData || {}).map(peliculaId => {
    const element = peliculasData[peliculaId];
    return element
      ? `
        <li data-id="${peliculaId}">${element.Title}
          <button data-action="details">Detalles</button>
          <button data-action="edit">Editar</button>
          <button data-action="delete">Borrar</button>
        </li>
      `
      : '';
  }).join('');

  filmSlctr.innerHTML = htmlFinal
});

filmSlctr.addEventListener('click', event => {
  const target = event.target;
  if (target.nodeName === 'BUTTON') {
    const id = target.parentNode.dataset.id;
    const action = target.dataset.action;
    if (action === 'details') {
      getMovieDetails(id).then(showDetails);
    } else if (action === 'edit') {
      const newTitle = prompt('Dime el nuevo titulo').trim();
      if (newTitle) {
        getMovieData(newTitle).then(movieDetails =>
          updateMovie(id, movieDetails)
        );
      }
    } else if (action === 'delete') {
      const deleteModal = document.getElementById('dialog-delete');
      debugger;
      dialogPolyfill.registerDialog(deleteModal);
      deleteModal.showModal();
      deleteModal.addEventListener('click', event => {
        const dialogAction = event.target.dataset.action;
        if (dialogAction === 'cancel') {
          deleteModal.close();
        } else {
          deleteMovie(id);
        }
      });
    }
  }
});

titleSlctr.addEventListener('keyup', event => {
  const titleContent = titleSlctr.value.trim();
  if (event.keyCode === 13 && titleContent) {
    console.log('ahora si!', titleContent);
    getMovieData(titleContent).then(addMovie);
  }
});
