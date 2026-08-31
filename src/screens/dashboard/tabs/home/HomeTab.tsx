import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";

import { styles } from "./home_style";
import { useAppDispatch, useAppSelector } from "../../../../store/hooks";
import FullViewLoader from "../../../../components/loader/FullViewLoader";
import NoData from "../../../../components/no_data/NoData";
import ERPIcon from "../../../../components/icon/ERPIcon";
import {
  getERPAppConfigMenuThunk,
  getERPDashboardThunk,
  getERPListDataThunk,
  getERPPageThunk,
} from "../../../../store/slices/auth/thunk";
import ErrorMessage from "../../../../components/error/Error";
import { ERP_COLOR_CODE } from "../../../../utils/constants";
import MaterialIcons from "@react-native-vector-icons/material-icons";
import Footer from "./Footer";
import PieChartSection from "./chartData";

import {
  formatDateForAPI,
  getDashboardAI,
  getWorkedHours,
  isLatePunchIn,
  parseCustomDate,
} from "../../../../utils/helpers";
import DateTimePicker from "@react-native-community/datetimepicker";

import CustomPicker from "../../page/components/CustomPicker";
import {
  setActiveDashboardBranch,
  setActiveDashboardBranchId,
  setActiveDashboardFromDate,
  setActiveDashboardToDate,
  setActiveDashboardType,
  setActiveDashboardTypeId,
  setDashboardLoading,
  updateAppMenuList,
} from "../../../../store/slices/auth/authSlice";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  Dimensions,
  Animated,
  TextInput,
  Alert,
  Modal,
  Platform,
  useWindowDimensions,
  ScrollView,
  TouchableWithoutFeedback,
  Image,
} from "react-native";
import TranslatedText from "./TranslatedText";
import GreetingBottomSheet from "./GreetingBottomSheet";
import { getDDLThunk } from "../../../../store/slices/dropdown/thunk";
import CustomAlert from "../../../../components/alert/CustomAlert";
import FontAwesome from "@react-native-vector-icons/fontawesome";
import { getLastPunchInThunk } from "../../../../store/slices/attendance/thunk";
import { batch } from "react-redux";
import DeviceInfo from "react-native-device-info";
import { ERP_ICON } from "../../../../assets";
import BirthdayList from "./BirthdayList";
import LeaveBalanceSection from "./LeaveBalanceSection";
const hasHtmlContent = (str: string) => {
  if (!str || typeof str !== "string") return false;
  return /<([a-z]+)([^>]*?)>/i.test(str);
};

const hasMarqueeContent = (str: string) => {
  if (!str || typeof str !== "string") return false;

  return (
    /<marquee\b[^>]*>[\s\S]*?<\/marquee>/i.test(str) ||
    /happy\s*birthday/i.test(str) ||
    /work\s*anniversary/i.test(str)
  );
};

const HomeScreen = ({ setHideTab, hideTab }: any) => {
  const { height, width } = useWindowDimensions();
  const isLandscape = width > height;
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const dispatch = useAppDispatch();
  const TOTAL_TIME = 3 * 60;

  const [remainingTime, setRemainingTime] = useState(TOTAL_TIME);
  const [controls, setControls] = useState<any[]>([]);
  const [controlsLoader, setControlsLoader] = useState<any>(false);
  const [alertVisible, setAlertVisible] = useState(true);
  const { reLoading } = useAppSelector((state) => state.reloadApp);

  const [aiMessage, setAiMessage] = useState("");
  const [visibleAI, setVisibleAI] = useState(false);
  const [showFull, setShowFull] = useState(true);
  const [attendance, setAttendance] = useState<any>(null);
  const [workingTime, setWorkingTime] = useState("00:00:00");
  const scrollY = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateX = useRef(new Animated.Value(width)).current;
  const [listData, setListData] = useState<any[]>([]);

  const {
    dashboard,
    isDashboardLoading,
    isAuthenticated,
    error,
    user,
    attendanceDone,
  } = useAppSelector((state) => state.auth);

  const runAI = async () => {
    try {
      const message = await getDashboardAI(dashboard);

      if (!message) return;
      setAiMessage(message);
      setVisibleAI(true);
    } catch (e) {
      if (e?.message?.includes("Quota")) {
        setTimeout(() => {
          runAI();
        }, 60000);
      }
    }
  };

  const aiCalled = useRef(false);

  const [loadingPageId, setLoadingPageId] = useState<any>(null);
  const [isRefresh, setIsRefresh] = useState<boolean>(false);
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");

  const auth = useAppSelector((state) => state?.auth);
  const [showDatePicker, setShowDatePicker] = useState<null | {
    type: "from" | "to";
    show: boolean;
  }>(null);
  const [chartType, setChartType] = useState("");
  const [openSheet, setOpenSheet] = useState(false);

  const CHART_TYPES = [
    {
      type: "BarChart",
      icon: "poll",
    },
    {
      type: "LineChart",
      icon: "show-chart",
    },
    {
      type: "PieChart",
      icon: "pie-chart",
    },
    {
      type: "PopulationPyramid",
      icon: "equalizer",
    },
    {
      type: "BubbleChart",
      icon: "bubble-chart",
    },
    {
      type: "Default",
      icon: "autorenew",
    },
  ];

  const activeChart = CHART_TYPES.find(
    (item) => item.type === chartType
  );

  const { appBottomMenuList, appDrawerMenuList } = useAppSelector((state) => state?.auth);
  const theme = useAppSelector((state) => state?.theme.mode);
  const [actionLoader, setActionLoader] = useState(false);
  const [isHorizontal, setIsHorizontal] = useState(false);
  const [isFilterVisible, setIsFilterVisible] = useState(true);

  const [showSearch, setShowSearch] = useState(false);
  const [searchText, setSearchText] = useState("");
  const filteredDashboard = useMemo(() => {
    const text = searchText.toLowerCase();

    return dashboard.filter(
      (item) =>
        (item?.name || "").toLowerCase().includes(text) ||
        (item?.title || "").toLowerCase().includes(text) ||
        (item?.data || "").toLowerCase().includes(text),
    );
  }, [searchText, dashboard]);
  const isIpad =
    (Platform.OS === "ios" && Platform.isPad) || DeviceInfo.isTablet() || Platform.isTV;

  const marqueeItems = filteredDashboard.filter((item) =>
    hasMarqueeContent(item.data),
  );

  const htmlItems = filteredDashboard.filter(
    (item) =>
      hasHtmlContent(item.data) &&
      !hasMarqueeContent(item.data),
  );

  const textItems = filteredDashboard.filter(
    (item) =>
      item.data &&
      !hasHtmlContent(item.data),
  );

  // const htmlItems = filteredDashboard.filter((item) =>
  //   hasHtmlContent(item.data),
  // );


  const emptyItems = filteredDashboard.filter((item) => item?.data === "");

  // const textItems = filteredDashboard.filter(
  //   (item) => item.data && !hasHtmlContent(item.data),
  // );

  const formatTime = time => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  useEffect(() => {
    if (!dashboard || aiCalled.current) return;
    const timer = setTimeout(() => {
      runAI();
      aiCalled.current = true;
    }, 19000);

    return () => clearTimeout(timer);
  }, [dashboard]);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: showFull ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [showFull]);

  useFocusEffect(
    useCallback(() => {
      // dispatch(setActiveDashboardBranchId(""));
      // dispatch(setActiveDashboardBranch(""));
      // dispatch(setActiveDashboardType(""));
      // dispatch(setActiveDashboardTypeId(""));
      setIsFilterVisible(true);
      setShowFull(true);
      setIsHorizontal(false);
      return () => { };
    }, [isAuthenticated, navigation, isLandscape]),
  );

  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(translateX, {
        toValue: -350,
        duration: 10000,
        useNativeDriver: true,
      }),
    );

    animation.start();

    return () => animation.stop();
  }, []);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerStyle: {
        backgroundColor:
          theme === "dark" ? "black" : ERP_COLOR_CODE.ERP_APP_COLOR,
      },

      headerBackTitle: "",
      headerTintColor: "#fff",
      headerTitle: () => {
        return (<>
          {
            Platform.isTV ? <>
              <Text style={{ color: ERP_COLOR_CODE.ERP_WHITE, fontSize: 16, fontWeight: '600' }}>
                {user?.companyName || ''}
              </Text>
            </> : <>
              {
                showSearch ? (
                  <View
                    style={{
                      width: isLandscape ? width - 170 : width - 70,
                      flexDirection: "row",
                      alignItems: "center",
                    }}
                  >
                    <TextInput
                      value={searchText}
                      onChangeText={setSearchText}
                      autoFocus={true}
                      placeholder={t("text83")}
                      style={{
                        flex: 1,
                        backgroundColor: "#f0f0f0",
                        borderRadius: 8,
                        paddingHorizontal: 12,
                        height: 36,
                      }}
                    />
                    <TouchableOpacity
                      onPress={() => {
                        setShowSearch(false);
                        setSearchText("");
                      }}
                    >
                      <MaterialIcons
                        name="clear"
                        size={24}
                        color={ERP_COLOR_CODE.ERP_WHITE}
                        style={{ marginLeft: 8 }}
                      />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <>
                    <Text
                      numberOfLines={1}
                      style={{
                        color: "#fff",
                        fontSize: 18,
                        fontWeight: "600",
                      }}
                    >
                      {t("text84")}
                    </Text>
                  </>
                )
              }
            </>
          }
        </>)
      }
      ,
      headerRight: () => {
        return (
          <>
            {
              Platform.isTV ? <>
                <>
                  <Text style={{ color: '#fff', fontSize: 12 }}>
                    Next refresh in {formatTime(remainingTime)}
                  </Text>

                  <ERPIcon
                    name="refresh"
                    onPress={() => {
                      setControlsLoader(true);
                      setActionLoader(true);
                      setIsRefresh(!isRefresh);
                      dispatch(getERPDashboardThunk({ branch: auth.dashboardBranch.trim(), type: auth.dashboardType.trim(), fd: auth.dashboardFromDate.trim(), td: auth.dashboardToDate.trim() }));
                      const timer = setTimeout(() => {
                        setActionLoader(false);
                        setControlsLoader(false);
                        dispatch(setDashboardLoading(false));
                      }, 3000);
                      return () => clearTimeout(timer);

                    }}
                    isLoading={actionLoader}
                  />
                  <ERPIcon
                    name={!isHorizontal ? 'list' : 'apps'}
                    onPress={() => setIsHorizontal(prev => !prev)}
                  />
                </>

              </> : <>
                {
                  !showSearch && (
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                      {/* ✅ ANIMATED ICONS */}
                      <Animated.View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          opacity: fadeAnim,
                          transform: [
                            {
                              translateY: fadeAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: [-10, 0],
                              }),
                            },
                            {
                              scale: fadeAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: [0.8, 1],
                              }),
                            },
                          ],
                        }}
                      >
                        {showFull && (
                          <>
                            <ERPIcon
                              name={!isHorizontal ? "list" : "apps"}
                              onPress={() => setIsHorizontal((prev) => !prev)}
                            />
                            {controls.length > 0 && (
                              <ERPIcon
                                name={isFilterVisible ? "close" : "filter-alt"}
                                onPress={() => setIsFilterVisible((prev) => !prev)}
                              />
                            )}

                            <ERPIcon
                              name={!hideTab ? "fullscreen" : "fullscreen-exit"}
                              onPress={() => {
                                setHideTab(!hideTab);
                              }}
                            />
                          </>
                        )}
                      </Animated.View>
                      <ERPIcon
                        name="refresh"
                        onPress={async () => {
                          refreshData();
                          setChartType("")

                        }}
                        isLoading={isDashboardLoading}
                      />

                      {dashboard.length > 5 && (
                        <ERPIcon name="search" onPress={() => setShowSearch(true)} />
                      )}

                      {attendanceDone && user?.id == (user?.company_code?.toLowerCase()?.includes("oeuvre01") ? "16" : "113") && (
                        <ERPIcon
                          color={"green"}
                          name={"location-on"}
                          onPress={() => {
                            navigation.navigate("LocationTrack");
                          }}
                        />
                      )}

                      <ERPIcon
                        name={!showFull ? "more-vert" : "close"}
                        onPress={() => {
                          setIsFilterVisible(false);
                          setShowFull(!showFull);
                        }}
                      />
                    </View>
                  )
                }
              </>
            }
          </>
        )
      },

      headerLeft: () => (
        <TouchableOpacity
          onPress={() => navigation?.openDrawer()}
          style={{
            height: 46,
            width: 46,
            justifyContent: "center",
            alignContent: "center",
            alignItems: "center",
          }}
        >
          <ERPIcon
            extSize={24}
            isMenu={true}
            name="menu"
            onPress={() => navigation?.openDrawer()}
          />
        </TouchableOpacity>
      ),
    });
  }, [
    showFull,
    actionLoader,
    attendanceDone,
    navigation,
    isHorizontal,
    isRefresh,
    showSearch,
    dashboard,
    searchText,
    filteredDashboard,
    isFilterVisible,
    hideTab,
    isLandscape,
    controls,
    isDashboardLoading,
    remainingTime
  ]);


  useEffect(() => {
    if (!Platform.isTV) {
      return;
    }
    if (!isAuthenticated) return;

    const fetchDashboard = async () => {

      dispatch(setDashboardLoading(true));
      await dispatch(getERPDashboardThunk({ branch: auth?.dashboardBranch.trim() || "", type: auth?.dashboardType.trim() || "", fd: auth?.dashboardFromDate.trim() || "", td: auth?.dashboardToDate.trim() || "" }));
      setRemainingTime(TOTAL_TIME); // reset timer on fetch
      setTimeout(() => {
        dispatch(setDashboardLoading(false));
      }, 1000)
    };

    // initial call
    fetchDashboard();

    // API call every 3 min
    const apiInterval = setInterval(fetchDashboard, 3 * 60 * 1000);

    // countdown every second
    const countdownInterval = setInterval(() => {
      setRemainingTime(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => {
      clearInterval(apiInterval);
      clearInterval(countdownInterval);
    };
  }, [isAuthenticated, dispatch]);

  const accentColors = [
    ERP_COLOR_CODE.ERP_APP_COLOR,
    "#00C2A8",
    "#FFB020",
    "#FF6B6B",
    "#9B59B6",
    "#20C997",
  ];

  const refreshData = async () => {
    try {
      dispatch(setDashboardLoading(true));
      await dispatch(getERPAppConfigMenuThunk());
      if (appBottomMenuList.length === 0) {
        setAlertVisible(true);
      } else {
        setAlertVisible(false);
      }
      // setControlsLoader(true);
      setActionLoader(true);
      setIsRefresh(!isRefresh);
      const now = new Date();
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastDay = new Date();
      const fromDateStr = formatDateForAPI(firstDay);
      const toDateStr = formatDateForAPI(lastDay);

      const branchObj = controls.find((item) => item.fieldtitle === "Branch");
      const typeObj = controls.find((item) => item.fieldtitle === "Type");

      const res = await dispatch(
        getDDLThunk({
          dtlid: branchObj?.dtlid,
          where: `UserID in (${user?.id}, -1) AND selected = 1`,
        }),
      ).unwrap();
      console.log("res ++++++ +++ ++ + + ++ + + + + + + ", res);

      const data = res?.data ?? [];
      const filtered = data.filter((item) => item.value !== -1);

      console.log(
        "filtered refresh============= ++++++ +++ ++ + + ++ + + + + + + ",
        filtered,
      );
      const res1 = await dispatch(
        getDDLThunk({
          dtlid: typeObj?.dtlid,
          where: `UserID in (${user?.id}, -1)`,
        }),
      ).unwrap();
      const data1 = res1?.data ?? [];
      console.log(
        "--------------------------------------------DDLres1 Data:",
        res1,
      );
      batch(() => {
        dispatch(
          setActiveDashboardBranchId(filtered[0]?.value?.toString() || ""),
        );
        dispatch(setActiveDashboardBranch(filtered[0]?.name || ""));
        dispatch(setActiveDashboardTypeId(data1[0]?.value?.toString() || ""));
        dispatch(setActiveDashboardType(data1[0]?.name || ""));
      })
      const params = {
        branch: filtered[0]?.value?.toString() || "",
        type: data1[0]?.value?.toString() || "",
        fd: fromDateStr,
        td: toDateStr,
      };
      await dispatch(getERPDashboardThunk(params));

      dispatch(getLastPunchInThunk())
        .unwrap()
        .then((res) => {
          if (res?.id !== "0" && res?.id !== 0) {
            setAttendance(res);
          } else {
            setAttendance(null);
          }
          setAttendance(res);
        })
        .catch((err) => {
          setAttendance(null);
        });
      setFromDate(fromDateStr);
      setToDate(toDateStr);
      dispatch(setActiveDashboardFromDate(fromDateStr));
      dispatch(setActiveDashboardToDate(toDateStr));


      const timer = setTimeout(() => {
        dispatch(setDashboardLoading(false));
      }, 2000);
      return () => clearTimeout(timer);
    } catch (error) {
      console.log("Error during refresh:", error);
    }
  };
  const pieChartData = filteredDashboard
    .filter((item) => {
      const num = Number(item?.data);
      return (
        item?.title !== "Attendance Code" &&
        item?.data !== "" &&
        !isNaN(num) &&
        num > 0
      );
    })
    .map((item, index) => ({
      value: Number(item?.data),
      color: accentColors[index % accentColors.length],
      text: item?.title,
    }));

  const renderDashboardItem = ({
    item,
    index,
    isFromHtml,
    isFromMenu,
  }: any) => {
    return (
      <TouchableOpacity
        style={[
          styles.dashboardItem,
          {
            paddingLeft: 4,
            marginHorizontal: 4,
            borderRadius: 8,
            width: isFromHtml ? "100%" : isHorizontal ? "100%" : "48%",
            flex: 1,

            borderLeftColor: accentColors[index % accentColors.length],
            borderWidth: 1,
            borderLeftWidth: 3,
            backgroundColor: theme === "dark" ? "black" : "white",
          },
          theme === "dark" && {
            borderWidth: 0.4,
            borderColor: ERP_COLOR_CODE.ERP_BORDER,
            borderLeftColor: accentColors[index % accentColors.length],
          },
        ]}
        activeOpacity={0.7}
        onPress={async () => {
          if (
            item?.url.includes(".") ||
            item?.url.includes("?") ||
            item?.url.includes("/")
          ) {
            navigation.navigate("Privacy Policy", { item });
          } else {
            navigation.navigate("List", { item });
          }
        }}
      >
        <View
          style={{
            backgroundColor:
              theme === "dark" ? "black" : ERP_COLOR_CODE.ERP_WHITE,
            borderRadius: 8,
          }}
        >
          <View style={styles.dashboardItemContent}>
            <View style={styles.dashboardItemHeader}>
              <View style={styles.dashboardItemTopRow}>
                <View
                  style={[
                    styles.iconContainer,
                    {
                      backgroundColor:
                        accentColors[index % accentColors.length],
                    },
                  ]}
                >
                  {item.icon?.includes("fa fa-") ? (
                    <FontAwesome
                      name={item.icon.replace("fa fa-", "")}
                      color={theme === "dark" ? "white" : "gray"}
                      size={20}
                    />
                  ) : item?.materialIcon ? (
                    <MaterialIcons
                      name={item.materialIcon || "widgets"}
                      color={ERP_COLOR_CODE.ERP_APP_COLOR}
                      size={22}
                    />
                  ) : (
                    <MaterialIcons name={"widgets"} color="white" size={18} />
                  )}

                  {/* <Text style={styles.iconText}>{getInitials(item?.name)}</Text> */}
                </View>
                <View style={styles.headerTextWrap}>
                  {/* <Text
                    style={[
                      styles.dashboardItemText,
                      {
                        color:
                          theme === 'dark' ? 'white' : ERP_COLOR_CODE.ERP_BLACK,
                        flexShrink: 1,
                        includeFontPadding: false,
                        textAlignVertical: 'top',
                      },
                    ]}
                    numberOfLines={2}
                    ellipsizeMode="tail"
                  >
                    {isFromMenu
                      ?  translateSingle(item?.title) 
                      : !isHorizontal
                        ? item?.title.replace(' ', '\n')
                        : translateSingle(item?.title)}
                  </Text> */}
                  <TranslatedText
                    text={item?.title}
                    style={[
                      styles.dashboardItemText,
                      {
                        color:
                          theme === "dark" ? "white" : ERP_COLOR_CODE.ERP_BLACK,
                        flexShrink: 1,
                        includeFontPadding: false,
                        textAlignVertical: "top",
                      },
                    ]}
                    numberOfLines={2}
                  />
                </View>
              </View>
            </View>

            <View style={{ marginVertical: item.data ? 4 : 0 }}>
              {loadingPageId === (item.id || String(index)) && (
                <View
                  style={{
                    marginBottom: 8,
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  <ActivityIndicator
                    size="small"
                    color={ERP_COLOR_CODE.ERP_007AFF}
                  />
                  <Text
                    style={{ marginLeft: 8, color: ERP_COLOR_CODE.ERP_6C757D }}
                  >
                    {t("text85")}
                  </Text>
                </View>
              )}
              {item.data ? (
                <View style={styles.dataContainer}>
                  <Footer
                    textColor={accentColors[index % accentColors.length]}
                    isFromMenu={isFromMenu}
                    isHorizontal={isHorizontal}
                    footer={item?.data}
                    index={index}
                    accentColors={accentColors}
                    isFromListPage={undefined}
                    isForChart={chartType === '' ? false : true}
                    chartType={chartType}

                  />
                </View>
              ) : (
                <View style={styles.dataContainer}>
                  <Text style={styles.dashboardItemData} numberOfLines={2}>
                    {"---"}
                  </Text>
                </View>
              )}
            </View>
            {item?.footer ? (
              <View style={{ marginTop: 1, overflow: "hidden" }}>
                <Footer
                  textColor={accentColors[index % accentColors.length]}
                  isFromMenu={isFromMenu}
                  isHorizontal={isHorizontal}
                  footer={item?.footer}
                  index={index}
                  accentColors={accentColors}
                  isFromListPage={undefined}
                  isForChart={chartType === '' ? false : true}
                  chartType={chartType}
                />
              </View>
            ) : (
              <Text
                style={{
                  color: accentColors[index % accentColors.length],
                }}
              >
                {"---"}
              </Text>
            )}
            {item?.footer || item.data ? (
              <> </>
            ) : (
              <View
                style={{ height: 12, width: 12, backgroundColor: "" }}
              ></View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderMoreItem = ({
    item,
    index,
    isFromHtml,
    isFromMenu,
  }: any) => {
    return (
      <TouchableOpacity
        onPress={async () => {
          if (
            item?.url.includes(".") ||
            item?.url.includes("?") ||
            item?.url.includes("/")
          ) {
            navigation.navigate("Privacy Policy", { item });
          } else {
            navigation.navigate("List", { item });
          }
        }}
      >
        <BirthdayList html={item?.footer} item={item} />

      </TouchableOpacity>
    )
  }
  const getCurrentMonthRange = useCallback(() => {
    const now = new Date();

    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date();

    const from = formatDateForAPI(firstDay);
    const to = formatDateForAPI(lastDay);

    setFromDate(from);
    setToDate(to);

    fetchPageData(from, to);
  }, []);

  const handleDateChange = useCallback(
    (event: any, selectedDate?: Date) => {
      console.log(
        "selectedDate++++++++++++++++++++++++++++++++++++++++++++",
        selectedDate,
      );
      if (event?.type === "dismissed" || !selectedDate) {
        setShowDatePicker(null);
        return;
      }

      const { type } = showDatePicker!;
      const formatted = formatDateForAPI(selectedDate);
      console.log("selectedDate", selectedDate, type);
      if (type === "to") {
        if (fromDate) {
          const from = new Date(fromDate.split("-").reverse().join("-"));

          if (selectedDate < from) {
            Alert.alert(t("text86"), t("text87"), [{ text: t("text88") }]);
            return;
          }
        }

        dispatch(setActiveDashboardToDate(formatted));
        setToDate(formatted);
      } else {
        dispatch(setActiveDashboardFromDate(formatted));
        setFromDate(formatted);

        if (toDate) {
          const to = new Date(toDate.split("-").reverse().join("-"));
          if (selectedDate > to) {
            setToDate("");
          }
        }
      }

      setShowDatePicker(null);
    },
    [fromDate, toDate, showDatePicker],
  );

  const fetchPageData = useCallback(
    async (fromDate: string, toDate: string) => {
      try {
        // setControlsLoader(true);

        const parsed = await dispatch(
          getERPPageThunk({ page: "Dashboard", id: "" }),
        ).unwrap();

        console.log("parsed-----", parsed)

        const normalizedControls = (parsed?.pagectl || []).map((c) => ({
          ...c,
          disabled: String(c?.disabled ?? "0"),
          visible: String(c?.visible ?? "1"),
          mandatory: String(c?.mandatory ?? "0"),
        }));

        setControls(normalizedControls);

        await fetchData(normalizedControls, fromDate, toDate);
      } catch (e) {
        console.log("fetchPageData error 66 ++ ++ + + ++ + + + + :", e);
      } finally {
        setControlsLoader(false);
        setLoadingPageId(null);
        setActionLoader(false);
      }
    },
    [dispatch],
  );

  useFocusEffect(
    useCallback(() => {
      let isMounted = true;

      const loadData = async () => {
        try {
          dispatch(setDashboardLoading(true));
          await new Promise(res => setTimeout(res, 400));
          await dispatch(
            getERPDashboardThunk({
              branch: auth?.dashboardBranchId,
              type:
                auth?.dashboardTypeId === "all" ||
                  auth?.dashboardTypeId === "ALL"
                  ? ""
                  : auth?.dashboardTypeId || "",
              fd: auth?.dashboardFromDate || fromDate,
              td: auth?.dashboardToDate || toDate,
            }),
          ).unwrap();
          if (appDrawerMenuList.length === 0 || appBottomMenuList.length === 0) {
            await new Promise(res => setTimeout(res, 800));
            await dispatch(getERPAppConfigMenuThunk()).unwrap();
          }

        } catch (error) {
          dispatch(updateAppMenuList([]));
          console.log("Error fetching app config menu:", error);
        } finally {
          if (isMounted) {
            setTimeout(() => {
              dispatch(setDashboardLoading(false));
            }, 2000);
          }
        }
      };

      loadData();

      return () => {
        isMounted = false;
      };
    }, [
      auth?.dashboardBranchId,
      auth?.dashboardTypeId,
      auth?.dashboardFromDate,
      auth?.dashboardToDate,
      fromDate,
      toDate,
      reLoading,
    ]),
  );

  const fetchData = useCallback(
    async (normalizedControls, fromDate, toDate) => {
      try {
        if (normalizedControls.length === 0) return;

        const branchObj = normalizedControls.find(
          (item) => item.fieldtitle === "Branch",
        );

        const typeObj = normalizedControls.find(
          (item) => item.fieldtitle === "Type",
        );
        console.log("branchObj", branchObj);
        const res = await dispatch(
          getDDLThunk({
            dtlid: branchObj?.dtlid,
            where: `UserID in (${user?.id}, -1) AND selected = 1`,
          }),
        ).unwrap();
        console.log("res------ ++++++ +++ ++ + + ++ + + + + + + ", res);

        const data = res?.data ?? [];
        const filtered = data.filter((item) => item.value !== -1);
        console.log(
          "filtered ++++++ +++ ++ + + ++ + + + + + +  fetchData +++++++ ",
          filtered,
        );

        const res1 = await dispatch(
          getDDLThunk({
            dtlid: typeObj?.dtlid,
            where: `UserID in (${user?.id}, -1)`,
          }),
        ).unwrap();

        const data1 = res1?.data ?? [];

        await dispatch(
          getERPDashboardThunk({
            branch: filtered[0]?.value?.toString() || "",
            type: data1[0]?.value?.toString() || "",
            fd: fromDate,
            td: toDate,
          }),
        );

        // dispatch(
        //   setActiveDashboardBranchId(filtered[0]?.value?.toString() || ""),
        // );
        // dispatch(setActiveDashboardBranch(filtered[0]?.name || ""));
        // dispatch(setActiveDashboardTypeId(data1[0]?.value?.toString() || ""));
        // dispatch(setActiveDashboardType(data1[0]?.name || ""));
        // dispatch(setActiveDashboardFromDate(fromDate));
        // dispatch(setActiveDashboardToDate(toDate));
        batch(() => {
          dispatch(
            setActiveDashboardBranchId(
              filtered[0]?.value?.toString() || "",
            ),
          );

          dispatch(
            setActiveDashboardBranch(
              filtered[0]?.name || "",
            ),
          );

          dispatch(
            setActiveDashboardTypeId(
              data1[0]?.value?.toString() || "",
            ),
          );

          dispatch(
            setActiveDashboardType(
              data1[0]?.name || "",
            ),
          );

          dispatch(setActiveDashboardFromDate(fromDate));
          dispatch(setActiveDashboardToDate(toDate));
        });
      } catch (error) {
        console.log("DDL Error:", error);
      }
    },
    [],
  );

  const uniqueByDate = useMemo(() => {
    if (listData.length === 0) return [];

    const priority = {
      FullDay: 4,
      Half: 3,
      Working: 2,
      "Punch Missing": 1,
      Leave: 0,
    };

    return Object.values(
      listData.reduce((acc, item) => {
        const key = item.date;

        if (
          !acc[key] ||
          (priority[item.status] || 0) > (priority[acc[key].status] || 0)
        ) {
          acc[key] = item;
        }

        return acc;
      }, {}),
    );
  }, [listData]);

  const leave = useMemo(
    () =>
      uniqueByDate.filter((i) => i?.status?.toLowerCase() === "leave").length,
    [uniqueByDate],
  );

  const late = useMemo(
    () =>
      uniqueByDate.filter((i) => i?.intime && isLatePunchIn(i?.intime)).length,
    [uniqueByDate],
  );

  const lessHours = useMemo(
    () =>
      uniqueByDate.filter(
        (i) =>
          i?.intime &&
          i?.outtime &&
          getWorkedHours(i?.intime, i?.outtime) < 8.5,
      ).length,
    [uniqueByDate],
  );

  const present = useMemo(
    () => uniqueByDate.length - leave,
    [uniqueByDate, leave],
  );
  const [tempDate, setTempDate] = useState(new Date());

  useEffect(() => {
    getCurrentMonthRange();
  }, [user, reLoading]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const raw = await dispatch(
          getERPListDataThunk({
            page: "PunchIn",
            fromDate: fromDate,
            toDate: toDate,
            param: "",
            branch: "",
          }),
        ).unwrap();
        const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
        const final = parsed?.d ? JSON.parse(parsed?.d) : parsed;
        setListData(final?.data || final || []);
        const res = await dispatch(getLastPunchInThunk()).unwrap();
        if (res?.id !== "0" && res?.id !== 0) {
          setAttendance(res);
        } else {
          setAttendance(null);
        }
      } catch (err) {
        console.log("Error:", err);
        setAttendance(null);
        setListData([]);
      }
    };

    fetchData();
  }, [dashboard, reLoading, fromDate, toDate]);

  const intervalRef = useRef(null);

  useEffect(() => {
    if (!attendance?.intime) return;

    const [hours, minutes] = attendance.intime.split(":").map(Number);

    const inTimeDate = new Date();
    inTimeDate.setHours(hours, minutes, 0, 0);

    const breakStart = new Date();
    breakStart.setHours(13, 30, 0, 0);

    const breakEnd = new Date();
    breakEnd.setHours(14, 30, 0, 0);

    const updateWorkingTime = () => {
      const now = new Date();

      if (now >= breakStart && now < breakEnd) {
        setWorkingTime("Break Time");
        return;
      }

      let diff = now.getTime() - inTimeDate.getTime();

      if (now >= breakEnd) {
        diff -= 60 * 60 * 1000;
      }

      if (diff <= 0) {
        setWorkingTime("00:00:00");
        return;
      }

      const hrs = Math.floor(diff / (1000 * 60 * 60));
      const mins = Math.floor((diff / (1000 * 60)) % 60);
      const secs = Math.floor((diff / 1000) % 60);

      setWorkingTime(
        `${String(hrs).padStart(2, "0")}:${String(mins).padStart(
          2,
          "0",
        )}:${String(secs).padStart(2, "0")}`,
      );
    };

    updateWorkingTime();

    intervalRef.current = setInterval(updateWorkingTime, 1000);

    return () => clearInterval(intervalRef.current);
  }, [attendance?.intime]);

  if (isDashboardLoading) return <FullViewLoader isShowTop={false} />;
  if (error) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: theme === "dark" ? "black" : "white",
        }}
      >
        <ErrorMessage message={error} isShowTop={false} />{" "}
      </View>
    );
  }
  if (!isDashboardLoading && dashboard?.length === 0) {
    return (
      <View
        style={{
          justifyContent: "center",
          backgroundColor: theme === "dark" ? "black" : "white",
        }}
      >
        <View
          style={{
            height: Dimensions.get("screen").height * 0.75,
            justifyContent: "center",
            alignItems: "center",
            width: "100%",
            backgroundColor: theme === "dark" ? "black" : "white",
          }}
        >
          <View
            style={{
              backgroundColor:
                theme === "dark" ? "black" : ERP_COLOR_CODE.ERP_APP_COLOR,
              padding: 12,
              width: width,
              borderBottomRightRadius: 8,
              borderBottomLeftRadius: 8,
              alignItems: "center",
              alignContent: "center",
            }}
          >
            {showFull && (
              <Animated.View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  alignContent: "center",
                  opacity: fadeAnim,
                  transform: [
                    {
                      translateY: fadeAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [-10, 0],
                      }),
                    },
                    {
                      scale: fadeAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.8, 1],
                      }),
                    },
                  ],
                }}
              >
                <MaterialIcons name="business" size={24} color={"#FFF"} />
                <Text
                  numberOfLines={1}
                  style={{
                    color: "#FFF",
                    fontWeight: "600",
                    fontSize: 16,
                    maxWidth: 280,
                    marginLeft: 8,
                  }}
                >
                  {user?.companyName || ""}
                </Text>
              </Animated.View>
            )}

            {/* Branch + Type Buttons */}
            {isFilterVisible && (
              <>
                <View
                  style={[
                    styles.dateContainer,
                    {
                      marginTop: 8,
                    },
                  ]}
                >
                  {/* Dynamic Render Date Fields */}
                  {isFilterVisible &&
                    controls
                      .filter((x) => x.ctltype === "DATE")
                      .map((item, index) => (
                        <View key={index} style={[styles.dateRow]}>
                          <TouchableOpacity
                            onPress={() =>
                              setShowDatePicker({
                                type: item.field === "fromdate" ? "from" : "to",
                                show: true,
                              })
                            }
                            style={[
                              styles.dateButton,
                              {
                                width: "98%",
                              },
                            ]}
                          >
                            <View
                              style={{
                                flexDirection: "row",
                                alignItems: "center",
                              }}
                            >
                              <MaterialIcons
                                name="calendar-today"
                                size={18}
                                color="#fff"
                                style={{ marginRight: 8 }}
                              />
                              <Text
                                style={[
                                  styles.dateButtonText,
                                  { color: "#FFF" },
                                ]}
                              >
                                {item.field === "fromdate"
                                  ? fromDate || "Select From Date"
                                  : toDate || "Select To Date"}
                              </Text>
                            </View>
                          </TouchableOpacity>
                          {index === 0 && (
                            <View style={{ height: 1, width: 8 }} />
                          )}
                        </View>
                      ))}
                </View>

                {isFilterVisible && (
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      marginTop: 4,
                    }}
                  >
                    {controls
                      .filter(
                        (x) => x.ctltype !== "DATE" && x.field !== "userid",
                      )
                      .map((item, index) => (
                        <>
                          <View style={{ width: "49.5%" }}>
                            <CustomPicker
                              isForceOpen={false}
                              isValidate={false}
                              label={item.title}
                              selectedValue={() => { }}
                              dtext={
                                item?.title === "Branch"
                                  ? auth?.dashboardBranch || item.dtext
                                  : auth.dashboardType || item?.dtext
                              }
                              onValueChange={(i) => {
                                if (item?.title === "Branch") {
                                  dispatch(
                                    setActiveDashboardBranchId(
                                      i?.value?.toString() || "",
                                    ),
                                  );
                                  dispatch(
                                    setActiveDashboardBranch(i?.name || ""),
                                  );
                                } else {
                                  dispatch(
                                    setActiveDashboardType(i?.name || ""),
                                  );
                                  dispatch(
                                    setActiveDashboardTypeId(
                                      i?.value?.toString() || "",
                                    ),
                                  );
                                }
                                setIsFilterVisible(false);
                              }}
                              options={[]}
                              item={item}
                              errors={null}
                              formValues={null}
                              isFromDashboard={true}
                            />
                          </View>
                        </>
                      ))}
                  </View>
                )}
              </>
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
                    (isLandscape || isIpad) && {
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
                        width: (isLandscape || isIpad) ? "40%" : "100%",
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
                            dispatch(setActiveDashboardFromDate(formatted));
                          } else {
                            setToDate(formatted);
                            dispatch(setActiveDashboardToDate(formatted));
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
                      themeVariant={theme === "dark" ? "dark" : "light"}
                      is24Hour={false}
                      onChange={(event, selectedDate) => {
                        if (selectedDate) {
                          setTempDate(selectedDate);
                        }
                      }}
                      style={[
                        styles.picker,
                        {
                          backgroundColor: theme === "dark" ? 'black' : "white",
                        },
                      ]}
                    />
                  </View>
                </View>
              </Modal>
            )}

            {/* Date Picker */}
            {Platform.OS !== "ios" && showDatePicker?.show && (
              <DateTimePicker
                value={
                  showDatePicker.type === "from" && fromDate
                    ? parseCustomDate(fromDate)
                    : showDatePicker.type === "to" && toDate
                      ? parseCustomDate(toDate)
                      : new Date()
                }
                mode="date"
                onChange={handleDateChange}
                themeVariant={theme === "dark" ? "dark" : "light"}
              />
            )}
          </View>

          {
            dashboard.length === 0 && <>
              {
                user?.company_code?.toLowerCase()?.includes("oeuvre01") ? <View
                  style={{
                    height: Dimensions.get('screen').height * 0.75,
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: theme === 'dark' ? 'black' : 'white',
                  }}
                >
                  <View style={{
                    height: 140, width: '100%',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                    <Image source={ERP_ICON.APP_LOGO} style={[styles.logo,
                    {
                      height: 140,
                      width: 140, marginBottom: 12
                    }
                    ]} resizeMode="contain" />
                    <Text style={{
                      fontSize: 30,
                      fontFamily: "Handlee-Regular",
                      color: theme === 'dark' ? 'white' : 'black'
                    }}>Welcome</Text>
                  </View>
                </View> : <NoData isShowTop={false} />
              }

            </>
          }
        </View>
      </View>
    );
  }
  // const scrollYY = useRef(new Animated.Value(0)).current;

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      bounces={false}
      style={{
        height: Dimensions.get("screen").height,
        flex: 1,
        backgroundColor: isDashboardLoading
          ? "black"
          : theme === "dark"
            ? "black"
            : "white",
      }}
    >
      <View
        style={{
          backgroundColor:
            theme === "dark" ? "black" : ERP_COLOR_CODE.ERP_APP_COLOR,
          padding: !showFull ? 2 : !hideTab ? 8 : 2,
          paddingBottom: 12,
          borderBottomRightRadius: 8,
          borderBottomLeftRadius: 8,
        }}
      >
        {showFull && !hideTab && (
          <Animated.View
            style={{
              justifyContent: "center",
              alignContent: "center",
              alignItems: "center",
              gap: 8,
              flexDirection: "row",
              // transform: [{ translateX }],
            }}
          >
            <MaterialIcons name="business" size={24} color={"#FFF"} />
            <TranslatedText
              numberOfLines={1}
              style={{
                color: "#FFF",
                fontWeight: "600",
                fontSize: 16,
                maxWidth: 280,
              }}
              text={user?.companyName || ""}
            ></TranslatedText>
          </Animated.View>
        )}

        {isLandscape && isFilterVisible && (
          <View style={{ flexDirection: "row" }}>
            <View
              style={[
                styles.dateContainer,
                {
                  marginTop: 8,
                  marginHorizontal: 4,
                },
                {
                  width: "48%",
                },
              ]}
            >
              {isFilterVisible &&
                controls
                  .filter((x) => x.ctltype === "DATE")
                  .map((item, index) => (
                    <View
                      key={index}
                      style={[
                        styles.dateRow,
                        {
                          width: "48%",
                        },
                      ]}
                    >
                      <TouchableOpacity
                        onPress={() =>
                          setShowDatePicker({
                            type: item.field === "fromdate" ? "from" : "to",
                            show: true,
                          })
                        }
                        style={[
                          styles.dateButton,
                          {
                            width: "98%",
                          },
                        ]}
                      >
                        <View
                          style={{ flexDirection: "row", alignItems: "center" }}
                        >
                          <MaterialIcons
                            name="calendar-today"
                            size={18}
                            color="#fff"
                            style={{ marginRight: 8 }}
                          />
                          <TranslatedText
                            numberOfLines={1}
                            text={
                              item.field === "fromdate"
                                ? fromDate || "Select From Date"
                                : toDate || "Select To Date"
                            }
                            style={[styles.dateButtonText, { color: "#FFF" }]}
                          ></TranslatedText>
                        </View>
                      </TouchableOpacity>
                      {index === 0 && <View style={{ height: 1, width: 8 }} />}
                    </View>
                  ))}
            </View>
            <View
              style={{
                width: "50%",
              }}
            >
              {isLandscape && isFilterVisible && (
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    marginTop: 8,
                    marginHorizontal: 4,
                  }}
                >
                  {controls
                    .filter((x) => x.ctltype !== "DATE" && x.field !== "userid")
                    .map((item, index) => (
                      <>
                        <View style={{ width: "49.5%" }}>
                          <CustomPicker
                            isForceOpen={false}
                            isValidate={false}
                            label={item.title}
                            selectedValue={() => { }}
                            dtext={
                              item?.title === "Branch"
                                ? auth?.dashboardBranch || item.dtext
                                : auth.dashboardType || item?.dtext
                            }
                            isFromDashboard={true}
                            onValueChange={(i) => {
                              if (item?.title === "Branch") {
                                dispatch(
                                  setActiveDashboardBranchId(
                                    i?.value?.toString() || "",
                                  ),
                                );
                                dispatch(
                                  setActiveDashboardBranch(i?.name || ""),
                                );
                              } else {
                                dispatch(setActiveDashboardType(i?.name || ""));
                                dispatch(
                                  setActiveDashboardTypeId(
                                    i?.value?.toString() || "",
                                  ),
                                );
                              }
                            }}
                            options={[]}
                            item={item}
                            errors={null}
                            formValues={null}
                          />
                        </View>
                      </>
                    ))}
                </View>
              )}
            </View>
          </View>
        )}

        {!isLandscape && isFilterVisible && (
          <>
            <View
              style={[
                styles.dateContainer,
                {
                  marginTop: 8,
                  marginHorizontal: 4,
                },
              ]}
            >
              {isFilterVisible &&
                controls
                  .filter((x) => x.ctltype === "DATE")
                  .map((item, index) => (
                    <View key={index} style={[styles.dateRow]}>
                      <TouchableOpacity
                        onPress={() =>
                          setShowDatePicker({
                            type: item.field === "fromdate" ? "from" : "to",
                            show: true,
                          })
                        }
                        style={[
                          styles.dateButton,
                          {
                            width: "97.5%",
                          },
                        ]}
                      >
                        <View
                          style={{ flexDirection: "row", alignItems: "center" }}
                        >
                          <MaterialIcons
                            name="calendar-today"
                            size={18}
                            color="#fff"
                            style={{ marginRight: 8 }}
                          />
                          <TranslatedText
                            numberOfLines={1}
                            text={
                              item.field === "fromdate"
                                ? fromDate || "Select From Date"
                                : toDate || "Select To Date"
                            }
                            style={[styles.dateButtonText, { color: "#FFF" }]}
                          ></TranslatedText>
                        </View>
                      </TouchableOpacity>
                      {index === 0 && <View style={{ height: 1, width: 8 }} />}
                    </View>
                  ))}
            </View>

            {!isLandscape && isFilterVisible && (
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  marginTop: 4,
                  marginHorizontal: 4,
                }}
              >
                {controls
                  .filter((x) => x.ctltype !== "DATE" && x.field !== "userid")
                  .map((item, index) => (
                    <>
                      <View style={{ width: "49.5%" }}>
                        <CustomPicker
                          isForceOpen={false}
                          isValidate={false}
                          label={item.title}
                          selectedValue={() => { }}
                          dtext={
                            item?.title === "Branch"
                              ? auth?.dashboardBranch || item.dtext
                              : auth.dashboardType || item?.dtext
                          }
                          onValueChange={(i) => {
                            if (item?.title === "Branch") {
                              dispatch(
                                setActiveDashboardBranchId(
                                  i?.value?.toString() || "",
                                ),
                              );
                              dispatch(setActiveDashboardBranch(i?.name || ""));
                            } else {
                              dispatch(setActiveDashboardType(i?.name || ""));
                              dispatch(
                                setActiveDashboardTypeId(
                                  i?.value?.toString() || "",
                                ),
                              );
                            }
                          }}
                          options={[]}
                          item={item}
                          errors={null}
                          formValues={null}
                          isFromDashboard={true}
                        />
                      </View>
                    </>
                  ))}
              </View>
            )}
          </>
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
                (isLandscape || isIpad) && {
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
                    width: (isLandscape || isIpad) ? "40%" : "100%",
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

                  <TouchableOpacity
                    onPress={() => {
                      const formatted = formatDateForAPI(tempDate);

                      if (showDatePicker.type === "from") {
                        setFromDate(formatted);
                        dispatch(setActiveDashboardFromDate(formatted));
                      } else {
                        setToDate(formatted);
                        dispatch(setActiveDashboardToDate(formatted));
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
                  themeVariant={theme === "dark" ? "dark" : "light"}
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
                      backgroundColor: theme === 'dark' ? 'black' : "white",
                    },
                  ]}
                />
              </View>
            </View>
          </Modal>
        )}

        {Platform.OS !== "ios" && showDatePicker?.show && (
          <DateTimePicker
            value={
              showDatePicker.type === "from" && fromDate
                ? parseCustomDate(fromDate)
                : showDatePicker.type === "to" && toDate
                  ? parseCustomDate(toDate)
                  : new Date()
            }
            mode="date"
            display={"spinner"}
            is24Hour={false}
            onChange={handleDateChange}
            themeVariant={theme === "dark" ? "dark" : "light"}
          />
        )}
      </View>

      {
        searchText.length > 0 && filteredDashboard?.length === 0 ? <>

          <View
            style={{
              height: Dimensions.get("screen").height - 350,
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: theme === "dark" ? "black" : "white",
            }}
          >
            <NoData isShowTop={false} />
          </View>

        </> : <FlatList
          data={[""]}
          bounces={false}

          key={
            isLandscape
              ? `${isHorizontal}-landscape1`
              : `${isHorizontal}-portrait1`
          }
          showsVerticalScrollIndicator={false}
          renderItem={() => {
            return (
              <>
                {isDashboardLoading ? (
                  <View
                    style={{
                      height: Dimensions.get("screen").height * 0.75,
                      justifyContent: "center",
                      alignItems: "center",
                      backgroundColor: theme === "dark" ? "black" : "white",
                    }}
                  >
                    <FullViewLoader isShowTop={false} />
                  </View>
                ) : error ? (
                  <View
                    style={{
                      flex: 1,
                      justifyContent: "center",
                      alignItems: "center",
                      backgroundColor: theme === "dark" ? "black" : "white",
                    }}
                  >
                    <ErrorMessage message={error} isShowTop={false} />{" "}
                  </View>
                ) : dashboard?.length === 0 && !isDashboardLoading ? (
                  <>
                    {
                      user?.company_code?.toLowerCase()?.includes("oeuvre01") ? <View
                        style={{
                          height: Dimensions.get('screen').height * 0.75,
                          justifyContent: 'center',
                          alignItems: 'center',
                          backgroundColor: theme === 'dark' ? 'black' : 'white',
                        }}
                      >
                        <View style={{
                          height: 140, width: '100%',
                          justifyContent: 'center',
                          alignItems: 'center',
                        }}>
                          <Image source={ERP_ICON.APP_LOGO} style={[styles.logo,
                          {
                            height: 140,
                            width: 140, marginBottom: 12
                          }
                          ]} resizeMode="contain" />
                          <Text style={{
                            fontSize: 30,
                            fontFamily: "Handlee-Regular",
                            color: theme === 'dark' ? 'white' : 'black'
                          }}>Welcome</Text>
                        </View>
                      </View>
                        :
                        <>
                          {
                            user?.company_code?.toLowerCase()?.includes("oeuvre01") ?

                              <View
                                style={{
                                  height: Dimensions.get('screen').height * 0.75,
                                  justifyContent: 'center',
                                  alignItems: 'center',
                                  backgroundColor: theme === 'dark' ? 'black' : 'white',
                                }}
                              >
                                <View style={{
                                  height: 140, width: '100%',
                                  justifyContent: 'center',
                                  alignItems: 'center',
                                }}>
                                  <Image source={ERP_ICON.APP_LOGO} style={[styles.logo,
                                  {
                                    height: 140,
                                    width: 140, marginBottom: 12
                                  }
                                  ]} resizeMode="contain" />
                                  <Text style={{
                                    fontSize: 30,
                                    fontFamily: "Handlee-Regular",
                                    color: theme === 'dark' ? 'white' : 'black'
                                  }}>Welcome</Text>
                                </View>
                              </View>
                              : <View
                                style={{
                                  height: Dimensions.get("screen").height,
                                  justifyContent: "center",
                                  alignItems: "center",
                                  backgroundColor: theme === "dark" ? "black" : "white",
                                }}
                              >
                                <NoData isShowTop={false} />
                              </View>
                          }
                        </>


                    }
                  </>

                ) : (
                  <View
                    style={{
                      backgroundColor: theme === "dark" ? "black" : "white",
                      flex: 1,
                    }}
                  >
                    <>
                      <Animated.FlatList
                        showsVerticalScrollIndicator={false}
                        data={[""]}
                        keyExtractor={(_, i) => i.toString()}
                        onScroll={Animated.event(
                          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                          {
                            useNativeDriver: true,
                          },
                        )}
                        scrollEventThrottle={16}
                        renderItem={() => (
                          <View
                            style={{
                              backgroundColor:
                                theme === "dark" ? "black" : "white",
                              flex: 1,
                            }}
                          >

                            <View>
                              {pieChartData.length > 0 && (
                                <>
                                  <View
                                    style={{
                                      marginTop: theme === "light" ? 12 : 2,
                                      marginBottom: 2,
                                      backgroundColor:
                                        theme === "dark" ? "gray" : "#f5f5f5",
                                      flexDirection: "row",
                                      justifyContent: "space-between",
                                      padding: 8,
                                      borderRadius: 4,
                                      alignItems: "center",
                                      marginHorizontal: 8,
                                    }}
                                  >
                                    <View
                                      style={{
                                        justifyContent: "center",
                                        alignContent: "center",
                                        alignItems: "center",
                                        flexDirection: "row",
                                        gap: 4,
                                      }}
                                    >
                                      <MaterialIcons
                                        size={14}
                                        color={
                                          theme === "dark" ? "white" : "gray"
                                        }
                                        name="donut-large"
                                      />
                                      <Text
                                        style={{
                                          color:
                                            theme === "dark" ? "white" : "black",
                                          fontWeight: "600",
                                        }}
                                      >
                                        Chart Data
                                      </Text>
                                    </View>
                                  </View>
                                  <PieChartSection
                                    pieChartData={pieChartData}
                                    navigation={navigation}
                                    t={t}
                                  />
                                </>
                              )}
                              {pieChartData.length === 0 && (
                                <View style={{ marginTop: 12 }} />
                              )}
                            </View>

                            {
                              marqueeItems.length > 0 && <View
                                style={[
                                  styles.dashboardSection,
                                  {
                                    marginLeft: 2,
                                    marginRight: 8,
                                  },
                                ]}
                              >
                                <View
                                  style={{
                                    backgroundColor:
                                      theme === "dark" ? "gray" : "#f5f5f5",
                                    flexDirection: "row",
                                    justifyContent: "space-between",
                                    padding: 8,
                                    borderRadius: 4,
                                    alignItems: "center",
                                  }}
                                >
                                  <View
                                    style={{
                                      justifyContent: "center",
                                      alignContent: "center",
                                      alignItems: "center",
                                      flexDirection: "row",
                                      gap: 4,
                                    }}
                                  >
                                    <MaterialIcons
                                      size={14}
                                      color={theme === "dark" ? "white" : "gray"}
                                      name="dashboard"
                                    />
                                    <Text
                                      style={{
                                        color: theme === "dark" ? "white" : "black",
                                        fontWeight: "600",
                                      }}
                                    >
                                      Today update
                                    </Text>
                                  </View>


                                </View>
                                <View
                                  style={{
                                    marginRight: 8,
                                  }}
                                >
                                  <FlatList
                                    bounces={false}

                                    key={
                                      isLandscape
                                        ? `${isHorizontal}-landscape3`
                                        : `${isHorizontal}-portrait3`
                                    }
                                    keyboardShouldPersistTaps="handled"
                                    data={marqueeItems}
                                    keyExtractor={(item, index) => index.toString()}
                                    renderItem={({ item, index }) =>
                                      renderMoreItem({
                                        item,
                                        index,
                                        isFromHtml: true,
                                        isFromMenu: true,
                                      })
                                    }
                                    numColumns={isIpad ? 2 : 1}
                                    showsVerticalScrollIndicator={false}
                                  />
                                </View>
                              </View>

                            }
                            <View
                              style={[
                                styles.dashboardSection,
                                {
                                  marginLeft: 2,
                                  marginRight: 8,
                                },
                              ]}
                            >
                              <View
                                style={{
                                  marginBottom: 8,
                                  backgroundColor:
                                    theme === "dark" ? "gray" : "#f5f5f5",
                                  flexDirection: "row",
                                  justifyContent: "space-between",
                                  padding: 8,
                                  borderRadius: 4,
                                  alignItems: "center",
                                }}
                              >
                                <View
                                  style={{
                                    justifyContent: "center",
                                    alignContent: "center",
                                    alignItems: "center",
                                    flexDirection: "row",
                                    gap: 4,
                                  }}
                                >
                                  <MaterialIcons
                                    size={14}
                                    color={theme === "dark" ? "white" : "gray"}
                                    name="dashboard"
                                  />
                                  <Text
                                    style={{
                                      color: theme === "dark" ? "white" : "black",
                                      fontWeight: "600",
                                    }}
                                  >
                                    Dashboard
                                  </Text>
                                </View>


                              </View>
                              <View
                                style={{
                                  marginRight: 8,
                                }}
                              >
                                <FlatList
                                  bounces={false}

                                  key={
                                    isLandscape
                                      ? `${isHorizontal}-landscape3`
                                      : `${isHorizontal}-portrait3`
                                  }
                                  keyboardShouldPersistTaps="handled"
                                  data={htmlItems}
                                  keyExtractor={(item, index) => index.toString()}
                                  renderItem={({ item, index }) =>
                                    renderDashboardItem({
                                      item,
                                      index,
                                      isFromHtml: true,
                                      isFromMenu: true,
                                    })
                                  }
                                  numColumns={isIpad ? 2 : 1}
                                  showsVerticalScrollIndicator={false}
                                />
                              </View>
                            </View>



                            <View
                              style={[
                                styles.dashboardSection,
                                {
                                  marginLeft: 2,
                                  marginRight: 4,
                                },
                              ]}
                            >
                              <FlatList
                                bounces={false}

                                key={
                                  isLandscape
                                    ? `${isHorizontal}-landscape2`
                                    : `${isHorizontal}-portrait2`
                                }
                                keyboardShouldPersistTaps="handled"
                                data={[...textItems, ...emptyItems]}
                                keyExtractor={(item, index) => index.toString()}
                                numColumns={
                                  isLandscape
                                    ? isHorizontal
                                      ? 2
                                      : 4
                                    : isHorizontal
                                      ? 1
                                      : 2
                                }
                                columnWrapperStyle={
                                  !isHorizontal ? styles.columnWrapper : undefined
                                }
                                renderItem={({ item, index }) =>
                                  renderDashboardItem({
                                    item,
                                    index,
                                    isFromHtml: false,
                                    isFromMenu: false,
                                  })
                                }
                                showsVerticalScrollIndicator={false}
                              />
                            </View>

                            {user?.company_code
                              ?.toLowerCase()
                              ?.includes("deverp") &&
                              attendance?.intime && (
                                <>
                                  <View
                                    style={{
                                      marginTop: 2,
                                      marginBottom: 2,
                                      backgroundColor:
                                        theme === "dark" ? "gray" : "#f5f5f5",
                                      flexDirection: "row",
                                      justifyContent: "space-between",
                                      padding: 8,
                                      borderRadius: 4,
                                      alignItems: "center",
                                      marginHorizontal: 8,
                                    }}
                                  >
                                    <View
                                      style={{
                                        justifyContent: "center",
                                        alignContent: "center",
                                        alignItems: "center",
                                        flexDirection: "row",
                                        gap: 4,
                                      }}
                                    >
                                      <MaterialIcons
                                        size={14}
                                        color={
                                          theme === "dark" ? "white" : "gray"
                                        }
                                        name="dashboard"
                                      />
                                      <Text
                                        style={{
                                          color:
                                            theme === "dark" ? "white" : "black",
                                          fontWeight: "600",
                                        }}
                                      >
                                        Today Attendance
                                      </Text>
                                    </View>

                                    <View
                                      style={{
                                        opacity: 0.6,
                                        justifyContent: "center",
                                        alignItems: "center",
                                        borderRadius: 4,
                                      }}
                                    >
                                      <Text
                                        style={{
                                          color:
                                            theme === "dark" ? "white" : "gray",
                                          fontWeight: "600",
                                        }}
                                      >
                                        {new Date().toLocaleDateString()}
                                      </Text>
                                    </View>
                                  </View>
                                </>
                              )}

                            {user?.company_code
                              ?.toLowerCase()
                              ?.includes("deverp") &&
                              attendance?.intime && (
                                <>
                                  <View style={styles.timeContainer}>
                                    <View style={styles.timeItem}>
                                      <View
                                        style={[
                                          styles.iconTimeContainer,
                                          {
                                            backgroundColor:
                                              theme === "dark"
                                                ? "gray"
                                                : "#f5f5f5",
                                          },
                                        ]}
                                      >
                                        <MaterialIcons
                                          name="login"
                                          size={22}
                                          color={
                                            theme === "dark"
                                              ? "white"
                                              : ERP_COLOR_CODE.ERP_APP_COLOR
                                          }
                                        />
                                      </View>
                                      <Text
                                        style={[
                                          styles.timeText,
                                        ]}
                                      >
                                        {attendance.intime || "-"}
                                      </Text>
                                      <Text
                                        style={[
                                          styles.labelText,
                                        ]}
                                      >
                                        Check In
                                      </Text>
                                    </View>
                                    <TouchableOpacity
                                      disabled={workingTime !== "00:00:00"}
                                      onPress={() => {
                                        navigation.navigate("Attendance", {
                                          isFor: "Attendance",
                                          isFromBreak: true,
                                        });
                                      }}
                                      style={styles.timeItem}>
                                      <View
                                        style={[
                                          styles.iconTimeContainer,
                                          {
                                            backgroundColor:
                                              theme === "dark"
                                                ? "gray"
                                                : "#f5f5f5",
                                          },
                                        ]}
                                      >
                                        <MaterialIcons
                                          name="access-time"
                                          size={22}
                                          color={
                                            theme === "dark"
                                              ? "white"
                                              : ERP_COLOR_CODE.ERP_green
                                          }
                                        />
                                      </View>
                                      <Text
                                        style={[
                                          styles.timeText,
                                          {
                                            color:
                                              theme === "dark"
                                                ? "white"
                                                : ERP_COLOR_CODE.ERP_green,
                                          },
                                        ]}
                                      >
                                        {workingTime}
                                      </Text>
                                      <Text
                                        style={[
                                          styles.labelText,
                                        ]}
                                      >
                                        Working Hrs
                                      </Text>
                                    </TouchableOpacity>
                                    {/* Clock Out */}
                                    <TouchableOpacity
                                      onPress={() => {
                                        navigation.navigate("Attendance", {
                                          isFor: "Attendance",
                                          isFromDashboard: true,
                                        });
                                      }}
                                      style={styles.timeItem}
                                    >
                                      <View
                                        style={[
                                          styles.iconTimeContainer,
                                          {
                                            backgroundColor:
                                              theme === "dark"
                                                ? "gray"
                                                : "#f5f5f5",
                                          },
                                        ]}
                                      >
                                        <MaterialIcons
                                          name="logout"
                                          size={22}
                                          color={
                                            theme === "dark"
                                              ? "white"
                                              : ERP_COLOR_CODE.ERP_ERROR
                                          }
                                        />
                                      </View>
                                      <Text
                                        style={[
                                          styles.timeText,
                                          {
                                            color: ERP_COLOR_CODE.ERP_ERROR,
                                          },
                                        ]}
                                      >
                                        -
                                      </Text>
                                      <Text
                                        style={[
                                          styles.labelText,
                                        ]}
                                      >
                                        Check Out
                                      </Text>
                                    </TouchableOpacity>
                                  </View>
                                </>
                              )}
                            {/* {attendance?.intime && (
                            <View
                              style={{
                                // backgroundColor: "#f5f5f5",
                                borderRadius: 4,
                                marginTop: 2,
                                marginBottom: 2,
                                flexDirection: "row",
                                alignItems: "center",
                                gap: 4,
                                width: "94%",
                                marginLeft: 12,
                                paddingVertical: 4,
                                borderWidth: 0.4,
                                borderColor: ERP_COLOR_CODE.ERP_BORDER_LINE,
                              }}
                            >
                              <View
                                style={[
                                  styles.iconTimeContainer,
                                  {
                                    marginLeft: 4,
                                    backgroundColor:
                                      theme === "dark" ? "gray" : "#f5f5f5",
                                  },
                                ]}
                              >
                                <MaterialIcons
                                  name="location-on"
                                  size={22}
                                  color={ERP_COLOR_CODE.ERP_ERROR}
                                />
                              </View>
                              <View style={{ width: "88%" }}>
                                <Text
                                  style={{
                                    color: theme === "dark" ? "white" : "black",
                                  }}
                                >
                                  ---
                                </Text>
                              </View>
                            </View>
                          )} */}
                            {user?.company_code
                              ?.toLowerCase()
                              ?.includes("deverp") &&
                              attendance?.intime && (
                                <>
                                  <View
                                    style={{
                                      marginTop: 4,
                                      marginBottom: 4,
                                      backgroundColor:
                                        theme === "dark" ? "gray" : "#f5f5f5",
                                      flexDirection: "row",
                                      justifyContent: "space-between",
                                      padding: 8,
                                      borderRadius: 4,
                                      alignItems: "center",
                                      marginHorizontal: 8,
                                    }}
                                  >
                                    <View
                                      style={{
                                        justifyContent: "center",
                                        alignContent: "center",
                                        alignItems: "center",
                                        flexDirection: "row",
                                        gap: 4,
                                      }}
                                    >
                                      <MaterialIcons
                                        size={14}
                                        color={
                                          theme === "dark" ? "white" : "gray"
                                        }
                                        name="dashboard"
                                      />
                                      <Text
                                        style={{
                                          color:
                                            theme === "dark" ? "white" : "black",
                                          fontWeight: "600",
                                        }}
                                      >
                                        Summary
                                      </Text>
                                    </View>

                                    <TouchableOpacity
                                      onPress={() => {
                                        navigation.navigate("MyAttendance", {
                                          isFor: "MyAttendance",
                                        });
                                      }}
                                      style={{
                                        opacity: 0.6,
                                        justifyContent: "center",
                                        alignItems: "center",
                                        borderRadius: 4,
                                      }}
                                    >
                                      <Text
                                        style={{
                                          color:
                                            theme === "dark" ? "white" : "gray",
                                          fontWeight: "600",
                                        }}
                                      >
                                        View all
                                      </Text>
                                    </TouchableOpacity>
                                  </View>
                                </>
                              )}

                            {user?.company_code
                              ?.toLowerCase()
                              ?.includes("deverp") &&
                              attendance?.intime && (
                                <>
                                  <View style={styles.timeContainer}>
                                    {/* Clock In */}
                                    <View
                                      style={[styles.timeItem, { width: "23%" }]}
                                    >
                                      <View
                                        style={[
                                          styles.iconTimeContainer,
                                          {
                                            backgroundColor:
                                              theme === "dark"
                                                ? "gray"
                                                : "#f5f5f5",
                                          },
                                        ]}
                                      >
                                        <MaterialIcons
                                          name="co-present"
                                          size={22}
                                          color={
                                            theme === "dark"
                                              ? "white"
                                              : ERP_COLOR_CODE.ERP_APP_COLOR
                                          }
                                        />
                                      </View>
                                      <Text
                                        style={[
                                          styles.timeText,
                                        ]}
                                      >
                                        {present}
                                      </Text>
                                      <Text
                                        style={[
                                          styles.labelText,
                                        ]}
                                      >
                                        Present
                                      </Text>
                                    </View>
                                    <View
                                      style={[
                                        styles.timeItem,
                                        {
                                          width: "23%",
                                        },
                                      ]}
                                    >
                                      <View
                                        style={[
                                          styles.iconTimeContainer,
                                          {
                                            backgroundColor:
                                              theme === "dark"
                                                ? "gray"
                                                : "#f5f5f5",
                                          },
                                        ]}
                                      >
                                        <MaterialIcons
                                          name="access-time"
                                          size={22}
                                          color={
                                            theme === "dark"
                                              ? "white"
                                              : ERP_COLOR_CODE.ERP_ERROR
                                          }
                                        />
                                      </View>
                                      <Text
                                        style={[
                                          styles.timeText,
                                        ]}
                                      >
                                        {leave}
                                      </Text>
                                      <Text
                                        style={[
                                          styles.labelText,
                                        ]}
                                      >
                                        Absents
                                      </Text>
                                    </View>
                                    {/* Clock Out */}
                                    <TouchableOpacity
                                      style={[
                                        styles.timeItem,
                                        {
                                          width: "23%",
                                        },
                                      ]}
                                    >
                                      <View
                                        style={[
                                          styles.iconTimeContainer,
                                          {
                                            backgroundColor:
                                              theme === "dark"
                                                ? "gray"
                                                : "#f5f5f5",
                                          },
                                        ]}
                                      >
                                        <MaterialIcons
                                          name="access-alarm"
                                          size={22}
                                          color={
                                            theme === "dark"
                                              ? "white"
                                              : ERP_COLOR_CODE.ERP_ERROR
                                          }
                                        />
                                      </View>
                                      <Text
                                        style={[
                                          styles.timeText,
                                        ]}
                                      >
                                        {late}
                                      </Text>
                                      <Text
                                        style={[
                                          styles.labelText,
                                        ]}
                                      >
                                        Late
                                      </Text>
                                    </TouchableOpacity>

                                    <View
                                      style={[
                                        styles.timeItem,
                                        {
                                          width: "23%",
                                        },
                                      ]}
                                    >
                                      <View
                                        style={[
                                          styles.iconTimeContainer,
                                          {
                                            backgroundColor:
                                              theme === "dark"
                                                ? "gray"
                                                : "#f5f5f5",
                                          },
                                        ]}
                                      >
                                        <MaterialIcons
                                          name="access-time"
                                          size={22}
                                          color={
                                            theme === "dark" ? "white" : "#ff9800"
                                          }
                                        />
                                      </View>
                                      <Text
                                        style={[
                                          styles.timeText,
                                        ]}
                                      >
                                        {lessHours}
                                      </Text>
                                      <Text
                                        style={[
                                          styles.labelText,
                                        ]}
                                      >
                                        Less-Hr
                                      </Text>
                                    </View>
                                  </View>
                                </>
                              )}

                            {user?.company_code
                              ?.toLowerCase()
                              ?.includes("deverp") &&
                              attendance?.intime && (
                                <>
                                  <LeaveBalanceSection />
                                </>
                              )}
                          </View>
                        )}
                      />

                      {
                        user?.company_code?.toLowerCase()?.includes("oeuvre01") && <View style={{
                          height: 350, width: '100%',
                          alignContent: 'center',
                          alignItems: 'center',
                          alignSelf: 'center',
                          justifyContent: "center"
                        }}>
                          <Image source={ERP_ICON.APP_LOGO} style={[styles.logo,
                          {
                            height: 140,
                            width: 140, marginBottom: 12
                          }
                          ]} resizeMode="contain" />
                          <Text style={{
                            fontSize: 30,
                            fontFamily: "Handlee-Regular",
                            color: theme === 'dark' ? 'white' : 'black'
                          }}>Welcome</Text>
                        </View>
                      }

                    </>
                  </View>
                )}
              </>
            );
          }}
        />

      }

      {appBottomMenuList.length === 0 && alertVisible && (
        <CustomAlert
          visible={alertVisible}
          title={"No menu available"}
          message={"Please contact your administrator."}
          type={"error"}
          onClose={() => {
            setAlertVisible(false);
          }}
          isSettingVisible={false}
          actionLoader={undefined}
          closeHide={false}
        />
      )}
      {
        !user?.company_code?.toLowerCase()?.includes("oeuvre01") && <GreetingBottomSheet
          visible={visibleAI}
          message={aiMessage}
          onClose={() => setVisibleAI(false)}
        />
      }


    </ScrollView>
  );
};

export default HomeScreen;
