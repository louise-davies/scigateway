import React from 'react';
import {
  Theme,
  withStyles,
  IconButton,
  WithStyles,
  Typography,
} from '@material-ui/core';
import { StyleRules } from '@material-ui/core/styles';
import DeleteIcon from '@material-ui/icons/Clear';
import TickIcon from '@material-ui/icons/CheckCircle';
import WarningIcon from '@material-ui/icons/ErrorOutline';
import ErrorIcon from '@material-ui/icons/HighlightOff';
import { Action } from 'redux';
import { UKRITheme } from '../theming';

const severityIconStyle = {
  marginLeft: 5,
  marginRight: 5,
  height: 20,
  width: 20,
};

const styles = (theme: Theme): StyleRules => ({
  root: {
    display: 'flex',
    alignItems: 'center',
  },
  button: {
    marginLeft: 5,
  },
  deleteIcon: {
    height: 15,
    width: 15,
  },
  successIcon: {
    ...severityIconStyle,
    color: 'green',
  },
  warningIcon: {
    ...severityIconStyle,
    color: (theme as UKRITheme).colours.lightOrange,
  },
  errorIcon: {
    ...severityIconStyle,
    color: 'red',
  },
});

interface NotificationProps {
  message: string;
  severity: string;
  index: number;
}

interface NotificationDispatchProps {
  dismissNotification: () => Action;
}

export type CombinedNotificationProps = NotificationProps &
  NotificationDispatchProps &
  WithStyles<typeof styles>;

const ForwardRefScigatewayNotification = React.forwardRef(
  function ScigatewayNotification(
    props: CombinedNotificationProps,
    ref: React.Ref<HTMLDivElement>
  ): React.ReactElement {
    return (
      <div ref={ref} className={props.classes.root}>
        {props.severity === 'success' ? (
          <TickIcon className={props.classes.successIcon} />
        ) : null}
        {props.severity === 'warning' ? (
          <WarningIcon className={props.classes.warningIcon} />
        ) : null}
        {props.severity === 'error' ? (
          <ErrorIcon className={props.classes.errorIcon} />
        ) : null}
        <Typography variant="body2">{props.message}</Typography>
        <IconButton
          className={props.classes.button}
          onClick={props.dismissNotification}
          aria-label="Dismiss notification"
        >
          <DeleteIcon className={props.classes.deleteIcon} />
        </IconButton>
      </div>
    );
  }
);

export const NotificationWithoutStyles = ForwardRefScigatewayNotification;
export const NotificationWithStyles = withStyles(styles)(
  ForwardRefScigatewayNotification
);
