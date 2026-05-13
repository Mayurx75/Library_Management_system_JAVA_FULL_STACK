package com.library.service;

import com.library.entity.Student;
import com.library.exception.BusinessException;
import com.library.exception.ResourceNotFoundException;
import com.library.repository.IssuedBookRepository;
import com.library.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;

@Service
@RequiredArgsConstructor
public class StudentService {

    private final StudentRepository studentRepository;
    private final IssuedBookRepository issuedBookRepository;

    public List<Student> getAllStudents() {
        return studentRepository.findAll();
    }

    public Student getStudentById(Long id) {
        return studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student", id));
    }

    @Transactional
    public Student addStudent(Student student) {
        studentRepository.findByEmail(student.getEmail()).ifPresent(s -> {
            throw new BusinessException("Email already registered");
        });
        return studentRepository.save(student);
    }

    @Transactional
    public Student updateStudent(Long id, Student incoming) {
        Student existing = getStudentById(id);
        if (!existing.getEmail().equalsIgnoreCase(incoming.getEmail())) {
            studentRepository.findByEmail(incoming.getEmail()).ifPresent(s -> {
                throw new BusinessException("Email already registered");
            });
        }
        existing.setName(incoming.getName());
        existing.setEmail(incoming.getEmail());
        existing.setPhone(incoming.getPhone());
        existing.setEnrollmentDate(incoming.getEnrollmentDate());
        return studentRepository.save(existing);
    }

    @Transactional
    public void deleteStudent(Long id) {
        Student student = getStudentById(id);
        boolean hasActive = issuedBookRepository.findByStudent(student).stream()
                .anyMatch(ib -> com.library.entity.IssuedBook.STATUS_ISSUED.equals(ib.getStatus()));
        if (hasActive) {
            throw new BusinessException("Cannot delete student with active book issues");
        }
        studentRepository.delete(student);
    }

    public List<Student> searchStudents(String keyword) {
        if (!StringUtils.hasText(keyword)) {
            return getAllStudents();
        }
        return studentRepository.searchByNameOrEmail(keyword.trim());
    }
}
