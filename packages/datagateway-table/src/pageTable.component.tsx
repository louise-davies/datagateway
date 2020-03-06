import React from 'react';

import { Switch, Route, RouteComponentProps } from 'react-router';
import { Link } from 'react-router-dom';

import InvestigationTable from './table/investigationTable.component';
import DatasetTable from './table/datasetTable.component';
import DatafileTable from './table/datafileTable.component';

import DLSProposalsTable from './dls/tables/dlsProposalsTable.component';
import DLSVisitsTable from './dls/tables/dlsVisitsTable.component';
import DLSDatasetsTable from './dls/tables/dlsDatasetsTable.component';
import DLSDatafilesTable from './dls/tables/dlsDatafilesTable.component';

import ISISInstrumentsTable from './isis/tables/isisInstrumentsTable.component';
import ISISFacilityCyclesTable from './isis/tables/isisFacilityCyclesTable.component';
import ISISInvestigationsTable from './isis/tables/isisInvestigationsTable.component';
import ISISDatasetsTable from './isis/tables/isisDatasetsTable.component';
import ISISDatafilesTable from './isis/tables/isisDatafilesTable.component';
import DLSMyDataTable from './dls/tables/dlsMyDataTable.component';
import ISISMyDataTable from './isis/tables/isisMyDataTable.component';

class PageTable extends React.Component {
  public render(): React.ReactNode {
    return (
      <Switch>
        <Route
          exact
          path="/"
          render={() => (
            <Link to="/browse/investigation">Browse investigations</Link>
          )}
        />
        <Route path="/my-data/DLS" component={DLSMyDataTable} />
        <Route path="/my-data/ISIS" component={ISISMyDataTable} />
        <Route exact path="/browse/proposal/" component={DLSProposalsTable} />
        <Route
          exact
          path="/browse/proposal/:proposalName/investigation"
          render={({
            match,
          }: RouteComponentProps<{ proposalName: string }>) => (
            <DLSVisitsTable proposalName={match.params.proposalName} />
          )}
        />
        <Route
          exact
          path="/browse/proposal/:proposalName/investigation/:investigationId/dataset"
          render={({
            match,
          }: RouteComponentProps<{
            proposalName: string;
            investigationId: string;
          }>) => (
            <DLSDatasetsTable
              proposalName={match.params.proposalName}
              investigationId={match.params.investigationId}
            />
          )}
        />
        <Route
          exact
          path="/browse/proposal/:proposalName/investigation/:investigationId/dataset/:datasetId/datafile"
          render={({
            match,
          }: RouteComponentProps<{
            proposalName: string;
            investigationId: string;
            datasetId: string;
          }>) => <DLSDatafilesTable datasetId={match.params.datasetId} />}
        />
        <Route
          exact
          path="/browse/instrument/"
          component={ISISInstrumentsTable}
        />
        <Route
          exact
          path="/browse/instrument/:instrumentId/facilityCycle"
          render={({
            match,
          }: RouteComponentProps<{ instrumentId: string }>) => (
            <ISISFacilityCyclesTable instrumentId={match.params.instrumentId} />
          )}
        />
        <Route
          exact
          path="/browse/instrument/:instrumentId/facilityCycle/:facilityCycleId/investigation"
          render={({
            match,
          }: RouteComponentProps<{
            instrumentId: string;
            facilityCycleId: string;
          }>) => (
            <ISISInvestigationsTable
              instrumentId={match.params.instrumentId}
              facilityCycleId={match.params.facilityCycleId}
            />
          )}
        />
        <Route
          exact
          path="/browse/instrument/:instrumentId/facilityCycle/:facilityCycleId/investigation/:investigationId/dataset"
          render={({
            match,
          }: RouteComponentProps<{
            instrumentId: string;
            facilityCycleId: string;
            investigationId: string;
          }>) => (
            <ISISDatasetsTable
              instrumentId={match.params.instrumentId}
              facilityCycleId={match.params.facilityCycleId}
              investigationId={match.params.investigationId}
            />
          )}
        />
        <Route
          exact
          path="/browse/instrument/:instrumentId/facilityCycle/:facilityCycleId/investigation/:investigationId/dataset/:datasetId/datafile"
          render={({
            match,
          }: RouteComponentProps<{
            datasetId: string;
          }>) => {
            return <ISISDatafilesTable datasetId={match.params.datasetId} />;
          }}
        />
        <Route
          exact
          path="/browse/investigation/"
          component={InvestigationTable}
        />
        <Route
          exact
          path="/browse/investigation/:investigationId/dataset"
          render={({
            match,
          }: RouteComponentProps<{ investigationId: string }>) => (
            <DatasetTable investigationId={match.params.investigationId} />
          )}
        />
        <Route
          exact
          path="/browse/investigation/:investigationId/dataset/:datasetId/datafile"
          render={({ match }: RouteComponentProps<{ datasetId: string }>) => (
            <DatafileTable datasetId={match.params.datasetId} />
          )}
        />
      </Switch>
    );
  }
}

export default PageTable;