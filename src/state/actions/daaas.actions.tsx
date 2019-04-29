import axios from 'axios';
import { Action, AnyAction } from 'redux';
import * as log from 'loglevel';
import {
  ConfigureStringsType,
  ConfigureStringsPayload,
  NotificationType,
  NotificationPayload,
  ToggleDrawerType,
  AuthFailureType,
  AuthSuccessType,
  ApplicationStrings,
  SignOutType,
  FeatureSwitchesPayload,
  ConfigureFeatureSwitchesType,
  FeatureSwitches,
  LoadingAuthType,
  RequestPluginRerenderType,
  AuthProviderPayload,
  LoadAuthProviderType,
} from '../daaas.types';
import { ActionType, ThunkResult, StateType } from '../state.types';
import loadMicroFrontends from './loadMicroFrontends';
import { push } from 'connected-react-router';
import { ThunkAction } from 'redux-thunk';

export const daaasNotification = (
  message: string,
  id: string
): ActionType<NotificationPayload> => ({
  type: NotificationType,
  payload: {
    message,
    id,
  },
});

export const configureStrings = (
  appStrings: ApplicationStrings
): ActionType<ConfigureStringsPayload> => ({
  type: ConfigureStringsType,
  payload: {
    res: appStrings,
  },
});

export const loadStrings = (path: string): ThunkResult<Promise<void>> => {
  return async dispatch => {
    await axios
      .get(path)
      .then(res => {
        dispatch(configureStrings(res.data));
      })
      .catch(error =>
        log.error(`Failed to read strings from ${path}: ${error}`)
      );
  };
};

export const loadFeatureSwitches = (
  featureSwitches: FeatureSwitches
): ActionType<FeatureSwitchesPayload> => ({
  type: ConfigureFeatureSwitchesType,
  payload: {
    switches: featureSwitches,
  },
});

export const loadAuthProvider = (
  authProvider: string
): ActionType<AuthProviderPayload> => ({
  type: LoadAuthProviderType,
  payload: {
    authProvider,
  },
});

export const unauthorised = (): Action => ({
  type: AuthFailureType,
});

export const authorised = (): Action => ({
  type: AuthSuccessType,
});

export const configureSite = (): ThunkResult<Promise<void>> => {
  return async (dispatch, getState) => {
    await axios.get(`/settings.json`).then(res => {
      const settings = res.data;

      dispatch(loadAuthProvider(settings['auth-provider']));

      // after auth provider is set then the token needs to be verified
      const provider = getState().daaas.authorisation.provider;
      if (provider.isLoggedIn()) {
        provider
          .verifyLogIn()
          .then(() => {
            dispatch(authorised());
          })
          .catch(() => {
            dispatch(unauthorised());
          });
      }

      if (settings['features']) {
        dispatch(loadFeatureSwitches(settings['features']));
      }
      dispatch(daaasNotification(JSON.stringify(settings), '-1'));

      const uiStringResourcesPath = !settings['ui-strings'].startsWith('/')
        ? '/' + settings['ui-strings']
        : settings['ui-strings'];
      dispatch(loadStrings(uiStringResourcesPath));
      loadMicroFrontends.init(settings.plugins);
    });
  };
};

export const toggleDrawer = (): Action => ({
  type: ToggleDrawerType,
});

export const signOut = (): ThunkAction<
  void,
  StateType,
  null,
  AnyAction
> => dispatch => {
  dispatch({ type: SignOutType });
  dispatch(push('/'));
};

export const loadingAuthentication = (): Action => ({
  type: LoadingAuthType,
});

export const verifyUsernameAndPassword = (
  username: string,
  password: string
): ThunkResult<Promise<void>> => {
  return async (dispatch, getState) => {
    // will be replaced with call to login API for authentification
    dispatch(loadingAuthentication());
    const authProvider = getState().daaas.authorisation.provider;
    await authProvider
      .logIn(username, password)
      .then(() => {
        dispatch(authorised());

        // redirect the user to the original page they were trying to get to
        // the referrer is added by the redirect in routing.component.tsx
        const previousRouteState = getState().router.location.state;
        dispatch(
          push(
            previousRouteState && previousRouteState.referrer
              ? previousRouteState.referrer
              : '/'
          )
        );
      })
      .catch(() => {
        // probably want to do something smarter with
        // err.response.status (e.g. 403 or 500)
        dispatch(unauthorised());
      });
  };
};

export const requestPluginRerender = (): ActionType<{
  broadcast: boolean;
}> => ({
  type: RequestPluginRerenderType,
  payload: {
    broadcast: true,
  },
});
