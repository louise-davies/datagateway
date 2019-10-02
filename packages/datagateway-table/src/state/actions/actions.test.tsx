import {
  sortTable,
  filterTable,
  getApiFilter,
  loadStrings,
  configureApp,
  configureStrings,
  loadFeatureSwitches,
  loadUrls,
} from '.';
import {
  SortTableType,
  FilterTableType,
  ConfigureStringsType,
  ConfigureFeatureSwitchesType,
  ConfigureURLsType,
} from './actions.types';
import { StateType } from '../app.types';
import { initialState } from '../reducers/dgtable.reducer';
import { RouterState } from 'connected-react-router';
import axios from 'axios';
import * as log from 'loglevel';
import { actions, resetActions, dispatch, getState } from '../../setupTests';

jest.mock('loglevel');

describe('Actions', () => {
  afterEach(() => {
    (axios.get as jest.Mock).mockClear();
    (log.error as jest.Mock).mockClear();
    resetActions();
  });

  describe('getApiFilter', () => {
    const routerState: RouterState = {
      action: 'POP',
      location: {
        hash: '',
        key: '',
        pathname: '/',
        search: '',
        state: {},
      },
    };

    it('given a empty sort and filters it returns an empty object', () => {
      const getState = (): StateType => ({
        dgtable: {
          ...initialState,
        },
        router: routerState,
      });
      const filter = getApiFilter(getState);
      expect(filter).toEqual(new URLSearchParams());
    });

    it('given a single sort column in the sort state it returns an order string', () => {
      const getState = (): StateType => ({
        dgtable: {
          ...initialState,
          sort: { column1: 'asc' },
        },
        router: routerState,
      });
      const filter = getApiFilter(getState);

      const params = new URLSearchParams();
      params.append('order', JSON.stringify('column1 asc'));

      expect(filter).toEqual(params);
    });

    it('given multiple sort column in the sort state it returns a list', () => {
      const getState = (): StateType => ({
        dgtable: {
          ...initialState,
          sort: { column1: 'asc', column2: 'desc' },
        },
        router: routerState,
      });
      const filter = getApiFilter(getState);

      const params = new URLSearchParams();
      params.append('order', JSON.stringify('column1 asc'));
      params.append('order', JSON.stringify('column2 desc'));

      expect(filter).toEqual(params);
    });

    it('given filter state it returns a filter', () => {
      const getState = (): StateType => ({
        dgtable: {
          ...initialState,
          filters: { column1: 'test', column2: 'test2' },
        },
        router: routerState,
      });
      const filter = getApiFilter(getState);

      const params = new URLSearchParams();
      params.append('where', JSON.stringify({ column1: { like: 'test' } }));
      params.append('where', JSON.stringify({ column2: { like: 'test2' } }));

      expect(filter).toEqual(params);
    });

    it('given both sort and filter state it returns both an order and where filter', () => {
      const getState = (): StateType => ({
        dgtable: {
          ...initialState,
          sort: { column1: 'asc', column2: 'desc' },
          filters: { column1: 'test', column2: 'test2' },
        },
        router: routerState,
      });
      const filter = getApiFilter(getState);

      const params = new URLSearchParams();
      params.append('order', JSON.stringify('column1 asc'));
      params.append('order', JSON.stringify('column2 desc'));
      params.append('where', JSON.stringify({ column1: { like: 'test' } }));
      params.append('where', JSON.stringify({ column2: { like: 'test2' } }));

      expect(filter).toEqual(params);
    });
  });

  it('given an column and order sortTable returns a SortTableType with SortTablePayload', () => {
    const action = sortTable('test', 'desc');
    expect(action.type).toEqual(SortTableType);
    expect(action.payload).toEqual({ column: 'test', order: 'desc' });
  });

  it('given an column and filter filterTable returns a FilterTableType with FilterTablePayload', () => {
    const action = filterTable('test', 'filter text');
    expect(action.type).toEqual(FilterTableType);
    expect(action.payload).toEqual({ column: 'test', filter: 'filter text' });
  });

  it('given JSON configureStrings returns a ConfigureStringsType with ConfigureStringsPayload', () => {
    const action = configureStrings({ testSection: { test: 'string' } });
    expect(action.type).toEqual(ConfigureStringsType);
    expect(action.payload).toEqual({
      res: { testSection: { test: 'string' } },
    });
  });

  it('given JSON loadFeatureSwitches returns a ConfigureFeatureSwitchesType with ConfigureFeatureSwitchesPayload', () => {
    const action = loadFeatureSwitches({
      investigationGetSize: true,
      investigationGetCount: true,
      datasetGetSize: true,
      datasetGetCount: true,
    });
    expect(action.type).toEqual(ConfigureFeatureSwitchesType);
    expect(action.payload).toEqual({
      switches: {
        investigationGetSize: true,
        investigationGetCount: true,
        datasetGetSize: true,
        datasetGetCount: true,
      },
    });
  });

  it('given JSON loadUrls returns a ConfigureUrlsType with ConfigureUrlsPayload', () => {
    const action = loadUrls({
      idsUrl: 'ids',
      apiUrl: 'api',
    });
    expect(action.type).toEqual(ConfigureURLsType);
    expect(action.payload).toEqual({
      urls: {
        idsUrl: 'ids',
        apiUrl: 'api',
      },
    });
  });

  it('settings are loaded and configureStrings, loadFeatureSwitches and loadUrls actions are sent', async () => {
    (axios.get as jest.Mock)
      .mockImplementationOnce(() =>
        Promise.resolve({
          data: {
            features: {
              investigationGetSize: true,
              investigationGetCount: true,
              datasetGetSize: true,
              datasetGetCount: true,
            },
            'ui-strings': '/res/default.json',
            idsUrl: 'ids',
            apiUrl: 'api',
          },
        })
      )
      .mockImplementationOnce(() =>
        Promise.resolve({
          data: {
            testSection: { test: 'string' },
          },
        })
      );

    const asyncAction = configureApp();
    await asyncAction(dispatch, getState);

    expect(actions.length).toEqual(3);
    expect(actions).toContainEqual(
      loadFeatureSwitches({
        investigationGetSize: true,
        investigationGetCount: true,
        datasetGetSize: true,
        datasetGetCount: true,
      })
    );
    expect(actions).toContainEqual(
      configureStrings({ testSection: { test: 'string' } })
    );
    expect(actions).toContainEqual(
      loadUrls({
        idsUrl: 'ids',
        apiUrl: 'api',
      })
    );
  });

  it('settings are loaded despite no features and no leading slash on ui-strings', async () => {
    (axios.get as jest.Mock)
      .mockImplementationOnce(() =>
        Promise.resolve({
          data: {
            'ui-strings': 'res/default.json',
            idsUrl: 'ids',
            apiUrl: 'api',
          },
        })
      )
      .mockImplementationOnce(() =>
        Promise.resolve({
          data: {
            testSection: { test: 'string' },
          },
        })
      );

    const asyncAction = configureApp();
    await asyncAction(dispatch, getState);

    expect(actions.length).toEqual(2);
    expect(actions).toContainEqual(
      configureStrings({ testSection: { test: 'string' } })
    );
    expect(actions).toContainEqual(
      loadUrls({
        idsUrl: 'ids',
        apiUrl: 'api',
      })
    );
  });

  it('logs an error if settings.json fails to be loaded', async () => {
    (axios.get as jest.Mock).mockImplementationOnce(() => Promise.reject({}));

    const asyncAction = configureApp();
    await asyncAction(dispatch, getState);

    expect(log.error).toHaveBeenCalled();
    const mockLog = (log.error as jest.Mock).mock;
    expect(mockLog.calls[0][0]).toEqual(
      expect.stringContaining(`Error loading settings.json: `)
    );
  });

  it('logs an error if settings.json is invalid JSON object', async () => {
    (axios.get as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        data: 1,
      })
    );

    const asyncAction = configureApp();
    await asyncAction(dispatch, getState);

    expect(log.error).toHaveBeenCalled();
    const mockLog = (log.error as jest.Mock).mock;
    expect(mockLog.calls[0][0]).toEqual(
      'Error loading settings.json: Invalid format'
    );
  });

  it('logs an error if loadStrings fails to resolve', async () => {
    (axios.get as jest.Mock).mockImplementationOnce(() => Promise.reject({}));

    const path = 'non/existent/path';

    const asyncAction = loadStrings(path);
    await asyncAction(dispatch, getState);

    expect(log.error).toHaveBeenCalled();
    const mockLog = (log.error as jest.Mock).mock;
    expect(mockLog.calls[0][0]).toEqual(
      expect.stringContaining(`Failed to read strings from ${path}: `)
    );
  });
});