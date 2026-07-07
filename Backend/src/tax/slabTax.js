
export function calculateSlabTax(taxableIncome, regime, ayConfig) {
    const slabs = ayConfig?.slabs?.[regime];
 
    if (!slabs || slabs.length === 0) {
        throw new Error(
            `ayConfig.slabs.${regime} is required and must be a non-empty array`
        );
    }
 
    let tax = 0;
    let lowerBound = 0;
 
    for (const slab of slabs) {
        if (taxableIncome <= lowerBound) break;
 
        const upperBound = slab.upto;
        const slabWidth = Math.min(taxableIncome, upperBound) - lowerBound;
 
        if (slabWidth > 0) {
            tax += slabWidth * slab.rate;
        }
 
        lowerBound = upperBound;
    }
 
    return tax;
}
 