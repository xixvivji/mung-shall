INSERT INTO post_adoption_step_def (default_order, name, description) VALUES
(1, '1개월차 건강 확인', '입양 후 1개월 시점의 유기견 건강 상태를 확인합니다.'),
(2, '3개월차 적응 보고서', '입양 후 3개월 시점의 유기견 적응 상태 및 가족과의 관계를 보고합니다.'),
(3, '6개월차 예방접종 확인', '입양 후 6개월 시점의 예방접종 여부를 확인합니다.'),
(4, '1년차 정기 검진', '입양 후 1년 시점의 정기 검진 결과를 확인합니다.')
ON CONFLICT (name) DO UPDATE SET
default_order = EXCLUDED.default_order,
description = EXCLUDED.description;
