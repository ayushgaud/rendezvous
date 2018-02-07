var flightPath = 0;
var markerCurrentPosition = 0;
var precisionCircle = 0;
var oldCurrentPosition = Array();
var arrowAngle = 0;
var arrowIcon;
var arrowIcon_imu;
var arrowIcon_gps;

function initialize() {
    var starting = new google.maps.LatLng(47.413157, 8.548645); //Zurich

    var mapOptions = {
        center: starting,
        zoom: 18,
        mapTypeId: 'satellite'
    };

    map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);
    map.setTilt(0); //disable 45° view

}

function putCenter(lat, lng) {
    var position = new google.maps.LatLng(lat, lng);
    map.setCenter(position)
    map.setMapTypeId('terrain')
}

function putHome(lat, lng) {
    var position = new google.maps.LatLng(lat, lng);
    var Home = 'images/homeMarker.png';

    var markerHome = new google.maps.Marker({
        position: position,
        map: map,
        title: "Home",
        icon: Home
    });
}

function startVisualization(lat, lng) {
    var position = new google.maps.LatLng(lat, lng);

    arrowIcon = {
        path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
        scale: 10,
        strokeColor: "#0000FF",
        rotation: 0,
        strokeOpacity: 1,
        strokeWeight: 2,
        anchor: new google.maps.Point(0, 2.2)
    };

    arrowIcon_imu = {
        path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
        scale: 10,
        strokeColor: "#00FF00",
        rotation: 0,
        strokeOpacity: 1,
        strokeWeight: 2,
        anchor: new google.maps.Point(0, 2.2)
    };

    arrowIcon_gps = {
        path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
        scale: 10,
        strokeColor: "#F442BF",
        rotation: 0,
        strokeOpacity: 1,
        strokeWeight: 2,
        anchor: new google.maps.Point(0, 2.2)
    };

    precisionCircle = new google.maps.Circle({
        strokeColor: "#AA00FF",
        strokeOpacity: 1,
        strokeWeight: 2,
        fillColor: "#0000FF",
        fillOpacity: 0.2,
        zIndex: google.maps.Marker.MAX_ZINDEX - 1
    });

    flightPath = new google.maps.Polyline({
        path: oldCurrentPosition,
        icons: [{
            icon: arrowIcon,
            offset: '100%',
            fixedRotation: true
        },{
            icon: arrowIcon_imu,
            offset: '100%',
            fixedRotation: true
        },{
            icon: arrowIcon_gps,
            offset: '100%',
            fixedRotation: true
        }],
        geodesic: true,
        strokeColor: '#FF0000',
        strokeOpacity: 1.0,
        strokeWeight: 2
    });

    flightPath.setMap(map);
    precisionCircle.setMap(map);

}

// Use the DOM setInterval() function to change the rotation of the marker according to the magnetometer
function rotateArrow() {
    window.setInterval(function() {
        var icons = flightPath.get('icons');
        arrowIcon.rotation = headingDegrees;
        arrowIcon_imu.rotation = imuDegrees;
        arrowIcon_gps.rotation = gpsDegrees;
        flightPath.set('icons', icons);
        // map.setHeading(headingDegrees);
    }, 125); //updating the rotation 8 times per second
}

google.maps.event.addDomListener(window, 'load', initialize);