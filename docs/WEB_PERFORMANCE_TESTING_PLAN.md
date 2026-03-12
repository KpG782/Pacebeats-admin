# Web Performance Testing Plan

Pacebeats Admin uses `k6` for repeatable load testing and `Lighthouse` for a single-user baseline audit.

## Test Matrix

| File | Test | Users / Load Profile | Duration | Pass Focus |
|---|---|---|---|---|
| `tests/perf/performance-test.js` | Performance | `25` VUs | `7m` | `p95 < 2000 ms`, `TTFB < 500 ms`, errors `< 2%` |
| `tests/perf/load-test.js` | Load | `40 -> 60 -> 0` ramped | `10m` | `p95 < 3000 ms`, `TTFB < 800 ms`, throughput `>= 30 req/s`, errors `< 2%` |
| `tests/perf/throughput-test.js` | Throughput | `50 req/s` constant arrival | `7m` | sustain target arrival rate, errors `< 2%`, no route failures |
| `tests/perf/stress-test.js` | Stress | `30 -> 60 -> 80 -> 100 -> 120 -> 0` staged | `13m` | graceful degradation, no persistent crash, recovery after ramp-down |

## Tooling

- Load testing: `k6`
- Baseline audit: `Lighthouse CLI`
- Output evidence: JSON summaries from k6 and HTML report from Lighthouse

## Prerequisites

1. Install `k6`

```bash
winget install k6 --source winget
```

2. Install Lighthouse CLI

```bash
npm install -g lighthouse
```

3. Start the production build locally, or point to staging

```bash
npm run build && npm run start
```

4. Use a target URL

```text
http://localhost:3000
```

## Repo Commands

From the project root:

```bash
npm run perf:performance
npm run perf:load
npm run perf:throughput
npm run perf:stress
```

Run against a different environment:

```bash
k6 run tests/perf/performance-test.js --env BASE_URL=https://your-site.com
```

Run all tests in sequence:

```bash
npm run perf:all
```

## Evidence Export

Export JSON output for thesis evidence:

```bash
k6 run tests/perf/load-test.js --env BASE_URL=http://localhost:3000 --out json=results/load-test-results.json
```

Lighthouse baseline:

```bash
lighthouse http://localhost:3000/dashboard/analytics --output html --output-path results/lighthouse-analytics.html --only-categories performance
```

## Monitoring Checklist During Tests

- Next.js server logs: no unhandled exceptions, no repeated `500` responses
- Supabase logs: no pool exhaustion, no repeated query timeouts
- Supabase database reports: CPU, memory, and connection pressure
- Browser spot-check after stress run: dashboard, analytics, users, sessions still render correctly

## Pass / Fail Criteria

### Performance

- `p95` response time under `2000 ms`
- `p95` TTFB under `500 ms`
- error rate under `2%`
- no server crash

### Load

- `p95` response time under `3000 ms`
- `p95` TTFB under `800 ms`
- throughput at least `30 req/s`
- error rate under `2%`
- no crash or stalled requests

### Throughput

- sustain `50 req/s` target as closely as possible
- keep errors under `2%`
- maintain successful responses on dashboard routes
- record actual sustained rate from `http_reqs`

### Stress

- system keeps responding during heavy load
- no permanent `5xx` failure loop
- recovery after ramp-down to `0`
- no visible data corruption in admin views

## Results Table

| Test | Users / Load | Avg Response Time | p95 Response Time | Avg TTFB | Error Rate | Req/sec | Pass / Fail |
|---|---|---|---|---|---|---|---|
| Performance | 25 VUs | | | | | | |
| Load | 40-60 ramped | | | | | | |
| Throughput | 50 req/s | | | | | | |
| Stress | 30-120 staged | | | | | | |

## Notes

- The scripts already exist under `tests/perf/` and are aligned to the matrix above.
- For thesis screenshots, keep the k6 terminal summary, exported JSON, Lighthouse report, and Supabase monitoring screenshots together.
