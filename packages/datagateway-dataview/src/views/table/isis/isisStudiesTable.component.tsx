import {
  Table,
  tableLink,
  parseSearchToQuery,
  useStudiesInfinite,
  useStudyCount,
  ColumnType,
  Study,
  useDateFilter,
  usePushSort,
  useTextFilter,
} from 'datagateway-common';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { IndexRange, TableCellProps } from 'react-virtualized';

import PublicIcon from '@material-ui/icons/Public';
import FingerprintIcon from '@material-ui/icons/Fingerprint';
import TitleIcon from '@material-ui/icons/Title';
import CalendarTodayIcon from '@material-ui/icons/CalendarToday';
import { useLocation } from 'react-router';
import { format, sub, set } from 'date-fns';

interface ISISStudiesTableProps {
  instrumentId: string;
}

const ISISStudiesTable = (props: ISISStudiesTableProps): React.ReactElement => {
  const { instrumentId } = props;

  const location = useLocation();
  const [t] = useTranslation();

  const { filters, view, sort } = React.useMemo(
    () => parseSearchToQuery(location.search),
    [location.search]
  );

  const unembargoDate = format(
    // set s and ms to 0 to escape recursive loop of fetching data every time they change
    sub(set(new Date(), { seconds: 0, milliseconds: 0 }), { years: 3 }),
    'yyyy-MM-dd HH:mm:ss'
  );

  const { data: totalDataCount } = useStudyCount([
    {
      filterType: 'where',
      filterValue: JSON.stringify({
        'studyInvestigations.investigation.investigationInstruments.instrument.id': {
          eq: instrumentId,
        },
      }),
    },
    {
      filterType: 'where',
      filterValue: JSON.stringify({
        // TODO: check exactly how ISIS does this
        'studyInvestigations.investigation.endDate': {
          lte: unembargoDate,
        },
      }),
    },
  ]);
  const { fetchNextPage, data } = useStudiesInfinite([
    {
      filterType: 'where',
      filterValue: JSON.stringify({
        'studyInvestigations.investigation.investigationInstruments.instrument.id': {
          eq: instrumentId,
        },
      }),
    },
    {
      filterType: 'where',
      filterValue: JSON.stringify({
        // TODO: check exactly how ISIS does this
        'studyInvestigations.investigation.endDate': {
          lte: unembargoDate,
        },
      }),
    },
    {
      filterType: 'include',
      filterValue: JSON.stringify({
        studyInvestigations: 'investigation',
      }),
    },
  ]);

  const aggregatedData: Study[] = React.useMemo(
    () => (data ? ('pages' in data ? data.pages.flat() : data) : []),
    [data]
  );

  const textFilter = useTextFilter(filters);
  const dateFilter = useDateFilter(filters);
  const pushSort = usePushSort();

  const loadMoreRows = React.useCallback(
    (offsetParams: IndexRange) => fetchNextPage({ pageParam: offsetParams }),
    [fetchNextPage]
  );

  const columns: ColumnType[] = React.useMemo(() => {
    const pathRoot = 'browseStudyHierarchy';
    const instrumentChild = 'study';
    return [
      {
        icon: FingerprintIcon,
        label: t('studies.name'),
        dataKey: 'name',
        cellContentRenderer: (cellProps: TableCellProps) =>
          tableLink(
            `/${pathRoot}/instrument/${instrumentId}/${instrumentChild}/${cellProps.rowData.id}`,
            cellProps.rowData.name,
            view
          ),
        filterComponent: textFilter,
      },
      {
        icon: TitleIcon,
        label: t('studies.title'),
        dataKey: 'studyInvestigations.investigation.title',
        cellContentRenderer: (cellProps: TableCellProps) =>
          (cellProps.rowData as Study)?.studyInvestigations?.[0]?.investigation
            ?.title ?? '',
        filterComponent: textFilter,
      },
      {
        icon: PublicIcon,
        label: t('studies.pid'),
        dataKey: 'pid',
        filterComponent: textFilter,
      },
      {
        icon: CalendarTodayIcon,
        label: t('studies.start_date'),
        dataKey: 'studyInvestigations.investigation.startDate',
        cellContentRenderer: (cellProps: TableCellProps) =>
          (cellProps.rowData as Study)?.studyInvestigations?.[0]?.investigation
            ?.startDate ?? '',
        filterComponent: dateFilter,
      },
      {
        icon: CalendarTodayIcon,
        label: t('studies.end_date'),
        dataKey: 'studyInvestigations.investigation.endDate',
        cellContentRenderer: (cellProps: TableCellProps) =>
          (cellProps.rowData as Study)?.studyInvestigations?.[0]?.investigation
            ?.endDate ?? '',
        filterComponent: dateFilter,
      },
    ];
  }, [t, textFilter, dateFilter, instrumentId, view]);

  return (
    <Table
      data={aggregatedData}
      loadMoreRows={loadMoreRows}
      totalRowCount={totalDataCount ?? 0}
      sort={sort}
      onSort={pushSort}
      columns={columns}
    />
  );
};

export default ISISStudiesTable;
