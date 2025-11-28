/**
 * NativeBridge App - Production Android Testing Application
 *
 * Features:
 * ✅ UI Components (buttons, inputs, switches, scrolling)
 * ✅ Network Operations (GET, POST, download, upload)
 * ✅ Performance Testing (CPU intensive, Memory intensive)
 * ✅ Permissions (Camera, Location, Contacts, Storage)
 * ✅ Device Access (Vibration, Linking, Clipboard)
 * ✅ Storage (AsyncStorage simulation)
 * ✅ File Operations (Upload, Save CSV, File Management)
 * ✅ Biometric Authentication (optional testing)
 * ✅ QR Code Scanning with Camera Injection Support
 * ✅ Comprehensive Logging
 */

import React, { useState } from 'react';
import {
  StatusBar,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  Switch,
  Platform,
  ToastAndroid,
  PermissionsAndroid,
  Linking,
  Vibration,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import DocumentPicker from 'react-native-document-picker';
import RNFS from 'react-native-fs';
import ReactNativeBiometrics from 'react-native-biometrics';
import { RNCamera } from 'react-native-camera';

// Logging helper with timestamps and categories
const logEvent = (category: string, message: string) => {
  const timestamp = new Date().toISOString();
  const logMessage = `[NativeBridge][${category}] ${timestamp}: ${message}`;
  console.log(logMessage);

  if (Platform.OS === 'android') {
    ToastAndroid.show(`${category}: ${message}`, ToastAndroid.SHORT);
  }
};

function App() {
  // ==================== AUTHENTICATION STATE ====================
  // No longer required on app launch - app opens directly

  // Tab state
  const [activeTab, setActiveTab] = useState('ui');

  // UI Tab state
  const [textInput, setTextInput] = useState('');
  const [buttonPressCount, setButtonPressCount] = useState(0);
  const [switchValue, setSwitchValue] = useState(false);

  // Network Tab state
  const [networkStatus, setNetworkStatus] = useState('');
  const [networkData, setNetworkData] = useState('');

  // Performance Tab state
  const [performanceResult, setPerformanceResult] = useState('');
  const [isPerformanceLoading, setIsPerformanceLoading] = useState(false);

  // Storage Tab state
  const [storageData, setStorageData] = useState('');
  const [clipboardText, setClipboardText] = useState('');

  // Simple in-memory storage (simulating AsyncStorage)
  const [inMemoryStorage, setInMemoryStorage] = useState<{[key: string]: string}>({});

  // Files Tab state
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [savedFiles, setSavedFiles] = useState<string[]>([]);
  const [fileOperationStatus, setFileOperationStatus] = useState('');

  // Biometric Tab state
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricType, setBiometricType] = useState('');
  const [biometricStatus, setBiometricStatus] = useState('');

  // Camera/QR Tab state
  const [showCamera, setShowCamera] = useState(false);
  const [qrData, setQrData] = useState('');
  const [lastScannedQR, setLastScannedQR] = useState('');


  // ==================== UI TAB HANDLERS ====================

  const handleButtonPress = () => {
    logEvent('UI', `Button pressed - count: ${buttonPressCount + 1}`);
    setButtonPressCount(buttonPressCount + 1);
    Alert.alert('Button Pressed', `Count: ${buttonPressCount + 1}`);
  };

  const handleLongPress = () => {
    logEvent('UI', 'Long press detected');
    Vibration.vibrate(100);
    Alert.alert('Long Press', 'You performed a long press!');
  };

  const handleSwitchToggle = (value: boolean) => {
    logEvent('UI', `Switch toggled to: ${value}`);
    setSwitchValue(value);
  };

  // ==================== NETWORK TAB HANDLERS ====================

  const handleNetworkGet = async () => {
    try {
      logEvent('NETWORK', 'Starting GET request to JSONPlaceholder');
      setNetworkStatus('Downloading...');

      const response = await fetch('https://jsonplaceholder.typicode.com/posts/1');
      const data = await response.json();

      setNetworkData(JSON.stringify(data, null, 2));
      setNetworkStatus(`✓ Downloaded: ${data.title}`);
      logEvent('NETWORK', `GET request successful. Title: ${data.title}`);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      setNetworkStatus(`✗ Error: ${errorMsg}`);
      logEvent('NETWORK', `GET request failed: ${errorMsg}`);
    }
  };

  const handleNetworkPost = async () => {
    try {
      logEvent('NETWORK', 'Starting POST request to JSONPlaceholder');
      setNetworkStatus('Uploading...');

      const postData = {
        title: 'NativeBridge Test',
        body: 'Test data from NativeBridge app',
        userId: 1,
      };

      const response = await fetch('https://jsonplaceholder.typicode.com/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData),
      });

      const data = await response.json();
      setNetworkData(JSON.stringify(data, null, 2));
      setNetworkStatus(`✓ Uploaded: Created post ID ${data.id}`);
      logEvent('NETWORK', `POST request successful. Created ID: ${data.id}`);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      setNetworkStatus(`✗ Error: ${errorMsg}`);
      logEvent('NETWORK', `POST request failed: ${errorMsg}`);
    }
  };

  // ==================== PERFORMANCE TAB HANDLERS ====================

  // CPU intensive: Recursive Fibonacci
  const fibonacci = (n: number): number => {
    if (n <= 1) return n;
    return fibonacci(n - 1) + fibonacci(n - 2);
  };

  const handleCPUTest = () => {
    logEvent('PERFORMANCE', 'Starting CPU intensive test (Fibonacci 40)');
    setPerformanceResult('');
    setIsPerformanceLoading(true);

    setTimeout(() => {
      const startTime = Date.now();
      const result = fibonacci(40);
      const endTime = Date.now();
      const duration = endTime - startTime;

      const resultText = `Fibonacci(40) = ${result}\nTime: ${duration}ms`;
      setPerformanceResult(resultText);
      setIsPerformanceLoading(false);
      logEvent('PERFORMANCE', `CPU test completed in ${duration}ms`);
    }, 100);
  };

  const handleMemoryTest = () => {
    logEvent('PERFORMANCE', 'Starting Memory intensive test (sorting 1M elements)');
    setPerformanceResult('');
    setIsPerformanceLoading(true);

    setTimeout(() => {
      const startTime = Date.now();
      const largeArray = Array.from({ length: 1000000 }, () => Math.random());
      largeArray.sort((a, b) => a - b);
      const endTime = Date.now();
      const duration = endTime - startTime;

      const resultText = `Sorted 1,000,000 elements\nTime: ${duration}ms\nMemory used: ~${(largeArray.length * 8 / 1024 / 1024).toFixed(2)}MB`;
      setPerformanceResult(resultText);
      setIsPerformanceLoading(false);
      logEvent('PERFORMANCE', `Memory test completed in ${duration}ms`);
    }, 100);
  };

  // ==================== PERMISSIONS TAB HANDLERS ====================

  const requestCameraPermission = async () => {
    try {
      logEvent('PERMISSION', 'Requesting camera permission');
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        {
          title: 'Camera Permission',
          message: 'NativeBridge needs access to your camera',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        }
      );

      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        logEvent('PERMISSION', 'Camera permission granted');
        Alert.alert('Permission Granted', 'Camera access granted');
      } else {
        logEvent('PERMISSION', 'Camera permission denied');
        Alert.alert('Permission Denied', 'Camera access denied');
      }
    } catch (error) {
      logEvent('PERMISSION', `Camera permission error: ${error}`);
    }
  };

  const requestLocationPermission = async () => {
    try {
      logEvent('PERMISSION', 'Requesting location permission');
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Permission',
          message: 'NativeBridge needs access to your location',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        }
      );

      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        logEvent('PERMISSION', 'Location permission granted');
        Alert.alert('Permission Granted', 'Location access granted');
      } else {
        logEvent('PERMISSION', 'Location permission denied');
        Alert.alert('Permission Denied', 'Location access denied');
      }
    } catch (error) {
      logEvent('PERMISSION', `Location permission error: ${error}`);
    }
  };

  const requestStoragePermission = async () => {
    try {
      logEvent('PERMISSION', 'Requesting storage permission');
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        {
          title: 'Storage Permission',
          message: 'NativeBridge needs access to your storage',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        }
      );

      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        logEvent('PERMISSION', 'Storage permission granted');
        Alert.alert('Permission Granted', 'Storage access granted');
      } else {
        logEvent('PERMISSION', 'Storage permission denied');
        Alert.alert('Permission Denied', 'Storage access denied');
      }
    } catch (error) {
      logEvent('PERMISSION', `Storage permission error: ${error}`);
    }
  };

  const requestContactsPermission = async () => {
    try {
      logEvent('PERMISSION', 'Requesting contacts permission');
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_CONTACTS,
        {
          title: 'Contacts Permission',
          message: 'NativeBridge needs access to your contacts',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        }
      );

      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        logEvent('PERMISSION', 'Contacts permission granted');
        Alert.alert('Permission Granted', 'Contacts access granted');
      } else {
        logEvent('PERMISSION', 'Contacts permission denied');
        Alert.alert('Permission Denied', 'Contacts access denied');
      }
    } catch (error) {
      logEvent('PERMISSION', `Contacts permission error: ${error}`);
    }
  };

  // System Feature Handlers
  const handleVibration = () => {
    logEvent('SYSTEM', 'Triggering vibration pattern');
    Vibration.vibrate([0, 100, 200, 100, 200]);
    Alert.alert('Vibration', 'Device vibrating with pattern');
  };

  const handleOpenBrowser = () => {
    const url = 'https://www.google.com';
    logEvent('SYSTEM', `Opening browser: ${url}`);
    Linking.openURL(url).catch((err) => {
      logEvent('SYSTEM', `Failed to open URL: ${err}`);
    });
  };

  const handleMakePhoneCall = () => {
    const phoneNumber = 'tel:1234567890';
    logEvent('SYSTEM', `Initiating phone call to: ${phoneNumber}`);
    Linking.openURL(phoneNumber).catch((err) => {
      logEvent('SYSTEM', `Failed to make call: ${err}`);
    });
  };

  const handleSendEmail = () => {
    const email = 'mailto:test@example.com?subject=Test&body=Hello';
    logEvent('SYSTEM', `Opening email client: ${email}`);
    Linking.openURL(email).catch((err) => {
      logEvent('SYSTEM', `Failed to open email: ${err}`);
    });
  };

  // ==================== STORAGE TAB HANDLERS ====================

  const handleCopyToClipboard = () => {
    const textToCopy = textInput || 'NativeBridge Test Data';
    Clipboard.setString(textToCopy);
    logEvent('CLIPBOARD', `Copied to clipboard: ${textToCopy}`);
    Alert.alert('Copied', `"${textToCopy}" copied to clipboard`);
  };

  const handlePasteFromClipboard = async () => {
    try {
      const text = await Clipboard.getString();
      setClipboardText(text);
      logEvent('CLIPBOARD', `Pasted from clipboard: ${text}`);
      Alert.alert('Pasted', `Clipboard content: "${text}"`);
    } catch (error) {
      logEvent('CLIPBOARD', `Failed to read clipboard: ${error}`);
      Alert.alert('Error', 'Failed to read from clipboard');
    }
  };

  const handleSaveToStorage = () => {
    const key = 'testData';
    const value = textInput || 'Default test data';
    setInMemoryStorage({ ...inMemoryStorage, [key]: value });
    logEvent('STORAGE', `Saved to storage - Key: ${key}, Value: ${value}`);
    Alert.alert('Saved', `Data saved: "${value}"`);
  };

  const handleLoadFromStorage = () => {
    const key = 'testData';
    const value = inMemoryStorage[key] || 'No data found';
    setStorageData(value);
    logEvent('STORAGE', `Loaded from storage - Key: ${key}, Value: ${value}`);
    Alert.alert('Loaded', `Data loaded: "${value}"`);
  };

  const handleClearStorage = () => {
    setInMemoryStorage({});
    setStorageData('');
    logEvent('STORAGE', 'Storage cleared');
    Alert.alert('Cleared', 'All storage data cleared');
  };

  // ==================== FILES TAB HANDLERS ====================

  const handleFilePicker = async () => {
    try {
      logEvent('FILES', 'Opening file picker');
      setFileOperationStatus('Opening file picker...');

      const result = await DocumentPicker.pick({
        type: [DocumentPicker.types.allFiles],
        allowMultiSelection: false,
      });

      if (result && result.length > 0) {
        const file = result[0];
        setUploadedFiles([...uploadedFiles, file]);
        setFileOperationStatus(`✓ File uploaded: ${file.name}`);
        logEvent('FILES', `File picked: ${file.name}, Size: ${file.size} bytes, Type: ${file.type}`);
        Alert.alert('File Uploaded', `${file.name}\nSize: ${(file.size! / 1024).toFixed(2)} KB`);
      }
    } catch (error) {
      if (DocumentPicker.isCancel(error)) {
        logEvent('FILES', 'File picker cancelled');
        setFileOperationStatus('File picker cancelled');
      } else {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        logEvent('FILES', `File picker error: ${errorMsg}`);
        setFileOperationStatus(`✗ Error: ${errorMsg}`);
        Alert.alert('Error', `Failed to pick file: ${errorMsg}`);
      }
    }
  };

  const handleSaveCSV = async () => {
    try {
      logEvent('FILES', 'Generating and saving CSV file');
      setFileOperationStatus('Generating CSV...');

      // Request storage permissions
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          Alert.alert('Permission Denied', 'Storage permission is required to save files');
          return;
        }
      }

      // Generate sample CSV data
      const csvData = `Name,Value,Timestamp
Test Data 1,${Math.random().toFixed(2)},${new Date().toISOString()}
Test Data 2,${Math.random().toFixed(2)},${new Date().toISOString()}
Test Data 3,${Math.random().toFixed(2)},${new Date().toISOString()}
Test Data 4,${Math.random().toFixed(2)},${new Date().toISOString()}
Test Data 5,${Math.random().toFixed(2)},${new Date().toISOString()}`;

      // Create filename with timestamp
      const timestamp = new Date().getTime();
      const filename = `nativebridge_data_${timestamp}.csv`;
      const path = `${RNFS.DownloadDirectoryPath}/${filename}`;

      // Write file
      await RNFS.writeFile(path, csvData, 'utf8');

      setSavedFiles([...savedFiles, filename]);
      setFileOperationStatus(`✓ CSV saved: ${filename}`);
      logEvent('FILES', `CSV file saved: ${path}`);
      Alert.alert('File Saved', `CSV file saved to:\n${path}`);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      logEvent('FILES', `Save CSV error: ${errorMsg}`);
      setFileOperationStatus(`✗ Error: ${errorMsg}`);
      Alert.alert('Error', `Failed to save CSV: ${errorMsg}`);
    }
  };

  const handleListSavedFiles = async () => {
    try {
      logEvent('FILES', 'Listing saved files in Downloads');
      setFileOperationStatus('Reading files...');

      const downloadPath = RNFS.DownloadDirectoryPath;
      const files = await RNFS.readDir(downloadPath);

      // Filter for CSV files created by this app
      const csvFiles = files
        .filter(file => file.name.startsWith('nativebridge_') && file.name.endsWith('.csv'))
        .map(file => file.name);

      setSavedFiles(csvFiles);
      setFileOperationStatus(`✓ Found ${csvFiles.length} saved file(s)`);
      logEvent('FILES', `Found ${csvFiles.length} saved CSV files`);

      if (csvFiles.length === 0) {
        Alert.alert('No Files', 'No saved CSV files found in Downloads folder');
      } else {
        Alert.alert('Saved Files', `Found ${csvFiles.length} file(s):\n${csvFiles.slice(0, 5).join('\n')}`);
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      logEvent('FILES', `List files error: ${errorMsg}`);
      setFileOperationStatus(`✗ Error: ${errorMsg}`);
      Alert.alert('Error', `Failed to list files: ${errorMsg}`);
    }
  };

  const handleClearUploadedFiles = () => {
    setUploadedFiles([]);
    setFileOperationStatus('Uploaded files list cleared');
    logEvent('FILES', 'Cleared uploaded files list');
    Alert.alert('Cleared', 'Uploaded files list cleared');
  };

  const handleDeleteSavedFile = async (filename: string) => {
    try {
      const path = `${RNFS.DownloadDirectoryPath}/${filename}`;
      await RNFS.unlink(path);
      setSavedFiles(savedFiles.filter(f => f !== filename));
      setFileOperationStatus(`✓ Deleted: ${filename}`);
      logEvent('FILES', `Deleted file: ${filename}`);
      Alert.alert('Deleted', `File deleted: ${filename}`);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      logEvent('FILES', `Delete file error: ${errorMsg}`);
      Alert.alert('Error', `Failed to delete file: ${errorMsg}`);
    }
  };

  // ==================== BIOMETRIC TAB HANDLERS ====================

  const checkBiometricAvailability = async () => {
    try {
      logEvent('BIOMETRIC', 'Checking biometric sensor availability');
      setBiometricStatus('Checking...');

      // Try with allowDeviceCredentials option for broader compatibility
      const rnBiometrics = new ReactNativeBiometrics({
        allowDeviceCredentials: true
      });

      const result = await rnBiometrics.isSensorAvailable();
      const { available, biometryType } = result;

      // Log to both app events and console (visible in adb logcat)
      console.log('[BIOMETRIC DEBUG] Full result:', JSON.stringify(result));
      console.log('[BIOMETRIC DEBUG] available:', available);
      console.log('[BIOMETRIC DEBUG] biometryType:', biometryType);

      logEvent('BIOMETRIC', `Full result: ${JSON.stringify(result)}`);

      setBiometricAvailable(available);

      let typeStr = 'None';
      // Handle all possible biometry types
      if (biometryType === 'Biometrics') {
        typeStr = 'Fingerprint/Biometrics';
      } else if (biometryType === 'FaceID') {
        typeStr = 'Face ID';
      } else if (biometryType === 'TouchID' || biometryType === 'Fingerprint') {
        typeStr = 'Touch ID/Fingerprint';
      } else if (biometryType) {
        // If we get any other non-null value, show it
        typeStr = biometryType;
      }

      setBiometricType(typeStr);

      logEvent('BIOMETRIC', `Raw biometryType: ${biometryType}, available: ${available}`);

      if (available) {
        setBiometricStatus(`✓ Available: ${typeStr}`);
        logEvent('BIOMETRIC', `Biometric available: ${typeStr}`);
        Alert.alert('Biometric Available', `Type: ${typeStr}\n\nYou can now use the authentication button below.`);
      } else {
        setBiometricStatus('✗ No biometric sensor available');
        logEvent('BIOMETRIC', `No biometric sensor available (biometryType: ${biometryType})`);

        // More detailed error message
        let errorDetail = 'No biometric sensor found on this device.';
        if (biometryType === null || biometryType === undefined) {
          errorDetail += '\n\nPossible reasons:\n1. No fingerprint enrolled in device Settings > Security > Fingerprint\n2. Biometric hardware not detected\n3. Device security not set up (PIN/Pattern/Password required first)';
        }

        Alert.alert('Not Available', errorDetail);
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      setBiometricStatus(`✗ Error: ${errorMsg}`);
      logEvent('BIOMETRIC', `Check availability error: ${errorMsg}`);

      // Check if it's a common error
      let userMessage = `Failed to check biometric: ${errorMsg}`;
      if (errorMsg.includes('not available')) {
        userMessage = 'Biometric authentication is not available on this device.\n\nPlease check:\n1. Set up a screen lock (PIN/Pattern/Password) in Settings\n2. Enroll at least one fingerprint in Settings > Security\n3. Restart the app after enrollment';
      }

      Alert.alert('Error', userMessage);
    }
  };

  const handleBiometricAuth = async () => {
    try {
      logEvent('BIOMETRIC', 'Starting biometric authentication');
      setBiometricStatus('Authenticating...');

      const rnBiometrics = new ReactNativeBiometrics();
      const { success } = await rnBiometrics.simplePrompt({
        promptMessage: 'Authenticate with Biometrics',
        cancelButtonText: 'Cancel',
      });

      if (success) {
        setBiometricStatus('✓ Authentication successful!');
        logEvent('BIOMETRIC', 'Authentication successful');
        Alert.alert('Success', 'Biometric authentication successful!');
      } else {
        setBiometricStatus('✗ Authentication failed');
        logEvent('BIOMETRIC', 'Authentication failed or cancelled');
        Alert.alert('Failed', 'Biometric authentication failed or cancelled');
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      setBiometricStatus(`✗ Error: ${errorMsg}`);
      logEvent('BIOMETRIC', `Authentication error: ${errorMsg}`);
      Alert.alert('Error', `Failed to authenticate: ${errorMsg}`);
    }
  };

  const createBiometricKeys = async () => {
    try {
      logEvent('BIOMETRIC', 'Creating biometric keys');
      setBiometricStatus('Creating keys...');

      const rnBiometrics = new ReactNativeBiometrics();
      const { publicKey } = await rnBiometrics.createKeys();

      setBiometricStatus('✓ Keys created successfully');
      logEvent('BIOMETRIC', `Keys created. Public key: ${publicKey.substring(0, 50)}...`);
      Alert.alert('Keys Created', `Public Key (truncated):\n${publicKey.substring(0, 100)}...`);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      setBiometricStatus(`✗ Error: ${errorMsg}`);
      logEvent('BIOMETRIC', `Create keys error: ${errorMsg}`);
      Alert.alert('Error', `Failed to create keys: ${errorMsg}`);
    }
  };

  const deleteBiometricKeys = async () => {
    try {
      logEvent('BIOMETRIC', 'Deleting biometric keys');
      setBiometricStatus('Deleting keys...');

      const rnBiometrics = new ReactNativeBiometrics();
      const { keysDeleted } = await rnBiometrics.deleteKeys();

      if (keysDeleted) {
        setBiometricStatus('✓ Keys deleted successfully');
        logEvent('BIOMETRIC', 'Keys deleted');
        Alert.alert('Success', 'Biometric keys deleted');
      } else {
        setBiometricStatus('✗ No keys to delete');
        logEvent('BIOMETRIC', 'No keys found to delete');
        Alert.alert('Info', 'No biometric keys found');
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      setBiometricStatus(`✗ Error: ${errorMsg}`);
      logEvent('BIOMETRIC', `Delete keys error: ${errorMsg}`);
      Alert.alert('Error', `Failed to delete keys: ${errorMsg}`);
    }
  };

  // ==================== CAMERA/QR TAB HANDLERS ====================

  const handleOpenCamera = async () => {
    try {
      logEvent('CAMERA', 'Opening camera for QR scanning');
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA
      );

      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        setShowCamera(true);
        setQrData('');
        logEvent('CAMERA', 'Camera opened successfully');
      } else {
        logEvent('CAMERA', 'Camera permission denied');
        Alert.alert('Permission Denied', 'Camera permission is required for QR scanning');
      }
    } catch (error) {
      logEvent('CAMERA', `Camera open error: ${error}`);
      Alert.alert('Error', 'Failed to open camera');
    }
  };

  const handleCloseCamera = () => {
    setShowCamera(false);
    logEvent('CAMERA', 'Camera closed');
  };

  const onBarCodeRead = (scanResult: any) => {
    if (scanResult.data && scanResult.data !== lastScannedQR) {
      setLastScannedQR(scanResult.data);
      setQrData(scanResult.data);
      logEvent('QR_SCAN', `QR Code scanned: ${scanResult.data}`);
      Alert.alert(
        'QR Code Scanned',
        `Data: ${scanResult.data}\nType: ${scanResult.type}`,
        [
          {
            text: 'OK',
            onPress: () => {
              // Reset after a delay to allow scanning again
              setTimeout(() => setLastScannedQR(''), 2000);
            },
          },
        ]
      );
      Vibration.vibrate(200);
    }
  };

  // ==================== RENDER FUNCTIONS ====================

  const renderTabBar = () => (
    <View style={styles.tabBar}>
      <TouchableOpacity
        style={[styles.tab, activeTab === 'ui' && styles.activeTab]}
        onPress={() => setActiveTab('ui')}
        testID="tab-ui"
      >
        <Text style={[styles.tabText, activeTab === 'ui' && styles.activeTabText]}>
          UI
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.tab, activeTab === 'network' && styles.activeTab]}
        onPress={() => setActiveTab('network')}
        testID="tab-network"
      >
        <Text style={[styles.tabText, activeTab === 'network' && styles.activeTabText]}>
          Network
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.tab, activeTab === 'performance' && styles.activeTab]}
        onPress={() => setActiveTab('performance')}
        testID="tab-performance"
      >
        <Text style={[styles.tabText, activeTab === 'performance' && styles.activeTabText]}>
          Perf
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.tab, activeTab === 'permissions' && styles.activeTab]}
        onPress={() => setActiveTab('permissions')}
        testID="tab-permissions"
      >
        <Text style={[styles.tabText, activeTab === 'permissions' && styles.activeTabText]}>
          Perms
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.tab, activeTab === 'storage' && styles.activeTab]}
        onPress={() => setActiveTab('storage')}
        testID="tab-storage"
      >
        <Text style={[styles.tabText, activeTab === 'storage' && styles.activeTabText]}>
          Storage
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.tab, activeTab === 'files' && styles.activeTab]}
        onPress={() => setActiveTab('files')}
        testID="tab-files"
      >
        <Text style={[styles.tabText, activeTab === 'files' && styles.activeTabText]}>
          Files
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.tab, activeTab === 'biometric' && styles.activeTab]}
        onPress={() => setActiveTab('biometric')}
        testID="tab-biometric"
      >
        <Text style={[styles.tabText, activeTab === 'biometric' && styles.activeTabText]}>
          Bio
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.tab, activeTab === 'camera' && styles.activeTab]}
        onPress={() => setActiveTab('camera')}
        testID="tab-camera"
      >
        <Text style={[styles.tabText, activeTab === 'camera' && styles.activeTabText]}>
          QR
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderUITab = () => (
    <ScrollView style={styles.tabContent}>
      {/* Button Testing */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Button Testing</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={handleButtonPress}
          onLongPress={handleLongPress}
          testID="test-button"
        >
          <Text style={styles.buttonText}>Tap Me (or Long Press)!</Text>
        </TouchableOpacity>
        <Text style={styles.infoText} testID="button-counter">
          Button pressed: {buttonPressCount} times
        </Text>
      </View>

      {/* Text Input Testing */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Text Input</Text>
        <TextInput
          style={styles.textInput}
          placeholder="Enter some text"
          value={textInput}
          onChangeText={setTextInput}
          testID="text-input"
        />
        <Text style={styles.infoText} testID="input-display">
          Current text: {textInput}
        </Text>
      </View>

      {/* Switch Testing */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Switch Testing</Text>
        <View style={styles.switchContainer}>
          <Text style={styles.label}>Toggle Switch:</Text>
          <Switch
            value={switchValue}
            onValueChange={handleSwitchToggle}
            testID="test-switch"
          />
        </View>
        <Text style={styles.infoText} testID="switch-status">
          Switch is: {switchValue ? 'ON' : 'OFF'}
        </Text>
      </View>

      {/* Scrollable Area */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Scrollable Area</Text>
        <ScrollView
          style={styles.scrollView}
          testID="scrollable-area"
          showsVerticalScrollIndicator={true}
        >
          {Array.from({ length: 20 }, (_, i) => (
            <View key={i} style={styles.scrollItem} testID={`scroll-item-${i}`}>
              <Text>Scrollable Item {i + 1}</Text>
            </View>
          ))}
        </ScrollView>
      </View>
    </ScrollView>
  );

  const renderNetworkTab = () => (
    <ScrollView style={styles.tabContent}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Network Operations</Text>

        <TouchableOpacity
          style={styles.button}
          onPress={handleNetworkGet}
          testID="network-get-button"
        >
          <Text style={styles.buttonText}>GET Request (Download)</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, {marginTop: 10}]}
          onPress={handleNetworkPost}
          testID="network-post-button"
        >
          <Text style={styles.buttonText}>POST Request (Upload)</Text>
        </TouchableOpacity>

        <Text style={[styles.sectionTitle, {marginTop: 20}]} testID="network-status">
          Status: {networkStatus || 'Ready'}
        </Text>

        {networkData ? (
          <ScrollView style={styles.dataDisplay}>
            <Text style={styles.dataText} testID="network-data">
              {networkData}
            </Text>
          </ScrollView>
        ) : null}
      </View>
    </ScrollView>
  );

  const renderPerformanceTab = () => (
    <ScrollView style={styles.tabContent}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Performance Testing</Text>

        <TouchableOpacity
          style={styles.button}
          onPress={handleCPUTest}
          testID="cpu-test-button"
          disabled={isPerformanceLoading}
        >
          <Text style={styles.buttonText}>Run CPU Test (Fibonacci 40)</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, {marginTop: 10}]}
          onPress={handleMemoryTest}
          testID="memory-test-button"
          disabled={isPerformanceLoading}
        >
          <Text style={styles.buttonText}>Run Memory Test (Sort 1M)</Text>
        </TouchableOpacity>

        {isPerformanceLoading ? (
          <View style={styles.loaderBox}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.loaderText}>Running test...</Text>
          </View>
        ) : null}

        {performanceResult && !isPerformanceLoading ? (
          <View style={styles.resultBox}>
            <Text style={styles.resultText} testID="performance-result">
              {performanceResult}
            </Text>
          </View>
        ) : null}
      </View>
    </ScrollView>
  );

  const renderPermissionsTab = () => (
    <ScrollView style={styles.tabContent}>
      {/* Permission Requests */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Permission Requests</Text>

        <TouchableOpacity
          style={styles.button}
          onPress={requestCameraPermission}
          testID="request-camera-button"
        >
          <Text style={styles.buttonText}>Request Camera</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, {marginTop: 10}]}
          onPress={requestLocationPermission}
          testID="request-location-button"
        >
          <Text style={styles.buttonText}>Request Location</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, {marginTop: 10}]}
          onPress={requestStoragePermission}
          testID="request-storage-button"
        >
          <Text style={styles.buttonText}>Request Storage</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, {marginTop: 10}]}
          onPress={requestContactsPermission}
          testID="request-contacts-button"
        >
          <Text style={styles.buttonText}>Request Contacts</Text>
        </TouchableOpacity>
      </View>

      {/* System Features */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>System Features</Text>

        <TouchableOpacity
          style={styles.button}
          onPress={handleVibration}
          testID="vibrate-button"
        >
          <Text style={styles.buttonText}>Vibrate Device</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, {marginTop: 10}]}
          onPress={handleOpenBrowser}
          testID="open-browser-button"
        >
          <Text style={styles.buttonText}>Open Browser</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, {marginTop: 10}]}
          onPress={handleMakePhoneCall}
          testID="call-phone-button"
        >
          <Text style={styles.buttonText}>Make Phone Call</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, {marginTop: 10}]}
          onPress={handleSendEmail}
          testID="send-email-button"
        >
          <Text style={styles.buttonText}>Send Email</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  const renderStorageTab = () => (
    <ScrollView style={styles.tabContent}>
      {/* Clipboard Operations */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Clipboard Operations</Text>

        <TouchableOpacity
          style={styles.button}
          onPress={handleCopyToClipboard}
          testID="copy-clipboard-button"
        >
          <Text style={styles.buttonText}>Copy to Clipboard</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, {marginTop: 10}]}
          onPress={handlePasteFromClipboard}
          testID="paste-clipboard-button"
        >
          <Text style={styles.buttonText}>Paste from Clipboard</Text>
        </TouchableOpacity>

        {clipboardText ? (
          <Text style={[styles.label, {marginTop: 20}]} testID="clipboard-content">
            Clipboard: {clipboardText}
          </Text>
        ) : null}
      </View>

      {/* Storage Operations */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Storage Operations</Text>

        <TouchableOpacity
          style={styles.button}
          onPress={handleSaveToStorage}
          testID="save-storage-button"
        >
          <Text style={styles.buttonText}>Save to Storage</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, {marginTop: 10}]}
          onPress={handleLoadFromStorage}
          testID="load-storage-button"
        >
          <Text style={styles.buttonText}>Load from Storage</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, {marginTop: 10}]}
          onPress={handleClearStorage}
          testID="clear-storage-button"
        >
          <Text style={styles.buttonText}>Clear Storage</Text>
        </TouchableOpacity>

        {storageData ? (
          <Text style={[styles.label, {marginTop: 20}]} testID="storage-content">
            Stored Data: {storageData}
          </Text>
        ) : null}
      </View>
    </ScrollView>
  );

  const renderFilesTab = () => (
    <ScrollView style={styles.tabContent}>
      {/* File Upload Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>File Upload</Text>

        <TouchableOpacity
          style={styles.button}
          onPress={handleFilePicker}
          testID="upload-file-button"
        >
          <Text style={styles.buttonText}>Upload File from Device</Text>
        </TouchableOpacity>

        <Text style={[styles.sectionTitle, {marginTop: 20, fontSize: 14}]} testID="file-upload-status">
          Uploaded Files: {uploadedFiles.length}
        </Text>

        {uploadedFiles.length > 0 ? (
          <ScrollView style={styles.fileList}>
            {uploadedFiles.map((file, index) => (
              <View key={index} style={styles.fileItem} testID={`uploaded-file-${index}`}>
                <Text style={styles.fileName}>{file.name}</Text>
                <Text style={styles.fileInfo}>
                  Size: {(file.size / 1024).toFixed(2)} KB | Type: {file.type || 'unknown'}
                </Text>
              </View>
            ))}
          </ScrollView>
        ) : null}

        {uploadedFiles.length > 0 ? (
          <TouchableOpacity
            style={[styles.button, {marginTop: 10, backgroundColor: '#FF3B30'}]}
            onPress={handleClearUploadedFiles}
            testID="clear-uploaded-button"
          >
            <Text style={styles.buttonText}>Clear Uploaded Files</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Save CSV Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Save Files to Device</Text>

        <TouchableOpacity
          style={styles.button}
          onPress={handleSaveCSV}
          testID="save-csv-button"
        >
          <Text style={styles.buttonText}>Generate & Save CSV File</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, {marginTop: 10}]}
          onPress={handleListSavedFiles}
          testID="list-files-button"
        >
          <Text style={styles.buttonText}>List Saved Files</Text>
        </TouchableOpacity>

        <Text style={[styles.sectionTitle, {marginTop: 20, fontSize: 14}]} testID="saved-files-count">
          Saved Files: {savedFiles.length}
        </Text>

        {savedFiles.length > 0 ? (
          <ScrollView style={styles.fileList}>
            {savedFiles.map((filename, index) => (
              <View key={index} style={styles.fileItem} testID={`saved-file-${index}`}>
                <View style={{flex: 1}}>
                  <Text style={styles.fileName}>{filename}</Text>
                  <Text style={styles.fileInfo}>Location: Downloads folder</Text>
                </View>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDeleteSavedFile(filename)}
                  testID={`delete-file-${index}`}
                >
                  <Text style={styles.deleteButtonText}>Delete</Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        ) : null}
      </View>

      {/* Status Display */}
      {fileOperationStatus ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Status</Text>
          <Text style={styles.infoText} testID="file-operation-status">
            {fileOperationStatus}
          </Text>
        </View>
      ) : null}
    </ScrollView>
  );

  const renderBiometricTab = () => (
    <ScrollView style={styles.tabContent}>
      {/* Biometric Availability */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Biometric Sensor</Text>

        <TouchableOpacity
          style={styles.button}
          onPress={checkBiometricAvailability}
          testID="check-biometric-button"
        >
          <Text style={styles.buttonText}>Check Biometric Availability</Text>
        </TouchableOpacity>

        {biometricStatus ? (
          <Text style={[styles.sectionTitle, {marginTop: 20, fontSize: 14}]} testID="biometric-status">
            Status: {biometricStatus}
          </Text>
        ) : null}

        {biometricAvailable ? (
          <View style={styles.resultBox}>
            <Text style={styles.resultText}>
              Biometric Type: {biometricType}
            </Text>
          </View>
        ) : null}
      </View>

      {/* Biometric Authentication */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Re-Authentication</Text>

        <TouchableOpacity
          style={styles.button}
          onPress={handleBiometricAuth}
          testID="authenticate-button"
        >
          <Text style={styles.buttonText}>Authenticate Again</Text>
        </TouchableOpacity>

        <Text style={[styles.label, {marginTop: 15}]}>
          Test biometric authentication again. This doesn't affect your access to the app.
        </Text>
      </View>

      {/* Key Management */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Key Management</Text>

        <TouchableOpacity
          style={styles.button}
          onPress={createBiometricKeys}
          testID="create-keys-button"
        >
          <Text style={styles.buttonText}>Create Biometric Keys</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, {marginTop: 10, backgroundColor: '#FF3B30'}]}
          onPress={deleteBiometricKeys}
          testID="delete-keys-button"
        >
          <Text style={styles.buttonText}>Delete Biometric Keys</Text>
        </TouchableOpacity>

        <Text style={[styles.label, {marginTop: 15}]}>
          Keys are used for secure cryptographic operations tied to biometric authentication.
        </Text>
      </View>
    </ScrollView>
  );

  const renderCameraTab = () => (
    <ScrollView style={styles.tabContent}>
      {/* QR Code Scanner */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>QR Code Scanner</Text>

        {!showCamera ? (
          <>
            <TouchableOpacity
              style={styles.button}
              onPress={handleOpenCamera}
              testID="open-camera-button"
            >
              <Text style={styles.buttonText}>Open Camera for QR Scanning</Text>
            </TouchableOpacity>

            {qrData ? (
              <View style={styles.resultBox}>
                <Text style={styles.sectionTitle}>Last Scanned QR Code:</Text>
                <Text style={styles.resultText} testID="qr-data">
                  {qrData}
                </Text>
              </View>
            ) : null}

            <Text style={[styles.label, {marginTop: 15}]}>
              This camera can be used to test QR code scanning and camera injection
              via Appium. The camera feed can be intercepted and replaced with test images.
            </Text>
          </>
        ) : (
          <View>
            <View style={styles.cameraContainer}>
              <RNCamera
                style={styles.camera}
                type={RNCamera.Constants.Type.back}
                flashMode={RNCamera.Constants.FlashMode.off}
                onBarCodeRead={onBarCodeRead}
                barCodeTypes={[RNCamera.Constants.BarCodeType.qr]}
                captureAudio={false}
                testID="qr-camera"
              >
                <View style={styles.cameraOverlay}>
                  <View style={styles.scanFrame} />
                  <Text style={styles.cameraText}>
                    Position QR code within the frame
                  </Text>
                </View>
              </RNCamera>
            </View>

            <TouchableOpacity
              style={[styles.button, {marginTop: 15, backgroundColor: '#FF3B30'}]}
              onPress={handleCloseCamera}
              testID="close-camera-button"
            >
              <Text style={styles.buttonText}>Close Camera</Text>
            </TouchableOpacity>

            {qrData ? (
              <View style={[styles.resultBox, {marginTop: 15}]}>
                <Text style={styles.sectionTitle}>Scanned Data:</Text>
                <Text style={styles.resultText} testID="qr-data-live">
                  {qrData}
                </Text>
              </View>
            ) : null}
          </View>
        )}
      </View>
    </ScrollView>
  );

  // ==================== RENDER FUNCTIONS ====================

  // Main App Content
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <Text style={styles.title} testID="app-title">
        NativeBridge App
      </Text>

      {renderTabBar()}

      {activeTab === 'ui' && renderUITab()}
      {activeTab === 'network' && renderNetworkTab()}
      {activeTab === 'performance' && renderPerformanceTab()}
      {activeTab === 'permissions' && renderPermissionsTab()}
      {activeTab === 'storage' && renderStorageTab()}
      {activeTab === 'files' && renderFilesTab()}
      {activeTab === 'biometric' && renderBiometricTab()}
      {activeTab === 'camera' && renderCameraTab()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 50,
    marginBottom: 15,
    color: '#333',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#007AFF',
  },
  tabText: {
    fontSize: 14,
    color: '#666',
  },
  activeTabText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  tabContent: {
    flex: 1,
    padding: 15,
  },
  section: {
    marginBottom: 20,
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    backgroundColor: '#fafafa',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 13,
    color: '#666',
    marginTop: 8,
  },
  label: {
    fontSize: 14,
    color: '#333',
    marginBottom: 5,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  scrollView: {
    height: 150,
    backgroundColor: '#fafafa',
    borderRadius: 8,
    padding: 8,
  },
  scrollItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  dataDisplay: {
    marginTop: 15,
    backgroundColor: '#fafafa',
    padding: 10,
    borderRadius: 8,
    maxHeight: 200,
  },
  dataText: {
    fontSize: 12,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    color: '#333',
  },
  resultBox: {
    marginTop: 15,
    backgroundColor: '#e8f4f8',
    padding: 15,
    borderRadius: 8,
  },
  resultText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  loaderBox: {
    marginTop: 20,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loaderText: {
    marginTop: 10,
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },
  fileList: {
    maxHeight: 200,
    backgroundColor: '#fafafa',
    borderRadius: 8,
    padding: 8,
    marginTop: 10,
  },
  fileItem: {
    flexDirection: 'row',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    alignItems: 'center',
  },
  fileName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  fileInfo: {
    fontSize: 11,
    color: '#666',
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginLeft: 10,
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  cameraContainer: {
    height: 400,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanFrame: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: '#00FF00',
    backgroundColor: 'transparent',
  },
  cameraText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 20,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 10,
    borderRadius: 5,
  },
});

export default App;
