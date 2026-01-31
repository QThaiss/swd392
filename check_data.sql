-- 1. Tìm các câu hỏi trắc nghiệm KHÔNG CÓ đáp án đúng (Nguyên nhân gây lỗi chấm điểm 0%)
SELECT q.id, q.title, q.content, qb.name as bank_name
FROM questions q
JOIN question_banks qb ON q.question_bank_id = qb.id
WHERE q.question_type_enum = 1 -- Multiple Choice
AND q.deleted_at IS NULL
AND q.id NOT IN (
    SELECT DISTINCT question_id 
    FROM question_multiple_choice_answers 
    WHERE is_correct = true
);

-- 2. Xem chi tiết đáp án của một câu hỏi (Ví dụ câu hỏi ID = 7 trong ảnh của bạn)
-- Thay số 7 bằng ID câu hỏi bạn muốn kiểm tra
SELECT id, question_id, answer_text, is_correct 
FROM question_multiple_choice_answers 
WHERE question_id = 7;

-- 3. (Nguy hiểm) Set tạm đáp án đầu tiên là đúng cho các câu hỏi bị lỗi để test
-- UPDATE question_multiple_choice_answers 
-- SET is_correct = true 
-- WHERE id IN (
--     SELECT MIN(a.id) 
--     FROM question_multiple_choice_answers a
--     JOIN questions q ON a.question_id = q.id
--     WHERE q.question_type_enum = 1
--     GROUP BY a.question_id
--     HAVING COUNT(CASE WHEN a.is_correct = true THEN 1 END) = 0
-- );
