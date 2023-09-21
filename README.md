# Oira no Reader

A low-CSS, low-JS static site builder for chaptered content

## Usage

To publish your content to GitHub Pages, you'll need to create a separate GitHub repo and include this repo as a [submodule](https://github.blog/2016-02-01-working-with-submodules/). The structure for the content repo should be the same as that of [oira2/bokura](oira2/bokura).

### Repo structure

```
.
├── .github/workflows/deploy.yml
├── chapters
│   ├── 1.html
│   ├── 2.html
│   └── ...
├── site # this repo
└── metadata
    ├── ao3-url.txt
    ├── site-url.txt
    ├── summary.html
    └── title.txt
```

#### `.github/workflows/deploy.yml`

[See oira2/bokura for an example.](https://github.com/oira2/bokura/blob/main/.github/workflows/deploy.yml)

#### Chapter files (`1.html`, `2.html`, etc.)

The first line should be the name of the chapter (for example, *In the Beginning*).

The rest of the file should be HTML, including a &lt;h1&gt; chapter heading. Normal paragraphs should be wrapped in &lt;p&gt; tags. 

#### `site`

This should be a Git submodule pointing to this repo. `site/README.md` should be the file you're reading now.

#### `metadata/ao3-url.txt`

The URL to access your content on AO3.

This field is currently required, but I'll accept PRs to make it optional or generalise it to any external link.

#### `metadata/site-url.txt`

This should be the root of your GitHub Pages site, which is required to make sure link and asset paths are correct.

Must end with a trailing slash.

#### `metadata/summary.html`

A HTML summary of your content. This will be displayed on the home page.

#### `metadata/title.txt`

The title of your content. This will be used in various places, including the home page and the PWA manifest.

### Deployment

Just push your content repo to GitHub with GitHub Pages configured to use Actions.

It will be deployed at `https://<USERNAME>.github.io/<REPO>/`.
