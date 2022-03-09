import React from 'react';
import NotificationBadge, {
  UnconnectedNotificationBadge,
  CombinedNotificationBadgeProps,
} from './notificationBadge.component';
import Badge from '@mui/material/Badge';
import { ThemeProvider, StyledEngineProvider } from '@mui/material/styles';
import { buildTheme } from '../theming';
import configureStore from 'redux-mock-store';
import { authState, initialState } from '../state/reducers/scigateway.reducer';
import { dismissMenuItem } from '../state/actions/scigateway.actions';
import { Provider } from 'react-redux';
import { StateType } from '../state/state.types';
import { mount, shallow } from 'enzyme';

describe('Notification Badge component', () => {
  const theme = buildTheme(false);

  let mockStore;
  let state: StateType;
  let props: CombinedNotificationBadgeProps;

  beforeEach(() => {
    mockStore = configureStore();

    state = {
      scigateway: { ...initialState, authorisation: { ...authState } },
    };
    props = {
      notifications: [{ message: 'my message', severity: 'warning' }],
      deleteMenuItem: jest.fn(),
    };
  });

  it('Notification badge renders correctly', () => {
    const wrapper = shallow(<UnconnectedNotificationBadge {...props} />);

    expect(wrapper).toMatchSnapshot();
  });

  it('renders correct number of notifications in the badge', () => {
    let wrapper = shallow(
      <UnconnectedNotificationBadge
        {...props}
        notifications={[
          ...props.notifications,
          { message: 'my other message', severity: 'success' },
        ]}
      />
    );

    expect(wrapper.find(Badge).prop('badgeContent')).toEqual(2);

    wrapper = shallow(
      <UnconnectedNotificationBadge
        {...props}
        notifications={[]}
        deleteMenuItem={props.deleteMenuItem}
      />
    );

    expect(wrapper.find(Badge).prop('badgeContent')).toBeNull();
  });

  it('sends dismissMenuItem action when dismissNotification prop is called', () => {
    state.scigateway.notifications = props.notifications;
    const testStore = mockStore(state);

    const wrapper = mount(
      <Provider store={testStore}>
        <StyledEngineProvider injectFirst>
          <ThemeProvider theme={theme}>
            <NotificationBadge />
          </ThemeProvider>
        </StyledEngineProvider>
      </Provider>
    );

    wrapper
      .find('[aria-label="Open notification menu"]')
      .last()
      .simulate('click');
    wrapper.update();

    wrapper
      .find('[aria-label="Dismiss notification"]')
      .last()
      .simulate('click');

    expect(testStore.getActions().length).toEqual(1);
    expect(testStore.getActions()[0]).toEqual(dismissMenuItem(0));
  });

  it('opens menu when button clicked and closes menu when there are no more notifications', () => {
    state.scigateway.notifications = props.notifications;

    let testStore = mockStore(state);

    const wrapper = mount(
      <Provider store={testStore}>
        <StyledEngineProvider injectFirst>
          <ThemeProvider theme={theme}>
            <NotificationBadge />
          </ThemeProvider>
        </StyledEngineProvider>
      </Provider>
    );

    wrapper
      .find('[aria-label="Open notification menu"]')
      .last()
      .simulate('click');

    expect(wrapper.find('#notifications-menu').exists()).toBeTruthy();

    state.scigateway.notifications = [];
    testStore = mockStore(state);
    wrapper.setProps({ store: testStore });

    expect(wrapper.find('#notifications-menu').exists()).toBeFalsy();
  });

  it('opens menu with no notifications message when button clicked and there are no notifications', () => {
    state.scigateway.notifications = [];

    const testStore = mockStore(state);

    const wrapper = mount(
      <Provider store={testStore}>
        <StyledEngineProvider injectFirst>
          <ThemeProvider theme={theme}>
            <NotificationBadge />
          </ThemeProvider>
        </StyledEngineProvider>
      </Provider>
    );

    wrapper
      .find('[aria-label="Open notification menu"]')
      .last()
      .simulate('click');

    expect(wrapper.find('#notifications-menu').exists()).toBeTruthy();
    expect(
      wrapper.find('[aria-label="No notifications message"]').exists()
    ).toBeTruthy();
  });

  it('no notifications message disappears when a notification occurs', () => {
    state.scigateway.notifications = [];

    let testStore = mockStore(state);

    const wrapper = mount(
      <Provider store={testStore}>
        <StyledEngineProvider injectFirst>
          <ThemeProvider theme={theme}>
            <NotificationBadge />
          </ThemeProvider>
        </StyledEngineProvider>
      </Provider>
    );

    wrapper
      .find('[aria-label="Open notification menu"]')
      .last()
      .simulate('click');

    expect(wrapper.find('#notifications-menu').exists()).toBeTruthy();
    expect(
      wrapper.find('[aria-label="No notifications message"]').exists()
    ).toBeTruthy();

    state.scigateway.notifications = props.notifications;
    testStore = mockStore(state);
    wrapper.setProps({ store: testStore });

    expect(wrapper.find('#notifications-menu').exists()).toBeTruthy();
    expect(
      wrapper.find('[aria-label="No notifications message"]').exists()
    ).toBeFalsy();
  });

  it('no notifications message can be closed', () => {
    state.scigateway.notifications = [];
    const testStore = mockStore(state);

    const wrapper = mount(
      <Provider store={testStore}>
        <StyledEngineProvider injectFirst>
          <ThemeProvider theme={theme}>
            <NotificationBadge />
          </ThemeProvider>
        </StyledEngineProvider>
      </Provider>
    );

    //Check can close using close button
    wrapper
      .find('[aria-label="Open notification menu"]')
      .last()
      .simulate('click');

    expect(wrapper.find('#notifications-menu').exists()).toBeTruthy();
    expect(
      wrapper.find('[aria-label="No notifications message"]').exists()
    ).toBeTruthy();

    wrapper
      .find('[aria-label="Dismiss notification"]')
      .last()
      .simulate('click');

    expect(wrapper.find('#notifications-menu').exists()).toBeFalsy();
    expect(
      wrapper.find('[aria-label="No notifications message"]').exists()
    ).toBeFalsy();
  });
});
