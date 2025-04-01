package com.fsd.file.service;

import com.fsd.file.model.Group;
import com.fsd.file.model.Message;
import com.fsd.file.model.FileDTO;
import com.fsd.file.model.FileEntity;
import com.fsd.file.repository.GroupRepository;
import com.fsd.file.repository.MessageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Optional;

@Service
public class GroupServiceImpl implements GroupService {
    @Autowired
    private GroupRepository groupRepository;

    @Autowired
    private MessageRepository messageRepository;

    @Autowired
    private FileService fileService; // Inject FileService to fetch file details

    @Override
    public Group createGroup(String name, String password, String creatorUsername) {
        Group group = new Group();
        group.setName(name);
        group.setPassword(password);
        List<String> usernames = new ArrayList<>();
        usernames.add(creatorUsername);
        group.setUsernames(usernames);
        return groupRepository.save(group);
    }

    @Override
    public Group joinGroup(Long groupId, String password, String username) {
        Optional<Group> groupOpt = groupRepository.findById(groupId);
        if (!groupOpt.isPresent()) {
            throw new RuntimeException("Group not found");
        }
        Group group = groupOpt.get();
        if (!group.getPassword().equals(password)) {
            throw new RuntimeException("Incorrect password");
        }
        List<String> usernames = group.getUsernames();
        if (!usernames.contains(username)) {
            usernames.add(username);
            group.setUsernames(usernames);
            groupRepository.save(group);
        }
        return group;
    }

    @Override
    public String leaveGroup(Long groupId, String username) {
        Optional<Group> groupOpt = groupRepository.findById(groupId);
        if (!groupOpt.isPresent()) {
            throw new RuntimeException("Group not found");
        }
        Group group = groupOpt.get();
        List<String> usernames = group.getUsernames();
        if (!usernames.contains(username)) {
            throw new RuntimeException("User is not a member of this group");
        }
        usernames.remove(username);
        group.setUsernames(usernames);
        if (usernames.isEmpty()) {
            groupRepository.delete(group);
            return "Group deleted as it has no members";
        } else {
            groupRepository.save(group);
            return "Successfully left the group";
        }
    }

    @Override
    public List<Group> getUserGroups(String username) {
        List<Group> groups = groupRepository.findByUsernamesContaining(username);
        return groups != null ? groups : new ArrayList<>();
    }

    @Override
    public Message sendMessage(Long groupId, String senderUsername, String content, String type) {
        if (!groupRepository.existsById(groupId)) {
            throw new RuntimeException("Group not found");
        }
        Message message = new Message();
        message.setGroupId(groupId);
        message.setSenderUsername(senderUsername);
        message.setContent(content);
        message.setType(type);
        message.setTimestamp(new Date());
        return messageRepository.save(message);
    }

    @Override
    public List<Message> getGroupMessages(Long groupId) {
        List<Message> messages = messageRepository.findByGroupId(groupId);
        return messages != null ? messages : new ArrayList<>();
    }

    @Override
    public List<FileDTO> getSharedFiles(String username) {
        // Fetch groups that the user is a member of
        List<Group> userGroups = getUserGroups(username);
        if (userGroups.isEmpty()) {
            return new ArrayList<>(); // User is not in any groups, so no shared files
        }

        // Get the IDs of the groups the user is in
        List<Long> groupIds = userGroups.stream()
                .map(Group::getId)
                .toList();

        // Fetch messages from these groups where the type is 'file'
        List<Message> messages = messageRepository.findAll().stream()
                .filter(message -> groupIds.contains(message.getGroupId()))
                .filter(message -> "file".equals(message.getType()))
                .toList();

        List<FileDTO> sharedFiles = new ArrayList<>();
        for (Message message : messages) {
            try {
                // The message content should be the file ID
                Long fileId = Long.parseLong(message.getContent());
                FileEntity file = fileService.getFile(fileId);
                if (file != null) {
                    FileDTO fileDTO = new FileDTO(file);
                    // Fetch the group name to include in the FileDTO
                    Optional<Group> groupOpt = groupRepository.findById(message.getGroupId());
                    if (groupOpt.isPresent()) {
                        fileDTO.setGroupName(groupOpt.get().getName());
                    } else {
                        fileDTO.setGroupName("Unknown Group");
                    }
                    sharedFiles.add(fileDTO);
                }
            } catch (NumberFormatException e) {
                // Skip messages where content is not a valid file ID
                System.err.println("Invalid file ID in message content: " + message.getContent());
            }
        }
        return sharedFiles;
    }
}