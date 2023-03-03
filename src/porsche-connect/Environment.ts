export class Environment {
  //public static readonly ie_EN = new Environment('ie', 'en_IE', 'Europe/Dublin');
  public static readonly nl_BE = new Environment('be', 'nl_NL', 'Europe/Brussels');
  public static readonly nl_NL = new Environment('nl', 'nl_NL', 'Europe/Amsterdam');
  public static readonly de_DE = new Environment('de', 'de_DE', 'Europe/Berlin');

  private constructor(public readonly country: string, public readonly locale: string, public readonly timeZone: string) {}
}
