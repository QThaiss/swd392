-- Script để kiểm tra và fix exam_attempts data

-- 1. Xem tất cả attempts của exam 12
SELECT id, exam_id, student_id, attempt_number, status_enum, started_at, submitted_at, score_percentage 
FROM exam_attempts 
WHERE exam_id = 12 
ORDER BY student_id, attempt_number;

-- 2. Xóa tất cả attempts của student 5 trong exam 12 (optional - chạy nếu cần reset)
-- DELETE FROM exam_attempts WHERE exam_id = 12 AND student_id = 5;

-- 3. Xóa chỉ các IN_PROGRESS attempts (giữ lại completed attempts)
-- DELETE FROM exam_attempts WHERE exam_id = 12 AND student_id = 5 AND status_enum = 1;

-- 4. Xem tất cả attempts IN_PROGRESS 
SELECT id, exam_id, student_id, attempt_number, status_enum
FROM exam_attempts 
WHERE status_enum = 1;

-- 5. Fix: Đặt lại attempt_number cho các attempts bị trùng
-- Nếu có nhiều attempts với cùng attempt_number, có thể update lại:
-- UPDATE exam_attempts SET attempt_number = <new_number> WHERE id = <attempt_id>;
