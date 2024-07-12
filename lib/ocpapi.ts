
/**
 * OCPAPI 
 * 
 * This module provides an interface to interact with ocp.electrolux.one via 
 * their public API. Requires a specialised version of Gigya to function.
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
import { Gigya, DataCenter } from '@gslender/gigya';
import axios, { AxiosInstance } from 'axios';

const EU1_ACCOUNTS_API_KEY = '4_JZvZObbVWc1YROHF9e6y8A';
const API_KEY = '2AMqwEV5MqVhTKrRCyYfVF8gmKrd2rAmp7cUsfky';
const AUTH_API_URL = 'https://api.eu.ocp.electrolux.one/one-account-authorization/api/v1';
const APPLIANCE_API_URL = 'https://api.eu.ocp.electrolux.one/appliance/api/v2';

interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export class OcpApi {
  static giga_accounts_api_key = EU1_ACCOUNTS_API_KEY;
  static giga_dc_region: DataCenter = "eu1";
  private ocpAccountAuth: AxiosInstance = axios.create({
    baseURL: AUTH_API_URL,
    headers: {
      Accept: 'application/json',
      'Accept-Charset': 'utf-8',
      'x-api-key': API_KEY,
      'Content-Type': 'application/json',
      'User-Agent': 'Ktor client',
      'Origin-Country-Code': 'PL'
    }
  });
  private gigya: Gigya = new Gigya(OcpApi.giga_accounts_api_key, OcpApi.giga_dc_region);
  private jwtResponse: any;

  private getUsername: () => string;
  private getPassword: () => string;
  private getAccessToken: () => string;
  private setAccessToken: (token: string) => void;
  private getTokenExpirationDate: () => number;
  private setTokenExpirationDate: (date: number) => void;

  constructor() {
    this.getUsername = () => '';
    this.getPassword = () => '';
    this.getAccessToken = () => '';
    this.setAccessToken = () => { };
    this.getTokenExpirationDate = () => 0;
    this.setTokenExpirationDate = () => { };
  }

  public init(
    getUsername: () => string,
    getPassword: () => string,
    getAccessToken: () => string,
    setAccessToken: (token: string) => void,
    getTokenExpirationDate: () => number,
    setTokenExpirationDate: (date: number) => void
  ): void {
    this.getUsername = getUsername;
    this.getPassword = getPassword;
    this.getAccessToken = getAccessToken;
    this.setAccessToken = setAccessToken;
    this.getTokenExpirationDate = getTokenExpirationDate;
    this.setTokenExpirationDate = setTokenExpirationDate;
  }

  private isExpired(): boolean {
    return this.getTokenExpirationDate() <= Date.now();
  }

  public async login(): Promise<void> {
    try {
      const loginResponse = await this.gigya.accounts.login({
        loginID: this.getUsername(),
        password: this.getPassword(),
        targetEnv: 'mobile',
        sessionExpiration: -2
      });

      this.jwtResponse = await this.gigya.accounts.getJWT({
        targetUID: loginResponse.UID,
        apiKey: API_KEY,
        fields: 'country',
        oauth_token: loginResponse.sessionInfo?.sessionToken,
        secret: loginResponse.sessionInfo?.sessionSecret
      });

      const response = await this.ocpAccountAuth.post<TokenResponse>(
        '/token',
        {
          grantType: 'urn:ietf:params:oauth:grant-type:token-exchange',
          clientId: 'ElxOneApp',
          idToken: this.jwtResponse.id_token,
          scope: ''
        },
        {
          headers: {
            Authorization: 'Bearer'
          }
        }
      );

      this.setAccessToken(response.data.accessToken);
      this.setTokenExpirationDate(Date.now() + response.data.expiresIn * 1000);
    } catch (error) {
      throw new Error(`${error}`);
    }
  }

  public async createHttp(): Promise<AxiosInstance> {
    if (this.isExpired()) {
      await this.login();
    }
    try {
      return axios.create({
        baseURL: APPLIANCE_API_URL,
        headers: {
          'Accept-Encoding': 'gzip, deflate, br',
          'Accept-Charset': 'utf-8',
          'x-api-key': API_KEY,
          Accept: 'application/json',
          'User-Agent': 'Ktor client',
          Authorization: `Bearer ${this.getAccessToken()}`
        }
      });
    } catch (error) {
      console.log(JSON.stringify(error));
      throw new Error(`${error}`);
    }
  }
}