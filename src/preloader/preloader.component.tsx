import React from 'react';
import { StateType } from '../state/state.types';
import { connect } from 'react-redux';
import {
  createStyles,
  StyleRules,
  Theme,
  withStyles,
  WithStyles,
} from '@material-ui/core/styles';

const colors = ['#8C4799', '#1D4F91', '#C34613', '#008275', '#63666A'];
const innerRadius = 140;
const border = 8;
const spacing = 1;

const styles = (theme: Theme): StyleRules =>
  createStyles({
    spinner: {
      position: 'relative',
      display: 'block',
      margin: 'auto',
      width: innerRadius + colors.length * 2 * (border + spacing),
      height: innerRadius + colors.length * 2 * (border + spacing),
      animation: 'rotate 10s infinite linear',
    },
    wrapper: {
      boxSizing: 'border-box',
      padding: '10px 0',
    },
    container: {
      zIndex: 1000,
      position: 'fixed',
      width: '100%',
      height: '100%',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: theme.palette.background.default,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
    },
    text: {
      color: theme.palette.text.primary,
    },
  });

interface PreloaderProps {
  loading: boolean;
}

interface SpinnerStyle {
  [id: string]: string | number;
}
const spinnerStyle = (index: number): SpinnerStyle => {
  const size = innerRadius + index * 2 * (border + spacing);

  return {
    position: 'absolute',
    display: 'inline-block',
    top: '50%',
    left: '50%',
    border: `solid ${border}px transparent`,
    borderBottom: 'none',
    borderTopLeftRadius: innerRadius + index * border,
    borderTopRightRadius: innerRadius + index * border,
    borderColor: colors[index % colors.length],
    height: size / 2,
    width: size,
    marginTop: -size / 2,
    marginLeft: -size / 2,
    animationName: 'rotate',
    animationIterationCount: 'infinite',
    animationDuration: '3s',
    animationTimingFunction: `cubic-bezier(.09, ${0.3 * index}, ${
      0.12 * index
    }, .03)`,
    transformOrigin: '50% 100% 0',
    boxSizing: 'border-box',
  };
};

const Preloader = (
  props: PreloaderProps & WithStyles<typeof styles>
): React.ReactElement => (
  <div>
    {props.loading ? (
      <div className={props.classes.container}>
        <div className={props.classes.wrapper}>
          <div className={props.classes.spinner}>
            <i style={spinnerStyle(0)} />
            <i style={spinnerStyle(1)} />
            <i style={spinnerStyle(2)} />
            <i style={spinnerStyle(3)} />
            <i style={spinnerStyle(4)} />
          </div>
        </div>
        <div className={props.classes.text}>Loading...</div>
      </div>
    ) : null}
  </div>
);

export const PreloaderWithStyles = withStyles(styles)(Preloader);

const mapStateToProps = (state: StateType): PreloaderProps => ({
  loading: state.scigateway.siteLoading,
});

export default connect(mapStateToProps)(PreloaderWithStyles);
