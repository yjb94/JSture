/*

Jsture

User Cutomizable Gesture Recognition Library


*/

function Point(x, y)
{
	this.x = x;
	this.y = y;
}

function Gesture (name, points) {

	this.Name = name;

	this.Points = points; // Array of Pointer

}

function Jsture () {

		this.GestureArray = new Array(); // Array of Gestures

		this.Recognize = function(points, n) {

        }; // Recognize touch input

		this.AddGesture = function() {}; // Add Custom Gesture

		this.DeleteGesture = function() {}; // Delete Custom Gesture
}


////////Unistroke Recognizer

//static values
var PointsNum = 64;
var Size = 250;
var PI = 0.5*(-1.0 + Math.sqrt(5.0));
var Theta = DegToRad(45.0);
var ThetaDelta = DegToRad(2.0);

//Step 1. Resample a points path into n evenly spaced points. We
//use n=64. For gestures serving as templates, Steps 1-3 should be
//carried out once on the raw input points. For candidates, Steps 1-4
//should be used just after the candidate is articulated.
function Resample(points, n)
{
    var I = PathLength(points)/(n-1);
    var D = 0;
    var newPoints = new Array(points[0]);
    var q = new Point(0.0, 0.0);

    for(var i=1; i<points.length; i++) {
        var d = Distance(points[i-1], points[i]);

        if((D+d) >= I) {
            q.x = points[i-1].x + ((I-D)/d)*(points[i].x-points[i-1].x);
            q.y = points[i-1].y + ((I-D)/d)*(points[i].y-points[i-1].y);
            newPoints.push(q);
            points.push(q);
            D = 0;
        } else {
            D = D+d;
        }
    }
    return newPoints;
}

function PathLength(points) {
    var d = 0;

    for(var i=1; i < points.length; i++) {
        d = d + Distance(points[i-1], points[i]);
    }

    return d;
}

//Step 2. Find and save the indicative angle ω from the points’
//centroid to first point. Then rotate by –ω to set this angle to 0°.
function IndicativeAngle(points) {
    var c = Centroid(points);

    return Math.atan2(c.y - points[o].y, c.x - points[0].x);
}

function RotateBy(points, w) {
    var c = Centroid(points);
    var newPoints = new Array(points[0]);
    var q = new Point(0.0, 0.0);

    for(var i=0; i<points.length; i++) {
        q.x = (points[i].x - c.x)*Math.cos(w) - (points[i].y - c.y)*Math.sin(w) + c.x;
        q.y = (points[i].x - c.x)*Math.sin(w) - (points[i].y - c.y)*Math.cos(w) + c.y;
        newPoints.push(q);
    }

    return newPoints;
}

//Step 3. Scale points so that the resulting bounding box will be of
//size2 size. We use size=250. Then translate points to the origin
//k=(0,0). BOUNDING-BOX returns a rectangle defined by (minx, miny), (maxx, maxy).
function ScaleTo(points, size) {
    var B = BoundingBox(points);
    var newPoints = new Array(points[0]);
    var q = new Point(0.0, 0.0);

    for(var i=0; i<points.length; i++) {
        q.x = points[i].x*size / B.width;
        q.y = points[i].y*size / B.height;
        newPoints.push(q);
    }

    return newPoints;
}

function TranslateTo(points, k) {
    var c = Centroid(points);
    var newPoints = new Array(points[0]);
    var q = new Point(0.0, 0.0);

    for(var i=0; i<points.length; i++) {
        q.x = points[i].x + k.x - c.x;
        q.y = points[i].y + k.y - c.y;
        newPoints.push(q);
    }

    return newPoints;
}

//Step 4. Match points against a set of templates. The size variable
//on line 7 of RECOGNIZE refers to the size passed to SCALE-TO in
//Step 3. The symbol ϕ equals ½(-1 + √5). We use θ=±45° and
//θΔ=2° on line 3 of RECOGNIZE. Due to using RESAMPLE, we can
//assume that A and B in PATH-DISTANCE contain the same number
//of points, i.e., |A|=|B|.
function Recongnize(points, templates) {
    var b = +Infinity;

    for(var i=0; i<templates.length; i++) {
        var d = DistanceAtBestAngle(points, templates[i], -Theta, Theta, ThetaDelta);

        if(d < b) {
            b = d;
            //T' <- Templates[i]?
        }
    }
    var score = 1 - b/0.5*Math.sqrt(Math.pow(Size,2) + Math.pow(Size,2));

    //return <T', score>??;
}

function DistanceAtBestAngle(points, T, thetaA, thetaB, thetaDelta) {
    var x1 = PI*thetaA + (1-PI)*thetaB;
    var f1 = DistanceAtAngle(points, T, x1);
    var x2 = (1-PI)*thetaA + PI*thetaB;
    var f2 = DistanceAtAngle(points, T, x2);

    while(Math.abs(thetaB-thetaA) > thetaDelta) {
        if(f1 < f2) {
            thetaB = x2;
            x2 = x1;
            f2 = f1;
            x1 = PI*thetaA+(1-PI)*thetaB;
            f1 = DistanceAtAngle(points, T, x1);
        } else {
            thetaA = x1;
            x1 = x2;
            f1 = f2;
            x2 = (1-PI)*thetaA + PI*thetaB;
            f2 = DistanceAtAngle(points, T, x2);
        }
    }
    return Math.min(f1, f2);
}

function DistanceAtAngle(points, T, theta) {
    var newPoints = RotateBy(points, theta);
    var d = PathDistance(newPoints, T); //d ← PATH-DISTANCE(newPoints, Tpoints)??

    return d;
}

function PathDistance(A, B) {
    var d = 0.0;

    for(var i=0; i<A.length; i++) {
        d = d + Distance(A[i], B[i]);
    }

    return d/A.length;
}

function DegToRad(deg) {
    return (deg * Math.PI / 180.0);
}

function Distance(p1, p2) {
    var dx = p2.x - p1.x;
    var dy = p2.y - p1.y;
    return Math.sqrt(dx * dx + dy * dy);
}