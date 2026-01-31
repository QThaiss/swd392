package com.lessonplanexam.repository;

import com.lessonplanexam.entity.Exam;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ExamRepository extends JpaRepository<Exam, Integer> {

    @Query("SELECT e FROM Exam e WHERE e.createdByTeacher.accountId = :teacherId AND e.deletedAt IS NULL")
    Page<Exam> findByTeacherId(@Param("teacherId") Integer teacherId, Pageable pageable);

    @Query("SELECT e FROM Exam e WHERE e.deletedAt IS NULL")
    Page<Exam> findAllActive(Pageable pageable);

    @Query("SELECT e FROM Exam e WHERE e.statusEnum = :status AND e.deletedAt IS NULL")
    Page<Exam> findByStatus(@Param("status") Integer status, Pageable pageable);

    @Query("SELECT COUNT(e) FROM Exam e WHERE e.createdByTeacher.accountId = :teacherId AND e.deletedAt IS NULL")
    long countByTeacherId(@Param("teacherId") Integer teacherId);

    @Query("SELECT COUNT(e) FROM Exam e WHERE e.statusEnum = :status AND e.deletedAt IS NULL")
    long countByStatus(@Param("status") Integer status);
}
