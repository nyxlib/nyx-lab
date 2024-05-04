#!/bin/bash

export PATH=/Applications/Inkscape.app/Contents/MacOS:${PATH}

########################################################################################################################

insvg=icon.svg

########################################################################################################################

rm -rf ./icons/
mkdir ./icons/

rm -rf ./tmp.iconset/
mkdir ./tmp.iconset/

########################################################################################################################

inkscape --export-filename=./icons/icon.png -w 512 -h 512 $insvg

inkscape --export-filename=./icons/StoreLogo.png -w 50 -h 50 $insvg

inkscape --export-filename=./icons/32x32.png -w 32 -h 32 $insvg
inkscape --export-filename=./icons/128x128.png -w 128 -h 128 $insvg
inkscape --export-filename=./icons/128x128@2x.png -w 256 -h 256 $insvg

inkscape --export-filename=./icons/Square30x30Logo.png -w 30 -h 30 $insvg
inkscape --export-filename=./icons/Square44x44Logo.png -w 44 -h 44 $insvg
inkscape --export-filename=./icons/Square71x71Logo.png -w 71 -h 71 $insvg
inkscape --export-filename=./icons/Square89x89Logo.png -w 89 -h 89 $insvg
inkscape --export-filename=./icons/Square107x107Logo.png -w 107 -h 107 $insvg
inkscape --export-filename=./icons/Square142x142Logo.png -w 142 -h 142 $insvg
inkscape --export-filename=./icons/Square150x150Logo.png -w 150 -h 150 $insvg
inkscape --export-filename=./icons/Square284x284Logo.png -w 284 -h 284 $insvg
inkscape --export-filename=./icons/Square310x310Logo.png -w 310 -h 310 $insvg

########################################################################################################################

convert ./icons/128x128.png ./icons/icon.ico

########################################################################################################################

for sz in 16 32 128 256 512
do
    inkscape --export-filename=./tmp.iconset/icon_${sz}x${sz}.png -w $sz -h $sz $insvg
    inkscape --export-filename=./tmp.iconset/icon_${sz}x${sz}@2x.png -w $((sz*2)) -h $((sz*2)) $insvg
done

iconutil --convert icns --output ./icons/icon.icns ./tmp.iconset/

rm -rf ./tmp.iconset/

########################################################################################################################
