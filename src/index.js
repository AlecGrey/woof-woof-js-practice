const dogsURL = "http://localhost:3000/pups"
const dogBar = document.querySelector('#dog-bar')
const dogInfo = document.querySelector('#dog-info')
const filterButton = document.querySelector('#good-dog-filter')
filterButton.dataset.state = 'OFF'

document.addEventListener('DOMContentLoaded', event => {
    fetchAllDogsToDogBar()

    // ----- EVENT FOR POPULATING DOG INFO TO PAGE ----- //
    dogBar.addEventListener('click', event => {
        // adds event for fetching single dog info to the page
        if (event.target.tagName != 'SPAN') return
        fetchDogInfo(event.target.dataset.dogId)
    })

    // ----- EVENT FOR FILTERING DOGS IN HEADER ----- // 
    filterButton.addEventListener('click', event => {
        updateDogsBasedOnFilter(event)
    })

})

function fetchAllDogsToDogBar() {
    // queries dogURL to get all dog objects, then appends them to the dog bar
    dogBar.innerHTML = ""
    fetch(dogsURL)
        .then(resp => resp.json())
        .then(json => {
            appendDogsToDogBar(json)
        })
}

function appendDogsToDogBar(dogObjectArray) {
    // helper to iterate through the JSON object & append each dog to the bar
    for (const dogObject of dogObjectArray) {
        doggo = createDogSpan(dogObject)
        dogBar.appendChild(doggo)
    }
}

function createDogSpan(dogObject) {
    // converts each dog object into a span w/name, data-dog-id, and event listener
    dogSpan = document.createElement('span')
    dogSpan.textContent = dogObject.name
    dogSpan.dataset.dogId = dogObject.id
    return dogSpan
}

const fetchDogInfo = (dogId) => {
    // queries specific dog page based on their ID, appends info to dog info div
    // debugger
    fetch(dogsURL+"/"+dogId)
        .then(resp => resp.json())
        .then(json => {
            appendDogInfoToDiv(json)
        })
}

const appendDogInfoToDiv = (dogObject) => {
    // clears the current dog info, then adds new info for the last clicked dog

    const img = document.createElement('img')
    img.src = dogObject.image

    const h2 = document.createElement('h2')
    h2.textContent = dogObject.name

    const button = document.createElement('button')
    button.textContent = !!dogObject.isGoodDog ? "Bad Dog!" : "Good Dog!"
    button.dataset.dogId = dogObject.id
    button.addEventListener('click', event => toggleGoodDog(event))

    dogInfo.innerHTML = ""
    dogInfo.append(img, h2, button)
}

const toggleGoodDog = (event) => {
    // logic for toggling between good/bad dogs
    // Updates the database, making the dog good/bad depending on current state
    // logic to toggle good/bad in patchConfigObject()
    // debugger
    fetch(dogsURL+"/"+event.target.dataset.dogId, patchConfigObject(event))
        .then(resp => resp.json())
        .then(json => {
            convertButtonText(event.target)
            updateSingleDogInHeader(json)
        })
}

const patchConfigObject = (event) => {
    // formats the ConfigObject for a patch request
    // if isGoodDog is currently true, changes to false & vice versa
    let body
    if (event.target.textContent == "Bad Dog!") { body = {"isGoodDog": false} }
    else {body = {"isGoodDog": true}}
    return {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
        },
        body: JSON.stringify(body)

    }
}

const convertButtonText = (button) => {
    // helper to toggle the text content of the button
    button.textContent = button.textContent == "Bad Dog!" ? "Good Dog!" : "Bad Dog!"
}

const updateSingleDogInHeader = (jsonObject) => {
    // debugger
    // trace back to toggleGoodDog
    // updates header to assure newly toggled dog is included/excluded, if necessary
    if (filterButton.dataset.state === 'ON') {
        fetchAndFilterByGoodDog()
    }
}

const updateDogsBasedOnFilter = (event) => {
    if (event.target.dataset.state === 'OFF') {
        event.target.textContent = 'Good doggos only: ON'
        event.target.dataset.state = 'ON'
        fetchAndFilterByGoodDog()
    }
    else {
        event.target.textContent = 'Good doggos only: OFF'
        event.target.dataset.state = 'OFF'
        fetchAllDogsToDogBar()
    }
}

const fetchAndFilterByGoodDog = () => {
    fetch(dogsURL)
        .then(resp => resp.json())
        .then(json => {
            appendGoodDoggos(json)
        })
}

const appendGoodDoggos = (dogObjectArray) => {
    const goodDogs = []

    for (const dogObject of dogObjectArray) {
        if (!!dogObject.isGoodDog) goodDogs.push(dogObject)
    }

    dogBar.innerHTML = ""
    appendDogsToDogBar(goodDogs)
}