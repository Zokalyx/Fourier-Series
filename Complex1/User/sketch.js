let time;
let mode = 0;
let func = [];
let c0 = [];
let positiveNums = [];
let positiveOrder = 0;
let negativeNums = [];
let negativeOrder = 0;
let appro = [];
let graph = [];
let speed;
let drawing = false;
let show = false;

function setup() {
	createCanvas(600,600);
}

function draw() {
	background(0);
	scale(1,-1);
	if (mode == 0 && drawing) {
		translate(width/2,-height/2);
		let x = mouseX-width/2;
		let y = height/2-mouseY;
		func.push([x,y,true]);
		noFill();
		stroke(255);
		beginShape();
		for (let i = 0; i < func.length; i++) {
			vertex(func[i][0],func[i][1]);
		}
		endShape();
	} else if (mode == 1) {
		drawing = false;
		translate(width/2,-height/2);
		makeAppro(time);
		graph.push(appro);
		if (graph.length > 1/speed) {
			graph.shift();
		}
		strokeWeight(1);
		if (show) {
			stroke(255);
			beginShape();
			for (let i = 0; i < func.length; i++) {
				vertex(func[i][0],func[i][1]);
			}
			endShape(CLOSE);
		}
		display(time);
		strokeWeight(3);
		stroke(255,0,0);
		noFill();
		beginShape();
		for (let i = 0; i < graph.length; i++) {
			vertex(graph[i][0],graph[i][1]);
		}
		if (graph.length >= 1/speed) {
			endShape(CLOSE);
		} else {
			endShape();
		}
		time += speed;
	}
}

function mouseClicked() {
	if (mode == 1 && !drawing) {
		doNext(1);
	}
}

function mousePressed() {
	drawing = true;
}

function mouseReleased() {
	if (mode == 0) {
		mode = 1;
		time = 0;
		speed = 1/func.length;
		c0 = findCoefficient(0);
		appro = c0;
	}
}

function convert(num) {
	let ans = [];
	if (num[2]) {
		ans.push(sqrt(num[0]*num[0]+num[1]*num[1]));
		let ang;
		if (num[0] == 0) {
			if (num[1] >= 0) {
				ang = PI/2;
			} else {
				ang = -PI/2;
			}
		} else {
			ang = atan(num[1]/num[0]);
			if (num[0] < 0) {
				ang += PI;
			}
		}
		ans.push(ang);
		ans.push(false);
	} else {
		ans.push(num[0]*cos(num[1]));
		ans.push(num[0]*sin(num[1]));
		ans.push(true);
	}
	return ans;
}

function mult(num1,num2) {
	let re = num1[0]*num2[0]-num1[1]*num2[1];
	let im = num1[0]*num2[1]+num1[1]*num2[0];
	return [re,im,true];
}

function eToThe(arg) {
	return [cos(arg),sin(arg),true];
}

function findCoefficient(n) {
	let re = 0;
	let im = 0;
	let argovert = -n*TWO_PI/func.length;
	for (let t = 0; t < func.length; t++) {
		let num = mult(func[t],eToThe(argovert*t));
		re += num[0]/func.length;
		im += num[1]/func.length;
	}
	return [re,im,true];
}

function makeAppro(t) {
	let re = c0[0];
	let im = c0[1];
	for (let n = 1; n <= positiveOrder; n++) {
		let num = mult(positiveNums[n-1],eToThe(n*TWO_PI*t));
		re += num[0];
		im += num[1];
	}
	for (let n = -1; n >= -negativeOrder; n--) {
		let num = mult(negativeNums[-n-1],eToThe(n*TWO_PI*t));
		re += num[0];
		im += num[1];
	}
	appro = [re,im,true];
}

function display(t) {
	push();
	translate(c0[0],c0[1]);
	stroke(0,100,255);
	for (let n = 1; n <= positiveOrder; n++) {
		let num = convert(mult(positiveNums[n-1],eToThe(n*TWO_PI*t)));
		ellipse(0,0,2*num[0]);
		rotate(num[1]);
		line(0,0,num[0],0);
		translate(num[0],0);
		rotate(-num[1]);
		if (negativeOrder < n) {
			continue;
		} else {
			num = convert(mult(negativeNums[n-1],eToThe(-n*TWO_PI*t)));
			ellipse(0,0,2*num[0]);
			rotate(num[1]);
			line(0,0,num[0],0);
			translate(num[0],0);
			rotate(-num[1]);
		}
	}
	pop();
}

function keyPressed() {
	graph = [];
}

function doNext(n) {
	for (let i = 0; i < n; i++) {
		for (let i = 0; i < 1; i++) {
			if (positiveOrder <= negativeOrder) {
				positiveOrder ++;
				positiveNums.push(findCoefficient(positiveOrder));
			} else {
				negativeOrder++;
				negativeNums.push(findCoefficient(-negativeOrder));
			}
		}
	}
}