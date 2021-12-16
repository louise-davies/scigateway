import React, { useState } from 'react';
import { connect } from 'react-redux';
import { AnyAction } from 'redux';
import { ThunkDispatch } from 'redux-thunk';
import Avatar from '@material-ui/core/Avatar';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';
import CircularProgress from '@material-ui/core/CircularProgress';
import Typography from '@material-ui/core/Typography';
import {
  withStyles,
  Theme,
  StyleRules,
  createStyles,
  WithStyles,
  makeStyles,
} from '@material-ui/core/styles';
import { verifyUsernameAndPassword } from '../state/actions/scigateway.actions';
import { AppStrings, NotificationType } from '../state/scigateway.types';
import { StateType, AuthState, ICATAuthenticator } from '../state/state.types';
import { UKRITheme } from '../theming';
import { getAppStrings, getString } from '../state/strings';
import { Location } from 'history';
import {
  Select,
  FormControl,
  InputLabel,
  MenuItem,
  Link,
} from '@material-ui/core';
import axios from 'axios';
import log from 'loglevel';
import { Trans, useTranslation } from 'react-i18next';

const styles = (theme: Theme): StyleRules =>
  createStyles({
    root: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      width: 'auto',
      marginLeft: theme.spacing(3),
      marginRight: theme.spacing(3),
    },
    avatar: {
      margin: theme.spacing(1),
      backgroundColor: (theme as UKRITheme).colours.lightBlue,
      alignItems: 'center',
    },
    paper: {
      marginTop: theme.spacing(8),
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      paddingTop: '24px',
      width: 400,
    },
    textField: {
      marginTop: theme.spacing(1),
      width: '352px',
    },
    formControl: {
      margin: theme.spacing(1),
      minWidth: 200,
    },
    button: {
      marginTop: `${theme.spacing(1)}px`,
      width: '352px',
    },
    warning: {
      marginTop: `${theme.spacing(1)}px`,
      color: (theme as UKRITheme).colours.red,
    },
    info: {
      marginTop: `${theme.spacing(1)}px`,
      color: theme.palette.secondary.main,
    },
    spinner: {
      marginTop: 15,
    },
    forgotPasswordText: {
      fontSize: 14,
      marginLeft: 'auto',
      paddingBottom: '24px',
      paddingTop: '12px',
    },
    registerMessage: {
      fontSize: 14,
      paddingBottom: '24px',
      paddingTop: '12px',
    },
    helpMessage: {
      fontSize: 14,
      paddingBottom: '12px',
      paddingTop: '24px',
    },
    orText: { display: 'flex', fontSize: 14 },
  });

const useDividerStyles = makeStyles((theme: Theme) =>
  createStyles({
    container: {
      display: 'flex',
      alignItems: 'center',
      width: '100%',
    },
    border: {
      borderBottom: '2px solid',
      color: (theme as UKRITheme).colours.contrastGrey,
      width: '100%',
    },
    content: {
      // paddingTop: theme.spacing(0.5),
      // paddingBottom: theme.spacing(0.5),
      paddingRight: theme.spacing(2),
      paddingLeft: theme.spacing(2),
      fontSize: 14,
      color: (theme as UKRITheme).colours.contrastGrey,
    },
  })
);

const DividerWithText = (props: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  children: React.ReactElement<any, any>;
}): React.ReactElement => {
  const classes = useDividerStyles();
  return (
    <div className={classes.container}>
      <div className={classes.border} />
      <span className={classes.content}>{props.children}</span>
      <div className={classes.border} />
    </div>
  );
};

interface LoginPageProps {
  auth: AuthState;
  res?: AppStrings;
  location: Location;
}

interface LoginPageDispatchProps {
  verifyUsernameAndPassword: (
    username: string,
    password: string,
    mnemonic?: string,
    authUrl?: string
  ) => Promise<void>;
}

export type CombinedLoginProps = LoginPageProps &
  LoginPageDispatchProps &
  WithStyles<typeof styles>;

export const RedirectLoginScreen = (
  props: CombinedLoginProps
): React.ReactElement => (
  <div className={props.classes.root}>
    {props.auth.failedToLogin ? (
      <Typography className={props.classes.warning}>
        {getString(props.res, 'login-redirect-error-msg')}
      </Typography>
    ) : null}
    <Button
      variant="contained"
      color="primary"
      className={props.classes.button}
      disabled={props.auth.loading}
      onClick={() => {
        if (props.auth.provider.redirectUrl) {
          window.location.href = props.auth.provider.redirectUrl;
        }
      }}
    >
      <Typography color="inherit" noWrap style={{ marginTop: 3 }}>
        Login with Github
      </Typography>
    </Button>
  </div>
);

export const CredentialsLoginScreen = (
  props: CombinedLoginProps & {
    mnemonic?: string;
    authUrl?: string;
  }
): React.ReactElement => {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  const isInputValid = (): boolean => username !== '' && password !== '';

  const [t] = useTranslation();

  return (
    <div
      className={props.classes.root}
      onKeyPress={(e) => {
        if (
          !props.auth.provider.redirectUrl &&
          e.key === 'Enter' &&
          isInputValid()
        ) {
          props.verifyUsernameAndPassword(
            username,
            password,
            props.mnemonic,
            props.authUrl
          );
        }
      }}
    >
      {props.auth.failedToLogin ? (
        <Typography className={props.classes.warning}>
          {t('login.login-error-msg')}
        </Typography>
      ) : null}
      {props.auth.signedOutDueToTokenInvalidation ? (
        <Typography className={props.classes.info}>
          {t('login.token-invalid-msg')}
        </Typography>
      ) : null}
      <TextField
        className={props.classes.textField}
        label={t('login.username-placeholder')}
        value={username}
        onChange={(e) => setUsername(e.currentTarget.value)}
        inputProps={{ 'aria-label': t('login.username-arialabel') }}
        disabled={props.auth.loading}
        color="secondary"
      />
      <TextField
        className={props.classes.textField}
        label={t('login.password-placeholder')}
        value={password}
        onChange={(e) => setPassword(e.currentTarget.value)}
        type="password"
        inputProps={{ 'aria-label': t('login.password-arialabel') }}
        disabled={props.auth.loading}
        color="secondary"
      />
      <Typography className={props.classes.forgotPasswordText}>
        <Trans i18nKey="login.forgotten-your-password">
          <Link href={t('login.forgotten-your-password-link')}>
            Forgotten your Password?
          </Link>
        </Trans>
      </Typography>
      <Button
        variant="contained"
        color="primary"
        className={props.classes.button}
        disabled={!isInputValid() || props.auth.loading}
        onClick={() => {
          props.verifyUsernameAndPassword(
            username,
            password,
            props.mnemonic,
            props.authUrl
          );
        }}
      >
        <Typography color="inherit" noWrap style={{ marginTop: 3 }}>
          {t('login.login-button')}
        </Typography>
      </Button>
      <Typography className={props.classes.helpMessage}>
        <Trans i18nKey="login.need-help-signing-in">
          <Link href={t('login.need-help-signing-in-link')}>
            Need help signing in?
          </Link>
        </Trans>
      </Typography>
      <DividerWithText>
        <Typography>0r</Typography>
      </DividerWithText>
      <Typography className={props.classes.registerMessage}>
        <Trans i18nKey="login.dont-have-an-account-sign-up-now">
          Don&#39;t have an account?{' '}
          <Link href={t('login.dont-have-an-account-sign-up-now-link')}>
            Sign up now
          </Link>
        </Trans>
      </Typography>
    </div>
  );
};

export const AnonLoginScreen = (
  props: CombinedLoginProps & {
    mnemonic?: string;
    authUrl?: string;
  }
): React.ReactElement => (
  <div
    className={props.classes.root}
    onKeyPress={(e) => {
      if (e.key === 'Enter') {
        props.verifyUsernameAndPassword('', '', props.mnemonic, props.authUrl);
      }
    }}
  >
    {props.auth.failedToLogin ? (
      <Typography className={props.classes.warning}>
        {getString(props.res, 'login-error-msg')}
      </Typography>
    ) : null}
    {props.auth.signedOutDueToTokenInvalidation ? (
      <Typography className={props.classes.info}>
        {getString(props.res, 'token-invalid-msg')}
      </Typography>
    ) : null}
    <Button
      variant="contained"
      color="primary"
      className={props.classes.button}
      onClick={() => {
        props.verifyUsernameAndPassword('', '', props.mnemonic, props.authUrl);
      }}
    >
      <Typography color="inherit" noWrap style={{ marginTop: 3 }}>
        {getString(props.res, 'login-button')}
      </Typography>
    </Button>
  </div>
);

export const LoginSelector = (
  props: CombinedLoginProps & {
    mnemonics: ICATAuthenticator[];
    mnemonic?: string;
    setMnemonic: (mnemonic: string) => void;
  }
): React.ReactElement => {
  return (
    <FormControl style={{ minWidth: 120 }}>
      <InputLabel htmlFor="mnemonic-select" color="secondary">
        Authenticator
      </InputLabel>
      <Select
        className={props.classes.textField}
        id="select-mnemonic"
        labelId="mnemonic-select"
        value={props.mnemonic}
        onChange={(e) => {
          props.setMnemonic(e.target.value as string);
        }}
        color="secondary"
      >
        {props.mnemonics.map((authenticator) => (
          <MenuItem key={authenticator.mnemonic} value={authenticator.mnemonic}>
            {authenticator.friendly || authenticator.mnemonic}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

function fetchMnemonics(authUrl?: string): Promise<ICATAuthenticator[]> {
  return axios
    .get(`${authUrl}/authenticators`)
    .then((res) => {
      return res.data;
    })
    .catch((err) => {
      log.error('Failed to fetch authenticator information from ICAT');
      document.dispatchEvent(
        new CustomEvent('scigateway', {
          detail: {
            type: NotificationType,
            payload: {
              message: 'Failed to fetch authenticator information from ICAT',
              severity: 'error',
            },
          },
        })
      );
      return [];
    });
}

const LoginPageComponent = (props: CombinedLoginProps): React.ReactElement => {
  const authUrl = props.auth.provider.authUrl;
  const [mnemonics, setMnemonics] = useState<ICATAuthenticator[]>([]);
  const [fetchedMnemonics, setFetchedMnemonics] = useState<boolean>(false);
  const [mnemonic, setMnemonic] = useState<string | undefined>(
    props.auth.provider.mnemonic
  );

  React.useEffect(() => {
    if (typeof mnemonic !== 'undefined' && !fetchedMnemonics) {
      fetchMnemonics(authUrl).then((mnemonics) => {
        const nonAdminAuthenticators = mnemonics.filter(
          (authenticator) => !authenticator.admin
        );
        setMnemonics(nonAdminAuthenticators);
        setFetchedMnemonics(true);
        if (nonAdminAuthenticators.length === 1)
          setMnemonic(nonAdminAuthenticators[0].mnemonic);
      });
    }
  }, [mnemonic, fetchedMnemonics, authUrl]);

  React.useEffect(() => {
    if (
      typeof props.auth.provider.mnemonic !== 'undefined' &&
      props.auth.provider.mnemonic !== ''
    ) {
      setMnemonic(props.auth.provider.mnemonic);
    }
  }, [props.auth.provider.mnemonic]);

  React.useEffect(() => {
    if (
      props.auth.provider.redirectUrl &&
      props.location.search &&
      !props.auth.loading &&
      !props.auth.failedToLogin
    ) {
      if (props.location.search) {
        props.verifyUsernameAndPassword(
          '',
          props.location.search,
          mnemonic,
          authUrl
        );
      }
    }
  });

  let LoginScreen: React.ReactElement | null = null;

  if (typeof mnemonic === 'undefined') {
    LoginScreen = (
      <CredentialsLoginScreen
        {...props}
        mnemonic={mnemonic}
        authUrl={authUrl}
      />
    );
    if (props.auth.provider.redirectUrl) {
      LoginScreen = <RedirectLoginScreen {...props} />;
    }
  } else {
    if (
      mnemonics.find(
        (authenticator) =>
          authenticator.mnemonic === mnemonic && authenticator.keys.length === 0
      )
    ) {
      // anon
      LoginScreen = (
        <AnonLoginScreen {...props} mnemonic={mnemonic} authUrl={authUrl} />
      );
    } else if (
      mnemonics.find(
        (authenticator) =>
          authenticator.mnemonic === mnemonic &&
          authenticator.keys.find((x) => x.name === 'username') &&
          authenticator.keys.find((x) => x.name === 'password')
      )
    ) {
      // user/pass
      LoginScreen = (
        <CredentialsLoginScreen
          {...props}
          mnemonic={mnemonic}
          authUrl={authUrl}
        />
      );
    } else if (
      mnemonics.find(
        (authenticator) =>
          authenticator.mnemonic === mnemonic &&
          authenticator.keys.find((x) => x.name === 'token')
      )
    ) {
      // redirect
      LoginScreen = <RedirectLoginScreen {...props} />;
    } else {
      // unrecognised authenticator type
    }
  }

  return (
    <div className={props.classes.root}>
      <Paper className={props.classes.paper}>
        <Avatar className={props.classes.avatar}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          {getString(props.res, 'title')}
        </Typography>
        {mnemonics.length > 1 && (
          <LoginSelector
            {...props}
            mnemonics={mnemonics}
            mnemonic={mnemonic}
            setMnemonic={setMnemonic}
          />
        )}
        {LoginScreen}
        {props.auth.loading ? (
          <CircularProgress className={props.classes.spinner} />
        ) : null}
      </Paper>
    </div>
  );
};

const mapStateToProps = (state: StateType): LoginPageProps => ({
  auth: state.scigateway.authorisation,
  res: getAppStrings(state, 'login'),
  location: state.router.location,
});

const mapDispatchToProps = (
  dispatch: ThunkDispatch<StateType, null, AnyAction>
): LoginPageDispatchProps => ({
  verifyUsernameAndPassword: (
    username: string,
    password: string,
    mnemonic?: string,
    authUrl?: string
  ) =>
    dispatch(
      verifyUsernameAndPassword(
        username.trim(),
        password,
        mnemonic !== undefined ? mnemonic : '',
        authUrl !== undefined ? authUrl : ''
      )
    ),
});

export const LoginPageWithoutStyles = LoginPageComponent;
export const LoginPageWithStyles = withStyles(styles)(LoginPageComponent);

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(LoginPageWithStyles);
