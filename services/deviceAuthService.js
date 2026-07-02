// services/deviceAuthService.js
// Table: G.M.Counter_Integrated
import { Platform } from 'react-native';
import * as Application from 'expo-application';
import { supabase } from './supabaseClient';

/**
 * Returns the unique Android device ID.
 * Uses expo-application's androidId which wraps Settings.Secure.ANDROID_ID.
 */
export async function getDeviceId() {
  if (Platform.OS === 'android') {
    try {
      return Application.getAndroidId();
    } catch (e) {
      return null;
    }
  }
  // Fallback for non-Android (iOS / Web)
  return Application.getIosIdForVendorAsync
    ? await Application.getIosIdForVendorAsync()
    : null;
}

/**
 * Checks whether the current device is in the `authorized_devices` table.
 * Returns { authorized: boolean, deviceId: string | null, error: string | null }
 */
export async function checkDeviceAuthorization() {
  const deviceId = await getDeviceId();

  if (!deviceId) {
    return {
      authorized: false,
      deviceId: null,
      error: 'Unable to retrieve device ID.',
    };
  }

  const { data, error } = await supabase
    .from('G.M.Counter_Integrated')
    .select('device_id')
    .eq('device_id', deviceId)
    .maybeSingle();

  if (error) {
    return {
      authorized: false,
      deviceId,
      error: error.message,
    };
  }

  return {
    authorized: data !== null,
    deviceId,
    error: null,
  };
}
