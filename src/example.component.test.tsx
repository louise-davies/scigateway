import React from 'react';
import ExampleComponent from './example.component';
import { createShallow } from '@mui/material/test-utils';
import configureStore from 'redux-mock-store';
import { authState, initialState } from './state/reducers/scigateway.reducer';
import { StateType } from './state/state.types';

describe('Example component', () => {
  let shallow;
  let mockStore;
  let state: StateType;

  beforeEach(() => {
    shallow = createShallow({ untilSelector: 'div' });

    mockStore = configureStore();
    state = {
      scigateway: { ...initialState, authorisation: { ...authState } },
    };
  });

  it('renders correctly', () => {
    // update the notification
    state.scigateway.notifications = ['test notification'];

    const wrapper = shallow(<ExampleComponent store={mockStore(state)} />);
    expect(wrapper).toMatchSnapshot();
  });
});
