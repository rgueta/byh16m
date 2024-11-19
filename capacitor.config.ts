import { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
    appId: 'com.bytheg.byh16m',
    appName: 'byh16m',
    webDir: 'www',
    bundledWebRuntime: false,
	android: {
		allowMixedContent: true
	  },
	

    plugins:{
        LocalNotifications:{
            smallIcon: 'ic_stat_icon_config_sample',
            iconColor: '#488AFF',
            sound: 'beep.wav',
        },
        SplashScreen: {
		// 	launchShowDuration: 3000,
		// 	launchAutoHide: true,
		// 	launchFadeOutDuration: 3000,
		// 	backgroundColor: "#fff",
		// 	androidSplashResourceName: "splash",
			androidScaleType:  "CENTER_CROP",
		// 	showSpinner: false,
		// 	// androidSpinnerStyle": "large",
		// 	// iosSpinnerStyle": "small",
		// 	// spinnerColor": "#999999",
		// 	splashFullScreen: true,
		// 	splashImmersive: true,
		// 	// "layoutName": "launch_screen",
		// 	// "useDialog": true
		}
    }
	

};

export default config;