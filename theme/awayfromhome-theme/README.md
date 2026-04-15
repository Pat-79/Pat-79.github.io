# AwayFromHome Theme

A reusable Jekyll theme gem that separates shared site design from site-specific content.  
Version **0.1.0** · Author **Patrick**


## Design philosophy

The theme owns every visual and interactive concern — layouts, components, motion, typography, dark mode, print styles, and accessibility — so the consuming site can focus exclusively on content, identity, and configuration.


## Directory structure

```
theme/awayfromhome-theme/
├── _includes/          # Reusable Liquid partials
├── _layouts/           # Page layout templates
├── _sass/
│   └── awayfromhome-theme/
│       ├── _variables.scss   # Design tokens
│       ├── _layout.scss      # Global layout & components
│       ├── _post.scss        # Post-specific styles
│       └── _print.scss       # Print stylesheet
├── assets/
│   ├── css/main.scss         # CSS entrypoint (import target)
│   ├── images/               # Built-in SVG assets
│   └── js/theme.js           # Theme JavaScript
├── awayfromhome-theme.gemspec
└── README.md
```


## Installation

### Local path (development)

```ruby
# Gemfile
gem "awayfromhome-theme", path: "theme/awayfromhome-theme"
```

```yaml
# _config.yml
theme: awayfromhome-theme
```

### Git source

```ruby
gem "awayfromhome-theme", git: "https://github.com/yourorg/awayfromhome-theme"
```

### RubyGems (after publishing)

```ruby
gem "awayfromhome-theme"
```

Then run:

```bash
bundle install
bundle exec jekyll serve
```


## What the site must provide

| Concern | Location |
|---|---|
| Content pages and posts | `index.html`, `_posts/`, etc. |
| Site identity and config | `_config.yml` |
| CSS entrypoint | `assets/css/main.scss` |
| Site-specific SCSS overrides | `_sass/site/` |

The theme directory must be excluded from Jekyll's own build:

```yaml
# _config.yml
exclude:
  - theme
```


## Layouts

All layouts inherit from `default`. Set `layout:` in each page's front matter.

### `default`

Base shell. Renders: skip link, drawer, header, optional hero image (when `image:` is set), main content slot, footer.

```yaml
layout: default
title: My Page
image: /assets/images/my-hero.svg   # activates full-width banner
```


### `home`

Full-screen landing hero with a YouTube video or image background, centered site title and tagline, a pulsing scroll-down arrow, and a first-scroll snap into the latest posts section.

```yaml
layout: home
landing_video_url: https://youtu.be/VIDEO_ID   # any YouTube URL format
landing_image: /assets/images/fallback.svg     # shown when no video is configured
latest_posts_limit: 2
```

Site-wide config fallbacks:

```yaml
home_landing:
  video_url: https://youtu.be/VIDEO_ID
  image: /assets/images/fallback.svg
```

YouTube URL formats accepted: `youtu.be/ID`, `youtube.com/watch?v=ID`, `youtube.com/embed/ID`.


### `post`

Blog post layout with a full-width hero image, post title, author byline, date, tags, body content, author card, and an optional "Continue Reading" banner that links to the previous or next post.

Front matter:

| Key | Description |
|---|---|
| `title` | Post title (required) |
| `image` | Hero background image; falls back to `site.default_post_image` |
| `tags` | Array of tag strings |
| `author` | Overrides `site.author` for this post |
| `date` | Publication date (derived from filename by default) |

Example:

```yaml
title: Slovenia, Lakes and Late Light
image: /assets/images/post-hero-slovenia.svg
tags: [europe, mountains, lake]
```

Posts get the `post` layout automatically via `_config.yml` defaults:

```yaml
defaults:
  - scope:
      path: ""
      type: posts
    values:
      layout: post
      author: Your Name
```


### `blog`

Displays all posts (or a limited set) as media cards with image, date, title, and excerpt.

```yaml
layout: blog
permalink: /blog/
image: /assets/images/page-hero-blog.svg
blog_intro: Recent posts.
blog_excerpt_words: 30
blog_posts_limit:          # omit to show all posts
```

Site-wide config fallbacks:

```yaml
blog_page:
  intro: Recent posts.
  excerpt_words: 30
  posts_limit:
```


### `tag-index`

Tag index page with filter chips and grouped post lists. Filtering is driven by the URL query parameter `?tag=slug`. Works without JavaScript via section visibility.

```yaml
layout: tag-index
permalink: /tags/
image: /assets/images/page-hero-tags.svg
```


### `tag-cloud`

Visual tag cloud page. Chips are scaled by usage frequency.

```yaml
layout: tag-cloud
permalink: /tags/cloud/
```


### `sitemap`

Auto-generates a sitemap with two sections: **Pages** and **Posts**.  
Automatically excludes: the current page itself, pages with `sitemap: false`, pages whose URL or title contains `404`.

```yaml
layout: sitemap
permalink: /sitemap/
image: /assets/images/page-hero-sitemap.svg
```

To hide any page from the sitemap:

```yaml
sitemap: false
```


### `social-media`

Renders social links as a styled list. Sources links from front matter → `site.social_page.links` → `site.social_links`.

```yaml
layout: social-media
permalink: /social-media/
image: /assets/images/page-hero-social.svg
social_intro: Follow along on social media.
social_open_new_tab: true
# social_links:                        # override per-page
#   - platform: instagram
#     url: https://instagram.com/you
#     title: Instagram
```

Site-wide config:

```yaml
social_page:
  intro: Follow along.
  open_new_tab: true
```


### `error`

HTTP error pages (400, 403, 404, 500 …). Auto-detects the code from the page title. Renders a centered card with code, message, and a CTA button.

```yaml
layout: error
permalink: /404.html
sitemap: false
image: /assets/images/page-hero-error-404.svg
# error_code: 404                       # auto-detected from title if omitted
# error_title: Not Found
# error_message: The page could not be found.
# error_cta_label: Back to home
# error_cta_url: /
```

Default messages per code: `400` Bad Request · `403` Forbidden · `404` Not Found · `500` Server Error.

Site-wide CTA defaults:

```yaml
error_page:
  cta_label: Back to home
  cta_url: /
```

Built-in error hero images (in `assets/images/`):

- `page-hero-error-400.svg`
- `page-hero-error-403.svg`
- `page-hero-error-404.svg`


## Includes

| File | Purpose |
|---|---|
| `head.html` | `<head>` block — meta, fonts, CSS, theme init script |
| `meta-tags.html` | SEO, Open Graph, Twitter Card, JSON-LD structured data |
| `header.html` | Fixed top navigation bar with logo and menu toggle |
| `footer.html` | Footer with brand, legal note, and social links |
| `sidebar.html` | Drawer panel — navigation, tags, archive, social links |
| `author-card.html` | Post author bio card |
| `social-links.html` | Reusable social icon link group |
| `tag-cloud.html` | Reusable tag chip cloud (used in sidebar and pages) |
| `tag-index.html` | Tag filter + grouped posts content |
| `tag-cloud-page.html` | Standalone tag cloud page content |
| `icon.html` | SVG icon sprite lookup by platform name |
| `script.html` | Deferred theme JS `<script>` tag |


## Design tokens (`_variables.scss`)

All variables use `!default` so consuming sites can override any value before the theme is imported.

Key token groups:

| Group | Examples |
|---|---|
| Typography | `$font-display`, `$font-body` |
| Layout | `$layout-max-width`, `$reading-width`, `$panel-max-width`, `$page-gutter`, `$header-height` |
| Radii | `$radius-small`, `$radius-large`, `$radius-pill` |
| Motion | `$motion-fast` (160ms), `$motion-base` (240ms), `$motion-theme` (400ms) |
| Breakpoints | `$breakpoint-mobile` (640px), `$breakpoint-desktop` (900px) |
| Light palette | `$light-bg`, `$light-accent`, `$light-header-scrolled`, … |
| Dark palette | `$dark-bg`, `$dark-accent`, `$dark-header-scrolled`, … |
| On-image | `$on-image-heading-shadow`, `$on-image-strong`, `$on-image-subtle`, … |

Override any token in the site's own SCSS before importing the theme:

```scss
// assets/css/main.scss
$font-display: "My Custom Font", sans-serif;
$light-accent: #e05c2a;

@use "awayfromhome-theme/variables";
@use "awayfromhome-theme/layout";
// …
```


## Theme features

### Three-state color theme

Auto / Light / Dark — persisted in `localStorage`, with correct OS preference fallback in Auto mode.  
Default can be set in config:

```yaml
theme_settings:
  default_theme: auto   # auto | light | dark
```

### Navigation drawer

Slide-in drawer from the right with full keyboard focus-trap, Escape-to-close, and outside-click-to-close. Content shifts left on mobile/tablet.

### Header scroll behavior

- Solid dark background + blur applied immediately on first scroll pixel.
- Header height reduces once the post hero image exits the viewport.

### Scroll-snap homepage

On the home layout, the first downward scroll (wheel, touch, keyboard) snaps directly past the full-screen hero into the content section.

### Tag filtering

`?tag=slug` URL parameter drives visible post sections on the tag index page. The tag cloud in the drawer links to the same format. Falls back gracefully without JavaScript.

### Share button

Copies the current page URL to clipboard using the Clipboard API with a fallback. Shows an accessible toast notification with the result.

### Print styles

Clean print output: hero images, footer, navigation, and interactive components hidden; body text reflowed to full width.


## Built-in SVG assets

Located in `assets/images/`:

| File | Used for |
|---|---|
| `logo-mark.svg` | Site brand logo reference |
| `icons.svg` | SVG sprite for all platform and UI icons |
| `page-hero-about.svg` | About page default hero |
| `page-hero-archive.svg` | Archive page default hero |
| `page-hero-blog.svg` | Blog page default hero |
| `page-hero-tags.svg` | Tags page default hero |
| `page-hero-sitemap.svg` | Sitemap page default hero |
| `page-hero-social.svg` | Social media page default hero |
| `page-hero-error-400.svg` | 400 error page hero |
| `page-hero-error-403.svg` | 403 error page hero |
| `page-hero-error-404.svg` | 404 error page hero |


## Publishing as a standalone gem

When ready to extract the theme into its own repository:

1. Copy this directory into a new git repository.
2. Update `awayfromhome-theme.gemspec` with the correct author, homepage, and source URI.
3. Publish with `gem build awayfromhome-theme.gemspec && gem push awayfromhome-theme-0.1.0.gem`.
4. Replace the `path:` entry in the consuming site's Gemfile:

```ruby
# Before
gem "awayfromhome-theme", path: "theme/awayfromhome-theme"

# After (git)
gem "awayfromhome-theme", git: "https://github.com/yourorg/awayfromhome-theme"

# After (RubyGems)
gem "awayfromhome-theme"
```