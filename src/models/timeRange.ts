export type TimeRange = {
    from: Time
    to: Time
}
export type Time = {
    h: Hours, m?: Minutes
}
export type Hours = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12
| 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20 | 21 | 22 | 23 | 24
export type Minutes = 15 | 30 | 45
