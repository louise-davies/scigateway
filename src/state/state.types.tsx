import { ThunkAction } from 'redux-thunk';
import { AnyAction } from 'redux';
import {
  ApplicationStrings,
  PluginConfig,
  FeatureSwitches,
} from './daaas.types';
import { RouterState } from 'connected-react-router';

export interface Plugin {
  name: string;
  src: string;
  enable: boolean;
  location: 'main' | 'left' | 'right';
}

export interface DaaasNotification {
  message: string;
  severity: string;
}

export interface DaaasState {
  notifications: DaaasNotification[];
  plugins: PluginConfig[];
  drawerOpen: boolean;
  authorisation: AuthState;
  res?: ApplicationStrings;
  features: FeatureSwitches;
}

export interface StateType {
  daaas: DaaasState;
  router: RouterState;
}

export interface ActionType<T> {
  type: string;
  payload: T;
}

export type ThunkResult<R> = ThunkAction<R, StateType, null, AnyAction>;

export interface AuthState {
  token: string;
  failedToLogin: boolean;
  loggedIn: boolean;
  loading: boolean;
}
