/**
 * WEB STRESS TEST
 * Standard: 80–100 concurrent users, progressive degradation expected
 * Latency: ≤ 1000 ms TTFB before degradation
 * Duration: 13 minutes (within 10–15 min range)
 * System Requirement: Remains operational, no data corruption, duplicate prevention
 *
 * Run: k6 run tests/perf/stress-test.js
 * Run against staging: k6 run tests/perf/stress-test.js --env BASE_URL=https://your-site.com
 */

import http from "k6/http";
import { check, sleep, group } from "k6";
import { Rate, Trend } from "k6/metrics";

// ─── Custom metrics ────────────────────────────────────────────────────────
const errorRate       = new Rate("custom_errors");
const ttfbTrend       = new Trend("custom_ttfb_ms", true);
const durationTrend   = new Trend("custom_duration_ms", true);
const crashRate       = new Rate("custom_server_crashes");  // 5xx responses

// ─── Options ───────────────────────────────────────────────────────────────
export const options = {
  stages: [
    { duration: "2m",  target: 30  },  // warm-up
    { duration: "2m",  target: 60  },  // approaching normal capacity
    { duration: "2m",  target: 80  },  // stress zone start
    { duration: "3m",  target: 100 },  // peak stress (80–100 users)
    { duration: "2m",  target: 120 },  // beyond limit — find breaking point
    { duration: "2m",  target: 0   },  // recovery ramp-down
  ],

  thresholds: {
    // Stress test: graceful degradation expected — system must NOT crash
    http_req_failed:    ["rate<0.10"],         // tolerate up to 10% under extreme load
    custom_server_crashes: ["rate<0.05"],      // no more than 5% 5xx (server errors)
    http_req_duration:  ["p(99)<5000"],        // even at worst, respond within 5s
    custom_ttfb_ms:     ["p(95)<1000"],        // TTFB target before degradation kicks in
  },
};

const BASE_URL = __ENV.BASE_URL || "http://localhost:3000";

const PAGES = [
  { name: "Dashboard Overview", path: "/dashboard"           },
  { name: "Analytics",          path: "/dashboard/analytics" },
  { name: "Users",              path: "/dashboard/users"     },
  { name: "Sessions",           path: "/dashboard/sessions"  },
];

// ─── Main test scenario ────────────────────────────────────────────────────
export default function stressTest() {
  const page = PAGES[Math.floor(Math.random() * PAGES.length)];

  group(page.name, () => {
    const res = http.get(`${BASE_URL}${page.path}`, {
      tags:    { page: page.name },
      timeout: "10s",  // allow slow responses under stress
    });

    ttfbTrend.add(res.timings.waiting);
    durationTrend.add(res.timings.duration);

    // Under stress: the key test is whether the server stays alive at all
    const isAlive       = res.status !== 0;
    const isNotCrash    = res.status < 500;
    const ttfbOk        = res.timings.waiting < 1000;

    check(res, {
      [`${page.name}: system still responds`]:    () => isAlive,
      [`${page.name}: no server crash (< 500)`]:  () => isNotCrash,
      [`${page.name}: TTFB < 1000 ms`]:           () => ttfbOk,
    });

    // Track 5xx server errors separately so we can distinguish network
    // failures from actual server crashes in the report
    crashRate.add(res.status >= 500);
    errorRate.add(!isAlive || !isNotCrash);
  });

  sleep(0.5);
}

// ─── Post-test recovery check ──────────────────────────────────────────────
// After k6 finishes, manually verify in a browser that:
//   1. /dashboard loads correctly
//   2. /dashboard/analytics shows real data (not stale/corrupted)
//   3. /dashboard/users shows correct user list
//   This verifies "no data corruption" requirement.

// ─── Summary output ────────────────────────────────────────────────────────
export function handleSummary(data) {
  const metrics = data.metrics;

  const avgDuration = metrics["http_req_duration"]?.values?.avg?.toFixed(0) ?? "N/A";
  const p95Duration = metrics["http_req_duration"]?.values["p(95)"]?.toFixed(0) ?? "N/A";
  const p99Duration = metrics["http_req_duration"]?.values["p(99)"]?.toFixed(0) ?? "N/A";
  const avgTtfb     = metrics["custom_ttfb_ms"]?.values?.avg?.toFixed(0) ?? "N/A";
  const p95Ttfb     = metrics["custom_ttfb_ms"]?.values["p(95)"]?.toFixed(0) ?? "N/A";
  const errorPct    = ((metrics["http_req_failed"]?.values?.rate      ?? 0) * 100).toFixed(2);
  const crashPct    = ((metrics["custom_server_crashes"]?.values?.rate ?? 0) * 100).toFixed(2);
  const reqRate     = metrics["http_reqs"]?.values?.rate?.toFixed(2) ?? "N/A";

  const passNoCrash  = parseFloat(crashPct)    < 5;
  const passTtfb     = parseFloat(p95Ttfb)     < 1000;
  const passWorstCase = parseFloat(p99Duration) < 5000;
  const passErrorRate = parseFloat(errorPct)   < 10;

  const overallPass = passNoCrash && passTtfb && passWorstCase && passErrorRate;

  const report = `
╔══════════════════════════════════════════════════════════════╗
║         WEB STRESS TEST — RESULTS SUMMARY                   ║
╠══════════════════════════════════════════════════════════════╣
║  Peak Concurrent Users  : 100–120 (target: 80–100+)         ║
║  Test Duration          : 13 minutes                        ║
╠══════════════════════════════════════════════════════════════╣
║  RESPONSE TIME (progressive degradation expected)           ║
║    Average              : ${String(avgDuration + " ms").padEnd(32)}║
║    p95                  : ${String(p95Duration + " ms").padEnd(32)}║
║    p99 (worst case)     : ${String(p99Duration + " ms (target: < 5000 ms) " + (passWorstCase ? "✓ PASS" : "✗ FAIL")).padEnd(32)}║
║  LATENCY (TTFB)                                             ║
║    Average              : ${String(avgTtfb + " ms").padEnd(32)}║
║    p95                  : ${String(p95Ttfb + " ms (target: < 1000 ms) " + (passTtfb ? "✓ PASS" : "✗ FAIL")).padEnd(32)}║
║  ERROR RATE             : ${String(errorPct + "% (target: < 10%) " + (passErrorRate ? "✓ PASS" : "✗ FAIL")).padEnd(32)}║
║  SERVER CRASH RATE (5xx): ${String(crashPct + "% (target: < 5%) " + (passNoCrash ? "✓ PASS" : "✗ FAIL")).padEnd(32)}║
║  THROUGHPUT             : ${String(reqRate + " req/s").padEnd(32)}║
╠══════════════════════════════════════════════════════════════╣
║  SYSTEM OPERATIONAL?    : ${(passNoCrash ? "YES — no permanent failure" : "NO — server crashes detected").padEnd(32)}║
╠══════════════════════════════════════════════════════════════╣
║  POST-TEST STEPS:                                           ║
║    1. Browse /dashboard in your browser                     ║
║    2. Verify analytics data is correct (not corrupted)      ║
║    3. Verify users/sessions list loads correctly            ║
║    4. Record: System recovered = YES / NO                   ║
╠══════════════════════════════════════════════════════════════╣
║  OVERALL RESULT         : ${(overallPass ? "✓ PASS" : "✗ FAIL").padEnd(32)}║
╚══════════════════════════════════════════════════════════════╝
`;

  console.log(report);

  return {
    "results/stress-test-summary.txt": report,
    "results/stress-test-full.json":   JSON.stringify(data, null, 2),
  };
}
