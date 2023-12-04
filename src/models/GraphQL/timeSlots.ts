export type TimeSlots = {
    timeSlots: Array<TimeSlot>
}

export type TimeSlot = {
  pk: number,
  reason: string,
  providerId: string,
  dtStart: string,
  dtEnd: string
}
