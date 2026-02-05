package com.example.backend.common.file;

import com.example.backend.service.S3Service;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;

@Primary // Make this the primary implementation of FileStorageService
@Service
@RequiredArgsConstructor
public class S3FileStorageService implements FileStorageService {

    private final S3Service s3Service;

    @Override
    public String storeFile(MultipartFile file, String subdirectory) throws IOException {
        // S3Service already handles unique naming and returns the full URL
        // The subdirectory can be used by S3Service if it needs to prefix the filename
        // For now, S3Service directly uploads and returns URL, so subdirectory is not directly used here
        // but could be passed to S3Service if its uploadFile method was modified to accept it.
        // Modified to pass subdirectory to s3Service.uploadFile
        return s3Service.uploadFile(file, subdirectory);
    }

    @Override
    public Path loadFile(String filename, String subdirectory) {
        // S3 does not directly expose files as local Paths.
        // This method is primarily for local file systems.
        // For S3, you would typically return the URL or stream the content.
        // Returning null or throwing an UnsupportedOperationException might be appropriate
        // if direct Path access is not intended for S3-backed storage.
        // For now, returning a dummy path or throwing an exception.
        // If the user needs to load S3 files as Path, a different approach is needed (e.g., downloading to temp).
        throw new UnsupportedOperationException("Loading S3 files as local Path is not supported by S3FileStorageService. Use the URL for access.");
    }

    @Override
    public void deleteFile(String fileUrl, String subdirectory) throws IOException {
        // S3Service's deleteFile expects the full S3 URL
        s3Service.deleteFile(fileUrl);
    }
}
