<p align="center">
  <a href="https://opencode.ai">
    <picture>
      <source srcset="packages/console/app/src/asset/logo-ornate-dark.svg" media="(prefers-color-scheme: dark)">
      <source srcset="packages/console/app/src/asset/logo-ornate-light.svg" media="(prefers-color-scheme: light)">
      <img src="packages/console/app/src/asset/logo-ornate-light.svg" alt="MrCodeTol logo">
    </picture>
  </a>
</p>
<p align="center">The open source AI coding agent.</p>
<p align="center">
  <a href="https://opencode.ai/discord"><img alt="Discord" src="https://img.shields.io/discord/1391832426048651334?style=flat-square&label=discord" /></a>
  <a href="https://www.npmjs.com/package/opencode-ai"><img alt="npm" src="https://img.shields.io/npm/v/opencode-ai?style=flat-square" /></a>
  <a href="https://github.com/anomalyco/opencode/actions/workflows/publish.yml"><img alt="Build status" src="https://img.shields.io/github/actions/workflow/status/anomalyco/opencode/publish.yml?style=flat-square&branch=dev" /></a>
</p>

<p align="center">
  <a href="README.md">English</a> |
  <a href="README.zh.md">简体中文</a> |
  <a href="README.zht.md">繁體中文</a> |
  <a href="README.ko.md">한국어</a> |
  <a href="README.de.md">Deutsch</a> |
  <a href="README.es.md">Español</a> |
  <a href="README.fr.md">Français</a> |
  <a href="README.it.md">Italiano</a> |
  <a href="README.da.md">Dansk</a> |
  <a href="README.ja.md">日本語</a> |
  <a href="README.pl.md">Polski</a> |
  <a href="README.ru.md">Русский</a> |
  <a href="README.bs.md">Bosanski</a> |
  <a href="README.ar.md">العربية</a> |
  <a href="README.no.md">Norsk</a> |
  <a href="README.br.md">Português (Brasil)</a> |
  <a href="README.th.md">ไทย</a> |
  <a href="README.tr.md">Türkçe</a> |
  <a href="README.uk.md">Українська</a> |
  <a href="README.bn.md">বাংলা</a> |
  <a href="README.gr.md">Ελληνικά</a> |
  <a href="README.vi.md">Tiếng Việt</a>
</p>

[![MrCodeTol Terminal UI](packages/web/src/assets/lander/screenshot.png)](https://opencode.ai)

---

### Installation

There is no published package yet. Build the CLI from source and install it
locally — the full guide, including Windows specifics, is in
**[INSTALL.md](INSTALL.md)**.

```bash
bun install
OPENCODE_VERSION=1.0.0 ./packages/opencode/script/build.ts --single
./install --binary ./packages/opencode/dist/<target>/bin/mrcodetol
```

The command is `mrcodetol`, with `mct` as a short alias.

### Desktop App

The desktop app is an Electron wrapper around the web UI. Build and package it
per platform:

```bash
bun run --cwd packages/desktop build
bun run --cwd packages/desktop package:win     # or package:mac / package:linux
```

Producing a macOS `.dmg` requires macOS; the CLI cross-compiles from any host,
the desktop app does not.

### Agents

MrCodeTol includes two built-in agents you can switch between with the `Tab` key.

- **build** - Default, full-access agent for development work
- **plan** - Read-only agent for analysis and code exploration
  - Denies file edits by default
  - Asks permission before running bash commands
  - Ideal for exploring unfamiliar codebases or planning changes

Also included is a **general** subagent for complex searches and multistep tasks.
This is used internally and can be invoked using `@general` in messages.

Learn more about [agents](https://opencode.ai/docs/agents).

### Documentation

For more info on how to configure MrCodeTol, [**head over to our docs**](https://opencode.ai/docs).

### Contributing

If you're interested in contributing to MrCodeTol, please read our [contributing docs](./CONTRIBUTING.md) before submitting a pull request.

### Building on MrCodeTol

If you are working on a project that's related to MrCodeTol and is using "mrcodetol" as part of its name, for example "mrcodetol-dashboard" or "mrcodetol-mobile", please add a note to your README to clarify that it is not built by the MrCodeTol team and is not affiliated with us in any way.

---

**Join our community** [Discord](https://discord.gg/opencode) | [X.com](https://x.com/opencode)
