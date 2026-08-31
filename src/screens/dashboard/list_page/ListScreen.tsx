import {
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
  Modal,
  Platform,
  Animated,
  ActivityIndicator,
  useWindowDimensions,
  PanResponder,
  Dimensions,
  Image,
  ScrollView,
} from "react-native";
import React, {
  useEffect,
  useLayoutEffect,
  useState,
  useCallback,
  useMemo,
  useRef,
} from "react";
import {
  RouteProp,
  useFocusEffect,
  useNavigation,
  useRoute,
} from "@react-navigation/native";

import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import {
  getERPListDataThunk,
  getERPPageThunk,
} from "../../../store/slices/auth/thunk";
import { styles } from "./list_page_style";
import DateTimePicker from "@react-native-community/datetimepicker";
import { formatDateForAPI, parseCustomDate } from "../../../utils/helpers";
import FullViewLoader from "../../../components/loader/FullViewLoader";
import { ListRouteParams } from "./types";
import ErrorMessage from "../../../components/error/Error";
import ReadableView from "./components/ReadableView";
import ERPIcon from "../../../components/icon/ERPIcon";
import CustomAlert from "../../../components/alert/CustomAlert";
import {
  handleDeleteActionThunk,
  handlePageActionThunk,
} from "../../../store/slices/page/thunk";
import MaterialIcons from "@react-native-vector-icons/material-icons";
import { ERP_COLOR_CODE } from "../../../utils/constants";
import useTranslations from "../../../hooks/useTranslations";
import TranslatedText from "../tabs/home/TranslatedText";
import CustomMultiplePicker from "../page/components/CustomMultiplePicker";
import {
  updateSelectedBranchesState,
  updateSelectedBranchIdsState,
  updateSelectedFromDateState,
  updateSelectedToDateState,
} from "../../../store/slices/auth/authSlice";
import { getDDLThunk } from "../../../store/slices/dropdown/thunk";
import TableView from "./components/TableView";
import GroupFilterModal from "./components/GroupFilterModal";
import SortingFilterModal from "./components/SortingFilterModal";
import DeviceInfo from "react-native-device-info"; 

const ListScreen = () => {
  const route = useRoute<RouteProp<ListRouteParams, "List">>();
  const { item, parsedConfig } = route?.params;
  let DateType = parsedConfig?.dateType || "Month";
  console.log("parsedConfig", parsedConfig);
  const navigation = useNavigation();
  const dispatch = useAppDispatch();

  const {
    loading: actionLoader,
    error: actionError,
    response: actionResponse,
  } = useAppSelector((state) => state.page);
  const isIpad =
    (Platform.OS === "ios" && Platform.isPad) || DeviceInfo.isTablet() || Platform.isTV;
  const { t } = useTranslations();
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [loadingListId, setLoadingListId] = useState<string | null>(null);
  const [listData, setListData] = useState<any[]>([]);
  const [configData, setConfigData] = useState<any[]>([]);
  const { user, fromDate, toDate, selectedBranchIds } = useAppSelector(
    (state) => state.auth,
  );
  const [error, setError] = useState<string | null>(null);
  const [tempDate, setTempDate] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isFilterVisible, setIsFilterVisible] = useState<boolean>(false);
  const [isTableView, setIsTableView] = useState<boolean>(false);
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [sortConfig, setSortConfig] =
    useState<{
      key: string;
      order: "asc" | "desc";
    } | null>(null);
  const [alertVisible, setAlertVisible] = useState(false);
  const [actionLoaders, setActionLoader] = useState(false);
  const [parsedError, setParsedError] = useState<any>();
  const [apiError, setApiError] = useState<any>(false);
  const [tapLoader, setTapLoader] = useState(false);
  const { height, width } = useWindowDimensions();
  const isLandscape = width > height;
  const [primaryGroupKey, setPrimaryGroupKey] =
    useState("");

  const [secondaryGroupKey, setSecondaryGroupKey] =
    useState("");
  const [groupModalVisible1, setGroupModalVisible1] =
    useState(false);
  const [groupModalVisible2, setGroupModalVisible2] =
    useState(false);

  const [sortingVisible, setSortingVisible] =
    useState(false);
  const [sortingKey, setSortingKey] =
    useState("");

  const [bottomSheetType, setBottomSheetType] = useState('');
  const [showInfoModal, setShowInfoModal] = useState(false);
  const sheetProgress = useRef(
    new Animated.Value(0),
  ).current;
  const [showLoginSheet, setShowLoginSheet] = useState(false);
  const [confirmation, setConfirmation] = useState<any>()
  const [selected, setSelected] = useState<"yes" | "no" | null>(null);

  const sheetTranslateY =
    sheetProgress.interpolate({
      inputRange: [0, 1],
      outputRange: [400, 0],
    });

  const openSheet = () => {
    setSelectedLoginType("")
    setShowLoginSheet(true);
    sheetProgress.setValue(0);

    Animated.timing(sheetProgress, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const closeSheet = () => {
    setShowLoginSheet(false);
    setConfirmation(false)
    setSelected(null)
    setTapLoader(false)
  };

  const [selectedLoginType, setSelectedLoginType] = useState();

  const availableKeys = Object.keys(
    filteredData?.[0] || {},
  ).filter(
    (key) =>
      key !== "id" &&
      key !== "html" &&
      !key.startsWith("btn_"),
  );
  useEffect(() => {
    return () => {
      setTapLoader(false);
    };
  }, []);

  const [alertConfig, setAlertConfig] = useState({
    title: "",
    message: "",
    type: "info" as "error" | "success" | "info",
    actionValue: "",
    color: ERP_COLOR_CODE.ERP_BLACK,
    id: 0,
  });

  const [showDatePicker, setShowDatePicker] = useState<null | {
    type: "from" | "to";
    show: boolean;
  }>(null);

  const theme = useAppSelector((state) => state?.theme.mode);

  const pageTitle = item?.title || item?.name || "List Data";
  const pageParamsName = item?.name || "List Data";
  const pageName = item?.url;

  console.log("ListScreen params-----------", item);
  const isFromBusinessCard = item?.isFromBusinessCard || false;
  const isFromAlertCard = item?.isFromAlertCard || false;

  const [page, setPage] = useState(1);
  const [pageSize] = useState(100);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [controls, setControls] = useState<any[]>([]);

  const pressAnim = useRef(new Animated.Value(1)).current;
  const onPressIn = () => {
    Animated.spring(pressAnim, {
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
  // useEffect(() => {
  //   if (!filteredData) return;
  //   setPage(1);
  //   setHasMore(true);

  //   const firstPage = filteredData.slice(0, pageSize);
  //   setListData(firstPage);
  // }, [filteredData]);

  const loadMore = () => {
    if (isLoadingMore || !hasMore) return;

    setIsLoadingMore(true);

    setTimeout(() => {
      const start = page * pageSize;
      const end = start + pageSize;

      const newItems = filteredData.slice(start, end);

      if (newItems.length === 0) {
        setHasMore(false);
      } else {
        setListData((prev) => [...prev, ...newItems]);
        setPage((prev) => prev + 1);
      }

      setIsLoadingMore(false);
    }, 300);
  };

  const totalAmount = filteredData?.reduce((sum, item) => {
    const amount = parseFloat(item?.amount) || 0;
    return sum + amount;
  }, 0);

  const totalQty = filteredData?.reduce((sum, item) => {
    const amount = parseFloat(item?.qty) || 0;
    return sum + amount;
  }, 0);

  const hasDateField = configData.some(
    (item) => item?.datafield && item?.datafield.toLowerCase() === "date",
  );

  const hasIdField = configData.some(
    (item) => item?.datafield && item?.datafield.toLowerCase() === "id",
  );

  useFocusEffect(
    useCallback(() => {
      // dispatch(updateSelectedFromDateState(""));
      // dispatch(updateSelectedToDateState(""));
      // dispatch(updateSelectedBranchesState([]));
      setTapLoader(false);
      setSelectedStatus("All")

      return () => { };
    }, [navigation]),
  );

  useLayoutEffect(() => {
    navigation.setOptions({
      headerStyle: {
        backgroundColor:
          theme === "dark" ? "black" : ERP_COLOR_CODE.ERP_APP_COLOR,
        // borderBottomWidth: 1,
        borderBottomColor: "#fff",

      },

      headerBackTitle: "",
      headerTintColor: "#fff",
      headerTitleAlign: "left",
      headerTitle: () => (
        <TranslatedText
          numberOfLines={1}
          style={[{
            fontSize: 18,
            fontWeight: "700",
            color: theme === "dark" ? "white" : ERP_COLOR_CODE.ERP_WHITE,
          }, !isIpad && { maxWidth: 180 }]}
          text={!isLandscape && isTableView ? '' : pageTitle || "List Data"}
        ></TranslatedText>
      ),
      headerRight: () => (
        <>
          {!error && (
            <ERPIcon
              name="refresh"
              onPress={() => {
                setActionLoader(true);
                onRefresh();
              }}
              isLoading={actionLoaders}
            />
          )}
          {
            <ERPIcon
              name={isTableView ? 'list' : 'apps'}
              onPress={() => {
                onRefresh();
                setSelectedStatus("All")
                setIsTableView(!isTableView);
              }}
            />
          }
          {
            isTableView && <ERPIcon
              name={'G1'}
              onPress={() => {
                setGroupModalVisible1(true)
              }}
            />
          }
          {
            primaryGroupKey && isTableView && <ERPIcon
              name={'G2'}
              onPress={() => {
                setGroupModalVisible2(true)
              }}
            />
          }
          {
            isTableView && <ERPIcon
              name={'add'}
              onPress={() => {
                setTapLoader(true);
                handleItemPressed({}, pageParamsName, pageTitle);
              }}
            />
          }
          {!error && (
            <ERPIcon
              name={isFilterVisible ? "close" : "filter-alt"}
              onPress={() => {
                setIsFilterVisible(!isFilterVisible);
              }}
            />
          )}
        </>
      ),
    });
  }, [
    navigation,
    pageTitle,
    isFilterVisible,
    hasDateField,
    isTableView,
    actionLoaders,
    error,
    isLandscape,
    groupModalVisible1,
    groupModalVisible2,
    primaryGroupKey,
    secondaryGroupKey
  ]);

  const handleSort = (key: string) => {
    let order: "asc" | "desc" = "asc";

    // TOGGLE
    if (
      sortConfig?.key === key &&
      sortConfig?.order === "asc"
    ) {
      order = "desc";
    }

    const sortedData = [...filteredData].sort(
      (a: any, b: any) => {
        const valueA = a?.[key];
        const valueB = b?.[key];

        // NULL SAFETY
        if (valueA == null) return 1;
        if (valueB == null) return -1;

        // NUMBER SORT
        if (
          typeof valueA === "number" &&
          typeof valueB === "number"
        ) {
          return order === "asc"
            ? valueA - valueB
            : valueB - valueA;
        }

        // STRING SORT
        return order === "asc"
          ? String(valueA).localeCompare(
            String(valueB),
          )
          : String(valueB).localeCompare(
            String(valueA),
          );
      },
    );

    setFilteredData(sortedData);

    setSortConfig({
      key,
      order,
    });
  };

  const fetchPageData = async () => {
    try {
      setSelectedStatus("All")
      const parsed = await dispatch(
        getERPPageThunk({ page: "Dashboard", id: "" }),
      ).unwrap();
      const pageControls = Array.isArray(parsed?.pagectl)
        ? parsed?.pagectl
        : [];
      const normalizedControls = pageControls?.map((c) => ({
        ...c,
        disabled: String(c?.disabled ?? "0"),
        visible: String(c?.visible ?? "1"),
        mandatory: String(c?.mandatory ?? "0"),
      }));
      setControls(normalizedControls);

      const branchObj = normalizedControls.find(
        (item) => item.fieldtitle === "Branch",
      );

      const res = await dispatch(
        getDDLThunk({
          dtlid: branchObj?.dtlid,
          where: `UserID in (${user?.id}, -1) AND selected = 1`,
        }),
      ).unwrap();

      const data = res?.data ?? [];
      const filtered = data.filter((item) => item.value !== -1);
      const branchValues = filtered.map((item) => item.value).join(",");
      console.log("branchValues", branchValues)
      dispatch(updateSelectedBranchIdsState(branchValues));
      dispatch(updateSelectedBranchesState(filtered));
      fetchListData();
    } catch (e: any) {
    } finally {
      setTimeout(() => {
        setActionLoader(false);
      }, 10);
    }
  };

  const statusOptions = useMemo(() => {
    const uniqueStatus = [
      ...new Set(
        listData
          .map(item => item?.status?.toString().trim())
          .filter(status => !!status)
      ),
    ];

    return uniqueStatus.length > 0
      ? ["All", ...uniqueStatus]
      : [];
  }, [listData]);

  console.log("statusOptionsstatusOptionsstatusOptions", statusOptions)

  const handleStatusChange = (status) => {
     setSearchQuery("")
      setSortingKey("")
      setPrimaryGroupKey("")
      setSecondaryGroupKey("")
      setSelectedStatus("All")
      setSortConfig(null)
    setSelectedStatus(status);
    applyFilters(searchQuery, status);
    
  };



  const applyFilters = (
    search = searchQuery,
    status = selectedStatus,
  ) => {
    let data = [...listData];

    // Status Filter
    if (status !== "All") {
      data = data.filter(
        item => item?.status === status,
      );
    }

    // Search Filter
    if (search.trim()) {
      const q = search.toLowerCase();

      data = data.filter(item =>
        Object.values(item)
          .join(" ")
          .toLowerCase()
          .includes(q),
      );
    }

    setFilteredData(data);
  };

  useEffect(() => {
    if (parsedConfig?.branchwise === 1 || parsedConfig?.branchwise === "1") {
      fetchPageData();
    }
  }, [navigation, parsedConfig]);




  const getCurrentMonthRange = () => {
    const now = new Date();

    let firstDay: Date;
    const lastDay = new Date();

    switch (DateType.toLowerCase()) {
      case "today":
        firstDay = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate()
        );
        break;

      case "month":
        firstDay = new Date(
          now.getFullYear(),
          now.getMonth(),
          1
        );
        break;

      case "year":
        firstDay = new Date(
          now.getFullYear(),
          0,
          1
        );
        break;

      default:
        firstDay = new Date(
          now.getFullYear(),
          now.getMonth(),
          1
        );
        break;
    }

    const from = formatDateForAPI(firstDay);
    const to = formatDateForAPI(lastDay);

    dispatch(updateSelectedFromDateState(from));
    dispatch(updateSelectedToDateState(to));
    if (parsedConfig?.branchwise === 1 || parsedConfig?.branchwise === "1") {
      fetchPageData();
    } else {
      fetchListData();
    }
  };

  const debouncedSearch = useCallback(
    useMemo(() => {
      let timeoutId: NodeJS.Timeout;

      return (query: string, data: any[]) => {
        clearTimeout(timeoutId);

        timeoutId = setTimeout(() => {
          const trimmedQuery = query.trim();

          if (trimmedQuery === "") {
            setFilteredData(data);
            return;
          }

          const keySearchMatch = trimmedQuery?.match(/^(\w+):(.+)$/);
          let filtered;

          if (keySearchMatch) {
            const [, key, value] = keySearchMatch;
            const lowerValue = value.trim().toLowerCase();

            filtered = data?.filter((item) => {
              const fieldValue = item[key];
              if (!fieldValue) return false;

              const stringValue =
                typeof fieldValue === "object"
                  ? JSON.stringify(fieldValue)
                  : String(fieldValue);

              return stringValue.toLowerCase().includes(lowerValue);
            });
          } else {
            filtered = data?.filter((item) => {
              const allValues = Object.values(item)
                .map((val) => {
                  if (typeof val === "object" && val !== null)
                    return JSON.stringify(val);
                  if (val === null || val === undefined) return "";
                  return String(val);
                })
                .join(" ")
                .toLowerCase();
              return allValues?.includes(trimmedQuery?.toLowerCase());
            });
          }
          setFilteredData(filtered);
        }, 300);
      };
    }, []),
    [],
  );

  const onRefresh = async () => {
    try {
      setSearchQuery("")
      setSortingKey("")
      setPrimaryGroupKey("")
      setSecondaryGroupKey("")
      setSelectedStatus("All")
      setSortConfig(null)
      getCurrentMonthRange();
    } catch (e) {

    }
  };

  const handleSearchChange = (text: string) => {
    setSelectedStatus('All')
    setSearchQuery(text);
    debouncedSearch(text, listData);
  };

  const clearSearch = () => {
    setSearchQuery("");
    setFilteredData(listData);

  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
     setSelectedStatus("All")

    if (event?.type === "dismissed" || !selectedDate) {
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
          Alert.alert(
            "Invalid Date Range",
            "To date cannot be before From date.",
            [{ text: "OK" }],
          );
          setShowDatePicker(null);
          return;
        }
      }
      dispatch(updateSelectedToDateState(formattedDate));
    } else {
      dispatch(updateSelectedFromDateState(formattedDate));
      if (toDate) {
        const toDateObj = new Date(toDate.split("-").reverse().join("-"));
        if (selectedDate > toDateObj) {
          dispatch(updateSelectedToDateState(""));
        }
      }
    }
    setShowDatePicker(null);
  };

  const fetchListData = async () => {
    try {
      setError(null);
      setLoadingListId(item?.id || 0);

      console.log(
        "API PARAMETERS ++++++++++++++++++++++++++++++ ----------",
        fromDate,
        toDate,
        selectedBranchIds,
      );
      const raw = await dispatch(
        getERPListDataThunk({
          page: item?.url,
          fromDate:
            parsedConfig?.period === 1 || parsedConfig?.period === "1"
              ? fromDate
              : "",
          toDate:
            parsedConfig?.period === 1 || parsedConfig?.period === "1"
              ? toDate
              : "",
          param: "",
          branch:
            parsedConfig?.branchwise === 1 || parsedConfig?.branchwise === "1"
              ? `${selectedBranchIds}` || ""
              : "",
        }),
      ).unwrap();
      const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
      console.log("parsed", parsed);
      let dataArray = [];
      let configArray = [];

      if (Array.isArray(parsed)) {
        dataArray = parsed;
        configArray = [];
      } else if (Array.isArray(parsed?.data)) {
        dataArray = parsed.data;
        configArray = parsed.config || [];
      } else if (Array.isArray(parsed?.list)) {
        dataArray = parsed.list;
        configArray = parsed.config || [];
      } else if (parsed && typeof parsed === "object") {
        const keys = Object.keys(parsed).filter((key) => !isNaN(Number(key)));
        if (keys.length > 0) {
          dataArray = keys.map((key) => parsed[key]);
          configArray = parsed.config || [];
        }
      }

      setConfigData(configArray);
      setListData(dataArray);
      setFilteredData(dataArray);
    } catch (e: any) {
      setError(e || "Failed to load list data");
      setParsedError(e);
    } finally {
      setLoadingListId(null);
      setTimeout(() => {
        setActionLoader(false);
      }, 10);
    }
  };

  const fetchListDataV2 = useCallback(async () => {
    try {
      setError(null);
      setLoadingListId(item?.id || 0);

      console.log(
        "LATEST ✅+++++++++++++++++++++++++++++ PARAMS",
        "fromDate:", fromDate,
        "toDate:", toDate,
        "selectedBranchIds:", selectedBranchIds,
      );

      const raw = await dispatch(
        getERPListDataThunk({
          page: item?.url,
          fromDate:
            parsedConfig?.period === 1 || parsedConfig?.period === "1"
              ? fromDate
              : "",
          toDate:
            parsedConfig?.period === 1 || parsedConfig?.period === "1"
              ? toDate
              : "",
          param: "",
          branch:
            parsedConfig?.branchwise === 1 || parsedConfig?.branchwise === "1"
              ? `${selectedBranchIds}` || ""
              : "",
        }),
      ).unwrap();

      const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;

      console.log("parsed", parsed)
      let dataArray = [];
      let configArray = [];

      if (Array.isArray(parsed)) {
        dataArray = parsed;
      } else if (Array.isArray(parsed?.data)) {
        dataArray = parsed.data;
        configArray = parsed.config || [];
      } else if (Array.isArray(parsed?.list)) {
        dataArray = parsed.list;
        configArray = parsed.config || [];
      } else if (parsed && typeof parsed === "object") {
        const keys = Object.keys(parsed).filter((key) => !isNaN(Number(key)));
        if (keys.length > 0) {
          dataArray = keys.map((key) => parsed[key]);
          configArray = parsed.config || [];
        }
      }

      setConfigData(configArray);
      console.log("dataArray----------------", dataArray)
      setListData(dataArray);
      setFilteredData(dataArray);
    } catch (e) {
      setError(e || "Failed to load list data");
      setParsedError(e);
    } finally {
      setLoadingListId(null);
      setTimeout(() => setActionLoader(false), 10);
    }
  }, [
    fromDate,
    toDate,
    selectedBranchIds,
    item?.url,
    parsedConfig?.period,
    parsedConfig?.branchwise,
  ]);

  useFocusEffect(
    useCallback(() => {
      fetchListDataV2();
    }, [fetchListDataV2, selectedBranchIds, toDate, fromDate]),
  );

  const handleItemPressed = (item, page, pageTitle = "") => {

    setSelectedStatus('All')
    if (!parsedConfig) {
      return;
    }
    setSortingKey("")
    setSortConfig(null)
    // setIsFilterVisible(false);
    setSearchQuery("");

    if (parsedConfig?.editentry === 1 || parsedConfig?.editentry === "1") {
      navigation.navigate("Page", {
        item,
        title: page,
        isFromNew: true,
        url: pageName,
        pageTitle: pageTitle,
        isFromBusinessCard: isFromBusinessCard,
        isFromProfile: false,
      });
    }
  };

  const handleActionButtonPressed = (actionValue, label, color, id, item) => {
    if (item?.btn_edit && item?.btn_edit?.includes("/")) {
      const left = item?.btn_edit.substring(0, item?.btn_edit.indexOf("/"));
      const result = item?.btn_edit.split("/")[1];
      navigation.navigate("Page", {
        item,
        id: result,
        title: pageName,
        isFromNew: false,
        url: left,
        pageTitle: pageTitle,
        isFromBusinessCard: false,
        isFromProfile: false,
      });
    } else {
      setAlertConfig({
        title: label,
        message: `${t("msg.msg8")} ${label.toLowerCase()} ?`,
        type: "info",
        actionValue: actionValue,
        color: color,
        id: id,
      });
      setAlertVisible(true);
    }
  };

  const handleDeleteNotification = async (item: any) => {
    await dispatch(
      handleDeleteActionThunk({
        id: item.id.toString(),
        remarks: "",
        page: "DEVNOTIFY",
      }),
    ).unwrap();
    setAlertVisible(false);
    onRefresh();
  };

  const handleAbhaClicked = (item) => {
    setSelectedStatus('All')
    navigation.navigate('Details', {
      item
    })
  }


  const renderStatusTab = (status: string) => {
    const isSelected = selectedStatus === status;
    const isEqualWidth = statusOptions.length <= 3;

    return (
      <TouchableOpacity
        key={status}
        activeOpacity={0.75}
        onPress={() => handleStatusChange(status)}
        style={{
          flex: isEqualWidth ? 1 : undefined,
          minWidth: isEqualWidth ? 0 : 110,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 6,
          height: 36,
          paddingVertical: 8,
          backgroundColor: isSelected ? '#fff' : "#f7f7f7",
          borderWidth: isSelected ? 1.5 : 0.8,
          borderColor: isSelected
            ? ERP_COLOR_CODE.ERP_APP_COLOR
            : '#F8FAFC',
          borderRadius: 4,
          borderBottomWidth: isSelected ? 1 : 0.8,
          borderBottomColor: isSelected
            ? ERP_COLOR_CODE.ERP_APP_COLOR
            : '#515253',

        }}
      >
        <Text
          numberOfLines={1}
          ellipsizeMode="tail"
          style={{
            fontSize: 14,

            fontWeight: isSelected
              ? '700'
              : '500',

            color: isSelected
              ? ERP_COLOR_CODE.ERP_APP_COLOR
              : '#475569',
          }}
        >
          {status}
        </Text>

        {/* Count */}

      </TouchableOpacity>
    );
  };


  if (parsedError) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: theme == "dark" ? "black" : ERP_COLOR_CODE.ERP_WHITE,
        }}
      >
        <ErrorMessage message={parsedError} isShowTop={true} />
      </View>
    );
  }

  if (loadingListId) {
    return <FullViewLoader isShowTop={theme === "dark" ? false : true} />;
  }

  return (
    <View
      style={[
        styles.container,
        theme === "dark" && { backgroundColor: "black" },
      ]}
    >


      {
        !isLandscape && !isFilterVisible && isTableView && <View style={{
          width: '100%',
          flexDirection: 'row',
          justifyContent: 'space-between',
          backgroundColor: ERP_COLOR_CODE.ERP_APP_COLOR
        }}>
          <Text style={{
            color: 'white',
            paddingTop: 6,
            paddingBottom: 8,
            width: '60%',

            fontSize: 16,
            fontWeight: '700',
            paddingLeft: 10,

          }}>{pageTitle}</Text>

          <Text style={{
            color: 'white',
            paddingTop: 6,
            paddingBottom: 8,
            paddingRight: 10,
            fontSize: 16,
            alignSelf: 'flex-end',
          }}>Rows - {filteredData.length}</Text>
        </View>
      }

      {isFilterVisible && (
        <View
          style={{
            backgroundColor:
              theme === "dark" ? "#000" : ERP_COLOR_CODE.ERP_APP_COLOR,
            padding: 8,
            paddingBottom: 8,
            borderBottomEndRadius: 12,
            borderBottomStartRadius: 12,
          }}
        >
          {isLandscape || isIpad ? (
            <>
              <View style={{ flexDirection: "row" }}>
                <View style={{ width: "40%", overflow: 'hidden' }}>
                  <View style={styles.searchContainer}>
                    <View
                      style={[
                        styles.searchInputContainer,
                        theme === "dark" && {
                          backgroundColor: "black",
                        },
                        {
                          width: isIpad ? isLandscape ? '89%' : '86%' : '86%'
                        }
                      ]}
                    >
                      <MaterialIcons
                        size={24}
                        name="search"
                        color={theme === "dark" ? "white" : "black"}
                      />
                      <View style={{
                        width: isIpad ? isLandscape ? '89%' : '86%' : '86%',
                        justifyContent: 'space-between', flexDirection: 'row'
                      }}>
                        <TextInput
                          style={{
                            backgroundColor: "#fff",
                            borderRadius: 8,
                            paddingHorizontal: 12,
                            height: 36,
                          }}
                          placeholder={`Search in list...`}
                          value={searchQuery}
                          onChangeText={handleSearchChange}
                          placeholderTextColor={ERP_COLOR_CODE.ERP_6C757D}
                        />
                        {searchQuery.length > 0 && (
                          <TouchableOpacity
                            onPress={clearSearch}
                            style={styles.clearButton}
                          >
                            <Text style={styles.clearButtonText}>✕</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>
                    {
                      <View style={{
                        borderRadius: 2,
                        justifyContent: 'center',
                        alignContent: 'center',
                        alignItems: 'center',
                        height: 38,
                        width: 34,
                        marginLeft: 8,
                        backgroundColor: theme === 'dark' ? 'black' : 'white'
                      }}>
                        <ERPIcon
                          name={
                            sortingKey
                              ? sortConfig?.order === "asc"
                                ? "keyboard-double-arrow-down"
                                : "keyboard-double-arrow-up"
                              : "sort-by-alpha"
                          }
                          onPress={() => {
                            setSortingVisible(true)
                          }}

                          color={theme === 'dark' ? 'white' : "black"}
                          isMenu={theme === 'dark' ? false : true}
                        />
                      </View>
                    }

                  </View>
                </View>

                <View style={{ flexDirection: "row", width: "70%", marginLeft: 8 }}>
                  <View style={{
                    width: '54%',
                  }}>
                    {(parsedConfig?.period === 1 || parsedConfig?.period === "1") && (
                      <View style={[styles.dateContainer, {
                        marginVertical: 0
                      }]}>
                        {/* Start Date */}
                        <View style={styles.dateRow}>
                          <TouchableOpacity
                            onPress={() => {
                              setSearchQuery("");
                              setShowDatePicker({ type: "from", show: true });
                            }}
                            style={[styles.dateButton, {
                              paddingVertical: 10
                            }]}
                          >
                            <View
                              style={{ flexDirection: "row", alignItems: "center" }}
                            >
                              <MaterialIcons
                                name="calendar-today"
                                size={18}
                                color={theme === 'dark' ? 'white' : "black"}
                                style={{ marginRight: 8 }}
                              />
                              <TranslatedText
                                numberOfLines={1}
                                text={fromDate || t("msg.msg9")}
                                style={[styles.dateButtonText,

                                ]}
                              ></TranslatedText>
                            </View>
                          </TouchableOpacity>
                        </View>
                        <View style={{ height: 1, width: 8 }}> </View>

                        {/* End Date */}
                        <View style={styles.dateRow}>
                          <TouchableOpacity
                            onPress={() => {
                              setSearchQuery("");
                              setShowDatePicker({ type: "to", show: true });
                            }}
                            style={[styles.dateButton, {
                              paddingVertical: 10
                            }]}
                          >
                            <View
                              style={{ flexDirection: "row", alignItems: "center" }}
                            >
                              <MaterialIcons
                                name="calendar-today"
                                size={18}
                                color={theme === 'dark' ? 'white' : "black"}
                                style={{ marginRight: 8 }}
                              />
                              <Text style={styles.dateButtonText}>
                                {toDate || t("msg.msg11")}
                              </Text>
                            </View>
                          </TouchableOpacity>
                        </View>
                      </View>
                    )}

                  </View>

                  <View style={{
                    marginLeft: 8,
                    width: '28%',
                  }}>
                    {(parsedConfig?.branchwise === 1 ||
                      parsedConfig?.branchwise === "1") &&
                      controls
                        .filter((x) => x.ctltype !== "DATE" && x.field !== "userid")
                        .map((item, index) => (
                          <>
                            {item?.title === "Branch" && (
                              <View style={{ width: "100%" }}>
                                <CustomMultiplePicker
                                  isForMultipleSelection={true}
                                  isForceOpen={false}
                                  isValidate={false}
                                  label={item.title}
                                  selectedValue={() => { }}
                                  dtext={"Branch"}
                                  onValueChange={(i) => {
                                    console.log("i-------++++++++++++++++++++++++++++++----------", i);
                                    i.map((item) => item.value).join(",");
                                    dispatch(updateSelectedBranchesState(i));
                                    dispatch(
                                      updateSelectedBranchIdsState(
                                        i.map((item) => item.value).join(","),
                                      ),
                                    );
                                    // if (item?.title === "Branch") {
                                    //   dispatch(
                                    //     setActiveDashboardBranchId(
                                    //       i?.value?.toString(),
                                    //     ),
                                    //   );
                                    //   dispatch(setActiveDashboardBranch(i?.name));
                                    // } else {
                                    //   dispatch(setActiveDashboardType(i?.name));
                                    //   dispatch(
                                    //     setActiveDashboardTypeId(i?.value?.toString()),
                                    //   );
                                    // }
                                  }}
                                  options={[]}
                                  item={item}
                                  errors={null}
                                  formValues={null}
                                />
                              </View>
                            )}
                          </>
                        ))}
                  </View>
                </View>
              </View>

            </>
          ) : (
            <>
              {
                isTableView && <View style={{
                  width: '100%',
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  backgroundColor: theme === 'dark' ? 'black' : ERP_COLOR_CODE.ERP_APP_COLOR
                }}>
                  <Text style={{
                    color: 'white',
                    paddingTop: 6,
                    paddingBottom: 8,
                    width: '60%',

                    fontSize: 16,
                    fontWeight: '700',
                    paddingLeft: 10,

                  }}>{pageTitle}</Text>

                  <Text style={{
                    color: 'white',
                    paddingTop: 6,
                    paddingBottom: 8,
                    paddingRight: 10,
                    fontSize: 16,

                    alignSelf: 'flex-end',
                  }}>Rows - {filteredData.length}</Text>
                </View>
              }
              <View style={[styles.searchContainer,
              ]}>
                <View
                  style={[
                    styles.searchInputContainer,
                    theme === "dark" && {
                      backgroundColor: "black",
                    },

                    {
                      width: isIpad ? '94%' : '89%'
                    }
                  ]}
                >
                  <MaterialIcons
                    size={24}
                    name="search"
                    color={theme === "dark" ? "white" : "black"}
                  />
                  <View style={{ width: isIpad ? '94%' : '89%', justifyContent: 'space-between', flexDirection: 'row' }}>
                    <TextInput
                      style={{
                        borderRadius: 8,
                        paddingHorizontal: 12,
                        height: 36,
                      }}
                      placeholder={`Search in list...`}
                      value={searchQuery}
                      onChangeText={handleSearchChange}
                      placeholderTextColor={ERP_COLOR_CODE.ERP_6C757D}
                    />
                    {searchQuery.length > 0 && (
                      <TouchableOpacity
                        onPress={clearSearch}
                        style={styles.clearButton}
                      >
                        <Text style={styles.clearButtonText}>✕</Text>
                      </TouchableOpacity>
                    )}
                  </View>

                </View>
                {
                  <View style={{
                    borderRadius: 2,
                    justifyContent: 'center',
                    alignContent: 'center',
                    alignItems: 'center',
                    height: 38, width: 34,
                    backgroundColor: theme === 'dark' ? 'black' : 'white'
                  }}>
                    <ERPIcon
                      name={
                        sortingKey
                          ? sortConfig?.order === "asc"
                            ? "keyboard-double-arrow-down"
                            : "keyboard-double-arrow-up"
                          : "sort-by-alpha"
                      } onPress={() => {
                        setSortingVisible(true)
                      }}
                      color={theme === 'dark' ? 'white' : "black"}
                      isMenu={theme === 'dark' ? false : true}
                    />
                  </View>
                }

              </View>
              <View style={{ marginVertical: 1 }} />
              {(parsedConfig?.period === 1 || parsedConfig?.period === "1") && (
                <View style={[styles.dateContainer,]}>
                  {/* Start Date */}
                  <View style={styles.dateRow}>
                    <TouchableOpacity
                      onPress={() => {
                        setSearchQuery("");
                        setShowDatePicker({ type: "from", show: true });
                      }}
                      style={styles.dateButton}
                    >
                      <View
                        style={{ flexDirection: "row", alignItems: "center" }}
                      >
                        <MaterialIcons
                          name="calendar-today"
                          size={18}
                          color={theme === 'dark' ? 'white' : "black"}
                          style={{ marginRight: 8 }}
                        />
                        <TranslatedText
                          numberOfLines={1}
                          text={fromDate || t("msg.msg9")}
                          style={[styles.dateButtonText,

                          ]}
                        ></TranslatedText>
                      </View>
                    </TouchableOpacity>
                  </View>
                  <View style={{ height: 1, width: 8 }}> </View>

                  {/* End Date */}
                  <View style={styles.dateRow}>
                    <TouchableOpacity
                      onPress={() => {
                        setSearchQuery("");
                        setShowDatePicker({ type: "to", show: true });
                      }}
                      style={styles.dateButton}
                    >
                      <View
                        style={{ flexDirection: "row", alignItems: "center" }}
                      >
                        <MaterialIcons
                          name="calendar-today"
                          size={18}
                          color={theme === 'dark' ? 'white' : "black"}
                          style={{ marginRight: 8 }}
                        />
                        <Text style={styles.dateButtonText}>
                          {toDate || t("msg.msg11")}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {(parsedConfig?.branchwise === 1 ||
                parsedConfig?.branchwise === "1") &&
                controls
                  .filter((x) => x.ctltype !== "DATE" && x.field !== "userid")
                  .map((item, index) => (
                    <>
                      {item?.title === "Branch" && (
                        <View style={{ width: "100%" }}>
                          <CustomMultiplePicker
                            isForMultipleSelection={true}
                            isForceOpen={false}
                            isValidate={false}
                            label={item.title}
                            selectedValue={() => { }}
                            dtext={"Branch"}
                            onValueChange={(i) => {
                              console.log("i-------++++++++++++++++++++++++++++++----------", i);
                              i.map((item) => item.value).join(",");
                              dispatch(updateSelectedBranchesState(i));
                              dispatch(
                                updateSelectedBranchIdsState(
                                  i.map((item) => item.value).join(","),
                                ),
                              );
                              // if (item?.title === "Branch") {
                              //   dispatch(
                              //     setActiveDashboardBranchId(
                              //       i?.value?.toString(),
                              //     ),
                              //   );
                              //   dispatch(setActiveDashboardBranch(i?.name));
                              // } else {
                              //   dispatch(setActiveDashboardType(i?.name));
                              //   dispatch(
                              //     setActiveDashboardTypeId(i?.value?.toString()),
                              //   );
                              // }
                            }}
                            options={[]}
                            item={item}
                            errors={null}
                            formValues={null}
                          />
                        </View>
                      )}
                    </>
                  ))}
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
                      width: isIpad ? isLandscape ? "40%" : "48%" : "100%",
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
                          dispatch(updateSelectedFromDateState(formatted));
                        } else {
                          dispatch(updateSelectedToDateState(formatted));
                        }
                        setShowDatePicker(null);
                         setSelectedStatus("All")

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
                        backgroundColor: theme === "dark" ? "black" : "white",
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
        </View>
      )}

      {!!error ? (
        <View
          style={{
            flex: 1,
            backgroundColor: theme === "dark" ? "black" : "white",
          }}
        >
          <ErrorMessage message={error} isShowTop={false} />
        </View>
      ) : (
        <>
          {loadingListId ? (
            <FullViewLoader />
          ) : (
            <>
              {/* <AppMapView /> */}
              {
                statusOptions.length != 0 && <> 
                 {statusOptions.length <= 3 ? (
                <View
                  style={{
                    width: '100%',
                    flexDirection: 'row',
                    paddingHorizontal: 8,
                    paddingTop: 8,
                    gap: 10,
                  }}
                >
                  {statusOptions.map(status =>
                    renderStatusTab(status),
                  )}
                </View>
              ) : (
                <View style={{
                  width: '100%',
                  flexDirection: 'row',
                  paddingHorizontal: 8,
                  paddingTop: 8,
                  gap: 10,
                }}>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{
                      gap: 10,
                    }}
                  >
                    {statusOptions.map(status =>
                      renderStatusTab(status),
                    )}
                  </ScrollView>
                </View>
              )}
                </>
              }
             
              {
                isTableView ? <>
                  <TableView
                    handleDeleteNotification={handleDeleteNotification}
                    isFromAlertCard={isFromAlertCard}
                    configData={configData}
                    filteredData={filteredData}
                    loadingListId={loadingListId}
                    totalAmount={totalAmount}
                    totalQty={totalQty}
                    isFromBusinessCard={isFromBusinessCard}
                    pageParamsName={pageParamsName}
                    handleItemPressed={handleItemPressed}
                    parsedConfig={parsedConfig}
                    pageName={pageName}
                    setIsFilterVisible={setIsFilterVisible}
                    setSearchQuery={setSearchQuery}
                    handleActionButtonPressed={handleActionButtonPressed}
                    isLoadingMore={isLoadingMore}
                    loadMore={loadMore}
                    primaryGroupKey={primaryGroupKey}
                    secondaryGroupKey={secondaryGroupKey}
                  />
                </> :

                  <ReadableView
                    handleDeleteNotification={handleDeleteNotification}
                    isFromAlertCard={isFromAlertCard}
                    configData={configData}
                    filteredData={filteredData}
                    loadingListId={loadingListId}
                    totalAmount={totalAmount}
                    totalQty={totalQty}
                    isFromBusinessCard={isFromBusinessCard}
                    pageParamsName={pageParamsName}
                    handleItemPressed={handleItemPressed}
                    parsedConfig={parsedConfig}
                    pageName={pageName}
                    setIsFilterVisible={setIsFilterVisible}
                    setSearchQuery={setSearchQuery}
                    handleActionButtonPressed={handleActionButtonPressed}
                    isLoadingMore={isLoadingMore}
                    loadMore={loadMore}
                    handleAbhaClicked={handleAbhaClicked}
                  />
              }

            </>
          )}
        </>
      )}

      {(parsedConfig?.newentry === 1 || parsedConfig?.newentry === "1") &&
        !isFromAlertCard &&
        !loadingListId &&
        configData && !isTableView && (
          <Animated.View
            style={{
              transform: [{ scale: pressAnim }],
            }}
          >
            <TouchableOpacity
              style={[
                styles.addButton,
                {
                  bottom:
                    filteredData.length === 0
                      ? 40
                      : totalAmount === 0
                        ? 64
                        : 78,
                },
                theme === "dark" && {
                  backgroundColor: "white",
                  borderWidth: 1,
                  borderColor: "white",
                },
                {
                  backgroundColor:
                    theme === "dark" ? "black" : ERP_COLOR_CODE.ERP_APP_COLOR,
                },
              ]}
              onPressIn={onPressIn}
              onPressOut={onPressOut}
              onPress={() => {
                setTapLoader(true);
                if (parsedConfig?.title.includes('ABHA')) {
                  openSheet();
                } else {
                  handleItemPressed({}, pageParamsName, pageTitle);
                }
              }}
            >
              {tapLoader ? (
                <ActivityIndicator size={"large"} color={"#fff"} />
              ) : (
                <MaterialIcons size={32} name="add" color={"white"} />
              )}
            </TouchableOpacity>
          </Animated.View>
        )}
 

      {
        alertVisible && <CustomAlert
          visible={alertVisible}
          title={alertConfig.title}
          message={alertConfig.message}
          type={alertConfig.type}
          onClose={() => setAlertVisible(false)}
          onCancel={() => setAlertVisible(false)}
          actionLoader={actionLoader}
          isBottomButtonVisible={true}
          doneText={alertConfig.title}
          color={alertConfig.color}
          onDone={async (remark) => {
            try {
              const type = `page${alertConfig.title}`;
              await dispatch(
                handlePageActionThunk({
                  action: type,
                  id: alertConfig.id.toString(),
                  remarks: remark,
                  page: alertConfig?.actionValue,
                }),
              ).unwrap();

              setAlertVisible(false);
              onRefresh();
            } catch (err) {
              setAlertVisible(false);
              setAlertConfig({
                title: "Api error",
                message: err?.toString() || "",
                type: "info",
                actionValue: "",
                color: "",
                id: 0,
              });
              setApiError(true);
            }
          }}
          isFromButtonList={true}
          closeHide={undefined}
        />
      }

      {
        apiError && <CustomAlert
          visible={apiError}
          title={alertConfig.title}
          message={alertConfig.message}
          type={alertConfig.type}
          onClose={() => setApiError(false)}
          onCancel={() => setApiError(false)}
          actionLoader={actionLoader}
          closeHide={undefined}
        />
      }

      {
        groupModalVisible1 && <GroupFilterModal
          visible={groupModalVisible1}
          onClose={() =>
            setGroupModalVisible1(false)
          }
          data={filteredData}
          configData={configData}
          selectedKey={primaryGroupKey}
          onSelectKey={(key: string) => {
            setPrimaryGroupKey(key);
          }}
        />
      }

      {
        groupModalVisible2 && <GroupFilterModal
          visible={groupModalVisible2}
          onClose={() =>
            setGroupModalVisible2(false)
          }
          data={filteredData}
          configData={configData}

          selectedKey={secondaryGroupKey}
          onSelectKey={(key: string) => {
            setSecondaryGroupKey(key);
          }}
        />
      }

      {
        sortingVisible && <SortingFilterModal
          visible={sortingVisible}
          onClose={() =>
            setSortingVisible(false)
          }
          title="Sort By"
          data={availableKeys}
          selectedValue={sortingKey}
          configData={configData}
          onSelect={(key: string) => {
            setSortingKey(key);
            handleSort(key);
          }}
          renderRight={(item: string) => {
            const isSelected =
              sortingKey === item;

            if (!isSelected) {
              return (
                <Text
                  style={{
                    fontSize: 16,
                    color: "#9ca3af",
                  }}
                >
                </Text>
              );
            }

            return (
              <MaterialIcons
                name={
                  sortConfig?.order === "asc"
                    ? "keyboard-double-arrow-down"
                    : "keyboard-double-arrow-up"
                }
                size={20}
                color="#2563eb"
              />
            );
          }}
        />
      }

    </View>
  );
};

export default ListScreen;