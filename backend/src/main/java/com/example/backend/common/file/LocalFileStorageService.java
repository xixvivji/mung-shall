package com.example.backend.common.file;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class LocalFileStorageService implements FileStorageService {

    @Value("${file.upload-dir:uploads}") // Default to 'uploads' directory in the project root
    private String uploadDir;

    private Path getUploadPath(String subdirectory) {
        Path uploadPath = Paths.get(uploadDir, subdirectory).toAbsolutePath().normalize();
        try {
            Files.createDirectories(uploadPath);
        } catch (IOException e) {
            throw new RuntimeException("Could not create upload directory: " + uploadPath, e);
        }
        return uploadPath;
    }

    @Override
    public String storeFile(MultipartFile file, String subdirectory) throws IOException {
        String originalFilename = file.getOriginalFilename();
        String fileExtension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            fileExtension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }
        String filename = UUID.randomUUID().toString() + fileExtension; // Generate unique filename

        Path targetLocation = getUploadPath(subdirectory).resolve(filename);
        Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);
        return filename; // Return just the filename, not the full path
    }

    @Override
    public Path loadFile(String filename, String subdirectory) {
        return getUploadPath(subdirectory).resolve(filename).normalize();
    }

    @Override
    public void deleteFile(String filename, String subdirectory) throws IOException {
        Path fileToDelete = getUploadPath(subdirectory).resolve(filename).normalize();
        Files.deleteIfExists(fileToDelete);
    }
}
