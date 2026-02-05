-- Delete existing data to ensure a clean slate
DELETE FROM post_adoption_submission_def;
DELETE FROM post_adoption_checklist_def;
DELETE FROM post_adoption_step_def;

-- Insert new step definitions
INSERT INTO post_adoption_step_def (id, default_order, name, description, days_after_adoption) VALUES
(1, 1, '입양 당일', '입양 당일 유기견의 상태 및 초기 적응 확인', 0),
(2, 2, '3일차', '입양 후 3일차 유기견의 건강 및 행동 변화 확인', 3),
(3, 3, '1주차', '입양 후 1주차 유기견의 적응 상태 및 특이사항 확인', 7),
(4, 4, '2주차', '입양 후 2주차 유기견의 생활 습관 및 가족과의 상호작용 확인', 14),
(5, 5, '1개월차', '입양 후 1개월차 유기견의 전반적인 건강 및 적응 상태 확인', 30),
(6, 6, '2개월차', '입양 후 2개월차 유기견의 성장 및 행동 발달 확인', 60),
(7, 7, '3개월차', '입양 후 3개월차 유기견의 최종 적응 및 건강 상태 확인', 90);

-- Reset sequence for post_adoption_step_def if necessary (for PostgreSQL)
-- SELECT setval('post_adoption_step_def_id_seq', (SELECT MAX(id) FROM post_adoption_step_def));

-- Insert checklist definitions for '입양 당일' (Day 0)
INSERT INTO post_adoption_checklist_def (step_def_id, item_text, required) VALUES
((SELECT id FROM post_adoption_step_def WHERE name = '입양 당일'), '조용한 휴식 공간 마련 (안전 구역 고정)', TRUE),
((SELECT id FROM post_adoption_step_def WHERE name = '입양 당일'), '만지기/사진/손님 최소화', TRUE),
((SELECT id FROM post_adoption_step_def WHERE name = '입양 당일'), '식사 및 배변 시간 간단 기록', TRUE),
((SELECT id FROM post_adoption_step_def WHERE name = '입양 당일'), '산책은 상황 봐서 짧게 (무리 금지)', TRUE),
((SELECT id FROM post_adoption_step_def WHERE name = '입양 당일'), '식사 및 배변 여부 체크', TRUE),
((SELECT id FROM post_adoption_step_def WHERE name = '입양 당일'), '이상 행동 체크', TRUE),
((SELECT id FROM post_adoption_step_def WHERE name = '입양 당일'), '기존 예방접종 내역 확인', TRUE),
((SELECT id FROM post_adoption_step_def WHERE name = '입양 당일'), '중성화 여부 확인', TRUE),
((SELECT id FROM post_adoption_step_def WHERE name = '입양 당일'), '건강기록 인수', TRUE),
((SELECT id FROM post_adoption_step_def WHERE name = '입양 당일'), '접종 스케줄(2주 간격)확인', TRUE);

-- Insert submission definitions for '입양 당일' (Day 0)
INSERT INTO post_adoption_submission_def (step_def_id, submission_name, description, required, type) VALUES
((SELECT id FROM post_adoption_step_def WHERE name = '입양 당일'), '집 도착 사진 업로드', '입양한 유기견이 집에 도착한 후의 사진을 업로드해주세요.', TRUE, 'IMAGE');

-- Placeholder for other steps (can be expanded later)
-- For 3일차
INSERT INTO post_adoption_checklist_def (step_def_id, item_text, required) VALUES
((SELECT id FROM post_adoption_step_def WHERE name = '3일차'), '3일차 건강 상태 확인', TRUE);
INSERT INTO post_adoption_submission_def (step_def_id, submission_name, description, required, type) VALUES
((SELECT id FROM post_adoption_step_def WHERE name = '3일차'), '3일차 보고서 제출', '입양 후 3일차 보고서를 제출해주세요.', FALSE, 'DOCUMENT');

-- For 1주차
INSERT INTO post_adoption_checklist_def (step_def_id, item_text, required) VALUES
((SELECT id FROM post_adoption_step_def WHERE name = '1주차'), '1주차 적응 상태 확인', TRUE);

-- For 2주차
INSERT INTO post_adoption_checklist_def (step_def_id, item_text, required) VALUES
((SELECT id FROM post_adoption_step_def WHERE name = '2주차'), '2주차 행동 변화 확인', TRUE);

-- For 1개월차
INSERT INTO post_adoption_checklist_def (step_def_id, item_text, required) VALUES
((SELECT id FROM post_adoption_step_def WHERE name = '1개월차'), '1개월차 건강 확인', TRUE);
INSERT INTO post_adoption_submission_def (step_def_id, submission_name, description, required, type) VALUES
((SELECT id FROM post_adoption_step_def WHERE name = '1개월차'), '1개월차 보고서 제출', '입양 후 1개월차 보고서를 제출해주세요.', TRUE, 'DOCUMENT');

-- For 2개월차
INSERT INTO post_adoption_checklist_def (step_def_id, item_text, required) VALUES
((SELECT id FROM post_adoption_step_def WHERE name = '2개월차'), '2개월차 성장 확인', TRUE);

-- For 3개월차
INSERT INTO post_adoption_checklist_def (step_def_id, item_text, required) VALUES
((SELECT id FROM post_adoption_step_def WHERE name = '3개월차'), '3개월차 최종 적응 확인', TRUE);
INSERT INTO post_adoption_submission_def (step_def_id, submission_name, description, required, type) VALUES
((SELECT id FROM post_adoption_step_def WHERE name = '3개월차'), '3개월차 최종 보고서 제출', '입양 후 3개월차 최종 보고서를 제출해주세요.', TRUE, 'DOCUMENT');