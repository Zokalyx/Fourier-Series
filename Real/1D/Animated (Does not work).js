let mode = -1; //0 = Drawing. 1 = Viewing. -1 = StandBy.
let points = [];
let solution = [];
let otherSol = [];
let diff = [];
let aux = [];
let transitionTimer;
let transitioning = false;
let time = 0;
let coeffs = []; //Structure: Index: 0 = A_0. Odd >= 1 = A_N. Even >= 2 = B_N.
let period;
let transitionTime = 10;
let limit = 0;
let actualLimit = 50;

function setup() {
	createCanvas(800,600);
}

function draw() {
	translate(0,height/2);
	scale(1,-1);
	background(0);
	stroke(255);
	line(0,0,width,0);
	if (mode == 0) {
		points.push(height/2-mouseY);
		stroke(255);
		noFill();
		beginShape();
		for (let i = 0; i < points.length; i++) {
			vertex(width+i-time,points[i]);
		}
		endShape();
		time++;
	} else if (mode == 1) {
		graphFunc();
		if (limit < actualLimit) {
			if (!transitioning) {
				transtitioning = true;
				for (let i = 0; i < points.length; i++) {
					aux[i] = series(i);
					solution[i] = aux[i];
				}
				findNext(points);
				for (let i = 0; i < points.length; i++) {
					otherSol[i] = series(i);
					diff[i] = otherSol[i]-solution[i];
				}
				transitionTimer = 0;
				limit++;
			} else {
				for (let i = 0; i < points.length; i++) {
					solution[i] = aux[i]+diff[i]*transFactor(transitionTimer);
				}
				transitionTimer++;
				if (transitionTimer >= transitionTime) {
					transitioning = false;
				}
			}
		}
		graphSeries();
	}
}

function mouseClicked() {
	if (mode == -1) {
		mode = 0;
	} else if (mode == 0) {
		mode = 1;
		period = points.length;
		findFirst(points);
	}
}

function integrate(func,state,n,dx) { //State: -1 is just the function, 0 is with cosine, 1 is with sine.
	let answer = 0;
	for (let i = 0; i < period; i++) {
		if (state == -1) {
			answer += func[i]*dx;
		} else if (state == 0) {
			answer += func[i]*cos(TWO_PI*n*i/period)*dx;
		} else if (state == 1) {
			answer += func[i]*sin(TWO_PI*n*i/period)*dx;
		}
	}
	return answer;
}

function coefficient(func,isA,n) { //aorb, True if A, False if B.
	let answer = 0;
	if (isA) {
		if (n == 0) {
			answer = 2*integrate(func,-1,0,1)/func.length;
		} else {
			answer = 2*integrate(func,0,n,1)/func.length;
		}
	} else {
		answer = 2*integrate(func,1,n,1)/func.length;
	}
	return answer;
}

function findFirst(func) {
	coeffs.push(coefficient(func,true,0));
}

function findNext(func) {
	let n = (coeffs.length-1)/2+1;
	coeffs.push(coefficient(func,true,n));
	coeffs.push(coefficient(func,false,n));
}

function series(x) { //HERE X SHOULD GO BETWEEN 0 and func.length;
	let answer = coeffs[0]/2;
	let order = (coeffs.length-1)/2;
	for (let n = 1; n <= order; n++) {
		answer += coeffs[2*n-1]*cos(TWO_PI*n*x/period);
		answer += coeffs[2*n]*sin(TWO_PI*n*x/period);	
	}
	return answer;
}

function graphFunc() {
	noFill();
	stroke(255);
	beginShape();
	for (let i = 0; i < points.length; i++) {
		let x = map(i,0,points.length-1,0,width);
		vertex(x,points[i]);
	}
	endShape();
}

function graphSeries() {
	noFill();
	stroke(255,0,0);
	beginShape();
	for (let i = 0; i < points.length; i++) {
		let x = map(i,0,points.length-1,0,width);
		vertex(x,solution[i]);
	}
	endShape();
}

function transFactor(tim) {
	return((1-cos(tim*PI/transitionTime))/2);
}