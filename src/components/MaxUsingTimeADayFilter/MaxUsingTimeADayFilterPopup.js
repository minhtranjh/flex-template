import React, { Component } from 'react';
import { arrayOf, func, node, number, shape, string } from 'prop-types';
import classNames from 'classnames';

import config from '../../config';
import { injectIntl, intlShape } from '../../util/reactIntl';
import { propTypes } from '../../util/types';

import { OutsideClickHandler } from '..';
import css from './MaxUsingTimeADayFilterPopup.module.css';
import MaxUsingTimeADayFilterForm from '../../forms/MaxUsingTimeADayFilterForm/MaxUsingTimeADayFilterForm';

const KEY_CODE_ESCAPE = 27;
const RADIX = 10;

const getMaxUsingTimeADayQueryParamName = queryParamNames => {
  return Array.isArray(queryParamNames)
    ? queryParamNames[0]
    : typeof queryParamNames === 'string'
    ? queryParamNames
    : 'pub_maxUsingTimeADay';
};

// Parse value, which should look like "0,1000"
const parse = maxUsingTimeADayRange => {
  const [minTime, maxTime] = !!maxUsingTimeADayRange
    ? maxUsingTimeADayRange.split(',').map(v => Number.parseInt(v, RADIX))
    : [];
  // Note: we compare to null, because 0 as minPrice is falsy in comparisons.
  return !!maxUsingTimeADayRange && minTime != null && maxTime != null
    ? { minTime, maxTime }
    : null;
};

// Format value, which should look like { minPrice, maxPrice }
const format = (range, queryParamName) => {
  const { minTime, maxTime } = range || {};
  // Note: we compare to null, because 0 as minPrice is falsy in comparisons.
  if(minTime!==maxTime){
    const value = minTime != null && maxTime != null ? `${minTime},${maxTime}` : null;
    return { [queryParamName]: value };
  }
};

class MaxUsingTimeADayFilterPopup extends Component {
  constructor(props) {
    super(props);

    this.state = { isOpen: false };
    this.filter = null;
    this.filterContent = null;

    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleClear = this.handleClear.bind(this);
    this.handleCancel = this.handleCancel.bind(this);
    this.handleBlur = this.handleBlur.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.toggleOpen = this.toggleOpen.bind(this);
    this.positionStyleForContent = this.positionStyleForContent.bind(this);
  }

  handleSubmit(values) {
    const { onSubmit, queryParamNames } = this.props;
    this.setState({ isOpen: false });
    const maxUsingTimeADayQueryParamName = getMaxUsingTimeADayQueryParamName(queryParamNames);
    onSubmit(format(values, maxUsingTimeADayQueryParamName));
  }

  handleClear() {
    const { onSubmit, queryParamNames } = this.props;
    this.setState({ isOpen: false });
    const priceQueryParamName = getMaxUsingTimeADayQueryParamName(queryParamNames);
    onSubmit(format(null, priceQueryParamName));
  }

  handleCancel() {
    const { onSubmit, initialValues } = this.props;
    this.setState({ isOpen: false });
    onSubmit(initialValues);
  }

  handleBlur() {
    this.setState({ isOpen: false });
  }

  handleKeyDown(e) {
    // Gather all escape presses to close menu
    if (e.keyCode === KEY_CODE_ESCAPE) {
      this.toggleOpen(false);
    }
  }

  toggleOpen(enforcedState) {
    if (enforcedState) {
      this.setState({ isOpen: enforcedState });
    } else {
      this.setState(prevState => ({ isOpen: !prevState.isOpen }));
    }
  }

  positionStyleForContent() {
    if (this.filter && this.filterContent) {
      // Render the filter content to the right from the menu
      // unless there's no space in which case it is rendered
      // to the left
      const distanceToRight = window.innerWidth - this.filter.getBoundingClientRect().right;
      const labelWidth = this.filter.offsetWidth;
      const contentWidth = this.filterContent.offsetWidth;
      const contentWidthBiggerThanLabel = contentWidth - labelWidth;
      const renderToRight = distanceToRight > contentWidthBiggerThanLabel;
      const contentPlacementOffset = this.props.contentPlacementOffset;

      const offset = renderToRight
        ? { left: contentPlacementOffset }
        : { right: contentPlacementOffset };
      // set a min-width if the content is narrower than the label
      const minWidth = contentWidth < labelWidth ? { minWidth: labelWidth } : null;

      return { ...offset, ...minWidth };
    }
    return {};
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
    const initialPrice =
      initialValues && initialValues[maxUsingTimeADayQueryParam]
        ? parse(initialValues[maxUsingTimeADayQueryParam])
        : {};
    const { minTime, maxTime } = initialPrice || {};

    const hasValue = value => value != null;
    const hasInitialValues = initialValues && hasValue(minTime) && hasValue(maxTime);
    const currentLabel = hasInitialValues
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

    const labelStyles = hasInitialValues ? css.labelSelected : css.label;
    const contentStyle = this.positionStyleForContent();

    return (
      <OutsideClickHandler onOutsideClick={this.handleBlur}>
        <div
          className={classes}
          onKeyDown={this.handleKeyDown}
          ref={node => {
            this.filter = node;
          }}
        >
          <button className={labelStyles} onClick={() => this.toggleOpen()}>
            {currentLabel}
          </button>
          <MaxUsingTimeADayFilterForm
            id={id}
            initialValues={hasInitialValues ? initialPrice : { minTime: min, maxTime: max }}
            onClear={this.handleClear}
            onCancel={this.handleCancel}
            onSubmit={this.handleSubmit}
            intl={intl}
            contentRef={node => {
              this.filterContent = node;
            }}
            style={contentStyle}
            min={min}
            max={max}
            step={step}
            showAsPopup
            isOpen={this.state.isOpen}
          />
        </div>
      </OutsideClickHandler>
    );
  }
}

MaxUsingTimeADayFilterPopup.defaultProps = {
  rootClassName: null,
  className: null,
  initialValues: null,
  contentPlacementOffset: 0,
  liveEdit: false,
  step: number,
  currencyConfig: config.currencyConfig,
};

MaxUsingTimeADayFilterPopup.propTypes = {
  rootClassName: string,
  className: string,
  id: string.isRequired,
  label: node,
  queryParamNames: arrayOf(string).isRequired,
  onSubmit: func.isRequired,
  initialValues: shape({
    price: string,
  }),
  contentPlacementOffset: number,
  min: number.isRequired,
  max: number.isRequired,
  step: number,
  currencyConfig: propTypes.currencyConfig,

  // form injectIntl
  intl: intlShape.isRequired,
};

export default injectIntl(MaxUsingTimeADayFilterPopup);
