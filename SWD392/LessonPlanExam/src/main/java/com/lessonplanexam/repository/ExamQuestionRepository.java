package com.lessonplanexam.repository;

import com.lessonplanexam.entity.ExamQuestion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ExamQuestionRepository extends JpaRepository<ExamQuestion, Integer> {

    List<ExamQuestion> findByExamIdOrderByOrderIndex(Integer examId);

    Optional<ExamQuestion> findByExamIdAndQuestionId(Integer examId, Integer questionId);

    void deleteByExamIdAndQuestionId(Integer examId, Integer questionId);

    @Query("SELECT MAX(eq.orderIndex) FROM ExamQuestion eq WHERE eq.exam.id = :examId")
    Integer findMaxOrderIndexByExamId(@Param("examId") Integer examId);

    @Query("SELECT COUNT(eq) FROM ExamQuestion eq WHERE eq.exam.id = :examId")
    Integer countByExamId(@Param("examId") Integer examId);
}
