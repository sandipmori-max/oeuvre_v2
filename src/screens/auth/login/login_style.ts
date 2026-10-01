import { Dimensions, Platform, StyleSheet } from 'react-native';
import { ERP_COLOR_CODE } from '../../../utils/constants';

export const styles = StyleSheet.create({
  container: {
    backgroundColor: ERP_COLOR_CODE.ERP_WHITE,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  formContainer: {
    borderRadius: 12,
    height: Dimensions.get('screen').height,
    padding: 16,
    flex: 1, 
    justifyContent: 'center',
  },
  helperText: {
    fontSize: 12,
    color: ERP_COLOR_CODE.ERP_888,
    marginTop: 4,
    marginLeft: 2,
  },
  logo: {
    marginTop: 4,
    width: 100,
    height: 100,
    alignSelf: 'center',
    marginBottom: 25,
    borderRadius: 20,
  },
  title: {
    fontSize: 28, 
    textAlign: 'center',
    marginBottom: 6,
    color: ERP_COLOR_CODE.ERP_333,
    fontFamily: "Handlee-Regular",
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    color: ERP_COLOR_CODE.ERP_666,
  },
  inputContainer: {
    marginBottom: Platform.OS ==='android' ? 6 : 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: ERP_COLOR_CODE.ERP_444,
    marginBottom: Platform.OS === 'android' ? 4 : 6,
  },
  input: { 
    padding: 15,
    borderRadius: 10,
    fontSize: 16,
    color: ERP_COLOR_CODE.ERP_333,
  },
  errorText: {
    color: ERP_COLOR_CODE.ERP_ERROR,
    fontSize: 13,
    marginTop: Platform.OS === 'android' ? 2 : 5,
  },
  errorContainer: {
    borderColor: ERP_COLOR_CODE.ERP_ERROR,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
  },
  loginButton: {
    backgroundColor: ERP_COLOR_CODE.ERP_APP_COLOR,
    padding:  14,
    borderRadius: 8,
    marginBottom: 20, 
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#FFF'
  },
  errorButton: {
    backgroundColor: ERP_COLOR_CODE.ERP_DE_ACTIVE_BUTTON,
    padding: 16,
    borderRadius: 10,
    marginBottom: 20,
  },
  disabledButton: {
    backgroundColor: ERP_COLOR_CODE.ERP_BORDER_LINE,
    shadowOpacity: 0,
  },
  loginButtonText: {
    color: '#FFF',
    fontSize: 16, 
    textAlign: 'center',

  },
  cancelButton: {
    backgroundColor: ERP_COLOR_CODE.ERP_f0f0f0,
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  cancelButtonText: {
    color: ERP_COLOR_CODE.ERP_666,
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
