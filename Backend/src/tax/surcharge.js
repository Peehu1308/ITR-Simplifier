
export function calculateSurcharge(taxableIncome, taxAfterRebate, ayConfig) {
    const slabs =
        ayConfig?.surchargeSlabs?.[ayConfig?.regime] ||
        ayConfig?.surchargeSlabs?.default ||
        ayConfig?.surchargeSlabs;
 
    if (!slabs || !Array.isArray(slabs)) {
        throw new Error(
            "ayConfig.surchargeSlabs must resolve to an array of { above, upto, rate }"
        );
    }
 
    if (taxAfterRebate <= 0) return 0;
 
    const applicableSlab = slabs.find(
        (slab) => taxableIncome > slab.above && taxableIncome <= slab.upto
    );
 
    if (!applicableSlab) return 0;
 
    return taxAfterRebate * applicableSlab.rate;
}