package com.lessonplanexam.repository;

import com.lessonplanexam.entity.ExamMatrix;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ExamMatrixRepository extends JpaRepository<ExamMatrix, Integer> {

    @Query("SELECT em FROM ExamMatrix em WHERE em.teacher.accountId = :teacherId AND em.deletedAt IS NULL")
    List<ExamMatrix> findByTeacherId(@Param("teacherId") Integer teacherId);
}
