// tax/computeTax.js
import { calculateGrossIncome } from "./grossIncome.js";
import { calculateStandardDeduction } from "./standardDeduction.js";
import { calculateHRAExemption } from "./hra.js";
import { calculateEligibleDeductions } from "./deductions.js";
import { calculateSlabTax } from "./slabTax.js";
import { calculateRebate } from "./rebate.js";
import { calculateSurcharge } from "./surcharge.js";
import { applyMarginalRelief } from "./marginalRelief.js";
import { calculateCess } from "./cess.js";
export function computeTax(input, regime, ayConfig) {
    //---------------------------------------
    // 1. Gross Income
    //---------------------------------------
    const grossIncome = calculateGrossIncome(input);
    //---------------------------------------
    // 2. Standard Deduction
    //---------------------------------------
    const standardDeduction =
        calculateStandardDeduction(regime, ayConfig);
    //---------------------------------------
    // 3. HRA Exemption
    //---------------------------------------
    const hraExemption =
        calculateHRAExemption(input, regime);
    //---------------------------------------
    // 4. Chapter VI-A Deductions
    //---------------------------------------
    const deductions =
        calculateEligibleDeductions(
            input,
            regime,
            ayConfig
        );
    //---------------------------------------
    // 5. Taxable Income
    //---------------------------------------
    let taxableIncome =
        grossIncome
        - standardDeduction
        - hraExemption
        - deductions;
    taxableIncome = Math.max(0, taxableIncome);
    //---------------------------------------
    // 6. Slab Tax
    //---------------------------------------
    const slabTax =
        calculateSlabTax(
            taxableIncome,
            regime,
            ayConfig
        );
    //---------------------------------------
    // 7. Rebate
    //---------------------------------------
    const rebate =
        calculateRebate(
            taxableIncome,
            slabTax,
            regime,
            ayConfig
        );
    let taxAfterRebate =
        Math.max(0, slabTax - rebate);
    //---------------------------------------
    // 8. Surcharge
    //---------------------------------------
    let surcharge =
        calculateSurcharge(
            taxableIncome,
            taxAfterRebate,
            ayConfig
        );
    //---------------------------------------
    // 9. Marginal Relief
    //---------------------------------------
    surcharge =
        applyMarginalRelief(
            taxableIncome,
            taxAfterRebate,
            surcharge,
            ayConfig
        );
    //---------------------------------------
    // 10. Cess
    //---------------------------------------
    const cess =
        calculateCess(
            taxAfterRebate + surcharge,
            ayConfig
        );
    //---------------------------------------
    // 11. Final Tax
    //---------------------------------------
    const finalTax =
        taxAfterRebate
        + surcharge
        + cess;
    //---------------------------------------
    // 12. Return Complete Breakdown
    //---------------------------------------
    return {
        regime,
        grossIncome,
        standardDeduction,
        hraExemption,
        deductions,
        taxableIncome,
        slabTax,
        rebate,
        taxAfterRebate,
        surcharge,
        cess,
        finalTax
    };
}