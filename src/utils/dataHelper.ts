import * as _ from "lodash"
import * as creds from "../../creds.json"
import { TestTypes } from "../models/testTypes"
import { IUser } from "../models/user"

export const getValueByKey = <T extends object, U extends keyof T>(obj: T, key: U): T[U] => {
    return obj[key]
}

export const getKeyByValue = <T extends object, U extends keyof T>(obj: T, value: T[U] | string): U => {
    const keys = Object.keys(obj) as Array<U>
    const key = keys.find((k) => _.isEqual(obj[k], value))
    if (!key) {
        throw new Error("Key not found")
    }

    return key
}

export const getClientServiceFee = (price: number, guestAmount = 1): number => {
    let overPrice = 0
    if (price > 490) {
        overPrice = price - 490
    }
    let normalCap = price  * 0.1
    if (normalCap < 9) {
        normalCap = 9
    }
    if (normalCap > 49) {
        normalCap = 49
    }
    const overCap = overPrice * 0.05

    return Number(((normalCap + overCap) * guestAmount).toFixed(0))
}

export const monthCharge = (basePrice: number, month: string): number => {
    const multiplicator = {
        April: 20,
        August: 40,
        December: 60,
        February: -10,
        January: 5,
        July: 35,
        June: 30,
        March: 15,
        May: 25,
        November: 55,
        October: 50,
        September: 45,
    }

    return Number(multiplicator[month]) + basePrice
}

export const dayCharge = (basePrice: number, day: string): number => {
    const multiplicator = {
        Friday: 5,
        Monday: 1,
        Saturday: -6,
        Sunday: -7,
        Thursday: 4,
        Tuesday: 2,
        Wednesday: 3,
    }

    return Number(multiplicator[day]) + basePrice
}

export const getSuppByName = (suppName: string): IUser => {
    const suppList = creds.supplier.filter((s) => s.email.split("@")[0] === suppName)
    if (suppList.length === 0) {
        throw new Error("Creds not found")
    }

    return suppList[0] as IUser
}

export const getClientByName = (clientName: string): IUser => {
    const clientList = creds.client.filter((s) => s.email.split("@")[0] === clientName)
    if (clientList.length === 0) {
        throw new Error("Creds not found")
    }

    return clientList[0] as IUser
}

export const getTestScopeRun = (tag: string): TestTypes => {
    let testScope: TestTypes = "e2e"
    if (tag === "e2e") testScope = "e2e"
    if (tag === "@C64") testScope = "seo"
    if (tag === "@vrt") testScope = "vrt"

    return testScope
}
