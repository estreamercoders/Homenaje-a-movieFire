const moviesRef = firebase.database().ref("peliculas");
const apiKey = "😉😉TU TOKEN"

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


const filmSlctr = document.getElementById("peliculas");
const titleSlctr = document.getElementById("title");

//Eventos

moviesRef.on("value", data => {
    const peliculasData = data.val()
    console.log("data:", peliculasData)

    let htmlFinal = "";
    //@TODO: Refactor por la comunidad, usando Arrays :-)
    for (const key in peliculasData) {
        if (peliculasData.hasOwnProperty(key)) {
            const element = peliculasData[key];
            htmlFinal += `<li>${element.Title}</li>`;    
        }
    }
    filmSlctr.innerHTML = htmlFinal
})

titleSlctr.addEventListener("keyup", event => {
    const titleContent = titleSlctr.value.trim();
    if(event.keyCode === 13 && titleContent){
        console.log("ahora si!", titleContent)
        getMovieData(titleContent)
        .then(addMovie)
    }

})

