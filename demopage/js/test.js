/**
 * Created by nypark on 2016. 12. 12..
 */
//
    // Startup
    //
var _isDown, _points, _r, _g, _rc;
function onLoadEvent()
{
    _points = new Array();
    _r = new DollarRecognizer();

    var canvas = document.getElementById('myCanvas');
    _g = canvas.getContext('2d');
    _g.fillStyle = "rgb(0,0,0)";
    _g.strokeStyle = "gray";
    _g.lineWidth = 7;
    _g.font = "16px Gentilis";
    _rc = getCanvasRect(canvas); // canvas rect on page

    _isDown = false;
}
function getCanvasRect(canvas)
{
    var w = canvas.width;
    var h = canvas.height;

    var cx = canvas.offsetLeft;
    var cy = canvas.offsetTop;
    while (canvas.offsetParent != null)
    {
        canvas = canvas.offsetParent;
        cx += canvas.offsetLeft;
        cy += canvas.offsetTop;
    }
    return {x: cx, y: cy, width: w, height: h};
}
function getScrollY()
{
    var scrollY = $(window).scrollTop();
    return scrollY;
}
//
// Mouse Events
//
function mouseDownEvent(x, y)
{
    document.onselectstart = function() { return false; } // disable drag-select
    document.onmousedown = function() { return false; } // disable drag-select
    _isDown = true;
    x -= _rc.x;
    y -= _rc.y - getScrollY();
    if (_points.length > 0)
        _g.clearRect(0, 0, _rc.width, _rc.height);
    _points.length = 1; // clear
    _points[0] = new Point(x, y);
    _g.fillRect(x - 4, y - 3, 9, 9);
}
function mouseMoveEvent(x, y)
{
    if (_isDown)
    {
        x -= _rc.x;
        y -= _rc.y - getScrollY();
        _points[_points.length] = new Point(x, y); // append
        drawConnectedPoint(_points.length - 2, _points.length - 1);
    }
}
function mouseUpEvent(x, y)
{
    document.onselectstart = function() { return true; } // enable drag-select
    document.onmousedown = function() { return true; } // enable drag-select
    if (_isDown)
    {
        _isDown = false;
        if (_points.length >= 10)
        {
            var result = _r.Recognize(_points);
            $("#existGestureName").val("Result: " + result.Name + " (" + round(result.Score,2) + ").");
        }
        else // fewer than 10 points were inputted
        {
            $("#existGestureName").val(("좌표 수가 너무 적습니다."));
        }
    }
}
function drawConnectedPoint(from, to)
{
    _g.beginPath();
    _g.moveTo(_points[from].X, _points[from].Y);
    _g.lineTo(_points[to].X, _points[to].Y);
    _g.closePath();
    _g.stroke();
}
function round(n, d) // round 'n' to 'd' decimals
{
    d = Math.pow(10, d);
    return Math.round(n * d) / d
}

//
// Unistroke Adding and Clearing
//
function onClickAddCustom()
{
    var name = document.getElementById('newGestureName').value;
    if (_points.length >= 10 && name.length > 0)
    {
        var num = _r.AddGesture(name, _points);
        $("#newGestureName").val("\"" + name + "\" 가 추가되었습니다.");
    }
}
function onClickDelete()
{
    var num = _r.DeleteUserGestures(); // deletes any user-defined unistrokes
    alert("All user-defined gestures have been deleted. Only the 1 predefined gesture remains for each of the " + num + " types.");
}