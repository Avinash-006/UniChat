package com.fsd.file.service;

import com.fsd.file.model.FileDTO;
import com.fsd.file.model.User;

import java.util.List;

public interface UserService {
    String adduser(User u);
    String update(User u);
    String delete(int id);
    List<User> viewall();
    User viewbyid(int id);
    User loginUser(User user);
    User getUserByUsername(String username);
    String updateFavouriteStatus(Long fileId, Boolean isFavourite);
    List<FileDTO> getFavouriteFiles(String username);
    boolean usernameExists(String username);
    boolean emailExists(String email);
}