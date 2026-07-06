

export function computeTax(input,regime,ayConfig){
    const grossIncome=calculateGrossIncome(input);

    const standardDeduction=calculateStandardDeduction(regime,ayConfig);

    const hraExemption=calculateHRAExemption(input ,regime);

    const deduction=calaculateEligibilityDeduction(input,regime,ayConfig);

    let taxableIncome=grossIncome-standardDeduction-hraExemption-deduction;

    taxableIncome=Math.max(0,taxableIncome);

    const slabTax=calculateSlabTax(
        taxableIncome,
        regime,ayConfig
    );

    const rebate=calculateRebate(
        taxableIncome,
        slabTax,
        regime,ayConfig
    );

    let taxAfterRebate=Math.max(0,slabTax-rebate);

    let surcharge=calculateSurcharge(
        taxableIncome,
        taxAfterRebate,
        ayConfig
    );

    surcharge=applyMarginalRelief(
        taxableIncome,
        taxAfterRebate,
        surcharge,
        ayConfig,
    );

    const cess=calculateCess(
        taxAfterRebate+surcharge,
        ayConfig
    );

    const finalTax=taxAfterRebate+surcharge+cess;

    return {
        regime,grossIncome,standardDeduction,hraExemption,deduction,taxableIncome,slabTax,rebate,taxAfterRebate,surcharge,cess,finalTax
    };
}