import React from 'react';
import { Theme } from '@mui/material/styles';
import { WithStyles, StyleRules } from '@mui/styles';
import withStyles from '@mui/styles/withStyles';
import Preloader from './preloader/preloader.component';
import MainAppBar from './mainAppBar/mainAppBar.component';
import NavigationDrawer from './navigationDrawer/navigationDrawer.component';
import Routing from './routing/routing.component';
//import Tour from './tour/tour.component';
import CookieConsent from './cookieConsent/cookieConsent.component';
import Footer from './footer/footer.component';

const styles = (theme: Theme): StyleRules => ({
  root: {
    position: 'relative',
    background: theme.palette.background.default,
    minHeight: '100vh',
  },
});

const PageContainer = (
  props: WithStyles<typeof styles>
): React.ReactElement => {
  return (
    <div className={props.classes.root}>
      <Preloader fullScreen={true} />
      <MainAppBar />
      <NavigationDrawer />
      {/* <Tour /> */}
      <CookieConsent />
      <Routing />
      <Footer />
    </div>
  );
};

export default withStyles(styles)(PageContainer);
