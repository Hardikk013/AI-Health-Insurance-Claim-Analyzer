// End-to-End Test Suite for ClaimFight Backend & Gemini Integration
import fs from 'fs';
import path from 'path';

const API_BASE = 'http://localhost:3001/api';

async function runTests() {
  console.log('=== STARTING CLAIMFIGHT E2E PIPELINE TESTS ===\n');

  // Test 1: Health check
  console.log('Test 1: GET /api/health');
  const healthRes = await fetch(`${API_BASE}/health`);
  const health = await healthRes.json();
  console.log('  Status:', health.status);
  console.log('  Model:', health.model);
  console.log('  Gemini Configured:', health.gemini_configured);
  if (health.status !== 'ok') throw new Error('Health check failed');
  console.log('  ✔ Health check passed\n');

  // Test 2: Reject incomplete upload (missing 1 of 3 files)
  console.log('Test 2: Validation - Missing documents rejected');
  const incompleteForm = new FormData();
  incompleteForm.append('rejection', new Blob(['fake content'], { type: 'application/pdf' }), 'rejection.pdf');
  // policy and discharge are intentionally missing!

  const incompleteRes = await fetch(`${API_BASE}/cases/analyze`, {
    method: 'POST',
    body: incompleteForm
  });
  console.log('  Incomplete upload HTTP Status:', incompleteRes.status);
  const incompleteJson = await incompleteRes.json();
  console.log('  Server message:', incompleteJson.error);
  if (incompleteRes.status !== 400) throw new Error('Expected 400 Bad Request for missing files');
  console.log('  ✔ Missing documents correctly rejected with HTTP 400\n');

  // Test 3: Reject unsupported file type (.exe/.txt)
  console.log('Test 3: Validation - Unsupported file type rejected');
  const invalidTypeForm = new FormData();
  invalidTypeForm.append('rejection', new Blob(['test'], { type: 'text/plain' }), 'malicious.exe');
  invalidTypeForm.append('policy', new Blob(['test'], { type: 'text/plain' }), 'policy.txt');
  invalidTypeForm.append('discharge', new Blob(['test'], { type: 'text/plain' }), 'discharge.txt');

  const invalidRes = await fetch(`${API_BASE}/cases/analyze`, {
    method: 'POST',
    body: invalidTypeForm
  });
  console.log('  Unsupported type HTTP Status:', invalidRes.status);
  const invalidJson = await invalidRes.json();
  console.log('  Server message:', invalidJson.error);
  if (!invalidJson.error?.includes('Unsupported file type')) {
    throw new Error('Expected error message for unsupported file type');
  }
  console.log('  ✔ Unsupported file types correctly rejected\n');

  // Test 4: Gemini API failure handled without fabricating analysis
  console.log('Test 4: Error Handling - Gemini failure does not fabricate fake analysis');
  
  // Set an invalid API key to simulate an API failure/quota exhaustion
  await fetch(`${API_BASE}/admin/config`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ apiKey: 'invalid_gemini_key_for_testing_failure' })
  });

  const sampleRejPath = path.join(process.cwd(), 'public', 'samples', 'sample_rejection_letter_cataract.pdf');
  const samplePolPath = path.join(process.cwd(), 'public', 'samples', 'sample_policy_wordings_star.pdf');
  const sampleDisPath = path.join(process.cwd(), 'public', 'samples', 'sample_discharge_summary_cataract.pdf');

  const realForm = new FormData();
  realForm.append('rejection', new Blob([fs.readFileSync(sampleRejPath)], { type: 'application/pdf' }), 'rejection.pdf');
  realForm.append('policy', new Blob([fs.readFileSync(samplePolPath)], { type: 'application/pdf' }), 'policy.pdf');
  realForm.append('discharge', new Blob([fs.readFileSync(sampleDisPath)], { type: 'application/pdf' }), 'discharge.pdf');

  const analyzeRes = await fetch(`${API_BASE}/cases/analyze`, {
    method: 'POST',
    body: realForm
  });
  const { jobId } = await analyzeRes.json();
  console.log('  Job initiated with ID:', jobId);

  // Poll for status until job resolves
  let attempts = 0;
  let jobStatus = 'pending';
  let jobError = null;

  while (attempts < 15 && jobStatus !== 'failed' && jobStatus !== 'completed') {
    attempts++;
    await new Promise(r => setTimeout(r, 800));
    const stRes = await fetch(`${API_BASE}/cases/${jobId}/status`);
    const stData = await stRes.json();
    jobStatus = stData.status;
    jobError = stData.error;
    console.log(`  Poll ${attempts}: status = ${jobStatus}${jobError ? ` (error: ${jobError})` : ''}`);
  }

  if (jobStatus !== 'failed') {
    throw new Error('Expected job to fail when Gemini API is unavailable or invalid key provided');
  }

  // Ensure GET /api/cases/:id/result returns 500 error and NO fabricated data
  const resultRes = await fetch(`${API_BASE}/cases/${jobId}/result`);
  const resultJson = await resultRes.json();
  console.log('  Result endpoint HTTP status:', resultRes.status);
  console.log('  Result error payload:', resultJson.error);

  if (resultRes.status !== 500 || !resultJson.error) {
    throw new Error('System returned 200 or fabricated data instead of genuine error response!');
  }
  console.log('  ✔ Verified: System rejects and surfaces genuine Gemini error, NEVER displays fabricated analysis\n');

  console.log('=== ALL AUTOMATED INTEGRATION TESTS PASSED SUCCESSFULLY! ===');
}

runTests().catch(err => {
  console.error('\n❌ Test suite failed:', err);
  process.exit(1);
});
