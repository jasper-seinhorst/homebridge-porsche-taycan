# Homebridge plugin Porsche Taycan
This Homebridge plugin exposes different states about your vehicle(s). Such as charging state and battery level. The charging state is exposed
as occupancy sensor to indicate if your Taycan is charging and a battery accessory reflecting your vehicles battery.

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
- Edit config.json and add the Porsche Taycan platform. For example like:
    ```
    {
        "username": "<<Porsche Connect username>>",
        "password": "<<Porsche Connect password>>",
        "pollInterval": 5,
        "platform": "PorscheTaycan"
    }
    ```

## Credits
Thanks to the author of [Node Porsche Connect](https://github.com/martijndierckx/node-porsche-connect) for the inspiration, and also everyone from [Taycan Forum](https://www.taycanforum.com/) who gave me the inspiration to start this plugin.

This plugin started as a hobby project, but is now available to the public. Pull requests to improve the plugins are welcome. 