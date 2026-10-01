import React, {
  useState,
  useEffect,
  useLayoutEffect,
  useCallback,
} from "react";
import {
  View,
  Platform,
  Text,
  TouchableOpacity,
  Alert,
  TouchableWithoutFeedback,
  Keyboard,
  Dimensions,
  Modal,
  ImageBackground,
  useWindowDimensions,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import {
  useNavigation,
  useRoute,
} from "@react-navigation/native";

import { styles } from "./attendance_style";
import FullViewLoader from "../../../components/loader/FullViewLoader";
import ERPIcon from "../../../components/icon/ERPIcon";
import List from "./components/List";
import AttendanceForm from "./components/AttendanceForm";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { getLastPunchInThunk } from "../../../store/slices/attendance/thunk";
import ErrorMessage from "../../../components/error/Error";
import { formatDateForAPI, parseCustomDate } from "../../../utils/helpers";
import { ERP_COLOR_CODE } from "../../../utils/constants";
import useTranslations from "../../../hooks/useTranslations";
import MaterialIcons from "@react-native-vector-icons/material-icons";
import { ERP_GIF } from "../../../assets";
import TranslatedText from "../tabs/home/TranslatedText";
import SquareSwitch from "./components/SquareSwitch";
import PageScreen from "../page/Page";

const AttendanceScreen = () => {
  const route = useRoute();
  const { isFor, isFromDashboard, isFromBreak } = route?.params || "";
  const navigation = useNavigation<any>();
  const [isListVisible, setIsListVisible] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);
  const dispatch = useAppDispatch();
  const { user, } = useAppSelector(
    (state) => state.auth,
  );
  const theme = useAppSelector((state) => state?.theme.mode);
  const { t } = useTranslations();
  const { height, width } = useWindowDimensions();
  const isLandscape = width > height;
  const [resData, setResData] = useState<any>();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [showDateFilter, setShowDateFilter] = useState(false);

  const [blockAction, setBlockAction] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [actionLoader, setActionLoader] = useState(false);
  const [error, setError] = useState<any>("");
  const [value, setValue] = useState(isFromBreak ? 'break' : 'attendance');

  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");
  const [tempDate, setTempDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState<null | {
    type: "from" | "to";
    show: boolean;
  }>(null);

  const getCurrentMonthRange = useCallback(() => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date();
    const fromDateStr = formatDateForAPI(firstDay);
    const toDateStr = formatDateForAPI(lastDay);
    setFromDate(fromDateStr);
    setToDate(toDateStr);
    return { fromDate: fromDateStr, toDate: toDateStr };
  }, []);

  const formattedMonth = `${selectedDate.getFullYear()}-${(
    selectedDate.getMonth() + 1
  )
    .toString()
    .padStart(2, "0")}`;

  const onChangeDate = (event: any, date?: Date) => {
    setShowPicker(false);
    if (date) {
      setSelectedDate(date);
    }
  };

  useEffect(() => {
    if (isFor === "MyAttendance") {
      setIsListVisible(true);
    } else {
      setIsListVisible(false);
    }
  }, [navigation]);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: isFor === "MyAttendance" ? t("test25") : t("test26"),
      headerTitleAlign: "left",
      headerTitleStyle: {
        color: "#FFFFFF",
      },
      headerBackTitle: "",
      headerStyle: {
        backgroundColor:
          theme === "dark" ? "black" : ERP_COLOR_CODE.ERP_APP_COLOR,
      },
      headerTintColor: "#fff",
      headerRight: () => (
        <>

          {isListVisible && (
            <ERPIcon
              name={showDateFilter ? 'close':'filter-alt'}
              onPress={() => {
                setShowDateFilter(!showDateFilter);
              }}
            />
          )}
          <ERPIcon
            isLoading={actionLoader}
            name="refresh"
            onPress={() => {
              setRefresh(!refresh);
              setActionLoader(!actionLoader);
            }}
          />
        </>
      ),
    });
  }, [
    navigation,
    isListVisible,
    showPicker,
    blockAction,
    refresh,
    actionLoader,
    showDateFilter,
    theme,
    value
  ]);

  const checkAttendance = () => {
    setIsLoading(true);
    dispatch(getLastPunchInThunk())
      .unwrap()
      .then((res) => {
        setResData(res);

        setActionLoader(false);
        setError(null);
        setIsLoading(false);
      })
      .catch((err) => {
        setActionLoader(false);
        setError(err);
        setIsLoading(false);
      });
  };

  useEffect(() => {
    getCurrentMonthRange();
    checkAttendance();
  }, [refresh, theme]);

  if (error && error !== "") {
    <ErrorMessage message={error} isShowTop={false} />;
  }

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (event.type === "dismissed" || !selectedDate) {
      setShowDatePicker(null);
      return;
    }
    const { type } = showDatePicker!;
    const formattedDate = formatDateForAPI(selectedDate);

    if (type === "to") {
      const today = new Date();
      today.setHours(23, 59, 59, 999);

      if (fromDate) {
        const fromDateObj = new Date(fromDate.split("-").reverse().join("-"));
        if (selectedDate < fromDateObj) {
          Alert.alert(t("text.text24"), t("text.text25"), [
            { text: t("text.text26") },
          ]);
          setShowDatePicker(null);
          return;
        }
      }
      setToDate(formattedDate);
    } else {
      setFromDate(formattedDate);
      if (toDate) {
        const toDateObj = new Date(toDate.split("-").reverse().join("-"));
        if (selectedDate > toDateObj) {
          setToDate("");
        }
      }
    }
    setShowDatePicker(null);
  };

  if (isLoading) {
    return (
      <View
        style={{
          justifyContent: "center",
          alignContent: "center",
          alignItems: "center",
          height: Dimensions.get("screen").height * 0.85,
        }}
      >
        <FullViewLoader />
      </View>
    );
  }

  const renderContent = () => {
    switch (value) {
      case "attendance":
        return (
          <AttendanceForm
            setBlockAction={setBlockAction}
            resData={resData}
            isFromDashboard={isFromDashboard || false}
          />
        );

      case "leave":
        return (
          <PageScreen
            isFromForceLeave={true}
            pageUrl="LeaveApp"
          />
        );

      case "break":
        return (
          <PageScreen
            isFromForceLeave={true}
            pageUrl="BreakApp"
          />
        );

      default:
        return null;
    }
  };

  // useEffect(() => {
  //   renderContent();
  // }, [value]);

  return (
    <TouchableWithoutFeedback
      onPress={() => {
        Keyboard.dismiss();
      }}
    >
      <View
        style={[
          {
            height: Dimensions.get("screen").height,
            flex: 1,
            backgroundColor: "white",
          },
          isListVisible &&
          showDateFilter && {
            backgroundColor: ERP_COLOR_CODE.ERP_APP_COLOR,
          },
          theme === "dark" && { backgroundColor: "black" },
        ]}
      >

        {isListVisible && showDateFilter && (
          <View
            style={[
              styles.dateContainer,
              {
                backgroundColor: ERP_COLOR_CODE.ERP_APP_COLOR,
              },
              theme === "dark" && {
                backgroundColor: "black",
              },
            ]}
          >
            <View
              style={[
                styles.dateRow,
                theme === "dark" && {
                  backgroundColor: "black",
                },
              ]}
            >
              <TouchableOpacity
                onPress={() => setShowDatePicker({ type: "from", show: true })}
                style={[
                  styles.dateButton,
                  theme === "dark" && {
                    backgroundColor: "black",
                  },
                ]}
              >
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <MaterialIcons
                    name="calendar-today"
                    size={18}
                    color={theme === "dark" ? "#fff" : "#000"}
                    style={{ marginRight: 8 }}
                  />
                  <TranslatedText
                    text={fromDate || t("text.text27")}
                    numberOfLines={1}
                    style={[
                      styles.dateButtonText,
                      {
                        color: theme === "dark" ? "#fff" : "#000",
                      },
                    ]}
                  ></TranslatedText>
                </View>
              </TouchableOpacity>
            </View>
            <View
              style={[
                styles.dateRow,
                theme === "dark" && {
                  backgroundColor: "black",
                },
              ]}
            >
              <TouchableOpacity
                onPress={() => setShowDatePicker({ type: "to", show: true })}
                style={[
                  styles.dateButton,
                  theme === "dark" && {
                    backgroundColor: "black",
                  },
                ]}
              >
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <MaterialIcons
                    name="calendar-today"
                    size={18}
                    color={theme === "dark" ? "#fff" : "#000"}
                    style={{ marginRight: 8 }}
                  />
                  <TranslatedText
                    numberOfLines={1}
                    text={toDate || ""}
                    style={[
                      styles.dateButtonText,
                      {
                        color: theme === "dark" ? "#fff" : "#000",
                      },
                    ]}
                  ></TranslatedText>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {showDatePicker?.show && Platform.OS === "ios" && (
          <Modal
            transparent
            animationType="slide"
            supportedOrientations={["portrait", "landscape"]}
            statusBarTranslucent
          >
            <View
              style={[
                styles.overlay,
                isLandscape && {
                  alignContent: "center",
                  alignItems: "center",
                  // justifyContent:'center'
                },
              ]}
            >
              <View
                style={[
                  styles.sheet,
                  theme === "dark" && {
                    borderWidth: 1,
                    borderColor: "white",
                    backgroundColor: 'black'
                  },
                  {
                    width: isLandscape ? "40%" : "100%",
                  },
                ]}
              >
                {/* Divider */}

                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    paddingHorizontal: 16,
                    paddingVertical: 14,
                  }}
                >
                  {/* Cancel */}
                  <TouchableOpacity
                    onPress={() => {
                      setShowDatePicker(null);
                    }}
                  >
                    <MaterialIcons name='close' size={24} color={ERP_COLOR_CODE.ERP_ERROR} />
                  </TouchableOpacity>

                  {/* Title */}
                  <Text
                    style={{
                      color: theme === "dark" ? "white" : "black",
                      fontSize: 16,
                      fontWeight: "600",
                    }}
                  >
                    {t("text89")}
                  </Text>

                  {/* Done */}
                  <TouchableOpacity
                    onPress={() => {
                      const formatted = formatDateForAPI(tempDate);

                      if (showDatePicker.type === "from") {
                        setFromDate(formatted);

                      } else {
                        setToDate(formatted);
                      }
                      setShowDatePicker(null);
                    }}
                  >
                    <MaterialIcons name='done' size={24} color={ERP_COLOR_CODE.ERP_green} />
                  </TouchableOpacity>
                </View>

                <View style={styles.divider} />

                {/* Date Picker */}
                <DateTimePicker
                  value={
                    showDatePicker.type === "from" && fromDate
                      ? parseCustomDate(fromDate)
                      : showDatePicker.type === "to" && toDate
                        ? parseCustomDate(toDate)
                        : new Date()
                  }
                  mode="date"
                  display="spinner"
                  is24Hour={false}
                  onChange={(event, selectedDate) => {
                    if (selectedDate) {
                      setTempDate(selectedDate);
                    }
                  }}
                  style={[
                    styles.picker,
                    {
                      backgroundColor: theme === "dark" ? 'black': "white",
                    },
                  ]}
                  themeVariant={theme === "dark" ? "dark" : "light"}
                />
              </View>
            </View>
          </Modal>
        )}

        {Platform.OS !== "ios" && showDatePicker?.show && (
          <DateTimePicker
            value={
              showDatePicker?.type === "from" && fromDate
                ? parseCustomDate(fromDate)
                : showDatePicker?.type === "to" && toDate
                  ? parseCustomDate(toDate)
                  : new Date()
            }
            mode="date"
            display="spinner"
            is24Hour={false}
            onChange={handleDateChange}
            themeVariant={theme === "dark" ? "dark" : "light"}
          />
        )}

        {isListVisible ? (
          <>
            <View
              style={{
                flex: 1,
                width: "100%",
                backgroundColor: theme === "dark" ? "black" : "white",
                height: "100%",
              }}
            >

              <List
                selectedMonth={formattedMonth}
                showFilter={showDateFilter}
                fromDate={fromDate}
                toDate={toDate}
              />
              {showPicker && (
                <DateTimePicker
                  value={selectedDate}
                  mode="date"
                  display="spinner"
                  is24Hour={false}
                  onChange={onChangeDate}
                  themeVariant={theme === "dark" ? "dark" : "light"}
                />
              )}
            </View>
          </>
        ) : (
          <>
            <ImageBackground
              source={theme === "dark" ? "" : ERP_GIF.BACK_IMG}
              resizeMode="cover"
              style={{
                height: Dimensions.get("screen").height * 0.85,
                flex: 1,
              }}
            >
              <>
               <AttendanceForm
                  setBlockAction={setBlockAction}
                  resData={resData}
                  isFromDashboard={isFromDashboard || false}
                />
              </>
            </ImageBackground>
          </>
        )}
      </View>
    </TouchableWithoutFeedback>
  );
};

export default AttendanceScreen;
