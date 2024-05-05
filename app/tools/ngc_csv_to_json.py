#!/usr/bin/env python3
########################################################################################################################

import os
import re
import sys
import json
import math
import tqdm
import argparse

import pandas as pd

from astropy.coordinates import SkyCoord

########################################################################################################################

def generate(src_fname):

    ####################################################################################################################

    src_fname = os.path.abspath(src_fname)

    dst_fname = os.path.join('../src/catalogs', 'NGC.json')

    ####################################################################################################################

    table = {}

    ra_list = []
    dec_list = []
    names_list = []
    type_list = []
    min_ax_list = []
    maj_ax_list = []
    pos_ang_list = []
    redshift_list = []
    b_mag_list = []
    v_mag_list = []
    j_mag_list = []
    h_mag_list = []
    k_mag_list = []
    surf_br_list = []

    IC_RE = re.compile('^IC0*')
    NGC_RE = re.compile('^NGC0*')

    for i, obj in tqdm.tqdm(pd.read_csv(src_fname, sep = ';', dtype = {'Name': str, 'Type': str, 'M': 'Int32'}).iterrows()):

        ####################################################################################################################

        sky_coord = SkyCoord(obj['RA'], obj['Dec'], unit = ('hourangle', 'deg'))

        ra_list.append(sky_coord.ra.deg if not math.isnan(sky_coord.ra.deg) else 0.0)
        dec_list.append(sky_coord.dec.deg if not math.isnan(sky_coord.dec.deg) else 0.0)

        ####################################################################################################################

        names = []

        ##

        if f'M{obj["M"]}' != 'M<NA>':
            name = f'M{obj["M"]}'
            table[name] = i
            names.append(name)

        if   obj['Name'].startswith('IC'):
            name = IC_RE.sub('IC', obj['Name'])
            table[name] = i
            names.append(name)

        elif obj['Name'].startswith('NGC'):
            name = NGC_RE.sub('NGC', obj['Name'])
            table[name] = i
            names.append(name)

        else:
            continue

        ##

        names_list.append(','.join(names))

        ####################################################################################################################

        type_list.append(obj['Type'])

        ####################################################################################################################

        minAx = obj['MinAx']
        majAx = obj['MajAx']

        if math.isnan(majAx) and math.isnan(minAx):

            minAx = 0.0
            majAx = 0.0

        elif math.isnan(minAx):

            minAx = majAx

        elif math.isnan(minAx):

            majAx = minAx

        min_ax_list.append(minAx)
        maj_ax_list.append(majAx)

        ####################################################################################################################

        pos_ang_list.append(obj['PosAng'] if not math.isnan(obj['PosAng']) else 0.0)

        ####################################################################################################################

        redshift_list.append(obj['Redshift'] if not math.isnan(obj['Redshift']) else -999.0)

        b_mag_list.append(obj['B-Mag'] if not math.isnan(obj['B-Mag']) else -999.0)
        v_mag_list.append(obj['V-Mag'] if not math.isnan(obj['V-Mag']) else -999.0)
        j_mag_list.append(obj['J-Mag'] if not math.isnan(obj['J-Mag']) else -999.0)
        h_mag_list.append(obj['H-Mag'] if not math.isnan(obj['H-Mag']) else -999.0)
        k_mag_list.append(obj['K-Mag'] if not math.isnan(obj['K-Mag']) else -999.0)

        surf_br_list.append(obj['SurfBr'] if not math.isnan(obj['SurfBr']) else -999.0)

    ####################################################################################################################

    result = {
        'table': table,
        'ra': ra_list,
        'dec': dec_list,
        'names': names_list,
        'type': type_list,
        'min_ax':  min_ax_list,
        'maj_ax': maj_ax_list,
        'pos_ang': pos_ang_list,
        'redshift': redshift_list,
        'b_mag': b_mag_list,
        'v_mag': v_mag_list,
        'j_mag': j_mag_list,
        'h_mag': h_mag_list,
        'k_mag': k_mag_list,
        'surf_br': surf_br_list,
    }

    ####################################################################################################################

    with open(dst_fname, 'wt') as f:

        f.write(json.dumps(result, separators = (',', ':')))

########################################################################################################################

def main():

    parser = argparse.ArgumentParser(description = 'Generate the JSON file of the NGC catalog')

    parser.add_argument('--csv', required = True, help = 'The CSV of the NGC catalog')

    args = parser.parse_args()

    generate(args.csv)

########################################################################################################################

if __name__ == '__main__':

    sys.exit(main())

########################################################################################################################
