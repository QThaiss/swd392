package com.lessonplanexam.dto.lessonplan;

import lombok.*;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SlotPlanDTO {
    private Integer id;
    private Integer lessonPlanId;
    private Integer slotNumber;
    private String title;
    private Integer durationMinutes;
    private String objectives;
    private String equipmentNeeded;
    private String preparations;
    private String activities;
    private String reviseQuestions;
    private List<SlotMaterialDTO> materials;
}
