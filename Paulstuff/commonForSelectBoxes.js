function checkForUnSelectable (selectBox) {
   var unSelectableValue = "unSelectable";
   if (selectBox.options[selectBox.selectedIndex].value==unSelectableValue) {
       selectBox.selectedIndex = selectBox.form.oldSelectedIndex.value;
       return false;
   }
   return true;
}

function writeHiddenInputs (numberOfInputsToWrite) {
  for (var i=0; i<numberOfInputsToWrite; i++) {
     document.write ('<INPUT name="" type="hidden">');
  }
}

function clearValues (theForm, firstIndex, numValues) {
   for (var i=firstIndex; i<numValues-firstIndex; i++) {
      theForm[i].value = "";
   }  
}

function changeValues (theForm, firstIndex, newValues) {
   for (var i=firstIndex; i-firstIndex<newValues.length; i++) {
      theForm[i].value = newValues[i-firstIndex];
   }
}

function adjustFramesToShowEmpty () {
   window.parent.frames[1].location.href = "empty.html";
}