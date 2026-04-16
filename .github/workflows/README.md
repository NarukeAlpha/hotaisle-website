# GitHub Workflows

This directory contains the repository's CI and Lighthouse automation.

## `ci.yml`

`ci.yml` handles fast pull request validation before merge. It runs on `pull_request` events targeting `main`.

The `check` job installs dependencies and runs `bun run check`. The `lighthouse` job builds the static site, runs Lighthouse against the local build, asserts thresholds, and uploads the generated reports.

For Lighthouse, this workflow uses `.lighthouserc.cjs` with `LIGHTHOUSE_MODE=pr`. That means it audits the local static build served from `./dist-static`, writes reports to `.lighthouseci/pr`, and uploads the `lighthouse-reports-pr` artifact. The goal is to catch correctness, quality, and Lighthouse regressions in the PR without depending on the live site.

## `lighthouse-prod.yml`

`lighthouse-prod.yml` handles production Lighthouse monitoring after code has landed. It can run manually with `workflow_dispatch`, and it also has a scheduled trigger at `0 8 * * 1` (Monday 08:00 UTC).

The scheduled trigger is intentionally gated. GitHub invokes the workflow every Monday, but the `schedule-gate` job only allows the Lighthouse job to continue on even ISO weeks. In practice, that makes the production audit biweekly. Manual runs are never blocked by the gate.

This workflow uses `.lighthouserc.cjs` with `LIGHTHOUSE_MODE=prod`, so it audits `https://hotaisle.xyz`, writes reports to `.lighthouseci/prod`, and uploads the `lighthouse-reports-prod` artifact. The purpose is to measure the real deployed site and build a more stable production baseline before promoting warning-level performance checks into hard failures.

## Shared Configuration

Both workflows use the same Lighthouse config in `.lighthouserc.cjs`. The `LIGHTHOUSE_MODE` environment variable decides which environment gets tested: `pr` targets the local `http://localhost` build, while `prod` targets the live `https://hotaisle.xyz` site. The audited routes also live in `.lighthouserc.cjs`, which keeps both workflows aligned.

## Operational Notes

Scheduled workflows only become active after the workflow file is merged into the default branch. A pull request can show the workflow file during review, but GitHub will not run its `schedule` trigger until that file exists on `main`. If you want to verify the production workflow immediately after merge, use `Run workflow` from the Actions tab.
