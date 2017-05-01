var changed = false;

function transferValues (sourceForm, firstIndex, destinationForm) {
   var firstDestIndex = 0;
   if (transferValues.arguments.length==4) {
      firstDestIndex = transferValues.arguments[3];
   }
   for (var i=firstIndex; i<destinationForm.elements.length+firstIndex-firstDestIndex && i<sourceForm.elements.length; i++) {
      destinationForm[i-firstIndex+firstDestIndex].value = sourceForm[i].value;
   }
}

// This function is a helper for the validate functions
function validator (theForm, val, lparen, min, max, rparen) {
    // Empty is OK
    if (theForm[val].value=="") {
      return true;
    }

    // If not empty, check the interval
    if (!interval(theForm[val].value, lparen, min, max, rparen)) {
      alert ("Invalid " + theForm[val].name + " - outside interval " + lparen + min + ", " + max + rparen);
	return false;
    }
    else {
      return true;
    }
}

function okCancelForm(okFunction, cancelFunction) {
   document.write(''+
    '<FORM>' +
       '<INPUT type="button" name="OK" value="OK" onClick="if (!changed) {' + cancelFunction + '} else ' + okFunction + '">&nbsp;&nbsp;&nbsp;' +
       '<INPUT type="button" name="Cancel" value="Cancel" onClick="' + cancelFunction + '">' +
    '</FORM>' +
   '');
}

function confirmCancel(theSelectBox) {
   if (!changed || confirm ("Discard changes?")) {
      if (theSelectBox.selectedIndex==theSelectBox.options.length-1) {
         theSelectBox.selectedIndex = 0;
         theSelectBox.oldSelectedIndex = 0;
      }
      location.href = "empty.html";
   }
}

function findIndexInSelectBox (selectBox, t) {
  for (var i=0; i<selectBox.options.length; i++) {
    if (selectBox.options[i].text == t) {
       if ((selectBox.options[i].value == "unSelectable") || (i==selectBox.options.length-1)){
          return -2;
       }
       else {
          return i;
       }
    }
  }
  return -1;
}

function formToArray (theForm, firstIndex, lastIndex) {
  var newArr = new Array();
  if (formToArray.arguments.length==4) {
     newArr[0] = formToArray.arguments[3];
  }
  for (var i=firstIndex; i<=lastIndex; i++) {
     newArr[newArr.length] = theForm[i].value;
  }
  return newArr;
}

function setCookieName (selectBox, stdArr, text) {
    var continuePrompting = true;
    var promptString = "Please enter a name to save your new " + text + ".";
    var initialPromptValue = "";
    if ((selectBox.selectedIndex > stdArr.length) && (selectBox.selectedIndex != selectBox.options.length-1)) {
       initialPromptValue = selectBox.options[selectBox.selectedIndex].text;
    }
    var indexInSelectBox = -1;
    while (continuePrompting) {
       cookName = prompt(promptString, initialPromptValue);
       promptString = "Please enter a name to save your new " + text + ".";
       continuePrompting = false;
       if (cookName==null || cookName=="") return false;      // if cancel or no name, do nothing.
       if (cookName.indexOf(" ")!=-1 || cookName.indexOf(";")!=-1 || cookName.indexOf(".")!=-1) {
          promptString = "Names may not contain spaces, semicolons, or periods. " + promptString;
          continuePrompting = true;
       }
       else {
          indexInSelectBox = findIndexInSelectBox (selectBox, cookName);
          if (indexInSelectBox=="-2") {   // Special value denoting special fields
             promptString = "Invalid name. " + promptString;
          }
          else if (indexInSelectBox!=-1 && indexInSelectBox<=stdArr.length) {
             promptString = "Sorry, a standard display option is already named " + cookName + ". " + promptString;
             continuePrompting = true;
          }
          else if (indexInSelectBox!=-1) {
             continuePrompting = !confirm ("Overwrite " + cookName + "?");
          }
       }
    }
    if (indexInSelectBox==-1) {
       makeNewOptionAndSelect (selectBox, cookName);
    }
    else {
       selectBox.selectedIndex = indexInSelectBox;
    }
    return cookName;
}

function makeNewOptionAndSelect (selectBox, newOptionName) {
    selectBox.options[selectBox.options.length] = new Option(newOptionName);
    selectBox.options[selectBox.options.length-1].text = selectBox.options[selectBox.options.length-2].text;
    selectBox.options[selectBox.options.length-1].value = selectBox.options[selectBox.options.length-2].value;
    selectBox.options[selectBox.options.length-2].text = selectBox.options[selectBox.options.length-3].text;
    selectBox.options[selectBox.options.length-2].value = selectBox.options[selectBox.options.length-3].value;
    selectBox.options[selectBox.options.length-3].text = newOptionName;
    selectBox.options[selectBox.options.length-3].value = "";
    selectBox.selectedIndex = selectBox.options.length-3;
}


function makeCookieString (prefix, theForm, name, firstValueIndex, lastValueIndex) {
    var cook = "Defmech_" + prefix + "_" + name + "=";
    for (var i=firstValueIndex; i<theForm.length && i<lastValueIndex; i++) {
	     cook = cook + theForm.elements[i].value + "|";
    }
    cook = cook + theForm.elements[i].value + "; expires=Mon, 01-Jan-2015 00:00:00 GMT; path=/;";
    return cook;
}

function setCookie (type, theForm, name, firstValIndex, lastValIndex) {
    document.cookie = makeCookieString (type, theForm, name, firstValIndex, lastValIndex);
}