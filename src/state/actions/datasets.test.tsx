import {
  fetchDatasets,
  fetchDatasetsRequest,
  fetchDatasetsSuccess,
  fetchDatasetsFailure,
} from '.';
import { StateType, Dataset } from '../app.types';
import { initialState } from '../reducers/dgtable.reducer';
import { Action } from 'redux';
import axios from 'axios';
import {
  fetchDatasetCount,
  fetchDatasetCountRequest,
  fetchDatasetCountSuccess,
  fetchDatasetCountFailure,
} from './datasets';
import { fetchDatafileCountRequest } from './datafiles';

describe('Dataset actions', () => {
  afterEach(() => {
    (axios.get as jest.Mock).mockClear();
  });

  it('dispatches fetchDatasetsRequest and fetchDatasetsSuccess actions upon successful fetchDatasets action', async () => {
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

    (axios.get as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        data: mockData,
      })
    );

    const asyncAction = fetchDatasets(1);
    const actions: Action[] = [];
    const dispatch = (action: Action): void | Promise<void> => {
      if (typeof action === 'function') {
        action(dispatch);
        return Promise.resolve();
      } else {
        actions.push(action);
      }
    };
    const getState = (): Partial<StateType> => ({ dgtable: initialState });

    await asyncAction(dispatch, getState, null);

    expect(actions[0]).toEqual(fetchDatasetsRequest());
    expect(actions[1]).toEqual(fetchDatasetsSuccess(mockData));
    expect(actions[2]).toEqual(fetchDatafileCountRequest());
    expect(actions[3]).toEqual(fetchDatafileCountRequest());
    expect(axios.get).toHaveBeenCalledWith(
      '/datasets',
      expect.objectContaining({
        params: {
          filter: {
            where: { INVESTIGATION_ID: 1 },
          },
        },
      })
    );
  });

  it('fetchDatasets action applies filters and sort state to request params', async () => {
    (axios.get as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        data: [],
      })
    );

    const asyncAction = fetchDatasets(1);
    const actions: Action[] = [];
    const dispatch = (action: Action): void | Promise<void> => {
      if (typeof action === 'function') {
        action(dispatch);
        return Promise.resolve();
      } else {
        actions.push(action);
      }
    };
    const getState = (): Partial<StateType> => ({
      dgtable: {
        ...initialState,
        sort: { column: 'column1', order: 'desc' },
        filters: { column1: '1', column2: '2' },
      },
    });

    await asyncAction(dispatch, getState, null);

    expect(actions[0]).toEqual(fetchDatasetsRequest());

    expect(actions[1]).toEqual(fetchDatasetsSuccess([]));

    expect(axios.get).toHaveBeenCalledWith(
      '/datasets',
      expect.objectContaining({
        params: {
          filter: {
            order: 'column1 desc',
            where: { column1: '1', column2: '2', INVESTIGATION_ID: 1 },
          },
        },
      })
    );
  });

  it('dispatches fetchDatasetsRequest and fetchDatasetsFailure actions upon unsuccessful fetchDatasets action', async () => {
    (axios.get as jest.Mock).mockImplementationOnce(() =>
      Promise.reject({
        message: 'Test error message',
      })
    );

    const asyncAction = fetchDatasets(1);
    const actions: Action[] = [];
    const dispatch = (action: Action): void | Promise<void> => {
      if (typeof action === 'function') {
        action(dispatch);
        return Promise.resolve();
      } else {
        actions.push(action);
      }
    };
    const getState = (): Partial<StateType> => ({ dgtable: initialState });

    await asyncAction(dispatch, getState, null);

    expect(actions[0]).toEqual(fetchDatasetsRequest());
    expect(actions[1]).toEqual(fetchDatasetsFailure('Test error message'));
  });

  it('dispatches fetchDatasetCountRequest and fetchDatasetCountSuccess actions upon successful fetchDatasetCount action', async () => {
    (axios.get as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        data: 2,
      })
    );

    const asyncAction = fetchDatasetCount(1);
    const actions: Action[] = [];
    const dispatch = (action: Action): void | Promise<void> => {
      if (typeof action === 'function') {
        action(dispatch);
        return Promise.resolve();
      } else {
        actions.push(action);
      }
    };
    const getState = (): Partial<StateType> => ({ dgtable: initialState });

    await asyncAction(dispatch, getState, null);

    expect(actions[0]).toEqual(fetchDatasetCountRequest());
    expect(actions[1]).toEqual(fetchDatasetCountSuccess(1, 2));
    expect(axios.get).toHaveBeenCalledWith(
      '/datasets/count',
      expect.objectContaining({
        params: {
          filter: {
            where: { INVESTIGATION_ID: 1 },
          },
        },
      })
    );
  });

  it('dispatches fetchDatasetCountRequest and fetchDatasetCountFailure actions upon unsuccessful fetchDatasetCount action', async () => {
    (axios.get as jest.Mock).mockImplementationOnce(() =>
      Promise.reject({
        message: 'Test error message',
      })
    );

    const asyncAction = fetchDatasetCount(1);
    const actions: Action[] = [];
    const dispatch = (action: Action): void | Promise<void> => {
      if (typeof action === 'function') {
        action(dispatch);
        return Promise.resolve();
      } else {
        actions.push(action);
      }
    };
    const getState = (): Partial<StateType> => ({ dgtable: initialState });

    await asyncAction(dispatch, getState, null);

    expect(actions[0]).toEqual(fetchDatasetCountRequest());
    expect(actions[1]).toEqual(fetchDatasetCountFailure('Test error message'));
  });
});
