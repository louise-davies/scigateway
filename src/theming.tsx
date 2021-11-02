import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';
import { ThemeOptions, Theme } from '@material-ui/core/styles/createMuiTheme';
import 'react-redux-toastr/lib/css/react-redux-toastr.min.css';
import React from 'react';
import { StateType } from './state/state.types';
import { connect, useSelector } from 'react-redux';

export interface UKRIThemeOptions extends ThemeOptions {
  ukri: {
    bright: {
      orange: string;
      yellow: string;
      green: string;
      blue: string;
      purple: string;
      red: string;
    };
    deep: {
      orange: string;
      yellow: string;
      green: string;
      blue: string;
      purple: string;
      red: string;
    };
  };
  drawerWidth: number;
  link: {
    default: string;
    visited: string;
    active: string;
  };
}

export interface UKRITheme extends Theme {
  ukri: {
    bright: {
      orange: string;
      yellow: string;
      green: string;
      blue: string;
      purple: string;
      red: string;
    };
    deep: {
      orange: string;
      yellow: string;
      green: string;
      blue: string;
      purple: string;
      red: string;
    };
  };
  drawerWidth: number;
  link: {
    default: string;
    visited: string;
    active: string;
  };
}

export const buildTheme = (darkModePreference: boolean): Theme => {
  let options: UKRIThemeOptions;
  if (darkModePreference) {
    options = {
      palette: {
        // Light/dark mode
        type: 'dark',
        primary: {
          main: '#003088',
        },
        secondary: {
          main: '#80ACFF',
        },
        background: {
          default: '#1B1B1B',
          paper: '#3A3A3A',
        },
      },
      ukri: {
        bright: {
          orange: '#FF6900', // pure orange
          yellow: '#FBBB10', // yellow
          green: '#67C04D', // light green
          blue: '#1E5DF8', // blue
          purple: '#BE2BBB', // bright purple
          red: '#E94D36', // light red
        },
        deep: {
          orange: '#C13D33', // pure orange
          yellow: '#F08900', // vivid yellow
          green: '#3E863E', // green
          blue: '#003088', // blue
          purple: '#8A1A9B', // bright purple
          red: '#A91B2E', // red
        },
      },
      drawerWidth: 300,
      link: {
        default: '#257fff',
        visited: '#BE2BBB',
        active: '#E94D36',
      },
      overrides: {
        MuiLink: {
          root: {
            color: '#86b4ff',
          },
        },
        MuiTabs: {
          indicator: {
            color: '#80ACFF',
            textDecoration: 'underline',
          },
        },
        MuiBadge: {
          colorPrimary: {
            backgroundColor: '#FF6900',
          },
        },
      },
    };
  } else {
    options = {
      palette: {
        // Light/dark mode
        type: 'light',
        primary: {
          main: '#003088', // blue (deep palette)
        },
        secondary: {
          main: '#003088',
        },
      },
      ukri: {
        bright: {
          orange: '#FF6900', // pure orange
          yellow: '#FBBB10', // yellow
          green: '#67C04D', // light green
          blue: '#1E5DF8', // blue
          purple: '#BE2BBB', // bright purple
          red: '#E94D36', // light red
        },
        deep: {
          orange: '#C13D33', // pure orange
          yellow: '#F08900', // vivid yellow
          green: '#3E863E', // green
          blue: '#003088', // blue
          purple: '#8A1A9B', // bright purple
          red: '#A91B2E', // red
        },
      },
      drawerWidth: 300,
      link: {
        default: '#1E5DF8',
        visited: '#BE2BBB',
        active: '#E94D36',
      },
      overrides: {
        MuiBadge: {
          colorPrimary: {
            backgroundColor: '#FF6900',
          },
        },
      },
    };
  }

  return createMuiTheme(options);
};

function mapThemeProviderStateToProps(
  state: StateType
): { prefersDarkMode: boolean } {
  return {
    prefersDarkMode: state.scigateway.darkMode,
  };
}

const SciGatewayThemeProvider = (props: {
  children: React.ReactNode;
}): React.ReactElement<{
  children: React.ReactNode;
}> => {
  const darkModePreference: boolean = useSelector(
    (state: StateType) => state.scigateway.darkMode
  );
  return (
    <MuiThemeProvider theme={buildTheme(darkModePreference)}>
      {props.children}
    </MuiThemeProvider>
  );
};

export const ConnectedThemeProvider = connect(mapThemeProviderStateToProps)(
  SciGatewayThemeProvider
);
