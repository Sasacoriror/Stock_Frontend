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

//let placeHolder = "";
let ticker = null;

async function sendTicker() {
     ticker = document.getElementById("stockInput").value;
    //placeHolder = ticker;

    try {
        const response = await fetch(`http://localhost:8080/api/v1/search/${ticker}`);
        const data = await response.json();

        if (!response.ok){
            throw new Error(`Error: ${response.status} ${response.statusText}`)
        }

        showBasicStockTable(data);
        getDividendHistory(ticker);
        //getSummaryAndDividendData(ticker);
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

    const button = document.createElement('button');

    if (searchData.inside_Watchlist === true) {
        button.textContent = "Remove Stock";
        button.classList.add("remove-btn");
        button.onclick = () => removeFromWatchlist(searchData.id_Of_Stock, searchData.ticker, button);
    } else {
        button.textContent = "Add Stock";
        button.classList.add("add-btn");
        button.onclick = () => addToWatchlist(searchData.ticker, button);
    }

    actionTd.appendChild(button);
    tr.appendChild(actionTd);
    tbody.appendChild(tr);
}

async function addToWatchlist(stockTickerInn, button){

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
        
        const id = await response.json();

        button.textContent = "Remove Stock";
        button.classList.remove("add-btn");
        button.classList.add("remove-btn");

        button.onclick = () => removeFromWatchlist(id, stockTickerInn, button);

        console.log("Stock successfully added")
       
    }catch (error){
        alert(`Failed to send data: ${error.message}`)
    }
}

async function removeFromWatchlist(id, ticker, button) {
    try {
        const response = await fetch(`http://localhost:8080/api/v1/deleteWatchlist/${id}`, {
            method: "DELETE"
        });

        if (!response.ok){
            throw new Error(`Error: ${response.status} ${response.statusText}`);
        }

        button.textContent = "Add Stock";
        button.classList.remove("remove-btn");
        button.classList.add("add-btn");

        button.onclick = () => addToWatchlist(ticker, button);

        console.log("Stock removed");
    } catch (error){
        alert(`Failed to remove: ${error.message}`);
    }
}


async function getSummaryAndDividendData(ticker) {
    try {
        const response1 = await fetch(`http://localhost:8080/api/v1/searchSummary/${ticker}`);
        const data1 = await response1.json();

        const response2 = await fetch(`http://localhost:8080/api/v1/searchDividendSummary/${ticker}`);
        const data2 = await response1.json();

        if (!response1.ok){
            throw new Error(`Error: ${response1.status} ${response1.statusText}`);
        } else if (!response2.ok){
            throw new Error(`Error: ${response2.status} ${response2.statusText}`);
        }


        getSummaryData(data1);
        getDividendData(data2);
        console.log("Data succesfully pulled");
    }catch (error){
        alert(`Failed to send data: ${error.message}`);
    }
}

function getSummaryData(summary){

}

function getDividendData(dividend){

}


let pageSize = 25;
let currentPage = 0;

const rowSelect = document.getElementById('rowsPerPage');
const backBtn = document.getElementById('back-btn');
const nextBtn = document.getElementById('next-btn');
const pageInfo = document.getElementById('pageInfo');

rowSelect.addEventListener('change', ()=> {
    pageSize = parseInt(rowSelect.value);
    currentPage = 0;
    getDividendHistory(ticker);
});

backBtn.addEventListener('click', () => {
    if (currentPage > 0){
        currentPage--;
        getDividendHistory(ticker);
    }
});

nextBtn.addEventListener('click', () => {
    if (!nextBtn.disabled){
        currentPage++;
        getDividendHistory(ticker);
    }
});


async function getDividendHistory(ticker){

    try {
        const response = await fetch(`http://localhost:8080/api/v1/searchDividendHistory/${ticker}?page=${currentPage}&size=${pageSize}`);
        const data = await response.json();

        if (!response.ok){
            throw new Error(`Error: ${response.status} ${response.statusText}`)
        }

        setDividendHistory(data)
        console.log("Stock successfully added")
    }catch (error){
        alert(`Failed to send data: ${error.message}`)
    }
}

function setDividendHistory(dh){
    const tbody = document.querySelector('#dividendTable tbody');
    tbody.innerHTML = '';

    dh.content.forEach((item) => {
        const tr = document.createElement('tr');

        const fields = ['Declared_date', 'Ex_Dividend_Day', 'Record_Date', 'Payment_Date', 'Frequenzy', 'Amount','Change'];


        fields.forEach(key => {
            const td = document.createElement('td');
            let value = item[key];

            if (value === null || value === undefined) {
                value = '--';
            } else if (['Change'].includes(key)){
                value = `${parseFloat(value).toFixed(2)}%`;
            } else if(['Amount'].includes(key)){
                value = `$${parseFloat(value).toFixed(2)}`;
            }
        
            td.textContent = value;

            if (key === 'Change') {
                const numbers = parseFloat(value.replace(/[^0-9.-]/g, ''));
                console.log(numbers);
                if (!isNaN(numbers)){
                   if (numbers > 0){
                    td.style.color = 'green';
                   } else if (numbers < 0){
                    td.style.color = 'red';
                   } else {
                    td.style.color = '';
                   }
                }
            }

            tr.appendChild(td);
        });

        tbody.appendChild(tr);
    });

    pageInfo.textContent = `Page ${currentPage + 1} of ${dh.totalPages}`;

    backBtn.disabled = dh.first;
    nextBtn.disabled = dh.last;
    
}