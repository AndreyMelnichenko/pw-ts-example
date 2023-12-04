import { IEventDetails } from "./eventDetails"

export type ISearchPrefill = {
    source?: string
    category?: string
    subcategory?: string
} & IEventDetails
