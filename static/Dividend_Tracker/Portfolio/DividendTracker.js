function openAddStock() {
    document.getElementById("addStock").style.display = "block";
}

async function sendData(){
    const stockTickerInn = document.getElementById("tickerSymbol").value.toUpperCase();
    let priceInn = document.getElementById("theStockPrice").value;
    let sharesInn = document.getElementById("shares").value;

    if (!noEmptyFields(stockTickerInn, priceInn, sharesInn)){
        return;
    }

    try {
        const response = await fetch("http://localhost:8080/api/v1/storeStockData", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
                stockTickerInn,
                priceInn,
                sharesInn
            })
        });

        if (!response.ok){
            throw new Error(`Error: ${response.status} ${response.statusText}`)
        }

        await response.text();
        console.log("Stock successfully added")
        emptyField();
        closeStockModal()
        fetchStocks();
    }catch (error){
        alert(`Failed to send data: ${error.message}`)
    }
}

function closeStockModal(){
    document.getElementById("addStock").style.display = "none";
}

window.onclick = function(event) {
    const modal = document.getElementById("addStock");
    if (event.target === modal) {
        emptyField();
        closeStockModal();
    }
};

function noEmptyFields(ticker, price, shares){

    if (ticker.trim() === '' || price.trim() === '' || shares.trim() === ''){
        alert("All boxes must be gilled inn")
        return false;
    }
    return true;
}

function emptyField(){
    document.getElementById("tickerSymbol").value = "";
    document.getElementById("theStockPrice").value = "";
    document.getElementById("shares").value = "";
}