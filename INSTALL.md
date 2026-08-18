# Installing MrCodeTol

The command is `mrcodetol`, with `mct` as a short alias.

There is no published package yet, so building from source is the only supported
route. Go to your platform: **[Windows](#windows)** · **[macOS](#macos)** ·
**[Linux](#linux)**.

---

## Prerequisites

| | |
|---|---|
| Bun | must satisfy the `packageManager` field in [package.json](package.json) |
| Git Bash | **Windows only** — the build and install scripts are POSIX shell |

```bash
bun install
```

---

## Windows

### 1. Build

In **Git Bash** — not PowerShell, the script uses `rm -rf` and `mkdir -p`:

```bash
cd /d/PROJECTS/mrcodetol
OPENCODE_VERSION=1.0.0 ./packages/opencode/script/build.ts --single
```

Check what came out:

```bash
ls packages/opencode/dist/*/bin/
```

You should see `mrcodetol.exe`. The folder is `opencode-windows-x64` on most
machines, `opencode-windows-arm64` on ARM. The folder name still says `opencode`
because that is the npm package name, which has not been renamed.

### 2. Install

Still in Git Bash. Note the `.exe` — Windows cannot run the file without it:

```bash
./install --binary ./packages/opencode/dist/opencode-windows-x64/bin/mrcodetol.exe
```

This copies the binary to `~/.mrcodetol/bin/`, writes an `mct.cmd` shim next to
it, creates `.bashrc` and `.bash_profile` if you do not have them, and adds the
directory to your `PATH` for Git Bash.

### 3. Make it work in every terminal

Windows has two separate `PATH`s: the one Git Bash reads from your shell config,
and the one Windows itself keeps for everything else. Step 2 handled the first.

For the second, run this **once** in PowerShell:

```powershell
[Environment]::SetEnvironmentVariable("PATH", "$env:USERPROFILE\.mrcodetol\bin;" + [Environment]::GetEnvironmentVariable("PATH","User"), "User")
```

No admin needed. It reads your user `PATH`, prepends the directory, writes it
back. Nothing else is touched.

Then **close every terminal window and reopen** — a running shell never picks up
a `PATH` change.

### What works where

| Terminal | `mrcodetol` | `mct` | Needs |
|---|---|---|---|
| Git Bash | yes | see below | step 2 only |
| PowerShell | yes | yes | step 3 |
| cmd | yes | yes | step 3 |
| Windows Terminal | yes | yes | step 3 — it just hosts the shells above |
| VS Code terminal | yes | yes | step 3, then restart VS Code completely |

`mct` does not work in Git Bash, because the shim is a `.cmd` file and bash does
not execute those. Add a real alias if you want it there:

```bash
printf 'alias mct=mrcodetol\n' >> ~/.bashrc
```

### 4. Verify

Open a new terminal:

```
mrcodetol --version
mct --version
```

If `mrcodetol` is still not found in PowerShell, check the value actually landed:

```powershell
[Environment]::GetEnvironmentVariable("PATH","User") -split ';' | Select-String mrcodetol
```

Empty output means step 3 did not apply. Run it again in a fresh PowerShell.

### Other ways to set the Windows PATH

The command above is the safest, but any of these work:

**GUI** — press `Win`, type `environment variables`, open *Edit the system
environment variables* → **Environment Variables** → under **User variables**
select `Path` → **Edit** → **New** → paste `%USERPROFILE%\.mrcodetol\bin` → **OK**
on all three dialogs.

**This session only**, to try without changing anything permanently:

```powershell
$env:PATH = "$env:USERPROFILE\.mrcodetol\bin;" + $env:PATH
```

**`setx`** works but is risky — it truncates any value over 1024 characters, and
`%PATH%` expands to your user *and* system `PATH` combined, so it can both
corrupt a long `PATH` and copy every system entry into your user `PATH`. Avoid it
unless you know your `PATH` is short.

---

## macOS

### 1. Build

```bash
cd /path/to/mrcodetol
OPENCODE_VERSION=1.0.0 ./packages/opencode/script/build.ts --single
```

### 2. Pick your target

```bash
uname -m
```

| Output | Target folder |
|---|---|
| `arm64` | `opencode-darwin-arm64` — M1 and later |
| `x86_64` | `opencode-darwin-x64` — Intel |

### 3. Install

```bash
./install --binary ./packages/opencode/dist/opencode-darwin-arm64/bin/mrcodetol
```

This copies the binary to `~/.mrcodetol/bin/`, symlinks `mct` next to it, and
adds the directory to your shell config — creating that file if you do not have
one. macOS has used zsh by default since Catalina, so that is normally `.zshrc`.

Unlike Windows, this is all of it. macOS has a single `PATH`, so every terminal
picks it up — Terminal.app, iTerm2, Warp, the VS Code terminal.

### 4. Reload and verify

```bash
exec $SHELL
mrcodetol --version
mct --version
```

If it is still not found, check which shell you actually run and that the line
is in the matching file:

```bash
echo $SHELL
grep -n mrcodetol ~/.zshrc ~/.bashrc ~/.config/fish/config.fish 2>/dev/null
```

To add it by hand:

```bash
echo 'export PATH="$HOME/.mrcodetol/bin:$PATH"' >> ~/.zshrc   # zsh
echo 'export PATH="$HOME/.mrcodetol/bin:$PATH"' >> ~/.bashrc  # bash
fish_add_path "$HOME/.mrcodetol/bin"                          # fish
```

### Gatekeeper

It does not block this. The quarantine flag is set on downloaded files, not on
something you compiled locally. If you copy the binary from another machine and
macOS refuses to open it:

```bash
xattr -d com.apple.quarantine ~/.mrcodetol/bin/mrcodetol
```

---

## Linux

### 1. Build

```bash
OPENCODE_VERSION=1.0.0 ./packages/opencode/script/build.ts --single
```

### 2. Pick your target

| Machine | Target folder |
|---|---|
| Most x86_64 | `opencode-linux-x64` |
| ARM — Raspberry Pi, Graviton | `opencode-linux-arm64` |
| Alpine or other musl systems | append `-musl` |
| CPU without AVX2 | append `-baseline` |

```bash
uname -m                              # x86_64 or aarch64
ldd --version 2>&1 | head -1          # mentions musl on Alpine
grep -o avx2 /proc/cpuinfo | head -1  # empty means you need -baseline
```

### 3. Install and verify

```bash
./install --binary ./packages/opencode/dist/opencode-linux-x64/bin/mrcodetol
exec $SHELL
mrcodetol --version
mct --version
```

The installer writes to `.bashrc`, `.zshrc`, or `config.fish` depending on your
shell, creating it if missing. Linux has a single `PATH`, so every terminal picks
it up.

---

## Build reference

### `OPENCODE_VERSION` is not optional in practice

Without it, the build script fetches `registry.npmjs.org/opencode-ai/latest` and
derives your version number from the upstream project's release. On a branch
other than `latest` it produces `0.0.0-<branch>-<timestamp>` instead. Set it.

### Flags

| Flag | Effect |
|---|---|
| `--single` | Current platform only. Omit to cross-compile all 12 targets |
| `--skip-embed-web-ui` | Skip building and embedding the web UI. Much faster; disables `mrcodetol web` |
| `--skip-install` | Skip cross-platform native dependencies. **Never use when cross-compiling** |
| `--baseline` | Also build the no-AVX2 variant for the current platform |
| `--sourcemaps` | Emit linked sourcemaps |

The CLI cross-compiles from any host. The desktop app does not.

---

## Installer reference

| Flag | Effect |
|---|---|
| `--binary <path>` | Install a locally built binary. The only working path today |
| `--no-modify-path` | Do not touch shell config files |
| `--version <v>` | Install a published version — does not work yet, see below |
| `--help` | Show usage |

Everything lands in `~/.mrcodetol/bin`. The binary is a single self-contained
file of roughly 180 MB — it embeds the runtime and the web UI, so deleting the
source repository does not break your installation.

---

## Desktop app

Electron wrapper around the web UI, separate from the CLI:

```bash
bun run --cwd packages/desktop build
bun run --cwd packages/desktop package:win     # or package:mac / package:linux
```

Building a macOS `.dmg` requires macOS.

---

## Not working yet

These follow from renaming the command while the published package name is still
`opencode`. See [REBRANDING.md](REBRANDING.md) for the staging.

**Remote download.** `./install` without `--binary` **will fail**. It downloads
from `anomalyco/opencode` releases, whose archives contain a binary named
`opencode`, not `mrcodetol`. Use `--binary` until you publish your own releases.

**npm.** [publish.ts](packages/opencode/script/publish.ts) writes its own
manifest at publish time from the CLI package name, still `opencode`. Publishing
today would produce `opencode-ai` exposing an `opencode` command.

**Other channels**, each broken by the binary rename and each a small fix:

| Channel | File |
|---|---|
| Nix | [nix/opencode.nix](nix/opencode.nix) installs `bin/opencode` |
| Docker | [packages/opencode/Dockerfile](packages/opencode/Dockerfile) copies `bin/opencode` |
| AUR | [script/publish.ts](script/publish.ts) PKGBUILD installs `./opencode` |
| Windows signing | [publish.yml](.github/workflows/publish.yml) signs `bin/opencode.exe` |
| Desktop WSL detection | [wsl/runtime.ts](packages/desktop/src/main/wsl/runtime.ts) looks for `~/.opencode/bin/opencode` |

Homebrew and Scoop manifests still point at the upstream repository.

---

## Uninstall

```bash
rm -rf ~/.mrcodetol
```

Then remove the `export PATH` line from your shell config. On Windows, also
remove the directory from your user `PATH` — GUI, or:

```powershell
$clean = ([Environment]::GetEnvironmentVariable("PATH","User") -split ';' | Where-Object { $_ -notmatch 'mrcodetol' }) -join ';'
[Environment]::SetEnvironmentVariable("PATH", $clean, "User")
```
