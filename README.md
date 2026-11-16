# The Sky Has a Pulse

**The Sky Has a Pulse** is a small generative artwork made for make.fun’s
**ai-excited-01** competition. A luminous manta ray rises from a dark ocean,
passing in front of a radiant portal and a distant amber sun. Fine wing ribs,
current lines, stars, and a restrained technical frame give the scene the
feeling of a field note from an unfamiliar sea.

The image is drawn directly into a 512 × 512 RGBA pixel buffer. The scene uses
fixed geometry and a seeded pseudo-random sequence, so every run produces the
same composition. A compact PNG encoder writes the image using only Node.js
built-in modules; no package installation is needed.

[![ai-excited-01](https://make.fun/badge/ai-excited-01.svg)](https://make.fun/c/ai-excited-01)
[![nawab2321/ai-excited-entry rank](https://make.fun/badge/ai-excited-01/nawab2321/ai-excited-entry/rank.svg)](https://make.fun/c/ai-excited-01)
[![nawab2321/ai-excited-entry reward](https://make.fun/badge/ai-excited-01/nawab2321/ai-excited-entry/reward.svg)](https://make.fun/c/ai-excited-01)

## Artwork concept

The portal forms the quiet center of the composition: concentric, incomplete
cyan arcs suggest motion without closing the opening. The manta ray spans the
foreground, its broad fan-shaped wings traced with thin bioluminescent ribs.
Warm light from the sun contrasts with the deep blue water and sky. The title,
**THE SKY HAS A PULSE**, frames the image as a moment when the ocean and sky
briefly share the same horizon.

## Requirements

- Node.js 22 or newer
- No third-party dependencies

## Setup and execution

Clone or download this repository, then run the generator from its directory:

```sh
node main.ts
```

The generator writes `entry.png` into `/output`, the make.fun runner’s output
directory. To write somewhere else (including this project directory), set
`MAKEFUN_OUTPUT_DIR` to a writable path:

```sh
mkdir -p out
MAKEFUN_OUTPUT_DIR=out node main.ts
```

The resulting file is `out/entry.png`. The output is a deterministic 512 × 512
PNG; running the command again replaces the file with the same artwork.

## Competition

This repository is an entry for the [make.fun ai-excited-01 competition](https://make.fun/c/ai-excited-01).
The badges above link to the competition page and display the entry’s current
rank and reward information.
