import React from 'react';
import { Switch, Route, RouteComponentProps } from 'react-router';

import InvestigationCardView from '../views/card/investigationCardView.component';
import DatasetCardView from '../views/card/datasetCardView.component';

// TODO: Add back in.
// import ISISInstrumentsCardView from '../views/card/isis/isisInstrumentsCardView.component';
// import ISISFacilityCyclesCardView from '../views/card/isis/isisFacilityCyclesCardView.component';
// import ISISInvestigationsCardView from '../views/card/isis/isisInvestigationCardView.component';
// import ISISDatasetsCardView from '../views/card/isis/isisDatasetsCardView.component';

// import DLSProposalsCardView from '../views/card/dls/dlsProposalsCardView.component';
// import DLSVisitsCardView from '../views/card/dls/dlsVisitsCardView.component';
// import DLSDatasetsCardView from '../views/card/dls/dlsDatasetsCardView.component';

import { paths } from './pageContainer.component';

// TODO: Add back in relevant cards.
class PageCard extends React.Component {
  public render(): React.ReactNode {
    return (
      <Switch>
        <Route
          exact
          path={paths.toggle.investigation}
          render={() => <InvestigationCardView />}
        />
        <Route
          exact
          path={paths.toggle.dataset}
          render={({
            match,
          }: RouteComponentProps<{ investigationId: string }>) => (
            <DatasetCardView investigationId={match.params.investigationId} />
          )}
        />
        {/* <Route
          exact
          path={paths.toggle.isisInstrument}
          render={() => <ISISInstrumentsCardView />}
        />
        <Route
          exact
          path={paths.toggle.isisFacilityCycle}
          render={({
            match,
          }: RouteComponentProps<{ instrumentId: string }>) => (
            <ISISFacilityCyclesCardView
              instrumentId={match.params.instrumentId}
            />
          )}
        />
        <Route
          exact
          path={paths.toggle.isisInvestigation}
          render={({
            match,
          }: RouteComponentProps<{
            instrumentId: string;
            facilityCycleId: string;
          }>) => (
            <ISISInvestigationsCardView
              instrumentId={match.params.instrumentId}
              facilityCycleId={match.params.facilityCycleId}
            />
          )}
        />
        <Route
          exact
          path={paths.toggle.isisDataset}
          render={({
            match,
          }: RouteComponentProps<{
            instrumentId: string;
            facilityCycleId: string;
            investigationId: string;
          }>) => (
            <ISISDatasetsCardView
              instrumentId={match.params.instrumentId}
              facilityCycleId={match.params.facilityCycleId}
              investigationId={match.params.investigationId}
            />
          )}
        />
        <Route
          exact
          path={paths.toggle.dlsProposal}
          component={DLSProposalsCardView}
        />
        <Route
          exact
          path={paths.toggle.dlsVisit}
          render={({
            match,
          }: RouteComponentProps<{ proposalName: string }>) => (
            <DLSVisitsCardView proposalName={match.params.proposalName} />
          )}
        />
        <Route
          exact
          path={paths.toggle.dlsDataset}
          render={({
            match,
          }: RouteComponentProps<{
            proposalName: string;
            investigationId: string;
          }>) => (
            <DLSDatasetsCardView
              proposalName={match.params.proposalName}
              investigationId={match.params.investigationId}
            />
          )}
        /> */}
      </Switch>
    );
  }
}

export default PageCard;
