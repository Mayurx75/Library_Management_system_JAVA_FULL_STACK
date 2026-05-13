package com.library.dto;

import lombok.Builder;
import lombok.Value;

import java.time.LocalDate;
import java.util.List;

@Value
@Builder
public class DashboardStatsDto {

    long totalBooks;
    long totalStudents;
    long activeIssues;
    long availableBooks;
    List<RecentIssueDto> recentIssues;

    @Value
    @Builder
    public static class RecentIssueDto {
        Long id;
        String bookTitle;
        String studentName;
        LocalDate issueDate;
        LocalDate dueDate;
        LocalDate returnDate;
        String status;
    }
}
