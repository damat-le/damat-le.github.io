# This site: damat-le.github.io

This repo is Leo D'Amato's personal website, built **from** the al-folio template (v1.2, merged from the `upstream` remote, `alshedivat/al-folio`). It is not the al-folio starter repo itself. Everything below this section is upstream's guidance for the starter; where it conflicts with this section, this section wins.

- **Baseurl is empty.** The site is served at the root (`https://damat-le.github.io/`). Local preview: `docker compose up`, then `http://localhost:8080/` (not `/al-folio/`).
- **Local overrides are intentional** and registered in `.al-folio-overrides.yml`. Don't delete them; after an al-folio upgrade, run `bundle exec al-folio upgrade overrides audit` and re-apply the changes to the new upstream versions if they drifted.
  - `_layouts/about.liquid`: profile photo without frame or shadow.
  - `assets/css/main.scss`: Inter font, and the about page bio kept in a column beside the photo.
- **Template example content lives in `_template_examples/`** (excluded from the build in `_config.yml`). It is kept on purpose: never delete it, and when upstream adds new example posts, news, pages or projects, move them there instead of publishing them. `_template_examples/README.md` lists what is there and how to restore a file.
- **Only "about" is in the navbar.** The other pages have `nav: false` on purpose; they are still published at their URLs.
- **Upgrading al-folio:** follow [Updating al-folio](#updating-al-folio) below.

## Updating al-folio

The repo is no longer a GitHub fork (it left al-folio's fork network), so there is no "Sync fork" button: updates come in with plain git from the `upstream` remote. Nothing needs to be installed on the host; Ruby and the gems run inside Docker.

1. **Make sure the `upstream` remote exists.** It is per-clone, so a fresh clone needs it again:

   ```bash
   git remote get-url upstream || git remote add upstream https://github.com/alshedivat/al-folio.git
   ```

2. **Work on a branch**, so `main` (which deploys) stays untouched until the result is checked:

   ```bash
   git switch main && git pull && git switch -c update-al-folio
   ```

3. **Merge upstream:**

   ```bash
   git fetch upstream && git merge upstream/main
   ```

   Release notes for what changed are in `docs/releases/` after the merge, or at https://github.com/alshedivat/al-folio/releases.

4. **Resolve conflicts.** Take upstream's version for theme wiring (`Gemfile`, `Gemfile.lock`, workflows, `docs/`, `bin/`, the upstream part of this file), and keep the site's own content and settings:
   - `_config.yml`: name, description, `url`, empty `baseurl`, blog name/description, `disqus_shortname`, `enable_darkmode: false`, `footer_fixed: false`, `repo_trophies.enabled: false`, `search_enabled: false`, `external_sources: []`, `display_tags`/`display_categories`, the Inter `google_fonts` URL, and `_template_examples/` under `exclude:`. Accept upstream's new keys around them.
   - `_pages/*.md`: the site's titles/descriptions and `nav: false` on everything except `about`.
   - `_pages/about.md`, `_data/` (`cv.yml`, `socials.yml`, `repositories.yml`), `_bibliography/papers.bib`, `_projects/1_project.md`, `_projects/2_project.md`, `_posts/2022-01-07-apple_health_app.md`, `assets/`.
   - This file: keep the "This site" section and this guide at the top.

   Then commit the merge.

5. **Move new example content out of the build.** List what upstream added in this merge:

   ```bash
   git diff --name-only --diff-filter=A HEAD^1 HEAD -- _posts _news _pages _projects _books _teachings
   ```

   Move each listed example file into the matching folder under `_template_examples/` (`git mv`), and give new `_pages` that stay published `nav: false`. Update the table in `_template_examples/README.md` if a new kind of content appears.

6. **Build and audit in Docker:**

   ```bash
   docker compose pull && docker compose up -d
   docker compose exec jekyll bundle exec al-folio upgrade audit
   docker compose exec jekyll bundle exec al-folio upgrade overrides audit
   ```

   Fix every **blocking** finding in the report (`al-folio-upgrade-report.md`, gitignored). If the overrides audit reports drift for `_layouts/about.liquid` or `assets/css/main.scss`, copy the new upstream file from the gem (`docker compose exec jekyll sh -c 'cat $(bundle show al_folio_core)/<path>'`), re-apply the site's change on top (see the overrides bullet above), and run `bundle exec al-folio upgrade overrides accept <path>`.

7. **Check the site** at http://localhost:8080/: the home page (photo, Inter font, bio beside the photo), `/publications/`, `/projects/`, `/cv/`, `/blog/`, `/repositories/`, and `/sitemap.xml` (it should list only the site's own pages, no template examples). `docker compose logs --tail=80 jekyll` shows build errors.

8. **Ship it:** merge into `main` and push. The push triggers the "Deploy site" workflow, which publishes to the `gh-pages` branch.

   ```bash
   git switch main && git merge --ff-only update-al-folio && git push origin main
   ```

   Then confirm the run succeeded in the repo's Actions tab and check https://damat-le.github.io/. The "Prettier code formatter" and "Render a CV" workflows failed on the v1.2 upgrade push too; they don't affect deploys.

# Agent Guidelines for al-folio (v1.x)

**This file is the authoritative entry point for coding agents working in this repo.** Read it before making any change. It is intentionally short and tool-neutral; it links to the one place each longer-form fact lives.

`al-folio` v1.x is a **thin Jekyll starter, not a theme**. This repo owns starter wiring, example content, docs, and cross-plugin tests. All runtime — layouts, includes, Sass, Liquid tags, filters, feature JS — lives in versioned gems published under [`al-org-dev`](https://github.com/al-org-dev).

## Route your change

Find your change on the left; edit only what is on the right.

| Your change                                                                                                              | Goes in                                                                                                       |
| ------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------- |
| Dependency pin, plugin activation, feature flag                                                                          | this repo: `Gemfile` **and** `_config.yml` (both — see below)                                                 |
| Example/demo content, bibliography, data files                                                                           | this repo: `_pages`, `_posts`, `_projects`, `_news`, `_teachings`, `_books`, `_data`                          |
| Documentation                                                                                                            | this repo: `docs/` (long-form) or this file (agent rules)                                                     |
| Cross-plugin integration test, visual parity test                                                                        | this repo: `test/integration_*.sh`, `test/visual/`                                                            |
| Plugin catalog metadata                                                                                                  | this repo: `_data/featured_plugins.yml`                                                                       |
| A layout, include, or Sass partial                                                                                       | the owning gem — start with `al_folio_core`                                                                   |
| A Liquid tag or filter, or what a tag renders                                                                            | the gem that registers it — see the [delegation table](docs/ARCHITECTURE.md#wrapper-to-tag-to-gem-delegation) |
| Feature behavior (search, math, charts, comments, cookies, icons, CV, distill, analytics, images, newsletter, citations) | that feature's gem — see [`docs/BOUNDARIES.md`](docs/BOUNDARIES.md)                                           |
| Component/unit test for gem-owned behavior                                                                               | the owning gem, not here                                                                                      |
| A feature with no existing owner                                                                                         | open a plugin proposal issue first, then a standalone plugin repo                                             |

[`docs/BOUNDARIES.md`](docs/BOUNDARIES.md) is the authoritative area-to-gem table. [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) explains how the pieces connect.

## Stop sign

**If your change would create any of these paths in this repo, it belongs in a gem instead:**

```
_layouts/   _includes/   _sass/   _scripts/   assets/tailwind/   tailwind.config.js   assets/webfonts/
```

`npm run lint:style-contract` fails CI when any of them exists here, and it also rejects `build:css` / `build:tailwind` npm scripts. Do not add a starter-local Tailwind or CSS build pipeline.

This restriction applies to **this repo only**. A user's own site created from this template _may_ legally shadow gem-owned files — see [local overrides: your site vs. this repo](docs/ARCHITECTURE.md#local-overrides-your-site-vs-this-repo).

## Three failures that produce no error message

Read [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md#failure-modes-that-produce-no-error-message) for the full explanation. The short version:

1. **Features fail silently.** A feature renders only when its gem is loaded _and_ its flag is on _and_ the page opts in. Otherwise the Liquid tag emits an empty string — no warning, no error.
2. **`Gemfile` and `_config.yml` are two lists that must agree.** A plugin in only one of them is inert. Adding or removing a plugin means editing both. Repo dirs use hyphens (`al-folio-core`); gem/plugin ids use underscores (`al_folio_core`).
3. **This repo's effective baseurl is `/al-folio`.** `_config.yml` already sets it, so a plain `bundle exec jekyll build` is correct — that is what `deploy.yml`, `broken-links-site.yml` and `axe.yml` run. Passing `--baseurl /al-folio` is redundant but harmless; blanking the baseurl out is what renders the site unstyled with broken links. Dev server is at `http://localhost:4000/al-folio/`.

## Validated local command set

Run from the repo root, in this order:

```bash
bundle install
npm ci
npm run lint:prettier
npm run lint:style-contract
bundle exec jekyll build --baseurl /al-folio
bash test/integration_comments.sh
bash test/integration_plugin_toggles.sh
bash test/integration_distill.sh
bash test/integration_bootstrap_compat.sh
bash test/integration_upgrade_cli.sh
bash test/integration_css_minify.sh
bash test/integration_new_plugins.sh
npx playwright install chromium webkit
npm run test:visual
bundle exec al-folio upgrade audit
bundle exec al-folio upgrade overrides audit
bundle exec al-folio upgrade report
docker compose up -d
curl -fsS http://127.0.0.1:8080/al-folio/ >/dev/null
docker compose logs --tail=80
docker compose down
```

All seven `test/integration_*.sh` scripts are gated by `unit-tests.yml`; run the ones your change touches. Docker note: v1 uses `/srv/jekyll/bin/entry_point.sh` and serves from container-local `/tmp/_site` to avoid host bind-mount write deadlocks.

## Before you open a PR

- Keep starter work here; route runtime behavior to the owning plugin repo.
- Run `npm run lint:prettier` (Prettier with `@shopify/prettier-plugin-liquid`, `printWidth: 150`). `npx prettier . --write` fixes formatting.
- Keep docs aligned with v1 ownership, and keep each fact in one place — link rather than restate.
- If you create or keep local overrides of plugin-owned files, run `bundle exec al-folio upgrade overrides audit` and commit `.al-folio-overrides.yml` after review.

## Further reading

- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — how the starter and gems fit together, silent failure modes, the v1 config contract, local overrides.
- [`docs/BOUNDARIES.md`](docs/BOUNDARIES.md) — authoritative area-to-gem ownership table and PR triage playbook.
- [`docs/CONTRIBUTING.md`](docs/CONTRIBUTING.md) — contributor workflow and agent tooling.
- [`docs/README.md`](docs/README.md) — index of all user and maintainer guides.
- `.agents/skills/al-folio-bootstrap/SKILL.md` — new-site setup workflow.
- `.agents/skills/al-folio-v1-migration/SKILL.md` — customized-fork migration and override drift auditing.
- `.codex/skills` and `.claude/skills` are symlinks to `.agents/skills` for agent-specific discovery.
