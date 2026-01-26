package com.lessonplanexam.dto.lessonplan;

import lombok.*;

import java.time.OffsetDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LessonPlanDTO {
    private Integer id;
    private String title;
    private Integer createdByTeacherId;
    private String teacherName;
    private String objectives;
    private String description;
    private String imageUrl;
    private Integer gradeLevel;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
    private List<SlotPlanDTO> slotPlans;
    private List<String> fileUrls;
}
