import React, { useState } from 'react';
import { Dispatch, Action } from 'redux';
import { connect } from 'react-redux';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import HelpIcon from '@mui/icons-material/HelpOutline';
import MenuIcon from '@mui/icons-material/Menu';
import BrightnessIcon from '@mui/icons-material/Brightness4';
import InvertColorsIcon from '@mui/icons-material/InvertColors';
import TuneIcon from '@mui/icons-material/Tune';
import SettingsIcon from '@mui/icons-material/Settings';
import {
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  styled,
} from '@mui/material';
import MenuOpenIcon from '@mui/icons-material/MenuOpen';
import { Theme } from '@mui/material/styles';
import ScigatewayLogo from '../images/scigateway-white-text-blue-mark-logo.svg';
import {
  toggleDrawer,
  toggleHelp,
  loadDarkModePreference,
  loadHighContrastModePreference,
} from '../state/actions/scigateway.actions';
import { adminRoutes, AppStrings } from '../state/scigateway.types';
import { StateType } from '../state/state.types';
import { push } from 'connected-react-router';
import { getAppStrings, getString } from '../state/strings';
import UserProfileComponent from './userProfile.component';
import NotificationBadgeComponent from '../notifications/notificationBadge.component';
import { PluginConfig } from '../state/scigateway.types';
import { useLocation } from 'react-router-dom';

interface MainAppProps {
  drawerOpen: boolean;
  res: AppStrings | undefined;
  showHelpPageButton: boolean;
  showAdminPageButton: boolean;
  singlePluginLogo: boolean;
  loggedIn: boolean;
  darkMode: boolean;
  highContrastMode: boolean;
  plugins?: PluginConfig[];
  loading: boolean;
  logo?: string;
  homepageUrl?: string;
  adminPageDefaultTab?: 'maintenance' | 'download';
  pathname: string;
}

interface MainAppDispatchProps {
  toggleDrawer: () => Action;
  navigateToHome: () => Action;
  navigateToHelpPage: () => Action;
  navigateToAdminPage: (defaultTab: string) => Action;
  toggleHelp: () => Action;
  manageCookies: () => Action;
  toggleDarkMode: (preference: boolean) => Action;
  toggleHighContrastMode: (preference: boolean) => Action;
}

const buttonStyles = {
  margin: 1,
  color: 'primary.contrastText',
};

const menuButtonStyles = {
  marginLeft: '-12px',
  marginRight: 0,
  color: 'primary.contrastText',
};

const TitleButton = styled(Button)(({ theme }) => ({
  padding: '4px',
  margin: 1,
  '& img': {
    // logo maxHeight = mainAppBar height - 2 * padding - 2 * margin
    maxHeight: `calc(${theme.mainAppBarHeight} - 2 * 4px - 2 * ${theme.spacing(
      1
    )}px)`,
  },
}));

type CombinedMainAppBarProps = MainAppProps & MainAppDispatchProps;

export const MainAppBar = (
  props: CombinedMainAppBarProps
): React.ReactElement => {
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const [defaultLogo, setLogo] = useState<string>(ScigatewayLogo);
  const closeMenu = (): void => setMenuAnchor(null);
  const settingsMenuOpen = Boolean(menuAnchor);
  const manageCookies = (): void => {
    closeMenu();
    props.manageCookies();
  };
  const toggleDarkMode = (): void => {
    const toggledPreference = !props.darkMode;
    localStorage.setItem('darkMode', toggledPreference.toString());
    props.toggleDarkMode(toggledPreference);
  };

  const toggleHighContrastMode = (): void => {
    const toggledPreference = !props.highContrastMode;
    localStorage.setItem('highContrastMode', toggledPreference.toString());
    props.toggleHighContrastMode(toggledPreference);
  };

  const location = useLocation();

  const navigateToAdminPage = (): void => {
    props.navigateToAdminPage(
      adminRoutes[props.adminPageDefaultTab ?? 'maintenance']
    );
  };

  React.useEffect(() => {
    if (!props.loading) {
      let set = false;
      if (props.plugins && props.plugins.length >= 1) {
        //Use the first plugin's logo for everything if 'singlePluginLogo' is true, otherwise choose depending on current plugin visible
        if (props.singlePluginLogo) {
          setLogo(props.plugins[0].logoDarkMode ?? ScigatewayLogo);
          set = true;
        } else {
          for (let i = 0; i < props.plugins.length; i++) {
            if (document.getElementById(props.plugins[i].plugin) !== null) {
              setLogo(props.plugins[i].logoDarkMode ?? ScigatewayLogo);
              set = true;
              break;
            }
          }
        }
      }

      if (!set || !props.plugins) {
        setLogo(ScigatewayLogo);
      }
    }
  }, [props.plugins, location, props.loading, props.singlePluginLogo]);

  // have menu open by default after page loads
  React.useEffect(() => {
    if (!props.loading && !props.drawerOpen) {
      props.toggleDrawer();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.loading]);

  return (
    <div style={{ width: '100%' }}>
      <AppBar
        position="static"
        color="transparent"
        sx={(theme: Theme) => ({
          backgroundColor: theme.palette.primary.main,
          height: theme.mainAppBarHeight,
        })}
      >
        <Toolbar
          disableGutters
          sx={{ marginLeft: '16px', marginRight: '16px' }}
        >
          {!props.drawerOpen ? (
            <IconButton
              sx={menuButtonStyles}
              color="inherit"
              onClick={props.toggleDrawer}
              aria-label={getString(props.res, 'open-navigation-menu')}
              size="large"
            >
              <MenuIcon />
            </IconButton>
          ) : (
            <IconButton
              sx={menuButtonStyles}
              color="inherit"
              onClick={props.toggleDrawer}
              aria-label={getString(props.res, 'close-navigation-menu')}
              size="large"
            >
              <MenuOpenIcon />
            </IconButton>
          )}
          <TitleButton
            className="tour-title"
            onClick={props.navigateToHome}
            aria-label={getString(props.res, 'home-page')}
          >
            <img
              src={props.logo ? props.logo : defaultLogo}
              // if using default logo use 24px, if using custom logo then don't set height
              // custom logos must be sized to fit or will default to the max-height set in the top styling
              style={props.logo ? {} : { height: '24px' }}
              alt={getString(props.res, 'title')}
            />
          </TitleButton>
          {props.showHelpPageButton ? (
            <Button
              className={'tour-help'}
              sx={buttonStyles}
              onClick={props.navigateToHelpPage}
              aria-label={getString(props.res, 'help-page')}
            >
              <Typography
                color="inherit"
                noWrap
                sx={{ fontWeight: 500, marginTop: '3px' }}
              >
                {getString(props.res, 'help')}
              </Typography>
            </Button>
          ) : null}
          {props.showAdminPageButton ? (
            <Button
              className={'tour-admin'}
              sx={buttonStyles}
              onClick={navigateToAdminPage}
              aria-label={getString(props.res, 'admin-page')}
            >
              <Typography
                color="inherit"
                noWrap
                sx={{ fontWeight: 500, marginTop: '3px' }}
              >
                {getString(props.res, 'admin')}
              </Typography>
            </Button>
          ) : null}
          <div style={{ flexGrow: 1 }} />
          <IconButton
            sx={buttonStyles}
            onClick={props.toggleHelp}
            aria-label={getString(props.res, 'help')}
            size="large"
          >
            <HelpIcon />
          </IconButton>
          <IconButton
            className={'tour-settings'}
            sx={buttonStyles}
            onClick={(e) => setMenuAnchor(e.currentTarget)}
            aria-label={getString(props.res, 'open-browser-settings')}
            aria-controls={settingsMenuOpen ? 'settings' : undefined}
            aria-haspopup="true"
            aria-expanded={settingsMenuOpen ? 'true' : undefined}
            size="large"
          >
            <SettingsIcon />
          </IconButton>
          <Menu
            id="settings"
            anchorEl={menuAnchor}
            open={settingsMenuOpen}
            onClose={closeMenu}
          >
            <MenuItem id="item-manage-cookies" onClick={manageCookies}>
              <ListItemIcon>
                <TuneIcon />
              </ListItemIcon>
              <ListItemText
                primary={getString(props.res, 'manage-cookies-button')}
              />
            </MenuItem>
            <MenuItem id="item-dark-mode" onClick={toggleDarkMode}>
              <ListItemIcon>
                <BrightnessIcon />
              </ListItemIcon>
              <ListItemText
                primary={
                  props.darkMode
                    ? getString(props.res, 'switch-light-mode')
                    : getString(props.res, 'switch-dark-mode')
                }
              />
            </MenuItem>
            <MenuItem
              id="item-high-contrast-mode"
              onClick={toggleHighContrastMode}
            >
              <ListItemIcon>
                <InvertColorsIcon />
              </ListItemIcon>
              <ListItemText
                primary={
                  props.highContrastMode
                    ? getString(props.res, 'switch-high-contrast-off')
                    : getString(props.res, 'switch-high-contrast-on')
                }
              />
            </MenuItem>
          </Menu>
          {props.loggedIn && <NotificationBadgeComponent />}
          <UserProfileComponent />
        </Toolbar>
      </AppBar>
    </div>
  );
};

const mapStateToProps = (state: StateType): MainAppProps => ({
  drawerOpen: state.scigateway.drawerOpen,
  showHelpPageButton: state.scigateway.features.showHelpPageButton,
  singlePluginLogo: state.scigateway.features.singlePluginLogo,
  loggedIn: state.scigateway.authorisation.provider.isLoggedIn(),
  showAdminPageButton:
    state.scigateway.authorisation.provider.isLoggedIn() &&
    state.scigateway.authorisation.provider.isAdmin(),
  res: getAppStrings(state, 'main-appbar'),
  darkMode: state.scigateway.darkMode,
  highContrastMode: state.scigateway.highContrastMode,
  plugins: state.scigateway.plugins,
  loading: state.scigateway.siteLoading,
  logo: state.scigateway.logo,
  homepageUrl: state.scigateway.homepageUrl,
  adminPageDefaultTab: state.scigateway.adminPageDefaultTab,
  pathname: state.router.location.pathname,
});

const mapDispatchToProps = (dispatch: Dispatch): MainAppDispatchProps => ({
  toggleDrawer: () => dispatch(toggleDrawer()),
  navigateToHome: () => dispatch(push('/')),
  navigateToHelpPage: () => dispatch(push('/help')),
  navigateToAdminPage: (defaultTab: string) => dispatch(push(defaultTab)),
  toggleHelp: () => dispatch(toggleHelp()),
  manageCookies: () => dispatch(push('/cookies')),
  toggleDarkMode: (preference: boolean) =>
    dispatch(loadDarkModePreference(preference)),
  toggleHighContrastMode: (preference: boolean) =>
    dispatch(loadHighContrastModePreference(preference)),
});

export default connect(mapStateToProps, mapDispatchToProps)(MainAppBar);
