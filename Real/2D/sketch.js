let time;
let mode = 0;
let func;
let hori;
let verti;
let xgraph;
let ygraph;
let speed = 0.001;
let drawing = false;
let show = true;

function setup() {
	createCanvas(600,600);
	func = new Vals();
	xgraph = [];
	ygraph = [];
}

function draw() {
	background(0);
	scale(1,-1);
	if (mode == 0 && drawing) {
		translate(width/2,-height/2);
		func.addCoor(mouseX-width/2,height/2-mouseY);
		noFill();
		stroke(255);
		beginShape();
		for (let i = 0; i < func.p; i++) {
			vertex(func.xp[i],func.yp[i])
		}
		endShape();
	} else if (mode == 1) {
		drawing = false;
		strokeWeight(1);
		push();
		translate(1/6*width,-2/3*height);
		rotate(PI/2);
		verti.disp(time,3/5);
		stroke(0,100,255,100);
		line(verti.val,verti.otherVal,verti.val,-1000);
		pop();
		push();
		translate(2/3*width,-1/6*height);
		hori.disp(time,3/5);
		stroke(0,100,255,100);
		line(hori.val,hori.otherVal,hori.val,-1000);
		pop();
		xgraph.push(hori.val);
		ygraph.push(verti.val);
		if (xgraph.length > 1/speed) {
			xgraph.shift();
			ygraph.shift();
		}
		push();
		translate(2/3*width,-2/3*height);
		strokeWeight(2);
		if (show) {
			func.disp(3/5);
		}
		stroke(255,0,0);
		noFill();
		beginShape();
		for (let i = 0; i < xgraph.length; i++) {
			vertex(xgraph[i],ygraph[i]);
		}
		if (xgraph.length >= 1/speed) {
			endShape(CLOSE);
		} else {
			endShape();
		}
		pop();
		time+= speed;
	}
}

function mouseClicked() {
	if (mode == 1 && !drawing) {
		if (mouseX < 1/3*width && mouseY > 1/3*height) {
			verti.next(func.yp);
		} else if (mouseY < 1/3*height && mouseX > 1/3*width) {
			hori.next(func.xp);
		} else if (mouseX > 1/3*width && mouseY > 1/3*height) {
			if (show) {
				show =false;
			} else {
				show = true;
			}
		} else {
			verti.next(func.yp);
			hori.next(func.xp);
		}
	}
}

function mousePressed() {
	drawing = true;
}

function mouseReleased() {
	if (mode == 0) {
		mode = 1;
		hori = new Appro(func.xp);
		verti = new Appro(func.yp);
		time = 0;
		speed = 1/func.p;
	}
}

function integrate(f) {
	let ans = 0;
	for (let i = 0; i < f.length; i++) {
		ans += f[i];
	}
	return ans;
}

function integrateWithCos(f,n) {
	let ans = 0;
	for (let i = 0; i < f.length; i++) {
		ans += f[i]*cos(n*TWO_PI*i/f.length);
	}
	return ans;
}

function integrateWithSin(f,n) {
	let ans = 0;
	for (let i = 0; i < f.length; i++) {
		ans += f[i]*sin(n*TWO_PI*i/f.length);
	}
	return ans;
}

class Vals {
	constructor() {
		this.xp = [];
		this.yp = [];
		this.p = 0;
	}
	addCoor(x,y) {
		this.xp.push(x);
		this.yp.push(y);
		this.p++;
	}
	disp(scalar) {
		let x;
		let y;
		noFill();
		stroke(255);
		beginShape();
		for (let i = 0; i < this.p; i++) {
			x = this.xp[i]*scalar;
			y = this.yp[i]*scalar;
			vertex(x,y);
		}
		endShape(CLOSE);
	}
}

class Appro {
	constructor(f) {
		this.a0 = integrate(f)/f.length;
		this.radii = [];
		this.alphas = [];
		this.order = 0;
		this.val = this.a0;
		this.otherVal = 0;
	}
	next(f) {
		this.order++;
		let a = 2*integrateWithCos(f,this.order)/f.length;
		let b = 2*integrateWithSin(f,this.order)/f.length;
		let alph;
		if (a == 0) {
			if (b >= 0) {
				alph = PI/2;
			} else {
				alph -PI/2;
			}
		} else {
			alph = atan(b/a);
			if (a < 0) {
				alph += PI;
			}
		}
		let radiu = sqrt(a*a+b*b);
		this.radii.push(radiu);
		this.alphas.push(alph);
	}
	disp(t,scalar) {
		this.val = 0;
		this.otherVal = 0;
		stroke(255,0,0);
		noFill();
		push();
		translate(scalar*this.a0,0);
		this.val += scalar*this.a0;
		for (let i = 1; i <= this.order; i++) {
			ellipse(0,0,2*scalar*this.radii[i-1]);
			rotate(i*TWO_PI*t-this.alphas[i-1]);
			line(0,0,scalar*this.radii[i-1],0);
			translate(scalar*this.radii[i-1],0);
			rotate(this.alphas[i-1]-i*TWO_PI*t);
			this.val += scalar*this.radii[i-1]*cos(i*TWO_PI*t-this.alphas[i-1]);
			this.otherVal += scalar*this.radii[i-1]*sin(i*TWO_PI*t-this.alphas[i-1]);
		}
		pop();
	}
}