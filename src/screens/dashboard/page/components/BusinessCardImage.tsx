import React, { useState, useEffect, use } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  Platform,
  ScrollView,
  ActivityIndicator,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Alert,
  useWindowDimensions,
  NativeModules
} from "react-native";
import { launchImageLibrary } from "react-native-image-picker";
import TextRecognition from "@react-native-ml-kit/text-recognition";
import {
  check,
  request,
  PERMISSIONS,
  RESULTS,
  openSettings,
} from "react-native-permissions";
import MaterialIcons from "@react-native-vector-icons/material-icons";
import useTranslations from "../../../../hooks/useTranslations";
import { ERP_COLOR_CODE } from "../../../../utils/constants";
import RNFS from "react-native-fs";
import ImageResizer from "@bam.tech/react-native-image-resizer";
import { useNavigation } from "@react-navigation/native";
import { downloadAndShare } from "../../../../utils/helpers";
import InvoiceForm from "./InvoiceForm";


const { DocumentScanner } = NativeModules;

const launchScannerAsync = (options: any) => {
  return new Promise<any>((resolve, reject) => {
    if (!DocumentScanner) {
      reject(new Error("DocumentScanner module not linked"));
      return;
    }

    try {
      DocumentScanner.launchScanner(options, (result: any) => {
        resolve(result);
      });
    } catch (e) {
      reject(e);
    }
  });
};

const BusinessCardView = ({
  setValue,
  controls,
  item,
  baseLink,
  infoData,
  isFromInvoiceReader = false
}: any) => {

  console.log("isFromInvoiceReaderisFromInvoiceReaderisFromInvoiceReaderisFromInvoiceReader", isFromInvoiceReader)
    const navigation = useNavigation();
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [base64, setBase64] = useState(false);
  const [cacheBuster, setCacheBuster] = useState(Date.now());
  const [showPicker, setShowPicker] = useState(false);
  const { t } = useTranslations();
  const { height, width } = useWindowDimensions();
  const [scanLoader, setScanLoader] = useState(false)

  const isLandscape = width > height;
  const [invoiceData, setInvoiceData] =
    useState<any>(null);
  const getImageUri = (type: "small" | "large") => {
    const base =
      imageUri ||
      `${baseLink}fileupload/1/${infoData?.tableName}/${infoData?.id}/${type === "small" ? `${item?.text}` : item?.text
      }`;
    return `${base}?cb=${cacheBuster}`;
  };

  const checkPermission = async (type: "camera" | "gallery") => {
    if (type === "gallery") {
      return true;
    }
    let permission;

    if (Platform.OS === "ios") {
      permission =
        type === "camera"
          ? PERMISSIONS.IOS.CAMERA
          : PERMISSIONS.IOS.PHOTO_LIBRARY;
    } else {
      // const androidVersion = parseInt(Platform.Version as string, 10);
      if (type === "camera") {
        permission = PERMISSIONS.ANDROID.CAMERA;
      }
      // else {
      //   permission =
      //     androidVersion >= 33
      //       ? PERMISSIONS.ANDROID.READ_MEDIA_IMAGES
      //       : PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE;
      // }
    }

    const result = await check(permission);

    switch (result) {
      case RESULTS.GRANTED:
        return true;

      case RESULTS.DENIED: {
        const req = await request(permission);
        if (req === RESULTS.GRANTED) return true;

        Alert.alert(
          `${type === "camera" ? "Camera" : "Gallery"} Permission Required`,
          `Please allow ${type === "camera" ? "camera" : "gallery"
          } access to continue.`,
          [
            { text: "Cancel", style: "cancel" },
            { text: "Go to Settings", onPress: () => openSettings() },
          ],
        );
        return false;
      }

      case RESULTS.BLOCKED:
        Alert.alert(
          `${type === "camera" ? "Camera" : "Gallery"} Permission Blocked`,
          `Please enable ${type === "camera" ? "Camera" : "Gallery"
          } access from Settings.`,
          [
            { text: "Cancel", style: "cancel" },
            { text: "Go to Settings", onPress: () => openSettings() },
          ],
        );
        return false;

      case RESULTS.UNAVAILABLE:
        Alert.alert(
          "Feature Unavailable",
          `${type === "camera" ? "Camera" : "Gallery"
          } permission is not available on this device.`,
        );
        return false;

      default:
        return false;
    }
  };

  const pickFromCamera = async () => {
    const granted = await checkPermission("camera");
    if (!granted) return;

    setShowPicker(false);

    setTimeout(async () => {
      navigation.navigate("FaceCameraScreen", {
        onCapture: async (photoPath) => {
          setTimeout(async () => {
            try {
              console.log("========== CAMERA START ==========");


              if (!photoPath) {
                console.log("Photo Path Missing");
                return;
              }

              // ✅ SAFE URI
              const originalUri = photoPath.startsWith("file://")
                ? photoPath
                : `file://${photoPath}`;

              console.log("Original Photo:", originalUri);

              let finalUri = originalUri;
              let finalBase64 = "";

              // ⚡ STEP 1: COMPRESS IMAGE
              console.log("Compressing Image...");

              let resizedImage;

              try {
                resizedImage = await ImageResizer.createResizedImage(
                  originalUri,
                  800,
                  800,
                  "JPEG",
                  70,
                  0,
                );
              } catch (err) {
                console.log("⚠️ Primary compression failed, fallback...");

                resizedImage = await ImageResizer.createResizedImage(
                  originalUri,
                  600,
                  600,
                  "JPEG",
                  50,
                  0,
                );
              }

              console.log("Compressed Image:", resizedImage.uri);

              // ⚡ STEP 2: BASE64 AFTER COMPRESSION
              finalBase64 = await RNFS.readFile(
                resizedImage.uri.replace("file://", ""),
                "base64",
              );

              const compressedSizeMB =
                (finalBase64.length * 3) / 4 / 1024 / 1024;

              console.log(
                "Final Base64 Size:",
                compressedSizeMB.toFixed(2),
                "MB",
              );

              finalUri = resizedImage.uri;

              setCacheBuster(Date.now());
              setBase64(
                `${item?.field}.jpeg;data:image/jpeg;base64,${finalBase64}`
              );
              setImageUri(finalUri);
              // setImageExists(true);
              // setImageUri(finalUri);
              // setCacheBuster(Date.now());

              // console.log("Image State Updated");

              // // 🚀 SEND TO BACKEND
              // handleAttachment(
              //   `${item?.field}.jpeg;data:image/jpeg;base64,${finalBase64}`,
              //   item?.field,
              // );


              console.log("========== CAMERA SUCCESS ==========");
            } catch (error) {
              console.log(
                "Image Process Error:",
                JSON.stringify(error, null, 2),
              );
              setImageUri('');
              // setImageExists(false);

            }
          }, 300);
        },

        isFromDashboard: false,
        isBackActive: true,
        isFromAttendance: false,
      });

    }, 400);
  };

  const pickFromGallery = async () => {
    const granted = await checkPermission("gallery");
    if (!granted) return;

    setShowPicker(false);

    // 👇 IMPORTANT FIX (delay)
    setTimeout(async () => {
      try {
        const res = await launchImageLibrary({
          mediaType: "photo",
          quality: 0.5,
          includeBase64: true,
        });

        if (res.didCancel) return;

        if (res.assets && res.assets.length > 0) {
          const asset = res.assets[0];
          let uri = asset.uri!;
          if (Platform.OS === "android" && !uri.startsWith("file://")) {
            uri = "file://" + uri;
          }

          setCacheBuster(Date.now());
          setBase64(
            `${item?.field}.jpeg; data:${asset.type};base64,${asset.base64}`,
          );
          setImageUri(uri);
        }
      } catch (error) {
        console.log("error--------------", error);
      }
    }, 400); // 👈 300–500ms best
  };

  useEffect(() => {
    (async () => {
      if (!imageUri) return;
      setLoading(true);
      try {
        const result = await TextRecognition.recognize(imageUri);
        const joined = result.blocks.map((b) => b.text).join("\n");
        const parsed = parseCard(joined);
        setValue(parsed);
      } catch (err) {
      } finally {
        setLoading(false);
      }
    })();
  }, [imageUri]);

  const parseCard = (text: string): any => {
    // Normalize text
    let cleanText = text
      .replace(/[\u2018\u2019]/g, "'")
      .replace(/[\u201C\u201D]/g, '"')
      .replace(/[|]/g, "I")
      .replace(/\s*@\s*/g, "@")
      .replace(/\s*\.\s*/g, ".")
      .replace(/\s{2,}/g, " ")
      .trim();

    const lines = cleanText
      .split(/\n|\\n/)
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    const result: any = {
      name: "",
      designation: "",
      company: "",
      emailid: "",
      emailid2: "",
      mobileno: "",
      mobileno2: "",
      website: "",
      address: "",
      [item?.field]: base64,
      cardtext: cleanText,
    };

    // Emails
    const emailRegex =
      /\b[A-Za-z0-9._%+-]+ *@ *[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g;
    const emails = [...cleanText.matchAll(emailRegex)].map((e) =>
      e[0].replace(/\s+/g, ""),
    );
    result.emailid = emails[0] || "";
    result.emailid2 = emails[1] || "";

    // Phones
    const phoneRegex = /(\+?\d[\d\s().-]{7,}\d)/g;
    const phones = [...cleanText.matchAll(phoneRegex)]
      .map((p) => p[0].replace(/[^\d+]/g, ""))
      .filter((p) => p.length >= 10 && p.length <= 14);
    const uniquePhones = [...new Set(phones)];
    result.mobileno = uniquePhones[0] || "";
    result.mobileno2 = uniquePhones[1] || "";

    // 🌐 Strict Website Extraction (Only URLs starting with https, http, or www)
    const webRegex =
      /\b((https?:\/\/|www\.)[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})(?:[\/\w.-]*)?\b/g;

    const invalidDomains = [
      "gmail.com",
      "yahoo.com",
      "hotmail.com",
      "outlook.com",
      "rediffmail.com",
      "icloud.com",
      "protonmail.com",
      "zoho.com",
      "mail.com",
      "yandex.com",
      "aol.com",
      "msn.com",
    ];

    let websites = [...cleanText.matchAll(webRegex)]
      .map((w) =>
        w[0]
          .replace(/[-–—;,]+$/g, "") // remove trailing junk like -, ;, ,
          .replace(
            /\s+(pvt|ltd|private|limited|company|solutions?|technologies|systems?).*/i,
            "",
          ) // remove suffixes after domain
          .replace(/^https?:\/\//i, "") // remove protocol
          .replace(/^\/+|\/+$/g, "") // remove stray slashes
          .trim(),
      )
      .filter(
        (w) =>
          (w.startsWith("www.") ||
            w.startsWith("http") ||
            w.startsWith("https")) &&
          /\.[a-z]{2,}$/i.test(w) &&
          !invalidDomains.some((domain) => w.toLowerCase().includes(domain)),
      );

    if (!websites.length && result.emailid) {
      const domain = result.emailid.split("@")[1]?.toLowerCase();
      // Only add fallback if it’s not generic AND you want to keep the `www.` format
      if (domain && domain.includes(".") && !invalidDomains.includes(domain)) {
        websites.push(`www.${domain}`);
      }
    }

    // Remove duplicates and assign
    websites = [...new Set(websites)];
    result.website = websites[0] || "";

    // Keywords
    const jobKeywords =
      /(engineer|developer|manager|director|designer|consultant|executive|officer|lead|analyst|specialist|founder|owner|ceo|cto|cfo|coo|president|partner|architect|product|project|marketing|sales|business|finance|hr|trainer|supervisor|administrator|head|chairman|chairperson|chief|vice\s*president|vp|team\s*lead|technical\s*lead|intern|apprentice|engineer\s*in\s*charge|coordinator|support|technician|operator|advisor|representative|agent|developer\s*advocate|solution\s*architect|principal|managing\s*director|associate|assistant\s*manager|director\s*of|leader|marketing\s*head|accountant|auditor|officer\s*in\s*charge|executive\s*assistant|recruiter|researcher|strategist|planner|owner\s*&\s*founder|co-\s*founder|managing\s*partner|senior|junior)/i;

    const companyKeywords =
      /(pvt|ltd|private|limited|inc|llp|corp|corporation|company|solutions?|system|systems?|technologies|technology|software|consultancy|consulting|industries|industry|group|enterprise|enterprises|services|service|agency|studio|infra|builders?|automation|manufacturing|consultants?|communications?|exports?|traders?|trade|marketing|networks?|digital|ventures?|logistics|supply\s*chain|construction|builders|developers|foods?|pharma|labs?|lab|retail|education|academy|school|institute|college|foundation|trust|ngo|organization|hospital|clinic|medicare|healthcare|finance|capital|bank|investment|motors?|auto|plastics?|chemicals?|paints?|electricals?|electronics?|fabrics?|fashion|garments?|wears?|hardware|steel|cement|machinery|equipments?|textiles?|interiors?|decor|printing|press|media|events?|tours?|travels?|resorts?|hospitality|it\s*solutions|data\s*systems|communications?|telecom|ai|ml|robotics?|iot|research|developers?)/i;

    // Company
    const companyCandidates = lines.map((l, i) => {
      let score = 0;
      if (companyKeywords.test(l)) score += 3;
      if (l === l.toUpperCase()) score += 2;
      if (!/@|\d/.test(l) && l.length < 45) score += 1;
      if (i < 5) score += 1;
      return { text: l, score };
    });
    const bestCompany = companyCandidates.sort((a, b) => b.score - a.score)[0];
    if (bestCompany?.score > 2) result.company = bestCompany.text;

    // Name
    const nameCandidates = lines.map((l, i) => {
      let score = 0;
      if (/^[A-Z][A-Za-z.' -]+$/.test(l)) score += 2;
      if (l.split(" ").length >= 2 && l.split(" ").length <= 4) score += 2;
      if (!/@|\d|www/.test(l)) score += 2;
      if (i <= 4) score += 1;
      if (jobKeywords.test(l)) score -= 2;
      if (companyKeywords.test(l)) score -= 1;
      return { text: l, score };
    });
    const bestName = nameCandidates.sort((a, b) => b.score - a.score)[0];
    if (bestName?.score > 3 && bestName.text !== result.company)
      result.name = bestName.text;

    // Designation
    const designationCandidates = lines.map((l, i) => {
      let score = 0;
      if (jobKeywords.test(l)) score += 3;
      if (/^[A-Z]/.test(l)) score += 1;
      if (l.split(" ").length < 6) score += 1;
      if (i < 6) score += 1;
      if (/@|www|,|\.com/.test(l)) score -= 1;
      return { text: l, score };
    });
    const bestDesignation = designationCandidates.sort(
      (a, b) => b.score - a.score,
    )[0];
    if (bestDesignation?.score > 3) result.designation = bestDesignation.text;

    // 🏠 Improved Address Extraction Logic 
    const addressKeywords =
      /(street|road|st\.|rd\.|ave|avenue|sector|block|area|society|city|district|village|plot|no\.|building|bldg|floor|lane|cross|main|pin|zip|pincode|india|gujarat|maharashtra|delhi|bangalore|bengaluru|hyderabad|pune|chennai|kolkata|noida|gurgaon|jaipur|ahmedabad|surat|vadodara|mumbai|thane|coimbatore|kochi|trivandrum|indore|bhopal|patna|ranchi|nagpur|lucknow|kanpur|chandigarh|mysore|vizag|vishakhapatnam|goa|odisha|orissa|uttar\s*pradesh|madhya\s*pradesh|west\s*bengal|tamil\s*nadu|karnataka|kerala|andhra\s*pradesh|telangana|address|landmark|behind|near|beside|opposite|post|po\s*box|zip\s*code|state|country|floor|flat|apt|apartment|tower|complex|society|colony|enclave|vihar|nagar)/i;

    // Find address start — ignore false positives like “M.No.”
    const addrStart = lines.findIndex((l, idx) => {
      if (/M\.?No\.?/i.test(l)) return false; // ❌ skip lines like “M.No.”
      if (/(@|www|mob|phone|tel|mail)/i.test(l)) return false; // ❌ skip contact lines
      return addressKeywords.test(l);
    });

    if (addrStart !== -1) {
      const addrLines = [];
      for (let i = addrStart; i < lines.length; i++) {
        if (/(@|www|mob|phone|tel|mail)/i.test(lines[i])) break;
        addrLines.push(lines[i]);
      }

      result.address = addrLines
        .join(", ")
        .replace(/\s{2,}/g, " ")
        .replace(/[,;]+$/g, "")
        .trim();
    } else {
      const tail = lines
        .slice(-5)
        .filter((l) => !/@|www|mob|phone|tel/.test(l));
      if (tail.length >= 2)
        result.address = tail
          .join(", ")
          .replace(/\s{2,}/g, " ")
          .replace(/[,;]+$/g, "")
          .trim();
    }

    // Cleanup
    for (const k of Object.keys(result)) {
      if (typeof result[k] === "string")
        result[k] = result[k]
          .replace(/\s{2,}/g, " ")
          .replace(/[,;]+$/, "")
          .trim();
    }

    setValue(result);
    return result;
  };

  const MINDEE_URL = "https://api-v2.mindee.net";
  const MINDEE_MODEL_ID = "c24a4d2b-dbe3-4dc2-8781-9d8255eb7cae";


  const MINDEE_API_KEY = "md_rDhKjr9Hd1Sfn-Xz1qQQui3Aw5WPGVgNAkpqZ2nRqrs";

  // ----------------------------------------
  // 1. ENQUEUE
  // ----------------------------------------

  const enqueueMindeeInvoice = async (fileUri: string) => {
    const formData = new FormData();

    formData.append("file", {
      uri: fileUri,
      type: "image/jpeg",
      name: `invoice-${Date.now()}.jpg`,
    } as any);

    formData.append("model_id", MINDEE_MODEL_ID);

    const response = await fetch(
      `${MINDEE_URL}/v2/inferences/enqueue`,
      {
        method: "POST",
        headers: {
          Authorization: MINDEE_API_KEY,
          Accept: "application/json",
        },
        body: formData,
      },
    );

    const text = await response.text();

    console.log(
      "MINDEE ENQUEUE STATUS:",
      response.status,
    );

    console.log(
      "MINDEE ENQUEUE RESPONSE:",
      text,
    );

    if (!response.ok) {
      throw new Error(
        `Mindee enqueue error ${response.status}: ${text}`,
      );
    }

    return JSON.parse(text);
  };


  // ----------------------------------------
  // 2. GET JOB
  // ----------------------------------------

  const getMindeeJob = async (jobId: string) => {
    const resultUrl =
      `${MINDEE_URL}/v2/products/extraction/results/${jobId}`;

    console.log("[1] Result URL:", resultUrl);

    const response = await fetch(resultUrl, {
      method: "GET",
      headers: {
        Authorization: MINDEE_API_KEY,
        Accept: "application/json",
      },
    });

    console.log("[2] HTTP STATUS:", response.status);

    const text = await response.text();

    console.log("[3] RESPONSE:", text);

    // --------------------------------
    // NOT READY
    // --------------------------------

    if (response.status === 404) {
      const errorData = JSON.parse(text);

      if (errorData?.code === "404-008") {
        console.log(
          "[4] Invoice is still processing..."
        );

        return {
          ready: false,
          data: null,
        };
      }
    }

    // --------------------------------
    // OTHER ERRORS
    // --------------------------------

    if (!response.ok) {
      throw new Error(
        `Mindee error ${response.status}: ${text}`,
      );
    }

    // --------------------------------
    // READY
    // --------------------------------

    const data = JSON.parse(text);

    console.log("[5] Invoice is READY");

    return {
      ready: true,
      data,
    };
  };


  // ----------------------------------------
  // 3. WAIT FOR JOB
  // ----------------------------------------

  const waitForMindeeJob = async (
    jobId: string,
    maxAttempts = 30,
  ) => {
    for (
      let attempt = 1;
      attempt <= maxAttempts;
      attempt++
    ) {
      console.log(
        `========== MINDEE POLL ${attempt}/${maxAttempts} ==========`
      );

      const result =
        await getMindeeJob(jobId);

      // Still processing
      if (!result.ready) {
        console.log(
          "⏳ Mindee still processing..."
        );

        await new Promise(resolve =>
          setTimeout(resolve, 2000),
        );

        continue;
      }

      // Ready
      console.log(
        "✅ Mindee invoice processing completed"
      );

      return result.data;
    }

    throw new Error(
      "Mindee processing timeout",
    );
  };

  // ----------------------------------------
  // 4. GET FINAL RESULT
  // ----------------------------------------

  const getMindeeResult = async (
    resultUrl: string,
  ) => {
    const response = await fetch(
      resultUrl,
      {
        method: "GET",
        headers: {
          Authorization: MINDEE_API_KEY,
          Accept: "application/json",
        },
      },
    );

    const text = await response.text();

    console.log(
      "MINDEE RESULT STATUS:",
      response.status,
    );

    console.log(
      "MINDEE RESULT:",
      text,
    );

    if (!response.ok) {
      throw new Error(
        `Mindee result error ${response.status}: ${text}`,
      );
    }

    return JSON.parse(text);
  };

  const handleScan = async () => {
    try {
      setScanLoader(true)
      const result = await launchScannerAsync({
        quality: 0.8,
        includeExif: true,
        includeBase64: true,
        includeLocationExif: false,
      });

      if (result?.didCancel) {
        return;
      }

      if (result?.error) {
        Alert.alert("Error", result?.errorMessage || "Scan failed");
        return;
      }

      if (result?.images?.length > 0) {
        const processed = result.images.map((img: any) => ({
          ...img,
          base64: img.base64 || null,
        }));


        setCacheBuster(Date.now());

        if(isFromInvoiceReader){
          console.log("isFromInvoiceReader00000000000")
          const enqueueResponse =
          await enqueueMindeeInvoice(processed[0].uri);

        const jobId =
          enqueueResponse?.job?.id;

        if (!jobId) {
          throw new Error(
            "Mindee Job ID not received",
          );
        }

        console.log(
          "Mindee Job ID:",
          jobId,
        );

        const invoiceData =
          await waitForMindeeJob(jobId);

        console.log(
          "FINAL INVOICE DATA:",
          JSON.stringify(
            invoiceData,
            null,
            2,
          ),
        );
       
        setInvoiceData(invoiceData);
        }else {

          if (result?.images?.length > 0) {
        const processed = result.images.map((img: any) => ({
          ...img,
          base64: img.base64 || null,
        }));


        setCacheBuster(Date.now());
        if (Platform.OS === 'android') {
          const base64Data = await RNFS.readFile(
            processed[0].uri,
            "base64",
          );
          setCacheBuster(Date.now());
          setBase64(
            `${item?.field}.jpeg; data:image/jpeg;base64,${base64Data}`
          );
        } else {
          setCacheBuster(Date.now());
          setBase64(
            `${item?.field}.jpeg; data:image/jpeg;base64,${processed[0]?.base64}`,
          );
        }

        setImageUri(processed[0]?.uri);
      } else {
      }


       
        }
        

     


      }
    } catch (error: any) {
      Alert.alert("Error", error.message || "Something went wrong");
    } finally {
       setScanLoader(false)
      setShowPicker(false);
    }
  };

  return (
    <View >
      <Text style={styles.title}>{item?.fieldtitle}</Text>

      <View style={[styles.cardContainer,]}>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => setShowPicker(true)}
          style={[styles.card, {
            borderColor: ERP_COLOR_CODE.ERP_APP_COLOR,
          }]}
        >
          {loading ? (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="large" color="#007bff" />
            </View>
          ) : (
            <>
              <Image
                source={{ uri: imageUri ? imageUri : getImageUri("small") }}
                style={styles.image}
                resizeMode='contain'
              />

              {/* Overlay */}
              {
                !imageUri && <View style={styles.overlay}>
                  <MaterialIcons name="cloud-upload" size={28} color={ERP_COLOR_CODE.ERP_APP_COLOR} />
                  <Text style={styles.overlayText}>
                    {imageUri ? "Change Image" : "Upload Image"}
                  </Text>
                </View>
              }

            </>
          )}

          {/* Edit Icon */}
          <View style={[styles.editIcon, {
            backgroundColor: ERP_COLOR_CODE.ERP_APP_COLOR
          }]}>
            <MaterialIcons name="edit" size={16} color="#fff" />
          </View>

          <View style={[styles.shareIcon, {
            backgroundColor: ERP_COLOR_CODE.ERP_APP_COLOR
          }]}>
            <TouchableOpacity

              onPress={() => {
                console.log("Share button pressed");
                downloadAndShare(getImageUri("large"), "image/jpeg");
              }}
            >
              <MaterialIcons name="share" size={16} color="#fff" />

            </TouchableOpacity>

          </View>


          {/* <TouchableOpacity

            onPress={() => {
              downloadAndShare(getImageUri("large"), "image/jpeg");
            }}
          >
            <View style={[styles.editIcon, {
              backgroundColor: ERP_COLOR_CODE.ERP_APP_COLOR
            }]}>
              <MaterialIcons name="share" size={16} color="#fff" />
            </View>
          </TouchableOpacity> */}
        </TouchableOpacity>
      </View>

      {invoiceData && isFromInvoiceReader && (
        <View style={{ flex: 1 }}>
          <InvoiceForm
            mindeeData={invoiceData}
            onSave={(data) => {
              console.log(
                "FINAL ERP INVOICE:",
                JSON.stringify(data, null, 2),
              );

              // Yaha aapka ERP save API call
            }}
          />
        </View>
      )}
      <Modal
        supportedOrientations={["portrait", "landscape"]}
        visible={showPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPicker(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowPicker(false)}>
          <View style={styles.modalOverlay} />
        </TouchableWithoutFeedback>

        <View style={styles.bottomSheet}>
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>{t("title.title10")}</Text>
            {
              !scanLoader && <TouchableOpacity
                onPress={() => setShowPicker(false)}
                style={styles.closeIcon}
              >
                <MaterialIcons name="close" size={22} color="#333" />
              </TouchableOpacity>
            }

          </View>
          {
            scanLoader ? 
            <ActivityIndicator size={'large'} color={'black'} /> : <View style={styles.optionRow}>
              <TouchableOpacity
                style={styles.optionCard}
                onPress={handleScan}
              >
                <MaterialIcons name="document-scanner" size={40} color={ERP_COLOR_CODE.ERP_APP_COLOR + '90'} />
                <Text style={styles.optionText}>Doc scan</Text>
              </TouchableOpacity>
          
              {
                !isFromInvoiceReader && <> 
                <TouchableOpacity
                style={styles.optionCard}
                onPress={pickFromCamera}
              >
                <MaterialIcons name="photo-camera" size={40} color={ERP_COLOR_CODE.ERP_APP_COLOR + '90'} />
                <Text style={styles.optionText}>{t("title.title11")}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.optionCard}
                onPress={pickFromGallery}
              >
                <MaterialIcons name="photo-library" size={40} color={ERP_COLOR_CODE.ERP_APP_COLOR + '90'} />
                <Text style={styles.optionText}>{t("title.title12")}</Text>
              </TouchableOpacity>
                </>
              }
              
            </View>
          }

        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    marginVertical: 10,
  },

  card: {
    width: "100%",
    height: 180,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#f8f9ff",
    borderWidth: 2,
    borderStyle: "dashed",
  },

  image: {
    width: "100%",
    height: "100%",
  },

  overlay: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    paddingVertical: 10,
    backgroundColor: "rgba(212, 199, 199, 0.4)",
    alignItems: "center",
  },

  overlayText: {
    color: "#000",
    fontSize: 13,
    marginTop: 4,
  },
  shareIcon: {
    position: "absolute",
    top: 8,
    right: 38,
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 6,
    elevation: 3,
  },
  editIcon: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 6,
    elevation: 3,
  },

  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: { fontSize: 16, fontWeight: "bold", marginTop: 2 },
  imageThumb: {
    borderWidth: 1,
    borderColor: "#ccc",
    width: "100%",
    height: 180,
    borderRadius: 12,
    alignSelf: "center",
    marginVertical: 2,
  },
  editIconContainer: {
    position: "absolute",
    right: -10,
    top: "4%",
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 6,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  modalOverlay: { flex: 1, backgroundColor: "#00000099" },
  bottomSheet: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 10,
    alignItems: "center",
  },
  sheetHeader: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  sheetTitle: { fontSize: 18, fontWeight: "600", color: "#222" },
  closeIcon: { padding: 6, borderRadius: 30, backgroundColor: "#f2f2f2" },
  optionRow: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-around",
  },
  optionCard: {
    width: "30%",
    height: 110,
    backgroundColor: "#f8f9fa",
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  optionText: { marginTop: 10, color: "#333" },
});

export default BusinessCardView;