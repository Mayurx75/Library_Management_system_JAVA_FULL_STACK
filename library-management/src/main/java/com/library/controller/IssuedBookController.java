package com.library.controller;

import com.library.dto.IssueBookRequest;
import com.library.entity.IssuedBook;
import com.library.service.IssuedBookService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/issued-books")
@RequiredArgsConstructor
public class IssuedBookController {

    private final IssuedBookService issuedBookService;

    @GetMapping
    public List<IssuedBook> getAll() {
        return issuedBookService.getAllIssuedBooks();
    }

    @GetMapping("/active")
    public List<IssuedBook> getActive() {
        return issuedBookService.getActiveIssues();
    }

    @GetMapping("/returned")
    public List<IssuedBook> getReturned() {
        return issuedBookService.getReturnedIssues();
    }

    @PostMapping("/issue")
    public ResponseEntity<IssuedBook> issue(@Valid @RequestBody IssueBookRequest request) {
        IssuedBook saved = issuedBookService.issueBook(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/return/{id}")
    public IssuedBook returnBook(@PathVariable Long id) {
        return issuedBookService.returnBook(id);
    }

    @GetMapping("/student/{studentId}")
    public List<IssuedBook> byStudent(@PathVariable Long studentId) {
        return issuedBookService.getIssuedBooksByStudent(studentId);
    }

    @GetMapping("/overdue")
    public List<IssuedBook> overdue() {
        return issuedBookService.getOverdueBooks();
    }
}
