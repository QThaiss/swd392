package com.lessonplanexam.service.impl;

import com.lessonplanexam.dto.common.BaseResponse;
import com.lessonplanexam.dto.lessonplan.*;
import com.lessonplanexam.entity.*;
import com.lessonplanexam.exception.ForbiddenException;
import com.lessonplanexam.exception.NotFoundException;
import com.lessonplanexam.repository.*;
import com.lessonplanexam.service.AccountService;
import com.lessonplanexam.service.LessonPlanService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class LessonPlanServiceImpl implements LessonPlanService {

        private final LessonPlanRepository lessonPlanRepository;
        private final TeacherRepository teacherRepository;
        private final AccountService accountService;
        private final com.lessonplanexam.repository.AccountRepository accountRepository;

        @Override
        @Transactional
        public BaseResponse<LessonPlanDTO> create(CreateLessonPlanRequest request) {
                Integer teacherId = accountService.getCurrentUserId();

                Teacher teacher = teacherRepository.findById(teacherId).orElse(null);

                if (teacher == null) {
                        if (accountService.isCurrentUserAdmin()) {
                                com.lessonplanexam.entity.Account account = accountRepository.findById(teacherId)
                                                .orElseThrow(() -> new NotFoundException("Account not found"));
                                teacher = Teacher.builder()
                                                .account(account)
                                                .schoolName("System Admin School")
                                                .isActive(true)
                                                .build();
                                teacher = teacherRepository.save(teacher);
                        } else {
                                throw new ForbiddenException("Only teachers can create lesson plans");
                        }
                }

                LessonPlan lessonPlan = LessonPlan.builder()
                                .title(request.getTitle())
                                .createdByTeacher(teacher)
                                .objectives(request.getObjectives())
                                .description(request.getDescription())
                                .imageUrl(request.getImageUrl())
                                .gradeLevel(request.getGradeLevel())
                                .build();

                lessonPlan = lessonPlanRepository.save(lessonPlan);

                return BaseResponse.created(mapToDTO(lessonPlan));
        }

        @Override
        public BaseResponse<LessonPlanDTO> getById(Integer id) {
                LessonPlan lessonPlan = lessonPlanRepository.findById(id)
                                .orElseThrow(() -> new NotFoundException("Lesson plan not found"));

                if (lessonPlan.getDeletedAt() != null) {
                        throw new NotFoundException("Lesson plan not found");
                }

                return BaseResponse.success(mapToDTO(lessonPlan));
        }

        @Override
        public BaseResponse<com.lessonplanexam.dto.common.PageResponse<LessonPlanDTO>> getAll(
                        org.springframework.data.domain.Pageable pageable) {
                org.springframework.data.domain.Page<LessonPlan> page = lessonPlanRepository.findAllActive(pageable);
                org.springframework.data.domain.Page<LessonPlanDTO> dtoPage = page.map(this::mapToDTO);
                return BaseResponse.success(com.lessonplanexam.dto.common.PageResponse.from(dtoPage));
        }

        @Override
        public BaseResponse<com.lessonplanexam.dto.common.PageResponse<LessonPlanDTO>> getByTeacher(
                        org.springframework.data.domain.Pageable pageable) {
                Integer teacherId = accountService.getCurrentUserId();
                org.springframework.data.domain.Page<LessonPlan> page = lessonPlanRepository.findByTeacherId(teacherId,
                                pageable);
                org.springframework.data.domain.Page<LessonPlanDTO> dtoPage = page.map(this::mapToDTO);
                return BaseResponse.success(com.lessonplanexam.dto.common.PageResponse.from(dtoPage));
        }

        @Override
        @Transactional
        public BaseResponse<LessonPlanDTO> update(Integer id, CreateLessonPlanRequest request) {
                Integer teacherId = accountService.getCurrentUserId();
                boolean isAdmin = accountService.isCurrentUserAdmin();

                LessonPlan lessonPlan = lessonPlanRepository.findById(id)
                                .orElseThrow(() -> new NotFoundException("Lesson plan not found"));

                if (!isAdmin && !lessonPlan.getCreatedByTeacher().getAccountId().equals(teacherId)) {
                        throw new ForbiddenException("You can only update your own lesson plans");
                }

                lessonPlan.setTitle(request.getTitle());
                lessonPlan.setObjectives(request.getObjectives());
                lessonPlan.setDescription(request.getDescription());
                lessonPlan.setImageUrl(request.getImageUrl());
                lessonPlan.setGradeLevel(request.getGradeLevel());

                lessonPlan = lessonPlanRepository.save(lessonPlan);

                return BaseResponse.success("Lesson plan updated", mapToDTO(lessonPlan));
        }

        @Override
        @Transactional
        public BaseResponse<?> delete(Integer id) {
                Integer teacherId = accountService.getCurrentUserId();
                boolean isAdmin = accountService.isCurrentUserAdmin();

                LessonPlan lessonPlan = lessonPlanRepository.findById(id)
                                .orElseThrow(() -> new NotFoundException("Lesson plan not found"));

                if (!isAdmin && !lessonPlan.getCreatedByTeacher().getAccountId().equals(teacherId)) {
                        throw new ForbiddenException("You can only delete your own lesson plans");
                }

                lessonPlan.setDeletedAt(OffsetDateTime.now());
                lessonPlanRepository.save(lessonPlan);

                return BaseResponse.success("Lesson plan deleted", null);
        }

        private LessonPlanDTO mapToDTO(LessonPlan lessonPlan) {
                return LessonPlanDTO.builder()
                                .id(lessonPlan.getId())
                                .title(lessonPlan.getTitle())
                                .createdByTeacherId(lessonPlan.getCreatedByTeacher().getAccountId())
                                .teacherName(lessonPlan.getCreatedByTeacher().getAccount() != null
                                                ? lessonPlan.getCreatedByTeacher().getAccount().getFullName()
                                                : null)
                                .objectives(lessonPlan.getObjectives())
                                .description(lessonPlan.getDescription())
                                .imageUrl(lessonPlan.getImageUrl())
                                .gradeLevel(lessonPlan.getGradeLevel())
                                .createdAt(lessonPlan.getCreatedAt())
                                .updatedAt(lessonPlan.getUpdatedAt())
                                .slotPlans(lessonPlan.getSlotPlans() != null
                                                ? lessonPlan.getSlotPlans().stream().map(this::mapSlotPlanToDTO)
                                                                .toList()
                                                : null)
                                .fileUrls(lessonPlan.getLessonPlanFiles() != null
                                                ? lessonPlan.getLessonPlanFiles().stream()
                                                                .map(LessonPlanFile::getFileUrl).toList()
                                                : null)
                                .build();
        }

        private SlotPlanDTO mapSlotPlanToDTO(SlotPlan slotPlan) {
                return SlotPlanDTO.builder()
                                .id(slotPlan.getId())
                                .lessonPlanId(slotPlan.getLessonPlan().getId())
                                .slotNumber(slotPlan.getSlotNumber())
                                .title(slotPlan.getTitle())
                                .durationMinutes(slotPlan.getDurationMinutes())
                                .objectives(slotPlan.getObjectives())
                                .equipmentNeeded(slotPlan.getEquipmentNeeded())
                                .preparations(slotPlan.getPreparations())
                                .activities(slotPlan.getActivities())
                                .reviseQuestions(slotPlan.getReviseQuestions())
                                .materials(slotPlan.getSlotMaterials() != null
                                                ? slotPlan.getSlotMaterials().stream().map(this::mapMaterialToDTO)
                                                                .toList()
                                                : null)
                                .build();
        }

        private SlotMaterialDTO mapMaterialToDTO(SlotMaterial material) {
                return SlotMaterialDTO.builder()
                                .id(material.getId())
                                .slotPlanId(material.getSlotPlan().getId())
                                .title(material.getTitle())
                                .url(material.getUrl())
                                .description(material.getDescription())
                                .build();
        }
}
