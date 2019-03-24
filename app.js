const moviesRef = firebase.database().ref("peliculas");
const apiKey = "c71f8b0e"

function addMovie (data){
    return moviesRef.push(data)
}

function deleteMovie (id){
    return moviesRef.child(id).remove()
}

function updateMovie (id, data){
    return moviesRef.child(id).set(data)
}

function getMovieDetails (id) {
    //@TODO: Refactor por la comunidad
    return new Promise ((resolve, reject) => {
        moviesRef.child(id).once("value", data => {
            resolve(data.val())
        })
    })
}

function getMovieData (title) {
    const url = `http://www.omdbapi.com/?t=${title}&apikey=${apiKey}`
    return fetch(url).then(res => res.json())
}

function showDetails (data){
    detailsSlctr.style.display = "block";
    detailsSlctr.innerHTML = `<pre><code>${JSON.stringify(data, null, 4)}</code></pre>`;

}

const filmSlctr = document.getElementById("peliculas");
const titleSlctr = document.getElementById("title");
const detailsSlctr = document.getElementById("details");

//Eventos

moviesRef.on("value", data => {
    const peliculasData = data.val()
    console.log("data:", peliculasData)

    let htmlFinal = "";
    //@TODO: Refactor por la comunidad, usando Arrays :-)
    for (const key in peliculasData) {
        if (peliculasData.hasOwnProperty(key)) {
            const element = peliculasData[key];
            htmlFinal += `<li class="movie" data-id="${key}"><p>${element.Title}</p>
                <div class="btns-container">
                    <button data-action="details" class="nes-btn">Detalles</button>
                    <button data-action="edit" class="nes-btn">Editar</button>
                    <button data-action="delete" class="nes-btn is-error">Borrar</button>
                </div>
            </li>`;    
        }
    }
    filmSlctr.innerHTML = htmlFinal
})


filmSlctr.addEventListener("click", event => {
    const target = event.target;
    if(target.nodeName === "BUTTON") {
        //Deberíamos mejorar el acceso al dataset, el doble parentNode no es de buen ver.
        const id = target.parentNode.parentNode.dataset.id;
        const action = target.dataset.action;
        if(action === "details") {
            getMovieDetails(id)
                .then(showDetails);
        } else if (action === "edit") {
            const newTitle = prompt("Dime el nuevo titulo").trim();
            if(newTitle){
                getMovieData(newTitle)
                .then(movieDetails => updateMovie(id, movieDetails))
            }
        } else if (action === "delete") {
            if(confirm("Estas seguro?")){
                deleteMovie(id)
            }
        }
    }
})

titleSlctr.addEventListener("keyup", event => {
    const titleContent = titleSlctr.value.trim();
    if(event.keyCode === 13 && titleContent){
        console.log("ahora si!", titleContent)
        getMovieData(titleContent)
        .then(addMovie)
    }
})

