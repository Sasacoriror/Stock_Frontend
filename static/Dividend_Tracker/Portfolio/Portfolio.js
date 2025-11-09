window.addEventListener("DOMContentLoaded", fetchPortfolios);

async function fetchPortfolios() {
    try {
        const response = await fetch("http://localhost:8080/api/v2/portfolios");
        const data = await response.json();
        renderOptions(data);

        if (data.length > 1) {
            const lastId = data.at(-1).id;
            document.getElementById("selectPortfolio").value = lastId;
            console.log("Loading last portfolio ID: "+ lastId);
            fetchStocks(lastId);
        } else {
            const firstId = data[0].id;
            document.getElementById("selectPortfolio").value = firstId;
            console.log("Loading first portfolio ID: "+ firstId);
            fetchStocks(firstId);
        }
        // if (data.length > 0)
    } catch (error){
        console.log("Error fetching portfolios: "+error);
    }
}

function renderOptions(portfolios){
    const select = document.getElementById('selectPortfolio');

    select.innerHTML = "";

    portfolios.forEach(data => {
        const option = document.createElement('option');
        option.value = data.id;
        option.textContent = data.name;
        select.appendChild(option);
    });

    select.addEventListener("change", (event) => {
        const selectedID = event.target.value;
        console.log("Portfolio ID: "+selectedID);
        fetchStocks(selectedID);
    });
}

var IDs = 0;

async function fetchStocks(id) {

    IDs = id;
    
    try {
        const response = await fetch(`http://localhost:8080/api/v2/${id}/stocks`);
        const data = await response.json();
        renderTable(data);
        renderSummary(data);
    } catch (error) {
        console.error("Error fetching stock data: "+error);
    }
}


function renderTable(stocks) {
    const tbody = document.querySelector('#stocksTable tbody');
    tbody.innerHTML = '';

    stocks.forEach((stock) => {
        const tr = document.createElement('tr');

        ['stockTickerInn', 'companyName', 'priceInn', 'sharesInn', 'currentPrice', 'dividend', 'totalDividend', 'totalPrice', 'totalInvested', 'return', 'percentageReturn'].forEach(key => {
            const td = document.createElement('td');
            let value = stock[key];

            if (['percentageReturn'].includes(key)) {
                value = `${parseFloat(value).toFixed(2)}%`;
            } else if (['priceInn', 'currentPrice', 'totalDividend', 'totalPrice', 'totalInvested', 'return'].includes(key)){
                value = `$${parseFloat(value).toFixed(2)}`;
            }

            td.textContent = value;

            if (key === 'return' || key === 'percentageReturn') {
                const numbers = parseFloat(value.replace(/[^0-9.-]/g, ''));
                console.log(numbers);
                if (!isNaN(numbers)){
                    td.style.color = numbers >= 0 ? 'green' : 'red';
                }
            }

            tr.appendChild(td);
        });

        const actionTd = document.createElement('td');
        console.log("Update ID part1 : "+stock.id);
        actionTd.innerHTML = `
            <button class="delete-btn" onclick="deleteRow('${stock.id}')">Delete</button>
            <button class="edit-btn" onclick="openEditRow('${stock.id}', '${stock.sharesInn}', '${stock.priceInn}')">Edit</button>
        `;
        console.log("Update ID part2 : "+stock.id);
        tr.dataset.id = stock.id;
        tr.appendChild(actionTd);
        tbody.appendChild(tr);
    });
}

function renderSummary(stocks) {
    let totalValue = 0;
    let totalCost = 0;
    let totalDividends = 0;

    stocks.forEach(stock => {
        const shares = parseFloat(stock.sharesInn);
        const buyPrice = parseFloat(stock.priceInn);
        const currentPrice = parseFloat(stock.currentPrice);
        const totalDividend = parseFloat(stock.totalDividend);

        totalValue += currentPrice * shares;
        totalCost += buyPrice * shares;
        totalDividends += totalDividend;
    });

    const profit = totalValue - totalCost;
    const percentage = ((profit) / totalCost) * 100;

    const positiveOrNegative = `$${profit >= 0 ? '+' : ''}${profit.toFixed(2)}`;
    const percentagePoN = `${percentage >= 0 ? '+' : ''}${percentage.toFixed(2)}%`;


    document.getElementById("totalInvested").textContent = `$${totalCost.toFixed(2)}`
    document.getElementById("totalValue").textContent = `$${totalValue.toFixed(2)}`;
    document.getElementById("totalDividends").textContent = `$${totalDividends.toFixed(2)}`;

    const tProfit = document.getElementById("totalProfit");
    const pProfit = document.getElementById("percentageProfit");

    tProfit.textContent = positiveOrNegative;
    tProfit.style.color = profit >= 0 ? "green" : "red";

    pProfit.textContent = percentagePoN;
    pProfit.style.color = percentage >= 0 ? "green" : "red";
}

let id= "";

function openEditRow(id1, shares, price){

    id = id1;
    document.getElementById("editShares").value = shares;
    document.getElementById("editPrice").value = price;
    document.getElementById("editModal").style.display = "block";
}

async function editRow(){
    let sharesInn = document.getElementById("editShares").value;
    let priceInn = document.getElementById("editPrice").value;

    const response = await fetch(`http://localhost:8080/api/v1/updateData/${id}/${IDs}`, {
        method: "PUT",
        headers: {"Content-Type": "application/json" },
        body: JSON.stringify({sharesInn, priceInn})
    });
    await response.text();
    console.log("Sending to backend to update data.")
    closeEditModal();
    fetchStocks(IDs);
}

window.onclick = function(event) {
    const modal = document.getElementById("editModal");
    if (event.target === modal) {
        closeEditModal();
    }
};

function closeEditModal() {
    document.getElementById("editModal").style.display = "none";
}

function deleteRow(id) {
    fetch(`http://localhost:8080/api/v1/delete/${id}/${IDs}`, {
        method: 'DELETE'
    })
        .then(() => fetchStocks(IDs))
        .catch(error => console.error("Delete failed:", error));
}


function openAddPortfolio() {
    document.getElementById("addPortfolio").style.display = "block";
}

async function createPortfolio(){
    let name = document.getElementById("portfolioName").value;

    try {
        const response = await fetch(`http://localhost:8080/api/v2/createPortfolio`, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({name})
        });

        if (!response.ok){
                throw new Error(`Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log("Data: "+data.id+" || Name: "+name);
        closePortfolioModal();
        fetchPortfolios();

    } catch(error){
        alert(`Failed to send data: ${error.message}`);
    }
}

function closePortfolioModal(){
    document.getElementById("portfolioName").value = "";
    document.getElementById("addPortfolio").style.display = "none";
}

window.onclick = function(event) {
    const modal = document.getElementById("addPortfolio");
    if (event.target === modal) {
        closePortfolioModal();
    }
};

//Load page
fetchStocks(IDs);
