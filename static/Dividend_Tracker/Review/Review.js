document.addEventListener("DOMContentLoaded", () => {
            fetch("../Sidebar/Sidebar.html")
                .then(response => response.text())
                .then(data => {
                    document.getElementById("sidebar").innerHTML = data;
                    const link = document.createElement("link");
                    link.rel = "stylesheet";
                    link.href = "../Sidebar/Sidebar.css";
                    document.head.appendChild(link);
                });
        });

let placeHolder = "";

async function sendTicker() {
    const ticker = document.getElementById("stockInput").value;
    placeHolder = ticker;

    try {
        const response = await fetch(`http://localhost:8080/api/v1/searchFinancialData/${ticker}`);
        const data = await response.json();

        if (!response.ok){
            throw new Error(`Error: ${response.status} ${response.statusText}`)
        }

        showBasicStockTable(data)
        console.log("Stock successfully added")
    }catch (error){
        alert(`Failed to send data: ${error.message}`)
    }
}

function showBasicStockTable(searchData){
    const tbody = document.querySelector('#searchTable1 tbody');
    tbody.innerHTML = '';

    const tr = document.createElement('tr');

    ['ticker', 'company_Name', 'current_Stock_Price', 'days_Change_Dollars', 'days_Change_Percent'].forEach(key => {
        const td = document.createElement('td');
        td.textContent = searchData[key];
        tr.appendChild(td);
    });

    const actionTd = document.createElement('td');
    actionTd.innerHTML = `<button class="add-btn" onclick="addToWatchlist()">Save Stock</button>`;
    tr.appendChild(actionTd);

    tbody.appendChild(tr);
}



async function addToWatchlist(){
    let stockTickerInn = placeHolder;

    try {
        const response = await fetch(`http://localhost:8080/api/v1/addWatchlist`, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
                stockTickerInn,
            })
        });

        if (!response.ok){
            throw new Error(`Error: ${response.status} ${response.statusText}`)
        }

        await response.text();
        console.log("Stock successfully added")
       
    }catch (error){
        alert(`Failed to send data: ${error.message}`)
    }
}