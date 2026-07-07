
export const ayConfig2026_27 = {
    standardDeduction: {
        old: 50000,
        new: 75000,
    },
 
    deductionCaps: {
        section80C: 150000,
        section80CCD1B: 50000,
        section80CCD2Pct: 0.14,
        section80D: 25000,
        section80TTA: 10000,
        section80TTB: 50000,
    },
 
    allowedDeductionsByRegime: {
        old: [
            "section80C",
            "section80CCD1B",
            "section80CCD2",
            "section80D",
            "section80TTA",
            "section80TTB",
            "section80E",
            "section80G",
        ],
        new: ["section80CCD2", "section80JJAA"],
    },
 
    slabs: {
        old: [
            { upto: 250000, rate: 0 },
            { upto: 500000, rate: 0.05 },
            { upto: 1000000, rate: 0.2 },
            { upto: Infinity, rate: 0.3 },
        ],
        new: [
            { upto: 300000, rate: 0 },
            { upto: 700000, rate: 0.05 },
            { upto: 1000000, rate: 0.1 },
            { upto: 1200000, rate: 0.15 },
            { upto: 1500000, rate: 0.2 },
            { upto: Infinity, rate: 0.3 },
        ],
    },
 
    rebate87A: {
        old: { incomeThreshold: 500000, maxRebate: 12500 },
        new: { incomeThreshold: 1200000, maxRebate: 60000 },
    },
 
    surchargeSlabs: {
        old: [
            { above: 5000000, upto: 10000000, rate: 0.1 },
            { above: 10000000, upto: 20000000, rate: 0.15 },
            { above: 20000000, upto: 50000000, rate: 0.25 },
            { above: 50000000, upto: Infinity, rate: 0.37 },
        ],
        new: [
            { above: 5000000, upto: 10000000, rate: 0.1 },
            { above: 10000000, upto: 20000000, rate: 0.15 },
            { above: 20000000, upto: Infinity, rate: 0.25 },
        ],
    },
 
    cessRate: 0.04,
};