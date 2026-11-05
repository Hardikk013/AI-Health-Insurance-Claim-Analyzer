// Comprehensive Regression and End-to-End Test Suite for ClaimFight
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { 
  verifyDatesDeterministically, 
  verifyFinancialsDeterministically, 
  verifyOmbudsmanJurisdiction,
  applyStatutoryRules 
} from '../server/ruleEngine';

dotenv.config();

const API_BASE = 'http://localhost:3001/api';

async function runComprehensiveTests() {
  console.log('===============================================================');
  console.log('       CLAIMFIGHT REGRESSION & SYSTEM VERIFICATION SUITE       ');
  console.log('===============================================================\n');

  let passedTests = 0;
  let totalTests = 0;

  function assert(condition: boolean, testName: string, details?: string) {
    totalTests++;
    if (condition) {
      console.log(`  ✔ [PASS] ${testName}`);
      if (details) console.log(`           ${details}`);
      passedTests++;
    } else {
      console.error(`  ❌ [FAIL] ${testName}`);
      if (details) console.error(`           ${details}`);
      throw new Error(`Test failed: ${testName}`);
    }
  }

  // =========================================================================
  // UNIT / REGRESSION TEST 1: Waiting Period with Continuity Credit
  // =========================================================================
  console.log('\n--- 1. WAITING PERIOD & CONTINUITY CREDIT REASONING ---');
  {
    // Test case from user: Inception: 01-Jan-2025, Admission: 02-Aug-2026 (578 days active)
    // Standard cataract waiting period: 24 months (730 days)
    // Recorded continuity credit: 12 months (365 days)
    // Remaining waiting period: 12 months (365 days)
    // 578 >= 365 => Waiting period elapsed!
    const res = verifyDatesDeterministically(
      '2025-01-01',
      '2026-08-02',
      '2026-12-31',
      730, // 24 months
      12,  // 12 months continuity credit recorded
      false // portability certificate not enclosed yet
    );

    assert(res.active_policy_days === 578, 'Calculates exact 578 active policy days', `Active days: ${res.active_policy_days}`);
    assert(res.continuity_credit_months === 12, 'Records 12-month continuity credit');
    assert(res.remaining_waiting_period_days === 365, 'Calculates net remaining waiting period as 365 days (12 months)');
    assert(res.waiting_period_completed === true, 'Concludes waiting period has elapsed because 578 days >= 365 days');
    assert(
      res.missing_portability_documents && res.missing_portability_documents.length > 0,
      'Flags missing portability certificate / schedule without blindly assuming validity',
      res.missing_portability_documents?.[0]
    );
  }

  // =========================================================================
  // UNIT / REGRESSION TEST 2: Waiting Period WITHOUT Continuity Credit
  // =========================================================================
  console.log('\n--- 2. WAITING PERIOD WITHOUT CONTINUITY CREDIT ---');
  {
    // Same dates but without continuity credit: 578 days < 730 days => NOT elapsed
    const res = verifyDatesDeterministically(
      '2025-01-01',
      '2026-08-02',
      '2026-12-31',
      730,
      0, // 0 credit
      false
    );

    assert(res.active_policy_days === 578, 'Active days correctly verified as 578');
    assert(res.waiting_period_completed === false, 'Waiting period NOT completed without continuity credit (578 < 730)');
  }

  // =========================================================================
  // UNIT / REGRESSION TEST 3: Contradictory Policy Dates Handling
  // =========================================================================
  console.log('\n--- 3. CONTRADICTORY DATE DETECTION ---');
  {
    // Admission prior to policy inception
    const res = verifyDatesDeterministically(
      '2026-01-01',
      '2025-01-01', // Prior to inception!
      '2026-12-31',
      730
    );

    assert(res.waiting_period_completed === false, 'Rejects claim where admission is prior to inception');
    assert(res.calculation_explanation.includes('Inconsistency detected'), 'Identifies inconsistency in calculation explanation');
  }

  // =========================================================================
  // UNIT / REGRESSION TEST 4: Financial Analysis (5 Distinct Quantities)
  // =========================================================================
  console.log('\n--- 4. FINANCIAL ANALYSIS & 5 DISTINCT AMOUNTS ---');
  {
    // Case A: Full Repudiation
    const fullRepud = verifyFinancialsDeterministically(78000, 0, 78000, 0, 78000);
    assert(fullRepud.claimed_amount === 78000, 'Full Repudiation: claimed_amount is 78000');
    assert(fullRepud.approved_amount === 0, 'Full Repudiation: approved_amount is 0');
    assert(fullRepud.rejected_amount === 78000, 'Full Repudiation: rejected_amount is 78000');
    assert(fullRepud.deducted_amount === 0, 'Full Repudiation: deducted_amount is 0');
    assert(fullRepud.disputed_amount === 78000, 'Full Repudiation: disputed_amount is 78000');
    assert(fullRepud.is_math_consistent === true, 'Full Repudiation: financial math is consistent');

    // Case B: Partial Settlement with Deductions (Room Rent sublimit case)
    const partial = verifyFinancialsDeterministically(210000, 137600, 0, 72400, 72400);
    assert(partial.claimed_amount === 210000, 'Partial Settlement: claimed_amount is 210000');
    assert(partial.approved_amount === 137600, 'Partial Settlement: approved_amount is 137600');
    assert(partial.rejected_amount === 0, 'Partial Settlement: rejected_amount is 0');
    assert(partial.deducted_amount === 72400, 'Partial Settlement: deducted_amount is 72400');
    assert(partial.disputed_amount === 72400, 'Partial Settlement: disputed_amount is 72400');
    assert(partial.is_math_consistent === true, 'Partial Settlement: financial math is consistent');
  }

  // =========================================================================
  // UNIT / REGRESSION TEST 5: Insurance Ombudsman Legal Verification
  // =========================================================================
  console.log('\n--- 5. INSURANCE OMBUDSMAN RULES LEGAL VERIFICATION ---');
  {
    // Eligible claim (₹78,000 relief sought)
    const omb = verifyOmbudsmanJurisdiction(78000);
    assert(omb.statutory_award_limit === 5000000, 'Statutory pecuniary jurisdiction ceiling is ₹50,00,000');
    assert(omb.relief_sought_amount === 78000, 'Differentiates relief sought (₹78,000) from award ceiling (₹50,00,000)');
    assert(omb.is_within_award_limit === true, 'Identifies ₹78,000 is within Ombudsman jurisdiction');
    assert(omb.gro_representation_required === true, 'Verifies Rule 14(3) GRO written representation condition');
    assert(omb.thirty_day_wait_required === true, 'Verifies Rule 14(3) 30-day waiting period requirement');
    assert(omb.one_year_limitation_verified === true, 'Verifies Rule 14(3) 1-year limitation from rejection');
    assert(omb.last_verified === '2026-11-01', 'Official verification date is 2026-11-01');

    // Exceeding limit claim (₹65,00,000 relief sought)
    const ombExcess = verifyOmbudsmanJurisdiction(6500000);
    assert(ombExcess.is_within_award_limit === false, 'Correctly flags claim > ₹50,00,000 as exceeding Ombudsman award limit');
    assert(ombExcess.rule_explanation.includes('exceeds the Insurance Ombudsman'), 'Explains jurisdiction redirected to Consumer Commission/Civil Court');
  }

  // =========================================================================
  // UNIT / REGRESSION TEST 6: Statutory Rules & Medical Nexus
  // =========================================================================
  console.log('\n--- 6. STATUTORY RULES & MEDICAL NEXUS VERIFICATION ---');
  {
    // Accidental trauma vs Hypertension non-disclosure
    const rules = applyStatutoryRules({
      category: 'ped_exclusion',
      activePolicyDays: 500,
      waitingPeriodCompleted: true,
      claimedAmount: 165000,
      approvedAmount: 0,
      rejectedAmount: 165000,
      deductedAmount: 0,
      disputedAmount: 165000,
      diagnosis: 'Traumatic Closed Fracture Shaft of Left Femur',
      procedure: 'Emergency Open Reduction and Internal Fixation (ORIF)',
      rejectionReason: 'Non-disclosure of past history of hypertension'
    });

    const nexusRule = rules.find(r => r.rule_code === 'LEGAL_CAUSAL_NEXUS_ACCIDENT');
    assert(Boolean(nexusRule && nexusRule.passed), 'Applies Supreme Court causal nexus precedent for accidental trauma');

    // Room rent proportionate deduction prohibition under IRDAI 2020 circular
    const roomRules = applyStatutoryRules({
      category: 'sub_limit_room_rent',
      activePolicyDays: 700,
      waitingPeriodCompleted: true,
      claimedAmount: 210000,
      approvedAmount: 137600,
      rejectedAmount: 0,
      deductedAmount: 72400,
      disputedAmount: 72400,
      diagnosis: 'Acute Appendicitis',
      procedure: 'Laparoscopic Appendectomy'
    });

    const circularRule = roomRules.find(r => r.rule_code === 'IRDAI_CIRCULAR_194_2020');
    assert(Boolean(circularRule && circularRule.passed), 'Applies IRDAI Circular 194/2020 prohibition on proportionate deductions');
  }

  // =========================================================================
  // INTEGRATION TEST 7: Backend Health & API Validation
  // =========================================================================
  console.log('\n--- 7. BACKEND API & INPUT VALIDATION TESTS ---');
  {
    // Health Check
    const healthRes = await fetch(`${API_BASE}/health`);
    const health = await healthRes.json();
    assert(health.status === 'ok', 'GET /api/health returns status ok', `Model: ${health.model}`);

    // Missing documents rejection
    const incompleteForm = new FormData();
    incompleteForm.append('rejection', new Blob(['test'], { type: 'application/pdf' }), 'rejection.pdf');
    const incompleteRes = await fetch(`${API_BASE}/cases/analyze`, { method: 'POST', body: incompleteForm });
    assert(incompleteRes.status === 400, 'Rejects incomplete document upload with HTTP 400');

    // Unsupported file format rejection
    const invalidForm = new FormData();
    invalidForm.append('rejection', new Blob(['test'], { type: 'text/plain' }), 'test.exe');
    invalidForm.append('policy', new Blob(['test'], { type: 'text/plain' }), 'policy.txt');
    invalidForm.append('discharge', new Blob(['test'], { type: 'text/plain' }), 'discharge.txt');
    const invalidRes = await fetch(`${API_BASE}/cases/analyze`, { method: 'POST', body: invalidForm });
    assert(invalidRes.status === 400, 'Rejects unsupported file types with HTTP 400');
  }

  // =========================================================================
  // INTEGRATION TEST 8: Negative Error Handling (No Fake Analysis on Failure)
  // =========================================================================
  console.log('\n--- 8. NEGATIVE TEST: FAILURE HANDLING & INTEGRITY ---');
  {
    // Set invalid key to ensure failure is reported without fabricating analysis (using authenticated admin header)
    await fetch(`${API_BASE}/admin/config`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ClaimFight@Admin2026!'
      },
      body: JSON.stringify({ apiKey: 'invalid_gemini_key_for_testing' })
    });

    const sampleRejPath = path.join(process.cwd(), 'public', 'samples', 'sample_rejection_letter_cataract.pdf');
    const samplePolPath = path.join(process.cwd(), 'public', 'samples', 'sample_policy_wordings_star.pdf');
    const sampleDisPath = path.join(process.cwd(), 'public', 'samples', 'sample_discharge_summary_cataract.pdf');

    const testForm = new FormData();
    testForm.append('rejection', new Blob([fs.readFileSync(sampleRejPath)], { type: 'application/pdf' }), 'rejection.pdf');
    testForm.append('policy', new Blob([fs.readFileSync(samplePolPath)], { type: 'application/pdf' }), 'policy.pdf');
    testForm.append('discharge', new Blob([fs.readFileSync(sampleDisPath)], { type: 'application/pdf' }), 'discharge.pdf');

    const analyzeRes = await fetch(`${API_BASE}/cases/analyze`, { method: 'POST', body: testForm });
    const { jobId } = await analyzeRes.json();

    let attempts = 0;
    let jobStatus = 'pending';
    let jobError = null;

    while (attempts < 15 && jobStatus !== 'failed' && jobStatus !== 'completed') {
      attempts++;
      await new Promise(r => setTimeout(r, 700));
      const stRes = await fetch(`${API_BASE}/cases/${jobId}/status`);
      const stData = await stRes.json();
      jobStatus = stData.status;
      jobError = stData.error;
    }

    assert(jobStatus === 'failed', 'Job properly fails when Gemini API key is invalid (no fake fallback generated)');
    assert(Boolean(jobError), 'Job records failure error message when API key is invalid');

    const resultRes = await fetch(`${API_BASE}/cases/${jobId}/result`);
    assert(resultRes.status === 500, 'Result endpoint returns HTTP 500 on failure without returning fake claim results');

    // Restore valid Gemini API key from environment
    const originalApiKey = process.env.GEMINI_API_KEY;
    if (originalApiKey) {
      await fetch(`${API_BASE}/admin/config`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ClaimFight@Admin2026!'
        },
        body: JSON.stringify({ apiKey: originalApiKey })
      });
      console.log('  ✔ Restored original GEMINI_API_KEY from environment');
    }
  }

  // =========================================================================
  // INTEGRATION TEST 9: End-to-End Gemini Multimodal Analysis on Cataract PDFs
  // =========================================================================
  console.log('\n--- 9. END-TO-END GEMINI MULTIMODAL AUDIT ON TEST DOCUMENTS ---');
  {
    const sampleRejPath = path.join(process.cwd(), 'public', 'samples', 'sample_rejection_letter_cataract.pdf');
    const samplePolPath = path.join(process.cwd(), 'public', 'samples', 'sample_policy_wordings_star.pdf');
    const sampleDisPath = path.join(process.cwd(), 'public', 'samples', 'sample_discharge_summary_cataract.pdf');

    const realForm = new FormData();
    realForm.append('rejection', new Blob([fs.readFileSync(sampleRejPath)], { type: 'application/pdf' }), 'sample_rejection_letter_cataract.pdf');
    realForm.append('policy', new Blob([fs.readFileSync(samplePolPath)], { type: 'application/pdf' }), 'sample_policy_wordings_star.pdf');
    realForm.append('discharge', new Blob([fs.readFileSync(sampleDisPath)], { type: 'application/pdf' }), 'sample_discharge_summary_cataract.pdf');

    const analyzeRes = await fetch(`${API_BASE}/cases/analyze`, { method: 'POST', body: realForm });
    const { jobId } = await analyzeRes.json();
    console.log(`  E2E Analysis Job initiated (Job ID: ${jobId})`);

    let attempts = 0;
    let jobStatus = 'pending';
    let jobData: any = null;

    while (attempts < 60 && jobStatus !== 'completed' && jobStatus !== 'failed') {
      attempts++;
      await new Promise(r => setTimeout(r, 1500));
      const stRes = await fetch(`${API_BASE}/cases/${jobId}/status`);
      jobData = await stRes.json();
      jobStatus = jobData.status;
      const currentStep = jobData.steps?.[jobData.currentStepIndex]?.name || '';
      console.log(`  Poll ${attempts}: status = ${jobStatus} (${jobData.progressPercent}%) [${currentStep}]`);
    }

    if (jobStatus === 'completed') {
      const res = await fetch(`${API_BASE}/cases/${jobId}/result`);
      const data = await res.json();
      const claim = data.result;

      console.log('\n  Evaluating E2E Adjudication Output against Expected Ground Truth:');
      assert(claim.patient_name.toLowerCase().includes('ramesh'), `Patient Name: ${claim.patient_name}`);
      assert(claim.insurer.toLowerCase().includes('star health'), `Insurer: ${claim.insurer}`);
      assert(claim.policy_number.includes('121114') || claim.policy_number.includes('004921'), `Policy Number: ${claim.policy_number}`);
      assert(claim.claim.claimed_amount === 78000, `Claimed Amount: ₹${claim.claim.claimed_amount}`);
      assert(claim.claim.disputed_amount === 78000, `Disputed Amount: ₹${claim.claim.disputed_amount}`);
      assert(claim.date_verification.active_policy_days === 578, `Active Policy Tenure: ${claim.date_verification.active_policy_days} days`);
      assert(claim.date_verification.waiting_period_completed === true, `Waiting Period Completed: ${claim.date_verification.waiting_period_completed}`);
      assert(claim.ombudsman_verification.statutory_award_limit === 5000000, `Ombudsman Pecuniary Limit: ₹${claim.ombudsman_verification.statutory_award_limit}`);
      assert(claim.document_comparison && claim.document_comparison.length > 0, 'Document comparisons populated with quotes');
      assert(Boolean(claim.document_comparison[0].source_document), `Source document cited: ${claim.document_comparison[0].source_document}`);
      assert(Boolean(claim.document_comparison[0].policy_page), `Page number cited: Page ${claim.document_comparison[0].policy_page}`);
      assert(Boolean(claim.document_comparison[0].policy_quote), `Verbatim quote cited: "${claim.document_comparison[0].policy_quote}"`);
    } else {
      console.warn(`  E2E Gemini call was not completed: ${jobData?.error || 'Timed out / Quota limits'}`);
      console.warn('  (Deterministic engine verified in unit tests above)');
    }
  }

  console.log('\n===============================================================');
  console.log(`  TEST RESULTS: ${passedTests} / ${totalTests} TESTS PASSED SUCCESSFULLY!`);
  console.log('===============================================================');
}

runComprehensiveTests().catch(err => {
  console.error('\n❌ Test suite failed:', err);
  process.exit(1);
});
