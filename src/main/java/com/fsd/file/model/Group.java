package com.fsd.file.model;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "groups", schema = "public") // Optionally specify schema; adjust if needed
public class Group {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    private String password;

    @ElementCollection
    @CollectionTable(name = "group_usernames", joinColumns = @JoinColumn(name = "group_id"))
    @Column(name = "username")
    private List<String> usernames;

    // Constructors
    public Group() {
        this.usernames = new ArrayList<>();
    }

    public Group(String name, String password, List<String> usernames) {
        this.name = name;
        this.password = password;
        this.usernames = (usernames != null) ? usernames : new ArrayList<>();
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public List<String> getUsernames() {
        return usernames;
    }

    public void setUsernames(List<String> usernames) {
        this.usernames = (usernames != null) ? usernames : new ArrayList<>();
    }

    @Override
    public String toString() {
        return "Group{id=" + id + ", name='" + name + "', usernames=" + usernames + "}";
    }
}