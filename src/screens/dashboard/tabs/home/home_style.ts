import { StyleSheet, Dimensions } from "react-native";
import { ERP_COLOR_CODE } from "../../../../utils/constants";

const { width, height } = Dimensions.get("screen");
const itemWidth = (width - 48) / 2;

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: height,
    width: "100%",
    backgroundColor: ERP_COLOR_CODE.ERP_WHITE,
  },
  columnWrapper: {
    justifyContent: "space-between",
  },
  dateRow: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "flex-end",
  },

  sheet: {
    overflow: "hidden",
    backgroundColor: "#fff",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: 20,
  },

  header: {
    height: 50,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  headerTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },

  doneText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2563eb", // iOS blue
  },

  divider: {
    height: 1,
    backgroundColor: "#e5e7eb",
  },

  picker: {
    height: 220, 
  },
  logo: {
    width: 100,
    height: 100,
    alignSelf: "center",
    marginBottom: 5,
    borderRadius: 20,
  },
  dateButton: {
    // backgroundColor: ERP_COLOR_CODE.ERP_WHITE,
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: ERP_COLOR_CODE.ERP_BORDER_LINE,
    alignItems: "center",
  },
  dateButtonText: {
    fontSize: 14,
    color: ERP_COLOR_CODE.ERP_WHITE,
    fontWeight: "500",
  },
  datePickerModal: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  datePickerContent: {
    backgroundColor: ERP_COLOR_CODE.ERP_WHITE,
    borderRadius: 16,
    padding: 20,
    width: "90%",
    maxHeight: "80%",
  },
  datePickerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: ERP_COLOR_CODE.ERP_1A1A1A,
    textAlign: "center",
    marginBottom: 20,
  },
  datePickerGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  dateContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  datePickerDay: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: ERP_COLOR_CODE.ERP_F8F9FA,
    justifyContent: "center",
    alignItems: "center",
    margin: 2,
  },
  datePickerDayText: {
    fontSize: 14,
    fontWeight: "600",
    color: ERP_COLOR_CODE.ERP_1A1A1A,
  },
  containerDark: {
    flex: 1,
    backgroundColor: ERP_COLOR_CODE.ERP_999,
  },
  chartContainer: {
    padding: 16,
    justifyContent: "center",
    alignContent: "center",
    alignItems: "center",
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 12,
    color: ERP_COLOR_CODE.ERP_BLACK,
  },
  header: {
    backgroundColor: ERP_COLOR_CODE.ERP_WHITE,
    paddingHorizontal: 20,
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: "#E9ECEF",
    shadowColor: ERP_COLOR_CODE.ERP_BLACK,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: ERP_COLOR_CODE.ERP_1A1A1A,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: ERP_COLOR_CODE.ERP_6C757D,
    fontWeight: "400",
  },

  dashboardSection: {
    flex: 1,
    paddingHorizontal: 4,
    paddingTop: 0,
  },

  dashboardGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingBottom: 20,
  },
  dashboardItem: {
    width: itemWidth,
    marginBottom: 6,
    backgroundColor: ERP_COLOR_CODE.ERP_WHITE,
    borderRadius: 16,
    borderColor: ERP_COLOR_CODE.ERP_BORDER,
    borderWidth: 0.8,
    overflow: "hidden",
  },
  dashboardItemContent: {
    padding: 6,
  },
  dashboardItemHeader: {
    marginBottom: 2,
  },
  dashboardItemTopRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  iconText: {
    color: ERP_COLOR_CODE.ERP_WHITE,
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  headerTextWrap: {
    flex: 1,
  },
  dashboardItemText: {
    fontSize: 14,
    fontWeight: "600",
    color: ERP_COLOR_CODE.ERP_1A1A1A,
  },
  dashboardItemSubtitle: {
    fontSize: 12,
    color: ERP_COLOR_CODE.ERP_6C757D,
    marginTop: 2,
  },
  reportBadge: {
    backgroundColor: ERP_COLOR_CODE.ERP_APP_COLOR,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 10,
  },
  reportBadgeText: {
    color: ERP_COLOR_CODE.ERP_WHITE,
    fontSize: 10,
    fontWeight: "400",
    textAlign: "center",
  },
  dashboardItemBody: {
    marginBottom: 2,
  },
  dataContainer: {
    marginBottom: 0,
    // overflow:'hidden'
  },
  dataLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: ERP_COLOR_CODE.ERP_6C757D,
    marginBottom: 2,
    textTransform: "uppercase",
  },
  dashboardItemData: {
    fontSize: 18,
    fontWeight: "700",
  },
  urlContainer: {
    marginBottom: 8,
  },
  urlLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: ERP_COLOR_CODE.ERP_6C757D,
    marginBottom: 2,
    textTransform: "uppercase",
  },
  dashboardItemUrl: {
    fontSize: 12,
    color: ERP_COLOR_CODE.ERP_007AFF,
    lineHeight: 16,
  },
  actionIndicator: {
    alignItems: "flex-end",
  },
  actionDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: ERP_COLOR_CODE.ERP_007AFF,
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  footerLink: {
    color: "#aaacadff",
    fontSize: 12,
    fontWeight: "600",
    marginRight: 4,
  },
  chevron: {
    color: "#aaacadff",
    fontSize: 18,
    lineHeight: 18,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: ERP_COLOR_CODE.ERP_6C757D,
    fontWeight: "500",
  },

  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#E9ECEF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  emptyIconText: {
    fontSize: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: ERP_COLOR_CODE.ERP_1A1A1A,
    marginBottom: 8,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 16,
    color: ERP_COLOR_CODE.ERP_6C757D,
    textAlign: "center",
    lineHeight: 22,
  },

  screenTitle: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 12,
  },
  grid: {
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 12,
  },
  card: {
    width: "100%",
    backgroundColor: ERP_COLOR_CODE.ERP_WHITE,
    borderRadius: 12,
  },
  cardAccent: {
    width: "100%",
    backgroundColor: ERP_COLOR_CODE.ERP_WHITE,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: ERP_COLOR_CODE.ERP_BORDER_LINE,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
    marginVertical: 4,
    borderRadius: 8,
    borderColor: ERP_COLOR_CODE.ERP_BORDER_LINE,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: ERP_COLOR_CODE.ERP_APP_COLOR,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  avatarText: {
    fontWeight: "700",
    color: ERP_COLOR_CODE.ERP_WHITE,
  },
  itemText: {
    flex: 1,
  },
  itemPrimary: {
    fontSize: 14,
    fontWeight: "600",
  },
  itemSecondary: {
    fontSize: 12,
  },
  itemType: {
    fontSize: 12,
  },
  openButton: {
    width: "49.5%",
    // backgroundColor: ERP_COLOR_CODE.ERP_WHITE,
    borderWidth: 1,
    borderColor: ERP_COLOR_CODE.ERP_BORDER_LINE,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignContent: "center",
    alignItems: "center",
  },
  openText: {
    color: ERP_COLOR_CODE.ERP_WHITE,
    fontSize: 16,
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  bottomSheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingTop: 15,
    paddingHorizontal: 20,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 10,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
  },
  closeText: {
    fontSize: 20,
    color: "#333",
  },
  item: {
    paddingVertical: 14,
    borderRadius: 10,
    paddingHorizontal: 10,
  },
  selectedItem: {
    backgroundColor: "#E0F0FF",
  },

  selectedText: {
    color: "#007BFF",
    fontWeight: "600",
  },
  separator: {
    height: 1,
    backgroundColor: "#eee",
  },
  timeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
    paddingHorizontal: 10,
   
  },

  timeItem: {
    width: "32%",
    alignItems: "center",
    borderRadius: 4,
    borderWidth: 0.4,
     borderColor: ERP_COLOR_CODE.ERP_BORDER_LINE,
  },

  iconTimeContainer: {
    width: 40,
    height: 40,
    borderRadius: 6,
    borderColor: "gray",
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 6,
    backgroundColor: "#f5f5f5",
  },

  timeText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
  },

  labelText: {
    fontSize: 12,
    color: "#777",
    marginTop: 2,
    marginBottom: 8
  },
  shiftCard: {
  width: "100%",
  padding: 14,
  marginBottom: 10,
  borderRadius: 4,
  backgroundColor: "#fff",
  borderWidth: 1,
  borderColor: "#e5e7eb",
},

shiftHeader: {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 12,
},

shiftNameText: {
  fontSize: 16,
  fontWeight: "700",
  color: "#222",
},

workingHoursText: {
  fontSize: 13,
  fontWeight: "600",
  color: ERP_COLOR_CODE.ERP_APP_COLOR,
},

shiftRow: {
  flexDirection: "row",
  justifyContent: "space-between",
  paddingVertical: 6,
},

shiftLabel: {
  fontSize: 13,
  color: "#777",
},

shiftValue: {
  fontSize: 13,
  fontWeight: "600",
  color: "#333",
},
});
