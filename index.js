import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js"
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js"

const appSettings = {
    databaseURL: "https://lebanesefuelprices-default-rtdb.europe-west1.firebasedatabase.app/"
}

const app = initializeApp(appSettings)
const db = getDatabase(app)
const pricesInDB = ref(db, "prices")

let unl95Price, dieselPrice, customDieselPrice

onValue(pricesInDB, function (snapshot) {
    const prices = snapshot.val()

    console.log(prices)
    unl95Price = prices["UNL95 price"]
    dieselPrice = prices["diesel price"]
    customDieselPrice = prices["diesel custom price"]

    updatePrice(priceSelect.value)
    refreshOutput()
})

const selectEl = document.getElementById("input-type")
const priceSelect = document.getElementById("price-select")
const outputEl = document.getElementById("output")
const numberIn = document.getElementById("number-input")
const priceIn = document.getElementById("price")



selectEl.addEventListener("change", function () {
    const value = selectEl.value

    if (value == "LTD") {
        numberIn.placeholder = "ادخل عدد الليترات"
    } else if (value == "DTL") {
        numberIn.placeholder = "ادخل عدد الدولارات"
    }
    refreshOutput()
})

priceSelect.addEventListener("change", () => {
    const value = priceSelect.value
    priceIn.removeAttribute("disabled")
    if (value != "custom-price") {
        priceIn.setAttribute("disabled", true)
    }

    updatePrice(value)
    refreshOutput()
})

priceIn.addEventListener("input", refreshOutput)
numberIn.addEventListener("input", refreshOutput)

function refreshOutput() {
    let price = priceIn.value
    if (!price || !numberIn.value) return

    const mode = selectEl.value

    const normalOut = document.getElementById("normal-output")
    const errorOut = document.getElementById("error-output")
    let out = normalOut.innerHTML
    let simpleOut = numberIn.value + ""

    if (price <= 0) {
        errorOut.textContent = "السعر لا يمكن ان يكون إلا رقمًا ايجابيا!"
        priceIn.style.borderColor = "red"
        return 
    } 
    errorOut.textContent = null
    priceIn.style.borderColor = null
    
    if (mode == "LTD") {
        let leters = numberIn.value
        let netPrice = Math.floor((leters/20)*price*1000)/1000
        out = `${leters} ليتر تساوي <em>${netPrice}</em> دولار على سعر ${price}$\\20L`
        simpleOut += "L = " + netPrice + "$"
    } else if (mode == "DTL") {
        let dollars = numberIn.value
        let netLeters =  Math.floor((dollars/price)*20*1000)/1000
        out = `${dollars} دولار تساوي <em>${netLeters}</em> ليتر على سعر ${price}$\\20L`
        simpleOut += "$ = " + netLeters + "L"
    }

    normalOut.innerHTML = out
    document.getElementById("simple-output").textContent = simpleOut
}

function updatePrice (value) {
    const noteOut = document.getElementById("note-output")
    noteOut.textContent = null

    if (value == "diesel-price") {
        priceIn.value = dieselPrice
    } else if (value == "UNL95-price") {
        priceIn.value = unl95Price
    } else if (value == "diesel-h-price") {
        const diff = Math.round((dieselPrice - customDieselPrice)*100)/100 

        priceIn.value = customDieselPrice
        if (diff > 0)
            noteOut.textContent = `هذا السعر سعر خاص للزبائن فهو اوفر بـ${diff} دولار لكل 20 ليتر`
        else if (diff == 0)
            noteOut.textContent = "هذا السعر مطابق لسعر المازوت المقرر من قبل الوزارة"

    }
}