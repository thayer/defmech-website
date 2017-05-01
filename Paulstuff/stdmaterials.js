function standardMaterials() {
    newMaterial ("Nickel 1.09E-29 2.49E-10 1726 7.89E4 -0.64 1.9E-4 284 3.5E-15 115 3.1E-23 170 4.6 3.0E6 N/A 6.3E-3 1E6 0.5 .0001");
    newMaterial ("Lead 3.03E-29 3.49E-10 601 0.73E4 -0.76 1.4E-4 109 8.0E-14 66 1.0E-22 66 5.0 2.5E8 N/A 8.7E-3 1.0E6 0.5 .0001");
    newMaterial ("Silver 1.71E-29 2.86E-10 1234 2.64E4 -0.54 4.4E-5 185 4.5E-15 90 2.8E-25 82 4.3 3.2E2 N/A 7.2E-3 1.0E6 0.5 .0001");
}

function standardDisplayOptions() {
    newDisplay ("Standard 0 1 10E-6 1 1E-10 .1 10");
}

function standardEquations() {
    newEquation ("Standard s1 s2 s3 ...");
}


/* ----------------------------------- */
/* INITIALIZATION */

var materialStandard = new Array();
var displayStandard = new Array();
var equationStandard = new Array();

var materialCustom = new Array();
var displayCustom = new Array();
var equationCustom = new Array();
var equationCustom = new Array();

standardMaterials();
standardDisplayOptions();
standardEquations();
customMaterials();
customDisplayOptions();
customEquations();

function addToArray (arr, val) {
   arr[arr.length] = val;
}

function newMaterial(str) {
  addToArray (materialStandard, str.split(" "));
}

function newDisplay(str) {
  addToArray (displayStandard, str.split(" "));
}

function newEquation(str) {
  addToArray (equationStandard, str.split(" "));
}

function changeCustomMaterial (index, newElement) {
  materialCustom[index] = newElement;
}

function changeCustomDisplay (index, newElement) {
  displayCustom[index] = newElement;
}

function changeCustomEquation (index, newElement) {
  equationCustom[index] = newElement;
}

function customMaterials() {
  loadCustom ("material", materialCustom);
}

function customDisplayOptions() {
  loadCustom ("display", displayCustom);
}

function customEquations() {
  loadCustom ("equation", equationCustom);
}

/* End INITIALIZATION */
/* ------------------------- */
/* RETRIEVAL AND DISPLAY */


function getStandardMaterials () {
  return materialStandard;
}

function getStandardDisplay () {
  return displayStandard;
}

function getStandardEquations () {
  return equationStandard;
}

function getCustomMaterials () {
  return materialCustom;
}

function getCustomDisplay () {
  return displayCustom;
}

function getCustomEquations () {
  return equationCustom;
}

// DISPLAY

function writeSelectOptions (stdArr, customArr) {
  for (var i=0; i<stdArr.length; i++) {
     document.write('<OPTION>'+stdArr[i][0]+'</OPTION>');
  }
  document.write('<OPTION value="unSelectable">- - - - - - - - - - - - - - - - -</OPTION>');
  for (var i=0; i<customArr.length; i++) {
     document.write('<OPTION>'+customArr[i][0]+'</OPTION>');
  }
}

function writeMaterialSelectOptions () {
  writeSelectOptions (materialStandard, materialCustom);
}

function writeDisplaySelectOptions () {
  writeSelectOptions (displayStandard, displayCustom);
}

function writeEquationSelectOptions () {
  writeSelectOptions (equationStandard, equationCustom);
}

/* End RETRIVAL AND DISPLAY */
/* ----------------------------------- */
/* SAVING AND LOADING CUSTOM, through cookies */


function loadCustom (prefix, customArr) {
   prefix = "Defmech_"+prefix+"_";
   var theCookie = document.cookie;
   var name;
   var stdMat;
   var endIndex;
   while (theCookie.indexOf(prefix)!=-1) {
      theCookie = theCookie.substr(theCookie.indexOf(prefix)+prefix.length);
      stdMat = theCookie.substring(0,theCookie.indexOf("="));
      endIndex = theCookie.indexOf(";");
      if (endIndex==-1) {
           endIndex = theCookie.length-1;
      }
      stdMat = stdMat + "|" + theCookie.substring(theCookie.indexOf("=")+1, endIndex);
      theCookie = theCookie.substr(theCookie.indexOf(";"));
      addToArray (customArr, stdMat.split("|"));
   }  
}