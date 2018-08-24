isDlog = true;
//$GPRMC,161814.00,A,5205.61906,S,00506.07095,E,1.311,,081214,,,A*75
// data = "$GPRMC,161814.00,A,505.61906,N,00506.07095,E,1.311,,081214,,,A*75";
data = "$GPRMC,220516,A,5133.82,N,00042.24,W,173.8,231.8,130694,004.2,W*70";

latlon = getLatLng(data);

alert(latlon[0] + "  > " + latlon[1]);

function getLatLng(d) {
    nmea = d.split(",");
     
    // LAT: North South 
    coordNS = nmea[3];
    dlog(" " + coordNS);
    direction = nmea[4];
    days = coordNS.substring(0, 2);
    minutes = coordNS.substring(2, 10);
    dlog("*** days: " + days + " minutes: " + minutes + " direction: " + direction +" ***");
    lat = toDD(days,minutes, direction);
    dlog("lat: " + lat);
    
    // East West
    coordEW = nmea[5];
    dlog(coordEW);  // Coord
    direction = nmea[6];
    days = coordEW.substring(0, 3);
    minutes = coordEW.substring(3, 11);
    dlog("*** days: " + days + " minutes: " + minutes + " direction: " + direction +" ***");
    lon = toDD(days, minutes, direction);
    return [lat, lon];
}

// TODO: Direction
function toDD(degrees, minutes, direction) {
   out = parseInt(degrees) + (parseFloat(minutes) / 60);
   if(direction == "S" || direction == "W") {
      out = out * -1.0;
   }
   return out;
}

function dlog(msg) {
    if(isDlog)
        console.log(msg);
}