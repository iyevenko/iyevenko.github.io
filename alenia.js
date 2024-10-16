const RSIZE = 128;
const SCALE = 4;
var SIZE = RSIZE * SCALE;
const PRECISION = 1000000;
var NS = 18*SCALE;  // R = space resolution = kernel radius (neighborhood size) in cells
var TS = 10;  // T = time resolution = time step in steps

var kernel_fn = 1; // poly kernel
var kernel_A = 4;
// var kernel_B = new Array(4).fill(0);
// var kernel_B = [1];
var kernel_B = [1,1/2,1/2,1];

var growth_fn = 3; // step growth
var growth_m = 0.22;
var growth_s = 0.029;


var isAsymptotic = true;
var field, fieldIm, fieldOld, kernel, kernelRe, kernelIm, neigh, neighRe, neighIm, growth, lagrangian;

function initArrays() {
	field = InitArray();
	fieldIm = InitArray();
	fieldOld = InitArray();
	kernel = InitArray();
	kernelRe = InitArray();
	kernelIm = InitArray();
	neigh = InitArray();
	neighRe = InitArray();
	neighIm = InitArray();
	growth = InitArray();
	lagrangian = InitArray();
	CalcKernel();
}

initArrays();

function InitArray() {
  var arr = [];
  for (var i=0; i<SIZE; i++)
    arr.push(new Array(SIZE).fill(0));
  return arr;
}

//*** calc
function Round(x) { return Math.round(x * PRECISION) / PRECISION; }
function Sum(arr) { return arr.reduce((sum, row) => sum + row.reduce((rowSum, value) => rowSum + value, 0), 0); }

function CalcKernel() {
  var weight = 0.0;
  for (var i=0; i<SIZE; i++) {
    for (var j=0; j<SIZE; j++) {
      var ii = ((i + SIZE/2) % SIZE) - SIZE/2;
      var jj = ((j + SIZE/2) % SIZE) - SIZE/2;
      var r = Math.sqrt(ii*ii + jj*jj) / NS;
      var v = KernelFunc(r);
      weight += v;
      kernelRe[i][j] = v;
      ii = SIZE - ((i + SIZE/2) % SIZE) - 1;
      jj = ((j + SIZE/2) % SIZE);
      kernel[ii][jj] = v;
    }
  }
  console.log(kernelRe);

  FFT2D(1, kernelRe, kernelIm);
  for (var i=0; i<SIZE; i++) {
    for (var j=0; j<SIZE; j++) {
      kernelRe[i][j] /= weight;
      kernelIm[i][j] /= weight;
    }
  }
}

function KernelFunc(r) {
	r = Math.abs(r);
	const B = kernel_B.length
	if (B==1)
	  return CoreFunc(r);
	else {
	  if (r>=1) return 0;
	  var R = r * B;
	  var b = Math.floor(R);
	  if (b > B-1) b = B-1; 
	  return CoreFunc(R % 1) * kernel_B[b]
	}
}
  
function CoreFunc(r) {
	switch (kernel_fn) {
	  case 0: return (r>1) ? 0 : Math.exp(kernel_A - kernel_A/4/r/(1-r));  //bump4
	  case 1: return (r>1) ? 0 : Math.pow(4*r*(1-r), kernel_A);  //quad4
	  case 2: var q = 1/5; return (r<q||r>1-q) ? 0 : (r<2*q) ? (r-q)/q : (r>1-2*q) ? (1-q-r)/q : 1;  //trap1/5
	  case 3: var q = 1/4; return (r>=q&&r<=1-q) ? 1 : 0;  //stpz1/4
	  case 4: var q = 1/4; return (r<q) ? 0.5 : (r>1-q) ? 0 : 1;  // life
	}
}

function UpdateField() {
  for (var i=0; i<SIZE; i++)
    for (var j=0; j<SIZE; j++)
      fieldOld[i][j] = field[i][j];
  for (var i=0; i<SIZE; i++)
    fieldIm[i].fill(0);

  // f * g = F-1( F(f) dot F(g) )
  FFT2D(1, field, fieldIm);
  MatrixDot(field, fieldIm, kernelRe, kernelIm, neighRe, neighIm);
  FFT2D(-1, neighRe, neighIm);

  for (var i=0; i<SIZE; i++) {
    for (var j=0; j<SIZE; j++) {
      var u = neigh[i][j] = neighRe[i][j];
      var g = growth[i][j] = GrowthFunc(u);
      var v = fieldOld[i][j];
      if (isAsymptotic) {
				v += ((g+1)/2 - v) / TS
      } else {
				v += g / TS;
        if (v<0) v = 0; else if (v>1) v = 1;
      }
			lagrangian[i][j] = v*(g+1)/2 - 0.5*v*v;
      field[i][j] = v;
    }
  }
}

function GrowthFunc(n) {
  var r = Math.abs(n-growth_m);
  var r2 = r*r;
  switch (growth_fn) {
    case 0: var k = 2*growth_s*growth_s; return Math.exp(-r2/k) * 2 - 1;  //gaus
    case 1: var k2 = 9*growth_s*growth_s; return r2>k2 ? -1 : Math.pow(1-r2/k2, kernel_A) * 2 - 1;  //quad4
    case 2: var p = growth_s/2, q = growth_s*2; return r<=p ? 1 : r<=q ? 2*(q-r)/(q-p)-1 : -1;  //trap
    case 3: return r<=growth_s ? 1 : -1;  //stpz
    //case 4: var k = 2*delta_w, m = r/delta_w - 1; return r>k ? -1 : Math.pow(1-m*m, kernel_A) * 2 * (n<delta_c?1:kernel_B[0]/B_DIV) - 1;  //bimo4
  }
}

//** maths
function FFT1D(dir, re1, im1) {
  /* Do the bit reversal */
  var S = re1.length, m = Round(Math.log2(S)), S2 = S >> 1, j1 = 0;
  for (var j=0; j<S-1; j++) {
    if (j < j1) {
      var tmp = re1[j]; re1[j] = re1[j1]; re1[j1] = tmp;
      tmp = im1[j]; im1[j] = im1[j1]; im1[j1] = tmp;
    }
    var j2 = S2;
    while (j2 <= j1) {
      j1 -= j2;
      j2 >>= 1;
    }
    j1 += j2;
  }

  /* Compute the FFT */
  var c1 = -1.0, c2 = 0.0, l2 = 1;
  for (var l=0; l<m; l++) {
    var l1 = l2;
    l2 <<= 1;
    var u1 = 1.0, u2 = 0.0;
    for (var i=0; i<l1; i++) {
      for (var j=i; j<S; j+=l2) {
        var j2 = j + l1;
        var t1 = u1 * re1[j2] - u2 * im1[j2];
        var t2 = u1 * im1[j2] + u2 * re1[j2];
        re1[j2] = re1[j] - t1;
        im1[j2] = im1[j] - t2;
        re1[j] += t1;
        im1[j] += t2;
      }
      var z = u1 * c1 - u2 * c2;
      u2 = u1 * c2 + u2 * c1;
      u1 = z;
    }
    c2 = Math.sqrt((1.0 - c1) / 2.0);
    if (dir == 1)
      c2 = -c2;
    c1 = Math.sqrt((1.0 + c1) / 2.0);
  }

  /* Scaling for forward transform */
  if (dir == -1) {
    var scale_f = 1.0 / S;		
    for (var j=0; j<S; j++) {
      re1[j] *= scale_f;
      im1[j] *= scale_f;
    }
  }
}

function FFT2D(dir, re2, im2) {
  var S = re2.length;
  for (var i=0; i<S; i++) {
    FFT1D(dir, re2[i], im2[i]);
  }
  for (var i=0; i<S; i++) {
    for (var j=0; j<i; j++) {
      var tmp = re2[i][j]; re2[i][j] = re2[j][i]; re2[j][i] = tmp;
    }
  }
  for (var i=0; i<S; i++) {
    for (var j=0; j<i; j++) {
      var tmp = im2[i][j]; im2[i][j] = im2[j][i]; im2[j][i] = tmp;
    }
  }
  for (var i=0; i<S; i++) {
    FFT1D(dir, re2[i], im2[i]);
  }
}

function MatrixDot(ar, ai, br, bi, cr, ci) {
  var S = ar.length;
  for (var i=0; i<S; i++) {
    var ar_i = ar[i], ai_i = ai[i];
    var br_i = br[i], bi_i = bi[i];
    var cr_i = cr[i], ci_i = ci[i];
    for (var j=0; j<S; j++) {
      var a = ar_i[j]; var b = ai_i[j];
      var c = br_i[j]; var d = bi_i[j];
      var t = a * (c + d);
      cr_i[j] = t - d*(a+b);
      ci_i[j] = t + c*(b-a);
    }
  }
}