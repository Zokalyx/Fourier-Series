let time = 0;
let mode = 0;
let func = [];
let c0 = [];
let k;
let positiveNums = [];
let positiveOrder = 0;
let negativeNums = [];
let negativeOrder = 0;
let appro = [];
let graph = [];
let speed;
let show = false;
let valueForAngle;
let valueForSides;

function setup() {
	createCanvas(600,600);
	k = new Hilbert();
	k.next();
	k.next();
	k.next();
	k.next();
}

function draw() {
	if (mode == 0) {
		background(0);
		translate(width/2,height/2);
		scale(1,-1);
		stroke(255);
		k.disp(width/2);
	} else {
		background(0);
		scale(1,-1);
		translate(width/2,-height/2);
		makeAppro(time);
		graph.push(appro);
		if (graph.length > 1/speed) {
			graph.shift();
		}
		strokeWeight(1);
		if (show) {
			push();
			translate(-c0[0],-c0[1])
			stroke(255);
			beginShape();
			for (let i = 0; i < func.length; i++) {
				vertex(func[i][0],func[i][1]);
			}
			endShape(CLOSE);
			pop();
		}
		strokeWeight(5);
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
		stroke(0,255,0);
		strokeWeight(3);
		beginShape();
		strokeWeight(1);
		display(time);
		time += speed;
		if (time % 1 <= speed && positiveOrder < 2048) {
			doNext(2*positiveOrder);
		}
	}
}

function mouseClicked() {
	if (mode == 0) {
		funcAux = k.toArray(2,width/2);
		for (let i = 0; i < funcAux[0].length; i++) {
			func.push([funcAux[0][i],funcAux[1][i],true]);
		}
		speed = 1/func.length;
		c0 = findCoefficient(func,0);
		mode = 1;
		doNext(2);
	} else {
		if (positiveOrder < 2048) {
			doNext(2*positiveOrder);
		}
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

function sub(num1,num2) {
	return [num1[0]-num2[0],num1[1]-num2[1],true];
}

function eToThe(arg) {
	return [cos(arg),sin(arg),true];
}

function findCoefficient(fun,n) {
	let re = 0;
	let im = 0;
	let argovert = -n*TWO_PI/fun.length;
	for (let t = 0; t < fun.length; t++) {
		let num = mult(fun[t],eToThe(argovert*t));
		re += num[0]/fun.length;
		im += num[1]/fun.length;
	}
	return [re,im,true];
}

function makeAppro(t) {
	let re = 0;
	let im = 0;
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
	stroke(0,100,255,150);
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
	fill(255,0,0);
	noStroke();
	ellipse(0,0,16);
	noFill();
	pop();
}

class Hilbert {

	constructor() {
		this.n = 1;
		this.status = [3,1,3,1,3];   //0 = A (dot).1 = Turn (Right by default). 2 = Flip rotation orientation. 3. Move forward.
	}

	next() {
		this.n++;
		let aux = [1,2];
		for (let i = 0; i < this.status.length; i++) {
			aux.push(this.status[i]);
		}
		aux.push(2);
		aux.push(1);
		aux.push(3);
		for (let i = 0; i < this.status.length; i++) {
			aux.push(this.status[i]);
		}
		aux.push(2);
		aux.push(1);
		aux.push(3);
		aux.push(1);
		aux.push(2);
		for (let i = 0; i < this.status.length; i++) {
			aux.push(this.status[i]);
		}
		aux.push(3);
		aux.push(1);
		aux.push(2);
		for (let i = 0; i < this.status.length; i++) {
			aux.push(this.status[i]);
		}
		aux.push(2);
		aux.push(1);
		this.status = aux;
	}

	disp(length) {
		push();
		let l = length/Math.pow(2,this.n);
		let flipped = -1; //1 = True, -1 False.
		translate(-length+l/2,l/2);
		for (let asd = 0; asd < 4; asd++) {
			for (let i = 0; i < this.status.length; i++) {
				if (this.status[i] == 3) {
					line(0,0,0,l);
					translate(0,l);
				} else if (this.status[i] == 2) {
					flipped *= -1;
				} else if (this.status[i] == 1) {
					rotate(flipped*PI/2);
				}
			}
			if (asd == 0 || asd == 2) {
				rotate(PI/2);
				line(0,0,0,l);
				translate(0,l);
				rotate(PI/2);
			} else {
				line(0,0,0,l);
				translate(0,l);
			}
		}
		pop();
	}

	toArray(precision,length) { //Precision = integer greater than 0;
		let ansX = [];
		let ansY = [];
		let ang = PI/2;
		let flipped = -1;
		let l = length/Math.pow(2,this.n);
		let posX = -length+l/2;
		let posY = 0;
		for (let j = 0; j < 2; j++) {
			for (let k = 0; k < precision/2; k++) {
				ansX.push(posX);
				ansY.push(posY);
				posX += l/precision*cos(ang);
				posY += l/precision*sin(ang);
			}
			for (let asd = 0; asd < 2; asd++) {
				for (let i = 0; i < this.status.length; i++) {
					if (this.status[i] == 3) {
						for (let k = 0; k < precision; k++) {
							ansX.push(posX);
							ansY.push(posY);
							posX += l/precision*cos(ang);
							posY += l/precision*sin(ang);
						}
					} else if (this.status[i] == 2) {
						flipped *= -1;
					} else if (this.status[i] == 1) {
						ang += flipped*PI/2;
					}
				}
				if (asd == 0) {
					ang += PI/2;
					for (let k = 0; k < precision; k++) {
						ansX.push(posX);
						ansY.push(posY);
						posX += l/precision*cos(ang);
						posY += l/precision*sin(ang);
					}
					ang += PI/2
				}
			}
			for (let k = 0; k < precision/2; k++) {
				ansX.push(posX);
				ansY.push(posY);
				posX += l/precision*cos(ang);
				posY += l/precision*sin(ang);
			}
		}
		return [ansX,ansY];
	}
}

function doNext(n) {
	for (let i = 0; i < n; i++) {
		if (positiveOrder <= negativeOrder) {
			positiveOrder ++;
			positiveNums.push(findCoefficient(func,positiveOrder));
		} else {
			negativeOrder++;
			negativeNums.push(findCoefficient(func,-negativeOrder));
		}
	}
}