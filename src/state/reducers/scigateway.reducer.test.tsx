import log from 'loglevel';
import {
  toggleDrawer,
  authorised,
  unauthorised,
  loadingAuthentication,
  dismissMenuItem,
  configureAnalytics,
  initialiseAnalytics,
  siteLoadingUpdate,
  loadAuthProvider,
  configureStrings,
  loadFeatureSwitches,
  toggleHelp,
  addHelpTourSteps,
} from '../actions/scigateway.actions';
import ScigatewayReducer, {
  initialState,
  handleAuthProviderUpdate,
} from './scigateway.reducer';
import { SignOutType, InvalidateTokenType } from '../scigateway.types';
import { ScigatewayState } from '../state.types';
import TestAuthProvider from '../../authentication/testAuthProvider';
import JWTAuthProvider from '../../authentication/jwtAuthProvider';
import GithubAuthProvider from '../../authentication/githubAuthProvider';

describe('scigateway reducer', () => {
  let state: ScigatewayState;

  beforeEach(() => {
    state = initialState;
  });

  it('should return state for actions it does not care about', () => {
    const updatedState = ScigatewayReducer(state, {
      type: 'irrelevant action',
    });

    expect(updatedState).toBe(state);
  });

  it('should toggle the drawer state for a toggleDrawer message', () => {
    expect(state.drawerOpen).toBeFalsy();

    let updatedState = ScigatewayReducer(state, toggleDrawer());
    expect(updatedState.drawerOpen).toBeTruthy();

    updatedState = ScigatewayReducer(updatedState, toggleDrawer());
    expect(updatedState.drawerOpen).toBeFalsy();
  });

  it('should update siteLoading when handleSiteLoadingUpdate message is sent', () => {
    expect(state.siteLoading).toBeTruthy();

    let updatedState = ScigatewayReducer(state, siteLoadingUpdate(false));
    expect(updatedState.siteLoading).toBeFalsy();

    updatedState = ScigatewayReducer(updatedState, siteLoadingUpdate(true));
    expect(updatedState.siteLoading).toBeTruthy();
  });

  it('should toggle the showHelp state for a toggleHelp message', () => {
    expect(state.showHelp).toBeFalsy();

    let updatedState = ScigatewayReducer(state, toggleHelp());
    expect(updatedState.showHelp).toBeTruthy();

    updatedState = ScigatewayReducer(updatedState, toggleHelp());
    expect(updatedState.showHelp).toBeFalsy();
  });

  it('should add steps to the helpTour state array for addHelpTourSteps message', () => {
    expect(state.helpSteps.length).toEqual(0);

    const steps = [
      {
        target: '.test-1',
        content: 'test 1',
      },
      {
        target: '.test-2',
        content: 'test 2',
      },
    ];

    let updatedState = ScigatewayReducer(state, addHelpTourSteps(steps));
    expect(updatedState.helpSteps.length).toEqual(2);
    expect(updatedState.helpSteps[0]).toEqual({
      target: '.test-1',
      content: 'test 1',
    });
    expect(updatedState.helpSteps[1]).toEqual({
      target: '.test-2',
      content: 'test 2',
    });

    updatedState = ScigatewayReducer(
      updatedState,
      addHelpTourSteps([
        {
          target: '.test-3',
          content: 'test 3',
        },
      ])
    );

    expect(updatedState.helpSteps.length).toEqual(3);
    expect(updatedState.helpSteps[2]).toEqual({
      target: '.test-3',
      content: 'test 3',
    });
  });

  it('should not add steps when a duplicate target property is found', () => {
    log.error = jest.fn();
    state.helpSteps = [];

    const steps = [
      {
        target: '.test-1',
        content: 'test 1',
      },
    ];

    let updatedState = ScigatewayReducer(state, addHelpTourSteps(steps));
    expect(updatedState.helpSteps.length).toEqual(1);
    expect(updatedState.helpSteps[0]).toEqual({
      target: '.test-1',
      content: 'test 1',
    });

    updatedState = ScigatewayReducer(updatedState, addHelpTourSteps(steps));

    expect(updatedState.helpSteps.length).toEqual(1);
    expect(log.error).toHaveBeenCalled();
    const mockLog = (log.error as jest.Mock).mock;
    const call = mockLog.calls[0][0];
    expect(call).toEqual('Duplicate help step target identified: .test-1.');
  });

  it('loading authentication should update loading state', () => {
    const action = loadingAuthentication();
    expect(state.authorisation.loading).toBeFalsy();

    let updatedState = ScigatewayReducer(state, action);
    expect(updatedState.authorisation.loading).toBeTruthy();
  });

  it('successful log in should reset failure flags', () => {
    const action = authorised();
    state.authorisation.provider = new TestAuthProvider(null);

    let updatedState = ScigatewayReducer(state, action);

    expect(updatedState.authorisation.failedToLogin).toBeFalsy();
    expect(
      updatedState.authorisation.signedOutDueToTokenInvalidation
    ).toBeFalsy();
    expect(updatedState.authorisation.loading).toBeFalsy();
  });

  it('unsuccessful log in should update authorisation to not logged in state', () => {
    const action = unauthorised();
    state.authorisation.provider = new TestAuthProvider('logged in');

    let updatedState = ScigatewayReducer(state, action);

    expect(updatedState.authorisation.failedToLogin).toBeTruthy();
    expect(updatedState.authorisation.provider.isLoggedIn()).toBeFalsy();
  });

  it('token invalidation should reset authorisation and indicate invalidation', () => {
    const action = { type: InvalidateTokenType };
    state.authorisation.provider = new TestAuthProvider('logged in');

    let updatedState = ScigatewayReducer(state, action);

    expect(
      updatedState.authorisation.signedOutDueToTokenInvalidation
    ).toBeTruthy();
    expect(updatedState.authorisation.provider.isLoggedIn()).toBeFalsy();
  });

  it('should sign user out for a signOut message', () => {
    state.authorisation.provider = new TestAuthProvider('signed in');
    expect(state.authorisation.provider.isLoggedIn()).toBeTruthy();

    let updatedState = ScigatewayReducer(state, { type: SignOutType });

    expect(updatedState.authorisation.provider.isLoggedIn()).toBeFalsy();
    expect(updatedState.authorisation.failedToLogin).toBeFalsy();
    expect(updatedState.authorisation.loading).toBeFalsy();
    expect(updatedState.authorisation.signedOutDueToTokenExpiry).toBeFalsy();
  });

  it('should change auth provider when a LoadAuthProvider action is sent', () => {
    let updatedState = ScigatewayReducer(state, loadAuthProvider('jwt'));

    expect(updatedState.authorisation.provider).toBeInstanceOf(JWTAuthProvider);

    updatedState = ScigatewayReducer(state, loadAuthProvider('github'));

    expect(updatedState.authorisation.provider).toBeInstanceOf(
      GithubAuthProvider
    );
  });

  it('should throw error when unrecognised auth provider is attempted to be loaded', () => {
    expect(() =>
      handleAuthProviderUpdate(state, { authProvider: 'unrecognised' })
    ).toThrow();
  });

  it('should update notification list when new notification is recieved', () => {
    expect(state.notifications.length).toEqual(0);

    const action = {
      type: 'scigateway:api:notification',
      payload: { message: 'test notification', severity: 'success' },
    };
    const updatedState = ScigatewayReducer(state, action);

    expect(updatedState.notifications.length).toEqual(1);
    expect(updatedState.notifications[0]).toEqual({
      message: 'test notification',
      severity: 'success',
    });
  });

  it('should set res property when configure strings action is sent', () => {
    expect(state).not.toHaveProperty('res');

    const updatedState = ScigatewayReducer(
      state,
      configureStrings({ testSection: { testId: 'test' } })
    );

    expect(updatedState).toHaveProperty('res');
    expect(updatedState.res).toEqual({ testSection: { testId: 'test' } });
  });

  it('should set feature switches property when configure feature switches action is sent', () => {
    expect(state.features.showContactButton).toBeTruthy();

    const updatedState = ScigatewayReducer(
      state,
      loadFeatureSwitches({ showContactButton: false })
    );

    expect(updatedState.features.showContactButton).toBeFalsy();
  });

  it('dismissNotification should remove the referenced notification from the notifications list in State', () => {
    const action = dismissMenuItem(2);
    const notificationsInState = {
      notifications: [
        { message: 'message 1', severity: 'warning' },
        { message: 'message 2', severity: 'error' },
        { message: 'message 3', severity: 'success' },
        { message: 'message 4', severity: 'success' },
      ],
    };

    let updatedState = ScigatewayReducer(notificationsInState, action);
    const updatedNotificationsInState = [
      { message: 'message 1', severity: 'warning' },
      { message: 'message 2', severity: 'error' },
      { message: 'message 4', severity: 'success' },
    ];

    expect(updatedState.notifications).toEqual(updatedNotificationsInState);
  });

  describe('register route', () => {
    const basePayload = {
      section: 'dummy-section',
      link: 'initial/route',
      plugin: 'demo_plugin',
      displayName: 'Route Label',
      order: 10,
      helpText: 'help',
    };
    const registerRouteAction = 'scigateway:api:register_route';

    it('should register a plugin in State', () => {
      const action = {
        type: 'scigateway:api:register_route',
        payload: basePayload,
      };
      const updatedState = ScigatewayReducer(state, action);

      expect(updatedState.plugins).toEqual([
        {
          section: action.payload.section,
          link: action.payload.link,
          plugin: action.payload.plugin,
          displayName: action.payload.displayName,
          order: action.payload.order,
          helpText: action.payload.helpText,
        },
      ]);
    });

    it('should register plugin with duplicate displayname and section data in State', () => {
      const baseAction = {
        type: registerRouteAction,
        payload: basePayload,
      };
      const initialPluginState = ScigatewayReducer(state, baseAction);
      const updatedState = ScigatewayReducer(initialPluginState, {
        type: registerRouteAction,
        payload: {
          ...basePayload,
          link: 'second/route',
        },
      });

      expect(updatedState.plugins.length).toBe(2);
      expect(updatedState.plugins).toContainEqual({
        section: basePayload.section,
        link: 'second/route',
        plugin: basePayload.plugin,
        displayName: basePayload.displayName,
        order: basePayload.order,
        helpText: basePayload.helpText,
      });
      expect(updatedState.plugins).toContainEqual({
        section: basePayload.section,
        link: basePayload.link,
        plugin: basePayload.plugin,
        displayName: basePayload.displayName,
        order: basePayload.order,
        helpText: basePayload.helpText,
      });
    });

    it('should log error and not register plugin with duplicate route in State', () => {
      log.error = jest.fn();
      const duplicatePayload = {
        ...basePayload,
        displayName: 'Duplicate Route',
      };
      const initialPluginState = ScigatewayReducer(state, {
        type: 'scigateway:api:register_route',
        payload: basePayload,
      });
      const updatedState = ScigatewayReducer(initialPluginState, {
        type: 'scigateway:api:register_route',
        payload: duplicatePayload,
      });

      expect(updatedState.plugins.length).toBe(1);
      expect(updatedState.plugins).toContainEqual({
        section: basePayload.section,
        link: basePayload.link,
        plugin: basePayload.plugin,
        displayName: basePayload.displayName,
        order: basePayload.order,
        helpText: basePayload.helpText,
      });

      expect(log.error).toHaveBeenCalled();
      const mockLog = (log.error as jest.Mock).mock;
      const call = mockLog.calls[0][0];
      expect(call).toContain(duplicatePayload.plugin);
      expect(call).toContain(duplicatePayload.link);
      expect(call).toContain(duplicatePayload.displayName);
    });
  });

  it('should set the analytics id state for a configureAnalytics message', () => {
    expect(state.analytics).toBeFalsy();

    let updatedState = ScigatewayReducer(state, configureAnalytics('test id'));
    expect(updatedState.analytics.id).toEqual('test id');
    expect(updatedState.analytics.initialised).toBeFalsy();
  });

  it('should set the analytics initalised state for an initialiseAnalytics message', () => {
    state.analytics = { id: 'test id', initialised: false };

    let updatedState = ScigatewayReducer(state, initialiseAnalytics());
    expect(updatedState.analytics.initialised).toBeTruthy();
  });

  it('should log an error if an initialiseAnalytics message is sent with no analytics config', () => {
    delete state.analytics;
    log.error = jest.fn();

    let updatedState = ScigatewayReducer(state, initialiseAnalytics());
    expect(updatedState.analytics).toBeUndefined();

    expect(log.error).toHaveBeenCalled();
    const mockLog = (log.error as jest.Mock).mock;
    const call = mockLog.calls[0][0];
    expect(call)
      .toEqual(`Attempted to initialise analytics without analytics configuration - 
      configureAnalytics needs to be performed before initialising`);
  });
});