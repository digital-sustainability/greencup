# rail-coffee-mobile

*rail-coffee-mobile* is a [NativeScript](https://docs.nativescript.org/) mobile app created within a proof of concept by the [Research Center for Digital Sustainability](https://www.digitale-nachhaltigkeit.unibe.ch/) of the University of Bern. The POC app has the purpose to scan and manage QR-codes on reusable beverage cups for the Swiss Federal Railway company [SBB](https://www.sbb.ch/de/).

## NativeScript Code-Sharing

The app is a NativeScript shared-code project build with the [Angular](https://angular.io/) SPA Framework to serve both mobile and web apps with the same application logic.

All files not explicitly marked with either:

- *\[filename\]<strong>.tns</strong>.\[filetype\]*
- *\[filename\]<strong>.android</strong>.\[filetype\]*
- *\[filename\]<strong>.ios</strong>.\[filetype\]*

are shared files for both web and mobile, with the excpetion of non-suffixed *.html* files. All files including the suffix are only used in the mobile version.

More information can be found on the [NativeScript documentation on code-sharing](https://docs.nativescript.org/angular/code-sharing/intro).

## Run the App

Run the web app with `ng serve` on *localhost:4200*.

Run the mobile app with `tns run [android | ios] --bundle` on a connected mobile device or emulator.