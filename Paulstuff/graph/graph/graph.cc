#include <iostream>
#include <fstream>
#include <strstream>
#include <math.h>
#include "gnuplot_i.h"

#define max(a,b) (((a)>(b))?(a):(b))
#define min(a,b) (((a)<(b))?(a):(b))

#define T_STEP          0.001
double T_min           = T_STEP;
double T_max           = 1.0;
double Y_log_min      = -6;
double Y_log_max      = -1;
#define SHEAR_MIN       1E-6
#define SHEAR_MAX       1E-1
#define SHEAR_LOG_STEP  shearLogStep

// Whether to cut off GammaDot5 after a certain point
#define G5CUTOFF        0

#define GAMMA_DOT_ZERO  1E6;

int NumContours    = 11;
double ContoursMin = 1E-10;
double ContoursMax = 1;


#define THINFILE        "thinplot.dat"
#define THICKFILE       "thickplot.dat"

// Global variables
ofstream thinplot(THINFILE);
ofstream thickplot(THICKFILE);

// Unit adjustments
#define KJtoJ(x) (1000 * x)
#define MNtoN(x) (1000000 * x)

// Material-specific variables
// In the order that they appear in interactive.html
// Values are in SI units unless specified

double Omega;
double b;
double Tm;

double Mu0;  // units: MN/m^2
double TempDepOfModulus;

double D0v;
double Qv;  // units: kJ/mole

double DeltaD0b;
double Qb;  // units: kJ/mole

double AcD0core;
double Qcore;  // units: kJ/mole

double n;
double A;

double breakdown;

// Note: "TauHat" here is TauHat / Mu0
// Since TauHat involves Mu and then here is divided by Mu0, the MN should
// cancel, so we don't need to adjust units.
double TauHat;
double GammaDotP;
double DeltaF;

const double Kb                = 1.3807E-23;
const double R                 = 8.3145;

// Temporary value!
const double DeltaFp = 5E-25;

// Grain size in meters
double d;
// Boundary thickness in meters
const double Delta             = 5E-10;

// Graphing variables
char title[200] = "set title \"\"";
char xaxis_label[200] = "set xlabel \"Homologous Temperature\"";
char yaxis_label[200] = "set ylabel \"Normalized Shear Stress\"";
double equations[25];
char* eqStrings[50];

double takeVar (int varNum, double T, double NShear) {
    switch (varNum) {
	case 0: return Omega;
	case 1: return b;
	case 2: return Tm;
	case 3: return Mu0;
	case 4: return TempDepOfModulus;
	case 5: return D0v;
	case 6: return Qv;
	case 7: return DeltaD0b;
	case 8: return Qb;
	case 9: return AcD0core;
	case 10: return Qcore;
	case 11: return n;
	case 12: return A;
	case 13: return breakdown;
	case 14: return TauHat;
	case 15: return GammaDotP;
	case 16: return DeltaF;
        case 17: return d;
	case 18: return Delta;
        case 100: return T;
	case 101: return NShear;
        // Can't be in terms of display options, so the only thing left are 25-50, which are the equations
	default: return equations[varNum-25];
    }
}

char* arg;
double parse (double T, double NShear) {
    // Please see "Notebook" documentation for a description of how the equation modifying functions work.
 
    // Split into 2 parts, the part before the "_" and the part after. Assume there is a "_". arg will be used for the part after the "_".
    char beforePart[100]="";
    memcpy (beforePart, arg, strcspn(arg,"_")*sizeof(char));   // beforePart = substring of arg prior to "_".
    arg = strstr(arg,"_")+sizeof(char);   // arg = substring of arg after the "_".

    // Now, see if the part before the "_" is has an operation or is just a number
    if (beforePart[0]!='O') {   // It's a number.
	if (beforePart[0]=='V')
	    return takeVar(atoi(&beforePart[1]), T, NShear);
	else
            return atoi(beforePart);
    }

    else {   // Evaluate the expression
	int oper = atoi (&beforePart[1]);
    	double operand1, operand2;     // Can support operators that take up to 2 operands.
    	switch (oper) {
		case 0: {   // +
			operand1 = parse (T,NShear);
			operand2 = parse (T,NShear);
			return operand1+operand2;
		}
		case 1: {   // -
			operand1 = parse (T,NShear);
			operand2 = parse (T,NShear);
			return operand1-operand2;
		}
                case 2: {   // *
			operand1 = parse (T,NShear);
			operand2 = parse (T,NShear);
			return operand1*operand2;
		}
		case 3: {   // /
			operand1 = parse (T,NShear);
			operand2 = parse (T,NShear);
			return operand1/operand2;
		}
		case 4: {   // ^
			operand1 = parse (T,NShear);
			operand2 = parse (T,NShear);
			return pow(operand1,operand2);
		}
		case 5: {   // exp
			operand1 = parse (T,NShear);
			return exp(operand1);
		}
		case 6: {   // ln
			operand1 = parse (T,NShear);
			return log(operand1);
		}
		case 7: {   // log
			operand1 = parse (T,NShear);
			return log10(operand1);
		}
		case 8: {   // sqrt
			operand1 = parse (T,NShear);
			return sqrt(operand1);
		}
		case 9: {   // sin
			operand1 = parse (T,NShear);
			return sin(operand1);
		}
		case 10: {   // tan
			operand1 = parse (T,NShear);
			return tan(operand1);
		}
		case 11: {   // asin
			operand1 = parse (T,NShear);
			return asin(operand1);
		}
		case 12: {   // acos
			operand1 = parse (T,NShear);
			return acos(operand1);
		}
		case 13: {   // atan
			operand1 = parse (T,NShear);
			return atan(operand1);
		}
		case 14: {   // sinh
			operand1 = parse (T,NShear);
			return sinh(operand1);
		}
		case 15: {   // tanh
			operand1 = parse (T,NShear);
			return tanh(operand1);
		}
		case 16: {   // min
			operand1 = parse (T,NShear);
			operand2 = parse (T,NShear);
			return min(operand1,operand2);
		}
		case 17: {   // max
			operand1 = parse (T,NShear);
			operand2 = parse (T,NShear);
			return max(operand1,operand2);
		}
		
  	}   // End switch (oper)
    }  // End else
}


void InitializeVars (int argc, char **argv) {
  
  Omega = strtod(argv[1],NULL);
  b = strtod(argv[2],NULL);
  Tm = strtod(argv[3],NULL);
  Mu0 = strtod(argv[4],NULL);
  TempDepOfModulus = strtod(argv[5],NULL);
  D0v = strtod(argv[6],NULL);
  Qv = strtod(argv[7],NULL);
  DeltaD0b = strtod(argv[8],NULL);
  Qb = strtod(argv[9],NULL);
  AcD0core = strtod(argv[10],NULL);
  Qcore = strtod(argv[11],NULL);
  n = strtod(argv[12],NULL);
  A = strtod(argv[13],NULL);
  breakdown = strtod(argv[14],NULL);
  TauHat = strtod(argv[15],NULL);
  GammaDotP = strtod(argv[16],NULL);
  DeltaF = strtod(argv[17],NULL) * MNtoN(Mu0) * pow(b,3);
  d = strtod(argv[18],NULL);

  // Display Options
  T_min = strtod(argv[19],NULL);
  T_max = strtod(argv[20],NULL);
  Y_log_min = log10(strtod(argv[21],NULL));
  Y_log_max = log10(strtod(argv[22],NULL));
  ContoursMin = strtod(argv[23],NULL);
  ContoursMax = strtod(argv[24],NULL);
  NumContours = atoi(argv[25]);
  if (argc==51) {
      for (int i=0; i<25; i++)
          eqStrings[i]= argv[26+i];
  }
} 


void PlotShearStressVSTemp(bool custom);

int main(int argc, char **argv){
  if ((argc!=26) && (argc!=51)) {
   cout << argc << endl;
      return 1;
  }
  cout << "prior" << endl;
  InitializeVars (argc, argv);
  cout << "up to here" << endl;
  PlotShearStressVSTemp(argc==51);
  cout << "done" << endl;
  return 0;
}


//*********************************************************************
// Tools
//*********************************************************************

int max25(double m[25], int start) {
   int i, curr_max_num;
   double curr_max;
   curr_max = m[start];
   curr_max_num = start;

   for (i=start+1; i<25; i++) {
       if (m[i]>curr_max) {
	  curr_max = m[i];
	  curr_max_num = i;
       }
   }
   return curr_max_num;
}

int Max6(double m1, double m2, double m3, double m4, double m5, double m6) {
  if (m1 >= m2 &&
      m1 >= m3 &&
      m1 >= m4 &&
      m1 >= m5 &&
      m1 >= m6)
    return 1;
  if (m2 >= m1 &&
      m2 >= m3 &&
      m2 >= m4 &&
      m2 >= m5 &&
      m2 >= m6)
    return 2;
  if (m3 >= m2 &&
      m3 >= m1 &&
      m3 >= m4 &&
      m3 >= m5 &&
      m3 >= m6)
    return 3;
  if (m4 >= m2 &&
      m4 >= m3 &&
      m4 >= m1 &&
      m4 >= m5 &&
      m4 >= m6)
    return 4;
  if (m5 >= m2 &&
      m5 >= m3 &&
      m5 >= m4 &&
      m5 >= m1 &&
      m5 >= m6)
    return 5;
  // At this point, m6 must be the biggest
  return 6;
}

//*********************************************************************
// GammaDot rate equation functions
//*********************************************************************

// Note: NShear is normalized shear, or SigmaS / Mu

double Mu(double T) {
  //  return (MNtoN(Mu0) * (1 - MNtoN(Mu0) * T * TempDepOfModulus / Tm));
  return (MNtoN(Mu0) * (1 + ((T - 300) / Tm) * TempDepOfModulus));
}

double As(void) {
  return A * pow(sqrt(3), n + 1);
}

double Dcore(double T) {
  return (AcD0core * exp(- KJtoJ(Qcore) / (R * T)));
}

// Common factor by which GammaDot1 and GammaDot2 are multiplied
double Common12(double T, double NShear) {
  return (As() * (Mu(T) * b) / (Kb * T) * pow(NShear, n));
}

double Dv(double T) {
  return (D0v * exp(- KJtoJ(Qv) / (R * T)));
}

double DeltaDb(double T) {
  return (DeltaD0b * exp(- KJtoJ(Qb) / (R * T)));
}

double GammaDot1(double T, double NShear) {
  return (Dv(T) * Common12(T, NShear));
}

double GammaDot2(double T, double NShear) {
  return ((10 / pow(b,2)) * pow(NShear,2) * Dcore(T) * Common12(T, NShear));
}

// Common factor by which GammaDot3 and GammaDot4 are multiplied
double Common34(double T, double NShear) {
  return (42 * Mu(T) * NShear * Omega / (pow(d,2) * Kb * T));
}

double GammaDot3(double T, double NShear) {
  return (Dv(T) * Common34(T, NShear));
}

double GammaDot4(double T, double NShear) {
  return ((M_PI / d) * DeltaDb(T) * Common34(T, NShear));
}

double GammaDot0(double T, double NShear) {
  // return (Alpha * pow(NShear,2));
  return GAMMA_DOT_ZERO;
}

double GammaDot5(double T, double NShear) {
  return (GammaDot0(T, NShear) * 
	  exp(-(DeltaF / (Kb * T)) * (1 - NShear / TauHat)));
  //	  exp(-(DeltaF / (Kb * T)) * (1 - Mu(T) * NShear / (MNtoN(Mu0) * TauHat))));
}

// Note: here I substitute tau for taup
double GammaDot6(double T, double NShear) {
  return (pow(NShear,2) * GammaDotP *
	  exp(-(DeltaFp / (Kb * T)) * 
	      pow(1 - pow(Mu(T) * NShear / (MNtoN(Mu0) * TauHat),
			  (3/4)),
		  (4/3))));
}

double GammaDotTotal(double G1, double G2, double G3, 
		     double G4, double G5, double G6) {
  double temp1, temp2, result;

  // Min of G5 and G6
  if (G5 < G6)
    temp1 = G5;
  else
    temp1 = G6;

  // Max of (G1 + G2 + G3 + G4) and Min(G5, G6)
  temp2 = G1 + G2 + G3 + G4;
  if (temp2 > temp1)
    result = temp2;
  else
    result = temp1;

  return result;
}

//*********************************************************************
// Plotting functions
//*********************************************************************

void InitPlot(void) {
  // Does nothing right now
}

void CleanupPlot(void) {
  // Does nothing right now
}

void PlotThin(double T, double GD) {
  thinplot << T << " " << GD << endl;
}

void PlotThick(double T, double GD) {
  thickplot << T << " " << GD << endl;
}

void PlotLogThin(double T, double GD) {
  thinplot << T << " " << log10(GD) << endl;
}

void PlotLogThick(double T, double GD) {
  thickplot << T << " " << log10(GD) << endl;
}

void GeneratePicture(void) {
  char buf1[100];
  ostrstream cmd1(buf1, 100);

  // Set up the session to create a .png file
  gnuplot_ctrl * gnuplotPicture;
  gnuplotPicture = gnuplot_init() ;
  gnuplot_cmd(gnuplotPicture, "set term png color");
  gnuplot_cmd(gnuplotPicture, "set nokey");
  gnuplot_cmd(gnuplotPicture, title);
  gnuplot_cmd(gnuplotPicture, xaxis_label); 
  gnuplot_cmd(gnuplotPicture, yaxis_label); 
  gnuplot_cmd(gnuplotPicture, "set output \"deformation.png\"");

  // Plot data collected in files
  cmd1 << "plot [" << T_min << ":" << T_max << "] [" << Y_log_min << ":"
       << Y_log_max << "] \"" << THINFILE << "\" pt 0, \""
       << THICKFILE << "\" pt 6 ps .75" << '\000';
  gnuplot_cmd(gnuplotPicture, buf1);

  gnuplot_close(gnuplotPicture);
}
  

//*********************************************************************
// Driver functions
//*********************************************************************

//*************************************************************************
// This function plots normalized shear stress vs. temperature over melting
// temperature (imitating Fig. 1.2 p4).
// It calculates the values for all rate equations at every point, plots
// them, and then plots the contour dividing regions with a stronger point.

void PlotShearStressVSTemp(bool custom) {
  double T, HomT, G1, G2, G3, G4, G5, G6, Gtotal, NShear;
  int oldMax, newMax, contour, i;
  const double shearLogStep = pow(10,.01);

  // Define the values for contour lines
  double contours[NumContours];
  double x = pow(10,(log10(ContoursMax/ContoursMin)/(NumContours-1)));
  contours[0] = ContoursMin;
  for (int i =1; i<NumContours; i++) {
       contours[i] = contours[i-1]*x;
       //      cout << "contours[" << i << "]: " << contours[i] << endl;
  }

  InitPlot();

  //***********************************************************************
  // This loop moves across the x-axis (temperature), and each iteration
  // should plot the shear stress contours as well as region dividing
  // lines for one temperature step.

  for (HomT = T_min; HomT < T_max; HomT += T_STEP) {
    T = HomT * Tm;
    if (T <= 0) {
      T = TauHat*Mu0;
      // Do something better here!
      // cerr << "Error: Temperature cannot be zero!" << endl;
      // break;  // Out of for-loop
    }

    oldMax = 0;
    newMax = 0;
    contour = 0;

    //*********************************************************************
    // This loop moves up the y-axis (shear stress, plotted logarithmically)
    // and checks each point to see if it should be plotted as either a
    // contour line or change in region.
    // Note: this is plotted on a logarithmic scale, so the shear is
    // incremented by multiplying rather than adding

    for (NShear = SHEAR_MIN; NShear < SHEAR_MAX; NShear *= SHEAR_LOG_STEP) {
      if (custom) {
          for (i=0; i<25; i++) {
	      arg = eqStrings[i];
	      cout << "parsing, " << eqStrings[i] << endl;
              equations[i] = parse(T,NShear);
              cout << "after:" << eqStrings[i] << endl;
          }
          
	  newMax = max25 (equations, 15);
      }
      else {

          // Calculate rate equation values for this temperature and shear stress
          G1 = GammaDot1(T, NShear);
          G2 = GammaDot2(T, NShear);
          G3 = GammaDot3(T, NShear);
          G4 = GammaDot4(T, NShear);
          if (G5CUTOFF && 
              (T > Tm * 2/3)){ // && 
        	  //	  (log10(NShear) < (Y_log_min + (1/2)*(Y_log_max - Y_log_min)))) {
	      G5 = 0;
          } 
          else {
	      G5 = GammaDot5(T, NShear);
          }
          G6 = G5; // GammaDot6(T, NShear);
          Gtotal = GammaDotTotal(G1, G2, G3, G4, G5, G6);
          newMax = Max6(G1, G2, G3, G4, G5, G6);

#ifdef DEBUG
      cerr << G1 << " " << G2 << " " << G3 << " " 
	   << G4 << " " << G5 << " " << G6 << endl;
      cerr << T << " " << Gtotal << " " << newMax << endl;
#endif

      }


      if (oldMax == 0) oldMax = newMax;

      // Do we plot a contour line at this point?
      if (contour < NumContours && Gtotal > contours[contour]) {
	do {
	  contour++;
	} while (contour < NumContours && Gtotal > contours[contour]);
	PlotLogThin(HomT, NShear);
      }
      
      // Have we changed from one region to another?
      if (newMax != oldMax) {
	oldMax = newMax;
	PlotLogThick(HomT, NShear);
      }
    }  // End for(NShear)
  }  // End for(HomT)

  // Turn the plotfiles we've generated into a picture
  GeneratePicture();

  CleanupPlot();
}
