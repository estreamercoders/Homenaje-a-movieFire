const moviesRef = firebase.database().ref("peliculas");
const apiKey = '😉😉TU TOKEN'


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

function showDetails (id, data){
    let detailsContainer = document.getElementById(`details-${id}`)
    let html = ""

    detailsContainer.classList.add('nes-container')
    detailsContainer.classList.add('with-title')
    detailsContainer.classList.add('is-rounded')
    detailsContainer.classList.add('is-dark')
    detailsContainer.style.margin = '24px'

    html += `<p class="title">Detalles</p>
            <a id="btn-${id}" class="nes-btn is-error detail-close-btn">X</a>`

    //Falta manejar los arrays de los datos
    Object.keys(data).forEach(element => {
       if(typeof(data[element])!='object' && data[element]!='null'){
            html += `<li><p class="detail">${element}: ${data[element]}</p></li>`
       }
    });
    detailsContainer.innerHTML = html

    detailCloseBtn = document.getElementById(`btn-${id}`)

    // Mejorar esto!! Evento del botón de cerrar detalles
    detailCloseBtn.addEventListener('click', event =>{
        hideDetails(event.target.parentNode)
    })

}

function hideDetails(element) {
    console.log(element)
    let elementToHide = element
    elementToHide.innerHTML = ''
    elementToHide.classList.remove('nes-container')
    elementToHide.classList.remove('with-title')
    elementToHide.classList.remove('is-rounded')
    elementToHide.classList.remove('is-dark')
    elementToHide.style.margin = '0px'
}

// Falta terminar esta parte. Hay que hacer update con todos los datos de la nueva pelicula, no solo el título.
function editMovie(id){
    const modal = editMovieModal();
    let newTitle = null
    modal.addEventListener('click', event => {
        const buttonId = event.target
        switch(buttonId.dataset.action){
            case 'cancel':
                debugger
                modal.close()
            break;
            case 'confirm':
                debugger
                modal.close()
                newTitle = document.getElementById('inputEditMovie').value.trim()
                updateMovie(id, {Title: newTitle})
            break;
        }
        modal.parentNode.removeChild(modal)
    })
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
            htmlFinal += `<li class="movie" data-id="${key}">
                <p>${element.Title}</p>
                <div class="btns-container">
                    <button data-action="details" class="nes-btn">Detalles</button>
                    <button data-action="edit" class="nes-btn is-warning">Editar</button>
                    <button data-action="delete" class="nes-btn is-error">Borrar</button>
                </div>
                <div class="movie-details" id="details-${key}"></div>
            </li>`;
        }
    }
    filmSlctr.innerHTML = htmlFinal
})


filmSlctr.addEventListener("click", event => {
    const target = event.target;
    if(target.nodeName === "BUTTON") {
        //Deberíamos mejorar el acceso al dataset, el doble parentNode no es bonito.
        const id = target.parentNode.parentNode.dataset.id;
        const action = target.dataset.action;
        if(action === "details") {
            getMovieDetails(id)
                .then(movieDetails => showDetails(id, movieDetails));
        } else if (action === "edit") {
            editMovie(id)
        } else if (action === "delete") {
            const confirmModal = deleteMovieModal()
            confirmModal.addEventListener('click', event => {
                event.preventDefault()
                event.target.dataset.action == 'confirm'
                                            ? deleteMovie(id)
                                            : confirmModal.close();
                confirmModal.parentNode.removeChild(confirmModal)
            })
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

// Custom confirm dialog

const customConfirm = `<form method="dialog">
                            <p class="title"><span class="nes-text is-warning">Atención!</span></p>
                            <p>Estás segurx que quieres eliminar la película?</p>
                            <menu class="dialog-menu">
                                <button class="nes-btn" data-action="cancel">Cancel</button>
                                <button class="nes-btn is-primary" data-action="confirm">Confirmar</button>
                            </menu>
                        </form>`

function deleteMovieModal() {
    let dialog = document.getElementById('dialog-confirm')

    if(dialog == null){
        dialog = document.createElement("dialog")
        dialog.classList.add('nes-dialog')
        dialog.attributes.id = 'dialog-confirm'
        dialog.innerHTML = customConfirm
        document.body.appendChild(dialog)
        dialogPolyfill.registerDialog(dialog)
    }

    if(dialog.open != true) dialog.showModal()
    return dialog
}

// Custom edit dialog

const customEdit = `<form method="dialog">
                        <label for="name_field">Introduce el nuevo nombre de la película:</label>
                        <input type="text" id="inputEditMovie" class="nes-input">
                        <menu class="dialog-menu">
                            <button class="nes-btn" data-action="cancel">Cancel</button>
                            <button class="nes-btn is-primary" data-action="confirm">Confirmar</button>
                        </menu>
                    </form>`

function editMovieModal(){
    let dialog = document.getElementById('dialog-edit')

    if(dialog == null){
        dialog = document.createElement("dialog")
        dialog.classList.add('nes-dialog')
        dialog.attributes.id = 'dialog-edit'
        dialog.innerHTML = customEdit
        document.body.appendChild(dialog)
        dialogPolyfill.registerDialog(dialog)
    }

    if(dialog.open != true) dialog.showModal()
    return dialog
}