package com.library.service;

import com.library.entity.Book;
import com.library.entity.IssuedBook;
import com.library.exception.BusinessException;
import com.library.exception.ResourceNotFoundException;
import com.library.repository.BookRepository;
import com.library.repository.IssuedBookRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BookService {

    private final BookRepository bookRepository;
    private final IssuedBookRepository issuedBookRepository;

    public List<Book> getAllBooks() {
        return bookRepository.findAll();
    }

    public Book getBookById(Long id) {
        return bookRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Book", id));
    }

    @Transactional
    public Book addBook(Book book) {
        validateCopies(book);
        if (book.getAvailableCopies() == null) {
            book.setAvailableCopies(book.getTotalCopies());
        }
        return bookRepository.save(book);
    }

    @Transactional
    public Book updateBook(Long id, Book incoming) {
        Book existing = getBookById(id);
        validateCopies(incoming);
        int borrowed = existing.getTotalCopies() - existing.getAvailableCopies();
        if (incoming.getTotalCopies() < borrowed) {
            throw new BusinessException("totalCopies cannot be less than copies currently issued (" + borrowed + ")");
        }
        existing.setTitle(incoming.getTitle());
        existing.setAuthor(incoming.getAuthor());
        existing.setCategory(incoming.getCategory());
        existing.setIsbn(incoming.getIsbn());
        existing.setTotalCopies(incoming.getTotalCopies());
        int newAvailable = incoming.getTotalCopies() - borrowed;
        existing.setAvailableCopies(newAvailable);
        return bookRepository.save(existing);
    }

    @Transactional
    public void deleteBook(Long id) {
        Book book = getBookById(id);
        boolean hasActive = issuedBookRepository.findByBook(book).stream()
                .anyMatch(ib -> IssuedBook.STATUS_ISSUED.equals(ib.getStatus()));
        if (hasActive) {
            throw new BusinessException("Cannot delete book with active issues");
        }
        bookRepository.delete(book);
    }

    public List<Book> searchBooks(String keyword) {
        if (!StringUtils.hasText(keyword)) {
            return getAllBooks();
        }
        return bookRepository.searchByTitleOrAuthor(keyword.trim());
    }

    public boolean checkAvailability(Long bookId) {
        Book book = getBookById(bookId);
        return book.getAvailableCopies() != null && book.getAvailableCopies() > 0;
    }

    public List<Book> getAvailableBooks() {
        return bookRepository.findByAvailableCopiesGreaterThan(0);
    }

    private void validateCopies(Book book) {
        if (book.getTotalCopies() == null || book.getTotalCopies() < 0) {
            throw new BusinessException("totalCopies must be zero or positive");
        }
        if (book.getAvailableCopies() != null && book.getAvailableCopies() > book.getTotalCopies()) {
            throw new BusinessException("availableCopies cannot exceed totalCopies");
        }
    }
}
