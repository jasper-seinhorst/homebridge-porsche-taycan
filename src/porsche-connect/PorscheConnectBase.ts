import { Routes } from './Routes';
import axios, { Axios, AxiosResponse } from 'axios';
import * as PersistentAxios from 'axios-cookiejar-support';
import { CookieJar } from 'tough-cookie';
import type { ApiAuthorization } from './ApiAuthorization';
import { Environment } from './Environment';
import { URLSearchParams } from 'url';

export type PorscheConnectConfig = {
  username: string;
  password: string;
  env?: Environment;
};

export abstract class PorscheConnectBase {
  protected readonly env: Environment;
  protected readonly routes: Routes;
  protected client: Axios;

  protected readonly username: string;
  protected readonly password: string;
  protected auths: { [app: string]: ApiAuthorization } = {};

  public constructor(opts: PorscheConnectConfig) {
    this.username = opts.username;
    this.password = opts.password;
    this.env = opts.env ?? Environment.de_DE;
    this.routes = new Routes(this.env);

    this.client = PersistentAxios.wrapper(axios.create({ jar: new CookieJar() }));
  }

  protected buildPostFormBody(data: { [key: string]: string | number }): URLSearchParams {
    const params = new URLSearchParams();
    for (const [key, val] of Object.entries(data)) {
      params.append(key, val.toString());
    }

    return params;
  }

  protected abstract postToApi(url: string, body?: any): Promise<AxiosResponse>;
  protected abstract getFromApi(url: string): Promise<AxiosResponse>;
  protected abstract getStatusFromApi(url: string, retries?: number): Promise<void>;
}
