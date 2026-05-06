# Repomix server monitoring

Cloud Monitoring dashboard definition for `repomix-server-us`.

Log-based metrics used by the dashboard are managed directly in the GCP Console
(`logging.googleapis.com/user/oom_terminations` and `container_killed`). They
persist on the project and do not need to be redefined here.

## Turnstile siteverify metrics

The dashboard's "Turnstile siteverify latency" and "Turnstile siteverify
outcomes" widgets depend on two log-based metrics. Definitions live in
`metrics/` and are applied once per project:

```bash
gcloud logging metrics create turnstile_siteverify_duration \
  --config-from-file=metrics/turnstile_siteverify_duration.yaml \
  --project=repomix

gcloud logging metrics create turnstile_siteverify_outcomes \
  --config-from-file=metrics/turnstile_siteverify_outcomes.yaml \
  --project=repomix
```

To update an existing metric (e.g. after editing the filter or buckets),
swap `create` for `update`. Both metrics filter on `siteverifyDurationMs`
field presence so success and failure paths are captured uniformly; the
`outcome` and `reason` labels on the counter metric drive the breakdown
in the "outcomes" widget.

Pre-network rejections (`secret_missing`, `missing_token`,
`token_too_long`) intentionally don't carry `siteverifyDurationMs` —
they short-circuit before the timer starts, so they're excluded from
both metrics. Those reject reasons still appear in the existing
`pack_requests` metric (under `outcome=turnstile_failed`) for
operational counting, just not in the latency distribution.

## Apply the dashboard

```bash
# Create
gcloud monitoring dashboards create --config-from-file=dashboard.json --project=repomix

# Update (use the dashboard ID from `gcloud monitoring dashboards list`)
gcloud monitoring dashboards update projects/repomix/dashboards/<ID> \
  --config-from-file=dashboard.json --project=repomix
```
