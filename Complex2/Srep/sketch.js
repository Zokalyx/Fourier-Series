let time = 0;
let mode = 0;
let funcs = [];
let c0 = [];
let k;
let positiveNums = [];
let positiveOrder = [];
let positiveCorrectedOrder = [];
let negativeCorrectedOrder = [];
let negativeNums = [];
let negativeOrder = [];
let funcsAux = [];
let appro = [];
let graph = [];
let speed;
let show = false;
let valueForAngle;
let valueForSides;

function setup() {
	createCanvas(600,600);
	k = new Srep();
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
		valueForAngle = map(mouseX,0,width,0,PI/3);
		valueForSides = round(map(mouseY,0,height,2,6));
		k.disp(150,valueForAngle,valueForSides);
	} else {
		background(0);
		scale(1,-1);
		translate(width/2,-height/2);
		makeAppro(time);
		for (let i = 0; i < funcs.length; i++) {
			graph[i].push(appro[i]);
			if (graph[i].length > 1/speed) {
				graph[i].shift();
			}
		}
		strokeWeight(1);
		if (show) {
			push();
			translate(-c0[0],-c0[1])
			stroke(255);
			beginShape();
			for (let i = 0; i < funcs[0].length; i++) {
				vertex(funcs[0][i][0],funcs[0][i][1]);
			}
			endShape(CLOSE);
			pop();
		}
		strokeWeight(2);
		noFill();
		for (let k = 0; k < funcs.length; k++) {
			beginShape();
			if (k == 0) {
				stroke(0,255,0);
			} else if (k == 1) {
				stroke(0,0,255);
			} else if (k == 2) {
				stroke(100);
			} else {
				stroke(255,0,0);
			}
			for (let i = 0; i < graph[k].length; i++) {
				vertex(graph[k][i][0],graph[k][i][1]);
			}
			if (graph[k].length >= 1/speed) {
				endShape(CLOSE);
			} else {
				endShape();
			}
		}
		display(time);
		time += speed;
	}
}

function mouseClicked() {
	if (mode == 0) {
		funcsAux.push(k.toArray(27,150,valueForAngle,valueForSides));
		k.next();
		funcsAux.push(k.toArray(9,150,valueForAngle,valueForSides));
		k.next();
		funcsAux.push(k.toArray(3,150,valueForAngle,valueForSides));
		for (let j = 0; j < funcsAux.length; j++) {
			funcs.push([]);
			for (let i = 0; i < funcsAux[0][0].length; i++) {
				funcs[j].push([funcsAux[j][0][i],funcsAux[j][1][i],true]);
			}
		}
		speed = 1/funcs[0].length;
		c0 = findCoefficient(funcs[0],0);
		mode = 1;
		for (let i = 0; i < funcs.length; i++) {
			graph.push([]);
			positiveNums.push([]);
			negativeNums.push([]);
			positiveOrder.push(0);
			negativeOrder.push(0);
			positiveCorrectedOrder.push(0);
			negativeCorrectedOrder.push(0);
		}
		let arr = [5,10,20];
		doNext(arr);
	} else {
		let arr = [5,10,20];
		doNext(arr);
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
	appro = [];
	let re = [];
	let im = [];
	for (let i = 0; i < funcs.length; i++) {
		re.push(0);
		im.push(0);
	}
	for (let i = 0; i < funcs.length; i++) {
		for (let n = 1; n <= positiveOrder[i]; n++) {
			let num = mult(positiveNums[i][n-1],eToThe(n*TWO_PI*t));
			re[i] += num[0];
			im[i] += num[1];
			for (let j = i+1; j < funcs.length; j++) {
				re[j] += num[0];
				im[j] += num[1];
			}
		}
		for (let n = -1; n >= -negativeOrder[i]; n--) {
			let num = mult(negativeNums[i][-n-1],eToThe(n*TWO_PI*t));
			re[i] += num[0];
			im[i] += num[1];
			for (let j = i+1; j < funcs.length; j++) {
				re[j] += num[0];
				im[j] += num[1];
			}
		}
		appro.push([re[i],im[i],true]);
	}
}

function display(t) {
	push();
	strokeWeight(1);
	for (let k = 0; k < funcs.length; k++) {
		stroke(255,150);
		for (let n = 1; n <= positiveOrder[k]; n++) {
			let num = convert(mult(positiveNums[k][n-1],eToThe(n*TWO_PI*t)));
			ellipse(0,0,2*num[0]);
			rotate(num[1]);
			line(0,0,num[0],0);
			translate(num[0],0);
			rotate(-num[1]);
			if (negativeOrder[k] < n) {
				continue;
			} else {
				num = convert(mult(negativeNums[k][n-1],eToThe(-n*TWO_PI*t)));
				ellipse(0,0,2*num[0]);
				rotate(num[1]);
				line(0,0,num[0],0);
				translate(num[0],0);
				rotate(-num[1]);
			}
		}
		if (negativeOrder[k] > positiveOrder[k]) {
			for (let n = positiveOrder[k]; n < negativeOrder[k]; n++) {
				num = convert(mult(negativeNums[k][n-1],eToThe(-n*TWO_PI*t)));
				ellipse(0,0,2*num[0]);
				rotate(num[1]);
				line(0,0,num[0],0);
				translate(num[0],0);
				rotate(-num[1]);
			}
		}
		if (k == 0) {
			fill(0,255,0);
		} else if (k == 1) {
			fill(0,0,255);
		} else if (k == 2) {
			fill(100);
		} else {
			fill(255,0,0);
		}
		noStroke();
		ellipse(0,0,16);
		noFill();
	}
}

class Srep {

	constructor() {
		this.n = 0;
		this.status = [0]; //0 == A. 1 == B. 2 == Rotate Left. 3 Rotate Right
		this.a = [2,1,3,0,3,1,2];
		this.b = [3,0,2,1,2,0,3];
	}

	next() {
		this.n++;
		let aux = [];
		for (let j = 0; j < this.status.length; j++) {
			if (this.status[j] == 0) {
				for (let i = 0; i < this.a.length; i++) {
					aux.push(this.a[i]);
				}
			} else if (this.status[j] == 1) {
				for (let i = 0; i < this.b.length; i++) {
					aux.push(this.b[i]);
				}
			} else {
				aux.push(this.status[j]);
			}
		}
		this.status = aux;
	}

	disp(length,angle,it) {
		push();
		rotate(TWO_PI/it/2);
		translate(0,length);
		rotate(-TWO_PI/it/2-PI/2);
		let l = 2*length*sin(PI/it)/Math.pow(1+2*cos(angle),this.n);
		let a = angle;
		for (let j = 0; j < it; j++) {
			for (let i = 0; i < this.status.length; i++) {
				if (this.status[i] == 0 || this.status[i] == 1) {
					line(0,0,0,l);
					translate(0,l);
				} else if (this.status[i] == 2) {
					rotate(a);
				} else {
					rotate(-a);
				}
			}
			rotate(-TWO_PI/it);
		}
		pop();
	}

	toArray(precision,length,angle,it) { //Precision = integer greater than 0;
		let ansX = [];
		let ansY = [];
		let posX = 0;
		let posY = 0;
		let ang = 0;
		ang += TWO_PI/it/2;
		posX += length*cos(angle);
		posY += length*sin(angle);
		ang += -TWO_PI/it/2-PI/2;
		let l = 2*length*sin(PI/it)/Math.pow(1+2*cos(angle),this.n);
		let a = angle;
		for (let j = 0; j < it; j++) {
			for (let i = 0; i < this.status.length; i++) {
				if (this.status[i] == 0 || this.status[i] == 1) {
					for (let k = 0; k < precision; k++) {
						ansX.push(posX);
						ansY.push(posY);
						posX += l/precision*cos(ang);
						posY += l/precision*sin(ang);
					}
				} else if (this.status[i] == 2) {
					ang += a;
				} else {
					ang += -a;
				}
			}
			ang += -TWO_PI/it;
		}
		return [ansX,ansY];
	}
}

function doNext(n) {
	for (let i = 0; i < n.length; i++) {
		for (let j = 0; j < n[i]; j++) {
			positiveOrder[i]++;
			positiveNums[i].push(findCoefficient(funcs[i],positiveOrder[i]));
			negativeOrder[i]++;
			negativeNums[i].push(findCoefficient(funcs[i],-negativeOrder[i]));
		}
	}
	for (let i = n.length - 1; i > 0; i--) {
		for (let j = positiveCorrectedOrder[i]; j < positiveOrder[i]; j++) {
			if (positiveOrder[i-1]-1 >= j) {
				positiveNums[i][j] = sub(positiveNums[i][j],positiveNums[i-1][j]);
				positiveCorrectedOrder[i]++;
			}
			if (negativeOrder[i-1]-1 >= j) {
				negativeNums[i][j] = sub(negativeNums[i][j],negativeNums[i-1][j]);
				negativeCorrectedOrder[i]++;
			}
		}
	}
}