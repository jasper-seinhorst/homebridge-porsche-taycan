import Moment from 'moment';
import JWT, { JwtPayload } from 'jsonwebtoken';

export class ApiAuthorization {
  private expiresAt: Moment.Moment;
  public readonly accessToken: string;
  public readonly apiKey: string;

  public constructor(accessToken: string, idToken: string, expiresIn: number) {
    this.accessToken = accessToken;
    this.expiresAt = Moment.unix(Moment().unix() + expiresIn);

    const jwt = JWT.decode(idToken) as JwtPayload;
    this.apiKey = jwt.aud.toString();
  }

  public get isExpired() {
    const now = Moment();
    return this.expiresAt.isBefore(now.add(60, 'seconds'));
  }
}
