let time;
let points;
let series;
let graph;
let mode;
let debug = false;
let speed = 0.5;
let shif = 0;

function setup() {
	createCanvas(800,500);
	mode = -1;
	graph = [];
	time = 0;
	shif = 0;
}

function draw() {
	background(0);
	if (mode == 0) {
		translate(0,height/2);
		scale(1,-1);
		points.p.push(height/2-mouseY);
		points.copy.push(height/2-mouseY);
		stroke(255);
		noFill();
		beginShape();
		for (let i = 0; i < points.p.length; i++) {
			vertex(width+i-time,points.p[i]);
		}
		endShape();
		time++;
	} else if (mode == 1) {
		translate(225,250);
		scale(1,-1);
		series.disp(time,300,points.p.length,graph);
		translate(250,0);
		noFill();
		/*stroke(255);
		beginShape();
		for (let i = 2*points.p.length-1; i >= 0; i--) {
			let x = map(i,0,2*points.p.length-1,400,0);
			let h;
			if (i >= points.p.length) {
				h = map(points.copy[i-points.p.length],points.min,points.max,-series.sca*series.hei/2,series.sca*series.hei/2);
				vertex(x,h)
			} else {
				h = map(points.copy[i],points.min,points.max,-series.sca*series.hei/2,series.sca*series.hei/2);
				vertex(x,h);
			}
		}
		if (shif == 1) {
			shif = 0;
			points.copy.push(points.copy.shift());
		} else {
			shif++;
		}
		endShape();*/
		stroke(255,0,0);
		beginShape();
		for (let i = graph.length - 1; i >= 0; i--) {
			let x = map(graph.length - 1 - i,0,4*points.p.length,0,400);
			vertex(x,graph[i]);
		}
		endShape();
		time+=speed;
	}
}

function integ(func,withWhat = 0,n = 0) { //withWhat = 0 -> Alone. = -1 -> With cosine. = 1 -> with Sine.
	let ans = 0;
	let period = func.p.length;
	if (withWhat == -1) {
		for (let x = 0; x < period; x++) {
			ans += cos(TWO_PI*n*x/period)*func.p[x]*func.dx;
		}
	} else if (withWhat == 0) {
		for (let x = 0; x < period; x++) {
			ans += func.p[x]*func.dx;
		}
	} else if (withWhat == 1) {
		for (let x = 0; x < period; x++) {
			ans += sin(TWO_PI*n*x/period)*func.p[x]*func.dx;
		}
	}
	return ans;
}

function alp(a,b) { //A = coefficient of Cos. B = coefficient of Sin.
	if (a == 0) {
		if (b >= 0) {
			return PI/2;
		} else {
			return -PI/2;
		}
	} else {
		let ans = atan(b/a);
		if (a < 0) {
			ans += PI;
		}
		return ans;
	}
}

function c(a,b) {
	return sqrt(a*a + b*b);
}

function replace(a,b) {
	return [c(a,b),alp(a,b)];
}

function getCoeff(func,n = 0,cosOrNot = undefined) {
	let period = func.p.length;
	let ans;
	if (n == 0) {
		ans = integ(func)/period;
	} else {
		if (cosOrNot) {
			ans = 2*integ(func,-1,n)/period;
		} else {
			ans = 2*integ(func,1,n)/period;
		}
	}
	return ans;
}

class Vals {
	constructor() {
		this.p = [];
		this.copy = [];
		this.dx = 1;
		this.max = 0;
		this.min = 0;
		this.maxindex;
		this.minindex;
	}
}

class Appro {
	constructor(func) {
		this.coe = [getCoeff(func)];
		this.totLen = this.coe[0];
		this.order = 0;
		this.xvals = [];
		this.yvals = [];
		this.wid;
		this.hei;
		this.xpos;
		this.ypos;
		this.sca;
		this.update = 0;
	}
	next(func) {
		this.order++;
		let a = getCoeff(func,this.order,true);
		let b = getCoeff(func,this.order,false);
		let newv = replace(a,b);
		let newc = newv[0];
		let newalp = newv[1];
		this.coe.push(newc);
		this.coe.push(newalp);
		this.totLen += newv[0];
	}
	init(func) {
		this.update = 0;
		this.xvals = [];
		this.yvals = [];
		let xval;
		let yval;
		let period = func.p.length;
		for (let i = 0; i < period; i += 0.1) {
			//yval = this.coe[0];
			yval = 0;
			xval = 0;
			for (let j = 1; j <= this.order; j++) {
				yval += this.coe[2*j-1]*cos(this.coe[2*j]-j*TWO_PI*i/period);
				xval += this.coe[2*j-1]*sin(this.coe[2*j]-j*TWO_PI*i/period);
			}
			this.yvals.push(yval);
			this.xvals.push(xval);
		}
		let xmax = 0;
		let xmin = 0;
		for (let i = 0; i < this.xvals.length; i++) {
			if (this.xvals[i] > xmax) {
				xmax = this.xvals[i];
			} else if (this.xvals[i] < xmin) {
				xmin = this.xvals[i];
			}
		}
		this.wid = xmax - xmin;
		this.xpos = (xmax+xmin)/2;
		let ymax = 0;
		let ymin = 0;
		for (let i = 0; i < this.yvals.length; i++) {
			if (this.yvals[i] > ymax) {
				ymax = this.yvals[i];
			} else if (this.yvals[i] < ymin) {
				ymin = this.yvals[i];
			}
		}
		this.hei = ymax - ymin;
		this.ypos = (ymax+ymin)/2;
	}
	disp(t,radius,period,storage) { //Radius is size of the total drawing.
		if (this.wid > this.hei) {
			this.sca = radius/this.wid;
		} else {
			this.sca = radius/this.hei;
		}
        //scale(sca);
        push();
        translate(-this.sca*this.xpos,-this.sca*this.ypos);
        stroke(0,100,255,100);
        beginShape();
        for (let i = 0; i < this.xvals.length; i++) {
        	vertex(this.sca*this.xvals[i],this.sca*this.yvals[i]);
        }
        endShape(CLOSE);
		let value = -this.sca*this.ypos;
		let xvalue = -this.sca*this.xpos;
		push();
		//translate(0,this.coe[0]*sca);
		//value = this.coe[0]*sca;
		for (let i = 1; i <= this.order; i++) {
			noFill();
			stroke(255,0,0,100);
			ellipse(0,0,this.sca*this.coe[2*i-1]*2);
			rotate(-this.coe[2*i]+i*TWO_PI*t/period);
			line(0,0,0,this.sca*this.coe[2*i-1]);
			translate(0,this.sca*this.coe[2*i-1]);
			rotate(+this.coe[2*i]-i*TWO_PI*t/period);
			value+= this.sca*this.coe[2*i-1]*cos(-this.coe[2*i]+i*TWO_PI*t/period);
			xvalue += this.sca*this.coe[2*i-1]*sin(this.coe[2*i]-i*TWO_PI*t/period);
		}
		pop();
		pop();
		line(xvalue,value,250,value);
		if (t < 2*period) {
			storage.push(value);
	    } else if (this.update < storage.length) {
	    	storage.shift();
	    	storage.push(value);
	    } else {
	    	storage.push(storage.shift());
	    }
	    this.update++;
	}
}

function mouseClicked() {
	if (mode == -1) {
		mode = 0;
		points = new Vals();
		if (debug) {
			for (let i = -50; i <= 50; i+=1) {
				points.p.push(i);
			}
			series = new Appro(points);
			for (let i = 0; i < 1; i++) {
				series.next(points);
			}
			series.init(points);
			mode = 1;
			time = 0;
		}
	} else if (mode == 0) {
		points.min = points.p[0];
		points.max = points.p[0];
		for (let i = 0; i < points.p.length; i++) {
			if (points.p[i] > points.max) {
				points.max = points.p[i];
				points.maxindex = i;
			} else if (points.p[i] < points.min) {
				points.min = points.p[i];
				points.minindex = i;
			}
		}
		let g = 0;
		if (points.p[0] == points.min) {
			if (points.p[1] > points.p[points.p.length-1]) {
				 g = 0.09*abs(points.p[1]-points.p[0]);
			} else {
				 g = 0.09*abs(points.p[points.p.length-1]-points.p[0]);
			}
		} else if (points.p[points.p.length-1] == points.min) {
			if (points.p[0] > points.p[points.p.length-1]) {
				 g = 0.09*abs(points.p[points.p.length-1]-points.p[0]);
			} else {
				 g = 0.09*abs(points.p[points.p.length-1]-points.p[points.p.length-2]);
			}
		} else {
			if (points.p[points.minindex-1] > points.p[points.minindex+1]) {
				 g = 0.09*abs(points.p[points.minindex-1]-points.p[points.minindex]);
			} else {
				 g = 0.09*abs(points.p[points.minindex+1]-points.p[points.minindex]);
			}
		}
		points.min -= g;
		if (points.p[0] == points.max) {
			if (points.p[1] < points.p[points.p.length-1]) {
				 g = 0.09*abs(points.p[1]-points.p[0]);
			} else {
				 g = 0.09*abs(points.p[points.p.length-1]-points.p[0]);
			}
		} else if (points.p[points.p.length-1] == points.max) {
			if (points.p[0] < points.p[points.p.length-1]) {
				 g = 0.09*abs(points.p[points.p.length-1]-points.p[0]);
			} else {
				 g = 0.09*abs(points.p[points.p.length-1]-points.p[points.p.length-2]);
			}
		} else {
			if (points.p[points.maxindex-1] < points.p[points.maxindex+1]) {
				 g = 0.09*abs(points.p[points.maxindex-1]-points.p[points.maxindex]);
			} else {
				 g = 0.09*abs(points.p[points.maxindex+1]-points.p[points.maxindex]);
			}
		}
		points.max += g;
		series = new Appro(points);
		for (let i = 0; i < 1; i++) {
			series.next(points);
		}
		series.init(points);
		mode = 1;
		time = 0;
	} else {
		series.next(points);
		series.init(points);
	}
}