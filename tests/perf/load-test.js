/**
 * WEB LOAD TEST
 * Standard: 40–60 concurrent users, ≤ 3 sec response, ≤ 800 ms TTFB
 * Throughput: 30–50 req/s sustained
 * Duration: 10 minutes
 * Error Rate: ≤ 2%
 *
 * Run: k6 run tests/perf/load-test.js
 * Run against staging: k6 run tests/perf/load-test.js --env BASE_URL=https://your-site.com
 */

import http from "k6/http";
import { check, sleep, group } from "k6";
import { Rate, Trend } from "k6/metrics";

// ─── Custom metrics ────────────────────────────────────────────────────────
const errorRate     = new Rate("custom_errors");
const ttfbTrend     = new Trend("custom_ttfb_ms", true);
const durationTrend = new Trend("custom_duration_ms", true);

// ─── Options ───────────────────────────────────────────────────────────────
export const options = {
  stages: [
    { duration: "2m", target: 40 },  // ramp up to 40 users
    { duration: "6m", target: 60 },  // ramp to 60 users, sustain
    { duration: "2m", target: 0  },  // ramp down
  ],

  thresholds: {
    // Academic standard: ≤ 3000 ms response time
    http_req_duration: ["p(95)<3000", "avg<3000"],
    // Academic standard: ≤ 800 ms TTFB
    custom_ttfb_ms:    ["p(95)<800", "avg<800"],
    // Academic standard: ≤ 2% error rate
    http_req_failed:   ["rate<0.02"],
    custom_errors:     ["rate<0.02"],
    // Academic standard: 30–50 req/s throughput
    http_reqs:         ["rate>30"],
  },
};

const BASE_URL = __ENV.BASE_URL || "http://localhost:3000";

const PAGES = [
  { name: "Dashboard Overview",  path: "/dashboard"           },
  { name: "Analytics",           path: "/dashboard/analytics" },
  { name: "Users",               path: "/dashboard/users"     },
  { name: "Sessions",            path: "/dashboard/sessions"  },
  { name: "Music",               path: "/dashboard/music"     },
];

// ─── Main test scenario ────────────────────────────────────────────────────
export default function loadTest() {
  // Simulate a realistic admin browsing session
  const page = PAGES[Math.floor(Math.random() * PAGES.length)];

  group(page.name, () => {
    const res = http.get(`${BASE_URL}${page.path}`, {
      tags: { page: page.name },
    });

    ttfbTrend.add(res.timings.waiting);
    durationTrend.add(res.timings.duration);

    const passed = check(res, {
      [`${page.name}: status 200`]:         (r) => r.status === 200,
      [`${page.name}: response < 3000 ms`]: (r) => r.timings.duration < 3000,
      [`${page.name}: TTFB < 800 ms`]:      (r) => r.timings.waiting  < 800,
    });

    errorRate.add(!passed);
  });

  sleep(1);
}

// ─── Summary output ────────────────────────────────────────────────────────
export function handleSummary(data) {
  const metrics = data.metrics;

  const avgDuration = metrics["http_req_duration"]?.values?.avg?.toFixed(0) ?? "N/A";
  const p95Duration = metrics["http_req_duration"]?.values["p(95)"]?.toFixed(0) ?? "N/A";
  const avgTtfb     = metrics["custom_ttfb_ms"]?.values?.avg?.toFixed(0) ?? "N/A";
  const p95Ttfb     = metrics["custom_ttfb_ms"]?.values["p(95)"]?.toFixed(0) ?? "N/A";
  const errorPct    = ((metrics["http_req_failed"]?.values?.rate ?? 0) * 100).toFixed(2);
  const reqRate     = metrics["http_reqs"]?.values?.rate?.toFixed(2) ?? "N/A";

  const passResponse   = parseFloat(p95Duration) < 3000;
  const passTtfb       = parseFloat(p95Ttfb)     < 800;
  const passError      = parseFloat(errorPct)    < 2;
  const passThroughput = parseFloat(reqRate)      >= 30;

  const report = `
╔══════════════════════════════════════════════════════════════╗
║         WEB LOAD TEST — RESULTS SUMMARY                     ║
╠══════════════════════════════════════════════════════════════╣
║  Concurrent Users       : 40 → 60 (ramped)                  ║
║  Test Duration          : 10 minutes                        ║
╠══════════════════════════════════════════════════════════════╣
║  RESPONSE TIME                                              ║
║    Average              : ${String(avgDuration + " ms").padEnd(32)}║
║    p95                  : ${String(p95Duration + " ms (target: < 3000 ms) " + (passResponse ? "✓ PASS" : "✗ FAIL")).padEnd(32)}║
║  LATENCY (TTFB)                                             ║
║    Average              : ${String(avgTtfb + " ms").padEnd(32)}║
║    p95                  : ${String(p95Ttfb + " ms (target: < 800 ms) " + (passTtfb ? "✓ PASS" : "✗ FAIL")).padEnd(32)}║
║  ERROR RATE             : ${String(errorPct + "% (target: < 2%) " + (passError ? "✓ PASS" : "✗ FAIL")).padEnd(32)}║
║  THROUGHPUT             : ${String(reqRate + " req/s (target: 30–50) " + (passThroughput ? "✓ PASS" : "✗ FAIL")).padEnd(32)}║
╠══════════════════════════════════════════════════════════════╣
║  OVERALL RESULT         : ${(passResponse && passTtfb && passError && passThroughput ? "✓ PASS" : "✗ FAIL").padEnd(32)}║
╚══════════════════════════════════════════════════════════════╝
`;

  console.log(report);

  return {
    "results/load-test-summary.txt":  report,
    "results/load-test-full.json":    JSON.stringify(data, null, 2),
  };
}
