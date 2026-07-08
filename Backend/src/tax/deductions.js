// tax/deductions.js
function applyCap(amount, cap) {
    if (cap === undefined || cap === null) return amount;
    return Math.min(amount, cap);
}

export function calculateEligibleDeductions(input, regime, ayConfig) {
    const deductionInputs = input?.deductionInputs || {};
    const caps = ayConfig?.deductionCaps || {};
    const allowedByRegime = ayConfig?.allowedDeductionsByRegime;

    if (!allowedByRegime) {
        throw new Error(
            "ayConfig.allowedDeductionsByRegime is required, e.g. { old: [...], new: [...] }"
        );
    }

    const allowedSections = allowedByRegime[regime] || [];

    let total = 0;

    for (const section of allowedSections) {
        const rawValue = deductionInputs[section] || 0;

        if (section === "section80CCD2" && caps.section80CCD2Pct) {
            const basicPlusDA =
                (input?.salary?.basic || 0) +
                (input?.salary?.dearnessAllowance || 0);
            const cap = caps.section80CCD2Pct * basicPlusDA;
            total += applyCap(rawValue, cap);
            continue;
        }

        const cap = caps[section];
        total += applyCap(rawValue, cap);
    }

    return total;
}