import React from 'react';
import withAuth from './authorisedRoute.component';
import { createShallow } from '@material-ui/core/test-utils';
import configureStore from 'redux-mock-store';
import { StateType } from '../state/state.types';
import { authState, initialState } from '../state/reducers/scigateway.reducer';
import { createLocation } from 'history';
import TestAuthProvider from '../authentication/testAuthProvider';
import LoadingAuthProvider from '../authentication/loadingAuthProvider';
import {
  invalidToken,
  requestPluginRerender,
} from '../state/actions/scigateway.actions';
import { flushPromises } from '../setupTests';

describe('AuthorisedRoute component', () => {
  let shallow;
  let mockStore;
  let state: StateType;
  const ComponentToProtect = (): React.ReactElement => (
    <div>protected component</div>
  );

  beforeEach(() => {
    shallow = createShallow({ untilSelector: 'div' });

    state = {
      scigateway: { ...initialState, authorisation: { ...authState } },
      router: {
        action: 'POP',
        location: createLocation('/'),
      },
    };

    mockStore = configureStore();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders non admin component when admin user accesses it', () => {
    state.scigateway.siteLoading = false;
    state.scigateway.authorisation.loading = false;
    state.scigateway.authorisation.provider = new TestAuthProvider(
      'test-token'
    );

    const AuthorisedComponent = withAuth(false)(ComponentToProtect);
    const wrapper = shallow(<AuthorisedComponent store={mockStore(state)} />);

    expect(wrapper).toMatchSnapshot();
  });

  it('renders non admin component when non admin user accesses it', () => {
    const testAuthProvider = new TestAuthProvider('test-token');
    testAuthProvider.isAdmin = jest.fn().mockImplementationOnce(() => false);
    state.scigateway.authorisation.provider = testAuthProvider;
    state.scigateway.siteLoading = false;
    state.scigateway.authorisation.loading = false;

    const AuthorisedComponent = withAuth(false)(ComponentToProtect);
    const wrapper = shallow(<AuthorisedComponent store={mockStore(state)} />);

    expect(wrapper).toMatchSnapshot();
  });

  it('renders admin component when admin user accesses it', () => {
    state.scigateway.siteLoading = false;
    state.scigateway.authorisation.loading = false;
    state.scigateway.authorisation.provider = new TestAuthProvider(
      'test-token'
    );

    const AuthorisedComponent = withAuth(true)(ComponentToProtect);
    const wrapper = shallow(<AuthorisedComponent store={mockStore(state)} />);

    expect(wrapper).toMatchSnapshot();
  });

  it('renders PageNotFound component when non admin user accesses admin component', () => {
    const testAuthProvider = new TestAuthProvider('test-token');
    testAuthProvider.isAdmin = jest.fn().mockImplementationOnce(() => false);
    state.scigateway.authorisation.provider = testAuthProvider;
    state.scigateway.siteLoading = false;
    state.scigateway.authorisation.loading = false;

    const AuthorisedComponent = withAuth(true)(ComponentToProtect);
    const wrapper = shallow(<AuthorisedComponent store={mockStore(state)} />);

    expect(wrapper).toMatchSnapshot();
  });

  it('renders homepage component when homepageUrl is configured', () => {
    state.scigateway.siteLoading = false;
    state.scigateway.authorisation.provider = new TestAuthProvider(null);
    state.scigateway.homepageUrl = '/homepage';
    state.router.location.pathname = '/homepage';

    const HomepageComponent = (): React.ReactElement => (
      <div>homepage component</div>
    );

    const AuthorisedComponent = withAuth(false)(HomepageComponent);
    const wrapper = shallow(<AuthorisedComponent store={mockStore(state)} />);

    expect(wrapper).toMatchSnapshot();
  });

  it('renders redirect when user not logged in', () => {
    state.scigateway.siteLoading = false;
    state.scigateway.authorisation.loading = false;
    state.scigateway.authorisation.provider = new TestAuthProvider(null);

    const AuthorisedComponent = withAuth(false)(ComponentToProtect);
    const wrapper = shallow(<AuthorisedComponent store={mockStore(state)} />);

    expect(wrapper).toMatchSnapshot();
  });

  it('renders PageNotFound component when site is loading due to LoadingAuthProvider', () => {
    state.scigateway.siteLoading = false;
    state.scigateway.authorisation.loading = false;
    state.scigateway.authorisation.provider = new LoadingAuthProvider();

    const AuthorisedComponent = withAuth(false)(ComponentToProtect);
    const wrapper = shallow(<AuthorisedComponent store={mockStore(state)} />);

    expect(wrapper).toMatchSnapshot();
  });

  it('renders PageNotFound component when site is loading due to loading prop', () => {
    state.scigateway.siteLoading = false;
    state.scigateway.authorisation.loading = true;

    const AuthorisedComponent = withAuth(false)(ComponentToProtect);
    const wrapper = shallow(<AuthorisedComponent store={mockStore(state)} />);

    expect(wrapper).toMatchSnapshot();
  });

  it('renders PageNotFound component when site is loading due to siteLoading prop', () => {
    state.scigateway.siteLoading = true;

    const AuthorisedComponent = withAuth(false)(ComponentToProtect);
    const wrapper = shallow(<AuthorisedComponent store={mockStore(state)} />);

    expect(wrapper).toMatchSnapshot();
  });

  it('dispatches requestPluginRerender action when loading or logged in state changes', () => {
    state.scigateway.authorisation.loading = false;
    state.scigateway.authorisation.provider = new TestAuthProvider(
      'test-token'
    );

    const testStore = mockStore(state);

    const AuthorisedComponent = withAuth(false)(ComponentToProtect);
    const wrapper = shallow(<AuthorisedComponent store={testStore} />);

    wrapper.setProps({ loading: false });
    expect(testStore.getActions().length).toEqual(1);
    expect(testStore.getActions()[0]).toEqual(requestPluginRerender());

    testStore.clearActions();
    wrapper.setProps({ loggedIn: false });
    wrapper.setProps({ loggedIn: true });

    expect(testStore.getActions().length).toEqual(1);
    expect(testStore.getActions()[0]).toEqual(requestPluginRerender());
  });

  it('dispatches invalidToken when token fails verification', async () => {
    const testAuthProvider = new TestAuthProvider('token');

    state.scigateway.siteLoading = false;
    state.scigateway.authorisation.loading = false;
    state.scigateway.authorisation.provider = testAuthProvider;

    const testStore = mockStore(state);
    const AuthorisedComponent = withAuth(false)(ComponentToProtect);
    shallow(<AuthorisedComponent store={testStore} />);

    await flushPromises();

    expect(testStore.getActions().length).toEqual(1);
    expect(testStore.getActions()[0]).toEqual(invalidToken());
  });

  it('sets referrer in localStorage if not logged in', () => {
    window.localStorage.__proto__.setItem = jest.fn();
    state.scigateway.siteLoading = false;
    state.scigateway.authorisation.loading = false;
    state.scigateway.authorisation.provider = new TestAuthProvider(null);
    state.router.location.pathname = '/destination/after/login';

    const testStore = mockStore(state);
    const AuthorisedComponent = withAuth(false)(ComponentToProtect);
    shallow(<AuthorisedComponent store={testStore} />);

    expect(localStorage.setItem).toHaveBeenCalledWith(
      'referrer',
      '/destination/after/login'
    );
  });

  it('does not set referrer in localStorage if logged in', () => {
    window.localStorage.__proto__.setItem = jest.fn();
    state.scigateway.authorisation.provider = new TestAuthProvider(
      'test-token'
    );
    state.router.location.pathname = '/destination/after/login';

    const testStore = mockStore(state);
    const AuthorisedComponent = withAuth(false)(ComponentToProtect);
    shallow(<AuthorisedComponent store={testStore} />);

    expect(localStorage.setItem).not.toHaveBeenCalled();
  });

  it('does not set referrer in localStorage if referrer is homepage', () => {
    window.localStorage.__proto__.setItem = jest.fn();
    state.scigateway.authorisation.provider = new TestAuthProvider(null);
    state.scigateway.homepageUrl = '/homepage';
    state.router.location.pathname = '/homepage';

    const testStore = mockStore(state);
    const AuthorisedComponent = withAuth(false)(ComponentToProtect);
    shallow(<AuthorisedComponent store={testStore} />);

    expect(localStorage.setItem).not.toHaveBeenCalled();
  });
});
