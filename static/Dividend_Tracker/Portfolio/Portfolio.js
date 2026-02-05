window.addEventListener("DOMContentLoaded", fetchPortfolios);

let reRun = 0;

async function fetchPortfolios() {
    try {
        const response = await fetch("http://localhost:8080/api/v2/portfolios");
        const data = await response.json();
        renderOptions(data);

        if (reRun === 1) {
            const lastId = data.at(-1).id;
            document.getElementById("selectPortfolio").value = lastId;
            console.log("Loading last portfolio ID: "+ lastId);
            fetchStocks(lastId);
            reRun = 0;
        } else {
            const firstId = data[0].id;
            document.getElementById("selectPortfolio").value = firstId;
            console.log("Loading first portfolio ID: "+ firstId);
            fetchStocks(firstId);
        }
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
        summaryPort = false;
        fetchStocks(selectedID);
    });
}

var IDs = 1;

let pageSize = 10;
let currentPage = 0;


const rowSelect = document.getElementById('rowsPerPage');
const backBtn = document.getElementById('back-btn');
const nextBtn = document.getElementById('next-btn');
const pageInfo = document.getElementById('pageInfo');

rowSelect.addEventListener('change', ()=> {
    pageSize = parseInt(rowSelect.value);
    currentPage = 0;
    fetchStocks(IDs);
});

backBtn.addEventListener('click', () => {
    if (currentPage > 0){
        currentPage--;
        fetchStocks(IDs);
    }
});

nextBtn.addEventListener('click', () => {
    if (!nextBtn.disabled){
        currentPage++;
        fetchStocks(IDs);
    }
});

async function fetchStocks(id) {

    IDs = id;
    
    try {
        const response = await fetch(`http://localhost:8080/api/v2/${id}/stocks?page=${currentPage}&size=${pageSize}`);
        const data = await response.json();

        renderTable(data);
        getSummary(id);  
    } catch (error) {
        console.error("Error fetching stock data: "+error);
    }
}


function renderTable(stocks) {
    const tbody = document.querySelector('#stocksTable tbody');
    tbody.innerHTML = '';

    stocks.content.forEach((stock) => {
        const tr = document.createElement('tr');

        const fields = ['stockTickerInn', 'companyName', 'priceInn', 'sharesInn', 'currentPrice', 'dividend', 'drip', 'totalDividend', 'totalPrice', 'totalInvested', 'return', 'percentageReturn', 'Todays_return_Dollars', 'Todays_return_Percentage'];
            
        fields.forEach(key => {
        
        const td = document.createElement('td');
            let value = stock[key];

            if (['percentageReturn', 'Todays_return_Percentage'].includes(key)) {
                value = `${parseFloat(value).toFixed(2)}%`;
            } else if (['priceInn', 'currentPrice', 'totalDividend', 'totalPrice', 'totalInvested', 'return', 'Todays_return_Dollars'].includes(key)){
                value = `$${parseFloat(value).toFixed(2)}`;
            } else if (['drip'].includes(key)) {
                value = `${parseFloat(value).toFixed(2)}`;
            }

            if (key === 'stockTickerInn') {
                const link = document.createElement('a');
                link.textContent = value;
                link.href = "http://127.0.0.1:5500/static/Dividend_Tracker/Review/Review.html?ticker="+encodeURIComponent(value);
                td.appendChild(link)
            } else {
                td.textContent = value;
            }

            if (key === 'return' || key === 'percentageReturn' || key === 'Todays_return_Dollars' || key === 'Todays_return_Percentage') {
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
            <button class="delete-btn" id="delete-Btn" onclick="deleteRow('${stock.id}')">Delete</button>
            <button class="edit-btn" id="edit-Btn" onclick="openEditRow('${stock.id}', '${stock.sharesInn}', '${stock.priceInn}')">Edit</button>
        `;
        console.log("Update ID part2 : "+stock.id);
        tr.dataset.id = stock.id;
        tr.appendChild(actionTd);
        tbody.appendChild(tr);
    });

    pageInfo.textContent = `Page ${currentPage + 1} of ${stocks.page.totalPages}`;

    backBtn.disabled = stocks.first;
    nextBtn.disabled = stocks.last;
}

async function getSummary(id){
    try {
        const response = await fetch(`http://localhost:8080/api/v2/${id}/summary2`);
        const data = await response.json();
        renderSummary2(data);
    } catch (error) {
        console.error("Error fetching stock data: "+error);
    }
}

function renderSummary2(stock){
    const tbody = document.querySelector('#summaryTable tbody');
    tbody.innerHTML = '';

    const tr = document.createElement('tr');

        ['total_Invested', 'Total_Value', 'unrealised_Gain_Loss', 'percentage_Gain_Loss', 'yearly_Dividend_Income', 'daily_Change', 'daily_Change_Percentage'].forEach(key => {
            const td = document.createElement('td');
            let value = stock[key];

            if (['percentage_Gain_Loss', 'daily_Change_Percentage'].includes(key)) {
                value = `${parseFloat(value).toFixed(2)}%`;
            } else if (['total_Invested', 'Total_Value', 'unrealised_Gain_Loss', 'yearly_Dividend_Income', 'daily_Change', 'return'].includes(key)){
                value = `$${parseFloat(value).toFixed(2)}`;
            }

            td.textContent = value;

            if (key === 'unrealised_Gain_Loss' || key === 'percentage_Gain_Loss' || key === 'daily_Change' || key === 'daily_Change_Percentage') {
                const numbers = parseFloat(value.replace(/[^0-9.-]/g, ''));
                console.log(numbers);
                if (!isNaN(numbers)){
                    td.style.color = numbers >= 0 ? 'green' : 'red';
                }
            }

            tr.appendChild(td);
        });

    tbody.appendChild(tr);
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
        .then(() =>{ fetchStocks(IDs);})
        .catch(error => console.error("Delete failed:", error));
}


function openAddPortfolio() {
    document.getElementById("addPortfolio").style.display = "block";
}

async function createPortfolio(){
    let name = document.getElementById("portfolioName").value;

    reRun = 1;

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
