import { DGTableState, Investigation, Entity, Dataset } from '../app.types';
import createReducer from './createReducer';
import {
  SortTablePayload,
  SortTableType,
  FetchInvestigationsRequestType,
  FetchInvestigationsSuccessType,
  FetchInvestigationsFailureType,
  FilterTablePayload,
  FilterTableType,
  FetchDatasetsRequestType,
  FetchDatasetsSuccessType,
  FetchDatasetsFailureType,
  FetchDatafilesRequestType,
  FetchDatafilesSuccessType,
  FetchDatafilesFailureType,
  FetchInvestigationDatasetsCountRequestType,
  FetchInvestigationDatasetsCountSuccessType,
  FetchInvestigationDatasetsCountFailureType,
  FetchDatasetDatafilesCountRequestType,
  FetchDatasetDatafilesCountSuccessType,
  FetchDatasetDatafilesCountFailureType,
  FetchInstrumentsFailureType,
  FetchInstrumentsSuccessType,
  FetchInstrumentsRequestType,
  FetchFacilityCyclesRequestType,
  FetchFacilityCyclesSuccessType,
  FetchFacilityCyclesFailureType,
  DownloadDatafileFailureType,
  DownloadDatafileRequestType,
  DownloadDatafileSuccessType,
  DownloadDatasetRequestType,
  DownloadDatasetSuccessType,
  DownloadDatasetFailureType,
  FetchDataSuccessPayload,
  FailurePayload,
  FetchDataCountSuccessPayload,
  FetchCountSuccessPayload,
  FetchInvestigationCountRequestType,
  FetchInvestigationCountSuccessType,
  FetchInvestigationCountFailureType,
  FetchDatasetCountRequestType,
  FetchDatasetCountSuccessType,
  FetchDatasetCountFailureType,
  FetchDatafileCountRequestType,
  FetchDatafileCountSuccessType,
  FetchDatafileCountFailureType,
  FetchInstrumentCountSuccessType,
  FetchInstrumentCountRequestType,
  FetchInstrumentCountFailureType,
  FetchFacilityCycleCountRequestType,
  FetchFacilityCycleCountSuccessType,
  FetchFacilityCycleCountFailureType,
} from '../actions/actions.types';

export const initialState: DGTableState = {
  data: [],
  totalDataCount: 0,
  loading: false,
  downloading: false,
  error: null,
  sort: {},
  filters: {},
};

export function handleSortTable(
  state: DGTableState,
  payload: SortTablePayload
): DGTableState {
  const { column, order } = payload;
  if (order !== null) {
    // if given an defined order (asc or desc), update the relevant column in the sort state
    return {
      ...state,
      sort: {
        ...state.sort,
        [column]: order,
      },
      data: [],
      totalDataCount: 0,
    };
  } else {
    // if order is null, user no longer wants to sort by that column so remove column from sort state
    const { [column]: order, ...rest } = state.sort;
    return {
      ...state,
      sort: {
        ...rest,
      },
      data: [],
      totalDataCount: 0,
    };
  }
}

export function handleFilterTable(
  state: DGTableState,
  payload: FilterTablePayload
): DGTableState {
  const { column, filter } = payload;
  if (filter !== null) {
    // if given an defined filter, update the relevant column in the sort state
    return {
      ...state,
      filters: {
        ...state.filters,
        [column]: filter,
      },
      data: [],
      totalDataCount: 0,
    };
  } else {
    // if filter is null, user no longer wants to filter by that column so remove column from filter state
    const { [column]: filter, ...rest } = state.filters;
    return {
      ...state,
      filters: {
        ...rest,
      },
      data: [],
      totalDataCount: 0,
    };
  }
}

export function handleFetchDataRequest(state: DGTableState): DGTableState {
  return {
    ...state,
    loading: true,
  };
}

export function handleFetchDataSuccess(
  state: DGTableState,
  payload: FetchDataSuccessPayload
): DGTableState {
  return {
    ...state,
    loading: false,
    data: state.data.concat(payload.data),
    error: null,
  };
}

export function handleFetchDataFailure(
  state: DGTableState,
  payload: FailurePayload
): DGTableState {
  return {
    ...state,
    loading: false,
    error: payload.error,
  };
}

export function handleFetchCountRequest(state: DGTableState): DGTableState {
  return {
    ...state,
    loading: true,
  };
}

export function handleFetchCountSuccess(
  state: DGTableState,
  payload: FetchCountSuccessPayload
): DGTableState {
  return {
    ...state,
    loading: false,
    totalDataCount: payload.count,
    error: null,
  };
}

export function handleFetchCountFailure(
  state: DGTableState,
  payload: FailurePayload
): DGTableState {
  return {
    ...state,
    loading: false,
    error: payload.error,
  };
}

export function handleFetchDataCountRequest(state: DGTableState): DGTableState {
  return {
    ...state,
  };
}

export function handleFetchDataCountFailure(
  state: DGTableState,
  payload: FailurePayload
): DGTableState {
  return {
    ...state,
    error: payload.error,
  };
}

export function handleFetchDatasetCountSuccess(
  state: DGTableState,
  payload: FetchDataCountSuccessPayload
): DGTableState {
  return {
    ...state,
    loading: false,
    data: state.data.map((entity: Entity) => {
      const investigation = entity as Investigation;
      return investigation.ID === payload.id
        ? { ...investigation, DATASET_COUNT: payload.count }
        : investigation;
    }),
    error: null,
  };
}

export function handleDownloadDataRequest(state: DGTableState): DGTableState {
  return {
    ...state,
    downloading: true,
  };
}

export function handleDownloadDataSuccess(state: DGTableState): DGTableState {
  return {
    ...state,
    downloading: false,
  };
}

export function handleDownloadDataFailure(
  state: DGTableState,
  payload: FailurePayload
): DGTableState {
  return {
    ...state,
    downloading: false,
    error: payload.error,
  };
}

export function handleFetchDatasetDatafilesCountSuccess(
  state: DGTableState,
  payload: FetchDataCountSuccessPayload
): DGTableState {
  return {
    ...state,
    loading: false,
    data: state.data.map((entity: Entity) => {
      const dataset = entity as Dataset;
      return dataset.ID === payload.id
        ? { ...dataset, DATAFILE_COUNT: payload.count }
        : dataset;
    }),
    error: null,
  };
}

const DGTableReducer = createReducer(initialState, {
  [SortTableType]: handleSortTable,
  [FilterTableType]: handleFilterTable,
  [FetchInvestigationsRequestType]: handleFetchDataRequest,
  [FetchInvestigationsSuccessType]: handleFetchDataSuccess,
  [FetchInvestigationsFailureType]: handleFetchDataFailure,
  [FetchInvestigationCountRequestType]: handleFetchCountRequest,
  [FetchInvestigationCountSuccessType]: handleFetchCountSuccess,
  [FetchInvestigationCountFailureType]: handleFetchCountFailure,
  [FetchDatasetsRequestType]: handleFetchDataRequest,
  [FetchDatasetsSuccessType]: handleFetchDataSuccess,
  [FetchDatasetsFailureType]: handleFetchDataFailure,
  [FetchDatasetCountRequestType]: handleFetchCountRequest,
  [FetchDatasetCountSuccessType]: handleFetchCountSuccess,
  [FetchDatasetCountFailureType]: handleFetchCountFailure,
  [FetchInvestigationDatasetsCountRequestType]: handleFetchDataCountRequest,
  [FetchInvestigationDatasetsCountSuccessType]: handleFetchDatasetCountSuccess,
  [FetchInvestigationDatasetsCountFailureType]: handleFetchDataCountFailure,
  [DownloadDatasetRequestType]: handleDownloadDataRequest,
  [DownloadDatasetSuccessType]: handleDownloadDataSuccess,
  [DownloadDatasetFailureType]: handleDownloadDataFailure,
  [FetchDatafilesRequestType]: handleFetchDataRequest,
  [FetchDatafilesSuccessType]: handleFetchDataSuccess,
  [FetchDatafilesFailureType]: handleFetchDataFailure,
  [FetchDatafileCountRequestType]: handleFetchCountRequest,
  [FetchDatafileCountSuccessType]: handleFetchCountSuccess,
  [FetchDatafileCountFailureType]: handleFetchCountFailure,
  [FetchDatasetDatafilesCountRequestType]: handleFetchDataCountRequest,
  [FetchDatasetDatafilesCountSuccessType]: handleFetchDatasetDatafilesCountSuccess,
  [FetchDatasetDatafilesCountFailureType]: handleFetchDataCountFailure,
  [FetchDatafileCountRequestType]: handleFetchDataCountRequest,
  [FetchDatafileCountSuccessType]: handleFetchDatafileCountSuccess,
  [FetchDatafileCountFailureType]: handleFetchDataCountFailure,
  [DownloadDatafileRequestType]: handleDownloadDataRequest,
  [DownloadDatafileSuccessType]: handleDownloadDataSuccess,
  [DownloadDatafileFailureType]: handleDownloadDataFailure,
  [FetchInstrumentsRequestType]: handleFetchDataRequest,
  [FetchInstrumentsSuccessType]: handleFetchDataSuccess,
  [FetchInstrumentsFailureType]: handleFetchDataFailure,
  [FetchInstrumentCountRequestType]: handleFetchCountRequest,
  [FetchInstrumentCountSuccessType]: handleFetchCountSuccess,
  [FetchInstrumentCountFailureType]: handleFetchCountFailure,
  [FetchFacilityCyclesRequestType]: handleFetchDataRequest,
  [FetchFacilityCyclesSuccessType]: handleFetchDataSuccess,
  [FetchFacilityCyclesFailureType]: handleFetchDataFailure,
  [FetchFacilityCycleCountRequestType]: handleFetchCountRequest,
  [FetchFacilityCycleCountSuccessType]: handleFetchCountSuccess,
  [FetchFacilityCycleCountFailureType]: handleFetchCountFailure,
});

export default DGTableReducer;
