package com.lessonplanexam.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "exam_matrices")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExamMatrix {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false)
    private String name;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "teacher_id", nullable = false)
    private Teacher teacher;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "total_questions")
    private Integer totalQuestions = 0;

    @Column(name = "total_points", precision = 5, scale = 2)
    private BigDecimal totalPoints = BigDecimal.ZERO;

    @Column(columnDefinition = "TEXT")
    private String configuration = "{}";

    @Column(name = "created_at")
    private OffsetDateTime createdAt;

    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;

    @Column(name = "deleted_at")
    private OffsetDateTime deletedAt;

    @OneToMany(mappedBy = "examMatrix", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<ExamMatrixItem> matrixItems = new ArrayList<>();

    @OneToMany(mappedBy = "examMatrix", cascade = CascadeType.ALL)
    @Builder.Default
    private List<Exam> exams = new ArrayList<>();

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
