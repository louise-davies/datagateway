import React from 'react';
import { StateType } from './state/app.types';
import { Provider } from 'react-redux';
import { MemoryRouter, Router } from 'react-router';

import SearchPageCardView, {
  SearchCardViewProps,
} from './searchPageCardView.component';

import { mount as enzymeMount, ReactWrapper } from 'enzyme';
import { createMount } from '@material-ui/core/test-utils';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { initialState } from './state/reducers/dgsearch.reducer';
import { dGCommonInitialState, CartProps } from 'datagateway-common';
import axios from 'axios';
import { QueryClientProvider, QueryClient } from 'react-query';
import { Store } from 'redux';
import DatasetCardView from './card/datasetSearchCardView.component';
import DatafileSearchTable from './table/datafileSearchTable.component';
import { createMemoryHistory, History } from 'history';
import InvestigationCardView from './card/investigationSearchCardView.component';

jest.mock('datagateway-common', () => ({
  ...jest.requireActual('datagateway-common'),
  __esModule: true,
  // mock card view to opt out of rendering them in these tests as there's no need
  CardView: jest.fn(() => 'MockedCardView'),
}));

describe('SearchPageCardView', () => {
  let mount: typeof enzymeMount;
  let state: StateType;
  let history: History;
  let props: SearchCardViewProps & CartProps;

  const mockStore = configureStore([thunk]);
  const onTabChange = jest.fn();
  const navigateToDownload = jest.fn();

  const createWrapper = (
    store: Store = mockStore(state),
    props: SearchCardViewProps & CartProps
  ): ReactWrapper => {
    return mount(
      <Provider store={store}>
        <Router history={history}>
          <QueryClientProvider client={new QueryClient()}>
            <SearchPageCardView {...props} />
          </QueryClientProvider>
        </Router>
      </Provider>
    );
  };

  beforeEach(() => {
    mount = createMount();
    history = createMemoryHistory({
      initialEntries: ['/search/data'],
    });
    state = JSON.parse(
      JSON.stringify({
        dgsearch: initialState,
        dgcommon: dGCommonInitialState,
      })
    );

    props = {
      onTabChange: onTabChange,
      currentTab: 'investigation',
      cartItems: [],
      navigateToDownload: navigateToDownload,
    };

    (axios.get as jest.Mock).mockImplementation((url) => {
      if (url.includes('count')) {
        return Promise.resolve({ data: 0 });
      } else {
        return Promise.resolve({ data: [] });
      }
    });
  });

  afterEach(() => {
    onTabChange.mockClear();
    navigateToDownload.mockClear();
  });

  it('renders correctly when request received', () => {
    state.dgsearch = {
      ...state.dgsearch,
      tabs: {
        datasetTab: true,
        datafileTab: true,
        investigationTab: true,
      },
    };
    (axios.get as jest.Mock).mockImplementation((url) => {
      if (url.includes('count')) {
        return Promise.resolve({ data: 1 });
      } else {
        return Promise.resolve({ data: Array(1) });
      }
    });

    const createWrapper = (store: Store = mockStore(state)): ReactWrapper => {
      return mount(
        <Provider store={store}>
          <MemoryRouter
            initialEntries={[{ key: 'testKey', pathname: '/search/data' }]}
          >
            <QueryClientProvider client={new QueryClient()}>
              <SearchPageCardView {...props} />
            </QueryClientProvider>
          </MemoryRouter>
        </Provider>
      );
    };
    const testStore = mockStore(state);
    const wrapper = createWrapper(testStore);
    expect(wrapper).toMatchSnapshot();
  });

  it('changes selected tab value on click of a new tab', () => {
    history.replace('/search/data?view=card&page=2&results=20&searchText=');
    state.dgsearch = {
      ...state.dgsearch,
      tabs: {
        datasetTab: true,
        datafileTab: true,
        investigationTab: true,
      },
    };

    const testStore = mockStore(state);
    const wrapper = createWrapper(testStore, props);

    expect(wrapper.exists(InvestigationCardView)).toBeTruthy();

    wrapper
      .find('[aria-controls="simple-tabpanel-dataset"]')
      .first()
      .simulate('click');

    expect(onTabChange).toHaveBeenNthCalledWith(1, 'dataset');
  });

  it('has the investigation search card view component when on the investigation tab', () => {
    const updatedProps = {
      ...props,
      currentTab: 'investigation',
    };

    const testStore = mockStore(state);
    const wrapper = createWrapper(testStore, updatedProps);
    expect(wrapper.exists(InvestigationCardView)).toBeTruthy();
  });

  it('has the dataset search card view component when on the dataset tab', () => {
    const updatedProps = {
      ...props,
      currentTab: 'dataset',
    };

    // Mock to prevent error logging
    const spy = jest.spyOn(console, 'error').mockImplementation();
    const testStore = mockStore(state);
    const wrapper = createWrapper(testStore, updatedProps);

    expect(wrapper.exists(DatasetCardView)).toBeTruthy();
    spy.mockRestore();
  });

  it('has the datafile search table component when on the datafile tab', () => {
    const updatedProps = {
      ...props,
      currentTab: 'datafile',
    };

    // Mock to prevent error logging
    const spy = jest.spyOn(console, 'error').mockImplementation();
    const testStore = mockStore(state);
    const wrapper = createWrapper(testStore, updatedProps);

    expect(wrapper.exists(DatafileSearchTable)).toBeTruthy();
    spy.mockRestore();
  });
});
