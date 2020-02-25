import { DGSearchState } from '../app.types';
import createReducer from './createReducer';
import {
  ToggleDatasetType,
  ToggleDatafileType,
  ToggleInvestigationType,
  SelectStartDateType,
  SelectEndDateType,
  SearchTextType,
  ToggleLuceneRequestReceivedType,
  StoreLuceneDatasetType,
  StoreLuceneDatafileType,
  StoreLuceneInvestigationType,
  TogglePayload,
  SelectDatePayload,
  SearchTextPayload,
  CheckRequestReceivedPayload,
  LuceneResultTypePayload,
} from '../actions/actions.types';

export const initialState: DGSearchState = {
  searchText: '',
  text: '',
  selectDate: {
    startDate: null,
    endDate: null,
  },
  checkBox: {
    dataset: true,
    datafile: true,
    investigation: true,
  },
  requestReceived: false,
  searchData: {
    dataset: [],
    datafile: [],
    investigation: [],
  },
};

export function handleSearchText(
  state: DGSearchState,
  payload: SearchTextPayload
): DGSearchState {
  return {
    ...state,
    searchText: payload.searchText,
  };
}

export function handleToggleDataset(
  state: DGSearchState,
  payload: TogglePayload
): DGSearchState {
  return {
    ...state,
    checkBox: {
      ...state.checkBox,
      dataset: payload.toggleOption,
    },
  };
}

export function handleToggleDatafile(
  state: DGSearchState,
  payload: TogglePayload
): DGSearchState {
  return {
    ...state,
    checkBox: {
      ...state.checkBox,
      datafile: payload.toggleOption,
    },
  };
}

export function handleToggleInvestigation(
  state: DGSearchState,
  payload: TogglePayload
): DGSearchState {
  return {
    ...state,
    checkBox: {
      ...state.checkBox,
      investigation: payload.toggleOption,
    },
  };
}

export function selectStartDate(
  state: DGSearchState,
  payload: SelectDatePayload
): DGSearchState {
  return {
    ...state,
    selectDate: {
      ...state.selectDate,
      startDate: payload.date,
    },
  };
}

export function selectEndDate(
  state: DGSearchState,
  payload: SelectDatePayload
): DGSearchState {
  return {
    ...state,
    selectDate: {
      ...state.selectDate,
      endDate: payload.date,
    },
  };
}

export function toggleLuceneRequestReceived(
  state: DGSearchState,
  payload: CheckRequestReceivedPayload
): DGSearchState {
  return {
    ...state,
    requestReceived: payload.requestReceived,
  };
}

export function storeDatasetLuceneResults(
  state: DGSearchState,
  payload: LuceneResultTypePayload
): DGSearchState {
  return {
    ...state,
    searchData: {
      ...state.searchData,
      dataset: payload.searchData,
    },
  };
}

export function storeDatafileLuceneResults(
  state: DGSearchState,
  payload: LuceneResultTypePayload
): DGSearchState {
  return {
    ...state,
    searchData: {
      ...state.searchData,
      datafile: payload.searchData,
    },
  };
}

export function storeInvestigationLuceneResults(
  state: DGSearchState,
  payload: LuceneResultTypePayload
): DGSearchState {
  return {
    ...state,
    searchData: {
      ...state.searchData,
      investigation: payload.searchData,
    },
  };
}

const DGSearchReducer = createReducer(initialState, {
  [ToggleDatasetType]: handleToggleDataset,
  [ToggleDatafileType]: handleToggleDatafile,
  [ToggleInvestigationType]: handleToggleInvestigation,
  [SelectStartDateType]: selectStartDate,
  [SelectEndDateType]: selectEndDate,
  [SearchTextType]: handleSearchText,
  [ToggleLuceneRequestReceivedType]: toggleLuceneRequestReceived,
  [StoreLuceneDatasetType]: storeDatasetLuceneResults,
  [StoreLuceneDatafileType]: storeDatafileLuceneResults,
  [StoreLuceneInvestigationType]: storeInvestigationLuceneResults,
});

export default DGSearchReducer;
