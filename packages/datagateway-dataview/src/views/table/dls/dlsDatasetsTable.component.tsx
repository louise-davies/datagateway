import React from 'react';
import TitleIcon from '@material-ui/icons/Title';
import ConfirmationNumberIcon from '@material-ui/icons/ConfirmationNumber';
import CalendarTodayIcon from '@material-ui/icons/CalendarToday';
import {
  Table,
  tableLink,
  Dataset,
  useDatasetCount,
  useDatasetsInfinite,
  parseSearchToQuery,
  useTextFilter,
  useDateFilter,
  ColumnType,
  usePushSort,
  useIds,
  useCart,
  useAddToCart,
  useRemoveFromCart,
  useDatasetsDatafileCount,
} from 'datagateway-common';
import { IndexRange, TableCellProps } from 'react-virtualized';
import DatasetDetailsPanel from '../../detailsPanels/dls/datasetDetailsPanel.component';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router';
import { useSelector } from 'react-redux';
import { StateType } from '../../../state/app.types';

interface DLSDatasetsTableProps {
  proposalName: string;
  investigationId: string;
}

const DLSDatasetsTable = (props: DLSDatasetsTableProps): React.ReactElement => {
  const { investigationId, proposalName } = props;

  const [t] = useTranslation();

  const location = useLocation();

  const selectAllSetting = useSelector(
    (state: StateType) => state.dgdataview.selectAllSetting
  );

  const { filters, sort, view } = React.useMemo(
    () => parseSearchToQuery(location.search),
    [location.search]
  );

  const textFilter = useTextFilter(filters);
  const dateFilter = useDateFilter(filters);
  const pushSort = usePushSort();

  const { data: allIds } = useIds('dataset', [
    {
      filterType: 'where',
      filterValue: JSON.stringify({
        'investigation.id': { eq: parseInt(investigationId) },
      }),
    },
  ]);
  const { data: cartItems } = useCart();
  const { mutate: addToCart, isLoading: addToCartLoading } = useAddToCart(
    'dataset'
  );
  const {
    mutate: removeFromCart,
    isLoading: removeFromCartLoading,
  } = useRemoveFromCart('dataset');

  const { data: totalDataCount } = useDatasetCount([
    {
      filterType: 'where',
      filterValue: JSON.stringify({
        'investigation.id': { eq: investigationId },
      }),
    },
    {
      filterType: 'include',
      filterValue: JSON.stringify('investigation'),
    },
  ]);

  const { fetchNextPage, data } = useDatasetsInfinite([
    {
      filterType: 'where',
      filterValue: JSON.stringify({
        'investigation.id': { eq: investigationId },
      }),
    },
    {
      filterType: 'include',
      filterValue: JSON.stringify('investigation'),
    },
  ]);

  const loadMoreRows = React.useCallback(
    (offsetParams: IndexRange) => fetchNextPage({ pageParam: offsetParams }),
    [fetchNextPage]
  );

  const datafileCountQueries = useDatasetsDatafileCount(data);

  const aggregatedData: Dataset[] = React.useMemo(
    () => (data ? ('pages' in data ? data.pages.flat() : data) : []),
    [data]
  );

  const columns: ColumnType[] = React.useMemo(
    () => [
      {
        icon: TitleIcon,
        label: t('datasets.name'),
        dataKey: 'name',
        cellContentRenderer: (cellProps: TableCellProps) =>
          tableLink(
            `/browse/proposal/${proposalName}/investigation/${investigationId}/dataset/${cellProps.rowData.id}/datafile`,
            cellProps.rowData.name,
            view
          ),
        filterComponent: textFilter,
      },
      {
        icon: ConfirmationNumberIcon,
        label: t('datasets.datafile_count'),
        dataKey: 'datafileCount',
        cellContentRenderer: (cellProps: TableCellProps): number | string => {
          const countQuery = datafileCountQueries[cellProps.rowIndex];
          if (countQuery?.isFetching) {
            return 'Calculating...';
          } else {
            return countQuery?.data ?? 'Unknown';
          }
        },
        disableSort: true,
      },
      {
        icon: CalendarTodayIcon,
        label: t('datasets.create_time'),
        dataKey: 'createTime',
        filterComponent: dateFilter,
      },
      {
        icon: CalendarTodayIcon,

        label: t('datasets.modified_time'),
        dataKey: 'modTime',
        filterComponent: dateFilter,
      },
    ],
    [
      t,
      textFilter,
      dateFilter,
      proposalName,
      investigationId,
      view,
      datafileCountQueries,
    ]
  );

  const selectedRows = React.useMemo(
    () =>
      cartItems
        ?.filter(
          (cartItem) =>
            allIds &&
            cartItem.entityType === 'dataset' &&
            allIds.includes(cartItem.entityId)
        )
        .map((cartItem) => cartItem.entityId),
    [cartItems, allIds]
  );

  return (
    <Table
      loading={addToCartLoading || removeFromCartLoading}
      data={aggregatedData}
      loadMoreRows={loadMoreRows}
      totalRowCount={totalDataCount ?? 0}
      sort={sort}
      onSort={pushSort}
      selectedRows={selectedRows}
      allIds={allIds}
      onCheck={addToCart}
      onUncheck={removeFromCart}
      disableSelectAll={!selectAllSetting}
      detailsPanel={DatasetDetailsPanel}
      columns={columns}
    />
  );
};

export default DLSDatasetsTable;
