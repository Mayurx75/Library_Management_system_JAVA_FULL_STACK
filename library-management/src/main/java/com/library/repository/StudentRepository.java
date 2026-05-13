package com.library.repository;

import com.library.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface StudentRepository extends JpaRepository<Student, Long> {

    Optional<Student> findByEmail(String email);

    List<Student> findByNameContainingIgnoreCase(String name);

    @Query("SELECT s FROM Student s WHERE LOWER(s.name) LIKE LOWER(CONCAT('%', :k, '%')) OR LOWER(s.email) LIKE LOWER(CONCAT('%', :k, '%'))")
    List<Student> searchByNameOrEmail(@Param("k") String keyword);
}
