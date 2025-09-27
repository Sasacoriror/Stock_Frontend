function Input(){

    let current_Price = document.getElementById("currentSharePrice").value;
    let FCF_Input = document.getElementById("FCF").value;
    let growth_Input = document.getElementById("Growth").value;
    let years_Input = document.getElementById("Years").value;
    let discount_Input = document.getElementById("Discount").value;

    const growthSum = growth_Input/100;
    const discountSum = discount_Input/100;

    calculate(FCF_Input, years_Input, discountSum, growthSum, current_Price);
}

function calculate(FCF, years, discount, growth, price){

    let FCF_Sum = 0;

    for (let i = 1; i <= years; i++){

        const dccf = FCF/ Math.pow(1+discount, i);
        FCF_Sum += dccf;
        FCF *= (1+growth);
    }

    let ut = ""
    if (FCF_Sum > price){
        ut+="Undervalued";
    }else {
        ut+="Overvalued";
    }

    const percentage = ((FCF_Sum - price) / FCF_Sum) * 100;
    let skrivUt = "Intrinsic value: $"+FCF_Sum.toFixed(2)+"\n"+ut+": "+percentage.toFixed(0)+"%";

    document.getElementById('value').innerText = skrivUt;
}