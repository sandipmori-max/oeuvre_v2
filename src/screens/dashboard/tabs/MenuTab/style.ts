import { Platform, StyleSheet } from 'react-native';
import { ERP_COLOR_CODE } from '../../../../utils/constants';

export const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listContent: {
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  columnWrapper: {
    justifyContent: "space-between",
  },
  sectionContainer: {
    margin: 6,
    borderRadius: 2,
  },
  icon: {
    width: 24,
    height: 24,
    resizeMode: "contain",
    borderRadius: 12,
    overflow: "hidden",
  },
  card: {
    flex: 1,
    borderRadius: 6,
    paddingHorizontal: Platform.OS === 'android' ? 6 : 8,
    paddingVertical: Platform.OS === 'android' ? 6 : 8,

    marginBottom: Platform.OS === 'android' ? 8 : 12,
    marginHorizontal: 6,
  },
  cardV2: {
    flex: 1,
    borderRadius: 6,
    paddingVertical: Platform.OS === 'android' ? 6 : 8,
    paddingHorizontal: Platform.OS === 'android' ? 6 : 8,
    marginBottom: Platform.OS === 'android' ? 6 : 8,
    marginHorizontal: 4,
  },
  iconContainer: {
    marginTop: 6,
    width: 40,
    height: 40,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(107, 104, 104, 0.3)",
  },
  iconContainerV2: {
    width: 36,
    height: 36,
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(107, 104, 104, 0.3)",
  },
  iconText: {
    opacity: 0.5,
    fontSize: 20,
    fontWeight: "700",
  },
  iconTextV2: {
    opacity: 0.5,
  },
  title: {
    fontSize: 16,
    marginBottom: 6,
    textAlign: "center",
  },
  titleV2: {
    fontSize: 14,
    marginBottom: 2,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 4,
    color: "rgba(75, 73, 73, 0.85)",
  },
  subtitleV2: {
    fontSize: 12,
    color: "rgba(75, 73, 73, 0.85)",
  },
});