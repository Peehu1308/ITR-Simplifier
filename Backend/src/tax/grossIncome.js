function sumSalaryIncome(salary={}){
    const{
        basic=0,
        hra=0,
        specialAllowance=0,
        bonus=0,
        other=0,
    }=salary;

    return basic+hra+specialAllowance+bonus+other;
}


function calculateNetAnnualValue(houseProperty={}){
    const {
        rentRecieved=0,
        municipalTaxesPaid=0,
    }=houseProperty;

    return Math.max(0,rentRecieved-municipalTaxesPaid);
}

function calculateIncomeFromHouseProperty(houseProperty={}){
    const nav=calculateNetAnnualValue(houseProperty);
    const standardDeduction30Pct = nav * 0.3;
 
    // Interest on home loan for let-out property is fully deductible
    const { homeLoanInterestLetOut = 0 } = houseProperty;
 
    const incomeFromHouseProperty =
        nav - standardDeduction30Pct - homeLoanInterestLetOut;
 
    // House property income/loss can be negative (loss), that's fine —
    // set-off rules are applied later if you choose to model them.
    return incomeFromHouseProperty;
}
 
function sumCapitalGains(capitalGains = {}) {
    const { shortTerm = 0, longTerm = 0 } = capitalGains;
    return shortTerm + longTerm;
}
 
function sumOtherSources(otherSources = {}) {
    const { interest = 0, dividends = 0, other = 0 } = otherSources;
    return interest + dividends + other;
}
 
export function calculateGrossIncome(input = {}) {
    const salaryIncome = sumSalaryIncome(input.salary);
    const houseIncome = calculateIncomeFromHouseProperty(input.houseProperty);
    const capitalGainsIncome = sumCapitalGains(input.capitalGains);
    const businessIncome = input.businessIncome || 0;
    const otherIncome = sumOtherSources(input.otherSources);
 
    const grossIncome =
        salaryIncome +
        houseIncome +
        capitalGainsIncome +
        businessIncome +
        otherIncome;
 
    return grossIncome;
}