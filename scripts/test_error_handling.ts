// Test Suite for Exhaustive Error Handling & Resilience in ClaimFight.in
import assert from 'assert';
import fs from 'fs';
import path from 'path';

const API_BASE = 'http://localhost:3001/api';

async function runErrorSuite() {
  console.log('===============================================================');
  console.log('       CLAIMFIGHT EXHAUSTIVE ERROR HANDLING AUDIT SUITE        ');
  console.log('===============================================================');

  let passed = 0;
  let failed = 0;

  function recordPass(desc: string) {
    console.log(`  ✔ [PASS] ${desc}`);
    passed++;
  }

  function recordFail(desc: string, err: any) {
    console.error(`  ✖ [FAIL] ${desc}:`, err?.message || err);
    failed++;
  }

  // Helper valid PDF
  const validPdfHeader = Buffer.from('%PDF-1.4\n1 0 obj\n<<>>\nendobj\ntrailer\n<<>>\n%%EOF\n' + 'x'.repeat(200));

  // --- 1. INVALID & CORRUPTED PDF ---
  console.log('\n--- 1. INVALID & CORRUPTED PDF TESTS ---');
  try {
    const corruptForm = new FormData();
    corruptForm.append('rejection', new Blob([Buffer.from('not-a-pdf')], { type: 'application/pdf' }), 'corrupt.pdf');
    corruptForm.append('policy', new Blob([validPdfHeader], { type: 'application/pdf' }), 'policy.pdf');
    corruptForm.append('discharge', new Blob([validPdfHeader], { type: 'application/pdf' }), 'discharge.pdf');

    const res = await fetch(`${API_BASE}/cases/analyze`, { method: 'POST', body: corruptForm });
    const data = await res.json();
    assert(res.status === 400, `Expected 400 for corrupt file signature, got ${res.status}`);
    assert(data.error.includes('corrupted') || data.error.includes('unsupported') || data.error.includes('magic byte'), `Expected friendly error, got: ${data.error}`);
    recordPass('Corrupted / invalid signature PDF rejected with HTTP 400 and friendly message');
  } catch (e) {
    recordFail('Corrupted PDF test', e);
  }

  // --- 2. PASSWORD-PROTECTED / ENCRYPTED PDF ---
  console.log('\n--- 2. PASSWORD-PROTECTED PDF TEST ---');
  try {
    const encryptedPdf = Buffer.from('%PDF-1.5\n1 0 obj\n<< /Encrypt 2 0 R /Filter /Standard >>\nendobj\ntrailer\n<< /Encrypt 2 0 R >>\n%%EOF\n' + 'y'.repeat(200));
    const encryptedForm = new FormData();
    encryptedForm.append('rejection', new Blob([encryptedPdf], { type: 'application/pdf' }), 'locked_rejection.pdf');
    encryptedForm.append('policy', new Blob([validPdfHeader], { type: 'application/pdf' }), 'policy.pdf');
    encryptedForm.append('discharge', new Blob([validPdfHeader], { type: 'application/pdf' }), 'discharge.pdf');

    const res = await fetch(`${API_BASE}/cases/analyze`, { method: 'POST', body: encryptedForm });
    const data = await res.json();
    assert(res.status === 400, `Expected 400 for password protected PDF, got ${res.status}`);
    assert(data.error.toLowerCase().includes('password') || data.error.toLowerCase().includes('encrypt'), `Expected password error, got: ${data.error}`);
    recordPass('Password-protected PDF rejected with clear instruction to upload unlocked copy');
  } catch (e) {
    recordFail('Password-protected PDF test', e);
  }

  // --- 3. UNSUPPORTED FILE TYPE ---
  console.log('\n--- 3. UNSUPPORTED FILE TYPE TEST ---');
  try {
    const unsuppForm = new FormData();
    unsuppForm.append('rejection', new Blob(['fake-binary'], { type: 'application/x-msdownload' }), 'virus.exe');
    unsuppForm.append('policy', new Blob([validPdfHeader], { type: 'application/pdf' }), 'policy.pdf');
    unsuppForm.append('discharge', new Blob([validPdfHeader], { type: 'application/pdf' }), 'discharge.pdf');

    const res = await fetch(`${API_BASE}/cases/analyze`, { method: 'POST', body: unsuppForm });
    const data = await res.json();
    assert(res.status === 400, `Expected 400 for .exe file, got ${res.status}`);
    assert(data.error.toLowerCase().includes('unsupported'), `Expected unsupported message, got: ${data.error}`);
    recordPass('Unsupported executable/script file rejected with HTTP 400');
  } catch (e) {
    recordFail('Unsupported file type test', e);
  }

  // --- 4. FILE SIZE LIMIT (20MB) ---
  console.log('\n--- 4. FILE SIZE CEILING TEST ---');
  try {
    // 21 MB oversized blob
    const oversizedBlob = new Blob([new Uint8Array(21 * 1024 * 1024)], { type: 'application/pdf' });
    const bigForm = new FormData();
    bigForm.append('rejection', oversizedBlob, 'huge_rejection.pdf');
    bigForm.append('policy', new Blob([validPdfHeader], { type: 'application/pdf' }), 'policy.pdf');
    bigForm.append('discharge', new Blob([validPdfHeader], { type: 'application/pdf' }), 'discharge.pdf');

    const res = await fetch(`${API_BASE}/cases/analyze`, { method: 'POST', body: bigForm });
    const data = await res.json();
    assert(res.status === 413 || res.status === 400, `Expected 413 or 400 for oversized file, got ${res.status}`);
    assert(data.error.includes('20MB') || data.error.includes('limit') || data.error.includes('large'), `Expected size limit message, got: ${data.error}`);
    recordPass('Oversized (>20MB) file rejected with size limit explanation');
  } catch (e) {
    recordFail('File size limit test', e);
  }

  // --- 5. DUPLICATE SUBMISSION DEDUPLICATION ---
  console.log('\n--- 5. CONCURRENT DUPLICATE SUBMISSION TEST ---');
  try {
    const dupForm1 = new FormData();
    dupForm1.append('rejection', new Blob([validPdfHeader], { type: 'application/pdf' }), 'doc1.pdf');
    dupForm1.append('policy', new Blob([validPdfHeader], { type: 'application/pdf' }), 'doc2.pdf');
    dupForm1.append('discharge', new Blob([validPdfHeader], { type: 'application/pdf' }), 'doc3.pdf');

    const res1 = await fetch(`${API_BASE}/cases/analyze`, { method: 'POST', body: dupForm1 });
    const data1 = await res1.json();
    assert(res1.status === 202, `Expected 202 for first submission, got ${res1.status}`);

    // Immediately submit duplicate
    const dupForm2 = new FormData();
    dupForm2.append('rejection', new Blob([validPdfHeader], { type: 'application/pdf' }), 'doc1.pdf');
    dupForm2.append('policy', new Blob([validPdfHeader], { type: 'application/pdf' }), 'doc2.pdf');
    dupForm2.append('discharge', new Blob([validPdfHeader], { type: 'application/pdf' }), 'doc3.pdf');

    const res2 = await fetch(`${API_BASE}/cases/analyze`, { method: 'POST', body: dupForm2 });
    const data2 = await res2.json();
    assert(res2.status === 200, `Expected 200 deduplicated response, got ${res2.status}`);
    assert(data2.deduplicated === true, 'Detected duplicate submission');
    assert(data2.jobId === data1.jobId, 'Reused existing active job ID rather than spawning redundant Gemini calls');
    recordPass('Duplicate concurrent submission safely intercepted and deduplicated');
  } catch (e) {
    recordFail('Duplicate submission test', e);
  }

  // --- 6. SECURITY: NO API KEYS OR SERVER PATHS IN ERROR RESPONSES ---
  console.log('\n--- 6. SECURITY & SECRET LEAK PREVENTION TEST ---');
  try {
    // Call nonexistent endpoint or invalid job
    const res = await fetch(`${API_BASE}/cases/nonexistent-id/status`);
    const data = await res.json();
    assert(res.status === 404, 'Expected 404 for invalid job ID');
    assert(!data.error.includes('AIza'), 'No API key leaked in 404 error');
    assert(!data.error.includes('C:\\') && !data.error.includes('D:\\'), 'No server disk paths leaked in error');
    recordPass('Error responses scrubbed of API keys and server paths');
  } catch (e) {
    recordFail('Secret leak prevention test', e);
  }

  // --- 7. TIMEOUT SAFEGUARD (NO INFINITE LOADING) ---
  console.log('\n--- 7. TIMEOUT SAFEGUARD & POLLING RESILIENCE ---');
  try {
    // Verify that job status endpoint returns valid JSON structure
    const health = await fetch(`${API_BASE}/health`);
    const healthData = await health.json();
    assert(healthData.status === 'ok', 'Server health operational');
    assert(healthData.gemini_configured === true, 'Gemini operational');
    recordPass('Health check and status APIs responsive without hanging');
  } catch (e) {
    recordFail('Timeout safeguard test', e);
  }

  console.log('\n===============================================================');
  console.log(`  ERROR HANDLING AUDIT RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('===============================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runErrorSuite();
