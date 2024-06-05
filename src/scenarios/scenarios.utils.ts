export function areTimeIntervalsOverlapping(
  start1: Date,
  end1: Date,
  start2: Date,
  end2: Date,
): boolean {
  // Saat ve dakikaları çıkart
  const start1Minutes = start1.getHours() * 60 + start1.getMinutes();
  const end1Minutes = end1.getHours() * 60 + end1.getMinutes();
  const start2Minutes = start2.getHours() * 60 + start2.getMinutes();
  const end2Minutes = end2.getHours() * 60 + end2.getMinutes();

  // Zaman aralıklarının çakışıp çakışmadığını kontrol et
  return start1Minutes < end2Minutes && start2Minutes < end1Minutes;
}

export function areNowBetweenTimeIntervals(start: Date, end: Date): boolean {
  const now = new Date();
  const nowMinute = now.getHours() * 60 + now.getMinutes();

  const startMinute = start.getHours() * 60 + start.getMinutes();
  const endMinute = end.getHours() * 60 + end.getMinutes();

  return startMinute <= nowMinute && nowMinute <= endMinute;
}
