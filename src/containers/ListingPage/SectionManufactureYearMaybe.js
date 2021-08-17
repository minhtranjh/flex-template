import React from 'react';
import { FormattedMessage } from '../../util/reactIntl';

import css from './ListingPage.module.css';


const SectionManufactureYearMaybe = props => {
  const { manufactureYear, listingType } = props;
  const descriptionTitle = () => {
    switch (listingType) {
      case 'equipment':
        return <FormattedMessage id="ListingPage.equipmentManufactureYearTitle" />;
      default:
        return <FormattedMessage id="ListingPage.manufactureYearTitle" />;
    }
  };
  return manufactureYear ? (
    <div className={css.sectionDescription}>
      <h2 className={css.descriptionTitle}>{descriptionTitle()}</h2>
      <p className={css.description}>
        {manufactureYear}
      </p>
    </div>
  ) : null;
};

export default SectionManufactureYearMaybe;
