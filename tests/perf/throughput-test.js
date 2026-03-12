/**
 * WEB THROUGHPUT TEST
 * Standard: 30–50 concurrent users, ≤ 2–3 sec response, ≤ 800 ms TTFB
 * Goal: Find maximum sustainable req/sec with < 2% errors
 * Duration: 7 minutes
 *
 * Run: k6 run tests/perf/throughput-test.js
 * Run against staging: k6 run tests/perf/throughput-test.js --env BASE_URL=https://your-site.com
 */

import http from "k6/http";
import { check } from "k6";
import { Rate, Trend } from "k6/metrics";

// ─── Custom metrics ────────────────────────────────────────────────────────
const errorRate     = new Rate("custom_errors");
const ttfbTrend     = new Trend("custom_ttfb_ms", true);
const durationTrend = new Trend("custom_duration_ms", true);

// ─── Options ───────────────────────────────────────────────────────────────
export const options = {
  scenarios: {
    throughput: {
      executor:          "constant-arrival-rate",
      rate:              50,        // target 50 arrivals/sec (top of 30–50 range)
      timeUnit:          "1s",
      duration:          "7m",
      preAllocatedVUs:   60,
      maxVUs:            120,
    },
  },

  thresholds: {
    http_req_duration: ["p(95)<3000", "avg<2500"],
    custom_ttfb_ms:    ["p(95)<800"],
    http_req_failed:   ["rate<0.02"],
    custom_errors:     ["rate<0.02"],
  },
};

const BASE_URL = __ENV.BASE_URL || "http://localhost:3000";

// Weighted endpoint list — analytics and users are heaviest admin pages
const ENDPOINTS = [
  "/dashboard",
  "/dashboard/analytics",
  "/dashboard/analytics",  // weighted 2x — heaviest page
  "/dashboard/users",
  "/dashboard/users",      // weighted 2x
  "/dashboard/sessions",
  "/dashboard/music",
  "/dashboard/settings",
];

// ─── Main test scenario ────────────────────────────────────────────────────
export default function throughputTest() {
  const path = ENDPOINTS[Math.floor(Math.random() * ENDPOINTS.length)];
  const res  = http.get(`${BASE_URL}${path}`, {
    tags: { endpoint: path },
  });

  ttfbTrend.add(res.timings.waiting);
  durationTrend.add(res.timings.duration);

  const passed = check(res, {
    "status 200":          (r) => r.status === 200,
    "duration < 3000 ms":  (r) => r.timings.duration < 3000,
    "TTFB < 800 ms":       (r) => r.timings.waiting  < 800,
  });

  errorRate.add(!passed);
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

  const passResponse = parseFloat(p95Duration) < 3000;
  const passTtfb     = parseFloat(p95Ttfb)     < 800;
  const passError    = parseFloat(errorPct)    < 2;

  const report = `
╔══════════════════════════════════════════════════════════════╗
║         WEB THROUGHPUT TEST — RESULTS SUMMARY               ║
╠══════════════════════════════════════════════════════════════╣
║  Target Arrival Rate    : 50 req/s (max sustainable)        ║
║  Test Duration          : 7 minutes                         ║
╠══════════════════════════════════════════════════════════════╣
║  RESPONSE TIME                                              ║
║    Average              : ${String(avgDuration + " ms").padEnd(32)}║
║    p95                  : ${String(p95Duration + " ms (target: < 3000 ms) " + (passResponse ? "✓ PASS" : "✗ FAIL")).padEnd(32)}║
║  LATENCY (TTFB)                                             ║
║    Average              : ${String(avgTtfb + " ms").padEnd(32)}║
║    p95                  : ${String(p95Ttfb + " ms (target: < 800 ms) " + (passTtfb ? "✓ PASS" : "✗ FAIL")).padEnd(32)}║
║  ERROR RATE             : ${String(errorPct + "% (target: < 2%) " + (passError ? "✓ PASS" : "✗ FAIL")).padEnd(32)}║
║  ACTUAL THROUGHPUT      : ${String(reqRate + " req/s achieved").padEnd(32)}║
╠══════════════════════════════════════════════════════════════╣
║  OVERALL RESULT         : ${(passResponse && passTtfb && passError ? "✓ PASS" : "✗ FAIL").padEnd(32)}║
╚══════════════════════════════════════════════════════════════╝
`;

  console.log(report);

  return {
    "results/throughput-test-summary.txt": report,
    "results/throughput-test-full.json":   JSON.stringify(data, null, 2),
  };
}
