INSERT INTO adoption_step_def (step_order, step_name, description) VALUES
(1, '입양 신청서 제출', '입양 신청자가 입양 신청서를 작성하여 제출합니다.'),
(2, '교육 수료증 제출', '입양 신청자가 입양 교육 수료증을 제출합니다.'),
(3, '상담', '입양 신청자와 보호소 간의 상담이 진행됩니다.'),
(4, '문서 제출', '입양에 필요한 추가 서류를 제출합니다.'),
(5, '입양 계약서', '입양 계약서를 작성하고 최종 서명합니다.')
ON CONFLICT (step_name) DO UPDATE SET
step_order = EXCLUDED.step_order,
description = EXCLUDED.description;
