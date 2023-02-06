package com.group.group.controllers;

import com.group.group.models.Group;
import com.group.group.repositories.GroupRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class GroupController {

    @Autowired
    GroupRepository groupRepository;

    @GetMapping(value = "/groups")
    public ResponseEntity<List<Group>> getAllGroups() {
        return new ResponseEntity<>(groupRepository.findAll(), HttpStatus.OK);
    }

    @GetMapping(value = "/groups/{id}")
    public ResponseEntity getGroup(@PathVariable Long id){
        return new ResponseEntity<>(groupRepository.findById(id), HttpStatus.OK);
    }
}
