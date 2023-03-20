import { API } from 'homebridge';
import { PorscheTaycanPlatform } from './Platform';

export = (api: API) => {
  api.registerPlatform('PorscheTaycan', PorscheTaycanPlatform);
};
