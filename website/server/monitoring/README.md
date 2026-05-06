# Repomix server monitoring

Cloud Monitoring dashboard definition for `repomix-server-us`.

Log-based metrics used by the dashboard are managed directly in the GCP Console
(`logging.googleapis.com/user/oom_terminations` and `container_killed`). They
persist on the project and do not need to be redefined here.

## Turnstile siteverify metrics

The dashboard's "Turnstile siteverify latency" and "Turnstile siteverify
outcomes" widgets depend on two log-based metrics that need to exist before
the widgets render data. Create them once in the GCP Console
(Logging → Log-based Metrics → Create Metric):

### `turnstile_siteverify_duration` (Distribution)

- Filter:
  ```
  resource.type="cloud_run_revision"
  resource.labels.service_name="repomix-server-us"
  jsonPayload.siteverifyDurationMs!=""
  ```
- Field name: `jsonPayload.siteverifyDurationMs`
- Units: `ms`
- Histogram type: `Exponential`, base 2, growth factor 2, num buckets 16,
  scale 1 (covers 1ms — 32s, plenty for the 0–5s siteverify window).

### `turnstile_siteverify_outcomes` (Counter)

- Filter:
  ```
  resource.type="cloud_run_revision"
  resource.labels.service_name="repomix-server-us"
  jsonPayload.siteverifyDurationMs!=""
  ```
- Labels:
  - `outcome` ← `EXTRACT(jsonPayload.outcome)` (success, turnstile_failed)
  - `reason` ← `EXTRACT(jsonPayload.reason)` (siteverify_unavailable,
    siteverify_rejected, action_mismatch, hostname_mismatch — empty for
    success)

Both metrics filter on `siteverifyDurationMs` field presence so success
and failure paths are captured uniformly. Once created, the widgets in
`dashboard.json` will pick them up automatically.

## Apply the dashboard

```bash
# Create
gcloud monitoring dashboards create --config-from-file=dashboard.json --project=repomix

# Update (use the dashboard ID from `gcloud monitoring dashboards list`)
gcloud monitoring dashboards update projects/repomix/dashboards/<ID> \
  --config-from-file=dashboard.json --project=repomix
```
