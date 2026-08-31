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
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
  Platform,
  Modal,
  Pressable,
} from "react-native";

import { ERP_COLOR_CODE } from "../../../../utils/constants";
import { useAppSelector } from "../../../../store/hooks";

export default function DynamicTable({
  template,
  allData,
  setAllData,
  renderItem,
  sectionKey,
  buttons,
}: any) {
  const theme = useAppSelector(
    (state) => state?.theme.mode
  );
  const [openSections, setOpenSections] = useState(false);
  const { height, width } =
    useWindowDimensions();

  const isLandscape = width > height;

  // =========================================================
  // CONSTANTS
  // =========================================================

  const COLUMN_WIDTH = 180;
  const DELETE_COLUMN_WIDTH = 40;

  // =========================================================
  // STATE
  // =========================================================

  const [
    isBottomSheetVisible,
    setIsBottomSheetVisible,
  ] = useState(false);

  const [selectedRow, setSelectedRow] =
    useState<any[]>([]);

  // =========================================================
  // THEME
  // =========================================================

  const isDark = theme === "dark";

  const backgroundColor = isDark
    ? "#000"
    : "#fffbfb";

  const textColor = isDark
    ? "#fff"
    : "#000";

  const headerBackgroundColor = isDark
    ? "#252525"
    : "#eee";

  const borderColor =
    ERP_COLOR_CODE.ERP_BORDER_LINE;

  // =========================================================
  // VISIBLE TEMPLATE
  // =========================================================

  const visibleTemplate = useMemo(() => {
    return (template || []).filter(
      (item: any) =>
        item.visible !== "1"
    );
  }, [template]);

  // =========================================================
  // ROWS
  // =========================================================

  const rows = useMemo(() => {
    return allData?.[sectionKey] || [];
  }, [allData, sectionKey]);

  // =========================================================
  // GENERATE UNIQUE ROW ID
  // =========================================================

  const generateRowId = useCallback(() => {
    return `row_${Date.now()}_${Math.random()
      .toString(36)
      .substring(2, 10)}`;
  }, []);

  // =========================================================
  // CLONE
  // =========================================================

  const cloneRow = useCallback(
    (row: any[]) => {
      return row.map((item: any) => ({
        ...item,
      }));
    },
    []
  );

  // =========================================================
  // CREATE ROW FROM TEMPLATE
  // =========================================================

  const createRowFromTemplate =
    useCallback(() => {
      const rowId =
        generateRowId();

      return (template || []).map(
        (item: any) => ({
          ...item,

          rowId,

          text:
            item.text !==
              undefined &&
              item.text !== null
              ? item.text
              : item.defaultvalue !==
                undefined &&
                item.defaultvalue !==
                null
                ? item.defaultvalue
                : "",

          dtext:
            item.dtext !==
              undefined &&
              item.dtext !== null
              ? item.dtext
              : "",
        })
      );
    }, [
      template,
      generateRowId,
    ]);

  // =========================================================
  // INITIALIZE FIRST ROW
  // =========================================================

  const toggleSection = (sectionKey: string) => {
    setOpenSections(!openSections)
  };

  useEffect(() => {
    if (!template?.length) {
      return;
    }

    if (
      allData?.[sectionKey] &&
      allData?.[sectionKey]?.length >
      0
    ) {
      return;
    }

    const firstRow =
      createRowFromTemplate();

    setAllData((prev: any) => {
      const existing =
        prev?.[sectionKey];

      if (
        existing &&
        existing.length > 0
      ) {
        return prev;
      }

      return {
        ...prev,
        [sectionKey]: [
          firstRow,
        ],
      };
    });
  }, [
    template,
    sectionKey,
    createRowFromTemplate,
    setAllData,
  ]);

  // =========================================================
  // GET ROW ID
  // =========================================================

  const getRowId = useCallback(
    (
      row: any[],
      rowIndex: number
    ) => {
      // New row
      if (row?.[0]?.rowId) {
        return row[0].rowId;
      }

      // Existing API row
      if (row?.[0]?.dtlid) {
        return `existing_${row[0].dtlid}_${rowIndex}`;
      }

      return `fallback_${sectionKey}_${rowIndex}`;
    },
    [sectionKey]
  );

  // =========================================================
  // ADD ROW
  // =========================================================

  const addRow = useCallback(() => {
    const newRow =
      createRowFromTemplate();

    setSelectedRow(
      cloneRow(newRow)
    );

    setIsBottomSheetVisible(true);
  }, [
    createRowFromTemplate,
    cloneRow,
  ]);

  // =========================================================
  // UPDATE EXISTING ROW
  // =========================================================

  const updateValue = useCallback(
    (
      rowId: string,
      field: string,
      value: any,
      dtext?: any
    ) => {
      console.log("rpwdfdfa", rowId, field, value, dtext)
      // setAllData((prev: any) => {
      //   const currentRows =
      //     prev?.[sectionKey] || [];

      //   const updatedRows =
      //     currentRows.map(
      //       (
      //         row: any[],
      //         rowIndex: number
      //       ) => {
      //         const currentRowId =
      //           getRowId(
      //             row,
      //             rowIndex
      //           );

      //         // -------------------------------------------
      //         // NOT THIS ROW
      //         // -------------------------------------------

      //         if (
      //           currentRowId !==
      //           rowId
      //         ) {
      //           return row;
      //         }

      //         // -------------------------------------------
      //         // THIS ROW
      //         // -------------------------------------------

      //         return row.map(
      //           (item: any) => {
      //             if (
      //               item.field !==
      //               field
      //             ) {
      //               return item;
      //             }

      //             return {
      //               ...item,

      //               text: value,

      //               ...(dtext !==
      //                 undefined && {
      //                 dtext,
      //               }),
      //             };
      //           }
      //         );
      //       }
      //     );

      //   return {
      //     ...prev,

      //     [sectionKey]:
      //       updatedRows,
      //   };
      // });
    },
    [
      sectionKey,
      getRowId,
      setAllData,
    ]
  );

  // =========================================================
  // UPDATE BOTTOM SHEET
  // =========================================================

  const updateBottomSheetValue =
    useCallback(
      (
        field: string,
        value: any,
        dtext?: any
      ) => {
        setSelectedRow(
          (prev: any[]) =>
            prev.map(
              (item: any) => {
                if (
                  item.field !==
                  field
                ) {
                  return item;
                }

                return {
                  ...item,

                  text: value,

                  ...(dtext !==
                    undefined && {
                    dtext,
                  }),
                };
              }
            )
        );
      },
      []
    );

  // =========================================================
  // SAVE BOTTOM SHEET ROW
  // =========================================================

  const saveBottomSheetRow =
    useCallback(() => {
      if (
        !selectedRow?.length
      ) {
        return;
      }

      // Important:
      // Clone before putting row into parent state
      const rowToSave =
        cloneRow(selectedRow);

      setAllData((prev: any) => {
        const currentRows =
          prev?.[sectionKey] || [];

        return {
          ...prev,

          [sectionKey]: [
            ...currentRows,

            rowToSave,
          ],
        };
      });

      setIsBottomSheetVisible(
        false
      );

      setSelectedRow([]);
    }, [
      selectedRow,
      cloneRow,
      sectionKey,
      setAllData,
    ]);

  // =========================================================
  // CLOSE BOTTOM SHEET
  // =========================================================

  const closeBottomSheet =
    useCallback(() => {
      setIsBottomSheetVisible(
        false
      );

      setSelectedRow([]);
    }, []);

  // =========================================================
  // DELETE ROW
  // =========================================================

  const deleteRow = useCallback(
    (
      rowId: string,
      rowIndex: number
    ) => {
      setAllData((prev: any) => {
        const currentRows =
          prev?.[sectionKey] || [];

        const updatedRows =
          currentRows.filter(
            (
              row: any[],
              index: number
            ) => {
              const currentRowId =
                getRowId(
                  row,
                  index
                );

              return (
                currentRowId !==
                rowId &&
                index !==
                rowIndex
              );
            }
          );

        return {
          ...prev,

          [sectionKey]:
            updatedRows,
        };
      });
    },
    [
      sectionKey,
      getRowId,
      setAllData,
    ]
  );

  // =========================================================
  // RENDER TABLE CELL
  // =========================================================

  const renderTableCell =
    useCallback(
      (
        item: any,
        rowId: string,
        colIndex: number
      ) => {
        /*
         * VERY IMPORTANT
         *
         * Every cell must have its own unique key.
         *
         * Before:
         * renderTableCell() -> View without key
         *
         * Now:
         * rowId + dtlid + field
         */

        const cellKey = `${sectionKey}_${rowId}_${item.dtlid}_${item.field}`;

        return (
          <View
            key={cellKey}
            style={{
              width:
                COLUMN_WIDTH,

              paddingHorizontal: 2,
            }}
          >
            {renderItem({
              item: {
                ...item,

                /*
                 * Give renderItem the row identity.
                 */
                rowId,

                cellKey,

                value:
                  item.text !==
                    undefined
                    ? item.text
                    : "",

                dvalue:
                  item.dtext !==
                    undefined
                    ? item.dtext
                    : "",

                onChange: (
                  val: any,
                  displayValue?: any
                ) =>
                  updateValue(
                    rowId,
                    item.field,
                    val,
                    displayValue
                  ),
              },

              index: colIndex,

              isFromChild: true,

              /*
               * Extra identity information
               */
              rowId,

              field:
                item.field,

              cellKey,
            })}
          </View>
        );
      },
      [
        sectionKey,
        renderItem,
        updateValue,
      ]
    );

  // =========================================================
  // RENDER BOTTOM SHEET FIELD
  // =========================================================

  const renderBottomSheetField =
    useCallback(
      (
        item: any,
        colIndex: number
      ) => {
        const cellKey = `sheet_${item.dtlid}_${item.field}`;

        return (
          <View
            key={cellKey}
            style={{
              width: "50%",
              paddingHorizontal: 2,
            }}
          >
            {renderItem({
              item: {
                ...item,

                value:
                  item.text !==
                    undefined
                    ? item.text
                    : "",

                dvalue:
                  item.dtext !==
                    undefined
                    ? item.dtext
                    : "",

                onChange: (
                  val: any,
                  displayValue?: any
                ) =>
                  updateBottomSheetValue(
                    item.field,
                    val,
                    displayValue
                  ),
              },

              index: colIndex,

              isFromChild: false,
            })}
          </View>
        );
      },
      [
        renderItem,
        updateBottomSheetValue,
      ]
    );

  // =========================================================
  // CHUNK ARRAY
  // =========================================================

  const chunkArray = useCallback(
    (
      arr: any[],
      size = 2
    ) => {
      const result: any[] = [];

      for (
        let i = 0;
        i < arr.length;
        i += size
      ) {
        result.push(
          arr.slice(
            i,
            i + size
          )
        );
      }

      return result;
    },
    []
  );

  // =========================================================
  // UI
  // =========================================================

  return (
    <View
      style={{
        marginTop: 6,
        marginBottom: 6,
      }}
    >
      {/* =====================================================
          SECTION TITLE
      ===================================================== */}

      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => toggleSection(sectionKey)}
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 12,
          paddingVertical: 10,
          marginBottom: 8,
          backgroundColor: "#F5F7FA",
          borderRadius: 6,
        }}
      >
        <Text
          style={{
            flex: 1,
            fontSize: 15,
            fontWeight: "700",
            color: textColor,
          }}
        >
          {sectionKey}
        </Text>

        <MaterialIcons
          name={
            openSections
              ? "keyboard-arrow-up"
              : "keyboard-arrow-down"
          }
          size={24}
          color={textColor}
        />
      </TouchableOpacity>

      {/* =====================================================
          TABLE
      ===================================================== */}

      {
        openSections && <View
          style={{
            borderColor,
            borderWidth: 0.5,
            borderRadius: 4,
            padding: 4,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              width: "100%",

            }}
          >
            {/* =================================================
              DELETE COLUMN
          ================================================= */}

            <View
              style={{
                width:
                  DELETE_COLUMN_WIDTH,

                backgroundColor:
                  headerBackgroundColor,

                borderRightWidth: 0.5,

                borderColor,
              }}
            >
              {/* Header */}

              <View
                style={{
                  height: 32,

                  alignItems:
                    "center",

                  justifyContent:
                    "center",

                  borderBottomWidth:
                    0.5,

                  borderColor,
                }}
              >
                <MaterialIcons
                  name="delete-outline"
                  size={18}
                  color={
                    textColor
                  }
                />
              </View>

              {/* Delete buttons */}

              {rows.map(
                (
                  row: any[],
                  rowIndex: number
                ) => {
                  const rowId =
                    getRowId(
                      row,
                      rowIndex
                    );

                  return (
                    <View
                      key={`delete_${rowId}`}
                      style={{
                        height: 46,

                        alignItems:
                          "center",

                        justifyContent:
                          "flex-start",

                        paddingTop: 14,
                      }}
                    >
                      <TouchableOpacity
                        style={{
                          backgroundColor:
                            "#82423e",

                          width: 30,

                          height: 30,

                          borderRadius: 6,

                          alignItems:
                            "center",

                          justifyContent:
                            "center",
                        }}
                        onPress={() =>
                          deleteRow(
                            rowId,
                            rowIndex
                          )
                        }
                      >
                        <MaterialIcons
                          name="close"
                          size={16}
                          color="white"
                        />
                      </TouchableOpacity>
                    </View>
                  );
                }
              )}
            </View>

            {/* =================================================
              HORIZONTAL TABLE
          ================================================= */}

            <ScrollView
              horizontal
              bounces={false}
              showsHorizontalScrollIndicator
              keyboardShouldPersistTaps="handled"
              style={{
                flex: 1,
              }}
            >
              <View>
                {/* =============================================
                  HEADER
              ============================================= */}

                <View
                  style={{
                    flexDirection:
                      "row",

                  }}
                >
                  {visibleTemplate.map(
                    (
                      item: any,
                      index: number
                    ) => (
                      <View
                        key={`header_${sectionKey}_${item.dtlid}_${item.field}`}
                        style={{
                          width:
                            COLUMN_WIDTH,

                          height: 32,

                          backgroundColor:
                            headerBackgroundColor,

                          borderWidth:
                            0.5,

                          borderColor,
                        }}
                      >
                        <Text
                          style={{
                            paddingHorizontal:
                              8,

                            paddingVertical:
                              4,

                            fontWeight:
                              "700",

                            color:
                              textColor,
                          }}
                          numberOfLines={1}
                        >
                          {
                            item.fieldtitle
                          }
                        </Text>
                      </View>
                    )
                  )}
                </View>

                {/* =============================================
                  ROWS
              ============================================= */}

                <View style={{ marginTop: 10 }}>
                  {rows.map(
                    (
                      row: any[],
                      rowIndex: number
                    ) => {
                      const rowId =
                        getRowId(
                          row,
                          rowIndex
                        );

                      const visibleItems =
                        row.filter(
                          (
                            item: any
                          ) =>
                            item.visible !==
                            "1"
                        );

                      return (
                        <View
                          key={`table_row_${sectionKey}_${rowId}`}
                          style={{
                            flexDirection:
                              "row",

                            height: 46,

                            paddingTop: 2,
                          }}
                        >
                          {visibleItems.map(
                            (
                              item: any,
                              colIndex: number
                            ) =>
                              renderTableCell(
                                item,
                                rowId,
                                colIndex
                              )
                          )}
                        </View>
                      );
                    }
                  )}
                </View>
              </View>
            </ScrollView>
          </View>

          {/* ===================================================
            FOOTER
        =================================================== */}

          <View
            style={{
              flexDirection: "row",

              justifyContent:
                "space-between",

              alignItems: "center",

              marginVertical: 10,

              marginHorizontal: 6,

              borderTopWidth: 0.5,

              borderTopColor:
                borderColor,
            }}
          >
            {/* Buttons */}

            <ScrollView
              bounces={false}
              horizontal
              showsHorizontalScrollIndicator={
                false
              }
              style={{
                flex: 1,
              }}
              keyboardShouldPersistTaps="handled"
            >
              <View
                style={{
                  flexDirection:
                    "row",

                  paddingTop: 8,
                }}
              >
                {buttons?.map(
                  (
                    btn: any,
                    index: number
                  ) => (
                    <TouchableOpacity
                      key={`${btn.btn_name}_${index}`}
                      onPress={() =>
                        console.log(
                          "Button:",
                          btn.btn_name
                        )
                      }
                      style={{
                        flexDirection:
                          "row",

                        alignItems:
                          "center",

                        backgroundColor:
                          btn.btn_color,

                        paddingHorizontal:
                          10,

                        paddingVertical:
                          6,

                        borderRadius: 6,

                        marginRight: 8,
                      }}
                    >
                      <Text
                        style={{
                          color: "white",
                          marginRight: 4,
                        }}
                      >
                        {
                          btn.btn_name
                        }
                      </Text>

                      <MaterialIcons
                        size={16}
                        name={
                          btn.btn_icon_name
                        }
                        color="white"
                      />
                    </TouchableOpacity>
                  )
                )}
              </View>
            </ScrollView>

            {/* Add */}

            <TouchableOpacity
              style={{
                backgroundColor:
                  ERP_COLOR_CODE
                    .ERP_APP_COLOR,

                padding: 8,

                borderRadius: 8,

                marginTop: 8,

                marginLeft: 8,
              }}
              onPress={addRow}
            >
              <MaterialIcons
                size={20}
                name="add"
                color="white"
              />
            </TouchableOpacity>
          </View>
        </View>
      }


      {/* =====================================================
          BOTTOM SHEET
      ===================================================== */}

      <Modal
        visible={
          isBottomSheetVisible
        }
        transparent
        animationType="slide"
        onRequestClose={
          closeBottomSheet
        }
      >
        <View
          style={{
            flex: 1,

            backgroundColor:
              "rgba(0,0,0,0.45)",

            justifyContent:
              "flex-end",
          }}
        >
          <Pressable
            style={{
              flex: 1,
            }}
            onPress={
              closeBottomSheet
            }
          />

          <View
            style={{
              backgroundColor:
                isDark
                  ? "#1c1c1c"
                  : "#fff",

              borderTopLeftRadius:
                20,

              borderTopRightRadius:
                20,

              maxHeight:
                isLandscape
                  ? "90%"
                  : "80%",

              paddingBottom:
                Platform.OS === "ios"
                  ? 30
                  : 15,
            }}
          >
            {/* Header */}

            <View
              style={{
                flexDirection:
                  "row",

                alignItems:
                  "center",

                justifyContent:
                  "space-between",

                paddingHorizontal:
                  16,

                paddingVertical:
                  14,

                borderBottomWidth:
                  0.5,

                borderBottomColor:
                  borderColor,
              }}
            >
              <Text
                style={{
                  fontSize: 17,

                  fontWeight: "700",

                  color: textColor,
                }}
              >
                Add {sectionKey}
              </Text>

              <TouchableOpacity
                onPress={
                  closeBottomSheet
                }
              >
                <MaterialIcons
                  name="close"
                  size={24}
                  color={
                    textColor
                  }
                />
              </TouchableOpacity>
            </View>

            {/* Content */}

            <ScrollView
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={
                false
              }
              contentContainerStyle={{
                padding: 12,

                paddingBottom: 20,
              }}
            >
              {chunkArray(
                selectedRow.filter(
                  (
                    item: any
                  ) =>
                    item.visible !==
                    "1"
                ),
                2
              ).map(
                (
                  chunk: any[],
                  chunkIndex: number
                ) => (
                  <View
                    key={`sheet_row_${chunkIndex}`}
                    style={{
                      flexDirection:
                        "row",

                      marginBottom: 4,
                    }}
                  >
                    {chunk.map(
                      (
                        item: any,
                        colIndex: number
                      ) =>
                        renderBottomSheetField(
                          item,
                          colIndex
                        )
                    )}

                    {chunk.length ===
                      1 && (
                        <View
                          style={{
                            width: "50%",
                          }}
                        />
                      )}
                  </View>
                )
              )}
            </ScrollView>

            {/* Footer */}

            <View
              style={{
                flexDirection:
                  "row",

                justifyContent:
                  "flex-end",

                paddingHorizontal:
                  14,

                paddingTop: 10,

                borderTopWidth:
                  0.5,

                borderTopColor:
                  borderColor,
              }}
            >
              <TouchableOpacity
                onPress={
                  closeBottomSheet
                }
                style={{
                  paddingHorizontal:
                    18,

                  paddingVertical:
                    9,

                  borderRadius: 7,

                  marginRight: 8,

                  backgroundColor:
                    "#777",
                }}
              >
                <Text
                  style={{
                    color: "#fff",

                    fontWeight:
                      "600",
                  }}
                >
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={
                  saveBottomSheetRow
                }
                style={{
                  paddingHorizontal:
                    18,

                  paddingVertical:
                    9,

                  borderRadius: 7,

                  backgroundColor:
                    ERP_COLOR_CODE
                      .ERP_APP_COLOR,
                }}
              >
                <Text
                  style={{
                    color: "#fff",

                    fontWeight:
                      "600",
                  }}
                >
                  Submit
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}