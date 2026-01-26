package com.lessonplanexam.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "question_difficulties")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuestionDifficulty {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private String domain;

    @Column(name = "difficulty_level", unique = true, nullable = false)
    private Integer difficultyLevel;

    @Column(columnDefinition = "TEXT")
    private String description;
}
