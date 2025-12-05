const apiUrl = "http://localhost:8080/api/v1/Watchlist";

document.addEventListener("DOMContentLoaded", () => {
            fetch("../Sidebar/Sidebar.html")
                .then(response => response.text())
                .then(data => {
                    document.getElementById("sidebar").innerHTML = data;
                    const link = document.createElement("link");
                    document.head.appendChild(link);
                });
        });


let pageSize = 10;
let currentPage = 0;

const rowSelect = document.getElementById('rowsPerPage');
const backBtn = document.getElementById('back-btn');
const nextBtn = document.getElementById('next-btn');
const pageInfo = document.getElementById('pageInfo');

rowSelect.addEventListener('change', ()=> {
    pageSize = parseInt(rowSelect.value);
    currentPage = 0;
    fetchWatchlist();
});

backBtn.addEventListener('click', () => {
    if (currentPage > 0){
        currentPage--;
        fetchWatchlist();
    }
});

nextBtn.addEventListener('click', () => {
    if (!nextBtn.disabled){
        currentPage++;
        fetchWatchlist();
    }
});

async function fetchWatchlist() {
    try {
        const response = await fetch(`${apiUrl}?page=${currentPage}&size=${pageSize}`);
        const data = await response.json();
        renderTable(data);
    } catch (error) {
        alert("Problem with the watchlist: "+error)
    }
}

function renderTable(watchList) {

    const tbody = document.querySelector('#watchlistTable tbody');
    tbody.innerHTML = '';

    watchList.content.forEach((item) => {
        const tr = document.createElement('tr');

        const fields = ['stockTickerInn', 'companyName', 'latestPrice', 'change_Price', 'change_Percentage', 'weeksRange','dividendYield', 'PE_Ratio', 'market_Cap'];


        fields.forEach(key => {
            const td = document.createElement('td');
            let value = item[key];

            if (key === 'weeksRange') {
                value = `$${item.low} - $${item.High}`;
            }

            if (['market_Cap'].includes(key)){
                value = parseFloat(value);

                if (key === 'market_Cap') {
                if (value >= 1e12) {
                    value = `$${(value / 1e12).toFixed(2)}T`;
                } else if (value >= 1e9) {
                    value = `$${(value / 1e9).toFixed(2)}B`;
                } else if (value >= 1e6) {
                    value = `$${(value / 1e6).toFixed(2)}M`;
                } else if (value >= 1e3) {
                    value = `$${(value / 1e3).toFixed(2)}K`;
                }
                }
            } else if(['latestPrice', 'change_Price'].includes(key)){
                value = `$${parseFloat(value).toFixed(2)}`;
            }

            if (['change_Percentage', 'dividendYield'].includes(key)){
                value = `${parseFloat(value).toFixed(2)}%`;
            }

            td.textContent = value;
            tr.appendChild(td);
        });

        const actionTd = document.createElement('td');
        actionTd.innerHTML = `
            <button class="delete-btn" onclick="deleteRow('${item.id}')">Delete</button>
        `;
        tr.dataset.id = item.id;
        tr.appendChild(actionTd);
        tbody.appendChild(tr);
    });

    pageInfo.textContent = `Page ${currentPage + 1} of ${watchList.totalPages}`;

    backBtn.disabled = watchList.first;
    nextBtn.disabled = watchList.last;
    
}

function deleteRow(id) {
    fetch(`http://localhost:8080/api/v1/deleteWatchlist/${id}`, {
        method: 'DELETE'
    })
        .then(() => fetchWatchlist())
        .catch(error => console.error("Delete failed:", error));
}

fetchWatchlist();