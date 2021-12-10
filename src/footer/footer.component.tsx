import React from 'react';
import {
  createStyles,
  StyleRules,
  Theme,
  withStyles,
  WithStyles,
} from '@material-ui/core/styles';
import { getAppStrings, getString } from '../state/strings';
import { connect } from 'react-redux';
import { StateType } from '../state/state.types';
import { AppStrings } from '../state/scigateway.types';
import { UKRITheme } from '../theming';

const styles = (theme: Theme): StyleRules =>
  createStyles({
    root: {
      position: 'absolute',
      bottom: 0,
      paddingBottom: (theme as UKRITheme).footerPaddingBottom,
      paddingTop: (theme as UKRITheme).footerPaddingTop,
      width: '100%',
      fontSize: 14,
      height: (theme as UKRITheme).footerHeight,
      fontWeight: 'bold',
      textAlign: 'left',
      textIndent: '24px',
      color: (theme as UKRITheme).colours.footerLink.default,
      backgroundColor: theme.palette.primary.main,
      '& a': {
        '&:link': {
          color: (theme as UKRITheme).colours.footerLink.default,
        },
        '&:visited': {
          color: (theme as UKRITheme).colours.footerLink.default,
        },
        '&:active': {
          color: (theme as UKRITheme).colours.footerLink.active,
        },
      },
    },
  });

interface FooterProps {
  res: AppStrings | undefined;
  drawerOpen: boolean;
}

export type CombinedFooterProps = FooterProps & WithStyles<typeof styles>;

const Footer = (props: CombinedFooterProps): React.ReactElement => {
  return (
    <div
      className={props.classes.root}
      dangerouslySetInnerHTML={{
        __html: getString(props.res, 'html'),
      }}
    />
  );
};

const mapStateToProps = (state: StateType): FooterProps => ({
  res: getAppStrings(state, 'footer'),
  drawerOpen: state.scigateway.drawerOpen,
});

export const FooterWithoutStyles = Footer;
export const FooterWithStyles = withStyles(styles)(Footer);

export default connect(mapStateToProps)(FooterWithStyles);
