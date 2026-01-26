package com.lessonplanexam.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Entity
@Table(name = "exam_attempt_answers", uniqueConstraints = {
        @UniqueConstraint(columnNames = { "exam_attempt_id", "question_id" })
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExamAttemptAnswer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "exam_attempt_id", nullable = false)
    private ExamAttempt examAttempt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "question_id", nullable = false)
    private Question question;

    // For multiple choice (stored as comma-separated IDs or JSON)
    @Column(name = "selected_answer_ids", columnDefinition = "INTEGER[]")
    private Integer[] selectedAnswerIds;

    @Column(name = "text_answer", columnDefinition = "TEXT")
    private String textAnswer;

    @Column(name = "answer_data", columnDefinition = "TEXT")
    private String answerData = "{}";

    @Column(name = "points_earned", precision = 5, scale = 2)
    private BigDecimal pointsEarned = BigDecimal.ZERO;

    @Column(name = "points_possible", precision = 5, scale = 2)
    private BigDecimal pointsPossible = BigDecimal.ZERO;

    @Column(name = "is_correct")
    private Boolean isCorrect;

    @Column(name = "created_at")
    private OffsetDateTime createdAt;

    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = OffsetDateTime.now();
        updatedAt = OffsetDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = OffsetDateTime.now();
    }
}
