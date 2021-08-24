import React from 'react';
import { EQUIPMENT_LISTING_TYPE } from '../../components/EditListingWizard/EditListingWizard';
import { FormattedMessage } from '../../util/reactIntl';

import css from './ListingPage.module.css';


const SectionMaxUsingTimeADay = props => {
  const { maxUsingTimeADay, listingType } = props;

  const maxUsingTimeTitle = () => {
    switch (listingType) {
      case EQUIPMENT_LISTING_TYPE:
        return <FormattedMessage id="ListingPage.maxUsingTimeADayTitle" />;
      default:
        return null;
    }
  };
  return maxUsingTimeADay ? (
    <div className={css.sectionDescription}>
      <h2 className={css.descriptionTitle}>{maxUsingTimeTitle()}</h2>
      <p className={css.description}>
        {maxUsingTimeADay}
      </p>
    </div>
  ) : null;
};

export default SectionMaxUsingTimeADay;
