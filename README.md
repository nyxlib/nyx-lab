[![][Build Status img]][Build Status]
[![][License img]][License]

<table style="border: none;">
    <tr>
        <td>
            <a href="http://lpsc.in2p3.fr/" target="_blank">
                <img src="https://raw.githubusercontent.com/nyxlib/nyx-node/main/docs/img/logo_lpsc.svg" alt="LPSC" height="72" />
            </a>
        </td>
        <td>
            <a href="http://www.in2p3.fr/" target="_blank">
                <img src="https://raw.githubusercontent.com/nyxlib/nyx-node/main/docs/img/logo_in2p3.svg" alt="IN2P3" height="72" />
            </a>
        </td>
        <td>
            <a href="http://www.univ-grenoble-alpes.fr/" target="_blank">
                <img src="https://raw.githubusercontent.com/nyxlib/nyx-node/main/docs/img/logo_uga.svg" alt="UGA" height="72" />
            </a>
        </td>
    </tr>
</table>

Nyx Lab
=======

TODO

Downloading Nyx Lab
===================

The last build can be downloaded [there](https://nyxlib.org/installing).

Installing Nyx Lab
==================

Before using Nyx Assistant, make sure that `libfuse2` is installed:

```bash
sudo dnf install fuse-libs
# or
sudo apt-get install libfuse2
# or
sudo apt-get install libfuse2t64
```

For Android, in `./src-tauri/gen/android/app/src/main/AndroidManifest.xml`, add:

```xml
<uses-permission android:name="android.permission.INTERNET" />

<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />

<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />

<uses-feature android:name="android.hardware.gps" android:required="true" />
```

and set:

```xml
<application android:usesCleartextTraffic="true" ...>...</application>
```

Developer
=========

* [Jérôme ODIER](https://annuaire.in2p3.fr/4121-4467/jerome-odier) ([CNRS/LPSC](http://lpsc.in2p3.fr/))

[Build Status]:https://gitlab.in2p3.fr/ami-team/AMITaskServer/-/commits/master
[Build Status img]:https://gitlab.in2p3.fr/ami-team/AMITaskServer/badges/master/pipeline.svg

[License]:https://www.gnu.org/licenses/gpl-3.0.txt
[License img]:https://img.shields.io/badge/license-GPL_3.0_or_later-blue.svg
