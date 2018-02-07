// Connecting to ROS
// -----------------
var index = 0;
var i = 0;
var newpositionC = 0;
var updateRate = 200;
var initOk = false;
var headingDegrees = 0;
var imuDegrees = 0;
var gpsDegrees = 0;
var fixOk = false;
var d = new Date();
var time = d.getTime();
var timeM = time;
var siny;
var cosy;

var ros = new ROSLIB.Ros({
    url: 'ws://localhost:9090'
});

ros.on('connection', function() {
  console.log('Connected to websocket server.');
});

ros.on('error', function(error) {
  console.log('Error connecting to websocket server: ', error);
});

ros.on('close', function() {
  console.log('Connection to websocket server closed.');
});


// Subscribing to a Topic
// ----------------------
var navSatFixListener = new ROSLIB.Topic({
    ros: ros,
    name: '/gps/fix', //topic name
    messageType: 'sensor_msgs/NavSatFix' //message Type
});

var magneticFieldListener = new ROSLIB.Topic({
    ros: ros,
    name: '/imu/mag', //topic name
    messageType: 'sensor_msgs/MagneticField' //message Type
});

var imuListener = new ROSLIB.Topic({
    ros: ros,
    // name: '/rpy', //topic name
    // messageType: 'std_msgs/Float32MultiArray' //message Type
    name: '/imu/data',
    messageType: 'sensor_msgs/Imu'
});

var gpsVelListener = new ROSLIB.Topic({
    ros: ros,
    name: '/gps/fix_velocity', //topic name
    messageType: 'geometry_msgs/TwistWithCovarianceStamped' //message Type
});

navSatFixListener.subscribe(function(message) {

    if (index == 0) { // firts entry

        startVisualization(message.latitude, message.longitude);
        putCenter(message.latitude, message.longitude);
        putHome(message.latitude, message.longitude);
        oldCurrentPosition[index] = new google.maps.LatLng(message.latitude, message.longitude);
        initOk = true;

        rotateArrow();

    } else { // new entries

        if (fixOk == false && message.status.status == 3) {
            precisionCircle.setOptions({
                fillColor: '#0000FF'
            }); // BLUE Circle
            fixOk = true;
        }
        if (fixOk == true && message.status.status !== 3) {
            precisionCircle.setOptions({
                fillColor: '#FF0000'
            }); // RED Circle
            fixOk = false;
        }
        putCenter(message.latitude, message.longitude);
        newpositionC = new google.maps.LatLng(message.latitude, message.longitude);

        d = new Date();
        time = d.getTime();

        if ((time - timeM) >= updateRate) //marker and path update rate in milliseconds
        {
            //markerCurrentPosition.setPosition(newpositionC);
            precisionCircle.setCenter(newpositionC);
            precisionCircle.setRadius(Math.sqrt(message.position_covariance[0] + message.position_covariance[4]));
            oldCurrentPosition[i] = newpositionC;

            path = flightPath.getPath();
            path.push(oldCurrentPosition[i]);

            timeM = time;
            i++;
        }

    }

    index++; // update index

});

magneticFieldListener.subscribe(function(message) {
    if (initOk == true) {
        headingDegrees = Math.atan2(message.magnetic_field.y, message.magnetic_field.x) * 180 / Math.PI;
    }
});

imuListener.subscribe(function(message) {
    if (initOk == true) {

    	siny = +2.0 * (message.orientation.w * message.orientation.z + message.orientation.x * message.orientation.y);
    	cosy = +1.0 - 2.0 * (message.orientation.y * message.orientation.y + message.orientation.z * message.orientation.z); 
        imuDegrees =  90 - (Math.atan2(siny,cosy) * 180 / Math.PI);
        // imuDegrees = message.data[2];
    }
});

gpsVelListener.subscribe(function(message) {
    if (initOk == true) {
        gpsDegrees = 90 - Math.atan2(message.twist.twist.linear.y, message.twist.twist.linear.x) * 180 / Math.PI;
    }
});