import classNames from 'classnames';
import { arrayOf, bool, func, shape, string } from 'prop-types';
import React from 'react';
import { Form as FinalForm } from 'react-final-form';
import { intlShape, injectIntl, FormattedMessage } from '../../util/reactIntl';
import { Button, FieldSelect, Form } from '../../components';
import { propTypes } from '../../util/types';
import { required } from '../../util/validators';
import css from './EditListingCapacityForm.module.css';
import { compose } from 'redux';
export const EditListingCapacityFormComponent = props => {
  return (
    <FinalForm
      {...props}
      render={formRenderProps => {
        const {
          className,
          disabled,
          handleSubmit,
          intl,
          invalid,
          pristine,
          saveActionMsg,
          updated,
          updateError,
          updateInProgress,
          capacityOptions,
        } = formRenderProps;
        const capacityPlaceholder = intl.formatMessage({
          id: 'EditListingCapacityForm.capacityPlaceholder',
        });
        const errorMessage = updateError ? (
          <p>
            <FormattedMessage id="EditListingCapacityForm.updateFailed" />
          </p>
        ) : null;
        const capacityRequired = required(
          intl.formatMessage({ id: 'EditListingCapacityForm.capacityRequired' })
        );
        const classes = classNames(css.root, className);
        const submitReady = updated && pristine;
        const submitInProgress = updateInProgress;
        const submitDisabled = invalid || disabled || submitInProgress;
        return (
          <Form className={classes} onSubmit={handleSubmit}>
            <FieldSelect
              name="capacity"
              id="capacity"
              validate={capacityRequired}
              className={classes.capacity}
            >
              <option value="">{capacityPlaceholder}</option>
              {capacityOptions.map(c => (
                <option key={c.key} value={c.key}>
                  {c.label}
                </option>
              ))}
            </FieldSelect>
            <Button
              className={css.submitButton}
              type="submit"
              inProgress={submitInProgress}
              disabled={submitDisabled}
              ready={submitReady}
            >
              {saveActionMsg}
            </Button>
          </Form>
        );
      }}
    ></FinalForm>
  );
};
EditListingCapacityFormComponent.defaultProps = {
  selectedPlace: null,
  updateError: null,
};
EditListingCapacityFormComponent.propTypes = {
  intl: intlShape.isRequired,
  onSubmit: func.isRequired,
  saveActionMsg: string.isRequired,
  updated: bool.isRequired,
  updateError: propTypes.error,
  updateInProgress: bool.isRequired,
  capacityOptions: arrayOf(
    shape({
      key: string.isRequired,
      label: string.isRequired,
    })
  ).isRequired,
};
export default compose(injectIntl)(EditListingCapacityFormComponent);
