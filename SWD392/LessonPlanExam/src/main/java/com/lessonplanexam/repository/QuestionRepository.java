package com.lessonplanexam.repository;

import com.lessonplanexam.entity.Question;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuestionRepository extends JpaRepository<Question, Integer> {

        @Query("SELECT q FROM Question q WHERE q.questionBank.id = :bankId AND q.deletedAt IS NULL AND q.isActive = true")
        org.springframework.data.domain.Page<Question> findByQuestionBankId(@Param("bankId") Integer bankId,
                        org.springframework.data.domain.Pageable pageable);

        @Query("SELECT q FROM Question q WHERE q.questionBank.id = :bankId AND q.questionDifficulty.difficultyLevel = :difficultyLevel AND q.deletedAt IS NULL AND q.isActive = true")
        List<Question> findByBankIdAndDifficulty(@Param("bankId") Integer bankId,
                        @Param("difficultyLevel") Integer difficultyLevel);

        @Query(value = "SELECT * FROM questions q " +
                        "JOIN question_difficulties qd ON q.question_difficulty_id = qd.id " +
                        "WHERE q.question_bank_id = :bankId " +
                        "AND qd.difficulty_level = :difficultyLevel " +
                        "AND q.is_active = true " +
                        "AND q.deleted_at IS NULL " +
                        "ORDER BY RANDOM() " +
                        "LIMIT :limit", nativeQuery = true)
        List<Question> findRandomQuestionsByBankAndDifficulty(@Param("bankId") Integer bankId,
                        @Param("difficultyLevel") Integer difficultyLevel,
                        @Param("limit") Integer limit);
}
