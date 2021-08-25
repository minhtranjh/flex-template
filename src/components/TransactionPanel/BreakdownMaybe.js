import React from 'react';
import classNames from 'classnames';
import config from '../../config';
import { DATE_TYPE_DATE, DATE_TYPE_DATETIME } from '../../util/types';
import { BookingBreakdown } from '../../components';

import css from './TransactionPanel.module.css';
import { EQUIPMENT_LISTING_TYPE } from '../EditListingWizard/EditListingWizard';

// Functional component as a helper to build BookingBreakdown
const BreakdownMaybe = props => {
  const { className, rootClassName, breakdownClassName, transaction, transactionRole,listingType } = props;
  const loaded = transaction && transaction.id && transaction.booking && transaction.booking.id;
  
  const classes = classNames(rootClassName || css.breakdownMaybe, className);
  const breakdownClasses = classNames(breakdownClassName || css.breakdown);
  const dateType = ()=>{
    switch (listingType) {
      case EQUIPMENT_LISTING_TYPE:
        return DATE_TYPE_DATETIME    
      default:
        return DATE_TYPE_DATE
    }
  }
  return loaded ? (
    <div className={classes}>
      <BookingBreakdown
        className={breakdownClasses}
        userRole={transactionRole}
        unitType={config.bookingUnitType}
        transaction={transaction}
        booking={transaction.booking}
        dateType={dateType()}
      />
    </div>
  ) : null;
};

export default BreakdownMaybe;
