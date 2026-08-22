import {Dayjs} from 'dayjs';

export default function getDatesBetween(start: Dayjs, end: Dayjs): Dayjs[] {
    const days = end.startOf('day').diff(start.startOf('day'), 'day');

    if (days < 0) return [];

    return Array.from(
        {length: days + 1},
        (_, i) => start.startOf('day').add(i, 'day')
    );
}
