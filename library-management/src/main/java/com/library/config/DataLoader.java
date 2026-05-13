package com.library.config;

import com.library.entity.Book;
import com.library.entity.IssuedBook;
import com.library.entity.Student;
import com.library.repository.BookRepository;
import com.library.repository.IssuedBookRepository;
import com.library.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

/**
 * Seeds the database with sample books, students, and issued-book records when empty.
 */
@Component
@RequiredArgsConstructor
public class DataLoader implements CommandLineRunner {

    private final BookRepository bookRepository;
    private final StudentRepository studentRepository;
    private final IssuedBookRepository issuedBookRepository;

    @Override
    public void run(String... args) {
        if (bookRepository.count() > 0) {
            return;
        }

        List<Book> books = new ArrayList<>();
        books.add(book("The Great Gatsby", "F. Scott Fitzgerald", "Fiction", "978-0743273565", 4));
        books.add(book("1984", "George Orwell", "Fiction", "978-0451524935", 5));
        books.add(book("Sapiens", "Yuval Noah Harari", "History", "978-0062316097", 3));
        books.add(book("A Brief History of Time", "Stephen Hawking", "Science", "978-0553380163", 6));
        books.add(book("Clean Code", "Robert C. Martin", "Technology", "978-0132350884", 4));
        books.add(book("The Pragmatic Programmer", "David Thomas", "Technology", "978-0134757599", 3));
        books.add(book("Becoming", "Michelle Obama", "Biography", "978-1524763138", 5));
        books.add(book("Steve Jobs", "Walter Isaacson", "Biography", "978-1451648539", 2));
        books.add(book("The Selfish Gene", "Richard Dawkins", "Science", "978-0192860927", 4));
        books.add(book("Guns, Germs, and Steel", "Jared Diamond", "History", "978-0393354324", 3));
        books.add(book("Dune", "Frank Herbert", "Fiction", "978-0441172719", 7));
        books.add(book("The Code Breaker", "Walter Isaacson", "Biography", "978-1982115852", 2));
        books.add(book("Introduction to Algorithms", "Cormen et al.", "Technology", "978-0262046305", 5));
        books.add(book("The Immortal Life of Henrietta Lacks", "Rebecca Skloot", "Science", "978-1400052189", 3));
        books.add(book("The Wright Brothers", "David McCullough", "History", "978-1476728755", 4));
        bookRepository.saveAll(books);

        List<Student> students = new ArrayList<>();
        students.add(student("Ava Thompson", "ava.thompson@university.edu", "+1-555-0101", LocalDate.of(2023, 8, 21)));
        students.add(student("Liam Chen", "liam.chen@university.edu", "+1-555-0102", LocalDate.of(2023, 8, 22)));
        students.add(student("Sophia Martinez", "sophia.martinez@university.edu", "+1-555-0103", LocalDate.of(2022, 8, 15)));
        students.add(student("Noah Patel", "noah.patel@university.edu", "+1-555-0104", LocalDate.of(2024, 1, 10)));
        students.add(student("Mia Johnson", "mia.johnson@university.edu", "+1-555-0105", LocalDate.of(2023, 8, 21)));
        students.add(student("Ethan Brooks", "ethan.brooks@university.edu", "+1-555-0106", LocalDate.of(2021, 8, 18)));
        students.add(student("Isabella Rossi", "isabella.rossi@university.edu", "+1-555-0107", LocalDate.of(2023, 8, 23)));
        students.add(student("Lucas Kim", "lucas.kim@university.edu", "+1-555-0108", LocalDate.of(2022, 8, 16)));
        studentRepository.saveAll(students);

        Book gatsby = bookRepository.findByIsbn("978-0743273565").orElseThrow();
        Book cleanCode = bookRepository.findByIsbn("978-0132350884").orElseThrow();
        Book sapiens = bookRepository.findByIsbn("978-0062316097").orElseThrow();
        Book dune = bookRepository.findByIsbn("978-0441172719").orElseThrow();
        Book algorithms = bookRepository.findByIsbn("978-0262046305").orElseThrow();

        Student ava = studentRepository.findByEmail("ava.thompson@university.edu").orElseThrow();
        Student liam = studentRepository.findByEmail("liam.chen@university.edu").orElseThrow();
        Student sophia = studentRepository.findByEmail("sophia.martinez@university.edu").orElseThrow();
        Student noah = studentRepository.findByEmail("noah.patel@university.edu").orElseThrow();
        Student mia = studentRepository.findByEmail("mia.johnson@university.edu").orElseThrow();

        // Active issue 1 (overdue)
        issueActive(gatsby, ava, LocalDate.now().minusDays(20), LocalDate.now().minusDays(6));

        // Active issue 2
        issueActive(cleanCode, liam, LocalDate.now().minusDays(5), LocalDate.now().plusDays(9));

        // Active issue 3
        issueActive(sapiens, sophia, LocalDate.now().minusDays(2), LocalDate.now().plusDays(12));

        // Returned 1
        issueReturned(dune, noah, LocalDate.now().minusDays(30), LocalDate.now().minusDays(16), LocalDate.now().minusDays(14));

        // Returned 2
        issueReturned(algorithms, mia, LocalDate.now().minusDays(45), LocalDate.now().minusDays(31), LocalDate.now().minusDays(28));
    }

    private void issueActive(Book book, Student student, LocalDate issueDate, LocalDate dueDate) {
        if (book.getAvailableCopies() <= 0) {
            return;
        }
        book.setAvailableCopies(book.getAvailableCopies() - 1);
        bookRepository.save(book);
        issuedBookRepository.save(IssuedBook.builder()
                .book(book)
                .student(student)
                .issueDate(issueDate)
                .dueDate(dueDate)
                .status(IssuedBook.STATUS_ISSUED)
                .build());
    }

    private void issueReturned(Book book, Student student, LocalDate issueDate, LocalDate dueDate, LocalDate returnDate) {
        issuedBookRepository.save(IssuedBook.builder()
                .book(book)
                .student(student)
                .issueDate(issueDate)
                .dueDate(dueDate)
                .returnDate(returnDate)
                .status(IssuedBook.STATUS_RETURNED)
                .build());
    }

    private Book book(String title, String author, String category, String isbn, int copies) {
        return Book.builder()
                .title(title)
                .author(author)
                .category(category)
                .isbn(isbn)
                .totalCopies(copies)
                .availableCopies(copies)
                .build();
    }

    private Student student(String name, String email, String phone, LocalDate enrollment) {
        return Student.builder()
                .name(name)
                .email(email)
                .phone(phone)
                .enrollmentDate(enrollment)
                .build();
    }
}
