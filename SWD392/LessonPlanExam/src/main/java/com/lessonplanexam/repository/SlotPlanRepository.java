package com.lessonplanexam.repository;

import com.lessonplanexam.entity.SlotPlan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SlotPlanRepository extends JpaRepository<SlotPlan, Integer> {

    List<SlotPlan> findByLessonPlanIdOrderBySlotNumber(Integer lessonPlanId);
}
