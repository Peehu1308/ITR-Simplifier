export function calculateRebate(taxableIncome, slabTax, regime, ayConfig) {
    const rebateConfig = ayConfig?.rebate87A?.[regime];
 
    if (!rebateConfig) {
        throw new Error(
            `ayConfig.rebate87A.${regime} is required, e.g. { incomeThreshold, maxRebate }`
        );
    }
 
    const { incomeThreshold, maxRebate } = rebateConfig;
 
    if (taxableIncome <= incomeThreshold) {
        return Math.min(slabTax, maxRebate);
    }
 
    return 0;
}