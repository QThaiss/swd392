package com.lessonplanexam.repository;

import com.lessonplanexam.entity.LessonPlan;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LessonPlanRepository extends JpaRepository<LessonPlan, Integer> {

    @Query("SELECT lp FROM LessonPlan lp WHERE lp.createdByTeacher.accountId = :teacherId AND lp.deletedAt IS NULL")
    Page<LessonPlan> findByTeacherId(@Param("teacherId") Integer teacherId, Pageable pageable);

    @Query("SELECT lp FROM LessonPlan lp WHERE lp.deletedAt IS NULL")
    Page<LessonPlan> findAllActive(Pageable pageable);

    @Query("SELECT lp FROM LessonPlan lp WHERE lp.gradeLevel = :gradeLevel AND lp.deletedAt IS NULL")
    Page<LessonPlan> findByGradeLevel(@Param("gradeLevel") Integer gradeLevel, Pageable pageable);

    @Query("SELECT COUNT(lp) FROM LessonPlan lp WHERE lp.createdByTeacher.accountId = :teacherId AND lp.deletedAt IS NULL")
    long countByTeacherId(@Param("teacherId") Integer teacherId);
}
