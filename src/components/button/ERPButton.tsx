import React, { useRef } from 'react';
import { TouchableOpacity, Text, ActivityIndicator, Animated, Platform } from 'react-native';
import { ERPButtonProps } from './type';
import { styles } from './style';
import { ERP_COLOR_CODE } from '../../utils/constants';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import TranslatedText from '../../screens/dashboard/tabs/home/TranslatedText'; 

const ERPButton: React.FC<ERPButtonProps> = ({
  text = '',
  onPress,
  color = ERP_COLOR_CODE.ERP_COLOR,
  disabled = false,
  style,
  textStyle,
  activeOpacity = 0.8,
  isLoading,
  isApiLoading
}) => {
  
   
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

  return (
    <Animated.View
      style={{
        transform: [

          { scale: pressAnim },
        ],
      }}
    >
      <TouchableOpacity
        style={[styles.button, {
          flexDirection: 'row',
          justifyContent: 'center',
          gap: 8,
          backgroundColor: color, opacity: disabled ? 0.6 : 1
        }, style]}
        onPress={onPress}

        onPressIn={onPressIn}
        onPressOut={onPressOut}
        disabled={isApiLoading}
        activeOpacity={activeOpacity}
      >
        {
          isLoading && <ActivityIndicator size={'large'} color={'#fff'} />
        }
        <MaterialIcons name={'lock-outline'} color={'white'} size={20} />
        <TranslatedText
        text={text}
        numberOfLines={1}
        style={[styles.buttonText, textStyle]}></TranslatedText>
      </TouchableOpacity>
    </Animated.View>
  )
};

export default ERPButton;
