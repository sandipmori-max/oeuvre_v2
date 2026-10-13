import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  BackHandler,
  StyleSheet,
  Platform,
  useWindowDimensions,
} from "react-native";

import { RESULTS } from "react-native-permissions";
import { usePermissions } from "../../../../permissions/usePermissions";
import { EPermissionTypes } from "../../../../constants";
import { goToSettings } from "../../../../utils/helpers";
import { CameraScanner } from "../../../../components/CameraScanner/CameraScanner";
import { ERP_COLOR_CODE } from "../../../../utils/constants";
import { useAppSelector } from "../../../../store/hooks";
import MaterialIcons from "@react-native-vector-icons/material-icons";
import InputError from "../../../../components/error/InputError";
import LableInfo from "./LableInfo";
import DeviceInfo from "react-native-device-info";

const ScanScreen = ({ item, errors , onValueChange}: any) => {
  const { askPermissions } = usePermissions(EPermissionTypes.CAMERA);
  const [cameraShown, setCameraShown] = useState(false);
  const [qrText, setQrText] = useState("");
  const { height, width } = useWindowDimensions();
  const isLandscape = width > height;
  const theme = useAppSelector((state) => state?.theme.mode);
  const isIpad =
    (Platform.OS === "ios" && Platform.isPad) || DeviceInfo.isTablet() || Platform.isTV;
  // Handle back button press
  function handleBackButtonClick() {
    if (cameraShown) {
      setCameraShown(false);
      return true;
    }
    return false;
  }

  useEffect(() => {
    BackHandler.addEventListener("hardwareBackPress", handleBackButtonClick);

    return () => {
      // BackHandler.removeEventListener('hardwareBackPress', handleBackButtonClick);
    };
  }, [cameraShown]);

  // Request Camera Permission
  const takePermissions = async () => {
    askPermissions()
      .then((response) => {
        if (
          response.type === RESULTS.LIMITED ||
          response.type === RESULTS.GRANTED
        ) {
          setCameraShown(true);
        }
      })
      .catch((error) => {
        if ("isError" in error && error.isError) {
          Alert.alert(
            error.errorMessage ||
            "Something went wrong while taking camera permission",
          );
        }

        if ("type" in error) {
          if (error.type === RESULTS.UNAVAILABLE) {
            Alert.alert("This feature is not supported on this device");
          } else if (
            error.type === RESULTS.BLOCKED ||
            error.type === RESULTS.DENIED
          ) {
            Alert.alert(
              "Permission Denied",
              "Please give permission from settings to continue using camera.",
              [
                { text: "Cancel", style: "cancel" },
                { text: "Go To Settings", onPress: () => goToSettings() },
              ],
            );
          }
        }
      });
  };

 
  // Handle scanned code
  const handleReadCode = (value: string) => {
    setQrText(value);
    setCameraShown(false);
    onValueChange(value)
  };

  return (
    <View >
      <LableInfo
        item={item}
        theme={theme} />

      {/* Scan Button or Camera */}
      <View style={[cameraShown && styles.container]}>
        {!cameraShown && (
          <TouchableOpacity
            onPress={takePermissions}
            activeOpacity={0.8}
            style={[styles.squareScanCard,
            {
              width: !isLandscape && isIpad ? "50%" : "100%",
              borderWidth: 1.5,
              borderRadius: 10,
              borderColor:
                theme === "dark" ? "#fff" : ERP_COLOR_CODE.ERP_APP_COLOR,
              marginBottom: 8,
              borderStyle: "dashed",
              backgroundColor: theme === "dark" ? "#000" : "#f8f9ff",
            }
            ]}
          >
            <MaterialIcons
              name="qr-code-scanner"
              size={42}
              color={"gray"}
            />
            <Text style={styles.squareScanText}>Tap to {item?.title}</Text>
          </TouchableOpacity>
        )}

        {/* Show Scanned Value */}
        {qrText !== "" && !cameraShown && (
          <View style={styles.resultBox}>
            <MaterialIcons name="check-circle" size={20} color="green" />
            <Text style={styles.resultText}>Scanned: {qrText}</Text>
          </View>
        )}

        {/* Camera Scanner Component */}
        {cameraShown && (
          <CameraScanner
            setIsCameraShown={setCameraShown}
            onReadCode={handleReadCode}
            item={item}
            onValueChange={onValueChange}
          />
        )}
      </View>
      {errors[item.field] && <InputError error={errors[item?.field]} />}
    </View>
  );
};

export default ScanScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 12,
    backgroundColor: "white",
    padding : 12
  },
  label: {
    fontSize: 15,
    color: ERP_COLOR_CODE.ERP_333,
    fontWeight: "700",
    marginBottom: 4,
  },
  subLabel: {
    fontSize: 13,
    color: ERP_COLOR_CODE.ERP_333,
    opacity: 0.8,
    marginBottom: 8,
  },

  /* New Modern Scan Button */
  scanButton: {
    width: "100%",
    backgroundColor: "#1976D2",
    borderRadius: 10,
    paddingVertical: 14,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
  },
  scanButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },

  /* Scan Result Box */
  resultBox: {
    marginVertical: 2,
    marginBottom: 8,
    padding: 10,
    borderRadius: 8,
    backgroundColor: "#E8F5E9",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  resultText: {
    fontSize: 15,
    color: "#2E7D32",
    fontWeight: "600",
  },

  itemText: {
    fontSize: 17,
    color: "black",
  },
  squareScanCard: {
    width: "100%",
    aspectRatio: 3,
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: "#4c6ef5",
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  squareScanText: {
    marginTop: 10,
    fontSize: 14,
    color : 'gray'
  },
});
