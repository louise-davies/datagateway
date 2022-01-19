import {
  Breadcrumbs,
  createStyles,
  Link as MaterialLink,
  Paper,
  Theme,
  Typography,
  withStyles,
} from '@material-ui/core';
import { StyleRules } from '@material-ui/core/styles';
import axios, { AxiosError } from 'axios';
import {
  ArrowTooltip,
  EntityTypes,
  handleICATError,
  parseSearchToQuery,
  readSciGatewayToken,
} from 'datagateway-common';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { UseQueryResult, useQueries, UseQueryOptions } from 'react-query';
import { useSelector } from 'react-redux';
import { Link, useLocation } from 'react-router-dom';
import { StateType } from '../state/app.types';

interface BreadcrumbProps {
  displayName: string;
  url?: string;
  isLast?: boolean;
}

const Breadcrumb: React.FC<BreadcrumbProps> = (props: BreadcrumbProps) => {
  const { displayName, isLast, url, ...restProps } = props;
  return (
    // We give the tooltip component the content (title) as the display content.
    // Passing the 20 as it is the viewport width we allow text to be shown before displaying the tooltip.
    <ArrowTooltip title={displayName} percentageWidth={20}>
      <div>
        {url ? (
          <MaterialLink component={Link} to={url} {...restProps}>
            <span>{displayName}</span>
          </MaterialLink>
        ) : (
          <Typography color="textPrimary" {...restProps}>
            <span>{isLast ? <i>{displayName}</i> : displayName}</span>
          </Typography>
        )}
      </div>
    </ArrowTooltip>
  );
};

const breadcrumbsStyles = (theme: Theme): StyleRules =>
  createStyles({
    root: {
      backgroundColor: theme.palette.background.default,
      '& li': {
        '& a, p': {
          color: theme.palette.primary.contrastText,
          backgroundColor: theme.palette.primary.light,
          display: 'block',
          textDecoration: 'none',
          position: 'relative',

          /* Positions breadcrumb */
          height: '30px',
          lineHeight: '30px',
          padding: '0 10px 0 5px',
          textAlign: 'center',

          /* Adds between breadcrumbs */
          marginRight: '7px',
          '&:before, &:after': {
            content: '""',
            position: 'absolute',
            top: 0,
            border: `0 solid ${theme.palette.primary.light}`,
            borderWidth: '15px 10px',
            width: 0,
            height: 0,
          },
          '&:before': {
            left: '-20px',
            borderLeftColor: 'transparent',
          },
          '&:after': {
            left: '100%',

            /* Gap in between chevrons */
            borderColor: 'transparent',
            borderLeftColor: theme.palette.primary.light,
          },
          '&:hover': {
            backgroundColor: theme.palette.primary.light,
            '&:before': {
              borderColor: theme.palette.primary.light,
              borderLeftColor: 'transparent',
            },
            '&:after': {
              borderLeftColor: theme.palette.primary.light,
            },
          },
          '&:active': {
            backgroundColor: theme.palette.grey[600],
            '&:before': {
              borderColor: `${theme.palette.grey[600]} !important`,
              borderLeftColor: 'transparent !important',
            },
            '&:after': {
              borderLeftColor: `${theme.palette.grey[600]} !important`,
            },
          },
        },
      },
      /* Every even breadcrumb has a darker background */
      '& li:nth-child(4n + 3)': {
        '& a, p': {
          backgroundColor: theme.palette.primary.main,
          '&:before': {
            borderColor: theme.palette.primary.main,
            borderLeftColor: 'transparent',
          },
          '&:after': {
            borderLeftColor: theme.palette.primary.main,
          },
        },
      },
      '& li:first-child': {
        '& a, p': {
          paddingLeft: theme.spacing(1),
          '&:before': {
            border: 'none',
          },
        },
      },
      '& li:last-child': {
        '& a, p': {
          paddingRight: '15px',

          /* Curve the last breadcrumb border */
          borderRadius: '0 4px 4px 0',
          '&:after': {
            border: 'none',
          },
        },
      },

      /* Control the width and shortening of text */
      '& span': {
        display: 'block',
        whiteSpace: 'nowrap',
        // TODO: Remove use of "vw" here?
        maxWidth: '20vw',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
      },
    },
  });

const fetchEntityInformation = async (
  apiUrl: string,
  requestEntityUrl: string,
  entityField: string
): Promise<string> => {
  let entityName = '';
  const requestUrl = `${apiUrl}/${requestEntityUrl}`;

  // Make a GET request to the specified URL.
  entityName = await axios
    .get(requestUrl, {
      headers: {
        Authorization: `Bearer ${readSciGatewayToken().sessionId}`,
      },
    })
    .then((response) => {
      // Return the property in the data received.
      return response.data[entityField];
    });

  return entityName;
};

const useEntityInformation = (
  currentPathnames: string[]
): UseQueryResult<{ displayName: string; url: string }, AxiosError>[] => {
  const apiUrl = useSelector((state: StateType) => state.dgcommon.urls.apiUrl);
  const breadcrumbSettings = useSelector(
    (state: StateType) => state.dgdataview.breadcrumbSettings
  );

  const queryConfigs = React.useMemo(() => {
    const queryConfigs: UseQueryOptions<
      string,
      AxiosError,
      { displayName: string; url: string },
      ['entityInfo', string, string]
    >[] = [];

    const pathLength = currentPathnames.length;
    for (let index = 1; index < pathLength; index += 2) {
      if (index < pathLength - 1) {
        const entity = currentPathnames[index];

        const link = `/${currentPathnames.slice(0, index + 3).join('/')}`;

        const entityId = currentPathnames[index + 1];

        // In general the API endpoint will be our entity name and
        // the entity field we want is the name of the entity.
        let apiEntity = entity;

        // If the entity is a investigation, we always want to fetch the title field.
        let requestEntityField = entity === 'investigation' ? 'title' : 'name';

        // Use breadcrumb settings in state to customise API call for entities.
        if (
          Object.entries(breadcrumbSettings).length !== 0 &&
          entity in breadcrumbSettings
        ) {
          const entitySettings = breadcrumbSettings[entity];

          // Check for a parent entity.
          if (
            !entitySettings.parentEntity ||
            (entitySettings.parentEntity &&
              currentPathnames.includes(entitySettings.parentEntity))
          ) {
            // Get the defined replace entity field.
            requestEntityField = entitySettings.replaceEntityField;

            // Get the replace entity, if one has been defined.
            if (entitySettings.replaceEntity) {
              apiEntity = entitySettings.replaceEntity;
            }
          }
        }

        // Create the entity url to request the name, this is pluralised to get the API endpoint.
        let requestEntityUrl: string;
        // TODO: check this is sufficient for pluralising API entity names...
        //       (move to a separate function to be used elsewhere if needed?)
        const pluralisedApiEntity =
          apiEntity.charAt(apiEntity.length - 1) === 'y'
            ? `${apiEntity.slice(0, apiEntity.length - 1)}ies`
            : `${apiEntity}s`;
        if (EntityTypes.includes(entity)) {
          requestEntityUrl = pluralisedApiEntity.toLowerCase() + `/${entityId}`;
        } else {
          // If we are searching for proposal, we know that there is no investigation
          // information in the current path. We will need to query and select one investigation
          // from all investigations with the entity id (which is the proposal/investigation name).

          requestEntityUrl =
            pluralisedApiEntity.toLowerCase() +
            '/findone?where=' +
            JSON.stringify({ name: { eq: entityId } });
        }

        queryConfigs.push({
          queryKey: ['entityInfo', requestEntityUrl, requestEntityField],
          queryFn: () =>
            fetchEntityInformation(
              apiUrl,
              requestEntityUrl,
              requestEntityField
            ),
          onError: (error) => {
            handleICATError(error, false);
          },
          staleTime: Infinity,
          select: (data: string) => ({
            displayName: data,
            url: link,
          }),
        });
      }
    }

    return queryConfigs;
  }, [currentPathnames, breadcrumbSettings, apiUrl]);

  // useQueries doesn't allow us to specify type info, so ignore this line
  // since we strongly type the queries object anyway
  // we also need to prettier-ignore to make sure we don't wrap onto next line
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  // prettier-ignore
  return useQueries(queryConfigs);
};

const StyledBreadcrumbs = withStyles(breadcrumbsStyles)(Breadcrumbs);

const PageBreadcrumbs: React.FC = () => {
  const { pathname: location, search } = useLocation();
  const view = parseSearchToQuery(search).view;

  const [t] = useTranslation();

  const prevLocationRef = React.useRef(location);
  React.useEffect(() => {
    prevLocationRef.current = location;
  });
  const prevLocation = prevLocationRef.current;

  const [currentPathnames, setCurrentPathnames] = React.useState<string[]>([]);

  const queries = useEntityInformation(currentPathnames);

  const firstRenderRef = React.useRef(true);

  React.useEffect(() => {
    if (firstRenderRef.current || location !== prevLocation) {
      firstRenderRef.current = false;
      const currPathnames = location.split('/').filter((x) => x);
      setCurrentPathnames(currPathnames);
    }
  }, [location, prevLocation]);

  const viewString = view ? `?view=${view}` : '';
  return (
    <div>
      <Paper square elevation={0}>
        {/* // Ensure that there is a path to render, otherwise do not show any breadcrumb. */}
        {currentPathnames.length > 0 ? (
          <StyledBreadcrumbs aria-label="breadcrumb" separator="">
            <Breadcrumb
              displayName={t('breadcrumbs.home')}
              data-testid="Breadcrumb-home"
            />

            {/* // Return the base entity as a link. */}
            <Breadcrumb
              displayName={t(`breadcrumbs.${currentPathnames[1]}`, {
                count: 100,
              })}
              data-testid="Breadcrumb-base"
              url={
                currentPathnames.length > 2
                  ? `/${currentPathnames.slice(0, 2).join('/')}${viewString}`
                  : undefined
              }
            />

            {/* // Add in the hierarchy breadcrumbs. */}
            {queries.map(
              (
                query: UseQueryResult<
                  { displayName: string; url: string },
                  AxiosError
                >,
                index: number
              ) => {
                const { data } = query;

                // Return the correct type of breadcrumb with the entity name
                // depending on if it is at the end of the hierarchy or not.
                return data ? (
                  <Breadcrumb
                    displayName={data.displayName}
                    data-testid={`Breadcrumb-hierarchy-${index + 1}`}
                    url={
                      index + 1 !== queries.length
                        ? data.url + viewString
                        : undefined
                    }
                    key={`breadcrumb-${index + 1}`}
                  />
                ) : null;
              }
            )}

            {/* // Render the last breadcrumb information; this is the current table view. */}
            {currentPathnames.length > 2 &&
            !/^\d+$/.test(currentPathnames[currentPathnames.length - 1]) ? (
              <Breadcrumb
                displayName={t(
                  `breadcrumbs.${
                    currentPathnames[currentPathnames.length - 1]
                  }`,
                  {
                    count: 100,
                  }
                )}
                data-testid="Breadcrumb-last"
                isLast={true}
              />
            ) : null}
          </StyledBreadcrumbs>
        ) : null}
      </Paper>
    </div>
  );
};

export default PageBreadcrumbs;
