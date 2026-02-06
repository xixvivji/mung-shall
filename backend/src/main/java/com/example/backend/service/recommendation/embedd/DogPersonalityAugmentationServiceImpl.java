package com.example.backend.service.recommendation.embedd;

import com.example.backend.domain.dog.AbandonedDog;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.Locale;
import java.util.Set;

@Slf4j
@Service
public class DogPersonalityAugmentationServiceImpl implements DogPersonalityAugmentationService {

    // 키워드 기반(아주 약한 휴리스틱). "정답 점수"가 아니라 "정규화 문장" 생성이 목적.
    private static final Set<String> HIGH_ACTIVITY_BREEDS = Set.of("보더", "콜리", "리트리버", "허스키", "셰퍼드", "말리노이", "비글", "웰시");
    private static final Set<String> LOW_SHEDDING_BREEDS = Set.of("푸들", "비숑", "말티푸", "슈나우저");
    private static final Set<String> HIGH_SHEDDING_BREEDS = Set.of("진도", "시바", "허스키", "리트리버", "셰퍼드", "스피츠", "사모예드");

    private static final Set<String> SENSITIVE_BARKING_BREEDS = Set.of("말티즈", "포메", "치와와", "요크", "푸들");

    @Override
    public AugmentationResult build(AbandonedDog dog) {
        if (dog == null) {
            return new AugmentationResult(
                    normalizedText("정보 없음", "정보 없음", "정보 없음", "정보 없음", "정보 없음", "정보 없음", "정보 없음"),
                    "정보 없음", "정보 없음", "정보 없음", "정보 없음", "정보 없음",
                    true
            );
        }

        String breed = safe(dog.getKindNm(), "품종 정보 없음");
        String ageRaw = safe(dog.getAge(), "나이 정보 없음");
        String weightRaw = safe(dog.getWeight(), "체중 정보 없음");
        String sex = safe(dog.getSexCd(), "성별 정보 없음");
        String neuter = safe(dog.getNeuterYn(), "중성화 정보 없음");
        String processState = safe(dog.getProcessState(), "상태 정보 없음");
        String special = safe(dog.getSpecialMark(), "보호소 기록 없음");

        AgeInfo age = parseAge(ageRaw);
        WeightInfo weight = parseWeight(weightRaw);

        // 5개 특성 문장(정규화)
        TraitSentence activity = inferActivity(age, breed, weight, special);
        TraitSentence barking = inferBarking(breed, special);
        TraitSentence separation = inferSeparation(age, special);
        TraitSentence shedding = inferShedding(breed);
        TraitSentence friendliness = inferFriendliness(breed, special);

        boolean uncertain = activity.uncertain || barking.uncertain || separation.uncertain || shedding.uncertain || friendliness.uncertain;

        String text = normalizedText(
                basicInfoBlock(breed, ageRaw, weightRaw, sex, neuter, processState),
                shelterNoteBlock(special),
                activity.text,
                barking.text,
                separation.text,
                shedding.text,
                friendliness.text
        );

        return new AugmentationResult(
                text,
                activity.text,
                barking.text,
                separation.text,
                shedding.text,
                friendliness.text,
                uncertain
        );
    }

    // ---------------------------
    // Template (정규화 텍스트)
    // ---------------------------
    private String normalizedText(
            String basicInfo,
            String shelterNote,
            String activity,
            String barking,
            String separation,
            String shedding,
            String friendliness
    ) {
        return ("""
                [AI_성향_요약]
                %s
                %s

                [성향_정규화]
                - 활동성: %s
                - 짖음_정도: %s
                - 분리불안: %s
                - 털빠짐: %s
                - 친화력(낯선사람): %s
                """)
                .formatted(basicInfo, shelterNote, activity, barking, separation, shedding, friendliness)
                .trim();
    }

    private String basicInfoBlock(String breed, String age, String weight, String sex, String neuter, String processState) {
        return ("[기본정보] 품종=%s | 나이=%s | 체중=%s | 성별=%s | 중성화=%s | 상태=%s")
                .formatted(breed, age, weight, sex, neuter, processState);
    }

    private String shelterNoteBlock(String special) {
        // 너무 빈약하면 템플릿에서 신뢰도 낮다고 표시되게끔
        if (!StringUtils.hasText(special) || "보호소 기록 없음".equals(special)) {
            return "[보호소기록] (기록이 부족하여 추정 기반으로 작성됨)";
        }
        return "[보호소기록] " + special.trim();
    }

    // ---------------------------
    // Inference (문장 생성)
    // ---------------------------

    private TraitSentence inferActivity(AgeInfo age, String breed, WeightInfo weight, String special) {
        // 기준: 어린 나이/대형/고활동 품종/특이사항(활동적/산책) 등
        boolean hasEvidence = age.known || weight.known || StringUtils.hasText(breed);

        String level;
        String reason;

        if (age.known && age.isYoung()) {
            level = "높음";
            reason = "어린 연령대는 에너지 수준이 높은 경우가 많아 충분한 산책/놀이가 필요해요.";
        } else if (containsAny(breed, HIGH_ACTIVITY_BREEDS)) {
            level = "높음";
            reason = "일반적으로 활동량이 많은 편으로, 규칙적인 운동과 자극(놀이/훈련)이 좋아요.";
        } else if (age.known && age.isSenior()) {
            level = "낮음~보통";
            reason = "연령이 높다면 무리한 활동보다 짧고 잦은 산책이 더 적합할 수 있어요.";
        } else if (weight.known && weight.kg >= 20) {
            level = "보통~높음";
            reason = "체구가 큰 편이라 에너지 소모가 필요할 수 있어요(관절 부담은 주의).";
        } else {
            level = "보통";
            reason = "일상 산책 수준의 활동을 소화할 가능성이 있어요(개체차/환경 영향 큼).";
        }

        // 특이사항에 '활발/산책/뛰어' 등 들어가면 근거 추가
        String extra = "";
        if (StringUtils.hasText(special) && containsAnyText(special, "활발", "산책", "뛰", "에너지", "장난")) {
            extra = " 보호소 기록에서 활동 관련 언급이 있어 이를 반영했어요.";
        }

        boolean uncertain = !hasEvidence || (!age.known && !weight.known && isUnknownBreed(breed));
        return new TraitSentence(format(level, reason + extra, uncertain), uncertain);
    }

    private TraitSentence inferBarking(String breed, String special) {
        boolean hasShelterNote = StringUtils.hasText(special) && !"보호소 기록 없음".equals(special);

        String level;
        String reason;

        if (hasShelterNote && containsAnyText(special, "짖", "소리", "민감")) {
            level = "보통~높음";
            reason = "보호소 기록에 짖음/소리 반응 관련 단서가 있어 초기 적응/훈련이 필요할 수 있어요.";
        } else if (hasShelterNote && containsAnyText(special, "조용", "얌전")) {
            level = "낮음~보통";
            reason = "보호소 기록에서 비교적 조용하다는 단서가 있어요(환경이 바뀌면 달라질 수 있음).";
        } else if (containsAny(breed, SENSITIVE_BARKING_BREEDS)) {
            level = "보통";
            reason = "소형견 계열은 소리에 민감할 수 있어요. 규칙적인 훈련으로 충분히 완화 가능해요.";
        } else {
            level = "보통";
            reason = "짖음은 환경/훈련/스트레스에 따라 크게 달라질 수 있어요.";
        }

        boolean uncertain = !hasShelterNote; // 특이사항이 없으면 추정 비중이 큼
        return new TraitSentence(format(level, reason, uncertain), uncertain);
    }

    private TraitSentence inferSeparation(AgeInfo age, String special) {
        boolean hasShelterNote = StringUtils.hasText(special) && !"보호소 기록 없음".equals(special);

        String level;
        String reason;

        if (hasShelterNote && containsAnyText(special, "불안", "떨", "낑낑", "짖", "분리")) {
            level = "보통~높음";
            reason = "불안/긴장 관련 단서가 있어 혼자있는 훈련을 단계적으로 진행하는 게 좋아요.";
        } else if (age.known && age.isYoung()) {
            level = "보통";
            reason = "어린 강아지는 분리불안 예방을 위해 짧은 단위로 혼자있는 연습이 도움이 돼요.";
        } else {
            level = "보통";
            reason = "환경 변화에 따라 불안이 나타날 수 있어 초기에는 안정적인 루틴이 중요해요.";
        }

        boolean uncertain = !hasShelterNote; // 기록 없으면 추정
        return new TraitSentence(format(level, reason, uncertain), uncertain);
    }

    private TraitSentence inferShedding(String breed) {
        String level;
        String reason;

        if (containsAny(breed, LOW_SHEDDING_BREEDS)) {
            level = "낮음";
            reason = "상대적으로 털빠짐 부담이 적은 편일 수 있어요(개체차/미용 상태 영향).";
            return new TraitSentence(format(level, reason, false), false);
        }

        if (containsAny(breed, HIGH_SHEDDING_BREEDS)) {
            level = "높음";
            reason = "털갈이 시기에 털빠짐이 많을 수 있어요. 빗질/청소 루틴을 권장해요.";
            return new TraitSentence(format(level, reason, false), false);
        }

        // 품종 정보가 애매하면
        boolean uncertain = isUnknownBreed(breed);
        level = uncertain ? "보통(추정)" : "보통";
        reason = "털빠짐 정도는 계절/건강/관리 상태에 따라 달라요.";
        return new TraitSentence(format(level, reason, uncertain), uncertain);
    }

    private TraitSentence inferFriendliness(String breed, String special) {
        boolean hasShelterNote = StringUtils.hasText(special) && !"보호소 기록 없음".equals(special);

        String level;
        String reason;

        if (hasShelterNote && containsAnyText(special, "사람", "친화", "좋아", "애교")) {
            level = "높음~보통";
            reason = "사람과의 상호작용에 긍정적인 단서가 있어요. 초기에도 비교적 수월할 수 있어요.";
        } else if (hasShelterNote && containsAnyText(special, "경계", "겁", "무서", "입질")) {
            level = "낮음~보통";
            reason = "경계/두려움 단서가 있어 천천히 접근하며 신뢰 형성이 필요해요.";
        } else if (breed.contains("리트리버") || breed.contains("푸들")) {
            level = "보통~높음";
            reason = "일반적으로 사람과 교감이 좋은 편일 수 있어요(개체차 있음).";
        } else {
            level = "보통";
            reason = "초기에는 낯선 환경에 적응 시간이 필요할 수 있어요.";
        }

        boolean uncertain = !hasShelterNote;
        return new TraitSentence(format(level, reason, uncertain), uncertain);
    }

    private String format(String level, String reason, boolean uncertain) {
        // 정규화 포맷 통일: [수준] 이유 (추정 여부)
        // 추정 표시는 "근거 부족"일 때만 붙임
        if (uncertain) {
            return "[%s] %s (근거 부족으로 일부 추정)".formatted(level, reason);
        }
        return "[%s] %s".formatted(level, reason);
    }

    // ---------------------------
    // Parsing / Utils
    // ---------------------------

    private AgeInfo parseAge(String ageRaw) {
        if (!StringUtils.hasText(ageRaw) || "나이 정보 없음".equals(ageRaw)) return AgeInfo.unknown();

        String s = ageRaw.trim().replaceAll("\\s+", "");
        // 예: "2살", "3년", "5개월" 등 다양한 형태를 최대한 유연하게
        try {
            if (s.contains("개월")) {
                int months = extractLeadingInt(s);
                return AgeInfo.months(months);
            }
            if (s.contains("살") || s.contains("년")) {
                int years = extractLeadingInt(s);
                return AgeInfo.years(years);
            }
        } catch (Exception ignore) {
            // 파싱 실패 시 unknown 처리
        }
        return AgeInfo.unknown();
    }

    private WeightInfo parseWeight(String weightRaw) {
        if (!StringUtils.hasText(weightRaw) || "체중 정보 없음".equals(weightRaw)) return WeightInfo.unknown();

        String s = weightRaw.trim().toLowerCase(Locale.ROOT);
        // 예: "3(Kg)", "3.2Kg", "3kg" 등
        s = s.replaceAll("[^0-9.]", "");
        try {
            if (!s.isBlank()) {
                double kg = Double.parseDouble(s);
                return WeightInfo.of(kg);
            }
        } catch (Exception ignore) {}
        return WeightInfo.unknown();
    }

    private int extractLeadingInt(String s) {
        String digits = s.replaceAll("[^0-9]", "");
        if (digits.isBlank()) throw new IllegalArgumentException("no digits");
        return Integer.parseInt(digits);
    }

    private boolean containsAny(String text, Set<String> keywords) {
        if (!StringUtils.hasText(text)) return false;
        for (String k : keywords) {
            if (text.contains(k)) return true;
        }
        return false;
    }

    private boolean containsAnyText(String text, String... keywords) {
        if (!StringUtils.hasText(text)) return false;
        for (String k : keywords) {
            if (text.contains(k)) return true;
        }
        return false;
    }

    private boolean isUnknownBreed(String breed) {
        if (!StringUtils.hasText(breed)) return true;
        // "품종 정보 없음" 또는 "믹스" 류는 보수적으로 uncertain 처리
        return breed.contains("품종 정보 없음") || breed.contains("믹스") || breed.contains("Mix");
    }

    private String safe(String v, String fallback) {
        return StringUtils.hasText(v) ? v.trim() : fallback;
    }

    private record TraitSentence(String text, boolean uncertain) {}

    private record AgeInfo(boolean known, Integer months, Integer years) {
        static AgeInfo unknown() { return new AgeInfo(false, null, null); }
        static AgeInfo months(int m) { return new AgeInfo(true, m, null); }
        static AgeInfo years(int y) { return new AgeInfo(true, null, y); }

        boolean isYoung() {
            if (!known) return false;
            if (months != null) return months <= 18;
            return years != null && years <= 2;
        }
        boolean isSenior() {
            if (!known) return false;
            if (years != null) return years >= 10;
            return false;
        }
    }

    private record WeightInfo(boolean known, double kg) {
        static WeightInfo unknown() { return new WeightInfo(false, 0); }
        static WeightInfo of(double kg) { return new WeightInfo(true, kg); }
    }

}
