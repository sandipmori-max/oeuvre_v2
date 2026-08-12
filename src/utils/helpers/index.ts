import { ERP_GIF, ERP_ICON } from "../../assets";
import { check, request, PERMISSIONS, RESULTS } from "react-native-permissions";
import moment from "moment";
import {
  Alert,
  Dimensions,
  Linking,
  PermissionsAndroid,
  Platform,
} from "react-native";
import RNFS from "react-native-fs";
import FastImage from "react-native-fast-image";
import { ERP_COLOR_CODE } from "../constants";
import messaging from "@react-native-firebase/messaging";
import Share from 'react-native-share';


export const formatDateMonthDateYear = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export function formatHeaderTitle(key: string): string {
  let result = key.replace(/[_\.\-]+/g, " ");
  result = result.replace(/([a-z])([A-Z])/g, "$1 $2");
  result = result.replace(/([a-zA-Z])([0-9]+)/g, "$1 $2");
  result = result.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
  return result.trim();
}

export const firstLetterUpperCase = (str: string): string => {
  if (!str) return "";
  return str
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export const getGifSource = (
  type: "error" | "success" | "info" | "location" | "confirmation" | "exit",
) => {
  switch (type) {
    case "error":
      return ERP_GIF.ERROR;
    case "location":
      return ERP_GIF.LOCATION;
    case "success":
      return ERP_GIF.SUCCESS;
    case "confirmation":
      return ERP_ICON.ALERT;
    case "exit":
      return ERP_ICON.EXITS;
    default:
      return ERP_GIF.SUCCESS;
  }
};

export const requestCameraPermission = async (): Promise<boolean> => {
  try {
    const cameraPerm =
      Platform.OS === "ios"
        ? PERMISSIONS.IOS.CAMERA
        : PERMISSIONS.ANDROID.CAMERA;
    const cameraStatus = await check(cameraPerm);
    let cameraGranted = false;
    if (cameraStatus === RESULTS.GRANTED) {
      cameraGranted = true;
    } else if (cameraStatus === RESULTS.DENIED) {
      const res = await request(cameraPerm);
      cameraGranted = res === RESULTS.GRANTED;
      if (!cameraGranted) {
        return false;
      }
    } else if (cameraStatus === RESULTS.BLOCKED) {
      return false;
    }
    return cameraGranted;
  } catch (error) {
    return false;
  }
};

export const requestCameraAndLocationPermission =
  async (): Promise<boolean> => {
    try {
      const cameraPerm =
        Platform.OS === "ios"
          ? PERMISSIONS.IOS.CAMERA
          : PERMISSIONS.ANDROID.CAMERA;

      const locationPerm =
        Platform.OS === "ios"
          ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE
          : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION;

      const cameraStatus = await check(cameraPerm);
      const locationStatus = await check(locationPerm);

      let cameraGranted = false;

      if (cameraStatus === RESULTS.GRANTED) {
        cameraGranted = true;
      } else if (cameraStatus === RESULTS.DENIED) {
        const res = await request(cameraPerm);
        cameraGranted = res === RESULTS.GRANTED;

        if (!cameraGranted) {
          return false;
        }
      } else if (cameraStatus === RESULTS.BLOCKED) {
        return false;
      }

      let locationGranted = false;

      if (locationStatus === RESULTS.GRANTED) {
        locationGranted = true;
      } else if (locationStatus === RESULTS.DENIED) {
        const res = await request(locationPerm);
        locationGranted = res === RESULTS.GRANTED;

        if (!locationGranted) {
          return false;
        }
      } else if (locationStatus === RESULTS.BLOCKED) {
        return false;
      }

      return cameraGranted && locationGranted;
    } catch (error) {
      return false;
    }
  };

export const formatDateList = (input: string) => {
  const inputDate = input.split(" ")[0];

  const today = new Date();
  const formattedToday =
    (today.getMonth() + 1).toString().padStart(2, "0") +
    "/" +
    today.getDate().toString().padStart(2, "0") +
    "/" +
    today.getFullYear();
  if (inputDate === formattedToday) {
    return "Today";
  } else {
    return input.replace(" ", input.length > 11 ? "\n" : " ");
  }
};

export function formatDateToDDMMMYYYY(dateStr: string): string {
  const formatDate = (date: Date): string => {
    const today = new Date();
    const isToday =
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();

    if (isToday) return "Today";

    const day = String(date.getDate()).padStart(2, "0");
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  };

  const dmyRegex = /^(\d{1,2}) (\w{3}) (\d{4})$/;
  const dmyMatch = dateStr.match(dmyRegex);
  if (dmyMatch) {
    const [, dayStr, monthStr, yearStr] = dmyMatch;
    const day = parseInt(dayStr, 10);
    const year = parseInt(yearStr, 10);
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const month = monthNames.findIndex(
      (m) => m.toLowerCase() === monthStr.toLowerCase(),
    );
    if (month >= 0) {
      const date = new Date(year, month, day);
      if (!isNaN(date.getTime())) {
        return formatDate(date);
      }
    }
  }

  const mdYRegex =
    /^(\d{1,2})\/(\d{1,2})\/(\d{4}) (\d{1,2}):(\d{2}):(\d{2}) (\w{2})$/;
  const mdYMatch = dateStr.match(mdYRegex);
  if (mdYMatch) {
    let [, month, day, year, hour, minute, second, ampm] = mdYMatch;
    month = month.padStart(2, "0");
    day = day.padStart(2, "0");

    let h = parseInt(hour, 10);
    if (ampm.toUpperCase() === "PM" && h < 12) h += 12;
    if (ampm.toUpperCase() === "AM" && h === 12) h = 0;

    const date = new Date(
      parseInt(year, 10),
      parseInt(month, 10) - 1,
      parseInt(day, 10),
      h,
      parseInt(minute, 10),
      parseInt(second, 10),
    );
    if (!isNaN(date.getTime())) {
      return formatDate(date);
    }
  }

  const fallbackDate = new Date(dateStr);
  if (!isNaN(fallbackDate.getTime())) {
    return formatDate(fallbackDate);
  }

  return "";
}

export function formatTimeTo12Hour(dateStr: string): string {
  const mdYRegex =
    /^(\d{1,2})\/(\d{1,2})\/(\d{4}) (\d{1,2}):(\d{2}):(\d{2}) (\w{2})$/;
  const match = dateStr.match(mdYRegex);
  if (match) {
    let [, month, day, year, hour, minute, , ampm] = match;
    hour = hour.padStart(2, "0");
    minute = minute.padStart(2, "0");
    return `${hour}:${minute} ${ampm.toUpperCase()}`;
  }

  const fallbackDate = new Date(dateStr);
  if (!isNaN(fallbackDate.getTime())) {
    const hours = fallbackDate.getHours();
    const minutes = fallbackDate.getMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";
    const hour12 = hours % 12 || 12;
    const paddedMinutes = minutes.toString().padStart(2, "0");
    return `${hour12}:${paddedMinutes} ${ampm}`;
  }

  return "";
}

export const parseCustomDate = (dateStr: string): Date => {
  const [day, monthStr, year] = dateStr.split("-");
  const month = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ].indexOf(monthStr);
  return new Date(Number(year), month, Number(day));
};

export const parseCustomDatePage = (dateStr: string): Date => {
  if (!dateStr) return new Date();

  if (!isNaN(Date.parse(dateStr))) {
    return new Date(dateStr);
  }

  const [datePart, timePart, ampm] = dateStr.split(" ");
  const [month, day, year] = datePart.split("/").map(Number);

  let hours = 0,
    minutes = 0,
    seconds = 0;
  if (timePart) {
    const [h, m, s] = timePart.split(":").map(Number);
    hours = h % 12;
    if (ampm?.toUpperCase() === "PM") hours += 12;
    minutes = m;
    seconds = s;
  }

  return new Date(year, month - 1, day, hours, minutes, seconds);
};

export const formatDatePage = (dateStr: string): string => {
  if (!dateStr) return "";

  let date: Date;

  if (!isNaN(Date.parse(dateStr))) {
    date = new Date(dateStr);
  } else {
    const [datePart, timePart, ampm] = dateStr.split(" ");
    const [month, day, year] = datePart.split("/").map(Number);

    let hours = 0,
      minutes = 0,
      seconds = 0;
    if (timePart) {
      const [h, m, s] = timePart.split(":").map(Number);
      hours = h % 12;
      if (ampm?.toUpperCase() === "PM") hours += 12;
      minutes = m;
      seconds = s;
    }

    date = new Date(year, month - 1, day, hours, minutes, seconds);
  }

  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = date.getFullYear();

  return `${dd}-${mm}-${yyyy}`;
};

export const findKeyByKeywords = (obj: any, keywords: string[]) => {
  if (!obj) return null;
  const lowerKeys = Object.keys(obj).map((k) => k.toLowerCase());
  for (const keyword of keywords) {
    const found = lowerKeys.find((k) => k.includes(keyword.toLowerCase()));
    if (found) return found;
  }
  return null;
};

export const formatDateForAPI = (date: Date): string => {
  const day = String(date.getDate()).padStart(2, "0");
  const month = date.toLocaleDateString("en-US", { month: "short" });
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

export const generateGUID = () => {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

export const formatDate = (dateStr) => {
  const date = moment(dateStr);
  if (moment().isSame(date, "day")) return "Today";
  if (moment().subtract(1, "day").isSame(date, "day")) return "Yesterday";
  return date.format("MMM DD, YYYY");
};

export function formatDateHr(input, isFullDate) {
  if (!input) return input;

  const normalized = input?.replace(" ", "T");
  const date = new Date(normalized);

  if (isNaN(date.getTime())) {
    const [mdy, time, ampm] = input?.split(" ");
    const [m, d, y] = (mdy || "").split("/").map(Number);
    let [hh, mm, ss] = (time || "").split(":").map(Number);

    if (ampm === "PM" && hh < 12) hh += 12;
    if (ampm === "AM" && hh === 12) hh = 0;

    const parsed = new Date(y, m - 1, d, hh, mm, ss);
    if (isNaN(parsed.getTime())) {
      return input;
    }
    return buildFormatted(parsed, isFullDate);
  }

  return buildFormatted(date, isFullDate) || input;
}

function buildFormatted(date, isFullDate) {
  if (isNaN(date?.getTime?.())) return null;
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const day = String(date.getDate()).padStart(2, "0");
  const month = months[date.getMonth()];
  const year = date.getFullYear();

  let hours = date.getHours() || 12;
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  if (isFullDate) {
    return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
  } else {
    return `${day}-${month}-${year}`;
  }
}

export const isTokenValid = (tokenValidTill: string) => {
  return new Date(tokenValidTill).getTime() > Date.now();
};

export async function requestLocationPermissions(): Promise<
  "granted" | "foreground-only" | "denied" | "blocked"
> {
  if (Platform.OS === "android") {
    try {
      const granted = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
        PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION,
      ]);

      const fine = granted["android.permission.ACCESS_FINE_LOCATION"];
      const coarse = granted["android.permission.ACCESS_COARSE_LOCATION"];
      const background =
        granted["android.permission.ACCESS_BACKGROUND_LOCATION"];

      const allGranted =
        fine === PermissionsAndroid.RESULTS.GRANTED &&
        coarse === PermissionsAndroid.RESULTS.GRANTED &&
        background === PermissionsAndroid.RESULTS.GRANTED;

      if (allGranted) return "granted";

      const foregroundGranted =
        fine === PermissionsAndroid.RESULTS.GRANTED &&
        coarse === PermissionsAndroid.RESULTS.GRANTED &&
        background !== PermissionsAndroid.RESULTS.GRANTED;

      if (foregroundGranted) {
        return "foreground-only";
      }

      const blocked =
        fine === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN ||
        coarse === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN ||
        background === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN;

      if (blocked) {
        return "blocked";
      }

      return "denied";
    } catch (err) {
      return "denied";
    }
  }
  return "granted";
}

export const formatTo12Hour = (time: string) => {
  if (!time) return "--";
  const [hourStr, minute] = time.split(":");
  let hour = parseInt(hourStr, 10);

  const suffix = hour >= 12 ? "PM" : "AM";
  hour = hour % 12 || 12;

  return `${hour.toString().padStart(2, "0")}:${minute} ${suffix}`;
};

export const isLatePunchIn = (punchIn: string) => {
  if (!punchIn) return false;
  const [hours, minutes] = punchIn.split(":").map(Number);
  return hours > 10 || (hours === 10 && minutes > 15);
};

export const isAfter830 = (punchIn: string) => {
  if (!punchIn) return false;
  const [hours, minutes] = punchIn.split(":").map(Number);
  return hours > 8 || (hours === 8 && minutes > 30);
};

export const isBefore830 = (punchIn: string) => {
  if (!punchIn) return false;
  const [hours, minutes] = punchIn.split(":").map(Number);
  return hours < 8 || (hours === 8 && minutes < 30);
};

export const normalizeDate = (dateStr: string) => {
  const [day, monthStr, year] = dateStr && dateStr.split(" ");
  const monthMap: Record<string, string> = {
    Jan: "01",
    Feb: "02",
    Mar: "03",
    Apr: "04",
    May: "05",
    Jun: "06",
    Jul: "07",
    Aug: "08",
    Sep: "09",
    Oct: "10",
    Nov: "11",
    Dec: "12",
  };
  return `${year}-${monthMap[monthStr]}-${day.padStart(2, "0")}`;
};

export const getWorkedHours = (punchIn: string, punchOut: string): number => {
  if (!punchIn || !punchOut) return 0;
  const [inH, inM] = punchIn.split(":").map(Number);
  const [outH, outM] = punchOut.split(":").map(Number);
  const inDate = new Date(0, 0, 0, inH, inM);
  const outDate = new Date(0, 0, 0, outH, outM);
  return (outDate.getTime() - inDate.getTime()) / 1000 / 60 / 60;
};
export const getWorkedHours2 = (punchIn: string, punchOut: string) => {
  if (!punchIn || !punchOut) return "0:00 hr";

  const [inH, inM] = punchIn.split(":").map(Number);
  const [outH, outM] = punchOut.split(":").map(Number);

  if (isNaN(inH) || isNaN(inM) || isNaN(outH) || isNaN(outM)) {
    return "0:00 hr";
  }

  const inDate = new Date(0, 0, 0, inH, inM);
  const outDate = new Date(0, 0, 0, outH, outM);

  let diffMs = outDate.getTime() - inDate.getTime();
  if (diffMs <= 0) return "0:00 hr";

  const totalMinutes = Math.floor(diffMs / 60000);

  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;

  return `${hours - 1}:${mins.toString().padStart(2, "0")} hr`;
};
export const clearAllTempFiles = async () => {
  try {
    const tempDir = RNFS.TemporaryDirectoryPath;
    const files = await RNFS.readDir(tempDir);

    for (const file of files) {
      try {
        await RNFS.unlink(file.path);
      } catch (err) {
        // ignore individual file failure
      }
    }
  } catch (err) {
    // ignore temp cleanup failure
  }
};

export const getShadowProps = (
  offset: number = 2,
  radius: number = 8,
  opacity: number = 0.2,
) => ({
  shadowColor: "#000",
  shadowOffset: {
    width: 0,
    height: offset,
  },
  shadowOpacity: opacity,
  shadowRadius: radius,
  elevation: radius,
});

export const isIos = Platform.OS === "ios";
export const isAndroid = Platform.OS === "android";

export const getWindowWidth = () => Dimensions.get("window").width;
export const getWindowHeight = () => Dimensions.get("window").height;

export const goToSettings = () => {
  if (isIos) {
    Linking.openURL("app-settings:");
  } else {
    Linking.openSettings();
  }
};

export const handlePhonePress = async (phoneNumber: string) => { 
  const url = `tel:${phoneNumber}`;
  console.log("Constructed phone URL:", url);
  console.log("Opening dialer with URL:", url);
  Linking.openURL(url);
};


export const handleEmailPress = async (emailAddress: string) => {
  const url = `mailto:${emailAddress}`;
  Linking.openURL(url);
};
export const handleLocationPress = (location: string) => {
  if (!location) return;

  // Split the string into latitude and longitude
  const [lat, lng] = location.split(",").map((coord) => coord.trim());

  // Construct URL for maps
  const url = Platform.select({
    ios: `http://maps.apple.com/?ll=${lat},${lng}`, // Apple Maps on iOS
    android: `geo:${lat},${lng}?q=${lat},${lng}`, // Google Maps on Android
  });

  Linking.canOpenURL(url!)
    .then((supported) => {
      if (supported) {
        Linking.openURL(url!);
      } else {
        Linking.openURL(
          `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`,
        );
      }
    })
    .catch((err) => console.error("Error opening map:", err));
};

//   =
// Operators (camelCase full names)
//   =
const operators = {
  // Equality
  equals: (a, b) => {
    if (a === null || a === undefined) a = "";
    if (b === null || b === undefined) b = "";

    if (typeof a === "string") a = a.trim();
    if (typeof b === "string") b = b.trim();

    return a === b;
  },

  notEquals: (a, b) => {
    if (a === null || a === undefined) a = "";
    if (b === null || b === undefined) b = "";

    if (typeof a === "string") a = a.trim();
    if (typeof b === "string") b = b.trim();

    return a !== b;
  },

  // Numeric
  greaterThan: (a, b) => {
    if (
      a === "" ||
      a === null ||
      a === undefined ||
      b === "" ||
      b === null ||
      b === undefined
    ) {
      return false;
    }

    const numA = Number(a);
    const numB = Number(b);

    if (isNaN(numA) || isNaN(numB)) {
      return false;
    }

    return numA > numB;
  },

  greaterThanOrEqual: (a, b) => {
    if (a === "" || a === null || a === undefined) return false;
    if (b === "" || b === null || b === undefined) return false;

    const numA = Number(a);
    const numB = Number(b);

    if (isNaN(numA) || isNaN(numB)) return false;

    return numA >= numB;
  },

  lessThan: (a, b) => {
    if (
      a === "" ||
      a === null ||
      a === undefined ||
      b === "" ||
      b === null ||
      b === undefined
    ) {
      return false;
    }

    const numA = Number(a);
    const numB = Number(b);

    if (isNaN(numA) || isNaN(numB)) {
      return false;
    }
    return numA < numB;
  },

  lessThanOrEqual: (a, b) => {
    if (
      a === "" ||
      a === null ||
      a === undefined ||
      b === "" ||
      b === null ||
      b === undefined
    ) {
      return false;
    }

    const numA = Number(a);
    const numB = Number(b);

    if (isNaN(numA) || isNaN(numB)) {
      return false;
    }

    return numA <= numB;
  },

  // String
  containsString: (a, b) =>
    typeof a === "string" && typeof b === "string" && a.includes(b),
  startsWithString: (a, b) =>
    typeof a === "string" && typeof b === "string" && a.startsWith(b),
  endsWithString: (a, b) =>
    typeof a === "string" && typeof b === "string" && a.endsWith(b),

  // Array
  inArray: (a, b) => Array.isArray(b) && b.includes(a),
  notInArray: (a, b) => Array.isArray(b) && !b.includes(a),

  // Empty / Non-empty
  isEmpty: (a) => a === null || a === undefined || a === "",
  isNotEmpty: (a) => a !== null && a !== undefined && a !== "",

  // Boolean
  isTruthy: (a) => Boolean(a),
  isFalsy: (a) => !Boolean(a),

  // Regex
  matchesRegex: (a, b) => typeof a === "string" && new RegExp(b).test(a),

  // Dates
  isBeforeDate: (a, b) => new Date(a) < new Date(b),
  isAfterDate: (a, b) => new Date(a) > new Date(b),

  locationWithin: (a, b, meters = 50) => {
    if (!a || !b) return false;

    const radius = Number(meters);
    if (isNaN(radius)) return false;

    const [lat1, lon1] = a.split(",").map(Number);
    const [lat2, lon2] = b.split(",").map(Number);

    // return getDistanceInMeters(lat1, lon1, lat2, lon2) <= radius;
     const distance = getDistanceInMeters(
    lat1,
    lon1,
    lat2,
    lon2
  );

  return {
    isValid: distance <= radius,
    distance: Math.round(distance),
    source: {
      lat: lat1,
      lon: lon1,
    },
    target: {
      lat: lat2,
      lon: lon2,
    },
  };
  },
  between: (a, min, max) => {
    const num = Number(a);
    return num >= Number(min) && num <= Number(max);
  },

  notBetween: (a, min, max) => {
    const num = Number(a);
    return num < Number(min) || num > Number(max);
  },

  isNumber: (a) => !isNaN(a) && a !== null && a !== "",
  equalsIgnoreCase: (a, b) =>
    typeof a === "string" &&
    typeof b === "string" &&
    a.toLowerCase() === b.toLowerCase(),

  notContainsString: (a, b) =>
    typeof a === "string" && typeof b === "string" && !a.includes(b),

  stringLengthEquals: (a, b) => typeof a === "string" && a.length === Number(b),

  stringLengthGreaterThan: (a, b) =>
    typeof a === "string" && a.length > Number(b),

  stringLengthLessThan: (a, b) => typeof a === "string" && a.length < Number(b),
  isToday: (a) => {
    const d = new Date(a);
    const t = new Date();
    return d.toDateString() === t.toDateString();
  },

  isPast: (a) => new Date(a) < new Date(),

  isFuture: (a) => new Date(a) > new Date(),

  daysDifferenceGreaterThan: (a, b) => {
    const diff = Math.abs(new Date(a) - new Date());
    return diff / (1000 * 60 * 60 * 24) > Number(b);
  },
};

const getDistanceInMeters = (lat1, lon1, lat2, lon2) => {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const aaaa = R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)))
  console.log("R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)))", aaaa  )
  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
};

//   =
// Evaluate Condition
//   =
const evaluateCondition = (rule, values) => {
  if (!rule || !rule.operator) return false;

  const leftValue = values[rule.left];
  const rightValue =
    typeof rule.right === "string" && values.hasOwnProperty(rule.right)
      ? values[rule.right]
      : rule.right;

  const operatorFn = operators[rule.operator];
  if (!operatorFn) {
    console.warn(`Unsupported operator: ${rule.operator}`);
    return false;
  }

  // return operatorFn(leftValue, rightValue, rule.meters);
  const result = operatorFn(
  leftValue,
  rightValue,
  rule.meters
);

if (
  rule.operator === "locationWithin" &&
  typeof result === "object"
) {
  return result;
}

return result;
};

export const evaluateRules = (condition, values) => {
  if (!condition) return false;

  if (Array.isArray(condition.rules)) {
    const results = condition.rules.map((rule) => evaluateRules(rule, values));
    return condition.logic === "OR"
      ? results.some(Boolean)
      : results.every(Boolean);
  }

  return evaluateCondition(condition, values);
};

export const computeControlVisibility = (
  rules: any[] | null,
  formValues: Record<string, any>,
  logic: "AND" | "OR" = "AND",
): boolean => {
  if (!rules || !Array.isArray(rules) || rules.length === 0) {
    return true;
  }

  const results = rules.map((rule) => evaluateRules(rule, formValues));

  return logic === "OR" ? results.some(Boolean) : results.every(Boolean);
};

const evaluateCondition2 = (rule, values) => {
  if (!rule || !rule.operator) return false;

  const leftValue = values[rule.left];
  const rightValue =
    typeof rule.right === "string" && values.hasOwnProperty(rule.right)
      ? values[rule.right]
      : rule.right;

  const operatorFn = operators[rule.operator];
  if (!operatorFn) {
    console.warn(`Unsupported operator: ${rule.operator}`);
    return false;
  }

  // return operatorFn(leftValue, rightValue, rule.meters);
  const result = operatorFn(
  leftValue,
  rightValue,
  rule.meters
);

if (
  rule.operator === "locationWithin" &&
  typeof result === "object"
) {
  return result;
}

return result;
};

export const evaluateRules2 = (condition, values) => {
  if (!condition) return false;

  // Nested rules
  if (condition.logic && Array.isArray(condition.rules)) {
    const results = condition.rules.map((rule) => evaluateRules2(rule, values));

    return condition.logic === "OR"
      ? results.some(Boolean)
      : results.every(Boolean);
  }

  // Leaf rule
  return evaluateCondition2(condition, values);
};

export const collectActionsFromRule2 = (rule, values) => {
  const result = evaluateRules2(rule, values);

  if (result && rule.validActions) {
    return rule.validActions;
  }

  if (!result && rule.invalidActions) {
    return rule.invalidActions;
  }

  return [];
};

export const evaluateRulesWithActionsv1 = (
  rules,
  formValues,
  logic = "AND",
) => {
  if (!rules) return { isValid: true, actions: [] };

  const ruleArray = Array.isArray(rules) ? rules : [rules];

  const results = [];
  let actions = [];

  ruleArray.forEach((rule) => {
    const isValid = evaluateRules(rule, formValues);
    results.push(isValid);

    actions = actions.concat(collectActionsFromRule2(rule, formValues));
  });

  const finalResult =
    logic === "OR" ? results.some(Boolean) : results.every(Boolean);

  return { isValid: finalResult, actions };
};

export const applyActionsToControls = (controls, actions) => {
  if (!actions || actions.length === 0) return controls;

  return controls.map((ctrl) => {
    const fieldActions = actions.filter((a) => a.field === ctrl.field);
    if (fieldActions.length === 0) return ctrl;

    return fieldActions.reduce((updatedCtrl, action) => {
      switch (action.action) {
        case "hide":
          return { ...updatedCtrl, visible: "1" };
        case "background":
          return { ...updatedCtrl, background: action.background };
        case "borderColor":
          return { ...updatedCtrl, borderColor: action.borderColor };
        case "unhide":
          return { ...updatedCtrl, visible: "0" };
        case "disable":
          return { ...updatedCtrl, disabled: "1" };
        case "enable":
          return { ...updatedCtrl, disabled: "0" };
        case "setValue":
          return { ...updatedCtrl, text: action.value, dtext: action.value };
        case "setBoolValue":
          return { ...updatedCtrl, text: action.value, field: action.value };
          case "mandatory":
            return {
              ...updatedCtrl,
              mandatory: "1", // ya true, tumhare control structure ke hisab se
            };

          case "optional":
            return {
              ...updatedCtrl,
              mandatory: "0", // ya false
            };
        default:
          return updatedCtrl;
      }
    }, ctrl);
  });
};

const collectFailedMessages = (
  condition,
  values,
  messages = []
) => {
  if (!condition) return messages;

  // nested rules
  if (
    condition.logic &&
    Array.isArray(condition.rules)
  ) {
    condition.rules.forEach((rule) => {
      collectFailedMessages(rule, values, messages);
    });

    return messages;
  }

  // leaf rule
  const result = evaluateCondition(
  condition,
  values
);

console.log("condition-----", condition)

const isValid =
  typeof result === "object"
    ? result.isValid
    : result;

if (!isValid && condition.message) {
  messages.push({
    field: condition.left,
    message:
      condition?.operator === 'locationWithin'
  ? `${condition.message}${result?.distance ? `\n\t You are not within range [ Distance ${result.distance} meter ]` : ''}`.trim()
  : condition.message,
  });
}

  return messages;
};

export const evaluateRulesWithActions = (
  rules,
  formValues,
  logic = "AND"
) => {
  if (!rules) {
    return {
      isValid: true,
      actions: [],
      messages: [],
      fieldErrors: [],
    };
  }

  const ruleArray = Array.isArray(rules)
    ? rules
    : [rules];

  const results = [];

  let actions = [];
  let messages = [];
  let fieldErrors = [];

  ruleArray.forEach((rule) => {
    const isValid = evaluateRules(
      rule,
      formValues
    );

    results.push(isValid);

    actions = actions.concat(
      collectActionsFromRule2(
        rule,
        formValues
      )
    );

    const failedMessages =
      collectFailedMessages(
        rule,
        formValues
      );

    messages = messages.concat(
      failedMessages.map(
        (x) => x.message
      )
    );

    // 🔥 field validations
    fieldErrors = fieldErrors.concat(
    failedMessages.map((x) => x.message)
  );
  });

  const finalResult =
    logic === "OR"
      ? results.some(Boolean)
      : results.every(Boolean);

  return {
    isValid: finalResult,
    actions,
    messages,
    fieldErrors,
  };
};

export const evaluateFormula = (formula, values) => {
  let expression = formula;

  Object.keys(values).forEach((key) => {
    const val = Number(values[key]) || 0;
    const regex = new RegExp(`\\b${key}\\b`, "g");
    expression = expression.replace(regex, val);
  });

  try {
    return Function(`"use strict"; return (${expression})`)();
  } catch {
    return 0;
  }
};

export const runDynamicRules = (
  ruleBlocks: any,
  values: Record<string, any>,
  changedField: string
) => {
  let updatedValues = { ...values };
  let actions: any[] = [];
  let messages: string[] = [];

  ruleBlocks.forEach((block) => {
    const results: boolean[] = [];

    block.rules.forEach((rule: any) => {
      //   ===
      // 🔥 FORMULA RULE
      //   ===
      if (rule.type === "formula") {
        if (rule.triggerFields?.includes(changedField)) {
          updatedValues = applyFormula(rule, updatedValues);
        }

        // formula always treated as valid
        results.push(true);
      }

      //   ===
      // 🔥 CONDITION RULE
      //   ===
     else {
  const result = evaluateCondition(rule, updatedValues);

const isValid =
  typeof result === "object"
    ? result.isValid
    : result;

results.push(isValid);

if (isValid && rule.validActions) {
  actions = actions.concat(rule.validActions);
}

if (!isValid && rule.invalidActions) {
  actions = actions.concat(rule.invalidActions);
}

if (!isValid && rule.message) {
  messages.push(rule.message);
}
}
    });

    //   ===
    // 🔥 APPLY LOGIC (AND / OR)
    //   ===
    const finalResult =
      block.logic === "OR"
        ? results.some(Boolean)
        : results.every(Boolean);

    //   ===
    // 🔥 ACTIONS
    //   ===
    if (finalResult && block.validActions) {
      actions = actions.concat(block.validActions);
    }

    if (!finalResult && block.invalidActions) {
      actions = actions.concat(block.invalidActions);
    }
  });

  return {
    values: updatedValues,
    actions,
    messages,
  };
};
export const extractFormulaRulesFromActions = (actions = []) => {
  return actions
    .filter((a) => a.action === "calculate")
    .map((a) => {
      // 🔥 dateDiff
      if (a.formulaType === "dateDiff") {
        return {
          fieldName: a.field,
          formulaType: "dateDiff",
          fromField: a.fromField,
          toField: a.toField,
          inclusive: a.inclusive,
          triggerFields: [a.fromField, a.toField], // 🔥 important
        };
      }

      // 🔥 normal formula
      return {
        fieldName: a.field,
        formula: a.formula,
        minusField: a.minusField,
        triggerFields: Object.keys(a) // fallback (or manually define)
      };
    });
};

export const applyFormula = (config, values) => {
  // 🔥 DATE DIFF
  if (config.formulaType === "dateDiff" || config.formulaType === "datediff") {
    console.log("Date -------         ", config);

    const from = values[config.fromField];
    const to = values[config.toField];
    if (from && to && new Date(from) > new Date(to)) {
      return { ...values, [config.fieldName]: "-" };
    }
    if (!from || !to) {
      return { ...values, [config.fieldName]: "" };
    }

    const start = new Date(from);
    const end = new Date(to);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return { ...values, [config.fieldName]: "" };
    }

    // Calculate difference in milliseconds
    const diffTime = end - start;

    // Convert to full days
    let days = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    // Add 1 if inclusive or if same day
    if (config.inclusive || days === 0) {
      days += 1;
    }

    return {
      ...values,
      [config.fieldName]: days >= 0 ? days : 0,
    };
  }

  // 🔹 existing formula logic
  const total = evaluateFormula(config.formula, values);
  const minusVal = Number(values[config.minusField]) || 0;

  return {
    ...values,
    [config.fieldName]: total - minusVal,
  };
};
export const createPrompt = (dataText) => {
  const hour = new Date().getHours();

  let timeOfDay = "";
  if (hour < 12) timeOfDay = "morning";
  else if (hour < 17) timeOfDay = "afternoon";
  else timeOfDay = "evening";

  return `
  You are an intelligent ERP dashboard assistant.

  Your job is to quickly analyze dashboard data and greet the user with a short insight.

  Instructions:
  - Write only ONE short sentence.
  - Friendly and professional tone.
  - Start the sentence with "Good ${timeOfDay}".
  - Do NOT use any other greeting like "Good morning" randomly.
  - If workload is low, mention the team is free or relaxed.
  - If numbers are high, mention workload or activity is high.
  - If everything looks normal, give a positive greeting.
  - Do NOT repeat the dashboard numbers.
  - Keep the message simple and natural.

  Dashboard Data:
  ${dataText}

  Write the greeting insight.
  `;
};

const prepareDashboardForAI = (dashboard) => {
  if (!Array.isArray(dashboard)) return "";

  return dashboard
    .map((item) => {
      let value = item?.data || "";

      if (!value) return null;

      // HTML remove (future safety)
      value = value.replace(/<[^>]*>/g, "").trim();

      return `${item.title}: ${value}`;
    })
    .filter(Boolean)
    .join("\n");
};
export const getDashboardAI = async (dashboardData) => {
  try {
    const dataText = prepareDashboardForAI(dashboardData);
    if (!dataText) return null;

    const prompt = createPrompt(dataText);

    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization:
          "Bearer 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",
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [
          {
            role: "system",
            content: "You are an ERP dashboard assistant.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 40,
      }),
    });

    const json = await res.json();
    const message =
      json?.choices?.[0]?.message?.content?.replace(/"/g, "") || "";
    return message;
  } catch (error) {
    console.log("AI ERROR+++++++++", error);
    return null;
  }
};

export const getDashboardIcon = (type) => {
  if (!type) return "dashboard";

  const key = type.trim().toUpperCase();

  const iconMap = {
    SYSTEM: "settings-suggest",
    DISPATCH: "local-shipping",
    ACCOUNTS: "account-balance",
    LAB: "science",
    MAINTENANCE: "build",
    MARKETING: "campaign",
    PURCHASE: "shopping-cart",
    SALES: "point-of-sale",
    STORE: "store",
    ALL: "business",
    GENERAL: "generating-tokens",
    GRID: "grid-view",
  };

  return iconMap[key] || "business"; // default fallback
};

 export const getStatusPriority = (status) => {
    const s = status?.toLowerCase();

    if (s === "lwp-apply" || s === "lwp-approved") return 6;
    if (s === "leave") return 5;
    if (s === "half") return 4;
    if (s === "punch missing") return 3;
    if (s === "working") return 2;
    if (s === "fullday") return 1;

    return 0;
  };

 export const getColor = (status) => {
    const s = status?.toLowerCase();
    if (s === "lwp-approved") return "#f41010";
    if (s === "lwp-apply" || s === "lwp-approved") return "#f41010"; // black
    if (s === "leave") return ERP_COLOR_CODE.ERP_ERROR; // red
    if (s === "half") return "#ff9800"; // orange
    if (s === "punch missing") return "#9e9e9e"; // grey
    if (s === "working") return "#4caf50"; // green-ish
    if (s === "fullday") return "#4caf50";
    return ERP_COLOR_CODE.ERP_APP_COLOR;
  };


  export const requestNotificationPermission = async () => {
  try {
    const authStatus = await messaging().requestPermission();

    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      console.log("Notification Permission Granted");
      return true;
    }

    console.log("Notification Permission Denied");
    return false;
  } catch (error) {
    console.log("Permission Error", error);
    return false;
  }
};

export const requestAndroidPermission = async () => {
  if (Platform.OS !== "android") return true;

  if (Platform.Version < 33) {
    return true;
  }

  const granted = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
  );

  return granted === PermissionsAndroid.RESULTS.GRANTED;
};


 const getFileNameFromUrl = (
  url: string,
  mimeType?: string,
) => {
  try {
    const cleanUrl = url.split('?')[0];
    const name = cleanUrl.substring(
      cleanUrl.lastIndexOf('/') + 1,
    );

    // URL already contains filename
    if (name && name.includes('.')) {
      return decodeURIComponent(name);
    }

    // Generate filename
    const extension =
      mimeType?.split('/')[1] || 'bin';

    return `file_${Date.now()}.${extension}`;
  } catch {
    return `file_${Date.now()}.bin`;
  }
};

  //   // Download PDF
export const downloadAndShare = async (
  fileUrl: string,
  mimeType = 'application/octet-stream',
) => {
  console.log('========== DOWNLOAD & SHARE ==========');
  console.log('File URL:', fileUrl);
  console.log('Mime Type:', mimeType);

  try {
    const fileName = getFileNameFromUrl(fileUrl, mimeType);
    console.log('File Name:', fileName);

    const localPath = `${RNFS.CachesDirectoryPath}/${fileName}`;
    console.log('Local Path:', localPath);

    // Delete old file
    if (await RNFS.exists(localPath)) {
      console.log('Old file exists. Deleting...');
      await RNFS.unlink(localPath);
    }

    console.log('Starting download... ');

    const downloadResult = await RNFS.downloadFile({
      fromUrl: fileUrl,
      toFile: localPath,
      background: true,
      discretionary: true,
    }).promise;

    console.log('Download Result:', downloadResult);

    const exists = await RNFS.exists(localPath);
    console.log('File Exists:', exists);

    if (!exists) {
      throw new Error('Downloaded file does not exist.');
    }

    const stat = await RNFS.stat(localPath);
    console.log('File Stat:', stat);
    console.log('File Size:', stat.size);

    console.log('Sharing to WhatsApp...');

    const shareResult = await Share.shareSingle({
      social: Share.Social.WHATSAPP,
      url: `file://${localPath}`,
      type: mimeType,
      filename: fileName,
      failOnCancel: false,
    });

    console.log('Share Success:', shareResult);
    console.log('========== SUCCESS ==========');
  } catch (e: any) {
    Alert.alert('Error', `${JSON.stringify(e)}`)
    console.log('========== ERROR ==========');
    console.log('Error:', e);
    console.log('Error JSON:', JSON.stringify(e, null, 2));
    console.log('Code:', e?.code);
    console.log('Message:', e?.message);
    console.log('Stack:', e?.stack);
    console.log('===========================');
  }
};