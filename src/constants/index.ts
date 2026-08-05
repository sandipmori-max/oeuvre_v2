import { Dimensions, Platform } from "react-native";
import { DrawerItemConfig } from "../components/types";

export const ERP_DRAWER_LIST: DrawerItemConfig[] = [
  { label: "Home", route: "Home", icon: "home" },
  { label: "Attendance", route: "Attendance", icon: "calendar-month" },
  { label: "Privacy Policy", route: "Privacy Policy", icon: "policy" },
  { label: "Rate Our App", route: "AppRatting", icon: "star-half" },
  { label: "About us", route: "AboutUs", icon: "info" },
];

export enum EPermissionTypes {
  CAMERA = "camera",
}

export const ERP_APP_VERSION = "1.4.6 - (1)"
export const HEADER_HEIGHT = Platform.OS === 'android' ? Math.min(
  50,
  Math.max(48, Dimensions.get("window").height * 0.065)
) : undefined;