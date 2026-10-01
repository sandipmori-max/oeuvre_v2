// import React, {useState} from 'react';

// import {
//   View,
//   StyleSheet,
//   Text,
// } from 'react-native';

// import {
//   Camera,
//   useCameraDevice,
//   useFrameProcessor,
// } from 'react-native-vision-camera';

// import {useTextRecognition} from 'react-native-vision-camera-text-recognition';

// const TextScanner = () => {
//   const device = useCameraDevice('back');

//   const [text, setText] = useState('');

//   const {scanText} = useTextRecognition({
//     language: 'latin',
//   });

//   const frameProcessor = useFrameProcessor(
//     frame => {
//       'worklet';

//       const result = scanText(frame);

//       console.log('OCR RESULT:', result);
//     },
//     [scanText],
//   );

//   if (device == null) {
//     return null;
//   }

//   return (
//     <View style={styles.container}>
//       <Camera
//         style={StyleSheet.absoluteFill}
//         device={device}
//         isActive={true}
//         frameProcessor={frameProcessor}
//       />

//       <View style={styles.overlay}>
//         <Text style={styles.text}>
//           {text || 'Point camera at text'}
//         </Text>
//       </View>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     height: 150,
//     width: 150,
//     backgroundColor:'red'
//   },

//   overlay: {
//     position: 'absolute',
//     bottom: 30,
//     left: 20,
//     right: 20,
//     padding: 15,
//     backgroundColor: '#fff',
//     borderRadius: 10,
//   },

//   text: {
//     fontSize: 16,
//     color: '#000',
//   },
// });

// export default TextScanner;