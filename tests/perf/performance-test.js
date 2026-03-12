/**
 * WEB PERFORMANCE TEST
 * Standard: 20–30 concurrent users, ≤ 2 sec response, ≤ 500 ms TTFB
 * Duration: 7 minutes (within 5–10 min academic standard)
 * Error Rate: 0–2%
 *
 * Run: k6 run tests/perf/performance-test.js
 * Run against staging: k6 run tests/perf/performance-test.js --env BASE_URL=https://your-site.com
 */

import http from "k6/http";
import { check, sleep, group } from "k6";
import { Rate, Trend } from "k6/metrics";

// ─── Custom metrics ────────────────────────────────────────────────────────
const errorRate   = new Rate("custom_errors");
const ttfbTrend   = new Trend("custom_ttfb_ms", true);
const durationTrend = new Trend("custom_duration_ms", true);

// ─── Options ───────────────────────────────────────────────────────────────
export const options = {
  vus: 25,           // midpoint of 20–30 concurrent users
  duration: "7m",    // midpoint of 5–10 min

  thresholds: {
    // Academic standard: ≤ 2000 ms response time
    http_req_duration:    ["p(95)<2000", "avg<2000"],
    // Academic standard: ≤ 500 ms latency (TTFB)
    custom_ttfb_ms:       ["p(95)<500",  "avg<500"],
    // Academic standard: 0–2% error rate
    http_req_failed:      ["rate<0.02"],
    custom_errors:        ["rate<0.02"],
  },
};

const BASE_URL = __ENV.BASE_URL || "http://localhost:3000";

// ─── Simulated admin page routes ───────────────────────────────────────────
const PAGES = [
  { name: "Dashboard Overview",   path: "/dashboard"            },
  { name: "Analytics",            path: "/dashboard/analytics"  },
  { name: "Users",                path: "/dashboard/users"      },
  { name: "Sessions",             path: "/dashboard/sessions"   },
  { name: "Music",                path: "/dashboard/music"      },
];

// ─── Main test scenario ────────────────────────────────────────────────────
export default function performanceTest() {
  for (const page of PAGES) {
    group(page.name, () => {
      const res = http.get(`${BASE_URL}${page.path}`, {
        tags: { page: page.name },
      });

      // Record custom metrics
      ttfbTrend.add(res.timings.waiting);
      durationTrend.add(res.timings.duration);

      const passed = check(res, {
        [`${page.name}: status 200`]:         (r) => r.status === 200,
        [`${page.name}: response < 2000 ms`]: (r) => r.timings.duration < 2000,
        [`${page.name}: TTFB < 500 ms`]:      (r) => r.timings.waiting  < 500,
      });

      errorRate.add(!passed);
    });

    sleep(1); // 1 second think-time between page navigations
  }
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

  const passResponse = parseFloat(p95Duration) < 2000;
  const passTtfb     = parseFloat(p95Ttfb)     < 500;
  const passError    = parseFloat(errorPct)    < 2;

  const report = `
╔══════════════════════════════════════════════════════════════╗
║         WEB PERFORMANCE TEST — RESULTS SUMMARY              ║
╠══════════════════════════════════════════════════════════════╣
║  Concurrent Users       : 25 (target: 20–30)                ║
║  Test Duration          : 7 minutes                         ║
╠══════════════════════════════════════════════════════════════╣
║  RESPONSE TIME                                              ║
║    Average              : ${String(avgDuration + " ms").padEnd(32)}║
║    p95                  : ${String(p95Duration + " ms (target: < 2000 ms) " + (passResponse ? "✓ PASS" : "✗ FAIL")).padEnd(32)}║
║  LATENCY (TTFB)                                             ║
║    Average              : ${String(avgTtfb + " ms").padEnd(32)}║
║    p95                  : ${String(p95Ttfb + " ms (target: < 500 ms) " + (passTtfb ? "✓ PASS" : "✗ FAIL")).padEnd(32)}║
║  ERROR RATE             : ${String(errorPct + "% (target: < 2%) " + (passError ? "✓ PASS" : "✗ FAIL")).padEnd(32)}║
║  THROUGHPUT             : ${String(reqRate + " req/s").padEnd(32)}║
╠══════════════════════════════════════════════════════════════╣
║  OVERALL RESULT         : ${(passResponse && passTtfb && passError ? "✓ PASS" : "✗ FAIL").padEnd(32)}║
╚══════════════════════════════════════════════════════════════╝
`;

  console.log(report);

  return {
    "results/performance-test-summary.txt": report,
    "results/performance-test-full.json":   JSON.stringify(data, null, 2),
  };
}
