import React from 'react';
import { withRouter } from 'react-router-dom';
import { stringify, parse } from '../../util/urlHelpers';

import MaxUsingTimeADayFilter from './MaxUsingTimeADayFilter';

const URL_PARAM = 'pub_maxUsingTimeADay';

// Helper for submitting example
const handleSubmit = (values, history) => {
  const queryParams = values ? `?${stringify(values)}` : '';
  history.push(`${window.location.pathname}${queryParams}`);
};

const MaxUsingTimeADayFilterWrapper = withRouter(props => {
  const { history, location } = props;

  const params = parse(location.search);
  const price = params[URL_PARAM];
  const initialValues = { [URL_PARAM]: !!price ? price : null };

  return (
    <MaxUsingTimeADayFilter
      {...props}
      initialValues={initialValues}
      onSubmit={values => {
        console.log('Submit MaxUsingTimeADayFilterForm with (unformatted) values:', values);
        handleSubmit(values, history);
      }}
    />
  );
});

export const MaxUsingTimeADayFilterPopup = {
  component: MaxUsingTimeADayFilterWrapper,
  props: {
    id: 'MaxUsingTimeADayFilterPopupExample',
    queryParamNames: [URL_PARAM],
    min: 0,
    max: 1000,
    step: 5,
    liveEdit: false,
    showAsPopup: true,
    contentPlacementOffset: -14,
    // initialValues: handled inside wrapper
    // onSubmit: handled inside wrapper
  },
  group: 'filters',
};

export const MaxUsingTimeADayFilterPlain = {
  component: MaxUsingTimeADayFilterWrapper,
  props: {
    id: 'MaxUsingTimeADayFilterPlainExample',
    queryParamNames: [URL_PARAM],
    min: 0,
    max: 1000,
    step: 5,
    liveEdit: true,
    showAsPopup: false,
    contentPlacementOffset: -14,
    // initialValues: handled inside wrapper
    // onSubmit: handled inside wrapper
  },
  group: 'filters',
};
