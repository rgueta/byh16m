export const Utils = {
    convDate: function(today){
        var day = ("0" + today.getDate()).slice(-2);
        var month = ("0" + (today.getMonth() + 1 )).slice(-2);
        var year = today.getFullYear();
        var hour = ("0" + today.getHours()).slice(-2);
        var minutes = ("0" + today.getMinutes()).slice(-2);
        var seconds = ("0" + today.getSeconds()).slice(-2);
        var milis = ("0" + today.getMilliseconds()).slice(-3);

        return year + "-" + month + "-" + day + "T" + hour + ":" + minutes + ":" + seconds + "." + milis;
    },

    convDateToday: function(){
        var today = new Date();
        var day = ("0" + today.getDate()).slice(-2);
        var month = ("0" + (today.getMonth() + 1 )).slice(-2);
        var year = today.getFullYear();
        var hour = ("0" + today.getHours()).slice(-2);
        var minutes = ("0" + today.getMinutes()).slice(-2);
        var seconds = ("0" + today.getSeconds()).slice(-2);
        var milis = ("0" + today.getMilliseconds()).slice(-3);

        return year + "-" + month + "-" + day + "T" + hour + ":" + minutes + ":" + seconds + "." + milis;
    }

}
