import React, { useEffect, useMemo, useRef } from "react";
import {
  View,
  Text,
  Image,
  StatusBar,
  Animated,
  Easing,
  StyleSheet,
  useWindowDimensions,
  Platform,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import DeviceInfo from "react-native-device-info";

import { ERP_ICON } from "../../assets";
import { SplashProps } from "./types";
import { useAppSelector } from "../../store/hooks";
import useTranslations from "../../hooks/useTranslations";
import { firstLetterUpperCase } from "../../utils/helpers";
import { useBaseLink } from "../../hooks/useBaseLink";

const SPLASH_DURATION = 3600;

const CustomSplashScreen: React.FC<SplashProps> = ({ onFinish }) => {
  const { height, width } = useWindowDimensions();

  const isLandscape = width > height;
  const baseLink = useBaseLink();
  const isTablet =
    (Platform.OS === "ios" && Platform.isPad) ||
    DeviceInfo.isTablet() ||
    Platform.isTV;

  const { user, appColorCode } = useAppSelector((state) => state.auth);

  const { t } = useTranslations();

  /*
  ============================================================
  BRAND COLOR
  ============================================================
  */

  const brandColor =
    typeof appColorCode === "string" && appColorCode.trim()
      ? appColorCode
      : "#039EE3";

  /*
  ============================================================
  GREETING
  ============================================================
  */

  const greeting = useMemo(() => {
    const hour = new Date().getHours();

    if (hour < 12) {
      return "Good Morning";
    }

    if (hour < 17) {
      return "Good Afternoon";
    }

    return "Good Evening";
  }, []);

  /*
  ============================================================
  ANIMATION VALUES
  ============================================================
  */

  const screenOpacity = useRef(new Animated.Value(0)).current;

  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.65)).current;

  const greetingOpacity = useRef(new Animated.Value(0)).current;
  const greetingTranslateY = useRef(new Animated.Value(18)).current;

  const titleOpacity = useRef(new Animated.Value(0)).current;
  const titleTranslateY = useRef(new Animated.Value(25)).current;

  const subtitleOpacity = useRef(new Animated.Value(0)).current;

  const lineProgress = useRef(new Animated.Value(0)).current;

  const loadingOpacity = useRef(new Animated.Value(0.3)).current;

  const orbOneScale = useRef(new Animated.Value(0.8)).current;
  const orbTwoScale = useRef(new Animated.Value(0.75)).current;

  const finishCalled = useRef(false);

  /*
  ============================================================
  FINISH SPLASH
  ============================================================
  */

  const finishSplash = () => {
    if (finishCalled.current) {
      return;
    }

    finishCalled.current = true;

    onFinish();
  };

  /*
  ============================================================
  SPLASH ANIMATION
  ============================================================
  */

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];

    /*
    ----------------------------------------------------------
    SCREEN
    ----------------------------------------------------------
    */

    Animated.timing(screenOpacity, {
      toValue: 1,
      duration: 400,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();

    /*
    ----------------------------------------------------------
    LOGO
    ----------------------------------------------------------
    */

    const logoTimer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 500,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),

        Animated.spring(logoScale, {
          toValue: 1,
          damping: 14,
          stiffness: 155,
          mass: 0.75,
          useNativeDriver: true,
        }),
      ]).start();
    }, 100);

    timers.push(logoTimer);

    /*
    ----------------------------------------------------------
    GREETING
    ----------------------------------------------------------
    */

    const greetingTimer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(greetingOpacity, {
          toValue: 1,
          duration: 400,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),

        Animated.timing(greetingTranslateY, {
          toValue: 0,
          duration: 400,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
    }, 420);

    timers.push(greetingTimer);

    /*
    ----------------------------------------------------------
    TITLE
    ----------------------------------------------------------
    */

    const titleTimer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(titleOpacity, {
          toValue: 1,
          duration: 500,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),

        Animated.timing(titleTranslateY, {
          toValue: 0,
          duration: 500,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
    }, 580);

    timers.push(titleTimer);

    /*
    ----------------------------------------------------------
    SUBTITLE
    ----------------------------------------------------------
    */

    const subtitleTimer = setTimeout(() => {
      Animated.timing(subtitleOpacity, {
        toValue: 1,
        duration: 450,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    }, 820);

    timers.push(subtitleTimer);

    /*
    ----------------------------------------------------------
    ACCENT LINE
    ----------------------------------------------------------
    */

    const lineTimer = setTimeout(() => {
      Animated.timing(lineProgress, {
        toValue: 1,
        duration: 650,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }).start();
    }, 900);

    timers.push(lineTimer);

    /*
    ----------------------------------------------------------
    BACKGROUND ORB 1
    ----------------------------------------------------------
    */

    const orbOneAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(orbOneScale, {
          toValue: 1,
          duration: 1800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),

        Animated.timing(orbOneScale, {
          toValue: 0.8,
          duration: 1800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );

    /*
    ----------------------------------------------------------
    BACKGROUND ORB 2
    ----------------------------------------------------------
    */

    const orbTwoAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(orbTwoScale, {
          toValue: 1,
          duration: 2200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),

        Animated.timing(orbTwoScale, {
          toValue: 0.75,
          duration: 2200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );

    orbOneAnimation.start();
    orbTwoAnimation.start();

    /*
    ----------------------------------------------------------
    LOADING
    ----------------------------------------------------------
    */

    const loadingAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(loadingOpacity, {
          toValue: 1,
          duration: 700,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),

        Animated.timing(loadingOpacity, {
          toValue: 0.3,
          duration: 700,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );

    loadingAnimation.start();

    /*
    ----------------------------------------------------------
    FINISH
    ----------------------------------------------------------
    */

    const finishTimer = setTimeout(() => {
      finishSplash();
    }, SPLASH_DURATION);

    timers.push(finishTimer);

    /*
    ----------------------------------------------------------
    CLEANUP
    ----------------------------------------------------------
    */

    return () => {
      timers.forEach(clearTimeout);

      orbOneAnimation.stop();
      orbTwoAnimation.stop();
      loadingAnimation.stop();

      screenOpacity.stopAnimation();

      logoOpacity.stopAnimation();
      logoScale.stopAnimation();

      greetingOpacity.stopAnimation();
      greetingTranslateY.stopAnimation();

      titleOpacity.stopAnimation();
      titleTranslateY.stopAnimation();

      subtitleOpacity.stopAnimation();

      lineProgress.stopAnimation();

      loadingOpacity.stopAnimation();

      orbOneScale.stopAnimation();
      orbTwoScale.stopAnimation();
    };

    // Splash animation intentionally runs once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /*
  ============================================================
  RESPONSIVE VALUES
  ============================================================
  */

  const logoSize = isLandscape
    ? isTablet
      ? 118
      : 200
    : isTablet
      ? 118
      : user?.company_code.toLowerCase() === 'deverp' ? 106 
      : user?.company_code.toLowerCase() === 'oeuvre01' ? 110
      : user?.company_code.toLowerCase() === 'gayatrirubtech' ? 260 :
       240;

  const logoContainerSize = !user ? logoSize - 80 :
  user?.company_code.toLowerCase() === 'deverp' ? logoSize + 56  :
  user?.company_code.toLowerCase() === 'oeuvre01' ? logoSize :
  user?.company_code.toLowerCase() === 'gayatrirubtech' ? 
  logoSize - 110
  : logoSize - 80;


  /*
  ============================================================
  ACCENT LINE
  ============================================================
  */

  const animatedLineWidth = lineProgress.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  /*
  ============================================================
  RENDER
  ============================================================
  */

  return (
    <View style={styles.container}>
      <StatusBar
        hidden
        translucent
        backgroundColor="transparent"
        barStyle="dark-content"
      />

      {/* ================================================== */}
      {/* WHITE BACKGROUND */}
      {/* ================================================== */}

      <LinearGradient
        colors={["#FFFFFF", "#FFFFFF", "#FBFDFF"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* ================================================== */}
      {/* TOP BRAND LINE */}
      {/* ================================================== */}

      <View
        style={[
          styles.topBrandLine,
          {
            backgroundColor: brandColor,
          },
        ]}
      />

      {/* ================================================== */}
      {/* TOP RIGHT SOFT ORB */}
      {/* ================================================== */}

      <Animated.View
        pointerEvents="none"
        style={[
          styles.orb,
          styles.orbTopRight,
          {
            backgroundColor: brandColor,
            transform: [{ scale: orbOneScale }],
          },
        ]}
      />

      {/* ================================================== */}
      {/* BOTTOM LEFT SOFT ORB */}
      {/* ================================================== */}

      <Animated.View
        pointerEvents="none"
        style={[
          styles.orb,
          styles.orbBottomLeft,
          {
            backgroundColor: brandColor,
            transform: [{ scale: orbTwoScale }],
          },
        ]}
      />

      {/* ================================================== */}
      {/* DECORATIVE RINGS */}
      {/* ================================================== */}

      <View pointerEvents="none" style={styles.decorativeArea}>
        <View
          style={[
            styles.ringLarge,
            {
              borderColor: `${brandColor}10`,
            },
          ]}
        />

        <View
          style={[
            styles.ringMedium,
            {
              borderColor: `${brandColor}0C`,
            },
          ]}
        />

        <View
          style={[
            styles.ringSmall,
            {
              borderColor: `${brandColor}08`,
            },
          ]}
        />
      </View>

      {/* ================================================== */}
      {/* MAIN */}
      {/* ================================================== */}

      <Animated.View
        style={[
          styles.main,
          {
            opacity: screenOpacity,
          },
        ]}
      >
        {isLandscape ? (
          <View style={styles.landscapeContainer}>
            {/* ================================================== */}
            {/* LANDSCAPE LEFT */}
            {/* ================================================== */}

            <View style={styles.landscapeLeft}>
              <Animated.View
                style={[
                  styles.logoCard,
                  {
                    width: logoContainerSize,
                    height: logoContainerSize,
                    borderColor: `${brandColor}35`,
                    shadowColor: brandColor,
                    opacity: logoOpacity,
                    transform: [{ scale: logoScale }],
                  },
                ]}
              >
                <View
                  style={[
                    styles.logoCardInner,
                    {
                      borderColor: `${brandColor}18`,
                    },
                  ]}
                >
                  <Image
                    source={user?.companyLogo || ERP_ICON.APP_LOGO}
                    style={{
                      width: logoSize,
                      height: logoSize,
                    }}
                    resizeMode="contain"
                  />
                </View>
              </Animated.View>

              {user?.name ? (
                <Animated.Text
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  style={[
                    styles.greeting,
                    {
                      opacity: greetingOpacity,
                      transform: [
                        {
                          translateY: greetingTranslateY,
                        },
                      ],
                    },
                  ]}
                >
                  {greeting},{" "}
                  {firstLetterUpperCase(String(user.name))}
                </Animated.Text>
              ) : null}
            </View>

            {/* ================================================== */}
            {/* LANDSCAPE RIGHT */}
            {/* ================================================== */}

            <View style={styles.landscapeRight}>
              <Text style={styles.eyebrow}>WELCOME TO</Text>

              <Animated.Text
                numberOfLines={3}
                adjustsFontSizeToFit
                style={[
                  styles.companyName,
                  {
                    opacity: titleOpacity,
                    transform: [
                      {
                        translateY: titleTranslateY,
                      },
                    ],
                  },
                ]}
              >
                {user?.companyName || t("text.text53")}
              </Animated.Text>

              <View style={styles.lineWrapper}>
                <Animated.View
                  style={[
                    styles.line,
                    {
                      width: animatedLineWidth,
                      backgroundColor: brandColor,
                    },
                  ]}
                />
              </View>

              <Animated.Text
                style={[
                  styles.subtitle,
                  {
                    opacity: subtitleOpacity,
                  },
                ]}
              >
                {t("text.text54")}
              </Animated.Text>

              <LoadingIndicator
                brandColor={brandColor}
                loadingOpacity={loadingOpacity}
              />
            </View>
          </View>
        ) : (
          <View style={styles.portraitContainer}>
            {/* ================================================== */}
            {/* LOGO */}
            {/* ================================================== */}

            <Animated.View
              style={[
                styles.logoCard,
                {
                  width: logoContainerSize,
                  height: logoContainerSize,
                  borderColor: `${brandColor}35`,
                  shadowColor: brandColor,
                  opacity: logoOpacity,
                  transform: [{ scale: logoScale }],
                  marginBottom: 24
                },
              ]}
            >
              <View
                style={[
                  styles.logoCardInner,
                  {
                    borderColor: `${brandColor}18`,
                  },
                ]}
              >
                <Image
                  source={
                    baseLink
                      ? {
                        uri: `${baseLink}fileupload/1/InvoiceByConfig/1/logo.jpg`,
                      }
                      : ERP_ICON.APP_LOGO
                  }
                  style={{
                    width: logoSize,
                    height: logoSize,
                  }}
                  resizeMode="contain"
                />
              </View>
            </Animated.View>

            {/* ================================================== */}
            {/* GREETING */}
            {/* ================================================== */}

            {user?.name ? (
              <Animated.Text
                numberOfLines={1}
                adjustsFontSizeToFit
                style={[
                  styles.greeting,
                  {
                    opacity: greetingOpacity,
                    transform: [
                      {
                        translateY: greetingTranslateY,
                      },
                    ],
                  },
                ]}
              >
                {greeting},{" "}
                {firstLetterUpperCase(String(user.name))}
              </Animated.Text>
            ) : null}

            {/* ================================================== */}
            {/* CONTENT */}
            {/* ================================================== */}

            <Animated.View
              style={[
                styles.contentBlock,
                {
                  opacity: titleOpacity,
                  transform: [
                    {
                      translateY: titleTranslateY,
                    },
                  ],
                },
              ]}
            >
              <Text style={styles.eyebrow}>WELCOME TO</Text>

              <Text
                numberOfLines={3}
                adjustsFontSizeToFit
                style={styles.companyName}
              >
                {user?.companyName || t("text.text53")}
              </Text>

              {/* ================================================== */}
              {/* ACCENT LINE */}
              {/* ================================================== */}

              <View style={styles.lineWrapper}>
                <Animated.View
                  style={[
                    styles.line,
                    {
                      width: animatedLineWidth,
                      backgroundColor: brandColor,
                    },
                  ]}
                />
              </View>

              {/* ================================================== */}
              {/* SUBTITLE */}
              {/* ================================================== */}

              <Animated.Text
                style={[
                  styles.subtitle,
                  {
                    opacity: subtitleOpacity,
                  },
                ]}
              >
                {t("text.text54")}
              </Animated.Text>

              {/* ================================================== */}
              {/* LOADING */}
              {/* ================================================== */}

              <LoadingIndicator
                brandColor={brandColor}
                loadingOpacity={loadingOpacity}
              />
            </Animated.View>
          </View>
        )}

        {/* ================================================== */}
        {/* FOOTER */}
        {/* ================================================== */}

        <View style={styles.footer}>
          <View
            style={[
              styles.footerLine,
              {
                backgroundColor: `${brandColor}22`,
              },
            ]}
          />

          <Text style={styles.footerText}>
            POWERED BY{" "}
            <Text
              style={[
                styles.footerBrand,
                {
                  color: brandColor,
                },
              ]}
            >
              DevERP
            </Text>
          </Text>
        </View>
      </Animated.View>
    </View>
  );
};

/*
================================================================
LOADING INDICATOR
================================================================
*/

interface LoadingIndicatorProps {
  brandColor: string;
  loadingOpacity: Animated.Value;
}

const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({
  brandColor,
  loadingOpacity,
}) => {
  return (
    <Animated.View
      style={[
        styles.loadingContainer,
        {
          opacity: loadingOpacity,
        },
      ]}
    >
      <View
        style={[
          styles.loadingDot,
          {
            backgroundColor: brandColor,
          },
        ]}
      />

      <View
        style={[
          styles.loadingDot,
          styles.loadingDotCenter,
          {
            backgroundColor: brandColor,
          },
        ]}
      />

      <View
        style={[
          styles.loadingDot,
          {
            backgroundColor: brandColor,
          },
        ]}
      />
    </Animated.View>
  );
};

/*
================================================================
STYLES
================================================================
*/

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    overflow: "hidden",
  },

  main: {
    flex: 1,
    zIndex: 10,
  },

  /*
  ==============================================================
  TOP BRAND LINE
  ==============================================================
  */

  topBrandLine: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    zIndex: 50,
  },

  /*
  ==============================================================
  SOFT ORBS
  ==============================================================
  */

  orb: {
    position: "absolute",
    width: 360,
    height: 360,
    borderRadius: 180,
    opacity: 0.055,
  },

  orbTopRight: {
    top: -220,
    right: -170,
  },

  orbBottomLeft: {
    bottom: -230,
    left: -180,
  },

  /*
  ==============================================================
  DECORATIVE RINGS
  ==============================================================
  */

  decorativeArea: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: "center",
    justifyContent: "center",
  },

  ringLarge: {
    position: "absolute",
    width: 500,
    height: 500,
    borderWidth: 1,
    borderRadius: 250,
  },

  ringMedium: {
    position: "absolute",
    width: 360,
    height: 360,
    borderWidth: 1,
    borderRadius: 180,
  },

  ringSmall: {
    position: "absolute",
    width: 240,
    height: 240,
    borderWidth: 1,
    borderRadius: 120,
  },

  /*
  ==============================================================
  PORTRAIT
  ==============================================================
  */

  portraitContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
  },

  contentBlock: {
    width: "100%",
    maxWidth: 600,
    alignItems: "center",
  },

  /*
  ==============================================================
  LANDSCAPE
  ==============================================================
  */

  landscapeContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 45,
  },

  landscapeLeft: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  landscapeRight: {
    flex: 1.25,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
  },

  /*
  ==============================================================
  LOGO
  ==============================================================
  */

  logoCard: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 36,
    backgroundColor: "#FFFFFF",
  },

  logoCardInner: {
    width: "82%",
    height: "82%",

    alignItems: "center",
    justifyContent: "center",

    borderRadius: 28,

    backgroundColor: "#F8FAFC",
  },

  /*
  ==============================================================
  GREETING
  ==============================================================
  */

  greeting: {
    marginTop: 22,

    color: "#5F6B7A",

    fontSize: 16,
    lineHeight: 22,

    fontWeight: "500",

    letterSpacing: 0.15,

    textAlign: "center",
  },

  /*
  ==============================================================
  EYEBROW
  ==============================================================
  */

  eyebrow: {
    marginTop: 28,

    color: "#8A94A3",

    fontSize: 11,
    lineHeight: 16,

    fontWeight: "700",

    letterSpacing: 2.2,

    textAlign: "center",
  },

  /*
  ==============================================================
  COMPANY NAME
  ==============================================================
  */

  companyName: {
    marginTop: 9,
    maxWidth: 620,
    color: "#172033",
    fontSize: 20,
    lineHeight: 39,
    fontWeight: "700",

    letterSpacing: -0.5,

    textAlign: "center",
  },

  /*
  ==============================================================
  ACCENT LINE
  ==============================================================
  */

  lineWrapper: {
    width: 72,
    height: 3,

    marginTop: 19,

    borderRadius: 3,

    backgroundColor: "#E8EDF3",

    overflow: "hidden",
  },

  line: {
    height: 3,

    borderRadius: 3,
  },

  /*
  ==============================================================
  SUBTITLE
  ==============================================================
  */

  subtitle: {
    marginTop: 18,

    maxWidth: 500,

    color: "#7A8492",

    fontSize: 14,
    lineHeight: 21,

    fontWeight: "400",

    letterSpacing: 0.1,

    textAlign: "center",
  },

  /*
  ==============================================================
  LOADING
  ==============================================================
  */

  loadingContainer: {
    flexDirection: "row",

    alignItems: "center",
    justifyContent: "center",

    marginTop: 27,

    height: 12,
  },

  loadingDot: {
    width: 5,
    height: 5,

    borderRadius: 3,
  },

  loadingDotCenter: {
    width: 7,
    height: 7,

    borderRadius: 4,

    marginHorizontal: 5,
  },

  /*
  ==============================================================
  FOOTER
  ==============================================================
  */

  footer: {
    position: "absolute",

    left: 0,
    right: 0,
    bottom: 27,

    alignItems: "center",
    justifyContent: "center",
  },

  footerLine: {
    width: 42,
    height: 1,

    marginBottom: 10,

    borderRadius: 1,
  },

  footerText: {
    color: "#98A1AE",

    fontSize: 9,
    lineHeight: 14,

    fontWeight: "600",

    letterSpacing: 1.5,

    textAlign: "center",
  },

  footerBrand: {
    fontWeight: "800",

    letterSpacing: 1.5,
  },
});

export default CustomSplashScreen;