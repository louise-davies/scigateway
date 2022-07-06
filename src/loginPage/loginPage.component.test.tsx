import React from 'react';
import * as singleSpa from 'single-spa';
import LoginPage, {
  UnconnectedLoginPage,
  CredentialsLoginScreen,
  RedirectLoginScreen,
  CombinedLoginProps,
  AnonLoginScreen,
  LoginSelector,
} from './loginPage.component';
import { buildTheme } from '../theming';
import { ThemeProvider, StyledEngineProvider } from '@mui/material/styles';
import TestAuthProvider from '../authentication/testAuthProvider';
import { createLocation } from 'history';
import axios from 'axios';
import { flushPromises } from '../setupTests';
import { act } from 'react-dom/test-utils';
import { ICATAuthenticator, StateType } from '../state/state.types';
import configureStore from 'redux-mock-store';
import { authState, initialState } from '../state/reducers/scigateway.reducer';
import {
  loadingAuthentication,
  resetAuthState,
} from '../state/actions/scigateway.actions';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import { AnyAction } from 'redux';
import { NotificationType } from '../state/scigateway.types';
import * as log from 'loglevel';
import { mount, shallow } from 'enzyme';

jest.mock('loglevel');

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: () => ({
    pathname: 'localhost:3000/login',
  }),
}));

describe('Login selector component', () => {
  let props: CombinedLoginProps;

  beforeEach(() => {
    props = {
      auth: {
        failedToLogin: false,
        signedOutDueToTokenInvalidation: false,
        loading: false,
        provider: new TestAuthProvider(null),
      },
      location: createLocation('/'),
      res: undefined,
    };
  });

  it('sets a new mnemonic in local state on mnemonic change', () => {
    const mnemonics: ICATAuthenticator[] = [
      {
        mnemonic: 'user/pass',
        keys: [{ name: 'username' }, { name: 'password' }],
      },
      {
        mnemonic: 'anon',
        keys: [],
      },
    ];
    const testSetMnemonic = jest.fn();
    const event = { target: { name: 'mnemonicChange', value: 'anon' } };

    const wrapper = shallow(
      <LoginSelector
        {...props}
        mnemonics={mnemonics}
        mnemonic="user/pass"
        setMnemonic={testSetMnemonic}
      />
    );

    wrapper.find('#select-mnemonic').simulate('change', event);
    expect(testSetMnemonic).toBeCalledWith('anon');
  });
});

describe('Login page component', () => {
  let props: CombinedLoginProps;
  let mockStore;
  let state: StateType;

  beforeEach(() => {
    mockStore = configureStore([thunk]);

    state = {
      scigateway: { ...initialState, authorisation: { ...authState } },
      router: { location: createLocation('/') },
    };

    props = {
      auth: {
        failedToLogin: false,
        signedOutDueToTokenInvalidation: false,
        loading: false,
        provider: new TestAuthProvider(null),
      },
      location: createLocation('/'),
      res: undefined,
      verifyUsernameAndPassword: () => Promise.resolve(),
    };

    state.scigateway.authorisation = props.auth;

    singleSpa.start();
  });

  const theme = buildTheme(false);

  it('credential component renders correctly', () => {
    const wrapper = shallow(<CredentialsLoginScreen {...props} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('credential component renders failedToLogin error correctly', () => {
    props.auth.failedToLogin = true;
    const wrapper = shallow(<CredentialsLoginScreen {...props} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('credential component renders signedOutDueToTokenInvalidation error correctly', () => {
    props.auth.signedOutDueToTokenInvalidation = true;
    const wrapper = shallow(<CredentialsLoginScreen {...props} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('redirect component renders correctly', () => {
    const wrapper = shallow(<RedirectLoginScreen {...props} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('redirect component renders failedToLogin error correctly', () => {
    props.auth.failedToLogin = true;
    const wrapper = shallow(<RedirectLoginScreen {...props} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('anonymous component renders correctly', () => {
    const wrapper = shallow(<AnonLoginScreen {...props} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('anonymous component renders failedToLogin error correctly', () => {
    props.auth.failedToLogin = true;
    const wrapper = shallow(<AnonLoginScreen {...props} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('anonymous component renders signedOutDueToTokenInvalidation error correctly', () => {
    props.auth.signedOutDueToTokenInvalidation = true;
    const wrapper = shallow(<AnonLoginScreen {...props} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('login page renders credential component if no redirect url', () => {
    const wrapper = shallow(<UnconnectedLoginPage {...props} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('login page renders redirect component if redirect url present', () => {
    props.auth.provider.redirectUrl = 'test redirect';
    const wrapper = shallow(<UnconnectedLoginPage {...props} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('login page renders dropdown if mnemonic present + there are multiple mnemonics (but it filters out anon)', async () => {
    props.auth.provider.mnemonic = '';
    (axios.get as jest.Mock).mockImplementation(() =>
      Promise.resolve({
        data: [
          {
            mnemonic: 'user/pass',
            keys: [{ name: 'username' }, { name: 'password' }],
          },
          {
            mnemonic: 'ldap',
            keys: [{ name: 'username' }, { name: 'password' }],
          },
          {
            mnemonic: 'anon',
            keys: [],
          },
        ],
      })
    );

    const spy = jest
      .spyOn(React, 'useEffect')
      .mockImplementationOnce((f) => f());

    const wrapper = shallow(<UnconnectedLoginPage {...props} />);

    await act(async () => {
      await flushPromises();
      wrapper.update();
    });

    expect(wrapper).toMatchSnapshot();
    spy.mockRestore();
  });

  it("login page doesn't render dropdown if anon is the only other authenticator", async () => {
    props.auth.provider.mnemonic = '';
    (axios.get as jest.Mock).mockImplementation(() =>
      Promise.resolve({
        data: [
          {
            mnemonic: 'user/pass',
            keys: [{ name: 'username' }, { name: 'password' }],
          },
          {
            mnemonic: 'anon',
            keys: [],
          },
        ],
      })
    );

    const spy = jest
      .spyOn(React, 'useEffect')
      .mockImplementationOnce((f) => f());

    const wrapper = shallow(<UnconnectedLoginPage {...props} />);

    await act(async () => {
      await flushPromises();
      wrapper.update();
    });

    expect(wrapper).toMatchSnapshot();
    spy.mockRestore();
  });

  it('login page renders anonymous login if mnemonic present with no keys', async () => {
    props.auth.provider.mnemonic = 'nokeys';
    (axios.get as jest.Mock).mockImplementation(() =>
      Promise.resolve({
        data: [
          {
            mnemonic: 'nokeys',
            keys: [],
          },
        ],
      })
    );

    const spy = jest
      .spyOn(React, 'useEffect')
      .mockImplementationOnce((f) => f());

    const wrapper = shallow(<UnconnectedLoginPage {...props} />);

    await act(async () => {
      await flushPromises();
      wrapper.update();
    });

    expect(wrapper).toMatchSnapshot();
    spy.mockRestore();
  });

  it('login page renders credentials login if mnemonic present + user/pass is selected', async () => {
    props.auth.provider.mnemonic = 'user/pass';
    (axios.get as jest.Mock).mockImplementation(() =>
      Promise.resolve({
        data: [
          {
            mnemonic: 'user/pass',
            keys: [{ name: 'username' }, { name: 'password' }],
          },
        ],
      })
    );

    const spy = jest
      .spyOn(React, 'useEffect')
      .mockImplementationOnce((f) => f());

    const wrapper = shallow(<UnconnectedLoginPage {...props} />);

    await act(async () => {
      await flushPromises();
      wrapper.update();
    });

    expect(wrapper).toMatchSnapshot();
    spy.mockRestore();
  });

  it('login page renders spinner if auth is loading', () => {
    props.auth.loading = true;
    const wrapper = shallow(<UnconnectedLoginPage {...props} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('login page displays and logs an error if fetchMnemonics fails', async () => {
    props.auth.provider.mnemonic = '';
    (axios.get as jest.Mock).mockImplementation(() => Promise.reject());
    const events: CustomEvent<AnyAction>[] = [];

    const dispatchEventSpy = jest
      .spyOn(document, 'dispatchEvent')
      .mockImplementation((e) => {
        events.push(e as CustomEvent<AnyAction>);
        return true;
      });

    const wrapper = mount(
      <StyledEngineProvider injectFirst>
        <ThemeProvider theme={theme}>
          <UnconnectedLoginPage {...props} />
        </ThemeProvider>
      </StyledEngineProvider>
    );

    await act(async () => {
      await flushPromises();
      wrapper.update();
    });

    expect(dispatchEventSpy).toHaveBeenCalled();
    expect(events.length).toEqual(1);
    expect(events[0].detail).toEqual({
      type: NotificationType,
      payload: {
        message:
          'It is not possible to authenticate you at the moment. Please, try again later',
        severity: 'error',
      },
    });

    expect(log.error).toHaveBeenCalled();
    expect((log.error as jest.Mock).mock.calls[0][0]).toEqual(
      'It is not possible to authenticate you at the moment. Please, try again later'
    );
  });

  it('on submit verification method should be called with username and password arguments', async () => {
    const mockLoginfn = jest.fn();
    props.verifyUsernameAndPassword = mockLoginfn;

    const wrapper = mount(
      <StyledEngineProvider injectFirst>
        <ThemeProvider theme={theme}>
          <UnconnectedLoginPage {...props} />
        </ThemeProvider>
      </StyledEngineProvider>
    );

    const simulateUsernameInput = wrapper.find('input').at(0);
    simulateUsernameInput.instance().value = 'new username';
    simulateUsernameInput.simulate('change');

    const simulatePasswordInput = wrapper.find('input').at(1);
    simulatePasswordInput.instance().value = 'new password';
    simulatePasswordInput.simulate('change');

    wrapper.find('button').simulate('click');

    expect(mockLoginfn.mock.calls.length).toEqual(1);

    expect(mockLoginfn.mock.calls[0]).toEqual([
      'new username',
      'new password',
      undefined,
    ]);

    simulateUsernameInput.instance().value = 'new username 2';
    simulateUsernameInput.simulate('change');

    simulatePasswordInput.instance().value = 'new password 2';
    simulatePasswordInput.simulate('change');

    wrapper
      .find(CredentialsLoginScreen)
      .find('div')
      .first()
      .simulate('keypress', { key: 'Enter' });

    expect(mockLoginfn.mock.calls.length).toEqual(2);

    expect(mockLoginfn.mock.calls[1]).toEqual([
      'new username 2',
      'new password 2',
      undefined,
    ]);
  });

  it('on submit window location should change for redirect', () => {
    props.auth.provider.redirectUrl = 'test redirect';

    global.window = Object.create(window);
    const windowLocation = JSON.stringify(window.location);
    Object.defineProperty(window, 'location', {
      value: JSON.parse(windowLocation),
    });

    const wrapper = mount(
      <StyledEngineProvider injectFirst>
        <ThemeProvider theme={theme}>
          <UnconnectedLoginPage {...props} />
        </ThemeProvider>
      </StyledEngineProvider>
    );

    wrapper.find('button').simulate('click');

    expect(window.location.href).toEqual('test redirect');
  });

  it('on location.search filled in verification method should be called with blank username and query string', () => {
    props.auth.provider.redirectUrl = 'test redirect';
    props.location.search = '?token=test_token';

    const mockLoginfn = jest.fn();
    props.verifyUsernameAndPassword = mockLoginfn;

    // TODO: switch to shallow when enzyme supports hooks/useEffect
    mount(
      <StyledEngineProvider injectFirst>
        <ThemeProvider theme={theme}>
          <UnconnectedLoginPage {...props} />
        </ThemeProvider>
      </StyledEngineProvider>
    );

    expect(mockLoginfn.mock.calls.length).toEqual(1);
    expect(mockLoginfn.mock.calls[0]).toEqual([
      '',
      '?token=test_token',
      undefined,
    ]);
  });

  it('on submit verification method should be called when logs in via keyless authenticator', async () => {
    const mockLoginfn = jest.fn();
    props.verifyUsernameAndPassword = mockLoginfn;
    props.auth.provider.mnemonic = 'nokeys';

    (axios.get as jest.Mock).mockImplementation(() =>
      Promise.resolve({
        data: [
          {
            mnemonic: 'nokeys',
            keys: [],
          },
        ],
      })
    );

    const wrapper = mount(
      <StyledEngineProvider injectFirst>
        <ThemeProvider theme={theme}>
          <UnconnectedLoginPage {...props} />
        </ThemeProvider>
      </StyledEngineProvider>
    );

    await act(async () => {
      await flushPromises();
      wrapper.update();
    });

    wrapper.find('button').simulate('click');

    expect(mockLoginfn.mock.calls.length).toEqual(1);

    expect(mockLoginfn.mock.calls[0]).toEqual(['', '', 'nokeys']);

    wrapper
      .find(AnonLoginScreen)
      .find('div')
      .first()
      .simulate('keypress', { key: 'Enter' });

    expect(mockLoginfn.mock.calls.length).toEqual(2);

    expect(mockLoginfn.mock.calls[1]).toEqual(['', '', 'nokeys']);
  });

  it('verifyUsernameAndPassword action should be sent when the verifyUsernameAndPassword function is called', async () => {
    state.scigateway.authorisation.provider.redirectUrl = 'test redirect';
    state.router.location.search = '?token=test_token';
    state.scigateway.authorisation.provider.mnemonic = 'nokeys';

    (axios.get as jest.Mock).mockImplementation(() =>
      Promise.resolve({
        data: [
          {
            mnemonic: 'nokeys',
            keys: [],
          },
        ],
      })
    );

    const testStore = mockStore(state);

    const wrapper = mount(
      <Provider store={testStore}>
        <StyledEngineProvider injectFirst>
          <ThemeProvider theme={theme}>
            <LoginPage />
          </ThemeProvider>
        </StyledEngineProvider>
      </Provider>
    );

    await act(async () => {
      await flushPromises();
      wrapper.update();
    });

    expect(testStore.getActions()[0]).toEqual(loadingAuthentication());
  });

  it('visiting the login page after a failed login attempt resets the auth state', () => {
    state.scigateway.authorisation.failedToLogin = true;
    state.scigateway.authorisation.signedOutDueToTokenInvalidation = false;

    const testStore = mockStore(state);

    mount(
      <Provider store={testStore}>
        <StyledEngineProvider injectFirst>
          <ThemeProvider theme={theme}>
            <LoginPage />
          </ThemeProvider>
        </StyledEngineProvider>
      </Provider>
    );

    expect(testStore.getActions()[0]).toEqual(resetAuthState());
  });
});
