numMaterialElements = 18;

document.write (''+
'<FORM name="materialSelectBox">'+
'<TABLE width="95%" border="0" cellspacing="1">'+
 '<TR>'+
  '<TD align="right">'+
     'Material:'+
  '</TD>'+
  '<TD>'+
     '<INPUT type="hidden" name="oldSelectedIndex" value="0">'+
     '<SELECT name="material" onchange="changeMaterialValues(this);">'+
       '<OPTION value="unSelectable">Select a Material</OPTION>'+
'');            
          writeMaterialSelectOptions();

document.write (''+
       '<OPTION value="unSelectable">- - - - - - - - - - - - - - - - -</OPTION>'+
       '<OPTION value="New">New Material</OPTION> <!-- also clears the form through the changeValues action of the select box -->'+
     '</SELECT>'+
     '&nbsp;&nbsp;'+
     '<INPUT type="button" name="material" value="Edit/View" onClick="adjustFramesToShowMaterial();">'+
  '</TD>'+
 '</TR>'+
'</TABLE>'+
'</FORM>'+
'');

    function changeMaterialValues(selectBox) {
       thisForm = document.map;

       // Disallow change if the value is "unSelectable"
       if (!checkForUnSelectable(selectBox)) {
          return false;
       }

       // If the value is the last selected (New), clear all values and adjust divs.
       if (selectBox.selectedIndex == selectBox.options.length-1) {
         clearValues (thisForm, 0, numMaterialElements);
         adjustFramesToShowMaterial();
         selectBox.form.oldSelectedIndex.value = selectBox.selectedIndex;
         return true;
       }

       // Otherwise (meaning I haven't returned yet), change the values, based on the material selected.
       var newMaterialValues;
       var stdMats = getStandardMaterials();
       if (selectBox.selectedIndex <= stdMats.length) {
          newMaterialValues = stdMats[selectBox.selectedIndex-1].slice(1);
       }
       else {
          newMaterialValues = getCustomMaterials()[selectBox.selectedIndex - stdMats.length - 2].slice(1);
       }
       changeValues (thisForm, 0, newMaterialValues);
       adjustFramesToShowEmpty();
       selectBox.form.oldSelectedIndex.value = selectBox.selectedIndex;
    }

function adjustFramesToShowMaterial() {
   window.parent.frames[1].location.href = "interactiveMaterialForm.html";
}