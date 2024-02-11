# Homebridge Porsche Taycan
[![verified-by-homebridge](https://badgen.net/badge/homebridge/verified/purple)](https://github.com/homebridge/homebridge/wiki/Verified-Plugins)

This Homebrudge plugin offers a range of useful features for your Porsche Taycan and Macan EV, including real-time monitoring of battery level, charging status and charging power. Moreover, it also enables you to easily toggle the direct climatisation option on or off. 

## Supported cars:
- Taycan (MY19 and newer)
- Macan EV (MY25 and newer)

## Installation
To install Homebridge Porsche Taycan follow these steps:

- Follow the instructions on the [Homebridge Wiki](https://homebridge.io/how-to-install-homebridge) to install Node.js and Homebridge;
- Install the Homebridge Porsche Tycan plugin through Homebridge Config UI X or manually by:
  ```
  $ sudo npm -g i homebridge-porsche-taycan
  ```
- Edit config.json and add the Porsche Taycan platform. For example,
    ```
    {
        "username": "<<Porsche Connect username>>",
        "password": "<<Porsche Connect password>>",
        "pollInterval": 30,
        "batteryDevice": false,
        "chargingPowerDevice": true,
        "lowBattery": 40,
        "platform": "PorscheTaycan"
    }
    ```
  In above example the charging state and battery level are updated every 30 minutes. The battery level is considered low when the SoC drops below 40. No separate battery level device is exposed, but the current charging power is.

## Caveats
- The plugin can throw authentication errors. The login method used from Porsche's API expects a captcha now and then. As a work around logon to my.porsche.com and restart the plugin. Logging in on my.porsche.com reset the need for a captcha.
- Precool/heat cools or heats your vehicle on activation, the desired temperature can only be changed in the My Porsche app when setting a charge timer.

## Credits
This plugin is not an official plugin from Porsche. The usage of Porsche Connect API endpoints are reverse engineered on MyPorsche with help of Google Chrome Dev tools. It uses the unofficial 'porsche-connect' node package to communicate to Porsches servers.

This plugin started as a hobby project but is now available to the public. Pull requests to improve the plugins are welcome. 
