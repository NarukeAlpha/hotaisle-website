# GitHub Workflows

This directory contains the repository's CI and Lighthouse automation.

## `ci.yml`

`ci.yml` handles pull request validation and the latest Lighthouse Pages publish. It runs on pull requests to `main`, pushes to `main`, and manual `workflow_dispatch` runs.

The `check` job installs dependencies and runs `bun run check`. The `lighthouse` job builds the static site, runs Lighthouse against the local `http://localhost` build, asserts thresholds, writes the report files, generates the report index page, and uploads the resulting `lighthouse-reports` artifact.

On `main`, the `lighthouse pages` job downloads that artifact and deploys it to GitHub Pages. The Pages site is intentionally latest-only, so each run replaces the previous one.

## Shared Configuration

`.lighthouserc.cjs` is now localhost-only. It always targets the local `http://localhost` static build, serves from `./dist-static`, and writes reports to `.lighthouseci/reports`. The audited routes also live there, so CI and Pages stay aligned.

The config enables `includePassedAssertions`, so the workflow logs print passed assertions too instead of only the warnings and failures. If you want the accessibility, best-practices, SEO, LCP, CLS, and TBT thresholds to fail the run, set `LIGHTHOUSE_ENFORCE_CORE_METRICS=true`; otherwise they stay warning-only.

## Operational Notes

GitHub Pages deployment requires the workflow to run from `main`. The manual trigger is useful when you want to refresh the latest localhost-based Lighthouse report without opening a new pull request.
