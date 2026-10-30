# Supanova — product demo video

A motion-graphics product demo of **Supanova**, a crypto wallet live on Canton Network, built entirely in code (no After Effects).
Every screen, asset and font comes from the Supanova Figma file; the scene is HTML/CSS animated with **GSAP**, rendered
deterministically frame-by-frame with **Playwright**, and encoded with **ffmpeg** at 1920×1080, 60 fps.

Every rendered version is in [`videos/`](videos/) — `Supanova_Demo_v1.mp4` … `Supanova_Demo_v10.mp4`.

## Versions

| Version | Length | Page / scene | What changed |
|---|---|---|---|
| v1 | 20.0s | `index.html` + `scene_v1.js` | First cut, modelled on the reference video's structure |
| v2 | 20.0s | `index.html` + `scene.js` | Elements come *from* the interface (no flying in), centred check rings, status panel rises from under the card, no globe |
| v3 | 44.5s | `index3.html` + `scene3.js` | GSAP rewrite, slower Apple-style pacing, 3D tilts |
| v4 | 26.6s | `index4.html` + `scene4.js` | v2 pace + GSAP camera, individual staggered entrances, no tilts, more lateral pans, button shines |
| v5 | 26.6s | `index5.html` + `scene5.js` | Real spinners, live swap conversion, spring on the swap arrows, pointer hand, translucent "Copied" chip |
| v6 | 27.15s | `index6.html` + `scene6.js` | Camera grammar: 3 shot sizes, log-space zoom, straight-line targets, one ease, no overlapping moves, gentle drift |
| v7 | 25.45s | `index7.html` + `scene7.js` | Fewer camera moves per screen, push-in on swap arrows then pan down to status, pasted address, Figma-exact corner radii |
| v8 | 27.03s | `index8.html` + `scene8.js` | "Send in seconds." gets its own text card, swap max zoom 2.0×, level dashboard glide |
| v9 | 28.59s | `index9.html` + `scene9.js` | Tagline as its own card sliding into the dashboard, send close-up capped at 2.0× |
| **v10** | **28.59s** | `index10.html` + `scene10.js` | **v9 + a subtle frosted-glass plate under the app window, with a soft elevation shadow** |

v1–v6 were rendered with the pre-v7 asset crops, kept in `assets_pre_v7/`. Each version is its own commit on `main` (commit messages start with the version number), so `git checkout <commit>` gives you that version's exact source.

## Render (Mac)

Needs Node 18+, Python 3 and ffmpeg (`brew install node ffmpeg`), then:

```bash
npm install                      # gsap, sharp, playwright
npx playwright install chromium
npm run serve &                  # static server on 127.0.0.1:8123
PAGE=index10.html node render.js video Supanova_Demo_v10.mp4 60 0 28.59
```

- Stills: `PAGE=index10.html node render.js stills 3.5,7.8,17.7 out/`
- Camera audit (moves, overlaps, zoom levels): `node tools/camprobe.js index10.html cam.json`
- Optional stepped "choppy" preview (v9/v10 scenes): `PAGE="index10.html?chop=12" …` or `?chop=12&mode=ui`

## Layout

- `assets/` — screen crops exported from Figma at 3× (`src_*` are the raw full-screen exports), cleaned status cards, wordmark
- `fonts/` — Friends (the typeface used in the Figma file)
- `tools/crops.py` — re-crops element PNGs from the raw exports with Figma's corner radii
- `tools/camprobe.js` — logs every camera move and per-frame camera for checking pacing
- `render.js` — Playwright → raw frames → ffmpeg (libx264, crf 14), with sub-frame motion blur on fast moves
