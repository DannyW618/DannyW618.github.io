# DannyW618.github.io

Personal academic website hosted with GitHub Pages.

## Editing the site

- `index.html` contains all visible text, links, publications, and page sections.
- `styles.css` contains the colours, typography, layout, and responsive rules.
- `script.js` contains the theme switcher, animated headline, image zoom, and BibTeX citations.
- `images/` contains publication figures.
- `fonts/` contains the locally hosted web fonts used by `styles.css`.

The page has no build step. After an edit, open `index.html` in a browser or run a local server from this directory:

```sh
python3 -m http.server 8000
```

Then visit `http://localhost:8000`.

## Common updates

- Update biography, research, publication, teaching, or award text directly in `index.html`.
- Add a publication by copying an existing `<article>` in the `#publications` section, then add its BibTeX entry to `citations` in `script.js`.
- Replace a publication figure in `images/` while keeping its filename, or update the corresponding image path in `index.html`.
- Replace `files/CV.pdf` when publishing an updated Curriculum Vitae.
- Remove the `.visitor-map` block from the footer if visitor tracking through MapMyVisitors is not wanted.

Do not commit private keys, passwords, access tokens, unpublished material, or a CV containing a private address or phone number.
