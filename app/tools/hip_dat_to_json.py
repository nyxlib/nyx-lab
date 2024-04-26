#!/usr/bin/env python3
########################################################################################################################

import os
import sys
import json
import math
import tqdm
import argparse

import pandas as pd

from novas import compat as novas

########################################################################################################################

def safe_float_convert(x):

    try:

        return float(x)

    except ValueError:

        return math.nan

########################################################################################################################

def generate(src_fname):

    ####################################################################################################################

    src_fname = os.path.abspath(src_fname)

    dst_fname = os.path.join('../src/catalogs', 'HIP.json')

    ####################################################################################################################

    table = {}

    ra_list = []
    dec_list = []
    type_list = []
    b_mag_list = []
    v_mag_list = []

    names = [
        'Catalog', 'HIP', 'Proxy', 'RAhms', 'DEdms', 'Vmag', 'VarFlag', 'r_Vmag', 'RAdeg', 'DEdeg', 'AstroRef', 'Plx',
        'pmRA', 'pmDE', 'e_RAdeg', 'e_DEdeg', 'e_Plx', 'e_pmRA', 'e_pmDE', 'DE:RA', 'Plx:RA', 'Plx:DE', 'pmRA:RA',
        'pmRA:DE', 'pmRA:Plx', 'pmDE:RA', 'pmDE:DE', 'pmDE:Plx', 'pmDE:pmRA', 'F1', 'F2', '---', 'BTmag', 'e_BTmag',
        'VTmag', 'e_VTmag', 'm_BTmag', 'B-V', 'e_B-V', 'r_B-V', 'V-I', 'e_V-I', 'r_V-I', 'CombMag', 'Hpmag', 'e_Hpmag',
        'Hpscat', 'o_Hpmag', 'm_Hpmag', 'Hpmax', 'HPmin', 'Period', 'HvarType', 'moreVar', 'morePhoto', 'CCDM',
        'n_CCDM', 'Nsys', 'Ncomp', 'MultFlag', 'Source', 'Qual', 'm_HIP', 'theta', 'rho', 'e_rho', 'dHp', 'e_dHp',
        'Survey', 'Chart', 'Notes', 'HD', 'BD', 'CoD', 'CPD', '(V-I)red', 'SpType', 'r_SpType'
    ]

    for i, obj in tqdm.tqdm(pd.read_csv(src_fname, sep = '|', header = None, names = names, converters = {'RAdeg': safe_float_convert, 'DEdeg': safe_float_convert, 'Plx': safe_float_convert, 'pmRA': safe_float_convert, 'pmDE': safe_float_convert}).iterrows()):

        star = novas.CatEntry()

        star.starnumber = obj['HIP']
        star.ra = obj['RAdeg']
        star.dec = obj['DEdeg']
        star.parallax = obj['Plx']
        star.promora = obj['pmRA']
        star.promodec = obj['pmDE']

        radec = novas.transform_hip(star)

        if not math.isnan(radec.ra) and not math.isnan(radec.dec):

            table['HIP' + str(obj['HIP'])] = i

            ra_list.append(radec.ra * 15.0)
            dec_list.append(radec.dec * 1.00)
            type_list.append(obj['SpType'])
            b_mag_list.append(obj['BTmag'])
            v_mag_list.append(obj['VTmag'])

    ####################################################################################################################

    result = {
        'table': table,
        'ra': ra_list,
        'dec': dec_list,
        'type': type_list,
        'b_mag': b_mag_list,
        'v_mag': v_mag_list,
    }

    ####################################################################################################################

    with open(dst_fname, 'wt') as f:

        f.write(json.dumps(result, separators = (',', ':')))

########################################################################################################################

def main():

    parser = argparse.ArgumentParser(description = 'Generate the JSON file of the Hipparcos catalog')

    parser.add_argument('--dat', help = 'The DAT of the Hipparcos catalog')

    args = parser.parse_args()

    generate(args.dat)

########################################################################################################################

if __name__ == '__main__':

    sys.exit(main())

########################################################################################################################
