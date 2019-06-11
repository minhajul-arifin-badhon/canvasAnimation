// Initial Setup
var canvas = document.querySelector('canvas');
var c = canvas.getContext('2d');

canvas.width = innerWidth;
canvas.height = innerHeight;

var colors = [
	'#173F5F',
	'#20639B',
	'#3CAEA3',
	'#F6D55C',
    '#ED553B'
];

var friction = 2;
var normMax = 100;
//
// addEventListener("resize", function() {
// 	canvas.width = innerWidth;
// 	canvas.height = innerHeight;
//     init();
// });
//
// addEventListener("click", function(event) {
// 	animation.init();
// });


// Utility Functions
function randomIntFromRange(min,max) {
	return Math.floor(Math.random() * (max - min + 1) + min);
}

function randomColor(colors) {
	return colors[Math.floor(Math.random() * colors.length)];
}

function calculateDist(x1, y1, x2, y2) {
    var a = x1 - x2;
    var b = y1 - y2;
    return Math.sqrt( a*a + b*b );
}

function intersect(x1, y1, x2, y2, x3, y3, x4, y4) {
    // Check if none of the lines are of length 0
	if ((x1 === x2 && y1 === y2) || (x3 === x4 && y3 === y4)) {
		return false
	}

	denominator = ((y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1))

    // Lines are parallel
	if (denominator === 0) {
		return false
	}

	let ua = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / denominator
	let ub = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / denominator

    // is the intersection along the segments
	if (ua < 0 || ua > 1 || ub < 0 || ub > 1) {
		return false
	}

    // Return a object with the x and y coordinates of the intersection
	let x = x1 + ua * (x2 - x1)
	let y = y1 + ua * (y2 - y1)

	return {x, y}
}


// Object
function Particle(x, y, movement, magnitude, angle, lineWidth, radius, color) {
    this.initX = x;
    this.initY = y;
    this.x = x;
	this.y = y;
    this.expandedX = 2 * canvas.width * Math.cos(((180 - angle) * Math.PI) / 180) + this.initX;
    this.expandedY = 2 * canvas.width * Math.sin(((180 - angle) * Math.PI) / 180) + this.initY;

	this.dx = movement * Math.cos(((360 - angle) * Math.PI) / 180);
    this.dy = movement * Math.sin(((360 - angle) * Math.PI) / 180);
    this.magnitude = magnitude;
    this.angle = angle;
    this.color = color;
    this.lineWidth = lineWidth;
    this.radius = radius;
    this.isPrint = 0;
    this.isCheck = true;

	this.update = function() {
        if (this.isCheck && (this.x > canvas.width || this.x < 0 || this.y > canvas.height || this.y < 0)) {
            if(this.initX!= this.x || this.initY!=this.y) {

                var iPoints = []
                iPoints.push(intersect(0, 0, canvas.width, 0, this.expandedX, this.expandedY, this.x, this.y));
                iPoints.push(intersect(canvas.width, 0, canvas.width, canvas.height, this.expandedX, this.expandedY, this.x, this.y));
                iPoints.push(intersect(0, canvas.height, canvas.width, canvas.height, this.expandedX, this.expandedY, this.x, this.y));
                iPoints.push(intersect(0, 0, 0, canvas.height, this.expandedX, this.expandedY, this.x, this.y));

                var maxDist = 0;
                var nextX, nextY;
                for (let i = 0; i < iPoints.length; i++) {
            		if(iPoints[i]) {
                        if(iPoints[i].x >= 0 && iPoints[i].x <= canvas.width && iPoints[i].y >= 0 && iPoints[i].y <= canvas.height) {

                            var dist = calculateDist(this.x, this.y, iPoints[i].x, iPoints[i].y);
                            if(this.isPrint < 5) {
                                console.log(i);
                                console.log(this.x, this.y, iPoints[i].x, iPoints[i].y);
                                console.log(dist);
                            }
                            if(dist > maxDist) {
                                maxDist = dist;
                                nextX = (this.magnitude + this.radius) * Math.cos(((180 - this.angle) * Math.PI) / 180) + iPoints[i].x;
                                nextY = (this.magnitude + this.radius) * Math.sin(((180 - this.angle) * Math.PI) / 180) + iPoints[i].y;

                                if(this.isPrint < 5) {
                                    console.log("Next: ");
                                    console.log(nextX, nextY);
                                }
                            }
                        }
                    }
            	}
                this.x = nextX;
                this.y = nextY;
                this.isCheck = false;
                this.isPrint++;
            }
        }

		this.x += this.dx * friction;
		this.y += this.dy * friction;

        if(this.x >= 0 && this.x <= canvas.width && this.y >= 0 && this.y <= canvas.height)
            this.isCheck = true;

        this.draw();
	};

	this.draw = function() {
        var xFrom = this.x;
        var yFrom = this.y;
        var angleRad = ((360 - this.angle) * Math.PI) / 180;
        var xTo = (this.magnitude + this.radius) * Math.cos(angleRad) + xFrom;
        var yTo = (this.magnitude + this.radius) * Math.sin(angleRad) + yFrom;

        this.drawCircle();
        this.drawLine(xFrom, yFrom, xTo, yTo);
        this.drawArrowhead({x: xFrom, y: yFrom}, {x: xTo, y: yTo}, 1.5 * this.radius);
    };

    this.drawCircle = function() {
        c.beginPath();
		c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
		c.fillStyle = this.color;
        c.strokeStyle = this.color;
		c.fill();
		c.stroke();
		c.closePath();
    };

    this.drawLine = function(xFrom, yFrom, xTo, yTo) {
        c.beginPath();
        c.moveTo(xFrom, yFrom);
        c.lineTo(xTo, yTo);
        c.strokeStyle = this.color;
        c.lineWidth = this.lineWidth;
        c.stroke();
        c.closePath();
    };

    this.drawArrowhead = function(from, to, radius) {
    	var x_center = to.x;
    	var y_center = to.y;

    	var angle;
    	var x;
    	var y;

    	c.beginPath();

    	angle = Math.atan2(to.y - from.y, to.x - from.x)
    	x = radius * Math.cos(angle) + x_center;
    	y = radius * Math.sin(angle) + y_center;

    	c.moveTo(x, y);

    	angle += (1.0/3.0) * (2 * Math.PI)
    	x = radius * Math.cos(angle) + x_center;
    	y = radius * Math.sin(angle) + y_center;

    	c.lineTo(x, y);

    	angle += (1.0/3.0) * (2 * Math.PI)
    	x = radius *Math.cos(angle) + x_center;
    	y = radius *Math.sin(angle) + y_center;

    	c.lineTo(x, y);

    	c.closePath();

    	c.fill();
    };
}


function Animation() {
    this.particles = [];

    this.init = function(data, movement, lineWidth, radius) {
        this.particles = [];

        for (let i = 0; i < data.length; i++) {
            this.particles.push(new Particle(data[i][0], data[i][1], movement, data[i][2], data[i][3], lineWidth, radius, randomColor(colors)));
        }
    };

    // Animation Loop
    this.animate = function() {
    	requestAnimationFrame(this.animate.bind(this));

    	c.clearRect(0, 0, canvas.width, canvas.height);

    	for (let i = 0; i < this.particles.length; i++) {
    		this.particles[i].update();
    	}
    };
}
