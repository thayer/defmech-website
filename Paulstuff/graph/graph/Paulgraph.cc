#include <iostream>
#include <fstream>
#include <strstream>
#include <math.h>
#include "gnuplot_i.h"

#define T_STEP          0.001
#define T_MIN           T_STEP
#define T_MAX           1.0
#define Y_LOG_MIN       -6
#define Y_LOG_MAX       -1
#define SHEAR_MIN       1E-6
#define SHEAR_MAX       1E-1
#define SHEAR_LOG_STEP  shearLogStep

// Whether to cut off GammaDot5 after a certain point
#define G5CUTOFF        0

#define GAMMA_DOT_ZERO  1E6;

#define NUM_CONTOURS    10

#define THINFILE        "thinplot.dat"
#define THICKFILE       "thickplot.dat"

// Global variables
ofstream thinplot(THINFILE);
ofstream thickplot(THICKFILE);

// Unit adjustments
#define KJtoJ(x) (1000 * x)
#define MNtoN(x) (1000000 * x)

// Material-specific constants
#define NICKEL
#ifdef NICKEL

// Values are in SI units unless specified
const double b                 = 2.49E-10;
const double Kb                = 1.3807E-23;
const double TempDepOfModulus  = -0.64;
const double n                 = 4.6;
const double D0v               = 1.9E-4;
const double Qv                = 284;  // units: kJ/mole
const double R                 = 8.3145;
const double AcD0core          = 3.1E-23;
const double Omega             = 1.09E-29;
const double Mu0               = 7.89E4;  // units: MN/m^2
const double Tm                = 1726;
const double Qcore             = 170;  // units: kJ/mole
const double DeltaD0b          = 3.5E-15;
const double Qb                = 115;  // units: kJ/mole
const double A                 = 3.0E6;
// Note: "TauHat" here is TauHat / Mu0
// Since TauHat involves Mu and then here is divided by Mu0, the MN should
// cancel, so we don't need to adjust units.
const double TauHat            = 6.3E-3;
const double GammaDotP         = 1E6;
const double DeltaF            = 0.5 * MNtoN(Mu0) * pow(b,3);

// Temporary value!
const double DeltaFp = 5E-25;

// Grain size in meters
const double d                 = .0001;
// Boundary thickness in meters
const double Delta             = 5E-10;

#endif // ifdef NICKEL


void PlotShearStressVSTemp(void);


main() {
  PlotShearStressVSTemp();
  return 0;
}


//*********************************************************************
// Tools
//*********************************************************************

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
  gnuplot_cmd(gnuplotPicture, "set output \"deformation.png\"");

  // Plot data collected in files
  cmd1 << "plot [" << T_MIN << ":" << T_MAX << "] [" << Y_LOG_MIN << ":"
       << Y_LOG_MAX << "] \"" << THINFILE << "\" pt 0, \""
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

void PlotShearStressVSTemp(void) {
  double T, HomT, G1, G2, G3, G4, G5, G6, Gtotal, NShear;
  int oldMax, newMax, contour;
  const double shearLogStep = pow(10,.01);

  // This array defines the values for contour lines
  double contours[NUM_CONTOURS] = 
  {1E-10, 1E-9, 1E-8, 1E-7, 1E-6, 1E-5, 1E-4, 1E-3, 1E-2, 1E-1};

  InitPlot();

  //***********************************************************************
  // This loop moves across the x-axis (temperature), and each iteration
  // should plot the shear stress contours as well as region dividing
  // lines for one temperature step.

  for (HomT = T_MIN; HomT < T_MAX; HomT += T_STEP) {
    T = HomT * Tm;
    if (T == 0.0) {
      // Do something better here!
      cerr << "Error: Temperature cannot be zero!" << endl;
      break;  // Out of for-loop
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

      // Calculate rate equation values for this temperature and shear stress
      G1 = GammaDot1(T, NShear);
      G2 = GammaDot2(T, NShear);
      G3 = GammaDot3(T, NShear);
      G4 = GammaDot4(T, NShear);
      if (G5CUTOFF && 
          (T > Tm * 2/3)){ // && 
	  //	  (log10(NShear) < (Y_LOG_MIN + (1/2)*(Y_LOG_MAX - Y_LOG_MIN)))) {
	G5 = 0;
      } else {
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


      if (oldMax == 0) oldMax = newMax;

      // Do we plot a contour line at this point?
      if (contour < NUM_CONTOURS && Gtotal > contours[contour]) {
	do {
	  contour++;
	} while (contour < NUM_CONTOURS && Gtotal > contours[contour]);
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
