import * as crypto from "crypto"
import fakerStatic from "faker"
import moment from "moment"
import { ISearchPrefill } from "../models/searchPrefill"

export const getRandomStr = (lenght: number): string => {
    return randomizer(lenght, "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789")
}

export const getRandomChar = (availableCharSet = "abcdfghijklmnopqrstuvwyz"): string => {
    return randomizer(1, availableCharSet)
}

export const getRandomText = (lenght: number): string => {
    let text = ""
    while (text.length <= lenght) {
        text = `${text} ${fakerStatic.lorem.word(10)}`
    }

    return text
}

export const getRandomNum = (lenght: number): string => {
    return randomizer(lenght, "0123456789")
}

export const capitalizerFirstLetter = (text: string): string => {
    return text.charAt(0).toUpperCase() + text.slice(1)
}

export const stringCapitalizer = (text: string): string => {
    if (text.includes(" ")) {
        const capArr: Array<string> = []
        const strArr: Array<string> = text.split(" ")
        strArr.forEach((str) => capArr.push(capitalizerFirstLetter(str)))

        return capArr.join(" ")
    }

    return capitalizerFirstLetter(text)
}

export const getTestCaseId = (testTitle: string): Array<string> => {
    const caseIds: Array<string> = []
    testTitle.match(/@C\d+/gm)?.forEach((el) => caseIds.push(el))

    return caseIds
}

export const queryparamsParser = (str: string): ISearchPrefill => {
    const strArr: Array<string> = str.split("&")
    const prefill: ISearchPrefill = {
        category: "",
        date: "",
        event_type_slug: "",
        guests_number: 0,
        location: "",
        source: "",
        subcategory: "",
    }
    for (const param of strArr) {
        const params: Array<string> = param.split("=")
        if ((params[0]) in prefill) {
            prefill[params[0]] = params[1]
            if (params[0] === "date") {
                prefill[params[0]] = moment(new Date(params[1] as string)).format("D MMM YYYY")
            }
        }
    }

    return prefill
}

export const randomizer = (lenght: number, inputStr: string): string => {
    let result = ""
    const charactersLength: number = inputStr.length
    for (let i = 0; i < lenght; i = i + 1) {
        result += inputStr.charAt(Math.floor(Math.random() * charactersLength))
    }

    return result
}

export const getSha256 = (inputStr: string): string => {
    return crypto.createHash("sha256")
            .update(inputStr)
            .digest("hex")
}

export const postCodeNormalizer = (postcode: string): string => {
    return `${postcode.substring(0, postcode.length - 3)} ${postcode.slice(postcode.length - 3, postcode.length)}`
}
