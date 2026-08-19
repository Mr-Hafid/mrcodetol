# Pulling updates from opencode

MrCodeTol is a fork of [anomalyco/opencode](https://github.com/anomalyco/opencode).
This is how to bring their changes in without losing the rebranding.

**Merge often.** A one-day gap merged with zero conflicts. A three-month gap will
not — upstream will have rewritten the same lines the rename touched, across
thousands of files. Frequency is the whole strategy.

---

## One-time setup

```bash
git remote add upstream https://github.com/anomalyco/opencode.git
git fetch upstream dev
```

> In PowerShell, do not let a `\` end up at the end of the URL. It becomes part
> of the argument and you get a confusing `Repository not found`, with the real
> clue buried in the path: `opencode.git\/`.

Verify:

```bash
git remote -v
```

`origin` must stay your own fork. `upstream` is read-only in practice — never
push to it.

> `origin/dev` is a stale tracking ref left over from the original clone. It
> points at the commit this fork started from and never moves. Ignore it; the
> live upstream branch is `upstream/dev`.

---

## Every time

### 1. See what changed

```bash
git fetch upstream dev
git rev-list --count HEAD..upstream/dev        # how many commits behind
git log --oneline HEAD..upstream/dev           # what they are
git diff --stat HEAD...upstream/dev            # which files they touch
```

Three dots in the `diff`, not two — that compares against the common ancestor,
which is what you want.

### 2. Preview the conflicts before touching anything

```bash
git merge-tree --write-tree --name-only HEAD upstream/dev
```

This computes the merge in memory. Your working tree is not touched, so there is
nothing to abort or clean up.

- Prints a single hash and exits `0` → clean merge, no conflicts
- Prints a file list → those files conflict

### 3. Merge on a scratch branch

Never merge straight into `rebrand-mrcodetol`.

```bash
git checkout -b merge-upstream
git merge upstream/dev
```

### 4. Re-apply the rename to anything new

Upstream will keep writing `@opencode-ai/` and `OpenCode` in new code. Check what
arrived:

```bash
grep -rl '@opencode-ai/' packages sdks github script --exclude-dir=node_modules
grep -rn 'OpenCode' packages/tui/src packages/app/src packages/web/src
```

If anything shows up, apply the rules in [Rename rules](#rename-rules) below.

### 5. Verify

```bash
bun install
bun turbo typecheck
```

`bun install` is not optional — upstream changes dependencies, and the lockfile
has to be regenerated rather than merged.

### 6. Land it

```bash
git checkout rebrand-mrcodetol
git merge merge-upstream
git branch -d merge-upstream
git push
```

The pre-push hook runs `bun typecheck` again, so a broken merge cannot reach the
remote.

---

## Rename rules

Two mechanical substitutions, both already proven against the whole tree.

### 1. npm scope

```
@opencode-ai/  →  @mrcodetol/
```

Blind replacement is safe. Skip only `bun.lock`, `github/bun.lock` (regenerate
with `bun install`) and `nix/node_modules.nix`.

### 2. Display name

```
OpenCode  →  MrCodeTol     only when NOT followed by a capital letter
```

Then check what survived:

```bash
grep -rhoE 'OpenCode[A-Za-z]*' packages/tui/src packages/app/src packages/web/src | sort -u
```

Everything left must be a PascalCase identifier. The rule still lets through an
identifier named exactly `OpenCode`, so check those two forms separately — this
is the one that broke the build last time:

```bash
grep -rnE '\bOpenCode\.[A-Za-z]|\{[^}]*\bOpenCode\b[^}]*\}\s*from' packages
```

---

## Never rename these

These are identities toward other systems, not branding. Renaming them breaks
features silently.

| What | Where | Breaks |
|---|---|---|
| `clientID = "opencode-cli"` | [plugin/provider/opencode.ts](packages/core/src/plugin/provider/opencode.ts) | OAuth device flow — nobody can log in |
| provider id `"opencode"` | dialog-model, use-connected, tips, sidebar footer | Free-model detection for the Zen provider |
| `OpenCode`, `OpenCodeEvent`, `OpenCodeClient`, `OpenCodeWindow` | exported from `packages/client` | Cross-package type identity — proven to break the build |
| `OpenCodeZen` | provider code | Model gateway identity |
| `x-opencode-*` headers, `--user-agent=opencode/...` | core, build.ts | Identity sent to providers |
| `OPENCODE_API_KEY` | `.github/workflows/*` | GitHub Actions secret name |
| `opencode-v2-openapi.json` | `packages/codemode/test/fixtures` | Snapshot tests |
| `@opencode-ai/plugin` | third-party plugin packages | See below |
| `bun.lock`, `nix/node_modules.nix` | root, nix | Regenerate, never hand-edit |

### The plugin scope

`opencode-gitlab-auth`, `@gitlab/opencode-gitlab-auth` and `opencode-poe-auth`
declare a dependency on `@opencode-ai/plugin`. Once the workspace stopped
providing that name, bun installed the real package from npm and typecheck saw
two unrelated `Plugin` types.

Their imports are type-only, so it is resolved with a `paths` entry in
[packages/opencode/tsconfig.json](packages/opencode/tsconfig.json) that points
the old scope at the workspace package. If a merge ever removes that mapping,
this failure comes back.

---

## Files upstream must not overwrite

If a merge conflicts in any of these, keep **your** side — they are deliberate
customizations, not renames.

**Branding and UI**

| File | Why |
|---|---|
| [packages/tui/src/logo.ts](packages/tui/src/logo.ts) | The mrcodetol wordmark, drawn by hand |
| [packages/tui/src/component/logo.tsx](packages/tui/src/component/logo.tsx) | Diagonal gradient renderer |
| [packages/tui/src/routes/home.tsx](packages/tui/src/routes/home.tsx) | Home layout |
| [packages/tui/src/routes/home/header.tsx](packages/tui/src/routes/home/header.tsx) | New file — header and byline |
| [packages/tui/src/feature-plugins/home/tips.tsx](packages/tui/src/feature-plugins/home/tips.tsx) | Alignment |
| [packages/tui/src/theme/assets/mrcodetol.json](packages/tui/src/theme/assets/mrcodetol.json) | New file — black theme |
| [packages/tui/src/theme/index.ts](packages/tui/src/theme/index.ts) | Registers that theme |
| [packages/tui/src/context/theme.tsx](packages/tui/src/context/theme.tsx) | Default theme, six references |

**Command name**

| File | Why |
|---|---|
| [packages/opencode/bin/mrcodetol](packages/opencode/bin/mrcodetol) | Renamed wrapper |
| [packages/opencode/package.json](packages/opencode/package.json) | `bin` entries for `mrcodetol` and `mct` |
| [packages/opencode/script/build.ts](packages/opencode/script/build.ts) | `outfile` and smoke-test path |
| [packages/opencode/script/postinstall.mjs](packages/opencode/script/postinstall.mjs) | Looks for the renamed binary |
| [packages/opencode/src/index.ts](packages/opencode/src/index.ts) | `scriptName` — drives help output and completion |
| [packages/opencode/tsconfig.json](packages/opencode/tsconfig.json) | Plugin scope mapping |

**Install and docs**

`install`, `INSTALL.md`, `README.md`, `REBRANDING.md`, `.opencode/glossary/*`

The installer in particular has fixes upstream does not have: quoted paths for a
`$HOME` containing a space, creating a shell config when none exists, Windows
`.exe` handling, and the `mct` alias.

---

## When a merge does go badly

For a large backlog, resolving hundreds of import-line conflicts by hand is not
sensible. Take upstream wholesale and re-apply the rename:

```bash
git merge -X theirs upstream/dev
```

Then redo [Rename rules](#rename-rules) across the tree, and **restore every file
in [Files upstream must not overwrite](#files-upstream-must-not-overwrite) from
your side**:

```bash
git checkout rebrand-mrcodetol -- packages/tui/src/logo.ts packages/tui/src/component/logo.tsx ...
```

`-X theirs` silently discards your version of every conflicting file. That is
acceptable for mechanically renamed files and wrong for customized ones, which is
the entire reason that list exists.

Nothing here is scripted yet. If merges become routine, turning the two rename
rules plus the skip list into `script/rebrand.ts` would reduce this to one
command.
