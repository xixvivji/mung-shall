package com.example.backend.common.file;

import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Path;

public interface FileStorageService {
    String storeFile(MultipartFile file, String subdirectory) throws IOException;
    Path loadFile(String filename, String subdirectory);
    void deleteFile(String filename, String subdirectory) throws IOException;
}
