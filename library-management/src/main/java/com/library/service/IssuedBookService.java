package com.library.service;

import com.library.dto.IssueBookRequest;
import com.library.entity.Book;
import com.library.entity.IssuedBook;
import com.library.entity.Student;
import com.library.exception.BusinessException;
import com.library.exception.ResourceNotFoundException;
import com.library.repository.BookRepository;
import com.library.repository.IssuedBookRepository;
import com.library.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class IssuedBookService {

    public static final String STATUS_ISSUED = IssuedBook.STATUS_ISSUED;
    public static final String STATUS_RETURNED = IssuedBook.STATUS_RETURNED;

    private final IssuedBookRepository issuedBookRepository;
    private final BookRepository bookRepository;
    private final StudentRepository studentRepository;

    public List<IssuedBook> getAllIssuedBooks() {
        return issuedBookRepository.findAllByOrderByIssueDateDesc();
    }

    public List<IssuedBook> getActiveIssues() {
        return issuedBookRepository.findByStatusOrderByIssueDateDesc(STATUS_ISSUED);
    }

    public List<IssuedBook> getReturnedIssues() {
        return issuedBookRepository.findByStatusOrderByIssueDateDesc(STATUS_RETURNED);
    }

    public IssuedBook getById(Long id) {
        return issuedBookRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("IssuedBook", id));
    }

    @Transactional
    public IssuedBook issueBook(Long bookId, Long studentId) {
        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new ResourceNotFoundException("Book", bookId));
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student", studentId));
        if (book.getAvailableCopies() == null || book.getAvailableCopies() <= 0) {
            throw new BusinessException("No copies available for this book");
        }
        LocalDate today = LocalDate.now();
        LocalDate due = today.plusDays(14);
        IssuedBook issued = IssuedBook.builder()
                .book(book)
                .student(student)
                .issueDate(today)
                .dueDate(due)
                .status(STATUS_ISSUED)
                .build();
        book.setAvailableCopies(book.getAvailableCopies() - 1);
        bookRepository.save(book);
        IssuedBook saved = issuedBookRepository.save(issued);
        return issuedBookRepository.findDetailedById(saved.getId()).orElse(saved);
    }

    @Transactional
    public IssuedBook issueBook(IssueBookRequest request) {
        return issueBook(request.getBookId(), request.getStudentId());
    }

    @Transactional
    public IssuedBook returnBook(Long issuedBookId) {
        IssuedBook issued = issuedBookRepository.findDetailedById(issuedBookId)
                .orElseThrow(() -> new ResourceNotFoundException("IssuedBook", issuedBookId));
        if (STATUS_RETURNED.equals(issued.getStatus())) {
            throw new BusinessException("Book is already returned");
        }
        Book book = issued.getBook();
        issued.setReturnDate(LocalDate.now());
        issued.setStatus(STATUS_RETURNED);
        book.setAvailableCopies(book.getAvailableCopies() + 1);
        bookRepository.save(book);
        IssuedBook saved = issuedBookRepository.save(issued);
        return issuedBookRepository.findDetailedById(saved.getId()).orElse(saved);
    }

    public List<IssuedBook> getIssuedBooksByStudent(Long studentId) {
        if (!studentRepository.existsById(studentId)) {
            throw new ResourceNotFoundException("Student", studentId);
        }
        return issuedBookRepository.findByStudent_IdOrderByIssueDateDesc(studentId);
    }

    public List<IssuedBook> getOverdueBooks() {
        return issuedBookRepository.findByStatusAndDueDateBeforeOrderByDueDateAsc(STATUS_ISSUED, LocalDate.now());
    }
}
