var upperCase = require('upper-case')

exports.engagementToInt = function (str) {



    if (typeof (str) != "string") {
        str = "" + str
    }
    var num = str.replace(",", "");
    var type = num.match(/[a-zA-Z]+/g);
    var number = num.match(/[0-9.0-9]+/g);

    var numConvert = 0;
    if (type != null) {

        var last = type.length

        if (last == 2) { last = 1 } else { last = 0 };
        switch (upperCase(type[last])) {
            case "K":

                numConvert = number * 1000;
                // return numConvert;
                break;

            case "M":

                numConvert = number * 1000000;
                // return numConvert;
                break;

            default:
                numConvert = number;
                break;
        }
    } else {
        if (number >= 0) {
            numConvert = number;
        } else {

            // console.log("Can't conver string data :"+str);
            // return 0
            numConvert = 0;
        }
    }
    // console.log( "type "+ typeof(str));
    return parseInt(numConvert);
}

// cell funcationn  
// convert.dateFormat("Wednesday, October 24, 2018 at 9:19 PM","FB");
// convert.dateFormat();
// convert.dateFormat("2018-11-17T07:12:56.000Z","IG");
// type : "FB","ig"
// not parameter == now()
exports.dateFormat = function (str, type = "d") {
    var newD = new Date();

    var dateStr = str;
    switch (upperCase(type)) {
        case "FB":

            var newDate;
            var subCharDate = dateStr.match(/[a-zA-Z]+/g);
            var subTimeDate = dateStr.match(/[0-9]+/g);
            var time = parseInt(subTimeDate[2]);
            if (subCharDate) {
                if (subCharDate[3] == "PM") {
                    time = parseInt(subTimeDate[2]) + 12;
                }

                newDate = subTimeDate[1] + "-" + subCharDate[1] + "-" + subTimeDate[0] + " " + time + ":" + subTimeDate[3] + ":00"
            } else {
                newDate = parseInt(dateStr) * 1000
            }
            newD = new Date(newDate);
            break;
        case "IG" || "YOUTUBE":
            newD = new Date(dateStr);
            break;
        case "P":
            newD = new Date(dateStr);
            break;
        case "TW":
            newDate = parseInt(dateStr) * 1000
            newD = new Date(newDate);
            break;
        case "POSTYMD":

            newD = new Date(dateStr);
            var d = newD.getFullYear() + "" + ("0" + (newD.getMonth() + 1)).slice(-2) + "" + ("0" + newD.getDate()).slice(-2)
            return parseInt(d)
            break;

        default:
            newD = new Date();
            break;
    }

    return newD;


}


exports.randomNumber = function (num) {


    return Math.floor(Math.random() * Math.floor(num));

}



exports.getNextTimetostampDate = function (time = 0, type = "m") {

    var d_date = new Date();
    if (type == "m") {
        d_date.setMinutes(d_date.getMinutes() + time)
    } else if (type == "h") {
        d_date.setMinutes(d_date.getMinutes() + time)
    }
    // d_date.setHours(d_date.getHours()+12); 
    var nextdd = d_date.getTime();
    nextdd = nextdd.toString();
    nextdd = nextdd.substr(0, 10);
    var timetostamp = parseInt(nextdd);

    return timetostamp
}