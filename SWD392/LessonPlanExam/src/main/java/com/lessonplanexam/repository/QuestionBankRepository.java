package com.lessonplanexam.repository;

import com.lessonplanexam.entity.QuestionBank;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuestionBankRepository extends JpaRepository<QuestionBank, Integer> {

    @Query("SELECT qb FROM QuestionBank qb WHERE qb.teacher.accountId = :teacherId AND qb.deletedAt IS NULL")
    Page<QuestionBank> findByTeacherId(@Param("teacherId") Integer teacherId, Pageable pageable);

    @Query("SELECT qb FROM QuestionBank qb WHERE qb.deletedAt IS NULL")
    Page<QuestionBank> findAllActive(Pageable pageable);
}
