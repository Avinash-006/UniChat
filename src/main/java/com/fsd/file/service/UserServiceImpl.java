package com.fsd.file.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.fsd.file.model.FileEntity;
import com.fsd.file.model.FileDTO;
import com.fsd.file.model.User;
import com.fsd.file.repository.FileRepository;
import com.fsd.file.repository.UserRepository;

@Service
public class UserServiceImpl implements UserService {
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private FileRepository fileRepository;

    @Override
    public String adduser(User u) {
        // Check if username already exists
        if (usernameExists(u.getUsername())) {
            throw new RuntimeException("Username already taken");
        }
        // Check if email already exists
        if (emailExists(u.getEmail())) {
            throw new RuntimeException("Email already taken");
        }
        User savedUser = userRepository.save(u);
        return "User added successfully with ID: " + savedUser.getId();
    }

    @Override
    public String update(User u) {
        return userRepository.findById(u.getId())
            .map(user -> {
                user.setUsername(u.getUsername());
                user.setEmail(u.getEmail());
                user.setPassword(u.getPassword());
                userRepository.save(user);
                return "Updated Successfully";
            })
            .orElse("Cannot Update");
    }

    @Override
    public String delete(int id) {
        return userRepository.findById(id)
            .map(user -> {
                userRepository.delete(user);
                return "Deleted Successfully";
            })
            .orElse("Cannot Delete");
    }

    @Override
    public List<User> viewall() {
        return userRepository.findAll();
    }

    @Override
    public User viewbyid(int id) {
        return userRepository.findById(id).orElse(null);
    }

    @Override
    public User loginUser(User user) {
        User existingUser = null;
        // Check by username if provided
        if (user.getUsername() != null && !user.getUsername().isEmpty()) {
            existingUser = userRepository.findByUsername(user.getUsername());
        }
        // If username not provided or not found, check by email
        if (existingUser == null && user.getEmail() != null && !user.getEmail().isEmpty()) {
            existingUser = userRepository.findByEmail(user.getEmail());
        }
        if (existingUser != null && existingUser.getPassword().equals(user.getPassword())) {
            System.out.println("Login successful for user: " + existingUser.getUsername());
            return existingUser;
        }
        System.out.println("Login failed for user: " + user.getUsername() + " or email: " + user.getEmail());
        throw new RuntimeException("Invalid credentials");
    }

    @Override
    public User getUserByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    @Override
    public String updateFavouriteStatus(Long fileId, Boolean isFavourite) {
        return fileRepository.findById(fileId)
            .map(file -> {
                file.setIsFavourite(isFavourite);
                fileRepository.save(file);
                return "Favourite status updated";
            })
            .orElse("Cannot update favourite status");
    }

    @Override
    public List<FileDTO> getFavouriteFiles(String username) {
        User user = userRepository.findByUsername(username);
        if (user == null) {
            throw new RuntimeException("User not found: " + username);
        }
        return fileRepository.findByUserIdAndIsFavouriteTrue(user.getId())
            .stream()
            .map(FileDTO::new)
            .collect(Collectors.toList());
    }

    @Override
    public boolean usernameExists(String username) {
        return userRepository.findByUsername(username) != null;
    }

    @Override
    public boolean emailExists(String email) {
        return userRepository.findByEmail(email) != null;
    }
}