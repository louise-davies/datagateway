import { Investigation, Filter, Order } from '../app.types';

// parent app actions
export const RegisterRouteType = 'daaas:api:register_route';
export const RequestPluginRerenderType = 'daaas:api:plugin_rerender';

// internal actions
export const SortTableType = 'datagateway_table:sort_table';
export const FilterTableType = 'datagateway_table:filter_table';
export const FetchInvestigationsRequestType =
  'datagateway_table:fetch_investigations_request';
export const FetchInvestigationsFailureType =
  'datagateway_table:fetch_investigations_failure';
export const FetchInvestigationsSuccessType =
  'datagateway_table:fetch_investigations_success';

export interface SortTablePayload {
  column: string;
  order: Order;
}

export interface FilterTablePayload {
  column: string;
  filter: Filter;
}

export interface FetchInvestigationsFailurePayload {
  error: string;
}

export interface FetchInvestigationsSuccessPayload {
  investigations: Investigation[];
}
