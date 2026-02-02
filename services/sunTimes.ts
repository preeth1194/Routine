import * as Location from 'expo-location';
import SunCalc from 'suncalc';
import { format } from 'date-fns';

export type SunTimes = {
  sunrise: string; // "HH:mm"
  sunset: string;  // "HH:mm"
  sunriseMinutes: number;
  sunsetMinutes: number;
};

const DEFAULT_SUNRISE = '06:00';
const DEFAULT_SUNSET = '18:00';

function formatTime(date: Date): string {
  return format(date, 'HH:mm');
}

function toMinutes(timeStr: string): number {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
}

/**
 * Get sunrise and sunset times for a date at the user's location.
 * Falls back to 6:00 AM / 6:00 PM if location is unavailable.
 */
export async function getSunTimesForDate(date: Date): Promise<SunTimes> {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      return getDefaultSunTimes();
    }

    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    const { latitude, longitude } = location.coords;
    const times = SunCalc.getTimes(date, latitude, longitude);

    const sunrise = formatTime(times.sunrise);
    const sunset = formatTime(times.sunset);

    return {
      sunrise,
      sunset,
      sunriseMinutes: toMinutes(sunrise),
      sunsetMinutes: toMinutes(sunset),
    };
  } catch {
    return getDefaultSunTimes();
  }
}

function getDefaultSunTimes(): SunTimes {
  return {
    sunrise: DEFAULT_SUNRISE,
    sunset: DEFAULT_SUNSET,
    sunriseMinutes: toMinutes(DEFAULT_SUNRISE),
    sunsetMinutes: toMinutes(DEFAULT_SUNSET),
  };
}

export function formatSunTimeForDisplay(time: string): string {
  const [h, m] = time.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 || 12;
  return `${hour12}:${m.toString().padStart(2, '0')} ${period}`;
}
