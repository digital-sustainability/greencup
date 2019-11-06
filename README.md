# SBB GreenCup

*SBB GreenCup* (formerly named project *Rail Coffee*) is a [NativeScript](https://docs.nativescript.org/) mobile application created by [Research Center for Digital Sustainability](https://www.digitale-nachhaltigkeit.unibe.ch/) of the University of Bern as part of a proof of concept. The app has the purpose to scan and manage QR-codes on reusable beverage cups for the Swiss Federal Railway company [SBB](https://www.sbb.ch/de/).

## NativeScript Code-Sharing

The app is a NativeScript shared-code project build with the [Angular](https://angular.io/) SPA Framework to serve both mobile and web apps with the same application logic.

All files **not** explicitly marked with either:

- *\[filename\]<strong>.tns</strong>.\[filetype\]*
- *\[filename\]<strong>.android</strong>.\[filetype\]*
- *\[filename\]<strong>.ios</strong>.\[filetype\]*

are shared files for both web and mobile, with the excpetion of non-suffixed *.html* files which are only used in the web app. All files including a suffix are only used in the mobile version.

More information can be found on the [NativeScript documentation on code-sharing](https://docs.nativescript.org/angular/code-sharing/intro).

## Development

The Angular web app has not been fully implemented and needs further development in order to work.

The mobile app can be run locally on a connected mobile device or emulator with the command `tns run [android | ios]`

Changes concerning the remote authentication and data API services have to be made with your own backend. We recommend using our [DigiSAM](https://github.com/digital-sustainability/digisam) framework built with [Sails.js](https://sailsjs.com).