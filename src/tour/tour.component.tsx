import React from 'react';
import Joyride, {
  Step,
  CallBackProps,
  STATUS,
  ACTIONS,
  EVENTS,
} from 'react-joyride';
import { Theme, withTheme } from '@material-ui/core/styles';
import { UKRITheme } from '../theming';
import { StateType } from '../state/state.types';
import { connect } from 'react-redux';
import { toggleHelp, toggleDrawer } from '../state/actions/daaas.actions';
import { Dispatch, Action } from 'redux';

interface TourProps {
  showHelp: boolean;
  helpSteps: Step[];
  drawerOpen: boolean;
  loggedIn: boolean;
}

interface TourState {
  stepIndex: number;
}

interface TourDispatchProps {
  dismissHelp: () => Action;
  toggleDrawer: () => Action;
}

type CombinedTourProps = TourProps & TourDispatchProps & { theme: Theme };

class Tour extends React.Component<CombinedTourProps, TourState> {
  public constructor(props: CombinedTourProps) {
    super(props);

    this.state = {
      stepIndex: 0,
    };

    this.handleJoyrideCallback = this.handleJoyrideCallback.bind(this);
  }

  private handleJoyrideCallback = (
    data: CallBackProps,
    indexMenuOpen: number,
    waitTime: number
  ): void => {
    const { status, action, index, type } = data;
    const { toggleDrawer, drawerOpen, dismissHelp } = this.props;

    if (action === ACTIONS.START && type === EVENTS.STEP_BEFORE && drawerOpen) {
      toggleDrawer();
      this.setState({ stepIndex: 0 });
    } else if (
      index === indexMenuOpen - 1 &&
      action === ACTIONS.NEXT &&
      type === EVENTS.STEP_AFTER &&
      !drawerOpen
    ) {
      toggleDrawer();
      setTimeout(() => {
        this.setState({ stepIndex: index + 1 });
      }, waitTime);
    } else if (
      index === indexMenuOpen &&
      action === ACTIONS.PREV &&
      type === EVENTS.STEP_AFTER &&
      drawerOpen
    ) {
      toggleDrawer();
      setTimeout(() => {
        this.setState({ stepIndex: index - 1 });
      }, waitTime);
    } else if (
      status === STATUS.FINISHED ||
      (type === EVENTS.STEP_AFTER && action === ACTIONS.CLOSE)
    ) {
      this.setState({ stepIndex: 0 });
      dismissHelp();
    } else if (type === EVENTS.STEP_AFTER || type === EVENTS.TARGET_NOT_FOUND) {
      this.setState({ stepIndex: index + (action === ACTIONS.PREV ? -1 : 1) });
    }
  };

  public render(): React.ReactElement {
    const { helpSteps, loggedIn, showHelp, theme } = this.props;

    const steps = helpSteps
      .map(step => ({ ...step, disableBeacon: true }))
      .filter(
        step => !step.target.toString().includes('plugin-link') || loggedIn
      );

    const indexPluginLinks = steps.findIndex(step =>
      step.target.toString().includes('plugin-link')
    );

    return (
      <Joyride
        steps={steps}
        stepIndex={this.state.stepIndex}
        run={showHelp}
        continuous={true}
        callback={(data: CallBackProps) =>
          this.handleJoyrideCallback(
            data,
            indexPluginLinks,
            theme.transitions.duration.enteringScreen + 200
          )
        }
        styles={{
          options: {
            primaryColor: (theme as UKRITheme).ukri.orange,
            zIndex: 1500,
          },
        }}
      />
    );
  }
}

const mapStateToProps = (state: StateType): TourProps => ({
  showHelp: state.daaas.showHelp,
  helpSteps: state.daaas.helpSteps,
  drawerOpen: state.daaas.drawerOpen,
  loggedIn: state.daaas.authorisation.provider.isLoggedIn(),
});

const mapDispatchToProps = (dispatch: Dispatch): TourDispatchProps => ({
  dismissHelp: () => dispatch(toggleHelp()),
  toggleDrawer: () => dispatch(toggleDrawer()),
});

export const TourWithStyles = withTheme()(Tour);

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(TourWithStyles);