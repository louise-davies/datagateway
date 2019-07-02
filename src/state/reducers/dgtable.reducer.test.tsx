import DGTableReducer, { initialState } from './dgtable.reducer';
import { DGTableState, Investigation, Dataset, Datafile } from '../app.types';
import {
  sortTable,
  fetchInvestigationsRequest,
  fetchInvestigationsSuccess,
  fetchInvestigationsFailure,
  filterTable,
  fetchDatasetsRequest,
  fetchDatasetsSuccess,
  fetchDatasetsFailure,
  fetchDatafilesRequest,
  fetchDatafilesSuccess,
  fetchDatafilesFailure,
  fetchDatasetCountRequest,
  fetchDatasetCountSuccess,
  fetchDatasetCountFailure,
} from '../actions';

describe('dgtable reducer', () => {
  let state: DGTableState;

  beforeEach(() => {
    state = { ...initialState };
  });

  it('should return state for actions it does not care about', () => {
    const updatedState = DGTableReducer(state, { type: 'irrelevant action' });

    expect(updatedState).toBe(state);
  });

  it('should set the sort state when given a SortTable action', () => {
    expect(state.sort).toBeUndefined();

    let updatedState = DGTableReducer(state, sortTable('test', 'asc'));
    expect(updatedState.sort).toEqual({ column: 'test', order: 'asc' });
  });

  it('should set the filters state when given a FilterTable action', () => {
    expect(state.filters).toBeUndefined();

    let updatedState = DGTableReducer(
      state,
      filterTable('test column', 'test filter')
    );
    expect(updatedState.filters).toEqual({
      'test column': 'test filter',
    });
  });

  describe('FetchInvestigations actions', () => {
    it('should set the loading state when given a FetchInvestigationsRequest action', () => {
      expect(state.loading).toBe(false);

      let updatedState = DGTableReducer(state, fetchInvestigationsRequest());
      expect(updatedState.loading).toBe(true);
    });

    it('should set the data state and reset error and loading state when given a FetchInvestigationsSuccess action', () => {
      state.loading = true;
      const mockData: Investigation[] = [
        {
          ID: 1,
          TITLE: 'Test 1',
          VISIT_ID: '1',
          RB_NUMBER: '1',
          DOI: 'doi 1',
          SIZE: 1,
          INSTRUMENT: {
            NAME: 'LARMOR',
          },
          STARTDATE: '2019-06-10',
          ENDDATE: '2019-06-11',
        },
        {
          ID: 2,
          TITLE: 'Test 2',
          VISIT_ID: '2',
          RB_NUMBER: '2',
          DOI: 'doi 2',
          SIZE: 10000,
          INSTRUMENT: {
            NAME: 'LARMOR',
          },
          STARTDATE: '2019-06-10',
          ENDDATE: '2019-06-12',
        },
      ];

      let updatedState = DGTableReducer(
        state,
        fetchInvestigationsSuccess(mockData)
      );
      expect(updatedState.loading).toBe(false);
      expect(updatedState.data).toEqual(mockData);
      expect(updatedState.error).toBeNull();
    });

    it('should set the error state and reset loading and data state when given a FetchInvestigationsFailure action', () => {
      state.loading = true;

      let updatedState = DGTableReducer(
        state,
        fetchInvestigationsFailure('Test error message')
      );
      expect(updatedState.loading).toBe(false);
      expect(updatedState.data).toEqual([]);
      expect(updatedState.error).toEqual('Test error message');
    });
  });

  describe('FetchDatasets actions', () => {
    it('should set the loading state when given a FetchDatasetsRequest action', () => {
      expect(state.loading).toBe(false);

      let updatedState = DGTableReducer(state, fetchDatasetsRequest());
      expect(updatedState.loading).toBe(true);
    });

    it('should set the data state and reset error and loading state when given a FetchDatasetsSuccess action', () => {
      state.loading = true;
      const mockData: Dataset[] = [
        {
          ID: 1,
          NAME: 'Test 1',
          MOD_TIME: '2019-06-10',
          CREATE_TIME: '2019-06-11',
          INVESTIGATION_ID: 1,
        },
        {
          ID: 2,
          NAME: 'Test 2',
          MOD_TIME: '2019-06-10',
          CREATE_TIME: '2019-06-12',
          INVESTIGATION_ID: 1,
        },
      ];

      let updatedState = DGTableReducer(state, fetchDatasetsSuccess(mockData));
      expect(updatedState.loading).toBe(false);
      expect(updatedState.data).toEqual(mockData);
      expect(updatedState.error).toBeNull();
    });

    it('should set the error state and reset loading and data state when given a FetchDatasetsFailure action', () => {
      state.loading = true;

      let updatedState = DGTableReducer(
        state,
        fetchDatasetsFailure('Test error message')
      );
      expect(updatedState.loading).toBe(false);
      expect(updatedState.data).toEqual([]);
      expect(updatedState.error).toEqual('Test error message');
    });
  });

  describe('FetchDatasetCount actions', () => {
    it('should set the loading state when given a FetchDatasetCountRequest action', () => {
      expect(state.loading).toBe(false);

      let updatedState = DGTableReducer(state, fetchDatasetCountRequest());
      expect(updatedState.loading).toBe(true);
    });

    it('should set the data state and reset error and loading state when given a FetchDatasetCountSuccess action', () => {
      state.loading = true;
      const mockData: Investigation[] = [
        {
          ID: 1,
          TITLE: 'Test 1',
          VISIT_ID: '1',
          RB_NUMBER: '1',
          DOI: 'doi 1',
          SIZE: 1,
          INSTRUMENT: {
            NAME: 'LARMOR',
          },
          STARTDATE: '2019-06-10',
          ENDDATE: '2019-06-11',
        },
        {
          ID: 2,
          TITLE: 'Test 2',
          VISIT_ID: '2',
          RB_NUMBER: '2',
          DOI: 'doi 2',
          SIZE: 10000,
          INSTRUMENT: {
            NAME: 'LARMOR',
          },
          STARTDATE: '2019-06-10',
          ENDDATE: '2019-06-12',
        },
      ];

      state.data = mockData;

      const mockDataUpdated: Investigation[] = [
        { ...mockData[0], DATASET_COUNT: 2 },
        mockData[1],
      ];

      let updatedState = DGTableReducer(state, fetchDatasetCountSuccess(1, 2));
      expect(updatedState.loading).toBe(false);
      expect(updatedState.data).toEqual(mockDataUpdated);
      expect(updatedState.error).toBeNull();
    });

    it('should set the error state when given a FetchDatasetCountFailure action', () => {
      let updatedState = DGTableReducer(
        state,
        fetchDatasetCountFailure('Test error message')
      );
      expect(updatedState.error).toEqual('Test error message');
    });
  });

  describe('FetchDatafiles actions', () => {
    it('should set the loading state when given a FetchDatafilesRequest action', () => {
      expect(state.loading).toBe(false);

      let updatedState = DGTableReducer(state, fetchDatafilesRequest());
      expect(updatedState.loading).toBe(true);
    });

    it('should set the data state and reset error and loading state when given a FetchDatafilesSuccess action', () => {
      state.loading = true;
      const mockData: Datafile[] = [
        {
          ID: 1,
          NAME: 'Test 1',
          LOCATION: '/test1',
          SIZE: 1,
          MOD_TIME: '2019-06-10',
          DATASET_ID: 1,
        },
        {
          ID: 2,
          NAME: 'Test 2',
          LOCATION: '/test2',
          SIZE: 2,
          MOD_TIME: '2019-06-10',
          DATASET_ID: 1,
        },
      ];

      let updatedState = DGTableReducer(state, fetchDatafilesSuccess(mockData));
      expect(updatedState.loading).toBe(false);
      expect(updatedState.data).toEqual(mockData);
      expect(updatedState.error).toBeNull();
    });

    it('should set the error state and reset loading and data state when given a FetchDatafilesFailure action', () => {
      state.loading = true;

      let updatedState = DGTableReducer(
        state,
        fetchDatafilesFailure('Test error message')
      );
      expect(updatedState.loading).toBe(false);
      expect(updatedState.data).toEqual([]);
      expect(updatedState.error).toEqual('Test error message');
    });
  });
});
