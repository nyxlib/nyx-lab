#!/bin/bash

########################################################################################################################

set -euo pipefail

########################################################################################################################

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

########################################################################################################################

for base in app-icon file-icon
do
    for size in 16 24 32 48 64 72 96 128 144 256 512
    do
        inkscape "${SCRIPT_DIR}/icons/${base}.svg" \
            --export-filename="${SCRIPT_DIR}/icons/${base}${size}x${size}.png" \
            --export-type=png \
            -w "${size}" \
            -h "${size}"
    done
done

########################################################################################################################

icotool -c \
    -o "${SCRIPT_DIR}/icons/app-icon.ico" \
    "${SCRIPT_DIR}/icons/app-icon16x16.png" \
    "${SCRIPT_DIR}/icons/app-icon32x32.png" \
    "${SCRIPT_DIR}/icons/app-icon48x48.png" \
    "${SCRIPT_DIR}/icons/app-icon64x64.png" \
    "${SCRIPT_DIR}/icons/app-icon128x128.png" \
    "${SCRIPT_DIR}/icons/app-icon256x256.png"

########################################################################################################################

icotool -c \
    -o "${SCRIPT_DIR}/icons/file-icon.ico" \
    "${SCRIPT_DIR}/icons/file-icon16x16.png" \
    "${SCRIPT_DIR}/icons/file-icon32x32.png" \
    "${SCRIPT_DIR}/icons/file-icon48x48.png" \
    "${SCRIPT_DIR}/icons/file-icon64x64.png" \
    "${SCRIPT_DIR}/icons/file-icon128x128.png" \
    "${SCRIPT_DIR}/icons/file-icon256x256.png"

########################################################################################################################
