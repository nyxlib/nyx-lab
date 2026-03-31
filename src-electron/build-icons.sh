#!/bin/bash
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

    icotool -c \
        -o "${SCRIPT_DIR}/icons/${base}.ico" \
        "${SCRIPT_DIR}/icons/${base}16x16.png" \
        "${SCRIPT_DIR}/icons/${base}32x32.png" \
        "${SCRIPT_DIR}/icons/${base}48x48.png" \
        "${SCRIPT_DIR}/icons/${base}64x64.png" \
        "${SCRIPT_DIR}/icons/${base}128x128.png" \
        "${SCRIPT_DIR}/icons/${base}256x256.png"

done

########################################################################################################################
