package com.lessonplanexam.dto.lessonplan;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SlotMaterialDTO {
    private Integer id;
    private Integer slotPlanId;
    private String title;
    private String url;
    private String description;
}
