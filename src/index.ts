import { API } from 'homebridge';
import { PorscheTaycanPlatform } from './platform';

export = (api: API) => {
  api.registerPlatform('PorscheTaycan', PorscheTaycanPlatform);
};
