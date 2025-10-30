fetch("../Index/index.html")
      .then(res => res.text())
      .then(data => {
          document.getElementById("navbar").innerHTML = data;
          const link = document.createElement("link");
          link.rel = "stylesheet";
          link.href = "../Index/navbar.css";
          document.head.appendChild(link);

          initThemeToggle(); // call function AFTER navbar is ready
      });

function run(){
    genTableData();
    genChartData();
}

function getData(){
    let stockPrice = parseFloat(document.getElementById("stockPrice").value);
    let annualDividend = parseFloat(document.getElementById("annualDividend").value);
    const dividendCAGR = parseFloat(document.getElementById("dividendCAGR").value) / 100;
    const stockPriceCAGR = parseFloat(document.getElementById("stockPriceCAGR").value) / 100;
    const amountToInvest = parseFloat(document.getElementById("amountToInvest").value);
    const investmentFrequency = document.getElementById("investmentFrequency").value;
    const dividendReinvestment = document.getElementById("dividendReinvestment").value === "yes";

    if(isNaN(stockPrice) || isNaN(annualDividend) || isNaN(dividendCAGR) || isNaN(stockPriceCAGR) || isNaN(amountToInvest)){
        alert("All boxes must be filled inn!");
        return null;
    }

    return {stockPrice, annualDividend, dividendCAGR, stockPriceCAGR, amountToInvest, investmentFrequency, dividendReinvestment}
}

function genTableData(){
    let data = getData();
    if(!data){
        return;
    }

    let {stockPrice, annualDividend, dividendCAGR, stockPriceCAGR,
     amountToInvest, investmentFrequency, dividendReinvestment} = data;

    const totalYears = 50;
    let moneyPutInn = amountToInvest;
    let YOC = 0;
    let total_Value = 0;
    const stockPriceGrowth = Math.pow(1 + stockPriceCAGR, 1 / 1);

    let totalShares = 0;
    if (investmentFrequency === "oneTime") {
        totalShares = amountToInvest / stockPrice;
    }

    let results = [];
    for(let period = 1; period <= totalYears; period++){
        stockPrice *= stockPriceGrowth;

        if(investmentFrequency === "monthly") {
            totalShares += (amountToInvest * 12) / stockPrice;
            //console.log("Total shares 1: "+totalShares);
            moneyPutInn += amountToInvest * 12;
            if(period === 1){
                moneyPutInn -=amountToInvest;
            }
        }

        if(dividendReinvestment){
            const dividendPayment = annualDividend * totalShares;
            const dripShares = dividendPayment / stockPrice;
            totalShares += dripShares;
        }

        total_Value = totalShares * stockPrice;

        if(period % 1 === 0){
            let currentYear = period / 1;
            if(currentYear % 5 === 0){
                let annualDividendIncome = totalShares * annualDividend;
                YOC = (annualDividendIncome / moneyPutInn) * 100;
                results.push({
                    year: currentYear,
                    investedAmount: moneyPutInn.toFixed(2),
                    annualDividendIncome: annualDividendIncome.toFixed(2),
                    yieldOnCost: YOC.toFixed(2),
                    totalValue: total_Value.toFixed(2)
                });
            }
            annualDividend *= 1 + dividendCAGR;
        }
    }
    createTable(results);
}

function createTable(data){
    const tableContainer = document.getElementById("tableContainer");
    tableContainer.innerHTML = "";

    const table = document.createElement("table");
    const thead = document.createElement("thead");
    const tbody = document.createElement("tbody");

   thead.innerHTML = `
       <tr>
           <th>Years</th>
           <th>Invested Amount</th>
           <th>Annual Dividend Income</th>
           <th>Yield On Cost</th>
           <th>Total Value</th>
       </tr>`;

   data.forEach(row => {
       const tr = document.createElement("tr");
       tr.innerHTML = `
           <td>${row.year}</td>
           <td>$${row.investedAmount}</td>
           <td>$${row.annualDividendIncome}</td>
           <td>%${row.yieldOnCost}</td>
           <td>$${row.totalValue}</td>`
       tbody.appendChild(tr);
   });

   table.appendChild(thead);
   table.appendChild(tbody);
   tableContainer.appendChild(table);

}

function genChartData(){
    let data = getData();
    if(!data){
        return;
    }

    let {stockPrice, annualDividend, dividendCAGR, stockPriceCAGR,
     amountToInvest, investmentFrequency, dividendReinvestment} = data;

    const totalYears = 50;
    const dividendPayment = 0;

    let total_Value_Reinvestment = 0;
    let total_Value_No_Reinvestment = 0;

    const stockPriceGrowth = Math.pow(1 + stockPriceCAGR, 1 / 1);

    let totalSharesReinvestment = 0;
    let totalSharesNoReinvestment = 0;

    if (investmentFrequency === "oneTime") {
        totalSharesReinvestment = amountToInvest / stockPrice;
        totalSharesNoReinvestment = amountToInvest / stockPrice;
    }

    let years = [];
    let withReinvestment = [];
    let noReinvestment = [];
    let valueWithReinvestment = [];
    let valueWithNoReinvestment = [];

    for(let period = 1; period <= 50; period++){
        stockPrice *= stockPriceGrowth;

        if(investmentFrequency === "monthly") {
            totalSharesReinvestment += (amountToInvest * 12) / stockPrice;
            totalSharesNoReinvestment += (amountToInvest * 12) / stockPrice;
        }

        const dividendPayment = annualDividend * totalSharesReinvestment;
        const dripShares = dividendPayment / stockPrice;
        totalSharesReinvestment += dripShares;

        total_Value_Reinvestment = totalSharesReinvestment * stockPrice;
        total_Value_No_Reinvestment = totalSharesNoReinvestment * stockPrice;

        if(period % 1 === 0){
            let currentYear = period / 1;
            if(currentYear % 2 === 0){
                let annualDividendNoReinvestment = totalSharesNoReinvestment * annualDividend;
                let annualDividendReinvestment = totalSharesReinvestment * annualDividend;

                years.push(period);
                noReinvestment.push(annualDividendNoReinvestment);
                withReinvestment.push(annualDividendReinvestment);

                valueWithNoReinvestment.push(total_Value_No_Reinvestment);
                valueWithReinvestment.push(total_Value_Reinvestment);
            }
        }
        annualDividend *= 1 + dividendCAGR;
    }
    genChartDividend(years, withReinvestment, noReinvestment)
    genChartValue(years, valueWithReinvestment, valueWithNoReinvestment)
}


function genChartDividend(years, reinvestedDividends, noReinvestedDividends){
    const ctx = document.getElementById("dividendChart").getContext("2d");
    if (window.dividendChartInstance) window.dividendChartInstance.destroy();

    window.dividendChartInstance = new Chart(ctx, {
        type: "line",
        data: {
            labels: years,
            datasets: [
                {
                    label: "Annual Dividend (With Reinvestment)",
                    data: reinvestedDividends,
                    borderColor: "blue",
                    backgroundColor: "rgba(0, 0, 255, 0.2)",
                    fill: true
                },
                {
                    label: "Annual Dividend (Without Reinvestment)",
                    data: noReinvestedDividends,
                    borderColor: "red",
                    backgroundColor: "rgba(255, 0, 0, 0.2)",
                    fill: true
                }
            ]
        },
        options: {
            responsive: true,
            aspectRatio: 3,
            scales: {
                x: { title: { display: true, text: "Year" } },
                y: { title: { display: true, text: "Annual Dividend Income ($)" }, beginAtZero: true }
            }
        }
    });
}

function genChartValue(years, valueWithReinvestment, valueWithNoReinvestment){

    const ctx = document.getElementById("valueChart").getContext("2d");
    if (window.valueChartInstance) window.valueChartInstance.destroy();

    window.valueChartInstance = new Chart(ctx, {
        type: "line",
        data: {
            labels: years,
            datasets: [
                {
                    label: "Annual Value (With Reinvestment)",
                    data: valueWithReinvestment,
                    borderColor: "blue",
                    backgroundColor: "rgba(0, 0, 255, 0.2)",
                    fill: true
                },
                {
                    label: "Annual Value (Without Reinvestment)",
                    data: valueWithNoReinvestment,
                    borderColor: "red",
                    backgroundColor: "rgba(255, 0, 0, 0.2)",
                    fill: true
                }
            ]
        },
        options: {
            responsive: true,
            aspectRatio: 3,
            scales: {
                x: { title: { display: true, text: "Year" } },
                y: { title: { display: true, text: "Annual Value ($)" }, beginAtZero: true }
            }
        }
    });
}
