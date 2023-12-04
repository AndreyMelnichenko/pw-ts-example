export type Service = {
    id: string,
    pk: number,
    title: string,
    status: string
}

export type PackList = {
    services: Array<Service>
}
