import { Months } from "../../models/months"
import * as DateHelper from "../../utils/dateHelper"
import { SearchFilter } from "./searchFilter"

export class DatePicker extends SearchFilter {

    /**
     * @param eventDate format ["D MMM YYYY"] example: "24 Jul 2021"
     */
    async addDay(eventDate: string): Promise<void> {
        const expDate: Date = DateHelper.getDateFrom(eventDate, "D MMM YYYY")
        await this.setMonth(Months[expDate.getMonth()].toUpperCase())
        await this.setDay(expDate.getUTCDate().toString())
    }
}
