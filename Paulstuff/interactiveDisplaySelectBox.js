numDisplayElements = 7;

document.write (''+
'<FORM name="displaySelectBox">'+
'<TABLE width="95%" border="0" cellspacing="1">'+
 '<TR>'+
  '<TD align="right">'+
     'Display:'+
  '</TD>'+
  '<TD>'+
     '<INPUT type="hidden" name="oldSelectedIndex" value="0">'+
     '<SELECT name="display" onchange="changeDisplayValues(this);">'+
       '<OPTION value="unSelectable">Select a Display</OPTION>'+
'');            
          writeDisplaySelectOptions();

document.write (''+
       '<OPTION value="unSelectable">- - - - - - - - - - - - - - - - -</OPTION>'+
       '<OPTION value="New">New Display</OPTION> <!-- also clears the form through the changeValues action of the select box -->'+
     '</SELECT>'+
     '&nbsp;&nbsp;'+
     '<INPUT type="button" name="display" value="Edit/View" onClick="adjustFramesToShowDisplay();">'+
  '</TD>'+
 '</TR>'+
'</TABLE>'+
'</FORM>'+
'');

    function changeDisplayValues(selectBox) {
       thisForm = document.map;

       // Disallow change if the value is "unSelectable"
       if (!checkForUnSelectable(selectBox)) {
          return false;
       }

       // If the value is the last selected (New), clear all values and adjust divs.
       if (selectBox.selectedIndex == selectBox.options.length-1) {
         clearValues (thisForm, 0, numDisplayElements);
         adjustFramesToShowDisplay();
         selectBox.form.oldSelectedIndex.value = selectBox.selectedIndex;
         return true;
       }

       // Otherwise (meaning I haven't returned yet), change the values, based on the material selected.
       var newDisplayValues;
       var stdDisps = getStandardDisplay();
       if (selectBox.selectedIndex <= stdDisps.length) {
          newDisplayValues = stdDisps[selectBox.selectedIndex-1].slice(1);
       }
       else {
          newDisplayValues = getCustomDisplay()[selectBox.selectedIndex - stdDisps.length - 2].slice(1);
       }
       changeValues (thisForm, numMaterialElements, newDisplayValues);
       adjustFramesToShowEmpty();
       selectBox.form.oldSelectedIndex.value = selectBox.selectedIndex;
    }

function adjustFramesToShowDisplay() {
   window.parent.frames[1].location.href = "interactiveDisplayForm.html";
}