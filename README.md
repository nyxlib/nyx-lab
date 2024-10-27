[![][Build Status img]][Build Status]
[![][License img]][License]

<a href="http://lpsc.in2p3.fr/" target="_blank">
	<img src="./images/logo_lpsc.svg" alt="LPSC" height="72" />
</a>
&nbsp;&nbsp;&nbsp;&nbsp;
<a href="http://www.in2p3.fr/" target="_blank">
	<img src="./images/logo_in2p3.svg" alt="IN2P3" height="72" />
</a>
&nbsp;&nbsp;&nbsp;&nbsp;
<a href="http://www.univ-grenoble-alpes.fr/" target="_blank">
	<img src="./images/logo_uga.svg" alt="UGA" height="72" />
</a>

Nyx Dashboard
=============

TODO

Downloading Nyx Dashboard
=========================

The last build can be downloaded [there](https://gitlab.in2p3.fr/lpsc-kid/nyx-dashboard/-/artifacts).

Installing Nyx Dashboard
========================

Before using Nyx Assistant, make sure that `libfuse2` is installed:

```bash
sudo dnf install fuse-libs
# or
sudo apt-get install libfuse2
# or
sudo apt-get install libfuse2t64
```

For Android, in `AndroidManifest.xml`, add:

```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
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

[License]:http://www.cecill.info/licences/Licence_CeCILL-C_V1-en.txt
[License img]:https://img.shields.io/badge/license-CeCILL_C-blue.svg
