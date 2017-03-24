//!Changing State Variable! Warning!
var currentHist = "0"; //currentHist holds calculator history state

//console log shortcut
var log = function(...args) {
	console.log(...args);
}
//concat two expressions as strings based on calculator rules in function
var joinExp = function(hist, current) {
	var hist = hist || "0",
		current = current || "",
		lastExp = "",
		lastChar = "";
	lastExp = hist.slice(clearLastDigits(hist).length);
	lastChar = hist.charAt(hist.length - 1);
	//statement to control special calculator join rules
	if (hist == 0 && current && !/[.]/.test(hist) && /[0-9]/.test(current)) {
	//if history is 0 with no decimal point and current is a number
		//only return current string
		return "" + current;
	} else if (current == "0" && lastExp === "0") {
	//else if current button is 0, current value 0 and it doesn't have a decimal point
		//only return history
		return "" + hist;
	} else if (/[\+\-\*\/]/.test(lastChar) && /[\+\-\*\/]/.test(current)) {
	//else if both last hist char and current are operators
		//replace last hist char with current
		return "" + hist.slice(0, hist.length - 1) + current;
	} else if (lastChar == "%" && current == "%") {
	//else if hist ends with a % and current is %
		//don't add current % sign
		return "" + hist
	} else if (lastChar == "%" && /[0-9]/.test(current)) {
	//else if hist ends with a % and current is a number
		return "" + hist + "*" + current;
	} else if (/[0-9]/.test(current) && hist[0] === "=" && !/[\+\-\*\/\%]/.test(hist.slice(2))) {
	//else if current is a number, and hist is an answer without an added operator
		//don't concat the current number to the answer
		return "" + hist;
	} else if (/[0-9]/.test(current) && lastExp === "0") {
	//else if current is a number current expression is a 0
		//replace last hist char with current
		return "" + hist.slice(0, hist.length - 1) + current;
	}
	//else just concat hist + current
	return "" + hist + current;
}
//Eval left to right instead of by order of ops
var evalLTR = function(exp) {
	var currentExp = "",
		tempExp = "",
		reOp = /[\+\-\*\/]/;
	//if exp contains an operator
	if (reOp.test(exp)) {
		//set currentExp to substr through first operator index
		currentExp = exp.slice(0, exp.search(reOp) + 1);
		//set exp to substr after first operator
		exp = exp.slice(currentExp.length);
		//while exp still has an operator
		while (/[\+\-\*\/]/.test(exp)) {
			//set to substr through first found operator
			tempExp = exp.slice(0, exp.search(reOp) + 1);
			//set exp to substr after first found operator
			exp = exp.slice(tempExp.length);
			//concat currentExp with tempExp without final char (operator) and eval
			currentExp = eval("" + currentExp + tempExp.slice(0, tempExp.length - 1));
		}
		//concat currentExp + operator at end of tempExp (if it exists) + remining substr in exp
		//eval and return
		return eval("" + currentExp + (tempExp.charAt(tempExp.length - 1) || "") + exp);
	}
	//otherwise, exp contains no operators. Just eval and return
	return eval(exp);
}
//Evaluate a mathematical expression left to right. Output String-> "=" concat answer
var evalExp = function(exp) {
	var exp = exp || "0",
		str = "" + exp;
	//if last character in str is an operator
	if (/[\+\-\*\/]/.test(str.charAt(str.length - 1))) {
		//slice off the last character
		str = str.slice(0, str.length - 1);
	}
	//if first char is an "="
	if (str[0] === "=") {
		//slice off first char
		str = str.slice(1);
	}
	//if there are any % signs
	if (/[\%]/.test(exp)) {
		//convert %expressions to percentages
		str = laymanPercent(str);
	}
	//calculate str left to right
	str = "" + evalLTR(str);
	//max # digits in answer: 17
	if (str.length > 17) {
		str = str.slice(0, 17);
	}
	//output "=" concat answer
	return "=" + str;
}
//!Impure Function
var clearHistory = function() {
	currentHist = "0";
	return "0";
}
//clear chars right of most recent operator
var clearLastDigits = function(str){
	var lastOpSymbol = /[\+\-\*\/](?!.*[\+\-\*\/])/,
		lastSymbIndex = str.search(lastOpSymbol);
	if (str[0] === "=" && str[1] === "-" && lastSymbIndex === 1) {
		//do nothing
	} else {
		str = str.slice(0, lastSymbIndex + 1);
	}
	return str;
}
//set decimal based on standard calculator rules
var properDecimal = function(hist) {
	var checkHist = clearLastDigits(hist),
		checkVal = hist.slice(checkHist.length),
		currentEl;
	//if last hist char is an operator
	if (!/[0-9.]/.test(hist.charAt(hist.length - 1))) {
		//set currentEl to "0."
		currentEl = "0.";
	} else if (hist.charAt(hist.length - 1) === ".") {
	//else if last char is a decimal point
		//return hist unchanged
		return hist;
	} else if (/[.]/g.test(checkVal)) {
	//else if number right of last operator already has a decimal point
		//return hist unchanged
		return hist;
	} else {
		//else set current el to decimal point
		currentEl = ".";
	}
	//concat hist to currentEl
	return joinExp(hist, currentEl);
}
//get an html element by id
var getById = function(id) {
	return document.getElementById(id);
}
//!Impure Function!
//Add text content to html element by id
var refreshById = function(id, el) {
	document.getElementById(id).textContent = el;
}
//calculate percent based on 4-function calculator rules
var laymanPercent = function(hist) {
	var percentExp = "",
		checkHist = "",
		checkVal = "",
		percentVal = "";
	//while hist contains any % signs
	while(/\%/.test(hist)) {
		//set percentExp to hist substr left of first found % sign
		percentExp = hist.slice(0, hist.search(/\%/));
		//set checkHist to everything last operator left in percentExp
		checkHist = clearLastDigits(percentExp);
		//set checkVal to everything remaining in percentExp
		checkVal = percentExp.slice(checkHist.length);
		percentVal = "";
		//if checkhist exists (percentExp contained values left of an operator)
		if (checkHist) {
			//eval percentVal with Checkhist
			percentVal = evalExp(checkHist).slice(1) * evalExp(checkVal).slice(1) / 100;
		} else {
			//else eval percentVal just using checkVal
			percentVal = evalExp(checkVal).slice(1) / 100;
		}
		//change first found % expression to a percentVal in hist
		hist = "" + checkHist + percentVal + hist.slice(percentExp.length + 1);
	}
	return hist;
}
//set var allButtons to html elements with id="input"
var allButtons = getById("input");
//return function based on button pressed
var newHist = function(hist, el) {
	if (el == "CE") {
		return clearLastDigits(hist);
	} else if (el == "AC") {
		return clearHistory();
	} else if (el == "=") {
		return evalExp(hist);
	} else if (el == ".") {
		return properDecimal(hist);
	} else {
		return joinExp(hist, el);
	}
}

//run code when window loaded
$(window).on('load', function() {
	var	calcOutputHist = "",
		currentValue = "";
	//set initial outputs
	refreshById("calc-history", "");
	refreshById("output", "0");
	//when the allButtons div region is clicked
	allButtons.addEventListener("click",function(e){
		//and the area clicked is a button
		if (e.target.localName == "button") {
			//update currentHist
			currentHist = newHist(currentHist, e.target.innerText);
			//set calcOutputHist to currentHist chars incl last operator and left
			calcOutputHist = clearLastDigits(currentHist);
			//set currentValue to everything right of currentHist last operator
			currentValue = currentHist.slice(calcOutputHist.length) || "0";
			//refresh output
			refreshById("calc-history", calcOutputHist);
			refreshById("output", currentValue);
		}
		e.stopPropagation();
	}, false);
})
