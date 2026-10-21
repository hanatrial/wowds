#!/data/data/com.termux/files/usr/bin/bash
# Ekspor (app -> Sheet) lalu impor (Sheet -> app) dalam satu perintah.
# Manual: bash ~/wowds/run-pasangan.sh
# Logika sebenarnya ada di ~/wow-export/run-pasangan.sh (dipakai cron 07.30).
exec bash "$HOME/wow-export/run-pasangan.sh"
