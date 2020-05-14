import axios from 'axios';

export default {
  get: jest.fn(path => {
    if (path === '/datagateway-dataview-settings.json') {
      return Promise.resolve({
        data: {
          facilityName: 'Generic',
          idsUrl: 'ids',
          apiUrl: 'api',
          downloadApiUrl: 'download',
          'ui-strings': '/res/default.json',
        },
      });
    } else {
      return Promise.resolve({
        data: {},
      });
    }
  }),
  post: jest.fn(() => Promise.resolve({ data: {} })),
  delete: jest.fn(() => Promise.resolve({ data: {} })),
  CancelToken: axios.CancelToken,
};