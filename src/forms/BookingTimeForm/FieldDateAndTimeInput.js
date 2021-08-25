import React, { Component } from 'react';
import { array, func, object, string } from 'prop-types';
import classNames from 'classnames';
import config from '../../config';
import { intlShape } from '../../util/reactIntl';
import {
  getStartHours,
  isInRange,
  resetToStartOfDay,
  timeOfDayFromLocalToTimeZone,
  timeOfDayFromTimeZoneToLocal,
  dateIsAfter,
  findNextBoundary,
  localizeAndFormatTime,
  getMonthStartInTimeZone,
  nextMonthFn,
  prevMonthFn,
  dateIsAfterOnly,
} from '../../util/time';
import { propTypes } from '../../util/types';
import { bookingDateRequired } from '../../util/validators';
import { FieldDateInput, FieldSelect } from '../../components';

import NextMonthIcon from './NextMonthIcon';
import PreviousMonthIcon from './PreviousMonthIcon';
import css from './FieldDateAndTimeInput.module.css';
import moment from 'moment';

// MAX_TIME_SLOTS_RANGE is the maximum number of days forwards during which a booking can be made.
// This is limited due to Stripe holding funds up to 90 days from the
// moment they are charged:
// https://stripe.com/docs/connect/account-balances#holding-funds
//
// See also the API reference for querying time slots:
// https://www.sharetribe.com/api-reference/marketplace.html#query-time-slots

const MAX_TIME_SLOTS_RANGE = config.dayCountAvailableForBooking;

const TODAY = new Date();

const endOfRange = (date, timeZone) => {
  return resetToStartOfDay(date, timeZone, MAX_TIME_SLOTS_RANGE - 1);
};

const addTimeToDate = (oldTime, oldDate) => {
  const tempTime = new Date(Number(oldTime)).getHours();
  return moment(oldDate)
    .set({
      hour: tempTime,
      minute: 0,
      second: 0,
    })
    .toDate();
};

const getAvailableTime = (intl, timeZone, bookingStart, timeSlotsOnSelectedDate) => {
  if (timeSlotsOnSelectedDate.length === 0 || !timeSlotsOnSelectedDate[0] || !bookingStart) {
    return [];
  }
  const bookingStartDate = resetToStartOfDay(bookingStart, timeZone);
  const allHours = timeSlotsOnSelectedDate.reduce((availableHours, t) => {
    const startDate = t.attributes.start;
    const endDate = t.attributes.end;
    const nextDate = resetToStartOfDay(bookingStartDate, timeZone, 1);

    // If the start date is after timeslot start, use the start date.
    // Otherwise use the timeslot start time.
    const startLimit = dateIsAfter(bookingStartDate, startDate) ? bookingStartDate : startDate;

    // If date next to selected start date is inside timeslot use the next date to get the hours of full day.
    // Otherwise use the end of the timeslot.
    const endLimit = dateIsAfter(endDate, nextDate) ? nextDate : endDate;

    const hours = getStartHours(intl, timeZone, startLimit, endLimit);
    return availableHours.concat(hours);
  }, []);
  return allHours;
};
const getTimeSlots = (timeSlots, date, timeZone) => {
  return timeSlots && timeSlots[0]
    ? timeSlots.filter(t => isInRange(date, t.attributes.start, t.attributes.end, 'day', timeZone))
    : [];
};

const Next = props => {
  const { currentMonth, timeZone } = props;
  const nextMonthDate = nextMonthFn(currentMonth, timeZone);

  return dateIsAfter(nextMonthDate, endOfRange(TODAY, timeZone)) ? null : <NextMonthIcon />;
};
const Prev = props => {
  const { currentMonth, timeZone } = props;
  const prevMonthDate = prevMonthFn(currentMonth, timeZone);
  const currentMonthDate = getMonthStartInTimeZone(TODAY, timeZone);

  return dateIsAfter(prevMonthDate, currentMonthDate) ? <PreviousMonthIcon /> : null;
};

const getFirstTimeValue = (intl, timeZone, timeSlots, date) => {
  const times = getAvailableTime(intl, timeZone, date, getTimeSlots(timeSlots, date, timeZone));
  const time =
    times.length > 0 && times[0] && times[0].timestamp ? times[0].timestamp.toString() : null;
  return { date, time };
};
/////////////////////////////////////
// FieldDateAndTimeInput component //
/////////////////////////////////////
class FieldDateAndTimeInput extends Component {
  constructor(props) {
    super(props);

    this.state = {
      currentMonth: getMonthStartInTimeZone(TODAY, props.timeZone),
    };

    this.onMonthClick = this.onMonthClick.bind(this);
    this.onBookingStartDateChange = this.onBookingStartDateChange.bind(this);
    this.onBookingStartTimeChange = this.onBookingStartTimeChange.bind(this);
    this.onBookingEndDateChange = this.onBookingEndDateChange.bind(this);
    this.onBookingEndTimeChange = this.onBookingEndTimeChange.bind(this);
    this.isOutsideRange = this.isOutsideRange.bind(this);
  }

  onMonthClick(monthFn) {
    const { timeZone } = this.props;

    this.setState(prevState => ({ currentMonth: monthFn(prevState.currentMonth, timeZone) }));
  }

  onBookingStartDateChange = value => {
    const { timeZone, timeSlots, intl, form } = this.props;
    if (!value || !value.date) {
      form.batch(() => {
        form.change('bookingStartTime', null);
        form.change('bookingEndDate', { date: null });
        form.change('bookingEndTime', null);
      });
      this.setState({ currentMonth: getMonthStartInTimeZone(TODAY, timeZone) });

      return;
    }

    const startDate = timeOfDayFromLocalToTimeZone(value.date, timeZone);
    const timeSlotsOnSelectedStartDate = getTimeSlots(timeSlots, startDate, timeZone);
    const { time: startTime } = getFirstTimeValue(
      intl,
      timeZone,
      timeSlotsOnSelectedStartDate,
      startDate
    );
    const displayStart = addTimeToDate(startTime, startDate);

    form.batch(() => {
      form.change('bookingStartDate', { date: startDate });
      form.change('bookingStartTime', startTime);
      form.change('bookingDisplayStart', displayStart);

      form.change('bookingEndDate', { date: null });
      form.change('bookingEndTime', null);
      form.change('bookingDisplayEnd', null);
    });
  };

  onBookingStartTimeChange = e => {
    const { startDate, form } = this.props;
    const value = e.target.value;
    const displayStart = addTimeToDate(value, startDate.date);
    form.batch(() => {
      form.change('bookingStartTime', value);
      form.change('bookingDisplayStart', displayStart);
    });
  };
  onBookingEndTimeChange = e => {
    const { endDate, form } = this.props;
    const value = e.target.value;
    const displayEnd = addTimeToDate(value, endDate.date);

    form.batch(() => {
      form.change('bookingEndTime', value);
      form.change('bookingDisplayEnd', displayEnd);
    });
  };
  onBookingEndDateChange = value => {
    const { intl, timeZone, timeSlots, form } = this.props;
    if (!value || !value.date) {
      form.change('bookingEndTime', null);
      return;
    }
    const endDate = timeOfDayFromLocalToTimeZone(value.date, timeZone);
    const timeSlotsOnSelectedEndDate = getTimeSlots(timeSlots, endDate, timeZone);
    const { time: endTime } = getFirstTimeValue(
      intl,
      timeZone,
      timeSlotsOnSelectedEndDate,
      endDate
    );
    const displayEnd = addTimeToDate(endTime, endDate);

    form.batch(() => {
      form.change('bookingEndDate', { date: endDate });
      form.change('bookingEndTime', endTime);
      form.change('bookingDisplayEnd', displayEnd);
    });
  };
  isOutsideRange(day, bookingStartDate, timeZone) {
    if (!bookingStartDate) {
      return true;
    }

    // 'day' is pointing to browser's local time-zone (react-dates gives these).
    // However, bookingStartDate and selectedTimeSlot refer to times in listing's timeZone.
    const localizedDay = timeOfDayFromLocalToTimeZone(day, timeZone);
    // Given day (endDate) should be after the start of the day of selected booking start date.
    const startDate = resetToStartOfDay(bookingStartDate, timeZone);
    // 00:00 would return wrong day as the end date.
    // Removing 1 millisecond, solves the exclusivity issue.
    return !dateIsAfterOnly(localizedDay, startDate);
  }
  render() {
    const {
      rootClassName,
      className,
      formId,
      startDateInputProps,
      endDateInputProps,
      values,
      timeSlots,
      timeZone,
      intl,
    } = this.props;
    const classes = classNames(rootClassName || css.root, className);
    console.log(values);
    const bookingStartDate =
      values.bookingStartDate && values.bookingStartDate.date ? values.bookingStartDate.date : null;
    const bookingStartTime = values.bookingStartTime ? values.bookingStartTime : null;
    const bookingEndDate =
      values.bookingEndDate && values.bookingEndDate.date ? values.bookingEndDate.date : null;

    const startTimeDisabled = !bookingStartDate;
    const endDateDisabled = !bookingStartDate || !bookingStartTime;
    const endTimeDisabled = !bookingStartDate || !bookingStartTime || !bookingEndDate;

    const timeSlotsOnSelectedStartDate = getTimeSlots(timeSlots, bookingStartDate, timeZone);
    const timeSlotsOnSelectedEndDate = getTimeSlots(timeSlots, bookingEndDate, timeZone);

    const availableStartTimes = bookingStartDate
      ? getAvailableTime(intl, timeZone, bookingStartDate, timeSlotsOnSelectedStartDate)
      : [];
    const availableEndTimes = bookingEndDate
      ? getAvailableTime(intl, timeZone, bookingEndDate, timeSlotsOnSelectedEndDate)
      : [];

    const placeholderTime = localizeAndFormatTime(
      intl,
      timeZone,
      findNextBoundary(timeZone, TODAY)
    );

    const startTimeLabel = intl.formatMessage({ id: 'FieldDateTimeInput.startTime' });
    const endTimeLabel = intl.formatMessage({ id: 'FieldDateTimeInput.endTime' });

    return (
      <div className={classes}>
        <div className={css.formRow}>
          <div className={classNames(css.field)}>
            <FieldDateInput
              className={css.fieldDateInput}
              name="bookingStartDate"
              id={formId ? `${formId}.bookingStartDate` : 'bookingStartDate'}
              label={startDateInputProps.label}
              placeholderText={startDateInputProps.placeholderText}
              format={v =>
                v && v.date ? { date: timeOfDayFromTimeZoneToLocal(v.date, timeZone) } : v
              }
              parse={v =>
                v && v.date ? { date: timeOfDayFromLocalToTimeZone(v.date, timeZone) } : v
              }
              timeSlots={timeSlots}
              onChange={this.onBookingStartDateChange}
              onPrevMonthClick={() => this.onMonthClick(prevMonthFn)}
              onNextMonthClick={() => this.onMonthClick(nextMonthFn)}
              navNext={<Next currentMonth={this.state.currentMonth} timeZone={timeZone} />}
              navPrev={<Prev currentMonth={this.state.currentMonth} timeZone={timeZone} />}
              useMobileMargins
              validate={bookingDateRequired('Required')}
              onClose={() =>
                this.setState({ currentMonth: getMonthStartInTimeZone(TODAY, this.props.timeZone) })
              }
            />
          </div>
          <div className={css.field}>
            <FieldSelect
              name="bookingStartTime"
              id={formId ? `${formId}.bookingStartTime` : 'bookingStartTime'}
              className={bookingStartDate ? css.fieldSelect : css.fieldSelectDisabled}
              label={startTimeLabel}
              disabled={startTimeDisabled}
              onChange={this.onBookingStartTimeChange}
            >
              {bookingStartDate ? (
                availableStartTimes.map(p => (
                  <option key={p.timeOfDay} value={p.timestamp}>
                    {p.timeOfDay}
                  </option>
                ))
              ) : (
                <option>{placeholderTime}</option>
              )}
            </FieldSelect>
          </div>
        </div>
        <div className={css.formRow}>
          <div className={classNames(css.field)}>
            <FieldDateInput
              name="bookingEndDate"
              id={formId ? `${formId}.bookingEndDate` : 'bookingEndDate'}
              className={css.fieldDateInput}
              label={endDateInputProps.label}
              placeholderText={endDateInputProps.placeholderText}
              format={v =>
                v && v.date ? { date: timeOfDayFromTimeZoneToLocal(v.date, timeZone) } : v
              }
              parse={v =>
                v && v.date ? { date: timeOfDayFromLocalToTimeZone(v.date, timeZone) } : v
              }
              timeSlots={timeSlots}
              onChange={this.onBookingEndDateChange}
              onPrevMonthClick={() => this.onMonthClick(prevMonthFn)}
              onNextMonthClick={() => this.onMonthClick(nextMonthFn)}
              navNext={<Next currentMonth={this.state.currentMonth} timeZone={timeZone} />}
              navPrev={<Prev currentMonth={this.state.currentMonth} timeZone={timeZone} />}
              useMobileMargins
              validate={bookingDateRequired('Required')}
              disabled={endDateDisabled}
              isOutsideRange={day => this.isOutsideRange(day, bookingStartDate, timeZone)}
            />
          </div>
          <div className={css.field}>
            <FieldSelect
              name="bookingEndTime"
              id={formId ? `${formId}.bookingEndTime` : 'bookingEndTime'}
              className={bookingStartDate ? css.fieldSelect : css.fieldSelectDisabled}
              label={endTimeLabel}
              onChange={this.onBookingEndTimeChange}
              disabled={endTimeDisabled}
            >
              {bookingStartDate && bookingEndDate ? (
                availableEndTimes.map(p => (
                  <option key={p.timeOfDay} value={p.timestamp}>
                    {p.timeOfDay}
                  </option>
                ))
              ) : (
                <option>{placeholderTime}</option>
              )}
            </FieldSelect>
          </div>
        </div>
      </div>
    );
  }
}

FieldDateAndTimeInput.defaultProps = {
  rootClassName: null,
  className: null,
  startDateInputProps: null,
  endDateInputProps: null,
  startTimeInputProps: null,
  endTimeInputProps: null,
  listingId: null,
  timeSlots: [],
  timeZone: null,
};

FieldDateAndTimeInput.propTypes = {
  rootClassName: string,
  className: string,
  formId: string,
  bookingStartLabel: string,
  startDateInputProps: object,
  endDateInputProps: object,
  startTimeInputProps: object,
  endTimeInputProps: object,
  form: object.isRequired,
  values: object.isRequired,
  listingId: propTypes.uuid,
  timeSlots: array,
  onFetchTimeSlots: func.isRequired,
  timeZone: string,

  // from injectIntl
  intl: intlShape.isRequired,
};

export default FieldDateAndTimeInput;
