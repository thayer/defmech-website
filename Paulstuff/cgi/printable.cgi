#!/usr/bin/perl

print "Content-type: text/html\n\n";

srand (time|$$);
$length = 6;
$letters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
foreach $i (0..$length-1) {
    $newName .= substr($letters,rand(length($letters)),1);
}
$newName .= ".png";

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

sub dataCheck {
    local($key) = pop(@_);
  if ($key =~ /[!\?\*\^\$\@\(\)\[\]\|\\%#~`_<>{}=:;,\/]+/) {
	print "<h1>Error - Illegal input ($key)<br>\n";
	print "No non-alphanumeric characters.</h><br>\n";
	return 1;
    }
  return 0;
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

print <<EndHead;
<title>Map</title>
<body>
<img src = "../temp/$newName">
EndHead
print "</body></html>";

















