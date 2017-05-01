numEquationElements = 25;

document.write (''+
'<FORM name="equationSelectBox">'+
'<TABLE width="95%" border="0" cellspacing="1">'+
 '<TR>'+
  '<TD align="right">'+
     'Equation:'+
  '</TD>'+
  '<TD>'+
     '<INPUT type="hidden" name="oldSelectedIndex" value="0">'+
     '<SELECT name="equation" onchange="changeEquationValues(this);">'+
       '<OPTION value="unSelectable">Select an Equation</OPTION>'+
'');            
          writeEquationSelectOptions();

document.write (''+
       '<OPTION value="unSelectable">- - - - - - - - - - - - - - - - -</OPTION>'+   
       '<OPTION value="New">New Equation</OPTION> <!-- also clears the form through the changeValues action of the select box -->'+
     '</SELECT>'+
     '&nbsp;&nbsp;'+
     '<INPUT type="button" name="equation" value="Edit/View" onClick="adjustFramesToShowEquation();">'+
  '</TD>'+
 '</TR>'+
'</TABLE>'+
'</FORM>'+
'');

var equationNames = new Array(24);

    function changeEquationValues(selectBox) {
       thisForm = document.map;

       // Disallow change if the value is "unSelectable"
       if (!checkForUnSelectable(selectBox)) {
          return false;
       }

       // If the value is the last selected (New), clear all values and adjust divs.
       if (selectBox.selectedIndex == selectBox.options.length-1) {
         clearValues (thisForm, 0, numDisplayElements);
         adjustFramesToShowEquation();
         selectBox.form.oldSelectedIndex.value = selectBox.selectedIndex;
         return true;
       }

       // Otherwise (meaning I haven't returned yet), change the values, based on the equation selected.
       var newEquationValues;
       var stdEqs = getStandardEquations();
       if (selectBox.selectedIndex <= stdEqs.length) {
          newEquationValues = stdEqs[selectBox.selectedIndex-1].slice(1);
       }
       else {
          newEquationValues = getCustomEquations()[selectBox.selectedIndex - stdEqs.length - 2].slice(1);
       }
       equationNames = newEquationValues.slice(newEquationValues.length-(numEquationElements-1));
       newEquationValues = newEquationValues.slice(0,newEquationValues.length-(numEquationElements-1));
       changeValues (thisForm, numMaterialElements+numDisplayElements, newEquationValues);
       adjustFramesToShowEmpty();
       selectBox.form.oldSelectedIndex.value = selectBox.selectedIndex;
    }

function adjustFramesToShowEquation() {
   window.parent.frames[1].location.href = "interactiveEquationForm.html";
}