import React from 'react';
import { bool } from 'prop-types';
import MaxUsingTimeADayFilterPlain from './MaxUsingTimeADayFilterPlain';
import MaxUsingTimeADayFilterPopup from './MaxUsingTimeADayFilterPopup';

const MaxUsingTimeADayFilter = props => {
  const { showAsPopup, ...rest } = props;
  return showAsPopup ? <MaxUsingTimeADayFilterPopup {...rest} /> : <MaxUsingTimeADayFilterPlain {...rest} />;
};

MaxUsingTimeADayFilter.defaultProps = {
  showAsPopup: false,
};

MaxUsingTimeADayFilter.propTypes = {
  showAsPopup: bool,
};

export default MaxUsingTimeADayFilter;
