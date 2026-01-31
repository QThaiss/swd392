package com.lessonplanexam.repository;

import com.lessonplanexam.entity.ExamAttempt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ExamAttemptRepository extends JpaRepository<ExamAttempt, Integer> {

    List<ExamAttempt> findByExamId(Integer examId);

    List<ExamAttempt> findByStudentAccountId(Integer studentId);

    @Query("SELECT ea FROM ExamAttempt ea WHERE ea.exam.id = :examId AND ea.student.accountId = :studentId ORDER BY ea.attemptNumber DESC")
    List<ExamAttempt> findByExamIdAndStudentId(@Param("examId") Integer examId, @Param("studentId") Integer studentId);

    @Query("SELECT COUNT(ea) FROM ExamAttempt ea WHERE ea.exam.id = :examId AND ea.student.accountId = :studentId")
    long countByExamIdAndStudentId(@Param("examId") Integer examId, @Param("studentId") Integer studentId);

    @Query("SELECT ea FROM ExamAttempt ea WHERE ea.exam.id = :examId AND ea.student.accountId = :studentId AND ea.statusEnum = :statusEnum")
    Optional<ExamAttempt> findByExamIdAndStudentIdAndStatusEnum(@Param("examId") Integer examId,
            @Param("studentId") Integer studentId, @Param("statusEnum") Integer statusEnum);

    @Query("SELECT AVG(ea.scorePercentage) FROM ExamAttempt ea WHERE ea.student.accountId = :studentId")
    Double findAverageScoreByStudentId(@Param("studentId") Integer studentId);

    @Query("SELECT AVG(ea.scorePercentage) FROM ExamAttempt ea WHERE ea.exam.createdByTeacher.accountId = :teacherId")
    Double findAverageScoreByTeacherId(@Param("teacherId") Integer teacherId);

    @Query("SELECT COUNT(ea) FROM ExamAttempt ea WHERE ea.student.accountId = :studentId AND ea.statusEnum = 1")
    long countCompletedByStudentId(@Param("studentId") Integer studentId); // Assuming 1 is COMPLETED status
}
