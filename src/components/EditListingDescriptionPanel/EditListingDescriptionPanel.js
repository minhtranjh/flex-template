import React from 'react';
import { bool, func, object, string } from 'prop-types';
import classNames from 'classnames';
import { FormattedMessage } from '../../util/reactIntl';
import { ensureOwnListing } from '../../util/data';
import { findOptionsForSelectFilter } from '../../util/search';
import { LISTING_STATE_DRAFT } from '../../util/types';
import { ListingLink } from '../../components';
import { EditListingDescriptionForm } from '../../forms';
import config from '../../config';

import css from './EditListingDescriptionPanel.module.css';
import { EQUIPMENT_LISTING_TYPE, SAUNA_LISTING_TYPE } from '../EditListingWizard/EditListingWizard';

const EditListingDescriptionPanel = props => {
  const {
    className,
    rootClassName,
    listing,
    disabled,
    ready,
    onSubmit,
    onChange,
    submitButtonText,
    panelUpdated,
    updateInProgress,
    errors,
    listingType,
  } = props;

  const classes = classNames(rootClassName || css.root, className);
  const currentListing = ensureOwnListing(listing);
  const { description, title, publicData } = currentListing.attributes;
  const isPublished = currentListing.id && currentListing.attributes.state !== LISTING_STATE_DRAFT;

  const panelTitle = () => {
    if (isPublished) {
      return (
        <FormattedMessage
          id="EditListingDescriptionPanel.title"
          values={{ listingTitle: <ListingLink listing={listing} /> }}
        />
      );
    } else if (listingType === EQUIPMENT_LISTING_TYPE) {
      return <FormattedMessage id="EditListingDescriptionPanel.createEquipmentListingTitle" />;
    } else {
      return <FormattedMessage id="EditListingDescriptionPanel.createListingTitle" />;
    }
  };

  const categoryOptions = findOptionsForSelectFilter('category', config.custom.filters);
  const equipmentCategoryOptions = findOptionsForSelectFilter(
    'equipmentCategory',
    config.custom.filters
  );

  const initialValues = () => {
    switch (listingType) {
      case EQUIPMENT_LISTING_TYPE:
        return {
          title,
          description,
          equipmentCategory: publicData.equipmentCategory,
          manufactureYear: publicData.manufactureYear,
          maxUsingTimeADay: publicData.maxUsingTimeADay,
        };
      case SAUNA_LISTING_TYPE:
        return {
          title,
          description,
          category: publicData.category,
        };
      default:
        return {
          title,
          description,
          category: publicData.category,
        };
    }
  };
  const handleSubmitListingDescription = values => {
    if (listingType === EQUIPMENT_LISTING_TYPE) {
      const {
        title,
        description,
        equipmentCategory = [],
        manufactureYear,
        maxUsingTimeADay,
      } = values;
      const updateValues = {
        title: title.trim(),
        description,
        publicData: { equipmentCategory, manufactureYear, maxUsingTimeADay, listingType },
      };

      onSubmit(updateValues);
      return;
    }
    if(listingType===SAUNA_LISTING_TYPE){
      const { title, description, category } = values;
      const updateValues = {
        title: title.trim(),
        description,
        publicData: { category, listingType: 'sauna' },
      };
      onSubmit(updateValues);
      return
    }
  };
  return (
    <div className={classes}>
      <h1 className={css.title}>{panelTitle()}</h1>
      <EditListingDescriptionForm
        className={css.form}
        initialValues={initialValues()}
        saveActionMsg={submitButtonText}
        onSubmit={values => {
          handleSubmitListingDescription(values);
        }}
        listingType={listingType}
        onChange={onChange}
        disabled={disabled}
        ready={ready}
        updated={panelUpdated}
        updateInProgress={updateInProgress}
        fetchErrors={errors}
        categories={categoryOptions}
        equipmentCategories={equipmentCategoryOptions}
      />
    </div>
  );
};

EditListingDescriptionPanel.defaultProps = {
  className: null,
  rootClassName: null,
  errors: null,
  listing: null,
};

EditListingDescriptionPanel.propTypes = {
  className: string,
  rootClassName: string,

  // We cannot use propTypes.listing since the listing might be a draft.
  listing: object,

  disabled: bool.isRequired,
  ready: bool.isRequired,
  onSubmit: func.isRequired,
  onChange: func.isRequired,
  submitButtonText: string.isRequired,
  panelUpdated: bool.isRequired,
  updateInProgress: bool.isRequired,
  errors: object.isRequired,
};

export default EditListingDescriptionPanel;
