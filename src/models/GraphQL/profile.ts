export type Profile = {
    id: string
    pk: number
    roles: Array<string>
    impersonated: boolean
    email: string
    dateJoined: string
    client: { id: number, name: string }
    profile: ProfileClass
}

export type ProfileClass = {
    id: string
    banned: boolean
    currentPlan: CurrentPlan
}

export type CurrentPlan = {
    name: string
    id: string
    pk: number
}
