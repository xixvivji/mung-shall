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

-- For 3일차
INSERT INTO post_adoption_checklist_def (step_def_id, item_text, required) VALUES
((SELECT id FROM post_adoption_step_def WHERE name = '3일차'), '휴식 공간 유지 (환경 크게 바꾸지 않기)', TRUE),
((SELECT id FROM post_adoption_step_def WHERE name = '3일차'), '식사 및 배변 기록 계속하기', TRUE),
((SELECT id FROM post_adoption_step_def WHERE name = '3일차'), '산책은 짧게 스트레스 신호 보이면 중단', TRUE),
((SELECT id FROM post_adoption_step_def WHERE name = '3일차'), '배변 실수 줄어드는지 확인', TRUE),
((SELECT id FROM post_adoption_step_def WHERE name = '3일차'), '구토 설사 무기력 여부 관찰', TRUE),
((SELECT id FROM post_adoption_step_def WHERE name = '3일차'), '컨디션 변화 여부 관찰 (식욕, 활동량)', TRUE);
INSERT INTO post_adoption_submission_def (step_def_id, submission_name, description, required, type) VALUES
((SELECT id FROM post_adoption_step_def WHERE name = '3일차'), '배변 사진', '입양 후 3일차 배변 사진을 업로드해주세요.', TRUE, 'IMAGE');

-- For 1주차
INSERT INTO post_adoption_checklist_def (step_def_id, item_text, required) VALUES
((SELECT id FROM post_adoption_step_def WHERE name = '1주차'), '집 루틴 만들기 (ex. 식사-휴식-짧은 산책)', TRUE),
((SELECT id FROM post_adoption_step_def WHERE name = '1주차'), '하네스 적응', TRUE),
((SELECT id FROM post_adoption_step_def WHERE name = '1주차'), '''이름 - 시선'' 5분씩 연습', TRUE),
((SELECT id FROM post_adoption_step_def WHERE name = '1주차'), '혼자 있는 연습 1-5분부터 시작', TRUE),
((SELECT id FROM post_adoption_step_def WHERE name = '1주차'), '다음 접종(2주 후)일정 인지', TRUE);
INSERT INTO post_adoption_submission_def (step_def_id, submission_name, description, required, type) VALUES
((SELECT id FROM post_adoption_step_def WHERE name = '1주차'), '종합 백신 1차/코로나 장염 1차 증빙', '입양 후 1주차 종합 백신 1차/코로나 장염 1차 증빙 서류를 제출해주세요.', TRUE, 'DOCUMENT');

-- For 2주차
INSERT INTO post_adoption_checklist_def (step_def_id, item_text, required) VALUES
((SELECT id FROM post_adoption_step_def WHERE name = '2주차'), '배변 루틴 강화(성공 시 즉시 보상)', TRUE),
((SELECT id FROM post_adoption_step_def WHERE name = '2주차'), '앉아/기다려/이리와 짧게 연습', TRUE),
((SELECT id FROM post_adoption_step_def WHERE name = '2주차'), '손/발/귀 만지기 허용 훈련', TRUE),
((SELECT id FROM post_adoption_step_def WHERE name = '2주차'), '사회화는 노출만 진행', TRUE),
((SELECT id FROM post_adoption_step_def WHERE name = '2주차'), '외부 활동 전 접종 여부 확인', TRUE);
INSERT INTO post_adoption_submission_def (step_def_id, submission_name, description, required, type) VALUES
((SELECT id FROM post_adoption_step_def WHERE name = '2주차'), '종합 백신 2차 / 코로나 장염 2차 증빙', '입양 후 2주차 종합 백신 2차 / 코로나 장염 2차 증빙 서류를 제출해주세요.', TRUE, 'DOCUMENT');

-- For 1개월차
INSERT INTO post_adoption_checklist_def (step_def_id, item_text, required) VALUES
((SELECT id FROM post_adoption_step_def WHERE name = '1개월차'), '루틴 안정화 및 생활 적응 확인', TRUE),
((SELECT id FROM post_adoption_step_def WHERE name = '1개월차'), '장난감과 퍼즐로 에너지 해소', TRUE),
((SELECT id FROM post_adoption_step_def WHERE name = '1개월차'), '심장 사상충과 외부 기생충 예방 여부', TRUE);
INSERT INTO post_adoption_submission_def (step_def_id, submission_name, description, required, type) VALUES
((SELECT id FROM post_adoption_step_def WHERE name = '1개월차'), '종합 백신 3차 접종 여부', '입양 후 1개월차 종합 백신 3차 접종 증빙 서류를 제출해주세요.', TRUE, 'DOCUMENT');

-- For 2개월차
INSERT INTO post_adoption_checklist_def (step_def_id, item_text, required) VALUES
((SELECT id FROM post_adoption_step_def WHERE name = '2개월차'), '산책과 훈련 루틴 유지 확인', TRUE),
((SELECT id FROM post_adoption_step_def WHERE name = '2개월차'), '혼자 있는 시간 10-30분 유지', TRUE),
((SELECT id FROM post_adoption_step_def WHERE name = '2개월차'), '문제 행동 발생 여부 점검', TRUE),
((SELECT id FROM post_adoption_step_def WHERE name = '2개월차'), '외부 활동 안정 여부 점검', TRUE);
INSERT INTO post_adoption_submission_def (step_def_id, submission_name, description, required, type) VALUES
((SELECT id FROM post_adoption_step_def WHERE name = '2개월차'), '종합 백신 4차 및 켄넬코프 접종', '입양 후 2개월차 종합 백신 4차 및 켄넬코프 접종 증빙 서류를 제출해주세요.', TRUE, 'DOCUMENT');

-- For 3개월차
INSERT INTO post_adoption_checklist_def (step_def_id, item_text, required) VALUES
((SELECT id FROM post_adoption_step_def WHERE name = '3개월차'), '최종 후기 작성', TRUE),
((SELECT id FROM post_adoption_step_def WHERE name = '3개월차'), '입양 확정 동의', TRUE),
((SELECT id FROM post_adoption_step_def WHERE name = '3개월차'), '분리 및 자극 상황에서 안정 여부 확인', TRUE),
((SELECT id FROM post_adoption_step_def WHERE name = '3개월차'), '연간 예방접종 스케줄 안내 확인', TRUE);
INSERT INTO post_adoption_submission_def (step_def_id, submission_name, description, required, type) VALUES
((SELECT id FROM post_adoption_step_def WHERE name = '3개월차'), '광견병 예방접종', '입양 후 3개월차 광견병 예방접종 증빙 서류를 제출해주세요.', TRUE, 'DOCUMENT');
