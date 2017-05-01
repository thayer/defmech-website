%Nickel
function Nickel

% ymax = -1;
% ymin = -6;

% T = linspace(0, 1, 10);
% T = [T; T; T; T; T; T; T; T; T; T]
% stress = logspace(ymin, ymax, 10);
% stress = [stress' stress' stress' stress' stress' stress' stress' stress' stress' stress']
T = zeros(10, 10);
row = linspace(1, 1726, 10);
for i = 1:10,
    T(i,:) = row;
end
    

R = 8.314 * 10^(-3); %kJ/mol.K

% Calculating Dv
Qv = 284; %kJ/mole
Dov = 1.9 * 10^(-4); %m^2/s
Dv = Dov * exp(-Qv./(R*T));

% Calculating deltaDb
Qb = 115; %kJ/mole
deltaDob = 3.5 * 10^-15; %m^3/s
deltaDb = deltaDob * exp(-Qb./(R*T));


% Calculating AcDc
Qc = 170; %kJ/mole
AcDoc = 3.1 * 10^(-23); %m^4/s
AcDc = AcDoc * exp(-Qc./(R*T));

% calculating u(T), shear modulus
Tm = 1726; %K
TempDepMod = -0.64; %((Tm/uo)(du/dT))
uo = 7.89 * 10^(4); %MN/m^2
u = uo * (1 + ((T-300)/Tm) *TempDepMod);

stressN = zeros(10,10);
column = linspace(10^-6, 10^-1, 10);
for i=1:10
    stressN(:,i) = column';
end

% calculating Gemma2
Gemma0 = 10^6; %/s
b = 2.49*10^(-10); %m
deltaF = 0.5 * uo * (b^3);
k = 1.381 * 10^-23; %boltzmann's constant(J/K)
tau = 6.3 * 10^(-3) * uo;
% a = 1-((stressN.*u)/tau)
% b = -deltaF./(k.*T)
% a.*b
% Gemma2 = exp(b.*a)
Gemma2 = Gemma0 * exp(-(deltaF./(k*T)) .*(1 - (stressN.*u/tau)));
%warning off MATLAB:singularMatrix;

% calculating Deff
% a = 10*AcDc/(b^2);
% Deff = Dv + a*(stressN).^2
Deff = Dv + (10*AcDc.*(stressN.^2)/(b^2));

% calculating Gemma4
A = 3.0*10^6;
n = 4.6;
A2 = (sqrt(3))^(n+1)*A;
Gemma4 = (A2*Deff.*u*b)./(n*T) .* (stressN.^n);


d = 10^(-4); %grain size (m)

% calculating Deff2
Deff2 = Dv + (pi*deltaDb)/d;

% calculating Gemma7
omega = 1.09 * 10^(-29); %m^3
% a = 42*stressN.*u.*Deff2*omega;
% b = k*T*(d^2);
% Gemma7 = a./b
Gemma7 = (42*stressN.*u*omega.*Deff2) ./ (k*T*d^2);

GemmaPlas = Gemma2; % Gemma3 missing because Nickel is fcc
% Gemma4
% Gemma2
max(Gemma4, Gemma2);

GemmaTotal = max(Gemma4, GemmaPlas) + Gemma7;
[C, h] = contour(T/Tm, stressN, log10(GemmaTotal));
set(gca, 'YScale', 'log');
xlabel('Homologous Temperature T/Tm')
ylabel(['Normalized Shear Stress ' texlabel('sigma_s/mu')]) 
clabel(C, h);