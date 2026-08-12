import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  Image,
  Animated,
  Easing,
  Platform,
  useWindowDimensions,
} from "react-native";
import { styles } from "./components_style";
import { useAppDispatch, useAppSelector } from "../../../../../store/hooks";
import {
  getERPAppConfigMenuThunk,
  removeAccountThunk,
  switchAccountThunk,
} from "../../../../../store/slices/auth/thunk";
import { Account } from "../../../../../store/slices/auth/type";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { DevERPService } from "../../../../../services/api";
import CustomAlert from "../../../../../components/alert/CustomAlert";
import { ERP_ICON } from "../../../../../assets";
import { useApi } from "../../../../../hooks/useApi";
import {
  firstLetterUpperCase,
  formatDateHr,
  formatTimeTo12Hour,
  isTokenValid,
} from "../../../../../utils/helpers";
import MaterialIcons from "@react-native-vector-icons/material-icons";
import FastImage from "react-native-fast-image";
import { ERP_COLOR_CODE } from "../../../../../utils/constants";
import {
  clearAuthState,
  clearDashboardFilters,
  setActiveDashboardBranch,
  setActiveDashboardBranchId,
  setActiveDashboardType,
  setActiveDashboardTypeId,
  setBirthdayUsers,
  setDashboard,
  setEmptyMenu,
  setLoading,
  updateAppMenuList,
  updateSelectedFromDateState,
  updateSelectedToDateState,
} from "../../../../../store/slices/auth/authSlice";
import { resetAjaxState } from "../../../../../store/slices/ajax/ajaxSlice";
import { resetAttendanceState } from "../../../../../store/slices/attendance/attendanceSlice";
import { resetDropdownState } from "../../../../../store/slices/dropdown/dropdownSlice";
import { resetSyncLocationState } from "../../../../../store/slices/location/syncLocationSlice";
import { getLastPunchInThunk } from "../../../../../store/slices/attendance/thunk";
import { setReloadApp } from "../../../../../store/slices/reloadApp/reloadAppSlice";
import ImageBottomSheetModal from "../../../../../components/bottomsheet/ImageBottomSheetModal";
import { useTranslation } from "react-i18next";
import TranslatedText from "../../home/TranslatedText";
import { batch } from "react-redux";
import DeviceInfo from "react-native-device-info";


interface AccountSwitcherProps {
  visible: boolean;
  onClose: () => void;
  onAddAccount: () => void;
}

const AccountSwitcher: React.FC<AccountSwitcherProps> = ({
  visible,
  onClose,
  onAddAccount,
  tapLoader,
}: any) => {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const { execute: validateCompanyCode } = useApi();
  const theme = useAppSelector((state) => state?.theme.mode);
  const { height, width } = useWindowDimensions();
  const isLandscape = width > height;
  const [showModal, setShowModal] = useState(false);
  const [img, setImg] = useState("");
  const { accounts, activeAccountId, user } = useAppSelector(
    (state) => state?.auth,
  );
  const [alertVisible, setAlertVisible] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<any>(null);
  const [alertConfig, setAlertConfig] = useState({
    title: "",
    message: "",
    type: "info" as "error" | "success" | "info" | "confirmation",
  });
const isIpad =
   ( Platform.OS === "ios" && Platform.isPad) || DeviceInfo.isTablet() || Platform.isTV;
 const profileImageTimestamp = useRef(Date.now()).current;
  // Animated values
  const slideAnim = useRef(new Animated.Value(0)).current; // modal
  const buttonAnim = useRef(new Animated.Value(0)).current; // add account button
  const listAnim = useRef(accounts.map(() => new Animated.Value(0))).current; // flatlist items

  const pressAnim = useRef(new Animated.Value(1)).current;
  const pressItemAnim = useRef(new Animated.Value(1)).current;
  const onPressItemIn = () => {
    Animated.spring(pressItemAnim, {
      toValue: 0.86,
      useNativeDriver: true,
    }).start();
  };

  const onPressItemOut = () => {
    Animated.spring(pressItemAnim, {
      toValue: 1,
      friction: 4,
      tension: 150,
      useNativeDriver: true,
    }).start();
  };
  const onPressIn = () => {
    Animated.spring(pressItemAnim, {
      toValue: 0.86,
      useNativeDriver: true,
    }).start();
  };

  const onPressOut = () => {
    Animated.spring(pressAnim, {
      toValue: 1,
      friction: 4,
      tension: 150,
      useNativeDriver: true,
    }).start();
  };

  // Animate modal in/out
  useEffect(() => {
    if (visible) {
      slideAnim.setValue(0);
      Animated.timing(slideAnim, {
        toValue: 1,
        duration: 400,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start();

      // Animate Add Account button
      buttonAnim.setValue(0);
      Animated.timing(buttonAnim, {
        toValue: 1,
        duration: 600,
        delay: 600,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start();

      // Animate FlatList items staggered
      listAnim.forEach((anim, index) => {
        anim.setValue(0);
        Animated.timing(anim, {
          toValue: 1,
          duration: 700,
          delay: 100 + index * 100,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }).start();
      });
    }
  }, [visible, slideAnim, buttonAnim, listAnim]);

  const handleSwitchAccount = async (accountId: string) => {
    if (accountId !== activeAccountId) {
     await dispatch(switchAccountThunk(accountId)).unwrap();
     dispatch(setBirthdayUsers([]));
     await dispatch(getLastPunchInThunk());
      try {
       await dispatch(getERPAppConfigMenuThunk());
      } catch (error) {
        dispatch(updateAppMenuList([]));
        console.log("Error fetching app config menu:", error);
      }
      setTimeout(() => {
        dispatch(setLoading(false));
        dispatch(setReloadApp());
      }, 1000);
    }
    onClose();
  };

  const handleRemovedAccount = (accountId: string) => {
    try {
      if (accountId !== activeAccountId) {
        dispatch(removeAccountThunk(accountId));
      }
      setAlertConfig({
        title: t("text91"),
        message: t("text92"),
        type: "success",
      });
      setTimeout(() => {
        onClose();
      }, 1800);
    } catch (error) {
      setAlertConfig({
        title: t("text93"),
        message: t("text92"),
        type: "error",
      });
    }
  };

  const handleRemoveAccount = (account: Account) => {
    setAlertConfig({
      title: t("text93"),
      message: `${t("text94")} ${firstLetterUpperCase(account?.user?.name)} ?`,
      type: "confirmation",
    });
    setSelectedAccount(account?.id);
    setAlertVisible(true);
  };

  const renderAccount = ({ item, index }: { item: any; index: number }) => {
    const isActive = user?.id.toString() === item?.user?.id.toString();
    const lastLogin = formatDateHr(item?.lastLoginAt, false);
    const lastLoginHr = formatTimeTo12Hour(item?.lastLoginAt);
    console.log("item?.user?.token", item?.user?.token)

    let normalizedBase = (item?.user?.companyLink || "").replace(/\/+$/, "");
    normalizedBase = normalizedBase.replace(/\/devws\/?/, "/");
    normalizedBase = normalizedBase.replace(
      /^https:\/\//i,
      Platform.OS === "ios" ? "https://" : "http://",
    );

    return (
      <Animated.View
        style={{
          opacity: listAnim[index],
          transform: [
            {
              translateY: listAnim[index].interpolate({
                inputRange: [0, 1],
                outputRange: [50, 0],
              }),
            },
            //  { scale: pressItemAnim },
          ],
          width:  isLandscape || isIpad ? "50%" : "100%",
          marginLeft: isLandscape || isIpad ? 4 : 0,
        }}
      >
        <TouchableOpacity
          style={[
            styles.accountItem,
            isActive && {
              borderColor: ERP_COLOR_CODE.ERP_APP_COLOR,
              backgroundColor: ERP_COLOR_CODE.ERP_WHITE,
            },
            theme === "dark" && {
              backgroundColor: "black",
              borderWidth: 1,
              borderColor: "white",
            },
          ]}
          onPressIn={onPressItemIn}
          onPressOut={onPressItemOut}
          onPress={async () => {
            if(user?.id.toString() === item?.user?.id.toString()){
              return;
            }
            dispatch(setLoading(true));
            dispatch(clearDashboardFilters());
            dispatch(setDashboard([]));
            dispatch(setEmptyMenu([]));
            dispatch(resetAjaxState());
            dispatch(resetAttendanceState());
            dispatch(clearAuthState());
            dispatch(resetDropdownState());
            dispatch(resetSyncLocationState());
            DevERPService.setAppId(item?.user?.app_id || "");
            await AsyncStorage.setItem("appid", item?.user?.app_id);

            if (isTokenValid(item?.user?.tokenValidTill)) {
              DevERPService.setToken(item?.user?.token || "");
              await AsyncStorage.setItem("erp_token", item?.user?.token || "");
              await AsyncStorage.setItem("auth_token", item?.user?.token || "");
              await AsyncStorage.setItem(
                "erp_token_valid_till",
                item?.user?.token || "",
              );
              const validation = await validateCompanyCode(() =>
                DevERPService.validateCompanyCode(item?.user?.company_code),
              );
              if (!validation?.isValid) return;
              handleSwitchAccount(item?.id);
            } else {
              const validation = await validateCompanyCode(() =>
                DevERPService.validateCompanyCode(item?.user?.company_code),
              );
              if (!validation?.isValid) return;
              handleSwitchAccount(item?.id);

            }
          }}
        >
          <View style={styles.accountContent}>
            <TouchableOpacity
              onPress={() => {
                setImg(
                  `${normalizedBase}/FileUpload/1/UserMaster/${
                    item?.user?.id
                  }/profileimage.jpeg?ts=${new Date().getTime()}`,
                );
                setShowModal(true);
              }}
            >
              <FastImage
                style={styles.avatar}
                source={{
                  uri: `${normalizedBase}/FileUpload/1/UserMaster/${
                    item?.user?.id
                  }/profileimage.jpeg?ts=${profileImageTimestamp}`,
                  priority: FastImage.priority.normal,
                  cache: FastImage.cacheControl.web,
                }}
              />
            </TouchableOpacity>

            <View style={styles.accountInfo}>
              <TranslatedText
                text={item?.user?.companyName}
                numberOfLines={1}
                style={[
                  styles.accountName,
                  isActive && styles.activeText,
                  theme === "dark" && { color: "white" },
                ]}
              ></TranslatedText>
              <TranslatedText
                numberOfLines={1}
                text={firstLetterUpperCase(item?.user?.name || "")}
                style={[
                  styles.accountEmail,
                  isActive && styles.activeText,
                  theme === "dark" && { color: "white" },
                ]}
              ></TranslatedText>

              <View
                style={{
                  width: isActive ? "100%" : "80%",
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <View
                  style={{ gap: 2, flexDirection: "row", alignItems: "center" }}
                >
                  <MaterialIcons
                    name={"date-range"}
                    color={
                      theme === "dark" ? "white" : ERP_COLOR_CODE.ERP_BLACK
                    }
                    size={18}
                  />
                  <TranslatedText
                    numberOfLines={1}
                    text={lastLogin}
                    style={styles.lastLogin}
                  ></TranslatedText>
                </View>
                <View
                  style={{ gap: 2, flexDirection: "row", alignItems: "center" }}
                >
                  <MaterialIcons
                    name={"access-alarm"}
                    color={
                      theme === "dark" ? "white" : ERP_COLOR_CODE.ERP_BLACK
                    }
                    size={18}
                  />
                  <TranslatedText
                    numberOfLines={1}
                    text={lastLoginHr}
                    style={styles.lastLogin}
                  ></TranslatedText>
                </View>
                
              </View>
            </View>
            {isActive && (
              <View
                style={[
                  styles.activeIndicator,
                  {
                    backgroundColor: theme === "dark" ? "white" : ERP_COLOR_CODE.ERP_APP_COLOR,
                  },
                  theme === "dark" && { backgroundColor: "white" },
                ]}
              >
                <Text
                  style={[
                    styles.activeLabel,
                    theme === "dark" && { color: "black" },
                  ]}
                >
                  Active
                </Text>
              </View>
            )}
            
          </View>
          {!isActive && accounts?.length > 1 && (
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => handleRemoveAccount(item)}
            >
              <Text
                style={[
                  styles.removeButtonText,
                  theme === "dark" && { color: "white" },
                ]}
              >
                ✕
              </Text>
            </TouchableOpacity>
          )}
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const handleClose = () => {
    // Reverse FlatList items
    listAnim
      .slice()
      .reverse()
      .forEach((anim, index) => {
        Animated.timing(anim, {
          toValue: 0,
          duration: 550,
          delay: index * 60,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }).start();
      });

    // Reverse button animation
    Animated.timing(buttonAnim, {
      toValue: 0,
      duration: 450,
      delay: 120,
      easing: Easing.in(Easing.ease),
      useNativeDriver: true,
    }).start();

    // Reverse main slide
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      delay: 650,
      easing: Easing.in(Easing.ease),
      useNativeDriver: true,
    }).start(onClose);
  };

  return (
    <Modal
      visible={visible}
      transparent
      supportedOrientations={["portrait", "landscape"]}
      onRequestClose={handleClose}
    >
      <Animated.View
        style={[
          styles.container,
          theme === "dark" && { backgroundColor: "black" },
          {
            transform: [
              {
                translateY: slideAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [800, 0],
                }),
              },
            ],
            opacity: slideAnim,
          },
          isLandscape && {
            marginTop: -2,
          },
        ]}
      >
        <View
          style={[
            styles.header,
            {
              backgroundColor: ERP_COLOR_CODE.ERP_APP_COLOR,
            },
            theme === "dark" && { backgroundColor: "black" },
          ]}
        >
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            {Platform.OS === "ios" ? (
              <>
                <MaterialIcons name="chevron-left" size={28} color="#fff" />
              </>
            ) : (
              <Image source={ERP_ICON.BACK} style={styles.back} />
            )}
          </TouchableOpacity>
          <Text style={styles.title}>{t("text95")}</Text>
        </View>

        <View
          style={{
            paddingHorizontal: isLandscape ? 12 : 0,
            flex: 1,
          }}
        >
          <FlatList
                            bounces={false}

            key={isLandscape ? "landscape" : "portrait"}
            data={accounts}
            renderItem={renderAccount}
            keyExtractor={(item, index) => index.toString()}
            style={styles.accountsList}
            showsVerticalScrollIndicator={false}
            numColumns={isLandscape || isIpad ? 2 : 1}
          />
        </View>

        {!isLandscape && (
          <Animated.View
            style={{
              opacity: buttonAnim,
              transform: [
                {
                  translateY: buttonAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [50, 0],
                  }),
                },
                { scale: pressAnim },
              ],
            }}
          >
            <TouchableOpacity
              style={[
                styles.addAccountButton,
                {
                  backgroundColor: ERP_COLOR_CODE.ERP_APP_COLOR,
                },
                theme === "dark" && { backgroundColor: "white" },
                 {
                    backgroundColor: theme === "dark" ? "white" : ERP_COLOR_CODE.ERP_APP_COLOR,
                  },
                tapLoader && {
                  backgroundColor: ERP_COLOR_CODE.ERP_999,
                },
              ]}
              onPress={() => {
                onAddAccount();
              }}
              onPressIn={onPressIn}
              onPressOut={onPressOut}
            >
              {
                <MaterialIcons
                  name="person-add-alt"
                  size={24}
                  color={theme === "dark" ? "black" : "white"}
                />
              }

              
            </TouchableOpacity>
          </Animated.View>
        )}

        <CustomAlert
          visible={alertVisible}
          title={alertConfig.title}
          message={alertConfig.message}
          type={alertConfig.type}
          isBottomButtonVisible={true}
          onClose={() => setAlertVisible(false)}
          onCancel={() => setAlertVisible(false)}
          onDone={() => handleRemovedAccount(selectedAccount)}
          doneText={t("text98")}
          cancelText={t("auth.cancel")}
          color={ERP_COLOR_CODE.ERP_ERROR}
          actionLoader={undefined}
          closeHide={undefined}
        />

        <ImageBottomSheetModal
          visible={showModal}
          onClose={() => setShowModal(false)}
          imageUrl={img}
        />
      </Animated.View>
    </Modal>
  );
};

export default AccountSwitcher;
