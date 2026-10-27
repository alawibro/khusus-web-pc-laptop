# Portfolio — M. Baihaqi Alawi

A Persona 5 menu-inspired portfolio, structured as Model–View–Controller.

Berdasarkan template *Persona-Style Portfolio* karya Meraj Rahman (github.com/Omicron69).

## Structure

```
├── index.html            View skeleton — markup only, no logic or styles
├── css/
│   └── style.css         All styling (theme colors in :root at the top)
├── js/
│   ├── model.js          DATA — project list, categories, skills, app state
│   ├── view.js           DOM — rendering, ransom lettering, wipe, cursor, sound
│   └── controller.js     EVENTS — keyboard/mouse input, navigation logic
└── assets/
    ├── sfx/select.mp3    Menu sound (plays on select/confirm)
    ├── cursors/          Animated cursor sprite strips (30 frames each)
    ├── menus/            per-screen backgrounds: home.jpg, skills.jpg, about.jpg,
    │                     contact.jpg (included). The Projects screen has no art.
    ├── hero.png          ← optional: extra art layered on the home screen
    └── me.jpg            your photo for the About polaroid
```

Missing optional images hide themselves. The project cards draw their
thumbnails in CSS, so they need no image files.

## Editing content

Everything you'd normally want to change lives in **js/model.js**:
the project list (`projects`, each with `category: "mobile"` or `"pc"`
and an `https://` demo URL), the category labels, skill bars and the
contact email. Bio and contact links are plain HTML in **index.html**.
Colors are CSS variables at the top of **css/style.css**.

## Run locally

```
python3 -m http.server
```
then open http://localhost:8000 — opening index.html directly (file://)
blocks the audio fetch and the contact form relay in most browsers.

## Deploy

Push the whole folder to a GitHub repo, enable Pages
(Settings → Pages → Deploy from branch → main → / root). Done.

## Controls

↑ / ↓ select · Enter confirm · Esc back · click the name to go home
