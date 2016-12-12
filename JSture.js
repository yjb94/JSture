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
    this.Points = Resample(points, NumPoints);
    var radians = IndicativeAngle(this.Points);
    this.Points = RotateBy(this.Points, -radians);
    this.Points = ScaleTo(this.Points, SquareSize);
    this.Points = TranslateTo(this.Points, Origin);

}

function JSture () {

		this.GestureArray = new Array(); // Array of Gestures

		this.Recognize = Recognize(name, this.GestureArray) // Recognize touch input

		this.AddGesture = function()
        {
            this.GestureArray[this.GestureArray.length] = new Gesture(name, points);    //append new gesture
        }; // Add Custom Gesture

		this.DeleteGesture = function()
        {
            //find gesture
            for (var i = 0; i < this.GestureArray.length; i++)
            {
                if (this.GestureArray[i].Name == name)
                {
                    this.GestureArray.splice(i, 1);
                    break;
                }
            }
            return this.GestureArray.length;
        }; // Delete Custom Gesture
}


//static values
var PointsNum = 64;
var Size = 250;
var Origin = new Point(0,0);
var PI = 0.5*(-1.0 + Math.sqrt(5.0));
var Theta = DegToRad(45.0);
var ThetaDelta = DegToRad(2.0);
var Diagonal = Math.sqrt(Size * Size + Size * Size);
var HalfDiagonal = 0.5 * Diagonal;

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

    return Math.atan2(c.y - points[0].y, c.x - points[0].x);
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
function Recognize(points, templates) {
    //default setting
    points = Resample(points, PointsNum);
    var radians = IndicativeAngle(points);
    points = RotateBy(points, -radians);
    points = ScaleTo(points, Size);
    points = TranslateTo(points, Origin);

    var b = +Infinity;
    var f = -1// to find match

    for(var i=0; i<templates.length; i++) {
        var d = DistanceAtBestAngle(points, templates[i], -Theta, Theta, ThetaDelta);

        if(d < b) {
            b = d;
            //T' <- Templates[i]?
            f = i;
        }
    }
    var score = 1 - b/0.5*Math.sqrt(Math.pow(Size,2) + Math.pow(Size,2));

    //return <T', score>??;
    return (f == -1) ? new Result("No match", 0.0) : new Result(templates[f].name,1.0 - b / HalfDiagonal)
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


//////////shortstraw for corner recognization
var threshold = 0.95;


function corners(points)
{
    var resampled = Resample(points, PointsNum);
    var corners = GetCorners(resampled);
    return corners
}


//get corners
//input : series of resmapled point
//output : resampled points that correspond to corners
function GetCorners(points)
{
    var corners = new Array();
    corners.push(0);
    var W = 3
    var straws = new Array();

    for(var i = W; i < points.length - W; i++)
    {
        straws[i] = Distance(points[i-W], points[i+W]);
    }
    var t = median(straws) * threshold;

    for(var i = W; i < points.length - W; i++)
    {
        var localMin = -1;
        var localMinIndex = -1;
        if(straws[i] < t)
        {
            localMin =  Number.POSITIVE_INFINITY;
            localMinIndex = i;

            while(i < straws.length && straws[i] < t)
            {
                if(straws[i] < localMin)
                {
                    localMin = straws[i];
                    localMinIndex = i;
                }
                i++;
            }
            corners.push(localMinIndex);
        }
    }
    corners.push(points.length - 1);
    corners = postProcessCorners(points, corners, straws);
    return corners;
}

//post process corners
//input : series of resampled points, an initial set of corners, and the straw distance for each point
//output : A set of post-processed with higher level polyline rules

function postProcessCorners(points, corners, straws)
{
    var go = false;
    var c1;
    var c2;
    while (!go)
    {
        go = true;
        for(var i = 1; i < corners.length; i++)
        {
            //이거 수도코드에서는 index가 아닌 value로 쓰는데 로직상 index가 맞는거 같음 좀 봐야댐
            c1 = corners[i-1];
            c2 = corners[i];
            if(!isLine(points, c1, c2))
            {
                var new_corner = HalfwayCorner(straws, c1, c2);
                // prevents adding undefined points
                if (newCorner > c1 && newCorner < c2)
                {
                    corners.splice(i,0,newCorner);
                    go = false;
                }
            }
        }
    }
    for(var i = 1; i < corners.length - 1; i++)
    {
        c1 = corners[i-1];
        c2 = corners[i+1];
        if(isLine(points, c1, c2))
        {
            corners.splice(i, 1);
            i--;
        }
    }
    return corners;
}

function HalfwayCorner(straws, a, b)
{
    var quarter = (b-a)/4;
    var min_value =  Number.POSITIVE_INFINITY;
    var min_index = -1;
    for(var i = a+quarter; i < b-quarter; i++)
    {
        if(straws[i] < min_value)
        {
            min_value = straws[i];
            min_index = i;
        }
    }
    return min_index;
}

function isLine(points, a, b)
{
    var distance = Distance(points[a], points[b]);
    var path_distance = PathDistance(points, a, b);

    return (distance/path_distance) > threshold;
}

function PathDistance(points, a, b)
{
    var d = 0;
    for(var i = a; i < b; i++)
        d = d + Distance(point[i], points[i+1]);
    return d;
}

function median(values)
{
    var s = values.concat();
    s.sort();
    var m;
    if (s.length % 2 == 0)
    {
        m = s.length / 2;
        return (s[m - 1] + s[m]) / 2;
    }
    else
    {
        m = (s.length + 1) / 2;
        return s[m - 1];
    }
}

/////
function Centroid(points)
{
    var x = 0.0, y = 0.0;
    for (var i = 0; i < points.length; i++) {
        x += points[i].x;
        y += points[i].y;
    }
    x /= points.length;
    y /= points.length;
    return new Point(x, y);
}