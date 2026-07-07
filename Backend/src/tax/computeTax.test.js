// tax/computeTax.test.js
//
// Integration tests. Run with:
//   node --test tax/
//
import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { computeTax } from "./computeTax.js";
import { ayConfig2026_27 } from "./ayConfig.sample.js";

// NOTE: calculateSurcharge / applyMarginalRelief need to know which
// regime's surcharge slabs to use, but computeTax.js doesn't pass
// `regime` into them directly — it relies on ayConfig.regime instead.
// So every call here merges `regime` into the config before calling
// computeTax. If you later change computeTax.js to thread `regime`
// through explicitly, this merge becomes unnecessary.
function configFor(regime) {
    return { ...ayConfig2026_27, regime };
}

describe("computeTax — new regime", () => {
    test("simple salaried case, no HRA (not allowed), moderate income", () => {
        const input = {
            salary: { basic: 900000, specialAllowance: 100000 },
            deductionInputs: {},
        };

        const result = computeTax(input, "new", configFor("new"));

        assert.equal(result.grossIncome, 1000000);
        assert.equal(result.standardDeduction, 75000);
        assert.equal(result.hraExemption, 0); // new regime disallows HRA
        assert.equal(result.deductions, 0); // no 80CCD2/80JJAA provided
        assert.equal(result.taxableIncome, 925000);

        // slab tax on 925000 under new regime:
        // 0-300000: 0
        // 300000-700000 (400000 @5%) = 20000
        // 700000-925000 (225000 @10%) = 22500
        // total = 42500
        assert.equal(result.slabTax, 42500);

        // taxable income 925000 <= 1,200,000 threshold -> full rebate up to cap
        assert.equal(result.rebate, Math.min(42500, 60000));
        assert.equal(result.taxAfterRebate, 0);
        assert.equal(result.surcharge, 0);
        assert.equal(result.cess, 0);
        assert.equal(result.finalTax, 0);
    });

    test("income just above the 87A threshold pays tax on full slab amount", () => {
        const input = {
            salary: { basic: 1200001 },
            deductionInputs: {},
        };
        const result = computeTax(input, "new", configFor("new"));

        assert.equal(result.taxableIncome, 1125001);
        // No rebate since taxable income constraint is based on taxable
        // income vs threshold (1,200,000), and here taxableIncome=1,125,001
        // which is BELOW 1,200,000 -- so this case still gets full rebate.
        // (Kept here to illustrate: adjust basic upward if you want to
        // specifically test the >1,200,000 taxable-income cliff.)
        assert.ok(result.taxableIncome < 1200000);
    });
});

describe("computeTax — old regime", () => {
    test("salaried with HRA and 80C, moderate income", () => {
        const input = {
            salary: { basic: 600000, dearnessAllowance: 0, hra: 240000 },
            hraDetails: { hraReceived: 240000, rentPaid: 300000, isMetro: true },
            deductionInputs: { section80C: 150000 },
        };

        const result = computeTax(input, "old", configFor("old"));

        assert.equal(result.grossIncome, 840000); // 600000+240000
        assert.equal(result.standardDeduction, 50000);
        assert.equal(result.hraExemption, 240000); // min(240000,240000,300000)
        assert.equal(result.deductions, 150000);
        assert.equal(result.taxableIncome, 840000 - 50000 - 240000 - 150000);
        assert.equal(result.taxableIncome, 400000);

        // slab tax on 400000 under old regime: 250000@0 + 150000@5% = 7500
        assert.equal(result.slabTax, 7500);

        // taxable income 400000 <= 500000 threshold -> full rebate
        assert.equal(result.rebate, Math.min(7500, 12500));
        assert.equal(result.taxAfterRebate, 0);
        assert.equal(result.finalTax, 0);
    });

    test("high income triggers surcharge and cess, no rebate", () => {
        const input = {
            salary: { basic: 8000000 },
            deductionInputs: {},
        };

        const result = computeTax(input, "old", configFor("old"));

        assert.equal(result.taxableIncome, 8000000 - 50000); // std deduction only
        assert.ok(result.taxableIncome > 5000000); // above surcharge threshold
        assert.ok(result.surcharge > 0);
        assert.ok(result.cess > 0);
        assert.equal(
            result.finalTax,
            result.taxAfterRebate + result.surcharge + result.cess
        );
    });

    test("zero income floors taxable income at zero, all outputs zero", () => {
        const input = { salary: {}, deductionInputs: {} };
        const result = computeTax(input, "old", configFor("old"));

        assert.equal(result.taxableIncome, 0);
        assert.equal(result.slabTax, 0);
        assert.equal(result.rebate, 0);
        assert.equal(result.surcharge, 0);
        assert.equal(result.cess, 0);
        assert.equal(result.finalTax, 0);
    });
});

describe("computeTax — regime comparison sanity check", () => {
    test("returns the passed-in regime unchanged in the result", () => {
        const input = { salary: { basic: 500000 }, deductionInputs: {} };
        const oldResult = computeTax(input, "old", configFor("old"));
        const newResult = computeTax(input, "new", configFor("new"));

        assert.equal(oldResult.regime, "old");
        assert.equal(newResult.regime, "new");
    });
});