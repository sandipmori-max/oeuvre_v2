import { Platform, View } from "react-native";
import {
  createStackNavigator,
  CardStyleInterpolators,
} from "@react-navigation/stack";

import SettingsScreen from "../screens/dashboard/settings/SettingsScreen";
import DrawerNavigator from "./DrawerNavigator";
import TabNavigator from "./TabNavigator";
import AttendanceScreen from "../screens/dashboard/attendance/AttendanceScreen";
// import DisplayScreen from "../screens/dashboard/display/DisplayScreen";
//  import WebScreen from "../screens/dashboard/web/WebScreen";
import ListScreen from "../screens/dashboard/list_page/ListScreen";
import PageScreen from "../screens/dashboard/page/Page";
import { ERP_COLOR_CODE } from "../utils/constants";
import StartupScreen from "../screens/dashboard/startup/StartupScreen";
import PinSetupScreen from "../screens/dashboard/pinset/Pinset";
import PinVerifyScreen from "../screens/dashboard/pinset/PinVerify";
import { useAppSelector } from "../store/hooks";
import MaterialIcons from "@react-native-vector-icons/material-icons";
import LocationTrackScreen from "../screens/dashboard/tabs/home/LocationTrack";
import FaceCameraScreen from "../screens/dashboard/attendance/components/FaceCameraScreen";
import PrivacyPolicyScreen from "../screens/dashboard/privacy/PrivacyPolicyScreen";
// import TextScannerScreen from "../screens/dashboard/page/components/TextScannerScreen";

const Stack = createStackNavigator<any>();

const StackNavigator = () => {
  const { isPinLoaded } = useAppSelector((state) => state?.auth);
  const smoothTransition = {
    gestureEnabled: Platform.OS === 'ios' ? true : false,
    cardStyleInterpolator: ({ current }) => ({
      cardStyle: {
        opacity: current.progress,
      },
    }),
  };

  const screenOptions = {
    headerShown: true,

    headerTitleAlign: "left",

    headerBackImage: () => (
      <View
        style={{
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <MaterialIcons
          name="chevron-left"
          size={28}
          color="#fff"
        />
      </View>
    ),

    headerStyle: {
      backgroundColor: ERP_COLOR_CODE.ERP_APP_COLOR,
      elevation: 0,
      shadowOpacity: 0,
    },
    headerBackTitleVisible: false,
    headerLeftContainerStyle: {
      paddingLeft: Platform.OS === 'ios'  ? 10 : 6,
      marginLeft: 0,
    },

    headerRightContainerStyle: {
      paddingRight: 0,
      marginRight: 0,
    },

    headerTitleContainerStyle: {
      left: 0,
      right: 0,
      paddingHorizontal: 0,
      marginHorizontal: 0,
    },

    headerTintColor: ERP_COLOR_CODE.ERP_WHITE,

    headerTitleStyle: {
      fontSize: 14,
      fontWeight: "400",
      color: ERP_COLOR_CODE.ERP_WHITE,
      paddingHorizontal: 0,
      marginHorizontal: 0,
    },

    cardStyleInterpolator:
      CardStyleInterpolators.forHorizontalIOS,

     gestureEnabled: Platform.OS === 'ios' ? true : false,
    gestureDirection: "horizontal",

    transitionSpec: {
      open: {
        animation: "timing",
        config: {
          duration: 300,
        },
      },
      close: {
        animation: "timing",
        config: {
          duration: 300,
        },
      },
    },

    ...smoothTransition,
  };

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        headerStyle: {},
      }}
    >
      {isPinLoaded === true && (
        <Stack.Screen
          name="Startup"
          component={StartupScreen}
          options={smoothTransition}
        />
      )}
      <Stack.Screen
        name="Drawer"
        component={DrawerNavigator}
        options={smoothTransition}
      />
      <Stack.Screen
        options={screenOptions}
        name="Settings"
        component={SettingsScreen}
      />
      <Stack.Screen
        options={screenOptions}
        name="PinSet"
        component={PinSetupScreen}
      />
      <Stack.Screen
        options={{
          headerShown: false,
        }}
        name="PinVerify"
        component={PinVerifyScreen}
      />
      <Stack.Screen name="Home" component={TabNavigator} />
      <Stack.Screen
        name="Attendance"
        component={AttendanceScreen}
        options={{
          ...screenOptions,
          gestureEnabled: false,
        }}
      />

      <Stack.Screen
        options={screenOptions}
        name="MyAttendance"
        component={AttendanceScreen}
      />
      {/* <Stack.Screen
        options={screenOptions}
        name="Business"
        component={DisplayScreen}
      /> */}
      {/* <Stack.Screen options={screenOptions} name="File Manager" component={ScanScreen} /> */}
      <Stack.Screen
        options={{
          ...screenOptions,
          gestureEnabled: false,
        }}
        name="Privacy Policy"
        component={PrivacyPolicyScreen}
      />
      {/* <Stack.Screen 
        options={screenOptions}
        name="Web"
        component={WebScreen} 
      /> */}
      <Stack.Screen
        options={screenOptions}
        name="Page"
        component={PageScreen}
      />
      <Stack.Screen
        options={screenOptions}
        name="List"
        component={ListScreen}
      />
      <Stack.Screen
        options={screenOptions}
        name="LocationTrack"
        component={LocationTrackScreen}
      />
      <Stack.Screen

        options={{  // ❌ hide back button (iOS)
          gestureEnabled: false,    // ❌ disable swipe back (iOS)
        }}
        name="FaceCameraScreen" component={FaceCameraScreen} />
      {/* <Stack.Screen
        name="Tasks"
        component={DisplayScreen}
        options={screenOptions}
      /> */}
      {/* <Stack.Screen
  name="TextScannerScreen"
  component={TextScannerScreen}
  options={{
    headerShown: false,
  }}
/> */}
    </Stack.Navigator>
  );
};

export default StackNavigator;
