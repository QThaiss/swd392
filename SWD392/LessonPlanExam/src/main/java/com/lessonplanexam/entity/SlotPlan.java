package com.lessonplanexam.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "slot_plans", uniqueConstraints = {
        @UniqueConstraint(columnNames = { "lesson_plan_id", "slot_number" })
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SlotPlan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lesson_plan_id", nullable = false)
    private LessonPlan lessonPlan;

    @Column(name = "slot_number", nullable = false)
    private Integer slotNumber;

    @Column(nullable = false)
    private String title;

    @Column(name = "duration_minutes")
    private Integer durationMinutes = 45;

    @Column(columnDefinition = "TEXT")
    private String objectives;

    @Column(name = "equipment_needed", columnDefinition = "TEXT")
    private String equipmentNeeded;

    @Column(columnDefinition = "TEXT")
    private String preparations;

    @Column(columnDefinition = "TEXT")
    private String activities;

    @Column(name = "revise_questions", columnDefinition = "TEXT")
    private String reviseQuestions;

    @Column(name = "created_at")
    private OffsetDateTime createdAt;

    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;

    @OneToMany(mappedBy = "slotPlan", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<SlotMaterial> slotMaterials = new ArrayList<>();

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
