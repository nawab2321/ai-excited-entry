# The Sky Has a Pulse

An original, deterministic Node.js 22 artwork generator for make.fun's **ai-excited-01** competition. It draws a bioluminescent manta ray crossing an ocean-sky portal, then writes a complete PNG without external packages.

[![ai-excited-01](https://make.fun/badge/ai-excited-01.svg)](https://make.fun/c/ai-excited-01)
[![nawab2321/ai-excited-entry rank](https://make.fun/badge/ai-excited-01/nawab2321/ai-excited-entry/rank.svg)](https://make.fun/c/ai-excited-01)
[![nawab2321/ai-excited-entry reward](https://make.fun/badge/ai-excited-01/nawab2321/ai-excited-entry/reward.svg)](https://make.fun/c/ai-excited-01)

## Run

```sh
mkdir -p out
MAKEFUN_OUTPUT_DIR=out node main.ts
```

The generator writes `out/entry.png`. Set `MAKEFUN_OUTPUT_DIR` to choose another writable output directory; the competition runner uses `/output`.
