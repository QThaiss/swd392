package com.lessonplanexam.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Entity
@Table(name = "exam_matrix_items")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExamMatrixItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "exam_matrix_id", nullable = false)
    private ExamMatrix examMatrix;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "question_bank_id", nullable = false)
    private QuestionBank questionBank;

    private String domain;

    @Column(name = "difficulty_level")
    private Integer difficultyLevel;

    @Column(name = "question_count", nullable = false)
    private Integer questionCount = 1;

    @Column(name = "points_per_question", precision = 5, scale = 2)
    private BigDecimal pointsPerQuestion = BigDecimal.ONE;

    @Column(name = "created_at")
    private OffsetDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = OffsetDateTime.now();
    }
}
