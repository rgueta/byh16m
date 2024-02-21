export const Utils = {
    convDate: function(today:Date){
        var day:string = ("0" + today.getDate()).slice(-2);
        var month:string = ("0" + (today.getMonth() + 1 )).slice(-2);
        var year:string = today.getFullYear().toString();
        var hour:string = ("0" + today.getHours()).slice(-2);
        var minutes:string = ("0" + today.getMinutes()).slice(-2);
        var seconds:string = ("0" + today.getSeconds()).slice(-2);
        var milis:string = ("0" + today.getMilliseconds()).slice(-3);

        return year + "-" + month + "-" + day + "T" + hour + ":" + minutes + ":" + seconds + "." + milis;
    },

    convDateToday:async function(){
        var today:Date = new Date();
        var day : string = ("0" + today.getDate()).slice(-2);
        var month: string = ("0" + (today.getMonth() + 1 )).slice(-2);
        var year:string = today.getFullYear().toString();
        var hour:string = ("0" + today.getHours()).slice(-2);
        var minutes:string = ("0" + today.getMinutes()).slice(-2);
        var seconds:string = ("0" + today.getSeconds()).slice(-2);
        var milis:string = ("0" + today.getMilliseconds()).slice(-3);

        return year + "-" + month + "-" + day + "T" + hour + ":" + minutes + ":" + seconds + "." + milis;
    },

    convISODate: function(today:Date){
      var day:string = ("0" + today.getDate()).slice(-2);
      var month:string = ("0" + (today.getMonth() + 1 )).slice(-2);
      var year:string = today.getFullYear().toString();
      var hour:string = ("0" + today.getHours()).slice(-2);
      var minutes:string = ("0" + today.getMinutes()).slice(-2);
      var seconds:string = ("0" + today.getSeconds()).slice(-2);
      var milis:string = ("0" + today.getMilliseconds()).slice(-3);

      return year + "-" + month + "-" + day + "T" + hour + ":" + minutes + ":" + seconds + "." + milis + '.000Z';
  },

    sortJSON: function(arr:any, key:any, asc=true){
        return arr.sort((a:any, b:any) => {
          let x = a['name'][key];
          let y = b['name'][key];
          if (asc) { return ((x < y) ? -1 : ((x > y) ? 1 : 0)); }
          else { return ((x > y) ? -1 : ((x < y) ? 1 : 0)); }
        });
      },

    sortJsonVisitors: function(arr:any, key:any, asc=true){
        return arr.sort((a:any, b:any) => {
          let x = a[key];
          let y = b[key];
          if (asc) { return ((x < y) ? -1 : ((x > y) ? 1 : 0)); }
          else { return ((x > y) ? -1 : ((x < y) ? 1 : 0)); }
        });
      },

    cleanLocalStorage: async () =>{
      let myVisitors : any = [];
      let myToken_px : string = '';
      let mycore_id : string = '';


      if(localStorage.getItem('visitors') != null){
        myVisitors = await JSON.parse(localStorage.getItem('visitors'));
      }

      if(localStorage.getItem('token_px') != null){
        myToken_px = await localStorage.getItem('token_px');
      }

      if(localStorage.getItem('core-id') != null){
        mycore_id = await localStorage.getItem('core-id');
      }

      const cnnStatus = await JSON.parse(localStorage.getItem('netStatus'));

      await localStorage.clear();
      await localStorage.setItem('visitors',JSON.stringify(myVisitors));
      await localStorage.setItem('token_px', myToken_px);
      await localStorage.setItem('core-id', mycore_id);
      await localStorage.setItem('netStatus', JSON.stringify(cnnStatus));



    }

}
