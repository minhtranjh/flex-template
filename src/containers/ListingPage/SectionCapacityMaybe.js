import { shape, string } from 'prop-types';
import React from 'react';
import { FormattedMessage } from 'react-intl/dist/react-intl';
import css from './ListingPage.module.css';

const SectionCapacityMaybe = props => {
  const { publicData, options } = props;
  const capacity = publicData&&publicData.capacity ? publicData.capacity : null;
  const capacityOption = options.find(option => option.key === capacity);
  return capacityOption ? (
    <div className={css.sectionCapacity}>
      <h2 className={css.capacityTitle}>
        <FormattedMessage id="ListingPage.capacityTitle" />
      </h2>
      <p className={css.capacity}>{capacityOption.label}</p>
    </div>
  ) : null;
};
SectionCapacityMaybe.defaultProps = { className: null, rootClassName: null };

SectionCapacityMaybe.propTypes = {
  className: string,
  rootClassName: string,
  publicData: shape({
    capacity: string,
  }),
};

export default SectionCapacityMaybe;
