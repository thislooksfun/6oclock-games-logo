//Version: 1.0.0

// --User variables--
var circleColor = "#FD8524";
var textColor = "#FCA329";
var backgroundColor = "#fff";

var width1 = 20; //The line width for the initial animation
var width2 = 10; //The line width for when it shrinks into the corner

var delays = [
	//Format: [time, delay, invert, style]
	//The "invert" feature only applys to arcs, and is either a '0' or 'false' for false, or a '1' or 'true' for true
	//For styles see http://raphaeljs.com/reference.html#Raphael.easing_formulas
	
	[1900, 0,    0, "<>"], //outerArc
	[1500, 200,  1, "<>"], //innerArc
	[500,  2300,    ""],   //sixLine
	[500,  0,    1, "<>"], //sixArc - NOTE: The delay on this activates after the "sixLine" animation is done.
	[1500, 0,       "<>"], //shrinking - NOTE: The delay on this activates after all other animations are done.
]



// --Program variables (Don't change these unless you know what you're doing!)--
var $logo_animate; //The jQuery object for the div with id "logo-animate"

var paper;    //The Raphael object
var outerArc; //The outer ring of the logo
var innerArc; //The inner ring
var sixLine;  //The line of the 6
var sixArc;   //The circle part of the 6
var sq1;      //The invisible square that blocks out the bottom part of the inner ring
var sq2;      //The invisible square that blocks out the end of the line of the six to make it tapered

//Don't mess with these unless you know what you're doing!
var arc1 = [[222, 222, 0, 210, 0,   +delays[0][2]], [222, 222, 100, 210, 0,   +delays[0][2]], [111, 111, 100, 105,  0, +delays[0][2]]]; //The data for the outer ring
var arc2 = [[222, 222, 0, 170, 180, +delays[1][2]], [222, 222, 100, 170, 180, +delays[1][2]], [111, 111, 100, 85,   0, +delays[1][2]]]; //The data for the inner ring
var arc3 = [[222, 254, 0, 47,  301, +delays[3][2]], [222, 254, 100,  47, 301, +delays[3][2]], [111, 127, 100, 23.5, 0, +delays[3][2]]]; //The data for the ring of the 6
var linePath = ["M245,125 L245,125", "M246,125 L181.6,230", "M119.1,64 L90.2,116"]; //The path the line of the 6 follows

var checks = [false, false, false, false]; //The array that checks if all the animations are done


// --Functions--
//Loads the jQuery and Raphael if they aren't already present
function loadDependencies()
{
	if (!window.jQuery) {
		loadScript("http://code.jquery.com/jquery-1.11.0.min.js");
	}
	try {
		Raphael
	} catch (e) {
		loadScript("http://raw.githubusercontent.com/DmitryBaranovskiy/raphael/master/raphael-min.js");
	}
	
	waitForLoad();
}

//Loads the second part of jQuery and starts the setup process after the main part and Raphael are loaded
function waitForLoad()
{
	var raph = false;
	try {
		Raphael;
		raph = true;
	} catch (e) {}
	
	if (window.jQuery && raph) {
		loadScript("http://code.jquery.com/jquery-migrate-1.2.1.min.js");
		init();
	} else {
		setTimeout(waitForLoad, 20);
	}
}

//Loads the specified script
function loadScript(path)
{
	var tag = document.createElement('script');
	tag.setAttribute("type","text/javascript");
	tag.setAttribute("src", path);
	document.getElementsByTagName("head")[0].appendChild(tag);
}

//Initalizes the "$logo_animate" and "paper" variables, and adds the "arc" function to the paper
function init()
{
	$logo_animate = $("#logo_animate");
	
	if (!$logo_animate.length)
	{
		$("body").append("<div id=\"logo_animate\"></div>");
		
		$logo_animate = $("#logo_animate");
		$logo_animate.css("position", "absolute");
		$logo_animate.css("top", "10px");
		$logo_animate.css("left", "10px");
		$logo_animate.css("height", "444px");
		$logo_animate.css("width", "444px");
	}
	
	paper = Raphael("logo_animate", $logo_animate.outerWidth(), $logo_animate.outerHeight());
	
	paper.customAttributes.arc = function (xloc, yloc, percent, rad, rot, invert) {
		var alpha = 3.6 * percent,
		a = (90 - alpha) * Math.PI / 180,
		x = xloc + rad * Math.cos(a),
		y = yloc - rad * Math.sin(a),
		path;
		
		if (invert) {
			x = xloc - rad * Math.cos(a);
		}
		
		if (percent >= 100) {
			path = [
				["M", xloc, yloc - rad],
				["A", rad, rad, 0, 1, 1, xloc - 0.01, yloc - rad]
			];
		} else {
			path = [
				["M", xloc, yloc - rad],
				["A", rad, rad, 0, +(alpha > 180), +(!invert), x, y]
			];
		}
		return {
			path: path,
			transform: "r"+rot+","+xloc+","+yloc,
		};
	};
	
	setupShapes();
}

//Creates the shapes and sets their inital position
function setupShapes()
{
	outerArc = paper.path().attr({
		"stroke": circleColor,
		"stroke-width": width1,
		arc: arc1[0],
	});
	
	innerArc = paper.path().attr({
		"stroke": circleColor,
		"stroke-width": width1,
		arc: arc2[0],
	});
	
	sixLine = paper.path(linePath[0]).attr({
		"stroke": textColor,
		"stroke-width": width1,
	});
	
	sixArc = paper.path().attr({
		"stroke": textColor,
		"stroke-width": width1,
		arc: arc3[0],
	});
	
	paper.circle(444, 444, 1);
	
	startAnimation();
}

//Starts the animation
function startAnimation()
{
	outerArc.animate(Raphael.animation({arc: arc1[1]}, delays[0][0], delays[0][3], function(){post(0)}).delay(delays[0][1]));
	innerArc.animate(Raphael.animation({arc: arc2[1]}, delays[1][0], delays[1][3], function(){post(1)}).delay(delays[1][1]));
	
	sixLine.animate(Raphael.animation({path: linePath[1]}, delays[2][0], delays[2][2], function(){six_two()}).delay(delays[2][1]));
	
	sq1 = paper.rect(192, 375, 60, 30);
	sq1.attr({
		"stroke": "#0f0",
		"fill": backgroundColor,
		"stroke-width": 0,
	})
	
	sq2 = paper.rect(225, 105, 30, 30);
	sq2.attr({
		"stroke": "#0f0",
		"fill": backgroundColor,
		"stroke-width": 0,
	})
}

//Animates the six arc after the line is done (to help with timing)
function six_two()
{
	sixArc.animate(Raphael.animation({arc: arc3[1]}, delays[3][0], delays[3][3], function() {post(3);}).delay(delays[3][1]));
	post(2);
}

//Called after every animation is finished, to synchronise the shrinking animation
function post(index)
{
	checks[index] = true;
	
	var flag = true;
	
	for (i = 0; i < checks.length; i++)
	{
		if (i != flag && !checks[i]) {
			flag = false;
		}
	}
	
	if (flag) {
		post_do();
	}
}

//Animates the shrinking of the shapes into the corner
function post_do()
{
	outerArc.animate(Raphael.animation({arc:  arc1[2], "stroke-width": width2}, delays[4][0], delays[4][2]).delay(delays[4][1]));
	innerArc.animate(Raphael.animation({arc: arc2[2], "stroke-width": width2}, delays[4][0], delays[4][2]).delay(delays[4][1]));
	sixLine.animate(Raphael.animation({path: linePath[2], "stroke-width": width2}, delays[4][0], delays[4][2]).delay(delays[4][1]));
	sixArc.animate(Raphael.animation({arc: arc3[2], "stroke-width": width2}, delays[4][0], delays[4][2]).delay(delays[4][1]));
	sq1.animate(Raphael.animation({x: 96, y: 187, width: 30, height: 15}, delays[4][0], delays[4][2]).delay(delays[4][1]));
	sq2.animate(Raphael.animation({x: 109, y:  52, width: 15, height: 15}, delays[4][0], delays[4][2]).delay(delays[4][1]));
}


// --Code--
//Start the animation process!
loadDependencies();