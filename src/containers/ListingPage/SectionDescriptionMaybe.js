import React from 'react';
import { FormattedMessage } from '../../util/reactIntl';
import { richText } from '../../util/richText';

import css from './ListingPage.module.css';

const MIN_LENGTH_FOR_LONG_WORDS_IN_DESCRIPTION = 20;

const SectionDescriptionMaybe = props => {
  const { description, listingType } = props;
  const descriptionTitle = () => {
    switch (listingType) {
      case 'equipment':
        return <FormattedMessage id="ListingPage.equipmentDescriptionTitle" />;
      case 'sauna':
        return <FormattedMessage id="ListingPage.descriptionTitle" />;
      default:
        return <FormattedMessage id="ListingPage.descriptionTitle" />;
    }
  };
  return description ? (
    <div className={css.sectionDescription}>
      <h2 className={css.descriptionTitle}>{descriptionTitle()}</h2>
      <p className={css.description}>
        {richText(description, {
          longWordMinLength: MIN_LENGTH_FOR_LONG_WORDS_IN_DESCRIPTION,
          longWordClass: css.longWord,
        })}
      </p>
    </div>
  ) : null;
};

export default SectionDescriptionMaybe;
