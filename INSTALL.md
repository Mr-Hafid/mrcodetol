# Installing MrCodeTol

The command is `mrcodetol`, with `mct` as a short alias.

There is no published package yet, so building from source is the only supported
route. Jump to your platform: **[Windows](#windows)** · **[macOS](#macos)** ·
**[Linux](#linux)**. See [Not working yet](#not-working-yet) for what is missing.

---

## Prerequisites

| | |
|---|---|
| Bun | must satisfy the `packageManager` field in [package.json](package.json) |
| Git Bash | **Windows only** — the build and install scripts are POSIX shell |
| `unzip` / `tar` | only for the remote download path, which does not work yet |

```bash
bun install
```

---

## 1. Build (all platforms)

```bash
OPENCODE_VERSION=1.0.0 ./packages/opencode/script/build.ts --single
```

On Windows run this in **Git Bash**, not PowerShell — the script uses `rm -rf`
and `mkdir -p`.

`--single` builds only for the machine you are on. Drop it to cross-compile all
12 targets at once.

**`OPENCODE_VERSION` is not optional in practice.** Without it the script fetches
`registry.npmjs.org/opencode-ai/latest` and derives your version from the
upstream project's release. On a branch other than `latest` it produces
`0.0.0-<branch>-<timestamp>` instead.

Confirm what was built:

```bash
ls packages/opencode/dist/*/bin/
```

The directory is still named `opencode-<os>-<arch>` — that is the npm package
name, which has not been renamed. The binary inside is `mrcodetol`.

### Build flags

| Flag | Effect |
|---|---|
| `--single` | Current platform only |
| `--skip-embed-web-ui` | Skip building and embedding the web UI. Much faster; disables `mrcodetol web` |
| `--skip-install` | Skip cross-platform native dependencies. **Never use when cross-compiling** |
| `--baseline` | Also build the no-AVX2 variant for the current platform |
| `--sourcemaps` | Emit linked sourcemaps |

---

## 2. Install

### Windows

Which target you have: `opencode-windows-x64` on most machines,
`opencode-windows-arm64` on ARM. Note the `.exe` — Windows cannot execute the
file without it.

In **Git Bash**:

```bash
./install --binary ./packages/opencode/dist/opencode-windows-x64/bin/mrcodetol.exe
```

This copies the binary to `~/.mrcodetol/bin/`, writes an `mct.cmd` shim beside
it, and adds the directory to your `.bashrc`.

**Git Bash is now done** — open a new Git Bash window and `mrcodetol` works.

PowerShell and cmd read a completely different `PATH`, so they need one more
step. Pick any method below; they all achieve the same thing.

#### Setting the Windows PATH

| Method | Persistent | Needs admin |
|---|---|---|
| [A. PowerShell one-liner](#a-powershell-one-liner-recommended) | yes | no |
| [B. GUI](#b-gui) | yes | no |
| [C. `setx`](#c-setx) | yes | no |
| [D. Current session only](#d-current-session-only) | no | no |

##### A. PowerShell one-liner (recommended)

This is the command the installer prints. Run it once in PowerShell:

```powershell
[Environment]::SetEnvironmentVariable("PATH", "$env:USERPROFILE\.mrcodetol\bin;" + [Environment]::GetEnvironmentVariable("PATH","User"), "User")
```

It reads your current user `PATH`, prepends the directory, and writes it back at
user scope. Nothing else is touched. Verify before opening a new terminal:

```powershell
[Environment]::GetEnvironmentVariable("PATH","User") -split ';' | Select-String mrcodetol
```

##### B. GUI

For a permanent change without touching a shell:

1. Press `Win`, type **environment variables**, open *Edit the system
   environment variables*
2. Click **Environment Variables**
3. Under **User variables**, select `Path` → **Edit** → **New**
4. Paste `%USERPROFILE%\.mrcodetol\bin`
5. **OK** on all three dialogs

##### C. `setx`

Shorter, but it has a real failure mode:

```cmd
setx PATH "%USERPROFILE%\.mrcodetol\bin;%PATH%"
```

> `setx` **truncates any value longer than 1024 characters**, and `%PATH%` here
> expands to your user *and* system `PATH` combined — so this can both corrupt a
> long `PATH` and duplicate the system entries into your user `PATH`. Method A
> avoids both problems. Use `setx` only if you know your `PATH` is short.

##### D. Current session only

To try it without changing anything permanently.

PowerShell:

```powershell
$env:PATH = "$env:USERPROFILE\.mrcodetol\bin;" + $env:PATH
```

cmd:

```cmd
set PATH=%USERPROFILE%\.mrcodetol\bin;%PATH%
```

Both are gone when you close the window.

---

After any persistent method, **close and reopen the terminal** — a running shell
does not pick up `PATH` changes.

> `mct` works in PowerShell and cmd. In Git Bash it does not, because the shim
> is a `.cmd` file. Add `alias mct=mrcodetol` to `~/.bashrc` if you want it there.

### macOS

Check your architecture first:

```bash
uname -m          # arm64 = Apple Silicon, x86_64 = Intel
```

| Result | Target |
|---|---|
| `arm64` | `opencode-darwin-arm64` |
| `x86_64` | `opencode-darwin-x64` |

```bash
./install --binary ./packages/opencode/dist/opencode-darwin-arm64/bin/mrcodetol
```

This copies the binary to `~/.mrcodetol/bin/`, symlinks `mct` to it, and adds the
directory to your shell config — `.zshrc` on any recent macOS, since zsh is the
default shell.

Then reload your shell:

```bash
exec $SHELL
```

> Gatekeeper does not block this. The quarantine attribute is applied to
> downloaded files, not to a binary you compiled locally. If you move the binary
> between machines and macOS refuses to run it, clear it with
> `xattr -d com.apple.quarantine ~/.mrcodetol/bin/mrcodetol`.

### Linux

| Machine | Target |
|---|---|
| Most x86_64 | `opencode-linux-x64` |
| ARM (Raspberry Pi, Graviton) | `opencode-linux-arm64` |
| Alpine or musl-based | `opencode-linux-x64-musl` / `opencode-linux-arm64-musl` |
| CPU without AVX2 | append `-baseline` |

```bash
./install --binary ./packages/opencode/dist/opencode-linux-x64/bin/mrcodetol
exec $SHELL
```

The installer writes to `.bashrc`, `.zshrc`, or `config.fish` depending on your
shell.

---

## 3. Verify

Open a new terminal, then:

```
mrcodetol --version
mct --version
```

---

## Options

| Flag | Effect |
|---|---|
| `--binary <path>` | Install a locally built binary. The only working path today |
| `--no-modify-path` | Do not touch shell config files |
| `--version <v>` | Install a specific released version — see the note below |
| `--help` | Show usage |

Everything lands in `~/.mrcodetol/bin`.

---

## Not working yet

These follow from renaming the command while the published package name is still
`opencode`. See [REBRANDING.md](REBRANDING.md) for the staging.

**Remote download.** `./install` without `--binary` **will fail**. It downloads
from `anomalyco/opencode` releases, and those archives contain a binary named
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

## Desktop app

Electron wrapper around the web UI, separate from the CLI:

```bash
bun run --cwd packages/desktop build
bun run --cwd packages/desktop package:win     # or package:mac / package:linux
```

Producing a macOS `.dmg` requires macOS. The CLI cross-compiles from any host;
the desktop app does not.

---

## Uninstall

```bash
rm -rf ~/.mrcodetol
```

Then remove the `PATH` line from your shell config. On Windows, also remove the
directory from your user `PATH` in System Properties → Environment Variables.
