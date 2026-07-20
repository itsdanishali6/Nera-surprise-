# Birthday Surprise — Neha

A premium, aurora-lit birthday experience — dark navy backdrop, purple/pink aurora glow, gold accents, glassmorphism cards, and floating micro-interactions layered over the same interactive story: an animated letter, a Pinterest-style memory gallery, a glowing vertical timeline, a blow-the-candles cake, a surprise gift, a wall of wishes, and a fireworks finale.

Open `index.html` in any modern browser. No build step or server is required.

## Editing in VS Code

1. Unzip the project fully, then in VS Code choose **File → Open Folder…** and select the extracted folder (or double-click `neha-birthday-website.code-workspace`).
2. VS Code will suggest installing a couple of helpful extensions (Live Server, Prettier) — accept if you'd like live-reload previewing and auto-formatting; both are optional.
3. To preview with auto-refresh on save, install the **Live Server** extension, then right-click `index.html` → **Open with Live Server**. (Opening the file directly, via double-click, also works with no extension needed — Live Server just adds auto-refresh.)
4. All personalization still lives in `js/config.js` — name, date, message, music, photos, memories, wishes, gift message, and accent colors.
5. Structure:
   - `index.html` — page markup
   - `css/style.css` — all styling (aurora background, glassmorphism, layout, animations)
   - `js/config.js` — content you edit
   - `js/app.js` — site behavior (do not need to touch unless changing functionality)
   - `assets/` — photos, music, icons, videos

## Personalize

Everything editable lives in `js/config.js`: recipient name, birthday, message, music, photos, memories, wishes, gift message, and accent colours.

1. Copy photos into `assets/images/` and music into `assets/audio/`.
2. Update `photos` and `music` in `js/config.js` with the exact file names.
3. Refresh the browser. Music begins only after “Open Your Surprise” is clicked.

The gallery supports JPG, PNG, WebP, and AVIF. For fast loading, use compressed WebP/JPEG images around 1600px wide.
