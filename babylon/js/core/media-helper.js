export class MediaHelper {
  static devices = {};
  static async checkPermissions(permissionObject) {
  try {
    // prompts for permission to use camera/mic
    await navigator.mediaDevices.getUserMedia(permissionObject);
    return true;
  } catch(err) {
    console.error("User permission denied ", err);
    return false;
  }
  }
  static async checkAudioPermissions() {
    return MediaHelper.checkPermissions({audio:true});
  }  
  static async checkVideoPermissions() {
    return MediaHelper.checkPermissions({video:true});
  }  
  
  // FIXME this can return device with empty ID 
  static async selectDevice(deviceId, kind) {
    if ( deviceId ) {
      MediaHelper.devices[kind] = deviceId;
    }
    if ( ! MediaHelper.devices[kind] ) {
      var devices = await navigator.mediaDevices.enumerateDevices();
      for (var idx = 0; idx < devices.length; ++idx) {
        if (devices[idx].kind === kind) {
          console.log(devices[idx]);
          MediaHelper.devices[kind] = devices[idx].deviceId;
          break;
        }
      }
    }
    return MediaHelper.devices[kind];    
  }
  
  static async selectVideoInput(deviceId) {
    if (MediaHelper.checkPermissions({video:true})) {
      return MediaHelper.selectDevice(deviceId, "videoinput");
    }
    return null;
  }
  static async selectAudioInput(deviceId) {
    if(MediaHelper.checkPermissions({audio:true})) {
      return MediaHelper.selectDevice(deviceId, "audioinput");
    }
    return null;
  }
}