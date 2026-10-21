# Template example content (not built)

This folder holds the example content that ships with the al-folio template. It is kept for
reference, but it is **not part of the site**: `_template_examples/` is listed under `exclude:`
in `_config.yml`, so Jekyll never builds anything in here.

The folders mirror their original locations in the repo root:

| Here                  | Originally   | What it is                                                                    |
| --------------------- | ------------ | ----------------------------------------------------------------------------- |
| `_posts/`             | `_posts/`    | al-folio demo blog posts (formatting, math, charts, distill, ...)             |
| `_news/`              | `_news/`     | demo news announcements                                                       |
| `_books/`             | `_books/`    | demo bookshelf entry                                                          |
| `_teachings/`         | `_teachings/`| demo course pages                                                             |
| `_projects/_N_project.md` | `_projects/N_project.md` | demo project pages (the site's real projects are `_projects/1_project.md` and `_projects/2_project.md`) |
| `_pages/`             | `_pages/`    | unused pages: `about_einstein`, `books`, `dropdown`, `news`, `plugins`, `profiles` (people), `teaching` |

## Restoring something

Move the file back to its original folder, e.g.:

```bash
git mv _template_examples/_posts/2015-10-20-math.md _posts/
```

Pages also need `nav: true` in their front matter to show up in the navbar.
Projects need the leading `_` removed from the filename.

## External example posts

The template also pulled two external posts into the blog through `external_sources` in
`_config.yml`. That setting is now `external_sources: []`. The original value was:

```yaml
external_sources:
  - name: medium.com
    rss_url: https://medium.com/@al-folio/feed
    categories: [external-posts]
    tags: [medium]
  - name: Google Blog
    posts:
      - url: https://blog.google/technology/ai/google-gemini-update-flash-ai-assistant-io-2024/
        published_date: 2024-05-14
    categories: [external-posts]
    tags: [google]
```

## Upstream updates

When merging a newer al-folio release, upstream may add or change example files in the root
`_posts/`, `_news/`, `_pages/`, etc. Move any new example files here as well, so they don't get
published on the site.
