var exp = new Array();
var inptArr = new Array();

/*
function convOper (oper_letter) {
    switch (oper_letter) {
     case '+': return 0; break;
	 case '-': return 1; break;
	 case '*': return 2; break;
	 case '/': return 3; break;
	 case '^': return 4; break;
	 case 'exp': return 10; break;
	 case 'ln': return 11; break;
	 case 'log': return 12; break;
	 case 'sqrt': return 13; break;
	 case 'sin': return 10; break;
	 case 'tan': return 10; break;
	 case 'asin': return 10; break;
	 case 'acos': return 10; break;
	 case 'atan': return 10; break;
	 case 'sinh': return 10; break;
	 case 'tanh': return 10; break;

	 case 'min': return 30; break;
	 case 'max': return 31; break;
	default: return -1;
    }
}
*/

// inPrevEquations uses global exp array.
function inPrevEquations (str, currIteration) {
	for (var i=currIteration-1; i>=0; i=i-1) {
		if (str==getInptName(i)) {
            return exp[i];
		}
	}
	return "";
}

function preParsed (inpt) {
   return ((inpt.charAt(0)=="{") && (inpt.charAt(inpt.length-1)=="}"));
   // Could add checking for errors here.
}


function parseVal (inpt, currIteration) {
// Assumes no operations; inpt is either a number or a variable
   if (""==inpt)
       return "";
   else if (preParsed (inpt)) {
	   return inpt.substr(1,inpt.length-2);
   }
   else if (noLetters(inpt)) {
       return (inpt+"_");
   }
   else if (inPrevEquations(inpt, currIteration)!="") {
       return inPrevEquations(inpt, currIteration);
   }
   else {
       switch (inpt.toLowerCase()) {
		   case '': return ""; break;
           case 'omega': return "V0_"; break;
	       case 'b': return "V1_"; break;
           case 'tm': return "V2_"; break;
           case 'mu0': return "V3_"; break;
           case 'tempdepofmodulus': return "V4_"; break;
           case 'd0v': return "V5_"; break;
           case 'qv': return "V6_"; break;
           case 'deltad0b': return "V7_"; break;
           case 'qb': return "V8_"; break;
           case 'acd0core': return "V9_"; break;
           case 'qcore': return "V10_"; break;
           case 'n': return "V11_"; break;
           case 'a': return "V12_"; break;
           case 'breakdown': return "V13_"; break;
           case 'tauhat': return "V14_"; break;
           case 'gammadotp': return "V15_"; break;
           case 'deltaf': return "V16_"; break;
           case 'd': return "V17_"; break;
           case 'delta': return "V18_"; break;  // This variable (boundary thickness) not yet implemented as a variable in interactive.html
           										// The graph program uses the constant of 5E-10 meters for boundary thickness.
		   case 't': return "V100_"; break;
		   case 'nshear': return "V101_"; break;
           default: alert ("Error in " + getInptName(currIteration) + " - Symbol not recognized: " + inpt); return "BAD INPUT";
       }
   }
}

var operStr;
var preOper;
var postOper;
var operVal;

function findLastOper(inpt) {
// breaks inpt into the part prior to, the part containing, and the part after the last operator.

   var pre = "";
   var post = "";
   var oper = "-1";
   var oVal = "-1";

   var operArr = new Array();
   operArr[0] = "+";
   operArr[1] = "-";
   operArr[2] = "*";
   operArr[3] = "/";
   operArr[4] = "^";
   operArr[5] = "exp{";
   operArr[6] = "ln{";
   operArr[7] = "log{";
   operArr[8] = "sqrt{";
   operArr[9] = "sin{";
   operArr[10] = "tan{";
   operArr[11] = "asin{";
   operArr[12] = "acos{";
   operArr[13] = "atan{";
   operArr[14] = "sinh{";
   operArr[15] = "tanh{";
   operArr[16] = "min{";
   operArr[17] = "max{";

   for (var i=0; i<operArr.length; i++) {
       if ((inpt.indexOf(operArr[i])!=-1) && ((inpt.indexOf(operArr[i])>pre.length)||pre=="")) {
           pre = inpt.substring(0,inpt.indexOf(operArr[i]));
           oper = operArr[i];
           oVal = i;
           post = inpt.substr(inpt.indexOf(operArr[i])+oper.length);
	   }
   }
alert ("In the input string " + inpt + "\npre: " + pre + "; oper: " + oper + "; operVal: " + operVal + "; post: " + post + ";");
   preOper = pre;
   operStr = oper;
   postOper = post;
   operVal = oVal;
}

function parse (inpt, currIteration) {
    if (inpt=="") return "";
    var answer = "";
    findLastOper(inpt);
    if (operVal==-1) {
       answer = parseVal (inpt, currIteration);
    }
    else {
	   answer = "O" + operVal + "_" + parseVal(postOper, currIteration) + parse(preOper, currIteration);
    }
    return "{"+answer+"}";

}

function convertIter (inpt, currIteration) {
    if (!inpt.indexOf) {     // if inpt is an html element, use its value.
		inpt = inpt.value;
    }
    var close_index = inpt.indexOf(')');
    var inbetween = inpt.substring(0,close_index);
    var open_index = inbetween.lastIndexOf('(');
    while ((close_index!=-1) && (open_index!=-1)) {
alert ('workign in parenthesis.');
		inbetween = inbetween.substring(open_index+1,close_index);
		inpt = inpt.substring(0,open_index) + parse(inbetween, currIteration) + inpt.substring(close_index+1,inpt.length);
		close_index = inpt.indexOf(')');
		inbetween = inpt.substring(0,close_index);
		open_index = inbetween.lastIndexOf('(');
	}

	if (inpt == "") {
		return "{0_}";
    }
	else {
		return "{"+parseVal(parse(inpt, currIteration), currIteration) + "}";
    }
}

function convert (inptA) {
    inptArr = inptA;
    for (var i=1; i<inptArr.length; i=i+2) {
       exp[(i-1)/2] = convertIter (inptArr[i], (i-1)/2);
    }
alert ('final answer: ' + convertIter (inptArr[inptArr.length-1], inptArr.length/2));
//    return (convertIter (inptArr[inptArr.length-1], inptArr.length/2));
}

function getInptName (iter) {
		if (!inptArr[iter*2].indexOf) {
			return inptArr[iter*2].value;
	    }
	    else {
	        return inptArr[iter*2];
	    }
}