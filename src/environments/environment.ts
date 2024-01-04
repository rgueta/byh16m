// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: 'false',
  app : {
    version: "1.0.0",
    Description: "Main tab data information feed",
    debugging: true,
    debugging_send_sms: false
  },
  cloud : {
    server_url : "http://100.24.58.74/"
    // server_url : "http://192.168.1.185:5500/"
    // socket_url : "ws://192.168.1.154:5500/",
  }
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
