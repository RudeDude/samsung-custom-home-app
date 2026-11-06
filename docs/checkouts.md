# Upstream checkouts

This repository does not vendor the upstream trees. Clone them as sibling
directories of this README. They are listed in `.gitignore`.

The steps below were run against these revisions:

| Directory | Upstream | Revision used here |
|---|---|---|
| `samsung-tv-tools` | <https://github.com/invaliddayta/samsung-tv-tools> | `9f4d0a5` |
| `samsung-tv-root` | <https://github.com/chris-ritsen/samsung-tv-root> | `3b97edf` (`v0.0.12`) |
| `quiet-tizen` | <https://github.com/jss8649/quiet-tizen> | `cf518d7` (`v0.1.0`) |

```sh
git clone https://github.com/invaliddayta/samsung-tv-tools.git
git clone https://github.com/chris-ritsen/samsung-tv-root.git
git clone https://github.com/jss8649/quiet-tizen.git
```

`samsung-tv-tools` is the program that has been run against the television.
`samsung-tv-root` is reserved for a later archive-root cross-check and has
not been installed into a virtual environment. `quiet-tizen` is a reference
for inventory and rollback habits. Its `tools/tv.py` refuses this model, so
do not point it at the television.

Their licenses stay with them: MIT, the Unlicense, and MIT.
