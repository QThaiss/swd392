package com.lessonplanexam.repository;

import com.lessonplanexam.entity.QuestionDifficulty;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface QuestionDifficultyRepository extends JpaRepository<QuestionDifficulty, Integer> {

    Optional<QuestionDifficulty> findByDifficultyLevel(Integer difficultyLevel);
}
