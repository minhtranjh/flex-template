import React, { Component } from 'react';
import { arrayOf, func, node, number, shape, string } from 'prop-types';
import classNames from 'classnames';
import { FormattedMessage, injectIntl, intlShape } from '../../util/reactIntl';
import { propTypes } from '../../util/types';
import { formatCurrencyMajorUnit } from '../../util/currency';
import config from '../../config';

import css from './MaxUsingTimeADayFilterPlain.module.css';
import MaxUsingTimeADayFilterForm from '../../forms/MaxUsingTimeADayFilterForm/MaxUsingTimeADayFilterForm';

const RADIX = 10;

const getMaxUsingTimeADayQueryParamName = queryParamNames => {
  return Array.isArray(queryParamNames)
    ? queryParamNames[0]
    : typeof queryParamNames === 'string'
    ? queryParamNames
    : 'maxUsingTimeADay';
};

// Parse value, which should look like "0,1000"
const parse = maxUsingTimeADayRange => {

  const [minTime, maxTime] = !!maxUsingTimeADayRange
    ? maxUsingTimeADayRange.split(',').map(v => Number.parseInt(v, RADIX))
    : [];

  if(!maxTime){
    return !!maxUsingTimeADayRange && minTime != null
    ? { minTime, maxTime : minTime }
    : null;
  }
    // Note: we compare to null, because 0 as minPrice is falsy in comparisons.
  return !!maxUsingTimeADayRange && minTime != null && maxTime != null
    ? { minTime, maxTime }
    : null;
};
// Format value, which should look like { minPrice, maxPrice }
const format = (range, queryParamName) => {
  const { minTime, maxTime } = range || {};
  // Note: we compare to null, because 0 as minPrice is falsy in comparisons.
  if (minTime !== maxTime) {
    const value = minTime != null && maxTime != null ? `${minTime},${maxTime}` : null;
    return { [queryParamName]: value };
  }
  const value = minTime != null && maxTime != null ? `${minTime}` : null;
  return { [queryParamName]: value };
};
class MaxUsingTimeADayFilterPlainComponent extends Component {
  constructor(props) {
    super(props);
    this.state = { isOpen: true };

    this.handleChange = this.handleChange.bind(this);
    this.handleClear = this.handleClear.bind(this);
    this.toggleIsOpen = this.toggleIsOpen.bind(this);
  }

  handleChange(values) {
    const { onSubmit, queryParamNames } = this.props;

    const priceQueryParamName = getMaxUsingTimeADayQueryParamName(queryParamNames);

    onSubmit(format(values, priceQueryParamName));
  }

  handleClear() {
    const { onSubmit, queryParamNames } = this.props;
    const priceQueryParamName = getMaxUsingTimeADayQueryParamName(queryParamNames);
    onSubmit(format(null, priceQueryParamName));
  }

  toggleIsOpen() {
    this.setState(prevState => ({ isOpen: !prevState.isOpen }));
  }

  render() {
    const {
      rootClassName,
      className,
      id,
      label,
      queryParamNames,
      initialValues,
      min,
      max,
      step,
      intl,
    } = this.props;
    const classes = classNames(rootClassName || css.root, className);

    const maxUsingTimeADayQueryParam = getMaxUsingTimeADayQueryParamName(queryParamNames);
    const initialPrice = initialValues ? parse(initialValues[maxUsingTimeADayQueryParam]) : {};
    const { minTime, maxTime } = initialPrice || {};

    const hasValue = value => value != null;
    const hasInitialValues = initialValues && hasValue(minTime) && hasValue(maxTime);

    const labelClass = hasInitialValues ? css.filterLabelSelected : css.filterLabel;
    const labelText = hasInitialValues
      ? intl.formatMessage(
          { id: 'MaxUsingTimeADayFilter.labelSelectedButton' },
          {
            minTime: minTime,
            maxTime: maxTime,
          }
        )
      : label
      ? label
      : intl.formatMessage({ id: 'PriceFilter.label' });

    return (
      <div className={classes}>
        <div className={labelClass}>
          <button type="button" className={css.labelButton} onClick={this.toggleIsOpen}>
            <span className={labelClass}>{labelText}</span>
          </button>
          <button type="button" className={css.clearButton} onClick={this.handleClear}>
            <FormattedMessage id={'PriceFilter.clear'} />
          </button>
        </div>
        <div className={css.formWrapper}>
          <MaxUsingTimeADayFilterForm
            id={id}
            initialValues={hasInitialValues ? initialPrice : { minTime: min, maxTime: max }}
            onChange={this.handleChange}
            intl={intl}
            contentRef={node => {
              this.filterContent = node;
            }}
            min={min}
            max={max}
            step={step}
            liveEdit
            isOpen={this.state.isOpen}
          />
        </div>
      </div>
    );
  }
}

MaxUsingTimeADayFilterPlainComponent.defaultProps = {
  rootClassName: null,
  className: null,
  initialValues: null,
  step: number,
  currencyConfig: config.currencyConfig,
};

MaxUsingTimeADayFilterPlainComponent.propTypes = {
  rootClassName: string,
  className: string,
  id: string.isRequired,
  label: node,
  queryParamNames: arrayOf(string).isRequired,
  onSubmit: func.isRequired,
  initialValues: shape({
    price: string,
  }),
  min: number.isRequired,
  max: number.isRequired,
  step: number,
  currencyConfig: propTypes.currencyConfig,

  // form injectIntl
  intl: intlShape.isRequired,
};

const MaxUsingTimeADayFilterPlain = injectIntl(MaxUsingTimeADayFilterPlainComponent);

export default MaxUsingTimeADayFilterPlain;
