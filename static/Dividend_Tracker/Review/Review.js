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
let ticker1 = null;

async function sendTicker() {
    let ticker = document.getElementById("stockInput").value.trim();
    if (!ticker) return;

    window.history.pushState({}, "", `?ticker=${ticker}`);

    await loadTicker(ticker);
}

async function loadTicker(ticker) {
    //ticker = document.getElementById("stockInput").value;
    //placeHolder = ticker;
    ticker1 = ticker;

    try {
        const response = await fetch(`http://localhost:8080/api/v1/search/${ticker}`);
        const data = await response.json();

        if (!response.ok){
            throw new Error(`Error: ${response.status} ${response.statusText}`)
        }

        showBasicStockTable(data);
        getSummaryAndDividendData(ticker);
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

let pageSize = 25;
let currentPage = 0;

const rowSelect = document.getElementById('rowsPerPage');
const backBtn = document.getElementById('back-btn');
const nextBtn = document.getElementById('next-btn');
const pageInfo = document.getElementById('pageInfo');

rowSelect.addEventListener('change', ()=> {
    pageSize = parseInt(rowSelect.value);
    currentPage = 0;
    getSummaryAndDividendData(ticker1);
});

backBtn.addEventListener('click', () => {
    if (currentPage > 0){
        currentPage--;
        getSummaryAndDividendData(ticker1);
    }
});

nextBtn.addEventListener('click', () => {
    if (!nextBtn.disabled){
        currentPage++;
        getSummaryAndDividendData(ticker1);
    }
});


async function getSummaryAndDividendData(ticker) {
    try {
        const response1 = await fetch(`http://localhost:8080/api/v1/searchSummary/${ticker}`);
        const data1 = await response1.json();

        const response2 = await fetch(`http://localhost:8080/api/v1/searchDividendSummary/${ticker}`);
        const data2 = await response2.json();

        const response3 = await fetch(`http://localhost:8080/api/v1/searchDividendHistory?ticker=${ticker}&page=${currentPage}&size=${pageSize}`);
        const data3 = await response3.json();

        if (!response1.ok && !response2.ok && !response3.ok){
            throw new Error(`Error: ${response1.status} ${response1.statusText} \n
                ${response2.status} ${response2.statusText} \n
                ${response3.status} ${response3.statusText}`);
        } else if (!response1.ok){
            throw new Error(`Error: ${response1.status} ${response1.statusText}`);
        } else if (!response2.ok){
            throw new Error(`Error: ${response2.status} ${response2.statusText}`);
        } else  if (!response3.ok){
            throw new Error(`Error: ${response3.status} ${response3.statusText}`)
        }

        console.log("The exchange is: "+data1.Exchange);
        createPriceChart(data1.Exchange);
        getSummaryData(data1);
        getDividendData(data2);
        setDividendHistory(data3);
        console.log("Data succesfully pulled");
    }catch (error){
        alert(`Failed to send data: ${error.message}`);
    }
}


function createPriceChart(priceResponse) {

    const container = document.getElementById("priceChart");
    container.innerHTML = "";

    if (!window.TradingView) {
        console.error("TradingView library not loaded.");
        return;
    }

    new TradingView.widget({
        container_id: "priceChart",
        style: 3,
        symbol: priceResponse,
        interval: "D",
        theme: "light",
        autosize: true,
        hide_side_toolbar: true,
        hide_top_toolbar: true,
        allow_symbol_change: true,
        locale: "en",
        backgroundColor: "#ffffff",
        gridColor: "rgba(242, 242, 242, 0.06)",
        withdateranges: true
    });

}

function getSummaryData(summary){

    document.querySelectorAll("#summary [data-field]").forEach(element => {
        const field = element.getAttribute("data-field");
        if (summary[field] !== undefined && summary[field] !== null){
            element.textContent = summary[field];
        }
    });
}

function getDividendData(dividend){

    document.querySelectorAll("#dividend [data-field]").forEach(element => {
        const field = element.getAttribute("data-field");
        if (dividend[field] !== undefined && dividend[field] !== null){
            element.textContent = dividend[field];
        }
    });


    const tbody = document.querySelector('#dividendCagr tbody');
    tbody.innerHTML = '';

    const tr = document.createElement('tr');

    ['Dividend_Growth_1_year', 'Dividend_Growth_3_year', 'Dividend_Growth_5_year', 'Dividend_Growth_10_year'].forEach(key => {
        const td = document.createElement('td');
        let value = dividend[key];

        if (value === null || value === undefined) {
            value = '--';
        } else if (['Dividend_Growth_1_year', 'Dividend_Growth_3_year', 'Dividend_Growth_5_year', 'Dividend_Growth_10_year'].includes(key)){
            value = `${parseFloat(value).toFixed(2)}%`;
        }

        td.textContent = value;

        if (['Dividend_Growth_1_year', 'Dividend_Growth_3_year', 'Dividend_Growth_5_year', 'Dividend_Growth_10_year']) {
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

window.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(window.location.search);
    const tickerFromUrl = params.get("ticker");

    if (tickerFromUrl) {
        document.getElementById("stockInput").value = tickerFromUrl;
        loadTicker(tickerFromUrl);
    }
});