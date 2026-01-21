// ============================================================================
// STEP 1: Import-time proof
// ============================================================================
console.log("IMPORT_START");

// ============================================================================
// STEP 2: Zero-logic baseline
// ============================================================================
// No imports except framework default
// No env vars
// No async work
// No conditionals
// Always return { ok: true } as JSON

export default function handler(req: any, res: any) {
  console.log("HANDLER_START");

  res.setHeader('Content-Type', 'application/json');
  res.statusCode = 200;
  const response = JSON.stringify({ ok: true, timestamp: new Date().toISOString() });

  console.log("HANDLER_END");

  return res.end(response);
}

console.log("IMPORT_END");
