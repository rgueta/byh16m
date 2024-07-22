export const environment = {
  production: true,
  app : {
    version: "1.0.0",
    Description: "Main tab data information feed",
    debugging: false,
    debugging_send_sms: false
  },
  cloud : {
    // status 1 = Active; 2 = Inactive, 3 = New register
    register_status : 3,
    // server_url : "http://100.24.58.74/"
    server_url : "http://192.168.1.184:5500/"
  }
};
