package com.lessonplanexam.entity;

import com.lessonplanexam.enums.EExamStatus;
import com.lessonplanexam.enums.EScoringMethod;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "exams")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Exam {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false)
    private String title;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by_teacher", nullable = false)
    private Teacher createdByTeacher;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "exam_matrix_id")
    private ExamMatrix examMatrix;

    @Column(name = "grade_level")
    private Integer gradeLevel;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "start_time")
    private OffsetDateTime startTime;

    @Column(name = "end_time")
    private OffsetDateTime endTime;

    @Column(name = "duration_minutes", nullable = false)
    private Integer durationMinutes = 60;

    @Column(name = "password_hash")
    private String passwordHash;

    @Column(name = "max_attempts")
    private Integer maxAttempts = 1;

    @Column(name = "scoring_method_enum")
    private Integer scoringMethodEnum = 2;

    @Column(name = "show_results_immediately")
    private Boolean showResultsImmediately = false;

    @Column(name = "show_correct_answers")
    private Boolean showCorrectAnswers = false;

    @Column(name = "randomize_questions")
    private Boolean randomizeQuestions = false;

    @Column(name = "randomize_answers")
    private Boolean randomizeAnswers = false;

    @Column(name = "status_enum")
    private Integer statusEnum = 1;

    @Column(name = "total_questions")
    private Integer totalQuestions = 0;

    @Column(name = "total_points", precision = 5, scale = 2)
    private BigDecimal totalPoints = BigDecimal.ZERO;

    @Column(name = "pass_threshold", precision = 5, scale = 2)
    private BigDecimal passThreshold = BigDecimal.ZERO;

    @Column(name = "created_at")
    private OffsetDateTime createdAt;

    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;

    @Column(name = "deleted_at")
    private OffsetDateTime deletedAt;

    @OneToMany(mappedBy = "exam", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<ExamQuestion> examQuestions = new ArrayList<>();

    @OneToMany(mappedBy = "exam", cascade = CascadeType.ALL)
    @Builder.Default
    private List<ExamAttempt> examAttempts = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        createdAt = OffsetDateTime.now();
        updatedAt = OffsetDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = OffsetDateTime.now();
    }

    @Transient
    public EExamStatus getStatus() {
        return statusEnum != null ? EExamStatus.fromValue(this.statusEnum) : null;
    }

    public void setStatus(EExamStatus status) {
        this.statusEnum = status != null ? status.getValue() : null;
    }

    @Transient
    public EScoringMethod getScoringMethod() {
        return scoringMethodEnum != null ? EScoringMethod.fromValue(this.scoringMethodEnum) : null;
    }

    public void setScoringMethod(EScoringMethod method) {
        this.scoringMethodEnum = method != null ? method.getValue() : null;
    }
}
