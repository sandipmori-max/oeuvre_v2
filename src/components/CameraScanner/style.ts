import { 
  StyleSheet,
} from "react-native";
export const ui = StyleSheet.create({
  backButton: {
    position: "absolute",
    top: 60,
    left: 20,
    zIndex: 10,
    padding: 6,
  },

  descriptionBox: {
    position: "absolute",
    top: 110,
    width: "100%",
    paddingHorizontal: 20,
    zIndex: 10,
  },
  descriptionText: {
    color: "#fff",
    fontSize: 16,
    backgroundColor: "rgba(0,0,0,0.45)",
    padding: 10,
    borderRadius: 6,
  },

  bottomPanel: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    paddingVertical: 18,
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  bottomText: {
    color: "#fff",
    fontSize: 16,
    opacity: 0.8,
  },
});


export const uiStyles = StyleSheet.create({
  header: {
    width: '100%',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: 'rgba(0,0,0,0.65)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    top: 60,
    zIndex: 50,
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: 'white',
  },

  closeBtn: {
    padding: 4,
  },

  descriptionContainer: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },

  descriptionText: {
    fontSize: 14,
    color: 'white',
    opacity: 0.9,
  },

  bottomPanel: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    paddingVertical: 18,
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },

  bottomText: {
    color: '#fff',
    fontSize: 16,
    opacity: 0.8,
  },
});
