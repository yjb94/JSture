/*

Jsture

User Cutomizable Gesture Recognition Library


*/

function Point(x, y)
{
	this.X = x;
	this.Y = y;
}

function Gesture (name, points) {

	this.Name = name;

	this.Points = points; // Array of Pointer

}

function Jsture () {

		this.GestureArray = new Array(); // Array of Gestures

		this.Recognize = function() {}; // Recognize touch input

		this.AddGesture = function() {}; // Add Custom Gesture

		this.DeleteGesture = function() {}; // Delete Custom Gesture
}

function PathDistance(points) // length traversed by a point path
{
	var d = 0.0;
	for (var i = 1; i < points.length; i++)
		d += Distance(points[i - 1], points[i]);
	return d;
}

function Resample(points, n)
{
	
}