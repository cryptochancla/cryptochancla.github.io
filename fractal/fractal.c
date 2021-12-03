#include <stdio.h>
typedef struct {
    double r;       // a fraction between 0 and 1
    double g;       // a fraction between 0 and 1
    double b;       // a fraction between 0 and 1
} rgb;

typedef struct {
    double h;       // angle in degrees
    double s;       // a fraction between 0 and 1
    double v;       // a fraction between 0 and 1
} hsv;

static rgb   hsv2rgb(double h,double s,double v);


rgb hsv2rgb(double h, double s, double v)
{
	hsv in;
	in.h=h;
	in.s=s;
	in.v=v;
    double      hh, p, q, t, ff;
    long        i;
    rgb         out;

    if(in.s <= 0.0) {       // < is bogus, just shuts up warnings
        out.r = in.v;
        out.g = in.v;
        out.b = in.v;
        return out;
    }
    hh = in.h;
    if(hh >= 360.0) hh = 0.0;
    hh /= 60.0;
    i = (long)hh;
    ff = hh - i;
    p = in.v * (1.0 - in.s);
    q = in.v * (1.0 - (in.s * ff));
    t = in.v * (1.0 - (in.s * (1.0 - ff)));

    switch(i) {
    case 0:
        out.r = in.v;
        out.g = t;
        out.b = p;
        break;
    case 1:
        out.r = q;
        out.g = in.v;
        out.b = p;
        break;
    case 2:
        out.r = p;
        out.g = in.v;
        out.b = t;
        break;

    case 3:
        out.r = p;
        out.g = q;
        out.b = in.v;
        break;
    case 4:
        out.r = t;
        out.g = p;
        out.b = in.v;
        break;
    case 5:
    default:
        out.r = in.v;
        out.g = p;
        out.b = q;
        break;
    }
    return out;     
}
int *calc_mandel(float x_min, float x_max, float y_min, float y_max, int largeur, int hauteur, int *tab) {
	float x_incr_z = (x_max-x_min)/largeur;
    float y_incr_z = (y_max-y_min)/hauteur;
	rgb couleur;
	int index;
    int x_ecran = 0;
    float x = x_min;
    while(x<x_max){
        x+=x_incr_z;
        x_ecran ++;

        float y_ecran = 0;
        float y = y_min;
        while(y<y_max){
            y += y_incr_z;
            y_ecran ++;

            int n = 0;
            float an = x;
            float bn = y;
            float anp1 = x;
            float bnp1 = y;
            float m=anp1*anp1+bnp1*bnp1;
            int nmax=1580;
            while(n<nmax && !(m > 4) ){

                an = anp1;
                bn = bnp1;

                anp1 = an*an - bn*bn + x;
                bnp1 = 2*an*bn + y;

                n ++; 
				m=anp1*anp1+bnp1*bnp1;
            }
            
            
			if(n<nmax){ 

                float satur = 1;

                float light = n / nmax;

                index = y_ecran * (largeur * 4) + x_ecran * 4;
                couleur = hsv2rgb((n)/1580, satur, light);

                tab[index] = couleur.r;
                tab[index+1] = couleur.g;
                tab[index+2] = couleur.b;
                tab[index+3] = 255;



            }else{

                index = y_ecran * (largeur * 4) + x_ecran * 4;

                couleur = hsv2rgb(1, 1, 0);

                tab[index] = couleur.r;
                tab[index+1] = couleur.g;
                tab[index+2] = couleur.b;
                tab[index+3] = 255;
            } 


        }

    }
    return tab;
}
