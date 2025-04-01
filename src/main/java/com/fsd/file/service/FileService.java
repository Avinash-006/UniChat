package com.fsd.file.service;

import com.fsd.file.model.FileEntity;
import com.fsd.file.model.FileDTO;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

public interface FileService {
    FileEntity addFile(int userId, MultipartFile file) throws IOException;
    FileEntity getFile(Long id);
    List<FileDTO> getUserFiles(String username);
    String delete(Long id);
}