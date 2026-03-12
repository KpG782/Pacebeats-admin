# Performance Test Scripts

These k6 scripts are the executable version of the web performance plan in `docs/WEB_PERFORMANCE_TESTING_PLAN.md`.

## Scripts

- `performance-test.js`: `25` VUs for `7m`
- `load-test.js`: ramp `40 -> 60 -> 0` over `10m`
- `throughput-test.js`: `50 req/s` constant arrival for `7m`
- `stress-test.js`: staged `30 -> 60 -> 80 -> 100 -> 120 -> 0` over `13m`

## Run

```bash
npm run perf:performance
npm run perf:load
npm run perf:throughput
npm run perf:stress
```

Use a custom base URL:

```bash
k6 run tests/perf/performance-test.js --env BASE_URL=https://your-site.com
```

## Evidence Output

```bash
k6 run tests/perf/load-test.js --env BASE_URL=http://localhost:3000 --out json=results/load-test-results.json
```

## Before Running

- Start the app with `npm run build && npm run start`
- Make sure the target routes are reachable
- Watch Supabase logs and server logs during the run
