import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Animated, Platform } from 'react-native';
import { Formik } from 'formik';
import { getMessaging } from '@react-native-firebase/messaging';

 import { styles } from '../login_style';
import { useApi } from '../../../../hooks/useApi';
import { DevERPService } from '../../../../services/api';
import { LoginFormProps } from '../types';
import useTranslations from '../../../../hooks/useTranslations';
import ERPTextInput from '../../../../components/input/ERPTextInput';
import ERPButton from '../../../../components/button/ERPButton';
import useFcmToken from '../../../../hooks/useFcmToken';
import { ERP_COLOR_CODE } from '../../../../utils/constants';
import { erpAddAccountValidationSchema } from '../../../../utils/validations/add_accounts';
import TranslatedText from '../../../dashboard/tabs/home/TranslatedText';
import DeviceInfo from "react-native-device-info";

const LoginForm: React.FC<LoginFormProps> = ({
  deviceId,
  isLoading,
  onLoginSuccess,
  showAlert,
}) => {
  const { t } = useTranslations();
  const { token: fcmToken } = useFcmToken();

  const [isApiLoading, setIsApiLoading] = useState(false)

  const [focusedField, setFocusedField] = useState<string | null>(null);
 const isIpad =
   ( Platform.OS === "ios" && Platform.isPad) || DeviceInfo.isTablet() || Platform.isTV;
  const {
    execute: validateCompanyCode,
    loading: validationLoading,
    error: validationError,
  } = useApi();

  const {
    execute: loginWithERP,
    loading: erpLoginLoading,
    error: erpLoginError,
  } = useApi();

  const fadeAnims = [
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
  ];
  const buttonScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.stagger(
      200,
      fadeAnims.map(anim =>
        Animated.timing(anim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ),
    ).start();
  }, []);

  useEffect(() => {
    if (!isLoading && !validationLoading && !erpLoginLoading) {
      Animated.spring(buttonScale, {
        toValue: 1.05,
        friction: 3,
        useNativeDriver: true,
      }).start(() => {
        Animated.spring(buttonScale, {
          toValue: 1,
          friction: 3,
          useNativeDriver: true,
        }).start();
      });
    }
  }, [isLoading, validationLoading, erpLoginLoading]);

  const initialFormValues = {
    company_code: '',
    user: '',
    password: '',
    firebaseid: fcmToken,
    device: deviceId,
  };

 const handleLoginSubmit = async (values: typeof initialFormValues) => {
   if(isApiLoading){
      return;
    }
    setIsApiLoading(true)
    try {
      const companyValidation = await validateCompanyCode(() =>
        DevERPService.validateCompanyCode(values.company_code),
      );

      if (!companyValidation?.isValid) return;

      let currentFcmToken = '';
      const androidVersion = parseInt(DeviceInfo.getSystemVersion(), 10);
     
      if(androidVersion <= 9  && Platform.OS !== 'ios'){
        currentFcmToken= fcmToken || (await getMessaging().getToken()) || '';
      }else if (androidVersion >= 10  && Platform.OS !== 'ios'){
         currentFcmToken= fcmToken || (await getMessaging().getToken()) || '';
      } else {
        currentFcmToken= '';
      }
        

      DevERPService.setDevice(deviceId);

      const loginResult = await loginWithERP(() =>
        DevERPService.loginToERP({
          user: values?.user,
          pass: values?.password,
          firebaseid: currentFcmToken || '',
        }),
      );
      if (loginResult?.success === 1) {
        await DevERPService.getAuth();
        await onLoginSuccess(
          values?.company_code,
          values?.password,
          { user: values?.user, name: values?.user },
          loginResult,
          companyValidation,
        );
      } else {
        showAlert({
          title: t('test4'),
          message: loginResult?.message || t('auth.loginFailed'),
          type: 'error',
        });
      }
    } catch(e) {
      showAlert({
          title: t('test4'),
          message: e?.toString() || t('auth.loginFailed'),
          type: 'error',
        });
      console.log("error --------------------- ", e)
    } finally {
      setIsApiLoading(false)
    }
  };
  
  return (
    <>
      {(validationError || erpLoginError) && (
        <View style={styles.errorContainer}>
          {!!validationError && <TranslatedText
          numberOfLines={1}
          text={validationError}
          style={styles.errorText}></TranslatedText>}
          {!!erpLoginError && <TranslatedText 
          numberOfLines={1}
          text={erpLoginError}
          style={styles.errorText}></TranslatedText>}
        </View>
      )}

      <Formik
        initialValues={initialFormValues}
        validationSchema={erpAddAccountValidationSchema(t)}
        onSubmit={handleLoginSubmit}
      >
        {({ handleChange, handleBlur, values, errors, touched, handleSubmit }) => (
          <>
            {['company_code', 'user', 'password'].map((field, index) => (
              <Animated.View
                key={field}
                style={{
                  opacity: fadeAnims[index],
                  transform: [
                    {
                      translateY: fadeAnims[index].interpolate({
                        inputRange: [0, 1],
                        outputRange: [20, 0],
                      }),
                    },
                  ],
                }}
              >
                <ERPTextInput
                  label={t(`auth.${field === 'company_code' ? 'companyCode' : field}`)}
                  placeholder={t(
                    `auth.${
                      field === 'company_code'
                        ? 'enterCompanyCode'
                        : field === 'user'
                        ? 'enterUser'
                        : 'enterPassword'
                    }`,
                  )}
                  isInputEdit={focusedField === field}
                  field={field}
                  placeholderTextColor={ERP_COLOR_CODE.ERP_999}
                  autoCapitalize="none"
                  secureTextEntry={field === 'password'}
                  showToggle={field === 'password'}
                  onChangeText={handleChange(field)}
                  onFocus={() => setFocusedField(field)} 
                  onBlur={() => {
                    handleBlur(field);
                    setFocusedField(null);
                  }}
                  value={values[field as keyof typeof values] as string}
                  error={errors[field as keyof typeof errors]}
                  touched={touched[field as keyof typeof touched]}
                  containerStyle={styles.inputContainer}
                  labelStyle={styles.inputLabel}
                  inputStyle={styles.input}
                  errorStyle={styles.errorText}
                />
              </Animated.View>
            ))}

            <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
              <ERPButton
                text={
                  isLoading || validationLoading || erpLoginLoading
                    ? t('auth.signingIn')
                    : t('auth.signIn')
                }
                isLoading={isLoading}
                 isApiLoading={isApiLoading}
                onPress={handleSubmit as any}
                color={
                  isLoading || validationLoading || erpLoginLoading
                    ? '#aaa'
                    : ERP_COLOR_CODE.ERP_COLOR
                }
                disabled={isLoading || validationLoading || erpLoginLoading}
                style={[styles.loginButton, {
                    backgroundColor: ERP_COLOR_CODE.ERP_APP_COLOR,
                },
                isIpad && {
                  paddingVertical: 18,
                }
              
              ]}
                textStyle={styles.loginButtonText}
              />
            </Animated.View>
          </>
        )}
      </Formik>
    </>
  );
};

export default LoginForm;
