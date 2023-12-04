export type PackageCreation = {
    rootCategory?: string,
    childCategory?: string,
    serviceName?: string,
    pathToLogo?: string,
    photos?: Array<string>
    basePrice?: string,
    serviceDuration?: string,
    guestAmount?: {
        from?: string,
        to?: string
    }
    serviceDescription?: string,
    tellAboutService?: string,
    promoteText?: string,
    setsNumber?: string,
    postcode?: string,
    freeTravel?: string,
    maxTravel?: string,
    pricePerMail?: string,
    depositAmount?: string,
    videoLink?: string,
    setsDuration?: string,
    breakeBetweenSets?: string
}
