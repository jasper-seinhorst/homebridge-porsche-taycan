import axios from 'axios';
import * as Crypto from 'crypto';
import { ApiAuthorization } from './ApiAuthorization';
import type { Application } from './Application';
import { PorscheServerError } from './PorscheConnect';
import { PorscheConnectBase } from './PorscheConnectBase';
import { URL } from 'url';

export class WrongCredentialsError extends Error {}
export class AccountTemporarilyLocked extends Error {}
export class PorscheAuthError extends Error {}

export abstract class PorscheConnectAuth extends PorscheConnectBase {
  protected isAuthorized(app: Application): boolean {
    if (this.auths[app.toString()] === undefined) {
      return false;
    }
    if (this.auths[app.toString()].isExpired) {
      return false;
    }

    return true;
  }

  protected async authIfRequired(app: Application): Promise<ApiAuthorization> {
    if (!this.isAuthorized(app)) {
      await this.auth(app);
    }

    return this.auths[app.toString()];
  }

  private async auth(app: Application) {
    await this.loginToRetrieveCookies();
    const { apiAuthCode, codeVerifier } = await this.getApiAuthCode(app);
    this.auths[app.toString()] = await this.getApiToken(app, apiAuthCode, codeVerifier);
  }

  private async loginToRetrieveCookies() {
    const loginBody = { username: this.username, password: this.password, keeploggedin: 'false', sec: '', resume: '', thirdPartyId: '', state: '' };
    const formBody = this.buildPostFormBody(loginBody);
    try {
      const result = await this.client.post(this.routes.loginAuthURL, formBody, { maxRedirects: 30 });
      if (result.headers['cdn-original-uri'] && result.headers['cdn-original-uri'].includes('state=WRONG_CREDENTIALS')) {
        throw new WrongCredentialsError();
      } else if(result.headers['cdn-original-uri'] && result.headers['cdn-original-uri'].includes('state=ACCOUNT_TEMPORARILY_LOCKED')) {
        throw new AccountTemporarilyLocked();
      }
    } catch (e: any) {
      if(axios.isAxiosError(e) && e.response && e.response.status && e.response.status >= 500 && e.response.status <= 503) {
        throw new PorscheServerError();
      }
      throw new PorscheAuthError();
    }
  }

  private async getApiAuthCode(app: Application): Promise<{ apiAuthCode: string; codeVerifier: string }> {
    const codeVerifier = Crypto.randomBytes(32).toString('hex');
    const codeVerifierSha = Crypto.createHash('sha256').update(codeVerifier).digest('base64');
    const codeChallenge = codeVerifierSha.replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');

    try {
      const result = await this.client.get(this.routes.apiAuthURL, {
        params: {
          client_id: app.clientId,
          redirect_uri: app.redirectUrl,
          code_challenge: codeChallenge,
          scope: 'openid',
          response_type: 'code',
          access_type: 'offline',
          prompt: 'none',
          code_challenge_method: 'S256',
        },
      });
      const url = new URL(result.headers['cdn-original-uri'], 'http://127.0.0.1');
      const apiAuthCode = url.searchParams.get('code');

      // @ts-ignore
      return { apiAuthCode, codeVerifier };
    } catch (e) {
      throw new PorscheAuthError();
    }
  }

  private async getApiToken(app: Application, code: string, codeVerifier: string): Promise<ApiAuthorization> {
    const apiTokenBody = {
      client_id: app.clientId,
      redirect_uri: app.redirectUrl,
      code: code,
      code_verifier: codeVerifier,
      prompt: 'none',
      grant_type: 'authorization_code',
    };
    const formBody = this.buildPostFormBody(apiTokenBody);

    try {
      const result = await this.client.post(this.routes.apiTokenURL, formBody);
      if (result.data.access_token && result.data.id_token && result.data.expires_in) {
        const auth = new ApiAuthorization(result.data.access_token, result.data.id_token, parseInt(result.data.expires_in));
        return auth;
      } else {
        throw new PorscheAuthError();
      }
    } catch (e) {
      throw new PorscheAuthError();
    }
  }
}
