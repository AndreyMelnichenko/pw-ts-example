import moment from "moment"
import { Dates, Day, Days } from "../models/days"

export const getDayOfMonth = (): number => {
    return new Date().getDate()
}

export const getDaysInMonth =
    (year: number = new Date().getFullYear(), month: number = new Date().getMonth()): number => {
    return new Date(year, month, 0).getDate()
}

export const getDateFrom = (date: string, format: string): Date => {
    return new Date(`${moment(date, format).format("YYYY")}-${moment(date, format).format("MM")}-${moment(date, format).format("DD")}`)
}

export const getDateWithDayOffset = (dayOffset: number, date: Date = new Date()): Date => {
    return new Date(date.setDate(date.getDate() + dayOffset))
}

export const getDateString = (date: Date, format = "YYYY-MM-DD"): string => {
    return moment(new Date(date.getFullYear(), date.getMonth(), date.getDate())).format(format)
}

export const getDateWithFormat = (date: Date, format = "YYYY-MM-DD"): string => {
    return moment(date).format(format)
}

export const getDateStringWithOffsetInFormat = (dayOffset: number, format = "YYYY-MM-DD"): string => {
    const date: Date = getDateWithDayOffset(dayOffset)

    return moment(new Date(date.getFullYear(), date.getMonth(), date.getDate())).format(format)
}

export const isDateInCurrentMonth = (date: Date = new Date()): boolean => {
    const isYear = new Date().getFullYear() === date.getFullYear()
    const isMonth = (new Date().getMonth() + 1) === (date.getMonth() + 1)

    return isYear && isMonth
}

export const getFullDay = (date: Date = new Date(), format = "YYYY-MM-DD"): Day => {
    const dateTime = moment(date, format)

    return dateTime.format("dddd") as Day
}

export const getDayName = (dayNumber: number): Day => {
    return Days[dayNumber - 1] as Day
}

export const getMonthDays = (monthOffset = 0): Dates => {
    const date = moment(`${new Date().getFullYear()}-${new Date().getMonth() + monthOffset + 1}`, "YYYY-MM")
    const daysInMonth = date.daysInMonth()
    const month: Dates = []
    for (let i = 0; i < daysInMonth; i = i + 1) {
        const b = moment(`${new Date().getFullYear()}-${new Date().getMonth() + monthOffset + 1}-${i + 1}`,
            "YYYY-MM-DD")
        const dayName = b.format("dddd") as Day
        month.push({ day: i + 1, name: dayName, date: b.format("YYYY-MM-DD")})
    }

    return month
}

export const convertDateFromTo = (dateStr: string, srcFormat: string, dstFormat: string): string => {
    const date: Date = getDateFrom(dateStr, srcFormat)

    return getDateWithFormat(date, dstFormat)
}

export const getDatesArray = (datesAmount: number, offset: number): Array<string> => {
        const dateArr: Array<string> = []
        for (let i = 0; i <= datesAmount - 1; i = i + 1) {
            dateArr.push(getDateWithFormat(getDateWithDayOffset(offset + i), "D MMM YYYY"))
        }

    return dateArr
}

export const getNearFutureDate = (date: Date): Date => {
    if (date.getTime() < new Date().getTime()) {
        return new Date(date.getFullYear() + 1, date.getMonth(), date.getDate())
    }

    return date
}
