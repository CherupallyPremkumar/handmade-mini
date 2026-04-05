package com.pochampally.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.io.IOException;
import java.io.InputStream;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class ImageStorageService {

    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of(
            "image/jpeg", "image/png", "image/webp"
    );
    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

    private final S3Client s3Client;

    @Value("${cloudflare.r2.bucket}")
    private String bucket;

    @Value("${cloudflare.r2.public-domain}")
    private String publicDomain;

    /**
     * Upload an image to Cloudflare R2.
     *
     * @param file    the multipart file to upload
     * @param productId the product this image belongs to
     * @return the public CDN URL for the uploaded image
     */
    public String uploadImage(MultipartFile file, String productId) {
        validateFile(file);

        String originalFilename = file.getOriginalFilename();
        String extension = extractExtension(originalFilename);
        String key = "products/" + productId + "/" + UUID.randomUUID() + extension;

        try {
            PutObjectRequest putRequest = PutObjectRequest.builder()
                    .bucket(bucket)
                    .key(key)
                    .contentType(file.getContentType())
                    .contentLength(file.getSize())
                    .build();

            s3Client.putObject(putRequest, RequestBody.fromInputStream(file.getInputStream(), file.getSize()));

            String cdnUrl = "https://" + publicDomain + "/" + key;
            log.info("Uploaded image for product {}: {}", productId, cdnUrl);
            return cdnUrl;
        } catch (IOException e) {
            throw new RuntimeException("Failed to upload image: " + e.getMessage(), e);
        }
    }

    /**
     * Delete an image from Cloudflare R2 by its CDN URL.
     *
     * @param imageUrl the full CDN URL of the image
     */
    public void deleteImage(String imageUrl) {
        String key = extractKeyFromUrl(imageUrl);

        DeleteObjectRequest deleteRequest = DeleteObjectRequest.builder()
                .bucket(bucket)
                .key(key)
                .build();

        s3Client.deleteObject(deleteRequest);
        log.info("Deleted image from R2: {}", key);
    }

    private void validateFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("File is empty");
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException(
                    "File size exceeds maximum of 5MB. Got: " + (file.getSize() / (1024 * 1024)) + "MB");
        }

        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType)) {
            throw new IllegalArgumentException(
                    "Invalid file type: " + contentType + ". Allowed: JPEG, PNG, WebP");
        }

        validateMagicBytes(file, contentType);
    }

    /**
     * Validates that the file's magic bytes match its claimed Content-Type.
     * Prevents attackers from uploading disguised files.
     */
    private void validateMagicBytes(MultipartFile file, String contentType) {
        try (InputStream is = file.getInputStream()) {
            byte[] header = new byte[12];
            int bytesRead = is.read(header);
            if (bytesRead < 3) {
                throw new IllegalArgumentException("File too small to identify");
            }

            boolean valid = switch (contentType) {
                case "image/jpeg" ->
                        // JPEG: FF D8 FF
                        (header[0] & 0xFF) == 0xFF && (header[1] & 0xFF) == 0xD8 && (header[2] & 0xFF) == 0xFF;
                case "image/png" ->
                        // PNG: 89 50 4E 47
                        bytesRead >= 4
                                && (header[0] & 0xFF) == 0x89 && (header[1] & 0xFF) == 0x50
                                && (header[2] & 0xFF) == 0x4E && (header[3] & 0xFF) == 0x47;
                case "image/webp" ->
                        // WebP: RIFF (52 49 46 46)
                        bytesRead >= 4
                                && (header[0] & 0xFF) == 0x52 && (header[1] & 0xFF) == 0x49
                                && (header[2] & 0xFF) == 0x46 && (header[3] & 0xFF) == 0x46;
                default -> false;
            };

            if (!valid) {
                throw new IllegalArgumentException(
                        "File content does not match declared Content-Type: " + contentType);
            }
        } catch (IOException e) {
            throw new IllegalArgumentException("Failed to read file for validation", e);
        }
    }

    private String extractExtension(String filename) {
        if (filename == null || !filename.contains(".")) {
            return "";
        }
        return filename.substring(filename.lastIndexOf('.'));
    }

    /**
     * Extract the R2 object key from the full CDN URL.
     * e.g., "https://images.pochampally.com/products/abc/img.jpg" -> "products/abc/img.jpg"
     */
    private String extractKeyFromUrl(String imageUrl) {
        String prefix = "https://" + publicDomain + "/";
        if (imageUrl.startsWith(prefix)) {
            return imageUrl.substring(prefix.length());
        }
        throw new IllegalArgumentException("Invalid image URL: does not match configured public domain");
    }
}
