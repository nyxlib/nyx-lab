[![][Build Status img]][Build Status]
[![][License img]][License]

<div>
    <a href="http://lpsc.in2p3.fr/" target="_blank">
        <img src="https://raw.githubusercontent.com/nyxlib/nyx-node/main/docs/img/logo_lpsc.svg" height="72"></a>
    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
    <a href="http://www.in2p3.fr/" target="_blank">
        <img src="https://raw.githubusercontent.com/nyxlib/nyx-node/main/docs/img/logo_in2p3.svg" height="72"></a>
    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
    <a href="http://www.univ-grenoble-alpes.fr/" target="_blank">
        <img src="https://raw.githubusercontent.com/nyxlib/nyx-node/main/docs/img/logo_uga.svg" height="72"></a>
</div>

Nyx Lab
=======

The `Nyx` project introduces a protocol, backward-compatible with [INDI 1.7](docs/specs/INDI.pdf) (and `indiserver`), for controlling
astronomical hardware. It enhances INDI by supporting multiple independent nodes, each with its own embedded protocol
stack. Nodes can communicate via an [MQTT](https://mqtt.org/) broker, a [Redis](https://redis.io/) cache (data streams)
or directly over TCP, offering flexibility and scalability for distributed systems.

TODO

Downloading Nyx Lab
===================

The last build can be downloaded [there](https://nyxlib.org/installing).

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

# Developer

* [Jérôme ODIER](https://annuaire.in2p3.fr/4121-4467/jerome-odier) ([CNRS/LPSC](http://lpsc.in2p3.fr/))

# A bit of classical culture

In Greek mythology, Nyx is the goddess and personification of the night. She is one of the primordial deities, born
from Chaos at the dawn of creation.

Mysterious and powerful, Nyx dwells in the deepest shadows of the cosmos, from where she gives birth to many other
divine figures, including Hypnos (Sleep) and Thanatos (Death).

<div style="text-align: center;">
    <img src="https://raw.githubusercontent.com/nyxlib/nyx-node/refs/heads/main/docs/img/nyx.png" style="width: 600px;" />
</div>

[Build Status]:https://github.com/nyxlib/nyx-lab/actions/workflows/deploy.yml
[Build Status img]:https://github.com/nyxlib/nyx-lab/actions/workflows/deploy.yml/badge.svg

[License]:https://www.gnu.org/licenses/gpl-3.0.txt
[License img]:https://img.shields.io/badge/License-GPL_3.0_or_later-blue.svg
