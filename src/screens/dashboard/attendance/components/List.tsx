import MaterialIcons from "@react-native-vector-icons/material-icons";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Dimensions,
  useWindowDimensions,
  Platform,
} from "react-native";
import NoData from "../../../../components/no_data/NoData";
import { PieChart } from "react-native-gifted-charts";
import { ERP_COLOR_CODE } from "../../../../utils/constants";
import {
  useAppDispatch,
  useAppSelector,
} from "../../../../store/hooks";
import {
  getERPListDataThunk,
} from "../../../../store/slices/auth/thunk";
import FullViewLoader from "../../../../components/loader/FullViewLoader";
import { useBaseLink } from "../../../../hooks/useBaseLink";
import { Calendar } from "react-native-calendars";
import ErrorMessage from "../../../../components/error/Error";
import {
  formatTo12Hour,
  getWorkedHours,
  isLatePunchIn,
  normalizeDate,
} from "../../../../utils/helpers";
import DetailsBottomSheet from "./DetailsModal";
import useTranslations from "../../../../hooks/useTranslations";
import ImageBottomSheetModal from "../../../../components/bottomsheet/ImageBottomSheetModal";
import TranslatedText from "../../tabs/home/TranslatedText";
 
const styles = StyleSheet.create({
  recordCard: {
    backgroundColor: ERP_COLOR_CODE.ERP_WHITE,
    borderRadius: 4,
    padding: 8,
    marginVertical: 4,
    marginHorizontal: 12,
    borderWidth: 0.5,
    width: "100%",
  },

  recordAvatar: {
    width: 46,
    height: 46,
    borderRadius: 25,
  },

  recordName: {
    fontSize: 14,
  },

  recordDateTime: {
    fontWeight: "600",
    fontSize: 14,
    color: ERP_COLOR_CODE.ERP_BLACK,
  },

  recordPunchTime: {
    fontSize: 14,
    color: ERP_COLOR_CODE.ERP_333,
  },

  statusBadgeRed: {
    color: ERP_COLOR_CODE.ERP_ERROR,
    fontSize: 12,
    fontWeight: "bold",
  },

  statusBadgeBlue: {
    color: "#a6bfc9ff",
    fontSize: 12,
    fontWeight: "bold",
  },

  statusBadgeGrey: {
    backgroundColor: "#dad1d1",
    color: ERP_COLOR_CODE.ERP_BLACK,
    fontWeight: "bold",
  },
});

// ============================================================
// CALENDAR STATUS COLORS
// ============================================================

const CALENDAR_STATUS_COLORS = [
  "#2563EB",
  "#16A34A",
  "#DC2626",
  "#ea334b",
  "#EA580C",
  "#0891B2",
  "#DB2777",
  "#65A30D",
  "#b1afb4",
  "#0F766E",
  "#CA8A04",
  "#475569",
];

const getStatusColor = (
  status: any,
): string => {
  const normalizedStatus =
    typeof status === "string"
      ? status.trim().toLowerCase()
      : "";

  if (!normalizedStatus) {
    return "#64748B";
  }

  let hash = 0;

  for (
    let i = 0;
    i < normalizedStatus.length;
    i++
  ) {
    hash =
      normalizedStatus.charCodeAt(i) +
      ((hash << 5) - hash);
  }

  const index =
    Math.abs(hash) %
    CALENDAR_STATUS_COLORS.length;

  return CALENDAR_STATUS_COLORS[index];
};

const getDateStatusColor = (
  records: any[],
): string => {
  if (!records?.length) {
    return "#64748B";
  }

  const statusCount: Record<
    string,
    number
  > = {};

  let firstValidStatus = "";

  records.forEach((item) => {
    const status =
      typeof item?.status === "string"
        ? item.status.trim().toLowerCase()
        : "";

    if (!status) {
      return;
    }

    if (!firstValidStatus) {
      firstValidStatus = status;
    }

    statusCount[status] =
      (statusCount[status] || 0) + 1;
  });

  if (!Object.keys(statusCount).length) {
    return "#64748B";
  }

  const dominantStatus =
    Object.entries(statusCount).sort(
      (a, b) => b[1] - a[1],
    )[0]?.[0];

  return getStatusColor(
    dominantStatus || firstValidStatus,
  );
};

const List = ({
  selectedMonth,
  showFilter,
  fromDate,
  toDate,
}: any) => {
  const dispatch = useAppDispatch();

  const theme = useAppSelector(
    (state) => state?.theme.mode,
  );

  const { t } = useTranslations();

  const { height, width } =
    useWindowDimensions();

  const isLandscape = width > height;

  const [showImgModal, setShowImgModal] =
    useState(false);

  const [img, setImg] = useState("");

  const [activePunchStatus, setActivePunchStatus] =
    useState("all");
  const [activeStatus, setActiveStatus] =
    useState("all");
  const [isLoading, setIsLoading] =
    useState(false);

  const [listData, setListData] =
    useState<any[]>([]);
 
  const [parsedError, setParsedError] =
    useState<any>();

  const [showModal, setShowModal] =
    useState(false);

  const [selectedItem, setSelectedItem] =
    useState<any>(null);

  const [currentView, setCurrentView] =
    useState<"pie" | "calendar">("pie");

  const [expandedItems, setExpandedItems] =
    useState<any>({});

  const baseLink = useBaseLink();

  // ============================================================
  // DYNAMIC PUNCH STATUS FILTERS
  // ============================================================

  const STATUS_FILTERS = useMemo(() => {
    const statusMap = new Map<string, string>();

    listData.forEach((item) => {
      const rawStatus =
        typeof item?.status === "string"
          ? item.status.trim()
          : "";

      const normalizedStatus = rawStatus.toLowerCase();

      if (!statusMap.has(normalizedStatus)) {
        statusMap.set(
          normalizedStatus,
          rawStatus,
        );
      }
    });

    const dynamicFilters = Array.from(
      statusMap.entries(),
    )
      .filter(
        ([normalizedStatus]) =>
          normalizedStatus !== "" &&
          normalizedStatus !== "all" &&
          normalizedStatus !== "normal",
      )
      .map(
        ([normalizedStatus, originalStatus]) => ({
          key: normalizedStatus,
          label: originalStatus,
          value: normalizedStatus,
        }),
      );

    return [
      {
        key: "all",
        label: "All",
        value: null,
      },
      ...dynamicFilters,
    ];
  }, [listData]);


  console.log("listDatalistDatalistData", listData)
  const PUNCH_STATUS_FILTERS = useMemo(() => {
    const statusMap = new Map<string, string>();

    listData.forEach((item) => {
      const rawStatus =
        typeof item?.punchstatus === "string"
          ? item.punchstatus.trim()
          : "";

      const normalizedStatus =
        rawStatus.toLowerCase();

      // Empty / "all" ko ignore karo
      if (
        normalizedStatus &&
        normalizedStatus !== "all"
      ) {
        if (!statusMap.has(normalizedStatus)) {
          statusMap.set(
            normalizedStatus,
            rawStatus,
          );
        }
      }
    });

    const dynamicFilters = Array.from(
      statusMap.entries(),
    ).map(
      ([normalizedStatus, originalStatus]) => ({
        key: normalizedStatus,
        label: originalStatus,
        value: normalizedStatus,
      }),
    );

    // Koi valid punch status nahi hai => []
    if (dynamicFilters.length === 0) {
      return [];
    }

    // Valid punch status hai => All + dynamic filters
    return [
      {
        key: "all",
        label: "All",
        value: null,
      },
      ...dynamicFilters,
    ];
  }, [listData]);


  useEffect(() => {
    const punchFilterExists =
      PUNCH_STATUS_FILTERS.some(
        (filter) =>
          filter.key === activePunchStatus,
      );

    if (!punchFilterExists) {
      setActivePunchStatus("all");
    }

    const statusFilterExists =
      STATUS_FILTERS.some(
        (filter) =>
          filter.key === activeStatus,
      );

    if (!statusFilterExists) {
      setActiveStatus("all");
    }
  }, [
    PUNCH_STATUS_FILTERS,
    STATUS_FILTERS,
    activePunchStatus,
    activeStatus,
  ]);

  // ============================================================
  // CLEANUP
  // ============================================================

  useEffect(() => {
    return () => {
      setIsLoading(false);
      setListData([]);
      setParsedError(null);
      setShowModal(false);
      setSelectedItem(null);
      setCurrentView("pie");
      setActivePunchStatus("all");
      setActiveStatus('all')
      setExpandedItems({});
    };
  }, []);

  // ============================================================
  // FETCH DATA
  // ============================================================

  const fetchListData = useCallback(
    async (
      fromDateStr: string,
      toDateStr: string,
    ) => {
      try {
        setIsLoading(true);

        const raw = await dispatch(
          getERPListDataThunk({
            page: "PunchIn",
            fromDate: fromDateStr,
            toDate: toDateStr,
            param: "",
            branch: "",
          }),
        ).unwrap();

        const parsed =
          typeof raw === "string"
            ? JSON.parse(raw)
            : raw;

        const final = parsed?.d
          ? JSON.parse(parsed?.d)
          : parsed;

        const responseData =
          final?.data || final || [];

        setListData(responseData);

        setActivePunchStatus("all");

        setExpandedItems({});

        setTimeout(() => {
          setIsLoading(false);
        }, 1400);
      } catch (e: any) {
        setParsedError(e);

        setTimeout(() => {
          setIsLoading(false);
        }, 1400);
      }
    },
    [dispatch, theme],
  );

  useEffect(() => {
    if (fromDate && toDate) {
      fetchListData(
        fromDate,
        toDate,
      );
    }
  }, [
    fromDate,
    toDate,
    fetchListData,
  ]);

  // ============================================================
  // FILTERED DATA
  // ============================================================

  const data = useMemo(() => {
    let filteredData =
      listData?.length > 0
        ? [...listData]
        : [];

    // ============================================================
    // PUNCH STATUS FILTER
    // ============================================================

    const selectedPunchFilter =
      PUNCH_STATUS_FILTERS.find(
        (filter) =>
          filter.key === activePunchStatus,
      );

    if (
      selectedPunchFilter &&
      selectedPunchFilter.value !== null
    ) {
      filteredData =
        filteredData.filter((item) => {
          const itemPunchStatus =
            typeof item?.punchstatus === "string"
              ? item.punchstatus
                .trim()
                .toLowerCase()
              : "";

          return (
            itemPunchStatus ===
            selectedPunchFilter.value
          );
        });
    }


    console.log("datatatatatatatata", data)
    // ============================================================
    // STATUS FILTER
    // ============================================================

    const selectedStatusFilter =
      STATUS_FILTERS.find(
        (filter) =>
          filter.key === activeStatus,
      );

    if (
      selectedStatusFilter &&
      selectedStatusFilter.value !== null
    ) {
      filteredData =
        filteredData.filter((item) => {
          const itemStatus =
            typeof item?.status === "string"
              ? item.status
                .trim()
                .toLowerCase()
              : "";

          return (
            itemStatus ===
            selectedStatusFilter.value
          );
        });
    }

    return filteredData;
  }, [
    listData,
    PUNCH_STATUS_FILTERS,
    STATUS_FILTERS,
    activePunchStatus,
    activeStatus,
  ]);
 

  // ============================================================
  // GROUP DATA
  // ============================================================

  // ============================================================
  // DYNAMIC STATUS FILTERS
  // ============================================================

  const groupedData = useMemo(() => {
    return data.reduce(
      (acc, item) => {
        if (!acc[item.date]) {
          acc[item.date] = [];
        }

        acc[item.date].push(item);

        return acc;
      },
      {},
    );
  }, [data]);

  const timelineData =
    Object.keys(groupedData).map(
      (date) => ({
        date,
        records: groupedData[date],
      }),
    );


  const markedDates = useMemo(() => {
    const marks: Record<
      string,
      any
    > = {};

    data.forEach((item) => {
      const date =
        normalizeDate(item?.date);

      if (!date) {
        return;
      }

      const dateRecords =
        data.filter(
          (record) =>
            normalizeDate(
              record?.date,
            ) === date,
        );

      const backgroundColor =
        getDateStatusColor(
          dateRecords,
        );

      marks[date] = {
        customStyles: {
          container: {
            backgroundColor,
            borderRadius: 18,
            justifyContent: "center",
            alignItems: "center",
          },

          text: {
            color:
              ERP_COLOR_CODE
                .ERP_WHITE,
            fontWeight: "700",
          },
        },
      };
    });

    return marks;
  }, [data]);

  // ============================================================
  // TOGGLE RECORDS
  // ============================================================

  const toggleRecords = (
    index,
  ) => {
    setExpandedItems((prev) => ({
      ...prev,
      [index]:
        !prev[index],
    }));
  };


  const chartData = useMemo(() => {
    return Object.entries(
      listData.reduce(
        (
          acc: Record<string, number>,
          item,
        ) => {
          const status =
            typeof item?.status === "string"
              ? item.status.trim()
              : "";

          if (!status) {
            return acc;
          }

          acc[status] =
            (acc[status] || 0) + 1;

          return acc;
        },
        {},
      ),
    ).map(([status, count]) => ({
      value: count,
      text: status,
      color: getStatusColor(status),
    }));
  }, [data]);
  // ============================================================
  // ERROR
  // ============================================================

  if (parsedError) {
    return (
      <View
        style={{
          height:
            Dimensions.get(
              "screen",
            ).height * 0.75,
          alignContent:
            "center",
          flex: 1,
          justifyContent:
            "center",
          alignItems:
            "center",
        }}
      >
        <ErrorMessage
          message={JSON.stringify(
            parsedError,
          )}
          isShowTop={false}
        />
      </View>
    );
  }

  // ============================================================
  // DETAILS
  // ============================================================

  const openDetails = (
    item: any,
  ) => {
    setSelectedItem(item);
    setShowModal(true);
  };

  const closeDetails = () => {
    setShowModal(false);
    setSelectedItem(null);
  };

  // ============================================================
  // LOADER
  // ============================================================

  if (isLoading) {
    return (
      <View
        style={{
          height:
            Dimensions.get(
              "screen",
            ).height * 0.75,
          justifyContent:
            "center",
          alignItems:
            "center",
          alignContent:
            "center",
          alignSelf:
            "center",
        }}
      >
        <FullViewLoader />
      </View>
    );
  }


  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      style={{
        flex: 1,
        backgroundColor:
          theme === "dark"
            ? "black"
            : ERP_COLOR_CODE
              .ERP_WHITE,
      }}
    >
      {/* ======================================================
          DYNAMIC FILTER
          ====================================================== */}

      {showFilter && (
        <>
          {/* ======================================================
        PUNCH STATUS FILTER
        ====================================================== */}

          {
            PUNCH_STATUS_FILTERS.length > 0 && <>

              <Text style={{ marginVertical: 8, marginHorizontal: 8 }}>Punch Status</Text>
              <View>
                <ScrollView
                  bounces={false}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                >
                  {PUNCH_STATUS_FILTERS.map(
                    (filter) => (
                      <TouchableOpacity
                        key={filter.key}
                        onPress={() =>
                          setActivePunchStatus(
                            filter.key,
                          )
                        }
                        style={[
                          {
                            paddingVertical: 2,
                            paddingHorizontal: 4,
                            borderRadius: 4,
                            borderWidth: 1,
                            justifyContent: "center",
                            alignItems: "center",
                            marginHorizontal: 4,
                            marginVertical: 4,
                          },

                          activePunchStatus ===
                            filter.key
                            ? {
                              backgroundColor:
                                ERP_COLOR_CODE
                                  .ERP_APP_COLOR,
                              borderColor:
                                ERP_COLOR_CODE
                                  .ERP_APP_COLOR,
                            }
                            : {
                              backgroundColor:
                                ERP_COLOR_CODE
                                  .ERP_WHITE,
                              borderColor:
                                ERP_COLOR_CODE
                                  .ERP_BORDER_LINE,
                            },
                        ]}
                      >
                        <Text
                          style={{
                            color:
                              activePunchStatus ===
                                filter.key
                                ? ERP_COLOR_CODE
                                  .ERP_WHITE
                                : ERP_COLOR_CODE
                                  .ERP_BLACK,

                            paddingHorizontal: 12,
                            paddingVertical: 6,
                          }}
                        >
                          {filter.label}
                        </Text>
                      </TouchableOpacity>
                    ),
                  )}
                </ScrollView>
              </View>
            </>
          }


          {/* ======================================================
        STATUS FILTER
        ====================================================== */}
          {
            STATUS_FILTERS.length > 0 && <>
              <Text style={{ marginVertical: 8, marginHorizontal: 8 }}>Day Status</Text>
              <View>

                <ScrollView
                  bounces={false}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                >
                  {STATUS_FILTERS.map(
                    (filter) => (
                      <TouchableOpacity
                        key={filter.key}
                        onPress={() =>
                          setActiveStatus(
                            filter.key,
                          )
                        }
                        style={[
                          {
                            paddingVertical: 2,
                            paddingHorizontal: 4,
                            borderRadius: 4,
                            borderWidth: 1,
                            justifyContent: "center",
                            alignItems: "center",
                            marginHorizontal: 4,
                            marginVertical: 4,
                          },

                          activeStatus ===
                            filter.key
                            ? {
                              backgroundColor:
                                ERP_COLOR_CODE
                                  .ERP_APP_COLOR,
                              borderColor:
                                ERP_COLOR_CODE
                                  .ERP_APP_COLOR,
                            }
                            : {
                              backgroundColor:
                                ERP_COLOR_CODE
                                  .ERP_WHITE,
                              borderColor:
                                ERP_COLOR_CODE
                                  .ERP_BORDER_LINE,
                            },
                        ]}
                      >
                        <Text
                          style={{
                            color:
                              activeStatus ===
                                filter.key
                                ? ERP_COLOR_CODE
                                  .ERP_WHITE
                                : ERP_COLOR_CODE
                                  .ERP_BLACK,

                            paddingHorizontal: 12,
                            paddingVertical: 6,
                          }}
                        >
                          {filter.label}
                        </Text>
                      </TouchableOpacity>
                    ),
                  )}
                </ScrollView>
              </View>
            </>
          }

        </>
      )}

      {/* ======================================================
          LANDSCAPE
          ====================================================== */}

      {isLandscape ? (
        <>
          {listData.length >
            0 ? (
            <View
              style={{
                flexDirection:
                  "row",
              }}
            >
              {/* ==================================================
                  LANDSCAPE CALENDAR
                  ================================================== */}

              <View
                style={{
                  width:
                    "50%",
                  alignContent:
                    "center",
                  alignItems:
                    "center",
                  justifyContent:
                    "center",
                }}
              >
                <ScrollView
                  bounces={
                    false
                  }
                  showsHorizontalScrollIndicator={
                    false
                  }
                  showsVerticalScrollIndicator={
                    false
                  }
                >
                  <Calendar
                    style={{
                      width:
                        Dimensions.get(
                          "window",
                        ).width *
                        0.4,

                      borderRadius: 8,

                      backgroundColor:
                        theme ===
                          "dark"
                          ? "black"
                          : "white",

                      borderColor:
                        theme ===
                          "dark"
                          ? "white"
                          : "black",
                    }}
                    monthFormat={
                      "MMMM yyyy"
                    }
                    hideExtraDays={
                      false
                    }
                    firstDay={1}
                    onDayPress={(
                      day,
                    ) => {
                      const selectedData =
                        data?.find(
                          (d) =>
                            normalizeDate(
                              d?.date,
                            ) ===
                            day?.dateString,
                        );

                      if (
                        selectedData
                      ) {
                        openDetails(
                          selectedData,
                        );
                      }
                    }}
                    markingType={
                      "custom"
                    }
                    markedDates={
                      markedDates
                    }
                    theme={{
                      textDayFontWeight:
                        "600",

                      todayTextColor:
                        theme ===
                          "dark"
                          ? "#fff"
                          : ERP_COLOR_CODE
                            .ERP_APP_COLOR,

                      arrowColor:
                        theme ===
                          "dark"
                          ? "white"
                          : ERP_COLOR_CODE
                            .ERP_APP_COLOR,
                    }}
                  />
                </ScrollView>
              </View>

              {/* ==================================================
                  LANDSCAPE LIST
                  ================================================== */}

              <View
                style={{
                  width:
                    "50%",
                }}
              >
                {data.length ===
                  0 ? (
                  <View
                    style={{
                      height:
                        Dimensions.get(
                          "screen",
                        ).height *
                        0.45,

                      justifyContent:
                        "center",

                      alignItems:
                        "center",
                    }}
                  >
                    <NoData
                      isShowTop={
                        false
                      }
                    />
                  </View>
                ) : (
                  <View
                    style={{
                      marginHorizontal:
                        12,

                      backgroundColor:
                        theme ===
                          "dark"
                          ? "black"
                          : "white",
                    }}
                  >
                    <FlatList
                      bounces={
                        false
                      }
                      data={
                        timelineData
                      }
                      keyExtractor={(
                        item,
                        index,
                      ) =>
                        index.toString()
                      }
                      showsVerticalScrollIndicator={
                        false
                      }
                      renderItem={({
                        item,
                      }) => (
                        <View
                          style={{
                            marginBottom:
                              8,

                            backgroundColor:
                              theme ===
                                "dark"
                                ? "black"
                                : "white",

                            width:
                              "98%",
                          }}
                        >
                          {item.records.map(
                            (
                              rec,
                              idx,
                            ) => {
                              const isLeaveFull =
                                rec?.status?.toLowerCase() ===
                                "leave";

                              const workedHours =
                                !rec?.intime ||
                                  !rec?.outtime
                                  ? 0
                                  : getWorkedHours(
                                    rec?.intime,
                                    rec?.outtime,
                                  );

                              const isLessThanRequired =
                                !isLeaveFull &&
                                workedHours <
                                8.5;

                              const isLate =
                                !isLeaveFull &&
                                rec?.intime &&
                                isLatePunchIn(
                                  rec?.intime,
                                );

                              return (
                                <View
                                  key={
                                    rec.id
                                  }
                                  style={{
                                    flexDirection:
                                      "row",
                                    marginBottom:
                                      0,
                                  }}
                                >
                                  {item
                                    .records
                                    .length >
                                    1 && (
                                      <View
                                        style={{
                                          alignItems:
                                            "center",
                                          width: 8,
                                        }}
                                      >
                                        <View
                                          style={{
                                            width: 12,
                                            height: 12,
                                            borderRadius: 6,
                                            backgroundColor:
                                              getStatusColor(
                                                rec?.status,
                                              ),
                                          }}
                                        />

                                        <View
                                          style={{
                                            width: 2,
                                            flex: 1,
                                            backgroundColor:
                                              ERP_COLOR_CODE
                                                .ERP_BLACK,
                                          }}
                                        />
                                      </View>
                                    )}

                                  <TouchableOpacity
                                    onPress={() =>
                                      openDetails(
                                        rec,
                                      )
                                    }
                                    style={{
                                      right: 10,
                                      flex: 1,
                                      marginTop:
                                        item
                                          .records
                                          .length >
                                          1
                                          ? 12
                                          : 0,
                                    }}
                                  >
                                    <View
                                      style={[
                                        styles.recordCard,

                                        theme ===
                                        "dark" && {
                                          borderColor:
                                            "white",
                                          borderWidth:
                                            1,
                                          backgroundColor:
                                            "black",
                                        },
                                      ]}
                                    >
                                      <View
                                        style={{
                                          flexDirection:
                                            "row",
                                          justifyContent:
                                            "center",
                                        }}
                                      >
                                        <View
                                          style={{
                                            flexDirection:
                                              "row",
                                            alignItems:
                                              "center",
                                          }}
                                        />

                                        <View
                                          style={{
                                            flex: 1,
                                            marginLeft: 12,
                                          }}
                                        >
                                          <View
                                            style={{
                                              flexDirection:
                                                "row",
                                              justifyContent:
                                                "space-between",
                                              marginBottom:
                                                4,
                                            }}
                                          >
                                            <TranslatedText
                                              numberOfLines={
                                                1
                                              }
                                              text={
                                                rec?.employee
                                              }
                                              style={[
                                                styles.recordName,
                                                theme ===
                                                "dark" && {
                                                  color:
                                                    "white",
                                                },
                                              ]}
                                            />

                                            <TranslatedText
                                              numberOfLines={
                                                1
                                              }
                                              text={
                                                rec?.date
                                              }
                                              style={[
                                                styles.recordDateTime,

                                                theme ===
                                                "dark" && {
                                                  color:
                                                    "white",
                                                },
                                              ]}
                                            />
                                          </View>

                                          <View
                                            style={{
                                              flexDirection:
                                                "row",
                                              justifyContent:
                                                "space-between",
                                              alignItems:
                                                "center",
                                            }}
                                          >
                                            <View
                                              style={{
                                                flexDirection:
                                                  "row",
                                                alignItems:
                                                  "center",
                                                gap: 4,
                                              }}
                                            >
                                              <MaterialIcons
                                                color={
                                                  ERP_COLOR_CODE
                                                    .ERP_666
                                                }
                                                size={
                                                  14
                                                }
                                                name="access-alarm"
                                              />

                                              <TranslatedText
                                                numberOfLines={
                                                  1
                                                }
                                                text={
                                                  formatTo12Hour(
                                                    rec?.intime,
                                                  ) ||
                                                  "--"
                                                }
                                                style={[
                                                  styles.recordPunchTime,
                                                ]}
                                              />
                                            </View>

                                            {rec?.status?.toLowerCase() ===
                                              "working" ? (
                                              <View
                                                style={{
                                                  flexDirection:
                                                    "row",
                                                  alignItems:
                                                    "center",
                                                  gap: 4,
                                                }}
                                              >
                                                <MaterialIcons
                                                  color={
                                                    ERP_COLOR_CODE
                                                      .ERP_666
                                                  }
                                                  size={
                                                    14
                                                  }
                                                  name="history-toggle-off"
                                                />

                                                <TranslatedText
                                                  numberOfLines={
                                                    1
                                                  }
                                                  text={
                                                    rec?.status
                                                  }
                                                  style={
                                                    styles.recordPunchTime
                                                  }
                                                />
                                              </View>
                                            ) : (
                                              <>
                                                {rec?.outtime &&
                                                  rec?.status?.toLowerCase() !==
                                                  "working" &&
                                                  rec?.status?.toLowerCase() !==
                                                  "leave" && (
                                                    <View
                                                      style={{
                                                        flexDirection:
                                                          "row",
                                                        alignItems:
                                                          "center",
                                                        gap: 4,
                                                      }}
                                                    >
                                                      <Text
                                                        style={[
                                                          styles.recordPunchTime,
                                                          {
                                                            color:
                                                              getWorkedHours(
                                                                rec?.intime,
                                                                rec?.outtime,
                                                              ) <
                                                                9.5
                                                                ? ERP_COLOR_CODE
                                                                  .ERP_ERROR
                                                                : ERP_COLOR_CODE
                                                                  .ERP_666,
                                                          },
                                                        ]}
                                                      >
                                                        -
                                                      </Text>
                                                    </View>
                                                  )}
                                              </>
                                            )}

                                            {rec?.status?.toLowerCase() !==
                                              "working" && (
                                                <View
                                                  style={{
                                                    flexDirection:
                                                      "row",
                                                    alignItems:
                                                      "center",
                                                    gap: 4,
                                                  }}
                                                >
                                                  <MaterialIcons
                                                    color={
                                                      ERP_COLOR_CODE
                                                        .ERP_666
                                                    }
                                                    size={
                                                      14
                                                    }
                                                    name="access-alarm"
                                                  />

                                                  <TranslatedText
                                                    numberOfLines={
                                                      1
                                                    }
                                                    text={
                                                      formatTo12Hour(
                                                        rec?.outtime,
                                                      ) ||
                                                      "--"
                                                    }
                                                    style={
                                                      styles.recordPunchTime
                                                    }
                                                  />
                                                </View>
                                              )}
                                          </View>

                                          {isLeaveFull && (
                                            <Text
                                              style={
                                                styles.statusBadgeRed
                                              }
                                            >
                                              {t(
                                                "text.text10",
                                              )}
                                            </Text>
                                          )}

                                          {isLate && (
                                            <Text
                                              style={
                                                styles.statusBadgeBlue
                                              }
                                            >
                                              {t(
                                                "text.text16",
                                              )}
                                            </Text>
                                          )}

                                          {rec?.outTime &&
                                            rec?.status?.toLowerCase() !==
                                            "working" &&
                                            isLessThanRequired && (
                                              <View
                                                style={{
                                                  flexDirection:
                                                    "row",
                                                  justifyContent:
                                                    "space-between",
                                                }}
                                              >
                                                <Text
                                                  style={
                                                    styles.statusBadgeGrey
                                                  }
                                                >
                                                  {t(
                                                    "text.text21",
                                                  )}
                                                </Text>

                                                <Text
                                                  style={
                                                    styles.statusBadgeGrey
                                                  }
                                                >
                                                  -
                                                </Text>
                                              </View>
                                            )}
                                        </View>
                                      </View>
                                    </View>
                                  </TouchableOpacity>
                                </View>
                              );
                            },
                          )}
                        </View>
                      )}
                    />
                  </View>
                )}
              </View>
            </View>
          ) : (
            <View
              style={{
                height:
                  Dimensions.get(
                    "screen",
                  ).height *
                  0.75,

                flex: 1,
                justifyContent:
                  "center",
                alignContent:
                  "center",
                alignItems:
                  "center",
              }}
            >
              <NoData
                isShowTop={
                  false
                }
              />
            </View>
          )}
        </>
      ) : (
        <>
          {/* ======================================================
              MOBILE
              ====================================================== */}

          {listData.length >
            0 ? (
            <FlatList
              bounces={false}
              data={["calendar"]}
              keyExtractor={(
                item,
                index,
              ) =>
                index.toString()
              }
              showsVerticalScrollIndicator={
                false
              }
              keyboardShouldPersistTaps="handled"
              renderItem={() => (
                <>
                  <View
                    style={{
                      flex: 1,
                      justifyContent:
                        "center",
                      alignContent:
                        "center",
                      alignItems:
                        "center",

                      backgroundColor:
                        theme ===
                          "dark"
                          ? "black"
                          : "white",
                    }}
                  >
                    {/* ==================================================
                        PIE
                        ================================================== */}

                    {currentView ===
                      "pie" &&
                      listData?.length >
                      0 && (
                        <View
                          style={{
                            justifyContent:
                              "space-around",

                            alignItems:
                              "center",

                            flexDirection:
                              "row",

                            borderRadius: 8,

                            marginTop: 12,
                          }}
                        >
                          <PieChart
                            data={
                              chartData
                            }
                            donut
                            radius={
                              70
                            }
                            innerRadius={
                              60
                            }
                            textColor={
                              theme ===
                                "dark"
                                ? "#fff"
                                : "#000"
                            }
                            showValuesAsLabels
                            innerCircleColor={
                              theme ===
                                "dark"
                                ? "#000"
                                : "#fff"
                            }
                            centerLabelComponent={() => (
                              <Text
                                style={{
                                  color:
                                    theme ===
                                      "dark"
                                      ? "#fff"
                                      : "#000",

                                  textAlign:
                                    "center",
                                }}
                              >
                                {listData.length}
                                {"\n"}
                                {t(
                                  "text.text18",
                                )}
                              </Text>
                            )}
                          />


                        </View>
                      )}

                    {/* ==================================================
                        MOBILE CALENDAR
                        ================================================== */}

                    {currentView ===
                      "calendar" && (
                        <View
                          style={{
                            marginTop: 12,
                          }}
                        >
                          <Calendar
                            style={{
                              width:
                                Dimensions.get(
                                  "window",
                                ).width -
                                20,

                              alignSelf:
                                "center",

                              borderRadius: 8,

                              backgroundColor:
                                theme ===
                                  "dark"
                                  ? "black"
                                  : "white",
                            }}
                            monthFormat={
                              "MMMM yyyy"
                            }
                            hideExtraDays={
                              false
                            }
                            firstDay={1}
                            onDayPress={(
                              day,
                            ) => {
                              const selectedData =
                                data?.find(
                                  (d) =>
                                    normalizeDate(
                                      d?.date,
                                    ) ===
                                    day?.dateString,
                                );

                              if (
                                selectedData
                              ) {
                                openDetails(
                                  selectedData,
                                );
                              }
                            }}
                            markingType={
                              "custom"
                            }
                            markedDates={
                              markedDates
                            }
                            theme={{
                              textDayFontWeight:
                                "600",

                              todayTextColor:
                                theme ===
                                  "dark"
                                  ? "#fff"
                                  : ERP_COLOR_CODE
                                    .ERP_APP_COLOR,

                              arrowColor:
                                theme ===
                                  "dark"
                                  ? "white"
                                  : ERP_COLOR_CODE
                                    .ERP_APP_COLOR,
                            }}
                          />
                        </View>
                      )}
                  </View>



                  <View
                    style={{
                      marginTop: Platform.OS === "android" ? 10 : 12,
                      paddingHorizontal: 20,
                    }}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        flexWrap: "wrap",
                        justifyContent: "space-between",
                        rowGap: 10,
                      }}
                    >
                      {chartData?.map((c, i) => {
                        const statusColor = getStatusColor(c?.text);

                        return (
                          <View
                            key={i}
                            style={{
                              width: "32%",
                              minHeight: 58,

                              paddingHorizontal: 9,
                              paddingVertical: 8,

                              borderRadius: 6,

                              backgroundColor:
                                theme === "dark"
                                  ? "#1E1E1E"
                                  : "#F8FAFC",

                              borderWidth: 1,
                              borderColor:
                                theme === "dark"
                                  ? "#333"
                                  : "#E2E8F0",

                              justifyContent: "space-between",
                            }}
                          >
                            {/* Status Title */}
                            <View
                              style={{
                                flexDirection: "row",
                                alignItems: "center",
                                marginBottom: 6,
                              }}
                            >
                              <View
                                style={{
                                  width: 8,
                                  height: 8,
                                  borderRadius: 4,
                                  backgroundColor: statusColor,
                                  marginRight: 6,
                                }}
                              />

                              <TranslatedText
                                numberOfLines={1}
                                ellipsizeMode="tail"
                                text={c?.text}
                                style={{
                                  flex: 1,

                                  color:
                                    theme === "dark"
                                      ? "#FFFFFF"
                                      : "#1F2937",

                                  fontSize: 11,
                                  fontWeight: "600",
                                }}
                              />
                            </View>

                            {/* Bottom Section */}
                            <View
                              style={{
                                flexDirection: "row",
                                alignItems: "center",
                                justifyContent: "space-between",
                              }}
                            >
                              <Text
                                style={{
                                  color:
                                    theme === "dark"
                                      ? "#94A3B8"
                                      : "#64748B",

                                  fontSize: 9,
                                }}
                              >
                                Total
                              </Text>

                              <View
                                style={{
                                  minWidth: 24,
                                  height: 22,

                                  paddingHorizontal: 6,

                                  borderRadius: 6,

                                  alignItems: "center",
                                  justifyContent: "center",

                                  backgroundColor: statusColor,
                                }}
                              >
                                <Text
                                  style={{
                                    color: "#FFFFFF",
                                    fontSize: 10,
                                    fontWeight: "700",
                                  }}
                                >
                                  {c?.value}
                                </Text>
                              </View>
                            </View>
                          </View>
                        );
                      })}
                    </View>
                  </View>
                  {/* ======================================================
                      VIEW SWITCH
                      ====================================================== */}

                  {!isLoading && (
                    <View
                      style={{
                        flex: 1,
                      }}
                    >
                      <View
                        style={{
                          flexDirection:
                            "row",

                          gap: 8,

                          justifyContent:
                            "space-between",

                          paddingHorizontal:
                            34,

                          alignContent:
                            "center",

                          alignItems:
                            "center",
                        }}
                      >
                        <TouchableOpacity
                          onPress={() =>
                            setCurrentView(
                              "pie",
                            )
                          }
                          style={{
                            padding: 10,
                          }}
                        >
                          <MaterialIcons
                            color={
                              "gray"
                            }
                            name="arrow-back"
                            size={
                              24
                            }
                          />
                        </TouchableOpacity>

                        <View
                          style={{
                            flexDirection:
                              "row",
                            gap: 8,
                          }}
                        >
                          <View
                            style={{
                              width:
                                currentView ===
                                  "pie"
                                  ? 24
                                  : 10,

                              height: 10,

                              borderRadius: 5,

                              backgroundColor:
                                currentView ===
                                  "pie"
                                  ? ERP_COLOR_CODE
                                    .ERP_APP_COLOR
                                  : ERP_COLOR_CODE
                                    .ERP_BORDER_LINE,
                            }}
                          />

                          <View
                            style={{
                              width:
                                currentView ===
                                  "calendar"
                                  ? 24
                                  : 10,

                              height: 10,

                              borderRadius: 5,

                              backgroundColor:
                                currentView ===
                                  "calendar"
                                  ? ERP_COLOR_CODE
                                    .ERP_APP_COLOR
                                  : ERP_COLOR_CODE
                                    .ERP_BORDER_LINE,
                            }}
                          />
                        </View>

                        <TouchableOpacity
                          onPress={() =>
                            setCurrentView(
                              "calendar",
                            )
                          }
                          style={{
                            padding: 10,
                          }}
                        >
                          <MaterialIcons
                            color={
                              "gray"
                            }
                            name="arrow-forward"
                            size={
                              24
                            }
                          />
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}

                  {/* ======================================================
                      FILTERED LIST
                      ====================================================== */}

                  {data.length ===
                    0 ? (
                    <View
                      style={{
                        height:
                          Dimensions.get(
                            "screen",
                          ).height *
                          0.45,

                        justifyContent:
                          "center",

                        alignItems:
                          "center",
                      }}
                    >
                      <NoData
                        isShowTop={
                          false
                        }
                      />
                    </View>
                  ) : (
                    <View
                      style={{
                        marginHorizontal:
                          12,

                        backgroundColor:
                          theme ===
                            "dark"
                            ? "black"
                            : "white",
                      }}
                    >
                      <FlatList
                        bounces={
                          false
                        }
                        data={
                          timelineData
                        }
                        keyExtractor={(
                          item,
                          index,
                        ) =>
                          index.toString()
                        }
                        showsVerticalScrollIndicator={
                          false
                        }
                        renderItem={({
                          item,
                          index,
                        }) => {
                          const visibleRecords =
                            expandedItems[
                              index
                            ]
                              ? item.records
                              : item.records.slice(
                                0,
                                1,
                              );

                          return (
                            <View
                              style={{
                                marginBottom:
                                  2,

                                backgroundColor:
                                  theme ===
                                    "dark"
                                    ? "black"
                                    : "white",
                              }}
                            >
                              {visibleRecords.map(
                                (
                                  rec,
                                  idx,
                                ) => {
                                  const isLeaveFull =
                                    rec?.status?.toLowerCase() ===
                                    "leave";

                                  const workedHours =
                                    !rec?.intime ||
                                      !rec?.outtime
                                      ? 0
                                      : getWorkedHours(
                                        rec?.intime,
                                        rec?.outtime,
                                      );

                                  const isLessThanRequired =
                                    !isLeaveFull &&
                                    workedHours <
                                    8.5;

                                  return (
                                    <View
                                      key={
                                        rec.id
                                      }
                                      style={{
                                        flexDirection:
                                          "row",
                                        marginBottom:
                                          0,
                                      }}
                                    >
                                      {expandedItems[
                                        index
                                      ] &&
                                        item
                                          .records
                                          .length >
                                        1 && (
                                          <View
                                            style={{
                                              alignItems:
                                                "center",
                                              width: 8,
                                            }}
                                          >
                                            <View
                                              style={{
                                                width: 12,
                                                height: 12,
                                                borderRadius: 6,
                                                backgroundColor:
                                                  getStatusColor(
                                                    rec?.status,
                                                  ),
                                              }}
                                            />

                                            <View
                                              style={{
                                                width: 2,
                                                flex: 1,
                                                backgroundColor:
                                                  ERP_COLOR_CODE
                                                    .ERP_BLACK,
                                              }}
                                            />
                                          </View>
                                        )}

                                      <TouchableOpacity
                                        onPress={() =>
                                          openDetails(
                                            rec,
                                          )
                                        }
                                        style={{
                                          right: 10,
                                          flex: 1,
                                          marginTop: 2,
                                        }}
                                      >
                                        <View
                                          style={[
                                            styles.recordCard,

                                            theme ===
                                            "dark" && {
                                              borderColor:
                                                "white",
                                              borderWidth:
                                                0.4,
                                              backgroundColor:
                                                "black",
                                            },

                                            {
                                              borderColor:
                                                ERP_COLOR_CODE
                                                  .ERP_BORDER_LINE,

                                              borderWidth:
                                                0.6,
                                            },
                                          ]}
                                        >
                                          <View
                                            style={{
                                              flexDirection:
                                                "row",
                                              justifyContent:
                                                "center",
                                            }}
                                          >
                                            <View
                                              style={{
                                                flexDirection:
                                                  "row",
                                                alignItems:
                                                  "center",
                                              }}
                                            />

                                            <View
                                              style={{
                                                flex: 1,
                                                marginLeft: 12,
                                              }}
                                            >
                                              <View
                                                style={{
                                                  flexDirection:
                                                    "row",

                                                  justifyContent:
                                                    "space-between",

                                                  marginBottom:
                                                    4,
                                                }}
                                              >
                                                <TranslatedText
                                                  numberOfLines={
                                                    1
                                                  }
                                                  text={
                                                    rec?.employee
                                                  }
                                                  style={[
                                                    styles.recordName,

                                                    theme ===
                                                    "dark" && {
                                                      color:
                                                        "white",
                                                    },
                                                  ]}
                                                />

                                                <TranslatedText
                                                  numberOfLines={
                                                    1
                                                  }
                                                  text={
                                                    rec?.date
                                                  }
                                                  style={[
                                                    styles.recordDateTime,

                                                    theme ===
                                                    "dark" && {
                                                      color:
                                                        "white",
                                                    },
                                                  ]}
                                                />
                                              </View>

                                              <View
                                                style={{
                                                  flexDirection:
                                                    "row",

                                                  justifyContent:
                                                    "space-between",

                                                  alignItems:
                                                    "center",
                                                }}
                                              >
                                                <View
                                                  style={{
                                                    flexDirection:
                                                      "row",
                                                    gap: 4,
                                                  }}
                                                >
                                                  <MaterialIcons
                                                    color={
                                                      ERP_COLOR_CODE
                                                        .ERP_666
                                                    }
                                                    size={
                                                      14
                                                    }
                                                    name="access-alarm"
                                                  />

                                                  <TranslatedText
                                                    numberOfLines={
                                                      1
                                                    }
                                                    text={
                                                      formatTo12Hour(
                                                        rec?.intime,
                                                      ) ||
                                                      "--"
                                                    }
                                                    style={
                                                      styles.recordPunchTime
                                                    }
                                                  />
                                                </View>

                                                {rec?.status?.toLowerCase() ===
                                                  "working" ? (
                                                  <View
                                                    style={{
                                                      flexDirection:
                                                        "row",
                                                      gap: 4,
                                                    }}
                                                  >
                                                    <MaterialIcons
                                                      color={
                                                        ERP_COLOR_CODE
                                                          .ERP_666
                                                      }
                                                      size={
                                                        14
                                                      }
                                                      name="history-toggle-off"
                                                    />

                                                    <TranslatedText
                                                      numberOfLines={
                                                        1
                                                      }
                                                      text={
                                                        rec?.status
                                                      }
                                                      style={
                                                        styles.recordPunchTime
                                                      }
                                                    />
                                                  </View>
                                                ) : (
                                                  rec?.outtime &&
                                                  rec?.status?.toLowerCase() !==
                                                  "leave" && (
                                                    <Text
                                                      style={[
                                                        styles.recordPunchTime,
                                                        {
                                                          color:
                                                            workedHours <
                                                              9.5
                                                              ? ERP_COLOR_CODE
                                                                .ERP_ERROR
                                                              : ERP_COLOR_CODE
                                                                .ERP_666,
                                                        },
                                                      ]}
                                                    >
                                                      -
                                                    </Text>
                                                  )
                                                )}

                                                {rec?.status?.toLowerCase() !==
                                                  "working" && (
                                                    <View
                                                      style={{
                                                        flexDirection:
                                                          "row",
                                                        gap: 4,
                                                      }}
                                                    >
                                                      <MaterialIcons
                                                        color={
                                                          ERP_COLOR_CODE
                                                            .ERP_666
                                                        }
                                                        size={
                                                          14
                                                        }
                                                        name="access-alarm"
                                                      />

                                                      <TranslatedText
                                                        numberOfLines={
                                                          1
                                                        }
                                                        text={
                                                          formatTo12Hour(
                                                            rec?.outtime,
                                                          ) ||
                                                          "--"
                                                        }
                                                        style={
                                                          styles.recordPunchTime
                                                        }
                                                      />
                                                    </View>
                                                  )}
                                              </View>

                                              {/* STATUS */}

                                              <View
                                                style={{
                                                  flexDirection: "row",
                                                  alignItems: "center",
                                                }}
                                              >
                                                {/* Status */}
                                                <Text
                                                  style={[
                                                    styles.statusBadgeBlue,
                                                    {
                                                      flex: 1,
                                                      textAlign: "left",
                                                    },
                                                  ]}
                                                  numberOfLines={1}
                                                >
                                                  {rec?.status || "----"}
                                                </Text>

                                                {/* Punch Status */}
                                                <Text
                                                  style={[
                                                    styles.statusBadgeBlue,
                                                    {
                                                      flex: 1,
                                                      textAlign: "center",
                                                    },
                                                  ]}
                                                  numberOfLines={1}
                                                >
                                                  {rec?.punchstatus || ""}
                                                </Text>

                                                {/* Late In */}
                                                <Text
                                                  style={[
                                                    styles.statusBadgeBlue,
                                                    {
                                                      flex: 1,
                                                      textAlign: "right",
                                                    },
                                                  ]}
                                                  numberOfLines={1}
                                                >
                                                  {rec?.latein || ""}
                                                </Text>
                                              </View>

                                              {rec?.outTime &&
                                                rec?.status?.toLowerCase() !==
                                                "working" &&
                                                isLessThanRequired && (
                                                  <View
                                                    style={{
                                                      flexDirection:
                                                        "row",

                                                      justifyContent:
                                                        "space-between",
                                                    }}
                                                  >
                                                    <Text
                                                      style={
                                                        styles.statusBadgeGrey
                                                      }
                                                    >
                                                      {t(
                                                        "text.text21",
                                                      )}
                                                    </Text>

                                                    <Text
                                                      style={
                                                        styles.statusBadgeGrey
                                                      }
                                                    >
                                                      -
                                                    </Text>
                                                  </View>
                                                )}
                                            </View>
                                          </View>
                                        </View>
                                      </TouchableOpacity>

                                      {idx ===
                                        0 &&
                                        item
                                          .records
                                          .length >
                                        1 && (
                                          <View
                                            style={{
                                              alignSelf:
                                                "center",

                                              width: 24,

                                              marginLeft: 4,

                                              justifyContent:
                                                "center",

                                              alignItems:
                                                "center",
                                            }}
                                          >
                                            <TouchableOpacity
                                              onPress={() =>
                                                toggleRecords(
                                                  index,
                                                )
                                              }
                                              style={{
                                                alignItems:
                                                  "center",

                                                paddingVertical:
                                                  1,

                                                marginVertical:
                                                  4,
                                              }}
                                            >
                                              <MaterialIcons
                                                size={
                                                  24
                                                }
                                                color={
                                                  ERP_COLOR_CODE
                                                    .ERP_BORDER_LINE
                                                }
                                                name={
                                                  !expandedItems[
                                                    index
                                                  ]
                                                    ? "expand-more"
                                                    : "expand-less"
                                                }
                                              />
                                            </TouchableOpacity>
                                          </View>
                                        )}
                                    </View>
                                  );
                                },
                              )}
                            </View>
                          );
                        }}
                      />
                    </View>
                  )}
                </>
              )}
            />
          ) : (
            <View
              style={{
                height:
                  Dimensions.get(
                    "screen",
                  ).height *
                  0.75,
                flex: 1,
                justifyContent:
                  "center",
                alignContent:
                  "center",
                alignItems:
                  "center",
              }}
            >
              <NoData
                isShowTop={
                  false
                }
              />
            </View>
          )}
        </>
      )}

      {/* ======================================================
          IMAGE MODAL
          ====================================================== */}

      <ImageBottomSheetModal
        visible={
          showImgModal
        }
        onClose={() =>
          setShowImgModal(
            false,
          )
        }
        imageUrl={img}
      />

      {/* ======================================================
          DETAILS MODAL
          ====================================================== */}

      <DetailsBottomSheet
        visible={
          showModal
        }
        onClose={
          closeDetails
        }
        item={
          selectedItem
        }
        baseLink={
          baseLink
        }
      />
    </ScrollView>
  );
};

export default List;