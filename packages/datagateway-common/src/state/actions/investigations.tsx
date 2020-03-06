import {
  FetchInvestigationsSuccessType,
  FetchInvestigationsFailureType,
  FetchInvestigationsRequestType,
  FetchDataSuccessPayload,
  FailurePayload,
  FetchInvestigationDetailsSuccessType,
  FetchInvestigationDetailsFailureType,
  FetchInvestigationDetailsRequestType,
  FetchCountSuccessPayload,
  FetchInvestigationCountSuccessType,
  FetchInvestigationCountFailureType,
  FetchInvestigationCountRequestType,
  RequestPayload,
  FetchDetailsSuccessPayload,
  FetchInvestigationSizeRequestType,
  FetchSizeSuccessPayload,
  FetchInvestigationSizeSuccessType,
  FetchInvestigationSizeFailureType,
} from './actions.types';
import { ActionType, ThunkResult } from '../app.types';
import { Action } from 'redux';
import { batch } from 'react-redux';
import axios from 'axios';
import { getApiFilter } from '.';
import { fetchInvestigationDatasetsCount } from './datasets';
import { Investigation } from '../../app.types';
import { IndexRange } from 'react-virtualized';
import { readSciGatewayToken } from '../../parseTokens';
import handleICATError from '../../handleICATError';

export const fetchInvestigationsSuccess = (
  investigations: Investigation[],
  timestamp: number
): ActionType<FetchDataSuccessPayload> => ({
  type: FetchInvestigationsSuccessType,
  payload: {
    data: investigations,
    timestamp,
  },
});

export const fetchInvestigationsFailure = (
  error: string
): ActionType<FailurePayload> => ({
  type: FetchInvestigationsFailureType,
  payload: {
    error,
  },
});

export const fetchInvestigationsRequest = (
  timestamp: number
): ActionType<RequestPayload> => ({
  type: FetchInvestigationsRequestType,
  payload: {
    timestamp,
  },
});

export const fetchInvestigationSizeRequest = (): Action => ({
  type: FetchInvestigationSizeRequestType,
});

export const fetchInvestigationSizeSuccess = (
  investigationId: number,
  size: number
): ActionType<FetchSizeSuccessPayload> => ({
  type: FetchInvestigationSizeSuccessType,
  payload: {
    id: investigationId,
    size,
  },
});

export const fetchInvestigationSizeFailure = (
  error: string
): ActionType<FailurePayload> => ({
  type: FetchInvestigationSizeFailureType,
  payload: {
    error,
  },
});

export const fetchInvestigationSize = (
  investigationId: number
): ThunkResult<Promise<void>> => {
  return async (dispatch, getState) => {
    dispatch(fetchInvestigationSizeRequest());

    // We request the size from the download API.
    const { downloadApiUrl } = getState().dgcommon.urls;
    const currentCache = getState().dgcommon.investigationCache[
      investigationId
    ];

    // Check for a cached investigation size in the investigationCache.
    if (currentCache && currentCache.childEntitySize) {
      // Dispatch success using the cached dataset size.
      dispatch(
        fetchInvestigationSizeSuccess(
          investigationId,
          currentCache.childEntitySize
        )
      );
    } else {
      await axios
        .get(`${downloadApiUrl}/user/getSize`, {
          params: {
            sessionId: readSciGatewayToken().sessionId,
            facilityName: 'LILS',
            entityType: 'investigation',
            entityId: investigationId,
          },
        })
        .then(response => {
          dispatch(
            fetchInvestigationSizeSuccess(investigationId, response.data)
          );
        })
        .catch(error => {
          handleICATError(error, false);
          dispatch(fetchInvestigationSizeFailure(error.message));
        });
    }
  };
};

interface FetchInvestigationsParams {
  additionalFilters?: {
    filterType: string;
    filterValue: string;
  }[];
  getDatasetCount?: boolean;
  getSize?: boolean;
  offsetParams?: IndexRange;
}

export const fetchInvestigations = (
  optionalParams?: FetchInvestigationsParams
): ThunkResult<Promise<void>> => {
  return async (dispatch, getState) => {
    const timestamp = Date.now();
    dispatch(fetchInvestigationsRequest(timestamp));

    let params = getApiFilter(getState);
    if (optionalParams && optionalParams.offsetParams) {
      params.append(
        'skip',
        JSON.stringify(optionalParams.offsetParams.startIndex)
      );
      params.append(
        'limit',
        JSON.stringify(
          optionalParams.offsetParams.stopIndex -
            optionalParams.offsetParams.startIndex +
            1
        )
      );
    }
    const { apiUrl } = getState().dgcommon.urls;

    if (optionalParams && optionalParams.additionalFilters) {
      optionalParams.additionalFilters.forEach(filter => {
        params.append(filter.filterType, filter.filterValue);
      });
    }

    await axios
      .get(`${apiUrl}/investigations`, {
        params,
        headers: {
          Authorization: `Bearer ${readSciGatewayToken().sessionId}`,
        },
      })
      .then(response => {
        dispatch(fetchInvestigationsSuccess(response.data, timestamp));
        if (optionalParams) {
          if (optionalParams.getDatasetCount) {
            batch(() => {
              response.data.forEach((investigation: Investigation) => {
                dispatch(fetchInvestigationDatasetsCount(investigation.ID));
              });
            });
          }
          if (optionalParams.getSize) {
            batch(() => {
              response.data.forEach((investigation: Investigation) => {
                dispatch(fetchInvestigationSize(investigation.ID));
              });
            });
          }
        }
      })
      .catch(error => {
        handleICATError(error);
        dispatch(fetchInvestigationsFailure(error.message));
      });
  };
};

export const fetchISISInvestigations = ({
  instrumentId,
  facilityCycleId,
  offsetParams,
  optionalParams,
}: {
  instrumentId: number;
  facilityCycleId: number;
  offsetParams?: IndexRange;
  optionalParams?: FetchInvestigationsParams;
}): ThunkResult<Promise<void>> => {
  return async (dispatch, getState) => {
    const timestamp = Date.now();
    dispatch(fetchInvestigationsRequest(timestamp));

    let params = getApiFilter(getState);

    params.append(
      'include',
      JSON.stringify([
        { INVESTIGATIONINSTRUMENT: 'INSTRUMENT' },
        { STUDYINVESTIGATION: 'STUDY' },
      ])
    );

    if (offsetParams) {
      params.append('skip', JSON.stringify(offsetParams.startIndex));
      params.append(
        'limit',
        JSON.stringify(offsetParams.stopIndex - offsetParams.startIndex + 1)
      );
    }

    const { apiUrl } = getState().dgcommon.urls;

    await axios
      .get(
        `${apiUrl}/instruments/${instrumentId}/facilitycycles/${facilityCycleId}/investigations`,
        {
          params,
          headers: {
            Authorization: `Bearer ${readSciGatewayToken().sessionId}`,
          },
        }
      )
      .then(response => {
        dispatch(fetchInvestigationsSuccess(response.data, timestamp));

        // Once investigation has been fetched successfully,
        // we can issue request to fetch the size.
        if (optionalParams && optionalParams.getSize) {
          batch(() => {
            response.data.forEach((investigation: Investigation) => {
              dispatch(fetchInvestigationSize(investigation.ID));
            });
          });
        }
      })
      .catch(error => {
        handleICATError(error);
        dispatch(fetchInvestigationsFailure(error.message));
      });
  };
};

export const fetchInvestigationDetailsSuccess = (
  investigations: Investigation[]
): ActionType<FetchDetailsSuccessPayload> => ({
  type: FetchInvestigationDetailsSuccessType,
  payload: {
    data: investigations,
  },
});

export const fetchInvestigationDetailsFailure = (
  error: string
): ActionType<FailurePayload> => ({
  type: FetchInvestigationDetailsFailureType,
  payload: {
    error,
  },
});

export const fetchInvestigationCountSuccess = (
  count: number,
  timestamp: number
): ActionType<FetchCountSuccessPayload> => ({
  type: FetchInvestigationCountSuccessType,
  payload: {
    count,
    timestamp,
  },
});

export const fetchInvestigationCountFailure = (
  error: string
): ActionType<FailurePayload> => ({
  type: FetchInvestigationCountFailureType,
  payload: {
    error,
  },
});

export const fetchInvestigationDetailsRequest = (): Action => ({
  type: FetchInvestigationDetailsRequestType,
});

export const fetchInvestigationDetails = (
  investigationId: number
): ThunkResult<Promise<void>> => {
  return async (dispatch, getState) => {
    dispatch(fetchInvestigationDetailsRequest());

    let params = new URLSearchParams();

    params.append('where', JSON.stringify({ ID: { eq: investigationId } }));
    params.append(
      'include',
      JSON.stringify([{ INVESTIGATIONUSER: 'USER_' }, 'SAMPLE', 'PUBLICATION'])
    );

    const { apiUrl } = getState().dgcommon.urls;

    await axios
      .get(`${apiUrl}/investigations`, {
        params,
        headers: {
          Authorization: `Bearer ${readSciGatewayToken().sessionId}`,
        },
      })
      .then(response => {
        dispatch(fetchInvestigationDetailsSuccess(response.data));
      })
      .catch(error => {
        handleICATError(error);
        dispatch(fetchInvestigationDetailsFailure(error.message));
      });
  };
};

export const fetchInvestigationCountRequest = (
  timestamp: number
): ActionType<RequestPayload> => ({
  type: FetchInvestigationCountRequestType,
  payload: {
    timestamp,
  },
});

export const fetchInvestigationCount = (
  additionalFilters?: {
    filterType: string;
    filterValue: string;
  }[]
): ThunkResult<Promise<void>> => {
  return async (dispatch, getState) => {
    const timestamp = Date.now();
    dispatch(fetchInvestigationCountRequest(timestamp));

    let params = getApiFilter(getState);

    if (additionalFilters) {
      additionalFilters.forEach(filter => {
        params.append(filter.filterType, filter.filterValue);
      });
    }

    params.delete('order');

    const { apiUrl } = getState().dgcommon.urls;

    await axios
      .get(`${apiUrl}/investigations/count`, {
        params,
        headers: {
          Authorization: `Bearer ${readSciGatewayToken().sessionId}`,
        },
      })
      .then(response => {
        dispatch(fetchInvestigationCountSuccess(response.data, timestamp));
      })
      .catch(error => {
        handleICATError(error);
        dispatch(fetchInvestigationCountFailure(error.message));
      });
  };
};

export const fetchISISInvestigationCount = (
  instrumentId: number,
  facilityCycleId: number
): ThunkResult<Promise<void>> => {
  return async (dispatch, getState) => {
    const timestamp = Date.now();
    dispatch(fetchInvestigationCountRequest(timestamp));

    let params = getApiFilter(getState);
    params.delete('order');

    const { apiUrl } = getState().dgcommon.urls;

    await axios
      .get(
        `${apiUrl}/instruments/${instrumentId}/facilitycycles/${facilityCycleId}/investigations/count`,
        {
          params,
          headers: {
            Authorization: `Bearer ${readSciGatewayToken().sessionId}`,
          },
        }
      )
      .then(response => {
        dispatch(fetchInvestigationCountSuccess(response.data, timestamp));
      })
      .catch(error => {
        handleICATError(error);
        dispatch(fetchInvestigationCountFailure(error.message));
      });
  };
};