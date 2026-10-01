// import MaterialIcons from "@react-native-vector-icons/material-icons";
// import React, { useEffect, useRef, useState } from "react";
// import {
//   Alert,
//   Platform,
//   ScrollView,
//   StatusBar,
//   StyleSheet,
//   Text,
//   TouchableOpacity,
//   View,
// } from "react-native";

// import {
//   useCameraDevice,
//   useCameraPermission,
// } from "react-native-vision-camera";

// import {
//   Camera as OCRCamera,
// } from "react-native-vision-camera-text-recognition";

// import Clipboard from "@react-native-clipboard/clipboard";

// import { useNavigation } from "@react-navigation/native";

// const TextScannerScreen = () => {
//   const navigation = useNavigation<any>();

//   const device = useCameraDevice("back");

//   const {
//     hasPermission,
//     requestPermission,
//   } = useCameraPermission();

//   const [recognizedText, setRecognizedText] = useState("");
//   const [isScanning, setIsScanning] = useState(true);

//   /**
//    * Last text displayed to user.
//    */
//   const lastAcceptedTextRef = useRef("");

//   /**
//    * Latest OCR result.
//    */
//   const latestOCRTextRef = useRef("");

//   /**
//    * Number of useful OCR results received.
//    */
//   const stableCountRef = useRef(0);

//   /**
//    * Last time UI was updated.
//    */
//   const lastUpdateTimeRef = useRef(0);

//   /**
//    * Last time useful text was detected.
//    */
//   const lastDetectedTimeRef = useRef(0);

//   /**
//    * Prevent unnecessary updates.
//    */
//   const lastComparableTextRef = useRef("");

//   useEffect(() => {
//     const checkPermission = async () => {
//       if (!hasPermission) {
//         try {
//           await requestPermission();
//         } catch (error) {
//           console.log(
//             "Camera permission error:",
//             error
//           );
//         }
//       }
//     };

//     checkPermission();
//   }, [
//     hasPermission,
//     requestPermission,
//   ]);

//   /**
//    * Clean OCR output.
//    *
//    * Important:
//    * Paragraph line breaks are preserved.
//    */
//   const normalizeText = (
//     value: string
//   ): string => {
//     if (!value) {
//       return "";
//     }

//     return value
//       .replace(/\r\n/g, "\n")
//       .replace(/\r/g, "\n")

//       // Remove spaces/tabs at line start/end
//       .replace(/[ \t]+/g, " ")

//       // Remove spaces immediately before newline
//       .replace(/ +\n/g, "\n")

//       // Remove spaces immediately after newline
//       .replace(/\n +/g, "\n")

//       // Maximum two consecutive empty lines
//       .replace(/\n{3,}/g, "\n\n")

//       .trim();
//   };

//   /**
//    * Used only for comparison.
//    *
//    * Example:
//    *
//    * "Hello World"
//    * "Hello   World"
//    *
//    * are considered the same.
//    */
//   const comparableText = (
//     value: string
//   ): string => {
//     return value
//       .toLowerCase()
//       .replace(/\s+/g, " ")
//       .trim();
//   };

//   /**
//    * Check whether new OCR text is useful.
//    */
//   const isUsefulText = (
//     text: string
//   ): boolean => {
//     if (!text) {
//       return false;
//     }

//     /**
//      * Ignore extremely tiny OCR noise.
//      */
//     if (text.length < 2) {
//       return false;
//     }

//     /**
//      * At least one alphanumeric character.
//      */
//     if (!/[a-zA-Z0-9]/.test(text)) {
//       return false;
//     }

//     return true;
//   };

//   /**
//    * Merge OCR results.
//    *
//    * This is important for paragraphs.
//    *
//    * OCR may return:
//    *
//    * Result 1:
//    * "This is a paragraph"
//    *
//    * Result 2:
//    * "This is a paragraph containing some text"
//    *
//    * Result 3:
//    * "This is a paragraph containing some text which"
//    *
//    * We don't require exact same result twice.
//    */
//   const mergeOCRText = (
//     previous: string,
//     current: string
//   ): string => {
//     const oldText = normalizeText(previous);
//     const newText = normalizeText(current);

//     if (!oldText) {
//       return newText;
//     }

//     if (!newText) {
//       return oldText;
//     }

//     const oldComparable =
//       comparableText(oldText);

//     const newComparable =
//       comparableText(newText);

//     /**
//      * Same text.
//      */
//     if (
//       oldComparable === newComparable
//     ) {
//       return oldText;
//     }

//     /**
//      * New OCR contains previous OCR.
//      *
//      * Example:
//      *
//      * OLD:
//      * Hello world
//      *
//      * NEW:
//      * Hello world this is paragraph
//      */
//     if (
//       newComparable.includes(
//         oldComparable
//       )
//     ) {
//       return newText;
//     }

//     /**
//      * Previous OCR contains new OCR.
//      *
//      * Don't replace a longer paragraph
//      * with a shorter temporary OCR result.
//      */
//     if (
//       oldComparable.includes(
//         newComparable
//       )
//     ) {
//       return oldText;
//     }

//     /**
//      * Try line-based merge.
//      */
//     const oldLines = oldText
//       .split("\n")
//       .map(line => line.trim())
//       .filter(Boolean);

//     const newLines = newText
//       .split("\n")
//       .map(line => line.trim())
//       .filter(Boolean);

//     if (
//       oldLines.length > 0 &&
//       newLines.length > 0
//     ) {
//       const mergedLines = [
//         ...oldLines,
//       ];

//       newLines.forEach(line => {
//         const lineComparable =
//           comparableText(line);

//         const exists =
//           mergedLines.some(
//             existing =>
//               comparableText(
//                 existing
//               ) === lineComparable
//           );

//         if (!exists) {
//           mergedLines.push(line);
//         }
//       });

//       return mergedLines.join("\n");
//     }

//     /**
//      * If two completely different OCR results
//      * are received, prefer the longer one.
//      *
//      * This helps when camera is moving.
//      */
//     return newText.length >= oldText.length
//       ? newText
//       : oldText;
//   };

//   /**
//    * OCR callback.
//    */
//   const handleOCRResult = (
//     result: any
//   ) => {
//     try {
//       if (!result) {
//         return;
//       }

//       /**
//        * IMPORTANT:
//        *
//        * OCR package returns resultText.
//        */
//       const rawText =
//         typeof result?.resultText ===
//         "string"
//           ? result.resultText
//           : "";

//       const text =
//         normalizeText(rawText);

//       /**
//        * Don't remove previous text when
//        * OCR temporarily returns empty.
//        */
//       if (!isUsefulText(text)) {
//         return;
//       }

//       lastDetectedTimeRef.current =
//         Date.now();

//       /**
//        * First useful result.
//        */
//       if (
//         !latestOCRTextRef.current
//       ) {
//         latestOCRTextRef.current =
//           text;

//         stableCountRef.current = 1;
//       } else {
//         const mergedText =
//           mergeOCRText(
//             latestOCRTextRef.current,
//             text
//           );

//         /**
//          * If merged result is different,
//          * keep it.
//          */
//         latestOCRTextRef.current =
//           mergedText;

//         stableCountRef.current += 1;
//       }

//       const finalText =
//         normalizeText(
//           latestOCRTextRef.current
//         );

//       if (!finalText) {
//         return;
//       }

//       /**
//        * Don't update UI for every OCR frame.
//        */
//       const now = Date.now();

//       if (
//         now -
//           lastUpdateTimeRef.current <
//         300
//       ) {
//         return;
//       }

//       /**
//        * Avoid same UI update.
//        */
//       const comparable =
//         comparableText(finalText);

//       if (
//         comparable ===
//           lastComparableTextRef.current &&
//         lastAcceptedTextRef.current
//       ) {
//         return;
//       }

//       /**
//        * Accept useful result immediately.
//        *
//        * We no longer require:
//        *
//        * "same complete paragraph twice"
//        */
//       if (
//         stableCountRef.current >= 1
//       ) {
//         lastUpdateTimeRef.current =
//           now;

//         lastComparableTextRef.current =
//           comparable;

//         lastAcceptedTextRef.current =
//           finalText;

//         setRecognizedText(
//           finalText
//         );
//       }
//     } catch (error) {
//       console.log(
//         "OCR processing error:",
//         error
//       );
//     }
//   };

//   /**
//    * Clear OCR result.
//    */
//   const clearText = () => {
//     latestOCRTextRef.current = "";

//     lastAcceptedTextRef.current =
//       "";

//     lastComparableTextRef.current =
//       "";

//     stableCountRef.current = 0;

//     lastUpdateTimeRef.current = 0;

//     lastDetectedTimeRef.current = 0;

//     setRecognizedText("");
//   };

//   /**
//    * Copy recognized text.
//    */
//   const copyText = () => {
//     const text =
//       recognizedText.trim();

//     if (!text) {
//       Alert.alert(
//         "No Text",
//         "No text detected yet."
//       );
//       return;
//     }

//     Clipboard.setString(text);

//     Alert.alert(
//       "Copied",
//       "Text copied successfully."
//     );
//   };

//   /**
//    * Pause / resume scanning.
//    */
//   const toggleScanning = () => {
//     setIsScanning(
//       previous => !previous
//     );
//   };

//   /**
//    * Close scanner.
//    */
//   const handleDone = () => {
//     setIsScanning(false);

//     navigation.goBack();
//   };

//   /**
//    * Camera unavailable.
//    */
//   if (!device) {
//     return (
//       <View
//         style={styles.centerContainer}
//       >
//         <StatusBar
//           barStyle="light-content"
//           backgroundColor="#000000"
//         />

//         <MaterialIcons
//           name="camera-off"
//           size={50}
//           color="#FFFFFF"
//         />

//         <Text
//           style={styles.centerTitle}
//         >
//           Camera unavailable
//         </Text>

//         <Text
//           style={styles.centerMessage}
//         >
//           Unable to access the camera.
//         </Text>

//         <TouchableOpacity
//           style={
//             styles.closeCenterButton
//           }
//           onPress={handleDone}
//         >
//           <Text
//             style={
//               styles.closeCenterButtonText
//             }
//           >
//             Close
//           </Text>
//         </TouchableOpacity>
//       </View>
//     );
//   }

//   /**
//    * Camera permission.
//    */
//   if (!hasPermission) {
//     return (
//       <View
//         style={styles.centerContainer}
//       >
//         <StatusBar
//           barStyle="light-content"
//           backgroundColor="#000000"
//         />

//         <MaterialIcons
//           name="no-photography"
//           size={50}
//           color="#FFFFFF"
//         />

//         <Text
//           style={styles.centerTitle}
//         >
//           Camera Permission Required
//         </Text>

//         <Text
//           style={styles.centerMessage}
//         >
//           Please allow camera access
//           to scan text.
//         </Text>

//         <TouchableOpacity
//           style={
//             styles.permissionButton
//           }
//           onPress={requestPermission}
//         >
//           <Text
//             style={
//               styles.permissionButtonText
//             }
//           >
//             Allow Camera
//           </Text>
//         </TouchableOpacity>

//         <TouchableOpacity
//           style={
//             styles.closeCenterButton
//           }
//           onPress={handleDone}
//         >
//           <Text
//             style={
//               styles.closeCenterButtonText
//             }
//           >
//             Close
//           </Text>
//         </TouchableOpacity>
//       </View>
//     );
//   }

//   return (
//     <View style={styles.container}>
//       <StatusBar
//         barStyle="light-content"
//         backgroundColor="transparent"
//         translucent
//       />

//       {/* =====================================================
//           CAMERA + OCR
//       ====================================================== */}

//       <OCRCamera
//         style={StyleSheet.absoluteFill}
//         device={device}
//         isActive={isScanning}
//         mode="recognize"
//         options={{
//           language: "latin",

//           /**
//            * More frequent OCR.
//            *
//            * Previous value:
//            * 8
//            *
//            * New value:
//            * 3
//            */
//           frameSkipThreshold: 3,
//         }}
//         callback={handleOCRResult}
//       />

//       {/* =====================================================
//           TOP OVERLAY
//       ====================================================== */}

//       <View
//         pointerEvents="none"
//         style={styles.topOverlay}
//       />

//       {/* =====================================================
//           HEADER
//       ====================================================== */}

//       <View style={styles.header}>
//         <TouchableOpacity
//           style={styles.headerButton}
//           onPress={handleDone}
//           activeOpacity={0.8}
//         >
//           <MaterialIcons
//             name="close"
//             size={28}
//             color="#FFFFFF"
//           />
//         </TouchableOpacity>

//         <View
//           style={
//             styles.headerTitleContainer
//           }
//         >
//           <MaterialIcons
//             name="document-scanner"
//             size={22}
//             color="#FFFFFF"
//           />

//           <Text
//             style={styles.headerTitle}
//           >
//             Scan Text
//           </Text>
//         </View>

//         <TouchableOpacity
//           style={styles.headerButton}
//           onPress={toggleScanning}
//           activeOpacity={0.8}
//         >
//           <MaterialIcons
//             name={
//               isScanning
//                 ? "pause"
//                 : "play-arrow"
//             }
//             size={28}
//             color="#FFFFFF"
//           />
//         </TouchableOpacity>
//       </View>

//       {/* =====================================================
//           SCAN RECTANGLE
          
//           ONLY VISUAL RECTANGLE.
//           OCR BLOCKS ARE NOT DISPLAYED.
//       ====================================================== */}

//       <View
//         pointerEvents="none"
//         style={styles.scanArea}
//       >
//         <View
//           style={styles.cornerTopLeft}
//         />

//         <View
//           style={styles.cornerTopRight}
//         />

//         <View
//           style={styles.cornerBottomLeft}
//         />

//         <View
//           style={styles.cornerBottomRight}
//         />

//         <View
//           style={styles.scanHintContainer}
//         >
//           <View
//             style={
//               styles.scanHintBackground
//             }
//           >
//             <MaterialIcons
//               name="text-fields"
//               size={18}
//               color="#FFFFFF"
//             />

//             <Text
//               style={styles.scanHint}
//             >
//               {isScanning
//                 ? "Point camera towards text"
//                 : "Scanning paused"}
//             </Text>
//           </View>
//         </View>
//       </View>

//       {/* =====================================================
//           SCANNING STATUS
//       ====================================================== */}

//       {isScanning &&
//         !recognizedText && (
//           <View
//             pointerEvents="none"
//             style={
//               styles.scanningStatus
//             }
//           >
//             <View
//               style={styles.scanningDot}
//             />

//             <Text
//               style={
//                 styles.scanningStatusText
//               }
//             >
//               Looking for text...
//             </Text>
//           </View>
//         )}

//       {/* =====================================================
//           BOTTOM RESULT PANEL
//       ====================================================== */}

//       <View
//         style={styles.bottomPanel}
//       >
//         <View
//           style={styles.dragIndicator}
//         />

//         {/* HEADER */}
//         <View
//           style={styles.resultHeader}
//         >
//           <View
//             style={
//               styles.resultTitleContainer
//             }
//           >
//             <Text
//               style={
//                 styles.detectedTitle
//               }
//             >
//               Detected Text
//             </Text>

//             <Text
//               style={
//                 styles.detectedSubTitle
//               }
//             >
//               {recognizedText
//                 ? "Text detected"
//                 : isScanning
//                   ? "Scanning..."
//                   : "Scanning paused"}
//             </Text>
//           </View>

//           <View
//             style={
//               styles.textIconContainer
//             }
//           >
//             <MaterialIcons
//               name="text-fields"
//               size={25}
//               color="#1565C0"
//             />
//           </View>
//         </View>

//         {/* TEXT */}
//         <View
//           style={styles.textContainer}
//         >
//           <ScrollView
//             style={styles.textScroll}
//             contentContainerStyle={
//               styles.textScrollContent
//             }
//             showsVerticalScrollIndicator={
//               true
//             }
//           >
//             <Text
//               style={[
//                 styles.detectedText,
//                 !recognizedText &&
//                   styles.placeholderText,
//               ]}
//             >
//               {recognizedText ||
//                 "Point your camera towards text"}
//             </Text>
//           </ScrollView>
//         </View>

//         {/* BUTTONS */}
//         <View
//           style={styles.actionRow}
//         >
//           {/* CLEAR */}
//           <TouchableOpacity
//             style={
//               styles.secondaryButton
//             }
//             onPress={clearText}
//             activeOpacity={0.8}
//           >
//             <MaterialIcons
//               name="refresh"
//               size={20}
//               color="#1565C0"
//             />

//             <Text
//               style={
//                 styles.secondaryButtonText
//               }
//             >
//               Clear
//             </Text>
//           </TouchableOpacity>

//           {/* COPY */}
//           <TouchableOpacity
//             style={styles.copyButton}
//             onPress={copyText}
//             activeOpacity={0.8}
//           >
//             <MaterialIcons
//               name="content-copy"
//               size={20}
//               color="#FFFFFF"
//             />

//             <Text
//               style={
//                 styles.copyButtonText
//               }
//             >
//               Copy Text
//             </Text>
//           </TouchableOpacity>
//         </View>
//       </View>
//     </View>
//   );
// };

// export default TextScannerScreen;

// /* =========================================================
//    STYLES
// ========================================================= */

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#000000",
//   },

//   /* =====================================================
//      CENTER
//   ===================================================== */

//   centerContainer: {
//     flex: 1,
//     backgroundColor: "#000000",
//     alignItems: "center",
//     justifyContent: "center",
//     paddingHorizontal: 30,
//   },

//   centerTitle: {
//     marginTop: 18,
//     fontSize: 20,
//     fontWeight: "700",
//     color: "#FFFFFF",
//     textAlign: "center",
//   },

//   centerMessage: {
//     marginTop: 8,
//     fontSize: 15,
//     lineHeight: 22,
//     color: "#CCCCCC",
//     textAlign: "center",
//   },

//   permissionButton: {
//     marginTop: 24,
//     minWidth: 160,
//     height: 48,
//     paddingHorizontal: 24,
//     borderRadius: 12,
//     backgroundColor: "#1565C0",
//     alignItems: "center",
//     justifyContent: "center",
//   },

//   permissionButtonText: {
//     fontSize: 15,
//     fontWeight: "700",
//     color: "#FFFFFF",
//   },

//   closeCenterButton: {
//     marginTop: 14,
//     minWidth: 160,
//     height: 46,
//     paddingHorizontal: 24,
//     borderRadius: 12,
//     backgroundColor: "#2A2A2A",
//     alignItems: "center",
//     justifyContent: "center",
//   },

//   closeCenterButtonText: {
//     fontSize: 15,
//     fontWeight: "600",
//     color: "#FFFFFF",
//   },

//   /* =====================================================
//      TOP OVERLAY
//   ===================================================== */

//   topOverlay: {
//     position: "absolute",
//     top: 0,
//     left: 0,
//     right: 0,
//     height:
//       Platform.OS === "ios"
//         ? 125
//         : 105,
//     backgroundColor:
//       "rgba(0,0,0,0.42)",
//   },

//   /* =====================================================
//      HEADER
//   ===================================================== */

//   header: {
//     position: "absolute",
//     top:
//       Platform.OS === "ios"
//         ? 45
//         : 20,
//     left: 0,
//     right: 0,
//     height: 54,
//     paddingHorizontal: 16,
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//   },

//   headerButton: {
//     width: 44,
//     height: 44,
//     borderRadius: 22,
//     backgroundColor:
//       "rgba(0,0,0,0.45)",
//     alignItems: "center",
//     justifyContent: "center",
//   },

//   headerTitleContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 8,
//   },

//   headerTitle: {
//     fontSize: 18,
//     fontWeight: "700",
//     color: "#FFFFFF",
//   },

//   /* =====================================================
//      SCAN AREA
//   ===================================================== */

//   scanArea: {
//     position: "absolute",
//     top: "20%",
//     left: "6%",
//     width: "88%",
//     height: "38%",
//   },

//   cornerTopLeft: {
//     position: "absolute",
//     top: 0,
//     left: 0,
//     width: 38,
//     height: 38,
//     borderTopWidth: 3,
//     borderLeftWidth: 3,
//     borderColor: "#FFFFFF",
//     borderTopLeftRadius: 7,
//   },

//   cornerTopRight: {
//     position: "absolute",
//     top: 0,
//     right: 0,
//     width: 38,
//     height: 38,
//     borderTopWidth: 3,
//     borderRightWidth: 3,
//     borderColor: "#FFFFFF",
//     borderTopRightRadius: 7,
//   },

//   cornerBottomLeft: {
//     position: "absolute",
//     bottom: 0,
//     left: 0,
//     width: 38,
//     height: 38,
//     borderBottomWidth: 3,
//     borderLeftWidth: 3,
//     borderColor: "#FFFFFF",
//     borderBottomLeftRadius: 7,
//   },

//   cornerBottomRight: {
//     position: "absolute",
//     bottom: 0,
//     right: 0,
//     width: 38,
//     height: 38,
//     borderBottomWidth: 3,
//     borderRightWidth: 3,
//     borderColor: "#FFFFFF",
//     borderBottomRightRadius: 7,
//   },

//   scanHintContainer: {
//     position: "absolute",
//     left: 0,
//     right: 0,
//     bottom: -52,
//     alignItems: "center",
//   },

//   scanHintBackground: {
//     flexDirection: "row",
//     alignItems: "center",
//     paddingHorizontal: 14,
//     paddingVertical: 9,
//     borderRadius: 20,
//     backgroundColor:
//       "rgba(0,0,0,0.60)",
//     gap: 7,
//   },

//   scanHint: {
//     fontSize: 14,
//     color: "#FFFFFF",
//     fontWeight: "500",
//   },

//   /* =====================================================
//      STATUS
//   ===================================================== */

//   scanningStatus: {
//     position: "absolute",
//     top: "62%",
//     left: 0,
//     right: 0,
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//   },

//   scanningDot: {
//     width: 8,
//     height: 8,
//     borderRadius: 4,
//     backgroundColor: "#FFFFFF",
//     marginRight: 8,
//   },

//   scanningStatusText: {
//     fontSize: 14,
//     color: "#FFFFFF",
//     fontWeight: "500",
//   },

//   /* =====================================================
//      BOTTOM PANEL
//   ===================================================== */

//   bottomPanel: {
//     position: "absolute",
//     left: 0,
//     right: 0,
//     bottom: 0,

//     minHeight: 280,
//     maxHeight: "45%",

//     backgroundColor: "#FFFFFF",

//     borderTopLeftRadius: 24,
//     borderTopRightRadius: 24,

//     paddingHorizontal: 18,
//     paddingTop: 10,

//     paddingBottom:
//       Platform.OS === "ios"
//         ? 28
//         : 18,

//     shadowColor: "#000000",
//     shadowOffset: {
//       width: 0,
//       height: -4,
//     },
//     shadowOpacity: 0.18,
//     shadowRadius: 12,
//     elevation: 20,
//   },

//   dragIndicator: {
//     alignSelf: "center",
//     width: 42,
//     height: 4,
//     borderRadius: 2,
//     backgroundColor: "#D0D0D0",
//     marginBottom: 14,
//   },

//   /* =====================================================
//      RESULT HEADER
//   ===================================================== */

//   resultHeader: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     marginBottom: 12,
//   },

//   resultTitleContainer: {
//     flex: 1,
//   },

//   detectedTitle: {
//     fontSize: 18,
//     fontWeight: "700",
//     color: "#202124",
//   },

//   detectedSubTitle: {
//     marginTop: 3,
//     fontSize: 14,
//     color: "#777777",
//   },

//   textIconContainer: {
//     width: 44,
//     height: 44,
//     borderRadius: 22,
//     backgroundColor: "#EAF2FC",
//     alignItems: "center",
//     justifyContent: "center",
//   },

//   /* =====================================================
//      TEXT
//   ===================================================== */

//   textContainer: {
//     flex: 1,
//     minHeight: 80,
//     maxHeight: 160,

//     backgroundColor: "#F6F8FA",

//     borderRadius: 14,
//     borderWidth: 1,
//     borderColor: "#E2E6EA",

//     marginBottom: 12,

//     overflow: "hidden",
//   },

//   textScroll: {
//     flex: 1,
//   },

//   textScrollContent: {
//     padding: 14,
//   },

//   detectedText: {
//     fontSize: 16,
//     lineHeight: 24,
//     color: "#202124",
//     fontWeight: "400",
//   },

//   placeholderText: {
//     color: "#999999",
//   },

//   /* =====================================================
//      ACTION BUTTONS
//   ===================================================== */

//   actionRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 10,
//   },

//   secondaryButton: {
//     height: 48,
//     flex: 0.8,

//     borderRadius: 12,

//     borderWidth: 1,
//     borderColor: "#1565C0",

//     backgroundColor: "#FFFFFF",

//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",

//     gap: 7,
//   },

//   secondaryButtonText: {
//     fontSize: 15,
//     fontWeight: "700",
//     color: "#1565C0",
//   },

//   copyButton: {
//     height: 48,
//     flex: 1.2,

//     borderRadius: 12,

//     backgroundColor: "#1565C0",

//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",

//     gap: 8,
//   },

//   copyButtonText: {
//     fontSize: 15,
//     fontWeight: "700",
//     color: "#FFFFFF",
//   },
// });
