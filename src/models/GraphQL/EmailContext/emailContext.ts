export type EmailContext = {
    client_name: string
    quotes: Array<Quote>
    packages: Array<Package>
    search_link: string
    event_date: string
    event_type: string
    service: Service
    auto_login_link: string
    client_first_name: string
    quote_id: number
    submitted_quotes: Array<SubmittedQuote>
    main_event: MainEvent
    prefill_event_details: string
    cheap_packages: Array<AnotherPackage>
    expensive_packages: Array<AnotherPackage>
    first_offer_category: string
    first_offers: Array<AnotherPackage>
    second_offer_category: string
    second_offers: Array<AnotherPackage>
    alternative_categories: Array<AlternativeCategoriy>
    subcategory: { name: string }
    titled_categories: TitleCategory
    price: string
    supplier_name: string
    service_name: string
    deposit: string
    client_service_fee: string
    remaining_balance: string
    remaining_sum: string
}

export type Package = {
    id: number
    title: string
    price: string
    rating: number
    supplier_name: string
    username: string
    thumbnail: string
}

export type Quote = {
    id: number
    price: string
    title: string
    supplier_name: string
}

export type Service = {
    id: number
    price: string
    name: string
    image: string
    promo: string
    rating: number
}

export type SubmittedQuote = {
    id: number
    price: string
    title: string
    supplier_rating: number
    thumbnail: string
}

export type MainEvent = {
    id: number
    date: string
    type: string
}

export type AnotherPackage = {
    id: number
    price: string
    title: string
    supplier_rating: number
    thumbnail: string
    category: string
}

export type AlternativeCategoriy = {
    image: string
    name: string
    name_plural: string
    search_link: string
}

export type TitleCategory = {
    root: string
    from: string
    to: string
}
