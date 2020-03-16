import React from 'react';

import Dialog from '@material-ui/core/Dialog';
import MuiDialogTitle from '@material-ui/core/DialogTitle';
import MuiDialogContent from '@material-ui/core/DialogContent';
import MuiDialogActions from '@material-ui/core/DialogActions';

import {
  Typography,
  IconButton,
  Button,
  TextField,
  Grid,
  Select,
  FormControl,
  InputLabel,
  MenuItem,
  FormHelperText,
  CircularProgress,
} from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import Mark from './mark.component';

import { formatBytes } from 'datagateway-common';
import {
  submitCart,
  getDownload,
  downloadPreparedCart,
  getDownloadTypeStatus,
} from '../downloadCart/downloadCartApi';

import {
  Theme,
  createStyles,
  withStyles,
  WithStyles,
  StyleRules,
} from '@material-ui/core/styles';

const dialogTitleStyles = (theme: Theme): StyleRules =>
  createStyles({
    root: {
      margin: 0,
      padding: theme.spacing(2),
    },
    closeButton: {
      position: 'absolute',
      right: theme.spacing(1),
      top: theme.spacing(1),
      color: theme.palette.grey[500],
    },
  });

const dialogContentStyles = (): StyleRules =>
  createStyles({
    tableContent: {
      '& table': {
        borderCollapse: 'collapse',
        width: '100%',
      },
      '& th': {
        border: '1px solid #dddddd',
      },
      '& td': {
        border: '1px solid #dddddd',
        textAlign: 'center',
      },
    },
  });

interface DialogTitleProps extends WithStyles<typeof dialogTitleStyles> {
  id: string;
  onClose: () => void;
  children?: React.ReactNode;
}

const DialogTitle = withStyles(dialogTitleStyles)((props: DialogTitleProps) => {
  const { classes, children, onClose, ...other } = props;

  return (
    <MuiDialogTitle disableTypography className={classes.root} {...other}>
      <Typography variant="h6">{children}</Typography>
      {onClose && (
        <IconButton
          aria-label="download-confirmation-close"
          className={classes.closeButton}
          onClick={onClose}
        >
          <CloseIcon />
        </IconButton>
      )}
    </MuiDialogTitle>
  );
});

const DialogContent = withStyles((theme: Theme) => ({
  root: {
    padding: theme.spacing(2),
  },
}))(MuiDialogContent);

const DialogActions = withStyles((theme: Theme) => ({
  root: {
    margin: 0,
    padding: theme.spacing(1),
  },
}))(MuiDialogActions);

interface DownloadConfirmDialogProps
  extends WithStyles<typeof dialogContentStyles> {
  totalSize: number;
  isTwoLevel: boolean;
  open: boolean;

  // TODO: pass in the function to call to redirect to the status tab.
  // setStatus: () => void;
  setClose: () => void;
  clearCart: () => void;
}

interface DownloadConfirmAccessMethod {
  [type: string]: { disabled: boolean | undefined; message: string };
}

const DownloadConfirmDialog: React.FC<DownloadConfirmDialogProps> = (
  props: DownloadConfirmDialogProps
) => {
  const { classes, setClose, clearCart } = props;

  // TODO: Temporary facilityName until we load it from settings.
  // TODO: Access methods should be configurable and not defined in the component.
  const facilityName = 'LILS';

  // TODO: Temporary access methods definition until the settings can be merged in.
  const [requestStatus, setRequestStatus] = React.useState(false);
  const [loadedStatus, setLoadedStatus] = React.useState(false);
  const [accessMethods, setAccessMethods] = React.useState<
    DownloadConfirmAccessMethod
  >({
    https: {
      disabled: true,
      message: '',
    },
    globus: {
      disabled: true,
      message: '',
    },
  });

  // Sorting and loading status.
  const [sortedMethods, setSortedMethods] = React.useState<
    [string, { disabled: boolean | undefined; message: string }][]
  >([]);
  const [isSorted, setIsSorted] = React.useState(false);
  const [methodsUnavailable, setMethodsUnavailable] = React.useState(false);
  const [showDialog, setShowDialog] = React.useState(false);

  const { totalSize } = props;
  const { isTwoLevel } = props;

  // Download speed/time table.
  const [showDownloadTime, setShowDownloadTime] = React.useState(true);
  const [timeAtOne, setTimeAtOne] = React.useState(-1);
  const [timeAtThirty, setTimeAtThirty] = React.useState(-1);
  const [timeAtHundred, setTimeAtHundred] = React.useState(-1);

  // Submit values.
  const [downloadName, setDownloadName] = React.useState('');
  const [selectedMethod, setSelectedMethod] = React.useState('');
  const [emailAddress, setEmailAddress] = React.useState('');

  // Email validation.
  const emailHelpText = 'Send me download status messages via email.';
  const emailErrorText = 'Please ensure the email you have entered is valid.';
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  const [emailValid, setEmailValid] = React.useState(true);
  const [emailHelperText, setEmailHelperText] = React.useState(emailHelpText);

  // Download button.
  const [isSubmitted, setIsSubmitted] = React.useState(false);
  const [isSubmitSuccessful, setIsSubmitSuccessful] = React.useState(false);

  // Hide the confirmation dialog and clear the download cart
  // when the dialog is closed.
  const dialogClose = (): void => {
    setClose();
    if (isSubmitSuccessful) clearCart();
  };

  // Broadcast a SciGateway notification for any error encountered.
  const broadcastError = (errorMessage: string): void => {
    document.dispatchEvent(
      new CustomEvent('scigateway', {
        detail: {
          type: 'scigateway:api:notification',
          payload: {
            severity: 'error',
            message: errorMessage,
          },
        },
      })
    );
  };

  // Sort access methods into a sorted array used for
  // rendering the select dropdown list.
  const sortMethods = React.useCallback(() => {
    const sorted = Object.entries(accessMethods).sort(
      ([, methodInfoA], [, methodInfoB]) => {
        let res =
          (methodInfoA.disabled !== undefined
            ? methodInfoA.disabled === false
              ? -1
              : 0
            : 1) -
          (methodInfoB.disabled !== undefined
            ? methodInfoB.disabled === false
              ? -1
              : 0
            : 1);
        return res;
      }
    );

    // Set the sorted, selected access method
    // and set it to have been sorted.
    setSortedMethods(sorted);
    setSelectedMethod(sorted[0][0]);
    setIsSorted(true);
  }, [accessMethods, setSortedMethods, setSelectedMethod, setIsSorted]);

  React.useEffect(() => {
    async function getStatus(): Promise<void> {
      let statusErrors: string[] = [];
      Promise.all(
        Object.entries(accessMethods).map(([method]) =>
          getDownloadTypeStatus(method, 'LILS')
        )
      ).then(methodStatus => {
        // Loop through all the current access methods and match that
        // to the status information we received for each.
        Object.entries(accessMethods).forEach(([method], index) => {
          const status = methodStatus[index];
          if (status) {
            setAccessMethods(prevState => {
              return {
                ...prevState,
                [method]: {
                  disabled: status.disabled,
                  message: status.message,
                },
              };
            });
          } else {
            setAccessMethods(prevState => {
              return {
                ...prevState,
                [method]: { disabled: undefined, message: '' },
              };
            });

            // Push the method type to display an error.
            statusErrors.push(method);
          }
        });

        // Broadcast errors depending on the result of the status requests.
        if (statusErrors.length < Object.keys(accessMethods).length) {
          for (const method of statusErrors) {
            broadcastError(
              `Access method ${method.toUpperCase()} is currently unavailable. If required, use an alternative method.`
            );
          }
        } else {
          setMethodsUnavailable(true);
          broadcastError(
            'Download access methods are unavailable. Please try again later.'
          );
        }

        // Set the status information to have been loaded.
        setLoadedStatus(true);
      });
    }

    if (props.open) {
      if (!requestStatus) {
        // Get the status of all the available access methods.
        getStatus();
        setRequestStatus(true);
      } else {
        if (loadedStatus && !isSorted) {
          sortMethods();
          setShowDialog(true);
        }
      }

      // Reset checkmark view.
      setIsSubmitted(false);
      setIsSubmitSuccessful(false);

      // Reset all fields for next time dialog is opened.
      setDownloadName('');
      setEmailAddress('');

      if (!isTwoLevel) {
        // Calculate the download times as storage is not two-level;
        // varied for 1 Mbps, 30 Mbps and 100 Mbps.
        setTimeAtOne(totalSize / (1024 * 1024) / (1 / 8));
        setTimeAtThirty(totalSize / (1024 * 1024) / (30 / 8));
        setTimeAtHundred(totalSize / (1024 * 1024) / (100 / 8));
      } else {
        // If storage on IDS server is two-level,
        // then do not show the download speed/time table.
        setShowDownloadTime(false);
      }
    }
  }, [
    props.open,
    accessMethods,
    isTwoLevel,
    totalSize,
    requestStatus,
    loadedStatus,
    sortMethods,
    isSorted,
    showDialog,
  ]);

  const getDefaultFileName = (): string => {
    const now = new Date();
    let defaultName = `${facilityName}_${now.getFullYear()}-${now.getMonth() +
      1}-${now.getDate()}_${now.getHours()}-${now.getMinutes()}-${now.getSeconds()}`;

    return defaultName;
  };

  const secondsToDHMS = (seconds: number): string => {
    const d = Math.floor(seconds / (3600 * 24));
    const h = Math.floor((seconds % (3600 * 24)) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);

    const dDisplay =
      d > 0
        ? d + (d === 1 ? ' day' : ' days') + (h + m + s > 0 ? ', ' : '')
        : '';
    const hDisplay =
      h > 0 ? h + (h === 1 ? ' hour' : ' hours') + (m + s > 0 ? ', ' : '') : '';
    const mDisplay = m > 0 ? m + (s > 0 ? ' min, ' : ' min') : '';
    const sDisplay = s > 0 ? s + ' sec' : '';

    return dDisplay + hDisplay + mDisplay + sDisplay || '< 1 second';
  };

  const processDownload = async (): Promise<void> => {
    // Check for file name, if there hasn't been one entered,
    // then generate a default one and update state for rendering later.
    let fileName = downloadName;
    if (!fileName) {
      fileName = getDefaultFileName();
      setDownloadName(fileName);
    }

    const downloadId = await submitCart(
      facilityName,
      selectedMethod,
      emailAddress,
      fileName
    );

    // Ensure that we have received a downloadId.
    if (downloadId && downloadId !== -1) {
      // If we are using HTTPS then start the download using
      // the download ID we received.
      if (selectedMethod.match(/https|http/)) {
        const downloadInfo = await getDownload(facilityName, downloadId);

        // Download the file as long as it is available for immediate download.
        if (downloadInfo != null && downloadInfo.status === 'COMPLETE')
          downloadPreparedCart(downloadInfo.preparedId, downloadInfo.fileName);
      }

      setIsSubmitSuccessful(true);
    }

    // Enable submitted view.
    setIsSubmitted(true);
  };

  return (
    <Dialog
      onClose={dialogClose}
      open={props.open}
      fullWidth={true}
      maxWidth={'sm'}
      aria-label="download-confirm-dialog"
    >
      {!isSubmitted ? (
        !showDialog ? (
          <DialogContent>
            <div style={{ textAlign: 'center', padding: '25px' }}>
              <CircularProgress />
              <Typography style={{ paddingTop: '10px' }}>
                Loading Confirmation...
              </Typography>
            </div>
          </DialogContent>
        ) : (
          <div>
            {/* Custom title component which has a close button */}
            <DialogTitle
              id="download-confirm-dialog-title"
              onClose={dialogClose}
            >
              Confirm Your Download
            </DialogTitle>

            {/* The download confirmation form  */}
            <DialogContent>
              <Grid container spacing={2}>
                {/* Set the download name text field */}
                <Grid item xs={12}>
                  <TextField
                    id="confirm-download-name"
                    label="Download Name (optional)"
                    placeholder={`${getDefaultFileName()}`}
                    fullWidth={true}
                    inputProps={{
                      maxLength: 255,
                    }}
                    onChange={e => {
                      setDownloadName(e.target.value as string);
                    }}
                    helperText="Enter a custom file name or leave as the default format (facility_date_time)."
                  />
                </Grid>

                {/* Select the access method */}
                <Grid item xs={12}>
                  <FormControl
                    style={{ minWidth: 120 }}
                    error={
                      accessMethods[selectedMethod].disabled ||
                      methodsUnavailable
                    }
                  >
                    <InputLabel id="confirm-access-method-label">
                      Access Method
                    </InputLabel>
                    <Select
                      labelId="confirm-access-method"
                      id="confirm-access-method"
                      aria-label="confirm-access-method"
                      defaultValue={`${
                        methodsUnavailable ? '' : selectedMethod
                      }`}
                      onChange={e => {
                        if (!methodsUnavailable)
                          // Material UI select is not a real select element, so needs casting.

                          setSelectedMethod(e.target.value as string);
                      }}
                    >
                      {/* TODO: Values need to be retrieved from an object from settings. */}
                      {sortedMethods.map(([type, methodInfo], index) => (
                        <MenuItem
                          key={index}
                          id={`confirm-access-method-${type}`}
                          value={type}
                          disabled={methodInfo.disabled === undefined}
                        >
                          {type.toUpperCase()}
                        </MenuItem>
                      ))}
                    </Select>

                    <FormHelperText id="confirm-access-method-help">
                      {(() => {
                        const method = accessMethods[selectedMethod];
                        if (methodsUnavailable) {
                          return 'Access methods currently unavailable.';
                        } else if (method.disabled) {
                          if (method.message) {
                            return method.message;
                          } else {
                            return 'This access method is currently disabled.';
                          }
                        } else {
                          return 'Select an access method for download.';
                        }
                      })()}
                    </FormHelperText>

                    {/* Provide some information on the selected access method. */}
                    <Typography style={{ paddingTop: '20px' }}>
                      <b>Access Method Information:</b>
                    </Typography>

                    {/* Depending on the type of access method that has been selected,
                  show specific access information. */}
                    {(() => {
                      let accessMethodInfo;
                      if (selectedMethod.match(/https|http/))
                        accessMethodInfo =
                          'HTTPS is the default access method.';
                      else if (selectedMethod === 'globus')
                        accessMethodInfo = 'Globus is a special access method.';

                      return (
                        <Typography id="confirm-access-method-information">
                          {accessMethodInfo}
                        </Typography>
                      );
                    })()}
                  </FormControl>
                </Grid>

                {/* Get the size of the download  */}
                <Grid item xs={12}>
                  <Typography aria-label="confirm-download-size">
                    <b>Download size:</b> {formatBytes(totalSize)}
                  </Typography>
                </Grid>

                {/* Show the estimated download times */}
                {showDownloadTime && (
                  <Grid item xs={12}>
                    <Typography>Estimated download times:</Typography>
                    <div
                      style={{ paddingTop: '10px' }}
                      className={classes.tableContent}
                    >
                      <table aria-label="download-table">
                        <tbody>
                          <tr>
                            <th>1 Mbps</th>
                            <th>30 Mbps</th>
                            <th>100 Mbps</th>
                          </tr>
                          <tr>
                            <td aria-label="download-table-one">
                              {secondsToDHMS(timeAtOne)}
                            </td>
                            <td aria-label="download-table-thirty">
                              {secondsToDHMS(timeAtThirty)}
                            </td>
                            <td aria-label="download-table-hundred">
                              {secondsToDHMS(timeAtHundred)}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </Grid>
                )}

                {/* Set email address text field */}
                <Grid item xs={12}>
                  <TextField
                    id="confirm-download-email"
                    label="Email Address (optional)"
                    fullWidth={true}
                    helperText={emailHelperText}
                    error={!emailValid}
                    inputProps={{
                      maxLength: 254,
                    }}
                    onChange={e => {
                      // Remove whitespaces and allow for the email to be optional.
                      const email = (e.target.value as string).trim();
                      if (email) {
                        if (emailRegex.test(email)) {
                          // Material UI select is not a real select element, so needs casting.
                          setEmailAddress(email);

                          if (emailHelperText !== emailHelpText)
                            setEmailHelperText(emailHelpText);
                          setEmailValid(true);
                        } else {
                          if (emailHelperText !== emailErrorText)
                            setEmailHelperText(emailErrorText);
                          setEmailValid(false);
                        }
                      } else {
                        // Allow for the red highlighted error to toggle off,
                        // if there is no longer an email entered in the text field.
                        setEmailAddress('');
                        setEmailHelperText(emailHelpText);
                        setEmailValid(true);
                      }
                    }}
                  />
                </Grid>
              </Grid>
            </DialogContent>

            <DialogActions>
              <Button
                id="download-confirmation-download"
                disabled={
                  !emailValid ||
                  accessMethods[selectedMethod].disabled ||
                  methodsUnavailable
                }
                onClick={processDownload}
                color="primary"
                variant="contained"
              >
                Download
              </Button>
            </DialogActions>
          </div>
        )
      ) : (
        <div>
          <DialogTitle
            id="download-confirm-dialog-title"
            onClose={dialogClose}
          />

          <DialogContent>
            <Grid
              container
              spacing={4}
              direction="column"
              alignItems="center"
              justify="center"
              style={{ paddingBottom: '25px' }}
            >
              <Grid item xs>
                {/* TODO: When closing the animation renders again? 
                Maybe set a fixed width for the dialog and not render it? */}
                {isSubmitSuccessful ? (
                  <Mark size={100} colour="#3E863E" visible={props.open} />
                ) : (
                  <Mark
                    size={100}
                    colour="#A91B2E"
                    isCross={true}
                    visible={props.open}
                  />
                )}
              </Grid>

              {isSubmitSuccessful ? (
                <Grid item xs>
                  <Typography id="download-confirmation-success">
                    Successfully submitted download request
                  </Typography>
                </Grid>
              ) : (
                <div
                  id="download-confirmation-unsuccessful"
                  style={{ textAlign: 'center' }}
                >
                  <Typography>
                    <b>Your download request was unsuccessful</b>
                  </Typography>
                  <Typography>
                    (No download information was received)
                  </Typography>
                </div>
              )}

              {/* Grid to show submitted download information */}
              {isSubmitSuccessful && (
                <Grid item xs>
                  <div style={{ textAlign: 'center', margin: '0 auto' }}>
                    <div style={{ float: 'left', textAlign: 'right' }}>
                      <Typography>
                        <b>Download Name: </b>
                      </Typography>
                      <Typography>
                        <b>Access Method: </b>
                      </Typography>
                      {emailAddress && (
                        <Typography>
                          <b>Email Address: </b>
                        </Typography>
                      )}
                    </div>
                    <div
                      style={{
                        float: 'right',
                        textAlign: 'left',
                        paddingLeft: '25px',
                      }}
                    >
                      <Typography id="confirm-success-download-name">
                        {downloadName}
                      </Typography>
                      <Typography id="confirm-success-access-method">
                        {selectedMethod.toUpperCase()}
                      </Typography>
                      {emailAddress && (
                        <Typography id="confirm-success-email-address">
                          {emailAddress}
                        </Typography>
                      )}
                    </div>
                  </div>
                </Grid>
              )}

              {isSubmitSuccessful && (
                <Grid item xs>
                  {/* TODO: Button needs to call a function that has been passed in
                        which allow for the tab to be changed to the status page. */}
                  <Button
                    id="download-confirmation-status-link"
                    variant="outlined"
                    color="primary"
                    href="/"
                  >
                    View My Downloads
                  </Button>
                </Grid>
              )}
            </Grid>
          </DialogContent>
        </div>
      )}
    </Dialog>
  );
};

// TODO: Pass in facilityName as prop to DownloadConfirmDialog to get customisable download name.
export default withStyles(dialogContentStyles)(DownloadConfirmDialog);
