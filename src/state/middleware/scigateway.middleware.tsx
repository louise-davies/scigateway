import { AnyAction, Dispatch, Middleware, MiddlewareAPI } from 'redux';
import {
  NotificationType,
  RegisterRouteType,
  InvalidateTokenType,
  RequestPluginRerenderType,
} from '../scigateway.types';
import log from 'loglevel';
import { toastr } from 'react-redux-toastr';
import { addHelpTourSteps } from '../actions/scigateway.actions';
import ReactGA from 'react-ga';
import { StateType } from '../state.types';

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

export const listenToPlugins = (dispatch: Dispatch): void => {
  document.addEventListener(microFrontendMessageId, event => {
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

        case RegisterRouteType:
          dispatch(pluginMessage.detail);
          if ('helpText' in pluginMessage.detail.payload) {
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
          dispatch(pluginMessage.detail);
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

  return next(action);
}) as Middleware;

export default ScigatewayMiddleware;