
export function calculateStandardDeduction(regime, ayConfig) {
    const config = ayConfig?.standardDeduction;
 
    if (!config) {
        throw new Error(
            "ayConfig.standardDeduction is required (e.g. { old: 50000, new: 75000 })"
        );
    }
 
    return regime === "new" ? config.new : config.old;
}
 