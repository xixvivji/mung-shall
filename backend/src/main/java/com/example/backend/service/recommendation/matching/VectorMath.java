package com.example.backend.service.recommendation.matching;

public final class VectorMath {

    private VectorMath() {}

    public static double cosine(float[] a, float[] b) {
        if(a == null || b == null) return -1.0;
        if(a.length != b.length) return -1.0;

        double dot = 0;
        double na = 0;
        double nb = 0;

        for(int i=0; i<a.length; i++) {
            double x = a[i];
            double y = b[i];
            dot += x * y;
            na += x * x;
            nb += y * y;
        }

        double denom = Math.sqrt(na) * Math.sqrt(nb);
        if(denom == 0) return -1.0;

        return dot / denom;
    }

}
