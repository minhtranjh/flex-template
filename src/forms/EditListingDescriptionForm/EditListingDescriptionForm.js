import React from 'react';
import { arrayOf, bool, func, shape, string } from 'prop-types';
import { compose } from 'redux';
import { Form as FinalForm } from 'react-final-form';
import { intlShape, injectIntl, FormattedMessage } from '../../util/reactIntl';
import classNames from 'classnames';
import { propTypes } from '../../util/types';
import { maxLength, required, composeValidators } from '../../util/validators';
import { Form, Button, FieldTextInput, FieldCheckboxGroup } from '../../components';
import CustomCategorySelectFieldMaybe from './CustomCategorySelectFieldMaybe';
import arrayMutators from 'final-form-arrays';
import css from './EditListingDescriptionForm.module.css';
import { EQUIPMENT_LISTING_TYPE, SAUNA_LISTING_TYPE } from '../../components/EditListingWizard/EditListingWizard';
import { snakeCase } from 'lodash';

const TITLE_MAX_LENGTH = 60;

const EditListingDescriptionFormComponent = props => (
  <FinalForm
    {...props}
    mutators={{ ...arrayMutators }}
    render={formRenderProps => {
      const {
        categories,
        equipmentCategories,
        className,
        disabled,
        ready,
        handleSubmit,
        intl,
        invalid,
        pristine,
        saveActionMsg,
        updated,
        updateInProgress,
        fetchErrors,
        listingType,
      } = formRenderProps;
      const translatedTitleMessages = () => {
        switch (listingType) {
          case EQUIPMENT_LISTING_TYPE:
            return {
              label: intl.formatMessage({ id: 'EditListingDescriptionForm.equipmentTitle' }),
              placeholder: intl.formatMessage({
                id: 'EditListingDescriptionForm.equipmentTitlePlaceholder',
              }),
              required: intl.formatMessage({
                id: 'EditListingDescriptionForm.equipmentTitleRequired',
              }),
            };
          case SAUNA_LISTING_TYPE:
            return {
              label: intl.formatMessage({ id: 'EditListingDescriptionForm.title' }),
              placeholder: intl.formatMessage({
                id: 'EditListingDescriptionForm.titlePlaceholder',
              }),
              required: intl.formatMessage({
                id: 'EditListingDescriptionForm.titleRequired',
              }),
            };
          default:
            return {
              label: intl.formatMessage({ id: 'EditListingDescriptionForm.title' }),
              placeholder: intl.formatMessage({
                id: 'EditListingDescriptionForm.titlePlaceholder',
              }),
              required: intl.formatMessage({
                id: 'EditListingDescriptionForm.titleRequired',
              }),
            };
        }
      };
      const maxLengthMessage = intl.formatMessage(
        { id: 'EditListingDescriptionForm.maxLength' },
        {
          maxLength: TITLE_MAX_LENGTH,
        }
      );
      const translatedDescriptionMessages = () => {
        switch (listingType) {
          case EQUIPMENT_LISTING_TYPE:
            return {
              label: intl.formatMessage({
                id: 'EditListingDescriptionForm.equipmentDescription',
              }),
              placeholder: intl.formatMessage({
                id: 'EditListingDescriptionForm.equipmentDescriptionPlaceholder',
              }),
              required: intl.formatMessage({
                id: 'EditListingDescriptionForm.equipmentDescriptionRequired',
              }),
            };
          case SAUNA_LISTING_TYPE:
            return {
              label: intl.formatMessage({
                id: 'EditListingDescriptionForm.description',
              }),
              placeholder: intl.formatMessage({
                id: 'EditListingDescriptionForm.descriptionPlaceholder',
              }),
              required: intl.formatMessage({
                id: 'EditListingDescriptionForm.descriptionRequired',
              }),
            };
          default:
            return {
              label: intl.formatMessage({
                id: 'EditListingDescriptionForm.description',
              }),
              placeholder: intl.formatMessage({
                id: 'EditListingDescriptionForm.descriptionPlaceholder',
              }),
              required: intl.formatMessage({
                id: 'EditListingDescriptionForm.descriptionRequired',
              }),
            };
        }
      };
      const maxLength60Message = maxLength(maxLengthMessage, TITLE_MAX_LENGTH);
      const translatedTypeMessages = () => {
        switch (listingType) {
          case EQUIPMENT_LISTING_TYPE:
            return {
              label: intl.formatMessage({
                id: 'EditListingDescriptionForm.equipmentType',
              }),
              placeholder: intl.formatMessage({
                id: 'EditListingDescriptionForm.equipmentTypePlaceholder',
              }),
              required: required(
                intl.formatMessage({
                  id: 'EditListingDescriptionForm.equipmentTypeRequired',
                })
              ),
            };
          case SAUNA_LISTING_TYPE:
            return {
              label: intl.formatMessage({
                id: 'EditListingDescriptionForm.categoryLabel',
              }),
              placeholder: intl.formatMessage({
                id: 'EditListingDescriptionForm.categoryPlaceholder',
              }),
              required: required(
                intl.formatMessage({
                  id: 'EditListingDescriptionForm.categoryRequired',
                })
              ),
            };
          default:
            return {
              label: intl.formatMessage({
                id: 'EditListingDescriptionForm.categoryLabel',
              }),
              placeholder: intl.formatMessage({
                id: 'EditListingDescriptionForm.categoryPlaceholder',
              }),
              required: required(
                intl.formatMessage({
                  id: 'EditListingDescriptionForm.categoryRequired',
                })
              ),
            };
        }
      };
      const translatedManufactureYearMessages = () => {
        switch (listingType) {
          case EQUIPMENT_LISTING_TYPE:
            return {
              label: intl.formatMessage({
                id: 'EditListingDescriptionForm.equipmentManufactureYear',
              }),
              placeholder: intl.formatMessage({
                id: 'EditListingDescriptionForm.equipmentManufactureYearPlaceholder',
              }),
              required: intl.formatMessage({
                id: 'EditListingDescriptionForm.equipmentManufactureYearRequired',
              }),
            };
          case SAUNA_LISTING_TYPE:
            return null;
          default:
            return null;
        }
      };
      const translatedMaxTimeUsingADayMessages = ()=>{
        switch (listingType) {
          case EQUIPMENT_LISTING_TYPE:
            return {
              label : intl.formatMessage({
                id: 'EditListingDescriptionForm.equipmentMaxUsingTimeADay',
              }),
              placeholder :  intl.formatMessage({
                id: 'EditListingDescriptionForm.equipmentMaxUsingTimeADayPlaceholder',
              }),
              required : intl.formatMessage({
                id: 'EditListingDescriptionForm.equipmentMaxUsingTimeADayPlaceholder',
              })
            }
          case SAUNA_LISTING_TYPE : 
            return null;
          default:
            return null;
        }
      }
      const { updateListingError, createListingDraftError, showListingsError } = fetchErrors || {};
      const errorMessageUpdateListing = updateListingError ? (
        <p className={css.error}>
          <FormattedMessage id="EditListingDescriptionForm.updateFailed" />
        </p>
      ) : null;

      // This error happens only on first tab (of EditListingWizard)
      const errorMessageCreateListingDraft = createListingDraftError ? (
        <p className={css.error}>
          <FormattedMessage id="EditListingDescriptionForm.createListingDraftError" />
        </p>
      ) : null;

      const errorMessageShowListing = showListingsError ? (
        <p className={css.error}>
          <FormattedMessage id="EditListingDescriptionForm.showListingFailed" />
        </p>
      ) : null;

      const classes = classNames(css.root, className);
      const submitReady = (updated && pristine) || ready;
      const submitInProgress = updateInProgress;
      const submitDisabled = invalid || disabled || submitInProgress;
      const viewEquipmentManuFactureYearFieldMaybe =
        listingType === EQUIPMENT_LISTING_TYPE ? (
          <FieldTextInput
            id="manufactureYear"
            name="manufactureYear"
            className={css.description}
            type="number"
            label={translatedManufactureYearMessages().label}
            placeholder={translatedManufactureYearMessages().placeholder}
            validate={composeValidators(required(translatedManufactureYearMessages().required))}
          />
        ) : null;
      const viewEquipmentMaxUsingTimeADayFieldMaybe =
        listingType === EQUIPMENT_LISTING_TYPE ? (
          <FieldTextInput
            id="maxUsingTimeADay"
            name="maxUsingTimeADay"
            className={css.description}
            type="number"
            label={translatedMaxTimeUsingADayMessages().label}
            placeholder={translatedMaxTimeUsingADayMessages().placeholder}
            validate={composeValidators(required(translatedMaxTimeUsingADayMessages().required))}
          />
        ) : null;
      return (
        <Form className={classes} onSubmit={handleSubmit}>
          {errorMessageCreateListingDraft}
          {errorMessageUpdateListing}
          {errorMessageShowListing}
          <FieldTextInput
            id="title"
            name="title"
            className={css.title}
            type="text"
            label={translatedTitleMessages().label}
            placeholder={translatedTitleMessages().placeholder}
            maxLength={TITLE_MAX_LENGTH}
            validate={composeValidators(required(translatedTitleMessages().required), maxLength60Message)}
            autoFocus
          />

          <FieldTextInput
            id="description"
            name="description"
            className={css.description}
            type="textarea"
            label={translatedDescriptionMessages().label}
            placeholder={translatedDescriptionMessages().placeholder}
            validate={composeValidators(required(translatedDescriptionMessages().required))}
          />

          {listingType === EQUIPMENT_LISTING_TYPE ? (
            <FieldCheckboxGroup
              label={translatedTypeMessages().label}
              id="equipmentCategory"
              name="equipmentCategory"
              options={equipmentCategories}
            />
          ) : (
            <CustomCategorySelectFieldMaybe
              id="category"
              label={translatedTypeMessages().label}
              placeholder={translatedTypeMessages().placeholder}
              required={translatedTypeMessages().required}
              name="category"
              categories={categories}
            />
          )}
          {viewEquipmentManuFactureYearFieldMaybe}
          {viewEquipmentMaxUsingTimeADayFieldMaybe}
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
  />
);

EditListingDescriptionFormComponent.defaultProps = { className: null, fetchErrors: null };

EditListingDescriptionFormComponent.propTypes = {
  className: string,
  intl: intlShape.isRequired,
  onSubmit: func.isRequired,
  saveActionMsg: string.isRequired,
  disabled: bool.isRequired,
  ready: bool.isRequired,
  updated: bool.isRequired,
  updateInProgress: bool.isRequired,
  fetchErrors: shape({
    createListingDraftError: propTypes.error,
    showListingsError: propTypes.error,
    updateListingError: propTypes.error,
  }),
  categories: arrayOf(
    shape({
      key: string.isRequired,
      label: string.isRequired,
    })
  ),
};

export default compose(injectIntl)(EditListingDescriptionFormComponent);
