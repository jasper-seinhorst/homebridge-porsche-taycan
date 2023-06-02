# Homebridge Porsche Taycan
[![verified-by-homebridge](https://badgen.net/badge/homebridge/verified/purple)](https://github.com/homebridge/homebridge/wiki/Verified-Plugins)

This Homebrudge plugin offers a range of useful features for your Porsche Taycan, including real-time monitoring of battery level and charging status. Moreover, it also enables you to easily toggle the direct climatisation option on or off. 

## Supported cars:
- Taycan (all years)
- Taycan Sport Turismo (all years)
- Taycan Cross Turismo (all years)

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
        "chargerDevice": "occupancy",
        "batteryDevice": false,
        "lowBattery": 40,
        "platform": "PorscheTaycan"
    }
    ```
  In above example the charging state and battery level are updated every 30 minutes. The charging state is exposed as an occupancy sensor. The battery level is considered low when the SoC drops below 40.


## Credits
This plugin is not an official plugin from Porsche. The Porsche Connect API endpoints are reverse engineered on MyPorsche with help of Google Chrome Dev tools.

This plugin started as a hobby project but is now available to the public. Pull requests to improve the plugins are welcome. 
