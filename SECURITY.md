# Security

Report suspected security issues privately to the maintainer; use GitHub private vulnerability reporting if enabled. Do not include patient data or credentials in issues or pull requests.

CI checks known dependency advisories, tests and build compatibility. A basic historical credential-pattern scan is also performed; it does not prove the absence of secrets. Enable GitHub secret scanning and push protection if available. Revoke exposed credentials rather than only deleting files. The scoped minimatch override addresses GHSA-g3hv-75wg-m249 in the TypeScript lint tooling; remove it when the upstream dependency adopts a patched compatible version.

Third-party software retains its own licenses. Review bundled assets and required notices before redistributing builds. Do not treat the MIT license as covering third-party materials.
