package com.fsd.file.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.fsd.file.model.Group;
import com.fsd.file.model.Message;
import com.fsd.file.model.FileDTO;
import com.fsd.file.service.GroupService;

import java.util.List;

@CrossOrigin("*")
@RestController
@RequestMapping("/api/groups")
public class GroupController {
    @Autowired
    private GroupService groupService;

    @PostMapping("/create")
    public ResponseEntity<?> createGroup(@RequestBody GroupRequest request) {
        try {
            System.out.println("Creating group with name: " + request.getName() + ", creator: " + request.getCreatorUsername());
            Group group = groupService.createGroup(request.getName(), request.getPassword(), request.getCreatorUsername());
            System.out.println("Group created: " + group);
            return ResponseEntity.ok(group);
        } catch (Exception e) {
            System.err.println("Error creating group: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to create group: " + e.getMessage() + " | Cause: " + (e.getCause() != null ? e.getCause().getMessage() : "Unknown"));
        }
    }

    @PostMapping("/join/{groupId}")
    public ResponseEntity<?> joinGroup(@PathVariable Long groupId, @RequestBody JoinGroupRequest request) {
        try {
            System.out.println("User " + request.getUsername() + " joining group ID: " + groupId);
            Group group = groupService.joinGroup(groupId, request.getPassword(), request.getUsername());
            System.out.println("User joined group: " + group);
            return ResponseEntity.ok(group);
        } catch (RuntimeException e) {
            System.err.println("Error joining group: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @PostMapping("/leave/{groupId}")
    public ResponseEntity<?> leaveGroup(@PathVariable Long groupId, @RequestBody UsernameRequest request) {
        try {
            System.out.println("User " + request.getUsername() + " leaving group ID: " + groupId);
            String result = groupService.leaveGroup(groupId, request.getUsername());
            System.out.println("Leave group result: " + result);
            return ResponseEntity.ok(result);
        } catch (RuntimeException e) {
            System.err.println("Error leaving group: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @GetMapping("/user/{username}")
    public ResponseEntity<?> getUserGroups(@PathVariable String username) {
        try {
            System.out.println("Fetching groups for username: " + username);
            List<Group> groups = groupService.getUserGroups(username);
            System.out.println("Groups retrieved: " + groups);
            return ResponseEntity.ok(groups);
        } catch (Exception e) {
            System.err.println("Error fetching groups for username " + username + ": " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error fetching groups: " + e.getMessage());
        }
    }

    @PostMapping("/message/{groupId}")
    public ResponseEntity<?> sendMessage(@PathVariable Long groupId, @RequestBody MessageRequest request) {
        try {
            System.out.println("Sending message to group ID: " + groupId + " by " + request.getSenderUsername());
            Message message = groupService.sendMessage(groupId, request.getSenderUsername(), request.getContent(), request.getType());
            System.out.println("Message sent: " + message);
            return ResponseEntity.ok(message);
        } catch (RuntimeException e) {
            System.err.println("Error sending message: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @GetMapping("/messages/{groupId}")
    public ResponseEntity<?> getGroupMessages(@PathVariable Long groupId) {
        try {
            System.out.println("Fetching messages for groupId: " + groupId);
            List<Message> messages = groupService.getGroupMessages(groupId);
            System.out.println("Messages retrieved: " + messages);
            return ResponseEntity.ok(messages);
        } catch (Exception e) {
            System.err.println("Error fetching messages for groupId " + groupId + ": " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error fetching messages: " + e.getMessage());
        }
    }

    @GetMapping("/shared-files/{username}")
    public ResponseEntity<?> getSharedFiles(@PathVariable String username) {
        try {
            System.out.println("Fetching shared files for username: " + username);
            List<FileDTO> sharedFiles = groupService.getSharedFiles(username);
            System.out.println("Shared files retrieved: " + sharedFiles);
            return ResponseEntity.ok(sharedFiles);
        } catch (Exception e) {
            System.err.println("Error fetching shared files for username " + username + ": " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error fetching shared files: " + e.getMessage());
        }
    }
}

// DTOs for request bodies
class GroupRequest {
    private String name;
    private String password;
    private String creatorUsername;

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public String getCreatorUsername() { return creatorUsername; }
    public void setCreatorUsername(String creatorUsername) { this.creatorUsername = creatorUsername; }
}

class JoinGroupRequest {
    private String password;
    private String username;

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
}

class UsernameRequest {
    private String username;

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
}

class MessageRequest {
    private String senderUsername;
    private String content;
    private String type;

    public String getSenderUsername() { return senderUsername; }
    public void setSenderUsername(String senderUsername) { this.senderUsername = senderUsername; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
}