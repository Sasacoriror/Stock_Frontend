const apiURL = "http://localhost:8080/api/v2/dividend_Summary";

document.addEventListener("DOMContentLoaded", () => {
            fetch("../Sidebar/Sidebar.html")
                .then(response => response.text())
                .then(data => {
                    document.getElementById("sidebar").innerHTML = data;
                    const link = document.createElement("link");
                    document.head.appendChild(link);
                });
        });

async function getDividendData() {
    try {
        const response = await fetch(apiURL);
        const data = await response.json();
        renderDividendTable(data);
    } catch (error) {
        alert("Problem: "+error);
    }
}

function renderDividendTable(dividends) {
    const tbody = document.querySelector('#dividendTable tbody');
    tbody.innerHTML = '';

    const tr = document.createElement('tr');

    ['Annual_Dividend', 'Monthly_Dividend', 'Days_Dividend', 'Hourly_Dividend', 'Yield_On_Cost'].forEach(key => {
        const td = document.createElement('td');
        let value = dividends[key];

        if(['Annual_Dividend', 'Monthly_Dividend', 'Days_Dividend', 'Hourly_Dividend'].includes(key)){
                value = `$${parseFloat(value).toFixed(2)}`;
            }
        if (['Yield_On_Cost'].includes(key)){
                value = `${parseFloat(value).toFixed(2)}%`;
            }

        td.textContent = value;
            tr.appendChild(td);
     });

     tbody.appendChild(tr);
}

getDividendData();