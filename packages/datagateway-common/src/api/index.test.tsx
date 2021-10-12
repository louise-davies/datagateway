import {
  getApiParams,
  nestedValue,
  parseQueryToSearch,
  parseSearchToQuery,
  useCustomFilter,
  useIds,
  usePushFilters,
  usePushPage,
  usePushResults,
  usePushSort,
  usePushView,
} from './index';
import {
  FiltersType,
  Investigation,
  QueryParams,
  SortType,
} from '../app.types';
import {
  act,
  renderHook,
  WrapperComponent,
} from '@testing-library/react-hooks';
import { createMemoryHistory, History } from 'history';
import React from 'react';
import { Router } from 'react-router-dom';
import axios from 'axios';
import handleICATError from '../handleICATError';

import { createReactQueryWrapper } from '../setupTests';
import { useCustomFilterCount } from '..';

jest.mock('../handleICATError');

describe('generic api functions', () => {
  afterEach(() => {
    (handleICATError as jest.Mock).mockClear();
    (axios.get as jest.Mock).mockClear();
  });

  describe('nestedValue', () => {
    it('nestedValue returns correct nested data', () => {
      const investigation: Investigation = {
        id: 0,
        name: 'test',
        title: 'Investigation title',
        visitId: '1',
        facility: {
          id: 1,
          name: 'Test Facility',
        },
      };
      expect(nestedValue(investigation, 'facility.name')).toEqual(
        'Test Facility'
      );
    });

    it('nestedValue returns correct nested data including array indices', () => {
      const investigation: Investigation = {
        id: 0,
        name: 'test',
        title: 'Investigation title',
        visitId: '1',
        investigationInstruments: [
          {
            id: 0,
            instrument: {
              id: 1,
              name: 'Instrument 1',
            },
          },
        ],
      };
      expect(
        nestedValue(
          investigation,
          'investigationInstruments[0].instrument.name'
        )
      ).toEqual('Instrument 1');
    });

    it('nestedValue returns empty string when provided with a falsy entry', () => {
      const investigation: Investigation = {
        id: 0,
        name: 'test',
        title: 'Investigation title',
        visitId: '1',
      };
      expect(nestedValue(investigation, 'summary')).toEqual('');
    });
  });

  describe('parseSearchToQuery', () => {
    it('parses query string successfully', () => {
      const query =
        '?view=table&search=test&page=1&results=10&filters={"name"%3A{"value"%3A"test"%2C"type"%3A"include"}}&sort={"name"%3A"asc"}';

      expect(parseSearchToQuery(query)).toEqual({
        view: 'table',
        search: 'test',
        page: 1,
        results: 10,
        filters: { name: { value: 'test', type: 'include' } },
        sort: { name: 'asc' },
      });
    });

    it('logs errors if filter or search params are wrong', () => {
      console.error = jest.fn();

      const query = '?filters={"name"%3A"test"&sort=["name","asc"';
      parseSearchToQuery(query);

      expect(console.error).toHaveBeenCalledWith(
        'Filter query provided in an incorrect format.'
      );
      expect(console.error).toHaveBeenCalledWith(
        'Sort query provided in an incorrect format.'
      );
    });
  });

  describe('parseQueryToSearch', () => {
    it('parses query object successfully', () => {
      const query: QueryParams = {
        view: 'table',
        search: 'test',
        page: 1,
        results: 10,
        filters: { name: { value: 'test', type: 'include' } },
        sort: { name: 'asc' },
      };

      const params = new URLSearchParams(
        '?view=table&search=test&page=1&results=10&filters={"name"%3A{"value"%3A"test"%2C"type"%3A"include"}}&sort={"name"%3A"asc"}'
      );

      expect(parseQueryToSearch(query).toString()).toEqual(params.toString());
    });
  });

  describe('getApiParams', () => {
    it('parses all filter types to api params successfully', () => {
      const sortAndFilters: { sort: SortType; filters: FiltersType } = {
        filters: {
          name: { value: 'test', type: 'include' },
          title: { value: 'test', type: 'exclude' },
          startDate: {
            startDate: '2021-08-05',
            endDate: '2021-08-06',
          },
          type: ['1', '2', '3'],
        },
        sort: { name: 'asc' },
      };

      const params = new URLSearchParams();
      params.append('order', JSON.stringify('name asc'));
      params.append('order', JSON.stringify('id asc'));
      params.append('where', JSON.stringify({ name: { like: 'test' } }));
      params.append('where', JSON.stringify({ title: { nlike: 'test' } }));
      params.append(
        'where',
        JSON.stringify({ startDate: { gte: '2021-08-05 00:00:00' } })
      );
      params.append(
        'where',
        JSON.stringify({ startDate: { lte: '2021-08-06 23:59:59' } })
      );
      params.append('where', JSON.stringify({ type: { in: ['1', '2', '3'] } }));

      expect(getApiParams(sortAndFilters).toString()).toEqual(
        params.toString()
      );
    });
  });

  describe('push functions', () => {
    let history: History;
    let wrapper: WrapperComponent<unknown>;
    let pushSpy: jest.SpyInstance;
    beforeEach(() => {
      history = createMemoryHistory();
      pushSpy = jest.spyOn(history, 'push');
      const newWrapper: WrapperComponent<unknown> = ({ children }) => (
        <Router history={history}>{children}</Router>
      );
      wrapper = newWrapper;
    });

    afterEach(() => {
      jest.restoreAllMocks();
      jest.resetModules();
    });

    describe('usePushSort', () => {
      it('returns callback that when called pushes a new sort to the url query', () => {
        const { result } = renderHook(() => usePushSort(), {
          wrapper,
        });

        act(() => {
          result.current('name', 'asc');
        });

        expect(pushSpy).toHaveBeenCalledWith({
          search: `?sort=${encodeURIComponent('{"name":"asc"}')}`,
        });
      });

      it('returns callback that when called removes a null sort from the url query', () => {
        jest.mock('./index.tsx', () => ({
          ...jest.requireActual('./index.tsx'),
          parseSearchToQuery: jest.fn(
            () => '?sort=%7B%22name%22%3A%22asc%22%7D'
          ),
        }));

        const { result } = renderHook(() => usePushSort(), {
          wrapper,
        });

        act(() => {
          result.current('name', null);
        });

        expect(pushSpy).toHaveBeenCalledWith({
          search: '?',
        });
      });
    });

    describe('usePushFilters', () => {
      it('returns callback that when called pushes a new filter to the url query', () => {
        const { result } = renderHook(() => usePushFilters(), {
          wrapper,
        });

        act(() => {
          result.current('name', { value: 'test', type: 'include' });
        });

        expect(pushSpy).toHaveBeenCalledWith({
          search: `?filters=${encodeURIComponent(
            '{"name":{"value":"test","type":"include"}}'
          )}`,
        });
      });

      it('returns callback that when called removes a null sort from the url query', () => {
        jest.mock('./index.tsx', () => ({
          ...jest.requireActual('./index.tsx'),
          parseSearchToQuery: jest.fn(
            () =>
              '?filters=%7B%22name%22%3A%7B%22value%22%3A%22test%22%2C%22type%22%3A%22include%22%7D%7D'
          ),
        }));

        const { result } = renderHook(() => usePushFilters(), {
          wrapper,
        });

        act(() => {
          result.current('name', null);
        });

        expect(pushSpy).toHaveBeenCalledWith({
          search: '?',
        });
      });
    });

    describe('usePushPage', () => {
      it('returns callback that when called pushes a new page to the url query', () => {
        const { result } = renderHook(() => usePushPage(), {
          wrapper,
        });

        act(() => {
          result.current(1);
        });

        expect(pushSpy).toHaveBeenCalledWith('?page=1');
      });
    });

    describe('usePushResults', () => {
      it('returns callback that when called pushes a new page to the url query', () => {
        const { result } = renderHook(() => usePushResults(), {
          wrapper,
        });

        act(() => {
          result.current(10);
        });

        expect(pushSpy).toHaveBeenCalledWith('?results=10');
      });
    });

    describe('usePushView', () => {
      it('returns callback that when called pushes a new page to the url query', () => {
        const { result } = renderHook(() => usePushView(), {
          wrapper,
        });

        act(() => {
          result.current('table');
        });

        expect(pushSpy).toHaveBeenCalledWith('?view=table');
      });
    });
  });

  describe('useIds', () => {
    it('sends axios request to fetch ids and returns successful response', async () => {
      (axios.get as jest.Mock).mockResolvedValue({
        data: [{ id: 1 }, { id: 2 }, { id: 3 }],
      });

      const { result, waitFor } = renderHook(
        () =>
          useIds('investigation', [
            { filterType: 'distinct', filterValue: '"name"' },
          ]),
        {
          wrapper: createReactQueryWrapper(),
        }
      );

      await waitFor(() => result.current.isSuccess);

      const params = new URLSearchParams();
      params.append('order', JSON.stringify('id asc'));
      params.append('distinct', JSON.stringify(['name', 'id']));

      expect(axios.get).toHaveBeenCalledWith(
        'https://example.com/api/investigations',
        expect.objectContaining({
          params,
        })
      );
      expect((axios.get as jest.Mock).mock.calls[0][1].params.toString()).toBe(
        params.toString()
      );
      expect(result.current.data).toEqual([1, 2, 3]);
    });

    it('sends axios request to fetch ids and calls handleICATError on failure', async () => {
      (axios.get as jest.Mock).mockRejectedValue({
        message: 'Test error',
      });
      const { result, waitFor } = renderHook(() => useIds('investigation'), {
        wrapper: createReactQueryWrapper(),
      });

      await waitFor(() => result.current.isError);

      expect(handleICATError).toHaveBeenCalledWith({ message: 'Test error' });
    });
  });

  describe('useCustomFilter', () => {
    it('sends axios request to fetch filters and returns successful response', async () => {
      (axios.get as jest.Mock).mockResolvedValue({
        data: [{ title: '1' }, { title: '2' }, { title: '3' }],
      });

      const { result, waitFor } = renderHook(
        () =>
          useCustomFilter('investigation', 'title', [
            { filterType: 'distinct', filterValue: '"name"' },
          ]),
        {
          wrapper: createReactQueryWrapper(),
        }
      );

      await waitFor(() => result.current.isSuccess);

      const params = new URLSearchParams();
      params.append('distinct', JSON.stringify(['name', 'title']));

      expect(axios.get).toHaveBeenCalledWith(
        'https://example.com/api/investigations',
        expect.objectContaining({
          params,
        })
      );
      expect((axios.get as jest.Mock).mock.calls[0][1].params.toString()).toBe(
        params.toString()
      );
      expect(result.current.data).toEqual(['1', '2', '3']);
    });

    it('sends axios request to fetch filters and calls handleICATError on failure', async () => {
      (axios.get as jest.Mock).mockRejectedValue({
        message: 'Test error',
      });
      const { result, waitFor } = renderHook(
        () => useCustomFilter('investigation', 'title'),
        {
          wrapper: createReactQueryWrapper(),
        }
      );

      await waitFor(() => result.current.isError);

      expect(handleICATError).toHaveBeenCalledWith({ message: 'Test error' });
    });
  });

  describe('useCustomFilterCount', () => {
    it('sends axios request to fetch filter counts and returns successful response', async () => {
      const filterKey = 'title';
      (axios.get as jest.Mock).mockImplementation((url, options) =>
        Promise.resolve({
          data: JSON.parse(options.params.get('where'))[filterKey].eq ?? 0,
        })
      );

      const { result, waitFor } = renderHook(
        () => useCustomFilterCount('investigation', 'title', ['1', '2', '3']),
        {
          wrapper: createReactQueryWrapper(),
        }
      );

      await waitFor(() => result.current.every((query) => query.isSuccess));

      const params = new URLSearchParams();
      params.append(
        'where',
        JSON.stringify({
          [filterKey]: { eq: '1' },
        })
      );
      expect(axios.get).toHaveBeenNthCalledWith(
        1,
        'https://example.com/api/investigations/count',
        expect.objectContaining({
          params,
        })
      );
      expect((axios.get as jest.Mock).mock.calls[0][1].params.toString()).toBe(
        params.toString()
      );

      params.set(
        'where',
        JSON.stringify({
          [filterKey]: { eq: '2' },
        })
      );
      expect(axios.get).toHaveBeenNthCalledWith(
        2,
        'https://example.com/api/investigations/count',
        expect.objectContaining({
          params,
        })
      );
      expect((axios.get as jest.Mock).mock.calls[1][1].params.toString()).toBe(
        params.toString()
      );

      params.set(
        'where',
        JSON.stringify({
          [filterKey]: { eq: '3' },
        })
      );
      expect(axios.get).toHaveBeenNthCalledWith(
        3,
        'https://example.com/api/investigations/count',
        expect.objectContaining({
          params,
        })
      );
      expect((axios.get as jest.Mock).mock.calls[2][1].params.toString()).toBe(
        params.toString()
      );

      expect(result.current.map((query) => query.data)).toEqual([
        '1',
        '2',
        '3',
      ]);
    });

    it('sends axios request to fetch filter counts and calls handleICATError on failure', async () => {
      (axios.get as jest.Mock).mockRejectedValue({
        message: 'Test error',
      });

      const { result, waitFor } = renderHook(
        () => useCustomFilterCount('investigation', 'title', ['1', '2', '3']),
        {
          wrapper: createReactQueryWrapper(),
        }
      );

      await waitFor(() => result.current.every((query) => query.isError));

      expect(handleICATError).toHaveBeenCalledTimes(3);
      expect(result.current.map((query) => query.error)).toEqual(
        Array(3).fill({ message: 'Test error' })
      );
    });
  });
});