# The Lens — Public Website Prototype

Responsive public website prototype for The Lens Publication. All HTML pages are kept in the project root; shared styles, scripts, images, and downloadable document templates are organized into separate folders.

## Run locally

Use a local server because the site loads shared header/footer partials and JavaScript modules.

- **VS Code:** Open this folder and start Live Server from `index.html`.
- **Python:** Run `python -m http.server 8000` from this folder, then visit `http://localhost:8000`.

## Structure

```text
*.html       Website pages and shared partials at the root
css/         Shared and page-specific stylesheets
js/          Entry point and reusable JavaScript modules
images/      Logo, article imagery, member placeholders, document preview artwork
documents/  Downloadable CSV templates
```

## Pages and features

- `index.html` — public homepage
- `latest.html`, `news.html`, `features.html`, `opinion.html`, `science.html`, `literature.html` — article discovery pages
- `archives.html` — archive browsing
- `about.html` — publication overview, executive board, document library, Facebook page, and email contact
- `members.html` — the 19 leadership/editorial positions and 43 staffer slots, with sticky Go back and Back to top controls
- `feedback.html` — Feedback to the Editor form, validation, submission confirmation, and direct contact links
- `author.html?name=Author%20Name` — individual author profile with role/category label, article count, and stories by that author
- `header.html`, `footer.html` — shared page partials included by the site JavaScript

There is no separate Transparency page; the document library is integrated into About Us at `about.html#documents`.

## Implementation notes

- The site header includes the Philippine-local date and member login. Facebook and email icons use matching circular styling. The campus name is hidden on mobile widths, and About Us / Send Feedback shortcuts are placed in the navigation drawer on small screens.
- The About Us page uses title-case motto text: **“Basta Lente, Abante!”** The motto has a subtle flip animation that respects the reduced-motion accessibility setting.
- Document preview cards open in a modal with a visible close button, support Escape/backdrop closing, and restore focus to the preview button when closed.
- Officer/staffer names and portraits are placeholders because an approved roster and photos were not provided. Replace roster values in `js/about-page.js` with approved names and image paths.
- The downloadable files in `documents/` are blank CSV templates, and the SVG artwork is sample template preview imagery. They are not official financial reports. Replace them with approved records and corresponding previews when those are available.
- The email address is `thelenspublicationpupbc@gmail.com`. The Facebook URL in `js/site-config.js` is the official page URL supplied for this project.
- This is a front-end prototype. Article view and copy-link counts are browser-local and are not shared analytics; shared tracking requires a backend and database.

## Maintenance

- `css/header.css` — shared header, search/filter UI, and responsive navigation
- `css/article-modal.css` — article reader with visually hidden scrollbars and retained touch/wheel/keyboard scrolling
- `css/about.css` — About Us, Members, document library, and preview modal styles
- `js/main.js` — application entry point and page initialization
- `js/about-page.js` — reusable member roster and profile-card rendering
- `js/document-library.js` — document card rendering, downloads, and accessible preview modal
- `js/site-config.js` — central publication email and Facebook URL settings
- `js/feedback.js` — feedback validation, session-only demo saving, and prefilled email draft creation
- `js/author-page.js` — reusable author profile rendering and article-by-author lists
- `css/feedback.css` / `css/author-profile.css` — responsive feedback form, reusable animated envelope illustration, and author profile styles


## Feedback to the Editor and author profiles

- `feedback.html` contains the public Feedback to the Editor form. Name is optional; Subject and Message are required. The static prototype validates input, stores a temporary demo record in the current browser session, then offers a prefilled email draft to `thelenspublicationpupbc@gmail.com`. It does not deliver submissions automatically without a backend or form service.
- `author.html?name=Author%20Name` renders each author's role/category label, article count, and published articles. Article bylines in cards and the article reader link to the matching author profile.
- The official Facebook link is configured in `js/site-config.js` and points to the provided page ID.
- The Members page has a sticky Go back control and a floating Back to top button.
