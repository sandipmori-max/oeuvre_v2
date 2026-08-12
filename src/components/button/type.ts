import { TextStyle, ViewStyle } from "react-native";

export interface ERPButtonProps {
  text: string;
  onPress: () => void;
  color?: string;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  activeOpacity?: number;
  isLoading?: any;
  isApiLoading?: any
}
