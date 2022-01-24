import React from 'react';
import Typography from '@material-ui/core/Typography';
import {
  Theme,
  Grid,
  createStyles,
  Box,
  Paper,
  Button,
  Avatar,
  makeStyles,
  fade,
} from '@material-ui/core';
import { StyleRules } from '@material-ui/core/styles';
import SearchIcon from '@material-ui/icons/Search';
import DownloadIcon from '@material-ui/icons/GetApp';
import { Trans, useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

export interface HomePageProps {
  logo: string;
  backgroundImage: string;
  greenSwirl1Image: string;
  greenSwirl2Image: string;
  decal1Image: string;
  decal2Image: string;
  decal2DarkImage: string;
  decal2DarkHCImage: string;
  facilityImage: string;
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const useStyles = (props: HomePageProps) => {
  return makeStyles<Theme>(
    (theme: Theme): StyleRules =>
      createStyles({
        backgroundImage: {
          backgroundImage: `url(${props.backgroundImage})`,
          backgroundPosition: 'center 40%',
          width: '100%',
          height: 250,
        },
        backgroundDecals: {
          backgroundImage: `url(${props.greenSwirl1Image}), url(${props.decal1Image})`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'top left, top right',
          width: '100%',
          height: 250,
        },
        backgroundTitle: {
          color: '#FFFFFF',
          margin: 'auto',
          fontSize: '48px',
          fontWeight: 'lighter',
          textAlign: 'center',
        },
        contentBox: {
          transform: 'translate(0px, -20px)',
          marginLeft: '8%',
          marginRight: '8%',
        },
        paper: {
          borderRadius: '4px',
          marginBottom: theme.spacing(2),
          height: '100%',
        },
        bluePaper: {
          borderRadius: '4px',
          marginBottom: theme.spacing(2),
          backgroundColor: '#003088',
          height: '100%',
        },
        paperContent: {
          padding: theme.spacing(2),
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-start',
          height: '100%',
          boxSizing: 'border-box',
        },
        avatar: {
          backgroundColor: '#1E5DF8',
          color: '#FFFFFF',
          width: '60px',
          height: '60px',
          marginBottom: theme.spacing(2),
        },
        avatarIcon: {
          transform: 'scale(1.75)',
        },
        paperMainHeading: {
          fontWeight: 'bold',
          fontSize: '32px',
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          color: (theme as any).colours?.homePage?.heading,
          marginBottom: theme.spacing(2),
        },
        paperHeading: {
          fontWeight: 'bold',
          fontSize: '24px',
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          color: (theme as any).colours?.homePage?.heading,
          marginBottom: theme.spacing(2),
        },
        paperDescription: {
          textAlign: 'left',
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          color: (theme as any).colours?.contrastGrey,
          marginBottom: theme.spacing(2),
        },
        bluePaperHeading: {
          fontWeight: 'bold',
          fontSize: '24px',
          color: '#FFFFFF',
          marginBottom: theme.spacing(2),
        },
        bluePaperDescription: {
          textAlign: 'left',
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          color: (theme as any).colours?.homePage?.blueDescription,
          marginBottom: theme.spacing(2),
        },
        browseBackground: {
          backgroundImage: `url(${props.facilityImage})`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'bottom right',
          backgroundSize: 'cover',
          width: '100%',
          height: '100%',
          borderRadius: '4px',
        },
        browseDecal: {
          backgroundImage:
            theme.palette.type === 'light'
              ? `url(${props.decal2Image})`
              : // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (theme as any).colours?.type === 'default'
              ? `url(${props.decal2DarkImage})`
              : `url(${props.decal2DarkHCImage})`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'top left',
          backgroundSize: 'auto 100%',
          height: '100%',
        },
        facilityDecal: {
          backgroundImage: `url(${props.greenSwirl2Image})`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'top right',
          backgroundSize: 'auto 100%',
          height: '100%',
        },
        lightBlueButton: {
          color: '#FFFFFF',
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          backgroundColor: (theme as any).colours?.homePage?.blueButton,
          '&:hover': {
            //Check if null to avoid error when loading
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            backgroundColor: (theme as any).colours?.homePage?.blueButton
              ? fade(
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  (theme as any).colours?.homePage?.blueButton,
                  0.8
                )
              : '#FFFFFF',
          },
        },
      })
  );
};

const HomePage = (props: HomePageProps): React.ReactElement => {
  const [t] = useTranslation();
  const classes = useStyles(props)();

  return (
    <div id="dg-homepage">
      <div className={classes.backgroundImage}>
        <div className={classes.backgroundDecals}>
          <Box
            style={{
              position: 'relative',
              left: '50%',
              top: '45px',
              transform: 'translate(-50%)',
            }}
          >
            <Typography variant="h2" className={classes.backgroundTitle}>
              <Trans i18nKey="home_page.title_line1">
                <strong>Data discovery</strong> and <strong>access</strong>
              </Trans>
            </Typography>
            <Typography variant="h2" className={classes.backgroundTitle}>
              <Trans i18nKey="home_page.title_line2">
                for <strong>large-scale</strong>
                science facilities
              </Trans>
            </Typography>
          </Box>
        </div>
      </div>
      <Box className={classes.contentBox}>
        <Paper className={classes.paper} elevation={1}>
          <Grid container style={{ height: '100%' }}>
            <Grid item xs={6}>
              <Box className={classes.paperContent}>
                <Typography variant="h3" className={classes.paperMainHeading}>
                  {t('home_page.browse.title')}
                </Typography>
                <Typography
                  variant="body1"
                  className={classes.paperDescription}
                >
                  {t('home_page.browse.description1')}
                </Typography>
                <Typography
                  variant="body1"
                  className={classes.paperDescription}
                >
                  <Trans i18nKey="home_page.browse.description2">
                    <strong>DataGateway</strong> focuses on providing data
                    discovery and data access functionality to the data.
                  </Trans>
                </Typography>
                <Box marginTop="16px">
                  <Button
                    color="primary"
                    variant="contained"
                    component={Link}
                    to={t('home_page.browse.link')}
                    data-testid="browse-button"
                  >
                    {t('home_page.browse.button')}
                  </Button>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={6}>
              <div className={classes.browseBackground}>
                <div className={classes.browseDecal}></div>
              </div>
            </Grid>
          </Grid>
        </Paper>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <Paper className={classes.paper} elevation={1}>
              <Box className={classes.paperContent}>
                <Avatar className={classes.avatar}>
                  <SearchIcon className={classes.avatarIcon} />
                </Avatar>
                <Typography variant="h4" className={classes.paperHeading}>
                  {t('home_page.search.title')}
                </Typography>
                <Typography
                  variant="body1"
                  className={classes.paperDescription}
                >
                  {t('home_page.search.description')}
                </Typography>
                <Box marginTop="auto">
                  <Button
                    color="primary"
                    variant="contained"
                    component={Link}
                    to={t('home_page.search.link')}
                    data-testid="search-button"
                  >
                    {t('home_page.search.button')}
                  </Button>
                </Box>
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Paper className={classes.paper} elevation={1}>
              <Box className={classes.paperContent}>
                <Avatar className={classes.avatar}>
                  <DownloadIcon className={classes.avatarIcon} />
                </Avatar>
                <Typography variant="h4" className={classes.paperHeading}>
                  {t('home_page.download.title')}
                </Typography>
                <Typography
                  variant="body1"
                  className={classes.paperDescription}
                >
                  {t('home_page.download.description')}
                </Typography>
                <Box marginTop="auto">
                  <Button
                    color="primary"
                    variant="contained"
                    component={Link}
                    to={t('home_page.download.link')}
                    data-testid="download-button"
                  >
                    {t('home_page.download.button')}
                  </Button>
                </Box>
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Paper className={classes.bluePaper} elevation={1}>
              <div className={classes.facilityDecal}>
                <Box className={classes.paperContent}>
                  <Typography variant="h4" className={classes.bluePaperHeading}>
                    {t('home_page.facility.title')}
                  </Typography>
                  <Typography
                    variant="body1"
                    className={classes.bluePaperDescription}
                  >
                    {t('home_page.facility.description')}
                  </Typography>
                  <Box marginTop="auto">
                    <Button
                      color="primary"
                      variant="contained"
                      className={classes.lightBlueButton}
                      href={t('home_page.facility.link')}
                      data-testid="facility-button"
                    >
                      {t('home_page.facility.button')}
                    </Button>
                  </Box>
                </Box>
              </div>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </div>
  );
};

export default HomePage;
