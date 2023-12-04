import { IUser } from "../models/user"
import * as StringHelper from "./stringHelper"

export const getUser = (type: string): IUser => {
    return {
        businessName: `Test ${type} ${StringHelper.getRandomStr(5)}`,
        city: "London",
        email: `Test${type}${StringHelper.getRandomStr(8)}@inbucket.stage.gigmngr.com`,
        password: "A12345678",
        phone: StringHelper.getRandomNum(10),
    }

    }

export const getRandomArrayElementIndex = <T>(arr: Array<T>): number => {
    if (arr.length === 0) {
        throw new Error("Array is empty")
    }
    if (arr.length === 1) {
        return 0
    }

    return getRandomInt(0, arr.length - 1)
}

export const getRandomArrayElement = <T>(arr: Array<T>): T => {
    if (arr.length === 0) {
        throw new Error("Array is empty")
    }
    if (arr.length === 1) {
        if (!arr[0]) {
            throw new Error("Array Element not found")
        }

        return arr[0]
    }
    const randomElement = arr[getRandomInt(0, arr.length - 1)]
    if (!randomElement) {
        throw new Error("Array Element not found")
    }

    return randomElement
}

export const randomObjectProperty = <T extends object>(obj: T): T[keyof T] => {
    const keys = Object.keys(obj) as Array<keyof T>
    const randomIndex: number = getRandomInt(0, keys.length - 1)
    const randomProperty = keys[randomIndex]
    if (!randomProperty) {
        throw new Error("Element not found")
    }

    return obj[randomProperty]
}

export const getRandomInt = (min: number, max: number): number => {
    const minVal = Math.ceil(min)
    const maxVal = Math.floor(max)

    return Math.floor(Math.random() * (maxVal - minVal + 1)) + minVal
}

export const getSingUpRandomUser = (type: "Client" | "Supplier", user: IUser = getUser(type)): IUser => {
    return {
        ...getUser(type),
        ...user,
    }
}
