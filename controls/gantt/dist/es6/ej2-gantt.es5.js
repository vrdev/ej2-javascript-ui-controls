import { Browser, ChildProperty, Collection, Complex, Component, Event, EventHandler, Internationalization, KeyboardEvents, L10n, NotifyPropertyChanges, Property, addClass, append, closest, compile, createElement, deleteObject, extend, formatUnit, getValue, isNullOrUndefined, isObject, isObjectArray, isUndefined, merge, remove, removeClass, setValue } from '@syncfusion/ej2-base';
import { Dialog, Tooltip, createSpinner, hideSpinner, showSpinner } from '@syncfusion/ej2-popups';
import { Edit, Filter, ForeignKey, Grid, Page, Predicate, Selection, Toolbar, filterAfterOpen, getActualProperties, getFilterMenuPostion, getUid, parentsUntil, setCssInGridPopUp } from '@syncfusion/ej2-grids';
import { CacheAdaptor, DataManager, DataUtil, ODataAdaptor, Query, UrlAdaptor, WebApiAdaptor, WebMethodAdaptor } from '@syncfusion/ej2-data';
import { Edit as Edit$1, Filter as Filter$1, Reorder, Resize, Sort, TreeGrid } from '@syncfusion/ej2-treegrid';
import { MaskedTextBox, NumericTextBox, TextBox } from '@syncfusion/ej2-inputs';
import { CheckBoxSelection, ComboBox, DropDownList, MultiSelect } from '@syncfusion/ej2-dropdowns';
import { DatePicker, DateTimePicker } from '@syncfusion/ej2-calendars';
import { Splitter } from '@syncfusion/ej2-layouts';
import { Tab, Toolbar as Toolbar$1 } from '@syncfusion/ej2-navigations';
import { Count, HtmlEditor, Image, Link, QuickToolbar, RichTextEditor, Toolbar as Toolbar$2 } from '@syncfusion/ej2-richtexteditor';
import { CheckBox } from '@syncfusion/ej2-buttons';

/**
 * Common methods used in Gantt
 */
/** @hidden */
function parentsUntil$1(elem, selector, isID) {
    var parent = elem;
    while (parent) {
        if (isID ? parent.id === selector : parent.classList.contains(selector)) {
            break;
        }
        parent = parent.parentElement;
    }
    return parent;
}
function isScheduledTask(ganttProp) {
    if (isNullOrUndefined(ganttProp.startDate) && isNullOrUndefined(ganttProp.endDate) &&
        isNullOrUndefined(ganttProp.duration)) {
        return null;
    }
    else if (isNullOrUndefined(ganttProp.startDate) || isNullOrUndefined(ganttProp.endDate) ||
        isNullOrUndefined(ganttProp.duration)) {
        return false;
    }
    else {
        return true;
    }
}
function getSwapKey(obj) {
    var temp = {};
    for (var _i = 0, _a = Object.keys(obj); _i < _a.length; _i++) {
        var key = _a[_i];
        temp[obj[key]] = key;
    }
    return temp;
}
function isRemoteData(dataSource) {
    if (dataSource instanceof DataManager) {
        var adaptor = dataSource.adaptor;
        return (adaptor instanceof ODataAdaptor ||
            (adaptor instanceof WebApiAdaptor) || (adaptor instanceof WebMethodAdaptor) ||
            (adaptor instanceof CacheAdaptor) || adaptor instanceof UrlAdaptor);
    }
    return false;
}
function getTaskData(records) {
    var result = [];
    for (var i = 0; i < records.length; i++) {
        var data = extend({}, records[i].taskData, {}, true);
        result.push(data);
    }
    return result;
}
function formatString(str, args) {
    var regx;
    for (var i = 0; i < args.length; i++) {
        regx = new RegExp('\\{' + (i) + '\\}', 'gm');
        str = str.replace(regx, args[i].toString());
    }
    return str;
}
/* tslint:disable-next-line */
function getIndex(value, key1, collection, key2) {
    var index = -1;
    for (var i = 0; i < collection.length; i++) {
        if (getValue(key1, collection[i]) === getValue(key1, value) && isNullOrUndefined(key2)
            || (!isNullOrUndefined(key2) && getValue(key1, collection[i]) === getValue(key1, value)
                && getValue(key2, collection[i]) === getValue(key2, value))) {
            index = i;
            break;
        }
    }
    return index;
}

/**
 * @hidden
 */
var DurationUnits;
(function (DurationUnits) {
    DurationUnits["Minute"] = "minute";
    DurationUnits["Hour"] = "hour";
    DurationUnits["Day"] = "day";
})(DurationUnits || (DurationUnits = {}));
/**
 * To define edit type value for columns
 * @hidden
 */
var EditType;
(function (EditType) {
    EditType["Boolean"] = "booleanedit";
    EditType["DropDown"] = "dropdownedit";
    EditType["DatePicker"] = "datepickeredit";
    EditType["DateTimePicker"] = "datetimepickeredit";
    EditType["Masked"] = "maskededit";
    EditType["Numeric"] = "numericedit";
    EditType["String"] = "stringedit";
})(EditType || (EditType = {}));

/**
 *
 */
var DateProcessor = /** @__PURE__ @class */ (function () {
    function DateProcessor(parent) {
        this.parent = parent;
    }
    /**
     *
     */
    DateProcessor.prototype.isValidateNonWorkDays = function (ganttProp) {
        return (!isNullOrUndefined(ganttProp) && ganttProp.isAutoSchedule &&
            (!this.parent.includeWeekend || this.parent.totalHolidayDates.length > 0)) ||
            (isNullOrUndefined(ganttProp) && (!this.parent.includeWeekend || this.parent.totalHolidayDates.length > 0));
    };
    /**
     * Method to convert given date value as valid start date
     * @param date
     * @param ganttProp
     * @param validateAsMilestone
     * @private
     */
    DateProcessor.prototype.checkStartDate = function (date, ganttProp, validateAsMilestone) {
        if (isNullOrUndefined(date)) {
            return null;
        }
        var cloneStartDate = new Date(date.getTime());
        var hour = this.getSecondsInDecimal(cloneStartDate);
        validateAsMilestone = isNullOrUndefined(validateAsMilestone) ? !isNullOrUndefined(ganttProp) ?
            ganttProp.isMilestone : false : validateAsMilestone;
        if (hour < this.parent.defaultStartTime) {
            this.setTime(this.parent.defaultStartTime, cloneStartDate);
        }
        else if (hour === this.parent.defaultEndTime && (!ganttProp || !validateAsMilestone)) {
            cloneStartDate.setDate(cloneStartDate.getDate() + 1);
            this.setTime(this.parent.defaultStartTime, cloneStartDate);
        }
        else if (hour > this.parent.defaultEndTime) {
            cloneStartDate.setDate(cloneStartDate.getDate() + 1);
            this.setTime(this.parent.defaultStartTime, cloneStartDate);
        }
        else if (hour > this.parent.defaultStartTime && hour < this.parent.defaultEndTime) {
            for (var index = 0; index < this.parent.workingTimeRanges.length; index++) {
                var value = this.parent.workingTimeRanges[index];
                if (hour >= value.to && (this.parent.workingTimeRanges[index + 1] &&
                    hour < this.parent.workingTimeRanges[index + 1].from)) {
                    // milestone can fall at end any interval time
                    if (hour === value.to && (!ganttProp || !validateAsMilestone)) {
                        this.setTime(this.parent.workingTimeRanges[index + 1].from, cloneStartDate);
                    }
                    else if (hour !== value.to) {
                        this.setTime(this.parent.workingTimeRanges[index + 1].from, cloneStartDate);
                    }
                    break;
                }
            }
        }
        var tStartDate;
        do {
            tStartDate = new Date(cloneStartDate.getTime());
            var holidayLength = this.parent.totalHolidayDates.length;
            // check holidays and weekends
            if (this.isValidateNonWorkDays(ganttProp)) {
                if (!this.parent.includeWeekend) {
                    var tempDate = new Date(cloneStartDate.getTime());
                    cloneStartDate = this.getNextWorkingDay(cloneStartDate);
                    if (tempDate.getTime() !== cloneStartDate.getTime()) {
                        this.setTime(this.parent.defaultStartTime, cloneStartDate);
                    }
                }
                for (var count = 0; count < holidayLength; count++) {
                    var holidayFrom = this.getDateFromFormat(new Date(this.parent.totalHolidayDates[count]));
                    var holidayTo = new Date(holidayFrom.getTime());
                    holidayFrom.setHours(0, 0, 0, 0);
                    holidayTo.setHours(23, 59, 59, 59);
                    if (cloneStartDate.getTime() >= holidayFrom.getTime() && cloneStartDate.getTime() < holidayTo.getTime()) {
                        cloneStartDate.setDate(cloneStartDate.getDate() + 1);
                        this.setTime(this.parent.defaultStartTime, cloneStartDate);
                    }
                }
            }
        } while (tStartDate.getTime() !== cloneStartDate.getTime());
        return new Date(cloneStartDate.getTime());
    };
    /**
     * To update given date value to valid end date
     * @param date
     * @param ganttProp
     * @private
     */
    DateProcessor.prototype.checkEndDate = function (date, ganttProp) {
        if (isNullOrUndefined(date)) {
            return null;
        }
        var cloneEndDate = new Date(date.getTime());
        var hour = this.getSecondsInDecimal(cloneEndDate);
        if (hour > this.parent.defaultEndTime) {
            this.setTime(this.parent.defaultEndTime, cloneEndDate);
        }
        else if (hour <= this.parent.defaultStartTime) {
            cloneEndDate.setDate(cloneEndDate.getDate() - 1);
            this.setTime(this.parent.defaultEndTime, cloneEndDate);
        }
        else if (hour > this.parent.defaultStartTime && hour < this.parent.defaultEndTime) {
            for (var index = 0; index < this.parent.workingTimeRanges.length; index++) {
                var value = this.parent.workingTimeRanges[index];
                if (hour > value.to && (this.parent.workingTimeRanges[index + 1] &&
                    hour <= this.parent.workingTimeRanges[index + 1].from)) {
                    this.setTime(this.parent.workingTimeRanges[index].to, cloneEndDate);
                    break;
                }
            }
        }
        var tempCheckDate;
        do {
            tempCheckDate = new Date(cloneEndDate.getTime());
            var holidayLength = this.parent.totalHolidayDates.length;
            if (this.isValidateNonWorkDays(ganttProp)) {
                if (!this.parent.includeWeekend) {
                    var tempDate = new Date(cloneEndDate.getTime());
                    cloneEndDate = this.getPreviousWorkingDay(cloneEndDate);
                    if (tempDate.getTime() !== cloneEndDate.getTime()) {
                        this.setTime(this.parent.defaultEndTime, cloneEndDate);
                    }
                }
                for (var count = 0; count < holidayLength; count++) {
                    var holidayFrom = this.getDateFromFormat(new Date(this.parent.totalHolidayDates[count]));
                    var holidayTo = new Date(holidayFrom.getTime());
                    var tempHoliday = new Date(cloneEndDate.getTime());
                    tempHoliday.setMinutes(cloneEndDate.getMilliseconds() - 2);
                    holidayFrom.setHours(0, 0, 0, 0);
                    holidayTo.setHours(23, 59, 59, 59);
                    if (cloneEndDate.getTime() >= holidayFrom.getTime() && cloneEndDate.getTime() < holidayTo.getTime() ||
                        tempHoliday.getTime() >= holidayFrom.getTime() && tempHoliday.getTime() < holidayTo.getTime()) {
                        cloneEndDate.setDate(cloneEndDate.getDate() - 1);
                        if (!(cloneEndDate.getTime() === holidayFrom.getTime() && this.parent.defaultEndTime === 86400 &&
                            this.getSecondsInDecimal(cloneEndDate) === 0)) {
                            this.setTime(this.parent.defaultEndTime, cloneEndDate);
                        }
                    }
                }
            }
        } while (tempCheckDate.getTime() !== cloneEndDate.getTime());
        return new Date(cloneEndDate.getTime());
    };
    /**
     * To validate the baseline start date
     * @param date
     * @private
     */
    DateProcessor.prototype.checkBaselineStartDate = function (date) {
        if (isNullOrUndefined(date)) {
            return null;
        }
        else {
            var cloneDate = new Date(date.getTime());
            var hour = this.getSecondsInDecimal(cloneDate);
            if (hour < this.parent.defaultStartTime) {
                this.setTime(this.parent.defaultStartTime, cloneDate);
            }
            else if (hour >= this.parent.defaultEndTime) {
                cloneDate.setDate(cloneDate.getDate() + 1);
                this.setTime(this.parent.defaultStartTime, cloneDate);
            }
            else if (hour > this.parent.defaultStartTime && hour < this.parent.defaultEndTime) {
                for (var i = 0; i < this.parent.workingTimeRanges.length; i++) {
                    var value = this.parent.workingTimeRanges[i];
                    if (hour >= value.to && (this.parent.workingTimeRanges[i + 1] &&
                        hour < this.parent.workingTimeRanges[i + 1].from)) {
                        this.setTime(this.parent.workingTimeRanges[i + 1].from, cloneDate);
                        break;
                    }
                }
            }
            return cloneDate;
        }
    };
    /**
     * To validate baseline end date
     * @param date
     * @private
     */
    DateProcessor.prototype.checkBaselineEndDate = function (date) {
        if (isNullOrUndefined(date)) {
            return null;
        }
        else {
            var cloneDate = new Date(date.getTime());
            var hour = this.getSecondsInDecimal(cloneDate);
            if (hour > this.parent.defaultEndTime) {
                this.setTime(this.parent.defaultEndTime, cloneDate);
            }
            else if (hour <= this.parent.defaultStartTime) {
                cloneDate.setDate(cloneDate.getDate() - 1);
                this.setTime(this.parent.defaultEndTime, cloneDate);
            }
            else if (hour > this.parent.defaultStartTime && hour < this.parent.defaultEndTime) {
                for (var i = 0; i < this.parent.workingTimeRanges.length; i++) {
                    var value = this.parent.workingTimeRanges[i];
                    if (hour > value.to && (this.parent.workingTimeRanges[i + 1] && hour <= this.parent.workingTimeRanges[i + 1].from)) {
                        this.setTime(this.parent.workingTimeRanges[i].to, cloneDate);
                        break;
                    }
                }
            }
            return cloneDate;
        }
    };
    /**
     * To calculate start date value from duration and end date
     * @param ganttData
     * @private
     */
    DateProcessor.prototype.calculateStartDate = function (ganttData) {
        var ganttProp = ganttData.ganttProperties;
        var tempStartDate = null;
        if (!isNullOrUndefined(ganttProp.endDate) && !isNullOrUndefined(ganttProp.duration)) {
            tempStartDate = this.getStartDate(ganttProp.endDate, ganttProp.duration, ganttProp.durationUnit, ganttProp);
        }
        this.parent.setRecordValue('startDate', tempStartDate, ganttProp, true);
        if (this.parent.taskFields.startDate) {
            this.parent.dataOperation.updateMappingData(ganttData, 'startDate');
        }
    };
    /**
     *
     * @param ganttData
     * @private
     */
    DateProcessor.prototype.calculateEndDate = function (ganttData) {
        var ganttProp = ganttData.ganttProperties;
        var tempEndDate = null;
        if (!isNullOrUndefined(ganttProp.startDate)) {
            if (!isNullOrUndefined(ganttProp.endDate) && isNullOrUndefined(ganttProp.duration)) {
                if (this.compareDates(ganttProp.startDate, ganttProp.endDate) === 1) {
                    this.parent.setRecordValue('startDate', new Date(ganttProp.endDate.getTime()), ganttProp, true);
                    this.setTime(this.parent.defaultStartTime, ganttProp.startDate);
                }
                this.calculateDuration(ganttData);
            }
            if (!isNullOrUndefined(ganttProp.duration)) {
                tempEndDate = this.getEndDate(ganttProp.startDate, ganttProp.duration, ganttProp.durationUnit, ganttProp, false);
            }
            this.parent.setRecordValue('endDate', tempEndDate, ganttProp, true);
        }
        if (this.parent.taskFields.endDate) {
            this.parent.dataOperation.updateMappingData(ganttData, 'endDate');
        }
    };
    /**
     * To calculate duration from start date and end date
     * @param ganttData
     */
    DateProcessor.prototype.calculateDuration = function (ganttData) {
        var ganttProperties = ganttData.ganttProperties;
        var tDuration = this.getDuration(ganttProperties.startDate, ganttProperties.endDate, ganttProperties.durationUnit, ganttProperties.isAutoSchedule);
        this.parent.setRecordValue('duration', tDuration, ganttProperties, true);
        if (this.parent.taskFields.duration) {
            this.parent.dataOperation.updateMappingData(ganttData, 'duration');
            if (this.parent.taskFields.durationUnit) {
                this.parent.dataOperation.updateMappingData(ganttData, 'durationUnit');
            }
        }
    };
    /**
     *
     * @param sDate Method to get total nonworking time between two date values
     * @param eDate
     * @param isAutoSchedule
     * @param isCheckTimeZone
     */
    DateProcessor.prototype.getNonworkingTime = function (sDate, eDate, isAutoSchedule, isCheckTimeZone) {
        isCheckTimeZone = isNullOrUndefined(isCheckTimeZone) ? true : isCheckTimeZone;
        var timeDiff = this.getTimeDifference(sDate, eDate, isCheckTimeZone) / 1000; // To convert milliseconds to seconds
        var weekendCount = !this.parent.includeWeekend && isAutoSchedule ? this.getWeekendCount(sDate, eDate) : 0;
        var totalHours = this.getNumberOfSeconds(sDate, eDate, isCheckTimeZone);
        var holidaysCount = isAutoSchedule ? this.getHolidaysCount(sDate, eDate) : 0;
        var totWorkDays = (totalHours - (weekendCount * 86400) - (holidaysCount * 86400)) / 86400; // working days between two dates
        var nonWorkHours = this.getNonWorkingSecondsOnDate(sDate, eDate);
        var totalNonWorkTime = (totWorkDays * (86400 - this.parent.secondsPerDay)) +
            (weekendCount * 86400) + (holidaysCount * 86400) + nonWorkHours;
        return totalNonWorkTime;
    };
    /**
     *
     * @param startDate
     * @param endDate
     * @param durationUnit
     * @param isAutoSchedule
     * @param isCheckTimeZone
     * @private
     */
    DateProcessor.prototype.getDuration = function (startDate, endDate, durationUnit, isAutoSchedule, isCheckTimeZone) {
        if (isNullOrUndefined(startDate) || isNullOrUndefined(endDate)) {
            return null;
        }
        isCheckTimeZone = isNullOrUndefined(isCheckTimeZone) ? true : isCheckTimeZone;
        var durationValue = 0;
        var timeDiff = this.getTimeDifference(startDate, endDate, isCheckTimeZone) / 1000;
        var nonWorkHours = this.getNonworkingTime(startDate, endDate, isAutoSchedule, isCheckTimeZone);
        var durationHours = timeDiff - nonWorkHours;
        if (!durationUnit || durationUnit === DurationUnits.Day) {
            durationValue = durationHours / this.parent.secondsPerDay;
        }
        else if (durationUnit === DurationUnits.Minute) {
            durationValue = durationHours / 60;
        }
        else {
            durationValue = durationHours / 3600;
        }
        return parseFloat(durationValue.toString());
    };
    /**
     *
     * @param duration
     * @param durationUnit
     */
    DateProcessor.prototype.getDurationAsSeconds = function (duration, durationUnit) {
        var value = 0;
        if (!durationUnit || durationUnit === DurationUnits.Day.toString()) {
            value = this.parent.secondsPerDay * duration;
        }
        else if (durationUnit === DurationUnits.Hour.toString()) {
            value = duration * 3600;
        }
        else {
            value = duration * 60;
        }
        return value;
    };
    /**
     * To get date from start date and duration
     * @param startDate
     * @param duration
     * @param durationUnit
     * @param ganttProp
     * @param validateAsMilestone
     * @private
     */
    DateProcessor.prototype.getEndDate = function (startDate, duration, durationUnit, ganttProp, validateAsMilestone) {
        var tempStart = new Date(startDate.getTime());
        var endDate = new Date(startDate.getTime());
        var secondDuration = this.getDurationAsSeconds(duration, durationUnit);
        var nonWork = 0;
        var workHours = 0;
        while (secondDuration > 0) {
            endDate.setSeconds(endDate.getSeconds() + secondDuration);
            nonWork = this.getNonworkingTime(tempStart, endDate, ganttProp.isAutoSchedule, true);
            workHours = secondDuration - nonWork;
            secondDuration = secondDuration - workHours;
            if (secondDuration > 0) {
                endDate = this.checkStartDate(endDate, ganttProp, validateAsMilestone);
            }
            tempStart = new Date(endDate.getTime());
        }
        return endDate;
    };
    /**
     *
     * @param endDate To calculate start date vale from end date and duration
     * @param duration
     * @param durationUnit
     * @param ganttProp
     * @private
     */
    DateProcessor.prototype.getStartDate = function (endDate, duration, durationUnit, ganttProp) {
        var tempEnd = new Date(endDate.getTime());
        var startDate = new Date(endDate.getTime());
        var secondDuration = this.getDurationAsSeconds(duration, durationUnit);
        var nonWork = 0;
        var workHours = 0;
        while (secondDuration > 0) {
            startDate.setSeconds(startDate.getSeconds() - secondDuration);
            nonWork = this.getNonworkingTime(startDate, tempEnd, ganttProp.isAutoSchedule, true);
            workHours = secondDuration - nonWork;
            secondDuration = secondDuration - workHours;
            if (secondDuration > 0) {
                tempEnd = this.checkEndDate(startDate, ganttProp);
            }
            tempEnd = new Date(startDate.getTime());
        }
        return startDate;
    };
    /**
     * @private
     */
    DateProcessor.prototype.getProjectStartDate = function (ganttProp, isLoad) {
        if (!isNullOrUndefined(this.parent.cloneProjectStartDate)) {
            var cloneStartDate = this.checkStartDate(this.parent.cloneProjectStartDate);
            this.parent.cloneProjectStartDate = cloneStartDate;
            return new Date(cloneStartDate.getTime());
        }
        else if (!isNullOrUndefined(this.parent.projectStartDate)) {
            var cloneStartDate = this.getDateFromFormat(this.parent.projectStartDate);
            this.parent.cloneProjectStartDate = this.checkStartDate(cloneStartDate);
        }
        else if (!isNullOrUndefined(isLoad)) {
            var flatData = this.parent.flatData;
            var minStartDate = flatData[0].ganttProperties.startDate;
            for (var index = 1; index < flatData.length; index++) {
                var startDate = flatData[index].ganttProperties.startDate;
                if (!isNullOrUndefined(startDate) && this.compareDates(startDate, minStartDate) === -1) {
                    minStartDate = startDate;
                }
            }
            this.parent.cloneProjectStartDate = this.checkStartDate(minStartDate, ganttProp);
        }
        else {
            return null;
        }
        return new Date(this.parent.cloneProjectStartDate.getTime());
    };
    /**
     * @private
     * @param ganttProp
     */
    DateProcessor.prototype.getValidStartDate = function (ganttProp) {
        var sDate = null;
        if (isNullOrUndefined(ganttProp.startDate)) {
            if (!isNullOrUndefined(ganttProp.endDate)) {
                sDate = new Date(ganttProp.endDate.getTime());
                this.setTime(this.parent.defaultStartTime, sDate);
            }
            else if (!isNullOrUndefined(ganttProp.duration)) {
                sDate = this.getProjectStartDate(ganttProp);
            }
        }
        else {
            sDate = new Date(ganttProp.startDate.getTime());
        }
        return sDate;
    };
    /**
     *
     * @param ganttProp
     * @private
     */
    DateProcessor.prototype.getValidEndDate = function (ganttProp) {
        var eDate = null;
        if (isNullOrUndefined(ganttProp.endDate)) {
            if (!isNullOrUndefined(ganttProp.startDate)) {
                if (ganttProp.isMilestone) {
                    eDate = this.checkStartDate(ganttProp.startDate);
                }
                else {
                    eDate = new Date(ganttProp.startDate.getTime());
                    this.setTime(this.parent.defaultEndTime, eDate);
                }
            }
            else if (!isNullOrUndefined(ganttProp.duration)) {
                var sDate = this.getValidStartDate(ganttProp);
                if (sDate) {
                    eDate = this.getEndDate(sDate, ganttProp.duration, ganttProp.durationUnit, ganttProp, false);
                }
            }
        }
        else {
            eDate = new Date(ganttProp.endDate.getTime());
        }
        return eDate;
    };
    /**
     * @private
     */
    DateProcessor.prototype.getSecondsPerDay = function () {
        var dayWorkingTime = this.parent.dayWorkingTime;
        var length = dayWorkingTime.length;
        var totalSeconds = 0;
        var startDate = new Date('10/11/2018');
        var endDate = new Date('10/12/2018');
        var nonWorkingHours = this.parent.nonWorkingHours;
        var workingTimeRanges = this.parent.workingTimeRanges;
        var nonWorkingTimeRanges = this.parent.nonWorkingTimeRanges;
        for (var count = 0; count < length; count++) {
            var currentRange = dayWorkingTime[count];
            if (!isNullOrUndefined(currentRange.from) && !isNullOrUndefined(currentRange.to)) {
                startDate.setHours(currentRange.from);
                var startHour = new Date(startDate.getTime());
                var tempDate = currentRange.to !== 0 ? startDate : endDate;
                tempDate.setHours(currentRange.to);
                var endHour = new Date(tempDate.getTime());
                var timeDiff = endHour.getTime() - startHour.getTime();
                var sdSeconds = this.getSecondsInDecimal(startHour);
                var edSeconds = this.getSecondsInDecimal(endHour);
                if (edSeconds === 0) {
                    edSeconds = 86400;
                }
                totalSeconds += timeDiff / 1000;
                if (count === 0) {
                    this.parent.defaultStartTime = sdSeconds;
                }
                if (count === length - 1) {
                    this.parent.defaultEndTime = edSeconds;
                }
                if (count > 0) {
                    nonWorkingHours.push(nonWorkingHours[nonWorkingHours.length - 1] +
                        sdSeconds - workingTimeRanges[count - 1].to);
                    if (workingTimeRanges[count - 1].to < sdSeconds) {
                        nonWorkingTimeRanges.push({
                            from: workingTimeRanges[count - 1].to, to: sdSeconds, isWorking: false,
                            interval: (sdSeconds - workingTimeRanges[count - 1].to)
                        });
                    }
                }
                else {
                    nonWorkingHours.push(0);
                    nonWorkingTimeRanges.push({ from: 0, to: sdSeconds, isWorking: false, interval: sdSeconds });
                }
                workingTimeRanges.push({ from: sdSeconds, to: edSeconds });
                nonWorkingTimeRanges.push({
                    from: sdSeconds, to: edSeconds, isWorking: true, interval: (edSeconds - sdSeconds)
                });
            }
        }
        if (this.parent.defaultEndTime / 3600 !== 24) {
            nonWorkingTimeRanges.push({
                from: this.parent.defaultEndTime, to: 86400,
                isWorking: false, interval: 86400 - this.parent.defaultEndTime
            });
        }
        return totalSeconds;
    };
    /**
     *
     * @param value
     * @param isFromDialog
     * @private
     */
    DateProcessor.prototype.getDurationValue = function (value, isFromDialog) {
        var durationUnit = null;
        var duration = null;
        if (typeof value === 'string') {
            var values = value.match(/(\d*\.*\d+|[A-z]+)/g);
            if (values && values.length <= 2) {
                duration = parseFloat(values[0].toString());
                var unit = values[1] ? values[1].toString().toLowerCase() : null;
                if (getValue('minute', this.parent.durationUnitEditText).indexOf(unit) !== -1) {
                    durationUnit = DurationUnits.Minute.toString();
                }
                else if (getValue('hour', this.parent.durationUnitEditText).indexOf(unit) !== -1) {
                    durationUnit = DurationUnits.Hour.toString();
                }
                else if (getValue('day', this.parent.durationUnitEditText).indexOf(unit) !== -1) {
                    durationUnit = DurationUnits.Day.toString();
                }
            }
        }
        else {
            duration = value;
            durationUnit = null;
        }
        var output = {
            duration: duration,
            durationUnit: durationUnit
        };
        return output;
    };
    /**
     *
     * @param date
     */
    DateProcessor.prototype.getNextWorkingDay = function (date) {
        var dayIndex = date.getDay();
        if (this.parent.nonWorkingDayIndex.indexOf(dayIndex) !== -1) {
            date.setDate(date.getDate() + 1);
            date = this.getNextWorkingDay(date);
            return date;
        }
        else {
            return date;
        }
    };
    /**
     * get weekend days between two dates without including args dates
     * @param startDate
     * @param endDate
     */
    DateProcessor.prototype.getWeekendCount = function (startDate, endDate) {
        var weekendCount = 0;
        var sDate = new Date(startDate.getTime());
        var eDate = new Date(endDate.getTime());
        sDate.setHours(0, 0, 0, 0);
        sDate.setDate(sDate.getDate() + 1);
        eDate.setHours(0, 0, 0, 0);
        while (sDate.getTime() < eDate.getTime()) {
            if (this.parent.nonWorkingDayIndex.indexOf(sDate.getDay()) !== -1) {
                weekendCount += 1;
            }
            sDate.setDate(sDate.getDate() + 1);
        }
        return weekendCount;
    };
    /**
     *
     * @param startDate
     * @param endDate
     * @param isCheckTimeZone
     */
    DateProcessor.prototype.getNumberOfSeconds = function (startDate, endDate, isCheckTimeZone) {
        var sDate = new Date(startDate.getTime());
        var eDate = new Date(endDate.getTime());
        var timeDiff = 0;
        sDate.setDate(sDate.getDate() + 1);
        sDate.setHours(0, 0, 0, 0);
        eDate.setHours(0, 0, 0, 0);
        if (sDate.getTime() < eDate.getTime()) {
            timeDiff = (this.getTimeDifference(sDate, eDate, isCheckTimeZone)) / 1000;
        }
        if (timeDiff % 86400 !== 0) {
            timeDiff = timeDiff - (timeDiff % 86400) + 86400;
        }
        return timeDiff;
    };
    /**
     *
     * @param startDate
     * @param endDate
     */
    DateProcessor.prototype.getHolidaysCount = function (startDate, endDate) {
        var holidaysCount = 0;
        var holidays = this.parent.totalHolidayDates;
        var sDate = new Date(startDate.getTime());
        var eDate = new Date(endDate.getTime());
        sDate.setDate(sDate.getDate() + 1);
        sDate.setHours(0, 0, 0, 0);
        eDate.setHours(0, 0, 0, 0);
        if (sDate.getTime() < eDate.getTime()) {
            for (var i = 0; i < holidays.length; i++) {
                var currentHoliday = this.getDateFromFormat(new Date(holidays[i]));
                if (sDate.getTime() <= currentHoliday.getTime() && eDate.getTime() >= currentHoliday.getTime()) {
                    if (!this.parent.includeWeekend && this.parent.nonWorkingDayIndex.indexOf(currentHoliday.getDay()) === -1) {
                        holidaysCount += 1;
                    }
                    else if (this.parent.includeWeekend) {
                        holidaysCount += 1;
                    }
                }
            }
        }
        return holidaysCount;
    };
    /**
     * @private
     */
    DateProcessor.prototype.getHolidayDates = function () {
        var holidays = this.parent.holidays;
        var holidayDates = [];
        for (var i = 0; i < holidays.length; i++) {
            var from = this.getDateFromFormat(holidays[i].from);
            var to = this.getDateFromFormat(holidays[i].to);
            if (isNullOrUndefined(from) && isNullOrUndefined(to)) {
                continue;
            }
            else if (isNullOrUndefined(from) || isNullOrUndefined(to)) {
                var tempDate = from ? from : to;
                tempDate.setHours(0, 0, 0, 0);
                if (holidayDates.indexOf(tempDate.getTime()) === -1) {
                    holidayDates.push(tempDate.getTime());
                }
            }
            else {
                while (from <= to) {
                    from.setHours(0, 0, 0, 0);
                    if (holidayDates.indexOf(from.getTime()) === -1) {
                        holidayDates.push(from.getTime());
                    }
                    from.setDate(from.getDate() + 1);
                }
            }
        }
        return holidayDates;
    };
    /*Check given date is on holidays*/
    DateProcessor.prototype.isOnHolidayOrWeekEnd = function (date, checkWeekEnd) {
        checkWeekEnd = !isNullOrUndefined(checkWeekEnd) ? checkWeekEnd : this.parent.includeWeekend;
        if (!checkWeekEnd && this.parent.nonWorkingDayIndex.indexOf(date.getDay()) !== -1) {
            return true;
        }
        var holidays = this.parent.totalHolidayDates;
        for (var count = 0; count < holidays.length; count++) {
            var holidayFrom = this.getDateFromFormat(new Date(holidays[count]));
            var holidayTo = new Date(holidayFrom.getTime());
            holidayFrom.setHours(0, 0, 0, 0);
            holidayTo.setHours(23, 59, 59, 59);
            if (date.getTime() >= holidayFrom.getTime() && date.getTime() < holidayTo.getTime()) {
                return true;
            }
        }
        return false;
    };
    /**
     * To calculate non working times in given date
     * @param startDate
     * @param endDate
     */
    DateProcessor.prototype.getNonWorkingSecondsOnDate = function (startDate, endDate) {
        var sHour = this.getSecondsInDecimal(startDate);
        var eHour = this.getSecondsInDecimal(endDate);
        var startRangeIndex = -1;
        var endRangeIndex = -1;
        var totNonWrkSecs = 0;
        var startOnHoliday = this.isOnHolidayOrWeekEnd(startDate, null);
        var endOnHoliday = this.isOnHolidayOrWeekEnd(endDate, null);
        for (var i = 0; i < this.parent.nonWorkingTimeRanges.length; i++) {
            var val = this.parent.nonWorkingTimeRanges[i];
            if (sHour >= val.from && sHour <= val.to) {
                startRangeIndex = i;
            }
            if (eHour >= val.from && eHour <= val.to) {
                endRangeIndex = i;
            }
        }
        if (startDate.getDate() !== endDate.getDate() || startDate.getMonth() !== endDate.getMonth() ||
            startDate.getFullYear() !== endDate.getFullYear()) {
            if (!startOnHoliday) {
                for (var i = startRangeIndex; i < this.parent.nonWorkingTimeRanges.length; i++) {
                    if (!this.parent.nonWorkingTimeRanges[i].isWorking) {
                        if (i === startRangeIndex) {
                            totNonWrkSecs += (this.parent.nonWorkingTimeRanges[i].to - sHour);
                        }
                        else {
                            totNonWrkSecs += (this.parent.nonWorkingTimeRanges[i].interval);
                        }
                    }
                }
            }
            else {
                totNonWrkSecs += (86400 - sHour);
            }
            if (!endOnHoliday) {
                for (var i = 0; i <= endRangeIndex; i++) {
                    if (!this.parent.nonWorkingTimeRanges[i].isWorking) {
                        if (i === endRangeIndex) {
                            totNonWrkSecs += (eHour - this.parent.nonWorkingTimeRanges[i].from);
                        }
                        else {
                            totNonWrkSecs += this.parent.nonWorkingTimeRanges[i].interval;
                        }
                    }
                }
            }
            else {
                totNonWrkSecs += eHour;
            }
        }
        else {
            if (startRangeIndex !== endRangeIndex) {
                if (!endOnHoliday) {
                    for (var i = startRangeIndex; i <= endRangeIndex; i++) {
                        if (!this.parent.nonWorkingTimeRanges[i].isWorking) {
                            if (i === startRangeIndex) {
                                totNonWrkSecs += (this.parent.nonWorkingTimeRanges[i].to - sHour);
                            }
                            else if (i === endRangeIndex) {
                                totNonWrkSecs += (eHour - this.parent.nonWorkingTimeRanges[i].from);
                            }
                            else {
                                totNonWrkSecs += this.parent.nonWorkingTimeRanges[i].interval;
                            }
                        }
                    }
                }
                else {
                    totNonWrkSecs += (eHour - sHour);
                }
            }
            else {
                if (!endOnHoliday) {
                    var range = this.parent.nonWorkingTimeRanges[startRangeIndex];
                    if (!range.isWorking) {
                        totNonWrkSecs = eHour - sHour;
                    }
                }
                else {
                    totNonWrkSecs += (eHour - sHour);
                }
            }
        }
        return totNonWrkSecs;
    };
    /**
     *
     * @param date
     */
    DateProcessor.prototype.getPreviousWorkingDay = function (date) {
        var dayIndex = date.getDay();
        var previousIndex = (dayIndex === 0) ? 6 : dayIndex - 1;
        if (this.parent.nonWorkingDayIndex.indexOf(dayIndex) !== -1 || (this.parent.nonWorkingDayIndex.indexOf(previousIndex) !== -1
            && this.parent.defaultEndTime === 86400 && this.getSecondsInDecimal(date) === 0)) {
            date.setDate(date.getDate() - 1);
            if (this.parent.nonWorkingDayIndex.indexOf(date.getDay()) !== -1) {
                date = this.getPreviousWorkingDay(date);
            }
            return date;
        }
        else {
            return date;
        }
    };
    /**
     * To get non-working day indexes.
     * @return {void}
     * @private
     */
    DateProcessor.prototype.getNonWorkingDayIndex = function () {
        var weekDay = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        var weekDayLength = weekDay.length;
        if (this.parent.workWeek.length === 0) {
            this.parent.workWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
        }
        var workWeek = this.parent.workWeek.slice();
        var length = workWeek.length;
        for (var i = 0; i < length; i++) {
            workWeek[i] = workWeek[i].toLowerCase();
        }
        this.parent.nonWorkingDayIndex = [];
        for (var i = 0; i < weekDayLength; i++) {
            if (workWeek.indexOf(weekDay[i]) === -1) {
                this.parent.nonWorkingDayIndex.push(i);
            }
        }
    };
    /**
     *
     * @param seconds
     * @param date
     * @private
     */
    DateProcessor.prototype.setTime = function (seconds, date) {
        var hour = seconds / 3600;
        var min = (seconds - (hour * 3600)) / 60;
        var sec = seconds - (hour * 3600) - (min * 60);
        date.setHours(hour, min, sec);
    };
    /**
     *
     */
    DateProcessor.prototype.getTimeDifference = function (startDate, endDate, isCheckTimeZone) {
        var sDate = new Date(startDate.getTime());
        var eDate = new Date(endDate.getTime());
        if (isCheckTimeZone) {
            this.updateDateWithTimeZone(sDate, eDate);
        }
        return eDate.getTime() - sDate.getTime();
    };
    /**
     *
     */
    DateProcessor.prototype.updateDateWithTimeZone = function (sDate, eDate) {
        var sTZ = sDate.getTimezoneOffset();
        var eTZ = eDate.getTimezoneOffset();
        var uTZ;
        var uDate;
        if (sTZ !== eTZ) {
            var standardTZ = new Date(new Date().getFullYear(), 0, 1).getTimezoneOffset();
            if (standardTZ !== sTZ) {
                uDate = sDate;
                uTZ = sTZ;
            }
            else if (standardTZ !== eTZ) {
                uDate = eDate;
                uTZ = eTZ;
            }
            if (standardTZ < 0) {
                var tzDiff = standardTZ - uTZ;
                uDate.setTime(uDate.getTime() + (tzDiff * 60 * 1000));
            }
            else if (standardTZ > 0) {
                var tzDiff = uTZ - standardTZ;
                uDate.setTime(uDate.getTime() - (tzDiff * 60 * 1000));
            }
        }
    };
    /**
     *
     * @param date
     */
    DateProcessor.prototype.getSecondsInDecimal = function (date) {
        return (date.getHours() * 60 * 60) + (date.getMinutes() * 60) + date.getSeconds() + (date.getMilliseconds() / 1000);
    };
    /**
     * @param date
     * @private
     */
    DateProcessor.prototype.getDateFromFormat = function (date) {
        if (isNullOrUndefined(date)) {
            return null;
        }
        else if (date instanceof Date) {
            return new Date(date.getTime());
        }
        else {
            var dateObject = this.parent.globalize.parseDate(date, { format: 'MM/dd/yyyy hh:mm a', type: 'dateTime' });
            return isNullOrUndefined(dateObject) ? new Date(date) : dateObject;
        }
    };
    /**
     * @private
     */
    DateProcessor.prototype.compareDates = function (date1, date2) {
        if (!isNullOrUndefined(date1) && !isNullOrUndefined(date2)) {
            return (date1.getTime() > date2.getTime()) ? 1 : (date1.getTime() < date2.getTime()) ? -1 : 0;
        }
        else if (!isNullOrUndefined(date1) && isNullOrUndefined(date2)) {
            return 1;
        }
        else if (isNullOrUndefined(date1) && !isNullOrUndefined(date2)) {
            return -1;
        }
        else {
            return null;
        }
    };
    /**
     *
     * @param duration
     * @param durationUnit
     * @private
     */
    DateProcessor.prototype.getDurationString = function (duration, durationUnit) {
        var value = '';
        if (!isNullOrUndefined(duration)) {
            value += parseFloat(duration.toFixed(2)) + ' ';
            if (!isNullOrUndefined(durationUnit)) {
                var plural = duration !== 1;
                if (durationUnit === DurationUnits.Day) {
                    value += plural ? this.parent.localeObj.getConstant('days') : this.parent.localeObj.getConstant(DurationUnits.Day);
                }
                else if (durationUnit === DurationUnits.Hour) {
                    value += plural ? this.parent.localeObj.getConstant('hours') : this.parent.localeObj.getConstant(DurationUnits.Hour);
                }
                else if (durationUnit === DurationUnits.Minute) {
                    value += plural ? this.parent.localeObj.getConstant('minutes') :
                        this.parent.localeObj.getConstant(DurationUnits.Minute);
                }
            }
        }
        return value;
    };
    /**
     *
     * @param editArgs
     * @private
     */
    DateProcessor.prototype.calculateProjectDates = function (editArgs) {
        var _this = this;
        var projectStartDate = this.getDateFromFormat(this.parent.projectStartDate);
        var projectEndDate = this.getDateFromFormat(this.parent.projectEndDate);
        var minStartDate = null;
        var maxEndDate = null;
        var flatData = this.parent.flatData;
        if (((!projectStartDate || !projectEndDate) && flatData.length > 0) || editArgs) {
            flatData.forEach(function (data, index) {
                var task = data.ganttProperties;
                var tempStartDate = _this.getValidStartDate(task);
                var tempEndDate = _this.getValidEndDate(task);
                var baselineStartDate = task.baselineStartDate ? new Date(task.baselineStartDate.getTime()) : null;
                var baselineEndDate = task.baselineEndDate ? new Date(task.baselineEndDate.getTime()) : null;
                if (minStartDate) {
                    if (tempStartDate && _this.compareDates(minStartDate, tempStartDate) === 1) {
                        minStartDate = tempStartDate;
                    }
                    if (baselineStartDate && _this.parent.renderBaseline && _this.compareDates(minStartDate, baselineStartDate) === 1) {
                        minStartDate = baselineStartDate;
                    }
                    else if (baselineEndDate && _this.parent.renderBaseline && _this.compareDates(minStartDate, baselineEndDate) === 1) {
                        minStartDate = baselineEndDate;
                    }
                }
                else {
                    if (baselineStartDate && _this.parent.renderBaseline && _this.compareDates(tempStartDate, baselineStartDate) === 1) {
                        minStartDate = baselineStartDate;
                    }
                    else if (baselineEndDate && _this.parent.renderBaseline && _this.compareDates(tempStartDate, baselineEndDate) === 1) {
                        minStartDate = baselineEndDate;
                    }
                    else {
                        minStartDate = tempStartDate;
                    }
                }
                if (maxEndDate) {
                    if (tempEndDate && _this.compareDates(maxEndDate, tempEndDate) === -1) {
                        maxEndDate = tempEndDate;
                    }
                    if (baselineEndDate && _this.parent.renderBaseline && _this.compareDates(maxEndDate, baselineEndDate) === -1) {
                        maxEndDate = baselineStartDate;
                    }
                    else if (baselineEndDate && _this.parent.renderBaseline && _this.compareDates(maxEndDate, baselineStartDate) === -1) {
                        maxEndDate = baselineEndDate;
                    }
                }
                else {
                    if (baselineEndDate && _this.parent.renderBaseline && _this.compareDates(tempEndDate, baselineEndDate) === -1) {
                        maxEndDate = baselineStartDate;
                    }
                    else if (baselineEndDate && _this.parent.renderBaseline && _this.compareDates(tempEndDate, baselineStartDate) === -1) {
                        maxEndDate = baselineEndDate;
                    }
                    else {
                        maxEndDate = tempEndDate;
                    }
                }
            });
            if (!minStartDate || !maxEndDate) {
                minStartDate = this.getDateFromFormat(new Date());
                maxEndDate = this.getDateFromFormat(new Date(minStartDate.getTime()));
                maxEndDate.setDate(maxEndDate.getDate() + 20);
            }
            //update schedule dates as per holiday and strip line collection         
            this.updateProjectDatesByEventMarker(minStartDate, maxEndDate);
            this.updateProjectDatesByHolidays(minStartDate, maxEndDate);
        }
        else if ((!projectStartDate || !projectEndDate) && flatData.length === 0) {
            minStartDate = this.getDateFromFormat(new Date());
            maxEndDate = this.getDateFromFormat(new Date(minStartDate.getTime()));
        }
        if (!editArgs) {
            this.parent.cloneProjectStartDate = minStartDate ? minStartDate : new Date(projectStartDate.getTime());
            this.parent.cloneProjectEndDate = maxEndDate ? maxEndDate : new Date(projectEndDate.getTime());
        }
        else {
            setValue('minStartDate', minStartDate, editArgs);
            setValue('maxEndDate', maxEndDate, editArgs);
        }
    };
    /**
     *
     * @param startDate
     * @param endDate
     */
    DateProcessor.prototype.updateProjectDatesByEventMarker = function (startDate, endDate) {
        var eventMarker = this.parent.eventMarkers;
        if (eventMarker && eventMarker.length > 0) {
            for (var index = 0; index < eventMarker.length; index++) {
                var day = this.getDateFromFormat(eventMarker[index].day);
                if (!(day.getTime() > startDate.getTime()) || !(day.getTime() < endDate.getTime())) {
                    if (day.getTime() < startDate.getTime()) {
                        startDate = new Date(day.getTime());
                    }
                    else {
                        endDate = new Date(day.getTime());
                    }
                }
            }
        }
    };
    DateProcessor.prototype.updateProjectDatesByHolidays = function (startDate, endDate) {
        var holidayList = this.parent.totalHolidayDates;
        if (holidayList && holidayList.length > 0) {
            for (var i = 0; i < holidayList.length; i++) {
                var holiday = this.getDateFromFormat(new Date(holidayList[i]));
                if (!(holiday.getTime() > startDate.getTime()) || !(holiday.getTime() < endDate.getTime())) {
                    if (holiday.getTime() < startDate.getTime()) {
                        startDate = new Date(holiday.getTime());
                    }
                    else {
                        endDate = new Date(holiday.getTime());
                    }
                }
            }
        }
    };
    return DateProcessor;
}());

var __extends$1 = (undefined && undefined.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
/**
 * To calculate and update task related values
 */
var TaskProcessor = /** @__PURE__ @class */ (function (_super) {
    __extends$1(TaskProcessor, _super);
    function TaskProcessor(parent) {
        var _this = _super.call(this, parent) || this;
        _this.recordIndex = 0;
        _this.taskIds = [];
        _this.hierarchyData = [];
        _this.addEventListener();
        return _this;
    }
    TaskProcessor.prototype.addEventListener = function () {
        this.parent.on('beforeDataManipulate', this.checkDataBinding.bind(this));
    };
    /**
     * @private
     */
    TaskProcessor.prototype.checkDataBinding = function () {
        if (isNullOrUndefined(this.parent.dataSource)) {
            this.parent.dataSource = [];
            this.parent.renderGantt();
        }
        else if (this.parent.dataSource instanceof DataManager) {
            this.initDataSource();
        }
        else if (this.parent.dataSource.length > 0) {
            this.dataArray = this.parent.dataSource;
            this.cloneDataSource();
            this.parent.renderGantt();
        }
        else {
            this.parent.renderGantt();
        }
    };
    TaskProcessor.prototype.initDataSource = function () {
        var _this = this;
        var queryManager = this.parent.query instanceof Query ? this.parent.query : new Query();
        queryManager.requiresCount();
        var dataManager = this.parent.dataSource;
        dataManager.executeQuery(queryManager).then(function (e) {
            _this.dataArray = e.result;
            _this.cloneDataSource();
            _this.parent.renderGantt();
        }).catch(function (e) {
            // Trigger action failure event
            _this.parent.renderGantt();
            _this.parent.trigger('actionFailure', { error: e });
        });
    };
    TaskProcessor.prototype.constructDataSource = function (dataSource) {
        var mappingData = new DataManager(dataSource).executeLocal(new Query()
            .group(this.parent.taskFields.parentId));
        var rootData = [];
        for (var i = 0; i < mappingData.length; i++) {
            var groupData = mappingData[i];
            if (!isNullOrUndefined(groupData.key)) {
                var index = this.taskIds.indexOf(groupData.key);
                if (index > -1) {
                    if (!isNullOrUndefined(groupData.key)) {
                        dataSource[index][this.parent.taskFields.child] = groupData.items;
                        continue;
                    }
                }
            }
            rootData.push.apply(rootData, groupData.items);
        }
        this.hierarchyData = this.dataReorder(dataSource, rootData);
    };
    TaskProcessor.prototype.cloneDataSource = function () {
        var taskIdMapping = this.parent.taskFields.id;
        var parentIdMapping = this.parent.taskFields.parentId;
        if (!isNullOrUndefined(taskIdMapping) && !isNullOrUndefined(parentIdMapping)) {
            var data = [];
            for (var i = 0; i < this.dataArray.length; i++) {
                var tempData = this.dataArray[i];
                data.push(extend({}, {}, tempData, true));
                if (!isNullOrUndefined(tempData[taskIdMapping])) {
                    this.taskIds.push(tempData[taskIdMapping].toString());
                }
            }
            if (!this.parent.taskFields.child) {
                this.parent.taskFields.child = 'Children';
            }
            this.constructDataSource(data);
            this.prepareDataSource(this.hierarchyData);
        }
        else {
            this.prepareDataSource(this.dataArray);
        }
    };
    /**
     * Function to manipulate data-source
     * @hidden
     */
    TaskProcessor.prototype.prepareDataSource = function (data) {
        this.prepareRecordCollection(data, 0);
        if (this.parent.taskFields.dependency) {
            this.parent.predecessorModule.ensurePredecessorCollection();
        }
    };
    TaskProcessor.prototype.prepareRecordCollection = function (data, level, parentItem) {
        var length = data.length;
        for (var i = 0; i < length; i++) {
            var tempData = data[i];
            var ganttData = this.createRecord(tempData, level, parentItem, true);
            ganttData.index = this.recordIndex++;
            this.parent.ids[ganttData.index] = ganttData.ganttProperties.taskId.toString();
            this.parent.flatData.push(ganttData);
            var childData = tempData[this.parent.taskFields.child];
            if (!isNullOrUndefined(childData) && childData.length > 0) {
                this.prepareRecordCollection(childData, ganttData.level + 1, ganttData);
            }
        }
    };
    /**
     * Method to update custom field values in gantt record
     */
    TaskProcessor.prototype.addCustomFieldValue = function (data, ganttRecord) {
        var columns = this.parent.ganttColumns;
        var length = columns.length;
        if (length) {
            for (var i = 0; i < length; i++) {
                if (ganttRecord[columns[i].field] === undefined) {
                    this.parent.setRecordValue(columns[i].field, data[columns[i].field], ganttRecord);
                }
            }
        }
    };
    /**
     * To populate Gantt record
     * @param data
     * @param level
     * @param parentItem
     * @param isLoad
     * @private
     */
    TaskProcessor.prototype.createRecord = function (data, level, parentItem, isLoad) {
        var taskSettings = this.parent.taskFields;
        var child = data[taskSettings.child];
        var progress = data[taskSettings.progress];
        progress = progress ? parseFloat(progress.toString()) ? parseFloat(progress.toString()) : 0 : 0;
        var predecessors = data[taskSettings.dependency];
        var baselineStartDate = this.getDateFromFormat(data[taskSettings.baselineStartDate]);
        var baselineEndDate = this.getDateFromFormat(data[taskSettings.baselineEndDate]);
        var ganttData = {};
        var ganttProperties = {};
        this.parent.setRecordValue('ganttProperties', ganttProperties, ganttData);
        this.parent.setRecordValue('taskId', data[taskSettings.id], ganttProperties, true);
        this.parent.setRecordValue('taskName', data[taskSettings.name], ganttProperties, true);
        this.addTaskData(ganttData, data, isLoad);
        this.addCustomFieldValue(data, ganttData);
        this.parent.setRecordValue('isAutoSchedule', true, ganttProperties, true);
        this.parent.setRecordValue('resourceInfo', this.setResourceInfo(data), ganttProperties, true);
        this.parent.setRecordValue('isMilestone', false, ganttProperties, true);
        this.updateResourceName(ganttData);
        this.calculateScheduledValues(ganttData, data, isLoad);
        this.parent.setRecordValue('baselineStartDate', this.checkBaselineStartDate(baselineStartDate), ganttProperties, true);
        // set default end time, if hour is 0
        if (baselineEndDate && baselineEndDate.getHours() === 0 && this.parent.defaultEndTime !== 86400) {
            this.setTime(this.parent.defaultEndTime, baselineEndDate);
        }
        this.parent.setRecordValue('baselineEndDate', this.checkBaselineEndDate(baselineEndDate), ganttProperties, true);
        this.parent.setRecordValue('progress', progress, ganttProperties, true);
        this.parent.setRecordValue('totalProgress', progress, ganttProperties, true);
        this.parent.setRecordValue('predecessorsName', predecessors, ganttProperties, true);
        this.parent.setRecordValue('indicators', data[taskSettings.indicators], ganttProperties, true);
        this.parent.setRecordValue('notes', data[taskSettings.notes], ganttProperties, true);
        this.parent.setRecordValue('cssClass', data[taskSettings.cssClass], ganttProperties, true);
        this.parent.setRecordValue('parentItem', this.getCloneParent(parentItem), ganttData);
        var parentUniqId = ganttData.parentItem ? ganttData.parentItem.uniqueID : null;
        this.parent.setRecordValue('parentUniqueID', parentUniqId, ganttData);
        this.parent.setRecordValue('level', level, ganttData);
        this.parent.setRecordValue('uniqueID', getUid(this.parent.element.id + '_data_'), ganttData);
        this.parent.setRecordValue('uniqueID', ganttData.uniqueID, ganttProperties, true);
        this.parent.setRecordValue('childRecords', [], ganttData);
        this.parent.setRecordValue('baselineEndDate', this.checkBaselineEndDate(baselineEndDate), ganttProperties, true);
        if (!isNullOrUndefined(data[taskSettings.child]) && data[taskSettings.child].length > 0) {
            this.parent.setRecordValue('hasChildRecords', true, ganttData);
            this.parent.setRecordValue('isMilestone', false, ganttProperties, true);
        }
        else {
            this.parent.setRecordValue('hasChildRecords', false, ganttData);
        }
        this.parent.setRecordValue('expanded', this.parent.collapseAllParentTasks ? false : true, ganttData);
        this.updateExpandStateMappingValue(ganttData, data);
        if (!isLoad) {
            this.parent.setRecordValue('width', this.calculateWidth(ganttProperties), ganttProperties, true);
            this.parent.setRecordValue('left', this.calculateLeft(ganttProperties), ganttProperties, true);
            this.parent.setRecordValue('progressWidth', this.getProgressWidth(ganttProperties.width, progress), ganttProperties, true);
            if (ganttProperties.baselineEndDate && ganttProperties.baselineStartDate) {
                this.parent.setRecordValue('baselineLeft', this.calculateBaselineLeft(ganttProperties), ganttProperties, true);
                this.parent.setRecordValue('baselineWidth', this.calculateBaselineWidth(ganttProperties), ganttProperties, true);
            }
        }
        this.updateTaskData(ganttData);
        if (!isNullOrUndefined(parentItem)) {
            parentItem.childRecords.push(ganttData);
        }
        if (predecessors) {
            this.parent.predecessorsCollection.push(ganttData);
        }
        return ganttData;
    };
    /**
     *
     * @param record
     * @param parent
     * @private
     */
    TaskProcessor.prototype.getCloneParent = function (parent) {
        if (!isNullOrUndefined(parent)) {
            var cloneParent = {};
            cloneParent.uniqueID = parent.uniqueID;
            cloneParent.expanded = parent.expanded;
            cloneParent.level = parent.level;
            cloneParent.index = parent.index;
            cloneParent.taskId = parent.ganttProperties.taskId;
            return cloneParent;
        }
        else {
            return null;
        }
    };
    TaskProcessor.prototype.addTaskData = function (ganttData, data, isLoad) {
        var taskSettings = this.parent.taskFields;
        var dataManager = this.parent.dataSource;
        if (isLoad) {
            if (taskSettings.parentId || (dataManager instanceof DataManager &&
                dataManager.dataSource.json && dataManager.dataSource.offline)) {
                if (taskSettings.parentId) {
                    var id = data[taskSettings.id];
                    var index = this.taskIds.indexOf(id);
                    var tempData = (index > -1) ? this.dataArray[index] : {};
                    this.parent.setRecordValue('taskData', tempData, ganttData);
                }
                else {
                    this.parent.setRecordValue('taskData', data, ganttData);
                }
            }
            else {
                this.parent.setRecordValue('taskData', data, ganttData);
            }
        }
        else {
            this.parent.setRecordValue('taskData', data, ganttData);
        }
    };
    TaskProcessor.prototype.updateExpandStateMappingValue = function (ganttData, data) {
        var expandStateMapping = this.parent.taskFields.expandState;
        var mappingValue = data[expandStateMapping];
        var updatableValue;
        if (expandStateMapping && ganttData.hasChildRecords) {
            if (!isNullOrUndefined(mappingValue)) {
                updatableValue = mappingValue.toString() === 'true' ? true : false;
            }
            else if (isNullOrUndefined(mappingValue) && !this.parent.collapseAllParentTasks) {
                updatableValue = true;
            }
            else if (isNullOrUndefined(mappingValue) && this.parent.collapseAllParentTasks) {
                updatableValue = false;
            }
            this.parent.setRecordValue('taskData.' + expandStateMapping, updatableValue, ganttData);
            this.parent.setRecordValue('expandStateMapping', updatableValue, ganttData);
            this.parent.setRecordValue('expanded', updatableValue, ganttData);
        }
    };
    /**
     *
     * @param ganttData
     * @param data
     * @param isLoad
     * @private
     */
    TaskProcessor.prototype.calculateScheduledValues = function (ganttData, data, isLoad) {
        var taskSettings = this.parent.taskFields;
        var ganttProperties = ganttData.ganttProperties;
        var duration = data[taskSettings.duration];
        duration = isNullOrUndefined(duration) || duration === '' ? null : duration;
        var startDate = this.getDateFromFormat(data[taskSettings.startDate]);
        var endDate = this.getDateFromFormat(data[taskSettings.endDate]);
        var isMileStone = taskSettings.milestone ? data[taskSettings.milestone] ? true : false : false;
        var durationMapping = data[taskSettings.durationUnit] ? data[taskSettings.durationUnit] : '';
        this.parent.setRecordValue('durationUnit', this.validateDurationUnitMapping(durationMapping), ganttProperties, true);
        if (!endDate && !startDate && (isNullOrUndefined(duration) || duration === '')) {
            if (this.parent.allowUnscheduledTasks) {
                return;
            }
            else {
                this.parent.setRecordValue('duration', 1, ganttProperties, true);
                this.parent.setRecordValue('startDate', this.getProjectStartDate(ganttProperties, isLoad), ganttProperties, true);
                this.calculateEndDate(ganttData);
            }
        }
        else if (startDate) {
            this.calculateDateFromStartDate(startDate, endDate, duration, ganttData);
        }
        else if (endDate) {
            this.calculateDateFromEndDate(endDate, duration, ganttData);
        }
        else if (!isNullOrUndefined(duration) && duration !== '') {
            this.updateDurationValue(duration, ganttProperties);
            if (this.parent.allowUnscheduledTasks) {
                this.parent.setRecordValue('startDate', null, ganttProperties, true);
                this.parent.setRecordValue('endDate', null, ganttProperties, true);
            }
            else {
                this.parent.setRecordValue('startDate', this.getProjectStartDate(ganttProperties, isLoad), ganttProperties, true);
                this.calculateEndDate(ganttData);
            }
        }
        if (ganttProperties.duration === 0) {
            this.parent.setRecordValue('isMilestone', true, ganttProperties, true);
            this.parent.setRecordValue('endDate', ganttProperties.startDate, ganttProperties, true);
        }
        if (!isNullOrUndefined(isMileStone) && isMileStone) {
            this.parent.setRecordValue('duration', 0, ganttProperties, true);
            this.parent.setRecordValue('isMilestone', true, ganttProperties, true);
            this.parent.setRecordValue('endDate', ganttProperties.startDate, ganttProperties, true);
        }
    };
    TaskProcessor.prototype.calculateDateFromEndDate = function (endDate, duration, ganttData) {
        var ganttProperties = ganttData.ganttProperties;
        if (endDate.getHours() === 0 && this.parent.defaultEndTime !== 86400) {
            this.setTime(this.parent.defaultEndTime, endDate);
        }
        this.parent.setRecordValue('endDate', this.checkEndDate(endDate, ganttData.ganttProperties), ganttProperties, true);
        if (isNullOrUndefined(duration) || duration === '') {
            if (this.parent.allowUnscheduledTasks) {
                this.parent.setRecordValue('startDate', null, ganttProperties, true);
                this.parent.setRecordValue('duration', null, ganttProperties, true);
            }
            else {
                this.parent.setRecordValue('duration', 1, ganttProperties, true);
                this.parent.setRecordValue('startDate', this.getStartDate(ganttProperties.endDate, ganttProperties.duration, ganttProperties.durationUnit, ganttProperties), ganttProperties, true);
            }
        }
        else if (!isNullOrUndefined(duration) && duration !== '') {
            this.updateDurationValue(duration, ganttProperties);
            this.parent.setRecordValue('startDate', this.getStartDate(ganttProperties.endDate, ganttProperties.duration, ganttProperties.durationUnit, ganttProperties), ganttProperties, true);
        }
    };
    TaskProcessor.prototype.calculateDateFromStartDate = function (startDate, endDate, duration, ganttData) {
        var ganttProperties = ganttData.ganttProperties;
        this.parent.setRecordValue('startDate', this.checkStartDate(startDate, ganttProperties), ganttProperties, true);
        if (!endDate && (isNullOrUndefined(duration) || duration === '')) {
            if (this.parent.allowUnscheduledTasks) {
                this.parent.setRecordValue('endDate', null, ganttProperties, true);
                this.parent.setRecordValue('duration', null, ganttProperties, true);
            }
            else {
                this.parent.setRecordValue('duration', 1, ganttProperties, true);
                this.calculateEndDate(ganttData);
            }
        }
        else if (!isNullOrUndefined(duration) && !endDate) {
            this.updateDurationValue(duration, ganttProperties);
            this.calculateEndDate(ganttData);
        }
        else if (endDate && (isNullOrUndefined(duration) || duration === '')) {
            if (endDate.getHours() === 0 && this.parent.defaultEndTime !== 86400) {
                this.setTime(this.parent.defaultEndTime, endDate);
            }
            this.parent.setRecordValue('endDate', this.checkEndDate(endDate, ganttData.ganttProperties), ganttProperties, true);
            if (this.compareDates(ganttProperties.startDate, ganttProperties.endDate) === 1) {
                this.parent.setRecordValue('endDate', ganttProperties.startDate, ganttProperties, true);
                this.parent.setRecordValue('isMilestone', true, ganttProperties, true);
                this.parent.setRecordValue('duration', 0, ganttProperties, true);
            }
            else {
                this.calculateDuration(ganttData);
            }
        }
        else {
            this.updateDurationValue(duration, ganttProperties);
            this.calculateEndDate(ganttData);
        }
    };
    /**
     *
     * @param parentWidth
     * @param percent
     * @private
     */
    TaskProcessor.prototype.getProgressWidth = function (parentWidth, percent) {
        return (parentWidth * percent) / 100;
    };
    /**
     *
     * @param ganttProp
     * @private
     */
    TaskProcessor.prototype.calculateWidth = function (ganttProp) {
        var sDate = ganttProp.startDate;
        var eDate = ganttProp.endDate;
        var unscheduledTaskWidth = 3;
        if (isNullOrUndefined(sDate) && isNullOrUndefined(eDate)) {
            sDate = this.getValidStartDate(ganttProp);
            eDate = this.getValidEndDate(ganttProp);
        }
        if (isNullOrUndefined(sDate) || isNullOrUndefined(eDate)) {
            return unscheduledTaskWidth;
        }
        else if (ganttProp.isMilestone) {
            //let taskBarHeight: number = this.getTaskbarHeight();
            return 0;
        }
        else {
            return this.getTaskWidth(sDate, eDate);
        }
    };
    TaskProcessor.prototype.getTaskbarHeight = function () {
        var rowHeight = this.parent.rowHeight;
        var taskBarHeight = this.parent.taskbarHeight;
        if (taskBarHeight < rowHeight) {
            return taskBarHeight;
        }
        else {
            return rowHeight;
        }
    };
    /**
     * Method to calculate left
     * @param ganttProp
     * @private
     */
    TaskProcessor.prototype.calculateLeft = function (ganttProp) {
        var sDate = null;
        var left = -300;
        var milestone = ganttProp.isMilestone;
        if (ganttProp.startDate) {
            sDate = new Date(ganttProp.startDate.getTime());
        }
        else if (ganttProp.endDate) {
            sDate = new Date(ganttProp.endDate.getTime());
            milestone = true;
        }
        else {
            sDate = this.getValidStartDate(ganttProp);
        }
        if (!isNullOrUndefined(sDate)) {
            left = this.getTaskLeft(sDate, milestone);
        }
        return left;
    };
    /**
     * calculate the left margin of the baseline element
     * @param ganttData
     * @private
     */
    TaskProcessor.prototype.calculateBaselineLeft = function (ganttProperties) {
        var baselineStartDate = this.getDateFromFormat(ganttProperties.baselineStartDate);
        var baselineEndDate = this.getDateFromFormat(ganttProperties.baselineEndDate);
        if (baselineStartDate && baselineEndDate) {
            return (this.getTaskLeft(baselineStartDate, ganttProperties.isMilestone));
        }
        else {
            return 0;
        }
    };
    /**
     * calculate the width between baseline start date and baseline end date.
     * @private
     */
    TaskProcessor.prototype.calculateBaselineWidth = function (ganttProperties) {
        var baselineStartDate = this.getDateFromFormat(ganttProperties.baselineStartDate);
        var baselineEndDate = this.getDateFromFormat(ganttProperties.baselineEndDate);
        if (baselineStartDate && baselineEndDate) {
            return (this.getTaskWidth(baselineStartDate, baselineEndDate));
        }
        else {
            return 0;
        }
    };
    /**
     * To get tasks width value
     * @param startDate
     * @param endDate
     * @private
     */
    TaskProcessor.prototype.getTaskWidth = function (startDate, endDate) {
        var sDate = new Date(startDate.getTime());
        var eDate = new Date(endDate.getTime());
        var tierMode = this.parent.timelineModule.bottomTier !== 'None' ? this.parent.timelineModule.bottomTier :
            this.parent.timelineModule.topTier;
        if (tierMode === 'Day') {
            if (this.getSecondsInDecimal(sDate) === this.parent.defaultStartTime) {
                sDate.setHours(0, 0, 0, 0);
            }
            if (this.getSecondsInDecimal(eDate) === this.parent.defaultEndTime) {
                eDate.setHours(24);
            }
        }
        return ((this.getTimeDifference(sDate, eDate) / (1000 * 60 * 60 * 24)) * this.parent.perDayWidth);
    };
    /**
     * Get task left value
     * @param startDate
     * @param isMilestone
     * @private
     */
    TaskProcessor.prototype.getTaskLeft = function (startDate, isMilestone) {
        var date = new Date(startDate.getTime());
        var tierMode = this.parent.timelineModule.bottomTier !== 'None' ? this.parent.timelineModule.bottomTier :
            this.parent.timelineModule.topTier;
        if (tierMode === 'Day') {
            if (this.getSecondsInDecimal(date) === this.parent.defaultStartTime) {
                date.setHours(0, 0, 0, 0);
            }
            else if (isMilestone && this.getSecondsInDecimal(date) === this.parent.defaultEndTime) {
                date.setHours(24);
            }
        }
        var timelineStartDate = this.parent.timelineModule.timelineStartDate;
        if (timelineStartDate) {
            return (date.getTime() - timelineStartDate.getTime()) / (1000 * 60 * 60 * 24) * this.parent.perDayWidth;
        }
        else {
            return 0;
        }
    };
    /**
     *
     * @param ganttData
     * @param fieldName
     * @private
     */
    TaskProcessor.prototype.updateMappingData = function (ganttData, fieldName) {
        var columnMapping = this.parent.columnMapping;
        var ganttProp = ganttData.ganttProperties;
        if (isNullOrUndefined(columnMapping[fieldName])) {
            return;
        }
        if (fieldName === 'predecessorName') {
            //
        }
        else if (fieldName === 'resourceInfo') {
            var resourceData = ganttProp.resourceInfo;
            var resourcesId = [];
            var resourcesName = [];
            for (var i = 0; i < resourceData.length; i++) {
                resourcesId.push(resourceData[i][this.parent.resourceIDMapping].toString());
                resourcesName.push(resourceData[i][this.parent.resourceNameMapping].toString());
            }
            this.parent.setRecordValue('resourceNames', resourcesName.join(','), ganttProp, true);
            this.parent.setRecordValue('taskData.' + columnMapping[fieldName], resourcesId, ganttData);
            this.parent.setRecordValue(columnMapping[fieldName], resourcesName.join(','), ganttData);
        }
        else if (fieldName === 'startDate' || fieldName === 'endDate') {
            this.setRecordDate(ganttData, ganttProp[fieldName], columnMapping[fieldName]);
        }
        else if (fieldName === 'duration') {
            this.setRecordDuration(ganttData, columnMapping[fieldName]);
        }
        else {
            this.parent.setRecordValue('taskData.' + columnMapping[fieldName], ganttProp[fieldName], ganttData);
            this.parent.setRecordValue(columnMapping[fieldName], ganttProp[fieldName], ganttData);
        }
    };
    TaskProcessor.prototype.setRecordDate = function (task, value, mapping) {
        if (!isNullOrUndefined(value)) {
            value = new Date(value.getTime());
        }
        this.parent.setRecordValue(mapping, value, task);
        if (!isNullOrUndefined(value)) {
            value = new Date(value.getTime());
        }
        this.parent.setRecordValue('taskData.' + mapping, value, task);
    };
    TaskProcessor.prototype.getDurationInDay = function (duration, durationUnit) {
        if (durationUnit === 'day') {
            return duration;
        }
        else if (durationUnit === 'hour') {
            return duration / (this.parent.secondsPerDay / 3600);
        }
        else {
            return duration / (this.parent.secondsPerDay / 60);
        }
    };
    TaskProcessor.prototype.setRecordDuration = function (task, mapping) {
        var duration = task.ganttProperties.duration;
        var durationUnit = task.ganttProperties.durationUnit;
        if (!isNullOrUndefined(duration)) {
            this.parent.setRecordValue(mapping, this.getDurationInDay(duration, durationUnit), task);
            this.parent.setRecordValue('taskData.' + mapping, this.getDurationString(duration, durationUnit), task);
        }
        else {
            this.parent.setRecordValue(mapping, duration, task);
            this.parent.setRecordValue('taskData.' + mapping, duration, task);
        }
    };
    /**
     *
     * @param ganttData
     * @private
     */
    TaskProcessor.prototype.updateTaskData = function (ganttData) {
        var dataMapping = this.parent.taskFields;
        var ganttProperties = ganttData.ganttProperties;
        if (!isNullOrUndefined(ganttData.taskData)) {
            var data = ganttData.taskData;
            if (dataMapping.id) {
                this.parent.setRecordValue('taskData.' + dataMapping.id, ganttProperties.taskId, ganttData);
                this.parent.setRecordValue(dataMapping.id, ganttProperties.taskId, ganttData);
            }
            if (dataMapping.name) {
                this.parent.setRecordValue('taskData.' + dataMapping.name, ganttProperties.taskName, ganttData);
                this.parent.setRecordValue(dataMapping.name, ganttProperties.taskName, ganttData);
            }
            if (dataMapping.startDate) {
                this.setRecordDate(ganttData, ganttProperties.startDate, dataMapping.startDate);
            }
            if (dataMapping.endDate) {
                this.setRecordDate(ganttData, ganttProperties.endDate, dataMapping.endDate);
            }
            if (dataMapping.duration) {
                this.setRecordDuration(ganttData, dataMapping.duration);
            }
            if (dataMapping.durationUnit) {
                data[dataMapping.durationUnit] = ganttProperties.durationUnit;
            }
            if (dataMapping.progress) {
                this.parent.setRecordValue('taskData.' + dataMapping.progress, ganttProperties.progress, ganttData);
                this.parent.setRecordValue(dataMapping.progress, ganttProperties.progress, ganttData);
            }
            if (dataMapping.baselineStartDate) {
                this.setRecordDate(ganttData, ganttProperties.baselineStartDate, dataMapping.baselineStartDate);
            }
            if (dataMapping.baselineEndDate) {
                this.setRecordDate(ganttData, ganttProperties.baselineEndDate, dataMapping.baselineEndDate);
            }
            if (dataMapping.notes) {
                this.parent.setRecordValue('taskData.' + dataMapping.notes, ganttProperties.notes, ganttData);
                this.parent.setRecordValue(dataMapping.notes, ganttProperties.notes, ganttData);
            }
            if (dataMapping.cssClass) {
                this.parent.setRecordValue('taskData.' + dataMapping.cssClass, ganttProperties.cssClass, ganttData);
                this.parent.setRecordValue(dataMapping.cssClass, ganttProperties.cssClass, ganttData);
            }
            if (dataMapping.indicators) {
                this.parent.setRecordValue('taskData.' + dataMapping.indicators, ganttProperties.indicators, ganttData);
                this.parent.setRecordValue(dataMapping.indicators, ganttProperties.indicators, ganttData);
            }
        }
    };
    /**
     * To set resource value in Gantt record
     * @private
     */
    TaskProcessor.prototype.setResourceInfo = function (data) {
        var resourceIdCollection;
        if (isNullOrUndefined(data[this.parent.taskFields.resourceInfo])) {
            return resourceIdCollection;
        }
        resourceIdCollection = data[this.parent.taskFields.resourceInfo];
        var resourceData = this.parent.resources;
        var resourceIDMapping = this.parent.resourceIDMapping;
        var resources = [];
        var _loop_1 = function (count) {
            var resource = resourceData.filter(function (resourceInfo) {
                return (resourceIdCollection[count] === resourceInfo[resourceIDMapping]);
            });
            var ganttDataResource = extend({}, resource[0]);
            resources.push(ganttDataResource);
        };
        for (var count = 0; count < resourceIdCollection.length; count++) {
            _loop_1(count);
        }
        return resources;
    };
    TaskProcessor.prototype.updateResourceName = function (data) {
        var resourceInfo = data.ganttProperties.resourceInfo;
        var resourceName = [];
        if (resourceInfo) {
            this.parent.setRecordValue('taskData.' + this.parent.taskFields.resourceInfo, [], data);
            for (var i = 0; i < resourceInfo.length; i++) {
                var resource = resourceInfo[i];
                resourceName.push(resource[this.parent.resourceNameMapping]);
                if (data.taskData) {
                    var mapping = this.parent.taskFields.resourceInfo;
                    data.taskData[mapping].push(resource[this.parent.resourceIDMapping]);
                }
            }
            this.parent.setRecordValue('resourceNames', resourceName.join(','), data.ganttProperties, true);
            this.parent.setRecordValue(this.parent.taskFields.resourceInfo, resourceName.join(','), data, true);
        }
    };
    TaskProcessor.prototype.dataReorder = function (flatCollection, rootCollection) {
        var result = [];
        while (flatCollection.length > 0 && rootCollection.length > 0) {
            var index = rootCollection.indexOf(flatCollection[0]);
            if (index === -1) {
                flatCollection.shift();
            }
            else {
                result.push(flatCollection.shift());
                rootCollection.splice(index, 1);
            }
        }
        return result;
    };
    TaskProcessor.prototype.validateDurationUnitMapping = function (durationUnit) {
        var unit = durationUnit;
        if (unit === 'minute') {
            unit = DurationUnits.Minute;
        }
        else if (unit === 'hour') {
            unit = DurationUnits.Hour;
        }
        else if (unit === 'day') {
            unit = DurationUnits.Day;
        }
        else {
            unit = this.parent.durationUnit.toLocaleLowerCase();
        }
        return unit;
    };
    /**
     * To update duration value in Task
     * @param duration
     * @param ganttProperties
     * @private
     */
    TaskProcessor.prototype.updateDurationValue = function (duration, ganttProperties) {
        var tempDuration = this.getDurationValue(duration);
        this.parent.setRecordValue('duration', getValue('duration', tempDuration), ganttProperties, true);
        if (!isNullOrUndefined(getValue('durationUnit', tempDuration))) {
            this.parent.setRecordValue('durationUnit', getValue('durationUnit', tempDuration), ganttProperties, true);
        }
    };
    /**
     * Update all gantt data collection width, progress width and left value
     * @private
     */
    TaskProcessor.prototype.updateGanttData = function () {
        var flatData = this.parent.flatData;
        var length = flatData.length;
        for (var i = 0; i < length; i++) {
            var data = flatData[i];
            var task = data.ganttProperties;
            if (!data.hasChildRecords) {
                this.updateWidthLeft(data);
            }
            this.parent.setRecordValue('baselineLeft', this.calculateBaselineLeft(task), task, true);
            this.parent.setRecordValue('baselineWidth', this.calculateBaselineWidth(task), task, true);
            var childData = [];
            var parentItem = void 0;
            if (data.parentItem) {
                parentItem = this.parent.getParentTask(data.parentItem);
                childData = parentItem.childRecords;
            }
            if (parentItem && childData.indexOf(data) === childData.length - 1 && !data.hasChildRecords) {
                if (parentItem.ganttProperties.isAutoSchedule) {
                    this.updateParentItems(parentItem);
                }
            }
        }
    };
    /**
     * @private
     */
    TaskProcessor.prototype.reUpdateGanttDataPosition = function () {
        var flatData = this.parent.flatData;
        var length = flatData.length;
        for (var i = 0; i < length; i++) {
            var data = flatData[i];
            var task = data.ganttProperties;
            this.updateWidthLeft(data);
            this.parent.setRecordValue('baselineLeft', this.calculateBaselineLeft(task), task, true);
            this.parent.setRecordValue('baselineWidth', this.calculateBaselineWidth(task), task, true);
            this.parent.dataOperation.updateTaskData(data);
        }
    };
    /**
     * method to update left, width, progress width in record
     * @param data
     * @private
     */
    TaskProcessor.prototype.updateWidthLeft = function (data) {
        var ganttRecord = data.ganttProperties;
        this.parent.setRecordValue('width', this.parent.dataOperation.calculateWidth(ganttRecord), ganttRecord, true);
        this.parent.setRecordValue('left', this.parent.dataOperation.calculateLeft(ganttRecord), ganttRecord, true);
        this.parent.setRecordValue('progressWidth', this.parent.dataOperation.getProgressWidth(ganttRecord.width, ganttRecord.progress), ganttRecord, true);
    };
    /**
     * To calculate parent progress value
     * @private
     */
    TaskProcessor.prototype.getParentProgress = function (childGanttRecord) {
        var durationInDay = 0;
        var progressValues = {};
        switch (childGanttRecord.ganttProperties.durationUnit) {
            case 'hour':
                durationInDay = (childGanttRecord.ganttProperties.duration / (this.parent.secondsPerDay / 3600));
                break;
            case 'minute':
                durationInDay = (childGanttRecord.ganttProperties.duration / (this.parent.secondsPerDay / 60));
                break;
            default:
                durationInDay = childGanttRecord.ganttProperties.duration;
        }
        if (childGanttRecord.hasChildRecords) {
            setValue('totalProgress', childGanttRecord.ganttProperties.totalProgress, progressValues);
            setValue('totalDuration', childGanttRecord.ganttProperties.totalDuration, progressValues);
        }
        else {
            setValue('totalProgress', childGanttRecord.ganttProperties.progress * durationInDay, progressValues);
            setValue('totalDuration', durationInDay, progressValues);
        }
        return progressValues;
    };
    /**
     * @private
     */
    TaskProcessor.prototype.updateParentItems = function (cloneParent) {
        var parentData = this.parent.getParentTask(cloneParent);
        var previousStartDate = parentData.ganttProperties.startDate;
        var previousEndDate = parentData.ganttProperties.endDate;
        var childRecords = parentData.childRecords;
        var childLength = childRecords.length;
        var totalDuration = 0;
        var progressValues = {};
        var minStartDate = null;
        var maxEndDate = null;
        var milestoneCount = 0;
        var totalProgress = 0;
        for (var count = 0; count < childLength; count++) {
            var childData = childRecords[count];
            if (this.parent.isOnDelete && childData.isDelete) {
                continue;
            }
            var startDate = this.getValidStartDate(childData.ganttProperties);
            var endDate = this.getValidEndDate(childData.ganttProperties);
            if (isNullOrUndefined(minStartDate)) {
                minStartDate = this.getDateFromFormat(startDate);
            }
            if (isNullOrUndefined(maxEndDate)) {
                maxEndDate = this.getDateFromFormat(endDate);
            }
            if (!isNullOrUndefined(endDate) && this.compareDates(endDate, maxEndDate) === 1) {
                maxEndDate = this.getDateFromFormat(endDate);
            }
            if (!isNullOrUndefined(startDate) && this.compareDates(startDate, minStartDate) === -1) {
                minStartDate = this.getDateFromFormat(startDate);
            }
            if (!childData.ganttProperties.isMilestone && isScheduledTask(childData.ganttProperties)) {
                progressValues = this.getParentProgress(childData);
                totalProgress += getValue('totalProgress', progressValues);
                totalDuration += getValue('totalDuration', progressValues);
            }
            else {
                milestoneCount++;
            }
        }
        if (this.compareDates(previousStartDate, minStartDate) !== 0) {
            this.parent.setRecordValue('startDate', minStartDate, parentData.ganttProperties, true);
        }
        if (this.compareDates(previousEndDate, maxEndDate) !== 0) {
            this.parent.setRecordValue('endDate', maxEndDate, parentData.ganttProperties, true);
        }
        var taskCount;
        if (this.parent.isOnDelete) {
            taskCount = childLength - milestoneCount - 1;
        }
        else {
            taskCount = childLength - milestoneCount;
        }
        var parentProgress = taskCount > 0 ? (totalProgress / totalDuration) : 0;
        this.calculateDuration(parentData);
        var parentProp = parentData.ganttProperties;
        this.parent.setRecordValue('progress', Math.floor(parentProgress), parentProp, true);
        this.parent.setRecordValue('totalProgress', totalProgress, parentProp, true);
        this.parent.setRecordValue('totalDuration', totalDuration, parentProp, true);
        this.updateWidthLeft(parentData);
        this.updateTaskData(parentData);
        var parentItem = this.parent.getParentTask(parentData.parentItem);
        if (parentItem && parentItem.ganttProperties.isAutoSchedule) {
            this.updateParentItems(parentItem);
        }
    };
    return TaskProcessor;
}(DateProcessor));

/**
 * CSS Constants
 */
/** @hidden */
var root = 'e-gantt';
var ganttChartPane = 'e-gantt-chart-pane';
var treeGridPane = 'e-gantt-tree-grid-pane';
var splitter = 'e-gantt-splitter';
var ganttChart = 'e-gantt-chart';
var chartBodyContainer = 'e-chart-root-container';
var toolbar = 'e-gantt-toolbar';
var chartScrollElement = 'e-chart-scroll-container';
var chartBodyContent = 'e-chart-rows-container';
var scrollContent = 'e-content';
// Timeline-Class
var taskTable = 'e-task-table';
var zeroSpacing = 'e-zero-spacing';
var timelineHeaderContainer = 'e-timeline-header-container';
var timelineHeaderTableContainer = 'e-timeline-header-table-container';
var timelineHeaderTableBody = 'e-timeline-header-table-body';
var timelineTopHeaderCell = 'e-timeline-top-header-cell';
var timelineHeaderCellLabel = 'e-header-cell-label';
var weekendHeaderCell = 'e-weekend-header-cell';
var timelineSingleHeaderCell = 'e-timeline-single-header-cell';
var timelineSingleHeaderOuterDiv = 'e-timeline-single-header-outer-div';
// Chart Rows-Class
var leftLabelContainer = 'e-left-label-container';
var leftLabelInnerDiv = 'e-left-label-inner-div';
var rightLabelContainer = 'e-right-label-container';
var rightLabelInnerDiv = 'e-right-label-inner-div';
var taskBarMainContainer = 'e-taskbar-main-container';
var parentTaskBarInnerDiv = 'e-gantt-parent-taskbar-inner-div';
var parentProgressBarInnerDiv = 'e-gantt-parent-progressbar-inner-div';
var taskLabel = 'e-task-label';
var childTaskBarInnerDiv = 'e-gantt-child-taskbar-inner-div';
var childProgressBarInnerDiv = 'e-gantt-child-progressbar-inner-div';
var milestoneTop = 'e-milestone-top';
var milestoneBottom = 'e-milestone-bottom';
var baselineBar = 'e-baseline-bar';
var baselineMilestoneContainer = 'e-baseline-gantt-milestone-container';
var baselineMilestoneDiv = 'e-baseline-gantt-milestone';
var baselineMilestoneTop = 'e-baseline-milestone-top';
var baselineMilestoneBottom = 'e-baseline-milestone-bottom';
var chartRowCell = 'e-chart-row-cell';
var chartRow = 'e-chart-row';
var rowExpand = 'e-row-expand';
var rowCollapse = 'e-row-collapse';
var taskBarLeftResizer = 'e-taskbar-left-resizer';
var taskBarRightResizer = 'e-taskbar-right-resizer';
var childProgressResizer = 'e-child-progress-resizer';
var progressBarHandler = 'e-progressbar-handler';
var progressHandlerElement = 'e-progressbar-handler-element';
var progressBarHandlerAfter = 'e-progressbar-handler-after';
var icon = 'e-icon';
var traceMilestone = 'e-gantt-milestone';
var traceChildTaskBar = 'e-gantt-child-taskbar';
var traceChildProgressBar = 'e-gantt-child-progressbar';
var traceParentTaskBar = 'e-gantt-parent-taskbar';
var traceParentProgressBar = 'e-gantt-parent-progressbar';
var traceUnscheduledTask = 'e-gantt-unscheduled-task';
var taskIndicatorDiv = 'e-indicator-span';
var leftResizeGripper = 'e-left-resize-gripper';
var rightResizeGripper = 'e-right-resize-gripper';
var progressResizeGripper = 'e-progress-resize-gripper';
var label = 'e-label';
//event Markers classes
var eventMarkersContainer = 'e-event-markers-container';
var eventMarkersChild = 'e-event-markers';
var eventMarkersSpan = 'e-span-label';
//holiday classes
var nonworkingContainer = 'e-nonworking-day-container';
var holidayContainer = 'e-holiday-container';
var holidayElement = 'e-holiday';
var holidayLabel = 'e-span';
//weekend classes
var weekendContainer = 'e-weekend-container';
var weekend = 'e-weekend';
//Unscheduled Taskbar
var unscheduledTaskbarLeft = 'e-gantt-unscheduled-taskbar-left';
var unscheduledTaskbarRight = 'e-gantt-unscheduled-taskbar-right';
var unscheduledTaskbar = 'e-gantt-unscheduled-taskbar';
var unscheduledMilestoneTop = 'e-unscheduled-milestone-top';
var unscheduledMilestoneBottom = 'e-unscheduled-milestone-bottom';
//Connector Line
var dependencyViewContainer = 'e-gantt-dependency-view-container';
var connectorLineContainer = 'e-connector-line-container';
var connectorLine = 'e-line';
var connectorLineRightArrow = 'e-connector-line-right-arrow';
var connectorLineLeftArrow = 'e-connector-line-left-arrow';
var connectorLineZIndex = 'e-connector-line-z-index';
var connectorLineHover = 'e-connector-line-hover';
var connectorLineHoverZIndex = 'e-connector-line-hover-z-index';
var connectorLineRightArrowHover = 'e-connector-line-right-arrow-hover';
var connectorLineLeftArrowHover = 'e-connector-line-left-arrow-hover';

var connectorPointLeft = 'e-connectorpoint-left';
var connectorPointRight = 'e-connectorpoint-right';
var connectorPointLeftHover = 'e-connectorpoint-left-hover';
var connectorPointRightHover = 'e-connectorpoint-right-hover';
var falseLine = 'e-gantt-false-line';



var rightConnectorPointOuterDiv = 'e-right-connectorpoint-outer-div';
var leftConnectorPointOuterDiv = 'e-left-connectorpoint-outer-div';
var connectorPointAllowBlock = 'e-connectorpoint-allow-block';
var ganttTooltip = 'e-gantt-tooltip';

/**
 * To handle scroll event on chart and from TreeGrid
 * @hidden
 */
var ChartScroll = /** @__PURE__ @class */ (function () {
    /**
     * Constructor for the scrolling.
     * @hidden
     */
    function ChartScroll(parent) {
        this.previousScroll = { top: 0, left: 0 };
        this.parent = parent;
        this.element = this.parent.ganttChartModule.scrollElement;
        this.addEventListeners();
    }
    /**
     * Bind event
     */
    ChartScroll.prototype.addEventListeners = function () {
        this.parent.on('grid-scroll', this.gridScrollHandler, this);
        EventHandler.add(this.element, 'scroll', this.onScroll, this);
    };
    /**
     * Unbind events
     */
    ChartScroll.prototype.removeEventListeners = function () {
        EventHandler.remove(this.element, 'scroll', this.onScroll);
        this.parent.off('grid-scroll', this.gridScrollHandler);
    };
    /**
     *
     * @param args
     */
    ChartScroll.prototype.gridScrollHandler = function (args) {
        this.element.scrollTop = getValue('top', args);
        this.previousScroll.top = this.element.scrollTop;
    };
    /**
     * Scroll event handler
     */
    ChartScroll.prototype.onScroll = function () {
        if (this.element.scrollTop !== this.previousScroll.top) {
            this.parent.notify('chartScroll', { top: this.element.scrollTop });
            this.previousScroll.top = this.element.scrollTop;
        }
        if (this.element.scrollLeft !== this.previousScroll.left) {
            this.parent.ganttChartModule.chartTimelineContainer.scrollLeft = this.element.scrollLeft;
            this.previousScroll.left = this.element.scrollLeft;
        }
    };
    /**
     * To set height for chart scroll container
     * @param height - To set height for scroll container in chart side
     * @private
     */
    ChartScroll.prototype.setHeight = function (height) {
        this.element.style.height = formatUnit(height);
    };
    /**
     * To set width for chart scroll container
     * @param width - To set width to scroll container
     * @private
     */
    ChartScroll.prototype.setWidth = function (width) {
        this.element.style.width = formatUnit(width);
    };
    /**
     * To set scroll top for chart scroll container
     * @param scrollTop - To set scroll top for scroll container
     * @private
     */
    ChartScroll.prototype.setScrollTop = function (scrollTop) {
        this.element.scrollTop = scrollTop;
    };
    /**
     * To set scroll left for chart scroll container
     * @param scrollLeft  - To set scroll left for scroll container
     */
    ChartScroll.prototype.setScrollLeft = function (scrollLeft) {
        this.element.scrollLeft = scrollLeft;
        this.parent.ganttChartModule.chartTimelineContainer.scrollLeft = this.element.scrollLeft;
        this.previousScroll.left = this.element.scrollLeft;
    };
    /**
     * Destroy scroll related elements and unbind the events
     * @private
     */
    ChartScroll.prototype.destroy = function () {
        this.removeEventListeners();
    };
    return ChartScroll;
}());

/**
 * module to render gantt chart - project view
 */
var GanttChart = /** @__PURE__ @class */ (function () {
    function GanttChart(parent) {
        this.isExpandCollapseFromChart = false;
        this.isExpandAll = false;
        this.parent = parent;
        this.chartTimelineContainer = null;
        this.addEventListener();
    }
    GanttChart.prototype.addEventListener = function () {
        this.parent.on('renderPanels', this.renderChartContainer, this);
        this.parent.on('recordsUpdated', this.renderChartElements, this);
        this.parent.on('dataReady', this.renderInitialContents, this);
        this.parent.on('tree-grid-created', this.renderChartContents, this);
        this.parent.on('destroy', this.destroy, this);
    };
    GanttChart.prototype.renderChartContents = function () {
        this.parent.notify('refreshDayMarkers', {});
        this.wireEvents();
    };
    /**
     * Method to render top level containers in Gantt chart
     * @private
     */
    GanttChart.prototype.renderChartContainer = function () {
        this.chartElement = createElement('div', { id: this.parent.element.id + 'GanttChart', className: ganttChart });
        this.parent.chartPane.appendChild(this.chartElement);
        this.renderTimelineContainer();
        this.renderBodyContainers();
        // render top level div header and content
        // Get timeline header from timeline class file and append to header div
        // render content div
        // Render scroll able div
        // Render container for all element like, table, weekend and holidays
        // Get rows element from rows renderer class
        // Get label related info label renderer class
        // Get baseline from baseline renderer class
        // Get weekend elements from weekend-holidays renderer class
    };
    /**
     * method to render timeline, holidays, weekends at load time
     */
    GanttChart.prototype.renderInitialContents = function () {
        this.parent.timelineModule.createTimelineSeries();
    };
    GanttChart.prototype.renderChartElements = function () {
        this.parent.chartRowsModule.renderChartRows();
        this.parent.connectorLineModule.renderConnectorLines(this.parent.updatedConnectorLineCollection);
        this.updateWidthAndHeight();
        this.parent.notify('selectRowByIndex', {});
    };
    /**
     * @private
     */
    GanttChart.prototype.renderTimelineContainer = function () {
        this.chartTimelineContainer =
            createElement('div', { className: timelineHeaderContainer });
        this.chartElement.appendChild(this.chartTimelineContainer);
    };
    /**
     * initiate chart container
     */
    GanttChart.prototype.renderBodyContainers = function () {
        this.chartBodyContainer = createElement('div', { className: chartBodyContainer });
        this.chartElement.appendChild(this.chartBodyContainer);
        this.scrollElement = createElement('div', {
            className: chartScrollElement + ' ' + scrollContent, styles: 'position:relative;'
        });
        this.chartBodyContainer.appendChild(this.scrollElement);
        this.chartBodyContent = createElement('div', { className: chartBodyContent });
        this.scrollElement.appendChild(this.chartBodyContent);
        // this.parent.chartRowsModule.createChartTable();
        this.scrollObject = new ChartScroll(this.parent);
        //this.scrollObject.setWidth(this.chartProperties.width);
        var toolbarHeight = 0;
        if (!isNullOrUndefined(this.parent.toolbarModule) && !isNullOrUndefined(this.parent.toolbarModule.element)) {
            toolbarHeight = this.parent.toolbarModule.element.offsetHeight;
        }
        this.scrollObject.
            setHeight(this.parent.ganttHeight - this.chartTimelineContainer.offsetHeight - toolbarHeight);
    };
    GanttChart.prototype.updateWidthAndHeight = function () {
        this.chartBodyContent.style.height = formatUnit(this.parent.contentHeight);
        //let element: HTMLElement = this.chartTimelineContainer.querySelector('.' + cls.timelineHeaderTableContainer);
        this.chartBodyContent.style.width = formatUnit(this.parent.timelineModule.totalTimelineWidth);
        this.parent.notify('updateHeight', {});
        this.parent.updateGridLineContainerHeight();
        this.updateLastRowBottomWidth();
    };
    /**
     * Method to update bottom border for chart rows
     */
    GanttChart.prototype.updateLastRowBottomWidth = function () {
        if (this.parent.currentViewData.length > 0 && this.parent.height !== 'auto') {
            var expandedRecords = this.parent.getExpandedRecords(this.parent.currentViewData);
            var lastExpandedRow = expandedRecords[expandedRecords.length - 1];
            var lastExpandedRowIndex = this.parent.currentViewData.indexOf(lastExpandedRow);
            var lastRow = this.parent.getRowByIndex(lastExpandedRowIndex);
            var table = this.parent.chartRowsModule.ganttChartTableBody;
            if (table.querySelectorAll('.e-chart-row-cell.e-chart-row-border.e-lastrow')) {
                removeClass(table.querySelectorAll('.e-chart-row-cell.e-chart-row-border.e-lastrow'), 'e-lastrow');
            }
            if (this.chartBodyContent.clientHeight < this.chartBodyContainer.clientHeight) {
                if (lastRow) {
                    addClass(lastRow.querySelectorAll('td'), 'e-lastrow');
                }
            }
        }
    };
    GanttChart.prototype.removeEventListener = function () {
        if (this.parent.isDestroyed) {
            return;
        }
        this.parent.off('renderPanels', this.renderChartContainer);
        this.parent.off('recordsUpdated', this.renderChartElements);
        this.parent.off('dataReady', this.renderInitialContents);
        this.parent.off('tree-grid-created', this.renderChartContents);
        this.parent.off('destroy', this.destroy);
    };
    /**
     * Click event handler in chart side
     */
    GanttChart.prototype.ganttChartMouseDown = function (e) {
        this.parent.notify('chartMouseDown', e);
        this.parent.element.tabIndex = 0;
    };
    /**
     *
     * @param e
     */
    GanttChart.prototype.scrollToTarget = function (e) {
        var row = closest(e.target, 'tr');
        if (row && this.parent.element.contains(row) &&
            (this.parent.element.querySelectorAll('.e-chart-rows-container')[0].contains(e.target) ||
                this.parent.element.querySelectorAll('.e-gridcontent')[0].contains(e.target)) &&
            this.parent.currentViewData.length > 0) {
            var rowIndex = getValue('rowIndex', closest(e.target, 'tr'));
            var dateObject = this.parent.currentViewData[rowIndex].ganttProperties.startDate;
            if (!isNullOrUndefined(dateObject)) {
                var left = this.parent.dataOperation.getTaskLeft(dateObject, false);
                if (this.parent.autoFocusTasks) {
                    this.updateScrollLeft(left);
                }
            }
        }
    };
    /**
     * To focus selected task in chart side
     * @private
     */
    GanttChart.prototype.updateScrollLeft = function (scrollLeft) {
        scrollLeft = scrollLeft - 50 > 0 ? scrollLeft - 50 : 0;
        scrollLeft = this.scrollElement.scrollWidth <= scrollLeft ? this.scrollElement.scrollWidth : scrollLeft;
        if ((this.scrollElement.offsetWidth + this.parent.ganttChartModule.scrollElement.scrollLeft) < scrollLeft
            || (this.scrollElement.scrollLeft > scrollLeft)) {
            this.scrollObject.setScrollLeft(scrollLeft);
        }
    };
    /**
     *  Method trigger while perform mouse up action.
     * @return {void}
     * @private
     */
    GanttChart.prototype.documentMouseUp = function (e) {
        if (this.parent.isDestroyed) {
            return;
        }
        var isTaskbarEdited = false;
        if (this.parent.editSettings.allowTaskbarEditing &&
            getValue('editModule.taskbarEditModule.isMouseDragged', this.parent) &&
            getValue('editModule.taskbarEditModule.taskBarEditAction', this.parent)) {
            isTaskbarEdited = true;
        }
        this.parent.notify('chartMouseUp', e);
        if (!isTaskbarEdited) {
            /** Expand/collapse action */
            var target = e.target;
            var isOnTaskbarElement = e.target.classList.contains(taskBarMainContainer)
                || closest(e.target, '.' + taskBarMainContainer);
            if (target.closest('.e-gantt-parent-taskbar')) {
                this.chartExpandCollapseRequest(e);
            }
            else if (!isOnTaskbarElement && this.parent.autoFocusTasks) {
                this.scrollToTarget(e); /** Scroll to task */
            }
        }
        if (this.parent.editModule && this.parent.editModule.taskbarEditModule) {
            this.parent.editModule.taskbarEditModule.removeFalseLine(true);
        }
    };
    /**
     *  Method trigger while perform mouse leave action.
     * @return {void}
     * @private
     */
    GanttChart.prototype.ganttChartLeave = function (e) {
        this.parent.notify('chartMouseLeave', e);
    };
    /**
     *  Method trigger while perform mouse move action.
     * @return {void}
     * @private
     */
    GanttChart.prototype.ganttChartMove = function (e) {
        this.parent.notify('chartMouseMove', e);
        if (!isNullOrUndefined(this.parent.taskFields.dependency)) {
            this.parent.connectorLineEditModule.updateConnectorLineEditElement(e);
        }
    };
    /**
     * Double click handler for chart
     * @param e
     */
    GanttChart.prototype.doubleClickHandler = function (e) {
        this.parent.notify('chartDblClick', e);
    };
    /**
     * @private
     */
    GanttChart.prototype.getRecordByTarget = function (e) {
        var row = closest(e.target, 'tr');
        var ganttData;
        if (row) {
            var rowIndex = getValue('rowIndex', closest(e.target, 'tr'));
            ganttData = this.parent.currentViewData[rowIndex];
        }
        return ganttData;
    };
    /**
     * To get gantt chart row elements
     * @return {NodeListOf<Element>}
     * @private
     */
    GanttChart.prototype.getChartRows = function () {
        return document.getElementById(this.parent.element.id + 'GanttTaskTableBody').querySelectorAll('.e-chart-row');
    };
    /**
     * Expand Collapse operations from gantt chart side
     * @return {void}
     * @param target
     * @private
     */
    GanttChart.prototype.chartExpandCollapseRequest = function (e) {
        var target = e.target;
        var parentElement = target.closest('.e-gantt-parent-taskbar');
        var record = this.getRecordByTarget(e);
        var chartRow$$1 = closest(target, 'tr');
        var rowIndex = getValue('rowIndex', chartRow$$1);
        var gridRow = this.parent.treeGrid.getRows()[rowIndex];
        var args = { data: record, gridRow: gridRow, chartRow: chartRow$$1, cancel: false };
        this.isExpandCollapseFromChart = true;
        if (parentElement.classList.contains('e-row-expand')) {
            this.collapseGanttRow(args);
        }
        else if (parentElement.classList.contains('e-row-collapse')) {
            this.expandGanttRow(args);
        }
    };
    /**
     * @private
     */
    GanttChart.prototype.reRenderConnectorLines = function () {
        this.parent.connectorLineModule.dependencyViewContainer.innerHTML = '';
        var expandedRecords = this.parent.getExpandedRecords(this.parent.currentViewData);
        this.parent.connectorLineIds = [];
        this.parent.updatedConnectorLineCollection = [];
        this.parent.predecessorModule.createConnectorLinesCollection(expandedRecords);
        this.parent.connectorLineModule.renderConnectorLines(this.parent.updatedConnectorLineCollection);
    };
    /**
     * To collapse gantt rows
     * @return {void}
     * @param args
     * @private
     */
    GanttChart.prototype.collapseGanttRow = function (args) {
        var record = getValue('data', args);
        this.parent.trigger('collapsing', args);
        if (getValue('cancel', args)) {
            return;
        }
        if (this.isExpandCollapseFromChart) {
            this.expandCollapseChartRows('collapse', getValue('chartRow', args), record, null);
            this.parent.treeGrid.collapseRow(getValue('gridRow', args), record);
            this.isExpandCollapseFromChart = false;
        }
        else {
            this.expandCollapseChartRows('collapse', getValue('chartRow', args), record, null);
        }
        this.parent.updateContentHeight();
        this.updateWidthAndHeight();
        this.reRenderConnectorLines();
        this.parent.trigger('collapsed', args);
    };
    /**
     * To expand gantt rows
     * @return {void}
     * @param args
     * @private
     */
    GanttChart.prototype.expandGanttRow = function (args) {
        var record = getValue('data', args);
        this.parent.trigger('expanding', args);
        if (getValue('cancel', args)) {
            return;
        }
        if (this.isExpandCollapseFromChart) {
            this.expandCollapseChartRows('expand', getValue('chartRow', args), record, null);
            this.parent.treeGrid.expandRow(getValue('gridRow', args), record);
            this.isExpandCollapseFromChart = false;
        }
        else {
            this.expandCollapseChartRows('expand', getValue('chartRow', args), record, null);
        }
        this.parent.updateContentHeight();
        this.updateWidthAndHeight();
        this.reRenderConnectorLines();
        this.parent.trigger('expanded', args);
    };
    /**
     * On expand collapse operation row properties will be updated here.
     * @return {void}
     * @param action
     * @param rowElement
     * @param record
     * @param isChild
     * @private
     */
    GanttChart.prototype.expandCollapseChartRows = function (action, rowElement, record, isChild) {
        var displayType;
        if (action === 'expand') {
            displayType = 'table-row';
            if (!isChild) {
                record.expanded = true;
            }
            var targetElement = rowElement.querySelectorAll('.e-row-collapse');
            for (var t = 0; t < targetElement.length; t++) {
                addClass([targetElement[t]], 'e-row-expand');
                removeClass([targetElement[t]], 'e-row-collapse');
            }
        }
        else if (action === 'collapse') {
            displayType = 'none';
            if (!isChild) {
                record.expanded = false;
            }
            var targetElement = rowElement.querySelectorAll('.e-row-expand');
            for (var t = 0; t < targetElement.length; t++) {
                addClass([targetElement[t]], 'e-row-collapse');
                removeClass([targetElement[t]], 'e-row-expand');
            }
        }
        var childRecords = record.childRecords;
        var chartRows = this.getChartRows();
        var rows = [];
        chartRows.forEach(function (item) {
            if (item.classList.contains('gridrowtaskId' + record.ganttProperties.taskId + 'level' + (record.level + 1))) {
                rows.push(item);
            }
        });
        for (var i = 0; i < rows.length; i++) {
            rows[i].style.display = displayType;
            if ((childRecords[i].childRecords && childRecords[i].childRecords.length)
                && (action === 'collapse' || childRecords[i].expanded || this.isExpandAll)) {
                this.expandCollapseChartRows(action, rows[i], childRecords[i], true);
            }
        }
    };
    /**
     * Public method to expand or collapse all the rows of Gantt
     * @return {void}
     * @param action
     * @private
     */
    GanttChart.prototype.expandCollapseAll = function (action) {
        if (action === 'expand') {
            this.isExpandAll = true;
            this.parent.treeGrid.expandAll();
        }
        else {
            this.parent.treeGrid.collapseAll();
        }
        this.isExpandAll = false;
    };
    /**
     * Public method to expand particular level of rows.
     * @return {void}
     * @param level
     * @private
     */
    GanttChart.prototype.expandAtLevel = function (level) {
        this.parent.treeGrid.expandAtLevel(level);
    };
    /**
     * Public method to collapse particular level of rows.
     * @return {void}
     * @param level
     * @private
     */
    GanttChart.prototype.collapseAtLevel = function (level) {
        this.parent.treeGrid.collapseAtLevel(level);
    };
    /**
     * Event Binding for gantt chart click
     */
    GanttChart.prototype.wireEvents = function () {
        var isIE11Pointer = Browser.isPointer;
        var mouseDown = Browser.touchStartEvent;
        var mouseUp = Browser.touchEndEvent;
        var mouseMove = Browser.touchMoveEvent;
        var cancel = isIE11Pointer ? 'pointerleave' : 'mouseleave';
        if (this.parent.editSettings.allowTaskbarEditing) {
            EventHandler.add(this.parent.chartPane, mouseDown, this.ganttChartMouseDown, this);
            EventHandler.add(this.parent.chartPane, cancel, this.ganttChartLeave, this);
            EventHandler.add(this.parent.chartPane, mouseMove, this.ganttChartMove, this);
        }
        EventHandler.add(document.body, mouseUp, this.documentMouseUp, this);
        if (this.parent.editSettings.allowEditing) {
            EventHandler.add(this.parent.chartRowsModule.ganttChartTableBody, 'dblclick', this.doubleClickHandler, this);
        }
    };
    GanttChart.prototype.unWireEvents = function () {
        var isIE11Pointer = Browser.isPointer;
        var mouseDown = Browser.touchStartEvent;
        var mouseUp = Browser.touchEndEvent;
        var mouseMove = Browser.touchMoveEvent;
        var cancel = isIE11Pointer ? 'pointerleave' : 'mouseleave';
        if (this.parent.editSettings.allowTaskbarEditing) {
            EventHandler.remove(this.parent.chartRowsModule.ganttChartTableBody, mouseDown, this.ganttChartMouseDown);
            EventHandler.remove(this.parent.chartPane, cancel, this.ganttChartLeave);
            EventHandler.remove(this.parent.chartPane, mouseMove, this.ganttChartMove);
        }
        EventHandler.remove(document.body, mouseUp, this.documentMouseUp);
        if (this.parent.editSettings.allowEditing) {
            EventHandler.remove(this.parent.chartPane, 'dblclick', this.doubleClickHandler);
        }
    };
    /**
     * To get record by taskbar element.
     * @return {IGanttData}
     * @private
     */
    GanttChart.prototype.getRecordByTaskBar = function (target) {
        var item = this.parent.currentViewData[this.getIndexByTaskBar(target)];
        return item;
    };
    /**
     * To get index by taskbar element.
     * @return {number}
     * @private
     */
    GanttChart.prototype.getIndexByTaskBar = function (target) {
        var row = closest(target, 'tr.' + chartRow);
        var recordIndex = [].slice.call(this.parent.chartRowsModule.ganttChartTableBody.childNodes).indexOf(row);
        return recordIndex;
    };
    GanttChart.prototype.destroy = function () {
        this.removeEventListener();
        this.unWireEvents();
        this.scrollObject.destroy();
        this.scrollObject = null;
    };
    return GanttChart;
}());

/**
 * Configures the `Timeline` of the gantt.
 */
var Timeline = /** @__PURE__ @class */ (function () {
    function Timeline(ganttObj) {
        this.parent = ganttObj;
        this.initProperties();
    }
    /**
     * To initialize the public property.
     * @return {void}
     * @private
     */
    Timeline.prototype.initProperties = function () {
        this.timelineStartDate = null;
        this.timelineEndDate = null;
        this.totalTimelineWidth = 0;
        this.customTimelineSettings = null;
        this.parent.isTimelineRoundOff = isNullOrUndefined(this.parent.projectStartDate) ? true : false;
    };
    /**
     * To render timeline header series.
     * @return {void}
     * @private
     */
    Timeline.prototype.validateTimelineProp = function () {
        this.roundOffDays();
        this.processTimelineProperty();
        this.timelineWidthCalculation();
    };
    /**
     * Function used to refresh Gantt rows.
     * @return {void}
     * @private
     */
    Timeline.prototype.refreshTimeline = function () {
        this.initProperties();
        this.processTimelineUnit();
        this.parent.dataOperation.calculateProjectDates();
        this.parent.updateProjectDates(this.parent.cloneProjectStartDate, this.parent.cloneProjectEndDate, this.parent.isTimelineRoundOff);
    };
    /**
     * Function used to refresh Gantt rows.
     * @return {void}
     * @private
     */
    Timeline.prototype.refreshTimelineByTimeSpan = function () {
        this.validateTimelineProp();
        this.parent.ganttChartModule.chartTimelineContainer.innerHTML = '';
        this.createTimelineSeries();
    };
    /**
     * Function used to refresh Gantt rows.
     * @return {void}
     * @private
     */
    Timeline.prototype.updateChartByNewTimeline = function () {
        this.parent.chartRowsModule.refreshChartByTimeline();
        this.parent.notify('refreshDayMarkers', {});
    };
    /**
     * To validate time line unit.
     * @return {void}
     * @private
     */
    Timeline.prototype.processTimelineUnit = function () {
        var directProperty = ['timelineViewMode', 'timelineUnitSize', 'weekStartDay', 'weekendBackground'];
        var innerProperty = {
            'topTier': ['unit', 'format', 'count', 'formatter'],
            'bottomTier': ['unit', 'format', 'count', 'formatter']
        };
        var tierUnits = ['Year', 'Month', 'Week', 'Day', 'Hour', 'Minutes'];
        this.customTimelineSettings = this.extendFunction(this.parent.timelineSettings, directProperty, innerProperty);
        if ((tierUnits.indexOf(this.customTimelineSettings.topTier.unit) === -1) &&
            (tierUnits.indexOf(this.customTimelineSettings.bottomTier.unit) === -1)) {
            this.customTimelineSettings.topTier.unit = tierUnits.indexOf(this.customTimelineSettings.timelineViewMode) !== -1 ?
                this.customTimelineSettings.timelineViewMode : 'Week';
            this.customTimelineSettings.bottomTier.unit = tierUnits.indexOf(this.customTimelineSettings.topTier.unit) !== 5 ?
                tierUnits[tierUnits.indexOf(this.customTimelineSettings.topTier.unit) + 1] : 'None';
        }
        else if ((tierUnits.indexOf(this.customTimelineSettings.topTier.unit) !== -1 &&
            tierUnits.indexOf(this.customTimelineSettings.bottomTier.unit) !== -1)
            && (tierUnits.indexOf(this.customTimelineSettings.topTier.unit) >
                tierUnits.indexOf(this.customTimelineSettings.bottomTier.unit))) {
            this.customTimelineSettings.bottomTier.unit = this.customTimelineSettings.topTier.unit;
        }
        else {
            this.customTimelineSettings.topTier.unit = tierUnits.indexOf(this.customTimelineSettings.topTier.unit) === -1 ?
                'None' : this.customTimelineSettings.topTier.unit;
            this.customTimelineSettings.bottomTier.unit = tierUnits.indexOf(this.customTimelineSettings.bottomTier.unit) === -1 ?
                'None' : this.customTimelineSettings.bottomTier.unit;
        }
        this.topTier = this.customTimelineSettings.topTier.unit;
        this.bottomTier = this.customTimelineSettings.bottomTier.unit;
        this.previousIsSingleTier = this.isSingleTier;
        this.isSingleTier = this.topTier === 'None' || this.bottomTier === 'None' ? true : false;
    };
    /**
     * To validate timeline properties.
     * @return {void}
     * @private
     */
    Timeline.prototype.processTimelineProperty = function () {
        this.customTimelineSettings.topTier.count = (this.topTier === 'None') ?
            1 : this.validateCount(this.customTimelineSettings.topTier.unit, this.customTimelineSettings.topTier.count, 'topTier');
        this.customTimelineSettings.bottomTier.count = this.customTimelineSettings.bottomTier.unit === 'None' ?
            1 : this.validateCount(this.customTimelineSettings.bottomTier.unit, this.customTimelineSettings.bottomTier.count, 'bottomTier');
        this.customTimelineSettings.bottomTier.format = this.validateFormat(this.customTimelineSettings.bottomTier.unit, this.customTimelineSettings.bottomTier.format);
        this.customTimelineSettings.topTier.format = this.validateFormat(this.topTier, this.customTimelineSettings.topTier.format);
        this.customTimelineSettings.weekStartDay = this.customTimelineSettings.weekStartDay >= 0 &&
            this.customTimelineSettings.weekStartDay <= 6 ? this.customTimelineSettings.weekStartDay : 0;
    };
    /**
     * To create timeline header template.
     * @return {void}
     * @private
     */
    Timeline.prototype.updateTimelineHeaderHeight = function () {
        if (this.parent.timelineModule.isSingleTier) {
            addClass([this.parent.ganttChartModule.chartTimelineContainer], timelineSingleHeaderOuterDiv);
            if (this.parent.treeGrid.element) {
                addClass(this.parent.treeGrid.element.querySelectorAll('.e-headercell'), timelineSingleHeaderOuterDiv);
                addClass(this.parent.treeGrid.element.querySelectorAll('.e-columnheader'), timelineSingleHeaderOuterDiv);
            }
        }
        else {
            removeClass([this.parent.ganttChartModule.chartTimelineContainer], timelineSingleHeaderOuterDiv);
            if (this.parent.treeGrid.element) {
                removeClass(this.parent.treeGrid.element.querySelectorAll('.e-headercell'), timelineSingleHeaderOuterDiv);
                removeClass(this.parent.treeGrid.element.querySelectorAll('.e-columnheader'), timelineSingleHeaderOuterDiv);
            }
        }
        if (this.previousIsSingleTier !== this.isSingleTier) {
            var toolbarHeight = 0;
            if (!isNullOrUndefined(this.parent.toolbarModule) && !isNullOrUndefined(this.parent.toolbarModule.element)) {
                toolbarHeight = this.parent.toolbarModule.element.offsetHeight;
            }
            this.parent.ganttChartModule.scrollObject.
                setHeight(this.parent.ganttHeight - this.parent.ganttChartModule.chartTimelineContainer.offsetHeight - toolbarHeight);
            this.parent.treeGrid.height = this.parent.ganttHeight - toolbarHeight -
                this.parent.ganttChartModule.chartTimelineContainer.offsetHeight;
        }
    };
    /**
     * To create timeline header template.
     * @return {void}
     * @private
     */
    Timeline.prototype.createTimelineSeries = function () {
        var tr;
        var td;
        var div;
        var table;
        var thead;
        var loopCount = this.isSingleTier ? 1 : 2;
        var tier = this.topTier === 'None' ? 'bottomTier' : 'topTier';
        this.updateTimelineHeaderHeight();
        for (var count = 0; count < loopCount; count++) {
            table = createElement('table', { className: timelineHeaderTableContainer, styles: 'display: block;' });
            thead = createElement('thead', { className: timelineHeaderTableBody, styles: 'display:block; border-collapse:collapse' });
            tr = createElement('tr', { innerHTML: this.createTimelineTemplate(tier) });
            td = createElement('th');
            div = createElement('div', { styles: 'width: 20px' });
            td.appendChild(div);
            tr.appendChild(td);
            thead.appendChild(tr);
            table.appendChild(thead);
            this.parent.ganttChartModule.chartTimelineContainer.appendChild(table);
            tier = 'bottomTier';
            tr = null;
        }
    };
    /**
     * To validate timeline tier count.
     * @return {number}
     * @private
     */
    Timeline.prototype.validateCount = function (mode, count, tier) {
        var tierCount = !isNullOrUndefined(count) && parseInt(count.toString(), 10) > 0 ? parseInt(count.toString(), 10) : 1;
        var timeDifference = Math.abs(this.timelineRoundOffEndDate.getTime() - this.timelineStartDate.getTime());
        var difference;
        switch (mode) {
            case 'Year':
                difference = Math.round((timeDifference / (1000 * 3600 * 24)) / (12 * 28));
                tierCount = tierCount <= difference ? tierCount : difference > 0 ? difference : 1;
                if (this.topTier !== 'None' && tier === 'bottomTier') {
                    tierCount = this.validateBottomTierCount(mode, tierCount);
                }
                break;
            case 'Month':
                difference = Math.round((timeDifference / (1000 * 3600 * 24)) / 28);
                tierCount = tierCount <= difference ? tierCount : difference > 0 ? difference : 1;
                if (this.topTier !== 'None' && tier === 'bottomTier') {
                    tierCount = this.validateBottomTierCount(mode, tierCount);
                }
                break;
            case 'Week':
                difference = Math.round((timeDifference / (1000 * 3600 * 24)) / 7);
                tierCount = tierCount <= difference ? tierCount : difference > 0 ? difference : 1;
                if (this.topTier !== 'None' && tier === 'bottomTier') {
                    tierCount = this.validateBottomTierCount(mode, tierCount);
                }
                break;
            case 'Day':
                difference = Math.round(timeDifference / (1000 * 3600 * 24));
                tierCount = tierCount <= difference ? tierCount : difference > 0 ? difference : 1;
                if (this.topTier !== 'None' && tier === 'bottomTier') {
                    tierCount = this.validateBottomTierCount(mode, tierCount);
                }
                break;
            case 'Hour':
                difference = Math.round(timeDifference / (1000 * 3600));
                tierCount = tierCount <= difference ? tierCount : difference > 0 ? difference : 1;
                if (this.topTier !== 'None' && tier === 'bottomTier') {
                    tierCount = this.validateBottomTierCount(mode, tierCount);
                }
                break;
            case 'Minutes':
                difference = Math.round(timeDifference / (1000 * 60));
                tierCount = tierCount <= difference ? tierCount : difference > 0 ? difference : 1;
                if (this.topTier !== 'None' && tier === 'bottomTier') {
                    tierCount = this.validateBottomTierCount(mode, tierCount);
                }
                break;
        }
        return tierCount;
    };
    /**
     * To validate bottom tier count.
     * @return {number}
     * @private
     */
    Timeline.prototype.validateBottomTierCount = function (mode, tierCount) {
        var count;
        switch (mode) {
            case 'Year':
                count = tierCount <= this.customTimelineSettings.topTier.count ?
                    tierCount : this.customTimelineSettings.topTier.count;
                break;
            case 'Month':
                count = this.topTier === 'Year' ? tierCount <= (this.customTimelineSettings.topTier.count * 12) ?
                    tierCount : (this.customTimelineSettings.topTier.count * 12) :
                    tierCount <= this.customTimelineSettings.topTier.count ?
                        tierCount : this.customTimelineSettings.topTier.count;
                break;
            case 'Week':
                count = this.topTier === 'Year' ? tierCount <= (this.customTimelineSettings.topTier.count * (12 * 4)) ?
                    tierCount : (this.customTimelineSettings.topTier.count * (12 * 4)) :
                    this.topTier === 'Month' ? tierCount <= (this.customTimelineSettings.topTier.count * 4) ?
                        tierCount : (this.customTimelineSettings.topTier.count * 4) :
                        tierCount <= this.customTimelineSettings.topTier.count ?
                            tierCount : this.customTimelineSettings.topTier.count;
                break;
            case 'Day':
                count = this.topTier === 'Year' ? tierCount <= (this.customTimelineSettings.topTier.count * (12 * 28)) ?
                    tierCount : (this.customTimelineSettings.topTier.count * (12 * 28)) :
                    this.topTier === 'Month' ? tierCount <= (this.customTimelineSettings.topTier.count * 28) ?
                        tierCount : (this.customTimelineSettings.topTier.count * 28) :
                        this.topTier === 'Week' ? tierCount <= (this.customTimelineSettings.topTier.count * 7) ?
                            tierCount : (this.customTimelineSettings.topTier.count * 7) :
                            tierCount <= this.customTimelineSettings.topTier.count ? tierCount : this.customTimelineSettings.topTier.count;
                break;
            case 'Hour':
                count = this.topTier === 'Year' ? tierCount <= (this.customTimelineSettings.topTier.count * (12 * 28 * 24)) ?
                    tierCount : (this.customTimelineSettings.topTier.count * (12 * 28 * 24)) :
                    this.topTier === 'Month' ? tierCount <= (this.customTimelineSettings.topTier.count * (28 * 24)) ?
                        tierCount : (this.customTimelineSettings.topTier.count * (28 * 24)) :
                        this.topTier === 'Week' ? tierCount <= (this.customTimelineSettings.topTier.count * 7 * 24) ?
                            tierCount : (this.customTimelineSettings.topTier.count * 7 * 24) :
                            this.topTier === 'Day' ? tierCount <= (this.customTimelineSettings.topTier.count * 24) ?
                                tierCount : (this.customTimelineSettings.topTier.count * 24) :
                                tierCount <= this.customTimelineSettings.topTier.count ?
                                    tierCount : this.customTimelineSettings.topTier.count;
                break;
            case 'Minutes':
                count = this.topTier === 'Year' ? tierCount <= (this.customTimelineSettings.topTier.count * (12 * 28 * 24 * 60)) ?
                    tierCount : (this.customTimelineSettings.topTier.count * (12 * 28 * 24 * 60)) :
                    this.topTier === 'Month' ? tierCount <= (this.customTimelineSettings.topTier.count * (28 * 24 * 60)) ?
                        tierCount : (this.customTimelineSettings.topTier.count * (28 * 24 * 60)) :
                        this.topTier === 'Week' ? tierCount <= (this.customTimelineSettings.topTier.count * 7 * 24 * 60) ?
                            tierCount : (this.customTimelineSettings.topTier.count * 7 * 24 * 60) :
                            this.topTier === 'Day' ? tierCount <= (this.customTimelineSettings.topTier.count * 24 * 60) ?
                                tierCount : (this.customTimelineSettings.topTier.count * 24 * 60) :
                                this.topTier === 'Hour' ? tierCount <= (this.customTimelineSettings.topTier.count * 60) ?
                                    tierCount : (this.customTimelineSettings.topTier.count * 60) :
                                    tierCount <= this.customTimelineSettings.topTier.count ?
                                        tierCount : this.customTimelineSettings.topTier.count;
                break;
        }
        return count;
    };
    /**
     * To validate timeline tier format.
     * @return {string}
     * @private
     */
    Timeline.prototype.validateFormat = function (mode, format) {
        var tierFormat;
        switch (mode) {
            case 'Week':
                tierFormat = !format ? 'MMM dd, yyyy' : format;
                break;
            case 'Day':
            case 'None':
                tierFormat = !format ? '' : format;
                break;
            case 'Hour':
                tierFormat = !format ? 'H' : format;
                break;
            case 'Month':
                tierFormat = !format ? 'MMM yyyy' : format;
                break;
            case 'Year':
                tierFormat = !format ? 'yyyy' : format;
                break;
            case 'Minutes':
                tierFormat = !format ? 'm' : format;
                break;
        }
        return tierFormat;
    };
    /**
     * To perform extend operation.
     * @return {object}
     * @private
     */
    Timeline.prototype.extendFunction = function (cloneObj, propertyCollection, innerProperty) {
        var _this = this;
        var tempObj = {};
        for (var index = 0; index < propertyCollection.length; index++) {
            tempObj[propertyCollection[index]] = cloneObj[propertyCollection[index]];
        }
        if (innerProperty) {
            Object.keys(innerProperty).forEach(function (key) {
                tempObj[key] = _this.extendFunction(cloneObj[key], innerProperty[key], null);
            });
        }
        return tempObj;
    };
    /**
     * To format date.
     * @return {string}
     * @private
     */
    Timeline.prototype.formatDateHeader = function (dayFormat, data) {
        var date = new Date(data.getTime());
        var dateString;
        switch (dayFormat) {
            case '':
                dateString = this.parent.globalize.formatDate(date, { format: 'E' });
                dateString = dateString.slice(0, 1);
                break;
            default:
                dateString = this.parent.globalize.formatDate(date, { format: dayFormat });
        }
        return dateString;
    };
    /**
     * Custom Formatting.
     * @return {string}
     * @private
     */
    Timeline.prototype.customFormat = function (date, format, tier, mode, formatter) {
        formatter = (typeof formatter === 'string' ? getValue(formatter, window) : formatter);
        return formatter(date, format, tier, mode);
    };
    /**
     * To create timeline template .
     * @return {string}
     * @private
     */
    Timeline.prototype.createTimelineTemplate = function (tier) {
        var parent = this.parent;
        var parentTh = '';
        var parentTr = '';
        var mode = tier === 'topTier' ?
            parent.timelineModule.customTimelineSettings.topTier.unit : parent.timelineModule.customTimelineSettings.bottomTier.unit;
        var count = tier === 'topTier' ? parent.timelineModule.customTimelineSettings.topTier.count :
            parent.timelineModule.customTimelineSettings.bottomTier.count;
        var increment;
        var newTime;
        var startDate = new Date(this.parent.timelineModule.timelineStartDate.toString());
        var endDate = new Date(this.timelineRoundOffEndDate.toString());
        var scheduleDateCollection = [];
        do {
            parentTr = this.getHeaterTemplateString(new Date(startDate.toString()), mode, tier, false, count);
            scheduleDateCollection.push(new Date(startDate.toString()));
            increment = this.getIncrement(startDate, count, mode);
            newTime = startDate.getTime() + increment;
            startDate.setTime(newTime);
            if (startDate >= endDate) {
                parentTr = this.getHeaterTemplateString(scheduleDateCollection[scheduleDateCollection.length - 1], mode, tier, true, count);
            }
            parentTh = parentTh + parentTr;
            parentTr = '';
        } while (!(startDate >= endDate));
        return parentTh;
    };
    Timeline.prototype.getTimelineRoundOffEndDate = function (date) {
        var tierMode = this.topTier === 'None' ? this.bottomTier : this.topTier;
        var endDate = new Date(date.toString());
        if (this.parent.isTimelineRoundOff) {
            if (tierMode === 'Hour') {
                endDate.setMinutes(60);
            }
            else if (tierMode === 'Minutes') {
                endDate.setSeconds(60);
            }
            else {
                endDate.setHours(24, 0, 0, 0);
            }
        }
        return endDate;
    };
    /**
     *
     * @param startDate
     * @param count
     * @param mode
     * @private
     */
    Timeline.prototype.getIncrement = function (startDate, count, mode) {
        var firstDay = new Date(startDate.getTime());
        var lastDay = new Date(startDate.getTime());
        var increment;
        switch (mode) {
            case 'Year':
                firstDay = startDate;
                lastDay = new Date(startDate.getFullYear() + (count - 1), 11, 31);
                increment = ((lastDay.getTime() - firstDay.getTime())) + (1000 * 60 * 60 * 24);
                break;
            case 'Month':
                firstDay = startDate;
                lastDay = new Date(startDate.getFullYear(), startDate.getMonth() + count, 0);
                increment = ((lastDay.getTime() - firstDay.getTime())) + (1000 * 60 * 60 * 24);
                break;
            case 'Week':
                var dayIndex = this.parent.timelineModule.customTimelineSettings.weekStartDay;
                var dayIntervel = startDate.getDay() < dayIndex ? (dayIndex - startDate.getDay()) :
                    (6 - startDate.getDay()) + dayIndex;
                count = dayIntervel > 0 ? count - 1 : 0;
                lastDay.setHours(24, 0, 0, 0);
                dayIntervel = startDate.getDay() < dayIndex ? dayIntervel > 0 ?
                    dayIntervel - 1 : dayIntervel : dayIntervel;
                lastDay.setDate(lastDay.getDate() + (dayIntervel + (6 * count)));
                increment = ((lastDay.getTime() - firstDay.getTime()));
                break;
            case 'Day':
                lastDay.setHours(24, 0, 0, 0);
                increment = ((lastDay.getTime() - firstDay.getTime())) + (1000 * 60 * 60 * 24 * (count - 1));
                break;
            case 'Hour':
                lastDay.setMinutes(60);
                lastDay.setSeconds(0);
                increment = ((lastDay.getTime() - firstDay.getTime())) + (1000 * 60 * 60 * (count - 1));
                break;
            case 'Minutes':
                lastDay.setSeconds(60);
                increment = ((lastDay.getTime() - firstDay.getTime())) + (1000 * 60 * (count - 1));
                break;
        }
        return increment;
    };
    /**
     * Method to find header cell was weekend or not
     * @param mode
     * @param tier
     * @param day
     */
    Timeline.prototype.isWeekendHeaderCell = function (mode, tier, day) {
        return mode === 'Day' && this.customTimelineSettings[tier].count === 1 &&
            this.parent.nonWorkingDayIndex.indexOf(day.getDay()) !== -1;
    };
    /**
     * To construct template string.
     * @return {string}
     * @private
     */
    Timeline.prototype.getHeaterTemplateString = function (scheduleWeeks, mode, tier, isLast, count) {
        var parentTr = '';
        var td = '';
        var format = tier === 'topTier' ?
            this.parent.timelineModule.customTimelineSettings.topTier.format :
            this.parent.timelineModule.customTimelineSettings.bottomTier.format;
        var formatter = tier === 'topTier' ?
            this.parent.timelineModule.customTimelineSettings.topTier.formatter :
            this.parent.timelineModule.customTimelineSettings.bottomTier.formatter;
        var thWidth;
        var cellWidth;
        var isWeekendCell;
        var date = isNullOrUndefined(formatter) ?
            this.parent.globalize.formatDate(scheduleWeeks, { format: this.parent.dateFormat }) :
            this.customFormat(scheduleWeeks, format, tier, mode, formatter);
        thWidth = (this.getIncrement(scheduleWeeks, count, mode) / (1000 * 60 * 60 * 24)) * this.parent.perDayWidth;
        cellWidth = thWidth;
        thWidth = isLast ? this.calculateWidthBetweenTwoDate(mode, scheduleWeeks, this.timelineRoundOffEndDate)
            : thWidth;
        isWeekendCell = this.isWeekendHeaderCell(mode, tier, scheduleWeeks);
        var textClassName = tier === 'topTier' ? ' e-gantt-top-cell-text' : '';
        td += this.parent.timelineModule.isSingleTier ?
            '<th class="' + timelineSingleHeaderCell + ' ' : '<th class="' + timelineTopHeaderCell + '';
        td += isWeekendCell ? ' ' + weekendHeaderCell : '';
        td += '" style="width:' + thWidth + 'px;';
        td += isWeekendCell && this.customTimelineSettings.weekendBackground ?
            'background-color:' + this.customTimelineSettings.weekendBackground + ';' : '';
        td += '"><div class="' + timelineHeaderCellLabel + textClassName + '" style="width:' +
            (thWidth - 1) + 'px;' + (this.parent.timelineSettings.showTooltip ? '"title="' + date : '');
        td += isWeekendCell && this.customTimelineSettings.weekendBackground ?
            'background-color:' + this.customTimelineSettings.weekendBackground + ';' : '';
        td += '">' + (isNullOrUndefined(formatter) ? this.formatDateHeader(format, scheduleWeeks) :
            this.customFormat(scheduleWeeks, format, tier, mode, formatter)) + '</div>';
        parentTr += td;
        parentTr += '</th>';
        td = '';
        if ((this.isSingleTier || tier === 'topTier') && !isLast) {
            this.totalTimelineWidth = this.totalTimelineWidth + thWidth;
        }
        else if ((this.isSingleTier || tier === 'topTier') && isLast) {
            this.totalTimelineWidth = (this.totalTimelineWidth - cellWidth) + thWidth;
        }
        return parentTr;
    };
    /**
     * To calculate last 'th' width.
     * @return {number}
     * @private
     */
    Timeline.prototype.calculateWidthBetweenTwoDate = function (mode, scheduleWeeks, endDate) {
        var balanceDay = ((endDate.getTime() - scheduleWeeks.getTime()) / (1000 * 60 * 60 * 24));
        return balanceDay * this.parent.perDayWidth;
    };
    /**
     * To calculate timeline width.
     * @return {void}
     * @private
     */
    Timeline.prototype.timelineWidthCalculation = function () {
        var timelineUnitSize = this.customTimelineSettings.timelineUnitSize;
        var bottomTierCount = this.customTimelineSettings.bottomTier.count;
        var topTierCount = this.customTimelineSettings.topTier.count;
        this.bottomTierCellWidth = timelineUnitSize;
        switch (this.bottomTier) {
            case 'None':
                this.parent.perDayWidth = this.getPerDayWidth(timelineUnitSize, topTierCount, this.topTier);
                break;
            default:
                this.parent.perDayWidth = this.getPerDayWidth(timelineUnitSize, bottomTierCount, this.bottomTier);
                break;
        }
        this.topTierCellWidth = this.bottomTier !== 'None' ? this.topTier === 'Week' ?
            this.parent.perDayWidth * 7 : this.topTier === 'Hour' ?
            this.parent.perDayWidth / 24 : this.topTier === 'Minutes' ?
            this.parent.perDayWidth / (24 * 60) : this.parent.perDayWidth : timelineUnitSize;
        this.topTierCellWidth = this.isSingleTier ? this.topTierCellWidth : this.topTierCellWidth * topTierCount;
    };
    /**
     * To validate per day width.
     * @return {number}
     * @private
     */
    Timeline.prototype.getPerDayWidth = function (timelineUnitSize, bottomTierCount, mode) {
        var perDayWidth;
        switch (mode) {
            case 'Year':
                perDayWidth = (timelineUnitSize / bottomTierCount) / (12 * 28);
                break;
            case 'Month':
                perDayWidth = (timelineUnitSize / bottomTierCount) / 28;
                break;
            case 'Week':
                perDayWidth = (timelineUnitSize / bottomTierCount) / 7;
                break;
            case 'Day':
                perDayWidth = timelineUnitSize / bottomTierCount;
                break;
            case 'Hour':
                perDayWidth = (24 / bottomTierCount) * timelineUnitSize;
                break;
            case 'Minutes':
                perDayWidth = ((60 * 24) / bottomTierCount) * timelineUnitSize;
                break;
        }
        return perDayWidth;
    };
    /**
     * To validate project start date and end date.
     * @return {void}
     * @private
     */
    Timeline.prototype.roundOffDays = function () {
        var startDate = this.parent.cloneProjectStartDate;
        var endDate = this.parent.cloneProjectEndDate;
        var tierMode = this.topTier === 'None' ? this.bottomTier : this.topTier;
        if (this.parent.isTimelineRoundOff) {
            if (tierMode === 'Year') {
                startDate = new Date(startDate.getFullYear(), 0, 1);
                endDate = new Date(endDate.getFullYear(), 11, 31);
            }
            else if (tierMode === 'Month') {
                startDate = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
                endDate = new Date(endDate.getFullYear(), endDate.getMonth() + 1, 0);
            }
            else if (tierMode === 'Week') {
                var dayIndex = this.parent.timelineModule.customTimelineSettings.weekStartDay;
                var roundOffStartDate = startDate.getDay() < dayIndex ?
                    (startDate.getDate()) - (7 - dayIndex + startDate.getDay()) :
                    (startDate.getDate()) - startDate.getDay() + dayIndex;
                startDate.setDate(roundOffStartDate);
                var first = endDate.getDate() - endDate.getDay();
                var last = first + 6 + dayIndex;
                endDate.setDate(last);
            }
            if (tierMode === 'Hour') {
                startDate.setMinutes(0);
            }
            else if (tierMode === 'Minutes') {
                startDate.setSeconds(0);
            }
            else {
                startDate.setHours(0, 0, 0, 0);
            }
        }
        this.timelineStartDate = startDate;
        this.timelineEndDate = endDate;
        this.timelineRoundOffEndDate = this.getTimelineRoundOffEndDate(this.timelineEndDate);
    };
    /**
     * To validate project start date and end date.
     * @return {void}
     * @private
     */
    Timeline.prototype.updateScheduleDatesByToolBar = function (mode, span, startDate, endDate) {
        if (mode === 'Year') {
            if (span === 'prevTimeSpan') {
                if (startDate.getMonth() === 0) {
                    startDate = new Date(startDate.getFullYear() - 1, 0, 1);
                }
                else {
                    startDate = new Date(startDate.getFullYear(), 0, 1);
                }
            }
            else {
                if (endDate.getMonth() === 11) {
                    endDate = new Date(startDate.getFullYear() + 1, 0, 1);
                }
                else {
                    endDate = new Date(endDate.getFullYear(), 12, 1);
                }
            }
        }
        if (mode === 'Month') {
            if (span === 'prevTimeSpan') {
                if (startDate.getDate() === 1) {
                    startDate = new Date(startDate.getFullYear(), startDate.getMonth() - 1, 1);
                }
                else {
                    startDate = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
                }
            }
            else {
                endDate = new Date(endDate.getFullYear(), endDate.getMonth() + 1, 1);
            }
        }
        if (mode === 'Week') {
            var dayIndex = this.parent.timelineModule.customTimelineSettings.weekStartDay;
            var dayIntervel = void 0;
            if (span === 'prevTimeSpan') {
                dayIntervel = startDate.getDay() < dayIndex ? 7 - (dayIndex - startDate.getDay()) :
                    startDate.getDay() - dayIndex;
                startDate.setHours(0, 0, 0, 0);
                if (dayIntervel === 0) {
                    startDate.setDate(startDate.getDate() - 7);
                }
                else {
                    startDate.setDate(startDate.getDate() - dayIntervel);
                }
            }
            else {
                dayIntervel = endDate.getDay() < dayIndex ? (dayIndex - endDate.getDay()) :
                    (7 - endDate.getDay()) + dayIndex;
                endDate.setHours(0, 0, 0, 0);
                if (dayIntervel === 0) {
                    endDate.setDate(endDate.getDate() + 6);
                }
                else {
                    endDate.setDate(endDate.getDate() + dayIntervel);
                }
            }
        }
        if (mode === 'Day') {
            if (span === 'prevTimeSpan') {
                if (startDate.getHours() === 0) {
                    startDate.setTime(startDate.getTime() - (1000 * 60 * 60 * 24));
                }
                else {
                    startDate.setHours(0);
                }
            }
            else {
                if (endDate.getHours() === 0) {
                    endDate.setTime(endDate.getTime() + (1000 * 60 * 60 * 24));
                }
                else {
                    endDate.setHours(24);
                }
            }
        }
        if (mode === 'Hour') {
            if (span === 'prevTimeSpan') {
                if (startDate.getMinutes() === 0) {
                    startDate.setTime(startDate.getTime() - (1000 * 60 * 60));
                }
                else {
                    startDate.setMinutes(0);
                }
            }
            else {
                if (endDate.getMinutes() === 0) {
                    endDate.setTime(endDate.getTime() + (1000 * 60 * 60));
                }
                else {
                    endDate.setMinutes(60);
                }
            }
        }
        if (mode === 'Minutes') {
            if (span === 'prevTimeSpan') {
                if (startDate.getSeconds() === 0) {
                    startDate.setTime(startDate.getTime() - (1000 * 60));
                }
                else {
                    startDate.setSeconds(0);
                }
            }
            else {
                if (endDate.getSeconds() === 0) {
                    endDate.setTime(endDate.getTime() + (1000 * 60));
                }
                else {
                    endDate.setSeconds(60);
                }
            }
        }
        this.parent.cloneProjectStartDate = startDate;
        this.parent.cloneProjectEndDate = endDate;
    };
    /**
     * To validate project start date and end date.
     * @return {void}
     * @private
     */
    Timeline.prototype.updateTimeLineOnEditing = function (tempArray, action) {
        var minStartDate = new Date(DataUtil.aggregates.min(tempArray, this.parent.taskFields.startDate));
        var maxEndDate = new Date(DataUtil.aggregates.max(tempArray, this.parent.taskFields.endDate));
        var validStartDate = new Date(this.parent.dataOperation.checkStartDate(this.timelineStartDate).getTime());
        var validEndDate = new Date(this.parent.dataOperation.checkEndDate(this.timelineEndDate).getTime());
        var maxStartLeft = this.parent.dataOperation.getTaskLeft(minStartDate, false);
        var maxEndLeft = this.parent.dataOperation.getTaskLeft(maxEndDate, false);
        var validStartLeft = this.parent.dataOperation.getTaskLeft(validStartDate, false);
        var validEndLeft = this.parent.dataOperation.getTaskLeft(validEndDate, false);
        var isChanged;
        if (maxStartLeft <= this.bottomTierCellWidth || maxStartLeft <= validStartLeft) {
            isChanged = 'prevTimeSpan';
            minStartDate = minStartDate > this.timelineStartDate ? this.timelineStartDate : minStartDate;
        }
        else {
            minStartDate = this.timelineStartDate;
        }
        if (maxEndLeft >= (this.totalTimelineWidth - this.bottomTierCellWidth) ||
            maxEndLeft >= validEndLeft) {
            isChanged = isChanged === 'prevTimeSpan' ? 'both' : 'nextTimeSpan';
            maxEndDate = maxEndDate < this.timelineEndDate ? this.timelineEndDate : maxEndDate;
        }
        else {
            maxEndDate = this.timelineEndDate;
        }
        if (isChanged) {
            this.performTimeSpanAction(isChanged, action, minStartDate, maxEndDate);
        }
    };
    /**
     * To validate project start date and end date on editing action
     * @return {void}
     * @private
     */
    Timeline.prototype.performTimeSpanAction = function (type, isFrom, startDate, endDate, mode) {
        mode = !isNullOrUndefined(mode) ? mode : this.parent.timelineModule.topTier === 'None' ?
            this.parent.timelineModule.bottomTier : this.parent.timelineModule.topTier;
        var projectStartDate = new Date(this.parent.cloneProjectStartDate.getTime());
        var projectEndDate = new Date(this.parent.cloneProjectEndDate.getTime());
        if (isFrom !== 'publicMethod' && type === 'both') {
            this.updateScheduleDatesByToolBar(mode, 'prevTimeSpan', startDate, endDate);
            this.updateScheduleDatesByToolBar(mode, 'nextTimeSpan', new Date(this.parent.cloneProjectStartDate.getTime()), endDate);
        }
        else {
            this.updateScheduleDatesByToolBar(mode, type, startDate, endDate);
        }
        var args = this.timeSpanActionEvent('actionBegin', type, isFrom);
        if (!args.cancel) {
            this.parent.updateProjectDates(args.projectStartDate, args.ProjectEndDate, args.isTimelineRoundOff);
            if (type === 'prevTimeSpan' && isFrom === 'publicMethod') {
                this.parent.ganttChartModule.updateScrollLeft(0);
            }
            else if (type === 'nextTimeSpan' && isFrom === 'publicMethod') {
                this.parent.ganttChartModule.updateScrollLeft(this.parent.timelineModule.totalTimelineWidth);
            }
            this.parent.timelineModule.timeSpanActionEvent('actionComplete', type, isFrom);
        }
        else {
            this.parent.cloneProjectStartDate = projectStartDate;
            this.parent.cloneProjectEndDate = projectEndDate;
        }
    };
    /**
     * To validate project start date and end date.
     * @return {void}
     * @private
     */
    Timeline.prototype.timeSpanActionEvent = function (eventType, requestType, isFrom) {
        var args = {};
        args.projectStartDate = new Date(this.parent.cloneProjectStartDate.getTime());
        args.ProjectEndDate = new Date(this.parent.cloneProjectEndDate.getTime());
        args.requestType = isFrom === 'publicMethod' ? requestType : isFrom === 'beforeAdd' ?
            'TimelineRefreshOnAdd' : isFrom === 'TaskbarEditing' ? 'TimelineRefreshOnEdit' : requestType;
        if (eventType === 'actionBegin') {
            args.isTimelineRoundOff = this.parent.isTimelineRoundOff;
            args.cancel = false;
        }
        this.parent.trigger(eventType, args);
        return args;
    };
    return Timeline;
}());

/**
 * Configures column collection in Gantt
 */
var Column = /** @__PURE__ @class */ (function () {
    function Column(options) {
        /**
         * If `allowEditing` set to false, then it disables editing of a particular column.
         * By default all columns are editable.
         * @default true
         */
        this.allowEditing = true;
        /**
         * If `allowReordering` set to false, then it disables reorder of a particular column.
         * By default all columns can be reorder.
         * @default true
         */
        this.allowReordering = true;
        /**
         * If `allowResizing` is set to false, it disables resize option of a particular column.
         * By default all the columns can be resized.
         * @default true
         */
        this.allowResizing = true;
        /**
         * If `allowSorting` set to false, then it disables sorting option of a particular column.
         * By default all columns are sortable.
         * @default true
         */
        this.allowSorting = true;
        /**
         * If `allowFiltering` set to false, then it disables filtering option and filter bar element of a particular column.
         * By default all columns are filterable.
         * @default true
         */
        this.allowFiltering = true;
        /**
         * Defines the `IEditCell` object to customize default edit cell.
         * @default {}
         */
        this.edit = {};
        merge(this, options);
    }
    return Column;
}());

/**
 * TreeGrid related code goes here
 */
var GanttTreeGrid = /** @__PURE__ @class */ (function () {
    function GanttTreeGrid(parent) {
        var _this = this;
        this.previousScroll = { top: 0, left: 0 };
        this.queryCellInfo = function (args) {
            _this.parent.trigger('queryCellInfo', args);
        };
        this.headerCellInfo = function (args) {
            _this.parent.trigger('headerCellInfo', args);
        };
        this.rowDataBound = function (args) {
            _this.parent.trigger('rowDataBound', args);
        };
        this.columnMenuOpen = function (args) {
            _this.parent.notify('columnMenuOpen', args);
            _this.parent.trigger('columnMenuOpen', args);
        };
        this.columnMenuClick = function (args) {
            _this.parent.trigger('columnMenuClick', args);
        };
        this.parent = parent;
        this.parent.treeGrid = new TreeGrid();
        this.parent.treeGrid.allowSelection = false;
        this.treeGridColumns = [];
        this.validateGanttColumns();
        this.addEventListener();
    }
    GanttTreeGrid.prototype.addEventListener = function () {
        this.parent.on('renderPanels', this.createContainer, this);
        this.parent.on('chartScroll', this.updateScrollTop, this);
        this.parent.on('destroy', this.destroy, this);
    };
    GanttTreeGrid.prototype.createContainer = function () {
        //let height: number = this.parent.ganttHeight - this.parent.toolbarModule.element.offsetHeight - 46;
        this.treeGridElement = createElement('div', {
            id: 'treeGrid' + this.parent.element.id, className: 'e-gantt-tree-grid',
        });
        var tempHeader = createElement('div', { className: 'e-gantt-temp-header' });
        this.parent.treeGridPane.appendChild(this.treeGridElement);
        this.treeGridElement.appendChild(tempHeader);
        this.parent.treeGridPane.classList.add('e-temp-content');
    };
    /**
     * Method to initiate TreeGrid
     */
    GanttTreeGrid.prototype.renderTreeGrid = function () {
        this.composeProperties();
        this.bindEvents();
        this.parent.treeGrid.appendTo(this.treeGridElement);
        this.wireEvents();
    };
    GanttTreeGrid.prototype.composeProperties = function () {
        this.parent.treeGrid.showColumnMenu = this.parent.showColumnMenu;
        this.parent.treeGrid.childMapping = this.parent.taskFields.child;
        this.parent.treeGrid.treeColumnIndex = this.parent.treeColumnIndex;
        this.parent.treeGrid.columns = this.treeGridColumns;
        this.parent.treeGrid.dataSource = this.parent.flatData;
        this.parent.treeGrid.rowHeight = this.parent.rowHeight;
        this.parent.treeGrid.gridLines = this.parent.gridLines;
        this.parent.treeGrid.searchSettings = this.parent.searchSettings;
        var toolbarHeight = 0;
        if (!isNullOrUndefined(this.parent.toolbarModule) && !isNullOrUndefined(this.parent.toolbarModule.element)) {
            toolbarHeight = this.parent.toolbarModule.element.offsetHeight;
        }
        this.parent.treeGrid.height = this.parent.ganttHeight - toolbarHeight - 46;
    };
    GanttTreeGrid.prototype.getContentDiv = function () {
        return this.treeGridElement.querySelector('.e-content');
    };
    GanttTreeGrid.prototype.ensureScrollBar = function () {
        var content = this.getContentDiv();
        //let isScroll: boolean = content.scrollHeight > content.offsetHeight;
        //if (isScroll) {
        content.classList.add('e-gantt-scroll-padding');
        //} else {
        // content.classList.remove('e-gantt-scroll-padding');
        //}
    };
    GanttTreeGrid.prototype.bindEvents = function () {
        this.parent.treeGrid.dataBound = this.dataBound.bind(this);
        this.parent.treeGrid.collapsing = this.collapsing.bind(this);
        this.parent.treeGrid.collapsed = this.collapsed.bind(this);
        this.parent.treeGrid.expanding = this.expanding.bind(this);
        this.parent.treeGrid.expanded = this.expanded.bind(this);
        this.parent.treeGrid.actionBegin = this.actionBegin.bind(this);
        this.parent.treeGrid.actionComplete = this.treeActionComplete.bind(this);
        this.parent.treeGrid.created = this.created.bind(this);
        this.parent.treeGrid.actionFailure = this.actionFailure.bind(this);
        this.parent.treeGrid.queryCellInfo = this.queryCellInfo.bind(this);
        this.parent.treeGrid.headerCellInfo = this.headerCellInfo.bind(this);
        this.parent.treeGrid.rowDataBound = this.rowDataBound.bind(this);
        this.parent.treeGrid.grid.columnMenuOpen = this.columnMenuOpen.bind(this);
        this.parent.treeGrid.grid.columnMenuClick = this.columnMenuClick.bind(this);
    };
    GanttTreeGrid.prototype.dataBound = function (args) {
        this.ensureScrollBar();
        this.parent.treeDataBound(args);
    };
    GanttTreeGrid.prototype.collapsing = function (args) {
        // Collapsing event
    };
    GanttTreeGrid.prototype.expanding = function (args) {
        // Collapsing event
    };
    GanttTreeGrid.prototype.collapsed = function (args) {
        if (!this.parent.ganttChartModule.isExpandCollapseFromChart) {
            var collapsingArgs = this.createExpandCollapseArgs(args);
            this.parent.ganttChartModule.collapseGanttRow(collapsingArgs);
        }
    };
    GanttTreeGrid.prototype.expanded = function (args) {
        if (!this.parent.ganttChartModule.isExpandCollapseFromChart) {
            var expandingArgs = this.createExpandCollapseArgs(args);
            this.parent.ganttChartModule.expandGanttRow(expandingArgs);
        }
    };
    GanttTreeGrid.prototype.actionBegin = function (args) {
        this.parent.notify('actionBegin', args);
        this.parent.trigger('actionBegin', args);
    };
    GanttTreeGrid.prototype.created = function (args) {
        this.updateKeyConfigSettings();
    };
    GanttTreeGrid.prototype.actionFailure = function (args) {
        this.parent.trigger('actionFailure', args);
    };
    GanttTreeGrid.prototype.createExpandCollapseArgs = function (args) {
        var record = getValue('data', args);
        var gridRow = getValue('row', args);
        var chartRow = this.parent.ganttChartModule.getChartRows()[this.parent.currentViewData.indexOf(record)];
        var eventArgs = { data: record, gridRow: gridRow, chartRow: chartRow, cancel: false };
        return eventArgs;
    };
    GanttTreeGrid.prototype.treeActionComplete = function (args) {
        var updatedArgs = extend({}, args, true);
        if (getValue('requestType', args) === 'sorting') {
            this.parent.notify('updateModel', {});
            deleteObject(updatedArgs, 'isFrozen');
        }
        else if (getValue('requestType', args) === 'filtering') {
            this.parent.notify('updateModel', {});
        }
        else if (getValue('type', args) === 'save') {
            if (this.parent.editModule && this.parent.editModule.cellEditModule) {
                this.parent.editModule.cellEditModule.initiateCellEdit(args, this.currentEditRow);
                this.currentEditRow = {};
            }
        }
        if (getValue('requestType', args) === 'filterafteropen') {
            this.parent.notify('actionComplete', args);
        }
        if (getValue('requestType', args) === 'searching') {
            this.parent.notify('actionComplete', args);
        }
        this.parent.trigger('actionComplete', updatedArgs);
    };
    GanttTreeGrid.prototype.updateKeyConfigSettings = function () {
        delete this.parent.treeGrid.grid.keyboardModule.keyConfigs.delete;
    };
    /**
     * Method to bind internal events on TreeGrid element
     */
    GanttTreeGrid.prototype.wireEvents = function () {
        var content = this.parent.treeGrid.element.querySelector('.e-content');
        if (content) {
            EventHandler.add(content, 'scroll', this.scrollHandler, this);
        }
    };
    GanttTreeGrid.prototype.unWireEvents = function () {
        var content = this.parent.treeGrid.element &&
            this.parent.treeGrid.element.querySelector('.e-content');
        if (content) {
            EventHandler.remove(content, 'scroll', this.scrollHandler);
        }
    };
    GanttTreeGrid.prototype.scrollHandler = function (e) {
        var content = this.parent.treeGrid.element.querySelector('.e-content');
        if (content.scrollTop !== this.previousScroll.top) {
            this.parent.notify('grid-scroll', { top: content.scrollTop });
        }
        this.previousScroll.top = content.scrollTop;
    };
    GanttTreeGrid.prototype.validateGanttColumns = function () {
        var ganttObj = this.parent;
        var length = ganttObj.columns.length;
        var tasks = this.parent.taskFields;
        this.parent.columnMapping = {};
        this.parent.columnByField = {};
        this.parent.customColumns = [];
        var tasksMapping = ['id', 'name', 'startDate', 'endDate', 'duration', 'dependency',
            'progress', 'baselineStartDate', 'baselineEndDate', 'resourceInfo', 'notes'];
        var _loop_1 = function (i) {
            var column = {};
            if (typeof ganttObj.columns[i] === 'string') {
                column.field = ganttObj.columns[i];
            }
            else {
                column = ganttObj.columns[i];
            }
            var columnName = [];
            if (tasksMapping.length > 0) {
                columnName = tasksMapping.filter(function (name) {
                    return column.field === tasks[name];
                });
            }
            if (columnName.length === 0) {
                this_1.parent.customColumns.push(column.field);
                column.headerText = column.headerText ? column.headerText : column.field;
                column.width = column.width ? column.width : 150;
                column.editType = column.editType ? column.editType : 'stringedit';
                column.type = column.type ? column.type : 'string';
                this_1.bindTreeGridColumnProperties(column, true);
                return "continue";
            }
            else {
                var index = tasksMapping.indexOf(columnName[0]);
                tasksMapping.splice(index, 1);
                this_1.createTreeGridColumn(column, true);
                this_1.parent.columnMapping[columnName[0]] = column.field;
            }
        };
        var this_1 = this;
        for (var i = 0; i < length; i++) {
            _loop_1(i);
        }
        /** Create default columns with task settings property */
        for (var j = 0; j < tasksMapping.length; j++) {
            var column = {};
            if (!isNullOrUndefined(tasks[tasksMapping[j]])) {
                column.field = tasks[tasksMapping[j]];
                this.createTreeGridColumn(column, length === 0);
                this.parent.columnMapping[tasksMapping[j]] = column.field;
            }
        }
    };
    /**
     *
     * @param column
     * @param isDefined
     */
    GanttTreeGrid.prototype.createTreeGridColumn = function (column, isDefined) {
        var taskSettings = this.parent.taskFields;
        if (taskSettings.id !== column.field) {
            column.clipMode = column.clipMode ? column.clipMode : 'EllipsisWithTooltip';
        }
        if (taskSettings.id === column.field) {
            /** Id column */
            this.composeIDColumn(column);
        }
        else if (taskSettings.name === column.field) {
            /** Name column */
            column.headerText = column.headerText ? column.headerText : this.parent.localeObj.getConstant('name');
            column.width = column.width ? column.width : 150;
            column.editType = column.editType ? column.editType : 'stringedit';
            column.type = column.type ? column.type : 'string';
        }
        else if (taskSettings.startDate === column.field) {
            /** Name column */
            column.headerText = column.headerText ? column.headerText : this.parent.localeObj.getConstant('startDate');
            column.format = column.format ? column.format : { type: 'date', format: this.parent.dateFormat };
            column.editType = column.editType ? column.editType :
                this.parent.dateFormat.toLowerCase().indexOf('hh') !== -1 ? 'datetimepickeredit' : 'datepickeredit';
            column.width = column.width ? column.width : 150;
            this.initiateFiltering(column);
        }
        else if (taskSettings.endDate === column.field) {
            column.headerText = column.headerText ? column.headerText : this.parent.localeObj.getConstant('endDate');
            column.format = column.format ? column.format : { type: 'date', format: this.parent.dateFormat };
            column.editType = column.editType ? column.editType :
                this.parent.dateFormat.toLowerCase().indexOf('hh') !== -1 ? 'datetimepickeredit' : 'datepickeredit';
            this.initiateFiltering(column);
            column.width = column.width ? column.width : 150;
        }
        else if (taskSettings.duration === column.field) {
            column.width = column.width ? column.width : 150;
            column.headerText = column.headerText ? column.headerText : this.parent.localeObj.getConstant('duration');
            column.valueAccessor = column.valueAccessor ? column.valueAccessor : this.durationValueAccessor.bind(this);
            column.editType = column.editType ? column.editType : 'stringedit';
            column.type = 'string';
            this.initiateFiltering(column);
        }
        else if (taskSettings.progress === column.field) {
            this.composeProgressColumn(column);
        }
        else if (taskSettings.dependency === column.field) {
            column.headerText = column.headerText ? column.headerText : this.parent.localeObj.getConstant('dependency');
            column.width = column.width ? column.width : 150;
            column.editType = column.editType ? column.editType : 'stringedit';
            column.type = 'string';
            column.allowFiltering = column.allowFiltering === false ? false : true;
        }
        else if (taskSettings.resourceInfo === column.field) {
            this.composeResourceColumn(column);
        }
        else if (taskSettings.notes === column.field) {
            column.headerText = column.headerText ? column.headerText : this.parent.localeObj.getConstant('resourceID');
            column.width = column.width ? column.width : 150;
            column.editType = column.editType ? column.editType : 'stringedit';
            if (!this.parent.showInlineNotes) {
                if (!column.template) {
                    column.template = '<div class="e-ganttnotes-info">' +
                        '<span class="e-icons e-notes-info"></span></div>';
                }
            }
            else {
                column.disableHtmlEncode = true;
            }
        }
        else if (taskSettings.baselineStartDate === column.field) {
            column.width = column.width ? column.width : 150;
            column.headerText = column.headerText ? column.headerText : this.parent.localeObj.getConstant('baselineStartDate');
            column.format = column.format ? column.format : { type: 'date', format: this.parent.dateFormat };
            column.editType = column.editType ? column.editType :
                this.parent.dateFormat.toLowerCase().indexOf('hh') !== -1 ? 'datetimepickeredit' : 'datepickeredit';
            this.initiateFiltering(column);
        }
        else if (taskSettings.baselineEndDate === column.field) {
            column.headerText = column.headerText ? column.headerText : this.parent.localeObj.getConstant('baselineEndDate');
            column.width = column.width ? column.width : 150;
            column.format = column.format ? column.format : { type: 'date', format: this.parent.dateFormat };
            column.editType = column.editType ? column.editType :
                this.parent.dateFormat.toLowerCase().indexOf('hh') !== -1 ? 'datetimepickeredit' : 'datepickeredit';
            this.initiateFiltering(column);
        }
        this.bindTreeGridColumnProperties(column, isDefined);
    };
    /**
     * Compose Resource columns
     * @param column
     */
    GanttTreeGrid.prototype.composeResourceColumn = function (column) {
        column.headerText = column.headerText ? column.headerText : this.parent.localeObj.getConstant('resourceName');
        column.width = column.width ? column.width : 150;
        column.type = 'string';
        column.valueAccessor = column.valueAccessor ? column.valueAccessor : this.resourceValueAccessor.bind(this);
        if (this.parent.editSettings.allowEditing && isNullOrUndefined(column.edit) && this.parent.editSettings.mode === 'Auto') {
            column.editType = 'dropdownedit';
            column.edit = this.getResourceEditor();
        }
        column.allowFiltering = column.allowFiltering === false ? false : true;
    };
    GanttTreeGrid.prototype.getResourceIds = function (data) {
        return getValue(this.parent.taskFields.resourceInfo, data.taskData);
    };
    GanttTreeGrid.prototype.getResourceEditor = function () {
        var _this = this;
        var editObject = {};
        var editor;
        MultiSelect.Inject(CheckBoxSelection);
        editObject.write = function (args) {
            _this.currentEditRow = {};
            editor = new MultiSelect({
                dataSource: new DataManager(_this.parent.resources),
                fields: { text: _this.parent.resourceNameMapping, value: _this.parent.resourceIDMapping },
                mode: 'CheckBox',
                showDropDownIcon: true,
                popupHeight: '350px',
                delimiterChar: ',',
                value: _this.getResourceIds(args.rowData)
            });
            editor.appendTo(args.element);
        };
        editObject.read = function (element) {
            var value = element.ej2_instances[0].value;
            var resourcesName = [];
            if (isNullOrUndefined(value)) {
                value = [];
            }
            for (var i = 0; i < value.length; i++) {
                for (var j = 0; j < _this.parent.resources.length; j++) {
                    if (_this.parent.resources[j][_this.parent.resourceIDMapping] === value[i]) {
                        resourcesName.push(_this.parent.resources[j][_this.parent.resourceNameMapping]);
                        break;
                    }
                }
            }
            _this.currentEditRow[_this.parent.taskFields.resourceInfo] = value;
            return resourcesName.join(',');
        };
        editObject.destroy = function () {
            if (editor) {
                editor.destroy();
            }
        };
        return editObject;
    };
    /**
     * Create Id column
     * @param column
     */
    GanttTreeGrid.prototype.composeIDColumn = function (column) {
        column.isPrimaryKey = isNullOrUndefined(column.isPrimaryKey) ? true : column.isPrimaryKey;
        column.headerText = column.headerText ? column.headerText : this.parent.localeObj.getConstant('id');
        column.width = column.width ? column.width : 100;
        column.allowEditing = false;
        column.editType = column.editType ? column.editType : 'numericedit';
        var editParam = {
            min: 0,
            decimals: 0,
            validateDecimalOnType: true,
            format: 'n0',
            showSpinButton: false
        };
        if (isNullOrUndefined(column.edit)) {
            column.edit = {};
            column.edit.params = {};
        }
        else if (isNullOrUndefined(column.edit.params)) {
            column.edit.params = {};
        }
        extend(column.edit.params, editParam);
    };
    /**
     * Create progress column
     * @param column
     */
    GanttTreeGrid.prototype.composeProgressColumn = function (column) {
        column.headerText = column.headerText ? column.headerText : this.parent.localeObj.getConstant('progress');
        column.width = column.width ? column.width : 150;
        column.editType = column.editType ? column.editType : 'numericedit';
        var editParam = {
            min: 0,
            max: 100,
            decimals: 0,
            validateDecimalOnType: true,
            format: 'n0'
        };
        if (isNullOrUndefined(column.edit)) {
            column.edit = {};
            column.edit.params = {};
        }
        else if (isNullOrUndefined(column.edit.params)) {
            column.edit.params = {};
        }
        extend(column.edit.params, editParam);
    };
    GanttTreeGrid.prototype.initiateFiltering = function (column) {
        column.allowFiltering = column.allowFiltering === false ? false : true;
        column.filter = column.filter ? column.filter : null;
        if (column.allowFiltering && this.parent.filterSettings.type === 'Menu' && !column.filter) {
            column.filter = { ui: this.getCustomFilterUi(column) };
        }
    };
    /**
     * To get filter menu UI
     * @param column
     */
    GanttTreeGrid.prototype.getCustomFilterUi = function (column) {
        var settings = this.parent.taskFields;
        var filterUI = {};
        if (column.editType === 'datepickeredit' && (column.field === settings.startDate || column.field === settings.endDate
            || column.field === settings.baselineStartDate || column.field === settings.baselineEndDate)) {
            filterUI = this.getDatePickerFilter(column.field);
        }
        else if (column.editType === 'datetimepickeredit' && (column.field === settings.startDate || column.field === settings.endDate
            || column.field === settings.baselineStartDate || column.field === settings.baselineEndDate)) {
            filterUI = this.getDateTimePickerFilter();
        }
        else if (column.field === settings.duration && column.editType === 'stringedit') {
            filterUI = this.getDurationFilter();
        }
        return filterUI;
    };
    GanttTreeGrid.prototype.getDatePickerFilter = function (columnName) {
        var _this = this;
        var parent = this.parent;
        var timeValue = (columnName === parent.taskFields.startDate) || (columnName === parent.taskFields.baselineStartDate)
            ? parent.defaultStartTime : parent.defaultEndTime;
        var dropDateInstance;
        var filterDateUI = {
            create: function (args) {
                var flValInput = createElement('input', { className: 'flm-input' });
                args.target.appendChild(flValInput);
                dropDateInstance = new DatePicker({ placeholder: _this.parent.localeObj.getConstant('enterValue') });
                dropDateInstance.appendTo(flValInput);
            },
            write: function (args) {
                dropDateInstance.value = args.filteredValue;
            },
            read: function (args) {
                if (dropDateInstance.value) {
                    dropDateInstance.value.setSeconds(timeValue);
                }
                args.fltrObj.filterByColumn(args.column.field, args.operator, dropDateInstance.value);
            }
        };
        return filterDateUI;
    };
    GanttTreeGrid.prototype.getDateTimePickerFilter = function () {
        var _this = this;
        var dropInstance;
        var filterDateTimeUI = {
            create: function (args) {
                var flValInput = createElement('input', { className: 'flm-input' });
                args.target.appendChild(flValInput);
                dropInstance = new DateTimePicker({ placeholder: _this.parent.localeObj.getConstant('enterValue') });
                dropInstance.appendTo(flValInput);
            },
            write: function (args) {
                dropInstance.value = args.filteredValue;
            },
            read: function (args) {
                args.fltrObj.filterByColumn(args.column.field, args.operator, dropInstance.value);
            }
        };
        return filterDateTimeUI;
    };
    GanttTreeGrid.prototype.getDurationFilter = function () {
        var _this = this;
        var parent = this.parent;
        var textBoxInstance;
        var textValue = '';
        var filterDurationUI = {
            create: function (args) {
                var flValInput = createElement('input', { className: 'e-input' });
                flValInput.setAttribute('placeholder', _this.parent.localeObj.getConstant('enterValue'));
                args.target.appendChild(flValInput);
                textBoxInstance = new TextBox();
                textBoxInstance.appendTo(flValInput);
            },
            write: function (args) {
                textBoxInstance.value = args.filteredValue ? textValue : '';
            },
            read: function (args) {
                var durationObj = _this.parent.dataOperation.getDurationValue(textBoxInstance.value);
                var intVal = getValue('duration', durationObj);
                var unit = getValue('durationUnit', durationObj);
                if (intVal >= 0) {
                    var dayVal = void 0;
                    if (unit === 'minute') {
                        dayVal = (intVal * 60) / parent.secondsPerDay;
                    }
                    else if (unit === 'hour') {
                        dayVal = (intVal * 60 * 60) / parent.secondsPerDay;
                    }
                    else {
                        //Consider it as day unit
                        dayVal = intVal;
                        unit = 'day';
                    }
                    args.fltrObj.filterByColumn(args.column.field, args.operator, dayVal);
                    textValue = _this.parent.dataOperation.getDurationString(intVal, unit);
                }
                else {
                    args.fltrObj.filterByColumn(args.column.field, args.operator, null);
                    textValue = null;
                }
            }
        };
        return filterDurationUI;
    };
    /**
     *
     */
    GanttTreeGrid.prototype.bindTreeGridColumnProperties = function (newGanttColumn, isDefined) {
        var treeGridColumn = {};
        var ganttColumn = {};
        for (var _i = 0, _a = Object.keys(newGanttColumn); _i < _a.length; _i++) {
            var prop = _a[_i];
            treeGridColumn[prop] = ganttColumn[prop] = newGanttColumn[prop];
        }
        this.parent.columnByField[ganttColumn.field] = ganttColumn;
        this.parent.ganttColumns.push(new Column(ganttColumn));
        if (isDefined) {
            this.treeGridColumns.push(treeGridColumn);
        }
    };
    GanttTreeGrid.prototype.durationValueAccessor = function (field, data, column) {
        var ganttProp = data.ganttProperties;
        if (!isNullOrUndefined(ganttProp)) {
            return this.parent.dataOperation.getDurationString(ganttProp.duration, ganttProp.durationUnit);
        }
        return '';
    };
    GanttTreeGrid.prototype.resourceValueAccessor = function (field, data, column) {
        var ganttProp = data.ganttProperties;
        if (!isNullOrUndefined(ganttProp)) {
            return ganttProp.resourceNames;
        }
        return '';
    };
    GanttTreeGrid.prototype.updateScrollTop = function (args) {
        this.treeGridElement.querySelector('.e-content').scrollTop = getValue('top', args);
        this.previousScroll.top = this.treeGridElement.querySelector('.e-content').scrollTop;
    };
    GanttTreeGrid.prototype.removeEventListener = function () {
        this.parent.off('renderPanels', this.createContainer);
        this.parent.off('chartScroll', this.updateScrollTop);
        this.parent.off('destroy', this.destroy);
    };
    GanttTreeGrid.prototype.destroy = function () {
        this.removeEventListener();
        this.unWireEvents();
        if (this.parent.treeGrid.element) {
            this.parent.treeGrid.destroy();
        }
    };
    return GanttTreeGrid;
}());

/**
 * Defines working time of day in project
 */
var __extends$2 = (undefined && undefined.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate$1 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var DayWorkingTime = /** @__PURE__ @class */ (function (_super) {
    __extends$2(DayWorkingTime, _super);
    function DayWorkingTime() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    __decorate$1([
        Property(null)
    ], DayWorkingTime.prototype, "from", void 0);
    __decorate$1([
        Property(null)
    ], DayWorkingTime.prototype, "to", void 0);
    return DayWorkingTime;
}(ChildProperty));

var __extends$3 = (undefined && undefined.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate$2 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
/**
 * Defines dialog fields of add dialog and edit dialog
 */
var AddDialogFieldSettings = /** @__PURE__ @class */ (function (_super) {
    __extends$3(AddDialogFieldSettings, _super);
    function AddDialogFieldSettings() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    __decorate$2([
        Property(null)
    ], AddDialogFieldSettings.prototype, "type", void 0);
    __decorate$2([
        Property(null)
    ], AddDialogFieldSettings.prototype, "headerText", void 0);
    __decorate$2([
        Property([])
    ], AddDialogFieldSettings.prototype, "fields", void 0);
    return AddDialogFieldSettings;
}(ChildProperty));

var __extends$4 = (undefined && undefined.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate$3 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
/**
 * Defines dialog fields of add dialog and edit dialog
 */
var EditDialogFieldSettings = /** @__PURE__ @class */ (function (_super) {
    __extends$4(EditDialogFieldSettings, _super);
    function EditDialogFieldSettings() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    __decorate$3([
        Property(null)
    ], EditDialogFieldSettings.prototype, "type", void 0);
    __decorate$3([
        Property(null)
    ], EditDialogFieldSettings.prototype, "headerText", void 0);
    __decorate$3([
        Property([])
    ], EditDialogFieldSettings.prototype, "fields", void 0);
    return EditDialogFieldSettings;
}(ChildProperty));

var __extends$5 = (undefined && undefined.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate$4 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
/**
 * Configures edit settings of Gantt
 */
var EditSettings = /** @__PURE__ @class */ (function (_super) {
    __extends$5(EditSettings, _super);
    function EditSettings() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    __decorate$4([
        Property(false)
    ], EditSettings.prototype, "allowEditing", void 0);
    __decorate$4([
        Property(false)
    ], EditSettings.prototype, "allowAdding", void 0);
    __decorate$4([
        Property(false)
    ], EditSettings.prototype, "allowDeleting", void 0);
    __decorate$4([
        Property('Auto')
    ], EditSettings.prototype, "mode", void 0);
    __decorate$4([
        Property('Top')
    ], EditSettings.prototype, "newRowPosition", void 0);
    __decorate$4([
        Property(false)
    ], EditSettings.prototype, "showDeleteConfirmDialog", void 0);
    __decorate$4([
        Property(false)
    ], EditSettings.prototype, "allowTaskbarEditing", void 0);
    return EditSettings;
}(ChildProperty));

var __extends$6 = (undefined && undefined.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate$5 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
/**
 * Defines event marker collection in Gantt
 */
var EventMarker = /** @__PURE__ @class */ (function (_super) {
    __extends$6(EventMarker, _super);
    function EventMarker() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    __decorate$5([
        Property(null)
    ], EventMarker.prototype, "day", void 0);
    __decorate$5([
        Property(null)
    ], EventMarker.prototype, "label", void 0);
    __decorate$5([
        Property(null)
    ], EventMarker.prototype, "cssClass", void 0);
    return EventMarker;
}(ChildProperty));

var __extends$7 = (undefined && undefined.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate$6 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
/**
 * Configures the filtering behavior of the Gantt.
 */
var FilterSettings = /** @__PURE__ @class */ (function (_super) {
    __extends$7(FilterSettings, _super);
    function FilterSettings() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    __decorate$6([
        Collection([], Predicate)
    ], FilterSettings.prototype, "columns", void 0);
    __decorate$6([
        Property('Menu')
    ], FilterSettings.prototype, "type", void 0);
    __decorate$6([
        Property()
    ], FilterSettings.prototype, "operators", void 0);
    __decorate$6([
        Property(false)
    ], FilterSettings.prototype, "ignoreAccent", void 0);
    __decorate$6([
        Property('Parent')
    ], FilterSettings.prototype, "hierarchyMode", void 0);
    return FilterSettings;
}(ChildProperty));

var __extends$8 = (undefined && undefined.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate$7 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
/**
 * Configures the filtering behavior of the Grid.
 */
var SearchSettings = /** @__PURE__ @class */ (function (_super) {
    __extends$8(SearchSettings, _super);
    function SearchSettings() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    __decorate$7([
        Property([])
    ], SearchSettings.prototype, "fields", void 0);
    __decorate$7([
        Property(false)
    ], SearchSettings.prototype, "ignoreCase", void 0);
    __decorate$7([
        Property('contains')
    ], SearchSettings.prototype, "operator", void 0);
    __decorate$7([
        Property('')
    ], SearchSettings.prototype, "key", void 0);
    __decorate$7([
        Property('Parent')
    ], SearchSettings.prototype, "hierarchyMode", void 0);
    return SearchSettings;
}(ChildProperty));

var __extends$9 = (undefined && undefined.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate$8 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
/**
 * Defines holidays of project
 */
var Holiday = /** @__PURE__ @class */ (function (_super) {
    __extends$9(Holiday, _super);
    function Holiday() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    __decorate$8([
        Property(null)
    ], Holiday.prototype, "from", void 0);
    __decorate$8([
        Property(null)
    ], Holiday.prototype, "to", void 0);
    __decorate$8([
        Property(null)
    ], Holiday.prototype, "label", void 0);
    __decorate$8([
        Property(null)
    ], Holiday.prototype, "cssClass", void 0);
    return Holiday;
}(ChildProperty));

var __extends$10 = (undefined && undefined.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate$9 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
/**
 * Defines labels for task, this will be placed right, left and inner side of taskbar.
 */
var LabelSettings = /** @__PURE__ @class */ (function (_super) {
    __extends$10(LabelSettings, _super);
    function LabelSettings() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    __decorate$9([
        Property(null)
    ], LabelSettings.prototype, "rightLabel", void 0);
    __decorate$9([
        Property(null)
    ], LabelSettings.prototype, "leftLabel", void 0);
    __decorate$9([
        Property(null)
    ], LabelSettings.prototype, "taskLabel", void 0);
    return LabelSettings;
}(ChildProperty));

var __extends$11 = (undefined && undefined.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate$10 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
/**
 * Configures the selection behavior of the Gantt.
 */
var SelectionSettings = /** @__PURE__ @class */ (function (_super) {
    __extends$11(SelectionSettings, _super);
    function SelectionSettings() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    __decorate$10([
        Property('Row')
    ], SelectionSettings.prototype, "mode", void 0);
    __decorate$10([
        Property('Flow')
    ], SelectionSettings.prototype, "cellSelectionMode", void 0);
    __decorate$10([
        Property('Single')
    ], SelectionSettings.prototype, "type", void 0);
    __decorate$10([
        Property(false)
    ], SelectionSettings.prototype, "persistSelection", void 0);
    return SelectionSettings;
}(ChildProperty));

var __extends$12 = (undefined && undefined.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate$11 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
/**
 * Configures splitter position and splitter bar
 */
var SplitterSettings = /** @__PURE__ @class */ (function (_super) {
    __extends$12(SplitterSettings, _super);
    function SplitterSettings() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    __decorate$11([
        Property(null)
    ], SplitterSettings.prototype, "position", void 0);
    __decorate$11([
        Property(-1)
    ], SplitterSettings.prototype, "columnIndex", void 0);
    __decorate$11([
        Property(4)
    ], SplitterSettings.prototype, "separatorSize", void 0);
    __decorate$11([
        Property(null)
    ], SplitterSettings.prototype, "minimum", void 0);
    __decorate$11([
        Property('Default')
    ], SplitterSettings.prototype, "view", void 0);
    return SplitterSettings;
}(ChildProperty));

/**
 * Defines mapping property to get task details from data source
 */
var __extends$13 = (undefined && undefined.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate$12 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var TaskFields = /** @__PURE__ @class */ (function (_super) {
    __extends$13(TaskFields, _super);
    function TaskFields() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    __decorate$12([
        Property(null)
    ], TaskFields.prototype, "id", void 0);
    __decorate$12([
        Property(null)
    ], TaskFields.prototype, "name", void 0);
    __decorate$12([
        Property(null)
    ], TaskFields.prototype, "parentId", void 0);
    __decorate$12([
        Property(null)
    ], TaskFields.prototype, "startDate", void 0);
    __decorate$12([
        Property(null)
    ], TaskFields.prototype, "endDate", void 0);
    __decorate$12([
        Property(null)
    ], TaskFields.prototype, "dependency", void 0);
    __decorate$12([
        Property(null)
    ], TaskFields.prototype, "progress", void 0);
    __decorate$12([
        Property(null)
    ], TaskFields.prototype, "child", void 0);
    __decorate$12([
        Property(null)
    ], TaskFields.prototype, "milestone", void 0);
    __decorate$12([
        Property(null)
    ], TaskFields.prototype, "duration", void 0);
    __decorate$12([
        Property(null)
    ], TaskFields.prototype, "durationUnit", void 0);
    __decorate$12([
        Property(null)
    ], TaskFields.prototype, "cssClass", void 0);
    __decorate$12([
        Property(null)
    ], TaskFields.prototype, "baselineStartDate", void 0);
    __decorate$12([
        Property(null)
    ], TaskFields.prototype, "baselineEndDate", void 0);
    __decorate$12([
        Property(null)
    ], TaskFields.prototype, "resourceInfo", void 0);
    __decorate$12([
        Property(null)
    ], TaskFields.prototype, "expandState", void 0);
    __decorate$12([
        Property(null)
    ], TaskFields.prototype, "indicators", void 0);
    __decorate$12([
        Property(null)
    ], TaskFields.prototype, "notes", void 0);
    return TaskFields;
}(ChildProperty));

var __extends$14 = (undefined && undefined.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate$13 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
/**
 * Configures timeline settings of Gantt
 */
var TimelineTierSettings = /** @__PURE__ @class */ (function (_super) {
    __extends$14(TimelineTierSettings, _super);
    function TimelineTierSettings() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    __decorate$13([
        Property('')
    ], TimelineTierSettings.prototype, "format", void 0);
    __decorate$13([
        Property('None')
    ], TimelineTierSettings.prototype, "unit", void 0);
    __decorate$13([
        Property(1)
    ], TimelineTierSettings.prototype, "count", void 0);
    __decorate$13([
        Property(null)
    ], TimelineTierSettings.prototype, "formatter", void 0);
    return TimelineTierSettings;
}(ChildProperty));
/**
 * Configures the timeline settings property in the Gantt
 */
var TimelineSettings = /** @__PURE__ @class */ (function (_super) {
    __extends$14(TimelineSettings, _super);
    function TimelineSettings() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    __decorate$13([
        Property('Week')
    ], TimelineSettings.prototype, "timelineViewMode", void 0);
    __decorate$13([
        Complex({}, TimelineTierSettings)
    ], TimelineSettings.prototype, "topTier", void 0);
    __decorate$13([
        Complex({}, TimelineTierSettings)
    ], TimelineSettings.prototype, "bottomTier", void 0);
    __decorate$13([
        Property(33)
    ], TimelineSettings.prototype, "timelineUnitSize", void 0);
    __decorate$13([
        Property(0)
    ], TimelineSettings.prototype, "weekStartDay", void 0);
    __decorate$13([
        Property(null)
    ], TimelineSettings.prototype, "weekendBackground", void 0);
    __decorate$13([
        Property(true)
    ], TimelineSettings.prototype, "showTooltip", void 0);
    __decorate$13([
        Property(true)
    ], TimelineSettings.prototype, "updateTimescaleView", void 0);
    return TimelineSettings;
}(ChildProperty));

var __extends$15 = (undefined && undefined.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate$14 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
/**
 * Configures tooltip settings for Gantt
 */
var TooltipSettings = /** @__PURE__ @class */ (function (_super) {
    __extends$15(TooltipSettings, _super);
    function TooltipSettings() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    __decorate$14([
        Property(true)
    ], TooltipSettings.prototype, "showTooltip", void 0);
    __decorate$14([
        Property()
    ], TooltipSettings.prototype, "taskbar", void 0);
    __decorate$14([
        Property()
    ], TooltipSettings.prototype, "baseline", void 0);
    __decorate$14([
        Property()
    ], TooltipSettings.prototype, "connectorLine", void 0);
    __decorate$14([
        Property()
    ], TooltipSettings.prototype, "editing", void 0);
    return TooltipSettings;
}(ChildProperty));

var __extends$16 = (undefined && undefined.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate$15 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
/**
 * Represents the field name and direction of sort column.
 */
var SortDescriptor = /** @__PURE__ @class */ (function (_super) {
    __extends$16(SortDescriptor, _super);
    function SortDescriptor() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    __decorate$15([
        Property()
    ], SortDescriptor.prototype, "field", void 0);
    __decorate$15([
        Property()
    ], SortDescriptor.prototype, "direction", void 0);
    return SortDescriptor;
}(ChildProperty));
/**
 * Configures the sorting behavior of Gantt
 */
var SortSettings = /** @__PURE__ @class */ (function (_super) {
    __extends$16(SortSettings, _super);
    function SortSettings() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    __decorate$15([
        Collection([], SortDescriptor)
    ], SortSettings.prototype, "columns", void 0);
    __decorate$15([
        Property(true)
    ], SortSettings.prototype, "allowUnsort", void 0);
    return SortSettings;
}(ChildProperty));

/**
 * Export all generated models for complex settings
 */

/**
 * To render the chart rows in Gantt
 */
var ChartRows = /** @__PURE__ @class */ (function () {
    function ChartRows(ganttObj) {
        this.taskBarHeight = 0;
        this.milestoneHeight = 0;
        this.milesStoneRadius = 0;
        this.baselineTop = 0;
        this.baselineHeight = 3;
        this.touchLeftConnectorpoint = '';
        this.touchRightConnectorpoint = '';
        this.parent = ganttObj;
        this.initPublicProp();
        this.addEventListener();
    }
    /**
     * To initialize the public property.
     * @return {void}
     * @private
     */
    ChartRows.prototype.initPublicProp = function () {
        this.ganttChartTableBody = null;
    };
    ChartRows.prototype.addEventListener = function () {
        this.parent.on('renderPanels', this.createChartTable, this);
        this.parent.on('dataReady', this.initiateTemplates, this);
        this.parent.on('destroy', this.destroy, this);
    };
    ChartRows.prototype.refreshChartByTimeline = function () {
        this.taskTable.style.width = formatUnit(this.parent.timelineModule.totalTimelineWidth);
        this.refreshGanttRows();
    };
    /**
     * To render chart rows.
     * @return {void}
     * @private
     */
    ChartRows.prototype.createChartTable = function () {
        this.taskTable = createElement('table', {
            className: taskTable + ' ' + zeroSpacing, id: 'GanttTaskTable' + this.parent.element.id,
            styles: 'z-index: 2;position: absolute;width:' + this.parent.timelineModule.totalTimelineWidth + 'px;',
            attrs: { cellspacing: '0.25px' }
        });
        var colgroup = createElement('colgroup');
        var column = createElement('col', { styles: 'width:' + this.parent.timelineModule.totalTimelineWidth + 'px;' });
        colgroup.appendChild(column);
        this.taskTable.appendChild(colgroup);
        this.ganttChartTableBody = createElement('tbody', {
            id: this.parent.element.id + 'GanttTaskTableBody'
        });
        this.taskTable.appendChild(this.ganttChartTableBody);
        this.parent.ganttChartModule.chartBodyContent.appendChild(this.taskTable);
    };
    ChartRows.prototype.initiateTemplates = function () {
        this.taskTable.style.width = formatUnit(this.parent.timelineModule.totalTimelineWidth);
        this.initChartHelperPrivateVariable();
        this.ganttChartTableTemplateInit();
        this.initializeChartTemplate();
    };
    /**
     * To render chart rows.
     * @return {void}
     * @private
     */
    ChartRows.prototype.renderChartRows = function () {
        this.createTaskbarTemplate();
        this.triggerQueryTaskbarInfo();
        this.parent.isGanttChartRendered = true;
    };
    /**
     * To get left task label template string.
     * @return {string}
     * @private
     */
    ChartRows.prototype.getTaskbarLeftLabelString = function (field) {
        var labelString = this.getTaskLabel(field);
        if (labelString) {
            labelString = labelString === 'isCustomTemplate' ? field : labelString;
            var templateString = '<div class="' + leftLabelInnerDiv + '"  style="height:' +
                (this.taskBarHeight) +
                'px;margin-top:' + this.taskBarMarginTop + 'px;"><span class="' + label + '">' +
                labelString + '</span></div>';
            return templateString;
        }
        return null;
    };
    /**
     * To get right task label template string.
     * @return {string}
     * @private
     */
    ChartRows.prototype.getTaskbarRightLabelString = function (field) {
        var labelString = this.getTaskLabel(field);
        if (labelString) {
            labelString = labelString === 'isCustomTemplate' ? field : labelString;
            var templateString = '<div class="' + rightLabelInnerDiv + '"  style="height:'
                + (this.taskBarHeight) + 'px;margin-top:' + this.taskBarMarginTop +
                'px;"><span class="' + label + '">' + labelString + '</span></div>';
            return templateString;
        }
        return null;
    };
    /**
     * To get gantt Indicator.
     * @return {string}
     * @private
     */
    ChartRows.prototype.getIndicatorString = function () {
        var templateString = '<label class="' + taskIndicatorDiv + '"  style="line-height:'
            + (this.parent.rowHeight) + 'px;' +
            'left:${this.chartRowsModule.getIndicatorleft(date) }px;"><i class="${iconCls}"></i> </label>';
        return templateString;
    };
    /**
     * To get gantt Indicator.
     * @return {number}
     * @private
     */
    ChartRows.prototype.getIndicatorleft = function (date) {
        date = this.parent.dateValidationModule.getDateFromFormat(date);
        var left = this.parent.dataOperation.getTaskLeft(date, false);
        return left;
    };
    /**
     * To get parent taskbar template string.
     * @return {string}
     * @private
     */
    ChartRows.prototype.getParentTaskbarTemplateString = function () {
        var labelString = this.getTaskLabel(this.parent.labelSettings.taskLabel);
        labelString = labelString === 'isCustomTemplate' ? this.parent.labelSettings.taskLabel : labelString;
        return '<div class="' + parentTaskBarInnerDiv +
            ' ${this.chartRowsModule.getExpandClass(data) } ' + traceParentTaskBar + '"' +
            ' style="width:${ganttProperties.width}px;height:' + this.taskBarHeight + 'px;">' +
            '<div class="' + parentProgressBarInnerDiv + ' ${this.chartRowsModule.getExpandClass(data) } ' +
            traceParentProgressBar + '"' +
            ' style="border-style:${if(ganttProperties.progressWidth) }solid${else}none${/if};' +
            'width:${ganttProperties.progressWidth}px;' +
            'border-top-right-radius:${this.chartRowsModule.getBorderRadius(data)}px;' +
            'border-bottom-right-radius:${this.chartRowsModule.getBorderRadius(data)}px;height:100%;"><span class="' +
            taskLabel + '" style="line-height:' +
            (this.taskBarHeight - 1) + 'px;height:' + this.taskBarHeight + 'px;">' +
            labelString + '</span></div></div>';
    };
    /**
     * To get child taskbar template string.
     * @return {string}
     * @private
     */
    ChartRows.prototype.getChildTaskbarTemplateString = function () {
        var labelString = this.getTaskLabel(this.parent.labelSettings.taskLabel);
        labelString = labelString === 'isCustomTemplate' ? this.parent.labelSettings.taskLabel : labelString;
        return '${if(ganttProperties.startDate&&ganttProperties.endDate&&ganttProperties.duration)}' +
            '<div class="' + childTaskBarInnerDiv + ' ' + traceChildTaskBar + '"' +
            'style="width:${ganttProperties.width}px;height:' +
            (this.taskBarHeight) + 'px;">' + '<div class="' + childProgressBarInnerDiv + ' ' +
            traceChildProgressBar + '"' +
            ' style="border-style:${if(ganttProperties.progressWidth) }solid${else}none${/if};' +
            'width:${ganttProperties.progressWidth}px;height:100%;' +
            'border-top-right-radius:${this.chartRowsModule.getBorderRadius(ganttProperties) }px;' +
            'border-bottom-right-radius:${this.chartRowsModule.getBorderRadius(ganttProperties) }px;">' +
            '<span class="' + taskLabel + '" style="line-height:' +
            (this.taskBarHeight - 1) + 'px;height:' + this.taskBarHeight + 'px;">' +
            labelString + '</span></div></div>' +
            '${else}' +
            '${if(ganttProperties.startDate&&!ganttProperties.endDate&&!ganttProperties.duration)}' +
            '<div class="' + childProgressBarInnerDiv + ' ' + traceChildTaskBar + ' ' +
            unscheduledTaskbarLeft + '"' +
            'style="left:${ganttProperties.left}px; height:' + this.taskBarHeight + 'px;"></div>' +
            '${else if(ganttProperties.endDate&&!ganttProperties.startDate&&!ganttProperties.duration)}' +
            '<div class="' + childProgressBarInnerDiv + ' ' + traceChildTaskBar + ' ' +
            unscheduledTaskbarRight + '"' +
            'style="left:${ganttProperties.left}px; height:' + this.taskBarHeight + 'px;"></div>' +
            '${else if(ganttProperties.duration&&!ganttProperties.startDate&&!ganttProperties.endDate)}' +
            '<div class="' + childProgressBarInnerDiv + ' ' + traceChildTaskBar + ' ' +
            unscheduledTaskbar + '"' +
            'style="left:${ganttProperties.left}px; width:${ganttProperties.width}px;' +
            ' height:' + this.taskBarHeight + 'px;"></div>' +
            '${/if}' +
            '${/if};';
    };
    /**
     * To get milestone template string.
     * @return {string}
     * @private
     */
    ChartRows.prototype.getMilestoneTemplateString = function () {
        return '<div class="' + traceMilestone + '" style="position:absolute;">' +
            '<div class="' + milestoneTop + '${if(!ganttProperties.startDate&&!ganttProperties.endDate)}' + ' ' +
            unscheduledMilestoneTop + '${/if}' + '" style="border-right-width:' +
            this.milesStoneRadius + 'px;border-left-width:' + this.milesStoneRadius + 'px;border-bottom-width:' +
            this.milesStoneRadius + 'px;"></div>' +
            '<div class="' + milestoneBottom + '${if(!ganttProperties.startDate&&!ganttProperties.endDate)}' + ' ' +
            unscheduledMilestoneBottom + '${/if}' + '" style="top:' +
            (this.milesStoneRadius) + 'px;border-right-width:' + this.milesStoneRadius + 'px; border-left-width:' +
            this.milesStoneRadius + 'px; border-top-width:' + this.milesStoneRadius + 'px;"></div></div>';
    };
    /**
     * To get task baseline template string.
     * @return {string}
     * @private
     */
    ChartRows.prototype.getTaskBaselineTemplateString = function () {
        return '<div class="' + baselineBar + '" style="margin-top:' + this.baselineTop +
            'px;left:${ganttProperties.baselineLeft }px;' +
            'width:${ganttProperties.baselineWidth }px;height:' +
            this.baselineHeight + 'px;' + (this.baselineColor ? 'background-color: ' + this.baselineColor + ';' : '') + '"></div>';
    };
    /**
     * To get milestone baseline template string.
     * @return {string}
     * @private
     */
    ChartRows.prototype.getMilestoneBaselineTemplateString = function () {
        return '<div class="' + baselineMilestoneContainer + '" style="' +
            'left:${(data.ganttProperties.baselineLeft -' + (this.milesStoneRadius) + ')}px;' +
            'margin-top:' + (-Math.floor(this.parent.rowHeight - this.milestoneMarginTop) + 2) +
            'px">' + '<div class="' + baselineMilestoneDiv + '">' + '<div class="' + baselineMilestoneDiv +
            ' ' + baselineMilestoneTop + '"  ' +
            'style="top:' + (-this.milestoneHeight) + 'px;border-right:' + this.milesStoneRadius +
            'px solid transparent;border-left:' + this.milesStoneRadius +
            'px solid transparent;border-top:0px' +
            'solid transparent;border-bottom-width:' + this.milesStoneRadius + 'px;' +
            'border-bottom-style: solid;' + (this.baselineColor ? 'border-bottom-color: ' + this.baselineColor + ';' : '') +
            '"></div>' +
            '<div class="' + baselineMilestoneDiv + ' ' + baselineMilestoneBottom + '"  ' +
            'style="top:' + (this.milesStoneRadius - this.milestoneHeight) + 'px;border-right:' + this.milesStoneRadius +
            'px solid transparent;border-left:' + this.milesStoneRadius +
            'px solid transparent;border-bottom:0px' +
            'solid transparent;border-top-width:' + this.milesStoneRadius + 'px;' +
            'border-top-style: solid;' +
            (this.baselineColor ? 'border-top-color: ' + this.baselineColor + ';' : '') + '"></div>' +
            '</div></div>';
    };
    /**
     * To get taskbar row('TR') template string
     * @return {string}
     * @private
     */
    ChartRows.prototype.getTableTrTemplateString = function () {
        var className = (this.parent.gridLines === 'Horizontal' || this.parent.gridLines === 'Both') ?
            'e-chart-row-border' : '';
        return '<tr class="${this.chartRowsModule.getRowClassName(data)} ' + chartRow + '"' +
            'style="display:${this.chartRowsModule.getExpandDisplayProp(data)};height:' +
            this.parent.rowHeight + 'px;">' +
            '<td class="' + chartRowCell + ' ' + className
            + '" style="width:' + this.parent.timelineModule.totalTimelineWidth + 'px;"></td></tr>';
    };
    /**
     * To initialize chart templates.
     * @return {void}
     * @private
     */
    ChartRows.prototype.initializeChartTemplate = function () {
        this.parentTemplateFunction = isNullOrUndefined(this.templateCompiler(this.parent.parentTaskbarTemplate)) ?
            this.templateCompiler(this.getParentTaskbarTemplateString()) :
            this.templateCompiler(this.parent.parentTaskbarTemplate);
        this.leftTaskLabelTemplateFunction = !isNullOrUndefined(this.parent.labelSettings.leftLabel) &&
            this.parent.labelSettings.leftLabel.indexOf('#') === 0 ? this.templateCompiler(this.parent.labelSettings.leftLabel) :
            this.templateCompiler(this.getTaskbarLeftLabelString(this.parent.labelSettings.leftLabel));
        this.rightTaskLabelTemplateFunction = !isNullOrUndefined(this.parent.labelSettings.rightLabel) &&
            this.parent.labelSettings.rightLabel.indexOf('#') === 0 ? this.templateCompiler(this.parent.labelSettings.rightLabel) :
            this.templateCompiler(this.getTaskbarRightLabelString(this.parent.labelSettings.rightLabel));
        this.childTaskbarTemplateFunction = isNullOrUndefined(this.templateCompiler(this.parent.taskbarTemplate)) ?
            this.templateCompiler(this.getChildTaskbarTemplateString()) : this.templateCompiler(this.parent.taskbarTemplate);
        this.milestoneTemplateFunction = isNullOrUndefined(this.templateCompiler(this.parent.milestoneTemplate)) ?
            this.templateCompiler(this.getMilestoneTemplateString()) : this.templateCompiler(this.parent.milestoneTemplate);
    };
    /**
     * To initialize basic chart table templates.
     * @return {void}
     * @private
     */
    ChartRows.prototype.ganttChartTableTemplateInit = function () {
        var parentTr = this.getTableTrTemplateString();
        this.parentTrFunction = this.templateCompiler(parentTr);
        var parentLeftLabelDiv = '<div class="' + leftLabelContainer + '" style="height:' +
            (this.parent.rowHeight - 1) + 'px;width: ${this.chartRowsModule.taskNameWidth(data)};"></div>';
        this.leftLabelContainerFunction = this.templateCompiler(parentLeftLabelDiv);
        var parentRightLabelDiv = '<div class="' + rightLabelContainer + '" ' +
            ' style="left: ${this.chartRowsModule.getRightLabelLeft(data) }px;height:'
            + (this.parent.rowHeight - 1) + 'px;"></div>';
        this.rightLabelContainerFunction = this.templateCompiler(parentRightLabelDiv);
        var taskbarContainerDiv = '<div class="' + taskBarMainContainer +
            '${this.getUnscheduledTaskClass(ganttProperties)}' +
            '${if(ganttProperties.cssClassMapping)} ${ganttProperties.cssClassMapping}${/if}"' +
            ' style="${if(ganttProperties.isMilestone)}width:' + this.milestoneHeight + 'px;height:' +
            this.milestoneHeight + 'px;margin-top:' +
            this.milestoneMarginTop + 'px;left:${(data.ganttProperties.left - ' +
            (this.milestoneHeight / 2) + ')}px;${else}width:${ganttProperties.width}px;margin-top:' +
            this.taskBarMarginTop + 'px;left:${ganttProperties.left}px;height:' + this.taskBarHeight + 'px;${/if}"></div>';
        this.taskbarContainerFunction = this.templateCompiler(taskbarContainerDiv);
        var childTaskbarLeftResizeDiv = '<div class="' + taskBarLeftResizer + ' ' + icon + '"' +
            ' style="left:-2px;' +
            'height:' + (this.taskBarHeight) + 'px;"></div>';
        this.childTaskbarLeftResizerFunction = this.templateCompiler(childTaskbarLeftResizeDiv);
        var childTaskbarRightResizeDiv = '<div class="' + taskBarRightResizer + ' ' + icon + '"' +
            ' style="left:${(data.ganttProperties.width - ' + 10 + ')}px;' +
            'height:' + (this.taskBarHeight) + 'px;"></div>';
        this.childTaskbarRightResizerFunction = this.templateCompiler(childTaskbarRightResizeDiv);
        var childTaskbarProgressResizeDiv = '<div class="' + childProgressResizer + '"' +
            ' style="left:${(data.ganttProperties.progressWidth - 6)}px;margin-top:' +
            this.taskBarHeight + 'px;"><div class="' + progressBarHandler + '"' +
            '><div class="' + progressHandlerElement + '"></div>' +
            '<div class="' + progressBarHandlerAfter + '"></div></div>';
        this.childTaskbarProgressResizerFunction = this.templateCompiler(childTaskbarProgressResizeDiv);
        this.taskIndicatorFunction = this.templateCompiler(this.getIndicatorString());
        this.taskBaselineTemplateFunction = this.templateCompiler(this.getTaskBaselineTemplateString());
        this.milestoneBaselineTemplateFunction = this.templateCompiler(this.getMilestoneBaselineTemplateString());
        var connectorLineLeft = '<div class="' + leftConnectorPointOuterDiv + '" style="${if(ganttProperties.isMilestone)}' +
            'margin-top:' + (this.milesStoneRadius - 4) + 'px;${else}margin-top:' +
            this.connectorPointMargin + 'px;${/if}">' +
            '<div class="' + connectorPointLeft + '${this.getUnscheduledTaskClass(ganttProperties)}' +
            '" style="width: ' + this.connectorPointWidth + 'px;' +
            'height: ' + this.connectorPointWidth + 'px;border-radius:' +
            this.connectorPointRadius + 'px;">' + this.touchLeftConnectorpoint + '</div></div>';
        var connectorLineRight = '<div class="' + rightConnectorPointOuterDiv + '" style="${if(ganttProperties.isMilestone)}' +
            'left:' + this.milestoneHeight + 'px;margin-top:' +
            (this.milesStoneRadius - 4) + 'px;${else}left:${(data.ganttProperties.width)}px;margin-top:' +
            this.connectorPointMargin + 'px;${/if}">' +
            '<div class="' + connectorPointRight + '${this.getUnscheduledTaskClass(ganttProperties)}"' + ' style="' +
            'width:' + this.connectorPointWidth + 'px;height:' + this.connectorPointWidth + 'px;border-radius:' +
            this.connectorPointRadius + 'px;">' + this.touchRightConnectorpoint + '</div></div>';
        this.connectorLineLeftFunction = this.templateCompiler(connectorLineLeft);
        this.connectorLineRightFunction = this.templateCompiler(connectorLineRight);
    };
    /**
     * To get task label.
     * @return {string}
     * @private
     */
    ChartRows.prototype.getTaskLabel = function (field) {
        var length = this.parent.ganttColumns.length;
        var resultString = null;
        if (!isNullOrUndefined(field) && field !== '') {
            if (field === this.parent.taskFields.resourceInfo) {
                resultString = '${this.chartRowsModule.getResourceName(data) }';
            }
            else {
                for (var i = 0; i < length; i++) {
                    if (field === this.parent.ganttColumns[i].field) {
                        resultString = '${if(' + field + '!== undefined && ' + field + '!== null )}${' + field + '}${/if}';
                        break;
                    }
                }
                if (isNullOrUndefined(resultString)) {
                    return 'isCustomTemplate';
                }
            }
        }
        else {
            resultString = '';
        }
        return resultString;
    };
    ChartRows.prototype.getExpandDisplayProp = function (data) {
        data = this.templateData;
        if (this.parent.getExpandStatus(data)) {
            return 'table-row';
        }
        return 'none';
    };
    ChartRows.prototype.getRowClassName = function (data) {
        data = this.templateData;
        var rowClass = 'gridrowtaskId';
        var parentItem = data.parentItem;
        if (parentItem) {
            rowClass += parentItem.taskId.toString();
        }
        rowClass += 'level';
        rowClass += data.level.toString();
        return rowClass;
    };
    ChartRows.prototype.getBorderRadius = function (data) {
        data = this.templateData;
        var diff = data.ganttProperties.width - data.ganttProperties.progressWidth;
        if (diff <= 4) {
            return 4 - diff;
        }
        else {
            return 0;
        }
    };
    ChartRows.prototype.taskNameWidth = function (ganttData) {
        ganttData = this.templateData;
        var width;
        if (ganttData.ganttProperties.isMilestone) {
            width = (ganttData.ganttProperties.left - (this.parent.getTaskbarHeight() / 2));
        }
        else {
            width = ganttData.ganttProperties.left;
        }
        if (width < 0) {
            width = 0;
        }
        return width + 'px';
    };
    ChartRows.prototype.getRightLabelLeft = function (ganttData) {
        ganttData = this.templateData;
        if (ganttData.ganttProperties.isMilestone) {
            return ganttData.ganttProperties.left + (this.parent.getTaskbarHeight() / 2);
        }
        else {
            return ganttData.ganttProperties.left + ganttData.ganttProperties.width;
        }
    };
    ChartRows.prototype.getExpandClass = function (data) {
        data = this.templateData;
        if (data.expanded) {
            return rowExpand;
        }
        else if (!data.expanded && data.hasChildRecords) {
            return rowCollapse;
        }
        return '';
    };
    ChartRows.prototype.getResourceName = function (ganttData) {
        ganttData = this.templateData;
        var resource = null;
        if (!isNullOrUndefined(ganttData.ganttProperties.resourceInfo)) {
            var length_1 = ganttData.ganttProperties.resourceInfo.length;
            if (length_1 > 0) {
                for (var i = 0; i < length_1; i++) {
                    if (isNullOrUndefined(resource)) {
                        resource = ganttData.ganttProperties.resourceInfo[i][this.parent.resourceNameMapping];
                    }
                    else {
                        resource += ' , ' + ganttData.ganttProperties.resourceInfo[i][this.parent.resourceNameMapping];
                    }
                }
                return resource;
            }
            else {
                return '';
            }
        }
        return '';
    };
    /**
     * To initialize private variable help to render task bars.
     * @return {void}
     * @private
     */
    ChartRows.prototype.initChartHelperPrivateVariable = function () {
        this.baselineColor = !isNullOrUndefined(this.parent.baselineColor) &&
            this.parent.baselineColor !== '' ? this.parent.baselineColor : 'red';
        this.taskBarHeight = isNullOrUndefined(this.parent.taskbarHeight) || this.parent.taskbarHeight >= this.parent.rowHeight ?
            Math.floor(this.parent.rowHeight * 0.62) : this.parent.taskbarHeight; // 0.62 -- Standard Ratio.
        if (this.parent.renderBaseline) {
            var height = void 0;
            if ((this.taskBarHeight + this.baselineHeight) <= this.parent.rowHeight) {
                height = this.taskBarHeight;
            }
            else {
                height = this.taskBarHeight - (this.baselineHeight + 1);
            }
            this.taskBarHeight = height;
        }
        this.milestoneHeight = Math.floor(this.taskBarHeight * 0.82); // 0.82 -- Standard Ratio.
        this.taskBarMarginTop = Math.floor((this.parent.rowHeight - this.taskBarHeight) / 2);
        this.milestoneMarginTop = Math.floor((this.parent.rowHeight - this.milestoneHeight) / 2);
        this.milesStoneRadius = Math.floor((this.milestoneHeight) / 2);
        this.baselineTop = -(Math.floor((this.parent.rowHeight - (this.taskBarHeight + this.taskBarMarginTop))) - 1);
        this.connectorPointWidth = 8;
        this.connectorPointRadius = 8 / 2;
        this.connectorPointMargin = Math.floor((this.taskBarHeight / 2) - 4);
    };
    /**
     * Function used to refresh Gantt rows.
     * @return {void}
     * @private
     */
    ChartRows.prototype.refreshGanttRows = function () {
        this.ganttChartTableBody.innerHTML = '';
        this.parent.currentViewData = this.parent.treeGrid.getCurrentViewRecords();
        this.createTaskbarTemplate();
    };
    /**
     * To render taskbars.
     * @return {void}
     * @private
     */
    ChartRows.prototype.createTaskbarTemplate = function () {
        this.ganttChartTableBody.innerHTML = '';
        for (var i = 0; i < this.parent.currentViewData.length; i++) {
            var tempTemplateData = this.parent.currentViewData[i];
            this.ganttChartTableBody.appendChild(this.getGanttChartRow(i, tempTemplateData));
        }
    };
    /**
     * To render taskbars.
     * @return {Node}
     * @private
     */
    /* tslint:disable-next-line:max-func-body-length */
    ChartRows.prototype.getGanttChartRow = function (i, tempTemplateData) {
        this.templateData = tempTemplateData;
        var taskBaselineTemplateNode = null;
        var parentTrNode = this.parentTrFunction(extend({ index: i }, this.templateData), this.parent, 'parentTr');
        var leftLabelNode = this.leftLabelContainerFunction(extend({ index: i }, this.templateData), this.parent, 'leftLabelContainer');
        if (this.leftTaskLabelTemplateFunction) {
            var leftLabelTemplateNode = this.leftTaskLabelTemplateFunction(extend({ index: i }, this.templateData), this.parent, 'leftLabelTemplate');
            leftLabelNode[0].appendChild([].slice.call(leftLabelTemplateNode)[0]);
        }
        var taskbarContainerNode = this.taskbarContainerFunction(extend({ index: i }, this.templateData), this.parent, 'taskbarContainerDiv');
        if (!this.templateData.hasChildRecords) {
            var connectorLineLeftNode = this.connectorLineLeftFunction(extend({ index: i }, this.templateData), this.parent, 'connectorLinePointLeft');
            taskbarContainerNode[0].appendChild([].slice.call(connectorLineLeftNode)[0]);
        }
        if (this.templateData.hasChildRecords) {
            var parentTaskbarTemplateNode = this.parentTemplateFunction(extend({ index: i }, this.templateData), this.parent, 'parentTaskbarTemplate');
            taskbarContainerNode[0].appendChild([].slice.call(parentTaskbarTemplateNode)[0]);
            if (this.parent.renderBaseline && this.templateData.ganttProperties.baselineStartDate &&
                this.templateData.ganttProperties.baselineEndDate) {
                taskBaselineTemplateNode = this.taskBaselineTemplateFunction(extend({ index: i }, this.templateData), this.parent, 'parentTaskbarBaseline');
            }
        }
        else if (this.templateData.ganttProperties.isMilestone) {
            var milestoneTemplateNode = this.milestoneTemplateFunction(extend({ index: i }, this.templateData), this.parent, 'milestoneTemplate');
            taskbarContainerNode[0].appendChild([].slice.call(milestoneTemplateNode)[0]);
            if (this.parent.renderBaseline && this.templateData.ganttProperties.baselineStartDate &&
                this.templateData.ganttProperties.baselineEndDate) {
                taskBaselineTemplateNode = this.milestoneBaselineTemplateFunction(extend({ index: i }, this.templateData), this.parent, 'milestoneBaseline');
            }
        }
        else {
            var scheduledTask = isScheduledTask(this.templateData.ganttProperties);
            var childTaskbarProgressResizeNode = null;
            var childTaskbarRightResizeNode = null;
            var childTaskbarLeftResizeNode = null;
            if (!isNullOrUndefined(scheduledTask)) {
                if (scheduledTask || this.templateData.ganttProperties.duration) {
                    if (scheduledTask) {
                        childTaskbarProgressResizeNode = this.childTaskbarProgressResizerFunction(extend({ index: i }, this.templateData), this.parent, 'childProgressResizer');
                        childTaskbarLeftResizeNode = this.childTaskbarLeftResizerFunction(extend({ index: i }, this.templateData), this.parent, 'childLeftResizer');
                        childTaskbarRightResizeNode = this.childTaskbarRightResizerFunction(extend({ index: i }, this.templateData), this.parent, 'childRightResizer');
                    }
                }
                var childTaskbarTemplateNode = this.childTaskbarTemplateFunction(extend({ index: i }, this.templateData), this.parent, 'childTaskbarTemplate');
                if (childTaskbarLeftResizeNode) {
                    taskbarContainerNode[0].appendChild([].slice.call(childTaskbarLeftResizeNode)[0]);
                }
                if (childTaskbarTemplateNode) {
                    taskbarContainerNode[0].appendChild([].slice.call(childTaskbarTemplateNode)[0]);
                }
                if (childTaskbarProgressResizeNode) {
                    taskbarContainerNode[0].appendChild([].slice.call(childTaskbarProgressResizeNode)[0]);
                }
                if (childTaskbarRightResizeNode) {
                    taskbarContainerNode[0].appendChild([].slice.call(childTaskbarRightResizeNode)[0]);
                }
            }
            if (this.parent.renderBaseline && this.templateData.ganttProperties.baselineStartDate &&
                this.templateData.ganttProperties.baselineEndDate) {
                taskBaselineTemplateNode = this.taskBaselineTemplateFunction(extend({ index: i }, this.templateData), this.parent, 'childBaseline');
            }
        }
        if (!this.templateData.hasChildRecords) {
            var connectorLineRightNode = this.connectorLineRightFunction(extend({ index: i }, this.templateData), this.parent, 'connectorLinePointRight');
            taskbarContainerNode[0].appendChild([].slice.call(connectorLineRightNode)[0]);
        }
        var rightLabelNode = this.rightLabelContainerFunction(extend({ index: i }, this.templateData), this.parent, 'rightLabelContainer');
        if (this.rightTaskLabelTemplateFunction) {
            var rightLabelTemplateNode = this.rightTaskLabelTemplateFunction(extend({ index: i }, this.templateData), this.parent, 'rightLabelTemplateTemplate');
            rightLabelNode[0].appendChild([].slice.call(rightLabelTemplateNode)[0]);
        }
        parentTrNode[0].childNodes[0].childNodes[0].appendChild([].slice.call(leftLabelNode)[0]);
        parentTrNode[0].childNodes[0].childNodes[0].appendChild([].slice.call(taskbarContainerNode)[0]);
        if (this.templateData.ganttProperties.indicators && this.templateData.ganttProperties.indicators.length > 0) {
            var taskIndicatorNode = void 0;
            var taskIndicatorTextFunction = void 0;
            var taskIndicatorTextNode = void 0;
            var indicators = this.templateData.ganttProperties.indicators;
            for (var indicatorIndex = 0; indicatorIndex < indicators.length; indicatorIndex++) {
                taskIndicatorNode = this.taskIndicatorFunction(extend({ index: i }, indicators[indicatorIndex]), this.parent, 'indicatorLabelContainer');
                taskIndicatorTextFunction = isNullOrUndefined(this.templateCompiler(indicators[indicatorIndex].name)) ?
                    this.templateCompiler('${name}') : this.templateCompiler(indicators[indicatorIndex].name);
                taskIndicatorTextNode = taskIndicatorTextFunction(extend({ index: i }, this.templateData), this.parent, 'indicatorLabelText');
                taskIndicatorNode[0].appendChild([].slice.call(taskIndicatorTextNode)[0]);
                taskIndicatorNode[0].title = taskIndicatorNode[0].innerText;
                parentTrNode[0].childNodes[0].childNodes[0].appendChild([].slice.call(taskIndicatorNode)[0]);
            }
        }
        parentTrNode[0].childNodes[0].childNodes[0].appendChild([].slice.call(rightLabelNode)[0]);
        if (!isNullOrUndefined(taskBaselineTemplateNode)) {
            parentTrNode[0].childNodes[0].childNodes[0].appendChild([].slice.call(taskBaselineTemplateNode)[0]);
        }
        return parentTrNode[0].childNodes[0];
    };
    /**
     * To trigger query taskbar info event.
     * @return {void}
     * @private
     */
    ChartRows.prototype.triggerQueryTaskbarInfo = function () {
        var length = this.ganttChartTableBody.querySelectorAll('tr').length;
        var trElement;
        var taskbarElement;
        var data;
        for (var index = 0; index < length; index++) {
            trElement = this.ganttChartTableBody.querySelectorAll('tr')[index];
            taskbarElement = trElement.querySelector('.' + taskBarMainContainer);
            data = this.parent.currentViewData[index];
            this.triggerQueryTaskbarInfoByIndex(trElement, data);
        }
    };
    /**
     *
     * @param trElement
     * @param data
     * @private
     */
    ChartRows.prototype.triggerQueryTaskbarInfoByIndex = function (trElement, data) {
        var taskbarElement;
        taskbarElement = trElement.querySelector('.' + taskBarMainContainer);
        var args = {
            ganttModel: this.parent,
            data: data,
            rowElement: trElement,
            taskbarElement: trElement.querySelector('.' + taskBarMainContainer),
            taskbarType: data.hasChildRecords ? 'ParentTask' : data.ganttProperties.isMilestone ? 'Milestone' : 'ChildTask'
        };
        var taskbarClass = '.' + (args.taskbarType === 'ParentTask' ?
            traceParentTaskBar : args.taskbarType === 'ChildTask' ? traceChildTaskBar : milestoneTop);
        var progressBarClass = '.' + (args.taskbarType === 'ParentTask' ?
            traceParentProgressBar : args.taskbarType === 'ChildTask' ? traceChildProgressBar : baselineMilestoneTop);
        if (args.taskbarType === 'Milestone') {
            args.milestoneColor = taskbarElement.querySelector(taskbarClass) ?
                getComputedStyle(taskbarElement.querySelector(taskbarClass)).borderBottomColor : null;
            args.baselineColor = trElement.querySelector(progressBarClass) ?
                getComputedStyle(trElement.querySelector(progressBarClass)).borderBottomColor : null;
        }
        else {
            args.taskbarBgColor = taskbarElement.querySelector(taskbarClass) ?
                getComputedStyle(taskbarElement.querySelector(taskbarClass)).backgroundColor : null;
            // args.taskbarBorderColor = taskbarElement.querySelector(taskbarClass) ?
            //     getComputedStyle(taskbarElement.querySelector(taskbarClass)).borderColor : null;
            args.progressBarBgColor = taskbarElement.querySelector(progressBarClass) ?
                getComputedStyle(taskbarElement.querySelector(progressBarClass)).backgroundColor : null;
            args.progressBarBorderColor = taskbarElement.querySelector(progressBarClass) ?
                getComputedStyle(taskbarElement.querySelector(progressBarClass)).borderColor : null;
            args.baselineColor = trElement.querySelector('.' + baselineBar) ?
                getComputedStyle(trElement.querySelector('.' + baselineBar)).backgroundColor : null;
            args.progressLabelColor = taskbarElement.querySelector('.' + taskLabel) ?
                getComputedStyle(taskbarElement.querySelector('.' + taskLabel)).color : null;
        }
        args.rightLabelColor = trElement.querySelector('.' + rightLabelContainer) ?
            getComputedStyle(trElement.querySelector('.' + rightLabelContainer)).color : null;
        args.leftLabelColor = trElement.querySelector('.' + leftLabelContainer) ?
            getComputedStyle(trElement.querySelector('.' + leftLabelContainer)).color : null;
        this.parent.trigger('queryTaskbarInfo', args);
        this.updateQueryTaskbarInfoArgs(args);
    };
    /**
     * To update query taskbar info args.
     * @return {void}
     * @private
     */
    ChartRows.prototype.updateQueryTaskbarInfoArgs = function (args) {
        var trElement = args.rowElement;
        var taskbarElement = args.taskbarElement;
        var taskbarClass = '.' + (args.taskbarType === 'ParentTask' ?
            traceParentTaskBar : args.taskbarType === 'ChildTask' ? traceChildTaskBar : milestoneTop);
        var progressBarClass = '.' + (args.taskbarType === 'ParentTask' ?
            traceParentProgressBar : args.taskbarType === 'ChildTask' ? traceChildProgressBar : baselineMilestoneTop);
        if (args.taskbarType === 'Milestone') {
            if (taskbarElement.querySelector(taskbarClass) &&
                getComputedStyle(taskbarElement.querySelector(taskbarClass)).borderBottomColor !== args.milestoneColor) {
                taskbarElement.querySelector(taskbarClass).style.borderBottomColor = args.milestoneColor;
                taskbarElement.querySelector('.' + milestoneBottom).style.borderTopColor = args.milestoneColor;
            }
            if (trElement.querySelector(progressBarClass) &&
                getComputedStyle(trElement.querySelector(progressBarClass)).borderTopColor !== args.baselineColor) {
                trElement.querySelector(progressBarClass).style.borderBottomColor = args.baselineColor;
                trElement.querySelector('.' + baselineMilestoneBottom).style.borderTopColor = args.baselineColor;
            }
        }
        else {
            if (taskbarElement.querySelector(taskbarClass) &&
                getComputedStyle(taskbarElement.querySelector(taskbarClass)).backgroundColor !== args.taskbarBgColor) {
                taskbarElement.querySelector(taskbarClass).style.backgroundColor = args.taskbarBgColor;
            }
            // if (taskbarElement.querySelector(taskbarClass) &&
            //     getComputedStyle(taskbarElement.querySelector(taskbarClass)).borderColor !== args.taskbarBorderColor) {
            //     (taskbarElement.querySelector(taskbarClass) as HTMLElement).style.borderColor = args.taskbarBorderColor;
            // }
            if (taskbarElement.querySelector(progressBarClass) &&
                getComputedStyle(taskbarElement.querySelector(progressBarClass)).backgroundColor !== args.progressBarBgColor) {
                taskbarElement.querySelector(progressBarClass).style.backgroundColor = args.progressBarBgColor;
            }
            if (taskbarElement.querySelector(progressBarClass) &&
                getComputedStyle(taskbarElement.querySelector(progressBarClass)).borderColor !== args.progressBarBorderColor) {
                taskbarElement.querySelector(progressBarClass).style.borderColor = args.progressBarBorderColor;
            }
            if (trElement.querySelector('.' + leftLabelContainer) &&
                getComputedStyle(trElement.querySelector('.' + leftLabelContainer)).color !== args.leftLabelColor) {
                trElement.querySelector('.' + leftLabelContainer).style.color = args.leftLabelColor;
            }
            if (trElement.querySelector('.' + rightLabelContainer) &&
                getComputedStyle(trElement.querySelector('.' + rightLabelContainer)).color !== args.rightLabelColor) {
                trElement.querySelector('.' + rightLabelContainer).style.color = args.rightLabelColor;
            }
            if (taskbarElement.querySelector('.' + taskLabel) &&
                getComputedStyle(taskbarElement.querySelector('.' + taskLabel)).color !== args.progressLabelColor) {
                taskbarElement.querySelector('.' + taskLabel).style.color = args.progressLabelColor;
            }
            if (trElement.querySelector('.' + baselineBar) &&
                getComputedStyle(trElement.querySelector('.' + baselineBar)).backgroundColor !== args.baselineColor) {
                trElement.querySelector('.' + baselineBar).style.backgroundColor = args.baselineColor;
            }
        }
    };
    /**
     * To compile template string.
     * @return {Function}
     * @private
     */
    ChartRows.prototype.templateCompiler = function (template) {
        if (!isNullOrUndefined(template) && template !== '') {
            try {
                if (document.querySelectorAll(template).length) {
                    return compile(document.querySelector(template).innerHTML.trim(), this.parent);
                }
                else {
                    return compile(template, this.parent);
                }
            }
            catch (e) {
                return compile(template, this.parent);
            }
        }
        return null;
    };
    /**
     * To refresh edited TR
     * @param index
     * @private
     */
    ChartRows.prototype.refreshRow = function (index) {
        var tr = this.ganttChartTableBody.childNodes[index];
        var selectedItem = this.parent.currentViewData[index];
        if (index !== -1 && selectedItem) {
            var data = selectedItem;
            tr.replaceChild(this.getGanttChartRow(index, data).childNodes[0], tr.childNodes[0]);
            this.triggerQueryTaskbarInfoByIndex(tr, data);
            this.parent.treeGrid.grid.setRowData(data.ganttProperties.taskId, data);
            var row = this.parent.treeGrid.grid.getRowObjectFromUID(this.parent.treeGrid.grid.getDataRows()[index].getAttribute('data-uid'));
            row.data = data;
        }
    };
    /**
     * To refresh all edited records
     * @param items
     * @private
     */
    ChartRows.prototype.refreshRecords = function (items) {
        if (this.parent.isGanttChartRendered) {
            for (var i = 0; i < items.length; i++) {
                var index = this.parent.currentViewData.indexOf(items[i]);
                this.refreshRow(index);
            }
        }
    };
    ChartRows.prototype.removeEventListener = function () {
        if (this.parent.isDestroyed) {
            return;
        }
        this.parent.off('renderPanels', this.createChartTable);
        this.parent.off('dataReady', this.initiateTemplates);
        this.parent.off('destroy', this.destroy);
    };
    ChartRows.prototype.destroy = function () {
        this.removeEventListener();
    };
    return ChartRows;
}());

var Dependency = /** @__PURE__ @class */ (function () {
    function Dependency(gantt) {
        this.validationPredecessor = null;
        this.parent = gantt;
        this.dateValidateModule = this.parent.dateValidationModule;
    }
    /**
     * Method to populate predecessor collections in records
     * @private
     */
    Dependency.prototype.ensurePredecessorCollection = function () {
        var predecessorTasks = this.parent.predecessorsCollection;
        var length = predecessorTasks.length - 1;
        for (var count = length; count >= 0; count--) {
            var ganttData = predecessorTasks[count];
            var ganttProp = ganttData.ganttProperties;
            this.ensurePredecessorCollectionHelper(ganttData, ganttProp);
        }
    };
    /**
     *
     * @param ganttData
     * @param ganttProp
     * @private
     */
    Dependency.prototype.ensurePredecessorCollectionHelper = function (ganttData, ganttProp) {
        var predecessorVal = ganttProp.predecessorsName;
        if (predecessorVal && (typeof predecessorVal === 'string' || typeof predecessorVal === 'number')) {
            this.parent.setRecordValue('predecessor', this.calculatePredecessor(predecessorVal, ganttData), ganttProp, true);
        }
        else if (predecessorVal && typeof predecessorVal === 'object' && predecessorVal.length) {
            var preValues = [];
            for (var c = 0; c < predecessorVal.length; c++) {
                var predecessorItem = predecessorVal[c];
                var preValue = {};
                preValue.from = getValue('from', predecessorItem);
                preValue.to = getValue('to', predecessorItem) ? getValue('to', predecessorItem) : ganttProp.taskId;
                preValue.type = getValue('type', predecessorItem) ? getValue('type', predecessorItem) : 'FS';
                var offsetUnits = getValue('offset', predecessorItem);
                if (isNullOrUndefined(offsetUnits)) {
                    preValue.offset = 0;
                    preValue.offsetUnit = this.parent.durationUnit.toLocaleLowerCase();
                }
                else if (typeof offsetUnits === 'string') {
                    var tempOffsetUnits = this.getOffsetDurationUnit(getValue('offset', predecessorItem));
                    preValue.offset = tempOffsetUnits.duration;
                    preValue.offsetUnit = tempOffsetUnits.durationUnit;
                }
                else {
                    preValue.offset = parseFloat(offsetUnits.toString());
                    preValue.offsetUnit = this.parent.durationUnit.toLocaleLowerCase();
                }
                var isOwnParent = this.checkIsParent(preValue.from.toString());
                if (!isOwnParent) {
                    preValues.push(preValue);
                }
            }
            this.parent.setRecordValue('predecessor', preValues, ganttProp, true);
        }
        this.parent.setRecordValue('predecessorsName', this.getPredecessorStringValue(ganttData), ganttProp, true);
        this.parent.setRecordValue('taskData.' + this.parent.taskFields.dependency, ganttProp.predecessorsName, ganttData);
        this.parent.setRecordValue(this.parent.taskFields.dependency, ganttProp.predecessorsName, ganttData);
    };
    /**
     *
     * @param ganttData Method to check parent dependency in predecessor
     * @param fromId
     */
    Dependency.prototype.checkIsParent = function (fromId) {
        var boolValue = false;
        var task = this.parent.getRecordByID(fromId);
        if (task.hasChildRecords) {
            boolValue = true;
        }
        return boolValue;
    };
    /**
     * Get predecessor collection object from predecessor string value
     * @param predecessorValue
     * @param ganttRecord
     * @private
     */
    Dependency.prototype.calculatePredecessor = function (predecessorValue, ganttRecord) {
        var _this = this;
        var predecessor = predecessorValue.toString();
        var collection = [];
        var match;
        var values;
        var offsetValue;
        var predecessorText;
        predecessor.split(',').forEach(function (el) {
            values = el.split('+');
            offsetValue = '+';
            if (el.indexOf('-') >= 0) {
                values = el.split('-');
                offsetValue = '-';
            }
            match = values[0].match(/(\d+|[A-z]+)/g);
            /*Validate for appropriate predecessor*/
            if (match[0] && _this.parent.ids.indexOf(match[0]) !== -1) {
                if (match.length > 1) {
                    var type = match[1].toUpperCase();
                    if (type === 'FS' || type === 'FF' || type === 'SF' || type === 'SS') {
                        predecessorText = type;
                    }
                    else {
                        predecessorText = 'FS';
                    }
                }
                else {
                    predecessorText = 'FS';
                }
            }
            else {
                return; // exit current loop for invalid id (match[0])
            }
            var tempOffset = values.length > 1 ? offsetValue + '' + values[1] : '0';
            var offsetUnits = _this.getOffsetDurationUnit(tempOffset);
            var obj = {
                from: match[0],
                type: predecessorText,
                isDrawn: false,
                to: ganttRecord.ganttProperties.taskId.toString(),
                offsetUnit: offsetUnits.durationUnit,
                offset: offsetUnits.duration
            };
            var isOwnParent = _this.checkIsParent(match[0]);
            if (!isOwnParent) {
                collection.push(obj);
            }
        });
        return collection;
    };
    /**
     * Get predecessor value as string with offset values
     * @param data
     * @private
     */
    Dependency.prototype.getPredecessorStringValue = function (data) {
        var predecessors = data.ganttProperties.predecessor;
        var durationUnitTexts = this.parent.durationUnitTexts;
        var resultString = '';
        if (predecessors) {
            var length_1 = predecessors.length;
            for (var i = 0; i < length_1; i++) {
                var currentValue = predecessors[i];
                var temp = '';
                if (currentValue.from !== data.ganttProperties.taskId.toString()) {
                    temp = currentValue.from + currentValue.type;
                    if (currentValue.offset !== 0) {
                        temp += currentValue.offset > 0 ? ('+' + currentValue.offset + ' ') : (currentValue.offset + ' ');
                        var multiple = currentValue.offset !== 1;
                        if (currentValue.offsetUnit === 'day') {
                            temp += multiple ? getValue('days', durationUnitTexts) : getValue('day', durationUnitTexts);
                        }
                        else if (currentValue.offsetUnit === 'hour') {
                            temp += multiple ? getValue('hours', durationUnitTexts) : getValue('hour', durationUnitTexts);
                        }
                        else {
                            temp += multiple ? getValue('minutes', durationUnitTexts) : getValue('minute', durationUnitTexts);
                        }
                    }
                    if (resultString.length > 0) {
                        resultString = resultString + ',' + temp;
                    }
                    else {
                        resultString = temp;
                    }
                }
            }
        }
        return resultString;
    };
    /*Get duration and duration unit value from tasks*/
    Dependency.prototype.getOffsetDurationUnit = function (val) {
        var duration = 0;
        var durationUnit = this.parent.durationUnit.toLocaleLowerCase();
        var durationUnitLabels = this.parent.durationUnitEditText;
        if (typeof val === 'string') {
            var values = val.match(/[^0-9]+|[0-9]+/g);
            for (var x = 0; x < values.length; x++) {
                values[x] = (values[x]).trim();
            }
            if (values[0] === '-' && values[1]) {
                values[1] = values[0] + values[1];
                values.shift();
            }
            else if (values[0] === '+') {
                values.shift();
            }
            if (values[1] === '.' && !isNaN(parseInt(values[2], 10))) {
                values[0] += values[1] + values[2];
                values.splice(1, 2);
            }
            if (values && values.length <= 2) {
                duration = parseFloat(values[0]);
                durationUnit = values[1] ? (values[1].toLowerCase()).trim() : '';
                if (getValue('minute', durationUnitLabels).indexOf(durationUnit) !== -1) {
                    durationUnit = DurationUnits.Minute;
                }
                else if (getValue('hour', durationUnitLabels).indexOf(durationUnit) !== -1) {
                    durationUnit = DurationUnits.Hour;
                }
                else if (getValue('day', durationUnitLabels).indexOf(durationUnit) !== -1) {
                    durationUnit = DurationUnits.Day;
                }
                else {
                    durationUnit = this.parent.durationUnit.toLocaleLowerCase();
                }
            }
        }
        else {
            duration = val;
            durationUnit = this.parent.durationUnit.toLocaleLowerCase();
        }
        if (isNaN(duration)) {
            duration = 0;
            durationUnit = this.parent.durationUnit.toLocaleLowerCase();
        }
        return {
            duration: duration,
            durationUnit: durationUnit
        };
    };
    /**
     * Update predecessor object in both from and to tasks collection
     * @private
     */
    Dependency.prototype.updatePredecessors = function () {
        var predecessorsCollection = this.parent.predecessorsCollection;
        var ganttRecord;
        var length = predecessorsCollection.length;
        for (var count = 0; count < length; count++) {
            ganttRecord = predecessorsCollection[count];
            this.updatePredecessorHelper(ganttRecord, predecessorsCollection);
        }
    };
    /**
     * To update predecessor collection to successor tasks
     * @param ganttRecord
     * @param predecessorsCollection
     * @private
     */
    Dependency.prototype.updatePredecessorHelper = function (ganttRecord, predecessorsCollection) {
        var connectorsCollection;
        var successorGanttRecord;
        var connectorCount;
        predecessorsCollection = isNullOrUndefined(predecessorsCollection) ? [] : predecessorsCollection;
        connectorsCollection = ganttRecord.ganttProperties.predecessor;
        connectorCount = connectorsCollection.length;
        for (var i = 0; i < connectorCount; i++) {
            var connector = connectorsCollection[i];
            successorGanttRecord = this.parent.getRecordByID(connector.from);
            if (connector.from !== ganttRecord.ganttProperties.taskId.toString()) {
                if (successorGanttRecord) {
                    var predecessorCollection = void 0;
                    if (successorGanttRecord.ganttProperties.predecessor) {
                        predecessorCollection = (extend([], successorGanttRecord.ganttProperties.predecessor, [], true));
                        predecessorCollection.push(connector);
                        this.parent.setRecordValue('predecessor', predecessorCollection, successorGanttRecord.ganttProperties, true);
                        //  successorGanttRecord.ganttProperties.predecessor.push(connector);
                    }
                    else {
                        predecessorCollection = [];
                        predecessorCollection.push(connector);
                        this.parent.setRecordValue('predecessor', predecessorCollection, successorGanttRecord.ganttProperties, true);
                        // this.parent.setRecordValue('predecessor', [], successorGanttRecord.ganttProperties, true);
                        // successorGanttRecord.ganttProperties.predecessor.push(connector);
                        predecessorsCollection.push(successorGanttRecord);
                    }
                }
            }
        }
    };
    /**
     * Method to validate date of tasks with predecessor values for all records
     * @private
     */
    Dependency.prototype.updatedRecordsDateByPredecessor = function () {
        var flatData = this.parent.flatData;
        for (var count = 0; count < flatData.length; count++) {
            if (flatData[count].ganttProperties.predecessor && flatData[count].taskData[this.parent.taskFields.dependency]) {
                this.validatePredecessorDates(flatData[count]);
            }
        }
    };
    /**
     * To validate task date values with dependency
     * @param ganttRecord
     * @private
     */
    Dependency.prototype.validatePredecessorDates = function (ganttRecord) {
        if (ganttRecord.ganttProperties.predecessor) {
            var predecessorsCollection = ganttRecord.ganttProperties.predecessor;
            var count = void 0;
            var parentGanttRecord = void 0;
            var record = null;
            var currentTaskId_1 = ganttRecord.ganttProperties.taskId.toString();
            var predecessors = predecessorsCollection.filter(function (data) {
                if (data.to === currentTaskId_1) {
                    return data;
                }
                else {
                    return null;
                }
            });
            for (count = 0; count < predecessors.length; count++) {
                var predecessor = void 0;
                predecessor = predecessors[count];
                parentGanttRecord = this.parent.getRecordByID(predecessor.from);
                record = this.parent.getRecordByID(predecessor.to);
                if (record.ganttProperties.isAutoSchedule) {
                    this.validateChildGanttRecord(parentGanttRecord, record);
                }
            }
        }
    };
    /**
     * Method to validate task with predecessor
     * @param parentGanttRecord
     * @param childGanttRecord
     */
    Dependency.prototype.validateChildGanttRecord = function (parentGanttRecord, childGanttRecord) {
        if (this.parent.editedTaskBarItem === childGanttRecord || isNullOrUndefined(isScheduledTask(parentGanttRecord.ganttProperties))
            || isNullOrUndefined(isScheduledTask(childGanttRecord.ganttProperties))) {
            return;
        }
        if (this.parent.enablePredecessorValidation && (childGanttRecord.ganttProperties.isAutoSchedule)) {
            var childRecordProperty = childGanttRecord.ganttProperties;
            var currentTaskId_2 = childRecordProperty.taskId.toString();
            var predecessorsCollection = childRecordProperty.predecessor;
            var childPredecessor = predecessorsCollection.filter(function (data) {
                if (data.to === currentTaskId_2) {
                    return data;
                }
                else {
                    return null;
                }
            });
            var startDate = this.getPredecessorDate(childGanttRecord, childPredecessor);
            this.parent.setRecordValue('startDate', startDate, childRecordProperty, true);
            this.parent.dataOperation.updateMappingData(childGanttRecord, 'startDate');
            this.dateValidateModule.calculateEndDate(childGanttRecord);
            this.parent.setRecordValue('left', this.parent.dataOperation.calculateLeft(childRecordProperty), childRecordProperty, true);
            this.parent.setRecordValue('width', this.parent.dataOperation.calculateWidth(childRecordProperty), childRecordProperty, true);
            this.parent.setRecordValue('progressWidth', this.parent.dataOperation.getProgressWidth(childRecordProperty.width, childRecordProperty.progress), childRecordProperty, true);
            if (childGanttRecord.parentItem && this.parent.getParentTask(childGanttRecord.parentItem).ganttProperties.isAutoSchedule
                && this.parent.enablePredecessorValidation) {
                this.parent.dataOperation.updateParentItems(childGanttRecord.parentItem);
            }
        }
    };
    /**
     *
     * @param ganttRecord
     * @param predecessorsCollection
     */
    Dependency.prototype.getPredecessorDate = function (ganttRecord, predecessorsCollection) {
        var maxStartDate;
        var tempStartDate;
        var parentGanttRecord;
        var childGanttRecord;
        var validatedPredecessor = predecessorsCollection.filter(function (data) {
            if (data.to === ganttRecord.ganttProperties.taskId.toString()) {
                return data;
            }
            else {
                return null;
            }
        });
        if (validatedPredecessor) {
            var length_2 = validatedPredecessor.length;
            for (var i = 0; i < length_2; i++) {
                var predecessor = validatedPredecessor[i];
                parentGanttRecord = this.parent.getRecordByID(predecessor.from);
                childGanttRecord = this.parent.getRecordByID(predecessor.to);
                tempStartDate =
                    this.getValidatedStartDate(childGanttRecord.ganttProperties, parentGanttRecord.ganttProperties, predecessor);
                if (maxStartDate == null) {
                    maxStartDate = tempStartDate;
                }
                else if (this.dateValidateModule.compareDates(tempStartDate, maxStartDate) === 1) {
                    maxStartDate = tempStartDate;
                }
            }
        }
        return maxStartDate;
    };
    /**
     * Get validated start date as per predecessor type
     * @param ganttRecord
     * @param parentGanttRecord
     * @param predecessor
     */
    Dependency.prototype.getValidatedStartDate = function (ganttProperty, parentRecordProperty, predecessor) {
        var type = predecessor.type;
        var offset = predecessor.offset;
        var tempDate;
        var returnStartDate;
        switch (type) {
            case 'FS':
                tempDate = this.dateValidateModule.getValidEndDate(parentRecordProperty);
                if (!ganttProperty.isMilestone || offset !== 0) {
                    tempDate = this.dateValidateModule.checkStartDate(tempDate, ganttProperty);
                }
                if (offset !== 0) {
                    tempDate = this.updateDateByOffset(tempDate, predecessor, ganttProperty);
                }
                if (!ganttProperty.isMilestone) {
                    returnStartDate = this.dateValidateModule.checkStartDate(tempDate, ganttProperty);
                }
                else {
                    returnStartDate = tempDate;
                }
                break;
            case 'FF':
            case 'SF':
                tempDate = type === 'FF' ? this.dateValidateModule.getValidEndDate(parentRecordProperty) :
                    this.dateValidateModule.getValidStartDate(parentRecordProperty);
                if (offset !== 0) {
                    tempDate = this.updateDateByOffset(tempDate, predecessor, ganttProperty);
                }
                if (!ganttProperty.isMilestone) {
                    tempDate = this.dateValidateModule.checkEndDate(tempDate, ganttProperty);
                }
                returnStartDate = this.dateValidateModule.getStartDate(tempDate, ganttProperty.duration, ganttProperty.durationUnit, ganttProperty);
                break;
            case 'SS':
                tempDate = this.dateValidateModule.getValidStartDate(parentRecordProperty);
                if (offset !== 0) {
                    tempDate = this.updateDateByOffset(tempDate, predecessor, ganttProperty);
                }
                if (!ganttProperty.isMilestone) {
                    returnStartDate = this.dateValidateModule.checkStartDate(tempDate, ganttProperty);
                }
                else {
                    returnStartDate = tempDate;
                }
                break;
        }
        return returnStartDate;
    };
    /**
     *
     * @param date
     * @param predecessor
     * @param isMilestone
     * @param record
     */
    Dependency.prototype.updateDateByOffset = function (date, predecessor, record) {
        var resultDate;
        var offsetValue = predecessor.offset;
        var durationUnit = predecessor.offsetUnit;
        if (offsetValue < 0) {
            resultDate = this.dateValidateModule.getStartDate(this.dateValidateModule.checkEndDate(date, record), (offsetValue * -1), durationUnit, record);
        }
        else {
            resultDate = this.dateValidateModule.getEndDate(date, offsetValue, durationUnit, record, false);
            if (!record.isMilestone) {
                resultDate = this.dateValidateModule.checkStartDate(resultDate, record);
            }
        }
        return resultDate;
    };
    /**
     *
     * @param records
     * @private
     */
    Dependency.prototype.createConnectorLinesCollection = function (records) {
        var recordLength = records.length;
        var count;
        var ganttRecord;
        var predecessorsCollection;
        for (count = 0; count < recordLength; count++) {
            ganttRecord = records[count];
            predecessorsCollection = ganttRecord.ganttProperties.predecessor;
            if (predecessorsCollection) {
                this.addPredecessorsCollection(predecessorsCollection);
            }
        }
    };
    /**
     *
     * @param predecessorsCollection
     */
    Dependency.prototype.addPredecessorsCollection = function (predecessorsCollection) {
        var predecessorsLength;
        var predecessorCount;
        var predecessor;
        var parentGanttRecord;
        var childGanttRecord;
        if (predecessorsCollection) {
            predecessorsLength = predecessorsCollection.length;
            for (predecessorCount = 0; predecessorCount < predecessorsLength; predecessorCount++) {
                predecessor = predecessorsCollection[predecessorCount];
                var from = 'from';
                var to = 'to';
                parentGanttRecord = this.parent.getRecordByID(predecessor[from]);
                childGanttRecord = this.parent.getRecordByID(predecessor[to]);
                if (this.parent.currentViewData && this.parent.currentViewData.indexOf(parentGanttRecord) !== -1 &&
                    this.parent.currentViewData.indexOf(childGanttRecord) !== -1) {
                    this.parent.connectorLineEditModule.updateConnectorLineObject(parentGanttRecord, childGanttRecord, predecessor);
                }
            }
        }
    };
    /**
     *
     * @param childGanttRecord
     * @param previousValue
     * @param validationOn
     * @private
     */
    Dependency.prototype.validatePredecessor = function (childGanttRecord, previousValue, validationOn) {
        if (!this.parent.enablePredecessorValidation) {
            return;
        }
        if (childGanttRecord.ganttProperties.predecessor) {
            var predecessorsCollection = childGanttRecord.ganttProperties.predecessor;
            var parentGanttRecord = void 0;
            var record = null;
            var predecessor = void 0;
            var currentTaskId_3 = childGanttRecord.ganttProperties.taskId.toString();
            var predecessors = predecessorsCollection.filter(function (data) {
                if (data.to === currentTaskId_3) {
                    return data;
                }
                else {
                    return null;
                }
            });
            var successors = predecessorsCollection.filter(function (data) {
                if (data.from === currentTaskId_3) {
                    return data;
                }
                else {
                    return null;
                }
            });
            for (var count = 0; count < predecessors.length; count++) {
                predecessor = predecessors[count];
                parentGanttRecord = this.parent.getRecordByID(predecessor.from);
                record = this.parent.getRecordByID(predecessor.to);
                if (this.parent.enablePredecessorValidation && record.ganttProperties.isAutoSchedule) {
                    this.parent.isValidationEnabled = true;
                }
                else {
                    this.parent.isValidationEnabled = false;
                }
                if ((childGanttRecord.ganttProperties.taskId.toString() === predecessor.to
                    || childGanttRecord.ganttProperties.taskId.toString() === predecessor.from)
                    && (!validationOn || validationOn === 'predecessor')) {
                    this.validateChildGanttRecord(parentGanttRecord, record);
                }
            }
            for (var count = 0; count < successors.length; count++) {
                predecessor = successors[count];
                parentGanttRecord = this.parent.getRecordByID(predecessor.from);
                record = this.parent.getRecordByID(predecessor.to);
                if (this.parent.enablePredecessorValidation && record.ganttProperties.isAutoSchedule) {
                    this.parent.isValidationEnabled = true;
                }
                else {
                    this.parent.isValidationEnabled = false;
                }
                if (validationOn !== 'predecessor' && this.parent.isValidationEnabled) {
                    this.validateChildGanttRecord(parentGanttRecord, record);
                }
                if (parentGanttRecord.expanded === false || record.expanded === false) {
                    if (record) {
                        this.validatePredecessor(record, undefined, 'successor');
                    }
                    continue;
                }
                if (record) {
                    this.validatePredecessor(record, undefined, 'successor');
                }
            }
        }
    };
    /**
     * Predecessor link validation dialog template
     * @param args
     * @private
     */
    Dependency.prototype.validationDialogTemplate = function (args) {
        var ganttId = this.parent.element.id;
        var contentdiv = createElement('div', {
            className: 'e-ValidationContent'
        });
        var taskData = getValue('task', args);
        var parenttaskData = getValue('parentTask', args);
        var violationType = getValue('violationType', args);
        var recordName = taskData.ganttProperties.taskName;
        var recordNewStartDate = this.parent.getFormatedDate(taskData.ganttProperties.startDate, 'MM/dd/yyyy');
        var parentName = parenttaskData.ganttProperties.taskName;
        var recordArgs = [recordName, parentName];
        var topContent;
        var topContentText;
        if (violationType === 'taskBeforePredecessor_FS') {
            topContentText = this.parent.localeObj.getConstant('taskBeforePredecessor_FS');
        }
        else if (violationType === 'taskAfterPredecessor_FS') {
            topContentText = this.parent.localeObj.getConstant('taskAfterPredecessor_FS');
        }
        else if (violationType === 'taskBeforePredecessor_SS') {
            topContentText = this.parent.localeObj.getConstant('taskBeforePredecessor_SS');
        }
        else if (violationType === 'taskAfterPredecessor_SS') {
            topContentText = this.parent.localeObj.getConstant('taskAfterPredecessor_SS');
        }
        else if (violationType === 'taskBeforePredecessor_FF') {
            topContentText = this.parent.localeObj.getConstant('taskBeforePredecessor_FF');
        }
        else if (violationType === 'taskAfterPredecessor_FF') {
            topContentText = this.parent.localeObj.getConstant('taskAfterPredecessor_FF');
        }
        else if (violationType === 'taskBeforePredecessor_SF') {
            topContentText = this.parent.localeObj.getConstant('taskBeforePredecessor_SF');
        }
        else if (violationType === 'taskAfterPredecessor_SF') {
            topContentText = this.parent.localeObj.getConstant('taskAfterPredecessor_SF');
        }
        topContentText = formatString(topContentText, recordArgs);
        topContent = '<div id="' + ganttId + '_ValidationText">' + topContentText + '<div>';
        var innerTable = '<table>' +
            '<tr><td><input type="radio" id="' + ganttId + '_ValidationCancel" name="ValidationRule" checked/><label for="'
            + ganttId + '_ValidationCancel" id= "' + ganttId + '_cancelLink">Cancel, keep the existing link</label></td></tr>' +
            '<tr><td><input type="radio" id="' + ganttId + '_ValidationRemoveline" name="ValidationRule"/><label for="'
            + ganttId + '_ValidationRemoveline" id="' + ganttId + '_removeLink">Remove the link and move <b>'
            + recordName + '</b> to start on <b>' + recordNewStartDate + '</b>.</label></td></tr>' +
            '<tr><td><input type="radio" id="' + ganttId + '_ValidationAddlineOffset" name="ValidationRule"/><label for="'
            + ganttId + '_ValidationAddlineOffset" id="' + ganttId + '_preserveLink">Move the <b>'
            + recordName + '</b> to start on <b>' + recordNewStartDate + '</b> and keep the link.</label></td></tr></table>';
        contentdiv.innerHTML = topContent + innerTable;
        return contentdiv;
    };
    /**
     * To render validation dialog
     * @return {void}
     * @private
     */
    Dependency.prototype.renderValidationDialog = function () {
        var validationDialog = new Dialog({
            header: 'Validate Editing',
            isModal: true,
            visible: false,
            width: '50%',
            showCloseIcon: true,
            close: this.validationDialogClose.bind(this),
            content: '',
            buttons: [
                {
                    click: this.validationDialogOkButton.bind(this),
                    buttonModel: { content: this.parent.localeObj.getConstant('okText'), isPrimary: true }
                },
                {
                    click: this.validationDialogCancelButton.bind(this),
                    buttonModel: { content: this.parent.localeObj.getConstant('cancel') }
                }
            ],
            target: this.parent.element,
            animationSettings: { effect: 'None' },
        });
        document.getElementById(this.parent.element.id + '_dialogValidationRule').innerHTML = '';
        validationDialog.appendTo('#' + this.parent.element.id + '_dialogValidationRule');
        this.parent.validationDialogElement = validationDialog;
    };
    Dependency.prototype.validationDialogOkButton = function () {
        var currentArgs = this.parent.currentEditedArgs;
        currentArgs.validateMode.preserveLinkWithEditing =
            document.getElementById(this.parent.element.id + '_ValidationAddlineOffset').checked;
        currentArgs.validateMode.removeLink =
            document.getElementById(this.parent.element.id + '_ValidationRemoveline').checked;
        currentArgs.validateMode.respectLink =
            document.getElementById(this.parent.element.id + '_ValidationCancel').checked;
        this.applyPredecessorOption();
        this.parent.validationDialogElement.hide();
    };
    Dependency.prototype.validationDialogCancelButton = function () {
        this.parent.currentEditedArgs.validateMode.respectLink = true;
        this.applyPredecessorOption();
        this.parent.validationDialogElement.hide();
    };
    Dependency.prototype.validationDialogClose = function (e) {
        if (getValue('isInteraction', e)) {
            this.parent.currentEditedArgs.validateMode.respectLink = true;
            this.applyPredecessorOption();
        }
    };
    /**
     * Validate and apply the predecessor option from validation dialog
     * @param buttonType
     * @return {void}
     * @private
     */
    Dependency.prototype.applyPredecessorOption = function () {
        var args = this.parent.currentEditedArgs;
        var ganttRecord = args.data;
        if (args.validateMode.respectLink) {
            this.parent.editModule.reUpdatePreviousRecords();
            this.parent.chartRowsModule.refreshRecords([args.data]);
        }
        else if (args.validateMode.removeLink) {
            this.removePredecessors(ganttRecord, this.validationPredecessor);
            this.parent.editModule.updateEditedTask(args.editEventArgs);
        }
        else if (args.validateMode.preserveLinkWithEditing) {
            this.calculateOffset(ganttRecord);
            this.parent.editModule.updateEditedTask(args.editEventArgs);
        }
    };
    Dependency.prototype.calculateOffset = function (record) {
        var prevPredecessor = extend([], record.ganttProperties.predecessor, [], true);
        var validPredecessor = this.getValidPredecessor(record);
        for (var i = 0; i < validPredecessor.length; i++) {
            var predecessor = validPredecessor[i];
            var parentTask = this.parent.getRecordByID(predecessor.from);
            var offset = void 0;
            if (isScheduledTask(parentTask)) {
                var tempStartDate = void 0;
                var tempEndDate = void 0;
                var tempDuration = void 0;
                var isNegativeOffset = void 0;
                switch (predecessor.type) {
                    case 'FS':
                        tempStartDate = new Date(parentTask.ganttProperties.endDate.getTime());
                        tempEndDate = new Date(record.ganttProperties.startDate.getTime());
                        break;
                    case 'SS':
                        tempStartDate = new Date(parentTask.ganttProperties.startDate.getTime());
                        tempEndDate = new Date(record.ganttProperties.startDate.getTime());
                        break;
                    case 'SF':
                        tempStartDate = new Date(parentTask.ganttProperties.startDate.getTime());
                        tempEndDate = new Date(record.ganttProperties.endDate.getTime());
                        break;
                    case 'FF':
                        tempStartDate = new Date(parentTask.ganttProperties.endDate.getTime());
                        tempEndDate = new Date(record.ganttProperties.endDate.getTime());
                        break;
                }
                if (tempStartDate.getTime() < tempEndDate.getTime()) {
                    tempStartDate = this.dateValidateModule.checkStartDate(tempStartDate);
                    tempEndDate = this.dateValidateModule.checkEndDate(tempEndDate, null);
                    isNegativeOffset = false;
                }
                else {
                    var tempDate = new Date(tempStartDate.getTime());
                    tempStartDate = this.dateValidateModule.checkStartDate(tempEndDate);
                    tempEndDate = this.dateValidateModule.checkEndDate(tempDate, null);
                    isNegativeOffset = true;
                }
                if (tempStartDate.getTime() < tempEndDate.getTime()) {
                    tempDuration = this.dateValidateModule.getDuration(tempStartDate, tempEndDate, predecessor.offsetUnit, true, true);
                    offset = isNegativeOffset ? (tempDuration * -1) : tempDuration;
                }
                else {
                    offset = 0;
                }
            }
            else {
                offset = 0;
            }
            var preIndex = getIndex(predecessor, 'from', prevPredecessor, 'to');
            prevPredecessor[preIndex].offset = offset;
            // Update predecessor in predecessor task
            var parentPredecessors = extend([], parentTask.ganttProperties.predecessor, [], true);
            var parentPreIndex = getIndex(predecessor, 'from', parentPredecessors, 'to');
            parentPredecessors[parentPreIndex].offset = offset;
            this.parent.setRecordValue('predecessor', parentPredecessors, parentTask.ganttProperties, true);
        }
        this.parent.setRecordValue('predecessor', prevPredecessor, record.ganttProperties, true);
        var predecessorString = this.getPredecessorStringValue(record);
        this.parent.setRecordValue('predecessorsName', predecessorString, record.ganttProperties, true);
        this.parent.setRecordValue('taskData.' + this.parent.taskFields.dependency, predecessorString, record);
        this.parent.setRecordValue(this.parent.taskFields.dependency, predecessorString, record);
    };
    /**
     * Update predecessor value with user selection option in predecessor validation dialog
     * @param args
     * @return {void}
     */
    Dependency.prototype.removePredecessors = function (ganttRecord, predecessor) {
        var prevPredecessor = extend([], [], ganttRecord.ganttProperties.predecessor, true);
        var preLength = predecessor.length;
        for (var i = 0; i < preLength; i++) {
            var parentGanttRecord = this.parent.getRecordByID(predecessor[i].from);
            var parentPredecessor = extend([], [], parentGanttRecord.ganttProperties.predecessor, true);
            var index = getIndex(predecessor[i], 'from', prevPredecessor, 'to');
            prevPredecessor.splice(index, 1);
            var parentIndex = getIndex(predecessor[i], 'from', parentPredecessor, 'to');
            parentPredecessor.splice(parentIndex, 1);
            this.parent.setRecordValue('predecessor', parentPredecessor, parentGanttRecord.ganttProperties, true);
        }
        if (prevPredecessor.length !== ganttRecord.ganttProperties.predecessor.length) {
            this.parent.setRecordValue('predecessor', prevPredecessor, ganttRecord.ganttProperties, true);
            var predecessorString = this.getPredecessorStringValue(ganttRecord);
            this.parent.setRecordValue('predecessorsName', predecessorString, ganttRecord.ganttProperties, true);
            this.parent.setRecordValue('taskData.' + this.parent.taskFields.dependency, predecessorString, ganttRecord);
            this.parent.setRecordValue(this.parent.taskFields.dependency, predecessorString, ganttRecord);
        }
    };
    /**
     * To open predecessor validation dialog
     * @param args
     * @return {void}
     * @private
     */
    Dependency.prototype.openValidationDialog = function (args) {
        var contentTemplate = this.validationDialogTemplate(args);
        this.parent.validationDialogElement.setProperties({ content: contentTemplate });
        this.parent.validationDialogElement.show();
    };
    /**
     * Method to get validate able predecessor alone from record
     * @param record
     * @private
     */
    Dependency.prototype.getValidPredecessor = function (record) {
        var validPredecessor = [];
        var recPredecessor = record.ganttProperties.predecessor;
        if (recPredecessor && recPredecessor.length > 0) {
            validPredecessor = recPredecessor.filter(function (value) {
                return value.from !== record.ganttProperties.taskId.toString();
            });
        }
        return validPredecessor;
    };
    /**
     * To validate the types while editing the taskbar
     * @param args
     * @return {boolean}
     * @private
     */
    Dependency.prototype.validateTypes = function (ganttRecord) {
        var predecessor = this.getValidPredecessor(ganttRecord);
        var parentGanttRecord;
        this.validationPredecessor = [];
        var violatedParent;
        var violateType;
        var startDate = this.getPredecessorDate(ganttRecord, predecessor);
        var ganttTaskData = ganttRecord.ganttProperties;
        var endDate = this.dateValidateModule.getEndDate(startDate, ganttTaskData.duration, ganttTaskData.durationUnit, ganttTaskData, false);
        for (var i = 0; i < predecessor.length; i++) {
            parentGanttRecord = this.parent.getRecordByID(predecessor[i].from);
            var violationType = null;
            if (predecessor[i].type === 'FS') {
                if (ganttTaskData.startDate < startDate) {
                    this.validationPredecessor.push(predecessor[i]);
                    violationType = 'taskBeforePredecessor_FS';
                }
                else if (ganttTaskData.startDate > startDate) {
                    this.validationPredecessor.push(predecessor[i]);
                    violationType = 'taskAfterPredecessor_FS';
                }
            }
            else if (predecessor[i].type === 'SS') {
                if (ganttTaskData.startDate < startDate) {
                    this.validationPredecessor.push(predecessor[i]);
                    violationType = 'taskBeforePredecessor_SS';
                }
                else if (ganttTaskData.startDate > startDate) {
                    this.validationPredecessor.push(predecessor[i]);
                    violationType = 'taskAfterPredecessor_SS';
                }
            }
            else if (predecessor[i].type === 'FF') {
                if (endDate < parentGanttRecord.ganttProperties.endDate) {
                    this.validationPredecessor.push(predecessor[i]);
                    violationType = 'taskBeforePredecessor_FF';
                }
                else if (endDate > parentGanttRecord.ganttProperties.endDate) {
                    this.validationPredecessor.push(predecessor[i]);
                    violationType = 'taskAfterPredecessor_FF';
                }
            }
            else if (predecessor[i].type === 'SF') {
                if (endDate < parentGanttRecord.ganttProperties.startDate) {
                    this.validationPredecessor.push(predecessor[i]);
                    violationType = 'taskBeforePredecessor_SF';
                }
                else if (endDate > parentGanttRecord.ganttProperties.startDate) {
                    this.validationPredecessor.push(predecessor[i]);
                    violationType = 'taskAfterPredecessor_SF';
                }
            }
            if (!isNullOrUndefined(violationType) && isNullOrUndefined(violateType)) {
                violatedParent = parentGanttRecord;
                violateType = violationType;
            }
        }
        var validateArgs = {
            parentTask: violatedParent,
            task: ganttRecord,
            violationType: violateType
        };
        return validateArgs;
    };
    /**
     * Method to remove and update new predecessor collection in successor record
     * @param data
     * @private
     */
    Dependency.prototype.addRemovePredecessor = function (data) {
        var prevData = this.parent.previousRecords[data.uniqueID];
        var newPredecessor = data.ganttProperties.predecessor.slice();
        if (prevData && prevData.ganttProperties && prevData.ganttProperties.hasOwnProperty('predecessor')) {
            var prevPredecessor = prevData.ganttProperties.predecessor;
            if (!isNullOrUndefined(prevPredecessor)) {
                for (var p = 0; p < prevPredecessor.length; p++) {
                    var parentGanttRecord = this.parent.getRecordByID(prevPredecessor[p].from);
                    if (parentGanttRecord === data) {
                        data.ganttProperties.predecessor.push(prevPredecessor[p]);
                    }
                    else {
                        var parentPredecessor = extend([], [], parentGanttRecord.ganttProperties.predecessor, true);
                        var parentIndex = getIndex(prevPredecessor[p], 'from', parentPredecessor, 'to');
                        if (parentIndex !== -1) {
                            parentPredecessor.splice(parentIndex, 1);
                            this.parent.setRecordValue('predecessor', parentPredecessor, parentGanttRecord.ganttProperties, true);
                        }
                    }
                }
            }
            if (!isNullOrUndefined(newPredecessor)) {
                for (var n = 0; n < newPredecessor.length; n++) {
                    var parentGanttRecord = this.parent.getRecordByID(newPredecessor[n].from);
                    var parentPredecessor = extend([], [], parentGanttRecord.ganttProperties.predecessor, true);
                    parentPredecessor.push(newPredecessor[n]);
                    this.parent.setRecordValue('predecessor', parentPredecessor, parentGanttRecord.ganttProperties, true);
                }
            }
        }
    };
    return Dependency;
}());

/**
 * To render the connector line in Gantt
 */
var ConnectorLine = /** @__PURE__ @class */ (function () {
    function ConnectorLine(ganttObj) {
        this.parent = ganttObj;
        this.dependencyViewContainer =
            createElement('div', { className: dependencyViewContainer });
        this.initPublicProp();
    }
    /**
     * To get connector line gap.
     * @return {number}
     * @private
     */
    ConnectorLine.prototype.getconnectorLineGap = function (data) {
        var width = 0;
        width = (data.milestoneChild ?
            ((this.parent.chartRowsModule.milestoneMarginTop / 2) + (this.parent.chartRowsModule.milestoneHeight / 2)) :
            ((this.parent.chartRowsModule.taskBarMarginTop / 2) + (this.parent.chartRowsModule.taskBarHeight / 2)));
        return width;
    };
    /**
     * To initialize the public property.
     * @return {void}
     * @private
     */
    ConnectorLine.prototype.initPublicProp = function () {
        this.lineColor = this.parent.connectorLineBackground;
        this.lineStroke = (this.parent.connectorLineWidth) > 4 ? 4 : this.parent.connectorLineWidth;
        this.createConnectorLineTooltipTable();
    };
    ConnectorLine.prototype.getTaskbarMidpoint = function (isMilestone) {
        return Math.floor(isMilestone ?
            (this.parent.chartRowsModule.milestoneMarginTop + (this.parent.chartRowsModule.milestoneHeight / 2)) :
            (this.parent.chartRowsModule.taskBarMarginTop + (this.parent.chartRowsModule.taskBarHeight / 2))) + 1;
    };
    /**
     * To connector line object collection.
     * @return {void}
     * @private
     */
    ConnectorLine.prototype.createConnectorLineObject = function (parentGanttData, childGanttData, predecessor) {
        var connectorObj = {};
        var updatedRecords = this.parent.getExpandedRecords(this.parent.currentViewData);
        var parentIndex = updatedRecords.indexOf(parentGanttData);
        var childIndex = updatedRecords.indexOf(childGanttData);
        var parentGanttRecord = parentGanttData.ganttProperties;
        var childGanttRecord = childGanttData.ganttProperties;
        if (parentIndex === -1 || childIndex === -1) {
            return null;
        }
        else {
            connectorObj.parentLeft = parentGanttRecord.isMilestone ?
                parentGanttRecord.left - (this.parent.chartRowsModule.milestoneHeight / 2) : parentGanttRecord.left;
            connectorObj.childLeft = childGanttRecord.isMilestone ?
                childGanttRecord.left - (this.parent.chartRowsModule.milestoneHeight / 2) : childGanttRecord.left;
            connectorObj.parentWidth = parentGanttRecord.width === 0 || parentGanttRecord.isMilestone ?
                (Math.floor(this.parent.chartRowsModule.milestoneHeight)) : parentGanttRecord.width;
            connectorObj.childWidth = childGanttRecord.width === 0 || childGanttRecord.isMilestone ?
                (Math.floor(this.parent.chartRowsModule.milestoneHeight)) : childGanttRecord.width;
            connectorObj.parentIndex = parentIndex;
            connectorObj.childIndex = childIndex;
            connectorObj.rowHeight = this.parent.rowHeight;
            connectorObj.type = predecessor.type;
            connectorObj.connectorLineId = 'parent' + parentGanttRecord.taskId + 'child' + childGanttRecord.taskId;
            connectorObj.milestoneParent = parentGanttRecord.isMilestone ? true : false;
            connectorObj.milestoneChild = childGanttRecord.isMilestone ? true : false;
            if (isNullOrUndefined(isScheduledTask(parentGanttRecord)) || isNullOrUndefined(isScheduledTask(childGanttRecord))) {
                return null;
            }
            else {
                return connectorObj;
            }
        }
    };
    /**
     * To render connector line.
     * @return {void}
     * @private
     */
    ConnectorLine.prototype.renderConnectorLines = function (connectorLinesCollection) {
        var connectorLine$$1 = '';
        for (var index = 0; index < connectorLinesCollection.length; index++) {
            connectorLine$$1 = connectorLine$$1 + this.getConnectorLineTemplate(connectorLinesCollection[index]);
        }
        this.dependencyViewContainer.innerHTML = connectorLine$$1;
        this.parent.ganttChartModule.scrollElement.appendChild(this.dependencyViewContainer);
    };
    /**
     * To get parent position.
     * @return {void}
     * @private
     */
    /* tslint:disable-next-line:max-func-body-length */
    ConnectorLine.prototype.getParentPosition = function (data) {
        if (data.parentIndex < data.childIndex) {
            if (data.type === 'FF') {
                if ((data.childLeft + data.childWidth) >= (data.parentLeft + data.parentWidth)) {
                    return 'FFType2';
                }
                else {
                    return 'FFType1';
                }
            }
            else if ((data.parentLeft < data.childLeft) && (data.childLeft > (data.parentLeft + data.parentWidth + 25))) {
                if (data.type === 'FS') {
                    return 'FSType1';
                }
                if (data.type === 'SF') {
                    return 'SFType1';
                }
                else if (data.type === 'SS') {
                    return 'SSType2';
                }
                else if (data.type === 'FF') {
                    return 'FFType2';
                }
            }
            else if ((data.parentLeft < data.childLeft && (data.childLeft < (data.parentLeft + data.parentWidth)))
                || (data.parentLeft === data.childLeft || data.parentLeft > data.childLeft)) {
                if (data.parentLeft > (data.childLeft + data.childWidth + 25)) {
                    if (data.type === 'SF') {
                        return 'SFType2';
                    }
                }
                if (data.parentLeft > data.childLeft) {
                    if (data.type === 'SS') {
                        return 'SSType1';
                    }
                    if (data.type === 'SF') {
                        return 'SFType1';
                    }
                    if (data.type === 'FF') {
                        return 'FFType1';
                    }
                }
                else if ((data.childLeft + data.childWidth) > (data.parentLeft + data.parentWidth)) {
                    if (data.type === 'FF') {
                        return 'FFType2';
                    }
                }
                if (data.type === 'FS') {
                    return 'FSType2';
                }
                else if (data.type === 'SS') {
                    return 'SSType2';
                }
                else if (data.type === 'FF') {
                    return 'FFType1';
                }
                else if (data.type === 'SF') {
                    return 'SFType1';
                }
            }
            else if ((data.parentLeft) < data.childLeft) {
                if (data.type === 'FS') {
                    return 'FSType2';
                }
                else if (data.type === 'FF') {
                    return 'FFType2';
                }
                else if (data.type === 'SS') {
                    return 'SSType2';
                }
                else if (data.type === 'SF') {
                    return 'SFType1';
                }
            }
        }
        else if (data.parentIndex > data.childIndex) {
            if ((data.parentLeft < data.childLeft) && (data.childLeft > (data.parentLeft + data.parentWidth))) {
                if (data.type === 'FS') {
                    if (30 >= (data.childLeft - (data.milestoneParent ?
                        (data.parentLeft + data.parentWidth + 4) : (data.parentLeft + data.parentWidth)))) {
                        return 'FSType3';
                    }
                    else {
                        return 'FSType4';
                    }
                }
                if (data.parentLeft < data.childLeft || ((data.childLeft + data.childWidth) > (data.parentLeft + data.parentWidth))) {
                    if (data.type === 'SS') {
                        return 'SSType4';
                    }
                    if (data.type === 'FF') {
                        return 'FFType4';
                    }
                    if (data.type === 'SF') {
                        return 'SFType4';
                    }
                }
                else if ((data.childLeft + data.childWidth) > (data.parentLeft + data.parentWidth)) {
                    if (data.type === 'FF') {
                        return 'FFType4';
                    }
                }
            }
            else if ((data.parentLeft < data.childLeft && (data.childLeft < (data.parentLeft + data.parentWidth)))
                || (data.parentLeft === data.childLeft || data.parentLeft > data.childLeft)) {
                if ((data.childLeft + data.childWidth) <= (data.parentLeft + data.parentWidth)) {
                    if (data.type === 'FF') {
                        return 'FFType3';
                    }
                    if (data.type === 'SF') {
                        if ((data.childLeft + data.childWidth + 25) < (data.parentLeft)) {
                            return 'SFType3';
                        }
                        else {
                            return 'SFType4';
                        }
                    }
                    if (data.type === 'SS') {
                        if (data.childLeft <= data.parentLeft) {
                            return 'SSType3';
                        }
                        else {
                            return 'SSType4';
                        }
                    }
                }
                else if ((data.childLeft + data.childWidth) > (data.parentLeft + data.parentWidth)) {
                    if (data.type === 'FF') {
                        return 'FFType4';
                    }
                    if (data.type === 'SF') {
                        return 'SFType4';
                    }
                    if (data.type === 'SS') {
                        if (data.childLeft <= data.parentLeft) {
                            return 'SSType3';
                        }
                        else {
                            return 'SSType4';
                        }
                    }
                }
                if (data.type === 'FS') {
                    return 'FSType3';
                }
            }
            else if (data.parentLeft < data.childLeft) {
                if (data.type === 'FS') {
                    return 'FSType3';
                }
                if (data.type === 'SS') {
                    return 'SSType4';
                }
                if (data.type === 'FF') {
                    return 'FFType4';
                }
                if (data.type === 'SF') {
                    return 'SFType4';
                }
            }
        }
        return null;
    };
    /**
     * To get line height.
     * @return {void}
     * @private
     */
    ConnectorLine.prototype.getHeightValue = function (data) {
        return (data.parentIndex * data.rowHeight) > (data.childIndex * data.rowHeight) ?
            ((data.parentIndex * data.rowHeight) - (data.childIndex * data.rowHeight)) :
            ((data.childIndex * data.rowHeight) - (data.parentIndex * data.rowHeight));
    };
    /**
     * To get sstype2 inner element width.
     * @return {void}
     * @private
     */
    ConnectorLine.prototype.getInnerElementWidthSSType2 = function (data) {
        if (data.parentLeft === data.childLeft) {
            return 10;
        }
        return (data.childLeft - data.parentLeft);
    };
    /**
     * To get sstype2 inner element left.
     * @return {void}
     * @private
     */
    ConnectorLine.prototype.getInnerElementLeftSSType2 = function (data) {
        if (data.parentLeft === data.childLeft) {
            return (data.parentLeft - 20);
        }
        return (data.parentLeft - 10);
    };
    /**
     * To get sstype2 inner child element width.
     * @return {void}
     * @private
     */
    ConnectorLine.prototype.getInnerChildWidthSSType2 = function (data) {
        if ((data.parentLeft + data.parentWidth) < data.childLeft) {
            return 10;
        }
        if (data.parentLeft === data.childLeft) {
            return 20;
        }
        if ((data.parentLeft + data.parentWidth) >= data.childLeft) {
            return 10;
        }
        return (data.childLeft - data.parentLeft);
    };
    ConnectorLine.prototype.getBorderStyles = function (cssType, unit) {
        var borderWidth = 'border-' + cssType + '-width:' + unit + 'px;';
        var borderStyle = 'border-' + cssType + '-style:solid;';
        var borderColor = !isNullOrUndefined(this.lineColor) ? 'border-' + cssType + '-color:' + this.lineColor + ';' : '';
        return (borderWidth + borderStyle + borderColor);
    };
    /**
     * To get connector line template.
     * @return {void}
     * @private
     */
    /* tslint:disable-next-line:max-func-body-length */
    ConnectorLine.prototype.getConnectorLineTemplate = function (data) {
        var setInnerChildWidthSSType2 = this.getInnerChildWidthSSType2(data);
        var setInnerElementWidthSSType2 = this.getInnerElementWidthSSType2(data);
        var setInnerElementLeftSSType2 = this.getInnerElementLeftSSType2(data);
        var heightValue = this.getHeightValue(data);
        var isMilestoneParent = data.milestoneParent ? true : false;
        var isMilestone = data.milestoneChild ? true : false;
        var connectorContainer = '';
        if (this.getParentPosition(data)) {
            connectorContainer = '<div id="ConnectorLine' + data.connectorLineId + '" style="background-color=black">';
            var div = '<div class="' + connectorLineContainer + '" style="';
            var eLine = '<div class="' + connectorLine + '" style="';
            var rightArrow = '<div class="' + connectorLineRightArrow + '" style="';
            var leftArrow = '<div class="' + connectorLineLeftArrow + '" style="';
            var duplicateStingOne = leftArrow + (isMilestone ? 'left:0px;' : '') +
                this.getBorderStyles('right', 10) +
                'top:' + (-5 - this.lineStroke + (this.lineStroke - 1)) + 'px;border-bottom-width:' + (5 + this.lineStroke) + 'px;' +
                'border-top-width:' + (5 + this.lineStroke) + 'px;width:0;height:0;position:relative;"></div>';
            var duplicateStingTwo = this.getBorderStyles('left', 10) +
                'top:' + (-6) + 'px;border-bottom-width:' + (5 + this.lineStroke) + 'px;' +
                'border-top-width:' + (5 + this.lineStroke) + 'px;width:0;height:0;position:relative;"></div>';
            var duplicateStingThree = this.getBorderStyles('top', this.lineStroke) + 'position:relative;"></div>' + eLine +
                'top:' + (-(13 + ((this.lineStroke - 1) * 2))) + 'px;width:0px;' + this.getBorderStyles('left', this.lineStroke) +
                this.getBorderStyles('top', (heightValue - (this.lineStroke - 1))) + 'position:relative;"></div>';
            var duplicateStingFour = leftArrow + 'left:' +
                (isMilestone ? (((data.childLeft + data.childWidth) - (data.parentLeft)) + 10) :
                    (((data.childLeft + data.childWidth) - (data.parentLeft)) + 10)) + 'px;' +
                this.getBorderStyles('right', 10);
            var duplicateStingFive = 'top:' + (-(6 + (5 + this.lineStroke) + (this.lineStroke / 2))) + 'px;' +
                this.getBorderStyles('top', this.lineStroke) + 'position:relative;"></div>';
            if (this.getParentPosition(data) === 'FSType1') {
                div = div + 'left:' + (data.parentLeft + data.parentWidth) + 'px;top:' +
                    ((data.parentIndex * data.rowHeight) + this.getTaskbarMidpoint(isMilestone) - (this.lineStroke - 1)) + 'px;' +
                    'width:1px;height:' + heightValue + 'px;position:absolute" data-connectortype="FSType1">';
                div = div + eLine;
                div = div + 'left:' + (isMilestoneParent ? -1 : 0) + 'px;width:' + (isMilestoneParent ?
                    ((((data.childLeft - (data.parentLeft + data.parentWidth + 10)) + this.lineStroke) - 10) + 1) :
                    (((data.childLeft - (data.parentLeft + data.parentWidth + 10)) + this.lineStroke) - 10)) + 'px;' +
                    this.getBorderStyles('top', this.lineStroke) + 'position:relative;"></div>';
                div = div + eLine;
                div = div + 'left:' + (((data.childLeft - (data.parentLeft + data.parentWidth + 10))) - 10) + 'px;' +
                    'width:0px;' + this.getBorderStyles('right', this.lineStroke) +
                    this.getBorderStyles('top', (heightValue - this.lineStroke)) + 'position:relative;"></div>';
                div = div + eLine;
                div = div + 'left:' + (((data.childLeft - (data.parentLeft + data.parentWidth + 10))) - 10) + 'px;width:10px;' +
                    this.getBorderStyles('top', this.lineStroke) + 'position:relative;"></div>';
                div = div + rightArrow;
                div = div + 'left:' + (data.childLeft - (data.parentLeft + data.parentWidth + 10)) + 'px;' +
                    this.getBorderStyles('left', 10) + 'top:' + (-6 - this.lineStroke) + 'px;border-bottom-width:' + (5 + this.lineStroke) +
                    'px;border-top-width:' + (5 + this.lineStroke) + 'px;width:0;height:0;position:relative;"></div></div>';
            }
            if (this.getParentPosition(data) === 'FSType2') {
                div = div + 'left:' + data.parentLeft + 'px;top:' + ((data.parentIndex * data.rowHeight) +
                    this.getTaskbarMidpoint(isMilestone) - (this.lineStroke - 1)) + 'px;' +
                    'width:1px;height:' + heightValue + 'px;position:absolute" data-connectortype="FSType2">';
                div = div + eLine;
                div = div + 'left:' + (isMilestoneParent ? data.parentWidth - 1 : data.parentWidth) + 'px;width:' +
                    (isMilestoneParent ? 11 : 10) + 'px;' +
                    this.getBorderStyles('top', this.lineStroke) + 'position:relative;"></div>';
                div = div + eLine;
                div = div + 'left:' + (data.parentWidth + 10 - this.lineStroke) + 'px;' +
                    this.getBorderStyles('left', this.lineStroke) + 'width:0px;' +
                    this.getBorderStyles('top', (heightValue - this.getconnectorLineGap(data) - this.lineStroke)) + 'position:relative;"></div>';
                div = div + eLine;
                div = div + 'left:' + (data.parentWidth - (((data.parentLeft + data.parentWidth) - data.childLeft) + 20)) + 'px;' +
                    'width:' + (((data.parentLeft + data.parentWidth) - data.childLeft) + 30) + 'px;' +
                    this.getBorderStyles('top', this.lineStroke) + 'position:relative;"></div>';
                div = div + eLine;
                div = div + 'left:' + (data.parentWidth - (((data.parentLeft +
                    data.parentWidth) - data.childLeft) + 20)) + 'px;width:0px;' +
                    this.getBorderStyles('top', (this.getconnectorLineGap(data) - this.lineStroke)) +
                    this.getBorderStyles('left', this.lineStroke) + 'position:relative;"></div>';
                div = div + eLine;
                div = div + 'left:' + (data.parentWidth - (((data.parentLeft +
                    data.parentWidth) - data.childLeft) + 20)) + 'px;width:10px;' +
                    this.getBorderStyles('top', this.lineStroke) + 'position:relative;"></div>';
                div = div + rightArrow;
                div = div + 'left:' + (data.parentWidth - (((data.parentLeft + data.parentWidth) - data.childLeft) + 10)) + 'px;' +
                    this.getBorderStyles('left', 10) + 'border-bottom-width:' + (5 + this.lineStroke) + 'px;' +
                    'border-top-width:' + (5 + this.lineStroke) + 'px;top:' + (-6 - this.lineStroke) +
                    'px;width:0;height:0;position:relative;"></div></div>';
            }
            if (this.getParentPosition(data) === 'FSType3') {
                div = div + 'left:' + (data.childLeft - 20) + 'px;top:' +
                    ((data.childIndex * data.rowHeight) + this.getTaskbarMidpoint(isMilestoneParent) - (this.lineStroke - 1)) + 'px;' +
                    'width:1px;height:' + heightValue + 'px;position:absolute" data-connectortype="FSType3">';
                div = div + rightArrow;
                div = div + 'left:10px;' + this.getBorderStyles('left', 10) +
                    'border-bottom-width:' + (5 + this.lineStroke) + 'px;border-top-width:' + (5 + this.lineStroke) + 'px;' +
                    'top:' + (-6) + 'px;width:0;height:0;position:relative;"></div>';
                div = div + eLine;
                div = div + 'width:10px;' + this.getBorderStyles('top', this.lineStroke) +
                    'position:relative;top:' + (-(6 + (5 + this.lineStroke) + Math.round(this.lineStroke / 2))) + 'px;"></div>';
                div = div + eLine;
                div = div + 'width:' + this.lineStroke + 'px;' + this.getBorderStyles('top', (heightValue - this.getconnectorLineGap(data) - this.lineStroke + 1)) +
                    'position:relative;top:' + (-(13 + ((this.lineStroke - 1) * 2))) + 'px;"></div>';
                div = div + eLine;
                div = div + 'width:' + (((data.parentLeft + data.parentWidth) - data.childLeft) + 30) + 'px;' +
                    this.getBorderStyles('top', this.lineStroke) + 'position:relative;top:' +
                    (-(13 + ((this.lineStroke - 1) * 2))) + 'px;"></div>';
                div = div + eLine;
                div = div + 'left:' + (((data.parentLeft + data.parentWidth) - data.childLeft) + (30 - this.lineStroke)) +
                    'px;width:0px;' + 'height:' + (this.getconnectorLineGap(data) - this.lineStroke) + 'px;' +
                    this.getBorderStyles('left', this.lineStroke) + 'position:relative;' +
                    'top:' + (-(13 + ((this.lineStroke - 1) * 2))) + 'px;"></div>';
                div = div + eLine;
                div = div + (isMilestoneParent ? 'left:' + (((data.parentLeft +
                    data.parentWidth) - data.childLeft) + (18 - this.lineStroke)) + 'px;width:' + (12 + this.lineStroke) + 'px;' : 'left:' +
                    (((data.parentLeft + data.parentWidth) - data.childLeft) + 20) + 'px;width:10px;') +
                    this.getBorderStyles('top', this.lineStroke) + 'position:relative;top:' +
                    (-(13 + ((this.lineStroke - 1) * 2))) + 'px;"></div></div>';
            }
            if (this.getParentPosition(data) === 'FSType4') {
                div = div + 'left:' + (data.parentLeft + data.parentWidth) + 'px;top:' +
                    ((data.childIndex * data.rowHeight) + this.getTaskbarMidpoint(isMilestone) - (this.lineStroke - 1)) + 'px;' +
                    'width:1px;height:' + heightValue + 'px;position:absolute" data-connectortype="FSType4">';
                div = div + rightArrow;
                div = div + 'left:' + (data.childLeft - (data.parentLeft + data.parentWidth + 10)) + 'px;' +
                    this.getBorderStyles('left', 10) + 'top:' + (-6) + 'px;' +
                    'border-bottom-width:' + (5 + this.lineStroke) + 'px;border-top-width:' +
                    (5 + this.lineStroke) + 'px;width:0;height:0;position:relative;"></div>';
                div = div + eLine;
                div = div + 'left:' + (data.childLeft - (data.parentLeft + data.parentWidth) - 20) +
                    'px;top:' + (-(6 + (5 + this.lineStroke) + Math.round(this.lineStroke / 2))) + 'px;width:10px;' +
                    this.getBorderStyles('top', this.lineStroke) +
                    'position:relative;"></div>';
                div = div + eLine;
                div = div + 'top:' + (-(13 + ((this.lineStroke - 1) * 2))) + 'px;left:' +
                    (data.childLeft - (data.parentLeft + data.parentWidth) - 20) + 'px;width:0px;' +
                    this.getBorderStyles('left', this.lineStroke) +
                    this.getBorderStyles('top', (heightValue - this.lineStroke + 1)) + 'position:relative;"></div>';
                div = div + eLine;
                div = div + (isMilestoneParent ? 'left:-1px;' : '') + 'top:' +
                    (-(13 + ((this.lineStroke - 1) * 2))) + 'px;width:' +
                    (isMilestoneParent ? ((data.childLeft - (data.parentLeft + data.parentWidth + 20) + 1) + this.lineStroke) :
                        ((data.childLeft - (data.parentLeft + data.parentWidth + 20)) + this.lineStroke)) + 'px;' +
                    this.getBorderStyles('top', this.lineStroke) + 'position:relative;"></div></div>';
            }
            if (this.getParentPosition(data) === 'SSType4') {
                div = div + 'left:' + (data.parentLeft - 10) + 'px;top:' +
                    ((data.childIndex * data.rowHeight) + this.getTaskbarMidpoint(isMilestone) - (this.lineStroke - 1)) + 'px;' +
                    'width:1px;height:' + heightValue + 'px;position:absolute" data-connectortype="SSType4">';
                div = div + rightArrow;
                div = div + 'left:' + (data.childLeft - data.parentLeft) + 'px;' + duplicateStingTwo;
                div = div + eLine;
                div = div + 'top:' + (-(6 + (5 + this.lineStroke) + (this.lineStroke / 2))) + 'px;width:' +
                    (data.childLeft - data.parentLeft) + 'px;' + duplicateStingThree;
                div = div + eLine;
                div = div + 'top:' + (-(13 + ((this.lineStroke - 1) * 2))) + 'px;width:10px;' +
                    this.getBorderStyles('top', this.lineStroke) + 'position:relative;"></div></div>';
            }
            if (this.getParentPosition(data) === 'SSType3') {
                div = div + 'left:' + (data.childLeft - 20) + 'px;top:' +
                    ((data.childIndex * data.rowHeight) + this.getTaskbarMidpoint(isMilestone) - (this.lineStroke - 1)) + 'px;' +
                    'width:1px;height:' + heightValue + 'px;position:absolute" data-connectortype="SSType3">';
                div = div + rightArrow;
                div = div + 'left:10px;' + duplicateStingTwo;
                div = div + eLine;
                div = div + 'top:' + (-(6 + (5 + this.lineStroke) + (this.lineStroke / 2))) + 'px;width:10px;' + duplicateStingThree;
                div = div + eLine;
                div = div + 'top:' + (-(13 + ((this.lineStroke - 1) * 2))) + 'px;width:' +
                    (data.parentLeft - data.childLeft + 21) + 'px;' +
                    this.getBorderStyles('top', this.lineStroke) + 'position:relative;"></div></div>';
            }
            if (this.getParentPosition(data) === 'SSType2') {
                div = div + 'left:' + setInnerElementLeftSSType2 + 'px;top:' +
                    ((data.parentIndex * data.rowHeight) + this.getTaskbarMidpoint(isMilestoneParent) - (this.lineStroke - 1)) + 'px;' +
                    'width:1px;height:' + heightValue + 'px;position:absolute" data-connectortype="SSType2">';
                div = div + eLine;
                div = div + 'width:' + (setInnerChildWidthSSType2 + 1) + 'px;' +
                    this.getBorderStyles('top', this.lineStroke) + 'position:relative;"></div>';
                div = div + eLine;
                div = div + 'width:0px;' + this.getBorderStyles('left', this.lineStroke) +
                    this.getBorderStyles('top', (heightValue - this.lineStroke)) + 'position:relative;"></div>';
                div = div + eLine;
                div = div + 'width:' + setInnerElementWidthSSType2 + 'px;' +
                    this.getBorderStyles('top', this.lineStroke) + 'position:relative;"></div>';
                div = div + rightArrow;
                div = div + 'left:' + setInnerElementWidthSSType2 + 'px;' +
                    this.getBorderStyles('left', 10) + 'top:' + (-6 - this.lineStroke) + 'px;' +
                    'border-bottom-width:' + (5 + this.lineStroke) + 'px;border-top-width:' +
                    (5 + this.lineStroke) + 'px;width:0;' +
                    'height:0;position:relative;"></div></div>';
            }
            if (this.getParentPosition(data) === 'SSType1') {
                div = div + 'left:' + (data.childLeft - 20) + 'px;top:' + ((data.parentIndex * data.rowHeight) +
                    this.getTaskbarMidpoint(isMilestoneParent) - (this.lineStroke - 1)) + 'px;' +
                    'width:1px;height:' + heightValue + 'px;position:absolute" data-connectortype="SSType1">';
                div = div + eLine;
                div = div + 'width:' + (data.parentLeft - data.childLeft + 21) + 'px;' +
                    this.getBorderStyles('top', this.lineStroke) + 'position:relative;"></div>';
                div = div + eLine;
                div = div + 'width:0px;' + this.getBorderStyles('left', this.lineStroke) +
                    this.getBorderStyles('top', (heightValue - this.lineStroke)) + 'position:relative;"></div>';
                div = div + eLine;
                div = div + 'width:10px;' + this.getBorderStyles('top', this.lineStroke) + 'position:relative;"></div>';
                div = div + rightArrow;
                div = div + 'left:10px;' + this.getBorderStyles('left', 10) +
                    'top:' + (-6 - this.lineStroke) + 'px;border-bottom-width:' + (5 + this.lineStroke) + 'px;' +
                    'border-top-width:' + (5 + this.lineStroke) + 'px;width:0;height:0;position:relative;"></div></div>';
            }
            if (this.getParentPosition(data) === 'FFType1') {
                div = div + 'left:' + (data.childLeft + data.childWidth) + 'px;top:' +
                    ((data.parentIndex * data.rowHeight) + this.getTaskbarMidpoint(isMilestoneParent) - (this.lineStroke - 1)) + 'px;' +
                    'width:1px;height:' + heightValue + 'px;position:absolute" data-connectortype="FFType1">';
                div = div + eLine;
                div = div + 'left:' + (isMilestoneParent ? (((data.parentLeft + data.parentWidth) -
                    (data.childLeft + data.childWidth)) - 1) : (((data.parentLeft + data.parentWidth) -
                    (data.childLeft + data.childWidth)))) + 'px;' +
                    'width:' + (isMilestoneParent ? (21 + this.lineStroke) : (20 + this.lineStroke)) + 'px;' +
                    this.getBorderStyles('top', this.lineStroke) + 'position:relative;"></div>';
                div = div + eLine;
                div = div + 'left:' + (isMilestoneParent ? (((data.parentLeft + data.parentWidth) -
                    (data.childLeft + data.childWidth)) + 20) : (((data.parentLeft + data.parentWidth) -
                    (data.childLeft + data.childWidth)) + 20)) + 'px;width:0px;' + this.getBorderStyles('left', this.lineStroke) +
                    this.getBorderStyles('top', (heightValue - this.lineStroke)) + 'position:relative;"></div>';
                div = div + eLine;
                div = div + 'left:' + (isMilestone ? 4 : 10) + 'px;width:' + (isMilestone ?
                    (((data.parentLeft + data.parentWidth) - (data.childLeft + data.childWidth)) + (16 + this.lineStroke)) :
                    (((data.parentLeft + data.parentWidth) - (data.childLeft + data.childWidth)) + (10 + this.lineStroke))) + 'px;' +
                    this.getBorderStyles('top', this.lineStroke) + 'position:relative;"></div>';
                div = div + leftArrow;
                div = div + (isMilestone ? 'left:0px;' : '') + this.getBorderStyles('right', 10) +
                    'top:' + (-6 - this.lineStroke) + 'px;border-bottom-width:' + (5 + this.lineStroke) + 'px;' +
                    'border-top-width:' + (5 + this.lineStroke) + 'px;width:0;height:0;position:relative;"></div></div>';
            }
            if (this.getParentPosition(data) === 'FFType2') {
                div = div + 'left:' + (data.parentLeft + data.parentWidth) + 'px;top:' +
                    ((data.parentIndex * data.rowHeight) + this.getTaskbarMidpoint(isMilestoneParent) - (this.lineStroke - 1)) + 'px;' +
                    'width:1px;height:' + heightValue + 'px;position:absolute" data-connectortype="FFType2">';
                div = div + eLine;
                div = div + (isMilestoneParent ? 'left:-1px;' : '') + 'width:' +
                    (isMilestoneParent ? (((data.childLeft + data.childWidth) - (data.parentLeft + data.parentWidth)) +
                        (21 + this.lineStroke)) : (((data.childLeft + data.childWidth) -
                        (data.parentLeft + data.parentWidth)) + (20 + this.lineStroke))) + 'px;' +
                    this.getBorderStyles('top', this.lineStroke) + 'position:relative;"></div>';
                div = div + eLine;
                div = div + 'left:' + (((data.childLeft + data.childWidth) - (data.parentLeft + data.parentWidth)) + 20) +
                    'px;width:0px;' + this.getBorderStyles('left', this.lineStroke) +
                    this.getBorderStyles('top', (heightValue - this.lineStroke)) +
                    'position:relative;"></div>';
                div = div + eLine;
                div = div + 'left:' + (isMilestone ? (((data.childLeft + data.childWidth) - (data.parentLeft + data.parentWidth)) + 4) :
                    (((data.childLeft + data.childWidth) - (data.parentLeft + data.parentWidth)) + 10)) + 'px;' +
                    'width:' + (isMilestone ? (16 + this.lineStroke) : (10 + this.lineStroke)) + 'px;' +
                    this.getBorderStyles('top', this.lineStroke) + 'position:relative;"></div>';
                div = div + leftArrow;
                div = div + 'left:' + (isMilestone ? (((data.childLeft + data.childWidth) - (data.parentLeft + data.parentWidth))) :
                    (((data.childLeft + data.childWidth) - (data.parentLeft + data.parentWidth)))) + 'px;' +
                    this.getBorderStyles('right', 10) + 'top:' + (-6 - this.lineStroke) + 'px;' +
                    'border-bottom-width:' + (5 + this.lineStroke) + 'px;border-top-width:' + (5 + this.lineStroke) +
                    'px;width:0;height:0;position:relative;"></div></div>';
            }
            if (this.getParentPosition(data) === 'FFType3') {
                div = div + 'left:' + (data.childLeft + data.childWidth) + 'px;top:' +
                    ((data.childIndex * data.rowHeight) + this.getTaskbarMidpoint(isMilestone) - (this.lineStroke - 1)) + 'px;' +
                    'width:1px;height:' + heightValue + 'px;position:absolute" data-connectortype="FFType3">';
                div = div + duplicateStingOne;
                div = div + eLine;
                div = div + (isMilestone ? ('left:4px;width:' +
                    (((data.parentLeft + data.parentWidth) - (data.childLeft + data.childWidth)) + 16)) :
                    ('left:10px;width:' + (((data.parentLeft + data.parentWidth) -
                        (data.childLeft + data.childWidth)) + 10))) + 'px;top:' + (-(6 + (5 + this.lineStroke) +
                    (this.lineStroke / 2))) + 'px;' + this.getBorderStyles('top', this.lineStroke) + 'position:relative;"></div>';
                div = div + eLine;
                div = div + 'left:' + (((data.parentLeft + data.parentWidth) - (data.childLeft + data.childWidth)) + 20) +
                    'px;top:' + (-(13 + ((this.lineStroke - 1) * 2))) + 'px;' +
                    'width:0px;' + this.getBorderStyles('left', this.lineStroke) +
                    this.getBorderStyles('top', (heightValue - this.lineStroke + 1)) + 'position:relative;"></div>';
                div = div + eLine;
                div = div + (isMilestoneParent ? ('left:' + (((data.parentLeft + data.parentWidth) -
                    (data.childLeft + data.childWidth)) - 1) + 'px;width:21') : ('left:' + (((data.parentLeft + data.parentWidth) -
                    (data.childLeft + data.childWidth))) + 'px;width:20')) +
                    'px;top:' + (-(13 + ((this.lineStroke - 1) * 2))) + 'px;' +
                    this.getBorderStyles('top', this.lineStroke) + 'position:relative;"></div></div>';
            }
            if (this.getParentPosition(data) === 'FFType4') {
                div = div + 'left:' + (data.parentLeft + data.parentWidth) + 'px;top:' +
                    ((data.childIndex * data.rowHeight) + this.getTaskbarMidpoint(isMilestone) - (this.lineStroke - 1)) + 'px;' +
                    'width:1px;height:' + heightValue + 'px;position:absolute" data-connectortype="FFType4">';
                div = div + leftArrow;
                div = div + (isMilestone ? ('left:' + ((data.childLeft + data.childWidth) -
                    (data.parentLeft + data.parentWidth))) :
                    ('left:' + (((data.childLeft + data.childWidth) - (data.parentLeft + data.parentWidth))))) + 'px;' +
                    this.getBorderStyles('right', 10) + 'top:' + (-5 - this.lineStroke + (this.lineStroke - 1)) + 'px;' +
                    'border-bottom-width:' + (5 + this.lineStroke) +
                    'px;border-top-width:' + (5 + this.lineStroke) + 'px;width:0;height:0;' +
                    'position:relative;"></div>';
                div = div + eLine;
                div = div + (isMilestone ? ('left:' + (((data.childLeft + data.childWidth) -
                    (data.parentLeft + data.parentWidth)) + 4) +
                    'px;width:' + (16 + this.lineStroke)) : ('left:' + (((data.childLeft + data.childWidth) -
                    (data.parentLeft + data.parentWidth)) + 10) + 'px;width:' + (10 + this.lineStroke))) +
                    'px;' + duplicateStingFive;
                div = div + eLine;
                div = div + 'left:' + (((data.childLeft + data.childWidth) -
                    (data.parentLeft + data.parentWidth)) + 20) + 'px;top:' + (-(13 + ((this.lineStroke - 1) * 2))) +
                    'px;width:0px;' + this.getBorderStyles('left', this.lineStroke) +
                    this.getBorderStyles('top', (heightValue - this.lineStroke + 1)) + 'position:relative;"></div>';
                div = div + eLine;
                div = div + (isMilestoneParent ? ('left:-1px;width:' + (((data.childLeft + data.childWidth) -
                    (data.parentLeft + data.parentWidth)) + (21 + this.lineStroke))) : ('width:' + (((data.childLeft + data.childWidth) -
                    (data.parentLeft + data.parentWidth)) + (20 + this.lineStroke)))) + 'px;top:' +
                    (-(13 + ((this.lineStroke - 1) * 2))) + 'px;' +
                    this.getBorderStyles('top', this.lineStroke) + 'position:relative;"></div></div>';
            }
            if (this.getParentPosition(data) === 'SFType4') {
                div = div + 'left:' + (data.parentLeft - 10) + 'px;top:' +
                    ((data.childIndex * data.rowHeight) + this.getTaskbarMidpoint(isMilestone) - (this.lineStroke - 1)) + 'px;width:1px;' +
                    'height:' + heightValue + 'px;position:absolute" data-connectortype="SFType4">';
                div = div + duplicateStingFour + 'top:' + (-5 - this.lineStroke + (this.lineStroke - 1)) + 'px;' +
                    'border-bottom-width:' + (5 + this.lineStroke) +
                    'px;border-top-width:' + (5 + this.lineStroke) + 'px;width:0;height:0;' +
                    'position:relative;"></div>';
                div = div + eLine;
                div = div + 'left:' + (isMilestone ? ((((data.childLeft + data.childWidth) - (data.parentLeft)) + (14 + this.lineStroke)) +
                    'px;width:16') : ((((data.childLeft + data.childWidth) - (data.parentLeft)) + 20) + 'px;width:' +
                    (10 + this.lineStroke))) + 'px;' + duplicateStingFive;
                div = div + eLine;
                div = div + 'left:' + (((data.childLeft + data.childWidth) - (data.parentLeft)) + 30) + 'px;top:' +
                    (-(13 + ((this.lineStroke - 1) * 2))) + 'px;width:0px;' + this.getBorderStyles('left', this.lineStroke) +
                    this.getBorderStyles('top', (heightValue - this.getconnectorLineGap(data) - (this.lineStroke - 1))) + 'position:relative;"></div>';
                div = div + eLine;
                div = div + 'top:' + (-(13 + ((this.lineStroke - 1) * 2))) + 'px;width:' +
                    (((data.childLeft + data.childWidth) - (data.parentLeft)) + (30 + this.lineStroke)) + 'px;' +
                    this.getBorderStyles('top', this.lineStroke) + 'position:relative;"></div>';
                div = div + eLine;
                div = div + 'top:' + (-(13 + ((this.lineStroke - 1) * 2))) + 'px;width:0px;' +
                    this.getBorderStyles('left', this.lineStroke) +
                    this.getBorderStyles('top', (this.getconnectorLineGap(data) - this.lineStroke)) + 'position:relative;"></div>';
                div = div + eLine;
                div = div + 'top:' + (-(13 + ((this.lineStroke - 1) * 2))) + 'px;width:11px;' +
                    this.getBorderStyles('top', this.lineStroke) + 'position:relative;"></div></div>';
            }
            if (this.getParentPosition(data) === 'SFType3') {
                div = div + 'left:' + (data.childLeft + data.childWidth) + 'px;top:' +
                    ((data.childIndex * data.rowHeight) + this.getTaskbarMidpoint(isMilestone) - (this.lineStroke - 1)) + 'px;' +
                    'width:1px;height:' + heightValue + 'px;position:absolute" data-connectortype="SFType3">';
                div = div + duplicateStingOne;
                div = div + eLine;
                div = div + (isMilestone ? 'left:4px;width:' + (16 + this.lineStroke) : 'left:10px;width:' +
                    (10 + this.lineStroke)) + 'px;top:' + (-(13 + ((this.lineStroke - 1) * 2) - 1)) + 'px;' +
                    this.getBorderStyles('top', this.lineStroke) + 'position:relative;"></div>';
                div = div + eLine;
                div = div + 'left:20px;top:' + (-(13 + ((this.lineStroke - 1) * 2))) + 'px;width:0px;' +
                    this.getBorderStyles('left', this.lineStroke) +
                    this.getBorderStyles('top', (heightValue - (this.lineStroke - 1))) + 'position:relative;"></div>';
                div = div + eLine;
                div = div + 'left:20px;top:' + (-(13 + ((this.lineStroke - 1) * 2))) + 'px;width:' +
                    ((data.parentLeft - (data.childLeft + data.childWidth + 20)) + this.lineStroke) + 'px;' +
                    this.getBorderStyles('top', this.lineStroke) + 'position:relative;"></div></div>';
            }
            if (this.getParentPosition(data) === 'SFType1') {
                div = div + 'left:' + (data.parentLeft - 10) + 'px;top:' +
                    ((data.parentIndex * data.rowHeight) + this.getTaskbarMidpoint(isMilestone) - (this.lineStroke - 1)) + 'px;' +
                    'width:1px;height:' + heightValue + 'px;position:absolute" data-connectortype="SFType1">';
                div = div + eLine;
                div = div + 'width:11px;' + this.getBorderStyles('top', this.lineStroke) + 'position:relative;"></div>';
                div = div + eLine;
                div = div + 'width:0px;' + this.getBorderStyles('left', this.lineStroke) +
                    this.getBorderStyles('top', (heightValue - this.getconnectorLineGap(data) - this.lineStroke)) + 'position:relative;"></div>';
                div = div + eLine;
                div = div + 'width:' + (((data.childLeft + data.childWidth) - (data.parentLeft)) + (30 + this.lineStroke)) + 'px;' +
                    this.getBorderStyles('top', this.lineStroke) + 'position:relative;"></div>';
                div = div + eLine;
                div = div + 'left:' + (((data.childLeft + data.childWidth) - (data.parentLeft)) + 30) +
                    'px;width:0px;' + this.getBorderStyles('left', this.lineStroke) +
                    this.getBorderStyles('top', (this.getconnectorLineGap(data) - this.lineStroke)) + 'position:relative;"></div>';
                div = div + eLine;
                div = div + (isMilestone ? ('left:' + (((data.childLeft + data.childWidth) -
                    (data.parentLeft)) + 15) + 'px;width:' + (15 + this.lineStroke)) : ('left:' +
                    (((data.childLeft + data.childWidth) - (data.parentLeft)) + 20) + 'px;width:' + (10 + this.lineStroke))) + 'px;' +
                    this.getBorderStyles('top', this.lineStroke) + 'position:relative;"></div>';
                div = div + duplicateStingFour + 'top:' + (-6 - this.lineStroke) + 'px;' +
                    'border-bottom-width:' + (5 + this.lineStroke) + 'px;border-top-width:' +
                    (5 + this.lineStroke) + 'px;position:relative;"></div></div>';
            }
            if (this.getParentPosition(data) === 'SFType2') {
                div = div + 'left:' + (data.childLeft + data.childWidth) + 'px;top:' +
                    ((data.parentIndex * data.rowHeight) + this.getTaskbarMidpoint(isMilestoneParent) - (this.lineStroke - 1)) + 'px;' +
                    'width:1px;height:' + heightValue + 'px;position:absolute" data-connectortype="SFType2">';
                div = div + eLine;
                div = div + 'left:' + (((data.parentLeft) - (data.childLeft + data.childWidth)) - 10) +
                    'px;width:11px;' + this.getBorderStyles('top', this.lineStroke) + 'position:relative;"></div>';
                div = div + eLine;
                div = div + 'left:' + (((data.parentLeft) - (data.childLeft + data.childWidth)) - 10) +
                    'px;width:0px;' + this.getBorderStyles('left', this.lineStroke) +
                    this.getBorderStyles('top', (heightValue - this.lineStroke)) + 'position:relative;"></div>';
                div = div + eLine;
                div = div + (isMilestone ? ('left:4px;width:' + (((data.parentLeft) - (data.childLeft + data.childWidth))
                    - (14 - this.lineStroke))) : ('left:10px;width:' + (((data.parentLeft) -
                    (data.childLeft + data.childWidth)) - (20 - this.lineStroke)))) +
                    'px;' + this.getBorderStyles('top', this.lineStroke) + 'position:relative;"></div>';
                div = div + leftArrow;
                div = div + 'left:0px;' + this.getBorderStyles('right', 10) +
                    'top:' + (-6 - this.lineStroke) + 'px;border-bottom-width:' + (5 + this.lineStroke) +
                    'px;border-top-width:' + (5 + this.lineStroke) + 'px;width:0;height:0;position:relative;"></div></div>';
            }
            connectorContainer += div;
            connectorContainer += '</div>';
        }
        return connectorContainer;
    };
    /**
     * @private
     */
    ConnectorLine.prototype.createConnectorLineTooltipTable = function () {
        this.tooltipTable = createElement('table', { className: '.e-tooltiptable', styles: 'margin-top:0px', attrs: { 'cellspacing': '2px', 'cellpadding': '2px' } });
        var tooltipBody = createElement('tbody');
        tooltipBody.innerHTML = '';
        this.tooltipTable.appendChild(tooltipBody);
    };
    /**
     * @param fromTaskName
     * @param fromPredecessorText
     * @param toTaskName
     * @param toPredecessorText
     * @private
     */
    ConnectorLine.prototype.getConnectorLineTooltipInnerTd = function (fromTaskName, fromPredecessorText, toTaskName, toPredecessorText) {
        var innerTd = '<tr  id="fromPredecessor"><td >' + this.parent.localeObj.getConstant('from') + '</td><td> ';
        innerTd = innerTd + fromTaskName + ' </td><td> ' + this.parent.localeObj.getConstant(fromPredecessorText) + ' </td> </tr>';
        innerTd = innerTd + '<tr id="toPredecessor"><td>' + this.parent.localeObj.getConstant('to') + '</td><td> ' + toTaskName;
        innerTd = innerTd + ' </td><td> ' + this.parent.localeObj.getConstant(toPredecessorText) + ' </td></tr></tbody><table>';
        return innerTd;
    };
    return ConnectorLine;
}());

/**
 * File for handling connector line edit operation in Gantt.
 */
var ConnectorLineEdit = /** @__PURE__ @class */ (function () {
    function ConnectorLineEdit(ganttObj) {
        this.parent = ganttObj;
    }
    /**
     * To update connector line edit element.
     * @return {void}
     * @private
     */
    ConnectorLineEdit.prototype.updateConnectorLineEditElement = function (e) {
        var element = this.getConnectorLineHoverElement(e.target);
        if (!getValue('editModule.taskbarEditModule.taskBarEditAction', this.parent)) {
            this.highlightConnectorLineElements(element);
        }
    };
    /**
     * To get hovered connector line element.
     * @return {void}
     * @private
     */
    ConnectorLineEdit.prototype.getConnectorLineHoverElement = function (target) {
        var isOnLine = parentsUntil$1(target, connectorLine);
        var isOnRightArrow = parentsUntil$1(target, connectorLineRightArrow);
        var isOnLeftArrow = parentsUntil$1(target, connectorLineLeftArrow);
        if (isOnLine || isOnRightArrow || isOnLeftArrow) {
            return parentsUntil$1(target, connectorLineContainer);
        }
        else {
            return null;
        }
    };
    /**
     * To highlight connector line while hover.
     * @return {void}
     * @private
     */
    ConnectorLineEdit.prototype.highlightConnectorLineElements = function (element) {
        if (element) {
            if (element !== this.connectorLineElement) {
                this.removeHighlight();
                this.addHighlight(element);
            }
        }
        else {
            this.removeHighlight();
        }
    };
    /**
     * To add connector line highlight class.
     * @return {void}
     * @private
     */
    ConnectorLineEdit.prototype.addHighlight = function (element) {
        this.connectorLineElement = element;
        addClass([element], [connectorLineHoverZIndex]);
        addClass(element.querySelectorAll('.' + connectorLine), [connectorLineHover]);
        addClass(element.querySelectorAll('.' + connectorLineRightArrow), [connectorLineRightArrowHover]);
        addClass(element.querySelectorAll('.' + connectorLineLeftArrow), [connectorLineLeftArrowHover]);
    };
    /**
     * To remove connector line highlight class.
     * @return {void}
     * @private
     */
    ConnectorLineEdit.prototype.removeHighlight = function () {
        if (!isNullOrUndefined(this.connectorLineElement)) {
            removeClass([this.connectorLineElement], [connectorLineHoverZIndex]);
            removeClass(this.connectorLineElement.querySelectorAll('.' + connectorLine), [connectorLineHover]);
            removeClass(this.connectorLineElement.querySelectorAll('.' + connectorLineRightArrow), [connectorLineRightArrowHover]);
            removeClass(this.connectorLineElement.querySelectorAll('.' + connectorLineLeftArrow), [connectorLineLeftArrowHover]);
            this.connectorLineElement = null;
        }
    };
    /**
     * To remove connector line highlight class.
     * @return {void}
     * @private
     */
    ConnectorLineEdit.prototype.getEditedConnectorLineString = function (records) {
        var ganttRecord;
        var predecessorsCollection;
        var predecessor;
        var parentGanttRecord;
        var childGanttRecord;
        var connectorObj;
        var idArray = [];
        var lineArray = [];
        var editedConnectorLineString = '';
        for (var count = 0; count < records.length; count++) {
            ganttRecord = records[count];
            predecessorsCollection = ganttRecord.ganttProperties.predecessor;
            if (predecessorsCollection) {
                for (var predecessorCount = 0; predecessorCount < predecessorsCollection.length; predecessorCount++) {
                    predecessor = predecessorsCollection[predecessorCount];
                    var from = 'from';
                    var to = 'to';
                    this.removeConnectorLineById('parent' + predecessor[from] + 'child' + predecessor[to]);
                    parentGanttRecord = this.parent.getRecordByID(predecessor[from]);
                    childGanttRecord = this.parent.getRecordByID(predecessor[to]);
                    if ((parentGanttRecord && parentGanttRecord.expanded === true) ||
                        (childGanttRecord && childGanttRecord.expanded === true)) {
                        connectorObj = this.updateConnectorLineObject(parentGanttRecord, childGanttRecord, predecessor);
                        if (!isNullOrUndefined(connectorObj)) {
                            var lineIndex = idArray.indexOf(connectorObj.connectorLineId);
                            var lineString = this.parent.connectorLineModule.getConnectorLineTemplate(connectorObj);
                            if (lineIndex !== -1) {
                                lineArray[lineIndex] = lineString;
                            }
                            else {
                                idArray.push(connectorObj.connectorLineId);
                                lineArray.push(lineString);
                            }
                        }
                    }
                }
                editedConnectorLineString = lineArray.join('');
            }
        }
        return editedConnectorLineString;
    };
    /**
     * To refresh connector line object collections
     * @param parentGanttRecord
     * @param childGanttRecord
     * @param predecessor
     * @private
     */
    ConnectorLineEdit.prototype.updateConnectorLineObject = function (parentGanttRecord, childGanttRecord, predecessor) {
        var connectorObj;
        connectorObj = this.parent.connectorLineModule.createConnectorLineObject(parentGanttRecord, childGanttRecord, predecessor);
        if (connectorObj) {
            if (this.parent.connectorLineIds.length > 0 && this.parent.connectorLineIds.indexOf(connectorObj.connectorLineId) === -1) {
                this.parent.updatedConnectorLineCollection.push(connectorObj);
                this.parent.connectorLineIds.push(connectorObj.connectorLineId);
            }
            else if (this.parent.connectorLineIds.length === 0) {
                this.parent.updatedConnectorLineCollection.push(connectorObj);
                this.parent.connectorLineIds.push(connectorObj.connectorLineId);
            }
            else if (this.parent.connectorLineIds.indexOf(connectorObj.connectorLineId) !== -1) {
                var index = this.parent.connectorLineIds.indexOf(connectorObj.connectorLineId);
                this.parent.updatedConnectorLineCollection[index] = connectorObj;
            }
            predecessor.isDrawn = true;
        }
        return connectorObj;
    };
    /**
     * Tp refresh connector lines of edited records
     * @param editedRecord
     * @private
     */
    ConnectorLineEdit.prototype.refreshEditedRecordConnectorLine = function (editedRecord) {
        this.removePreviousConnectorLines(this.parent.previousRecords);
        var editedConnectorLineString;
        editedConnectorLineString = this.getEditedConnectorLineString(editedRecord);
        this.parent.connectorLineModule.dependencyViewContainer.innerHTML =
            this.parent.connectorLineModule.dependencyViewContainer.innerHTML + editedConnectorLineString;
    };
    /**
     * Method to remove connector line from DOM
     * @param records
     * @private
     */
    ConnectorLineEdit.prototype.removePreviousConnectorLines = function (records) {
        var isObjectType;
        if (isObject(records) === true) {
            isObjectType = true;
        }
        else {
            isObjectType = false;
        }
        var length = isObjectType ? Object.keys(records).length : records.length;
        var keys = Object.keys(records);
        for (var i = 0; i < length; i++) {
            var data = void 0;
            var predecessors = void 0;
            if (isObjectType) {
                var uniqueId = keys[i];
                data = records[uniqueId];
            }
            else {
                data = records[i];
            }
            predecessors = data.ganttProperties && data.ganttProperties.predecessor;
            if (predecessors && predecessors.length > 0) {
                for (var pre = 0; pre < predecessors.length; pre++) {
                    var lineId = 'parent' + predecessors[pre].from + 'child' + predecessors[pre].to;
                    this.removeConnectorLineById(lineId);
                }
            }
        }
    };
    ConnectorLineEdit.prototype.removeConnectorLineById = function (id) {
        var element = this.parent.connectorLineModule.dependencyViewContainer.querySelector('#ConnectorLine' + id);
        if (!isNullOrUndefined(element)) {
            element.remove();
        }
    };
    ConnectorLineEdit.prototype.idFromPredecessor = function (pre) {
        var preArray = pre.split(',');
        var preIdArray = [];
        for (var j = 0; j < preArray.length; j++) {
            var strArray = [];
            for (var i = 0; i < preArray[j].length; i++) {
                if (!isNullOrUndefined(preArray[j].charAt(i)) && parseInt(preArray[j].charAt(i), 10).toString() !== 'NaN') {
                    strArray.push(preArray[j].charAt(i));
                }
                else {
                    break;
                }
            }
            preIdArray.push((strArray.join('')));
        }
        return preIdArray;
    };
    ConnectorLineEdit.prototype.predecessorValidation = function (predecessor, record) {
        var recordId = record.taskId;
        var currentId;
        var currentRecord;
        for (var count = 0; count < predecessor.length; count++) {
            currentId = predecessor[count];
            var visitedIdArray = [];
            var predecessorCollection = predecessor.slice(0);
            predecessorCollection.splice(count, 1);
            var _loop_1 = function () {
                var currentIdArray = [];
                if (visitedIdArray.indexOf(currentId) === -1) {
                    //Predecessor id not in records collection
                    if (isNullOrUndefined(this_1.parent.getRecordByID(currentId))) {
                        return { value: false };
                    }
                    currentRecord = this_1.parent.getRecordByID(currentId).ganttProperties;
                    if (!isNullOrUndefined(currentRecord.predecessor) && currentRecord.predecessor.length > 0) {
                        currentRecord.predecessor.forEach(function (value) {
                            if (currentRecord.taskId.toString() !== value.from) {
                                currentIdArray.push(value.from.toString());
                            }
                        });
                    }
                    if (recordId.toString() === currentRecord.taskId.toString() || currentIdArray.indexOf(recordId.toString()) !== -1) {
                        return { value: false };
                    }
                    visitedIdArray.push(currentId);
                    if (!isNullOrUndefined(currentRecord.predecessor) && currentRecord.predecessor.length > 0) {
                        currentId = currentRecord.predecessor[0].from;
                    }
                    else {
                        return "break";
                    }
                }
                else {
                    return "break";
                }
            };
            var this_1 = this;
            while (currentId !== null) {
                var state_1 = _loop_1();
                if (typeof state_1 === "object")
                    return state_1.value;
                if (state_1 === "break")
                    break;
            }
        }
        return true;
    };
    /**
     * To validate predecessor relations
     * @param ganttRecord
     * @param predecessorString
     * @private
     */
    ConnectorLineEdit.prototype.validatePredecessorRelation = function (ganttRecord, predecessorString) {
        var flag = true;
        var recordId = ganttRecord.ganttProperties.taskId;
        var predecessorIdArray;
        var currentId;
        if (!isNullOrUndefined(predecessorString) && predecessorString.length > 0) {
            predecessorIdArray = this.idFromPredecessor(predecessorString);
            var _loop_2 = function (count) {
                //Check edited item has parent item in predecessor collection
                var checkParent = this_2.checkParentRelation(ganttRecord, predecessorIdArray);
                if (!checkParent) {
                    return { value: false };
                }
                // Check if predecessor exist more then one 
                var tempIdArray = predecessorIdArray.slice(0);
                var checkArray = [];
                var countFlag = true;
                tempIdArray.forEach(function (value) {
                    if (checkArray.indexOf(value) === -1) {
                        checkArray.push(value);
                    }
                    else {
                        countFlag = false;
                    }
                });
                if (!countFlag) {
                    return { value: false };
                }
                //Cyclick check  
                currentId = predecessorIdArray[count];
                var visitedIdArray = [];
                var predecessorCollection = predecessorIdArray.slice(0);
                predecessorCollection.splice(count, 1);
                var _loop_3 = function () {
                    var currentIdArray = [];
                    var currentIdIndex;
                    var currentRecord;
                    if (visitedIdArray.indexOf(currentId) === -1) {
                        //Predecessor id not in records collection
                        if (isNullOrUndefined(this_2.parent.getRecordByID(currentId.toString()))) {
                            return { value: false };
                        }
                        currentRecord = this_2.parent.getRecordByID(currentId.toString()).ganttProperties;
                        //  let currentPredecessor='';
                        if (!isNullOrUndefined(currentRecord.predecessor) && currentRecord.predecessor.length > 0) {
                            currentRecord.predecessor.forEach(function (value, index) {
                                if (currentRecord.taskId.toString() !== value.from) {
                                    currentIdArray.push(value.from.toString());
                                    currentIdIndex = index;
                                }
                            });
                            //    currentPredecessor=currentRecord.predecessor[0].from
                        }
                        if (recordId.toString() === currentRecord.taskId.toString() ||
                            currentIdArray.indexOf(recordId.toString()) !== -1) {
                            return { value: false };
                        }
                        visitedIdArray.push(currentId);
                        if (!isNullOrUndefined(currentRecord.predecessor) && currentRecord.predecessor.length > 0) {
                            var result = void 0;
                            if (currentIdArray.length > 1) {
                                result = this_2.predecessorValidation(currentIdArray, ganttRecord.ganttProperties);
                            }
                            else if (currentIdArray.length === 1) {
                                currentId = currentRecord.predecessor[currentIdIndex].from;
                            }
                            if (result === false) {
                                return { value: false };
                            }
                        }
                        else {
                            return "break";
                        }
                    }
                    else {
                        return "break";
                    }
                };
                while (currentId !== null) {
                    var state_3 = _loop_3();
                    if (typeof state_3 === "object")
                        return state_3;
                    if (state_3 === "break")
                        break;
                }
            };
            var this_2 = this;
            for (var count = 0; count < predecessorIdArray.length; count++) {
                var state_2 = _loop_2(count);
                if (typeof state_2 === "object")
                    return state_2.value;
            }
        }
        return flag;
    };
    /**
     * To add dependency for Task
     * @param ganttRecord
     * @param predecessorString
     * @private
     */
    ConnectorLineEdit.prototype.addPredecessor = function (ganttRecord, predecessorString) {
        var tempPredecessorString = isNullOrUndefined(ganttRecord.ganttProperties.predecessorsName) ||
            ganttRecord.ganttProperties.predecessorsName === '' ?
            predecessorString : (ganttRecord.ganttProperties.predecessorsName + ',' + predecessorString);
        this.updatePredecessorHelper(ganttRecord, tempPredecessorString);
    };
    /**
     * To remove dependency from task
     * @param ganttRecord
     * @private
     */
    ConnectorLineEdit.prototype.removePredecessor = function (ganttRecord) {
        this.updatePredecessorHelper(ganttRecord, null);
    };
    /**
     * To modify current dependency values of Task
     * @param ganttRecord
     * @param predecessorString
     * @private
     */
    ConnectorLineEdit.prototype.updatePredecessor = function (ganttRecord, predecessorString) {
        return this.updatePredecessorHelper(ganttRecord, predecessorString);
    };
    ConnectorLineEdit.prototype.updatePredecessorHelper = function (ganttRecord, predecessorString) {
        if (isUndefined(predecessorString) || this.validatePredecessorRelation(ganttRecord, predecessorString)) {
            this.parent.isOnEdit = true;
            var predecessorCollection = [];
            if (!isNullOrUndefined(predecessorString) && predecessorString !== '') {
                predecessorCollection = this.parent.predecessorModule.calculatePredecessor(predecessorString, ganttRecord);
            }
            this.parent.setRecordValue('predecessor', predecessorCollection, ganttRecord.ganttProperties, true);
            var stringValue = this.parent.predecessorModule.getPredecessorStringValue(ganttRecord);
            this.parent.setRecordValue('predecessorsName', stringValue, ganttRecord.ganttProperties, true);
            this.parent.setRecordValue('taskData.' + this.parent.taskFields.dependency, stringValue, ganttRecord);
            this.parent.setRecordValue(this.parent.taskFields.dependency, stringValue, ganttRecord);
            var args = {};
            args.data = ganttRecord;
            this.parent.editModule.initiateUpdateAction(args);
            return true;
        }
        else {
            return false;
        }
    };
    ConnectorLineEdit.prototype.checkParentRelation = function (ganttRecord, predecessorIdArray) {
        var editingData = ganttRecord;
        var checkParent = true;
        if (editingData && editingData.parentItem) {
            if (predecessorIdArray.indexOf(editingData.parentItem.taskId.toString()) !== -1) {
                return false;
            }
        }
        var _loop_4 = function (p) {
            var record = this_3.parent.currentViewData.filter(function (item) {
                return item && item.ganttProperties.taskId.toString() === predecessorIdArray[p].toString();
            });
            if (record[0] && record[0].hasChildRecords) {
                return { value: false };
            }
        };
        var this_3 = this;
        for (var p = 0; p < predecessorIdArray.length; p++) {
            var state_4 = _loop_4(p);
            if (typeof state_4 === "object")
                return state_4.value;
        }
        return checkParent;
    };
    return ConnectorLineEdit;
}());

/**
 * Splitter related goes here
 */
var Splitter$1 = /** @__PURE__ @class */ (function () {
    function Splitter$$1(ganttObj) {
        this.parent = ganttObj;
        this.parent.on('destroy', this.destroy, this);
    }
    /**
     * @private
     */
    Splitter$$1.prototype.renderSplitter = function () {
        var _this = this;
        var toolbarHeight = 0;
        if (!isNullOrUndefined(this.parent.toolbarModule) && !isNullOrUndefined(this.parent.toolbarModule.element)) {
            toolbarHeight = this.parent.toolbarModule.element.offsetHeight;
        }
        var splitterPosition = this.calculateSplitterPosition(this.parent.splitterSettings);
        this.parent.splitterElement = createElement('div', { className: splitter });
        this.parent.treeGridPane = createElement('div', { className: treeGridPane });
        this.parent.chartPane = createElement('div', { className: ganttChartPane });
        this.parent.splitterElement.appendChild(this.parent.treeGridPane);
        this.parent.splitterElement.appendChild(this.parent.chartPane);
        this.splitterObject = new Splitter({
            height: (this.parent.ganttHeight - toolbarHeight).toString(),
            width: this.parent.ganttWidth.toString(),
            separatorSize: this.parent.splitterSettings.separatorSize,
            paneSettings: [
                {
                    resizable: true,
                    size: splitterPosition,
                    min: this.getSpliterPositionInPercentage(this.parent.splitterSettings.minimum)
                },
                {
                    resizable: true
                }
            ],
            orientation: 'Horizontal',
            resizeStart: function (args) {
                _this.splitterPreviousPositionGrid = args.pane[0].scrollWidth + 1 + 'px';
                _this.splitterPreviousPositionChart = args.pane[1].scrollWidth + 1 + 'px';
                _this.parent.trigger('splitterResizeStart', args);
            },
            resizing: function (args) {
                _this.parent.trigger('splitterResizing', args);
            },
            resizeStop: function (args) {
                _this.parent.trigger('splitterResized', args);
                if (args.cancel === true) {
                    _this.splitterObject.paneSettings[0].size = null;
                    _this.splitterObject.paneSettings[0].size = _this.getSpliterPositionInPercentage(_this.splitterPreviousPositionGrid);
                    _this.splitterObject.paneSettings[1].size = null;
                    _this.splitterObject.paneSettings[1].size = _this.getSpliterPositionInPercentage(_this.splitterPreviousPositionChart);
                }
            }
        });
        this.parent.element.appendChild(this.parent.splitterElement);
        this.splitterObject.appendTo(this.parent.splitterElement);
    };
    /**
     * @private
     */
    Splitter$$1.prototype.calculateSplitterPosition = function (splitter$$1, isDynamic) {
        if (splitter$$1.view === 'Grid') {
            return '100%';
        }
        else if (splitter$$1.view === 'Chart') {
            return '0%';
        }
        else {
            if (!isNullOrUndefined(splitter$$1.position) && splitter$$1.position !== '') {
                return this.getSpliterPositionInPercentage(splitter$$1.position);
            }
            else if (!isNullOrUndefined(splitter$$1.columnIndex) && splitter$$1.columnIndex >= 0) {
                return isDynamic ? this.getSpliterPositionInPercentage(this.getTotalColumnWidthByIndex(splitter$$1.columnIndex).toString() + 'px') :
                    this.getSpliterPositionInPercentage((splitter$$1.columnIndex * 150) + 'px');
            }
            else {
                return this.getSpliterPositionInPercentage('250px');
            }
        }
    };
    /**
     *
     */
    Splitter$$1.prototype.getSpliterPositionInPercentage = function (position) {
        var value = !isNullOrUndefined(position) && position !== '' ? position : null;
        if (!isNullOrUndefined(value)) {
            if (position.indexOf('px') !== -1) {
                var intValue = parseInt(position, 10);
                value = (((intValue / this.parent.ganttWidth) * 100) <= 100 ? ((intValue / this.parent.ganttWidth) * 100) + '%' :
                    '100%');
            }
            else {
                value = position.indexOf('%') === -1 ?
                    position + '%' : position;
            }
        }
        return value;
    };
    /**
     *
     */
    Splitter$$1.prototype.getTotalColumnWidthByIndex = function (index) {
        var width = 0;
        var tr = this.parent.treeGrid.element.querySelectorAll('.e-headercell');
        index = tr.length > index ? index : tr.length;
        for (var column = 0; column < index; column++) {
            width = width + tr[column].offsetWidth;
        }
        return width;
    };
    /**
     * @private
     */
    Splitter$$1.prototype.updateSplitterPosition = function () {
        this.splitterObject.separatorSize = this.parent.splitterSettings.separatorSize >= 4 ?
            this.parent.splitterSettings.separatorSize : 4;
        var splitterPosition = this.calculateSplitterPosition(this.parent.splitterSettings, true);
        this.splitterObject.paneSettings[0].min = this.getSpliterPositionInPercentage(this.parent.splitterSettings.minimum);
        this.splitterObject.dataBind();
        this.splitterObject.paneSettings[0].size = splitterPosition;
    };
    /**
     * @private
     */
    Splitter$$1.prototype.triggerCustomResizedEvent = function () {
        var pane1 = this.splitterObject.element.querySelectorAll('.e-pane')[0];
        var pane2 = this.splitterObject.element.querySelectorAll('.e-pane')[1];
        var eventArgs = {
            event: null,
            element: this.splitterObject.element,
            pane: [pane1, pane2],
            index: [0, 1],
            separator: this.splitterObject.element.querySelector('.e-split-bar'),
            paneSize: [pane1.offsetWidth, pane2.offsetWidth]
        };
        this.parent.trigger('splitterResized', eventArgs);
        if (eventArgs.cancel === true) {
            this.splitterObject.paneSettings[0].size = this.getSpliterPositionInPercentage(this.splitterPreviousPositionGrid);
            this.splitterObject.paneSettings[1].size = this.getSpliterPositionInPercentage(this.splitterPreviousPositionChart);
        }
    };
    Splitter$$1.prototype.destroy = function () {
        this.splitterObject.destroy();
        this.parent.off('destroy', this.destroy);
    };
    return Splitter$$1;
}());

/**
 * File for handling tooltip in Gantt.
 */
var Tooltip$1 = /** @__PURE__ @class */ (function () {
    function Tooltip$$1(gantt) {
        this.parent = gantt;
        this.createTooltip();
        this.parent.on('destroy', this.destroy, this);
    }
    /**
     * To create tooltip.
     * @return {void}
     * @private
     */
    /* tslint:disable-next-line:max-func-body-length */
    Tooltip$$1.prototype.createTooltip = function () {
        this.toolTipObj = new Tooltip();
        this.toolTipObj.target = '.e-header-cell-label, .e-gantt-child-taskbar,' +
            '.e-gantt-parent-taskbar, .e-gantt-milestone, .e-gantt-unscheduled-taskbar' +
            '.e-event-markers, .e-baseline-bar, .e-event-markers,' +
            '.e-connector-line-container, .e-indicator-span, .e-notes-info';
        this.toolTipObj.position = 'BottomCenter';
        this.toolTipObj.openDelay = 700;
        this.toolTipObj.cssClass = ganttTooltip;
        this.toolTipObj.animation = { open: { effect: 'None', delay: 0 }, close: { effect: 'None', delay: 0 } };
        this.toolTipObj.afterOpen = this.updateTooltipPosition.bind(this);
        this.toolTipObj.showTipPointer = false;
        this.toolTipObj.beforeRender = this.tooltipBeforeRender.bind(this);
        this.toolTipObj.afterClose = this.tooltipCloseHandler.bind(this);
        this.toolTipObj.appendTo(this.parent.element);
    };
    Tooltip$$1.prototype.tooltipBeforeRender = function (args) {
        var parent = this.parent;
        if (parent.isOnEdit) {
            args.cancel = true;
        }
        var element = parentsUntil$1(args.target, chartRowCell);
        var data;
        var argsData = {
            data: {},
            args: args,
            content: ''
        };
        if (args.target.classList.contains('e-header-cell-label')) {
            if (parent.timelineSettings.showTooltip) {
                argsData.content = this.toolTipObj.content = parent.tooltipModule.getTooltipContent('timeline', data, parent, args);
            }
            else {
                args.cancel = true;
            }
        }
        else {
            if (parent.tooltipSettings.showTooltip) {
                if (element) {
                    argsData.data = parent.ganttChartModule.getRecordByTaskBar(element);
                    data = argsData.data;
                }
                if (args.target.classList.contains('e-gantt-child-taskbar') ||
                    args.target.classList.contains('e-gantt-parent-taskbar') ||
                    args.target.classList.contains('e-gantt-milestone') ||
                    args.target.classList.contains('e-gantt-unscheduled-taskbar')) {
                    var taskbarTemplateNode = void 0;
                    if (parent.tooltipSettings.taskbar) {
                        taskbarTemplateNode = parent.tooltipModule.templateCompiler(parent.tooltipSettings.taskbar, parent, data);
                    }
                    argsData.content = this.toolTipObj.content = taskbarTemplateNode ? taskbarTemplateNode[0] :
                        parent.tooltipModule.getTooltipContent((data.ganttProperties.isMilestone ? 'milestone' : 'taskbar'), data, parent, args);
                }
                else if (args.target.classList.contains('e-baseline-bar')) {
                    var baseLineTemplateNode = void 0;
                    if ((parent.tooltipSettings.baseline)) {
                        baseLineTemplateNode = parent.tooltipModule.templateCompiler(parent.tooltipSettings.baseline, parent, data);
                    }
                    argsData.content = this.toolTipObj.content = baseLineTemplateNode ? baseLineTemplateNode[0] :
                        parent.tooltipModule.getTooltipContent('baseline', data, parent, args);
                }
                else if (args.target.classList.contains('e-event-markers')) {
                    argsData.content = this.toolTipObj.content = parent.tooltipModule.getTooltipContent('marker', data, parent, args);
                }
                else if (args.target.classList.contains('e-connector-line-container')) {
                    var dependencyLineTemplateNode = void 0;
                    parent.tooltipModule.predecessorTooltipData = parent.tooltipModule.getPredecessorTooltipData(args);
                    argsData.data = this.predecessorTooltipData;
                    if ((parent.tooltipSettings.connectorLine)) {
                        dependencyLineTemplateNode = parent.tooltipModule.templateCompiler(parent.tooltipSettings.connectorLine, parent, parent.tooltipModule.predecessorTooltipData);
                    }
                    argsData.content = this.toolTipObj.content = dependencyLineTemplateNode ?
                        dependencyLineTemplateNode[0] :
                        parent.tooltipModule.getTooltipContent('connectorLine', data, parent, args);
                }
                else if (args.target.classList.contains('e-indicator-span')) {
                    argsData.content = this.toolTipObj.content =
                        parent.tooltipModule.getTooltipContent('indicator', data, parent, args);
                }
                else if (args.target.classList.contains('e-notes-info')) {
                    var ganttData = this.parent.ganttChartModule.getRecordByTarget(args.event);
                    argsData.content = this.toolTipObj.content = ganttData.ganttProperties.notes;
                    if (isNullOrUndefined(argsData.content)) {
                        args.cancel = true;
                    }
                }
            }
            else {
                args.cancel = true;
            }
        }
        if (args.cancel === false) {
            parent.trigger('beforeTooltipRender', argsData);
            if (args.event.type === 'mouseover') {
                this.currentTarget = args.target;
                EventHandler.add(this.currentTarget, 'mousemove', this.mouseMoveHandler.bind(this));
            }
        }
    };
    Tooltip$$1.prototype.tooltipCloseHandler = function (args) {
        this.tooltipMouseEvent = null;
        EventHandler.remove(this.currentTarget, 'mousemove', this.mouseMoveHandler);
        this.currentTarget = null;
    };
    Tooltip$$1.prototype.mouseMoveHandler = function (e) {
        this.tooltipMouseEvent = e;
    };
    /**
     * Method to update tooltip position
     * @param args
     */
    Tooltip$$1.prototype.updateTooltipPosition = function (args) {
        if (isNullOrUndefined(this.tooltipMouseEvent) || args.target.classList.contains('e-notes-info')) {
            return;
        }
        var postion = this.getPointorPosition(this.tooltipMouseEvent);
        var containerPosition = this.parent.getOffsetRect(this.parent.chartPane);
        var topEnd = containerPosition.top + this.parent.chartPane.offsetHeight;
        var leftEnd = containerPosition.left + this.parent.chartPane.offsetWidth;
        var tooltipPositionX = postion.x;
        var tooltipPositionY = postion.y;
        var tooltipUpdated = false;
        if (leftEnd < (tooltipPositionX + args.element.offsetWidth + 20)) {
            tooltipPositionX = tooltipPositionX - args.element.offsetWidth - 10;
        }
        else {
            tooltipPositionX = tooltipPositionX + 10;
        }
        if (topEnd < (tooltipPositionY + args.element.offsetHeight + 20)) {
            tooltipPositionY = tooltipPositionY - args.element.offsetHeight - 10;
        }
        else {
            tooltipUpdated = true;
            tooltipPositionY = tooltipPositionY + 10;
        }
        if (window.innerHeight < args.element.offsetHeight + tooltipPositionY) {
            tooltipPositionY = tooltipPositionY - args.element.offsetHeight - (tooltipUpdated ? 20 : 10);
        }
        args.element.style.left = tooltipPositionX + 'px';
        args.element.style.top = tooltipPositionY + 'px';
    };
    /**
     * Method to get mouse pointor position
     * @param e
     */
    Tooltip$$1.prototype.getPointorPosition = function (e) {
        var posX;
        var posY;
        if (!isNullOrUndefined(getValue('pageX', e)) || !isNullOrUndefined(getValue('pageY', e))) {
            posX = getValue('pageX', e);
            posY = getValue('pageY', e);
        }
        else if (!isNullOrUndefined(getValue('clientX', e)) || !isNullOrUndefined(getValue('clientY', e))) {
            posX = getValue('clientX', e) + document.body.scrollLeft + document.documentElement.scrollLeft;
            posY = getValue('clientY', e) + document.body.scrollTop + document.documentElement.scrollTop;
        }
        return { x: posX, y: posY };
    };
    /**
     *  Getting tooltip content for different elements
     */
    Tooltip$$1.prototype.getTooltipContent = function (elementType, ganttData, parent, args) {
        var content;
        var data;
        if (ganttData) {
            data = ganttData.ganttProperties;
        }
        switch (elementType) {
            case 'milestone':
                content = '<table class = "e-gantt-tooltiptable"><tbody><tr class = "e-gantt-tooltip-rowcell"><td colspan="3">' +
                    data.taskName + '</td></tr><tr><td class = "e-gantt-tooltip-label"> Date</td><td>:</td>' +
                    '<td class = "e-gantt-tooltip-value">' +
                    this.parent.getFormatedDate(data.startDate, this.parent.dateFormat) + '</tr></tbody></table>';
                break;
            case 'taskbar':
                var startDate = data.startDate ? '<tr><td class = "e-gantt-tooltip-label">' +
                    this.parent.localeObj.getConstant('startDate') + '</td><td>:</td>' + '<td class = "e-gantt-tooltip-value"> ' +
                    this.parent.getFormatedDate(data.startDate, this.parent.dateFormat) + '</td></tr>' : '';
                var endDate = data.endDate ? '<tr><td class = "e-gantt-tooltip-label">' +
                    this.parent.localeObj.getConstant('endDate') + '</td><td>:</td>' + '<td class = "e-gantt-tooltip-value">' +
                    this.parent.getFormatedDate(data.endDate, this.parent.dateFormat) + '</td></tr>' : '';
                var duration = !isNullOrUndefined(data.duration) ? '<tr><td class = "e-gantt-tooltip-label">' +
                    this.parent.localeObj.getConstant('duration') + '</td><td>:</td>' +
                    '<td class = "e-gantt-tooltip-value"> ' + this.parent.getDurationString(data.duration, data.durationUnit) +
                    '</td></tr>' : '';
                content = '<table class = "e-gantt-tooltiptable"><tbody><tr class = "e-gantt-tooltip-rowcell"><td colspan="3">' +
                    data.taskName + '</td></tr>' + startDate + endDate + duration
                    + '<tr><td class = "e-gantt-tooltip-label">' + this.parent.localeObj.getConstant('progress') +
                    '</td><td>:</td><td>' + data.progress + '</td></tr></tbody></table>';
                break;
            case 'baseline':
                content = '<table class = "e-gantt-tooltiptable"><tbody><tr class = "e-gantt-tooltip-rowcell"><td colspan="3">' +
                    data.taskName + '</td></tr><tr><td class = "e-gantt-tooltip-label">' +
                    this.parent.localeObj.getConstant('baselineStartDate') + '</td><td>:</td>' + '<td class = "e-gantt-tooltip-value">' +
                    this.parent.getFormatedDate(data.baselineStartDate, this.parent.dateFormat) + '</td></tr><tr>' +
                    '<td class = "e-gantt-tooltip-label">' + this.parent.localeObj.getConstant('baselineEndDate') +
                    '</td><td>:</td><td class = "e-gantt-tooltip-value">' +
                    this.parent.getFormatedDate(data.baselineEndDate, this.parent.dateFormat) + '</td></tr></tbody></table>';
                break;
            case 'marker':
                var markerTooltipElement = parent.tooltipModule.getMarkerTooltipData(args);
                var markerLabel = markerTooltipElement.label ? markerTooltipElement.label : '';
                content = '<table class = "e-gantt-tooltiptable"><tbody><tr><td>' +
                    this.parent.getFormatedDate(this.parent.dateValidationModule.getDateFromFormat(markerTooltipElement.day), this.parent.dateFormat) +
                    '</td></tr><tr><td>' +
                    markerLabel + '</td></tr></tbody></table>';
                break;
            case 'connectorLine':
                content = '<table class = "e-gantt-tooltiptable"><tbody><tr><td class = "e-gantt-tooltip-label">' +
                    this.parent.localeObj.getConstant('from') + '</td><td>:</td>' +
                    '<td class = "e-gantt-tooltip-value">' + parent.tooltipModule.predecessorTooltipData.fromName + ' (' +
                    parent.tooltipModule.predecessorTooltipData.fromId + ')' + '</td></tr><tr><td class = "e-gantt-tooltip-label">' +
                    this.parent.localeObj.getConstant('to') + '</td><td>:</td>' + '<td class = "e-gantt-tooltip-value">' +
                    parent.tooltipModule.predecessorTooltipData.toName +
                    ' (' + parent.tooltipModule.predecessorTooltipData.toId + ')' +
                    '</td></tr><tr><td class = "e-gantt-tooltip-label">' + this.parent.localeObj.getConstant('taskLink') +
                    '</td><td>:</td><td class = "e-gantt-tooltip-value"> ' + parent.tooltipModule.predecessorTooltipData.linkText +
                    '</td></tr><tr><td class = "e-gantt-tooltip-label">' + this.parent.localeObj.getConstant('lag') +
                    '</td><td>:</td><td class = "e-gantt-tooltip-value">' +
                    parent.tooltipModule.predecessorTooltipData.offsetString + '</td></tr></tbody></table>';
                break;
            case 'indicator':
                content = '<table class = "e-gantt-tooltiptable"><tbody><tr>' + args.target.title + '</tr></tbody></table>';
                break;
            case 'timeline':
                content = '<table class = "e-gantt-tooltiptable"><tbody><tr>' + args.target.title + '</tr></tbody></table>';
                break;
        }
        return content;
    };
    /**
     * To get the details of an event marker.
     * @private
     */
    Tooltip$$1.prototype.getMarkerTooltipData = function (args) {
        var markerTooltipId = (args.target.id).match(/\d+/g);
        var markerTooltipElement = this.parent.eventMarkers[Number(markerTooltipId)];
        return markerTooltipElement;
    };
    /**
     * To get the details of a connector line.
     * @private
     */
    Tooltip$$1.prototype.getPredecessorTooltipData = function (args) {
        var predeceesorParent = args.target.parentElement.id;
        var taskIds = predeceesorParent.match(/\d+/g);
        var fromTask = this.parent.flatData[this.parent.ids.indexOf(taskIds[0])];
        var toTask = this.parent.flatData[this.parent.ids.indexOf(taskIds[1])];
        var predecessor = fromTask.ganttProperties.predecessor.filter(function (pdc) { return pdc.to === taskIds[1]; });
        var predecessorTooltipData = {
            fromId: fromTask.ganttProperties.taskId,
            toId: toTask.ganttProperties.taskId,
            fromName: fromTask.ganttProperties.taskName,
            toName: toTask.ganttProperties.taskName,
            linkType: predecessor[0].type,
            linkText: this.parent.getPredecessorTextValue(predecessor[0].type),
            offset: predecessor[0].offset,
            offsetUnit: predecessor[0].offsetUnit,
            offsetString: this.parent.getDurationString(fromTask.ganttProperties.duration, fromTask.ganttProperties.durationUnit)
        };
        return predecessorTooltipData;
    };
    /**
     * @private
     * To compile template string.
     */
    Tooltip$$1.prototype.templateCompiler = function (template, parent, data) {
        var tooltipFunction = parent.chartRowsModule.templateCompiler(template);
        var templateNode = tooltipFunction(extend({ index: 0 }, data), parent);
        return templateNode;
    };
    Tooltip$$1.prototype.destroy = function () {
        this.toolTipObj.destroy();
    };
    return Tooltip$$1;
}());

var __extends = (undefined && undefined.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
/**
 *
 * Represents the Gantt chart component.
 * ```html
 * <div id='gantt'></div>
 * <script>
 *  var ganttObject = new Gantt({
 *      taskFields: { id: 'taskId', name: 'taskName', startDate: 'startDate', duration: 'duration' }
 *  });
 *  ganttObject.appendTo('#gantt');
 * </script>
 * ```
 */
var Gantt = /** @__PURE__ @class */ (function (_super) {
    __extends(Gantt, _super);
    function Gantt(options, element) {
        var _this = _super.call(this, options, element) || this;
        /** @hidden */
        _this.previousRecords = {};
        /** @hidden */
        _this.editedRecords = [];
        /** @hidden */
        _this.isOnEdit = false;
        /** @hidden */
        _this.isOnDelete = false;
        /** @hidden */
        _this.isConnectorLineUpdate = false;
        /** @hidden */
        _this.staticSelectedRowIndex = -1;
        /**
         * @private
         */
        _this.isTreeGridRendered = false;
        /**
         * @private
         */
        _this.isGanttChartRendered = false;
        return _this;
    }
    /**
     * To get the module name
     * @private
     */
    Gantt.prototype.getModuleName = function () {
        return 'gantt';
    };
    /**
     * To perform key interaction in Gantt
     * @private
     */
    Gantt.prototype.onKeyPress = function (e) {
        switch (e.action) {
            case 'focusGanttChart':
                // console.log("Focus the Gantt Chart");
                break;
            case 'home':
                // console.log("Focus first row");
                break;
            case 'end':
                // console.log("Focus last row");
                break;
            case 'editCell':
                // console.log("edit the focused cell");
                break;
            case 'downArrow':
                // console.log("select next row");
                break;
            case 'upArrow':
                // console.log("select previous row");
                break;
            case 'ctrlDownArrow':
                // console.log("select multiple rows downwards");
                break;
            case 'ctrlUpArrow':
                // console.log("select multiple rows upwards");
                break;
            case 'rightArrow':
                // console.log("expand the record");
                break;
            case 'leftArrow':
                // console.log("collapse the record");
                break;
            case 'totalRowExpand':
                // console.log("expand all the parent");
                break;
            case 'totalRowCollapse':
                // console.log("collapse all the parent");
                break;
            case 'saveRequest':
                // console.log("Save edited cell");
                break;
            case 'cancelRequest':
                // console.log("Cancel edited cell");
                break;
            case 'addRow':
                // console.log(" an empty row at the top row if the rows are not selected. If a row is selected," +
                //     "then add an empty row based on the addRowPosition API");
                if (this.editModule && this.editSettings.allowAdding) {
                    e.preventDefault();
                    this.editModule.addRecord();
                }
                break;
            case 'addRowDialog':
                // console.log("add row through dialog");
                if (this.editModule && this.editSettings.allowAdding) {
                    e.preventDefault();
                    this.editModule.dialogModule.openAddDialog();
                }
                break;
            case 'editRowDialog':
                // console.log("add row through dialog");
                if (this.editModule && this.editSettings.allowEditing) {
                    e.preventDefault();
                    this.editModule.dialogModule.openToolbarEditDialog();
                }
                break;
            case 'delete':
                // console.log("delete selected record");
                if (this.selectionModule && this.editModule) {
                    if ((this.selectionSettings.mode === 'Row' && this.selectionModule.selectedRowIndexes.length)
                        || (this.selectionSettings.mode === 'Cell' && this.selectionModule.getSelectedRowCellIndexes().length)) {
                        this.editModule.startDeleteAction();
                    }
                }
                break;
            case 'navigateEditors':
                // console.log("Navigate between navigateEditors");
                break;
            case 'focusTask':
                // console.log("	Focus the selected task");
                break;
        }
    };
    /**
     * For internal use only - Initialize the event handler
     * @private
     */
    Gantt.prototype.preRender = function () {
        this.initProperties();
    };
    Gantt.prototype.initProperties = function () {
        this.globalize = new Internationalization(this.locale);
        this.flatData = [];
        this.currentViewData = [];
        this.ids = [];
        this.ganttColumns = [];
        this.localeObj = new L10n(this.getModuleName(), this.getDefaultLocale(), this.locale);
        this.dataOperation = new TaskProcessor(this);
        this.nonWorkingHours = [];
        this.nonWorkingTimeRanges = [];
        this.workingTimeRanges = [];
        this.defaultEndTime = null;
        this.defaultStartTime = null;
        this.durationUnitTexts = {
            days: 'days',
            hours: 'hours',
            minutes: 'minutes',
            day: 'day',
            hour: 'hour',
            minute: 'minute',
        };
        this.durationUnitEditText = {
            minute: ['m', 'min', 'minute', 'minutes'],
            hour: ['h', 'hr', 'hour', 'hours'],
            day: ['d', 'dy', 'day', 'days']
        };
        this.perDayWidth = null;
        this.isMileStoneEdited = false;
        this.chartVerticalLineContainer = null;
        this.updatedConnectorLineCollection = [];
        this.connectorLineIds = [];
        this.predecessorsCollection = [];
        this.enablePredecessorValidation = true;
        this.isValidationEnabled = true;
        this.isLoad = true;
        this.editedTaskBarItem = null;
        this.validationDialogElement = null;
        this.currentEditedArgs = {};
        this.dialogValidateMode = {
            respectLink: false,
            removeLink: false,
            preserveLinkWithEditing: true
        };
        this.secondsPerDay = this.dataOperation.getSecondsPerDay();
        this.nonWorkingDayIndex = [];
        this.dataOperation.getNonWorkingDayIndex();
        this.columnMapping = {};
        this.controlId = this.element.id;
        this.cloneProjectStartDate = null;
        this.cloneProjectEndDate = null;
        this.totalHolidayDates = this.dataOperation.getHolidayDates();
        this.ganttChartModule = new GanttChart(this);
        this.timelineModule = new Timeline(this);
        this.chartRowsModule = new ChartRows(this);
        this.treeGridModule = new GanttTreeGrid(this);
        this.dateValidationModule = new DateProcessor(this);
        this.predecessorModule = new Dependency(this);
        this.connectorLineModule = new ConnectorLine(this);
        this.connectorLineEditModule = new ConnectorLineEdit(this);
        this.splitterModule = new Splitter$1(this);
        this.tooltipModule = new Tooltip$1(this);
        this.keyConfig = {
            focusGanttChart: 'alt+74',
            home: 'home',
            end: 'end',
            editCell: 'f2',
            downArrow: 'downarrow',
            upArrow: 'uparrow',
            ctrlDownArrow: 'ctrl+downarrow',
            ctrlUpArrow: 'ctrl+uparrow',
            rightArrow: 'rightarrow',
            leftArrow: 'leftarrow',
            totalRowExpand: 'ctrl+rightarrow',
            totalRowCollapse: 'ctrl+leftarrow',
            saveRequest: '13',
            cancelRequest: '27',
            addRow: 'ctrl+187',
            addRowDialog: 'ctrl+shift+65',
            editRowDialog: 'ctrl+shift+69',
            delete: 'delete',
            navigateEditors: 'tab',
            focusTask: 'ctrl+shift+f5',
            indentLevel: 'shift+leftarrow',
            outdentLevel: 'shift+rightarrow',
        };
    };
    /**
     * To calculate dimensions of Gantt control
     */
    Gantt.prototype.calculateDimensions = function () {
        var settingsHeight = this.height;
        var settingsWidth = this.width;
        var elementStyleHeight = this.element.style.height;
        var elementStyleWidth = this.element.style.width;
        if (settingsWidth) {
            this.element.style.width = settingsWidth.toString();
        }
        if (settingsHeight) {
            this.element.style.height = settingsHeight.toString();
        }
        if (!settingsHeight && !elementStyleHeight) {
            this.element.style.height = 'auto'; // old 450px
        }
        if (!settingsWidth && !elementStyleWidth) {
            this.element.style.width = 'auto';
        }
        this.ganttHeight = this.element.offsetHeight;
        this.ganttWidth = this.element.offsetWidth;
    };
    /**
     * @private
     */
    Gantt.prototype.render = function () {
        createSpinner({ target: this.element }, this.createElement);
        this.trigger('load', {});
        this.element.classList.add(root);
        this.calculateDimensions();
        if (!isNullOrUndefined(this.toolbarModule)) {
            this.renderToolbar();
        }
        this.splitterModule.renderSplitter();
        this.notify('renderPanels', null);
        this.showSpinner();
        this.dataOperation.checkDataBinding();
    };
    /**
     * To show spinner
     */
    Gantt.prototype.showSpinner = function () {
        showSpinner(this.element);
    };
    /**
     * To hide spinner
     */
    Gantt.prototype.hideSpinner = function () {
        hideSpinner(this.element);
    };
    /**
     * @private
     */
    Gantt.prototype.renderGantt = function () {
        this.timelineModule.processTimelineUnit();
        // predecessor calculation
        if (this.taskFields.dependency) {
            this.predecessorModule.updatePredecessors();
            if (this.enablePredecessorValidation) {
                this.predecessorModule.updatedRecordsDateByPredecessor();
            }
        }
        this.dataOperation.calculateProjectDates();
        this.timelineModule.validateTimelineProp();
        this.dataOperation.updateGanttData();
        this.treeGridPane.classList.remove('e-temp-content');
        remove(this.treeGridPane.querySelector('.e-gantt-temp-header'));
        this.notify('dataReady', {});
        this.renderTreeGrid();
        this.wireEvents();
        if (this.taskFields.dependency && this.enablePredecessorValidation) {
            var dialogElement = createElement('div', {
                id: this.element.id + '_dialogValidationRule',
            });
            this.element.appendChild(dialogElement);
            this.predecessorModule.renderValidationDialog();
        }
        this.splitterModule.updateSplitterPosition();
        if (this.gridLines === 'Vertical' || this.gridLines === 'Both') {
            this.renderChartVerticalLines();
        }
    };
    Gantt.prototype.wireEvents = function () {
        if (this.allowKeyboard) {
            this.keyboardModule = new KeyboardEvents(this.element, {
                keyAction: this.keyActionHandler.bind(this),
                keyConfigs: this.keyConfig,
                eventName: 'keydown'
            });
        }
    };
    Gantt.prototype.keyActionHandler = function (e) {
        this.onKeyPress(e);
    };
    /**
     * @private
     */
    Gantt.prototype.renderToolbar = function () {
        if (!isNullOrUndefined(this.toolbarModule)) {
            this.toolbarModule.renderToolbar();
            this.toolbarModule.refreshToolbarItems();
        }
    };
    /**
     * @private
     */
    Gantt.prototype.renderTreeGrid = function () {
        this.treeGridModule.renderTreeGrid();
    };
    Gantt.prototype.updateCurrentViewData = function () {
        this.currentViewData = this.treeGrid.getCurrentViewRecords().slice();
    };
    /**
     * @private
     */
    Gantt.prototype.updateContentHeight = function () {
        var expandedRecords = this.getExpandedRecords(this.currentViewData);
        this.contentHeight = expandedRecords.length * this.rowHeight;
    };
    /**
     * To get expand status.
     * @return {boolean}
     * @private
     */
    Gantt.prototype.getExpandStatus = function (data) {
        var parentRecord = this.getParentTask(data.parentItem);
        if (!isNullOrUndefined(parentRecord)) {
            if (parentRecord.expanded === false) {
                return false;
            }
            else if (parentRecord.parentItem) {
                var parentData = this.getParentTask(parentRecord.parentItem);
                if (parentData.expanded === false) {
                    return false;
                }
                else {
                    return this.getExpandStatus(this.getParentTask(parentRecord.parentItem));
                }
            }
            else {
                return true;
            }
        }
        else {
            return true;
        }
    };
    /**
     * Get expanded records from given record collection
     * @param records
     */
    Gantt.prototype.getExpandedRecords = function (records) {
        var _this = this;
        var expandedRecords = records.filter(function (record) {
            return _this.getExpandStatus(record) === true;
        });
        return expandedRecords;
    };
    /**
     *
     * @param date
     * @param format
     */
    Gantt.prototype.getFormatedDate = function (date, format) {
        if (isNullOrUndefined(date)) {
            return null;
        }
        if (isNullOrUndefined(format)) {
            format = this.dateFormat;
        }
        return this.globalize.formatDate(date, { format: format });
    };
    /**
     * Get duration value as string combined with duration and unit values
     */
    Gantt.prototype.getDurationString = function (duration, durationUnit) {
        var value = this.dateValidationModule.getDurationString(duration, durationUnit);
        return value;
    };
    /**
     *
     * @param args
     * @private
     */
    Gantt.prototype.treeDataBound = function (args) {
        this.updateCurrentViewData();
        this.updateContentHeight();
        if (!this.isTreeGridRendered) {
            this.isTreeGridRendered = true;
            this.isLoad = false;
            var toolbarHeight = 0;
            if (!isNullOrUndefined(this.toolbarModule) && !isNullOrUndefined(this.toolbarModule.element)) {
                toolbarHeight = this.toolbarModule.element.offsetHeight;
            }
            if (this.timelineModule.isSingleTier) {
                addClass(this.treeGrid.element.querySelectorAll('.e-headercell'), timelineSingleHeaderOuterDiv);
                addClass(this.treeGrid.element.querySelectorAll('.e-columnheader'), timelineSingleHeaderOuterDiv);
            }
            else {
                removeClass(this.treeGrid.element.querySelectorAll('.e-headercell'), timelineSingleHeaderOuterDiv);
                removeClass(this.treeGrid.element.querySelectorAll('.e-columnheader'), timelineSingleHeaderOuterDiv);
            }
            this.treeGrid.height = this.ganttHeight - toolbarHeight -
                this.treeGrid.grid.getHeaderContent().offsetHeight;
            this.notify('tree-grid-created', {});
            this.createGanttPopUpElement();
            this.hideSpinner();
        }
        if (this.taskFields.dependency) {
            this.connectorLineIds = [];
            this.updatedConnectorLineCollection = [];
            this.predecessorModule.createConnectorLinesCollection(this.currentViewData);
        }
        this.notify('recordsUpdated', {});
        this.trigger('dataBound', args);
    };
    /**
     * Called internally, if any of the property value changed.
     * @param newProp
     * @param oldProp
     * @private
     */
    Gantt.prototype.onPropertyChanged = function (newProp, oldProp) {
        for (var _i = 0, _a = Object.keys(newProp); _i < _a.length; _i++) {
            var prop = _a[_i];
            switch (prop) {
                case 'allowSelection':
                    this.treeGrid.allowSelection = this.allowSelection;
                    this.treeGrid.dataBind();
                    break;
                case 'eventMarkers':
                    this.notify('ui-update', { module: 'day-markers', properties: newProp });
                    break;
                case 'highlightWeekends':
                    this.notify('ui-update', { module: 'day-markers', properties: newProp });
                    break;
                case 'holidays':
                    this.notify('ui-update', { module: 'day-markers', properties: newProp });
                    break;
                case 'sortSettings':
                    this.treeGrid.sortSettings = getActualProperties(this.sortSettings);
                    this.treeGrid.dataBind();
                    break;
                case 'timelineSettings':
                    this.timelineModule.refreshTimeline();
                    break;
                case 'rowHeight':
                case 'taskbarHeight':
                    this.treeGrid.rowHeight = this.rowHeight;
                    this.treeGrid.dataBind();
                    this.chartRowsModule.initiateTemplates();
                    this.timelineModule.updateChartByNewTimeline();
                    if (this.taskFields.dependency) {
                        this.ganttChartModule.reRenderConnectorLines();
                    }
                    break;
                case 'filterSettings':
                    this.treeGrid.filterSettings = getActualProperties(this.filterSettings);
                    this.treeGrid.dataBind();
                    break;
                case 'allowResizing':
                    this.treeGrid.allowResizing = this.allowResizing;
                    this.treeGrid.dataBind();
                    break;
                case 'allowReordering':
                    this.treeGrid.allowReordering = this.allowReordering;
                    this.treeGrid.dataBind();
                    break;
                case 'gridLines':
                    this.treeGrid.gridLines = this.gridLines;
                    this.treeGrid.dataBind();
                    this.renderChartGridLines();
                    break;
                case 'tooltipSettings':
                    if (this.tooltipModule.toolTipObj) {
                        this.tooltipModule.toolTipObj.destroy();
                    }
                    this.tooltipModule.createTooltip();
                    break;
                case 'splitterSettings':
                    this.splitterModule.updateSplitterPosition();
                    break;
                case 'selectionSettings':
                    this.treeGrid.selectionSettings = getActualProperties(this.selectionSettings);
                    this.treeGrid.dataBind();
                    break;
                case 'searchSettings':
                    this.treeGrid.grid.searchSettings = getActualProperties(this.searchSettings);
                    this.treeGrid.grid.dataBind();
                    if (this.toolbarModule) {
                        this.toolbarModule.updateSearchTextBox();
                    }
                    break;
            }
        }
    };
    /**
     * Get the properties to be maintained in the persisted state.
     * @return {string}
     * @private
     */
    Gantt.prototype.getPersistData = function () {
        var keyEntity = ['allowSelection'];
        return this.addOnPersist(keyEntity);
    };
    /**
     * @private
     */
    Gantt.prototype.destroy = function () {
        this.notify('destroy', {});
        if (!isNullOrUndefined(this.validationDialogElement) && !this.validationDialogElement.isDestroyed) {
            this.validationDialogElement.destroy();
        }
        var modules = ['ganttChartModule', 'timelineModule', 'chartRowsModule',
            'treeGridModule', 'ganttDataUpdatesModule', 'dateValidationModule', 'tooltipModule'];
        for (var i = 0; i < modules.length; i++) {
            if (this[modules[i]]) {
                this[modules[i]] = null;
            }
        }
        _super.prototype.destroy.call(this);
        this.chartVerticalLineContainer = null;
        this.element.innerHTML = '';
        removeClass([this.element], root);
        this.element.innerHTML = '';
    };
    /**
     * public method to get taskbarHeight.
     * @return {number}
     * @public
     */
    Gantt.prototype.getTaskbarHeight = function () {
        return this.chartRowsModule.taskBarHeight;
    };
    /**
     * To provide the array of modules needed for component rendering
     * @return {ModuleDeclaration[]}
     * @hidden
     */
    Gantt.prototype.requiredModules = function () {
        var modules = [];
        if (this.isDestroyed) {
            return modules;
        }
        if (this.allowSorting) {
            modules.push({
                member: 'sort',
                args: [this]
            });
        }
        if (this.allowFiltering || (this.toolbar && this.toolbar.indexOf('Search') !== -1)) {
            modules.push({
                member: 'filter',
                args: [this]
            });
        }
        if (this.allowReordering) {
            modules.push({
                member: 'reorder',
                args: [this]
            });
        }
        if (this.allowResizing) {
            modules.push({
                member: 'resize',
                args: [this]
            });
        }
        if (this.toolbar) {
            modules.push({
                member: 'toolbar',
                args: [this]
            });
        }
        if (this.editSettings.allowAdding || this.editSettings.allowEditing || this.editSettings.allowDeleting
            || this.editSettings.allowTaskbarEditing) {
            modules.push({
                member: 'edit',
                args: [this]
            });
        }
        if (this.allowSelection) {
            modules.push({
                member: 'selection',
                args: [this]
            });
        }
        if (this.tooltipSettings.showTooltip) {
            modules.push({
                member: 'tooltip',
                args: [this]
            });
        }
        if (this.highlightWeekends || (this.holidays && this.holidays.length > 0)
            || (this.eventMarkers && this.eventMarkers.length > 0)) {
            modules.push({
                member: 'dayMarkers',
                args: [this]
            });
        }
        return modules;
    };
    /**
     * Sorts a column with the given options.
     * @param {string} columnName - Defines the column name to be sorted.
     * @param {SortDirection} direction - Defines the direction of sorting field.
     * @param {boolean} isMultiSort - Specifies whether the previous sorted columns are to be maintained.
     * @return {void}
     */
    Gantt.prototype.sortColumn = function (columnName, direction, isMultiSort) {
        this.sortModule.sortColumn(columnName, direction, isMultiSort);
    };
    /**
     * Clears all the sorted columns of the Gantt.
     * @return {void}
     */
    Gantt.prototype.clearSorting = function () {
        this.sortModule.clearSorting();
    };
    /**
     * To validate and render chart horizontal and vertical lines in the Gantt
     * @return {void}
     * @hidden
     */
    Gantt.prototype.renderChartGridLines = function () {
        var className = 'e-chart-row-border';
        var verticalLines = this.chartVerticalLineContainer;
        var chartRowsTD = document.getElementById(this.element.id + 'GanttTaskTableBody').querySelectorAll('td');
        if (this.gridLines === 'Vertical') {
            if (isNullOrUndefined(verticalLines)) {
                this.renderChartVerticalLines();
            }
            else {
                if (verticalLines.style.display === 'none') {
                    verticalLines.style.display = 'block';
                }
            }
            if (chartRowsTD[0].classList.contains(className)) {
                for (var c = 0; c < chartRowsTD.length; c++) {
                    removeClass([chartRowsTD[c]], className);
                }
            }
        }
        else if (this.gridLines === 'Horizontal') {
            if (!isNullOrUndefined(verticalLines)) {
                verticalLines.style.display = 'none';
            }
            if (!chartRowsTD[0].classList.contains(className)) {
                for (var c = 0; c < chartRowsTD.length; c++) {
                    addClass([chartRowsTD[c]], className);
                }
            }
        }
        else if (this.gridLines === 'Both') {
            if (isNullOrUndefined(verticalLines)) {
                this.renderChartVerticalLines();
            }
            else {
                if (verticalLines.style.display === 'none') {
                    verticalLines.style.display = 'block';
                }
            }
            if (!chartRowsTD[0].classList.contains(className)) {
                for (var c = 0; c < chartRowsTD.length; c++) {
                    addClass([chartRowsTD[c]], className);
                }
            }
        }
        else if (this.gridLines === 'None') {
            if (!isNullOrUndefined(verticalLines) && verticalLines.style.display !== 'none') {
                verticalLines.style.display = 'none';
            }
            if (chartRowsTD[0].classList.contains(className)) {
                for (var c = 0; c < chartRowsTD.length; c++) {
                    removeClass([chartRowsTD[c]], className);
                }
            }
        }
    };
    /**
     * To update height of the Grid lines in the Gantt chart side.
     * @return {void}
     * @private
     */
    Gantt.prototype.updateGridLineContainerHeight = function () {
        if (this.chartVerticalLineContainer) {
            this.chartVerticalLineContainer.style.height = formatUnit(this.contentHeight);
        }
    };
    /**
     * To render vertical lines in the Gantt chart side.
     * @return {void}
     */
    Gantt.prototype.renderChartVerticalLines = function () {
        if (!this.element.contains(this.chartVerticalLineContainer)) {
            this.chartVerticalLineContainer = createElement('div', {
                id: this.element.id + 'line-container',
                styles: 'position:absolute;height:100%;z-index:1'
            });
            this.element.getElementsByClassName('e-chart-rows-container')[0].appendChild(this.chartVerticalLineContainer);
        }
        this.chartVerticalLineContainer.innerHTML = '';
        var headerTable = this.element.getElementsByClassName('e-timeline-header-table-container')[1];
        if (isNullOrUndefined(headerTable)) {
            headerTable = this.element.getElementsByClassName('e-timeline-header-table-container')[0];
        }
        var thElements = headerTable.getElementsByTagName('th');
        var thLength = thElements.length;
        var thWidth;
        var leftPos = 0;
        var containerDiv = createElement('div');
        for (var n = 0; n < thLength; n++) {
            leftPos = n === 0 ? -1 : (leftPos + parseInt(thWidth, 10));
            thWidth = thElements[n].style.width;
            var divElement = createElement('div', {
                className: 'e-line-container-cell',
                styles: 'left:' + leftPos + 'px'
            });
            containerDiv.appendChild(divElement);
        }
        this.chartVerticalLineContainer.innerHTML = containerDiv.innerHTML;
    };
    /**
     * Remove sorted columns of the Gantt.
     * @return {void}
     */
    Gantt.prototype.getDefaultLocale = function () {
        var ganttLocale = {
            emptyRecord: 'No records to display',
            id: 'ID',
            name: 'Name',
            startDate: 'Start Date',
            endDate: 'End Date',
            duration: 'Duration',
            progress: 'Progress',
            dependency: 'Dependency',
            notes: 'Notes',
            baselineStartDate: 'Baseline Start Date',
            baselineEndDate: 'Baseline End Date',
            type: 'Type',
            offset: 'Offset',
            resourceName: 'Resources',
            resourceID: 'Resource ID',
            day: 'day',
            hour: 'hour',
            minute: 'minute',
            days: 'days',
            hours: 'hours',
            minutes: 'minutes',
            generalTab: 'General',
            customTab: 'Custom Columns',
            writeNotes: 'Write Notes',
            addDialogTitle: 'New Task',
            editDialogTitle: 'Task Information',
            add: 'Add',
            edit: 'Edit',
            update: 'Update',
            delete: 'Delete',
            cancel: 'Cancel',
            search: 'Search',
            task: ' task',
            tasks: ' tasks',
            expandAll: 'Expand all',
            collapseAll: 'Collapse all',
            nextTimeSpan: 'Next timespan',
            prevTimeSpan: 'Previous timespan',
            saveButton: 'Save',
            taskBeforePredecessor_FS: 'You moved "{0}" to start before "{1}" finishes and the two tasks are linked.'
                + 'As the result, the links cannot be honored. Select one action below to perform',
            taskAfterPredecessor_FS: 'You moved "{0}" away from "{1}" and the two tasks are linked.'
                + 'As the result, the links cannot be honored. Select one action below to perform',
            taskBeforePredecessor_SS: 'You moved "{0}" to start before "{1}" starts and the two tasks are linked.'
                + 'As the result, the links cannot be honored. Select one action below to perform',
            taskAfterPredecessor_SS: 'You moved "{0}" to start after "{1}" starts and the two tasks are linked.'
                + 'As the result, the links cannot be honored. Select one action below to perform',
            taskBeforePredecessor_FF: 'You moved "{0}" to finish before "{1}" finishes and the two tasks are linked.'
                + 'As the result, the links cannot be honored. Select one action below to perform',
            taskAfterPredecessor_FF: 'You moved "{0}" to finish after "{1}" finishes and the two tasks are linked.'
                + 'As the result, the links cannot be honored. Select one action below to perform',
            taskBeforePredecessor_SF: 'You moved "{0}" away from "{1}" to starts and the two tasks are linked.'
                + 'As the result, the links cannot be honored. Select one action below to perform',
            taskAfterPredecessor_SF: 'You moved "{0}" to finish after "{1}" starts and the two tasks are linked.'
                + 'As the result, the links cannot be honored. Select one action below to perform',
            okText: 'Ok',
            confirmDelete: 'Are you sure you want to Delete Record?',
            from: 'From',
            to: 'To',
            taskLink: 'Task Link',
            lag: 'Lag',
            start: 'Start',
            finish: 'Finish',
            enterValue: 'Enter the value'
        };
        return ganttLocale;
    };
    /**
     * To clear sorted records with specific to particular column
     * @param columnName
     */
    Gantt.prototype.removeSortColumn = function (columnName) {
        this.sortModule.removeSortColumn(columnName);
    };
    /**
     *
     * @param args
     * @private
     */
    Gantt.prototype.actionBeginTask = function (args) {
        this.trigger('actionBegin', args);
    };
    /**
     * To move horizontal scroll bar of Gantt to specific date
     */
    Gantt.prototype.scrollToDate = function (date) {
        var tempDate = this.dateValidationModule.getDateFromFormat(date);
        var left = this.dataOperation.getTaskLeft(tempDate, false);
        this.ganttChartModule.updateScrollLeft(left);
    };
    /**
     * To move horizontal scroll bar of Gantt to specific date
     */
    Gantt.prototype.scrollToTask = function (taskId) {
        if (this.ids.indexOf(taskId) !== -1) {
            var left = this.flatData[this.ids.indexOf(taskId)].ganttProperties.left;
            this.ganttChartModule.updateScrollLeft(left);
        }
    };
    /**
     * To set scroll left and top in chart side
     * @param left
     * @param top
     */
    Gantt.prototype.updateChartScrollOffset = function (left, top) {
        if (!isNullOrUndefined(left)) {
            left = this.ganttChartModule.scrollElement.scrollWidth <= left ?
                this.ganttChartModule.scrollElement.scrollWidth : left;
            this.ganttChartModule.scrollObject.setScrollLeft(left);
        }
        if (!isNullOrUndefined(top)) {
            top = this.ganttChartModule.scrollElement.scrollHeight <= top ? this.ganttChartModule.scrollElement.scrollHeight : top;
            this.ganttChartModule.scrollObject.setScrollTop(top);
        }
    };
    /**
     * Get parent task by clone parent item
     * @param cloneParent
     */
    Gantt.prototype.getParentTask = function (cloneParent) {
        if (!isNullOrUndefined(cloneParent)) {
            var parent_1 = this.flatData.filter(function (val) {
                return cloneParent.uniqueID === val.uniqueID;
            });
            if (parent_1.length > 0) {
                return parent_1[0];
            }
            else {
                return null;
            }
        }
        else {
            return null;
        }
    };
    /**
     * Filters TreeGrid row by column name with the given options.
     * @param  {string} fieldName - Defines the field name of the column.
     * @param  {string} filterOperator - Defines the operator to filter records.
     * @param  {string | number | Date | boolean} filterValue - Defines the value used to filter records.
     * @param  {string} predicate - Defines the relationship between one filter query and another by using AND or OR predicate.
     * @param  {boolean} matchCase - If match case is set to true, TreeGrid filters the records with exact match.if false, it filters case
     * insensitive records (uppercase and lowercase letters treated the same).
     * @param  {boolean} ignoreAccent - If ignoreAccent set to true,
     * then filter ignores the diacritic characters or accents while filtering.
     * @param  {string} actualFilterValue - Defines the actual filter value for the filter column.
     * @param  {string} actualOperator - Defines the actual filter operator for the filter column.
     * @return {void}
     */
    Gantt.prototype.filterByColumn = function (fieldName, filterOperator, filterValue, predicate, matchCase, ignoreAccent) {
        this.treeGrid.filterByColumn(fieldName, filterOperator, filterValue, predicate, matchCase, ignoreAccent);
    };
    /**
     * Clears all the filtered columns in Gantt.
     * @return {void}
     */
    Gantt.prototype.clearFiltering = function () {
        this.treeGrid.clearFiltering();
    };
    /**
     * Removes filtered column by field name.
     * @param  {string} field - Defines column field name to remove filter.
     * @return {void}
     * @hidden
     */
    Gantt.prototype.removeFilteredColsByField = function (field) {
        this.treeGrid.removeFilteredColsByField(field, false);
    };
    /**
     * Method to set holidays and non working days in date time and date picker controls
     * @return {void}
     * @private
     */
    Gantt.prototype.renderWorkingDayCell = function (args) {
        var nonWorkingDays = this.nonWorkingDayIndex;
        var holidays = this.totalHolidayDates;
        if (nonWorkingDays.length > 0 && nonWorkingDays.indexOf(args.date.getDay()) !== -1) {
            args.isDisabled = true;
        }
        else if (holidays.length > 0) {
            var tempDate = new Date(args.date.getTime());
            tempDate.setHours(0, 0, 0);
            if (holidays.indexOf(tempDate.getTime()) !== -1) {
                args.isDisabled = true;
            }
        }
    };
    /**
     * To update timeline at start point with one unit.
     * @return {void}
     * @public
     */
    Gantt.prototype.previousTimeSpan = function (mode) {
        this.timelineModule.performTimeSpanAction('prevTimeSpan', 'publicMethod', new Date(this.timelineModule.timelineStartDate.getTime()), new Date(this.timelineModule.timelineEndDate.getTime()), mode);
    };
    /**
     * To update timeline at end point with one unit.
     * @return {void}
     * @public
     */
    Gantt.prototype.nextTimeSpan = function (mode) {
        this.timelineModule.performTimeSpanAction('nextTimeSpan', 'publicMethod', new Date(this.timelineModule.timelineStartDate.getTime()), new Date(this.timelineModule.timelineEndDate.getTime()), mode);
    };
    /**
     * To validate project start date and end date.
     * @return {void}
     * @public
     */
    Gantt.prototype.updateProjectDates = function (startDate, endDate, isTimelineRoundOff) {
        this.timelineModule.totalTimelineWidth = 0;
        this.cloneProjectStartDate = startDate;
        this.cloneProjectEndDate = endDate;
        this.isTimelineRoundOff = isTimelineRoundOff;
        this.timelineModule.refreshTimelineByTimeSpan();
        this.dataOperation.reUpdateGanttDataPosition();
        this.timelineModule.updateChartByNewTimeline();
        this.ganttChartModule.chartBodyContent.style.width = formatUnit(this.timelineModule.totalTimelineWidth);
        this.ganttChartModule.updateLastRowBottomWidth();
        if (this.gridLines === 'Vertical' || this.gridLines === 'Both') {
            this.renderChartVerticalLines();
        }
        if (this.taskFields.dependency) {
            this.ganttChartModule.reRenderConnectorLines();
        }
    };
    /**
     * Changes the TreeGrid column positions by field names.
     * @return {void}
     * @public
     */
    Gantt.prototype.reorderColumns = function (fromFName, toFName) {
        this.treeGrid.reorderColumns(fromFName, toFName);
    };
    /**
     * Method to clear edited collections in gantt set edit flag value
     * @private
     */
    Gantt.prototype.initiateEditAction = function (isStart) {
        this.isOnEdit = isStart;
        this.previousRecords = {};
        this.editedRecords = [];
    };
    /**
     *
     * @param field Method to update value in Gantt record and make clone record for this
     * @param record
     * @private
     */
    /* tslint:disable-next-line */
    Gantt.prototype.setRecordValue = function (field, value, record, isTaskData) {
        if (this.isOnEdit || this.isOnDelete) {
            this.makeCloneData(field, record, isTaskData);
            var id = isTaskData ? record.taskId : record.ganttProperties.taskId;
            var task = this.getRecordByID(id);
            if (task && this.editedRecords.indexOf(task) === -1) {
                this.editedRecords.push(task);
            }
        }
        value = isUndefined(value) ? null : value;
        setValue(field, value, record);
    };
    Gantt.prototype.makeCloneData = function (field, record, isTaskData) {
        var cloneData;
        /* tslint:disable-next-line */
        var value = getValue(field, record);
        /* tslint:disable-next-line */
        var prevValue;
        /* tslint:disable-next-line */
        var clonedValue;
        if (isTaskData) {
            field = 'ganttProperties.' + field;
        }
        if (isNullOrUndefined(this.previousRecords[record.uniqueID])) {
            var tempData = {};
            this.previousRecords[record.uniqueID] = tempData;
        }
        cloneData = this.previousRecords[record.uniqueID];
        prevValue = getValue(field, cloneData);
        if (isUndefined(prevValue)) {
            if (value instanceof Date) {
                clonedValue = new Date(value.getTime());
            }
            else if (isObjectArray(value)) {
                clonedValue = extend([], value, [], true);
            }
            else if (isObject(value)) {
                clonedValue = extend({}, {}, value, true);
            }
            else {
                clonedValue = value;
            }
            if (!isUndefined(clonedValue)) {
                setValue(field, clonedValue, cloneData);
            }
            else {
                setValue(field, null, cloneData);
            }
        }
    };
    /**
     * Method to get task by uniqueId value
     * @param id
     */
    Gantt.prototype.getTaskByUniqueID = function (id) {
        var value = this.flatData.filter(function (val) {
            return val.uniqueID === id;
        });
        if (value.length > 0) {
            return value[0];
        }
        else {
            return null;
        }
    };
    /**
     * Method to get task by id value
     * @param id
     */
    Gantt.prototype.getRecordByID = function (id) {
        if (isNullOrUndefined(id)) {
            return null;
        }
        return this.flatData[this.ids.indexOf(id.toString())];
    };
    /**
     * Method to set splitter position
     * @param value
     * @param valueType
     */
    Gantt.prototype.setSplitterPosition = function (value, valueType) {
        var tempSplitterSettings = {};
        tempSplitterSettings[valueType] = value;
        var splitterPosition = this.splitterModule.calculateSplitterPosition(tempSplitterSettings, true);
        var pane1 = this.splitterModule.splitterObject.element.querySelectorAll('.e-pane')[0];
        var pane2 = this.splitterModule.splitterObject.element.querySelectorAll('.e-pane')[1];
        this.splitterModule.splitterPreviousPositionGrid = pane1.scrollWidth + 1 + 'px';
        this.splitterModule.splitterPreviousPositionChart = pane2.scrollWidth + 1 + 'px';
        this.splitterModule.splitterObject.paneSettings[0].size = splitterPosition;
        this.splitterModule.triggerCustomResizedEvent();
    };
    /**
     * Expand the record by index value.
     * @return {void}
     * @public
     */
    Gantt.prototype.expandByIndex = function (index) {
        var args = this.contructExpandCollapseArgs(null, index);
        this.ganttChartModule.expandGanttRow(args);
    };
    /**
     * Expand the record by task id.
     * @return {void}
     * @public
     */
    Gantt.prototype.expandByID = function (id) {
        var args = this.contructExpandCollapseArgs(id);
        this.ganttChartModule.expandGanttRow(args);
    };
    /**
     * Collapse the record by index value.
     * @return {void}
     * @public
     */
    Gantt.prototype.collapseByIndex = function (index) {
        var args = this.contructExpandCollapseArgs(null, index);
        this.ganttChartModule.collapseGanttRow(args);
    };
    /**
     * Collapse the record by ud value.
     * @return {void}
     * @public
     */
    Gantt.prototype.collapseByID = function (id) {
        var args = this.contructExpandCollapseArgs(id);
        this.ganttChartModule.collapseGanttRow(args);
    };
    /**
     * Add record public method.
     * @return {void}
     * @public
     */
    Gantt.prototype.addRecord = function (data, rowPosition, rowIndex) {
        if (this.editModule && this.editSettings.allowAdding) {
            this.editModule.addRecord(data, rowPosition, rowIndex);
        }
    };
    /**
     * Add record public method.
     * @return {void}
     * @public
     */
    Gantt.prototype.updateRecordByID = function (data) {
        if (this.editModule && this.editSettings.allowEditing) {
            this.editModule.updateRecordByID(data);
        }
    };
    /**
     * To add dependency for Task
     * @return {void}
     * @public
     */
    Gantt.prototype.addPredecessor = function (ganttRecord, predecessorString) {
        if (this.editModule) {
            this.connectorLineEditModule.addPredecessor(ganttRecord, predecessorString);
        }
    };
    /**
     * To remove dependency from task
     * @return {void}
     * @public
     */
    Gantt.prototype.removePredecessor = function (ganttRecord) {
        if (this.editModule) {
            this.connectorLineEditModule.removePredecessor(ganttRecord);
        }
    };
    /**
     * To modify current dependency values of Task
     * @return {void}
     * @public
     */
    Gantt.prototype.updatePredecessor = function (ganttRecord, predecessorString) {
        if (this.editModule) {
            this.connectorLineEditModule.updatePredecessor(ganttRecord, predecessorString);
        }
    };
    /**
     * Changes the TreeGrid column positions by field names.
     * @return {void}
     * @private
     */
    Gantt.prototype.contructExpandCollapseArgs = function (id, index) {
        var chartRow$$1;
        var record;
        var rowIndex;
        if (!index) {
            record = this.getRecordByID(id.toString());
            chartRow$$1 = this.getRowByID(id);
            rowIndex = getValue('rowIndex', chartRow$$1);
        }
        else if (index) {
            chartRow$$1 = this.getRowByIndex(index);
            rowIndex = getValue('rowIndex', chartRow$$1);
            record = this.currentViewData[rowIndex];
        }
        var gridRow = this.treeGrid.getRows()[rowIndex];
        var args;
        return args = { data: record, gridRow: gridRow, chartRow: chartRow$$1, cancel: false };
    };
    /**
     * Method to get chart row value by index.
     * @return {HTMLElement}
     */
    Gantt.prototype.getRowByIndex = function (index) {
        try {
            var gridRows = this.element.querySelectorAll('.e-chart-row');
            if (!isNullOrUndefined(index)) {
                return gridRows[index];
            }
            else {
                return null;
            }
        }
        catch (e) {
            return null;
        }
    };
    /**
     * Method to get the row element by task id.
     * @return {HTMLElement}
     */
    Gantt.prototype.getRowByID = function (id) {
        var record = this.getRecordByID(id.toString());
        var index = this.currentViewData.indexOf(record);
        if (index !== -1) {
            return this.getRowByIndex(index);
        }
        else {
            return null;
        }
    };
    /**
     * Method to get class name for unscheduled tasks
     * @param ganttProp
     * @private
     */
    Gantt.prototype.getUnscheduledTaskClass = function (ganttProp) {
        if (isNullOrUndefined(ganttProp.startDate) && isNullOrUndefined(ganttProp.endDate) &&
            isNullOrUndefined(ganttProp.duration)) {
            return ' ' + traceUnscheduledTask;
        }
        else if (isNullOrUndefined(ganttProp.startDate) || isNullOrUndefined(ganttProp.endDate) ||
            isNullOrUndefined(ganttProp.duration)) {
            return ' ' + traceUnscheduledTask;
        }
        else {
            return '';
        }
    };
    Gantt.prototype.createGanttPopUpElement = function () {
        var popup = this.createElement('div', { className: 'e-ganttpopup', styles: 'display:none;' });
        var content = this.createElement('div', { className: 'e-content', attrs: { tabIndex: '-1' } });
        append([content, this.createElement('div', { className: 'e-uptail e-tail' })], popup);
        content.appendChild(this.createElement('span'));
        append([content, this.createElement('div', { className: 'e-downtail e-tail' })], popup);
        document.getElementById(this.element.id + 'GanttChart').appendChild(popup);
    };
    /**
     * Method to get predecessor value as string.
     * @return {HTMLElement}
     * @private
     */
    Gantt.prototype.getPredecessorTextValue = function (type) {
        var textValue;
        switch (type) {
            case 'SS':
                textValue = this.localeObj.getConstant('start') + '-' + this.localeObj.getConstant('start');
                break;
            case 'FF':
                textValue = this.localeObj.getConstant('finish') + '-' + this.localeObj.getConstant('finish');
                break;
            case 'SF':
                textValue = this.localeObj.getConstant('start') + '-' + this.localeObj.getConstant('finish');
                break;
            case 'FS':
                textValue = this.localeObj.getConstant('finish') + '-' + this.localeObj.getConstant('start');
                break;
        }
        return textValue;
    };
    /**
     * Method to perform search action in Gantt
     * @param keyVal  - Search key string
     */
    Gantt.prototype.search = function (keyVal) {
        this.searchSettings.key = keyVal;
        this.dataBind();
    };
    /**
     * Method to get offset rect value
     * @param element
     * @hidden
     */
    Gantt.prototype.getOffsetRect = function (element) {
        var box = element.getBoundingClientRect();
        var scrollTop = window.pageYOffset || document.documentElement.scrollTop
            || document.body.scrollTop;
        var scrollLeft = window.pageXOffset || document.documentElement.scrollLeft ||
            document.body.scrollLeft;
        var clientTop = document.documentElement.clientTop || document.body.clientTop || 0;
        var clientLeft = document.documentElement.clientLeft || document.body.clientLeft || 0;
        var top = box.top + scrollTop - clientTop;
        var left = box.left + scrollLeft - clientLeft;
        return { top: Math.round(top), left: Math.round(left) };
    };
    __decorate([
        Property(true)
    ], Gantt.prototype, "allowKeyboard", void 0);
    __decorate([
        Property(true)
    ], Gantt.prototype, "autoFocusTasks", void 0);
    __decorate([
        Property(true)
    ], Gantt.prototype, "allowSelection", void 0);
    __decorate([
        Property(false)
    ], Gantt.prototype, "allowSorting", void 0);
    __decorate([
        Property(false)
    ], Gantt.prototype, "showColumnMenu", void 0);
    __decorate([
        Property(false)
    ], Gantt.prototype, "collapseAllParentTasks", void 0);
    __decorate([
        Property(false)
    ], Gantt.prototype, "highlightWeekends", void 0);
    __decorate([
        Property(0)
    ], Gantt.prototype, "treeColumnIndex", void 0);
    __decorate([
        Property([])
    ], Gantt.prototype, "dataSource", void 0);
    __decorate([
        Property('day')
    ], Gantt.prototype, "durationUnit", void 0);
    __decorate([
        Property(null)
    ], Gantt.prototype, "query", void 0);
    __decorate([
        Property('MM/dd/yyyy')
    ], Gantt.prototype, "dateFormat", void 0);
    __decorate([
        Property('auto')
    ], Gantt.prototype, "height", void 0);
    __decorate([
        Property(false)
    ], Gantt.prototype, "renderBaseline", void 0);
    __decorate([
        Property('Horizontal')
    ], Gantt.prototype, "gridLines", void 0);
    __decorate([
        Complex({}, LabelSettings)
    ], Gantt.prototype, "labelSettings", void 0);
    __decorate([
        Property(null)
    ], Gantt.prototype, "taskbarTemplate", void 0);
    __decorate([
        Property(null)
    ], Gantt.prototype, "parentTaskbarTemplate", void 0);
    __decorate([
        Property(null)
    ], Gantt.prototype, "milestoneTemplate", void 0);
    __decorate([
        Property()
    ], Gantt.prototype, "baselineColor", void 0);
    __decorate([
        Property('auto')
    ], Gantt.prototype, "width", void 0);
    __decorate([
        Property()
    ], Gantt.prototype, "toolbar", void 0);
    __decorate([
        Property(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'])
    ], Gantt.prototype, "workWeek", void 0);
    __decorate([
        Property(false)
    ], Gantt.prototype, "includeWeekend", void 0);
    __decorate([
        Property(false)
    ], Gantt.prototype, "allowUnscheduledTasks", void 0);
    __decorate([
        Property(false)
    ], Gantt.prototype, "showInlineNotes", void 0);
    __decorate([
        Property(36)
    ], Gantt.prototype, "rowHeight", void 0);
    __decorate([
        Property(null)
    ], Gantt.prototype, "taskbarHeight", void 0);
    __decorate([
        Property(null)
    ], Gantt.prototype, "projectStartDate", void 0);
    __decorate([
        Property(null)
    ], Gantt.prototype, "projectEndDate", void 0);
    __decorate([
        Property(null)
    ], Gantt.prototype, "resourceIDMapping", void 0);
    __decorate([
        Property(null)
    ], Gantt.prototype, "resourceNameMapping", void 0);
    __decorate([
        Property([])
    ], Gantt.prototype, "resources", void 0);
    __decorate([
        Property(null)
    ], Gantt.prototype, "connectorLineBackground", void 0);
    __decorate([
        Property(1)
    ], Gantt.prototype, "connectorLineWidth", void 0);
    __decorate([
        Property([])
    ], Gantt.prototype, "columns", void 0);
    __decorate([
        Property([])
    ], Gantt.prototype, "addDialogFields", void 0);
    __decorate([
        Property([])
    ], Gantt.prototype, "editDialogFields", void 0);
    __decorate([
        Property(-1)
    ], Gantt.prototype, "selectedRowIndex", void 0);
    __decorate([
        Collection([{ from: 8, to: 12 }, { from: 13, to: 17 }], DayWorkingTime)
    ], Gantt.prototype, "dayWorkingTime", void 0);
    __decorate([
        Collection([], Holiday)
    ], Gantt.prototype, "holidays", void 0);
    __decorate([
        Collection([], EventMarker)
    ], Gantt.prototype, "eventMarkers", void 0);
    __decorate([
        Complex({}, TaskFields)
    ], Gantt.prototype, "taskFields", void 0);
    __decorate([
        Complex({}, TimelineSettings)
    ], Gantt.prototype, "timelineSettings", void 0);
    __decorate([
        Complex({}, SortSettings)
    ], Gantt.prototype, "sortSettings", void 0);
    __decorate([
        Complex({}, EditSettings)
    ], Gantt.prototype, "editSettings", void 0);
    __decorate([
        Complex({}, TooltipSettings)
    ], Gantt.prototype, "tooltipSettings", void 0);
    __decorate([
        Complex({}, SelectionSettings)
    ], Gantt.prototype, "selectionSettings", void 0);
    __decorate([
        Property(false)
    ], Gantt.prototype, "allowFiltering", void 0);
    __decorate([
        Property(false)
    ], Gantt.prototype, "allowReordering", void 0);
    __decorate([
        Property(false)
    ], Gantt.prototype, "allowResizing", void 0);
    __decorate([
        Complex({}, FilterSettings)
    ], Gantt.prototype, "filterSettings", void 0);
    __decorate([
        Complex({}, SearchSettings)
    ], Gantt.prototype, "searchSettings", void 0);
    __decorate([
        Complex({}, SplitterSettings)
    ], Gantt.prototype, "splitterSettings", void 0);
    __decorate([
        Event()
    ], Gantt.prototype, "queryTaskbarInfo", void 0);
    __decorate([
        Event()
    ], Gantt.prototype, "collapsing", void 0);
    __decorate([
        Event()
    ], Gantt.prototype, "collapsed", void 0);
    __decorate([
        Event()
    ], Gantt.prototype, "expanding", void 0);
    __decorate([
        Event()
    ], Gantt.prototype, "expanded", void 0);
    __decorate([
        Event()
    ], Gantt.prototype, "actionBegin", void 0);
    __decorate([
        Event()
    ], Gantt.prototype, "actionComplete", void 0);
    __decorate([
        Event()
    ], Gantt.prototype, "actionFailure", void 0);
    __decorate([
        Event()
    ], Gantt.prototype, "taskbarEdited", void 0);
    __decorate([
        Event()
    ], Gantt.prototype, "load", void 0);
    __decorate([
        Event()
    ], Gantt.prototype, "taskbarEditing", void 0);
    __decorate([
        Event()
    ], Gantt.prototype, "dataBound", void 0);
    __decorate([
        Event()
    ], Gantt.prototype, "resizeStart", void 0);
    __decorate([
        Event()
    ], Gantt.prototype, "resizing", void 0);
    __decorate([
        Event()
    ], Gantt.prototype, "resizeStop", void 0);
    __decorate([
        Event()
    ], Gantt.prototype, "splitterResizeStart", void 0);
    __decorate([
        Event()
    ], Gantt.prototype, "splitterResizing", void 0);
    __decorate([
        Event()
    ], Gantt.prototype, "splitterResized", void 0);
    __decorate([
        Event()
    ], Gantt.prototype, "columnDragStart", void 0);
    __decorate([
        Event()
    ], Gantt.prototype, "columnDrag", void 0);
    __decorate([
        Event()
    ], Gantt.prototype, "columnDrop", void 0);
    __decorate([
        Event()
    ], Gantt.prototype, "beforeTooltipRender", void 0);
    __decorate([
        Event()
    ], Gantt.prototype, "rowSelecting", void 0);
    __decorate([
        Event()
    ], Gantt.prototype, "rowSelected", void 0);
    __decorate([
        Event()
    ], Gantt.prototype, "rowDeselecting", void 0);
    __decorate([
        Event()
    ], Gantt.prototype, "rowDeselected", void 0);
    __decorate([
        Event()
    ], Gantt.prototype, "cellSelecting", void 0);
    __decorate([
        Event()
    ], Gantt.prototype, "cellSelected", void 0);
    __decorate([
        Event()
    ], Gantt.prototype, "cellDeselecting", void 0);
    __decorate([
        Event()
    ], Gantt.prototype, "cellDeselected", void 0);
    __decorate([
        Event()
    ], Gantt.prototype, "queryCellInfo", void 0);
    __decorate([
        Event()
    ], Gantt.prototype, "headerCellInfo", void 0);
    __decorate([
        Event()
    ], Gantt.prototype, "rowDataBound", void 0);
    __decorate([
        Event()
    ], Gantt.prototype, "columnMenuOpen", void 0);
    __decorate([
        Event()
    ], Gantt.prototype, "columnMenuClick", void 0);
    Gantt = __decorate([
        NotifyPropertyChanges
    ], Gantt);
    return Gantt;
}(Component));

/**
 *  This file was to define all public and internal events
 */
/** @hidden */
var load = 'load';
/** @hidden */
var rowDataBound = 'rowDataBound';
/** @hidden */
var queryCellInfo = 'queryCellInfo';
/** @hidden */
var toolbarClick = 'toolbarClick';
/** @hidden */
var keyPressed = 'key-pressed';

/**
 * Gantt base related properties
 */

/**
 * To handle cell edit action on default columns and custom columns
 */
var CellEdit = /** @__PURE__ @class */ (function () {
    function CellEdit(ganttObj) {
        this.isCellEdit = false;
        this.parent = ganttObj;
        this.bindTreeGridProperties();
    }
    /**
     * Bind all editing related properties from Gantt to TreeGrid
     */
    CellEdit.prototype.bindTreeGridProperties = function () {
        this.parent.treeGrid.editSettings.allowEditing = this.parent.editSettings.allowEditing;
        this.parent.treeGrid.editSettings.mode = 'Cell';
        this.parent.treeGrid.cellEdit = this.ensureEditCell.bind(this);
        if (this.parent.editSettings.allowEditing) {
            TreeGrid.Inject(Edit$1);
        }
    };
    /**
     * Ensure current cell was editable or not
     * @param args
     */
    CellEdit.prototype.ensureEditCell = function (args) {
        var data = args.rowData;
        var field = args.columnName;
        var taskSettings = this.parent.taskFields;
        if (data.hasChildRecords && (field === taskSettings.endDate || field === taskSettings.duration
            || field === taskSettings.dependency || field === taskSettings.progress)) {
            args.cancel = true;
        }
        if (!args.cancel) {
            this.isCellEdit = true;
            if (!isNullOrUndefined(this.parent.toolbarModule)) {
                this.parent.toolbarModule.refreshToolbarItems();
            }
        }
        this.openNotesEditor(args);
    };
    /**
     * To render edit dialog and to focus on notes tab
     * @param args
     */
    CellEdit.prototype.openNotesEditor = function (args) {
        var taskSettings = this.parent.taskFields;
        var data = args.rowData;
        var field = args.columnName;
        if ((field === taskSettings.notes && !this.parent.showInlineNotes)) {
            args.cancel = true;
            var columnTypes = this.parent.editDialogFields.map(function (x) { return x.type; });
            var index = columnTypes.indexOf('Notes');
            if (index !== -1) {
                this.parent.editModule.dialogModule.openEditDialog(data.ganttProperties.taskId);
                var tabObj = document.getElementById(this.parent.element.id + '_Tab').ej2_instances[0];
                tabObj.selectedItem = index;
            }
        }
    };
    /**
     * Initiate cell save action on Gantt with arguments from TreeGrid
     * @param args
     * @param editedObj
     * @private
     */
    CellEdit.prototype.initiateCellEdit = function (args, editedObj) {
        var column = getValue('column', args);
        var data = getValue('data', args);
        var editedArgs = {};
        editedArgs.action = 'CellEditing';
        editedArgs.data = this.parent.getTaskByUniqueID(data.uniqueID);
        var editedValue = data[column.field];
        var previousValue = getValue('previousData', args);
        data[column.field] = previousValue;
        editedArgs.data[column.field] = previousValue;
        this.parent.initiateEditAction(true);
        this.parent.setRecordValue(column.field, editedValue, editedArgs.data);
        if (column.field === this.parent.taskFields.name) {
            this.taskNameEdited(editedArgs);
        }
        else if (column.field === this.parent.taskFields.startDate) {
            this.startDateEdited(editedArgs);
        }
        else if (column.field === this.parent.taskFields.endDate) {
            this.endDateEdited(editedArgs);
        }
        else if (column.field === this.parent.taskFields.duration) {
            this.durationEdited(editedArgs);
        }
        else if (column.field === this.parent.taskFields.resourceInfo) {
            this.resourceEdited(editedArgs, editedObj);
        }
        else if (column.field === this.parent.taskFields.progress) {
            this.progressEdited(editedArgs);
        }
        else if (column.field === this.parent.taskFields.baselineStartDate
            || column.field === this.parent.taskFields.baselineEndDate) {
            this.baselineEdited(editedArgs);
        }
        else if (column.field === this.parent.taskFields.dependency) {
            this.dependencyEdited(editedArgs, previousValue);
        }
        else if (column.field === this.parent.taskFields.notes) {
            this.notedEdited(editedArgs);
        }
        else {
            this.parent.setRecordValue('taskData.' + column.field, data[this.parent.taskFields.name], data);
        }
        this.isCellEdit = false;
        this.parent.toolbarModule.refreshToolbarItems();
    };
    /**
     * To update task name cell with new value
     * @param args
     */
    CellEdit.prototype.taskNameEdited = function (args) {
        this.parent.setRecordValue('taskData.' + this.parent.taskFields.name, args.data[this.parent.taskFields.name], args.data);
        this.parent.setRecordValue('taskName', args.data[this.parent.taskFields.name], args.data.ganttProperties, true);
        this.updateEditedRecord(args);
    };
    /**
     * To update task notes cell with new value
     * @param args
     */
    CellEdit.prototype.notedEdited = function (args) {
        this.parent.setRecordValue('taskData.' + this.parent.taskFields.notes, args.data[this.parent.taskFields.name], args.data);
        this.parent.setRecordValue('notes', args.data[this.parent.taskFields.notes], args.data.ganttProperties, true);
        this.updateEditedRecord(args);
    };
    /**
     * To update task start date cell with new value
     * @param args
     */
    CellEdit.prototype.startDateEdited = function (args) {
        var ganttData = args.data;
        var ganttProb = args.data.ganttProperties;
        var currentValue = args.data[this.parent.taskFields.startDate];
        currentValue = currentValue ? new Date(currentValue.getTime()) : null;
        currentValue = this.parent.dateValidationModule.checkStartDate(currentValue);
        if (isNullOrUndefined(currentValue)) {
            this.parent.setRecordValue('startDate', null, ganttProb, true);
            this.parent.setRecordValue('duration', null, ganttProb, true);
            this.parent.setRecordValue('isMilestone', false, ganttProb, true);
        }
        else if (ganttProb.endDate || !isNullOrUndefined(ganttProb.duration)) {
            this.parent.setRecordValue('startDate', new Date(currentValue.getTime()), ganttProb, true);
            this.parent.dateValidationModule.calculateEndDate(ganttData);
        }
        this.parent.setRecordValue('isMilestone', ganttProb.duration === 0 ? true : false, ganttProb, true);
        this.parent.dataOperation.updateWidthLeft(args.data);
        this.parent.dataOperation.updateMappingData(ganttData, 'startDate');
        this.parent.dataOperation.updateMappingData(ganttData, 'endDate');
        this.parent.dataOperation.updateMappingData(ganttData, 'duration');
        this.updateEditedRecord(args);
    };
    /**
     * To update task end date cell with new value
     * @param args
     */
    CellEdit.prototype.endDateEdited = function (args) {
        var ganttProb = args.data.ganttProperties;
        var currentValue = args.data[this.parent.taskFields.endDate];
        currentValue = currentValue ? new Date(currentValue.getTime()) : null;
        if (isNullOrUndefined(currentValue)) {
            this.parent.setRecordValue('endDate', currentValue, ganttProb, true);
            this.parent.setRecordValue('duration', null, ganttProb, true);
            this.parent.setRecordValue('isMilestone', false, ganttProb, true);
        }
        else {
            if ((currentValue.getHours() === 0 && this.parent.defaultEndTime !== 86400)) {
                this.parent.dateValidationModule.setTime(this.parent.defaultEndTime, currentValue);
            }
            currentValue = this.parent.dateValidationModule.checkEndDate(currentValue, ganttProb);
            this.parent.setRecordValue('endDate', currentValue, ganttProb, true);
            if (!isNullOrUndefined(ganttProb.startDate) && isNullOrUndefined(ganttProb.duration)) {
                if (this.parent.dateValidationModule.compareDates(ganttProb.endDate, ganttProb.startDate) === -1) {
                    this.parent.setRecordValue('endDate', new Date(ganttProb.startDate.getTime()), ganttProb, true);
                    this.parent.dateValidationModule.setTime(this.parent.defaultEndTime, ganttProb.endDate);
                }
            }
            else if (!isNullOrUndefined(ganttProb.duration) && isNullOrUndefined(ganttProb.startDate)) {
                this.parent.setRecordValue('startDate', this.parent.dateValidationModule.getStartDate(ganttProb.endDate, ganttProb.duration, ganttProb.durationUnit, ganttProb), ganttProb, true);
            }
            if (this.compareDatesFromRecord(ganttProb) === -1) {
                this.parent.dateValidationModule.calculateDuration(args.data);
            }
            else {
                this.parent.editModule.revertCellEdit(args);
            }
            this.parent.setRecordValue('isMilestone', (ganttProb.duration === 0 ? true : false), ganttProb, true);
            if (ganttProb.isMilestone) {
                this.parent.setRecordValue('startDate', this.parent.dateValidationModule.checkStartDate(ganttProb.startDate, ganttProb), ganttProb, true);
            }
            this.parent.dataOperation.updateWidthLeft(args.data);
        }
        this.parent.dataOperation.updateMappingData(args.data, 'startDate');
        this.parent.dataOperation.updateMappingData(args.data, 'endDate');
        this.parent.dataOperation.updateMappingData(args.data, 'duration');
        this.updateEditedRecord(args);
    };
    /**
     * To update duration cell with new value
     * @param args
     */
    CellEdit.prototype.durationEdited = function (args) {
        var ganttProb = args.data.ganttProperties;
        var endDate = this.parent.dateValidationModule.getDateFromFormat(ganttProb.endDate);
        var startDate = this.parent.dateValidationModule.getDateFromFormat(ganttProb.startDate);
        var durationString = args.data[this.parent.taskFields.duration];
        this.parent.dataOperation.updateDurationValue(durationString, ganttProb);
        var currentDuration = ganttProb.duration;
        if (isNullOrUndefined(currentDuration)) {
            this.parent.setRecordValue('isMilestone', false, ganttProb, true);
            this.parent.setRecordValue('endDate', null, ganttProb, true);
        }
        else {
            if (isNullOrUndefined(startDate) && !isNullOrUndefined(endDate)) {
                this.parent.setRecordValue('startDate', this.parent.dateValidationModule.getStartDate(endDate, currentDuration, ganttProb.durationUnit, ganttProb), ganttProb, true);
            }
            if (currentDuration !== 0 && ganttProb.isMilestone) {
                this.parent.setRecordValue('isMilestone', false, ganttProb, true);
                this.parent.setRecordValue('startDate', this.parent.dateValidationModule.checkStartDate(ganttProb.startDate, ganttProb), ganttProb, true);
            }
            this.parent.setRecordValue('isMilestone', (ganttProb.duration === 0 ? true : false), ganttProb, true);
            this.parent.dateValidationModule.calculateEndDate(args.data);
        }
        this.parent.dataOperation.updateWidthLeft(args.data);
        this.parent.dataOperation.updateMappingData(args.data, 'endDate');
        this.parent.dataOperation.updateMappingData(args.data, 'startDate');
        this.parent.dataOperation.updateMappingData(args.data, 'duration');
        this.updateEditedRecord(args);
    };
    /**
     * To update progress cell with new value
     * @param args
     */
    CellEdit.prototype.progressEdited = function (args) {
        var ganttRecord = args.data;
        this.parent.setRecordValue('progress', (ganttRecord[this.parent.taskFields.progress] > 100 ? 100 : ganttRecord[this.parent.taskFields.progress]), ganttRecord.ganttProperties, true);
        this.parent.setRecordValue('taskData.' + this.parent.taskFields.progress, (ganttRecord[this.parent.taskFields.progress] > 100 ? 100 : ganttRecord[this.parent.taskFields.progress]), args.data);
        if (!args.data.hasChildRecords) {
            this.parent.setRecordValue('progressWidth', this.parent.dataOperation.getProgressWidth(ganttRecord.ganttProperties.width, ganttRecord.ganttProperties.progress), ganttRecord.ganttProperties, true);
        }
        this.updateEditedRecord(args);
    };
    /**
     * To update baselines with new baseline start date and baseline end date
     * @param args
     */
    CellEdit.prototype.baselineEdited = function (args) {
        var ganttRecord = args.data.ganttProperties;
        var baseLineStartDate = args.data[this.parent.taskFields.baselineStartDate];
        var baseLineEndDate = args.data[this.parent.taskFields.baselineEndDate];
        if (baseLineEndDate && baseLineEndDate.getHours() === 0 && this.parent.defaultEndTime !== 86400) {
            this.parent.dateValidationModule.setTime(this.parent.defaultEndTime, baseLineEndDate);
        }
        this.parent.setRecordValue('baselineStartDate', this.parent.dateValidationModule.checkBaselineStartDate(baseLineStartDate), ganttRecord, true);
        this.parent.setRecordValue('baselineEndDate', this.parent.dateValidationModule.checkBaselineEndDate(baseLineEndDate), ganttRecord, true);
        if (ganttRecord.baselineStartDate && ganttRecord.baselineEndDate) {
            this.parent.setRecordValue('baselineLeft', this.parent.dataOperation.calculateBaselineLeft(ganttRecord), ganttRecord, true);
            this.parent.setRecordValue('baselineWidth', this.parent.dataOperation.calculateBaselineWidth(ganttRecord), ganttRecord, true);
        }
        this.updateEditedRecord(args);
    };
    /**
     * To update task's resource cell with new value
     * @param args
     * @param editedObj
     */
    CellEdit.prototype.resourceEdited = function (args, editedObj) {
        if (editedObj[this.parent.taskFields.resourceInfo]) {
            args.data.ganttProperties.resourceInfo = this.parent.dataOperation.setResourceInfo(editedObj);
            this.parent.dataOperation.updateMappingData(args.data, 'resourceInfo');
            this.updateEditedRecord(args);
        }
    };
    /**
     * To update task's predecessor cell with new value
     * @param editedArgs
     * @param cellEditArgs
     */
    CellEdit.prototype.dependencyEdited = function (editedArgs, cellEditArgs) {
        if (!this.parent.connectorLineEditModule.updatePredecessor(editedArgs.data, editedArgs.data[this.parent.taskFields.dependency])) {
            this.parent.editModule.revertCellEdit(cellEditArgs);
        }
    };
    /**
     * To compare start date and end date from Gantt record
     * @param ganttRecord
     */
    CellEdit.prototype.compareDatesFromRecord = function (ganttRecord) {
        var sDate = this.parent.dateValidationModule.getValidStartDate(ganttRecord);
        var eDate = this.parent.dateValidationModule.getValidEndDate(ganttRecord);
        return this.parent.dateValidationModule.compareDates(sDate, eDate);
    };
    /**
     * To start method save action with edited cell value
     * @param args
     */
    CellEdit.prototype.updateEditedRecord = function (args) {
        this.parent.editModule.initiateUpdateAction(args);
    };
    /**
     * To remove all public private properties
     * @private
     */
    CellEdit.prototype.destroy = function () {
        // Destroy Method
    };
    return CellEdit;
}());

/**
 * File for handling taskbar editing tooltip in Gantt.
 */
var EditTooltip = /** @__PURE__ @class */ (function () {
    function EditTooltip(gantt, taskbarEdit) {
        this.parent = gantt;
        this.taskbarEdit = taskbarEdit;
    }
    /**
     * To create tooltip.
     * @return {void}
     * @private
     */
    EditTooltip.prototype.createTooltip = function (opensOn, mouseTrail, target) {
        var _this = this;
        this.toolTipObj = new Tooltip({
            opensOn: opensOn,
            content: this.getTooltipText(),
            position: 'TopRight',
            mouseTrail: mouseTrail,
            cssClass: ganttTooltip,
            target: target ? target : null,
            animation: { open: { effect: 'None' }, close: { effect: 'None' } }
        });
        this.toolTipObj.beforeRender = function (args) {
            var argsData = {
                data: _this.taskbarEdit.taskBarEditRecord,
                args: args,
                content: _this.toolTipObj.content
            };
            _this.parent.trigger('beforeTooltipRender', argsData);
        };
        this.toolTipObj.appendTo(this.parent.chartPane);
    };
    /**
     * To show/hide taskbar edit tooltip.
     * @return {void}
     * @private
     */
    EditTooltip.prototype.showHideTaskbarEditTooltip = function (bool) {
        if (bool) {
            this.createTooltip('Custom', false);
            this.parent.tooltipModule.toolTipObj.close();
            this.updateTooltip();
            if (this.taskbarEdit.connectorSecondAction === 'ConnectorPointLeftDrag') {
                this.toolTipObj.open(this.taskbarEdit.connectorSecondElement.querySelector('.' + connectorPointLeft));
            }
            else if (this.taskbarEdit.connectorSecondAction === 'ConnectorPointRightDrag') {
                this.toolTipObj.open(this.taskbarEdit.connectorSecondElement.querySelector('.' + connectorPointRight));
            }
            else {
                this.toolTipObj.open(this.taskbarEdit.taskBarEditElement);
            }
        }
        else if (!isNullOrUndefined(this.toolTipObj)) {
            this.toolTipObj.destroy();
            this.toolTipObj = null;
        }
    };
    /**
     * To update tooltip content and position.
     * @return {void}
     * @private
     */
    EditTooltip.prototype.updateTooltip = function () {
        if (!isNullOrUndefined(this.toolTipObj)) {
            if (this.taskbarEdit.taskBarEditAction === 'ConnectorPointLeftDrag' ||
                this.taskbarEdit.taskBarEditAction === 'ConnectorPointRightDrag') {
                this.toolTipObj.content = this.getTooltipText();
                this.toolTipObj.offsetY = -3;
            }
            else {
                this.toolTipObj.content = this.getTooltipText();
                this.toolTipObj.refresh(this.taskbarEdit.taskBarEditElement);
                if (this.taskbarEdit.taskBarEditAction === 'LeftResizing') {
                    this.toolTipObj.offsetX = -this.taskbarEdit.taskBarEditRecord.ganttProperties.width;
                }
                else if (this.taskbarEdit.taskBarEditAction === 'RightResizing') {
                    this.toolTipObj.offsetX = 0;
                }
                else if (this.taskbarEdit.taskBarEditAction === 'ProgressResizing') {
                    this.toolTipObj.offsetX = -(this.taskbarEdit.taskBarEditRecord.ganttProperties.width -
                        this.taskbarEdit.taskBarEditRecord.ganttProperties.progressWidth);
                }
                else if (this.taskbarEdit.taskBarEditAction === 'MilestoneDrag') {
                    this.toolTipObj.offsetX = -(this.parent.chartRowsModule.milestoneHeight / 2);
                }
                else if (this.taskbarEdit.taskBarEditRecord.ganttProperties.width > 5) {
                    this.toolTipObj.offsetX = -(this.taskbarEdit.taskBarEditRecord.ganttProperties.width +
                        this.taskbarEdit.taskBarEditRecord.ganttProperties.left -
                        this.taskbarEdit.tooltipPositionX);
                }
            }
        }
    };
    /**
     * To get updated tooltip text.
     * @return {void}
     * @private
     */
    EditTooltip.prototype.getTooltipText = function () {
        var tooltipString = '';
        var instance = this.parent.globalize;
        var editRecord = this.taskbarEdit.taskBarEditRecord.ganttProperties;
        if (this.parent.tooltipSettings.editing) {
            var templateNode = this.parent.tooltipModule.templateCompiler(this.parent.tooltipSettings.editing, this.parent, editRecord);
            tooltipString = templateNode[0];
        }
        else {
            switch (this.taskbarEdit.taskBarEditAction) {
                case 'ProgressResizing':
                    tooltipString = this.parent.localeObj.getConstant('progress') + ' : ' + editRecord.progress;
                    break;
                case 'LeftResizing':
                    tooltipString = this.parent.localeObj.getConstant('startDate') + ' : ';
                    tooltipString += instance.formatDate(editRecord.startDate, { format: this.parent.dateFormat });
                    tooltipString += '<br/>' + this.parent.localeObj.getConstant('duration') + ' : ' +
                        this.parent.getDurationString(editRecord.duration, editRecord.durationUnit);
                    break;
                case 'RightResizing':
                    tooltipString = this.parent.localeObj.getConstant('endDate') + ' : ';
                    tooltipString += instance.formatDate(editRecord.endDate, { format: this.parent.dateFormat });
                    tooltipString += '<br/>' + this.parent.localeObj.getConstant('duration') + ' : ' +
                        this.parent.getDurationString(editRecord.duration, editRecord.durationUnit);
                    break;
                case 'ChildDrag':
                case 'ParentDrag':
                case 'MilestoneDrag':
                    if (!isNullOrUndefined(this.taskbarEdit.taskBarEditRecord.ganttProperties.startDate)) {
                        tooltipString = this.parent.localeObj.getConstant('startDate') + ' : ';
                        tooltipString += instance.formatDate(editRecord.startDate, { format: this.parent.dateFormat });
                    }
                    if (!isNullOrUndefined(this.taskbarEdit.taskBarEditRecord.ganttProperties.endDate)) {
                        tooltipString += tooltipString === '' ? '' : '<br/>';
                        tooltipString += this.parent.localeObj.getConstant('endDate') + ' : ' + instance.formatDate(editRecord.endDate, { format: this.parent.dateFormat });
                    }
                    break;
                case 'ConnectorPointLeftDrag':
                case 'ConnectorPointRightDrag':
                    tooltipString = this.parent.connectorLineModule.tooltipTable;
                    if (isNullOrUndefined(this.toolTipObj)) {
                        this.parent.connectorLineModule.tooltipTable.innerHTML =
                            this.parent.connectorLineModule.getConnectorLineTooltipInnerTd(this.parent.editModule.taskbarEditModule.taskBarEditRecord.ganttProperties.taskName, this.parent.editModule.taskbarEditModule.fromPredecessorText, '', '');
                    }
                    break;
            }
        }
        return tooltipString;
    };
    return EditTooltip;
}());

/**
 * File for handling taskbar editing operation in Gantt.
 */
var TaskbarEdit = /** @__PURE__ @class */ (function () {
    function TaskbarEdit(ganttObj) {
        this.isMouseDragged = false;
        this.parent = ganttObj;
        this.initPublicProp();
        this.wireEvents();
        this.editTooltip = new EditTooltip(this.parent, this);
    }
    TaskbarEdit.prototype.wireEvents = function () {
        this.parent.on('chartMouseDown', this.mouseDownHandler, this);
        this.parent.on('chartMouseUp', this.mouseUpHandler, this);
        this.parent.on('chartMouseLeave', this.mouseLeaveHandler, this);
        this.parent.on('chartMouseMove', this.mouseMoveAction, this);
    };
    /**
     * To initialize the public property.
     * @return {void}
     * @private
     */
    TaskbarEdit.prototype.initPublicProp = function () {
        this.taskBarEditElement = null;
        this.taskBarEditRecord = null;
        this.taskBarEditAction = null;
        this.connectorSecondElement = null;
        this.connectorSecondRecord = null;
        this.connectorSecondAction = null;
        this.highlightedSecondElement = null;
        this.fromPredecessorText = null;
        this.toPredecessorText = null;
        this.finalPredecessor = null;
        this.drawPredecessor = false;
        this.roundOffDuration = true;
        this.dragMouseLeave = false;
        this.isMouseDragged = false;
        this.previousItemProperty = ['left', 'progress', 'duration', 'startDate', 'endDate', 'width', 'progressWidth'];
    };
    TaskbarEdit.prototype.mouseDownHandler = function (e) {
        if (this.parent.editSettings.allowTaskbarEditing) {
            this.updateTaskBarEditElement(e);
        }
    };
    TaskbarEdit.prototype.mouseLeaveHandler = function (e) {
        this.dragMouseLeave = true;
    };
    /**
     * To update taskbar edited elements on mouse down action.
     * @return {void}
     * @private
     */
    TaskbarEdit.prototype.updateTaskBarEditElement = function (e) {
        var element = parentsUntil$1(e.target, taskBarMainContainer);
        if (this.parent.editSettings.allowTaskbarEditing) {
            this.showHideTaskBarEditingElements(element, this.taskBarEditElement);
        }
        this.taskBarEditElement = element;
        this.taskBarEditRecord = isNullOrUndefined(this.taskBarEditElement) ?
            null : this.parent.ganttChartModule.getRecordByTaskBar(this.taskBarEditElement);
        if (element && e.type === 'mousedown') {
            this.roundOffDuration = true;
            this.taskBarEditAction = this.getTaskBarAction(e);
            if ((this.taskBarEditAction === 'ConnectorPointLeftDrag' || this.taskBarEditAction === 'ConnectorPointRightDrag') &&
                isNullOrUndefined(this.parent.taskFields.dependency)) {
                this.taskBarEditAction = null;
            }
            else {
                this.updateMouseDownProperties(e);
                this.isMouseDragged = false;
            }
        }
    };
    /**
     * To show/hide taskbar editing elements.
     * @return {void}
     * @private
     */
    TaskbarEdit.prototype.showHideTaskBarEditingElements = function (element, secondElement, fadeConnectorLine) {
        if (element) {
            if (element.querySelector('.' + taskBarLeftResizer)) {
                addClass([element.querySelector('.' + taskBarLeftResizer)], [leftResizeGripper]);
                addClass([element.querySelector('.' + taskBarRightResizer)], [rightResizeGripper]);
                addClass([element.querySelector('.' + childProgressResizer)], [progressResizeGripper]);
            }
            addClass(this.parent.ganttChartModule.scrollElement.querySelectorAll('.' + connectorLineContainer), [connectorLineZIndex]);
            if (!isNullOrUndefined(this.parent.taskFields.dependency) && element.querySelector('.' + connectorPointLeft)) {
                addClass([element.querySelector('.' + connectorPointLeft)], [connectorPointLeftHover]);
                addClass([element.querySelector('.' + connectorPointRight)], [connectorPointRightHover]);
            }
        }
        else if (!fadeConnectorLine) {
            removeClass(this.parent.ganttChartModule.scrollElement.querySelectorAll('.' + connectorLineContainer), [connectorLineZIndex]);
        }
        if (secondElement && element !== secondElement) {
            if (secondElement.querySelector('.' + taskBarLeftResizer)) {
                removeClass([secondElement.querySelector('.' + taskBarLeftResizer)], [leftResizeGripper]);
                removeClass([secondElement.querySelector('.' + taskBarRightResizer)], [rightResizeGripper]);
                if (secondElement.querySelector('.' + childProgressResizer)) {
                    removeClass([secondElement.querySelector('.' + childProgressResizer)], [progressResizeGripper]);
                }
            }
            if (!isNullOrUndefined(this.parent.taskFields.dependency) && secondElement.querySelector('.' + connectorPointLeft)) {
                removeClass([secondElement.querySelector('.' + connectorPointLeft)], [connectorPointLeftHover]);
                removeClass([secondElement.querySelector('.' + connectorPointRight)], [connectorPointRightHover]);
            }
        }
    };
    /**
     * To get taskbar edit actions.
     * @return {string}
     * @private
     */
    TaskbarEdit.prototype.getTaskBarAction = function (e) {
        var mouseDownElement = e.target;
        return this.taskBarEditRecord.hasChildRecords ? 'ParentDrag' :
            mouseDownElement.classList.contains(taskBarLeftResizer) ? 'LeftResizing' :
                mouseDownElement.classList.contains(taskBarRightResizer) ? 'RightResizing' :
                    mouseDownElement.classList.contains(childProgressResizer) ? 'ProgressResizing' :
                        mouseDownElement.closest('.' + childProgressResizer) ? 'ProgressResizing' :
                            mouseDownElement.classList.contains(connectorPointLeft) ? 'ConnectorPointLeftDrag' :
                                mouseDownElement.classList.contains(connectorPointRight) ? 'ConnectorPointRightDrag' :
                                    this.taskBarEditRecord.ganttProperties.isMilestone ? 'MilestoneDrag' : 'ChildDrag';
    };
    /**
     * To update property while perform mouse down.
     * @return {void}
     * @private
     */
    TaskbarEdit.prototype.updateMouseDownProperties = function (e) {
        if (e.pageX || e.pageY) {
            var containerPosition = this.parent.getOffsetRect(this.parent.ganttChartModule.chartBodyContainer);
            this.mouseDownX = (e.pageX - containerPosition.left) +
                this.parent.ganttChartModule.scrollObject.previousScroll.left;
            this.tooltipPositionX = this.mouseDownX;
            this.mouseDownY = e.pageY - containerPosition.top +
                this.parent.ganttChartModule.scrollObject.previousScroll.top;
        }
        if (this.taskBarEditAction === 'ConnectorPointLeftDrag' || this.taskBarEditAction === 'ConnectorPointRightDrag') {
            this.fromPredecessorText = this.taskBarEditAction === 'ConnectorPointLeftDrag' ? 'Start' : 'Finish';
            this.parent.connectorLineModule.tooltipTable.innerHTML = this.parent.connectorLineModule.getConnectorLineTooltipInnerTd(this.taskBarEditRecord.ganttProperties.taskName, this.fromPredecessorText, '', '');
        }
    };
    TaskbarEdit.prototype.isMouseDragCheck = function () {
        if (!this.isMouseDragged && this.taskBarEditAction && ((this.mouseDownX !== this.mouseMoveX) &&
            ((this.mouseDownX + 3) < this.mouseMoveX || (this.mouseDownX - 3) > this.mouseMoveX)
            || (this.mouseDownY !== this.mouseMoveY) &&
                ((this.mouseDownY + 3) < this.mouseMoveY || (this.mouseDownY - 3) > this.mouseMoveY))) {
            this.isMouseDragged = true;
            this.parent.initiateEditAction(true);
            var item = this.taskBarEditRecord.ganttProperties;
            this.previousItem = this.parent.timelineModule.extendFunction(item, this.previousItemProperty);
            if (this.taskBarEditAction !== 'ConnectorPointLeftDrag' &&
                this.taskBarEditAction !== 'ConnectorPointRightDrag') {
                this.editTooltip.showHideTaskbarEditTooltip(true);
            }
        }
    };
    /**
     * To handle mouse move action in chart
     * @param e
     * @private
     */
    TaskbarEdit.prototype.mouseMoveAction = function (e) {
        var containerPosition = this.parent.getOffsetRect(this.parent.ganttChartModule.chartBodyContainer);
        this.mouseMoveX = e.pageX - containerPosition.left +
            this.parent.ganttChartModule.scrollObject.previousScroll.left;
        this.mouseMoveY = e.pageY - containerPosition.top +
            this.parent.ganttChartModule.scrollObject.previousScroll.top;
        this.dragMouseLeave = false;
        this.isMouseDragCheck();
        if (this.isMouseDragged && this.taskBarEditAction) {
            if (this.taskBarEditAction === 'ConnectorPointLeftDrag' ||
                this.taskBarEditAction === 'ConnectorPointRightDrag') {
                this.updateConnectorLineSecondProperties(e);
            }
            this.taskBarEditingAction(e);
        }
        else if (!this.taskBarEditAction) {
            this.updateTaskBarEditElement(e);
        }
    };
    /**
     * Method to update taskbar editing action on mous move.
     * @return {void}
     * @private
     */
    TaskbarEdit.prototype.taskBarEditingAction = function (e) {
        var args = {};
        var recordIndex = this.parent.ganttChartModule.getIndexByTaskBar(this.taskBarEditElement);
        if (this.taskBarEditRecord !== null) {
            args.editingFields = this.taskBarEditRecord.ganttProperties;
            args.data = this.taskBarEditRecord;
            args.recordIndex = recordIndex;
            args.taskBarEditAction = this.taskBarEditAction;
            args.roundOffDuration = this.roundOffDuration;
            this.parent.trigger('taskbarEditing', args);
        }
        if (!args.cancel && this.taskBarEditRecord !== null) {
            this.roundOffDuration = args.roundOffDuration;
            this.updateMouseMoveProperties(e);
            if (this.taskBarEditAction === 'ProgressResizing') {
                this.performProgressResize(e);
            }
            else if (this.taskBarEditAction === 'LeftResizing') {
                this.enableLeftResizing(e);
            }
            else if (this.taskBarEditAction === 'RightResizing') {
                this.enableRightResizing(e);
            }
            else if (this.taskBarEditAction === 'ParentDrag' || this.taskBarEditAction === 'ChildDrag' ||
                this.taskBarEditAction === 'MilestoneDrag') {
                this.enableDragging(e);
            }
            else if (this.taskBarEditAction === 'ConnectorPointLeftDrag' ||
                this.taskBarEditAction === 'ConnectorPointRightDrag') {
                this.triggerDependencyEvent(e);
                this.drawFalseLine();
            }
            this.setItemPosition();
            this.updateEditedItem();
            this.editTooltip.updateTooltip();
        }
        else {
            this.editTooltip.showHideTaskbarEditTooltip(false);
        }
    };
    /**
     * To update property while perform mouse move.
     * @return {void}
     * @private
     */
    TaskbarEdit.prototype.updateMouseMoveProperties = function (e) {
        var containerPosition = this.parent.getOffsetRect(this.parent.ganttChartModule.chartBodyContainer);
        if (e.pageX || e.pageY) {
            this.mouseMoveX = e.pageX - containerPosition.left +
                this.parent.ganttChartModule.scrollObject.previousScroll.left;
            this.tooltipPositionX = this.mouseMoveX;
            this.mouseMoveY = e.pageY - containerPosition.top +
                this.parent.ganttChartModule.scrollObject.previousScroll.top;
        }
        var isConnectorLineEdit = (this.taskBarEditAction === 'ConnectorPointLeftDrag' ||
            this.taskBarEditAction === 'ConnectorPointRightDrag') ?
            true : false;
        if ((this.taskBarEditRecord.ganttProperties.width > 3 && !((this.taskBarEditAction === 'ProgressResizing' &&
            (this.taskBarEditRecord.ganttProperties.progress === 0 || this.taskBarEditRecord.ganttProperties.progress === 100)))) ||
            isConnectorLineEdit) {
            var mouseX = this.mouseMoveX - this.parent.ganttChartModule.scrollObject.previousScroll.left +
                containerPosition.left;
            var mouseY = this.mouseMoveY - this.parent.ganttChartModule.scrollObject.previousScroll.top +
                containerPosition.top;
            if ((mouseX + 20) >
                containerPosition.left + this.parent.ganttChartModule.chartBodyContainer.offsetWidth) {
                this.timerCount = this.parent.ganttChartModule.scrollObject.previousScroll.left;
                this.startScrollTimer('right');
            }
            else if ((mouseX - 20) < containerPosition.left) {
                this.timerCount = this.parent.ganttChartModule.scrollObject.previousScroll.left;
                this.startScrollTimer('left');
            }
            else if (isConnectorLineEdit && ((mouseY + 20) >
                containerPosition.top + this.parent.ganttChartModule.chartBodyContainer.offsetHeight)) {
                this.timerCount = this.parent.ganttChartModule.scrollObject.previousScroll.top;
                this.startScrollTimer('bottom');
            }
            else if (isConnectorLineEdit && ((mouseY - 20) < containerPosition.top)) {
                this.timerCount = this.parent.ganttChartModule.scrollObject.previousScroll.top;
                this.startScrollTimer('top');
            }
            else {
                this.stopScrollTimer();
            }
        }
        else {
            this.stopScrollTimer();
        }
    };
    /**
     * To start the scroll timer.
     * @return {void}
     * @private
     */
    TaskbarEdit.prototype.startScrollTimer = function (direction) {
        var _this = this;
        this.stopScrollTimer();
        this.scrollTimer = window.setInterval(function () {
            if (direction === 'right' || direction === 'bottom') {
                _this.timerCount = (_this.timerCount + 1) >= _this.parent.timelineModule.totalTimelineWidth ?
                    _this.parent.timelineModule.totalTimelineWidth : (_this.timerCount + 1);
            }
            else {
                _this.timerCount = (_this.timerCount - 1) < 0 ? 0 : (_this.timerCount - 1);
            }
            if (direction === 'bottom' || direction === 'top') {
                _this.parent.ganttChartModule.scrollObject.setScrollTop(_this.timerCount);
            }
            else {
                _this.parent.ganttChartModule.scrollObject.setScrollLeft(_this.timerCount);
            }
            if (_this.taskBarEditAction === 'ConnectorPointLeftDrag'
                || _this.taskBarEditAction === 'ConnectorPointRightDrag') {
                _this.drawFalseLine();
            }
        }, 0);
    };
    /**
     * To stop the scroll timer.
     * @return {void}
     * @private
     */
    TaskbarEdit.prototype.stopScrollTimer = function () {
        window.clearInterval(this.scrollTimer);
        this.scrollTimer = null;
    };
    /**
     * To update left and width while perform taskbar drag operation.
     * @return {void}
     * @private
     */
    TaskbarEdit.prototype.enableDragging = function (e) {
        var item = this.taskBarEditRecord.ganttProperties;
        var diffrenceWidth = 0;
        if (this.mouseDownX > this.mouseMoveX) {
            diffrenceWidth = this.mouseDownX - this.mouseMoveX;
            if (diffrenceWidth > 0) {
                this.parent.setRecordValue('left', this.previousItem.left - diffrenceWidth, item, true);
            }
        }
        else {
            diffrenceWidth = this.mouseMoveX - this.mouseDownX;
            this.parent.setRecordValue('left', this.previousItem.left + diffrenceWidth, item, true);
        }
        var left = item.left < 0 ? 0 : (item.left + item.width) >= this.parent.timelineModule.totalTimelineWidth ?
            (this.parent.timelineModule.totalTimelineWidth - item.width) : item.left;
        this.parent.setRecordValue('left', left, item, true);
    };
    /**
     * To update left and width while perform progress resize operation.
     * @return {void}
     * @private
     */
    TaskbarEdit.prototype.performProgressResize = function (e) {
        var item = this.taskBarEditRecord.ganttProperties;
        var diffrenceWidth = 0;
        if (this.mouseDownX > this.mouseMoveX) {
            if (this.mouseMoveX > item.left &&
                (this.mouseMoveX < (item.left + item.width)) && item.left > 0) {
                diffrenceWidth = this.mouseMoveX - item.left;
                this.parent.setRecordValue('progressWidth', diffrenceWidth, item, true);
            }
            else {
                if (this.mouseMoveX >= (item.left + item.width)) {
                    this.parent.setRecordValue('progressWidth', item.width, item, true);
                }
                else {
                    this.parent.setRecordValue('progressWidth', 0, item, true);
                }
            }
        }
        else {
            if (this.mouseMoveX > item.left &&
                (this.mouseMoveX < (item.left + item.width))) {
                diffrenceWidth = this.mouseMoveX - item.left;
                this.parent.setRecordValue('progressWidth', diffrenceWidth, item, true);
            }
            else {
                if (this.mouseMoveX <= item.left) {
                    this.parent.setRecordValue('progressWidth', 0, item, true);
                }
                else {
                    this.parent.setRecordValue('progressWidth', item.width, item, true);
                }
            }
        }
        var widthValue = item.progressWidth > item.width ?
            item.width : item.progressWidth;
        widthValue = item.progressWidth < 0 ? 0 : item.progressWidth;
        this.parent.setRecordValue('progressWidth', widthValue, item, true);
        var diff = item.width - item.progressWidth;
        if (diff <= 4) {
            this.progressBorderRadius = 4 - diff;
        }
        else {
            this.progressBorderRadius = 0;
        }
    };
    /**
     * To update left and width while perform taskbar left resize operation.
     * @return {void}
     * @private
     */
    TaskbarEdit.prototype.enableLeftResizing = function (e) {
        var item = this.taskBarEditRecord.ganttProperties;
        var diffrenceWidth = 0;
        if (this.mouseDownX > this.mouseMoveX) {
            if (this.mouseMoveX < (item.left + item.width)) {
                diffrenceWidth = this.mouseDownX - this.mouseMoveX;
                if (item.left > 0) {
                    this.parent.setRecordValue('left', this.previousItem.left - diffrenceWidth, item, true);
                    this.parent.setRecordValue('width', this.previousItem.width + diffrenceWidth, item, true);
                }
            }
            else {
                if (this.mouseMoveX > (item.left + item.width)) {
                    diffrenceWidth = this.mouseDownX - this.mouseMoveX;
                    this.parent.setRecordValue('left', this.previousItem.left - diffrenceWidth, item, true);
                    this.parent.setRecordValue('width', 3, item, true);
                }
            }
        }
        else {
            if (this.mouseMoveX < (item.left + item.width)) {
                diffrenceWidth = this.mouseMoveX - this.mouseDownX;
                if ((item.left) < (item.left + item.width) &&
                    ((this.previousItem.left + diffrenceWidth) <= (this.previousItem.left + this.previousItem.width))) {
                    this.parent.setRecordValue('left', this.previousItem.left + diffrenceWidth, item, true);
                    this.parent.setRecordValue('width', this.previousItem.width - diffrenceWidth, item, true);
                }
            }
            else {
                diffrenceWidth = this.mouseMoveX - this.mouseDownX;
                this.parent.setRecordValue('left', this.previousItem.left + diffrenceWidth, item, true);
                this.parent.setRecordValue('width', 3, item, true);
            }
        }
        this.updateEditPosition(e, item);
        this.parent.setRecordValue('left', (this.previousItem.left + this.previousItem.width - item.width), item, true);
    };
    /**
     * Update mouse position and edited item value
     * @param e
     * @param item
     */
    TaskbarEdit.prototype.updateEditPosition = function (e, item) {
        this.updateIsMilestone(item);
        this.parent.setRecordValue('progressWidth', this.parent.dataOperation.getProgressWidth(item.width, item.progress), item, true);
    };
    /**
     *  To update milestone property.
     * @return {void}
     * @private
     */
    TaskbarEdit.prototype.updateIsMilestone = function (item) {
        if (item.width <= 3) {
            this.parent.setRecordValue('width', 3, item, true);
            this.parent.setRecordValue('isMilestone', true, item, true);
        }
        else {
            this.parent.setRecordValue('width', item.width, item, true);
            this.parent.setRecordValue('isMilestone', false, item, true);
        }
    };
    /**
     * To update left and width while perform taskbar right resize operation.
     * @return {void}
     * @private
     */
    TaskbarEdit.prototype.enableRightResizing = function (e) {
        var item = this.taskBarEditRecord.ganttProperties;
        var diffrenceWidth = 0;
        if (this.mouseDownX > this.mouseMoveX) {
            if (this.mouseMoveX > item.left && (this.mouseDownX - this.mouseMoveX) > 3) {
                diffrenceWidth = this.mouseDownX - this.mouseMoveX;
                this.parent.setRecordValue('width', this.previousItem.width - diffrenceWidth, item, true);
            }
            else {
                if (this.mouseMoveX < item.left) {
                    this.parent.setRecordValue('width', 3, item, true);
                }
            }
        }
        else {
            if (this.mouseMoveX > item.left) {
                diffrenceWidth = this.mouseMoveX - this.mouseDownX;
                this.parent.setRecordValue('width', this.previousItem.width + diffrenceWidth, item, true);
            }
        }
        this.updateEditPosition(e, item);
    };
    /**
     * To updated startDate and endDate while perform taskbar edit operation.
     * @return {void}
     * @private
     */
    TaskbarEdit.prototype.updateEditedItem = function () {
        var item = this.taskBarEditRecord.ganttProperties;
        var left;
        switch (this.taskBarEditAction) {
            case 'ProgressResizing':
                this.parent.setRecordValue('progress', this.getProgressPercent(item.width, item.progressWidth), item, true);
                break;
            case 'LeftResizing':
                left = this.getRoundOffStartLeft(item, this.roundOffDuration);
                var projectStartDate = this.getDateByLeft(left);
                if (isNullOrUndefined(item.endDate)) {
                    var endDate_1 = this.parent.dateValidationModule.getValidEndDate(item);
                    this.parent.setRecordValue('endDate', endDate_1, item, true);
                }
                var startDate = this.parent.dateValidationModule.checkStartDate(projectStartDate, item, null);
                this.parent.setRecordValue('startDate', new Date(startDate.getTime()), item, true);
                if (this.parent.dateValidationModule.compareDates(item.startDate, item.endDate) === 0
                    && isNullOrUndefined(item.isMilestone) && item.isMilestone === false && item.duration === 0) {
                    this.parent.setRecordValue('duration', 1, item, true);
                }
                this.parent.dateValidationModule.calculateDuration(this.taskBarEditRecord);
                break;
            case 'RightResizing':
                left = this.getRoundOffEndLeft(item, this.roundOffDuration);
                var tempEndDate = this.getDateByLeft(left);
                if (isNullOrUndefined(item.startDate)) {
                    startDate = this.parent.dateValidationModule.getValidStartDate(item);
                    this.parent.setRecordValue('startDate', startDate, item, true);
                }
                var endDate = this.parent.dateValidationModule.checkEndDate(tempEndDate, this.taskBarEditRecord.ganttProperties);
                this.parent.setRecordValue('endDate', new Date(endDate.getTime()), item, true);
                this.parent.dateValidationModule.calculateDuration(this.taskBarEditRecord);
                break;
            case 'ParentDrag':
            case 'ChildDrag':
            case 'MilestoneDrag':
                left = this.getRoundOffStartLeft(item, this.roundOffDuration);
                projectStartDate = this.getDateByLeft(left);
                if (!isNullOrUndefined(item.endDate) && isNullOrUndefined(item.startDate)) {
                    endDate = this.parent.dateValidationModule.checkStartDate(projectStartDate, item, null);
                    endDate = this.parent.dateValidationModule.checkEndDate(endDate, this.taskBarEditRecord.ganttProperties);
                    this.parent.setRecordValue('endDate', endDate, item, true);
                }
                else {
                    this.parent.setRecordValue('startDate', this.parent.dateValidationModule.checkStartDate(projectStartDate, item, null), item, true);
                    if (!isNullOrUndefined(item.duration)) {
                        this.parent.dateValidationModule.calculateEndDate(this.taskBarEditRecord);
                    }
                }
                break;
        }
    };
    /**
     * To get roundoff enddate.
     * @return {number}
     * @private
     */
    TaskbarEdit.prototype.getRoundOffEndLeft = function (ganttRecord, isRoundOff) {
        var tierMode = this.parent.timelineModule.bottomTier !== 'None' ? this.parent.timelineModule.bottomTier :
            this.parent.timelineModule.topTier;
        var totalLeft = ganttRecord.width + ganttRecord.left;
        var remainingContribution = (1 / (this.parent.timelineModule.getIncrement(this.getDateByLeft(totalLeft), 1, 'Day') / (1000 * 60 * 60 * 24)));
        var remainingLeft = this.parent.perDayWidth - (this.parent.perDayWidth / remainingContribution);
        var positionValue = remainingLeft / this.parent.perDayWidth;
        if (isRoundOff === undefined) {
            isRoundOff = false;
        }
        /*Rounding the decimal value for week-month-year schedule mode*/
        if (!isRoundOff) {
            if ((tierMode !== 'Hour' && tierMode !== 'Minutes')) {
                if (positionValue === 0) {
                    totalLeft = totalLeft;
                }
                else if (positionValue > 0.5) {
                    totalLeft = totalLeft - remainingLeft + this.parent.perDayWidth;
                }
                else if (positionValue < 0.5) {
                    totalLeft = (totalLeft - remainingLeft) + (this.parent.perDayWidth / 2);
                }
            }
        }
        else if (isRoundOff) {
            if (tierMode === 'Hour') {
                var inHour = (this.parent.perDayWidth / 24);
                remainingContribution =
                    (1 / (this.parent.timelineModule.getIncrement(this.getDateByLeft(totalLeft), 1, 'Hour') / (1000 * 60 * 60)));
                remainingLeft = (this.parent.perDayWidth / 24) - ((this.parent.perDayWidth / 24) / remainingContribution);
                if (remainingLeft !== 0) {
                    totalLeft = (totalLeft - remainingLeft) + inHour;
                }
            }
            else if (tierMode === 'Minutes') {
                var inMinutes = (this.parent.perDayWidth / (24 * 60));
                remainingContribution =
                    (1 / (this.parent.timelineModule.getIncrement(this.getDateByLeft(totalLeft), 1, 'Minutes') / (1000 * 60)));
                remainingLeft = (this.parent.perDayWidth / (24 * 60)) - ((this.parent.perDayWidth / (24 * 60)) / remainingContribution);
                if (remainingLeft !== 0) {
                    totalLeft = (totalLeft - remainingLeft) + inMinutes;
                }
            }
            else {
                if (remainingLeft !== 0) {
                    totalLeft = (totalLeft - remainingLeft) + this.parent.perDayWidth;
                }
            }
        }
        return totalLeft;
    };
    /**
     * To get roundoff startdate.
     * @return {number}
     * @private
     */
    TaskbarEdit.prototype.getRoundOffStartLeft = function (ganttRecord, isRoundOff) {
        var left = ganttRecord.left;
        var tierMode = this.parent.timelineModule.bottomTier !== 'None' ? this.parent.timelineModule.bottomTier :
            this.parent.timelineModule.topTier;
        var remainingContribution = (1 / (this.parent.timelineModule.getIncrement(this.getDateByLeft(left), 1, 'Day') / (1000 * 60 * 60 * 24)));
        var remainDays = this.parent.perDayWidth - (this.parent.perDayWidth / remainingContribution);
        var remainDaysInDecimal = remainDays / this.parent.perDayWidth;
        if (isRoundOff === undefined) {
            isRoundOff = false;
        }
        /*Rounding the decimal value for week-month-year schedule mode*/
        if (!isRoundOff) {
            if ((tierMode !== 'Hour' && tierMode !== 'Minutes')) {
                if (remainDaysInDecimal <= 0.5) {
                    left = ganttRecord.left - remainDays;
                }
                else if (remainDaysInDecimal > 0.5) {
                    left = (ganttRecord.left - remainDays) + this.parent.perDayWidth / 2;
                }
            }
        }
        else if (isRoundOff) {
            if (tierMode === 'Hour') {
                remainingContribution =
                    (1 / (this.parent.timelineModule.getIncrement(this.getDateByLeft(left), 1, 'Hour') / (1000 * 60 * 60)));
                remainDays = (this.parent.perDayWidth / 24) - ((this.parent.perDayWidth / 24) / remainingContribution);
                left = ganttRecord.left - remainDays;
            }
            else if (tierMode === 'Minutes') {
                remainingContribution =
                    (1 / (this.parent.timelineModule.getIncrement(this.getDateByLeft(left), 1, 'Minutes') / (1000 * 60)));
                remainDays = (this.parent.perDayWidth / (24 * 60)) - ((this.parent.perDayWidth / (24 * 60)) / remainingContribution);
                left = ganttRecord.left - remainDays;
            }
            else {
                left = ganttRecord.left - remainDays;
            }
        }
        return left;
    };
    /**
     * To get date by left value.
     * @return {Date}
     * @private
     */
    TaskbarEdit.prototype.getDateByLeft = function (left) {
        var pStartDate = new Date(this.parent.timelineModule.timelineStartDate.toString());
        var milliSecondsPerPixel = (24 * 60 * 60 * 1000) / this.parent.perDayWidth;
        pStartDate.setTime(pStartDate.getTime() + (left * milliSecondsPerPixel));
        var tierMode = this.parent.timelineModule.bottomTier !== 'None' ? this.parent.timelineModule.topTier :
            this.parent.timelineModule.bottomTier;
        if (tierMode !== 'Hour' && tierMode !== 'Minutes') {
            if (this.isInDst(new Date(this.parent.timelineModule.timelineStartDate.toString())) && !this.isInDst(pStartDate)) {
                pStartDate.setTime(pStartDate.getTime() + (60 * 60 * 1000));
            }
            else if (!this.isInDst(new Date(this.parent.timelineModule.timelineStartDate.toString())) && this.isInDst(pStartDate)) {
                pStartDate.setTime(pStartDate.getTime() - (60 * 60 * 1000));
            }
        }
        return pStartDate;
    };
    /**
     * To get timezone offset.
     * @return {number}
     * @private
     */
    TaskbarEdit.prototype.getDefaultTZOffset = function () {
        var janMonth = new Date(new Date().getFullYear(), 0, 1);
        var julMonth = new Date(new Date().getFullYear(), 6, 1); //Because there is no reagions DST inbetwwen this range
        return Math.max(janMonth.getTimezoneOffset(), julMonth.getTimezoneOffset());
    };
    /**
     * To check whether the date is in DST.
     * @return {boolean}
     * @private
     */
    TaskbarEdit.prototype.isInDst = function (date) {
        return date.getTimezoneOffset() < this.getDefaultTZOffset();
    };
    /**
     * To set item position.
     * @return {void}
     * @private
     */
    TaskbarEdit.prototype.setItemPosition = function () {
        var item = this.taskBarEditRecord.ganttProperties;
        var width = this.taskBarEditAction === 'MilestoneDrag' ?
            this.parent.chartRowsModule.milestoneHeight : item.width;
        var taskBarMainContainer$$1 = closest(this.taskBarEditElement, 'tr.' + chartRow)
            .querySelector('.' + taskBarMainContainer);
        var leftLabelContainer$$1 = closest(this.taskBarEditElement, 'tr.' + chartRow)
            .querySelector('.' + leftLabelContainer);
        var rightLabelContainer$$1 = closest(this.taskBarEditElement, 'tr.' + chartRow)
            .querySelector('.' + rightLabelContainer);
        var traceChildProgressBar$$1 = this.taskBarEditElement.querySelector('.' + traceChildProgressBar);
        var traceChildTaskBar$$1 = this.taskBarEditElement.querySelector('.' + traceChildTaskBar);
        var childProgressResizer$$1 = this.taskBarEditElement.querySelector('.' + childProgressResizer);
        var taskBarRightResizer$$1 = this.taskBarEditElement.querySelector('.' + taskBarRightResizer);
        var traceParentTaskBar$$1 = this.taskBarEditElement.querySelector('.' + traceParentTaskBar);
        var traceParentProgressBar$$1 = this.taskBarEditElement.querySelector('.' + traceParentProgressBar);
        var traceConnectorPointRight = this.taskBarEditElement.querySelector('.' + rightConnectorPointOuterDiv);
        if (this.taskBarEditAction !== 'ConnectorPointRightDrag' &&
            this.taskBarEditAction !== 'ConnectorPointLeftDrag') {
            taskBarMainContainer$$1.style.width = (width) + 'px';
            taskBarMainContainer$$1.style.left = (item.left) + 'px';
            leftLabelContainer$$1.style.width = (item.left) + 'px';
            rightLabelContainer$$1.style.left = (item.left + width) + 'px';
            if (traceConnectorPointRight) {
                traceConnectorPointRight.style.left = (width) + 'px';
            }
            if (this.taskBarEditAction === 'MilestoneDrag') {
                taskBarMainContainer$$1.style.left = (item.left - (width / 2)) + 'px';
                leftLabelContainer$$1.style.width = (item.left - (width / 2)) + 'px';
                rightLabelContainer$$1.style.left = (item.left + (width / 2)) + 'px';
            }
            else if (this.taskBarEditAction === 'ProgressResizing') {
                traceChildProgressBar$$1.style.width = item.progressWidth + 'px';
                traceChildProgressBar$$1.style.borderBottomRightRadius = this.progressBorderRadius + 'px';
                traceChildProgressBar$$1.style.borderTopRightRadius = this.progressBorderRadius + 'px';
                traceChildTaskBar$$1.style.left = (item.left + item.progressWidth - 10) + 'px';
                childProgressResizer$$1.style.left = item.progressWidth - 8 + 'px';
            }
            else if (this.taskBarEditAction === 'RightResizing') {
                traceChildTaskBar$$1.style.width = (width) + 'px';
                traceChildProgressBar$$1.style.width = (item.progressWidth) + 'px';
                taskBarRightResizer$$1.style.left = (width - 10) + 'px';
                childProgressResizer$$1.style.left = (item.progressWidth - 10) + 'px';
            }
            else if (this.taskBarEditAction === 'ParentDrag') {
                traceParentTaskBar$$1.style.width = (width) + 'px';
                traceParentProgressBar$$1.style.width = (item.progressWidth) + 'px';
            }
            else {
                traceChildTaskBar$$1.style.width = (width) + 'px';
                if (!isNullOrUndefined(traceChildProgressBar$$1)) {
                    taskBarRightResizer$$1.style.left = (width - 10) + 'px';
                    traceChildProgressBar$$1.style.width = (item.progressWidth) + 'px';
                    childProgressResizer$$1.style.left = item.progressWidth - 10 + 'px';
                }
            }
        }
    };
    /**
     * To handle mouse up event in chart
     * @param e
     * @private
     */
    TaskbarEdit.prototype.mouseUpHandler = function (e) {
        this.editTooltip.showHideTaskbarEditTooltip(false);
        if (this.taskBarEditAction && this.isMouseDragged) {
            if (!this.dragMouseLeave && this.taskBarEditedAction) {
                this.taskBarEditedAction(e);
            }
            else {
                this.cancelTaskbarEditActionInMouseLeave();
            }
        }
        this.initPublicProp();
        this.stopScrollTimer();
    };
    /**
     * To perform taskbar edit operation.
     * @return {void}
     * @private
     */
    TaskbarEdit.prototype.taskBarEditedAction = function (e) {
        var args = {};
        var x1 = this.mouseDownX;
        var y1 = this.mouseDownY;
        var item = this.taskBarEditRecord;
        var recordIndex = this.parent.ganttChartModule.getIndexByTaskBar(this.taskBarEditElement);
        var x2;
        var y2;
        var resMouseY;
        x2 = this.mouseMoveX;
        y2 = this.mouseMoveY;
        resMouseY = e.pageY - this.parent.ganttChartModule.chartBodyContainer.offsetTop;
        if ((this.taskBarEditAction === 'ConnectorPointLeftDrag' ||
            this.taskBarEditAction === 'ConnectorPointRightDrag') && this.drawPredecessor) {
            this.parent.connectorLineEditModule.updatePredecessor(this.connectorSecondRecord, this.finalPredecessor);
        }
        else {
            if (x1 !== x2 || (Math.abs(y1 - resMouseY) >= (this.parent.rowHeight - this.parent.taskbarHeight) / 2)) {
                if (item !== null) {
                    args.editingFields = item.ganttProperties;
                    args.data = item;
                    args.recordIndex = recordIndex;
                    args.previousData = this.previousItem;
                    args.taskBarEditAction = this.taskBarEditAction;
                    args.action = 'TaskbarEditing';
                    args.roundOffDuration = this.roundOffDuration;
                    this.taskbarEditedArgs = args;
                    this.taskbarEdited(args);
                }
            }
        }
    };
    /**
     * To cancel the taskbar edt action.
     * @return {void}
     * @private
     */
    TaskbarEdit.prototype.cancelTaskbarEditActionInMouseLeave = function () {
        this.parent.editModule.reUpdatePreviousRecords(true);
    };
    /**
     * To trigger taskbar edited event.
     * @return {void}
     * @private
     */
    TaskbarEdit.prototype.taskbarEdited = function (arg) {
        var args = extend({}, arg);
        var ganttRecord = args.data;
        var taskData = ganttRecord.ganttProperties;
        if (args.taskBarEditAction === 'ProgressResizing') {
            if (args.previousData.progress !== taskData.progress) {
                this.parent.setRecordValue('progress', this.getProgressPercent(taskData.width, taskData.progressWidth), taskData, true);
                if (ganttRecord.parentItem) {
                    this.parent.editModule.updateParentProgress(ganttRecord.parentItem);
                }
            }
        }
        else {
            this.parent.dataOperation.updateWidthLeft(args.data);
        }
        this.parent.dataOperation.updateTaskData(ganttRecord);
        this.parent.editModule.initiateUpdateAction(args);
    };
    /**
     * To get progress in percentage.
     * @return {number}
     * @private
     */
    TaskbarEdit.prototype.getProgressPercent = function (parentwidth, progresswidth) {
        return Math.ceil(((progresswidth / parentwidth) * 100));
    };
    /**
     * false line implementation.
     * @return {void}
     * @private
     */
    TaskbarEdit.prototype.drawFalseLine = function () {
        var x1 = this.mouseDownX;
        var y1 = this.mouseDownY;
        var x2 = this.mouseMoveX;
        var y2 = this.mouseMoveY;
        var length = Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));
        var angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
        var transform = 'rotate(' + angle + 'deg)';
        var left;
        var top;
        if (this.taskBarEditAction === 'ConnectorPointLeftDrag') {
            left = (this.taskBarEditElement.offsetLeft - (this.parent.chartRowsModule.connectorPointWidth / 2)) -
                this.parent.ganttChartModule.scrollObject.previousScroll.left;
        }
        if (this.taskBarEditAction === 'ConnectorPointRightDrag') {
            left = (this.taskBarEditElement.offsetLeft + this.taskBarEditElement.offsetWidth) +
                (this.parent.chartRowsModule.connectorPointWidth / 2) - this.parent.ganttChartModule.scrollObject.previousScroll.left;
        }
        top = ((this.taskBarEditElement.offsetTop) + (this.taskBarEditElement.offsetHeight / 2) +
            this.parent.ganttChartModule.chartBodyContainer.offsetTop) - this.parent.ganttChartModule.scrollObject.previousScroll.top;
        this.removeFalseLine(false);
        this.falseLine = createElement('div', {
            className: falseLine, id: 'ganttfalseline' + this.parent.element.id,
            styles: 'transform-origin: 0% 100%;right: auto;position: absolute;transform:' + transform + ';' +
                'border-top-width: 1px;border-top-style: dashed;z-index: 5;width:' + (length - 3) + 'px;' +
                'left:' + left + 'px;top:' + top + 'px;'
        });
        this.parent.ganttChartModule.chartBodyContainer.appendChild(this.falseLine);
    };
    /**
     *
     * @param isRemoveConnectorPointDisplay
     * @private
     */
    TaskbarEdit.prototype.removeFalseLine = function (isRemoveConnectorPointDisplay) {
        if (this.falseLine) {
            this.falseLine.remove();
            if (isRemoveConnectorPointDisplay) {
                removeClass(this.parent.ganttChartModule.scrollElement.querySelectorAll('.' + connectorLineContainer), [connectorLineZIndex]);
            }
        }
    };
    /**
     *
     * @param e
     * @private
     */
    TaskbarEdit.prototype.updateConnectorLineSecondProperties = function (e) {
        var element = parentsUntil$1(e.target, taskBarMainContainer);
        this.connectorSecondAction = null;
        if (parentsUntil$1(e.target, connectorPointLeft)) {
            this.connectorSecondAction = 'ConnectorPointLeftDrag';
            this.toPredecessorText = 'Start';
        }
        else if (parentsUntil$1(e.target, connectorPointRight)) {
            this.connectorSecondAction = 'ConnectorPointRightDrag';
            this.toPredecessorText = 'Finish';
        }
        else {
            this.connectorSecondAction = null;
            this.toPredecessorText = null;
        }
        if (this.taskBarEditElement !== element && this.taskBarEditElement !== this.highlightedSecondElement) {
            this.showHideTaskBarEditingElements(element, this.highlightedSecondElement, true);
        }
        if (isNullOrUndefined(this.connectorSecondAction) && !isNullOrUndefined(this.connectorSecondElement)) {
            this.editTooltip.showHideTaskbarEditTooltip(false);
            removeClass([this.connectorSecondElement.querySelector('.' + connectorPointLeft)], [connectorPointAllowBlock]);
            removeClass([this.connectorSecondElement.querySelector('.' + connectorPointRight)], [connectorPointAllowBlock]);
        }
        this.connectorSecondElement = this.connectorSecondAction ? element : null;
        this.highlightedSecondElement = element;
        this.connectorSecondRecord = isNullOrUndefined(this.connectorSecondElement) ?
            null : this.parent.ganttChartModule.getRecordByTaskBar(this.connectorSecondElement);
    };
    TaskbarEdit.prototype.triggerDependencyEvent = function (e, mouseUp) {
        var fromItem = this.taskBarEditRecord.ganttProperties;
        var toItem = this.connectorSecondRecord ? this.connectorSecondRecord.ganttProperties : null;
        var predecessor;
        var currentTarget;
        var element = e.target;
        if (this.taskBarEditAction === 'ConnectorPointLeftDrag') {
            predecessor = fromItem.taskId + 'S';
        }
        else if (this.taskBarEditAction === 'ConnectorPointRightDrag') {
            predecessor = fromItem.taskId + 'F';
        }
        if (this.connectorSecondAction) {
            if (this.connectorSecondAction === 'ConnectorPointLeftDrag') {
                predecessor += 'S';
                currentTarget = 'Start';
            }
            else if (this.connectorSecondAction === 'ConnectorPointRightDrag') {
                predecessor += 'F';
                currentTarget = 'Finish';
            }
        }
        if (isNullOrUndefined(toItem)) {
            this.drawPredecessor = false;
            return;
        }
        if (toItem.predecessorsName) {
            this.finalPredecessor = toItem.predecessorsName + ',' + predecessor;
        }
        else {
            this.finalPredecessor = predecessor;
        }
        var isValidLink = this.parent.connectorLineEditModule.validatePredecessorRelation(this.connectorSecondRecord, this.finalPredecessor);
        var args = {};
        args.fromItem = fromItem;
        args.toItem = toItem;
        args.newPredecessorString = this.finalPredecessor;
        args.isValidLink = isValidLink;
        args.requestType = 'ValidateDependency';
        this.parent.trigger('actionBegin', args);
        args.isValidLink = !isValidLink && args.isValidLink ? false : args.isValidLink;
        if (args.isValidLink) {
            if (!this.editTooltip.toolTipObj) {
                this.editTooltip.showHideTaskbarEditTooltip(true);
            }
            if (this.editTooltip.toolTipObj) {
                this.parent.connectorLineModule.tooltipTable.innerHTML = this.parent.connectorLineModule.getConnectorLineTooltipInnerTd(this.parent.editModule.taskbarEditModule.taskBarEditRecord.ganttProperties.taskName, this.parent.editModule.taskbarEditModule.fromPredecessorText, '', '');
                var table = this.parent.connectorLineModule.tooltipTable.querySelector('#toPredecessor').querySelectorAll('td');
                table[1].innerText = toItem.taskName;
                table[2].innerText = currentTarget;
            }
            this.drawPredecessor = true;
        }
        else {
            addClass([element], [connectorPointAllowBlock]);
            this.drawPredecessor = false;
        }
    };
    TaskbarEdit.prototype.unWireEvents = function () {
        if (this.parent.isDestroyed) {
            return;
        }
        this.parent.off('chartMouseDown', this.mouseDownHandler);
        this.parent.off('chartMouseUp', this.mouseUpHandler);
        this.parent.off('chartMouseLeave', this.mouseLeaveHandler);
        this.parent.off('chartMouseMove', this.mouseMoveAction);
    };
    /**
     * @private
     */
    TaskbarEdit.prototype.destroy = function () {
        this.unWireEvents();
        this.stopScrollTimer();
    };
    return TaskbarEdit;
}());

/**
 *
 * @hidden
 */
var DialogEdit = /** @__PURE__ @class */ (function () {
    /**
     * Constructor for render module
     */
    function DialogEdit(parent) {
        this.updatedEditFields = null;
        this.updatedAddFields = null;
        this.addedRecord = null;
        this.dialogEditValidationFlag = false;
        this.parent = parent;
        this.l10n = this.parent.localeObj;
        this.beforeOpenArgs = { cancel: false };
        this.types = this.getPredecessorType();
        this.rowData = {};
        this.editedRecord = {};
        this.inputs = {
            booleanedit: CheckBox,
            dropdownedit: DropDownList,
            datepickeredit: DatePicker,
            datetimepickeredit: DateTimePicker,
            maskededit: MaskedTextBox,
            numericedit: NumericTextBox,
            stringedit: TextBox,
        };
        this.processDialogFields();
        this.wireEvents();
    }
    DialogEdit.prototype.wireEvents = function () {
        this.parent.on('chartDblClick', this.dblClickHandler, this);
    };
    DialogEdit.prototype.dblClickHandler = function (e) {
        var ganttData = this.parent.ganttChartModule.getRecordByTarget(e);
        if (!isNullOrUndefined(ganttData)) {
            this.openEditDialog(ganttData);
        }
    };
    /**
     * Method to validate add and edit dialog fields property.
     */
    DialogEdit.prototype.processDialogFields = function () {
        if (isNullOrUndefined(this.parent.editDialogFields) ||
            this.parent.editDialogFields && this.parent.editDialogFields.length === 0) {
            this.updatedEditFields = this.getDefaultDialogFields();
            this.updatedEditFields = this.validateDialogFields(this.updatedEditFields);
        }
        else {
            this.updatedEditFields = this.validateDialogFields(this.parent.editDialogFields);
        }
        if (isNullOrUndefined(this.parent.addDialogFields) ||
            this.parent.addDialogFields && this.parent.addDialogFields.length === 0) {
            this.updatedAddFields = this.getDefaultDialogFields();
            this.updatedAddFields = this.validateDialogFields(this.updatedAddFields);
        }
        else {
            this.updatedAddFields = this.validateDialogFields(this.parent.addDialogFields);
        }
    };
    DialogEdit.prototype.validateDialogFields = function (dialogFields) {
        var newDialogFields = [];
        var emptyCustomColumn = 0;
        for (var i = 0; i < dialogFields.length; i++) {
            var fieldItem = getActualProperties(dialogFields[i]);
            if (fieldItem.type === 'General' && (isNullOrUndefined(fieldItem.fields) || fieldItem.fields.length === 0)) {
                fieldItem.fields = this.getGeneralColumnFields();
            }
            if (fieldItem.type === 'Dependency' && isNullOrUndefined(this.parent.taskFields.dependency)
                || fieldItem.type === 'Resources' && isNullOrUndefined(this.parent.taskFields.resourceInfo)
                || fieldItem.type === 'Notes' && isNullOrUndefined(this.parent.taskFields.notes)) {
                continue;
            }
            if (fieldItem.type === 'Custom' && (isNullOrUndefined(fieldItem.fields) || fieldItem.fields.length === 0)) {
                emptyCustomColumn += 1;
                fieldItem.fields = this.getCustomColumnFields();
            }
            if (emptyCustomColumn > 1) {
                continue;
            }
            newDialogFields.push(fieldItem);
        }
        return newDialogFields;
    };
    /**
     * Method to get general column fields
     */
    DialogEdit.prototype.getGeneralColumnFields = function () {
        var fields = [];
        for (var _i = 0, _a = Object.keys(this.parent.columnMapping); _i < _a.length; _i++) {
            var key = _a[_i];
            if (key === 'dependency' || key === 'resourceInfo' || key === 'notes') {
                continue;
            }
            fields.push(this.parent.columnMapping[key]);
        }
        return fields;
    };
    /**
     * Method to get custom column fields
     */
    DialogEdit.prototype.getCustomColumnFields = function () {
        var fields = [];
        for (var i = 0; i < this.parent.customColumns.length; i++) {
            fields.push(this.parent.customColumns[i]);
        }
        return fields;
    };
    /**
     * Get default dialog fields when fields are not defined for add and edit dialogs
     */
    DialogEdit.prototype.getDefaultDialogFields = function () {
        var dialogFields = [];
        var fieldItem = {};
        var fields;
        if (Object.keys(this.parent.columnMapping).length !== 0) {
            fieldItem.type = 'General';
            fields = this.getGeneralColumnFields();
            dialogFields.push(fieldItem);
        }
        if (!isNullOrUndefined(getValue('dependency', this.parent.columnMapping))) {
            fieldItem = {};
            fieldItem.type = 'Dependency';
            dialogFields.push(fieldItem);
        }
        if (!isNullOrUndefined(getValue('resourceInfo', this.parent.columnMapping))) {
            fieldItem = {};
            fieldItem.type = 'Resources';
            dialogFields.push(fieldItem);
        }
        if (!isNullOrUndefined(getValue('notes', this.parent.columnMapping))) {
            fieldItem = {};
            fieldItem.type = 'Notes';
            dialogFields.push(fieldItem);
        }
        if (this.parent.customColumns.length > 0) {
            fieldItem = {};
            fieldItem.type = 'Custom';
            dialogFields.push(fieldItem);
        }
        return dialogFields;
    };
    /**
     * @private
     */
    DialogEdit.prototype.openAddDialog = function () {
        this.isEdit = false;
        this.editedRecord = this.composeAddRecord();
        this.createDialog();
    };
    /**
     * @private
     */
    DialogEdit.prototype.composeAddRecord = function () {
        var tempData = {};
        tempData.ganttProperties = {};
        var columns = this.parent.ganttColumns;
        var taskSettings = this.parent.taskFields;
        var id = this.parent.editModule.getNewTaskId();
        for (var i = 0; i < columns.length; i++) {
            var field = columns[i].field;
            if (field === taskSettings.id) {
                tempData[field] = id;
                tempData.ganttProperties.taskId = tempData[field];
            }
            else if (columns[i].field === taskSettings.startDate) {
                if (isNullOrUndefined(tempData[taskSettings.endDate])) {
                    tempData[field] = this.parent.dateValidationModule.checkStartDate(this.parent.timelineModule.timelineStartDate);
                }
                else {
                    tempData[field] = new Date(tempData[taskSettings.endDate]);
                }
                tempData.ganttProperties.startDate = new Date(tempData[field]);
            }
            else if (columns[i].field === taskSettings.endDate) {
                if (isNullOrUndefined(tempData[taskSettings.startDate])) {
                    tempData[field] = this.parent.dateValidationModule.checkStartDate(this.parent.timelineModule.timelineStartDate);
                }
                else {
                    tempData[field] = new Date(tempData[taskSettings.startDate]);
                }
                tempData.ganttProperties.endDate = new Date(tempData[field]);
            }
            else if (columns[i].field === taskSettings.duration) {
                tempData[field] = 1;
                tempData.ganttProperties.duration = tempData[field];
                tempData.ganttProperties.durationUnit = this.parent.durationUnit.toLocaleLowerCase();
            }
            else if (columns[i].field === taskSettings.name) {
                tempData[field] = 'New Task ' + id;
                tempData.ganttProperties.taskName = tempData[field];
            }
            else if (columns[i].field === taskSettings.progress) {
                tempData[field] = 0;
                tempData.ganttProperties.progress = tempData[field];
            }
            else {
                tempData[this.parent.ganttColumns[i].field] = '';
            }
        }
        return tempData;
    };
    /**
     * @private
     */
    DialogEdit.prototype.openToolbarEditDialog = function () {
        var gObj = this.parent;
        if (gObj.editModule && gObj.editSettings.allowEditing) {
            var selectedRowId = gObj.selectionModule ?
                (gObj.selectionSettings.mode === 'Row' || gObj.selectionSettings.mode === 'Both') &&
                    gObj.selectionModule.selectedRowIndexes.length === 1 ?
                    gObj.currentViewData[gObj.selectionModule.selectedRowIndexes[0]].ganttProperties.taskId :
                    gObj.selectionSettings.mode === 'Cell' &&
                        gObj.selectionModule.getSelectedRowCellIndexes().length === 1 ?
                        gObj.currentViewData[gObj.selectionModule.getSelectedRowCellIndexes()[0].rowIndex].ganttProperties.taskId :
                        null : null;
            if (!isNullOrUndefined(selectedRowId)) {
                this.openEditDialog(selectedRowId);
            }
        }
    };
    /**
     * @param taskId
     * @private
     */
    DialogEdit.prototype.openEditDialog = function (taskId) {
        var ganttObj = this.parent;
        if (typeof taskId === 'object') {
            this.rowIndex = this.parent.currentViewData.indexOf(taskId);
            if (this.rowIndex > -1) {
                this.rowData = taskId;
            }
        }
        else if (!isNullOrUndefined(taskId)) {
            this.rowIndex = ganttObj.ids.indexOf(taskId.toString());
            if (this.rowIndex > -1) {
                this.rowData = ganttObj.flatData[this.rowIndex];
            }
        }
        else if (ganttObj.selectedRowIndex > -1) {
            this.rowData = ganttObj.currentViewData[ganttObj.selectedRowIndex];
            this.rowIndex = ganttObj.selectedRowIndex;
        }
        this.isEdit = true;
        this.editedRecord = extend({}, {}, this.rowData, true);
        this.createDialog();
    };
    DialogEdit.prototype.createDialog = function () {
        var _this = this;
        var ganttObj = this.parent;
        var dialogModel = {};
        this.beforeOpenArgs.dialogModel = dialogModel;
        this.beforeOpenArgs.rowData = this.editedRecord;
        this.beforeOpenArgs.rowIndex = this.rowIndex;
        this.dialog = this.parent.createElement('div', { id: ganttObj.element.id + '_dialog', styles: 'max-width:600px' });
        ganttObj.element.appendChild(this.dialog);
        var position = { X: 'center', Y: 'center' };
        dialogModel.animationSettings = { effect: 'Zoom' };
        dialogModel.header = this.l10n.getConstant(this.isEdit ? 'editDialogTitle' : 'addDialogTitle');
        dialogModel.isModal = true;
        dialogModel.cssClass = 'e-gantt-dialog';
        dialogModel.allowDragging = true;
        dialogModel.showCloseIcon = true;
        dialogModel.position = position;
        //dialogModel.width = '750px';
        dialogModel.target = this.parent.element;
        dialogModel.close = this.dialogClose.bind(this);
        dialogModel.closeOnEscape = true;
        dialogModel.open = function (args) {
            var generalTabElement = getValue('element', args);
            generalTabElement = generalTabElement.querySelector('#' + _this.parent.element.id + 'GeneralTabContainer');
            if (generalTabElement && generalTabElement.scrollHeight > generalTabElement.offsetHeight) {
                generalTabElement.classList.add('e-scroll');
            }
        };
        dialogModel.locale = this.parent.locale;
        dialogModel.buttons = [{
                buttonModel: {
                    content: this.l10n.getConstant('saveButton'), cssClass: 'e-primary'
                },
                click: this.buttonClick.bind(this)
            }, {
                buttonModel: { cssClass: 'e-flat', content: this.l10n.getConstant('cancel') },
                click: this.buttonClick.bind(this)
            }];
        var tabElement = this.createTab();
        if (!this.beforeOpenArgs.cancel) {
            dialogModel.content = tabElement;
            this.dialogObj = new Dialog(dialogModel);
            this.dialogObj.appendTo(this.dialog);
            var args = {
                requestType: this.isEdit ? 'openEditDialog' : 'openAddDialog',
                data: this.beforeOpenArgs.rowData,
                element: this.dialog,
                cancel: false
            };
            this.parent.trigger('actionComplete', args);
            if (args.cancel) {
                this.resetValues();
            }
        }
    };
    DialogEdit.prototype.buttonClick = function (e) {
        var target = e.target;
        target.style.pointerEvents = 'none';
        if ((this.l10n.getConstant('cancel')).toLowerCase() === e.target.innerText.trim().toLowerCase()) {
            if (this.dialog && !this.dialogObj.isDestroyed) {
                this.dialogClose();
            }
        }
        else {
            this.initiateDialogSave();
            target.style.pointerEvents = 'auto';
        }
    };
    /**
     * @private
     */
    DialogEdit.prototype.dialogClose = function () {
        if (this.dialog) {
            this.dialogObj.hide();
            this.resetValues();
        }
    };
    DialogEdit.prototype.resetValues = function () {
        this.isEdit = false;
        this.editedRecord = {};
        this.rowData = {};
        this.rowIndex = -1;
        this.addedRecord = null;
        if (this.dialog && !this.dialogObj.isDestroyed) {
            this.destroyDialogInnerElements();
            this.dialogObj.destroy();
            remove(this.dialog);
        }
    };
    DialogEdit.prototype.destroyDialogInnerElements = function () {
        var ganttObj = this.parent;
        var tabModel = this.beforeOpenArgs.tabModel;
        var items = tabModel.items;
        for (var i = 0; i < items.length; i++) {
            var element = items[i].content;
            var id = element.id;
            if (!isNullOrUndefined(id) || id !== '') {
                id = id.replace(ganttObj.element.id, '');
                id = id.replace('TabContainer', '');
                if (id === 'General') {
                    this.destroyCustomField(element);
                }
                else if (id === 'Dependency') {
                    var gridObj = element.ej2_instances[0];
                    gridObj.destroy();
                }
                else if (id === 'Notes') {
                    var rte = element.ej2_instances[0];
                    rte.destroy();
                }
                else if (id === 'Resources') {
                    var gridObj = element.ej2_instances[0];
                    gridObj.destroy();
                }
                else if (id.indexOf('Custom') !== -1) {
                    this.destroyCustomField(element);
                }
            }
        }
    };
    DialogEdit.prototype.destroyCustomField = function (element) {
        var childNodes = element.childNodes;
        var ganttObj = this.parent;
        for (var i = 0; i < childNodes.length; i++) {
            var div = childNodes[i];
            var inputElement = div.querySelector('input[id^="' + ganttObj.element.id + '"]');
            if (inputElement) {
                var fieldName = inputElement.id.replace(ganttObj.element.id, '');
                /* tslint:disable-next-line:no-any */
                var controlObj = div.querySelector('#' + ganttObj.element.id + fieldName).ej2_instances[0];
                if (controlObj) {
                    controlObj.destroy();
                }
            }
        }
    };
    /**
     * @private
     */
    DialogEdit.prototype.destroy = function () {
        this.resetValues();
        if (this.parent.isDestroyed) {
            return;
        }
        this.parent.off('chartDblClick', this.dblClickHandler);
    };
    /**
     * Method to get current edit dialog fields value
     */
    DialogEdit.prototype.getEditFields = function () {
        if (this.isEdit) {
            return this.updatedEditFields;
        }
        else {
            return this.updatedAddFields;
        }
    };
    DialogEdit.prototype.createTab = function () {
        var ganttObj = this.parent;
        var tabModel = {};
        var tabItems = [];
        var dialogSettings = this.getEditFields();
        var tabElement;
        var tasks = ganttObj.taskFields;
        var length = dialogSettings.length;
        tabModel.items = tabItems;
        tabModel.locale = this.parent.locale;
        this.beforeOpenArgs.tabModel = tabModel;
        var index = 0;
        if (length > 0) {
            for (var i = 0; i < length; i++) {
                var dialogField = dialogSettings[i];
                var tabItem = {};
                if (dialogField.type === 'General') {
                    if (Object.keys(ganttObj.columnMapping).length === 0) {
                        continue;
                    }
                    if (isNullOrUndefined(dialogField.headerText)) {
                        dialogField.headerText = this.l10n.getConstant('generalTab');
                    }
                    tabItem.content = 'General';
                    this.beforeOpenArgs[tabItem.content] = this.getFieldsModel(dialogField.fields);
                }
                else if (dialogField.type === 'Dependency') {
                    if (isNullOrUndefined(tasks.dependency)) {
                        continue;
                    }
                    if (isNullOrUndefined(dialogField.headerText)) {
                        dialogField.headerText = this.l10n.getConstant('dependency');
                    }
                    tabItem.content = 'Dependency';
                    this.beforeOpenArgs[tabItem.content] = this.getPredecessorModel(dialogField.fields);
                }
                else if (dialogField.type === 'Resources') {
                    if (isNullOrUndefined(tasks.resourceInfo)) {
                        continue;
                    }
                    if (isNullOrUndefined(dialogField.headerText)) {
                        dialogField.headerText = this.l10n.getConstant('resourceName');
                    }
                    tabItem.content = 'Resources';
                    this.beforeOpenArgs[tabItem.content] = this.getResourcesModel(dialogField.fields);
                }
                else if (dialogField.type === 'Notes') {
                    if (isNullOrUndefined(tasks.notes)) {
                        continue;
                    }
                    if (isNullOrUndefined(dialogField.headerText)) {
                        dialogField.headerText = this.l10n.getConstant('notes');
                    }
                    tabItem.content = 'Notes';
                    this.beforeOpenArgs[tabItem.content] = this.getNotesModel(dialogField.fields);
                }
                else {
                    if (isNullOrUndefined(dialogField.fields) || dialogField.fields.length === 0) {
                        continue;
                    }
                    if (isNullOrUndefined(dialogField.headerText)) {
                        dialogField.headerText = this.l10n.getConstant('customTab');
                        
                    }
                    tabItem.content = 'Custom' + '' + index++;
                    this.beforeOpenArgs[tabItem.content] = this.getFieldsModel(dialogField.fields);
                }
                tabItem.header = { text: dialogField.headerText };
                tabItems.push(tabItem);
            }
        }
        this.beforeOpenArgs.requestType = this.isEdit ? 'beforeOpenEditDialog' : 'beforeOpenAddDialog';
        this.renderTabItems();
        this.parent.trigger('actionBegin', this.beforeOpenArgs);
        if (this.beforeOpenArgs.cancel) {
            return tabElement;
        }
        var tabObj = new Tab(tabModel);
        tabElement = this.parent.createElement('div', { id: ganttObj.element.id + '_Tab' });
        tabObj.appendTo(tabElement);
        return tabElement;
    };
    DialogEdit.prototype.getFieldsModel = function (fields) {
        var fieldsModel = {};
        var columnByField = this.parent.columnByField;
        for (var i = 0; i < fields.length; i++) {
            if (fields[i] === this.parent.taskFields.dependency ||
                fields[i] === this.parent.taskFields.resourceInfo ||
                fields[i] === this.parent.taskFields.notes) {
                continue;
            }
            if (!isNullOrUndefined(columnByField[fields[i]])) {
                var fieldName = fields[i];
                this.createInputModel(columnByField[fieldName], fieldsModel);
            }
        }
        return fieldsModel;
    };
    DialogEdit.prototype.createInputModel = function (column, fieldsModel) {
        var _this = this;
        var ganttObj = this.parent;
        var locale = this.parent.locale;
        var taskSettings = this.parent.taskFields;
        var common = {
            placeholder: column.headerText,
            floatLabelType: 'Auto',
        };
        switch (column.editType) {
            case EditType.Boolean:
                var checkboxModel = {
                    label: column.headerText,
                    locale: locale,
                };
                fieldsModel[column.field] = checkboxModel;
                break;
            case EditType.String:
                var textBox = common;
                if (column.field === ganttObj.columnMapping.duration) {
                    textBox.change = function (args) {
                        _this.validateScheduleFields(args, column, ganttObj);
                    };
                }
                fieldsModel[column.field] = common;
                break;
            case EditType.Numeric:
                var numeric = common;
                fieldsModel[column.field] = numeric;
                break;
            case EditType.DatePicker:
                var datePickerObj = common;
                datePickerObj.format = this.parent.dateFormat;
                datePickerObj.firstDayOfWeek = ganttObj.timelineModule.customTimelineSettings.weekStartDay;
                if (column.field === ganttObj.columnMapping.startDate ||
                    column.field === ganttObj.columnMapping.endDate) {
                    datePickerObj.renderDayCell = this.parent.renderWorkingDayCell.bind(this.parent);
                    datePickerObj.change = function (args) {
                        _this.validateScheduleFields(args, column, ganttObj);
                    };
                }
                fieldsModel[column.field] = datePickerObj;
                break;
            case EditType.DateTimePicker:
                var dateTimePickerObj = common;
                dateTimePickerObj.format = this.parent.dateFormat;
                dateTimePickerObj.firstDayOfWeek = ganttObj.timelineModule.customTimelineSettings.weekStartDay;
                if (column.field === ganttObj.columnMapping[taskSettings.startDate] ||
                    column.field === ganttObj.columnMapping[taskSettings.endDate]) {
                    dateTimePickerObj.renderDayCell = this.parent.renderWorkingDayCell.bind(this.parent);
                    dateTimePickerObj.change = function (args) {
                        _this.validateScheduleFields(args, column, ganttObj);
                    };
                }
                fieldsModel[column.field] = dateTimePickerObj;
                break;
            case EditType.DropDown:
                fieldsModel[column.field] = common;
                break;
            case EditType.Masked:
                fieldsModel[column.field] = common;
                break;
        }
        if (!isNullOrUndefined(column.edit)) {
            extend(fieldsModel[column.field], column.edit.params);
        }
        return fieldsModel;
    };
    DialogEdit.prototype.validateScheduleFields = function (args, column, ganttObj) {
        var dialog = ganttObj.editModule.dialogModule.dialog;
        var targetId = null;
        var inputElement;
        var currentData = ganttObj.editModule.dialogModule.editedRecord;
        if (!isNullOrUndefined(args.element)) {
            inputElement = args.element;
            targetId = inputElement.getAttribute('id');
        }
        else if (!isNullOrUndefined(args.container)) {
            inputElement = args.container;
            targetId = inputElement.querySelector('input').getAttribute('id');
            inputElement = inputElement.querySelector('#' + targetId);
        }
        var cellValue = inputElement.value;
        var colName = targetId.replace(ganttObj.element.id, '');
        this.validateScheduleValuesByCurrentField(colName, cellValue, this.editedRecord);
        var ganttProp = currentData.ganttProperties;
        var tasks = ganttObj.taskFields;
        if (!isNullOrUndefined(tasks.startDate)) {
            this.updateScheduleFields(dialog, ganttProp, 'startDate');
        }
        if (!isNullOrUndefined(tasks.endDate)) {
            this.updateScheduleFields(dialog, ganttProp, 'endDate');
        }
        if (!isNullOrUndefined(tasks.duration)) {
            this.updateScheduleFields(dialog, ganttProp, 'duration');
        }
        this.dialogEditValidationFlag = false;
        return true;
    };
    DialogEdit.prototype.updateScheduleFields = function (dialog, ganttProp, ganttField) {
        var ganttObj = this.parent;
        var ganttId = ganttObj.element.id;
        var columnName = getValue(ganttField, ganttObj.columnMapping);
        var col = ganttObj.columnByField[columnName];
        var tempValue;
        if (col.editType === EditType.String) {
            var textBox = dialog.querySelector('#' + ganttId + columnName).ej2_instances[0];
            tempValue = this.parent.dataOperation.getDurationString(ganttProp.duration, ganttProp.durationUnit);
            if (textBox.value !== tempValue) {
                textBox.value = tempValue;
                textBox.dataBind();
            }
        }
        else if (col.editType === EditType.DatePicker || col.editType === EditType.DateTimePicker) {
            var picker = col.editType === EditType.DatePicker ?
                dialog.querySelector('#' + ganttId + columnName).ej2_instances[0] :
                dialog.querySelector('#' + ganttId + columnName).ej2_instances[0];
            tempValue = ganttProp[ganttField];
            if (((isNullOrUndefined(picker.value)) && !isNullOrUndefined(tempValue)) ||
                (isNullOrUndefined(tempValue) && !isNullOrUndefined(picker.value)) ||
                (picker.value !== tempValue && picker.value.toString() !== tempValue.toString())) {
                picker.value = tempValue;
                picker.dataBind();
            }
        }
    };
    DialogEdit.prototype.validateDuration = function (ganttData) {
        var ganttProp = ganttData.ganttProperties;
        if (!this.dialogEditValidationFlag) {
            if (isNullOrUndefined(ganttProp.duration)) {
                this.parent.setRecordValue('endDate', null, ganttProp, true);
                this.parent.setRecordValue('isMilestone', false, ganttProp, true);
            }
            else if (isScheduledTask(ganttProp) || !isNullOrUndefined(ganttProp.startDate)) {
                this.parent.dateValidationModule.calculateEndDate(ganttData);
            }
            else if (!isScheduledTask(ganttProp) && !isNullOrUndefined(ganttProp.endDate)) {
                this.parent.dateValidationModule.calculateStartDate(ganttData);
            }
            var milestone = ganttProp.duration === 0 ? true : false;
            this.parent.setRecordValue('isMilestone', milestone, ganttProp, true);
            this.dialogEditValidationFlag = true;
        }
    };
    DialogEdit.prototype.validateStartDate = function (ganttData) {
        var ganttProp = ganttData.ganttProperties;
        var tasks = this.parent.taskFields;
        if (!this.dialogEditValidationFlag) {
            if (isNullOrUndefined(ganttProp.startDate)) {
                this.parent.setRecordValue('endDate', null, ganttProp, true);
                this.parent.setRecordValue('isMilestone', false, ganttProp, true);
            }
            else if (isScheduledTask(ganttProp)) {
                if (isNullOrUndefined(tasks.duration)) {
                    this.parent.dateValidationModule.calculateDuration(ganttData);
                }
                else if (isNullOrUndefined(tasks.endDate)) {
                    this.parent.dateValidationModule.calculateEndDate(ganttData);
                }
                else {
                    this.parent.dateValidationModule.calculateEndDate(ganttData);
                }
            }
            else {
                if (!isNullOrUndefined(ganttProp.endDate)) {
                    this.parent.dateValidationModule.calculateDuration(ganttData);
                }
                else if (!isNullOrUndefined(ganttProp.duration)) {
                    this.parent.dateValidationModule.calculateEndDate(ganttData);
                }
            }
            this.dialogEditValidationFlag = true;
        }
    };
    DialogEdit.prototype.validateEndDate = function (ganttData) {
        var ganttProp = ganttData.ganttProperties;
        var tasks = this.parent.taskFields;
        if (!this.dialogEditValidationFlag) {
            if (isNullOrUndefined(ganttProp.endDate)) {
                this.parent.setRecordValue('duration', null, ganttProp, true);
                this.parent.setRecordValue('isMilestone', false, ganttProp, true);
            }
            else if (isScheduledTask(ganttProp)) {
                if (isNullOrUndefined(tasks.duration)) {
                    this.parent.dateValidationModule.calculateDuration(ganttData);
                }
                else if (isNullOrUndefined(ganttProp.startDate)) {
                    this.parent.dateValidationModule.calculateStartDate(ganttData);
                }
                else {
                    this.parent.dateValidationModule.calculateDuration(ganttData);
                }
            }
            else {
                if (!isNullOrUndefined(ganttProp.duration)) {
                    this.parent.dateValidationModule.calculateStartDate(ganttData);
                }
                else if (!isNullOrUndefined(ganttProp.startDate)) {
                    this.parent.dateValidationModule.calculateDuration(ganttData);
                }
            }
            this.dialogEditValidationFlag = true;
        }
    };
    /**
     *
     * @param columnName
     * @param value
     * @param currentData
     * @private
     */
    DialogEdit.prototype.validateScheduleValuesByCurrentField = function (columnName, value, currentData) {
        var ganttObj = this.parent;
        var ganttProp = currentData.ganttProperties;
        var taskSettings = ganttObj.taskFields;
        if (taskSettings.duration === columnName) {
            if (!isNullOrUndefined(value) && value !== '') {
                ganttObj.dataOperation.updateDurationValue(value, ganttProp);
            }
            else {
                if (ganttObj.allowUnscheduledTasks) {
                    this.parent.setRecordValue('duration', null, ganttProp, true);
                }
            }
            this.validateDuration(currentData);
        }
        if (taskSettings.startDate === columnName) {
            if (value !== '') {
                var startDate = this.parent.dateValidationModule.getDateFromFormat(value);
                startDate = this.parent.dateValidationModule.checkStartDate(startDate);
                this.parent.setRecordValue('startDate', startDate, ganttProp, true);
            }
            else {
                if (ganttObj.allowUnscheduledTasks) {
                    this.parent.setRecordValue('startDate', null, ganttProp, true);
                }
            }
            this.validateStartDate(currentData);
        }
        if (taskSettings.endDate === columnName) {
            if (value !== '') {
                var endDate = this.parent.dateValidationModule.getDateFromFormat(value);
                if (endDate.getHours() === 0 && ganttObj.defaultEndTime !== 86400) {
                    this.parent.dateValidationModule.setTime(ganttObj.defaultEndTime, endDate);
                }
                endDate = this.parent.dateValidationModule.checkEndDate(endDate, ganttProp);
                this.parent.setRecordValue('endDate', endDate, ganttProp, true);
            }
            else {
                if (ganttObj.allowUnscheduledTasks) {
                    this.parent.setRecordValue('endDate', null, ganttProp, true);
                }
            }
            this.validateEndDate(currentData);
        }
        return true;
    };
    DialogEdit.prototype.getPredecessorModel = function (fields) {
        if (isNullOrUndefined(fields) || fields.length === 0) {
            fields = ['ID', 'Name', 'Type', 'Offset'];
        }
        var inputModel = {};
        inputModel.editSettings = { allowEditing: true, allowAdding: true, allowDeleting: true, mode: 'Normal' };
        inputModel.locale = this.parent.locale;
        inputModel.dataSource = [];
        inputModel.toolbar = [
            {
                id: this.parent.element.id + 'DependencyTabContainer' + '_add', prefixIcon: 'e-add',
                text: this.l10n.getConstant('add'), tooltipText: this.l10n.getConstant('add'), align: 'Right'
            },
            {
                id: this.parent.element.id + 'DependencyTabContainer' + '_delete', prefixIcon: 'e-delete',
                text: this.l10n.getConstant('delete'), tooltipText: this.l10n.getConstant('delete'), align: 'Right'
            }
        ];
        var columns = [];
        for (var i = 0; i < fields.length; i++) {
            var column = {};
            if (fields[i].toLowerCase() === 'id') {
                column = {
                    field: 'id', headerText: this.l10n.getConstant('id'), allowEditing: false, width: '70px'
                };
                columns.push(column);
            }
            else if (fields[i].toLowerCase() === 'name') {
                column = {
                    field: 'name', headerText: this.l10n.getConstant('name'), editType: EditType.String, width: '250px',
                    validationRules: { required: true }
                };
                columns.push(column);
            }
            else if (fields[i].toLowerCase() === 'type') {
                column = {
                    field: 'type', headerText: this.l10n.getConstant('type'), editType: EditType.DropDown,
                    dataSource: this.types, foreignKeyField: 'id', foreignKeyValue: 'text',
                    defaultValue: 'FS', validationRules: { required: true }
                };
                columns.push(column);
            }
            else if (fields[i].toLowerCase() === 'offset') {
                column = {
                    field: 'offset', headerText: this.l10n.getConstant('offset'), editType: EditType.String,
                    defaultValue: '0 days', validationRules: { required: true }
                };
                columns.push(column);
            }
        }
        inputModel.columns = columns;
        inputModel.height = '117px';
        return inputModel;
    };
    DialogEdit.prototype.getResourcesModel = function (fields) {
        var ganttObj = this.parent;
        if (isNullOrUndefined(fields) || fields.length === 0) {
            fields = [ganttObj.resourceIDMapping, ganttObj.resourceNameMapping];
        }
        var inputModel = {
            allowFiltering: true,
            locale: this.parent.locale,
            allowSelection: true,
            filterSettings: { type: 'Menu' },
            selectionSettings: { checkboxOnly: true, checkboxMode: 'ResetOnRowClick', persistSelection: true, type: 'Multiple' }
        };
        var columns = [
            { type: 'checkbox', allowEditing: false, allowSorting: false, allowFiltering: false, width: 60 },
        ];
        for (var i = 0; i < fields.length; i++) {
            var column = {};
            if (fields[i] === ganttObj.resourceIDMapping) {
                column = {
                    field: ganttObj.resourceIDMapping,
                    headerText: this.l10n.getConstant('id'), isPrimaryKey: true, width: '100px'
                };
                columns.push(column);
            }
            else if (fields[i] === ganttObj.resourceNameMapping) {
                column = {
                    field: ganttObj.resourceNameMapping, headerText: this.l10n.getConstant('name'),
                };
                columns.push(column);
            }
        }
        inputModel.columns = columns;
        inputModel.height = '160px';
        return inputModel;
    };
    DialogEdit.prototype.getNotesModel = function (fields) {
        if (isNullOrUndefined(fields) || fields.length === 0) {
            fields = ['Bold', 'Italic', 'Underline', 'StrikeThrough',
                'FontName', 'FontSize', 'FontColor', 'BackgroundColor',
                'LowerCase', 'UpperCase', '|',
                'Formats', 'Alignments', 'OrderedList', 'UnorderedList',
                'Outdent', 'Indent', '|', 'CreateTable',
                'CreateLink', 'Image', '|', 'ClearFormat', 'Print',
                '|', 'Undo', 'Redo'];
        }
        var inputModel = {
            placeholder: this.l10n.getConstant('writeNotes'),
            locale: this.parent.locale
        };
        return inputModel;
    };
    DialogEdit.prototype.createDivElement = function (className, id) {
        return createElement('div', { className: className, id: id });
    };
    DialogEdit.prototype.createInputElement = function (className, id, fieldName, type) {
        return createElement(type || 'input', {
            className: className, attrs: {
                type: 'text', id: id, name: fieldName,
                title: fieldName
            }
        });
    };
    DialogEdit.prototype.renderTabItems = function () {
        var tabModel = this.beforeOpenArgs.tabModel;
        var items = tabModel.items;
        var index = 0;
        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            if (item.content instanceof HTMLElement) {
                continue;
            }
            else if (item.content === 'General') {
                item.content = this.renderGeneralTab(item.content);
            }
            else if (item.content === 'Dependency') {
                if (this.editedRecord.hasChildRecords) {
                    item.disabled = true;
                }
                item.content = this.renderPredecessorTab(item.content);
            }
            else if (item.content === 'Resources') {
                item.content = this.renderResourceTab(item.content);
            }
            else if (item.content === ('Custom' + '' + index)) {
                item.content = this.renderCustomTab(item.content);
                index++;
            }
            else if (item.content === 'Notes') {
                item.content = this.renderNotesTab(item.content);
            }
        }
    };
    DialogEdit.prototype.renderGeneralTab = function (itemName) {
        var ganttObj = this.parent;
        var itemModel = this.beforeOpenArgs[itemName];
        var divElement = this.createDivElement('e-edit-form-row', ganttObj.element.id
            + '' + itemName + 'TabContainer');
        for (var _i = 0, _a = Object.keys(itemModel); _i < _a.length; _i++) {
            var key = _a[_i];
            var column = this.parent.columnByField[key];
            var inputModel = itemModel[key];
            divElement.appendChild(this.renderInputElements(inputModel, column));
        }
        return divElement;
    };
    DialogEdit.prototype.isCheckIsDisabled = function (column) {
        var disabled = false;
        if (this.isEdit) {
            if (column.field === this.parent.taskFields.id) {
                disabled = true;
            }
            if (this.editedRecord.hasChildRecords) {
                if (column.field === this.parent.taskFields.endDate) {
                    disabled = true;
                }
                else if (column.field === this.parent.taskFields.duration) {
                    disabled = true;
                }
                else if (column.field === this.parent.taskFields.progress) {
                    disabled = true;
                }
                else if (column.field === this.parent.taskFields.progress) {
                    disabled = true;
                }
            }
        }
        return disabled;
    };
    DialogEdit.prototype.renderPredecessorTab = function (itemName) {
        var _this = this;
        var ganttObj = this.parent;
        var gridModel = this.beforeOpenArgs[itemName];
        var ganttData = this.beforeOpenArgs.rowData;
        var preData = [];
        this.taskNameCollection();
        if (this.isEdit) {
            preData = this.predecessorEditCollection(ganttData);
            this.updatePredecessorDropDownData(ganttData);
        }
        gridModel.dataSource = preData;
        var columns = gridModel.columns;
        columns[1].edit = {
            write: function (args) {
                var field = 'name';
                var autoObj = new ComboBox({
                    dataSource: new DataManager(_this.preTableCollection),
                    popupHeight: '180px',
                    allowCustom: false,
                    fields: { value: 'text' },
                    value: args.rowData[field],
                    change: function (args) {
                        var tr = closest(args.element, 'tr');
                        var idInput = tr.querySelector('#' + _this.parent.element.id + 'DependencyTabContainerid');
                        idInput.value = args.itemData.id;
                    },
                    autofill: true,
                });
                autoObj.appendTo(args.element);
            },
            read: function (args) {
                var ej2Instance = args.ej2_instances[0];
                return ej2Instance.value;
            }
        };
        Grid.Inject(Edit, Page, Toolbar, ForeignKey);
        var gridObj = new Grid(gridModel);
        var divElement = this.createDivElement('e-dependent-div', ganttObj.element.id + '' + itemName + 'TabContainer');
        gridObj.appendTo(divElement);
        return divElement;
    };
    DialogEdit.prototype.renderResourceTab = function (itemName) {
        var ganttObj = this.parent;
        var ganttResources = [];
        var ganttData = this.beforeOpenArgs.rowData;
        var inputModel = this.beforeOpenArgs[itemName];
        var resourceGridId = ganttObj.element.id + '' + itemName + 'TabContainer';
        inputModel.dataSource = ganttObj.resources;
        var resourceInfo = ganttData.ganttProperties.resourceInfo;
        if (this.isEdit && !isNullOrUndefined(resourceInfo)) {
            for (var i = 0; i < resourceInfo.length; i++) {
                ganttResources.push({ name: resourceInfo[i][ganttObj.resourceIDMapping] });
            }
        }
        var tabModel = this.beforeOpenArgs.tabModel;
        tabModel.selected = function (args) {
            var title = getValue('selectedItem.textContent', args);
            if (title === 'Resources') {
                var resourceGrid_1 = ganttObj.element.querySelector('#' + resourceGridId).ej2_instances[0];
                var resources_1 = ganttData.ganttProperties.resourceInfo;
                if (resources_1 && resources_1.length > 0) {
                    resourceGrid_1.currentViewData.forEach(function (data, index) {
                        for (var i = 0; i < resources_1.length; i++) {
                            if (data[ganttObj.resourceIDMapping] === resources_1[i][ganttObj.resourceIDMapping]) {
                                resourceGrid_1.selectRow(index);
                            }
                        }
                    });
                }
            }
            if (title === 'Notes') {
                var notesTabId = '#' + ganttObj.element.id + 'Notes' + 'TabContainer';
                var notesObj = ganttObj.element.querySelector(notesTabId).ej2_instances[0];
                notesObj.refresh();
            }
        };
        var divElement = this.createDivElement('e-resource-div', resourceGridId);
        Grid.Inject(Selection, Filter);
        var gridObj = new Grid(inputModel);
        gridObj.appendTo(divElement);
        return divElement;
    };
    DialogEdit.prototype.renderCustomTab = function (itemName) {
        return this.renderGeneralTab(itemName);
    };
    DialogEdit.prototype.renderNotesTab = function (itemName) {
        var ganttObj = this.parent;
        var inputModel = this.beforeOpenArgs[itemName];
        var ganttProp = this.editedRecord.ganttProperties;
        var divElement = this.createDivElement('', ganttObj.element.id + '' + itemName + 'TabContainer');
        RichTextEditor.Inject(Toolbar$2, Link, Image, HtmlEditor, QuickToolbar, Count);
        inputModel.value = ganttProp.notes;
        var rteObj = new RichTextEditor(inputModel);
        rteObj.appendTo(divElement);
        return divElement;
    };
    DialogEdit.prototype.renderInputElements = function (inputModel, column) {
        var ganttId = this.parent.element.id;
        var ganttData = this.editedRecord;
        var divElement = this.createDivElement('e-edit-form-column');
        var inputElement = this.createInputElement('', ganttId + '' + column.field, column.field);
        divElement.appendChild(inputElement);
        inputModel.enabled = !this.isCheckIsDisabled(column);
        if (column.field === this.parent.taskFields.duration) {
            var ganttProp = ganttData.ganttProperties;
            inputModel.value = this.parent.dataOperation.getDurationString(ganttProp.duration, ganttProp.durationUnit);
        }
        else {
            inputModel.value = ganttData[column.field];
        }
        var inputObj = new this.inputs[column.editType](inputModel);
        inputObj.appendTo(inputElement);
        return divElement;
    };
    
    DialogEdit.prototype.taskNameCollection = function () {
        var flatData = this.parent.flatData;
        this.preTaskIds = [];
        this.preTableCollection = [];
        for (var i = 0; i < flatData.length; i++) {
            var data = flatData[i];
            if (data.hasChildRecords) {
                continue;
            }
            var tempObject = {
                id: data.ganttProperties.taskId.toString(),
                text: (data.ganttProperties.taskId.toString() + '-' + data.ganttProperties.taskName),
                value: data.ganttProperties.taskId.toString()
            };
            this.preTaskIds.push(tempObject.id);
            this.preTableCollection.push(tempObject);
        }
    };
    DialogEdit.prototype.predecessorEditCollection = function (ganttData) {
        var preDataCollection = [];
        var ganttProp = ganttData.ganttProperties;
        if (this.isEdit && !isNullOrUndefined(this.parent.taskFields.dependency) && !isNullOrUndefined(ganttData) &&
            !isNullOrUndefined(ganttProp.predecessor)) {
            var predecessor = ganttProp.predecessor;
            var idCollection = this.preTableCollection;
            for (var i = 0; i < predecessor.length; i++) {
                var from = predecessor[i].from.toString();
                var preData = {};
                if (ganttProp.taskId.toString() !== from) {
                    preData.id = from;
                    for (var index = 0; index < idCollection.length; index++) {
                        if (idCollection[index].value === from) {
                            preData.name = idCollection[index].text;
                            break;
                        }
                    }
                    preData.type = predecessor[i].type;
                    var offset = Math.abs(predecessor[i].offset);
                    var offsetUnit = predecessor[i].offsetUnit;
                    preData.offset = this.parent.dataOperation.getDurationString(offset, offsetUnit);
                    preDataCollection.push(preData);
                }
            }
        }
        return preDataCollection;
    };
    DialogEdit.prototype.updatePredecessorDropDownData = function (ganttData) {
        var index = -1;
        var id = ganttData.ganttProperties.taskId.toString();
        index = this.preTaskIds.indexOf(id);
        this.preTableCollection.splice(index, 1);
        this.preTaskIds.splice(index, 1);
        this.validSuccessorTasks(ganttData, this.preTaskIds, this.preTableCollection);
    };
    DialogEdit.prototype.validSuccessorTasks = function (data, ids, idCollection) {
        var _this = this;
        var ganttProp = data.ganttProperties;
        if (ganttProp.predecessor && ganttProp.predecessor.length > 0) {
            var predecessor = ganttProp.predecessor;
            var fromId_1 = ganttProp.taskId.toString();
            predecessor.forEach(function (item) {
                if (item.from.toString() === fromId_1) {
                    var toId = item.to;
                    var idIndex = -1;
                    idIndex = ids.indexOf(toId);
                    if (idIndex > -1) {
                        ids.splice(idIndex, 1);
                        idCollection.splice(idIndex, 1);
                    }
                    var ganttData = _this.parent.getRecordByID(toId);
                    _this.validSuccessorTasks(ganttData, ids, idCollection);
                }
            });
        }
    };
    DialogEdit.prototype.getPredecessorType = function () {
        var localeObj = this.parent.localeObj;
        var typeText = [this.parent.getPredecessorTextValue('SS'), this.parent.getPredecessorTextValue('SF'),
            this.parent.getPredecessorTextValue('FS'), this.parent.getPredecessorTextValue('FF')];
        var types = [
            { id: 'FS', text: typeText[2], value: typeText[2] },
            { id: 'FF', text: typeText[3], value: typeText[3] },
            { id: 'SS', text: typeText[0], value: typeText[0] },
            { id: 'SF', text: typeText[1], value: typeText[1] }
        ];
        return types;
    };
    DialogEdit.prototype.initiateDialogSave = function () {
        if (this.isEdit) {
            this.parent.initiateEditAction(true);
        }
        else {
            this.addedRecord = {};
        }
        var ganttObj = this.parent;
        var tabModel = this.beforeOpenArgs.tabModel;
        var items = tabModel.items;
        for (var i = 0; i < items.length; i++) {
            var element = items[i].content;
            var id = element.id;
            if (!isNullOrUndefined(id) || id !== '') {
                id = id.replace(ganttObj.element.id, '');
                id = id.replace('TabContainer', '');
                if (id === 'General') {
                    this.updateGeneralTab(element, false);
                }
                else if (id === 'Dependency') {
                    this.updatePredecessorTab(element);
                }
                else if (id === 'Notes') {
                    this.updateNotesTab(element);
                }
                else if (id === 'Resources') {
                    this.updateResourceTab(element);
                }
                else if (id.indexOf('Custom') !== -1) {
                    this.updateCustomTab(element);
                }
            }
        }
        if (this.isEdit) {
            /**
             * If any update on edited task do it here
             */
            this.parent.dataOperation.updateWidthLeft(this.rowData);
            var editArgs = {
                data: this.rowData,
                action: 'DialogEditing'
            };
            this.parent.editModule.initiateUpdateAction(editArgs);
        }
        else {
            this.parent.editModule.addRecord(this.addedRecord, this.parent.editSettings.newRowPosition);
        }
        return true;
    };
    DialogEdit.prototype.updateGeneralTab = function (generalForm, isCustom) {
        var ganttObj = this.parent;
        var childNodes = generalForm.childNodes;
        var tasksData = {};
        if (!this.isEdit) {
            tasksData = this.addedRecord;
        }
        for (var i = 0; i < childNodes.length; i++) {
            var div = childNodes[i];
            var inputElement = div.querySelector('input[id^="' + ganttObj.element.id + '"]');
            if (inputElement) {
                var fieldName = inputElement.id.replace(ganttObj.element.id, '');
                var controlObj = div.querySelector('#' + ganttObj.element.id + fieldName).ej2_instances[0];
                tasksData[fieldName] = controlObj.value;
            }
        }
        if (this.isEdit) {
            this.updateScheduleProperties(this.editedRecord, this.rowData);
            ganttObj.editModule.validateUpdateValues(tasksData, this.rowData, true);
        }
    };
    DialogEdit.prototype.updateScheduleProperties = function (fromRecord, toRecord) {
        this.parent.setRecordValue('startDate', fromRecord.ganttProperties.startDate, toRecord.ganttProperties, true);
        this.parent.setRecordValue('endDate', fromRecord.ganttProperties.endDate, toRecord.ganttProperties, true);
        this.parent.setRecordValue('duration', fromRecord.ganttProperties.duration, toRecord.ganttProperties, true);
        this.parent.setRecordValue('durationUnit', fromRecord.ganttProperties.durationUnit, toRecord.ganttProperties, true);
        if (!isNullOrUndefined(this.parent.taskFields.startDate)) {
            this.parent.dataOperation.updateMappingData(this.rowData, this.parent.taskFields.startDate);
        }
        if (!isNullOrUndefined(this.parent.taskFields.endDate)) {
            this.parent.dataOperation.updateMappingData(this.rowData, this.parent.taskFields.endDate);
        }
        if (!isNullOrUndefined(this.parent.taskFields.duration)) {
            this.parent.dataOperation.updateMappingData(this.rowData, this.parent.taskFields.duration);
            this.parent.setRecordValue('durationUnit', fromRecord.ganttProperties.durationUnit, this.rowData, true);
            if (this.rowData.ganttProperties.duration === 0) {
                this.parent.setRecordValue('isMilestone', true, this.rowData.ganttProperties, true);
            }
            else {
                this.parent.setRecordValue('isMilestone', false, this.rowData.ganttProperties, true);
            }
        }
    };
    DialogEdit.prototype.updatePredecessorTab = function (preElement) {
        var gridObj = preElement.ej2_instances[0];
        var dataSource = gridObj.dataSource;
        var predecessorName = [];
        var newValues = [];
        var predecessorString = '';
        var ids = [];
        for (var i = 0; i < dataSource.length; i++) {
            var preData = dataSource[i];
            if (ids.indexOf(preData.id) === -1) {
                var name_1 = preData.id + preData.type;
                if (preData.offset && preData.offset.indexOf('-') !== -1) {
                    name_1 += preData.offset;
                }
                else {
                    name_1 += ('+' + preData.offset);
                }
                predecessorName.push(name_1);
                ids.push(preData.id);
            }
        }
        if (this.isEdit) {
            if (predecessorName.length > 0) {
                newValues = this.parent.predecessorModule.calculatePredecessor(predecessorName.join(','), this.rowData);
                this.parent.setRecordValue('predecessor', newValues, this.rowData.ganttProperties, true);
                predecessorString = this.parent.predecessorModule.getPredecessorStringValue(this.rowData);
            }
            else {
                newValues = [];
                this.parent.setRecordValue('predecessor', newValues, this.rowData.ganttProperties, true);
                predecessorString = '';
            }
            this.parent.setRecordValue('predecessorsName', predecessorString, this.rowData.ganttProperties, true);
            this.parent.setRecordValue('taskData.' + this.parent.taskFields.dependency, predecessorString, this.rowData);
            this.parent.setRecordValue(this.parent.taskFields.dependency, predecessorString, this.rowData);
        }
        else {
            this.addedRecord[this.parent.taskFields.dependency] = predecessorName.length > 0 ? predecessorName.join(',') : '';
        }
    };
    DialogEdit.prototype.updateResourceTab = function (resourceElement) {
        var gridObj = resourceElement.ej2_instances[0];
        var selectedItems = gridObj.selectionModule.getSelectedRecords();
        var idArray = [];
        if (this.isEdit) {
            this.parent.setRecordValue('resourceInfo', selectedItems, this.rowData.ganttProperties, true);
            this.parent.dataOperation.updateMappingData(this.rowData, 'resourceInfo');
        }
        else {
            for (var i = 0; i < selectedItems.length; i++) {
                idArray.push(selectedItems[i][this.parent.resourceIDMapping]);
            }
            this.addedRecord[this.parent.taskFields.resourceInfo] = idArray;
        }
    };
    DialogEdit.prototype.updateNotesTab = function (notesElement) {
        var ganttObj = this.parent;
        var rte = notesElement.ej2_instances[0];
        if (this.isEdit) {
            this.parent.setRecordValue('notes', rte.getHtml(), this.rowData.ganttProperties, true);
            ganttObj.dataOperation.updateMappingData(this.rowData, 'notes');
        }
        else {
            this.addedRecord[this.parent.taskFields.notes] = rte.getHtml();
        }
    };
    DialogEdit.prototype.updateCustomTab = function (customElement) {
        this.updateGeneralTab(customElement, true);
    };
    return DialogEdit;
}());

/**
 * Gantt Edit Module
 */
var Edit$2 = /** @__PURE__ @class */ (function () {
    function Edit$$1(parent) {
        this.isFromDeleteMethod = false;
        this.targetedRecords = [];
        this.confirmDialog = null;
        this.taskbarMoved = false;
        this.predecessorUpdated = false;
        this.isBreakLoop = false;
        /**
         * @private
         */
        this.deletedTaskDetails = [];
        this.parent = parent;
        this.validatedChildItems = [];
        if (this.parent.editSettings.allowEditing && this.parent.editSettings.mode === 'Auto') {
            this.cellEditModule = new CellEdit(this.parent);
        }
        if (this.parent.editSettings.allowAdding || (this.parent.editSettings.allowEditing &&
            (this.parent.editSettings.mode === 'Dialog' || this.parent.editSettings.mode === 'Auto'))) {
            this.dialogModule = new DialogEdit(this.parent);
            if (this.parent.editSettings.mode === 'Dialog') {
                this.parent.treeGrid.recordDoubleClick = this.recordDoubleClick.bind(this);
            }
        }
        if (this.parent.editSettings.allowTaskbarEditing) {
            this.taskbarEditModule = new TaskbarEdit(this.parent);
        }
        if (this.parent.editSettings.allowDeleting) {
            var confirmDialog = createElement('div', {
                id: this.parent.element.id + '_deleteConfirmDialog',
            });
            this.parent.element.appendChild(confirmDialog);
            this.renderDeleteConfirmDialog();
        }
        this.parent.treeGrid.editSettings.allowAdding = this.parent.editSettings.allowAdding;
        this.parent.treeGrid.editSettings.allowDeleting = this.parent.editSettings.allowDeleting;
        this.parent.treeGrid.editSettings.showDeleteConfirmDialog = this.parent.editSettings.showDeleteConfirmDialog;
    }
    Edit$$1.prototype.getModuleName = function () {
        return 'edit';
    };
    Edit$$1.prototype.recordDoubleClick = function (args) {
        var ganttData;
        if (args.row) {
            var rowIndex = getValue('rowIndex', args.row);
            ganttData = this.parent.currentViewData[rowIndex];
        }
        if (!isNullOrUndefined(ganttData)) {
            this.dialogModule.openEditDialog(ganttData);
        }
    };
    /**
     * @private
     */
    Edit$$1.prototype.destroy = function () {
        if (this.cellEditModule) {
            this.cellEditModule.destroy();
        }
        if (this.taskbarEditModule) {
            this.taskbarEditModule.destroy();
        }
        if (this.dialogModule) {
            this.dialogModule.destroy();
        }
        if (this.confirmDialog && !this.confirmDialog.isDestroyed) {
            this.confirmDialog.destroy();
        }
    };
    /**
     * Method to update task with new values
     */
    Edit$$1.prototype.updateRecordByID = function (data) {
        var tasks = this.parent.taskFields;
        var ganttData = this.parent.getRecordByID(data[tasks.id]);
        if (ganttData) {
            this.validateUpdateValues(data, ganttData, true);
            this.parent.dataOperation.updateWidthLeft(ganttData);
            if (!isUndefined(data[this.parent.taskFields.dependency]) &&
                data[this.parent.taskFields.dependency] !== ganttData.ganttProperties.predecessorsName) {
                this.parent.connectorLineEditModule.updatePredecessor(ganttData, data[this.parent.taskFields.dependency]);
            }
        }
    };
    /**
     *
     * @param data
     * @param ganttData
     * @param isFromDialog
     * @private
     */
    Edit$$1.prototype.validateUpdateValues = function (data, ganttData, isFromDialog) {
        var ganttObj = this.parent;
        var tasks = ganttObj.taskFields;
        var ganttPropByMapping = getSwapKey(ganttObj.columnMapping);
        var scheduleFieldNames = [];
        var isScheduleValueUpdated = false;
        for (var _i = 0, _a = Object.keys(data); _i < _a.length; _i++) {
            var key = _a[_i];
            if (isNullOrUndefined(key)) {
                continue;
            }
            if ([tasks.startDate, tasks.endDate, tasks.duration].indexOf(key) !== -1) {
                if (isFromDialog) {
                    if (tasks.duration === key) {
                        ganttObj.dataOperation.updateDurationValue(data[key], ganttData.ganttProperties);
                        ganttObj.dataOperation.updateMappingData(ganttData, ganttPropByMapping[key]);
                    }
                    else {
                        ganttObj.setRecordValue(ganttPropByMapping[key], data[key], ganttData.ganttProperties, true);
                        ganttObj.dataOperation.updateMappingData(ganttData, ganttPropByMapping[key]);
                    }
                }
                else {
                    scheduleFieldNames.push(key);
                    isScheduleValueUpdated = true;
                }
            }
            else if (tasks.resourceInfo === key) {
                var resourceData = ganttObj.dataOperation.setResourceInfo(data);
                ganttData.ganttProperties.resourceInfo = resourceData;
                ganttObj.dataOperation.updateMappingData(ganttData, 'resourceInfo');
            }
            else if (tasks.dependency === key) {
                //..
            }
            else if ([tasks.progress, tasks.notes, tasks.durationUnit, tasks.expandState,
                tasks.milestone, tasks.name, tasks.baselineStartDate,
                tasks.baselineEndDate, tasks.indicators, tasks.id].indexOf(key) !== -1) {
                var column = ganttObj.columnByField[key];
                /* tslint:disable-next-line */
                var value = data[key];
                if (column.editType === EditType.DatePicker || column.editType === EditType.DateTimePicker) {
                    value = ganttObj.dataOperation.getDateFromFormat(value);
                }
                var ganttPropKey = ganttPropByMapping[key];
                if (key === tasks.id) {
                    ganttPropKey = 'taskId';
                }
                else if (key === tasks.name) {
                    ganttPropKey = 'taskName';
                }
                ganttObj.setRecordValue(ganttPropKey, value, ganttData.ganttProperties, true);
                if ((key === tasks.baselineStartDate || key === tasks.baselineEndDate) &&
                    (ganttData.ganttProperties.baselineStartDate && ganttData.ganttProperties.baselineEndDate)) {
                    ganttObj.setRecordValue('baselineLeft', ganttObj.dataOperation.calculateBaselineLeft(ganttData.ganttProperties), ganttData.ganttProperties, true);
                    ganttObj.setRecordValue('baselineWidth', ganttObj.dataOperation.calculateBaselineWidth(ganttData.ganttProperties), ganttData.ganttProperties, true);
                }
                ganttObj.setRecordValue('taskData.' + key, value, ganttData);
                ganttObj.setRecordValue(key, value, ganttData);
            }
            else if (ganttObj.customColumns.indexOf(key) !== -1) {
                var column = ganttObj.columnByField[key];
                /* tslint:disable-next-line */
                var value = data[key];
                if (column.editType === EditType.DatePicker || column.editType === EditType.DateTimePicker) {
                    value = ganttObj.dataOperation.getDateFromFormat(value);
                }
                ganttObj.setRecordValue('taskData.' + key, value, ganttData);
                ganttObj.setRecordValue(key, value, ganttData);
            }
        }
        if (isScheduleValueUpdated) {
            this.validateScheduleValues(scheduleFieldNames, ganttData, data);
        }
    };
    Edit$$1.prototype.validateScheduleValues = function (fieldNames, ganttData, data) {
        var ganttObj = this.parent;
        if (fieldNames.length > 2) {
            ganttObj.dataOperation.calculateScheduledValues(ganttData, data, false);
        }
        else if (fieldNames.length > 1) {
            this.validateScheduleByTwoValues(data, fieldNames, ganttData);
        }
        else {
            this.dialogModule.validateScheduleValuesByCurrentField(fieldNames[0], data[fieldNames[0]], ganttData);
        }
    };
    Edit$$1.prototype.validateScheduleByTwoValues = function (data, fieldNames, ganttData) {
        var ganttObj = this.parent;
        var startDate;
        var endDate;
        var duration;
        var tasks = ganttObj.taskFields;
        var ganttProp = ganttData.ganttProperties;
        var isUnscheduledTask = ganttObj.allowUnscheduledTasks;
        if (fieldNames.indexOf(tasks.startDate)) {
            startDate = data[tasks.startDate];
        }
        if (fieldNames.indexOf(tasks.endDate)) {
            endDate = data[tasks.endDate];
        }
        if (fieldNames.indexOf(tasks.duration)) {
            duration = data[tasks.duration];
        }
        if (startDate && endDate || (isUnscheduledTask && fieldNames.indexOf(tasks.startDate) &&
            fieldNames.indexOf(tasks.endDate))) {
            ganttObj.setRecordValue('startDate', ganttObj.dataOperation.getDateFromFormat(startDate), ganttProp, true);
            ganttObj.setRecordValue('endDate', ganttObj.dataOperation.getDateFromFormat(endDate), ganttProp, true);
            ganttObj.dataOperation.calculateDuration(ganttData);
        }
        else if (endDate && duration || (isUnscheduledTask &&
            fieldNames.indexOf(tasks.endDate) && fieldNames.indexOf(tasks.duration))) {
            ganttObj.setRecordValue('endDate', ganttObj.dataOperation.getDateFromFormat(endDate), ganttProp, true);
            ganttObj.dataOperation.updateDurationValue(duration, ganttProp);
        }
        else if (startDate && duration || (isUnscheduledTask && fieldNames.indexOf(tasks.startDate)
            && fieldNames.indexOf(tasks.duration))) {
            ganttObj.setRecordValue('startDate', ganttObj.dataOperation.getDateFromFormat(startDate), ganttProp, true);
            ganttObj.dataOperation.updateDurationValue(duration, ganttProp);
        }
    };
    Edit$$1.prototype.isTaskbarMoved = function (data) {
        var isMoved = false;
        var taskData = data.ganttProperties;
        var prevData = this.parent.previousRecords[data.uniqueID];
        if (prevData.ganttProperties) {
            var prevStart = getValue('ganttProperties.startDate', prevData);
            var prevEnd = getValue('ganttProperties.endDate', prevData);
            var prevDuration = getValue('ganttProperties.duration', prevData);
            var prevDurationUnit = getValue('ganttProperties.durationUnit', prevData);
            var keys = Object.keys(prevData.ganttProperties);
            if (keys.indexOf('startDate') !== -1 || keys.indexOf('endDate') !== -1 ||
                keys.indexOf('duration') !== -1 || keys.indexOf('durationUnit') !== -1) {
                if ((isNullOrUndefined(prevStart) && !isNullOrUndefined(taskData.startDate)) ||
                    (isNullOrUndefined(prevEnd) && !isNullOrUndefined(taskData.endDate)) ||
                    (isNullOrUndefined(taskData.startDate) && !isNullOrUndefined(prevStart)) ||
                    (isNullOrUndefined(taskData.endDate) && !isNullOrUndefined(prevEnd)) ||
                    (prevStart && prevStart.getTime() !== taskData.startDate.getTime())
                    || (prevEnd && prevEnd.getTime() !== taskData.endDate.getTime())
                    || (!isNullOrUndefined(prevDuration) && prevDuration !== taskData.duration)
                    || (!isNullOrUndefined(prevDuration) && prevDuration === taskData.duration &&
                        prevDurationUnit !== taskData.durationUnit)) {
                    isMoved = true;
                }
            }
        }
        return isMoved;
    };
    Edit$$1.prototype.isPredecessorUpdated = function (data) {
        var isPredecessorUpdated = false;
        var prevData = this.parent.previousRecords[data.uniqueID];
        if (prevData && prevData.ganttProperties && prevData.ganttProperties.hasOwnProperty('predecessor')) {
            if (data.ganttProperties.predecessorsName !== prevData.ganttProperties.predecessorsName) {
                isPredecessorUpdated = true;
            }
            else {
                this.parent.setRecordValue('predecessor', prevData.ganttProperties.predecessor, data.ganttProperties, true);
            }
        }
        return isPredecessorUpdated;
    };
    /**
     * Method to check need to open predecessor validate dialog
     * @param data
     */
    Edit$$1.prototype.isCheckPredecessor = function (data) {
        var isValidatePredecessor = false;
        var prevData = this.parent.previousRecords[data.uniqueID];
        if (prevData && this.parent.taskFields.dependency && this.parent.enablePredecessorValidation &&
            this.parent.predecessorModule.getValidPredecessor(data).length > 0) {
            if (this.isTaskbarMoved(data)) {
                isValidatePredecessor = true;
            }
        }
        return isValidatePredecessor;
    };
    /**
     * Method to update all dependent record on edit action
     * @param args
     * @private
     */
    Edit$$1.prototype.initiateUpdateAction = function (args) {
        var isValidatePredecessor = this.isCheckPredecessor(args.data);
        this.taskbarMoved = this.isTaskbarMoved(args.data);
        this.predecessorUpdated = this.isPredecessorUpdated(args.data);
        if (this.predecessorUpdated) {
            this.parent.isConnectorLineUpdate = true;
            this.parent.predecessorModule.addRemovePredecessor(args.data);
        }
        var validateObject = {};
        if (isValidatePredecessor) {
            validateObject = this.parent.predecessorModule.validateTypes(args.data);
            this.parent.isConnectorLineUpdate = true;
            if (!isNullOrUndefined(getValue('violationType', validateObject))) {
                var newArgs = this.validateTaskEvent(args);
                if (newArgs.validateMode.preserveLinkWithEditing === false &&
                    newArgs.validateMode.removeLink === false &&
                    newArgs.validateMode.respectLink === false) {
                    this.parent.predecessorModule.openValidationDialog(validateObject);
                }
                else {
                    this.parent.predecessorModule.applyPredecessorOption();
                }
            }
            else {
                this.updateEditedTask(args);
            }
        }
        else {
            if (this.taskbarMoved) {
                this.parent.isConnectorLineUpdate = true;
            }
            this.updateEditedTask(args);
        }
    };
    /**
     *
     * @param data method to trigger validate predecessor link by dialog
     */
    Edit$$1.prototype.validateTaskEvent = function (editedEventArgs) {
        var newArgs = {};
        this.resetValidateArgs();
        this.parent.currentEditedArgs = newArgs;
        newArgs.cancel = false;
        newArgs.data = editedEventArgs.data;
        newArgs.requestType = 'validateLinkedTask';
        newArgs.validateMode = this.parent.dialogValidateMode;
        newArgs.editEventArgs = editedEventArgs;
        this.parent.actionBeginTask(newArgs);
        return newArgs;
    };
    Edit$$1.prototype.resetValidateArgs = function () {
        this.parent.dialogValidateMode.preserveLinkWithEditing = true;
        this.parent.dialogValidateMode.removeLink = false;
        this.parent.dialogValidateMode.respectLink = false;
    };
    /**
     *
     * @param args - Edited event args like taskbar editing, dialog editing, cell editing
     * @private
     */
    Edit$$1.prototype.updateEditedTask = function (args) {
        var ganttRecord = args.data;
        /** Update parent up-to zeroth level */
        if (ganttRecord.parentItem) {
            this.parent.dataOperation.updateParentItems(ganttRecord.parentItem);
        }
        this.updateParentChildRecord(ganttRecord);
        if (this.parent.isConnectorLineUpdate) {
            /* validating predecessor for updated child items */
            for (var i = 0; i < this.validatedChildItems.length; i++) {
                var child = this.validatedChildItems[i];
                if (child.ganttProperties.predecessor && child.ganttProperties.predecessor.length > 0) {
                    this.parent.editedTaskBarItem = child;
                    this.parent.predecessorModule.validatePredecessor(child, [], '');
                }
            }
            /** validating predecessor for current edited records */
            if (ganttRecord.ganttProperties.predecessor) {
                this.parent.isMileStoneEdited = ganttRecord.ganttProperties.isMilestone;
                if (this.taskbarMoved) {
                    this.parent.editedTaskBarItem = ganttRecord;
                }
                this.parent.predecessorModule.validatePredecessor(ganttRecord, [], '');
            }
        }
        this.initiateSaveAction(args);
    };
    /**
     * To update parent records while perform drag action.
     * @return {void}
     * @private
     */
    Edit$$1.prototype.updateParentChildRecord = function (data) {
        var ganttRecord = data;
        if (ganttRecord.hasChildRecords) {
            this.updateChildItems(ganttRecord);
        }
    };
    /**
     *
     * @param data
     * @param newStartDate
     */
    Edit$$1.prototype.calculateDateByRoundOffDuration = function (data, newStartDate) {
        var ganttRecord = data;
        var taskData = ganttRecord.ganttProperties;
        var projectStartDate = new Date(newStartDate.getTime());
        if (!isNullOrUndefined(taskData.endDate) && isNullOrUndefined(taskData.startDate)) {
            var endDate = this.parent.dateValidationModule.checkStartDate(projectStartDate, taskData, null);
            this.parent.setRecordValue('endDate', this.parent.dateValidationModule.checkEndDate(endDate, ganttRecord.ganttProperties), taskData, true);
        }
        else {
            this.parent.setRecordValue('startDate', this.parent.dateValidationModule.checkStartDate(projectStartDate, taskData), taskData, true);
            if (!isNullOrUndefined(taskData.duration)) {
                this.parent.dateValidationModule.calculateEndDate(ganttRecord);
            }
        }
        this.parent.dataOperation.updateWidthLeft(data);
        this.parent.dataOperation.updateTaskData(ganttRecord);
    };
    /**
     * To update progress value of parent tasks
     * @param cloneParent
     * @private
     */
    Edit$$1.prototype.updateParentProgress = function (cloneParent) {
        var parentProgress = 0;
        var parent = this.parent.getParentTask(cloneParent);
        var childRecords = parent.childRecords;
        var childCount = childRecords ? childRecords.length : 0;
        var totalProgress = 0;
        var milesStoneCount = 0;
        var taskCount = 0;
        var totalDuration = 0;
        var progressValues = {};
        if (childRecords) {
            for (var i = 0; i < childCount; i++) {
                if ((!childRecords[i].ganttProperties.isMilestone || childRecords[i].hasChildRecords) &&
                    isScheduledTask(childRecords[i].ganttProperties)) {
                    progressValues = this.parent.dataOperation.getParentProgress(childRecords[i]);
                    totalProgress += getValue('totalProgress', progressValues);
                    totalDuration += getValue('totalDuration', progressValues);
                }
                else {
                    milesStoneCount += 1;
                }
            }
            taskCount = childCount - milesStoneCount;
            parentProgress = taskCount > 0 ? Math.round(totalProgress / totalDuration) : 0;
            if (isNaN(parentProgress)) {
                parentProgress = 0;
            }
            this.parent.setRecordValue('progressWidth', this.parent.dataOperation.getProgressWidth(parent.ganttProperties.width, parentProgress), parent.ganttProperties, true);
            this.parent.setRecordValue('progress', Math.floor(parentProgress), parent.ganttProperties, true);
            this.parent.setRecordValue('totalProgress', totalProgress, parent.ganttProperties, true);
            this.parent.setRecordValue('totalDuration', totalDuration, parent.ganttProperties, true);
        }
        this.parent.dataOperation.updateTaskData(parent);
        if (parent.parentItem) {
            this.updateParentProgress(parent.parentItem);
        }
    };
    /**
     * Method to revert cell edit action
     * @param args
     * @private
     */
    Edit$$1.prototype.revertCellEdit = function (args) {
        this.parent.editModule.reUpdatePreviousRecords(false, true);
        this.resetEditProperties();
    };
    /**
     *
     * @return {void}
     * @private
     */
    Edit$$1.prototype.reUpdatePreviousRecords = function (isRefreshChart, isRefreshGrid) {
        var collection = this.parent.previousRecords;
        var keys = Object.keys(collection);
        for (var i = 0; i < keys.length; i++) {
            var uniqueId = keys[i];
            var prevTask = collection[uniqueId];
            var originalData = this.parent.getTaskByUniqueID(uniqueId);
            this.copyTaskData(originalData.taskData, prevTask.taskData);
            delete prevTask.taskData;
            this.copyTaskData(originalData.ganttProperties, prevTask.ganttProperties);
            delete prevTask.ganttProperties;
            this.copyTaskData(originalData, prevTask);
            var rowIndex = this.parent.currentViewData.indexOf(originalData);
            if (isRefreshChart) {
                this.parent.chartRowsModule.refreshRow(rowIndex);
            }
            if (isRefreshGrid) {
                this.parent.treeGrid.grid.setRowData(originalData.ganttProperties.taskId, originalData);
                var row = this.parent.treeGrid.grid.getRowObjectFromUID(this.parent.treeGrid.grid.getDataRows()[rowIndex].getAttribute('data-uid'));
                row.data = originalData;
            }
        }
    };
    /**
     * Copy previous task data value to edited task data
     * @param existing
     * @param newValue
     */
    Edit$$1.prototype.copyTaskData = function (existing, newValue) {
        if (!isNullOrUndefined(newValue)) {
            extend(existing, newValue);
        }
    };
    /**
     * To update schedule date on editing.
     * @return {void}
     * @private
     */
    Edit$$1.prototype.updateScheduleDatesOnEditing = function (args) {
        //..
    };
    /**
     *
     * @param ganttRecord
     */
    Edit$$1.prototype.updateChildItems = function (ganttRecord) {
        var previousData = this.parent.previousRecords[ganttRecord.uniqueID];
        var previousStartDate;
        if (isNullOrUndefined(previousData) ||
            (isNullOrUndefined(previousData) && !isNullOrUndefined(previousData.ganttProperties))) {
            previousStartDate = new Date(ganttRecord.ganttProperties.startDate.getTime());
        }
        else {
            previousStartDate = new Date(previousData.ganttProperties.startDate.getTime());
        }
        var currentStartDate = ganttRecord.ganttProperties.startDate;
        var childRecords = [];
        var validStartDate;
        var validEndDate;
        var calcEndDate;
        var isRightMove;
        var durationDiff;
        this.getUpdatableChildRecords(ganttRecord, childRecords);
        if (childRecords.length === 0) {
            return;
        }
        if (previousStartDate.getTime() > currentStartDate.getTime()) {
            validStartDate = this.parent.dateValidationModule.checkStartDate(currentStartDate);
            validEndDate = this.parent.dateValidationModule.checkEndDate(previousStartDate, ganttRecord.ganttProperties);
            isRightMove = false;
        }
        else {
            validStartDate = this.parent.dateValidationModule.checkStartDate(previousStartDate);
            validEndDate = this.parent.dateValidationModule.checkEndDate(currentStartDate, ganttRecord.ganttProperties);
            isRightMove = true;
        }
        //Get Duration
        if (validStartDate.getTime() >= validEndDate.getTime()) {
            durationDiff = 0;
        }
        else {
            durationDiff = this.parent.dateValidationModule.getDuration(validStartDate, validEndDate, 'minute', true);
        }
        for (var i = 0; i < childRecords.length; i++) {
            if (childRecords[i].ganttProperties.isAutoSchedule) {
                if (durationDiff > 0) {
                    var startDate = isScheduledTask(childRecords[i].ganttProperties) ?
                        childRecords[i].ganttProperties.startDate : childRecords[i].ganttProperties.startDate ?
                        childRecords[i].ganttProperties.startDate : childRecords[i].ganttProperties.endDate ?
                        childRecords[i].ganttProperties.endDate : new Date(previousStartDate.toString());
                    if (isRightMove) {
                        calcEndDate = this.parent.dateValidationModule.getEndDate(this.parent.dateValidationModule.checkStartDate(startDate, childRecords[i].ganttProperties, childRecords[i].ganttProperties.isMilestone), durationDiff, 'minute', childRecords[i].ganttProperties, false);
                    }
                    else {
                        calcEndDate = this.parent.dateValidationModule.getStartDate(this.parent.dateValidationModule.checkEndDate(startDate, childRecords[i].ganttProperties), durationDiff, 'minute', childRecords[i].ganttProperties);
                    }
                    this.calculateDateByRoundOffDuration(childRecords[i], calcEndDate);
                    if (this.parent.isOnEdit && this.validatedChildItems.indexOf(childRecords[i]) === -1) {
                        this.validatedChildItems.push(childRecords[i]);
                    }
                }
                else if (isNullOrUndefined(previousData)) {
                    calcEndDate = previousStartDate;
                    this.calculateDateByRoundOffDuration(childRecords[i], calcEndDate);
                    if (this.parent.isOnEdit && this.validatedChildItems.indexOf(childRecords[i]) === -1) {
                        this.validatedChildItems.push(childRecords[i]);
                    }
                }
            }
        }
    };
    /**
     * To get updated child records.
     * @param parentRecord
     * @param childLists
     */
    Edit$$1.prototype.getUpdatableChildRecords = function (parentRecord, childLists) {
        var childRecords = parentRecord.childRecords;
        for (var i = 0; i < childRecords.length; i++) {
            if (childRecords[i].ganttProperties.isAutoSchedule) {
                childLists.push(childRecords[i]);
                if (childRecords[i].hasChildRecords) {
                    this.getUpdatableChildRecords(childRecords[i], childLists);
                }
            }
        }
    };
    Edit$$1.prototype.initiateSaveAction = function (args) {
        var _this = this;
        this.parent.showSpinner();
        var eventArgs = {};
        eventArgs.requestType = 'beforeSave';
        eventArgs.data = args.data;
        eventArgs.modifiedRecords = this.parent.editedRecords;
        eventArgs.modifiedTaskData = getTaskData(this.parent.editedRecords);
        this.parent.trigger('actionBegin', eventArgs);
        if (eventArgs.cancel) {
            this.reUpdatePreviousRecords();
            this.parent.chartRowsModule.refreshRecords([args.data]);
            this.resetEditProperties();
            // Trigger action complete event with save canceled request type
        }
        else {
            if (isRemoteData(this.parent.dataSource)) {
                var data = this.parent.dataSource;
                var updatedData = {
                    changedRecords: eventArgs.modifiedTaskData
                };
                var crud = data.saveChanges(updatedData, null, null, new Query());
                crud.then(function (e) { return _this.dmSuccess(e, args); })
                    .catch(function (e) { return _this.dmFailure(e, args); });
            }
            else {
                this.saveSuccess(args);
            }
        }
    };
    Edit$$1.prototype.dmSuccess = function (e, args) {
        this.saveSuccess(args);
    };
    Edit$$1.prototype.dmFailure = function (e, args) {
        if (this.deletedTaskDetails.length) {
            var deleteRecords = this.deletedTaskDetails;
            for (var d = 0; d < deleteRecords.length; d++) {
                deleteRecords[d].isDelete = false;
            }
            this.deletedTaskDetails = [];
        }
        this.reUpdatePreviousRecords(true, true);
        this.resetEditProperties();
        this.parent.trigger('actionFailure', { error: e });
    };
    /**
     * Method for save action success for local and remote data
     */
    Edit$$1.prototype.saveSuccess = function (args) {
        var eventArgs = {};
        if (this.parent.timelineSettings.updateTimescaleView) {
            var tempArray = this.parent.editedRecords;
            this.parent.timelineModule.updateTimeLineOnEditing(tempArray, args.action);
        }
        this.parent.chartRowsModule.refreshRecords(this.parent.editedRecords);
        if (this.parent.isConnectorLineUpdate) {
            this.parent.updatedConnectorLineCollection = [];
            this.parent.connectorLineIds = [];
            this.parent.connectorLineEditModule.refreshEditedRecordConnectorLine(this.parent.editedRecords);
            this.updateScheduleDatesOnEditing(args);
        }
        eventArgs.requestType = 'save';
        eventArgs.modifiedRecords = this.parent.editedRecords;
        eventArgs.modifiedTaskData = getTaskData(this.parent.editedRecords);
        setValue('action', args.action, eventArgs);
        this.endEditAction(args);
        this.parent.trigger('actionComplete', eventArgs);
    };
    Edit$$1.prototype.resetEditProperties = function () {
        this.parent.currentEditedArgs = {};
        this.resetValidateArgs();
        this.parent.editedTaskBarItem = null;
        this.parent.isOnEdit = false;
        this.validatedChildItems = [];
        this.parent.isConnectorLineUpdate = false;
        this.parent.editedTaskBarItem = null;
        this.taskbarMoved = false;
        this.predecessorUpdated = false;
        if (!isNullOrUndefined(this.dialogModule)) {
            this.dialogModule.dialogClose();
        }
        this.parent.hideSpinner();
        this.parent.initiateEditAction(false);
    };
    Edit$$1.prototype.endEditAction = function (args) {
        this.resetEditProperties();
        if (args.action === 'TaskbarEditing') {
            this.parent.trigger('taskbarEdited', args);
        }
        else if (args.action === 'CellEditing') {
            this.parent.trigger('endEdit', args);
        }
        else if (args.action === 'DialogEditing') {
            this.dialogModule.dialogClose();
        }
    };
    Edit$$1.prototype.saveFailed = function (args) {
        this.reUpdatePreviousRecords();
        this.parent.hideSpinner();
        //action failure event trigger
    };
    /**
     * To render delete confirmation dialog
     * @return {void}
     */
    Edit$$1.prototype.renderDeleteConfirmDialog = function () {
        var dialogObj = new Dialog({
            width: '320px',
            isModal: true,
            visible: false,
            content: this.parent.localeObj.getConstant('confirmDelete'),
            buttons: [
                {
                    click: this.confirmDeleteOkButton.bind(this),
                    buttonModel: { content: this.parent.localeObj.getConstant('okText'), isPrimary: true }
                },
                {
                    click: this.closeConfirmDialog.bind(this),
                    buttonModel: { content: this.parent.localeObj.getConstant('cancel') }
                }
            ],
            target: this.parent.element,
            animationSettings: { effect: 'None' },
        });
        dialogObj.appendTo('#' + this.parent.element.id + '_deleteConfirmDialog');
        this.confirmDialog = dialogObj;
    };
    Edit$$1.prototype.closeConfirmDialog = function () {
        this.confirmDialog.hide();
    };
    Edit$$1.prototype.confirmDeleteOkButton = function () {
        this.deleteSelectedItems();
        this.confirmDialog.hide();
    };
    /**
     * @private
     */
    Edit$$1.prototype.startDeleteAction = function () {
        if (this.parent.editSettings.allowDeleting) {
            if (this.parent.editSettings.showDeleteConfirmDialog) {
                this.confirmDialog.show();
            }
            else {
                this.deleteSelectedItems();
            }
        }
    };
    Edit$$1.prototype.deleteSelectedItems = function () {
        if (!this.isFromDeleteMethod) {
            var selectedRecords = [];
            if (this.parent.selectionSettings.mode === 'Row') {
                selectedRecords = this.parent.selectionModule.getSelectedRecords();
            }
            else if (this.parent.selectionSettings.mode === 'Cell') {
                selectedRecords = this.parent.selectionModule.getCellSelectedRecords();
            }
            this.deleteRow(selectedRecords);
        }
        else {
            if (this.targetedRecords.length) {
                this.deleteRow(this.targetedRecords);
            }
            this.isFromDeleteMethod = false;
        }
    };
    /**
     * Public method for deleting a record
     * @param taskDetail
     * @private
     */
    Edit$$1.prototype.deleteRecord = function (taskDetail) {
        this.isFromDeleteMethod = true;
        var variableType = typeof (taskDetail);
        this.targetedRecords = [];
        switch (variableType) {
            case 'number':
            case 'string':
                var taskId = taskDetail.toString();
                if (!isNullOrUndefined(taskId) && this.parent.ids.indexOf(taskId) !== -1) {
                    this.targetedRecords.push(this.parent.getRecordByID(taskId));
                }
                break;
            case 'object':
                if (!Array.isArray(taskDetail)) {
                    this.targetedRecords.push(taskDetail.valueOf());
                }
                else {
                    this.updateTargetedRecords(taskDetail);
                }
                break;
            default:
        }
        this.startDeleteAction();
    };
    /**
     * To update 'targetedRecords collection' from given array collection
     * @param taskDetailArray
     */
    Edit$$1.prototype.updateTargetedRecords = function (taskDetailArray) {
        if (taskDetailArray.length) {
            var variableType = typeof (taskDetailArray[0]);
            if (variableType === 'object') {
                this.targetedRecords = taskDetailArray;
            }
            else {
                // Get record from array of task ids
                for (var i = 0; i < taskDetailArray.length; i++) {
                    var taskId = taskDetailArray[i].toString();
                    if (!isNullOrUndefined(taskId) && this.parent.ids.indexOf(taskId) !== -1) {
                        this.targetedRecords.push(this.parent.getRecordByID(taskId));
                    }
                }
            }
        }
    };
    Edit$$1.prototype.deleteRow = function (tasks) {
        var flatData = this.parent.flatData;
        var rowItems = tasks && tasks.length ? tasks :
            this.parent.selectionModule.getSelectedRecords();
        if (rowItems.length) {
            this.parent.isOnDelete = true;
            for (var i = 0; i < rowItems.length; i++) {
                var deleteRecord = rowItems[i];
                if (this.deletedTaskDetails.indexOf(deleteRecord) !== -1) {
                    continue;
                }
                deleteRecord.isDelete = true;
                if (deleteRecord.parentItem) {
                    var childLength = this.parent.getParentTask(deleteRecord.parentItem).childRecords.length;
                    if (childLength > 1) {
                        this.parent.dataOperation.updateParentItems(deleteRecord.parentItem);
                    }
                }
                var predecessor = deleteRecord.ganttProperties.predecessor;
                if (predecessor && predecessor.length) {
                    this.removePredecessorOnDelete(deleteRecord);
                }
                this.deletedTaskDetails.push(deleteRecord);
                if (deleteRecord.hasChildRecords) {
                    this.deleteChildRecords(deleteRecord);
                }
            }
            // clear selection
            this.parent.selectionModule.clearSelection();
            var delereArgs = {};
            delereArgs.deletedRecordCollection = this.deletedTaskDetails;
            delereArgs.updatedRecordCollection = this.parent.editedRecords;
            delereArgs.cancel = false;
            delereArgs.action = 'delete';
            this.initiateDeleteAction(delereArgs);
            this.parent.isOnDelete = false;
        }
        if (this.parent.toolbarModule) {
            this.parent.toolbarModule.refreshToolbarItems();
        }
    };
    Edit$$1.prototype.removePredecessorOnDelete = function (record) {
        var predecessors = record.ganttProperties.predecessor;
        for (var i = 0; i < predecessors.length; i++) {
            var predecessor = predecessors[i];
            if (predecessor.from.toString() === record.ganttProperties.taskId.toString()) {
                var toRecord = this.parent.getRecordByID(predecessor.to.toString());
                var toRecordPredcessor = extend([], [], toRecord.ganttProperties.predecessor, true);
                var index = void 0;
                for (var t = 0; t < toRecordPredcessor.length; t++) {
                    if (toRecordPredcessor[t].to.toString() === toRecord.ganttProperties.taskId.toString()
                        && toRecordPredcessor[t].from.toString() === record.ganttProperties.taskId.toString()) {
                        index = t;
                        break;
                    }
                }
                toRecordPredcessor.splice(index, 1);
                this.updatePredecessorValues(toRecord, toRecordPredcessor);
            }
            else if (predecessor.to.toString() === record.ganttProperties.taskId.toString()) {
                var fromRecord = this.parent.getRecordByID(predecessor.from.toString());
                var fromRecordPredcessor = extend([], [], fromRecord.ganttProperties.predecessor, true);
                var index = void 0;
                for (var t = 0; t < fromRecordPredcessor.length; t++) {
                    if (fromRecordPredcessor[t].from.toString() === fromRecord.ganttProperties.taskId.toString()
                        && fromRecordPredcessor[t].to.toString() === record.ganttProperties.taskId.toString()) {
                        index = t;
                        break;
                    }
                }
                fromRecordPredcessor.splice(index, 1);
                this.updatePredecessorValues(fromRecord, fromRecordPredcessor);
            }
        }
    };
    Edit$$1.prototype.updatePredecessorValues = function (record, predcessorArray) {
        this.parent.setRecordValue('predecessor', predcessorArray, record.ganttProperties, true);
        var predecessorString = this.parent.predecessorModule.getPredecessorStringValue(record);
        this.parent.setRecordValue('predecessorsName', predecessorString, record.ganttProperties, true);
        this.parent.setRecordValue('taskData.' + this.parent.taskFields.dependency, predecessorString, record);
        this.parent.setRecordValue(this.parent.taskFields.dependency, predecessorString, record);
    };
    Edit$$1.prototype.deleteChildRecords = function (record) {
        var childRecords = record.childRecords;
        for (var c = 0; c < childRecords.length; c++) {
            var childRecord = childRecords[c];
            if (this.deletedTaskDetails.indexOf(childRecord) !== -1) {
                continue;
            }
            var predecessor = childRecord.ganttProperties.predecessor;
            if (predecessor && predecessor.length) {
                this.removePredecessorOnDelete(childRecord);
            }
            this.deletedTaskDetails.push(childRecord);
            if (childRecord.hasChildRecords) {
                this.deleteChildRecords(childRecord);
            }
        }
    };
    Edit$$1.prototype.removeFromDataSource = function (record) {
        var dataSource = this.parent.dataSource;
        this.removeData(dataSource, record);
        this.isBreakLoop = false;
    };
    Edit$$1.prototype.removeData = function (dataCollection, record) {
        for (var i = 0; i < dataCollection.length; i++) {
            if (this.isBreakLoop) {
                break;
            }
            if (getValue(this.parent.taskFields.id, dataCollection[i]).toString() === record.ganttProperties.taskId.toString()) {
                dataCollection.splice(i, 1);
                this.isBreakLoop = true;
                break;
            }
            else if (dataCollection[i][this.parent.taskFields.child]) {
                var childRecords = dataCollection[i][this.parent.taskFields.child];
                this.removeData(childRecords, record);
            }
        }
    };
    Edit$$1.prototype.initiateDeleteAction = function (args) {
        var _this = this;
        this.parent.showSpinner();
        var eventArgs = {};
        eventArgs.requestType = 'beforeDelete';
        eventArgs.data = args.deletedRecordCollection;
        eventArgs.modifiedRecords = args.updatedRecordCollection;
        eventArgs.modifiedTaskData = getTaskData(args.updatedRecordCollection);
        this.parent.trigger('actionBegin', eventArgs);
        if (eventArgs.cancel) {
            var deleteRecords = this.deletedTaskDetails;
            for (var d = 0; d < deleteRecords.length; d++) {
                deleteRecords[d].isDelete = false;
            }
            this.deletedTaskDetails = [];
            this.reUpdatePreviousRecords();
            this.parent.initiateEditAction(false);
            this.parent.hideSpinner();
        }
        else {
            if (isRemoteData(this.parent.dataSource)) {
                var data = this.parent.dataSource;
                var updatedData = {
                    deletedRecords: eventArgs.data,
                    changedRecords: eventArgs.modifiedTaskData
                };
                var crud = data.saveChanges(updatedData);
                crud.then(function (e) { return _this.deleteSuccess(args); })
                    .catch(function (e) { return _this.dmFailure(e, args); });
            }
            else {
                this.deleteSuccess(args);
            }
        }
    };
    Edit$$1.prototype.deleteSuccess = function (args) {
        var flatData = this.parent.flatData;
        var currentData = this.parent.currentViewData;
        var deletedRecords = args.deletedRecordCollection;
        for (var i = 0; i < deletedRecords.length; i++) {
            var deleteRecord = deletedRecords[i];
            var currentIndex = currentData.indexOf(deleteRecord);
            var flatIndex = flatData.indexOf(deleteRecord);
            var childIndex = void 0;
            if (currentIndex !== -1) {
                currentData.splice(currentIndex, 1);
            }
            if (flatIndex !== -1) {
                flatData.splice(flatIndex, 1);
            }
            this.removeFromDataSource(deleteRecord);
            if (flatIndex !== -1) {
                this.parent.ids.splice(flatIndex, 1);
            }
            if (deleteRecord.parentItem) {
                var parentItem = this.parent.getParentTask(deleteRecord.parentItem);
                if (parentItem) {
                    var childRecords = parentItem.childRecords;
                    childIndex = childRecords.indexOf(deleteRecord);
                    if (childIndex !== -1) {
                        childRecords.splice(childIndex, 1);
                    }
                    if (!childRecords.length) {
                        parentItem.hasChildRecords = false;
                    }
                }
            }
        }
        var eventArgs = {};
        this.parent.updatedConnectorLineCollection = [];
        this.parent.connectorLineIds = [];
        this.parent.predecessorModule.createConnectorLinesCollection(this.parent.flatData);
        // this.parent.connectorLineEditModule.refreshEditedRecordConnectorLine(flatData);
        this.parent.treeGrid.refresh();
        // Trigger actioncomplete event for delete action
        eventArgs.requestType = 'delete';
        eventArgs.data = args.deletedRecordCollection;
        eventArgs.modifiedRecords = args.updatedRecordCollection;
        eventArgs.modifiedTaskData = getTaskData(args.updatedRecordCollection);
        setValue('action', args.action, eventArgs);
        this.parent.trigger('actionComplete', eventArgs);
        this.deletedTaskDetails = [];
        this.parent.initiateEditAction(false);
        this.parent.hideSpinner();
    };
    /**
     *
     * @return {number | string}
     * @private
     */
    Edit$$1.prototype.getNewTaskId = function () {
        var maxId = DataUtil.aggregates.max(this.parent.flatData, this.parent.taskFields.id);
        if (!isNullOrUndefined(maxId)) {
            return parseInt(maxId.toString(), 10) + 1;
        }
        else {
            return 1;
        }
    };
    /**
     *
     * @return {void}
     * @private
     */
    Edit$$1.prototype.prepareNewlyAddedData = function (obj, rowPosition) {
        var taskModel = this.parent.taskFields;
        var id;
        var ids = this.parent.ids;
        /*Validate Task Id of data*/
        if (obj[taskModel.id]) {
            if (ids.indexOf(obj[taskModel.id].toString()) !== -1) {
                obj[taskModel.id] = null;
            }
            else {
                obj[taskModel.id] = isNullOrUndefined(obj[taskModel.id]) ? null : parseInt(obj[taskModel.id], 10);
            }
        }
        if (!obj[taskModel.id]) {
            id = this.getNewTaskId();
            obj[taskModel.id] = id;
        }
        if (taskModel.name && !obj[taskModel.name]) {
            obj[taskModel.name] = 'newTaskName' + ' ' + obj[taskModel.id];
        }
        if (!this.parent.allowUnscheduledTasks && !obj[taskModel.startDate]) {
            obj[taskModel.startDate] = this.parent.projectStartDate;
        }
        if (!this.parent.allowUnscheduledTasks && taskModel.duration && isNullOrUndefined(obj[taskModel.duration])) {
            if (!obj[taskModel.endDate]) {
                obj[taskModel.duration] = '5';
            }
        }
        if (taskModel.progress) {
            obj[taskModel.progress] = obj[taskModel.progress] ? (obj[taskModel.progress] > 100 ? 100 : obj[taskModel.progress]) : 0;
        }
        if (!this.parent.allowUnscheduledTasks && !obj[taskModel.endDate] && taskModel.endDate) {
            if (!obj[taskModel.duration]) {
                var startDate = this.parent.dataOperation.getDateFromFormat(this.parent.projectStartDate);
                startDate.setDate(startDate.getDate() + 4);
                obj[taskModel.endDate] = this.parent.getFormatedDate(startDate, this.parent.dateFormat);
            }
        }
    };
    /**
     *
     * @return {IGanttData}
     * @private
     */
    Edit$$1.prototype.updateNewlyAddedDataBeforeAjax = function (obj, level, rowPosition, parentItem) {
        var cAddedRecord;
        cAddedRecord = this.parent.dataOperation.createRecord(obj, level);
        cAddedRecord.index = parseInt(cAddedRecord.ganttProperties.taskId.toString(), 10) - 1;
        if (!isNullOrUndefined(parentItem)) {
            this.parent.setRecordValue('parentItem', this.parent.dataOperation.getCloneParent(parentItem), cAddedRecord);
            var pIndex = cAddedRecord.parentItem ? cAddedRecord.parentItem.index : null;
            this.parent.setRecordValue('parentIndex', pIndex, cAddedRecord);
        }
        this.backUpAndPushNewlyAddedRecord(cAddedRecord, rowPosition, parentItem);
        // need to push in dataSource also.
        this.parent.isOnEdit = true;
        if (this.parent.taskFields.dependency && cAddedRecord.ganttProperties.predecessorsName) {
            this.parent.predecessorModule.ensurePredecessorCollectionHelper(cAddedRecord, cAddedRecord.ganttProperties);
            this.parent.predecessorModule.updatePredecessorHelper(cAddedRecord);
            this.parent.predecessorModule.validatePredecessorDates(cAddedRecord);
        }
        else {
            if (cAddedRecord.parentItem && this.parent.getParentTask(cAddedRecord.parentItem).ganttProperties.isAutoSchedule) {
                this.parent.dataOperation.updateParentItems(cAddedRecord.parentItem);
            }
        }
        return cAddedRecord;
    };
    /**
     *
     * @return {number}
     * @private
     */
    Edit$$1.prototype.getChildCount = function (record, count) {
        var currentRecord;
        if (!record.hasChildRecords) {
            return 0;
        }
        for (var i = 0; i < record.childRecords.length; i++) {
            currentRecord = record.childRecords[i];
            count++;
            if (currentRecord.hasChildRecords) {
                count = this.getChildCount(currentRecord, count);
            }
        }
        return count;
    };
    /**
     *
     * @return {number}
     * @private
     */
    Edit$$1.prototype.getVisibleChildRecordCount = function (data, count, collection) {
        var childRecords;
        var length;
        if (data.hasChildRecords) {
            childRecords = data.childRecords;
            length = childRecords.length;
            for (var i = 0; i < length; i++) {
                if (collection.indexOf(childRecords[i]) !== -1) {
                    count++;
                }
                if (childRecords[i].hasChildRecords) {
                    count = this.getVisibleChildRecordCount(childRecords[i], count, collection);
                }
            }
        }
        else {
            if (collection.indexOf(data) !== -1) {
                count++;
            }
        }
        return count;
    };
    /**
     *
     * @return {void}
     * @private
     */
    Edit$$1.prototype.updatePredecessorOnIndentOutdent = function (parentRecord) {
        var len = parentRecord.ganttProperties.predecessor.length;
        var parentRecordTaskData = parentRecord.ganttProperties;
        var predecessorCollection = parentRecordTaskData.predecessor;
        var childRecord;
        var predecessorIndex;
        var updatedPredecessor = [];
        for (var count = 0; count < len; count++) {
            if (predecessorCollection[count].to === parentRecordTaskData.taskId.toString()) {
                childRecord = this.parent.getRecordByID(predecessorCollection[count].from);
                predecessorIndex = childRecord.ganttProperties.predecessor.indexOf(predecessorCollection[count]);
                var temppredecessorCollection = void 0;
                temppredecessorCollection = (extend([], childRecord.ganttProperties.predecessor, [], true));
                temppredecessorCollection.splice(predecessorIndex, 1);
                this.parent.setRecordValue('predecessor', temppredecessorCollection, childRecord.ganttProperties, true);
            }
            else if (predecessorCollection[count].from === parentRecordTaskData.taskId.toString()) {
                childRecord = this.parent.getRecordByID(predecessorCollection[count].to);
                var stringPredecessor = this.predecessorToString(childRecord.ganttProperties.predecessor, parentRecord);
                var prdcList = (childRecord.ganttProperties.predecessorsName.toString()).split(',');
                var str = predecessorCollection[count].from + predecessorCollection[count].type;
                var ind = prdcList.indexOf(str);
                prdcList.splice(ind, 1);
                this.parent.setRecordValue('predecessorsName', prdcList.join(','), childRecord.ganttProperties, true);
                predecessorIndex = getIndex(predecessorCollection[count], 'from', childRecord.ganttProperties.predecessor, 'to');
                var temppredecessorCollection = void 0;
                temppredecessorCollection = (extend([], childRecord.ganttProperties.predecessor, [], true));
                temppredecessorCollection.splice(predecessorIndex, 1);
                this.parent.setRecordValue('predecessor', temppredecessorCollection, childRecord.ganttProperties, true);
                this.parent.predecessorModule.validatePredecessorDates(childRecord);
            }
        }
        this.parent.setRecordValue('predecessor', updatedPredecessor, parentRecord.ganttProperties, true);
        this.parent.setRecordValue('predecessorsName', '', parentRecord.ganttProperties, true);
    };
    /**
     *
     * @return {string}
     * @private
     */
    Edit$$1.prototype.predecessorToString = function (predecessorCollection, record) {
        var predecessorString = [];
        var count = 0;
        var length = predecessorCollection.length;
        for (count; count < length; count++) {
            if (record.ganttProperties.taskId.toString() !== predecessorCollection[count].from) {
                var tem = predecessorCollection[count].from + predecessorCollection[count].type;
                predecessorCollection[count].offset =
                    isNaN(predecessorCollection[count].offset) ? 0 : predecessorCollection[count].offset;
                if (predecessorCollection[count].offset !== 0) {
                    if (predecessorCollection[count].offset < 0) {
                        tem += predecessorCollection[count].offset.toString() + 'd';
                    }
                    else if (predecessorCollection[count].offset > 0) {
                        tem += '+' + predecessorCollection[count].offset.toString() + 'd';
                    }
                }
                predecessorString.push(tem);
            }
        }
        return predecessorString.join(',');
    };
    /**
     *
     * @return {void}
     * @private
     */
    Edit$$1.prototype.backUpAndPushNewlyAddedRecord = function (record, rowPosition, parentItem) {
        var flatRecords = this.parent.flatData;
        var currentViewData = this.parent.currentViewData;
        var ids = this.parent.ids;
        var currentItemIndex;
        switch (rowPosition) {
            case 'Top':
                flatRecords.splice(0, 0, record);
                currentViewData.splice(0, 0, record);
                ids.splice(0, 0, record.ganttProperties.taskId.toString()); // need to check NAN
                break;
            case 'Bottom':
                flatRecords.push(record);
                currentViewData.push(record);
                ids.push(record.ganttProperties.taskId.toString()); // need to check NAN
                break;
            case 'Above':
                var childIndex = void 0;
                /*Record Updates*/
                var recordIndex = flatRecords.indexOf(this.addRowSelectedItem);
                var updatedCollectionIndex = currentViewData.indexOf(this.addRowSelectedItem);
                this.recordCollectionUpdate(childIndex, recordIndex, updatedCollectionIndex, record, parentItem);
                break;
            case 'Below':
                currentItemIndex = flatRecords.indexOf(this.addRowSelectedItem);
                if (this.addRowSelectedItem.hasChildRecords) {
                    var dataChildCount = this.getChildCount(this.addRowSelectedItem, 0);
                    recordIndex = currentItemIndex + dataChildCount + 1;
                    updatedCollectionIndex = currentViewData.indexOf(this.addRowSelectedItem) +
                        this.getVisibleChildRecordCount(this.addRowSelectedItem, 0, currentViewData) + 1;
                }
                else {
                    recordIndex = currentItemIndex + 1;
                    updatedCollectionIndex = currentViewData.indexOf(this.addRowSelectedItem) + 1;
                }
                this.recordCollectionUpdate(childIndex + 1, recordIndex, updatedCollectionIndex, record, parentItem);
                break;
            case 'Child':
                currentItemIndex = flatRecords.indexOf(this.addRowSelectedItem);
                if (this.addRowSelectedItem.hasChildRecords) {
                    var dataChildCount = this.getChildCount(this.addRowSelectedItem, 0);
                    recordIndex = currentItemIndex + dataChildCount + 1;
                    //Expand Add record's parent item 
                    if (!this.addRowSelectedItem.expanded) {
                        this.parent.expandByID(this.addRowSelectedItem.ganttProperties.taskId);
                    }
                    updatedCollectionIndex = currentViewData.indexOf(this.addRowSelectedItem) +
                        this.getVisibleChildRecordCount(this.addRowSelectedItem, 0, currentViewData) + 1;
                }
                else {
                    this.addRowSelectedItem.hasChildRecords = true;
                    this.addRowSelectedItem.childRecords = [];
                    this.addRowSelectedItem.expanded = true;
                    this.addRowSelectedItem.ganttProperties.isMilestone = false;
                    recordIndex = currentItemIndex + 1;
                    updatedCollectionIndex = currentViewData.indexOf(this.addRowSelectedItem) + 1;
                    if (this.addRowSelectedItem.ganttProperties.predecessor) {
                        this.updatePredecessorOnIndentOutdent(this.addRowSelectedItem);
                    }
                }
                this.recordCollectionUpdate(childIndex + 1, recordIndex, updatedCollectionIndex, record, parentItem);
                break;
        }
        this.newlyAddedRecordBackup = record;
    };
    /**
     *
     * @return {ITaskAddedEventArgs}
     * @private
     */
    Edit$$1.prototype.recordCollectionUpdate = function (childIndex, recordIndex, updatedCollectionIndex, record, parentItem) {
        var flatRecords = this.parent.flatData;
        var currentViewData = this.parent.currentViewData;
        var ids = this.parent.ids;
        /* Record collection update */
        flatRecords.splice(recordIndex, 0, record);
        currentViewData.splice(updatedCollectionIndex, 0, record);
        ids.splice(recordIndex, 0, record.ganttProperties.taskId.toString());
        /* data Source update */
        if (!isNullOrUndefined(parentItem)) {
            childIndex = parentItem.childRecords.indexOf(this.addRowSelectedItem);
            /*Child collection update*/
            parentItem.childRecords.splice(childIndex, 0, record);
        }
    };
    /**
     *
     * @return {ITaskAddedEventArgs}
     * @private
     */
    Edit$$1.prototype.constructTaskAddedEventArgs = function (cAddedRecord, modifiedRecords, event) {
        var eventArgs = {};
        eventArgs.action = event;
        eventArgs.data = cAddedRecord;
        eventArgs.newTaskData = getTaskData([cAddedRecord])[0];
        eventArgs.recordIndex = cAddedRecord.index;
        eventArgs.modifiedRecords = modifiedRecords;
        eventArgs.modifiedTaskData = getTaskData(modifiedRecords);
        return eventArgs;
    };
    /**
     *
     * @return {void}
     * @private
     */
    Edit$$1.prototype.addSuccess = function (args) {
        // let addedRecords: IGanttData = args.addedRecord;
        // let eventArgs: IActionBeginEventArgs = {};
        // this.parent.updatedConnectorLineCollection = [];
        // this.parent.connectorLineIds = [];
        // this.parent.predecessorModule.createConnectorLinesCollection(this.parent.flatData);
        this.parent.treeGrid.refresh();
    };
    /**
     *
     * @return {void}
     * @private
     */
    Edit$$1.prototype.updateRealDataSource = function (addedRecord, rowPosition) {
        var dataSource = this.parent.dataSource;
        if (rowPosition === 'Top') {
            dataSource.splice(0, 0, addedRecord.taskData);
        }
        else if (rowPosition === 'Bottom') {
            dataSource.push(addedRecord);
        }
        else {
            this.addDataInRealDataSource(dataSource, addedRecord.taskData, rowPosition);
        }
        this.isBreakLoop = false;
    };
    /**
     *
     * @return {boolean | void}
     * @private
     */
    Edit$$1.prototype.addDataInRealDataSource = function (dataCollection, record, rowPosition) {
        for (var i = 0; i < dataCollection.length; i++) {
            if (this.isBreakLoop) {
                break;
            }
            if (getValue(this.parent.taskFields.id, dataCollection[i]).toString() ===
                this.addRowSelectedItem.ganttProperties.taskId.toString()) {
                if (rowPosition === 'Above') {
                    dataCollection.splice(i, 0, record);
                }
                else if (rowPosition === 'Below') {
                    dataCollection.splice(i + 1, 0, record);
                }
                else if (rowPosition === 'Child') {
                    /* tslint:disable-next-line */
                    if (dataCollection[i]['subtasks'] && dataCollection[i]['subtasks'].length > 0) {
                        /* tslint:disable-next-line */
                        dataCollection[i]['subtasks'].push(record);
                    }
                    else {
                        /* tslint:disable-next-line */
                        dataCollection[i]['subtasks'] = [];
                        /* tslint:disable-next-line */
                        dataCollection[i]['subtasks'].push(record);
                    }
                }
                this.isBreakLoop = true;
                break;
            }
            else if (dataCollection[i][this.parent.taskFields.child]) {
                var childRecords = dataCollection[i][this.parent.taskFields.child];
                this.addDataInRealDataSource(childRecords, record, rowPosition);
            }
        }
    };
    /**
     *
     * @return {void}
     * @private
     */
    Edit$$1.prototype.addRecord = function (data, rowPosition, rowIndex) {
        var _this = this;
        var selectedRowIndex = isNullOrUndefined(rowIndex) || isNaN(parseInt(rowIndex.toString(), 10)) ?
            this.parent.selectionModule ?
                (this.parent.selectionSettings.mode === 'Row' || this.parent.selectionSettings.mode === 'Both') &&
                    this.parent.selectionModule.selectedRowIndexes.length === 1 ?
                    this.parent.selectionModule.selectedRowIndexes[0] :
                    this.parent.selectionSettings.mode === 'Cell' && this.parent.selectionModule.getSelectedRowCellIndexes().length === 1 ?
                        this.parent.selectionModule.getSelectedRowCellIndexes()[0].rowIndex : null : null : rowIndex;
        this.addRowSelectedItem = isNullOrUndefined(selectedRowIndex) ? null : this.parent.currentViewData[selectedRowIndex];
        rowPosition = isNullOrUndefined(rowPosition) ? this.parent.editSettings.newRowPosition : rowPosition;
        data = isNullOrUndefined(data) ? this.parent.editModule.dialogModule.composeAddRecord() : data;
        if (((isNullOrUndefined(selectedRowIndex) || selectedRowIndex < 0 ||
            isNullOrUndefined(this.addRowSelectedItem)) && (rowPosition === 'Above'
            || rowPosition === 'Below'
            || rowPosition === 'Child')) || !rowPosition || (rowPosition !== 'Above'
            && rowPosition !== 'Below'
            && rowPosition !== 'Child' && rowPosition !== 'Top' &&
            rowPosition !== 'Bottom')) {
            rowPosition = 'Top';
        }
        var level = 0;
        var cAddedRecord;
        var args = {};
        var parentItem;
        switch (rowPosition) {
            case 'Top':
            case 'Bottom':
                level = 0;
                break;
            case 'Above':
            case 'Below':
                level = this.addRowSelectedItem.level;
                parentItem = this.parent.getParentTask(this.addRowSelectedItem.parentItem);
                break;
            case 'Child':
                level = this.addRowSelectedItem.level + 1;
                parentItem = this.addRowSelectedItem;
                break;
        }
        //Add Action Init.
        this.prepareNewlyAddedData(data, rowPosition);
        cAddedRecord = this.updateNewlyAddedDataBeforeAjax(data, level, rowPosition, parentItem);
        args = this.constructTaskAddedEventArgs(cAddedRecord, this.parent.editedRecords, 'beforeAdd');
        this.parent.showSpinner();
        this.parent.trigger('actionBegin', args);
        if (!args.cancel) {
            if (isRemoteData(this.parent.dataSource)) {
                var data_1 = this.parent.dataSource;
                var updatedData = {
                    addedRecords: [args.newTaskData],
                    changedRecords: args.modifiedTaskData
                };
                var crud = data_1.saveChanges(updatedData, null, null, new Query());
                crud.then(function (e) {
                    if (_this.parent.taskFields.id && !isNullOrUndefined(e.addedRecords[0][_this.parent.taskFields.id]) &&
                        e.addedRecords[0][_this.parent.taskFields.id] !== args.data.ganttProperties.taskId) {
                        _this.parent.setRecordValue('taskId', e.addedRecords[0][_this.parent.taskFields.id], args.data.ganttProperties, true);
                        _this.parent.setRecordValue('taskData.' + _this.parent.taskFields.id, e.addedRecords[0][_this.parent.taskFields.id], args.data);
                        _this.parent.setRecordValue(_this.parent.taskFields.id, e.addedRecords[0][_this.parent.taskFields.id], args.data);
                    }
                    _this.RefreshNewlyAddedRecord(args, cAddedRecord);
                }).catch(function (e) {
                    _this.removeAddedRecord();
                    _this.dmFailure(e, args);
                });
            }
            else {
                this.updateRealDataSource(args.data, rowPosition);
                this.RefreshNewlyAddedRecord(args, cAddedRecord);
            }
        }
        else {
            this.removeAddedRecord();
            this.reUpdatePreviousRecords();
            this.dialogModule.dialogClose();
        }
        this.parent.isOnEdit = false;
        this.parent.hideSpinner();
        this.addRowSelectedItem = null;
        this.newlyAddedRecordBackup = null;
        this.isBreakLoop = false;
        this.parent.element.tabIndex = 0;
        this.parent.initiateEditAction(false);
    };
    Edit$$1.prototype.RefreshNewlyAddedRecord = function (args, cAddedRecord) {
        if (this.parent.selectionModule && this.parent.allowSelection &&
            (this.parent.selectionSettings.mode === 'Row' || this.parent.selectionSettings.mode === 'Both')) {
            this.parent.staticSelectedRowIndex = this.parent.currentViewData.indexOf(args.data);
        }
        if (this.parent.timelineSettings.updateTimescaleView) {
            var tempArray = void 0;
            if (args.modifiedRecords.length > 0) {
                tempArray.push.apply(args.data, args.modifiedRecords);
            }
            else {
                tempArray = [args.data];
            }
            this.parent.timelineModule.updateTimeLineOnEditing(tempArray, args.action);
        }
        this.addSuccess(args);
        args = this.constructTaskAddedEventArgs(cAddedRecord, args.modifiedRecords, 'add');
        this.parent.trigger('actionComplete', args);
        this.dialogModule.dialogClose();
    };
    /**
     *
     * @return {void}
     * @private
     */
    Edit$$1.prototype.removeAddedRecord = function () {
        var flatRecords = this.parent.flatData;
        var currentViewData = this.parent.currentViewData;
        var ids = this.parent.ids;
        var flatRecordsIndex = flatRecords.indexOf(this.newlyAddedRecordBackup);
        var currentViewDataIndex = currentViewData.indexOf(this.newlyAddedRecordBackup);
        var idsIndex = ids.indexOf(this.newlyAddedRecordBackup.ganttProperties.taskId.toString());
        deleteObject(this.parent.previousRecords, flatRecords[flatRecordsIndex].uniqueID);
        if (this.newlyAddedRecordBackup.parentItem) {
            var parentItem = this.parent.getParentTask(this.newlyAddedRecordBackup.parentItem);
            var parentIndex = parentItem.childRecords.indexOf(this.newlyAddedRecordBackup);
            parentItem.childRecords.splice(parentIndex, 1);
        }
        flatRecords.splice(flatRecordsIndex, 1);
        currentViewData.splice(currentViewDataIndex, 1);
        ids.splice(idsIndex, 1);
    };
    return Edit$$1;
}());

/**
 * To handle column reorder action from TreeGrid
 */
var Reorder$1 = /** @__PURE__ @class */ (function () {
    function Reorder$$1(gantt) {
        this.parent = gantt;
        TreeGrid.Inject(Reorder);
        this.parent.treeGrid.allowReordering = this.parent.allowReordering;
        this.bindEvents();
    }
    /**
     * Get module name
     */
    Reorder$$1.prototype.getModuleName = function () {
        return 'reorder';
    };
    /**
     * To bind reorder events.
     * @return {void}
     * @private
     */
    Reorder$$1.prototype.bindEvents = function () {
        var _this = this;
        this.parent.treeGrid.columnDragStart = function (args) {
            _this.parent.trigger('columnDragStart', args);
        };
        this.parent.treeGrid.columnDrag = function (args) {
            _this.parent.trigger('columnDrag', args);
        };
        this.parent.treeGrid.columnDrop = function (args) {
            _this.parent.trigger('columnDrop', args);
        };
    };
    /**
     * To destroy the column-reorder.
     * @return {void}
     * @private
     */
    Reorder$$1.prototype.destroy = function () {
        // Destroy Method
    };
    return Reorder$$1;
}());

/**
 * Column resize action related code goes here
 */
var Resize$1 = /** @__PURE__ @class */ (function () {
    function Resize$$1(gantt) {
        this.parent = gantt;
        TreeGrid.Inject(Resize);
        this.parent.treeGrid.allowResizing = this.parent.allowResizing;
        this.bindEvents();
    }
    /**
     * Get module name
     */
    Resize$$1.prototype.getModuleName = function () {
        return 'resize';
    };
    /**
     * To bind resize events.
     * @return {void}
     * @private
     */
    Resize$$1.prototype.bindEvents = function () {
        var _this = this;
        this.parent.treeGrid.resizeStart = function (args) {
            _this.parent.trigger('resizeStart', args);
        };
        this.parent.treeGrid.resizing = function (args) {
            _this.parent.trigger('resizing', args);
        };
        this.parent.treeGrid.resizeStop = function (args) {
            _this.parent.trigger('resizeStop', args);
        };
    };
    /**
     * To destroy the column-resizer.
     * @return {void}
     * @private
     */
    Resize$$1.prototype.destroy = function () {
        // Destroy Method
    };
    return Resize$$1;
}());

/**
 * Filter action related code goes here
 */
var Filter$2 = /** @__PURE__ @class */ (function () {
    function Filter$$1(gantt) {
        this.parent = gantt;
        TreeGrid.Inject(Filter$1);
        this.parent.treeGrid.allowFiltering = this.parent.allowFiltering ||
            (this.parent.toolbar.indexOf('Search') !== -1 ? true : false);
        this.parent.treeGrid.filterSettings = getActualProperties(this.parent.filterSettings);
        this.addEventListener();
    }
    Filter$$1.prototype.getModuleName = function () {
        return 'filter';
    };
    Filter$$1.prototype.updateModel = function () {
        this.parent.filterSettings = this.parent.treeGrid.filterSettings;
    };
    Filter$$1.prototype.addEventListener = function () {
        this.parent.on('updateModel', this.updateModel, this);
        this.parent.on('actionBegin', this.actionBegin, this);
        this.parent.on('actionComplete', this.actionComplete, this);
        this.parent.on('columnMenuOpen', this.columnMenuOpen, this);
    };
    /**
     * Remove filter menu while opening column chooser menu
     * @param args
     */
    Filter$$1.prototype.columnMenuOpen = function (args) {
        if (this.filterMenuElement) {
            this.filterMenuElement.remove();
        }
    };
    Filter$$1.prototype.actionBegin = function (args) {
        // ...
    };
    Filter$$1.prototype.actionComplete = function (args) {
        if (args.requestType === filterAfterOpen) {
            this.filterMenuElement = getValue('filterModel.dlgObj.element', args);
            this.updateFilterMenuPosition(this.filterMenuElement, args);
            // To set default values as 'contains' in filter dialog
            var predecessor = this.parent.taskFields.dependency;
            var resource = this.parent.taskFields.resourceInfo;
            var filterObj = this.parent.treeGrid.grid.filterModule;
            var filterValues = getValue('values', filterObj);
            if ((args.columnName === predecessor && isNullOrUndefined(getValue(predecessor, filterValues)))
                || (args.columnName === resource && isNullOrUndefined(getValue(resource, filterValues)))) {
                var element = this.filterMenuElement.querySelector('.e-dropdownlist');
                var instanceObj = getValue('ej2_instances[0]', element);
                instanceObj.index = 2;
                instanceObj.dataBind();
            }
        }
    };
    Filter$$1.prototype.setPosition = function (li, ul) {
        var gridPos = this.parent.element.getBoundingClientRect();
        var liPos = li.getBoundingClientRect();
        var left = liPos.left - gridPos.left;
        var top = liPos.top - gridPos.top;
        if (gridPos.height < top) {
            top = top - ul.offsetHeight + liPos.height;
        }
        else if (gridPos.height < top + ul.offsetHeight) {
            top = gridPos.height - ul.offsetHeight;
        }
        if (window.innerHeight < ul.offsetHeight + top + gridPos.top) {
            top = window.innerHeight - ul.offsetHeight - gridPos.top;
        }
        left += (this.parent.enableRtl ? -ul.offsetWidth : liPos.width);
        if (gridPos.width <= left + ul.offsetWidth) {
            left -= liPos.width + ul.offsetWidth;
        }
        else if (left < 0) {
            left += ul.offsetWidth + liPos.width;
        }
        ul.style.top = top + 7 + 'px';
        ul.style.left = left + 7 + 'px';
    };
    Filter$$1.prototype.updateFilterMenuPosition = function (element, args) {
        this.parent.element.appendChild(element);
        var targetElement;
        if (this.parent.showColumnMenu) {
            targetElement = document.querySelector('#treeGrid' + this.parent.controlId + '_gridcontrol_colmenu_Filter');
            this.setPosition(targetElement, getValue('filterModel.dlgObj.element', args));
        }
        else {
            targetElement = this.parent.treeGrid.grid.getColumnHeaderByField(args.columnName).querySelector('.e-filtermenudiv');
            getFilterMenuPostion(targetElement, getValue('filterModel.dlgObj', args), this.parent.treeGrid.grid);
        }
    };
    Filter$$1.prototype.removeEventListener = function () {
        if (this.parent.isDestroyed) {
            return;
        }
        this.parent.off('updateModel', this.updateModel);
        this.parent.off('actionBegin', this.actionBegin);
        this.parent.off('actionComplete', this.actionComplete);
        this.parent.off('columnMenuOpen', this.columnMenuOpen);
    };
    /**
     * @private
     */
    Filter$$1.prototype.destroy = function () {
        this.removeEventListener();
    };
    return Filter$$1;
}());

/**
 * Sort operation in Gantt
 */
var Sort$1 = /** @__PURE__ @class */ (function () {
    function Sort$$1(gantt) {
        this.parent = gantt;
        TreeGrid.Inject(Sort);
        this.parent.treeGrid.allowSorting = this.parent.allowSorting;
        this.parent.treeGrid.sortSettings = getActualProperties(this.parent.sortSettings);
        this.addEventListener();
    }
    /**
     * For internal use only - Get the module name.
     * @private
     */
    Sort$$1.prototype.getModuleName = function () {
        return 'sort';
    };
    /**
     * @private
     */
    Sort$$1.prototype.addEventListener = function () {
        this.parent.on('updateModel', this.updateModel, this);
    };
    /**
     * @hidden
     */
    Sort$$1.prototype.removeEventListener = function () {
        if (this.parent.isDestroyed) {
            return;
        }
        this.parent.off('updateModel', this.updateModel);
    };
    /**
     * Destroys the Sorting of TreeGrid.
     * @private
     */
    Sort$$1.prototype.destroy = function () {
        this.removeEventListener();
    };
    /**
     *
     * @param columnName
     * @param direction
     * @param isMultiSort
     */
    Sort$$1.prototype.sortColumn = function (columnName, direction, isMultiSort) {
        this.parent.treeGrid.sortByColumn(columnName, direction, isMultiSort);
    };
    /**
     * method for clear all sorted columns
     */
    Sort$$1.prototype.clearSorting = function () {
        this.parent.treeGrid.clearSorting();
    };
    /**
     * The function used to update sortSettings of TreeGrid.
     * @return {void}
     * @hidden
     */
    Sort$$1.prototype.updateModel = function () {
        this.parent.sortSettings = this.parent.treeGrid.sortSettings;
    };
    /**
     * To clear sorting for specific column
     * @param columnName
     */
    Sort$$1.prototype.removeSortColumn = function (columnName) {
        this.parent.treeGrid.grid.removeSortColumn(columnName);
    };
    return Sort$$1;
}());

/**
 * Column reorder action related code goes here
 */
var Selection$1 = /** @__PURE__ @class */ (function () {
    function Selection$$1(gantt) {
        this.isSelectionFromChart = false;
        this.selectedRowIndexes = [];
        this.enableSelectMultiTouch = false;
        this.parent = gantt;
        this.bindEvents();
        this.parent.treeGrid.selectedRowIndex = this.parent.selectedRowIndex;
        this.parent.treeGrid.allowSelection = this.parent.allowSelection;
        this.parent.treeGrid.selectionSettings = getActualProperties(this.parent.selectionSettings);
        this.wireEvents();
    }
    /**
     * Get module name
     */
    Selection$$1.prototype.getModuleName = function () {
        return 'selection';
    };
    Selection$$1.prototype.wireEvents = function () {
        this.parent.on('selectRowByIndex', this.selectRowByIndex, this);
        this.parent.on('chartMouseUp', this.mouseUpHandler, this);
    };
    Selection$$1.prototype.selectRowByIndex = function () {
        if (this.parent.selectedRowIndex !== -1 || this.parent.staticSelectedRowIndex !== -1) {
            this.selectRow(this.parent.staticSelectedRowIndex !== -1 ? this.parent.staticSelectedRowIndex : this.parent.selectedRowIndex);
            this.parent.staticSelectedRowIndex = -1;
        }
    };
    /**
     * To bind selection events.
     * @return {void}
     * @private
     */
    Selection$$1.prototype.bindEvents = function () {
        this.parent.treeGrid.rowSelecting = this.rowSelecting.bind(this);
        this.parent.treeGrid.rowSelected = this.rowSelected.bind(this);
        this.parent.treeGrid.rowDeselecting = this.rowDeselecting.bind(this);
        this.parent.treeGrid.rowDeselected = this.rowDeselected.bind(this);
        this.parent.treeGrid.cellSelecting = this.cellSelecting.bind(this);
        this.parent.treeGrid.cellSelected = this.cellSelected.bind(this);
        this.parent.treeGrid.cellDeselecting = this.cellDeselecting.bind(this);
        this.parent.treeGrid.cellDeselected = this.cellDeselected.bind(this);
    };
    Selection$$1.prototype.rowSelecting = function (args) {
        this.parent.trigger('rowSelecting', args);
        this.isMultiCtrlRequest = args.isCtrlPressed;
        this.isMultiShiftRequest = args.isShiftPressed;
        if (!this.isSelectionFromChart) {
            this.selectedRowIndexes.push(args.rowIndex);
        }
    };
    Selection$$1.prototype.rowSelected = function (args) {
        var rowIndexes = 'rowIndexes';
        var index = args[rowIndexes] || [args.rowIndex];
        this.addClass(index);
        this.parent.selectedRowIndex = this.parent.treeGrid.selectedRowIndex;
        if (this.isMultiShiftRequest) {
            this.selectedRowIndexes = index;
        }
        if (this.parent.autoFocusTasks) {
            this.parent.ganttChartModule.updateScrollLeft(getValue('data.ganttProperties.left', args));
        }
        this.parent.trigger('rowSelected', args);
        this.prevRowIndex = args.rowIndex;
        if (!isNullOrUndefined(this.parent.toolbarModule)) {
            this.parent.toolbarModule.refreshToolbarItems();
        }
    };
    Selection$$1.prototype.rowDeselecting = function (args) {
        this.parent.trigger('rowDeselecting', args);
        if (!args.cancel) {
            this.removeClass(args.rowIndex);
        }
    };
    Selection$$1.prototype.rowDeselected = function (args) {
        this.parent.trigger('rowDeselected', args);
        if (!this.isSelectionFromChart) {
            this.selectedRowIndexes.splice(this.selectedRowIndexes.indexOf(args.rowIndex[0]), 1);
        }
        var rowIndexes = 'rowIndexes';
        var index = args[rowIndexes] || args.rowIndex;
        this.removeClass(index);
        this.parent.selectedRowIndex = -1;
        if (!isNullOrUndefined(this.parent.toolbarModule)) {
            this.parent.toolbarModule.refreshToolbarItems();
        }
    };
    Selection$$1.prototype.cellSelecting = function (args) {
        this.parent.trigger('cellSelecting', args);
    };
    Selection$$1.prototype.cellSelected = function (args) {
        this.parent.trigger('cellSelected', args);
        if (!isNullOrUndefined(this.parent.toolbarModule)) {
            this.parent.toolbarModule.refreshToolbarItems();
        }
    };
    Selection$$1.prototype.cellDeselecting = function (args) {
        this.parent.trigger('cellDeselecting', args);
    };
    Selection$$1.prototype.cellDeselected = function (args) {
        this.parent.trigger('cellDeselected', args);
        if (!isNullOrUndefined(this.parent.toolbarModule)) {
            this.parent.toolbarModule.refreshToolbarItems();
        }
    };
    /**
     * Selects a cell by the given index.
     * @param  {IIndex} cellIndex - Defines the row and column indexes.
     * @param  {boolean} isToggle - If set to true, then it toggles the selection.
     * @return {void}
     */
    Selection$$1.prototype.selectCell = function (cellIndex, isToggle) {
        this.parent.treeGrid.selectCell(cellIndex, isToggle);
    };
    /**
     * Selects a row by given index.
     * @param  {number} index - Defines the row index.
     * @param  {boolean} isToggle - If set to true, then it toggles the selection.
     * @return {void}
     */
    Selection$$1.prototype.selectRow = function (index, isToggle) {
        var selectedRow = this.parent.getRowByIndex(index);
        if (index === -1 || isNullOrUndefined(selectedRow)) {
            return;
        }
        var isRowSelected = selectedRow.hasAttribute('aria-selected');
        var can = 'cancel';
        if (isRowSelected && isToggle) {
            var rowDeselectObj = {
                rowIndex: index, data: this.parent.ganttChartModule.getRecordByTaskBar(selectedRow),
                row: selectedRow, cancel: false, target: this.actualTarget
            };
            this.parent.trigger('rowDeSelecting', rowDeselectObj);
            this.clearSelection();
        }
        else {
            var args = {
                data: this.parent.ganttChartModule.getRecordByTaskBar(selectedRow),
                rowIndex: index, isCtrlPressed: this.isMultiCtrlRequest,
                isShiftPressed: this.isMultiShiftRequest, row: selectedRow,
                previousRow: this.parent.getRowByIndex(this.prevRowIndex),
                previousRowIndex: this.prevRowIndex, target: this.actualTarget, cancel: false
            };
            this.parent.trigger('rowSelecting', args);
            if (!args[can]) {
                this.addClass([index]);
                this.parent.treeGrid.selectRow(index, isToggle);
            }
        }
        this.prevRowIndex = index;
    };
    /**
     * Selects a collection of rows by indexes.
     * @param  {number[]} rowIndexes - Specifies the row indexes.
     * @return {void}
     */
    Selection$$1.prototype.selectRows = function (records) {
        var rowIndex = records[records.length - 1];
        records = this.parent.selectionSettings.type === 'Single' ? [rowIndex] : records;
        var can = 'cancel';
        var selectedRow = this.parent.getRowByIndex(rowIndex);
        var args = {
            data: this.parent.ganttChartModule.getRecordByTaskBar(selectedRow),
            rowIndexes: records, rowIndex: rowIndex, row: selectedRow,
            isCtrlPressed: this.isMultiCtrlRequest, isShiftPressed: this.isMultiShiftRequest,
            previousRow: this.parent.getRowByIndex(this.prevRowIndex),
            previousRowIndex: this.prevRowIndex, target: this.actualTarget, cancel: false
        };
        this.parent.trigger('rowSelecting', args);
        if (!args[can]) {
            for (var i = 0; i < records.length; i++) {
                this.addClass([records[i]]);
            }
        }
        this.parent.treeGrid.selectRows(records);
    };
    /**
     * Gets the collection of selected row indexes.
     * @return {number[]}
     */
    Selection$$1.prototype.getSelectedRowIndexes = function () {
        return this.parent.treeGrid.getSelectedRowIndexes();
    };
    /**
     * Gets the collection of selected row and cell indexes.
     * @return {number[]}
     */
    Selection$$1.prototype.getSelectedRowCellIndexes = function () {
        return this.parent.treeGrid.getSelectedRowCellIndexes();
    };
    /**
     * Gets the collection of selected records.
     * @return {Object[]}
     */
    Selection$$1.prototype.getSelectedRecords = function () {
        return this.parent.treeGrid.getSelectedRecords();
    };
    /**
     * To get the selected records for cell selection
     * @return {IGanttData[]}
     */
    Selection$$1.prototype.getCellSelectedRecords = function () {
        var cellDetails = this.parent.selectionModule.getSelectedRowCellIndexes();
        var cellSelectedRecords = [];
        for (var i = 0; i < cellDetails.length; i++) {
            cellSelectedRecords.push(this.parent.currentViewData[cellDetails[i].rowIndex]);
        }
        return cellSelectedRecords;
    };
    /**
     * Gets the collection of selected rows.
     * @return {Element[]}
     */
    Selection$$1.prototype.getSelectedRows = function () {
        return this.parent.treeGrid.getSelectedRows();
    };
    /**
     * Deselects the current selected rows and cells.
     * @return {void}
     */
    Selection$$1.prototype.clearSelection = function () {
        this.removeClass(this.selectedRowIndexes);
        this.parent.treeGrid.clearSelection();
        this.parent.selectedRowIndex = -1;
        this.selectedRowIndexes = [];
        if (!isNullOrUndefined(this.parent.toolbarModule)) {
            this.parent.toolbarModule.refreshToolbarItems();
        }
    };
    Selection$$1.prototype.highlightSelectedRows = function (e, fromChart) {
        var rows = e.target.closest('tbody').children;
        var selectedRow = e.target.closest('tr.e-chart-row');
        var rIndex = [].slice.call(rows).indexOf(selectedRow);
        this.isMultiCtrlRequest = e.ctrlKey || this.enableSelectMultiTouch;
        this.isMultiShiftRequest = e.shiftKey;
        this.actualTarget = e.target;
        this.isSelectionFromChart = fromChart;
        if (fromChart) {
            if (this.parent.selectionSettings.type === 'Single' || (!this.isMultiCtrlRequest && !this.isMultiShiftRequest)) {
                this.selectedRowIndexes = [];
                this.selectedRowIndexes.push(rIndex);
                this.selectRow(rIndex, true);
            }
            else {
                if (this.isMultiShiftRequest) {
                    this.selectRowsByRange(isNullOrUndefined(this.prevRowIndex) ? rIndex : this.prevRowIndex, rIndex);
                }
                else {
                    this.addRowsToSelection(rIndex);
                }
            }
        }
    };
    /**
     * Select rows with existing row selection by passing row indexes.
     * @return {void}
     * @hidden
     */
    Selection$$1.prototype.addRowsToSelection = function (index) {
        var rowIndex = this.selectedRowIndexes.indexOf(index);
        var selectedRow = this.parent.getRowByIndex(index);
        var can = 'cancel';
        if (rowIndex > -1) {
            this.selectedRowIndexes.splice(rowIndex, 1);
            var rowDeselectObj = {
                rowIndex: index, data: this.parent.ganttChartModule.getRecordByTaskBar(selectedRow),
                row: selectedRow, cancel: false, target: this.actualTarget
            };
            this.parent.trigger('rowDeSelecting', rowDeselectObj);
        }
        else {
            this.selectedRowIndexes.push(index);
            var args = {
                data: this.parent.ganttChartModule.getRecordByTaskBar(selectedRow),
                rowIndexes: this.selectedRowIndexes, rowIndex: rowIndex, row: selectedRow,
                isCtrlPressed: this.isMultiCtrlRequest, isShiftPressed: this.isMultiShiftRequest,
                previousRow: this.parent.getRowByIndex(this.prevRowIndex),
                previousRowIndex: this.prevRowIndex, target: this.actualTarget, cancel: false
            };
            this.parent.trigger('rowSelecting', args);
            if (!args[can]) {
                this.addClass([index]);
            }
        }
        this.parent.treeGrid.grid.selectionModule.addRowsToSelection([index]);
    };
    Selection$$1.prototype.getselectedrowsIndex = function (startIndex, endIndex) {
        var indexes = [];
        var _a = (startIndex < endIndex) ?
            { i: startIndex, max: endIndex } : { i: endIndex, max: startIndex }, i = _a.i, max = _a.max;
        for (; i <= max; i++) {
            indexes.push(i);
        }
        if (startIndex > endIndex) {
            indexes.reverse();
        }
        this.selectedRowIndexes = indexes;
    };
    /**
     * Selects a range of rows from start and end row indexes.
     * @param  {number} startIndex - Specifies the start row index.
     * @param  {number} endIndex - Specifies the end row index.
     * @return {void}
     */
    Selection$$1.prototype.selectRowsByRange = function (startIndex, endIndex) {
        this.isSelectionFromChart = true;
        this.getselectedrowsIndex(startIndex, endIndex);
        this.selectRows(this.selectedRowIndexes);
    };
    Selection$$1.prototype.addClass = function (records) {
        var ganttRow = document.getElementById(this.parent.element.id + 'GanttTaskTableBody').children;
        for (var i = 0; i < records.length; i++) {
            addClass([ganttRow[records[i]]], 'e-active');
            ganttRow[records[i]].setAttribute('aria-selected', 'true');
        }
    };
    Selection$$1.prototype.removeClass = function (records) {
        if (!this.parent.selectionSettings.persistSelection) {
            var ganttRow = document.getElementById(this.parent.element.id + 'GanttTaskTableBody').children;
            for (var i = 0; i < records.length; i++) {
                removeClass([ganttRow[records[i]]], 'e-active');
                ganttRow[records[i]].removeAttribute('aria-selected');
            }
        }
    };
    Selection$$1.prototype.showPopup = function (e) {
        if (this.isSelectionFromChart) {
            setCssInGridPopUp(this.parent.element.querySelector('.e-ganttpopup'), e, 'e-rowselect e-icons e-icon-rowselect' +
                ((this.getSelectedRecords().length > 1 || this.getSelectedRowCellIndexes().length > 1) ? ' e-spanclicked' : ''));
            document.getElementsByClassName('e-gridpopup')[0].style.display = 'none';
        }
        else {
            this.hidePopUp();
        }
    };
    Selection$$1.prototype.hidePopUp = function () {
        document.getElementsByClassName('e-ganttpopup')[0].style.display = 'none';
    };
    Selection$$1.prototype.popUpClickHandler = function (e) {
        var target = e.target;
        var grid = this.parent.treeGrid.grid;
        if (closest(target, '.e-ganttpopup') || closest(target, '.e-gridpopup')) {
            if (!target.classList.contains('e-spanclicked')) {
                this.enableSelectMultiTouch = true;
                if (closest(target, '.e-ganttpopup')) {
                    target.classList.add('e-spanclicked');
                }
            }
            else {
                this.hidePopUp();
                this.enableSelectMultiTouch = false;
                if (closest(target, '.e-ganttpopup')) {
                    target.classList.remove('e-spanclicked');
                }
            }
        }
        else {
            this.hidePopUp();
        }
        if (grid) {
            setValue('enableSelectMultiTouch', this.enableSelectMultiTouch, grid.selectionModule);
        }
    };
    /**
     * @return {void}
     * @private
     */
    Selection$$1.prototype.mouseUpHandler = function (e) {
        var isTaskbarEdited = false;
        if (this.parent.editSettings.allowTaskbarEditing &&
            getValue('editModule.taskbarEditModule.isMouseDragged', this.parent)) {
            isTaskbarEdited = true;
        }
        if (!isTaskbarEdited && this.parent.element.contains(e.target)) {
            var parent_1 = parentsUntil(e.target, 'e-chart-row');
            var isSelected = e.target.classList.contains('e-rowcell') ||
                e.target.classList.contains('e-row') ||
                e.target.classList.contains('e-treegridexpand') ||
                e.target.classList.contains('e-treegridcollapse') || !isNullOrUndefined(parent_1);
            this.popUpClickHandler(e);
            if (this.parent.selectionSettings.mode !== 'Cell' && isSelected) {
                if (e.target.closest('tr.e-chart-row')) {
                    this.highlightSelectedRows(e, true);
                }
                else {
                    this.highlightSelectedRows(e, false);
                }
                if (this.parent.selectionSettings.type === 'Multiple' && Browser.isDevice) {
                    this.showPopup(e);
                }
            }
            else {
                this.isSelectionFromChart = false;
            }
        }
    };
    /**
     * To destroy the column-resizer.
     * @return {void}
     * @private
     */
    Selection$$1.prototype.destroy = function () {
        if (this.parent.isDestroyed) {
            return;
        }
        this.parent.off('selectRowByIndex', this.selectRowByIndex);
        this.parent.off('chartMouseUp', this.mouseUpHandler);
    };
    return Selection$$1;
}());

var Toolbar$3 = /** @__PURE__ @class */ (function () {
    function Toolbar$$1(parent) {
        this.predefinedItems = {};
        this.items = ['Add', 'Edit', 'Update', 'Delete', 'Cancel', 'ExpandAll', 'CollapseAll', 'Search',
            'PrevTimeSpan', 'NextTimeSpan'];
        this.parent = parent;
        this.id = this.parent.element.id;
    }
    Toolbar$$1.prototype.getModuleName = function () {
        return 'toolbar';
    };
    /**
     * @private
     */
    Toolbar$$1.prototype.renderToolbar = function () {
        var toolbarItems = this.parent.toolbar || [];
        if (toolbarItems.length > 0) {
            this.element = createElement('div', { id: this.parent.controlId + '_Gantt_Toolbar', className: toolbar });
            this.parent.element.appendChild(this.element);
            var preItems = ['Add', 'Edit', 'Update', 'Delete', 'Cancel', 'ExpandAll', 'CollapseAll',
                'PrevTimeSpan', 'NextTimeSpan'];
            for (var _i = 0, preItems_1 = preItems; _i < preItems_1.length; _i++) {
                var item = preItems_1[_i];
                var itemStr = item.toLowerCase();
                var localeName = item[0].toLowerCase() + item.slice(1);
                this.predefinedItems[item] = {
                    id: this.parent.element.id + '_' + itemStr, prefixIcon: 'e-' + itemStr,
                    text: this.parent.localeObj.getConstant(localeName),
                    tooltipText: this.parent.localeObj.getConstant(localeName) + ((localeName === 'add' ||
                        localeName === 'edit' || localeName === 'delete') ? this.parent.localeObj.getConstant('task') :
                        (localeName === 'expandAll' || localeName === 'collapseAll') ?
                            this.parent.localeObj.getConstant('tasks') : '')
                };
            }
            var searchLocalText = this.parent.localeObj.getConstant('search');
            this.predefinedItems.Search = {
                id: this.id + '_search',
                template: '<div class="e-input-group e-search" role="search">\
            <input id="' + this.id + '_searchbar" class="e-input" name="input" type="search" \
            placeholder= \"' + searchLocalText + '\"/>\
            <span id="' + this.id + '_searchbutton" class="e-input-group-icon e-search-icon e-icons" \
            tabindex="-1" title="' + searchLocalText + '" aria-label= "search"></span> \
            </div>',
                tooltipText: searchLocalText,
                align: 'Right', cssClass: 'e-search-wrapper'
            };
            this.createToolbar();
        }
    };
    Toolbar$$1.prototype.createToolbar = function () {
        var items = this.getItems();
        this.toolbar = new Toolbar$1({
            items: items,
            clicked: this.toolbarClickHandler.bind(this)
        });
        this.toolbar.appendTo(this.element);
        this.searchElement = this.element.querySelector('#' + this.parent.element.id + '_searchbar');
        if (this.parent.filterModule) {
            this.wireEvent();
            if (this.parent.searchSettings) {
                this.updateSearchTextBox();
            }
        }
    };
    Toolbar$$1.prototype.wireEvent = function () {
        if (this.searchElement) {
            EventHandler.add(this.searchElement, 'keyup', this.keyUpHandler, this);
            EventHandler.add(this.searchElement, 'focus', this.focusHandler, this);
            EventHandler.add(this.searchElement, 'blur', this.blurHandler, this);
        }
    };
    Toolbar$$1.prototype.unWireEvent = function () {
        if (this.searchElement) {
            EventHandler.remove(this.searchElement, 'keyup', this.keyUpHandler);
            EventHandler.remove(this.searchElement, 'focus', this.focusHandler);
            EventHandler.remove(this.searchElement, 'blur', this.blurHandler);
        }
    };
    Toolbar$$1.prototype.keyUpHandler = function (e) {
        if (e.keyCode === 13 && this.parent.searchSettings.key !== this.searchElement.value) {
            this.parent.searchSettings.key = this.searchElement.value;
            this.parent.dataBind();
        }
    };
    Toolbar$$1.prototype.focusHandler = function (e) {
        e.target.parentElement.classList.add('e-input-focus');
    };
    Toolbar$$1.prototype.blurHandler = function (e) {
        e.target.parentElement.classList.remove('e-input-focus');
    };
    /**
     * Method to set value for search input box
     * @hidden
     */
    Toolbar$$1.prototype.updateSearchTextBox = function () {
        if (this.searchElement && this.searchElement.value !== this.parent.searchSettings.key) {
            this.searchElement.value = this.parent.searchSettings.key;
        }
    };
    Toolbar$$1.prototype.getItems = function () {
        var items = [];
        var toolbarItems = this.parent.toolbar || [];
        if (typeof (this.parent.toolbar) === 'string') {
            return [];
        }
        for (var _i = 0, toolbarItems_1 = toolbarItems; _i < toolbarItems_1.length; _i++) {
            var item = toolbarItems_1[_i];
            switch (typeof item) {
                case 'number':
                    items.push(this.getItemObject(this.items[item]));
                    break;
                case 'string':
                    items.push(this.getItemObject(item));
                    break;
                default:
                    items.push(this.getItem(item));
            }
        }
        return items;
    };
    Toolbar$$1.prototype.getItem = function (itemObject) {
        var item = this.predefinedItems[itemObject.text];
        return item ? extend(item, item, itemObject) : itemObject;
    };
    Toolbar$$1.prototype.getItemObject = function (itemName) {
        return this.predefinedItems[itemName] || { text: itemName, id: this.id + '_' + itemName };
    };
    Toolbar$$1.prototype.toolbarClickHandler = function (args) {
        var gObj = this.parent;
        var gID = this.id;
        extend(args, { cancel: false });
        gObj.trigger(toolbarClick, args);
        if (args.cancel) {
            return;
        }
        switch (!isNullOrUndefined(args.item) && args.item.id) {
            case gID + '_edit':
                if (gObj.editModule && gObj.editSettings.allowEditing) {
                    gObj.editModule.dialogModule.openToolbarEditDialog();
                }
                break;
            case gID + '_update':
                gObj.editModule.cellEditModule.isCellEdit = false;
                gObj.treeGrid.endEdit();
                break;
            case gID + '_cancel':
                gObj.editModule.cellEditModule.isCellEdit = false;
                gObj.treeGrid.closeEdit();
                // console.log('Cancel editing');
                break;
            case gID + '_add':
                if (gObj.editModule && gObj.editSettings.allowAdding) {
                    gObj.editModule.dialogModule.openAddDialog();
                }
                break;
            case gID + '_delete':
                if (this.parent.selectionModule && this.parent.editModule) {
                    if ((this.parent.selectionSettings.mode === 'Row' && this.parent.selectionModule.selectedRowIndexes.length)
                        || (this.parent.selectionSettings.mode === 'Cell' &&
                            this.parent.selectionModule.getSelectedRowCellIndexes().length)) {
                        this.parent.editModule.startDeleteAction();
                    }
                }
                break;
            case gID + '_search':
                var searchButtonId = getValue('originalEvent.target.id', args);
                if (searchButtonId === this.parent.element.id + '_searchbutton' && this.parent.filterModule) {
                    var keyVal = this.element.querySelector('#' + this.parent.element.id + '_searchbar').value;
                    if (this.parent.searchSettings.key !== keyVal) {
                        this.parent.searchSettings.key = keyVal;
                        this.parent.dataBind();
                    }
                }
                break;
            case gID + '_expandall':
                this.parent.ganttChartModule.expandCollapseAll('expand');
                break;
            case gID + '_collapseall':
                this.parent.ganttChartModule.expandCollapseAll('collapse');
                break;
            case gID + '_prevtimespan':
                this.parent.previousTimeSpan();
                break;
            case gID + '_nexttimespan':
                this.parent.nextTimeSpan();
                break;
        }
    };
    /**
     * To refresh toolbar items bases current state of tasks
     */
    Toolbar$$1.prototype.refreshToolbarItems = function () {
        var gObj = this.parent;
        var enableItems = [];
        var disableItems = [];
        var edit = gObj.editSettings;
        var gID = this.id;
        var isSelected = gObj.selectionModule ? gObj.selectionModule.selectedRowIndexes.length === 1 ||
            gObj.selectionModule.getSelectedRowCellIndexes().length === 1 ? true : false : false;
        var hasData = gObj.currentViewData && gObj.currentViewData.length;
        edit.allowAdding ? enableItems.push(gID + '_add') : disableItems.push(gID + '_add');
        edit.allowEditing && hasData && isSelected ? enableItems.push(gID + '_edit') : disableItems.push(gID + '_edit');
        var isDeleteSelected = gObj.selectionModule ? gObj.selectionModule.selectedRowIndexes.length > 0 ||
            gObj.selectionModule.getSelectedRowCellIndexes().length > 0 ? true : false : false;
        edit.allowDeleting && hasData && isDeleteSelected ? enableItems.push(gID + '_delete') : disableItems.push(gID + '_delete');
        if (!isNullOrUndefined(this.parent.editModule)) {
            if (gObj.editModule.cellEditModule.isCellEdit) {
                enableItems.push(gID + '_update');
                enableItems.push(gID + '_cancel');
            }
            else {
                disableItems.push(gID + '_update');
                disableItems.push(gID + '_cancel');
            }
        }
        this.enableItems(enableItems, true);
        this.enableItems(disableItems, false);
    };
    /**
     * Enables or disables ToolBar items.
     * @param {string[]} items - Defines the collection of itemID of ToolBar items.
     * @param {boolean} isEnable - Defines the items to be enabled or disabled.
     * @return {void}
     * @hidden
     */
    Toolbar$$1.prototype.enableItems = function (items, isEnable) {
        for (var _i = 0, items_1 = items; _i < items_1.length; _i++) {
            var item = items_1[_i];
            var element = this.element.querySelector('#' + item);
            if (element) {
                this.toolbar.enableItems(element.parentElement, isEnable);
            }
        }
    };
    /**
     * Destroys the Sorting of TreeGrid.
     * @method destroy
     * @return {void}
     * @private
     */
    Toolbar$$1.prototype.destroy = function () {
        this.searchElement = null;
        if (this.parent.isDestroyed) {
            return;
        }
        this.toolbar.destroy();
        if (this.parent.filterModule) {
            this.unWireEvent();
        }
        remove(this.element);
    };
    return Toolbar$$1;
}());

var NonWorkingDay = /** @__PURE__ @class */ (function () {
    function NonWorkingDay(gantt) {
        this.parent = gantt;
        this.nonworkingContainer = null;
        this.holidayContainer = null;
        this.weekendContainer = null;
    }
    /**
     * Method append nonworking container
     */
    NonWorkingDay.prototype.createNonworkingContainer = function () {
        if (!this.parent.ganttChartModule.chartBodyContent.contains(this.nonworkingContainer)) {
            this.nonworkingContainer = createElement('div', {
                className: nonworkingContainer
            });
            this.parent.ganttChartModule.chartBodyContent.appendChild(this.nonworkingContainer);
        }
    };
    /**
     * calculation for holidays rendering.
     * @private
     */
    NonWorkingDay.prototype.renderHolidays = function () {
        if (this.parent.holidays && this.parent.holidays.length > 0) {
            this.createNonworkingContainer();
            if (!this.nonworkingContainer.contains(this.holidayContainer)) {
                this.holidayContainer = createElement('div', {
                    className: holidayContainer
                });
                this.nonworkingContainer.appendChild(this.holidayContainer);
            }
            this.holidayContainer.innerHTML = this.getHolidaysElement().innerHTML;
        }
        else if (this.holidayContainer) {
            remove(this.holidayContainer);
            if (this.nonworkingContainer && this.nonworkingContainer.childNodes.length === 0) {
                remove(this.nonworkingContainer);
            }
        }
    };
    /**
     * Method to return holidays as html string
     */
    NonWorkingDay.prototype.getHolidaysElement = function () {
        var fromDate;
        var toDate;
        var container = createElement('div');
        var height = this.parent.contentHeight;
        var scrollElement = this.parent.ganttChartModule.scrollElement;
        var viewportHeight = parseInt(scrollElement.style.height, 10);
        for (var i = 0; i < this.parent.holidays.length; i++) {
            if (this.parent.holidays[i].from && this.parent.holidays[i].to) {
                fromDate = this.parent.dateValidationModule.getDateFromFormat(this.parent.holidays[i].from);
                toDate = this.parent.dateValidationModule.getDateFromFormat(this.parent.holidays[i].to);
                toDate.setDate(toDate.getDate() + 1);
                fromDate.setHours(0, 0, 0, 0);
                toDate.setHours(0, 0, 0, 0);
            }
            else if (this.parent.holidays[i].from) {
                fromDate = this.parent.dateValidationModule.getDateFromFormat(this.parent.holidays[i].from);
                fromDate.setHours(0, 0, 0, 0);
            }
            else if (this.parent.holidays[i].to) {
                fromDate = this.parent.dateValidationModule.getDateFromFormat(this.parent.holidays[i].to);
                fromDate.setHours(0, 0, 0, 0);
            }
            var width = (this.parent.holidays[i].from && this.parent.holidays[i].to) ?
                this.parent.dataOperation.getTaskWidth(fromDate, toDate) : this.parent.perDayWidth;
            var left = this.parent.dataOperation.getTaskLeft(fromDate, false);
            var holidayDiv = createElement('div', {
                className: holidayElement, styles: "left:" + left + "px; width:" + width + "px; height:100%;"
            });
            var spanTop = (viewportHeight < height) ? viewportHeight / 2 : height / 2;
            var spanElement = createElement('span', {
                className: holidayLabel, innerHTML: this.parent.holidays[i].label ? "" + this.parent.holidays[i].label : '',
                styles: "top:" + spanTop + "px;left:" + (width / 2) + "px;"
            });
            holidayDiv.appendChild(spanElement);
            if (this.parent.holidays[i].cssClass) {
                holidayDiv.classList.add(this.parent.holidays[i].cssClass);
            }
            container.appendChild(holidayDiv);
        }
        return container;
    };
    /**
     * @private
     */
    NonWorkingDay.prototype.renderWeekends = function () {
        if (this.parent.highlightWeekends) {
            this.createNonworkingContainer();
            if (!this.nonworkingContainer.contains(this.weekendContainer)) {
                this.weekendContainer = createElement('div', {
                    className: weekendContainer
                });
                this.nonworkingContainer.appendChild(this.weekendContainer);
            }
            this.weekendContainer.innerHTML = this.getWeekendElements().innerHTML;
        }
        else if (this.weekendContainer) {
            remove(this.weekendContainer);
            if (this.nonworkingContainer && this.nonworkingContainer.childNodes.length === 0) {
                remove(this.nonworkingContainer);
            }
        }
    };
    /**
     * Method to get weekend html string
     */
    NonWorkingDay.prototype.getWeekendElements = function () {
        var container = createElement('div');
        var startDate = new Date(this.parent.timelineModule.timelineStartDate.getTime());
        var endDate = new Date(this.parent.timelineModule.timelineEndDate.getTime());
        var nonWorkingIndex = this.parent.nonWorkingDayIndex;
        var isFirstCell = true;
        do {
            if (nonWorkingIndex.indexOf(startDate.getDay()) !== -1) {
                var left = this.parent.dataOperation.getTaskLeft(startDate, false);
                var width = this.parent.perDayWidth;
                if (isFirstCell) {
                    var start = new Date(startDate.getTime());
                    var tempEnd = new Date(start.getTime());
                    tempEnd.setDate(tempEnd.getDate() + 1);
                    tempEnd.setHours(0, 0, 0, 0);
                    width = this.parent.dataOperation.getTaskWidth(start, tempEnd);
                    isFirstCell = false;
                }
                var weekendDiv = createElement('div', {
                    className: weekend, styles: "left:" + left + "px;width:" + width + "px;height:100%;"
                });
                container.appendChild(weekendDiv);
            }
            startDate.setDate(startDate.getDate() + 1);
            startDate.setHours(0, 0, 0, 0);
        } while (startDate < endDate);
        return container;
    };
    NonWorkingDay.prototype.updateHolidayLabelHeight = function () {
        var height = this.parent.contentHeight;
        var scrollElement = this.parent.ganttChartModule.scrollElement;
        var viewportHeight = parseInt(scrollElement.style.height, 10);
        var top = (viewportHeight < height) ? viewportHeight / 2 : height / 2;
        var labels = this.holidayContainer.querySelectorAll('.' + holidayLabel);
        labels.forEach(function (element) {
            element.style.top = formatUnit(top);
        });
    };
    /**
     * Method to update height for all internal containers
     * @private
     */
    NonWorkingDay.prototype.updateContainerHeight = function () {
        if (this.holidayContainer) {
            this.holidayContainer.style.height = formatUnit(this.parent.contentHeight);
            this.updateHolidayLabelHeight();
        }
        if (this.weekendContainer) {
            this.weekendContainer.style.height = formatUnit(this.parent.contentHeight);
        }
    };
    /**
     * Method to remove containers of holiday and weekend
     */
    NonWorkingDay.prototype.removeContainers = function () {
        if (this.holidayContainer) {
            remove(this.holidayContainer);
        }
        if (this.weekendContainer) {
            remove(this.weekendContainer);
        }
        if (this.nonworkingContainer) {
            remove(this.nonworkingContainer);
        }
    };
    return NonWorkingDay;
}());

var EventMarker$1 = /** @__PURE__ @class */ (function () {
    function EventMarker(gantt) {
        this.parent = gantt;
        this.eventMarkersContainer = null;
    }
    /**
     * @private
     */
    EventMarker.prototype.renderEventMarkers = function () {
        if (this.parent.eventMarkers && this.parent.eventMarkers.length > 0) {
            if (!this.parent.ganttChartModule.chartBodyContent.contains(this.eventMarkersContainer)) {
                this.eventMarkersContainer = createElement('div', {
                    className: eventMarkersContainer
                });
                this.parent.ganttChartModule.chartBodyContent.appendChild(this.eventMarkersContainer);
            }
            this.eventMarkersContainer.innerHTML = '';
            this.getEventMarkersElements(this.eventMarkersContainer);
        }
        else if (this.eventMarkersContainer) {
            remove(this.eventMarkersContainer);
        }
    };
    /**
     * @private
     */
    EventMarker.prototype.removeContainer = function () {
        if (this.eventMarkersContainer) {
            remove(this.eventMarkersContainer);
        }
    };
    /**
     * Method to get event markers as html string
     */
    EventMarker.prototype.getEventMarkersElements = function (container) {
        var left;
        var eventMarkerElement;
        var spanElement;
        var rightArrow;
        for (var i = 0; i < this.parent.eventMarkers.length; i++) {
            left = this.parent.dataOperation.getTaskLeft(this.parent.dateValidationModule.getDateFromFormat(this.parent.eventMarkers[i].day), false);
            eventMarkerElement = createElement('div', {
                className: eventMarkersChild, styles: "left:" + left + "px;  height:100%;",
                id: 'stripline' + i
            });
            if (this.parent.eventMarkers[i].label) {
                spanElement = createElement('div', {
                    className: eventMarkersSpan, innerHTML: "" + this.parent.eventMarkers[i].label
                });
                eventMarkerElement.appendChild(spanElement);
                rightArrow = createElement('div', {
                    className: 'e-gantt-right-arrow'
                });
                eventMarkerElement.appendChild(rightArrow);
            }
            if (this.parent.eventMarkers[i].cssClass) {
                eventMarkerElement.classList.add(this.parent.eventMarkers[i].cssClass);
            }
            container.appendChild(eventMarkerElement);
        }
    };
    /**
     * @private
     */
    EventMarker.prototype.updateContainerHeight = function () {
        if (this.eventMarkersContainer) {
            this.eventMarkersContainer.style.height = formatUnit(this.parent.contentHeight);
        }
    };
    return EventMarker;
}());

/**
 *
 */
var DayMarkers = /** @__PURE__ @class */ (function () {
    function DayMarkers(parent) {
        this.parent = parent;
        this.nonworkingDayRender = new NonWorkingDay(this.parent);
        this.eventMarkerRender = new EventMarker$1(this.parent);
        this.wireEvents();
    }
    DayMarkers.prototype.wireEvents = function () {
        this.parent.on('refreshDayMarkers', this.refreshMarkers, this);
        this.parent.on('updateHeight', this.updateHeight, this);
        this.parent.on('ui-update', this.propertyChanged, this);
    };
    DayMarkers.prototype.propertyChanged = function (property) {
        var keys = Object.keys(getValue('properties', property));
        for (var i = 0; i < keys.length; i++) {
            var key = keys[i];
            switch (key) {
                case 'eventMarkers':
                    this.eventMarkerRender.renderEventMarkers();
                    break;
                case 'highlightWeekends':
                    this.nonworkingDayRender.renderWeekends();
                    break;
                case 'holidays':
                    this.nonworkingDayRender.renderHolidays();
                    break;
            }
        }
    };
    DayMarkers.prototype.refreshMarkers = function () {
        this.eventMarkerRender.renderEventMarkers();
        this.nonworkingDayRender.renderWeekends();
        this.nonworkingDayRender.renderHolidays();
    };
    DayMarkers.prototype.updateHeight = function () {
        this.nonworkingDayRender.updateContainerHeight();
        this.eventMarkerRender.updateContainerHeight();
    };
    /**
     * @private
     */
    DayMarkers.prototype.getModuleName = function () {
        return 'dayMarkers';
    };
    /**
     * @private
     */
    DayMarkers.prototype.destroy = function () {
        if (this.parent.isDestroyed) {
            return;
        }
        this.nonworkingDayRender.removeContainers();
        this.eventMarkerRender.removeContainer();
        this.parent.off('refreshDayMarkers', this.refreshMarkers);
        this.parent.off('updateHeight', this.updateHeight);
        this.parent.off('ui-update', this.propertyChanged);
    };
    return DayMarkers;
}());

/**
 * Gantt Action Modules
 */

/**
 * Gantt Component exported items
 */

/**
 * Gantt index file
 */

export { Gantt, parentsUntil$1 as parentsUntil, isScheduledTask, getSwapKey, isRemoteData, getTaskData, formatString, getIndex, DurationUnits, EditType, load, rowDataBound, queryCellInfo, toolbarClick, keyPressed, Edit$2 as Edit, Reorder$1 as Reorder, Resize$1 as Resize, Filter$2 as Filter, Sort$1 as Sort, Dependency, Selection$1 as Selection, Toolbar$3 as Toolbar, DayMarkers, Column, DayWorkingTime, AddDialogFieldSettings, EditDialogFieldSettings, EditSettings, EventMarker, FilterSettings, SearchSettings, Holiday, LabelSettings, SelectionSettings, SplitterSettings, TaskFields, TimelineTierSettings, TimelineSettings, TooltipSettings, SortDescriptor, SortSettings };
//# sourceMappingURL=ej2-gantt.es5.js.map
