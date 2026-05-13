package com.library.service;

import com.library.dto.DashboardStatsDto;
import com.library.entity.IssuedBook;
import com.library.repository.BookRepository;
import com.library.repository.IssuedBookRepository;
import com.library.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final BookRepository bookRepository;
    private final StudentRepository studentRepository;
    private final IssuedBookRepository issuedBookRepository;

    @Transactional(readOnly = true)
    public DashboardStatsDto getDashboardStats() {
        long totalBooks = bookRepository.count();
        long totalStudents = studentRepository.count();
        long activeIssues = issuedBookRepository.findByStatusOrderByIssueDateDesc(IssuedBook.STATUS_ISSUED).size();
        long availableBooks = bookRepository.findAll().stream()
                .mapToLong(b -> b.getAvailableCopies() == null ? 0L : b.getAvailableCopies())
                .sum();

        List<DashboardStatsDto.RecentIssueDto> recent = issuedBookRepository.findTop5ByOrderByIssueDateDesc().stream()
                .map(ib -> DashboardStatsDto.RecentIssueDto.builder()
                        .id(ib.getId())
                        .bookTitle(ib.getBook().getTitle())
                        .studentName(ib.getStudent().getName())
                        .issueDate(ib.getIssueDate())
                        .dueDate(ib.getDueDate())
                        .returnDate(ib.getReturnDate())
                        .status(ib.getStatus())
                        .build())
                .collect(Collectors.toList());

        return DashboardStatsDto.builder()
                .totalBooks(totalBooks)
                .totalStudents(totalStudents)
                .activeIssues(activeIssues)
                .availableBooks(availableBooks)
                .recentIssues(recent)
                .build();
    }
}
