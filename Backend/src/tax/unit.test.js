// tax/unit.test.js
//
// Unit tests for each helper in isolation. Run with:
//   node --test tax/
//
import { test, describe } from "node:test";
import assert from "node:assert/strict";

import { calculateGrossIncome } from "./grossIncome.js";
import { calculateStandardDeduction } from "./standardDeduction.js";
import { calculateHRAExemption } from "./hra.js";
import { calculateEligibleDeductions } from "./deductions.js";
import { calculateSlabTax } from "./slabTax.js";
import { calculateRebate } from "./rebate.js";
import { calculateSurcharge } from "./surcharge.js";
import { applyMarginalRelief } from "./marginalRelief.js";
import { calculateCess } from "./cess.js";
import { ayConfig2026_27 } from "./ayConfig.sample.js";

describe("calculateGrossIncome", () => {
    test("sums salary, house property, capital gains, business, other sources", () => {
        const input = {
            salary: { basic: 600000, hra: 240000, specialAllowance: 100000 },
            houseProperty: {
                rentReceived: 240000,
                municipalTaxesPaid: 20000,
                homeLoanInterestLetOut: 50000,
            },
            capitalGains: { shortTerm: 20000, longTerm: 30000 },
            businessIncome: 0,
            otherSources: { interest: 5000, dividends: 2000 },
        };

        // salary: 600000+240000+100000 = 940000
        // house property NAV: 240000-20000 = 220000; -30% (66000); -interest 50000
        //   => 220000 - 66000 - 50000 = 104000
        // capital gains: 50000
        // other sources: 7000
        const expected = 940000 + 104000 + 50000 + 0 + 7000;

        assert.equal(calculateGrossIncome(input), expected);
    });

    test("returns 0 for empty input", () => {
        assert.equal(calculateGrossIncome({}), 0);
    });

    test("house property loss can go negative and still sum in", () => {
        const input = {
            houseProperty: {
                rentReceived: 0,
                municipalTaxesPaid: 0,
                homeLoanInterestLetOut: 200000,
            },
        };
        // NAV = 0, 30% std ded = 0, minus interest 200000 => -200000
        assert.equal(calculateGrossIncome(input), -200000);
    });
});

describe("calculateStandardDeduction", () => {
    test("old regime", () => {
        assert.equal(calculateStandardDeduction("old", ayConfig2026_27), 50000);
    });
    test("new regime", () => {
        assert.equal(calculateStandardDeduction("new", ayConfig2026_27), 75000);
    });
    test("throws if config missing", () => {
        assert.throws(() => calculateStandardDeduction("old", {}));
    });
});

describe("calculateHRAExemption", () => {
    test("returns 0 under new regime regardless of input", () => {
        const input = {
            salary: { basic: 600000 },
            hraDetails: { hraReceived: 240000, rentPaid: 300000, isMetro: true },
        };
        assert.equal(calculateHRAExemption(input, "new"), 0);
    });

    test("old regime, metro, takes the minimum of the three limits", () => {
        const input = {
            salary: { basic: 600000, dearnessAllowance: 0 },
            hraDetails: { hraReceived: 240000, rentPaid: 300000, isMetro: true },
        };
        // actual HRA = 240000
        // rent - 10% basic = 300000 - 60000 = 240000
        // 50% of basic = 300000
        // min(240000, 240000, 300000) = 240000
        assert.equal(calculateHRAExemption(input, "old"), 240000);
    });

    test("old regime, non-metro, rent-minus-10pct is the binding constraint", () => {
        const input = {
            salary: { basic: 400000, dearnessAllowance: 0 },
            hraDetails: { hraReceived: 200000, rentPaid: 150000, isMetro: false },
        };
        // actual HRA = 200000
        // rent - 10% basic = 150000 - 40000 = 110000
        // 40% of basic = 160000
        // min = 110000
        assert.equal(calculateHRAExemption(input, "old"), 110000);
    });

    test("returns 0 if no rent paid", () => {
        const input = {
            salary: { basic: 400000 },
            hraDetails: { hraReceived: 100000, rentPaid: 0, isMetro: true },
        };
        assert.equal(calculateHRAExemption(input, "old"), 0);
    });
});

describe("calculateEligibleDeductions", () => {
    test("old regime sums and caps multiple sections", () => {
        const input = {
            deductionInputs: {
                section80C: 200000, // capped to 150000
                section80D: 30000, // capped to 25000
                section80TTA: 5000, // under cap, passes through
            },
        };
        const total = calculateEligibleDeductions(input, "old", ayConfig2026_27);
        assert.equal(total, 150000 + 25000 + 5000);
    });

    test("new regime only allows 80CCD2 and 80JJAA", () => {
        const input = {
            salary: { basic: 1000000, dearnessAllowance: 0 },
            deductionInputs: {
                section80C: 150000, // should be ignored under new regime
                section80CCD2: 200000, // capped at 14% of basic = 140000
                section80JJAA: 10000,
            },
        };
        const total = calculateEligibleDeductions(input, "new", ayConfig2026_27);
        assert.equal(total, 140000 + 10000);
    });

    test("throws if allowedDeductionsByRegime missing", () => {
        assert.throws(() =>
            calculateEligibleDeductions({}, "old", { deductionCaps: {} })
        );
    });
});

describe("calculateSlabTax", () => {
    test("new regime, income within the 0% slab", () => {
        assert.equal(calculateSlabTax(250000, "new", ayConfig2026_27), 0);
    });

    test("new regime, income spanning multiple slabs", () => {
        // 1,000,000 taxable income under new regime slabs:
        // 0-300000: 0
        // 300000-700000 (400000 @ 5%) = 20000
        // 700000-1000000 (300000 @ 10%) = 30000
        // total = 50000
        assert.equal(calculateSlabTax(1000000, "new", ayConfig2026_27), 50000);
    });

    test("old regime, income spanning multiple slabs", () => {
        // 800000 taxable income under old regime slabs:
        // 0-250000: 0
        // 250000-500000 (250000 @ 5%) = 12500
        // 500000-800000 (300000 @ 20%) = 60000
        // total = 72500
        assert.equal(calculateSlabTax(800000, "old", ayConfig2026_27), 72500);
    });

    test("zero income => zero tax", () => {
        assert.equal(calculateSlabTax(0, "old", ayConfig2026_27), 0);
    });

    test("throws for unknown regime", () => {
        assert.throws(() =>
            calculateSlabTax(100000, "unknown", ayConfig2026_27)
        );
    });
});

describe("calculateRebate", () => {
    test("new regime, income at threshold gets full rebate up to cap", () => {
        const slabTax = calculateSlabTax(1200000, "new", ayConfig2026_27);
        const rebate = calculateRebate(1200000, slabTax, "new", ayConfig2026_27);
        assert.equal(rebate, Math.min(slabTax, 60000));
    });

    test("new regime, income just above threshold gets zero rebate", () => {
        const slabTax = calculateSlabTax(1200001, "new", ayConfig2026_27);
        const rebate = calculateRebate(1200001, slabTax, "new", ayConfig2026_27);
        assert.equal(rebate, 0);
    });

    test("old regime, income at threshold", () => {
        const slabTax = calculateSlabTax(500000, "old", ayConfig2026_27);
        const rebate = calculateRebate(500000, slabTax, "old", ayConfig2026_27);
        assert.equal(rebate, Math.min(slabTax, 12500));
    });
});

describe("calculateSurcharge", () => {
    test("no surcharge below 50L taxable income", () => {
        const config = { ...ayConfig2026_27, regime: "old" };
        assert.equal(calculateSurcharge(4000000, 900000, config), 0);
    });

    test("10% surcharge between 50L and 1Cr", () => {
        const config = { ...ayConfig2026_27, regime: "old" };
        const surcharge = calculateSurcharge(6000000, 1500000, config);
        assert.equal(surcharge, 1500000 * 0.1);
    });

    test("new regime caps at 25% even above 2Cr", () => {
        const config = { ...ayConfig2026_27, regime: "new" };
        const surcharge = calculateSurcharge(30000000, 8000000, config);
        assert.equal(surcharge, 8000000 * 0.25);
    });

    test("zero tax after rebate => zero surcharge regardless of income", () => {
        const config = { ...ayConfig2026_27, regime: "old" };
        assert.equal(calculateSurcharge(6000000, 0, config), 0);
    });
});

describe("applyMarginalRelief", () => {
    test("no relief needed when well within a surcharge band", () => {
        const config = { ...ayConfig2026_27, regime: "old" };
        // Comfortably above 50L threshold, not at the cliff edge
        const surcharge = calculateSurcharge(8000000, 2000000, config);
        const relieved = applyMarginalRelief(8000000, 2000000, surcharge, config);
        assert.equal(relieved, surcharge); // no relief triggered
    });

    test("relief caps the increase right at the 50L cliff", () => {
        const config = { ...ayConfig2026_27, regime: "old" };
        const threshold = 5000000;
        const justOver = threshold + 100; // barely crossed the threshold

        const taxAtThreshold = calculateSlabTax(threshold, "old", config);
        const taxAfterRebate = calculateSlabTax(justOver, "old", config);
        const rawSurcharge = calculateSurcharge(justOver, taxAfterRebate, config);
        const relieved = applyMarginalRelief(
            justOver,
            taxAfterRebate,
            rawSurcharge,
            config
        );

        const maxAllowedTax = taxAtThreshold + (justOver - threshold);
        const actualTaxWithRelief = taxAfterRebate + relieved;

        assert.ok(
            actualTaxWithRelief <= maxAllowedTax + 1e-6,
            `expected relieved total tax (${actualTaxWithRelief}) to not exceed maxAllowedTax (${maxAllowedTax})`
        );
    });
});

describe("calculateCess", () => {
    test("4% of tax+surcharge", () => {
        assert.equal(calculateCess(100000, ayConfig2026_27), 4000);
    });
    test("zero tax => zero cess", () => {
        assert.equal(calculateCess(0, ayConfig2026_27), 0);
    });
    test("throws if cessRate missing", () => {
        assert.throws(() => calculateCess(100000, {}));
    });
});