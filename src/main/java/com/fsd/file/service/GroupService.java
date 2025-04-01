package com.fsd.file.service;

import com.fsd.file.model.Group;
import com.fsd.file.model.Message;
import com.fsd.file.model.FileDTO;

import java.util.List;

public interface GroupService {
    Group createGroup(String name, String password, String creatorUsername);
    Group joinGroup(Long groupId, String password, String username);
    String leaveGroup(Long groupId, String username);
    List<Group> getUserGroups(String username);
    Message sendMessage(Long groupId, String senderUsername, String content, String type);
    List<Message> getGroupMessages(Long groupId);
    List<FileDTO> getSharedFiles(String username);
}