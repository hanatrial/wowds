#!/data/data/com.termux/files/usr/bin/bash
# WOW DS — tarik "Database" + "Database Kabupaten" dari Google Sheet ke wow_toko_master.js,
# lalu commit + push ke github.com/hanatrial/wowds (deploy otomatis dari branch main).
# Dijadwalkan cron Termux: 08.00 WITA, Senin–Sabtu.
#
# Pakai:
#   run.sh            normal (hanya commit kalau datanya benar-benar berubah)
#   run.sh --dry      cek saja, tidak menulis / tidak push
#   run.sh --force    push tetap dilakukan walau tidak ada perubahan

set -u
export PATH="/data/data/com.termux/files/usr/bin:/data/data/com.termux/files/usr/sbin:$PATH"
export HOME="/data/data/com.termux/files/home"
export TZ="Asia/Makassar"

DIR="/data/data/com.termux/files/home/wowds"
LOG="$DIR/cron.log"
MODE="${1:-}"

cd "$DIR" || exit 1

# Batasi ukuran log (sisakan 500 baris terakhir)
if [ -f "$LOG" ] && [ "$(wc -l < "$LOG")" -gt 500 ]; then
  tail -n 500 "$LOG" > "$LOG.tmp" && mv "$LOG.tmp" "$LOG"
fi

log() { echo "[$(date '+%F %T %Z')] $*" >> "$LOG"; }

log "--- mulai ($MODE) ---"

# 0. Samakan dulu dengan GitHub — repo ini juga diedit manual dari tempat lain.
#    Kalau lokal tertinggal: fast-forward. Kalau ada commit data kita yang belum
#    terkirim: rebase di atas origin/main (aman, hanya menyentuh wow_toko_master.js).
sync_origin() {
  git fetch -q origin main 2>>"$LOG" || { log "GAGAL fetch origin (jaringan?)"; return 1; }
  local ketinggalan belum_terkirim
  ketinggalan=$(git rev-list --count HEAD..origin/main)
  belum_terkirim=$(git rev-list --count origin/main..HEAD)
  if [ "$ketinggalan" -gt 0 ] && [ "$belum_terkirim" -gt 0 ]; then
    if ! git rebase -q origin/main >>"$LOG" 2>&1; then
      git rebase --abort >>"$LOG" 2>&1
      log "GAGAL rebase di atas origin/main (bentrok) — hentikan, cek manual"
      return 1
    fi
    log "  rebase di atas origin/main ($ketinggalan commit baru dari GitHub)"
  elif [ "$ketinggalan" -gt 0 ]; then
    git merge -q --ff-only origin/main >>"$LOG" 2>&1 || { log "GAGAL fast-forward"; return 1; }
    log "  fast-forward $ketinggalan commit dari GitHub"
  fi
  return 0
}
sync_origin || exit 1

# Token GitHub: pakai kredensial yang sudah tersimpan di helper lain
if [ -z "${GITHUB_TOKEN:-}" ]; then
  CRED="$HOME/nutrifood-stock/.git-credentials"
  if [ -f "$CRED" ]; then
    GITHUB_TOKEN=$(sed -n 's#https://[^:]*:\([^@]*\)@github.com.*#\1#p' "$CRED" | head -1)
  fi
  if [ -z "${GITHUB_TOKEN:-}" ] && [ -f "$HOME/.git-credentials" ]; then
    GITHUB_TOKEN=$(sed -n 's#https://[^:]*:\([^@]*\)@github.com.*#\1#p' "$HOME/.git-credentials" | head -1)
  fi
fi
export GITHUB_TOKEN

# 1. Tarik data sheet → wow_toko_master.js
OUT=$(node scripts/wow-db.js ${MODE:+$MODE} 2>&1); RC=$?
echo "$OUT" | while IFS= read -r line; do log "  $line"; done
if [ $RC -ne 0 ]; then
  log "GAGAL tarik data (exit $RC) — tidak ada yang di-push"
  exit $RC
fi
[ "$MODE" = "--dry" ] && { log "SELESAI (dry)"; exit 0; }

# 2. Commit + push kalau ada perubahan
if git diff --quiet -- wow_toko_master.js; then
  if [ "$MODE" != "--force" ]; then
    log "Tidak ada perubahan data — tidak push"
    exit 0
  fi
  log "Tidak ada perubahan, tapi --force: cek apakah ada commit tertunda"
fi

if ! git diff --quiet -- wow_toko_master.js; then
  git add wow_toko_master.js
  git -c user.name="hanatrial" -c user.email="hanatrial@users.noreply.github.com" \
      commit -q -m "Update database WOW $(date '+%F')" || { log "GAGAL commit"; exit 1; }
  log "  commit dibuat: Update database WOW $(date '+%F')"
fi

# masih ada commit yang belum terkirim?
if [ "$MODE" = "--force" ] || ! git diff --quiet origin/main -- wow_toko_master.js; then
  if [ -n "${GITHUB_TOKEN:-}" ]; then
    OUT=$(git push "https://x-access-token:${GITHUB_TOKEN}@github.com/hanatrial/wowds.git" HEAD:main 2>&1); RC=$?
  else
    OUT=$(git push origin HEAD:main 2>&1); RC=$?
  fi
  echo "$OUT" | while IFS= read -r line; do log "  $line"; done
  if [ $RC -ne 0 ]; then
    log "GAGAL push (exit $RC)"
    exit $RC
  fi
  log "SELESAI — terkirim ke https://github.com/hanatrial/wowds"
else
  log "Sudah sinkron dengan origin/main — tidak perlu push"
fi
exit 0
