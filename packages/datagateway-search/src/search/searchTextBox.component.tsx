import React from 'react';
import TextField from '@material-ui/core/TextField';
import { Action, AnyAction } from 'redux';
import { connect } from 'react-redux';
import { submitSearchText } from '../state/actions/actions';
import { ThunkDispatch } from 'redux-thunk';
import { StateType } from '../state/app.types';

interface SearchTextStoreProps {
  searchText: string;
}

interface SearchTextDispatchProps {
  submitSearchText: (searchText: string) => Action;
}

type SearchTextCombinedProps = SearchTextStoreProps & SearchTextDispatchProps;

const SearchTextBox = (props: SearchTextCombinedProps): React.ReactElement => {
  const { searchText, submitSearchText } = props;

  const sendSearchText = (event: React.ChangeEvent<HTMLInputElement>): void => {
    let searchText = event.target.value;
    submitSearchText(searchText);
  };

  return (
    <div>
      <TextField
        id="filled-search"
        label="Search Text"
        type="search"
        margin="normal"
        value={searchText} // redundant?
        onChange={sendSearchText}
        inputProps={{ 'aria-label': 'search text input' }}
      />
    </div>
  );
};

const mapDispatchToProps = (
  dispatch: ThunkDispatch<StateType, null, AnyAction>
): SearchTextDispatchProps => ({
  submitSearchText: (searchText: string) =>
    dispatch(submitSearchText(searchText)),
});

const mapStateToProps = (state: StateType): SearchTextStoreProps => {
  return {
    searchText: state.dgsearch.searchText,
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(SearchTextBox);