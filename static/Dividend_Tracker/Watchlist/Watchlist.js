const apiUrl = "http://localhost:8080/api/v1/Watchlist";

async function fetchWatchlist() {
    try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        renderTable(data);
        renderSummary(data);
    } catch (error) {
         const summaryElement = document.getElementById("summary");
            const count = data.length;
            summaryElement.textContent = `You have ${count} stocks in your watchlist.`;
    }
}

function renderTable(watchList) {
    const tbody = document.querySelector('#watchlistTable tbody');
    tbody.innerHTML = '';

    watchList.forEach((watchlist) => {
        const tr = document.createElement('tr');

        ['stockTickerInn', 'companyName', 'latestPrice', 'marcet_Cap', 'dividendYield'].forEach(key => {
            const td = document.createElement('td');
            let value = watchlist[key];

            if (['marcet_Cap'].includes(key)){
                value = parseFloat(value);

                if (key === 'marcet_Cap') {
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
            } else if(['latestPrice'].includes(key)){
                value = `$${parseFloat(value).toFixed(2)}`;
            }

            if (['dividendYield'].includes(key)){
                value = `${parseFloat(value).toFixed(2)}%`;
            }

            td.textContent = value;
            tr.appendChild(td);
        });

        const actionTd = document.createElement('td');
        actionTd.innerHTML = `
            <button class="delete-btn" onclick="deleteRow('${watchlist.id}')">Delete</button>
        `;
        tr.dataset.id = watchlist.id;
        tr.appendChild(actionTd);
        tbody.appendChild(tr);
    });
}

function deleteRow(id) {
    fetch(`http://localhost:8080/api/v1/deleteWatchlist/${id}`, {
        method: 'DELETE'
    })
        .then(() => fetchWatchlist())
        .catch(error => console.error("Delete failed:", error));
}

fetchWatchlist();

