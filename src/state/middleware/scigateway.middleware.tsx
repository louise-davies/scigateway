import { AnyAction, Dispatch, Middleware, MiddlewareAPI } from 'redux';
import {
  NotificationType,
  RegisterRouteType,
  InvalidateTokenType,
  RequestPluginRerenderType,
  ToggleDrawerType,
  SendThemeOptionsType,
  LoadDarkModePreferenceType,
} from '../scigateway.types';
import log from 'loglevel';
import { toastr } from 'react-redux-toastr';
import {
  addHelpTourSteps,
  requestPluginRerender,
  sendThemeOptions,
} from '../actions/scigateway.actions';
import ReactGA from 'react-ga';
import { StateType } from '../state.types';
import { buildTheme } from '../../theming';
import { push } from 'connected-react-router';

const trackPage = (page: string): void => {
  ReactGA.set({
    page,
  });
  ReactGA.pageview(page);
};

let currentPage = '';

const microFrontendMessageId = 'scigateway';

const broadcastToPlugins = (action: AnyAction): void => {
  document.dispatchEvent(
    new CustomEvent(microFrontendMessageId, { detail: action })
  );
};

type microFrontendMessageType = CustomEvent<AnyAction>;

const toastrMessageOptions = {
  removeOnHover: false,
  removeOnHoverTimeOut: 0,
};

export const listenToPlugins = (
  dispatch: Dispatch,
  getState: () => StateType
): void => {
  let darkModePreference;
  const darkModeLocalStorage = localStorage.getItem('darkMode');
  if (darkModeLocalStorage) {
    darkModePreference = darkModeLocalStorage === 'true' ? true : false;
  } else {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    darkModePreference = mq.matches;
  }
  const theme = buildTheme(darkModePreference);

  document.addEventListener(microFrontendMessageId, (event) => {
    const pluginMessage = event as microFrontendMessageType;

    if (
      pluginMessage.detail &&
      pluginMessage.detail.type &&
      pluginMessage.detail.type.startsWith('scigateway:api:')
    ) {
      // this is a valid message, send to Redux in the parent app
      switch (pluginMessage.detail.type) {
        case RequestPluginRerenderType:
          //ignore events sent from the parent app
          break;

        case SendThemeOptionsType:
          break;

        case RegisterRouteType:
          dispatch(pluginMessage.detail);
          if ('helpSteps' in pluginMessage.detail.payload) {
            dispatch(addHelpTourSteps(pluginMessage.detail.payload.helpSteps));
          } else if ('helpText' in pluginMessage.detail.payload) {
            dispatch(
              addHelpTourSteps([
                {
                  target: `#plugin-link-${pluginMessage.detail.payload.link.replace(
                    /\//g,
                    '-'
                  )}`,
                  content: pluginMessage.detail.payload.helpText,
                },
              ])
            );
          }

          // Redirect to optional startUrl if set and current url is the normal homepage '/'
          if (
            getState().router.location.pathname === '/' &&
            getState().scigateway.startUrl === pluginMessage.detail.payload.link
          ) {
            dispatch(
              push(pluginMessage.detail.payload.link, {
                scigateway: { startUrl: pluginMessage.detail.payload.link },
              })
            );
          } else if (
            // Redirect to homepage if set. This overrides any startUrl currently set
            getState().router.location.pathname === '/' &&
            getState().scigateway.homepageUrl ===
              pluginMessage.detail.payload.link
          ) {
            dispatch(
              push(pluginMessage.detail.payload.link, {
                scigateway: { homepageUrl: pluginMessage.detail.payload.link },
              })
            );
          }

          // Send theme options once registered.
          dispatch(sendThemeOptions(theme));

          break;

        case NotificationType:
          dispatch(pluginMessage.detail);

          if (pluginMessage.detail.payload.severity !== undefined) {
            const { severity, message } = pluginMessage.detail.payload;
            if (severity === 'error') {
              toastr.error('Error', message, toastrMessageOptions);
            } else if (severity === 'warning') {
              toastr.warning('Warning', message, toastrMessageOptions);
            }
          }
          break;
        case InvalidateTokenType:
          getState()
            .scigateway.authorisation.provider.refresh()
            .catch(() => dispatch(pluginMessage.detail));
          break;
        default:
          // log and ignore
          log.warn(
            `Unexpected message received from plugin, not dispatched:\nevent.detail = ${JSON.stringify(
              pluginMessage.detail
            )}`
          );
      }
    } else {
      log.error(
        `Invalid message received from a plugin:\nevent.detail = ${JSON.stringify(
          pluginMessage.detail
        )}`
      );
    }
  });
};

const ScigatewayMiddleware: Middleware = ((
  store: MiddlewareAPI<Dispatch<AnyAction>, StateType>
) => (next: Dispatch<AnyAction>) => (action: AnyAction): AnyAction => {
  const state = store.getState();

  if (action.payload && action.payload.broadcast) {
    broadcastToPlugins(action);
  }

  if (
    action.type === '@@router/LOCATION_CHANGE' &&
    state.scigateway.analytics &&
    state.scigateway.analytics.initialised
  ) {
    const nextPage = `${action.payload.location.pathname}${action.payload.location.search}`;

    if (currentPage !== nextPage) {
      currentPage = nextPage;
      trackPage(nextPage);
    }
  }

  if (action.type === ToggleDrawerType) {
    next(action);
    return store.dispatch(requestPluginRerender());
  }

  if (action.type === LoadDarkModePreferenceType) {
    next(action);
    const theme = buildTheme(action.payload.darkMode);
    store.dispatch(sendThemeOptions(theme));
    return store.dispatch(requestPluginRerender());
  }

  return next(action);
}) as Middleware;

export default ScigatewayMiddleware;
