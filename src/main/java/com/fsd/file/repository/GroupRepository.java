package com.fsd.file.repository;

import com.fsd.file.model.Group;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GroupRepository extends JpaRepository<Group, Long> {
    @Query("SELECT g FROM Group g JOIN g.usernames u WHERE u = :username")
    List<Group> findByUsernamesContaining(String username);
}