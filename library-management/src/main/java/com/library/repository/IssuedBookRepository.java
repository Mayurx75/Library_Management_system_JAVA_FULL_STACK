package com.library.repository;

import com.library.entity.Book;
import com.library.entity.IssuedBook;
import com.library.entity.Student;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface IssuedBookRepository extends JpaRepository<IssuedBook, Long> {

    @EntityGraph(attributePaths = {"book", "student"})
    List<IssuedBook> findAllByOrderByIssueDateDesc();

    @EntityGraph(attributePaths = {"book", "student"})
    List<IssuedBook> findByStatusOrderByIssueDateDesc(String status);

    List<IssuedBook> findByStatus(String status);

    List<IssuedBook> findByStudent(Student student);

    List<IssuedBook> findByBook(Book book);

    @EntityGraph(attributePaths = {"book", "student"})
    List<IssuedBook> findByStudent_IdOrderByIssueDateDesc(Long studentId);

    @EntityGraph(attributePaths = {"book", "student"})
    List<IssuedBook> findByStatusAndDueDateBeforeOrderByDueDateAsc(String status, LocalDate date);

    @EntityGraph(attributePaths = {"book", "student"})
    List<IssuedBook> findTop5ByOrderByIssueDateDesc();

    @EntityGraph(attributePaths = {"book", "student"})
    @Query("SELECT ib FROM IssuedBook ib WHERE ib.id = :id")
    Optional<IssuedBook> findDetailedById(@Param("id") Long id);
}
