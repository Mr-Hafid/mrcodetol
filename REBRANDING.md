# Rebranding: OpenCode → MrCodeTol

Status: **Lapis 1 + 2 selesai dan tercommit**
Branch kerja: `rebrand-mrcodetol` (dibuat dari `dev`, 2 commit)
Pemilik repo: remote `origin` = `git@github.com:Mr-Hafid/mrcodetol.git`

---

## 1. Keputusan yang sudah dikunci

| Hal | Keputusan |
|---|---|
| Kedalaman tahap ini | **Lapis 1 + 2** (docs/UI + nama paket npm) |
| Kompatibilitas | **Hard-cut** — tidak ada fallback ke nama lama saat Lapis 3 nanti |
| Binary terminal | `mrcodetol`, dengan alias pendek `mct` |
| Nama tampilan | MrCodeTol |
| Scope npm | `@mrcodetol/*` |

Bentuk nama yang **belum** berlaku di tahap ini (ditunda ke Lapis 3/4):
`~/.opencode`, `OPENCODE_*`, binary `opencode`, domain `opencode.ai`, org `anomalyco`.

---

## 2. Skala yang diukur

| Yang diukur | Angka |
|---|---|
| File menyebut "opencode" (case-insensitive) | 2.781 |
| Total kemunculan string | ~38.400 |
| Path/nama file mengandung "opencode" | 852 |
| Paket npm `@opencode-ai/*` | 36 |
| Env var `OPENCODE_*` unik | 138 |
| Aset brand biner (PNG/SVG/ZIP) | 38 |
| File README (utama + terjemahan) | 23 |
| Hit di `bun.lock` | 192 (regenerasi, jangan diedit) |

Kesimpulan: ini bukan find-and-replace sekali jalan.

---

## 3. Pembagian lapis

### Lapis 1 — Kosmetik  ← dikerjakan sekarang
Risiko: nol. Tidak mempengaruhi build maupun runtime.

- 23 file README (utama + 22 terjemahan)
- `CONTRIBUTING.md`, `AGENTS.md`, `CONTEXT.md`, `SECURITY.md`
- String yang dilihat manusia di `packages/tui`, `packages/app`, `packages/web`

### Lapis 2 — Identitas paket  ← dikerjakan sekarang
Risiko: build pecah kalau dikerjakan setengah jalan. **Harus atomik dalam satu commit.**

- 36 nama paket `@opencode-ai/*` → `@mrcodetol/*`
- Semua dependency `workspace:*` yang merujuk nama lama
- Semua import path di seluruh workspace
- `turbo.json`, konfigurasi path di `tsconfig`
- `bun install` untuk regenerasi `bun.lock` (JANGAN sed file ini)

### Lapis 3 — Identitas runtime  ← ditunda
Risiko: merusak instalasi user yang sudah ada. Karena hard-cut, tidak ada fallback.

- Binary `opencode` → `mrcodetol` + alias `mct`
- Direktori config `~/.opencode` dan `.opencode/` → `.mrcodetol`
- 138 env var `OPENCODE_*` → `MRCODETOL_*`
- Nama file config `opencode.json` / `opencode.jsonc`

### Lapis 4 — Eksternal  ← ditunda, butuh aset & akun
- Domain `opencode.ai` (~12 rujukan per README)
- Org GitHub `anomalyco` → akun pribadi (remote `origin` sudah diarahkan ke repo sendiri; 463 rujukan `anomalyco` masih ada di dalam kode dan workflow)
- Workflow di `.github/workflows/`, script `install`, `nix/opencode.nix`
- Formula brew / manifest scoop, SST stage di `infra/`
- **38 aset logo biner harus digambar ulang** — tidak bisa di-script

---

## 4. ⚠️ Daftar yang TIDAK boleh ikut diganti

Ini bagian paling berbahaya. String berikut adalah **identitas terhadap sistem pihak ketiga**, bukan branding. Mengganti = fitur mati.

| Lokasi | Isi | Kalau diganti |
|---|---|---|
| `packages/core/src/plugin/provider/opencode.ts:17` | `clientID = "opencode-cli"` | OAuth device flow gagal, user tidak bisa login |
| `.github/workflows/*` | `OPENCODE_API_KEY` | Nama secret GitHub Actions, CI gagal |
| Header `x-opencode-*`, user-agent | identitas ke provider | Bisa kena block kalau di-whitelist |
| `packages/codemode/test/fixtures/opencode-v2-openapi.json` | fixture test | Snapshot test gagal |
| `nix/node_modules.nix` | hash | Harus dihitung ulang, bukan diedit |
| `bun.lock` | 192 hit | Regenerasi via `bun install` |
| `packages/client` + pemakainya | identifier `OpenCode`, `OpenCodeEvent`, `OpenCodeClient`, `OpenCodeWindow` | Nama ekspor lintas paket, bukan branding. Terbukti memecahkan build |
| `packages/*` | `OpenCodeZen` | Identitas gateway model |

Implementasi: pakai **allowlist skip**, bukan blind replace.

Aturan yang terbukti efektif untuk nama tampilan: ganti `OpenCode` hanya bila
**tidak diikuti huruf kapital**, lalu periksa sisa `OpenCode[A-Za-z]*` — yang
tersisa harus hanya identifier PascalCase. Ini masih meloloskan identifier
bernama tepat `OpenCode`, jadi cek terpisah `OpenCode\.` dan `{ OpenCode }`
di posisi import tetap wajib.

---

## 5. Urutan eksekusi

1. Branch `rebrand-mrcodetol` — **selesai**
2. Lapis 2 (nama paket) dalam satu commit atomik — **selesai** (`46f0d16`, 1.369 file)
3. `bun install` → regenerasi `bun.lock` — **selesai**
4. `bun turbo typecheck` → **30/30 paket hijau**. `bun lint` **belum dijalankan**
5. Lapis 1 (docs + string UI) sebagai commit terpisah — **selesai** (`125c7aa`, 608 file)
6. Review diff, lalu merge — **belum**
7. Rename folder root — **sudah terjadi lebih awal**, lihat §6

### Hasil terukur

| Lapis | Commit | File | Isi |
|---|---|---|---|
| 2 | `46f0d16` | 1.369 | 35 paket `@opencode-ai/*` → `@mrcodetol/*` + `bun.lock` |
| 1 | `125c7aa` | 608 | 25 doc root + 511 file `web` + 66 `app` + 6 `tui` |

### Temuan saat eksekusi

- **Identifier kode bernama `OpenCode`** diekspor dari `packages/client`. Penggantian
  buta memecahkan `packages/app/src/utils/server.ts` dan `server-health.ts`
  (TS2305 + 2 TS7006 berantai). Sudah dikembalikan. Identifier yang harus
  tetap: `OpenCode`, `OpenCodeEvent`, `OpenCodeClient`, `OpenCodeWindow`,
  `OpenCodeZen`. Tambahkan ke allowlist §4.
- **`custom-elements.d.ts` di `app` dan `enterprise`** adalah symlink git
  (mode `120000`) yang di-checkout sebagai file teks karena `core.symlinks=false`
  di Windows. Ini membuat typecheck gagal dengan TS1128, **bukan** akibat
  rebranding. Untuk verifikasi, materialisasi sementara lalu pulihkan.
- **`.opencode/glossary/` (17 file)** masih menyebut OpenCode. Ini glosarium
  penerjemahan; kalau dibiarkan, terjemahan baru akan memasukkan kembali nama
  lama. Belum masuk lapis mana pun — perlu diputuskan.
- **Username GitHub perlu dipastikan.** Remote memakai `Mr-Hafid`, sedangkan
  profil yang disebut adalah `mrhafid`. Keduanya username berbeda di GitHub.
  Belum ada perubahan remote.

---

## 6. Catatan rename folder root

`d:\PROJECTS\opencode` → `d:\PROJECTS\mrcodetol`

**Sudah selesai** — folder sudah berada di `d:\PROJECTS\mrcodetol`, dilakukan
sebelum commit apa pun, bukan setelahnya seperti rencana awal. Tidak berdampak:
rename folder tidak menyentuh isi commit maupun remote. Urutan asli disimpan di
bawah sebagai catatan.

- Harus dijalankan **dari luar folder**, dan **bukan** saat sesi kerja aktif di dalamnya
- `.git` ikut pindah; git remote tidak terpengaruh

---

## 7. Konsekuensi yang harus disadari

Karena tahap ini hanya Lapis 1+2, **dokumentasi akan sementara tidak konsisten**: README akan menyebut "MrCodeTol" sebagai nama produk, tapi perintah instalasinya masih `opencode` dan URL-nya masih `opencode.ai`. Ini konsekuensi wajar dari pemecahan bertahap, dan hilang setelah Lapis 3 dan 4 dikerjakan.

---

## 8. Rollback

Seluruh pekerjaan ada di branch `rebrand-mrcodetol`. Untuk membatalkan:

```bash
git checkout dev
git branch -D rebrand-mrcodetol
```
