
import { calculateSlabTax } from "./slabTax.js";
 
export function applyMarginalRelief(
    taxableIncome,
    taxAfterRebate,
    surcharge,
    ayConfig
) {
    if (surcharge <= 0) return surcharge;
 
    const regime = ayConfig?.regime;
    const slabs =
        ayConfig?.surchargeSlabs?.[regime] ||
        ayConfig?.surchargeSlabs?.default ||
        ayConfig?.surchargeSlabs;
 
    if (!slabs || !Array.isArray(slabs)) {
        throw new Error(
            "ayConfig.surchargeSlabs must resolve to an array of { above, upto, rate }"
        );
    }
 
    const applicableSlab = slabs.find(
        (slab) => taxableIncome > slab.above && taxableIncome <= slab.upto
    );
 
    if (!applicableSlab) return surcharge;
 
    const threshold = applicableSlab.above;
    const incomeOverThreshold = taxableIncome - threshold;
 
    // Tax-after-rebate at exactly the threshold income (surcharge doesn't
    // apply below the threshold, so this is just the slab tax at that point).
    const taxAtThreshold = calculateSlabTax(threshold, regime, ayConfig);
 
    const maxAllowedTax = taxAtThreshold + incomeOverThreshold;
    const actualTax = taxAfterRebate + surcharge;
 
    const relief = Math.max(0, actualTax - maxAllowedTax);
 
    return Math.max(0, surcharge - relief);
}
 