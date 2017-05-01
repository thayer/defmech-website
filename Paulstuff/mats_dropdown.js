
function setCookie (name) {
       var cook = "Mat_"+ name + "=";
	 for (var i=0; i<document.newMap.length-3; i++) {
	     cook = cook + document.newMap[i].value + "|";
       }
       cook = cook + document.newMap[document.newMap.length-3].value + "; expires=Mon, 01-Jan-2015 00:00:00 GMT; path=/;";
	 document.cookie = cook;
}

// getCookie function taken from http://www.cookiecentral.com/faq/#5.2
function getCookie(name) {
         var cookie = " " + document.cookie;
         var search = " " + name + "=";
         var setStr = null;
         var offset = 0;
         var end = 0;
         if (cookie.length > 0) {
                 offset = cookie.indexOf(search);
                 if (offset != -1) {
                         offset += search.length;
                         end = cookie.indexOf(";", offset)
                         if (end == -1) {
                                 end = cookie.length;
                         }
                         setStr = unescape(cookie.substring(offset, end));
                 }
         }
	 return (setStr);
}

function inStdMats (name) {
	return (stdMaterials().indexOf (name) != -1);
}


function Remover ()
{
   var mat = (document.selectMetal.elements[document.selectMetal.elements.selectedIndex].value);
   if (!inStdMats(mat)) {
        if (confirm("Are you sure you want to delete " + mat + "?")) {
            document.cookie = "Mat_" + mat + " = jibberish; expires=Mon, 01-Jan-1985 00:00:00 GMT; path=/;";
            // alert ("Mat_" + mat + " = jibberish; expires=Mon, 01-Jan-1985 00:00:00 GMT; path=/;");
            window.location.reload();
        }
    }
    else {
        alert ("Cannot delete standard materials.")
    }
}



function changeMetal(myform)
{
    newMapUnchanged();  // reset the changed boolean for newMap.
    var searchstr = "Mat_"+myform.options[myform.selectedIndex].value+"=";
    //alert ("ss = " + searchstr);
    //alert (cook.indexOf(searchstr));
    var cook = document.cookie;
    if (cook.indexOf(searchstr)==-1) {
	alert ("Error - Too many cookies, please delete some.");
	return;
    }
    cook = cook.substring (cook.indexOf(searchstr), cook.length) + ";";
    //alert ("first cook = " + cook);
    cook = cook.substring (0, cook.indexOf(';'));
    //alert (cook);
    var element = (cook.substring(cook.indexOf('=')+1,cook.length)).split('|');
    if (element.length != 25) {
	  alert ("Not a properly saved metal file. It has " + element.length + " entries; it should have 25.");
        return;
    }

    for (i=0; i<document.newMap.length-3; i++) {
        document.newMap[i].value = element[i];
    }
}


// Make sure the user is accepting cookies
  document.cookie = "testo = junk";
  if (document.cookie=="") alert ("Your browser must accept cookies to access standard materials or user-entered materials.");
  else {

// Create initial drop-down menu. This is a form called selectMetal

  document.write ('<br> <table border = "0" bgcolor = "white" width = "95%">');
  document.write ('<td align="right"> <h2> Enter Data or Choose a Material with Pre-entered Data </h2>');


//  document.write("<td align = middle width = 8%><font size = +1> &nbsp; or</font></td>");
//  document.write("<td align = middle width = 46%><font size = +1>Pick From Pre-Entered Data <br> </font>");


  document.write ('<form name = "selectMetal">');
  document.write("<select onChange = \"changeMetal(this)\" name = \"elements\">");

  std_materials = stdMaterials().substring(0,stdMaterials().length-1).split("; ");
      var mat = new Array();
      var cook = "";
      for (j=0; j< std_materials.length; j=j+1) {
         entry = std_materials[j].split(" ");
         document.write ("<option value=" + entry[0] + "> " + entry[0]);
         cook = cook + "Mat_" + entry[0] + "=";
	 for (var i=1; i<entry.length; i=i+1) {
            cook = cook + entry[i] + "|";
	 }
         cook = cook + "0|1|10E-6|10E-1|1E-10|.1|10; ";

         document.cookie = cook;
	 cook = "";

      }
  user_materialst = (document.cookie).split("; ");
  var user_materials = new Array();
  i=0;
  for (var j=0; j<user_materialst.length; j=j+1) {
      if ((user_materialst[j].indexOf("Mat_") == 0) && (!inStdMats(user_materialst[j].substring(4,user_materialst[j].indexOf("="))))) {
            user_materials[i]=user_materialst[j];
            i=i+1;
      }
  }

      // Now put user materials into form
	  for (i=0; i<user_materials.length; i=i+1) {
	      document.write ("<option value=" + user_materials[i].substring(4, user_materials[i].indexOf("=")) + "> " + user_materials[i].substring(4, user_materials[i].indexOf("=")));
	  }
     document.write("</select>");
     document.write("<input type=\"button\" name = DeleteButton value = \"Delete this Material\" onClick = Remover()> </input>");

     document.write("</td> </table>");

     document.write ("</form>");
}

















