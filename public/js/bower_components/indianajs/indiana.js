// exports.printMsg = function() {
//   console.log("Hello World IndianaJS :)");
// }

var spatialAwareness = function(options) {

	/* 
	tiltLR - tilt left right (yaw)
	tiltFB - tilt front back (pitch)
	dir - view direction (angle (phi))
	*/
	var originalOrientation = {tiltLR: 0, tiltFB: 0, dir: 0};
	var currentOrientation = {tiltLR: 0, tiltFB: 0, dir: 0};
	var position = {x:0, y:0};

	var thingsArray = [];
	var FIELD_OF_VIEW = options.fov || 10;

	function init() {
		var initialResetDone = false;

		initDeviceOrientation(function(tiltLR,tiltFB,dir) {

			// console.log("Original direction:",originalOrientation.dir);
			currentOrientation.tiltLR = tiltLR;
			currentOrientation.tiltFB = tiltFB;
			currentOrientation.dir = dir;

			if(!initialResetDone) {
				originalOrientation.tiltLR = currentOrientation.tiltLR;
				originalOrientation.tiltFB = currentOrientation.tiltFB;
				originalOrientation.dir = currentOrientation.dir;
				initialResetDone = true;
			}
			var event = new CustomEvent('indiana_deviceorientation', 
				{detail: {orientation: getOrientation(), things: thingsArray}});
			document.dispatchEvent(event);

			checkFront(FIELD_OF_VIEW);
		});
	}

	function getOrientation() {
		var orientation = {}
		orientation.tiltLR = currentOrientation.tiltLR - originalOrientation.tiltLR;
		orientation.tiltFB = currentOrientation.tiltFB - originalOrientation.tiltFB;
		orientation.dir = normalizeDegree(currentOrientation.dir - originalOrientation.dir);
		return orientation;
	}

	function normalizeDegree(d) {
		d = (d>=360) ? 360 - d : d;
		d = (d<0) ? 360 + d : d;
		return d;
	}

	/* 
	Initialize the sensor for device orientation and register listeners
	*/
	function initDeviceOrientation(cb) {
		if (window.DeviceOrientationEvent) {
			// document.getElementById("doEvent").innerHTML = "DeviceOrientation";
			// Listen for the deviceorientation event and handle the raw data
			window.addEventListener('deviceorientation', 
		    	function(eventData) {
					// gamma is the left-to-right tilt in degrees, where right is positive
					var tiltLR = eventData.gamma;

					// beta is the front-to-back tilt in degrees, where front is positive
					var tiltFB = eventData.beta;

					// alpha is the compass direction the device is facing in degrees
					var dir = eventData.alpha;

					// call our orientation event handler
					cb(tiltLR, tiltFB, dir);
				}, false);
		} else {
			console.log("Device orientation is not supported on your device or browser.");
		}
	}

	function initKinekt(cb) {
		// checks if there is a kinekt...
		// connects to kinekt, returns data in callback on status changes
	}
	
	/*
	Checks the front of the device for things with a custom field of view

	inputs:
	fieldOfView - the field of view (visibility cone) within wich the object needs to be in order to be visible
	*/
	function checkFront(fieldOfView) {
		var foundThing = '';
		var dir = getOrientation().dir;
		// console.log(dir)
		var count = Object.keys(thingsArray).length;
		$.each(thingsArray, function(key, thing) {
			var thinglocation = thing.location.dir;
			var difference = Math.abs(dir - thinglocation);
			if(difference < fieldOfView/2) {
				if(key != foundThing) {
					console.log(foundThing, key);
					foundThing = key;
					var event = new CustomEvent('indiana_foundThingInFront', {detail: {key:key, value:thing}}	);
					document.dispatchEvent(event);
				}
			} else {
				// count down each thing not found
				count--;
				if(foundThing == '' && count == 0) {
					// console.log('notfound',count,foundThing);
					foundThing = '';
					var event = new CustomEvent('indiana_noThingInFront');
					document.dispatchEvent(event);
				}
			}
		})
	}

	/*
	 Returns a string representing the 2D location expressed in a 8 point cardinal direction
	 This results in a 45 degree cone for each cardinal direction

	 NW N NE
	 W  .  E
	 SW S SE

	*/
	function getThingCardinalPosition(thing){
	    var degree = getThingPosition2DinDegree(thing);
	    if (degree <= 22.5 || degree > (360-22.5))
	        return 'N';
	    if (degree <= (45+22.5) && degree > 22.5)
	        return 'NW';
	    if (degree <= (90+22.5) && degree > (45+22.5))
	        return 'W';
	    if (degree <= (135+22.5) && degree > (90+22.5))
	        return 'SW';
	    if (degree <= (180+22.5) && degree > (135+22.5))
	        return 'S';
	    if (degree <= (225+22.5) && degree > (180+22.5))
	        return 'SE';
	    if (degree <= (270+22.5) && degree > (225+22.5))
	        return 'E';
	    if (degree <= 315+22.5 && degree > (270+22.5))
	        return 'NE';
	}

	function getThingPosition2DinDegree(thing) {
		var dir = normalizeDegree(thingsArray[thing].location.dir-getOrientation().dir);
		// setInterval(function() {
			// console.log(thing, dir)
		// }, 10000);
		return dir;
	}

	function registerThings(things) {
		thingsArray = things;
	}

	function addThings(things){
		thingsArray //TODO
	}

	// function registerThings(things) {
	// 	if(things.constructor == Object) {
	// 		for(var key in things) {
	// 			var thing = things[key];
	// 			if(!thing.uri || !thing.location) {
	// 				console.log("ERROR: An thing doesn't contain a uri or location:", thing);
	// 				console.log(things)
	// 				return false;
	// 			}
	// 		}
	// 		thingsArray = things;
	// 		return true;
	// 	}
	// 	console.log("ERROR: This function can only register an array of things.")
	// 	return false;
	// }
	
	function updateThing(id, obj) {
		if(thingsArray[id]){
			$.extend(thingsArray[id],obj);
			var event = new CustomEvent('thingDataChanged', {detail: thingsArray[id]}	);
			document.dispatchEvent(event);
		}
	}

	function resetOrientation() {
			originalOrientation.tiltLR = currentOrientation.tiltLR;
			originalOrientation.tiltFB = currentOrientation.tiltFB;
			originalOrientation.dir = currentOrientation.dir;
			console.log("Reseted orientation at:", currentOrientation);
	}

	function activateQRCodeReader(divselector, cb) {
		// $(divselector).html5_qrcode(function(data) {
		//         // do something when code is read
		// 		// $(divselector+"data").html(data);
		//     	console.log(data)
		//     	var r = confirm("Are you in TECO kitchen?")
		//     	if(r) {
		// 			ajaxRequest("http://localhost:8080/kitchen","GET", {}, function(data) {
		// 				console.log("Ajax success:", data);
		//     			init();
		// 				thingsArray = data;
		// 				cb(data)
		// 			}, function(err) {
		// 				console.log("Ajax error:", err);
		// 				// $("#qrcodediverr").html(err.statusText)
		// 			});
		//     		// $(divselector+"data").html("Welcome to TECO kitchen.")
		//     	} else {
		//     		init();
		// 			thingsArray = kitchenthings;
		//     		cb(kitchenthings);
		//     	}
		//     }, function(error){
		//         //show read errors 
		// 		// $(divselector+"err").html(error)
		//         // console.log(error)
		//     }, function(videoError){
		//         //the video stream could be opened
		//         console.log(videoError)
		//     })
	}

	function deactivateQRCodeReader(divselector) {
			$(divselector).html5_qrcode_stop();
			$(divselector).html('')
			// $(divselector+"data").html('')
			// $(divselector+"err").html('')
	}

	/* 
	Return Spatial Aware Indiana
	*/
	return {
		init: init,
		registerThings : registerThings,
		updateThing : updateThing,
		getPosition : function() {
			return position;
		},
		checkFront: checkFront,
		getOrientation : getOrientation,
		resetOrientation : resetOrientation,
		getThingCardinalPosition: getThingCardinalPosition,
		getThingPosition2DinDegree: getThingPosition2DinDegree,
		activateQRCodeReader : activateQRCodeReader,
		deactivateQRCodeReader : deactivateQRCodeReader,
	}
}