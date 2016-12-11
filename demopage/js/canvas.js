/**
 * Created by nypark on 2016. 12. 12..
 */
var mousePressed = false;
var lastX, lastY;
var ctx;

function InitCanvas() {
    ctx = document.getElementById('demoCanvas').getContext("2d");

    $('#demoCanvas').mousedown(function (e) {
        mousePressed = true;
        Draw(e.pageX - $(this).offset().left, e.pageY - $(this).offset().top, false);
    });

    $('#demoCanvas').mousemove(function (e) {
        if (mousePressed) {
            Draw(e.pageX - $(this).offset().left, e.pageY - $(this).offset().top, true);
        }
    });

    $('#demoCanvas').mouseup(function (e) {
        mousePressed = false;
        clearArea();
    });
    $('#demoCanvas').mouseleave(function (e) {
        mousePressed = false;
    });
}

function Draw(x, y, isDown) {
    if (isDown) {
        ctx.beginPath();
        //ctx.strokeStyle = $('#selColor').val();
        //ctx.lineWidth = $('#selWidth').val();
        ctx.strokeStyle = "gray";
        ctx.lineWidth = 7;
        ctx.lineJoin = "round";
        ctx.moveTo(lastX, lastY);
        ctx.lineTo(x, y);
        ctx.closePath();
        ctx.stroke();
    }
    lastX = x; lastY = y;
}

function clearArea() {
    // Use the identity matrix while clearing the canvas
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
}