package com.example.backend.config;

import java.nio.ByteBuffer;
import java.nio.ByteOrder;

public final class FloatVectorCodecConfig {

    private FloatVectorCodecConfig() {}

    public static byte[] floatsToBytes(float[] v) {
        if (v == null) return null;
        ByteBuffer bb = ByteBuffer.allocate(v.length * 4).order(ByteOrder.LITTLE_ENDIAN);
        for (float f : v) bb.putFloat(f);
        return bb.array();
    }

    public static float[] bytesToFloats(byte[] bytes) {
        if (bytes == null) return null;
        if (bytes.length % 4 != 0) {
            throw new IllegalArgumentException("Invalid float blob length=" + bytes.length);
        }
        ByteBuffer bb = ByteBuffer.wrap(bytes).order(ByteOrder.LITTLE_ENDIAN);
        int n = bytes.length / 4;
        float[] out = new float[n];
        for (int i = 0; i < n; i++) out[i] = bb.getFloat();
        return out;
    }

}
