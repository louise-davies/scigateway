import React, { useState } from 'react';
import { connect } from 'react-redux';
import IconButton from '@material-ui/core/IconButton';
import NotificationsIcon from '@material-ui/icons/Notifications';
import {
  Theme,
  WithStyles,
  withStyles,
  Badge,
  Menu,
  createStyles,
  makeStyles,
  Typography,
} from '@material-ui/core';
import { StyleRules } from '@material-ui/core/styles';
import { StateType, ScigatewayNotification } from '../state/state.types';
import { Dispatch, Action } from 'redux';
import { dismissMenuItem } from '../state/actions/scigateway.actions';
import { NotificationWithStyles } from './scigatewayNotification.component';
import DeleteIcon from '@material-ui/icons/Clear';

interface BadgeProps {
  notifications: ScigatewayNotification[];
}

interface BadgeDispatchProps {
  deleteMenuItem: (index: number) => Action;
}

const styles = (theme: Theme): StyleRules =>
  createStyles({
    button: {
      color: theme.palette.primary.contrastText,
    },
    menuItem: {
      display: 'flex',
    },
    message: {
      flexGrow: 1,
    },
  });

export type CombinedNotificationBadgeProps = BadgeProps &
  BadgeDispatchProps &
  WithStyles<typeof styles>;

function buildMenuItems(
  notifications: ScigatewayNotification[],
  dismissNotificationAction: (index: number) => Action
): JSX.Element[] {
  const menuItems = notifications.map((notification, index) => (
    <NotificationWithStyles
      dismissNotification={() => {
        return dismissNotificationAction(index);
      }}
      message={notification.message}
      severity={notification.severity}
      index={index}
      key={index}
    />
  ));
  return menuItems;
}

const useNoNotificationsStyles = makeStyles(
  (theme: Theme): StyleRules =>
    createStyles({
      root: {
        display: 'flex',
        alignItems: 'center',
      },
      text: {
        display: 'inline',
        marginLeft: 15,
      },
      button: {
        marginLeft: 5,
      },
      deleteIcon: {
        height: 15,
        width: 15,
      },
    })
);

const NoNotificationsMessage = React.forwardRef(
  (props: { onClose: () => void }): React.ReactElement => {
    const classes = useNoNotificationsStyles();
    return (
      <div>
        <Typography variant="body2" className={classes.text}>
          {'No Notifications'}
        </Typography>
        <IconButton
          className={classes.button}
          onClick={props.onClose}
          aria-label="Dismiss notification"
        >
          <DeleteIcon className={classes.deleteIcon} />
        </IconButton>
      </div>
    );
  }
);
NoNotificationsMessage.displayName = 'NoNotificationsMessage';

const NotificationBadge = (
  props: CombinedNotificationBadgeProps
): React.ReactElement => {
  const [getMenuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const [displayNoNotifications, setDisplayNoNotifications] = useState(false);
  const closeMenu = (): void => {
    setMenuAnchor(null);
    setDisplayNoNotifications(false);
  };
  // Ensure menu is closed if no notifications, or all notifications are deleted and not displaying 'no notifications'
  if (
    !displayNoNotifications &&
    getMenuAnchor !== null &&
    props.notifications.length === 0
  ) {
    closeMenu();
  }
  return (
    <div className="tour-notifications">
      <IconButton
        className={props.classes.button}
        onClick={(e) => {
          if (!props.notifications || props.notifications.length === 0)
            setDisplayNoNotifications(true);
          setMenuAnchor(e.currentTarget);
        }}
        aria-label="Open notification menu"
      >
        <Badge
          badgeContent={
            props.notifications.length > 0 ? props.notifications.length : null
          }
          color="primary"
        >
          <NotificationsIcon />
        </Badge>
      </IconButton>
      {props.notifications && props.notifications.length ? (
        <Menu
          id="notifications-menu"
          anchorEl={getMenuAnchor}
          open={getMenuAnchor !== null}
          onClose={closeMenu}
        >
          {buildMenuItems(props.notifications, props.deleteMenuItem)}
        </Menu>
      ) : null}
      {displayNoNotifications ? (
        <Menu
          id="notifications-menu"
          anchorEl={getMenuAnchor}
          open={getMenuAnchor !== null}
          onClose={closeMenu}
        >
          <NoNotificationsMessage
            onClose={() => setDisplayNoNotifications(false)}
          ></NoNotificationsMessage>
        </Menu>
      ) : null}
    </div>
  );
};

export const NotificationBadgeWithoutStyles = NotificationBadge;
export const NotificationBadgeWithStyles = withStyles(styles)(
  NotificationBadge
);

const mapStateToProps = (state: StateType): BadgeProps => ({
  notifications: state.scigateway.notifications,
});

const mapDispatchToProps = (dispatch: Dispatch): BadgeDispatchProps => ({
  deleteMenuItem: (index: number) => {
    return dispatch(dismissMenuItem(index));
  },
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(NotificationBadgeWithStyles);
