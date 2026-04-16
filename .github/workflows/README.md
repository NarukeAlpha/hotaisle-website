# GitHub Workflows

This directory contains the repository's CI and Lighthouse automation.

## `ci.yml`

`ci.yml` now handles both pull request validation and the latest production Lighthouse publish. It runs on pull requests to `main`, pushes to `main`, and manual `workflow_dispatch` runs.

The `check` job installs dependencies and runs `bun run check`. On pull requests, the `lighthouse pr` job builds the static site, runs Lighthouse against the local build, asserts thresholds, and uploads the generated reports as the `lighthouse-reports-pr` artifact.

On `main`, the `lighthouse prod pages` job runs Lighthouse against `https://hotaisle.xyz`, writes the latest report set to `.lighthouseci/prod`, builds a small index page for browsing the HTML reports, uploads the `lighthouse-reports-prod` artifact, and deploys that directory to GitHub Pages. The Pages site is intentionally latest-only, so each production run replaces the previous one.

## Shared Configuration

Both modes use `.lighthouserc.cjs`. `LIGHTHOUSE_MODE=pr` targets the local `http://localhost` static build, while `LIGHTHOUSE_MODE=prod` targets the live `https://hotaisle.xyz` site. The audited routes also live in `.lighthouserc.cjs`, which keeps PR and production coverage aligned.

The config enables `includePassedAssertions`, so the workflow logs print passed assertions too instead of only the warnings and failures. If you want the accessibility, best-practices, SEO, LCP, CLS, and TBT thresholds to fail the run, set `LIGHTHOUSE_ENFORCE_CORE_METRICS=true`; otherwise they stay warning-only.

## Operational Notes

GitHub Pages deployment requires the workflow to run from `main`. The manual trigger is useful when you want to refresh the latest production report after a separate Cloudflare deployment, since Lighthouse is auditing the live site rather than the current branch output.
