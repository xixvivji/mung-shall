INSERT INTO post_adoption_step_def (default_order, name, description) VALUES
(1, '입양 당일', '입양 당일 유기견의 상태 및 초기 적응 확인'),
(2, '3일차', '입양 후 3일차 유기견의 건강 및 행동 변화 확인'),
(3, '1주차', '입양 후 1주차 유기견의 적응 상태 및 특이사항 확인'),
(4, '2주차', '입양 후 2주차 유기견의 생활 습관 및 가족과의 상호작용 확인'),
(5, '1개월차', '입양 후 1개월차 유기견의 전반적인 건강 및 적응 상태 확인'),
(6, '2개월차', '입양 후 2개월차 유기견의 성장 및 행동 발달 확인'),
(7, '3개월차', '입양 후 3개월차 유기견의 최종 적응 및 건강 상태 확인')
ON CONFLICT (name) DO UPDATE SET
default_order = EXCLUDED.default_order,
description = EXCLUDED.description;
