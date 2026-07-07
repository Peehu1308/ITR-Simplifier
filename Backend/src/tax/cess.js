export function calculateCess(taxBeforeCess, ayConfig) {
    const cessRate = ayConfig?.cessRate;

    if (cessRate === undefined || cessRate === null) {
        throw new Error("ayConfig.cessRate is required, e.g. 0.04 for 4%");
    }
    if (taxBeforeCess <= 0) return 0;
    return taxBeforeCess * cessRate;
}