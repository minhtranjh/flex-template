import moment from 'moment';
import React, { Component } from 'react';
import { bookingDatesRequired, composeValidators, required } from '../../util/validators';
import FieldDateRangeInput from '../FieldDateRangeInput/FieldDateRangeInput';
import FieldSelect from '../FieldSelect/FieldSelect';
import css from './FieldDateAndTimeRangeInput.module.css';
const addTimeToDate = (oldTime, oldDate) => {
  const hour = moment(oldTime).format('hh');
  return moment(oldDate)
    .set({
      hour: hour,
    })
    .toDate();
};
class FieldDateAndTimeRangeInput extends Component {
  constructor(props) {
    super(props);
    this.onBookingEndTimeChange = this.onBookingEndTimeChange.bind(this);
    this.onBookingStartTimeChange = this.onBookingStartTimeChange.bind(this);
  }
  onBookingStartTimeChange = e => {
    const { form, startDate, endDate } = this.props;
    const time = e.target.value;
    const addedTimeToDate = addTimeToDate(time, startDate);
    form.batch(() => {
      form.change('bookingDates', { startDate: addedTimeToDate, endDate });
      form.change('bookingStartTime', time);
      form.change('bookingEndTime', null);
    });
  };
  onBookingEndTimeChange = e => {
    const { form, endDate, startDate } = this.props;
    const time = e.target.value;
    const addedTimeToDate = addTimeToDate(time, endDate);
    form.batch(() => {
      form.change('bookingDates', { endDate: addedTimeToDate, startDate });
      form.change('bookingEndTime', time);
    });
  };
  render() {
    const {
      focusedInput,
      bookingStartLabel,
      bookingEndLabel,
      startDatePlaceholderText,
      endDatePlaceholderText,
      requiredMessage,
      startDateErrorMessage,
      format,
      timeSlots,
      onFocusedInputChange,
      endDateErrorMessage,
      unitType,
      formId,
      fetchLineItemsInProgress,
      canHourlyBooking
    } = this.props;
    const availableStartTimes = [
      {
        timeOfDay: '01:00',
        timestamp: 'Friday, August 20, 2021 01:00:00 AM GMT+07:00',
      },
      {
        timeOfDay: '02:00',
        timestamp: 'Friday, August 20, 2021 02:00:00 AM GMT+07:00',
      },
      {
        timeOfDay: '03:00',
        timestamp: 'Friday, August 20, 2021 03:00:00 AM GMT+07:00',
      },
      {
        timeOfDay: '04:00',
        timestamp: 'Friday, August 20, 2021 04:00:00 AM GMT+07:00',
      },
      {
        timeOfDay: '05:00',
        timestamp: 'Friday, August 20, 2021 05:00:00 AM GMT+07:00',
      },
      {
        timeOfDay: '06:00',
        timestamp: 'Friday, August 20, 2021 06:00:00 AM GMT+07:00',
      },
      {
        timeOfDay: '07:00',
        timestamp: 'Friday, August 20, 2021 07:00:00 AM GMT+07:00',
      },
      {
        timeOfDay: '08:00',
        timestamp: 'Friday, August 20, 2021 08:00:00 AM GMT+07:00',
      },
      {
        timeOfDay: '09:00',
        timestamp: 'Friday, August 20, 2021 09:00:00 AM GMT+07:00',
      },
      {
        timeOfDay: '10:00',
        timestamp: 'Friday, August 20, 2021 10:00:00 AM GMT+07:00',
      },
    ];
    const availableEndTimes = [
      {
        timeOfDay: '01:00',
        timestamp: 'Friday, August 20, 2021 01:00:00 AM GMT+07:00',
      },
      {
        timeOfDay: '02:00',
        timestamp: 'Friday, August 20, 2021 02:00:00 AM GMT+07:00',
      },
      {
        timeOfDay: '03:00',
        timestamp: 'Friday, August 20, 2021 03:00:00 AM GMT+07:00',
      },
      {
        timeOfDay: '04:00',
        timestamp: 'Friday, August 20, 2021 04:00:00 AM GMT+07:00',
      },
      {
        timeOfDay: '05:00',
        timestamp: 'Friday, August 20, 2021 05:00:00 AM GMT+07:00',
      },
      {
        timeOfDay: '06:00',
        timestamp: 'Friday, August 20, 2021 06:00:00 AM GMT+07:00',
      },
      {
        timeOfDay: '07:00',
        timestamp: 'Friday, August 20, 2021 07:00:00 AM GMT+07:00',
      },
    ];

    return (
      <div className={css.formRow}>
        <div className={css.field}>
          <FieldDateRangeInput
            canHourlyBooking={canHourlyBooking}
            className={css.bookingDates}
            name="bookingDates"
            unitType={unitType}
            startDateId={`${formId}.bookingStartDate`}
            startDateLabel={bookingStartLabel}
            startDatePlaceholderText={startDatePlaceholderText}
            endDateId={`${formId}.bookingEndDate`}
            endDateLabel={bookingEndLabel}
            endDatePlaceholderText={endDatePlaceholderText}
            focusedInput={focusedInput}
            onFocusedInputChange={onFocusedInputChange}
            format={format}
            timeSlots={timeSlots}
            useMobileMargins
            validate={composeValidators(
              required(requiredMessage),
              bookingDatesRequired(startDateErrorMessage, endDateErrorMessage)
            )}
            disabled={fetchLineItemsInProgress}
          />
        </div>
        <div className={css.field}>
          <div className={css.selectGroup}>
            <FieldSelect
              label="Pick up time"
              name="bookingStartTime"
              id={formId ? `${formId}.bookingStartTime` : 'bookingStartTime'}
              onChange={this.onBookingStartTimeChange}
            >
              {availableStartTimes.map(p => (
                <option key={p.timeOfDay} value={p.timestamp}>
                  {p.timeOfDay}
                </option>
              ))}
            </FieldSelect>
            <FieldSelect
              label="Drop off time"
              name="bookingEndTime"
              id={formId ? `${formId}.bookingEndTime` : 'bookingEndTime'}
              onChange={this.onBookingEndTimeChange}
            >
              {availableEndTimes.map(p => (
                <option key={p.timeOfDay} value={p.timestamp}>
                  {p.timeOfDay}
                </option>
              ))}
            </FieldSelect>
          </div>
        </div>
      </div>
    );
  }
}

export default FieldDateAndTimeRangeInput;
