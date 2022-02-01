import React from 'react';
import { createShallow, createMount } from '@mui/material/test-utils';
import {
  NotificationWithoutStyles,
  NotificationWithStyles,
} from './scigatewayNotification.component';
import { Action } from 'redux';
import { buildTheme } from '../theming';
import { ThemeProvider, StyledEngineProvider } from '@mui/material/styles';

const theme = buildTheme(false);

function createScigatewayNotification(
  severity: string,
  message: string
): React.ReactElement {
  const props = {
    classes: {
      root: 'root-class',
      successIcon: 'successIcon-class',
      warningIcon: 'warningIcon-class',
      errorIcon: 'errorIcon-class',
      button: 'button-class',
      deleteIcon: 'deleteIcon-class',
    },
  };

  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={theme}>
        <NotificationWithoutStyles
          message={message}
          severity={severity}
          index={0}
          dismissNotification={(): Action => ({ type: 'test' })}
          {...props}
        />
      </ThemeProvider>
    </StyledEngineProvider>
  );
}

describe('Scigateway Notification component', () => {
  let shallow;
  let mount;

  beforeEach(() => {
    shallow = createShallow({ untilSelector: 'div' });
    mount = createMount();
  });

  afterEach(() => {
    mount.cleanUp();
  });

  it('Scigateway Notification success message renders correctly', () => {
    const wrapper = shallow(
      createScigatewayNotification('success', 'success message')
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('Scigateway Notification warning message renders correctly', () => {
    const wrapper = shallow(
      createScigatewayNotification('warning', 'warning message')
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('Scigateway Notification error message renders correctly', () => {
    const wrapper = shallow(
      createScigatewayNotification('error', 'error message')
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('an action is fired when Scigateway Notification button is clicked', () => {
    const mockDismissFn = jest.fn();

    const wrapper = mount(
      <StyledEngineProvider injectFirst>
        <ThemeProvider theme={theme}>
          <NotificationWithStyles
            message={'warning message'}
            severity={'warning'}
            index={0}
            dismissNotification={mockDismissFn}
          />
        </ThemeProvider>
      </StyledEngineProvider>
    );

    wrapper.find('button').simulate('click');

    expect(mockDismissFn.mock.calls.length).toEqual(1);
  });
});
