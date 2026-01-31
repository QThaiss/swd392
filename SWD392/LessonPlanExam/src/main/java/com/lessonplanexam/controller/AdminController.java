package com.lessonplanexam.controller;

import com.lessonplanexam.dto.account.AccountDTO;
import com.lessonplanexam.dto.common.BaseResponse;
import com.lessonplanexam.dto.common.PageResponse;
import com.lessonplanexam.service.AccountService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AccountService accountService;

    @GetMapping("/accounts")
    public ResponseEntity<BaseResponse<PageResponse<AccountDTO>>> getAllAccounts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        return ResponseEntity.ok(accountService.getAllAccounts(pageable));
    }

    @PostMapping("/accounts/{id}/toggle-status")
    public ResponseEntity<BaseResponse<AccountDTO>> toggleAccountStatus(@PathVariable Integer id) {
        return ResponseEntity.ok(accountService.toggleAccountStatus(id));
    }

    @PostMapping("/accounts/teacher")
    public ResponseEntity<BaseResponse<AccountDTO>> createTeacher(
            @RequestBody com.lessonplanexam.dto.account.RegisterRequest request) {
        return ResponseEntity.ok(accountService.createTeacherByAdmin(request));
    }
}
