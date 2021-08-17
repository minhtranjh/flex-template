import React from 'react';
import { bool, func, number, object, string } from 'prop-types';
import classNames from 'classnames';
import debounce from 'lodash/debounce';
import { Field, Form as FinalForm, FormSpy } from 'react-final-form';
import { FormattedMessage, injectIntl, intlShape } from '../../util/reactIntl';

import { Form, RangeSlider } from '../../components';
import css from './MaxUsingTimeADayFilterForm.module.css';

const DEBOUNCE_WAIT_TIME = 400;

// Helper function to parse value for min handle
// Value needs to be between slider's minimum value and current maximum value
const parseMin = (min, currentMax) => value => {
  const parsedValue = Number.parseInt(value, 10);
  if (isNaN(parsedValue)) {
    return '';
  }
  return parsedValue < min ? min : parsedValue > currentMax ? currentMax : parsedValue;
};

// Helper function to parse value for max handle
// Value needs to be between slider's max value and current minimum value
const parseMax = (max, currentMin) => value => {
  const parsedValue = Number.parseInt(value, 10);
  if (isNaN(parsedValue)) {
    return '';
  }
  return parsedValue < currentMin ? currentMin : parsedValue > max ? max : parsedValue;
};

// PriceFilterForm component
const MaxUsingTimeADayFilterFormComponent = props => {
  const { liveEdit, onChange, onSubmit, onCancel, onClear, ...rest } = props;

  if (liveEdit && !onChange) {
    throw new Error('MaxUsingTimeADayFilterForm: if liveEdit is true you need to provide onChange function');
  }

  if (!liveEdit && !(onCancel && onClear && onSubmit)) {
    throw new Error(
      'MaxUsingTimeADayFilterForm: if liveEdit is false you need to provide onCancel, onClear, and onSubmit functions'
    );
  }

  const handleChange = debounce(
    formState => {
      if (formState.dirty) {
        const { minTime, maxTime, ...restValues } = formState.values;
        onChange({
          minTime: minTime === '' ? rest.min : minTime,
          maxTime: maxTime === '' ? rest.max : maxTime,
          ...restValues,
        });
      }
    },
    DEBOUNCE_WAIT_TIME,
    { leading: false, trailing: true }
  );

  const handleSubmit = values => {
    const { minTime, maxTime, ...restValues } = values;
    return onSubmit({
      minTime: minTime === '' ? rest.min : minTime,
      maxTime: maxTime === '' ? rest.max : maxTime,
      ...restValues,
    });
  };

  const formCallbacks = liveEdit
    ? { onSubmit: () => null }
    : { onSubmit: handleSubmit, onCancel, onClear };
  return (
    <FinalForm
      {...rest}
      {...formCallbacks}
      render={formRenderProps => {
        const {
          form,
          handleSubmit,
          id,
          showAsPopup,
          onClear,
          onCancel,
          isOpen,
          contentRef,
          style,
          intl,
          values,
          min,
          max,
          step,
        } = formRenderProps;
        const { minTime: minTimeRaw, maxTime: maxTimeRaw } = values;
        const minTime = typeof minTimeRaw !== 'string' ? minTimeRaw : min;
        const maxTime = typeof maxTimeRaw !== 'string' ? maxTimeRaw : max;

        const handleCancel = () => {
          // reset the final form to initialValues
          form.reset();
          onCancel();
        };

        const clear = intl.formatMessage({ id: 'PriceFilterForm.clear' });
        const cancel = intl.formatMessage({ id: 'PriceFilterForm.cancel' });
        const submit = intl.formatMessage({ id: 'PriceFilterForm.submit' });

        const classes = classNames(css.root, {
          [css.popup]: showAsPopup,
          [css.isOpenAsPopup]: showAsPopup && isOpen,
          [css.plain]: !showAsPopup,
          [css.isOpen]: !showAsPopup && isOpen,
        });

        return (
          <Form
            className={classes}
            onSubmit={handleSubmit}
            tabIndex="0"
            contentRef={contentRef}
            style={{ minWidth: '300px', ...style }}
          >
            <div className={css.contentWrapper}>
              <span className={css.label}>
                <FormattedMessage id="MaxUsingTimeADayFilterForm.label" />
              </span>
              <div className={css.inputsWrapper}>
                <Field
                  className={css.minPrice}
                  id={`${id}.minTime`}
                  name="minTime"
                  component="input"
                  type="number"
                  placeholder={min}
                  min={min}
                  max={max}
                  step={step}
                  parse={parseMin(min, minTime)}
                />
                <span className={css.priceSeparator}>-</span>
                <Field
                  className={css.maxPrice}
                  id={`${id}.maxTime`}
                  name="maxTime"
                  component="input"
                  type="number"
                  placeholder={max}
                  min={min}
                  max={max}
                  step={step}
                  parse={parseMax(max, maxTime)}
                />
              </div>
            </div>

            <div className={css.sliderWrapper}>
              <RangeSlider
                min={min}
                max={max}
                step={step}
                handles={[minTime, maxTime]}
                onChange={handles => {
                  form.change('minTime', handles[0]);
                  form.change('maxTime', handles[1]);
                }}
              />
            </div>

            {liveEdit ? (
              <FormSpy onChange={handleChange} subscription={{ values: true, dirty: true }} />
            ) : (
              <div className={css.buttonsWrapper}>
                <button className={css.clearButton} type="button" onClick={onClear}>
                  {clear}
                </button>
                <button className={css.cancelButton} type="button" onClick={handleCancel}>
                  {cancel}
                </button>
                <button className={css.submitButton} type="submit">
                  {submit}
                </button>
              </div>
            )}
          </Form>
        );
      }}
    />
  );
};

MaxUsingTimeADayFilterFormComponent.defaultProps = {
  liveEdit: false,
  showAsPopup: false,
  isOpen: false,
  contentRef: null,
  style: null,
  min: 0,
  step: 1,
  onCancel: null,
  onChange: null,
  onClear: null,
  onSubmit: null,
};

MaxUsingTimeADayFilterFormComponent.propTypes = {
  id: string.isRequired,
  liveEdit: bool,
  showAsPopup: bool,
  onCancel: func,
  onChange: func,
  onClear: func,
  onSubmit: func,
  isOpen: bool,
  contentRef: func,
  style: object,
  min: number.isRequired,
  max: number.isRequired,
  step: number,

  // form injectIntl
  intl: intlShape.isRequired,
};

const MaxUsingTimeADayFilterForm = injectIntl(MaxUsingTimeADayFilterFormComponent);

export default MaxUsingTimeADayFilterForm;
