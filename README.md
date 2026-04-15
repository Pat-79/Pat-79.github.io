# awayfromhome.nl

This repository is a **showcase site** for the [AwayFromHome Jekyll theme](#the-awayfromhome-theme).  
It demonstrates how the theme looks in practice and how to configure and extend it for any content site.

---

## The AwayFromHome Theme

The AwayFromHome theme is a reusable Jekyll theme gem that provides a complete, travel journals, blogs, personal sites without coupling design to content.

The theme lives in the `theme/awayfromhome-theme/` directory and is consumed by this showcase site through a local Gemfile path reference.

### What the theme owns

| Concern | Location |
|---|---|
| Page layouts | `theme/awayfromhome-theme/_layouts/` |
| Shared includes (header, footer, sidebar …) | `theme/awayfromhome-theme/_includes/` |
| SCSS design tokens and component styles | `theme/awayfromhome-theme/_sass/awayfromhome-theme/` |
| Theme JavaScript (navigation, theme switching …) | `theme/awayfromhome-theme/assets/js/theme.js` |
| Built-in SVG assets (icons, hero images) | `theme/awayfromhome-theme/assets/images/` |

### What the site owns

- All page and post **content**
- Site identity in **`_config.yml`** (title, brand, author, navigation, social links …)
- Site-specific **SCSS overrides** in `_sass/site/`
- The CSS **entrypoint** in `assets/css/main.scss`

---

## Getting started

```yaml
# Gemfile
gem "awayfromhome-theme", path: "theme/awayfromhome-theme"
```

```yaml
# _config.yml
theme: awayfromhome-theme
```

Run the site with:

```bash
bundle install
bundle exec jekyll serve
```

---

## Configuration (`_config.yml`)

### Core identity

```yaml
title: Away From Home
description: A content site using a reusable custom Jekyll theme.
lang: en
url: "https://awayfromhome.nl"
baseurl: ""
permalink: pretty

default_post_image: /assets/images/post-hero-philippines.svg
```

### Brand

Displayed in the site header. Use either a `logo` image path or omit it to fall back to a text initial mark.

```yaml
brand:
  title: awayfromhome.nl
  logo: /assets/images/logo-mark.svg
```

### Author

Shown in post author cards.

```yaml
author:
  name: Patrick
  avatar: /assets/images/avatar.svg
  bio: Slow travel notes, practical route ideas, and visual field journals from the road.
  location: Based in the Netherlands, usually somewhere else.
```

### Navigation

Drives the drawer nav links. Add or remove entries freely.

```yaml
navigation:
  - title: Home
    url: /
  - title: About
    url: /about/
  - title: Blogs
    url: /blog/
  - title: Social Media
    url: /social-media/
```

### Archive links

Listed in the sidebar drawer under an "Archive" section.

```yaml
archives:
  - title: April 2026
    url: /archive/2026/04/
```

### Social links

Used in the footer, sidebar, and the social media page. Supported platforms have built-in SVG icons: `instagram`, `youtube`, `github`, `twitter`, `linkedin`, `mastodon`, `facebook`.

```yaml
social_links:
  - platform: instagram
    url: https://instagram.com/youraccount
  - platform: youtube
    url: https://youtube.com/@yourchannel
```

### Footer

```yaml
footer:
  domain_label: awayfromhome.nl
  sitemap_url: /sitemap/
  copyright: All rights reserved.
  disclaimer: Travel information and opinions may change over time; verify critically.
```

### Theme (color scheme)

Supports `auto` (follows OS preference), `light`, or `dark`.  
Users can also switch interactively via the in-page control.

```yaml
theme_settings:
  default_theme: auto
```

### Social media page defaults

```yaml
social_page:
  intro: Follow along on social media.
  open_new_tab: true
```

### Blog page defaults

```yaml
blog_page:
  intro: Recent posts.
  excerpt_words: 30
  posts_limit:        # omit to show all posts
```

### Error page defaults

```yaml
error_page:
  cta_label: Back to home
  cta_url: /
  message:            # omit to use automatic message per error code
```

---

## Layouts

Every page sets `layout:` in its front matter. All layouts inherit from `default`.

### `default`

Base shell for all pages. Renders the skip link, drawer, header, optional hero image, main content slot, and footer.

Front matter options:

| Key | Effect |
|---|---|
| `image` | Activates a full-width hero banner with the page title overlaid |
| `title` | Used as the hero title and `<title>` tag |

---

### `home`

Full-screen landing hero with a video or image background, centered site title and tagline, a pulsing scroll-down arrow, and a scroll-snap into the "Latest Posts" section below.

```yaml
---
layout: home
landing_video_url: https://youtu.be/CIWgifiybWk  # any YouTube URL format
landing_image: /assets/images/fallback.svg         # used when no video is set
latest_posts_limit: 2
---
```

Config fallbacks under `home_landing:`:

```yaml
home_landing:
  video_url: https://youtu.be/...
  image: /assets/images/fallback.svg
```

---

### `post`

Blog post layout. Shows a full-width hero image, post title, author, date, tags, post body, author card, and an optional "Continue Reading" banner linking to the previous or next post.

Front matter options for posts:

| Key | Effect |
|---|---|
| `title` | Post title shown in hero and `<title>` |
| `image` | Hero background image |
| `tags` | Array of tag strings; linked to the tag index |
| `author` | Overrides the site-level author for this post |
| `date` | Publication date (from filename by default) |

Example:

```yaml
---
title: Slovenia, Lakes and Late Light
image: /assets/images/post-hero-slovenia.svg
tags: [europe, mountains, lake]
---
```

---

### `blog`

Renders a filterable list of all posts as media cards.

```yaml
---
layout: blog
permalink: /blog/
image: /assets/images/page-hero-blog.svg
blog_intro: Recent posts using the reusable article layout.
blog_excerpt_words: 30
blog_posts_limit:        # omit to show all posts
---
```

---

### `tag-index`

Renders the tag index page with filter chips and grouped post lists. Tags are filterable via URL query parameter (`?tag=europe`).

```yaml
---
layout: tag-index
permalink: /tags/
image: /assets/images/page-hero-tags.svg
---
```

---

### `tag-cloud`

Renders a visual tag cloud page (linked tag chips scaled by usage frequency).

```yaml
---
layout: tag-cloud
permalink: /tags/cloud/
---
```

---

### `sitemap`

Auto-generates a sitemap with two sections: **Pages** and **Posts**.  
Automatically excludes the current page, pages with `sitemap: false`, and pages whose URL or title contains `404`.

```yaml
---
layout: sitemap
permalink: /sitemap/
image: /assets/images/page-hero-sitemap.svg
---
```

---

### `social-media`

Renders the social media links as a styled list.  
Sources links from front matter > `site.social_page.links` > `site.social_links`.

```yaml
---
layout: social-media
permalink: /social-media/
image: /assets/images/page-hero-social.svg
social_intro: Follow along on social media.
social_open_new_tab: true
# social_links:            # override per-page if needed
#   - platform: instagram
#     url: https://instagram.com/youraccount
#     title: Instagram
---
```

---

### `error`

Used for HTTP error pages (400, 403, 404, 500 …). Auto-detects the error code from the page title. Renders a centered card with the error code, message, and a "Back to home" button.

```yaml
---
layout: error
permalink: /404.html
sitemap: false
image: /assets/images/page-hero-error-404.svg
# error_code: 404           # auto-detected from title if omitted
# error_title: Not Found
# error_message: The page you are looking for could not be found.
# error_cta_label: Back to home
# error_cta_url: /
---
```

---

## Posts

Posts are stored in `_posts/` following the standard Jekyll naming convention:

```
_posts/YYYY-MM-DD-slug.md
```

The `post` layout is applied automatically via `_config.yml` defaults. Override per-post with `layout:` in front matter.

To opt a page or post out of the sitemap layout:

```yaml
sitemap: false
```

---

## Hiding the theme from Jekyll's build

Add the theme directory to `exclude` so Jekyll doesn't try to process it as site content:

```yaml
exclude:
  - theme
```

---

## Moving the theme to its own repository

When you are ready to publish the theme separately:

1. Copy `theme/awayfromhome-theme/` into its own git repository.
2. Publish it as a RubyGem or reference it via a git source in the Gemfile.
3. Replace the `path:` entry in the site's Gemfile:

```ruby
# Local development
gem "awayfromhome-theme", path: "theme/awayfromhome-theme"

# After publishing
gem "awayfromhome-theme", git: "https://github.com/yourorg/awayfromhome-theme"
# or
gem "awayfromhome-theme"   # from rubygems.org
```
