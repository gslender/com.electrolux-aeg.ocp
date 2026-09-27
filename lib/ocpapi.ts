/**
 * OCPAPI
 *
 * This module provides an interface to interact with Electrolux Group appliances via
 * the official Electrolux Group Developer API (https://developer.electrolux.one).
 *
 * Author: Grant Slender (gslender@gmail.com)
 *
 *
 * License: GNU General Public License v3.0
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 */
import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';

const API_BASE_URL = 'https://api.developer.electrolux.one/api/v1';
const USER_AGENT = 'HomeyElectroluxAEG';

// Refresh the access token this long before it actually expires
const REFRESH_MARGIN_MS = 5 * 60 * 1000;
// Free plan allows 10 calls/sec and 5 concurrent calls - requests are serialised and spaced out
const MIN_REQUEST_GAP_MS = 150;
// Used when a 429 response carries no Retry-After header
const DEFAULT_RATE_LIMIT_BACKOFF_MS = 15 * 60 * 1000;

export interface OcpAuth {
  apiKey: string;
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
  scope: string;
}

/** The stored credentials were rejected and the user has to enter new ones. */
export class OcpAuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'OcpAuthError';
  }
}

/** The API key has exceeded its rate limit or daily quota. */
export class OcpRateLimitError extends Error {
  constructor(message: string, public readonly retryAt: number) {
    super(message);
    this.name = 'OcpRateLimitError';
  }
}

export function describeError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data: any = error.response?.data;
    const detail = data?.message ?? data?.error ?? '';
    return `${error.response?.status ?? error.code ?? 'network error'} ${detail}`.trim();
  }
  return `${error}`;
}

function jwtExpiry(token: string): number {
  try {
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString('utf8'));
    return typeof payload.exp === 'number' ? payload.exp * 1000 : 0;
  } catch (_error) {
    return 0;
  }
}

function statusOf(error: unknown): number | undefined {
  return axios.isAxiosError(error) ? error.response?.status : undefined;
}

export class OcpApi {
  private http: AxiosInstance = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'User-Agent': USER_AGENT
    }
  });
  private auth?: OcpAuth;
  private onAuthChanged: (auth: OcpAuth) => void = () => { };
  private refreshInFlight?: Promise<void>;
  private queue: Promise<unknown> = Promise.resolve();
  private lastRequestAt = 0;
  private rateLimitedUntil = 0;

  public init(auth: OcpAuth | undefined, onAuthChanged: (auth: OcpAuth) => void): void {
    this.auth = auth && auth.apiKey && auth.accessToken && auth.refreshToken ? auth : undefined;
    this.onAuthChanged = onAuthChanged;
  }

  public hasCredentials(): boolean {
    return this.auth !== undefined;
  }

  public getAuth(): OcpAuth | undefined {
    return this.auth;
  }

  public async getAppliances(): Promise<any[]> {
    const data = await this.request<any>({ method: 'GET', url: '/appliances' });
    return Array.isArray(data) ? data : [];
  }

  public async getApplianceState(applianceId: string): Promise<any> {
    return await this.request({ method: 'GET', url: `/appliances/${applianceId}/state` }) ?? {};
  }

  public async getApplianceInfo(applianceId: string): Promise<any> {
    return await this.request({ method: 'GET', url: `/appliances/${applianceId}/info` }) ?? {};
  }

  public async sendCommand(applianceId: string, command: any): Promise<void> {
    // DAM appliances (ids starting with "1:") expect commands wrapped in a list
    const body = applianceId.startsWith('1:') ? { commands: [command] } : command;
    await this.request({ method: 'PUT', url: `/appliances/${applianceId}/command`, data: body });
  }

  /**
   * Validates a freshly entered API key / token pair and, if it works, adopts it.
   * The previously used refresh token (if any) is revoked afterwards.
   */
  public async useCredentials(apiKey: string, accessToken: string, refreshToken: string): Promise<void> {
    let candidate: OcpAuth = { apiKey, accessToken, refreshToken, expiresAt: jwtExpiry(accessToken) };
    if (this.needsRefresh(candidate)) {
      candidate = await this.refreshTokens(candidate);
    }
    try {
      await this.send(candidate, { method: 'GET', url: '/appliances' });
    } catch (error) {
      const status = statusOf(error);
      if (status === 401 || status === 403) {
        throw new OcpAuthError(`credentials rejected (${describeError(error)})`);
      }
      throw error;
    }

    const previous = this.auth;
    this.setAuth(candidate);
    if (previous && previous.refreshToken !== candidate.refreshToken) {
      await this.revoke(previous.refreshToken).catch(() => { });
    }
  }

  public async revoke(refreshToken: string): Promise<void> {
    await this.throttled(() => this.http.post('/token/revoke', { refreshToken }));
  }

  private setAuth(auth: OcpAuth) {
    this.auth = auth;
    this.onAuthChanged(auth);
  }

  private needsRefresh(auth: OcpAuth): boolean {
    return auth.expiresAt - REFRESH_MARGIN_MS <= Date.now();
  }

  private async request<T = any>(config: AxiosRequestConfig): Promise<T> {
    if (!this.auth) throw new OcpAuthError('no credentials configured');
    if (this.needsRefresh(this.auth)) await this.refreshAuth();
    try {
      return await this.send<T>(this.auth, config);
    } catch (error) {
      if (statusOf(error) !== 401) throw error;
      // Token may have been invalidated early - refresh once and retry
      await this.refreshAuth();
      try {
        return await this.send<T>(this.auth, config);
      } catch (retryError) {
        if (statusOf(retryError) === 401) throw new OcpAuthError(`access token rejected (${describeError(retryError)})`);
        throw retryError;
      }
    }
  }

  /**
   * Refresh tokens are single use - every refresh returns a new pair - so concurrent callers
   * must share one refresh, otherwise the second caller would present an already used token.
   */
  private refreshAuth(): Promise<void> {
    if (!this.refreshInFlight) {
      const current = this.auth!;
      this.refreshInFlight = this.refreshTokens(current)
        .then(next => {
          // Don't clobber credentials the user entered while this refresh was running
          if (this.auth === current) this.setAuth(next);
        })
        .finally(() => { this.refreshInFlight = undefined; });
    }
    return this.refreshInFlight;
  }

  private async refreshTokens(auth: OcpAuth): Promise<OcpAuth> {
    this.checkRateLimit();
    try {
      const response = await this.throttled(() =>
        this.http.post<TokenResponse>('/token/refresh', { refreshToken: auth.refreshToken }));
      const { accessToken, refreshToken, expiresIn } = response.data;
      const expiresAt = expiresIn ? Date.now() + expiresIn * 1000 : jwtExpiry(accessToken);
      return { apiKey: auth.apiKey, accessToken, refreshToken, expiresAt };
    } catch (error) {
      this.noteRateLimit(error);
      const status = statusOf(error);
      if (status !== undefined && status >= 400 && status < 500) {
        throw new OcpAuthError(`refresh token rejected (${describeError(error)})`);
      }
      throw error;
    }
  }

  private async send<T = any>(auth: OcpAuth, config: AxiosRequestConfig): Promise<T> {
    this.checkRateLimit();
    try {
      const response = await this.throttled(() => this.http.request<T>({
        ...config,
        headers: {
          ...config.headers,
          'x-api-key': auth.apiKey,
          Authorization: `Bearer ${auth.accessToken}`
        }
      }));
      return response.data;
    } catch (error) {
      this.noteRateLimit(error);
      throw error;
    }
  }

  private checkRateLimit() {
    if (Date.now() < this.rateLimitedUntil) {
      throw new OcpRateLimitError('rate limit reached', this.rateLimitedUntil);
    }
  }

  private noteRateLimit(error: unknown) {
    if (statusOf(error) !== 429) return;
    const retryAfter = Number((error as AxiosError).response?.headers?.['retry-after']);
    const backoff = Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter * 1000 : DEFAULT_RATE_LIMIT_BACKOFF_MS;
    this.rateLimitedUntil = Date.now() + backoff;
    throw new OcpRateLimitError(`rate limit reached (${describeError(error)})`, this.rateLimitedUntil);
  }

  /** Runs requests one at a time with a minimum gap, keeping within the API's rate and burst limits. */
  private throttled<T>(fn: () => Promise<T>): Promise<T> {
    const run = async () => {
      const wait = this.lastRequestAt + MIN_REQUEST_GAP_MS - Date.now();
      if (wait > 0) await new Promise(resolve => setTimeout(resolve, wait));
      this.lastRequestAt = Date.now();
      return fn();
    };
    const result = this.queue.then(run, run);
    this.queue = result.catch(() => undefined);
    return result;
  }
}
