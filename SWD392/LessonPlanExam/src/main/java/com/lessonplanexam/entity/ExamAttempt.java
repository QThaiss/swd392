package com.lessonplanexam.entity;

import com.lessonplanexam.enums.EAttemptStatus;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "exam_attempts", uniqueConstraints = {
        @UniqueConstraint(columnNames = { "exam_id", "student_id", "attempt_number" })
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExamAttempt {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "exam_id", nullable = false)
    private Exam exam;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @Column(name = "attempt_number", nullable = false)
    private Integer attemptNumber = 1;

    @Column(name = "started_at")
    private OffsetDateTime startedAt;

    @Column(name = "submitted_at")
    private OffsetDateTime submittedAt;

    @Column(name = "time_spent_seconds")
    private Integer timeSpentSeconds = 0;

    @Column(name = "total_score", precision = 5, scale = 2)
    private BigDecimal totalScore = BigDecimal.ZERO;

    @Column(name = "max_score", precision = 5, scale = 2)
    private BigDecimal maxScore = BigDecimal.ZERO;

    @Column(name = "score_percentage", precision = 5, scale = 2)
    private BigDecimal scorePercentage = BigDecimal.ZERO;

    @Column(name = "correct_count")
    private Integer correctCount = 0;

    @Column(name = "total_questions")
    private Integer totalQuestions = 0;

    @Column(name = "status_enum")
    private Integer statusEnum = 1;

    @Column(name = "auto_graded_at")
    private OffsetDateTime autoGradedAt;

    @Column(name = "manual_graded_at")
    private OffsetDateTime manualGradedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "graded_by")
    private Teacher gradedBy;

    @Column(columnDefinition = "TEXT")
    private String feedback;

    @Column(name = "created_at")
    private OffsetDateTime createdAt;

    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;

    @OneToMany(mappedBy = "examAttempt", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<ExamAttemptAnswer> attemptAnswers = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        createdAt = OffsetDateTime.now();
        updatedAt = OffsetDateTime.now();
        startedAt = OffsetDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = OffsetDateTime.now();
    }

    @Transient
    public EAttemptStatus getStatus() {
        return statusEnum != null ? EAttemptStatus.fromValue(this.statusEnum) : null;
    }

    public void setStatus(EAttemptStatus status) {
        this.statusEnum = status != null ? status.getValue() : null;
    }
}
