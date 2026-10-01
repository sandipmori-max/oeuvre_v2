import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  Linking,
} from "react-native";
import React, { useEffect, useState } from "react";
import { styles } from "../page_style";
import { ERP_COLOR_CODE } from "../../../../utils/constants";
import { useCurrentAddress } from "../../../../hooks/useCurrentLocation";
import MaterialIcons from "@react-native-vector-icons/material-icons";
import useTranslations from "../../../../hooks/useTranslations";
import { useAppSelector } from "../../../../store/hooks";
import LableInfo from "./LableInfo";

const LocationRow = ({
  locationEnabled,
  locationVisible,
  isValidate,
  item,
  value,
  setValue,
  isFromChild = false,
}: any) => {
  const {
    coords,
    address: hookAddress,
    loading,
    error,
    refetch,
  } = useCurrentAddress();

  const [address, setAddress] = useState<string>("");

  const { t } = useTranslations();
  const theme = useAppSelector((state) => state?.theme.mode);

  useEffect(() => {
    if (error) {
      setValue({
        [item?.field]: ``,
      });
      setAddress("");
      return;
    }

    if (!locationEnabled) {
      setValue({
        [item?.field]: ``,
      });
      setAddress("");
      return;
    }

    if (item?.text !== "" && item?.text !== "#location") {
      setAddress(item?.text);
      return;
    }

    if (!loading && hookAddress) {
      setValue({
        [item?.field]: hookAddress,
      });

      setAddress(
        hookAddress || `${coords?.latitude},${coords?.longitude}`
      );
    }
  }, [
    coords,
    loading,
    locationVisible,
    hookAddress,
    locationEnabled,
    error,
  ]);

  // Open location in Maps
  const openMap = async () => {
    try {
      // Prefer coordinates when available
      if (coords?.latitude && coords?.longitude) {
        const latitude = coords.latitude;
        const longitude = coords.longitude;

        if (Platform.OS === "ios") {
          const url = `http://maps.apple.com/?ll=${latitude},${longitude}&q=${latitude},${longitude}`;
          await Linking.openURL(url);
        } else {
          const url = `geo:${latitude},${longitude}?q=${latitude},${longitude}`;
          await Linking.openURL(url);
        }

        return;
      }

      // Fallback to address
      if (address) {
        const encodedAddress = encodeURIComponent(address);

        if (Platform.OS === "ios") {
          const url = `http://maps.apple.com/?q=${encodedAddress}`;
          await Linking.openURL(url);
        } else {
          const url = `geo:0,0?q=${encodedAddress}`;
          await Linking.openURL(url);
        }

        return;
      }

      // Nothing available - open Maps normally
      if (Platform.OS === "ios") {
        await Linking.openURL("http://maps.apple.com/");
      } else {
        await Linking.openURL("geo:0,0");
      }
    } catch (e) {
      console.log("Unable to open map:", e);
    }
  };

  return (
    <View
      style={{
        marginBottom: Platform.OS === "android" ? 6 : 8,
      }}
    >
      <LableInfo
        isFromChild={isFromChild}
        item={item}
        theme={theme}
        isFromDashboard={false}
        value={value}
      />

      {/* Address / Loading / Error */}
      <View
        style={[
          styles.disabledBox,
          theme === "dark" && {
            backgroundColor: ERP_COLOR_CODE.ERP_555,
          },
          isFromChild && {
            padding: 6,
            borderRadius: 4,
          },
        ]}
      >
        {loading ? (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <ActivityIndicator
              size="small"
              color={
                theme === "dark"
                  ? "white"
                  : ERP_COLOR_CODE.ERP_555
              }
            />

            <Text
              style={{
                marginLeft: 8,
                color:
                  theme === "dark"
                    ? "white"
                    : ERP_COLOR_CODE.ERP_555,
              }}
            >
              {t("text.text37")}
            </Text>
          </View>
        ) : address ? (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
            }}
          >
            {/* Address */}
            <Text
              style={{ 
                color:
                  theme === "dark"
                    ? "white"
                    : ERP_COLOR_CODE.ERP_333,
                flex: 1,
                marginRight: 8,
              }}
            >
              {address}
            </Text>

            {/* Map Button */}
            <TouchableOpacity
              style={{
                paddingVertical: 5,
                paddingHorizontal: 7,
                backgroundColor:
                  theme === "dark"
                    ? "white"
                    : ERP_COLOR_CODE.ERP_APP_COLOR,
                borderRadius: 6,
                alignItems: "center",
                justifyContent: "center",
              }}
              onPress={openMap}
              activeOpacity={0.7}
            >
              <MaterialIcons
                name="map"
                color={theme === "dark" ? "black" : "#fff"}
                size={18}
              />
            </TouchableOpacity>
          </View>
        ) : (
          <View
            style={{
              alignContent: "center",
              alignItems: "center",
              flexDirection: "row",
              width: "100%",
              justifyContent: "space-between",
            }}
          >
            <Text
              style={{
                color:
                  theme === "dark" ? "white" : "#999",
                width: "65%",
              }}
            >
              {error
                ? `${t("title.title1")}: ${error}`
                : t("text.text38")}
            </Text>

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 6,
              }}
            >
              {/* Refresh Button */}
              <TouchableOpacity
                style={{
                  paddingVertical: 4,
                  paddingHorizontal: 6,
                  backgroundColor:
                    theme === "dark"
                      ? "white"
                      : ERP_COLOR_CODE.ERP_APP_COLOR,
                  borderRadius: 6,
                }}
                onPress={refetch}
                activeOpacity={0.7}
              >
                <MaterialIcons
                  name="refresh"
                  color={
                    theme === "dark" ? "black" : "#fff"
                  }
                  size={18}
                />
              </TouchableOpacity>

              {/* Map Button - Always Active */}
              <TouchableOpacity
                style={{
                  paddingVertical: 4,
                  paddingHorizontal: 6,
                  backgroundColor:
                    theme === "dark"
                      ? "white"
                      : ERP_COLOR_CODE.ERP_APP_COLOR,
                  borderRadius: 6,
                }}
                onPress={openMap}
                activeOpacity={0.7}
              >
                <MaterialIcons
                  name="map"
                  color={
                    theme === "dark" ? "black" : "#fff"
                  }
                  size={18}
                />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </View>
  );
};

export default LocationRow;