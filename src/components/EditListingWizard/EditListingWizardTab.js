import React from 'react';
import PropTypes from 'prop-types';
import { intlShape } from '../../util/reactIntl';
import routeConfiguration from '../../routeConfiguration';
import {
  LISTING_PAGE_PARAM_TYPE_DRAFT,
  LISTING_PAGE_PARAM_TYPE_NEW,
  LISTING_PAGE_PARAM_TYPES,
} from '../../util/urlHelpers';
import { ensureListing } from '../../util/data';
import { createResourceLocatorString } from '../../util/routes';
import {
  EditListingAvailabilityPanel,
  EditListingDescriptionPanel,
  EditListingFeaturesPanel,
  EditListingLocationPanel,
  EditListingPhotosPanel,
  EditListingPoliciesPanel,
  EditListingPricingPanel,
} from '../../components';

import css from './EditListingWizard.module.css';
import EditListingCapacityPanel from '../EditListingCapacityPanel/EditListingCapacityPanel';
import { EQUIPMENT_LISTING_TYPE, SAUNA_LISTING_TYPE } from './EditListingWizard';

export const AVAILABILITY = 'availability';
export const DESCRIPTION = 'description';
export const FEATURES = 'features';
export const POLICY = 'policy';
export const LOCATION = 'location';
export const PRICING = 'pricing';
export const PHOTOS = 'photos';
export const CAPACITY = 'capacity';
// EditListingWizardTab component supports these tabs
export const SUPPORTED_TABS = [
  DESCRIPTION,
  FEATURES,
  POLICY,
  LOCATION,
  PRICING,
  AVAILABILITY,
  PHOTOS,
  CAPACITY,
];

const pathParamsToNextTab = (params, tab, marketplaceTabs) => {
  const nextTabIndex = marketplaceTabs.findIndex(s => s === tab) + 1;
  const nextTab =
    nextTabIndex < marketplaceTabs.length
      ? marketplaceTabs[nextTabIndex]
      : marketplaceTabs[marketplaceTabs.length - 1];
  return { ...params, tab: nextTab };
};

// When user has update draft listing, he should be redirected to next EditListingWizardTab
const redirectAfterDraftUpdate = (listingId, params, tab, marketplaceTabs, history) => {
  const currentPathParams = {
    ...params,
    type: LISTING_PAGE_PARAM_TYPE_DRAFT,
    id: listingId,
  };
  const routes = routeConfiguration();

  // Replace current "new" path to "draft" path.
  // Browser's back button should lead to editing current draft instead of creating a new one.
  if (params.type === LISTING_PAGE_PARAM_TYPE_NEW) {
    if (params.listingType && params.listingType === EQUIPMENT_LISTING_TYPE) {
      const draftURI = createResourceLocatorString(
        'EditEquipmentListingPage',
        routes,
        currentPathParams,
        {}
      );
      history.replace(draftURI);
      return;
    }
    if (params.listingType && params.listingType === SAUNA_LISTING_TYPE) {
      const draftURI = createResourceLocatorString(
        'EditListingPage',
        routes,
        currentPathParams,
        {}
      );
      history.replace(draftURI);
      return;
    }
  }

  // Redirect to next tab
  const nextPathParams = pathParamsToNextTab(currentPathParams, tab, marketplaceTabs);
  if (params.listingType && params.listingType === EQUIPMENT_LISTING_TYPE) {
    const to = createResourceLocatorString('EditEquipmentListingPage', routes, nextPathParams, {});
    history.push(to);
    return;
  }
  if (params.listingType && params.listingType === SAUNA_LISTING_TYPE) {
    const to = createResourceLocatorString('EditListingPage', routes, nextPathParams, {});
    history.push(to);
  }
};

const EditListingWizardTab = props => {
  const {
    tab,
    marketplaceTabs,
    params,
    errors,
    fetchInProgress,
    newListingPublished,
    history,
    images,
    availability,
    listing,
    handleCreateFlowTabScrolling,
    handlePublishListing,
    onUpdateListing,
    onCreateListingDraft,
    onImageUpload,
    onUpdateImageOrder,
    onRemoveImage,
    onChange,
    updatedTab,
    updateInProgress,
    intl,
  } = props;

  const { type, listingType = '' } = params;
  const isNewURI = type === LISTING_PAGE_PARAM_TYPE_NEW;
  const isDraftURI = type === LISTING_PAGE_PARAM_TYPE_DRAFT;
  const isNewListingFlow = isNewURI || isDraftURI;

  const currentListing = ensureListing(listing);
  const imageIds = images => {
    return images ? images.map(img => img.imageId || img.id) : null;
  };

  const onCompleteEditListingWizardTab = (tab, updateValues) => {
    // Normalize images for API call
    const { images: updatedImages, ...otherValues } = updateValues;
    const imageProperty =
      typeof updatedImages !== 'undefined' ? { images: imageIds(updatedImages) } : {};
    const updateValuesWithImages = { ...otherValues, ...imageProperty };

    if (isNewListingFlow) {
      const onUpsertListingDraft = isNewURI
        ? (tab, updateValues) => onCreateListingDraft(updateValues)
        : onUpdateListing;

      const upsertValues = isNewURI
        ? updateValuesWithImages
        : { ...updateValuesWithImages, id: currentListing.id };

      onUpsertListingDraft(tab, upsertValues)
        .then(r => {
          if (tab !== marketplaceTabs[marketplaceTabs.length - 1]) {
            // Create listing flow: smooth scrolling polyfill to scroll to correct tab
            handleCreateFlowTabScrolling(false);

            // After successful saving of draft data, user should be redirected to next tab
            redirectAfterDraftUpdate(r.data.data.id.uuid, params, tab, marketplaceTabs, history);
          } else {
            handlePublishListing(currentListing.id);
          }
        })
        .catch(e => {
          // No need for extra actions
        });
    } else {
      onUpdateListing(tab, { ...updateValuesWithImages, id: currentListing.id });
    }
  };

  const panelProps = tab => {
    return {
      className: css.panel,
      errors,
      listing,
      onChange,
      panelUpdated: updatedTab === tab,
      updateInProgress,
      // newListingPublished and fetchInProgress are flags for the last wizard tab
      ready: newListingPublished,
      disabled: fetchInProgress,
    };
  };
  const submitButtonDescriptionTranlastionToUse = listingType => {
    switch (listingType) {
      case EQUIPMENT_LISTING_TYPE:
        return 'EditListingWizard.saveNewDescriptionEquipment';
      case SAUNA_LISTING_TYPE:
        return isNewListingFlow
          ? 'EditListingWizard.saveNewDescription'
          : 'EditListingWizard.saveEditDescription';
      default:
        return isNewListingFlow
          ? 'EditListingWizard.saveNewDescription'
          : 'EditListingWizard.saveEditDescription';
    }
  };
  const submitButtonLocationTranlastionToUse = listingType => {
    switch (listingType) {
      case EQUIPMENT_LISTING_TYPE:
        return 'EditListingWizard.saveNewLocationEquipment';
      case SAUNA_LISTING_TYPE:
        return isNewListingFlow
          ? 'EditListingWizard.saveNewLocation'
          : 'EditListingWizard.saveEditLocation';
      default:
        return isNewListingFlow
          ? 'EditListingWizard.saveNewLocation'
          : 'EditListingWizard.saveEditLocation';
    }
  };
  const submitButtonPricingTranlastionToUse = listingType => {
    switch (listingType) {
      case EQUIPMENT_LISTING_TYPE:
        return 'EditListingWizard.saveNewPricingEquipment';
      case SAUNA_LISTING_TYPE:
        return isNewListingFlow
          ? 'EditListingWizard.saveNewPricing'
          : 'EditListingWizard.saveEditPricing';
      default:
        return isNewListingFlow
          ? 'EditListingWizard.saveNewPricing'
          : 'EditListingWizard.saveEditPricing';
    }
  };
  const submitButtonAvailabilityTranslationToUse = listingType => {
    switch (listingType) {
      case EQUIPMENT_LISTING_TYPE:
        return 'EditListingWizard.saveNewAvailabilityEquipment';
      case SAUNA_LISTING_TYPE:
        return isNewListingFlow
          ? 'EditListingWizard.saveNewAvailability'
          : 'EditListingWizard.saveEditAvailability';
      default:
        return isNewListingFlow
          ? 'EditListingWizard.saveNewAvailability'
          : 'EditListingWizard.saveEditAvailability';
    }
  };
  switch (tab) {
    case DESCRIPTION: {
      const submitButtonTranslationKey = submitButtonDescriptionTranlastionToUse(listingType);
      return (
        <EditListingDescriptionPanel
          {...panelProps(DESCRIPTION)}
          listingType={listingType}
          submitButtonText={intl.formatMessage({ id: submitButtonTranslationKey })}
          onSubmit={values => {
            onCompleteEditListingWizardTab(tab, values);
          }}
        />
      );
    }
    case FEATURES: {
      const submitButtonTranslationKey = isNewListingFlow
        ? 'EditListingWizard.saveNewFeatures'
        : 'EditListingWizard.saveEditFeatures';
      return (
        <EditListingFeaturesPanel
          {...panelProps(FEATURES)}
          submitButtonText={intl.formatMessage({ id: submitButtonTranslationKey })}
          onSubmit={values => {
            onCompleteEditListingWizardTab(tab, values);
          }}
        />
      );
    }
    case CAPACITY: {
      const submitButtonTranslationKey = isNewListingFlow
        ? 'EditListingWizard.saveNewCapacity'
        : 'EditListingWizard.saveEditCapacity';
      return (
        <EditListingCapacityPanel
          {...panelProps(CAPACITY)}
          submitButtonText={intl.formatMessage({ id: submitButtonTranslationKey })}
          onSubmit={values => {
            onCompleteEditListingWizardTab(tab, values);
          }}
        />
      );
    }
    case POLICY: {
      const submitButtonTranslationKey = isNewListingFlow
        ? 'EditListingWizard.saveNewPolicies'
        : 'EditListingWizard.saveEditPolicies';
      return (
        <EditListingPoliciesPanel
          {...panelProps(POLICY)}
          submitButtonText={intl.formatMessage({ id: submitButtonTranslationKey })}
          onSubmit={values => {
            onCompleteEditListingWizardTab(tab, values);
          }}
        />
      );
    }
    case LOCATION: {
      const submitButtonTranslationKey = submitButtonLocationTranlastionToUse(listingType);
      return (
        <EditListingLocationPanel
          listingType={listingType}
          {...panelProps(LOCATION)}
          submitButtonText={intl.formatMessage({ id: submitButtonTranslationKey })}
          onSubmit={values => {
            onCompleteEditListingWizardTab(tab, values);
          }}
        />
      );
    }
    case PRICING: {
      const submitButtonTranslationKey = submitButtonPricingTranlastionToUse(listingType);
      return (
        <EditListingPricingPanel
          listingType={listingType}
          {...panelProps(PRICING)}
          submitButtonText={intl.formatMessage({ id: submitButtonTranslationKey })}
          onSubmit={values => {
            onCompleteEditListingWizardTab(tab, values);
          }}
        />
      );
    }
    case AVAILABILITY: {
      const submitButtonTranslationKey = submitButtonAvailabilityTranslationToUse(listingType);
      return (
        <EditListingAvailabilityPanel
          {...panelProps(AVAILABILITY)}
          listingType={listingType}
          availability={availability}
          submitButtonText={intl.formatMessage({ id: submitButtonTranslationKey })}
          onSubmit={values => {
            onCompleteEditListingWizardTab(tab, values);
          }}
        />
      );
    }
    case PHOTOS: {
      const submitButtonTranslationKey = isNewListingFlow
        ? 'EditListingWizard.saveNewPhotos'
        : 'EditListingWizard.saveEditPhotos';

      return (
        <EditListingPhotosPanel
          {...panelProps(PHOTOS)}
          submitButtonText={intl.formatMessage({ id: submitButtonTranslationKey })}
          images={images}
          onImageUpload={onImageUpload}
          onRemoveImage={onRemoveImage}
          onSubmit={values => {
            onCompleteEditListingWizardTab(tab, values);
          }}
          onUpdateImageOrder={onUpdateImageOrder}
        />
      );
    }
    default:
      return null;
  }
};

EditListingWizardTab.defaultProps = {
  listing: null,
  updatedTab: null,
};

const { array, bool, func, object, oneOf, shape, string } = PropTypes;

EditListingWizardTab.propTypes = {
  params: shape({
    id: string.isRequired,
    slug: string.isRequired,
    type: oneOf(LISTING_PAGE_PARAM_TYPES).isRequired,
    tab: oneOf(SUPPORTED_TABS).isRequired,
  }).isRequired,
  errors: shape({
    createListingDraftError: object,
    publishListingError: object,
    updateListingError: object,
    showListingsError: object,
    uploadImageError: object,
  }).isRequired,
  fetchInProgress: bool.isRequired,
  newListingPublished: bool.isRequired,
  history: shape({
    push: func.isRequired,
    replace: func.isRequired,
  }).isRequired,
  images: array.isRequired,
  availability: object.isRequired,

  // We cannot use propTypes.listing since the listing might be a draft.
  listing: shape({
    attributes: shape({
      publicData: object,
      description: string,
      geolocation: object,
      pricing: object,
      title: string,
    }),
    images: array,
  }),

  handleCreateFlowTabScrolling: func.isRequired,
  handlePublishListing: func.isRequired,
  onUpdateListing: func.isRequired,
  onCreateListingDraft: func.isRequired,
  onImageUpload: func.isRequired,
  onUpdateImageOrder: func.isRequired,
  onRemoveImage: func.isRequired,
  onChange: func.isRequired,
  updatedTab: string,
  updateInProgress: bool.isRequired,

  intl: intlShape.isRequired,
};

export default EditListingWizardTab;
