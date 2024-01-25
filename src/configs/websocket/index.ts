import DerivAPIBasic from '@deriv/deriv-api/dist/DerivAPIBasic';
import type { AuthorizeRequest, AuthorizeResponse } from '@deriv/api-types';
import {
  TSocketEndpointNames,
  TSocketRequestProps,
  TSocketResponse,
  TSocketSubscribableEndpointNames,
} from './types';
import { Observable } from 'rxjs';
import { getIsBrowser, getServerConfig } from '@site/src/utils';

export type TDerivApi = {
  send: (...requestData: unknown[]) => Promise<unknown>;
  subscribe: (...requestData: unknown[]) => Observable<object>;
  authorize: (requestData: AuthorizeRequest) => Promise<AuthorizeResponse>;
};

let attempts = 10;
const RECONNECT_INTERVAL = attempts * 10000;
const PING_INTERVAL = 12000;

export class ApiManager {
  private socket: WebSocket;
  private derivApi: TDerivApi;
  private pingInterval: NodeJS.Timer;
  private reconnectInterval: NodeJS.Timer;
  private websocket_connected: (connection_value) => boolean;
  private websocket_authorize: (connection_value) => boolean;

  public static instance: ApiManager;
  public static getInstance() {
    if (!ApiManager.instance) {
      ApiManager.instance = new ApiManager();
    }
    return ApiManager.instance;
  }

  public init() {
    if (!this.socket) {
      const { serverUrl, appId } = getServerConfig();
      this.socket = new WebSocket(`wss://${serverUrl}/websockets/v3?app_id=${appId}`);
    }
    this.derivApi = new DerivAPIBasic({ connection: this.socket });
    this.registerKeepAlive();
  }

  public augmentedSend<T extends TSocketEndpointNames>(
    request: TSocketRequestProps<T> extends never ? undefined : TSocketRequestProps<T>,
  ): Promise<TSocketResponse<T>> {
    return this.derivApi.send(request) as Promise<TSocketResponse<T>>;
  }

  public augmentedSubscribe<T extends TSocketSubscribableEndpointNames>(
    request?: TSocketRequestProps<T> extends never ? undefined : TSocketRequestProps<T>,
  ): Observable<TSocketResponse<T>> {
    return this.derivApi.subscribe(request) as Observable<TSocketResponse<T>>;
  }

  public authorize(token: string, setIsConnected, setIsAuthorized) {
    this.websocket_connected = setIsConnected;
    this.websocket_authorize = setIsAuthorized;
    return this.derivApi.authorize({ authorize: token });
  }
  public logout() {
    this.derivApi.send({ logout: 1 });
  }

  private registerKeepAlive() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
    }
    if (this.reconnectInterval) {
      clearInterval(this.reconnectInterval);
    }
    this.socket.addEventListener('open', () => {
      this.websocket_connected && this.websocket_connected(true);
      this.pingInterval = setInterval(() => {
        this.socket.send(JSON.stringify({ ping: 1 }));
      }, PING_INTERVAL);
    });

    this.socket.addEventListener('close', () => {
      this.websocket_connected && this.websocket_connected(false);
      this.websocket_authorize && this.websocket_authorize(false);
      clearInterval(this.pingInterval);
      this.socket = null;
      if (attempts > 0) {
        this.reconnectInterval = setTimeout(this.init.bind(this), RECONNECT_INTERVAL);
        attempts -= 1;
      } else {
        window.alert('server down!!!');
        clearInterval(this.reconnectInterval);
      }
    });

    this.socket.addEventListener('error', () => {
      clearInterval(this.pingInterval);
    });
  }

  public reset(appId: string, url: string, registerKeepAlive = false) {
    this.socket = new WebSocket(`wss://${url}/websockets/v3?app_id=${appId}`);
    this.derivApi = new DerivAPIBasic({ connection: this.socket });
    if (registerKeepAlive) {
      this.registerKeepAlive();
    }
  }

  set connection(newConnection: WebSocket) {
    this.socket = newConnection;
  }

  get connection() {
    return this.socket;
  }

  set api(value: TDerivApi) {
    this.derivApi = value;
  }

  get api() {
    return this.derivApi;
  }
}
let apiManager: ApiManager;
if (getIsBrowser()) {
  apiManager = ApiManager.getInstance();
}

export default apiManager;
