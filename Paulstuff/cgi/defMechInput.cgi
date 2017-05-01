#!/usr/bin/perl

print "Content-type: text/html\n\n";

   ##
   #This removes everything in the temp folder.  this may be a problem if there are multiple users
   ##

system("rm ../temp/*");

   ##
   #setup random name for picture file.  Otherwise browsers don't reload new pictures.
   ##

srand (time|$$);
$length = 6;
$letters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
foreach $i (0..$length-1) {
    $newName .= substr($letters,rand(length($letters)),1);
}
$newName .= ".png";

   ##
   #Opens file 'inputData.dat' to write data to.
   ##

#open(OUTF,">../temp/inputData.dat") or dienice("file didn't open $!");
#flock(OUTF,2);

@values = split(/&/,$ENV{'QUERY_STRING'});
$datalist = "";
foreach $i (@values) {
    ($varname, $mydata) = split(/=/,$i);
    $mydata =~ s/%([a-fA-F0-9][a-fA-F0-9])/pack("C", hex($1))/eg;

    # Data checking is now being done with javascript in interactive.html
    # However, this checking is duplicated (to some extent) here for security reasons
    if (dataCheck($mydata) =~ /1/){
	last theEnd;
    }
    $datalist .= "$mydata ";
}

#flock(OUTF, 0);
#close OUTF;

   #########################################################################
   #function: dataCheck($key)                                                                 #
   #    This function checks to see if the data entered is formatted properly for the program #
   #"graph" (which is subsequently called).  It checks to see that numbers were entered. No   #
   #letters other than upper case 'E' are allowed, and no spaces.  It also checks for doubled #
   #up periods and 'E's. I'm sure I didn't think of every possible outcome, but this should   #
   #be acceptable.                                                                            #
   #Returns: '1' if the data is bad.  '0' if data is good                                     #
   #         It also prints out an error message telling the user which input is bad and why  #
   ############################################################################################  

sub dataCheck {
    local($key) = pop(@_);
    if ($key =~ /[a-d]+/){
	print "<h1>Error - Illegal input ($key)<br>\n";
	print "No lower case letters. (3.4 x 10<sup>6</sup> = 3.4E6).</h><br>\n";
	return 1;
    }
    elsif ($key =~ /[f-z]+/){
	print "<h1>Error - Illegal input ($key)<br>\n";
	print "No lower case letters. (3.4 x 10<sup>6</sup> = 3.4E6).</h><br>\n";
	return 1;
    }
    elsif ($key =~ /[!\+\?\*\^\$\@\(\)\[\]\|\\%#~`<>{}=:;,\/]+/) {
	print "<h1>Error - Illegal input ($key)<br>\n";
	print "No non-alphanumeric characters.</h><br>\n";
	return 1;
    }
    elsif ($key =~ /[A-D]+/) {
	print "<h1>Error - Illegal input ($key)<br>\n";
	print "No upper case letters other than E for exponents. (3.4 x 10<sup>6</sup> = 3.4E6).</h><br>\n";
	return 1;
    }
    elsif ($key =~ /[F-N]+/) {
	print "<h1>Error - Illegal input ($key)<br>\n";
	print "No upper case letters other than E for exponents. (3.4 x 10<sup>6</sup> = 3.4E6).</h><br>\n";
	return 1;
    }
    elsif ($key =~ /[P-U]+/) {
	print "<h1>Error - Illegal input ($key)<br>\n";
	print "No upper case letters other than E for exponents. (3.4 x 10<sup>6</sup> = 3.4E6).</h><br>\n";
	return 1;
    }
    elsif ($key =~ /[W-Z]+/) {
	print "<h1>Error - Illegal input ($key)<br>\n";
	print "No upper case letters other than E for exponents. (3.4 x 10<sup>6</sup> = 3.4E6).</h><br>\n";
	return 1;
    }
    elsif ($key =~/E{2,9}/) {
	print "<h1>Error - Illegal input ($key)<br>\n";
	print "Too many 'E's.</h><br>\n";
	return 1;
    }
    elsif ($key =~/E+[0-9]+E+/) {
	print "<h1>Error - Illegal input ($key)<br>\n";
	print "Too many 'E's.</h><br>\n";
	return 1;
    }
    elsif ($key =~ /\++/){
	print "<h1>Error - Illegal input ($key)<br>\n";
	print "No spaces.  Make sure you didn't leave any spaces at the end of your inputs.</h><br>\n";
	return 1;
    }
    elsif ($key =~ /\.{2,9}/) {
	print "<h1>Error - Illegal input ($key)<br>\n";
	print "Only one period in a row.</h><br>\n";
	return 1;
    }
    elsif ($key =~ /\.+[0-9]+\.+/) {
	print "<h1>Error - Illegal input ($key)<br></h>\n";
	print "Too many periods.</h><br>\n";
	return 1;
    }
    else {
	return 0;
    }
}

    # For arcane reasons I don't feel like figuring out,
    # the Gnuplot interface library crashes if we do not 
    # have DISPLAY set to something.  It doesn't need to
    # be a valid value, but it must exist.  So, we'll make
    # it exist.  Pay no attention to the hacker in the 
    # corner...
    # code by Michael Fromberger
$ENV{'DISPLAY'} = ""; 

$grapho = "../cgi/graph " . "$datalist";

unless($ENV{'PATH'} =~ m|/usr/local/gnuplot/bin|) {
    $ENV{'PATH'} = join(':', $ENV{'PATH'}, "/usr/local/gnuplot/bin");
}

chdir("../temp"); # so results will go in the right place
unless(($result = system("$grapho")) == 0) {
  print "
  <TITLE>Error Running the Graph Program</TITLE>
  <BODY BGCOLOR='white'>
    <H1>Error running the graph program</H1>
$grapho
    <P>The PATH was $ENV{'PATH'}</P>
    <P>The error result code is $result</P>
 
 ";
print "</body></html>";
 exit 0;
}

system("mv deformation.png $newName");

print <<EndHead1;
<title>Map</title>
<body bgcolor = "gray" link = "blue" alink = "red" vlink = "red">
<center>
<table bgcolor="white" cellpadding="3" cellspacing="0" border="1" bordercolor="black" width="100%">    
    <tr align ="center"><td width = "100%"><font size = "80" color="Black">DEFORMATION-MECHANISM</font></td></tr>
    <tr align ="center"><td width = "100%"><font size = "80" color="Black">MAPS</font></td></tr>
    <tr align ="center"><td width = "100%"><font size = "5" color="Black">The Plasticity and Creep of Metals and Ceramics</font></td></tr>
</table>

<table bgcolor = "white" cellpadding = "0" cellspacing = "0" border = "1" width = "100%">
<tr align = "center">
<td>
<br>
<center>
<font size = "+1">Go 
<SCRIPT language = "JavaScript">
    document.write("<font size = +1><a href = '../interactive.html' onClick=history.back();return false;>Back</a></font>")
</SCRIPT>
<noscript>
Back
</noscript>
 to Enter a Different Set of Data</font><br>
<font size = "+1"><META or></font><br>

<font size = "+1"><META Enter Data into the Form Below to Create a Printable Map></font><br><br>

<table bgcolor="white" cellpadding = "4" cellspacing = "3" border = "4" width ="75%">
	    <tr align = "center">
	    <td><img src = "../temp/$newName"></td>
	    </tr>
</table>
<br>
EndHead1

#<form name = "mapTitle" method = "get" action = "../cgi/printable.cgi">
#<input type = "text" name = datalist value = "
#EndHead1
#print "$datalist";
#print <<EndHead2;
#">
#<font size = "+1">Title: </font><input type = "text" size = "20" name = title><br>
#<font size = "+1">X-Axis: </font><input type = "text" size = "20" name = x_axis>
#<font size = "+1">Y-Axis: </font><input type = "text" size = "20" name = y_axis>
#<input type = "submit">
#</form>
print "</td></tr>";
print "</table>";
print "</center>";
#EndHead2

print "</body></html>";




























































