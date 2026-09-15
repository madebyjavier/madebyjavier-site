# made by Javier — site

Plain static HTML. No build step, no dependencies. Open any `.html` in a
browser and it works; push to Vercel and it works the same.

```
portafolio/
├── index.html                       →  /
├── work/
│   ├── index.html                   →  /work
│   ├── nextrade/index.html          →  /work/nextrade
│   ├── a-frame-of-distance/index.html
│   └── conversphere/index.html
├── css/site.css      ← all design lives here. One file, every page.
├── js/site.js        ← scroll, card morph, tool mixer
├── assets/           ← images
├── vercel.json
└── README.md
```

---

## Adding a project

1. **Duplicate a project folder**
   `work/nextrade/` → `work/my-new-project/`
   The folder name becomes the URL: `/work/my-new-project`.

2. **Open its `index.html` and change only these five blocks.**
   They are numbered in comments inside the file:

   | Block | What to change |
   |---|---|
   | `<title>` + `<meta description>` | Project name, one-sentence summary |
   | **1 · HEAD** | Kicker, `<h1>`, the lead line, and the four `<dl>` facts |
   | **2 · COVER** | The cover image path — or a Vimeo film: add `is-video` and `data-vimeo="VIDEO_NUMBER"` to the figure (see A Frame of Distance) |
   | **3 · THE STORY** | The task / What I did / What changed + the punch line |
   | **4 · GALLERY** | Image paths and captions — add or delete `<figure>` blocks freely |
   | **5 · NEXT** | Point it at whichever project should come next |

   Everything else — nav, footer, classes, layout — stays untouched.

3. **Drop the images into `assets/`.**
   Cover: 4:3 or 16:9, around 1200 px wide. Gallery: same width.
   A missing image removes itself instead of showing a broken icon.

4. **Add the card to `work/index.html`.**
   Two `.pcard.soon` placeholder slots are already there — replace one with
   a real `<a class="pcard">` block, copying the NexTrade card above it.

5. *(Optional)* Add it to the home page's `.cases` section if it deserves
   top billing. The home page shows two; the gallery shows all.

---

## Deploying to Vercel

**First time**

1. Put this folder in a Git repo and push it to GitHub.
2. vercel.com → *Add New Project* → import the repo.
3. Framework preset: **Other**. Root directory: the folder holding
   `index.html`. No build command, no output directory.
4. Deploy.

**After that** — every `git push` deploys automatically.

**Custom domain** — Project → Settings → Domains → add `madebyjavier.com`,
then point the DNS records Vercel gives you.

`vercel.json` turns on clean URLs (`/work` instead of `/work/index.html`)
and caches `assets/` for a year. If you replace an image, change its
filename so browsers pick up the new one.

---

## Editing the design

Everything visual is in `css/site.css`, in this order:

- **TOKENS** — colours, fonts, spacing. Change `--accent` and the whole
  site changes.
- Components, top to bottom: nav, hero, sections, cards, footer
- **WORK GALLERY** — the `/work` grid
- **PROJECT PAGE** — the shared project layout
- **RESPONSIVE** — breakpoints at 1700 / 1180 / 980 / 640 / 520

`js/site.js` holds three independent blocks. Each one exits on its own if
the page does not use it, so every page can safely load the same file.
