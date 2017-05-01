function findNameInForm (theForm, theName) {
   for (var firstValueIndex=0; firstValueIndex<theForm.elements.length && theForm.elements[firstValueIndex].name!=theName; firstValueIndex++);
   if (firstValueIndex==theForm.elements.length) {
       alert ("findNameInForm ERROR - " + theName + " not found in form " + theForm.name);
   }
   else {
       return firstValueIndex;
   }
}