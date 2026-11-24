# AlaraBO

Interactive educational simulator for occupational radiation protection in operating rooms and fluoroscopy-guided procedures.

**Live demonstration:** https://alarabo.lovable.app/

AlaraBO illustrates how time, distance, apron shielding, staff position and C-arm angulation influence a simplified radiation exposure scenario. The project originated in a Portuguese hospital department and, according to its maintainer, is used by approximately 20 healthcare professionals with positive informal feedback.

## Features
- Interactive operating-room schematic and four staff roles
- Six illustrative procedure presets and adjustable fluoroscopy time
- Distance, apron and C-arm controls
- Local scenario history and educational comparisons
- Portuguese-language ALARA education

**Educational use only.** Numerical outputs are illustrative proxies, not validated effective dose, personal dosimetry or a basis for clinical decisions. See [methodology](METHODOLOGY.md) and [references](REFERENCES.md).

## Development
React, TypeScript, TanStack Start, Vite and Vitest. Built originally with Lovable.

```sh
git clone https://github.com/clarxpt/alarabo.git
cd alarabo
bun install --frozen-lockfile
bun run dev
bun run test
bun run build
```

## Contributing
See [CONTRIBUTING.md](CONTRIBUTING.md). The proposed MIT license requires maintainer confirmation of rights and third-party notices before adoption.
