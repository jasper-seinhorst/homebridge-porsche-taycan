# Homebridge plugin Porsche Taycan
This Homebridge plugin exposes charging and battery state of your Porsche Taycan to your Home app. With this plugin you can see the current SoC of your battery and current charge state.

## Supported cars:
- Taycan (all years)
- Taycan Sport Turismo (all years)
- Taycan Cross Turismo (all years)

## Installation
To install Homebridge Porsche Taycan:

- Follow the instructions on the Homebridge Wiki to install Node.js and Homebridge;
- Install the Homebridge RPi plugin through Homebridge Config UI X or manually by:
  ```
  $ sudo npm -g i homebridge-porsche-taycan
  ```
- Edit config.json and add the Porsche Taycan platform. For example like:
    ```
    {
        "username": "<< Porsche Connect username / email >>",
        "password": "<< Porsche Connect password >>",
        "pollInterval": 5,
        "platform": "PorscheTaycan"
    }
    ```

## Credits
Thanks to the author of [Node Porsche Connect](https://github.com/martijndierckx/node-porsche-connect), and also everyone from [Taycan Forum](https://www.taycanforum.com/) who gave me the inspiration to start this plugin.

This plugin started as a hobby project, but the plugin is now available to the public. Pull requests to improve the plugins are welcome. 