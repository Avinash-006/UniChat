package com.fsd.file.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import com.fsd.file.model.User;
import com.fsd.file.model.FileDTO;
import com.fsd.file.service.UserService;

@CrossOrigin("*")
@RestController
@RequestMapping("/api/users")
public class UserController {
    @Autowired
    private UserService userService;

    @PostMapping("/add")
    public ResponseEntity<String> addUser(@RequestBody User user) {
        try {
            String result = userService.adduser(user);
            return ResponseEntity.ok(result);
        } catch (RuntimeException e) {
            if (e.getMessage().equals("Username already taken")) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body("Username already taken");
            } else if (e.getMessage().equals("Email already taken")) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body("Email already taken");
            } else {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body("An error occurred during registration");
            }
        }
    }

    @PutMapping("/update")
    public String updateUser(@RequestBody User user) {
        return userService.update(user);
    }

    @DeleteMapping("/delete/{id}")
    public String deleteUser(@PathVariable int id) {
        return userService.delete(id);
    }

    @GetMapping("/viewall")
    public List<User> viewAllUsers() {
        return userService.viewall();
    }

    @GetMapping("/view/{id}")
    public User viewUserById(@PathVariable int id) {
        return userService.viewbyid(id);
    }

    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody User user) {
        try {
            User loggedInUser = userService.loginUser(user);
            return ResponseEntity.ok(loggedInUser);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Invalid credentials");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("An error occurred during login");
        }
    }

    @PutMapping("/file/favourite/{fileId}/{isFavourite}")
    public String updateFavouriteStatus(@PathVariable Long fileId, @PathVariable Boolean isFavourite) {
        return userService.updateFavouriteStatus(fileId, isFavourite);
    }

    @GetMapping("/file/favourites/{username}")
    public ResponseEntity<List<FileDTO>> getFavouriteFiles(@PathVariable String username) {
        try {
            List<FileDTO> files = userService.getFavouriteFiles(username);
            return ResponseEntity.ok(files);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }
}