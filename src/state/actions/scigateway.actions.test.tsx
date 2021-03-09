import mockAxios from 'axios';
import { Action, AnyAction } from 'redux';
import {
  toggleDrawer,
  verifyUsernameAndPassword,
  loadingAuthentication,
  authorised,
  loadFeatureSwitches,
  configureSite,
  dismissMenuItem,
  siteLoadingUpdate,
  configureAnalytics,
  initialiseAnalytics,
  loadStrings,
  toggleHelp,
  addHelpTourSteps,
  invalidToken,
  loadedAuthentication,
  loadDarkModePreference,
  registerStartUrl,
  loadScheduledMaintenanceState,
  loadMaintenanceState,
} from './scigateway.actions';
import {
  ToggleDrawerType,
  ConfigureFeatureSwitchesType,
  DismissNotificationType,
  ConfigureAnalyticsType,
  InitialiseAnalyticsType,
  ToggleHelpType,
  AddHelpTourStepsType,
  NotificationType,
} from '../scigateway.types';
import { initialState } from '../reducers/scigateway.reducer';
import TestAuthProvider from '../../authentication/testAuthProvider';
import { StateType } from '../state.types';
import loadMicroFrontends from './loadMicroFrontends';
import log from 'loglevel';

jest.useFakeTimers();

function mockAxiosGetResponse(message: string): void {
  (mockAxios.get as jest.Mock).mockImplementationOnce(() =>
    Promise.resolve({
      data: {
        title: message,
      },
    })
  );
}

describe('scigateway actions', () => {
  beforeEach(() => {
    (mockAxios.get as jest.Mock).mockReset();

    (mockAxios.post as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        data: {
          token: 'token123',
        },
      })
    );

    loadMicroFrontends.init = jest
      .fn()
      .mockImplementation(() => Promise.resolve());
  });

  it('toggleDrawer only needs a type', () => {
    const action = toggleDrawer();
    expect(action.type).toEqual(ToggleDrawerType);
  });

  it('given valid credentials verifyUsernameAndPassword should return with a valid token and successful authorisation', async () => {
    mockAxiosGetResponse(
      'this will be replaced by an API call to get access token'
    );

    const asyncAction = verifyUsernameAndPassword('username', 'password');
    const actions: Action[] = [];
    const dispatch = (action: Action): number => actions.push(action);
    const state = JSON.parse(JSON.stringify(initialState));
    state.authorisation.provider = new TestAuthProvider(null);

    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    const getState = (): any => ({
      scigateway: state,
      router: {
        location: {
          state: {
            referrer: '/destination/after/login',
          },
        },
      },
    });

    const action = asyncAction(dispatch, getState);
    jest.runAllTimers();
    await action;

    expect(actions[0]).toEqual(loadingAuthentication());
    expect(actions[1]).toEqual(authorised('validLoginToken'));
    expect(actions[2]).toEqual({
      type: '@@router/CALL_HISTORY_METHOD',
      payload: {
        args: ['/destination/after/login'],
        method: 'push',
      },
    });
  });

  it('given no referrer but valid credentials verifyUsernameAndPassword should redirect back to /', async () => {
    mockAxiosGetResponse(
      'this will be replaced by an API call to get access token'
    );

    const asyncAction = verifyUsernameAndPassword('username', 'password');
    const actions: Action[] = [];
    const dispatch = (action: Action): number => actions.push(action);
    const state = JSON.parse(JSON.stringify(initialState));
    state.authorisation.provider = new TestAuthProvider(null);

    // const getState = (): Partial<StateType> => ({ scigateway: state });
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    const getState = (): any => ({
      scigateway: state,
      router: {
        location: {
          state: {},
        },
      },
    });

    const action = asyncAction(dispatch, getState);
    jest.runAllTimers();
    await action;

    expect(actions[0]).toEqual(loadingAuthentication());
    expect(actions[1]).toEqual(authorised('validLoginToken'));
    expect(actions[2]).toEqual({
      type: '@@router/CALL_HISTORY_METHOD',
      payload: {
        args: ['/'],
        method: 'push',
      },
    });
  });

  it('given invalid credentials verifyUsernameAndPassword should return an authorisation failure', async () => {
    mockAxiosGetResponse(
      'this will be replaced by an API call to get access token'
    );

    const asyncAction = verifyUsernameAndPassword('INVALID_NAME', 'password');
    const actions: Action[] = [];
    const dispatch = (action: Action): number => actions.push(action);

    const state = JSON.parse(JSON.stringify(initialState));
    state.authorisation.provider = new TestAuthProvider(null);
    const getState = (): Partial<StateType> => ({ scigateway: state });

    const action = asyncAction(dispatch, getState);
    jest.runAllTimers();
    await action;
    const expectedResponse = { type: 'scigateway:auth_failure' };

    expect(actions[0]).toEqual(loadingAuthentication());
    expect(actions[1]).toEqual(expectedResponse);
  });

  it('given feature settings loadFeatureSwitches updates state to show feature', () => {
    const features = { showContactButton: true };

    const action = loadFeatureSwitches(features);
    expect(action.type).toEqual(ConfigureFeatureSwitchesType);
    expect(action.payload.switches).toEqual({ showContactButton: true });
  });

  it('given a feature switch loadFeatureSwitches is run', async () => {
    (mockAxios.get as jest.Mock).mockImplementation(() =>
      Promise.resolve({
        data: {
          features: { showContactButton: true },
          'ui-strings': '/res/default.json',
        },
      })
    );

    const asyncAction = configureSite();
    const actions: Action[] = [];
    const dispatch = (action: Action): number => actions.push(action);
    const getState = (): Partial<StateType> => ({ scigateway: initialState });

    await asyncAction(dispatch, getState);

    expect(actions).toContainEqual(
      loadFeatureSwitches({ showContactButton: true })
    );
  });

  it('given a startUrl registration is run', async () => {
    (mockAxios.get as jest.Mock).mockImplementation(() =>
      Promise.resolve({
        data: {
          startUrl: '/test',
        },
      })
    );

    const asyncAction = configureSite();
    const actions: Action[] = [];
    const dispatch = (action: Action): number => actions.push(action);
    const getState = (): Partial<StateType> => ({ scigateway: initialState });

    await asyncAction(dispatch, getState);

    expect(actions).toContainEqual(registerStartUrl('/test'));
  });

  it('given a ga-tracking-id configureAnalytics is run', async () => {
    (mockAxios.get as jest.Mock).mockImplementation(() =>
      Promise.resolve({
        data: {
          'ga-tracking-id': 'test-tracking-id',
          'ui-strings': '/res/default.json',
        },
      })
    );

    const asyncAction = configureSite();
    const actions: Action[] = [];
    const dispatch = (action: Action): number => actions.push(action);
    const getState = (): Partial<StateType> => ({ scigateway: initialState });

    await asyncAction(dispatch, getState);

    expect(actions).toContainEqual(configureAnalytics('test-tracking-id'));
  });

  it('dispatches a site loading update after settings are loaded', async () => {
    (mockAxios.get as jest.Mock).mockImplementation(() =>
      Promise.resolve({
        data: {
          features: { showContactButton: true },
          'ui-strings': '/res/default.json',
        },
      })
    );

    const asyncAction = configureSite();
    const actions: Action[] = [];
    const dispatch = (action: Action): void | Promise<void> => {
      if (typeof action === 'function') {
        action(dispatch);
        return Promise.resolve();
      } else {
        actions.push(action);
      }
    };

    const state = JSON.parse(JSON.stringify(initialState));
    const testAuthProvider = new TestAuthProvider('token');
    testAuthProvider.verifyLogIn = jest
      .fn()
      .mockImplementationOnce(() => Promise.resolve());
    state.authorisation.provider = testAuthProvider;
    const getState = (): Partial<StateType> => ({ scigateway: state });

    await asyncAction(dispatch, getState);

    expect(actions).toContainEqual(authorised());
    expect(actions).toContainEqual(siteLoadingUpdate(false));
  });

  it('dispatches a site loading update after settings are loaded with failed auth, no features and no leading slash on ui-strings', async () => {
    (mockAxios.get as jest.Mock).mockImplementation(() =>
      Promise.resolve({
        data: {
          'ui-strings': 'res/default.json',
        },
      })
    );

    const asyncAction = configureSite();
    const actions: Action[] = [];
    const dispatch = (action: Action): void | Promise<void> => {
      if (typeof action === 'function') {
        action(dispatch);
        return Promise.resolve();
      } else {
        actions.push(action);
      }
    };

    const state = JSON.parse(JSON.stringify(initialState));
    state.authorisation.provider = new TestAuthProvider('token');
    const getState = (): Partial<StateType> => ({ scigateway: state });

    await asyncAction(dispatch, getState);

    expect(actions).toContainEqual(invalidToken());
    expect(actions).toContainEqual(siteLoadingUpdate(false));
  });

  it("given an authenticator that supports autologin, autologin is attempted when user isn't logged in", async () => {
    (mockAxios.get as jest.Mock).mockImplementation(() =>
      Promise.resolve({
        data: {
          'ui-strings': '/res/default.json',
        },
      })
    );

    const asyncAction = configureSite();
    let actions: Action[] = [];
    const dispatch = (action: Action): void | Promise<void> => {
      if (typeof action === 'function') {
        action(dispatch);
        return Promise.resolve();
      } else {
        actions.push(action);
      }
    };
    const state = JSON.parse(JSON.stringify(initialState));
    const testAuthProvider = new TestAuthProvider(null);
    testAuthProvider.autoLogin = () => Promise.resolve();
    state.authorisation.provider = testAuthProvider;
    const getState = (): Partial<StateType> => ({ scigateway: state });

    await asyncAction(dispatch, getState);

    expect(actions).toContainEqual(loadingAuthentication());
    expect(actions).toContainEqual(authorised());

    actions = [];
    testAuthProvider.autoLogin = () => Promise.reject();
    await asyncAction(dispatch, getState);

    expect(actions).toContainEqual(loadingAuthentication());
    expect(actions).toContainEqual(loadedAuthentication());
  });

  it('given an authenticator that supports autologin, autologin is attempted when user was logged in but verification failed', async () => {
    (mockAxios.get as jest.Mock).mockImplementation(() =>
      Promise.resolve({
        data: {
          'ui-strings': '/res/default.json',
        },
      })
    );

    const asyncAction = configureSite();
    let actions: Action[] = [];
    const dispatch = (action: Action): void | Promise<void> => {
      if (typeof action === 'function') {
        action(dispatch);
        return Promise.resolve();
      } else {
        actions.push(action);
      }
    };
    const state = JSON.parse(JSON.stringify(initialState));
    const testAuthProvider = new TestAuthProvider('token');
    testAuthProvider.verifyLogIn = jest
      .fn()
      .mockImplementation(() => Promise.reject());
    testAuthProvider.autoLogin = () => Promise.resolve();
    state.authorisation.provider = testAuthProvider;
    const getState = (): Partial<StateType> => ({ scigateway: state });

    await asyncAction(dispatch, getState);

    expect(actions).toContainEqual(loadingAuthentication());
    expect(actions).toContainEqual(authorised());

    actions = [];
    testAuthProvider.autoLogin = () => Promise.reject();
    await asyncAction(dispatch, getState);

    expect(actions).toContainEqual(loadingAuthentication());
    expect(actions).toContainEqual(invalidToken());
  });

  it('given an index number dismissMenuItem returns a DismissNotificationType with payload', () => {
    const action = dismissMenuItem(0);
    expect(action.type).toEqual(DismissNotificationType);
    expect(action.payload).toEqual({ index: 0 });
  });

  it('given an id configureAnalytics returns a ConfigureAnalytics type with payload', () => {
    const action = configureAnalytics('test id');
    expect(action.type).toEqual(ConfigureAnalyticsType);
    expect(action.payload).toEqual({ id: 'test id' });
  });

  it('initialiseAnalytics returns an InitialiseAnalyticsType', () => {
    const action = initialiseAnalytics();
    expect(action.type).toEqual(InitialiseAnalyticsType);
  });

  it('toggleHelp only needs a type', () => {
    const action = toggleHelp();
    expect(action.type).toEqual(ToggleHelpType);
  });

  it('given a steps array addHelpTourSteps returns a AddHelpTourStepsType with payload', () => {
    const action = addHelpTourSteps([{ target: '.test', content: 'test' }]);
    expect(action.type).toEqual(AddHelpTourStepsType);
    expect(action.payload.steps.length).toEqual(1);
    expect(action.payload.steps[0]).toEqual({
      target: '.test',
      content: 'test',
    });
  });

  // TODO Test is passing locally, but failing Travis as darkMode is always
  //      false in storage. Skip for now.
  it.skip('should load dark mode preference into store', async () => {
    (mockAxios.get as jest.Mock).mockImplementation(() =>
      Promise.resolve({
        data: {
          'ui-strings': 'res/default.json',
        },
      })
    );

    localStorage.setItem('darkMode', 'true');

    const asyncAction = configureSite();
    const actions: Action[] = [];
    const dispatch = (action: Action): number => actions.push(action);
    const getState = (): Partial<StateType> => ({ scigateway: initialState });

    await asyncAction(dispatch, getState);

    expect(actions).toContainEqual(loadDarkModePreference(true));
  });

  it('logs an error if settings.json fails to be loaded', async () => {
    (mockAxios.get as jest.Mock).mockImplementationOnce(() =>
      Promise.reject({})
    );
    log.error = jest.fn();

    const asyncAction = configureSite();
    const actions: Action[] = [];
    const dispatch = (action: Action): number => actions.push(action);
    const getState = (): Partial<StateType> => ({ scigateway: initialState });
    await asyncAction(dispatch, getState);

    expect(log.error).toHaveBeenCalled();
    const mockLog = (log.error as jest.Mock).mock;
    expect(mockLog.calls[0][0]).toEqual(
      expect.stringContaining('Error loading settings.json: ')
    );
  });

  it('logs an error if settings.json is invalid JSON object', async () => {
    (mockAxios.get as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        data: 1,
      })
    );
    log.error = jest.fn();

    const asyncAction = configureSite();
    const actions: Action[] = [];
    const dispatch = (action: Action): number => actions.push(action);
    const getState = (): Partial<StateType> => ({ scigateway: initialState });
    await asyncAction(dispatch, getState);

    expect(log.error).toHaveBeenCalled();
    const mockLog = (log.error as jest.Mock).mock;
    expect(mockLog.calls[0][0]).toEqual(
      'Error loading settings.json: Invalid format'
    );
  });

  it('logs an error if loadStrings fails to resolve', async () => {
    (mockAxios.get as jest.Mock).mockImplementationOnce(() =>
      Promise.reject({})
    );
    log.error = jest.fn();

    const path = 'non/existent/path';
    const asyncAction = loadStrings(path);
    const actions: Action[] = [];
    const dispatch = (action: Action): number => actions.push(action);
    const getState = (): Partial<StateType> => ({ scigateway: initialState });

    await asyncAction(dispatch, getState);

    expect(log.error).toHaveBeenCalled();
    const mockLog = (log.error as jest.Mock).mock;
    expect(mockLog.calls[0][0]).toEqual(
      expect.stringContaining(`Failed to read strings from ${path}: `)
    );
  });

  it('should load scheduled maintenance state into store', async () => {
    (mockAxios.get as jest.Mock).mockImplementation(() =>
      Promise.resolve({
        data: {},
      })
    );

    const asyncAction = configureSite();
    const actions: Action[] = [];
    const dispatch = (action: Action): number => actions.push(action);
    const state = JSON.parse(JSON.stringify(initialState));
    state.authorisation.provider = new TestAuthProvider(null);

    const getState = (): Partial<StateType> => ({ scigateway: state });

    await asyncAction(dispatch, getState);

    expect(actions).toContainEqual(
      loadScheduledMaintenanceState({ show: false, message: 'test' })
    );
  });

  it('should not display a warning when maintenance is not scheduled', async () => {
    (mockAxios.get as jest.Mock).mockImplementation(() =>
      Promise.resolve({
        data: {},
      })
    );

    const events: CustomEvent<AnyAction>[] = [];
    const dispatchEventSpy = jest
      .spyOn(document, 'dispatchEvent')
      .mockImplementation((e) => {
        events.push(e as CustomEvent<AnyAction>);
        return true;
      });
    const asyncAction = configureSite();
    const actions: Action[] = [];
    const dispatch = (action: Action): number => actions.push(action);
    const state = JSON.parse(JSON.stringify(initialState));
    state.authorisation.provider = new TestAuthProvider(null);

    const getState = (): Partial<StateType> => ({ scigateway: state });

    await asyncAction(dispatch, getState);

    expect(dispatchEventSpy).not.toHaveBeenCalled();
    expect(events.length).toEqual(0);
  });

  it('should display a warning when maintenance is scheduled', async () => {
    (mockAxios.get as jest.Mock).mockImplementation(() =>
      Promise.resolve({
        data: {},
      })
    );

    const events: CustomEvent<AnyAction>[] = [];
    const dispatchEventSpy = jest
      .spyOn(document, 'dispatchEvent')
      .mockImplementation((e) => {
        events.push(e as CustomEvent<AnyAction>);
        return true;
      });
    const asyncAction = configureSite();
    const actions: Action[] = [];
    const dispatch = (action: Action): number => actions.push(action);
    const state = JSON.parse(JSON.stringify(initialState));
    const testAuthProvider = new TestAuthProvider(null);
    testAuthProvider.fetchScheduledMaintenanceState = () =>
      Promise.resolve({
        show: true,
        message: 'test',
      });
    state.authorisation.provider = testAuthProvider;

    const getState = (): Partial<StateType> => ({ scigateway: state });

    await asyncAction(dispatch, getState);

    expect(dispatchEventSpy).toHaveBeenCalled();
    expect(events.length).toEqual(1);
    expect(events[0].detail).toEqual({
      type: NotificationType,
      payload: {
        message: 'test',
        severity: 'warning',
      },
    });
  });

  it('should load maintenance state into store', async () => {
    (mockAxios.get as jest.Mock).mockImplementation(() =>
      Promise.resolve({
        data: {},
      })
    );

    const asyncAction = configureSite();
    const actions: Action[] = [];
    const dispatch = (action: Action): number => actions.push(action);
    const state = JSON.parse(JSON.stringify(initialState));
    state.authorisation.provider = new TestAuthProvider(null);

    const getState = (): Partial<StateType> => ({ scigateway: state });

    await asyncAction(dispatch, getState);

    expect(actions).toContainEqual(
      loadMaintenanceState({ show: false, message: 'test' })
    );
  });
});
