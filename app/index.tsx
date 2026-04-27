import { theme } from "@/src/styles/theme";
import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming
} from "react-native-reanimated";
import { useSelector } from "react-redux";
import CustomText from "../components/CustomText";
import { selectDbName } from "../src/store/userSlice";
import { FONTS } from "../src/styles/Fonts";

// Require the explicit logo image path
const Logo = require('../assets/icons/app_icon.png');

const { width } = Dimensions.get('window');
const isTablet = width >= 600;

export default function SplashScreen() {
  const router = useRouter();
  const dbName = useSelector(selectDbName);

  // Animation Values
  const rotation = useSharedValue(360);
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);
  const textOpacity = useSharedValue(0);
  const textTranslateY = useSharedValue(20);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (dbName) {
        router.replace('/mode');
      } else {
        router.replace('/login');
      }
    }, 2500);

    return () => clearTimeout(timer);
  }, [dbName]);

  useEffect(() => {
    rotation.value = withTiming(0, { duration: 1000 });
    scale.value = withTiming(1, { duration: 1000 });
    opacity.value = withTiming(1, { duration: 1000 });
    textOpacity.value = withDelay(500, withTiming(1, { duration: 1000 }));
    textTranslateY.value = withDelay(500, withTiming(0, { duration: 1000 }));
  }, [rotation, scale, opacity, textOpacity, textTranslateY]);

  const pinwheelStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { rotate: `${rotation.value}deg` },
      { scale: scale.value },
    ],
  }));

  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [{ translateY: textTranslateY.value }],
  }));

  return (
    <View style={styles.container}>
      <Animated.Image source={Logo} style={[styles.logo, pinwheelStyle]} />

      <Animated.View style={textStyle}>
        <CustomText
          fontFamily={FONTS.Bold}
          color="#333333"
          style={{ fontSize: theme.fontSize.headingXX }}
        >
          Devourin
        </CustomText>
      </Animated.View>

      <Animated.View style={[styles.tagline, textStyle]}>
        <CustomText
          fontFamily={FONTS.Regular}
          color="#666666"
          style={{ fontSize: theme.fontSize.medium }}
        >
          Digitizing Restaurants Globally
        </CustomText>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    width: isTablet ? width * 0.2 : width * 0.4,
    height: isTablet ? width * 0.2 : width * 0.4,
    marginBottom: 20,
    resizeMode: 'contain',
  },
  heading: {
    fontSize: 42,
    fontWeight: 'bold',
    color: "#333333",
    letterSpacing: 2,
  },
  tagline: {
    marginTop: 8,
  },
  subheading: {
    fontSize: 16,
    color: "#666666",
    fontWeight: '500',
    letterSpacing: 1,
  }
});
