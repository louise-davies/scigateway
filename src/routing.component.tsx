import * as React from 'react';
import {
  withStyles,
  createStyles,
  Theme,
  StyleRules,
  WithStyles,
} from '@material-ui/core/styles';
import { Route, Switch } from 'react-router';
import { StateType, AuthState } from './state/state.types';
import { PluginConfig } from './state/daaas.types';
import { connect } from 'react-redux';
import HomePage from './homePage/homePage.component';
import LoginPage from './loginPage/loginPage.component';
import PageNotFound from './pageNotFound/pageNotFound.component';
import classNames from 'classnames';

const drawerWidth = 240;
const styles = (theme: Theme): StyleRules =>
  createStyles({
    container: {
      transition: theme.transitions.create(['margin', 'width'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      }),
    },
    containerShift: {
      width: `calc(100% - ${drawerWidth}px)`,
      marginLeft: drawerWidth,
      transition: theme.transitions.create(['margin', 'width'], {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
    },
  });

interface RoutingProps {
  plugins: PluginConfig[];
  location: string;
  drawerOpen: boolean;
  authorisation: AuthState;
}

class Routing extends React.Component<
  RoutingProps & WithStyles<typeof styles>
> {
  public render(): React.ReactNode {
    const { plugins, authorisation } = this.props;
    const authorised = authorisation.loggedIn;
    return (
      // If a user is authorised, redirect to the URL they attempted to navigate to e.g. "/plugin"
      // Otherwise render the login component. Successful logins will continue to the requested
      // route, otherwise they will continue to be prompted to log in.
      // "/" is always accessible
      <div
        className={classNames(this.props.classes.container, {
          [this.props.classes.containerShift]: this.props.drawerOpen,
        })}
      >
        <Switch>
          <Route exact path="/" component={HomePage} />
          {authorised &&
            plugins.map(p => {
              console.log(`Adding Route: ${p.link} ${p.displayName}`);
              return (
                <Route
                  key={`${p.section}_${p.link}`}
                  path={p.link}
                  render={() => <div id={p.plugin}>{p.displayName}</div>}
                />
              );
            })}
          <Route component={authorised ? PageNotFound : LoginPage} />
        </Switch>
      </div>
    );
  }
}

export const RoutingWithStyles = withStyles(styles)(Routing);

const mapStateToProps = (state: StateType): RoutingProps => ({
  plugins: state.daaas.plugins,
  location: state.router.location.pathname,
  drawerOpen: state.daaas.drawerOpen,
  authorisation: state.daaas.authorisation,
});

export default connect(mapStateToProps)(RoutingWithStyles);
